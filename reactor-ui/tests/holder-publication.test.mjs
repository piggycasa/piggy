import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { Keypair,PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID,TOKEN_2022_PROGRAM_ID,MintLayout,AccountLayout,ExtensionType,getMintLen } from '@solana/spl-token';
import { snapshotMintBalances } from '../src/solana-holder.mjs';
import { publicationDomain,eligibleOpeningSnapshot,makePublicationPlan,validatePublicationPlan,validatePublicationJournal,proofDocuments } from '../src/holder-publication.mjs';
import { durableJson,withPublisherLock,readPublisherFunding,checkpointFinalizedSlot,reconcilePublisher,initializePublisher,prepareOpeningSnapshot } from '../scripts/holder-publisher.mjs';
import * as sdk from '../src/solana-instructions.mjs';

const wallets=Array.from({length:4},()=>Keypair.generate().publicKey.toBase58());
const domain=publicationDomain({cluster:'devnet',genesisHash:'test-genesis',programId:wallets[0],gameVersion:'123',piggyMint:wallets[1]});
const snapshot=(slot=100)=>eligibleOpeningSnapshot({slot,mint:domain.piggyMint,tokenProgram:TOKEN_2022_PROGRAM_ID.toBase58(),decimals:6,balances:new Map([[wallets[2],2n],[wallets[3],1n]])});
function fixture(program=TOKEN_PROGRAM_ID){
  const mint=new PublicKey(domain.piggyMint),mintData=Buffer.alloc(program.equals(TOKEN_PROGRAM_ID)?82:getMintLen([ExtensionType.MetadataPointer]));
  MintLayout.encode({mintAuthorityOption:0,mintAuthority:PublicKey.default,supply:100n,decimals:6,isInitialized:true,freezeAuthorityOption:0,freezeAuthority:PublicKey.default},mintData);
  if(mintData.length>82){mintData[165]=1;mintData.writeUInt16LE(ExtensionType.MetadataPointer,166);mintData.writeUInt16LE(64,168);}
  const account=(owner,amount,extended=false)=>{const data=Buffer.alloc(extended?170:165);AccountLayout.encode({mint,owner:new PublicKey(owner),amount,delegateOption:0,delegate:PublicKey.default,state:1,isNativeOption:0,isNative:0n,delegatedAmount:0n,closeAuthorityOption:0,closeAuthority:PublicKey.default},data);if(extended){data[165]=2;data.writeUInt16LE(ExtensionType.ImmutableOwner,166);}return{pubkey:Keypair.generate().publicKey,account:{owner:program,data}};};
  const rows=[account(wallets[2],20n,!program.equals(TOKEN_PROGRAM_ID)),account(wallets[2],30n),account(wallets[3],50n)];let received;
  const connection={getAccountInfo:async()=>({owner:program,data:mintData}),getProgramAccounts:async(owner,options)=>{received={owner,options};return{context:{slot:101},value:rows};}};
  return{mint,rows,connection,received:()=>received,mintData};
}
test('legacy and Token2022 extended accounts aggregate by wallet at a finalized context',async()=>{
  for(const program of [TOKEN_PROGRAM_ID,TOKEN_2022_PROGRAM_ID]){const f=fixture(program),result=await snapshotMintBalances(f.connection,f.mint,{commitment:'finalized',minContextSlot:100});assert.equal(result.balances.get(wallets[2]),50n);assert.equal(result.totalBalance,100n);assert.equal(result.tokenProgram,program.toBase58());assert.equal(f.received().options.commitment,'finalized');assert.equal(f.received().options.minContextSlot,100);assert.equal(f.received().options.filters.some(filter=>filter.dataSize===165),program.equals(TOKEN_PROGRAM_ID));}
});
test('snapshot rejects stale context, duplicate accounts, wrong mint, and totals beyond supply',async()=>{
  let f=fixture();await assert.rejects(snapshotMintBalances(f.connection,f.mint,{minContextSlot:102}),/context slot/);
  f=fixture();f.rows.push(f.rows[0]);await assert.rejects(snapshotMintBalances(f.connection,f.mint),/duplicate/);
  f=fixture();f.rows[0].account.data.fill(0,0,32);await assert.rejects(snapshotMintBalances(f.connection,f.mint),/invalid token account/);
  f=fixture();f.mintData.writeBigUInt64LE(99n,36);await assert.rejects(snapshotMintBalances(f.connection,f.mint),/exceed mint supply/);
});
test('snapshot excludes unclaimable PDA owners and explicit excluded wallets without staking',()=>{
  const pda=PublicKey.findProgramAddressSync([Buffer.from('pool')],new PublicKey(domain.programId))[0].toBase58();
  const result=eligibleOpeningSnapshot({slot:1,mint:domain.piggyMint,balances:new Map([[pda,100n],[wallets[2],20n],[wallets[3],30n]])},{excludedWallets:[wallets[3]]});
  assert.deepEqual(result.balances,[[wallets[2],'20']]);assert.equal(result.excludedBalance,'130');assert.equal(result.totalEligibleBalance,'20');
  assert.throws(()=>eligibleOpeningSnapshot({slot:1,mint:domain.piggyMint,balances:new Map([[pda,1n]])}),/No claim-capable/);
});
test('durable publication allocates exactly, binds domains and refuses modified manifests',()=>{
  const plan=makePublicationPlan({domain,epoch:1,totalAmount:10,openingSnapshot:snapshot(),nextOpeningSnapshot:snapshot(110)});validatePublicationPlan(plan,domain);
  assert.equal(plan.records.reduce((sum,r)=>sum+BigInt(r.amount),0n),10n);
  assert.throws(()=>validatePublicationPlan(plan,{...domain,cluster:'testnet'}),/cluster mismatch/);
  const forged=structuredClone(plan);forged.records[0].amount='9';assert.throws(()=>validatePublicationPlan(forged,domain),/deterministic/);
  assert.throws(()=>makePublicationPlan({domain,epoch:1,totalAmount:10,openingSnapshot:snapshot(110),nextOpeningSnapshot:snapshot(100)}),/backwards/);
  const duplicates=snapshot();duplicates.balances.push(duplicates.balances[0]);assert.throws(()=>makePublicationPlan({domain,epoch:1,totalAmount:10,openingSnapshot:duplicates,nextOpeningSnapshot:snapshot(110)}),/duplicate/);
});
test('public proof export exposes only published, immutable, domain-bound claims',()=>{
  const plan=makePublicationPlan({domain,epoch:1,totalAmount:10,openingSnapshot:snapshot(),nextOpeningSnapshot:snapshot(110)});
  assert.equal(proofDocuments([plan],domain).wallets.size,0);plan.status='published';plan.signature='test-signature';
  const docs=proofDocuments([plan],domain);assert.equal(docs.index.cluster,'devnet');assert.equal(docs.wallets.size,2);assert.equal(docs.index.epochs[0].root,plan.root);
  for(const [wallet,document] of docs.wallets){assert.equal(document.wallet,wallet);assert.deepEqual(Object.keys(document.epochs[0]),['epoch','amount','proof']);assert.equal(document.programId,domain.programId);}
  assert.throws(()=>proofDocuments([plan,plan],domain),/Duplicate/);
});
test('publisher journal rejects duplicate or missing epochs and conflicting opening windows before chain mutation',()=>{
  const first=makePublicationPlan({domain,epoch:1,totalAmount:10,openingSnapshot:snapshot(),nextOpeningSnapshot:snapshot(110)});first.status='published';
  const second=makePublicationPlan({domain,epoch:2,totalAmount:10,openingSnapshot:snapshot(110),nextOpeningSnapshot:snapshot(120)});
  const stored={...domain,plans:[first,second],openingSnapshot:second.openingSnapshot,pendingWindow:{epoch:'2',nextOpeningSnapshot:second.nextOpeningSnapshot}};
  assert.equal(validatePublicationJournal(stored,domain).published,1);
  for(const plans of [[first,first],[second],[second,first]])assert.throws(()=>validatePublicationJournal({...stored,plans},domain),/unique, ordered and contiguous/);
  assert.throws(()=>validatePublicationJournal({...stored,pendingWindow:null},domain),/missing its durable next window/);
  assert.throws(()=>validatePublicationJournal({...stored,openingSnapshot:snapshot(111)},domain),/opening snapshot/);
  assert.throws(()=>validatePublicationJournal({...stored,pendingWindow:{epoch:'2',nextOpeningSnapshot:snapshot(121)}},domain),/pending window/);
  const after=structuredClone(stored);after.plans[1].status='published';after.openingSnapshot=second.nextOpeningSnapshot;after.pendingWindow=null;assert.equal(validatePublicationJournal(after,domain).published,2);
});
test('publisher lock prevents a second writer; durable JSON uses private permissions',async()=>{
  const dir=await fs.mkdtemp(path.join(os.tmpdir(),'piggy-publisher-'));
  try{await withPublisherLock(dir,async()=>{await assert.rejects(withPublisherLock(dir,async()=>{}),/lock exists/);await durableJson(path.join(dir,'state.json'),{amount:1n});assert.equal(JSON.parse(await fs.readFile(path.join(dir,'state.json'),'utf8')).amount,'1');assert.equal((await fs.stat(path.join(dir,'state.json'))).mode&0o077,0);await durableJson(path.join(dir,'public','wallets','sample.json'),{public:true},{mode:0o644});assert.equal((await fs.stat(path.join(dir,'public','wallets'))).mode&0o777,0o755);assert.equal((await fs.stat(path.join(dir,'public','wallets','sample.json'))).mode&0o777,0o644);});await assert.rejects(fs.access(path.join(dir,'publisher.lock')));}finally{await fs.rm(dir,{recursive:true,force:true});}
});
function fundingFixture({reserved=100n,balance=120n,nextEpoch=2n,claimed=0n,slot=100,roundId=1n}={}){
  const game=sdk.gameAddress(domain.programId,domain.gameVersion),config=sdk.holderConfigAddress(domain.programId,game),vault=sdk.holderVaultAddress(domain.programId,game),program=new PublicKey(domain.programId);
  const gameData=Buffer.concat([Buffer.from([3]),sdk.u64(roundId),sdk.u64(3600),sdk.u64(30),sdk.u64(86400),sdk.u64(domain.gameVersion),sdk.NATIVE_MINT.toBuffer(),program.toBuffer(),sdk.pk(wallets[2]).toBuffer(),vault.toBuffer()]);
  const holderData=Buffer.concat([Buffer.from('PHCFG001'),game.toBuffer(),sdk.pk(wallets[2]).toBuffer(),sdk.pk(domain.piggyMint).toBuffer(),sdk.NATIVE_MINT.toBuffer(),vault.toBuffer(),sdk.u64(reserved),sdk.u64(nextEpoch),sdk.u64(reserved+claimed),sdk.u64(claimed),Buffer.from([0])]);
  const vaultData=Buffer.alloc(165);AccountLayout.encode({mint:sdk.NATIVE_MINT,owner:config,amount:balance,delegateOption:0,delegate:PublicKey.default,state:1,isNativeOption:1,isNative:2039280n,delegatedAmount:0n,closeAuthorityOption:0,closeAuthority:PublicKey.default},vaultData);
  return {game,config,vault,result:{context:{slot},value:[{owner:program,data:gameData},{owner:program,data:holderData},{owner:TOKEN_PROGRAM_ID,data:vaultData}]}};
}
test('publisher computes unreserved funding from one bank during concurrent claims',async()=>{
  const first=fundingFixture(),second=fundingFixture({reserved:99n,balance:119n,claimed:1n,slot:101}),requests=[];let response=first.result;
  const ctx={domain,config:{gameVersion:domain.gameVersion},game:first.game,holderAddress:first.config,minContextSlot:99,connection:{getMultipleAccountsInfoAndContext:async(addresses,options)=>{requests.push({addresses,options});return response;},getAccountInfo:async()=>{throw Error('Separate funding reads must not occur.');}}};
  assert.equal((await readPublisherFunding(ctx)).available,20n);response=second.result;assert.equal((await readPublisherFunding(ctx)).available,20n);
  assert.equal(requests.length,2);assert.equal(requests[0].addresses.length,3);assert.equal(requests[1].options.minContextSlot,100);assert.equal(ctx.minContextSlot,101);
  response=first.result;await assert.rejects(readPublisherFunding(ctx),/stale/);
});
test('finalized write checkpoints survive restart and reject a lagging RPC bank',async()=>{
  const dir=await fs.mkdtemp(path.join(os.tmpdir(),'piggy-checkpoint-'));
  try{
    const base=fundingFixture({reserved:0n,balance:0n,nextEpoch:1n,slot:199}),filename=path.join(dir,'state.json'),stored={...domain,openingSnapshot:snapshot(),plans:[],pendingWindow:null,minContextSlot:100};
    const ctx={stateFile:filename,domain,minContextSlot:100,journal:stored};await checkpointFinalizedSlot(ctx,200);assert.equal(JSON.parse(await fs.readFile(filename,'utf8')).minContextSlot,200);
    const restarted={stateFile:filename,domain,config:{gameVersion:domain.gameVersion},game:base.game,holderAddress:base.config,connection:{getMultipleAccountsInfoAndContext:async(_addresses,options)=>{assert.equal(options.minContextSlot,200);return base.result;}}};
    await assert.rejects(reconcilePublisher(restarted),/stale/);
  }finally{await fs.rm(dir,{recursive:true,force:true});}
});
test('fees appearing during initial snapshot capture cannot be backdated to its holders',async()=>{
  const dir=await fs.mkdtemp(path.join(os.tmpdir(),'piggy-initial-snapshot-'));
  try{
    const base=fundingFixture({reserved:0n,balance:0n,nextEpoch:1n}),tokens=fixture();let accrued=false;
    const ctx={domain,config:{localTest:true,programId:domain.programId,gameVersion:domain.gameVersion,proofOutput:path.join(dir,'public'),excludedWallets:[]},game:base.game,holderAddress:base.config,stateFile:path.join(dir,'state.json'),connection:{
      getMultipleAccountsInfoAndContext:async()=>({...base.result,context:{slot:accrued?110:100}}),
      getAccountInfo:async address=>{if(address.equals(tokens.mint))return{owner:TOKEN_PROGRAM_ID,data:tokens.mintData};const data=Buffer.alloc(403);data[0]=4;sdk.u64(1).copy(data,1);if(accrued)sdk.u128(10).copy(data,219);return{owner:new PublicKey(domain.programId),data};},
      getProgramAccounts:async(_program,options)=>{assert.equal(options.minContextSlot,100);accrued=true;return{context:{slot:110},value:tokens.rows};},
    }};
    await assert.rejects(initializePublisher(ctx),/fees appeared/);await assert.rejects(fs.access(ctx.stateFile));
  }finally{await fs.rm(dir,{recursive:true,force:true});}
});
test('a pre-creation snapshot is saved only after finalized game absence and activates without replacing eligibility',async()=>{
  const dir=await fs.mkdtemp(path.join(os.tmpdir(),'piggy-before-game-'));
  try{
    const base=fundingFixture({reserved:0n,balance:0n,nextEpoch:1n,slot:120,roundId:0n}),tokens=fixture();let gameExists=false;
    const ctx={domain,config:{programId:domain.programId,gameVersion:domain.gameVersion,proofOutput:path.join(dir,'public'),excludedWallets:[]},game:base.game,holderAddress:base.config,stateFile:path.join(dir,'private','state.json'),connection:{
      getAccountInfo:async()=>({owner:TOKEN_PROGRAM_ID,data:tokens.mintData}),getProgramAccounts:async()=>({context:{slot:101},value:tokens.rows}),
      getAccountInfoAndContext:async(_address,options)=>{assert.equal(options.minContextSlot,101);return{context:{slot:110},value:gameExists?base.result.value[0]:null};},
      getMultipleAccountsInfoAndContext:async()=>base.result,
    }};
    await prepareOpeningSnapshot(ctx);let stored=JSON.parse(await fs.readFile(ctx.stateFile,'utf8'));assert.equal(stored.activation,'prepared-before-game');assert.equal(stored.preGameAbsenceSlot,110);assert.equal(stored.openingSnapshot.slot,101);
    gameExists=true;await initializePublisher(ctx);stored=JSON.parse(await fs.readFile(ctx.stateFile,'utf8'));assert.equal(stored.activation,'active');assert.equal(stored.openingSnapshot.slot,101);assert.equal(stored.preGameAbsenceSlot,110);
    await assert.rejects(initializePublisher(ctx),/already exists/);
    const other={...ctx,stateFile:path.join(dir,'other-private','state.json'),minContextSlot:undefined,journal:undefined};await assert.rejects(prepareOpeningSnapshot(other),/game already exists/);await assert.rejects(fs.access(other.stateFile));
  }finally{await fs.rm(dir,{recursive:true,force:true});}
});
