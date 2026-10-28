/** Offline operator process. Never expose this signer through an HTTP server. */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';
import { Connection, Keypair, Transaction, ComputeBudgetProgram, SystemProgram } from '@solana/web3.js';
import { unpackAccount } from '@solana/spl-token';
import * as sdk from '../src/solana-instructions.mjs';
import { snapshotMintBalances, hexToBytes } from '../src/solana-holder.mjs';
import { publicationDomain, assertPublicationDomain, eligibleOpeningSnapshot, makePublicationPlan, validatePublicationPlan, validatePublicationJournal, proofDocuments } from '../src/holder-publication.mjs';
import { CLUSTER_GENESIS,isPrivateHost } from '../src/solana-config.mjs';
import { requireMainnetAuthorities,validateMainnetGameConfiguration } from './publicnet-validation.mjs';
import { verifyOperatorProgram } from './program-release.mjs';

const COMMITMENT='finalized';
export async function durableJson(filename,value,{mode=0o600}={}) {
  const directoryMode=(mode&0o004)?0o755:0o700;
  await fs.mkdir(path.dirname(filename),{recursive:true,mode:directoryMode});
  if(directoryMode===0o755)await fs.chmod(path.dirname(filename),directoryMode);
  const temporary=`${filename}.${process.pid}.${Date.now()}.tmp`,file=await fs.open(temporary,'wx',mode);
  try{await file.writeFile(sdk.serializeChain(value));await file.sync();}finally{await file.close();}
  await fs.rename(temporary,filename);
  const directory=await fs.open(path.dirname(filename),'r');try{await directory.sync();}finally{await directory.close();}
}
export async function withPublisherLock(directory,action) {
  await fs.mkdir(directory,{recursive:true,mode:0o700});const filename=path.join(directory,'publisher.lock');
  let lock;try{lock=await fs.open(filename,'wx',0o600);}catch(error){if(error.code==='EEXIST')throw new Error('Holder publisher lock exists. Verify that no publisher is running before recovering this lock.');throw error;}
  try{await lock.writeFile(JSON.stringify({pid:process.pid,createdAt:new Date().toISOString()}));await lock.sync();return await action();}finally{await lock.close();await fs.unlink(filename);}
}
export async function loadPublisher(configFile,{allowLocal=false}={}) {
  const filename=path.resolve(configFile),raw=JSON.parse(await fs.readFile(filename,'utf8')),resolve=value=>path.resolve(path.dirname(filename),value);
  const rpc=new URL(process.env.PIGGY_PUBLISHER_RPC_URL||raw.rpcUrl);
  const local=raw.cluster==='localnet'&&allowLocal&&rpc.protocol==='http:'&&rpc.hostname==='127.0.0.1'&&rpc.port==='18899';
  if(!local&&(!CLUSTER_GENESIS[raw.cluster]||rpc.protocol!=='https:'||rpc.username||rpc.password||rpc.hash||isPrivateHost(rpc.hostname)))throw new Error('Publisher requires an explicit public cluster and HTTPS public RPC.');
  if(!local&&raw.genesisHash!==CLUSTER_GENESIS[raw.cluster])throw new Error('Publisher genesis mismatch.');
  if(!/^[1-9]\d*$/.test(String(raw.gameVersion))||BigInt(raw.gameVersion)>(1n<<64n)-1n)throw new Error('Invalid publisher game version.');
  const workspace=resolve(raw.workspace),proofOutput=resolve(raw.proofOutput),signerFile=resolve(raw.publisherKeypair);
  if(workspace===proofOutput||workspace.startsWith(proofOutput+path.sep)||proofOutput.startsWith(workspace+path.sep))throw new Error('Private publisher state and public proofs must use separate directories.');
  if(signerFile===proofOutput||signerFile.startsWith(proofOutput+path.sep)||proofOutput===path.parse(proofOutput).root)throw new Error('Publisher signing keys cannot be stored beneath the public proof directory.');
  const minimum=BigInt(raw.minPublishLamports??10_000_000);
  if(minimum<1n||minimum>(1n<<64n)-1n)throw new Error('Invalid publication funding threshold.');
  const config={...raw,localTest:local,rpcUrl:rpc.href,workspace,proofOutput,minPublishLamports:minimum.toString(),publisherKeypair:signerFile,
    priorityFeeMicroLamports:raw.priorityFeeMicroLamports??0,epochSeconds:raw.epochSeconds??3600};
  if(!local&&(!/^[a-f\d]{64}$/i.test(config.programBinarySha256??'')||!Number.isSafeInteger(config.programBinaryBytes)||config.programBinaryBytes<4))throw new Error('Public publisher requires the reviewed program byte count and SHA-256.');
  if(raw.cluster==='mainnet-beta')config.expectedAuthorities=requireMainnetAuthorities(raw);
  if(!Number.isSafeInteger(config.epochSeconds)||config.epochSeconds<60||!Number.isSafeInteger(config.priorityFeeMicroLamports)||config.priorityFeeMicroLamports<0||config.priorityFeeMicroLamports>1_000_000)throw new Error('Invalid publisher cadence or fee budget.');
  const domain=publicationDomain(config),connection=new Connection(rpc.href,{commitment:COMMITMENT,confirmTransactionInitialTimeout:60_000,disableRetryOnRateLimit:true});
  if(await connection.getGenesisHash()!==raw.genesisHash)throw new Error('RPC returned the wrong genesis hash.');
  const context={config,domain,connection,game:sdk.gameAddress(config.programId,config.gameVersion),stateFile:path.join(workspace,'state.json')};
  context.holderAddress=sdk.holderConfigAddress(config.programId,context.game);
  return context;
}
async function ownedAccount(ctx,address,decode,{optional=false}={}) {
  const info=await ctx.connection.getAccountInfo(sdk.pk(address),{commitment:COMMITMENT,...(ctx.minContextSlot===undefined?{}:{minContextSlot:ctx.minContextSlot})});
  if(!info){if(optional)return null;throw new Error(`Required program account is missing: ${address}`);}
  if(!info.owner.equals(sdk.pk(ctx.config.programId)))throw new Error('Unexpected holder program account owner.');
  return decode(info.data);
}
export async function readPublisherFunding(ctx) {
  const vaultAddress=sdk.holderVaultAddress(ctx.domain.programId,ctx.game);
  const result=await ctx.connection.getMultipleAccountsInfoAndContext([ctx.game,ctx.holderAddress,vaultAddress],{commitment:COMMITMENT,...(ctx.minContextSlot===undefined?{}:{minContextSlot:ctx.minContextSlot})});
  if(!Number.isSafeInteger(result.context?.slot)||result.context.slot<(ctx.minContextSlot??0))throw new Error('Publisher funding read returned a stale or invalid bank.');
  const [gameInfo,holderInfo,vaultInfo]=result.value;
  if(!gameInfo?.owner.equals(sdk.pk(ctx.domain.programId))||!holderInfo?.owner.equals(sdk.pk(ctx.domain.programId)))throw new Error('Unexpected publisher program account owner.');
  const game=sdk.decodeGame(gameInfo.data),holder=sdk.decodeHolderConfig(holderInfo.data);
  if(game.version!==BigInt(ctx.config.gameVersion)||game.mint!==sdk.NATIVE_MINT.toBase58()||holder.game!==ctx.game.toBase58()||holder.eligibility_mint!==ctx.domain.piggyMint||holder.payment_mint!==sdk.NATIVE_MINT.toBase58()||holder.vault!==vaultAddress.toBase58()||game.p3d_wallet!==holder.vault)throw new Error('Publisher game/holder deployment mismatch.');
  if(ctx.domain.cluster==='mainnet-beta')validateMainnetGameConfiguration(game,holder,ctx.config.expectedAuthorities);
  const vault=unpackAccount(vaultAddress,vaultInfo,sdk.TOKEN_PROGRAM_ID);
  if(!vault.isInitialized||vault.isFrozen||!vault.owner.equals(ctx.holderAddress)||!vault.mint.equals(sdk.NATIVE_MINT)||vault.delegate||vault.closeAuthority)throw new Error('Unexpected holder vault authority or payment mint.');
  if(vault.amount<holder.reserved_amount||holder.total_published-holder.total_claimed!==holder.reserved_amount)throw new Error('Holder vault is underfunded or reservations are inconsistent.');
  ctx.minContextSlot=result.context.slot;
  return {game,holder,balance:vault.amount,available:vault.amount-holder.reserved_amount,slot:result.context.slot};
}
async function state(ctx) {
  const stored=JSON.parse(await fs.readFile(ctx.stateFile,'utf8'));assertPublicationDomain(stored,ctx.domain);
  validatePublicationJournal(stored,ctx.domain);
  ctx.minContextSlot=Math.max(ctx.minContextSlot??0,stored.minContextSlot??0,stored.openingSnapshot.slot,stored.pendingWindow?.nextOpeningSnapshot?.slot??0);
  ctx.journal=stored;
  return stored;
}
async function capture(ctx) {
  const snapshot=await snapshotMintBalances(ctx.connection,ctx.domain.piggyMint,{commitment:COMMITMENT,minContextSlot:ctx.minContextSlot});
  return eligibleOpeningSnapshot(snapshot,{excludeOffCurve:true,excludedWallets:ctx.config.excludedWallets??[]});
}
async function rounds(ctx,game) {
  if(game.round_id>10_000n)throw new Error('Round count requires a reviewed indexed publisher; refusing an unbounded scan.');
  const rows=[];for(let id=1n;id<=game.round_id;id++)rows.push({id,round:await ownedAccount(ctx,sdk.roundAddress(ctx.domain.programId,id,ctx.config.gameVersion),sdk.decodeRound)});return rows;
}
export async function initializePublisher(ctx) {
  let existing;try{existing=await state(ctx);}catch(error){if(error.code!=='ENOENT')throw error;}
  if(existing){
    if(existing.activation!=='prepared-before-game'||!Number.isSafeInteger(existing.preGameAbsenceSlot)||existing.preGameAbsenceSlot<existing.openingSnapshot.slot)throw new Error('Publisher state already exists; never replace an opening snapshot.');
    await readPublisherFunding(ctx);existing.activation='active';existing.minContextSlot=ctx.minContextSlot;existing.gameObservedSlot=ctx.minContextSlot;
    await durableJson(ctx.stateFile,existing);await exportProofs(ctx,existing);return {status:'opening-snapshot-activated',slot:existing.openingSnapshot.slot,preGameAbsenceSlot:existing.preGameAbsenceSlot};
  }
  if(!ctx.config.localTest)throw new Error('Public publisher requires prepare-opening before game creation; a missing historical opening snapshot cannot be reconstructed.');
  const {game,holder,balance}=await readPublisherFunding(ctx),history=await rounds(ctx,game);
  if(holder.next_epoch!==1n||holder.total_published!==0n||balance!==0n||history.some(({round})=>round.accum_p3d_share!==0n))throw new Error('Initial opening snapshot must precede holder fees. Existing revenue requires restored publisher history.');
  const openingSnapshot=await capture(ctx);ctx.minContextSlot=openingSnapshot.slot;
  const closingCheck=await readPublisherFunding(ctx),closingRounds=await rounds(ctx,closingCheck.game);
  if(closingCheck.holder.next_epoch!==1n||closingCheck.holder.total_published!==0n||closingCheck.balance!==0n||closingRounds.some(({round})=>round.accum_p3d_share!==0n))throw new Error('Holder fees appeared during initial snapshot capture. Do not launch this game without a verified pre-fee snapshot.');
  const stored={...ctx.domain,openingSnapshot,plans:[],pendingWindow:null,lastPublicationAt:null,minContextSlot:ctx.minContextSlot,activation:'active'};ctx.journal=stored;
  await durableJson(ctx.stateFile,stored);await exportProofs(ctx,stored);return {status:'opening-snapshot-saved',slot:openingSnapshot.slot,eligibleWallets:openingSnapshot.balances.length};
}
export async function prepareOpeningSnapshot(ctx) {
  try{await fs.access(ctx.stateFile);throw new Error('Publisher state already exists; never replace its prelaunch snapshot.');}catch(error){if(error.code!=='ENOENT')throw error;}
  const openingSnapshot=await capture(ctx);
  const checked=await ctx.connection.getAccountInfoAndContext(ctx.game,{commitment:COMMITMENT,minContextSlot:openingSnapshot.slot});
  if(!Number.isSafeInteger(checked.context?.slot)||checked.context.slot<openingSnapshot.slot)throw new Error('Could not prove game absence at the finalized snapshot bank.');
  // Dust pre-funding is allowed by the program, but an initialized game is not.
  if(checked.value&&(!checked.value.owner.equals(SystemProgram.programId)||checked.value.data.length!==0))throw new Error('The game already exists. A pre-creation holder snapshot cannot be retroactively prepared.');
  const stored={...ctx.domain,activation:'prepared-before-game',preGameAbsenceSlot:checked.context.slot,openingSnapshot,plans:[],pendingWindow:null,lastPublicationAt:null,minContextSlot:checked.context.slot};
  await durableJson(ctx.stateFile,stored);ctx.journal=stored;ctx.minContextSlot=checked.context.slot;
  return {status:'opening-snapshot-prepared-before-game',slot:openingSnapshot.slot,preGameAbsenceSlot:checked.context.slot,eligibleWallets:openingSnapshot.balances.length};
}
async function publisherKey(ctx,{allowMainnet=false}={}) {
  if(ctx.domain.cluster==='mainnet-beta'&&(!allowMainnet||ctx.config.mainnetEnabled!==true))throw new Error('Mainnet publisher transactions are disabled. Review the release and explicitly enable its operator configuration.');
  const stat=await fs.stat(ctx.config.publisherKeypair);if((stat.mode&0o077)!==0)throw new Error('Publisher keypair must have mode 0600 or stricter.');
  const key=Keypair.fromSecretKey(Uint8Array.from(JSON.parse(await fs.readFile(ctx.config.publisherKeypair,'utf8'))));
  const {holder}=await readPublisherFunding(ctx);if(key.publicKey.toBase58()!==holder.publisher)throw new Error('Configured signer is not the holder publisher.');return key;
}
export async function checkpointFinalizedSlot(ctx,slot) {
  if(!Number.isSafeInteger(slot)||slot<0)throw new Error('Invalid finalized confirmation slot.');
  ctx.minContextSlot=Math.max(ctx.minContextSlot??0,slot);
  const stored=ctx.journal??await state(ctx);stored.minContextSlot=ctx.minContextSlot;
  await durableJson(ctx.stateFile,stored);
}
/** HTTP-only finality. A timeout is ambiguous and must never trigger an automatic replacement. */
export async function confirmPublisherTransactionByPolling(connection,{signature,lastValidBlockHeight},{timeoutMs=90_000,pollMs=1_000}={}) {
  if(typeof signature!=='string'||!signature||!Number.isSafeInteger(lastValidBlockHeight)||lastValidBlockHeight<0||!Number.isFinite(timeoutMs)||timeoutMs<=0||!Number.isFinite(pollMs)||pollMs<=0)throw new Error('Invalid publisher confirmation parameters.');
  const deadline=Date.now()+timeoutMs;
  const ambiguous=()=>Object.assign(new Error(`Publisher confirmation is ambiguous: ${signature}. Reconcile this signature before any replacement.`),{code:'PUBLISHER_CONFIRMATION_AMBIGUOUS',signature});
  async function bounded(operation) {
    const remaining=deadline-Date.now();if(remaining<=0)throw ambiguous();let timer;
    try{return await Promise.race([operation(),new Promise((_,reject)=>{timer=setTimeout(()=>reject(ambiguous()),remaining);})]);}finally{clearTimeout(timer);}
  }
  while(Date.now()<deadline) {
    let status,readSucceeded=false;
    try{const result=await bounded(()=>connection.getSignatureStatuses([signature],{searchTransactionHistory:true}));status=result.value?.[0];readSucceeded=Array.isArray(result.value)&&result.value.length===1;}catch(error){if(error.code==='PUBLISHER_CONFIRMATION_AMBIGUOUS')throw error;}
    if(readSucceeded&&status?.confirmationStatus==='finalized') {
      if(!Number.isSafeInteger(status.slot)||status.slot<0)throw ambiguous();
      return {context:{slot:status.slot},value:{err:status.err??null}};
    }
    // A processed/confirmed failure can still disappear with a fork. Only an
    // absent signature AND finalized block-height expiry permits replacement.
    if(readSucceeded&&status===null) {
      let height;
      try{height=await bounded(()=>connection.getBlockHeight('finalized'));}catch(error){if(error.code==='PUBLISHER_CONFIRMATION_AMBIGUOUS')throw error;}
      if(Number.isSafeInteger(height)&&height>lastValidBlockHeight)throw Object.assign(new Error(`Publisher transaction expired without a signature status: ${signature}.`),{code:'PUBLISHER_TRANSACTION_EXPIRED',signature});
    }
    await delay(Math.min(pollMs,Math.max(0,deadline-Date.now())));
  }
  throw ambiguous();
}
async function send(ctx,key,instruction) {
  await verifyOperatorProgram(ctx,ctx.minContextSlot??0);
  const latest=await ctx.connection.getLatestBlockhash('confirmed'),tx=new Transaction({...latest,feePayer:key.publicKey}).add(ComputeBudgetProgram.setComputeUnitLimit({units:300_000}));
  if(ctx.config.priorityFeeMicroLamports)tx.add(ComputeBudgetProgram.setComputeUnitPrice({microLamports:ctx.config.priorityFeeMicroLamports}));tx.add(instruction);tx.sign(key);
  const simulation=await ctx.connection.simulateTransaction(tx);if(simulation.value.err)throw new Error(`Publisher simulation failed: ${JSON.stringify(simulation.value.err)}`);
  const fee=(await ctx.connection.getFeeForMessage(tx.compileMessage(),'confirmed')).value;if(fee===null||await ctx.connection.getBalance(key.publicKey,'confirmed')<fee+5_000_000)throw new Error('Publisher needs SOL for transaction fees and epoch rent.');
  await verifyOperatorProgram(ctx,ctx.minContextSlot??0);
  const signature=await ctx.connection.sendRawTransaction(tx.serialize(),{skipPreflight:false,preflightCommitment:'confirmed',maxRetries:0});
  const confirmed=await confirmPublisherTransactionByPolling(ctx.connection,{...latest,signature});if(confirmed.value.err)throw new Error(`Publisher transaction failed: ${signature}`);
  await checkpointFinalizedSlot(ctx,confirmed.context.slot);return signature;
}
function assertEpoch(plan,epoch,ctx) {
  if(epoch.game!==ctx.game.toBase58()||epoch.config!==ctx.holderAddress.toBase58()||epoch.epoch!==BigInt(plan.epoch)||epoch.merkle_root!==plan.root||epoch.total_amount!==BigInt(plan.totalAmount)||epoch.snapshot_slot!==BigInt(plan.snapshotSlot))throw new Error('On-chain epoch differs from the durable proof plan.');
}
export async function reconcilePublisher(ctx,stored=undefined) {
  stored??=await state(ctx);validatePublicationJournal(stored,ctx.domain);ctx.journal=stored;ctx.minContextSlot=Math.max(ctx.minContextSlot??0,stored.minContextSlot??0,stored.openingSnapshot.slot,stored.pendingWindow?.nextOpeningSnapshot?.slot??0);let changed=false;
  for(const plan of stored.plans){
    const epoch=await ownedAccount(ctx,sdk.holderEpochAddress(ctx.domain.programId,ctx.holderAddress,plan.epoch),sdk.decodeHolderEpoch,{optional:true});
    if(!epoch){if(plan.status==='published')throw new Error('A previously finalized holder epoch disappeared.');continue;}assertEpoch(plan,epoch,ctx);
    if(plan.status!=='published'){plan.status='published';stored.openingSnapshot=plan.nextOpeningSnapshot;stored.pendingWindow=null;stored.lastPublicationAt=new Date().toISOString();changed=true;}
  }
  const {holder}=await readPublisherFunding(ctx);
  if(holder.next_epoch!==BigInt(stored.plans.filter(plan=>plan.status==='published').length+1))throw new Error('Publisher journal is missing an on-chain epoch. Restore the immutable manifests before proceeding.');
  if(changed)await durableJson(ctx.stateFile,stored);return stored;
}
export async function exportProofs(ctx,stored=undefined) {
  stored=await reconcilePublisher(ctx,stored);const docs=proofDocuments(stored.plans,ctx.domain);
  // Verify every included root on chain before publishing any wallet file.
  for(const plan of stored.plans.filter(plan=>plan.status==='published'))assertEpoch(plan,await ownedAccount(ctx,sdk.holderEpochAddress(ctx.domain.programId,ctx.holderAddress,plan.epoch),sdk.decodeHolderEpoch),ctx);
  await fs.mkdir(ctx.config.proofOutput,{recursive:true,mode:0o755});
  for(const [wallet,document] of docs.wallets)await durableJson(path.join(ctx.config.proofOutput,'wallets',wallet+'.json'),document,{mode:0o644});
  for(const plan of stored.plans.filter(plan=>plan.status==='published'))await durableJson(path.join(ctx.config.proofOutput,'epochs',plan.epoch+'.json'),plan,{mode:0o644});
  await durableJson(path.join(ctx.config.proofOutput,'index.json'),docs.index,{mode:0o644});
  return {status:'proofs-exported',epochs:docs.index.epochs.length,wallets:docs.wallets.size,output:ctx.config.proofOutput};
}
export async function publishCycle(ctx,options={}) {
  const key=await publisherKey(ctx,options);let stored=await reconcilePublisher(ctx),funding=await readPublisherFunding(ctx),{game,holder}=funding;
  if(stored.activation!=='active')throw new Error('Activate the prepared holder snapshot after game creation before publishing.');
  let pendingPlan=stored.plans.find(plan=>plan.status!=='published');
  if(!pendingPlan){
    if(!stored.pendingWindow&&stored.lastPublicationAt&&Date.now()-Date.parse(stored.lastPublicationAt)<ctx.config.epochSeconds*1000)return {status:'waiting-for-cadence'};
    const history=await rounds(ctx,game),unpaid=history.reduce((sum,{round})=>sum+round.accum_p3d_share-round.withdrawn_p3d,0n),available=funding.available;
    if(unpaid+available<BigInt(ctx.config.minPublishLamports))return {status:'waiting-for-funded-threshold',available:(unpaid+available).toString()};
    // Persist the next opening snapshot BEFORE sweeps. Thus any unswept fee
    // left after a sweep occurred after this snapshot, never before eligibility.
    if(!stored.pendingWindow){const nextOpeningSnapshot=await capture(ctx);if(nextOpeningSnapshot.slot<stored.openingSnapshot.slot)throw new Error('Holder snapshot moved backwards; retry with a current finalized RPC.');stored.pendingWindow={epoch:holder.next_epoch.toString(),nextOpeningSnapshot};await durableJson(ctx.stateFile,stored);}
    if(stored.pendingWindow.epoch!==holder.next_epoch.toString())throw new Error('Pending holder window has the wrong epoch.');
    ctx.minContextSlot=Math.max(ctx.minContextSlot??0,stored.minContextSlot??0,stored.pendingWindow.nextOpeningSnapshot.slot);
    // Re-read the game after the snapshot: a new round may have begun while
    // holders were being enumerated. Every pre-snapshot liability must sweep.
    ({game,holder}=await readPublisherFunding(ctx));
    for(const {id,round} of await rounds(ctx,game))if(round.accum_p3d_share>round.withdrawn_p3d)await send(ctx,key,sdk.fundHolderVaultInstruction({programId:ctx.domain.programId,version:ctx.config.gameVersion,roundId:id}));
    funding=await readPublisherFunding(ctx);({holder}=funding);const funded=funding.available;if(funded<=0n)throw new Error('No unreserved holder fees were funded.');
    pendingPlan=makePublicationPlan({domain:ctx.domain,epoch:holder.next_epoch,totalAmount:funded,openingSnapshot:stored.openingSnapshot,nextOpeningSnapshot:stored.pendingWindow.nextOpeningSnapshot});
    validatePublicationPlan(pendingPlan,ctx.domain);stored.plans.push(pendingPlan);
    await durableJson(path.join(ctx.config.workspace,'plans',pendingPlan.epoch+'.json'),pendingPlan);await durableJson(ctx.stateFile,stored);
  }
  validatePublicationPlan(pendingPlan,ctx.domain);
  try{
    pendingPlan.signature=await send(ctx,key,sdk.publishHolderEpochInstruction({programId:ctx.domain.programId,publisher:key.publicKey,version:ctx.config.gameVersion,epoch:pendingPlan.epoch,root:hexToBytes(pendingPlan.root),totalAmount:pendingPlan.totalAmount,snapshotSlot:pendingPlan.snapshotSlot}));
    await durableJson(ctx.stateFile,stored);
  }catch(error){await durableJson(ctx.stateFile,stored);throw new Error(`Holder publication outcome requires reconciliation before retry: ${error.message}`);}
  stored=await reconcilePublisher(ctx,stored);await exportProofs(ctx,stored);return {status:'published',epoch:pendingPlan.epoch,amount:pendingPlan.totalAmount,signature:pendingPlan.signature};
}
async function main() {
  const args=process.argv.slice(2),command=args[0],flag=name=>{const i=args.indexOf(name);return i<0?null:args[i+1];};
  if(!['prepare-opening','init','publish','reconcile','export','status','watch'].includes(command)||!flag('--config'))throw new Error('Usage: node scripts/holder-publisher.mjs <prepare-opening|init|publish|reconcile|export|status|watch> --config PRIVATE.json [--allow-mainnet]');
  const ctx=await loadPublisher(flag('--config'));
  if(command==='watch'){
    let stopping=false;const stop=()=>{stopping=true;};process.once('SIGINT',stop);process.once('SIGTERM',stop);
    while(!stopping){
      const result=await withPublisherLock(ctx.config.workspace,()=>publishCycle(ctx,{allowMainnet:args.includes('--allow-mainnet')}));
      console.log(JSON.stringify({...result,checkedAt:new Date().toISOString()}));
      for(let n=0;n<30&&!stopping;n++)await new Promise(resolve=>setTimeout(resolve,1000));
    }
    return;
  }
  const result=await withPublisherLock(ctx.config.workspace,async()=>{
    if(command==='prepare-opening')return prepareOpeningSnapshot(ctx);
    if(command==='init')return initializePublisher(ctx);if(command==='publish')return publishCycle(ctx,{allowMainnet:args.includes('--allow-mainnet')});if(command==='export')return exportProofs(ctx);
    const stored=await reconcilePublisher(ctx);return {status:command==='reconcile'?'reconciled':'ready',cluster:ctx.domain.cluster,openingSlot:stored.openingSnapshot.slot,publishedEpochs:stored.plans.filter(plan=>plan.status==='published').length,pending:stored.plans.find(plan=>plan.status!=='published')?.epoch??null};
  });console.log(JSON.stringify(result));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main().catch(error=>{console.error(error.message);process.exitCode=1;});
