/** Actual-chain publisher recovery/proof test on the dedicated local validator. */
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { getAccount,getAssociatedTokenAddress,getOrCreateAssociatedTokenAccount,transfer } from '@solana/spl-token';
import * as rt from './localnet-runtime.mjs';
import * as sdk from '../src/solana-instructions.mjs';
import { LOCAL,RPC_URL,localKey } from './localnet-common.mjs';
import { loadPublisher,initializePublisher,publishCycle,reconcilePublisher,exportProofs,durableJson,withPublisherLock } from './holder-publisher.mjs';
import { hexToBytes } from '../src/solana-holder.mjs';

const report={scope:'dedicated local validator; not devnet/testnet/mainnet evidence',checks:[],signatures:[],passed:false};
const check=(condition,label)=>{assert.ok(condition,label);report.checks.push(label);};
async function finalized(connection){const target=await connection.getSlot('confirmed'),until=Date.now()+60_000;while(await connection.getSlot('finalized')<target){if(Date.now()>until)throw new Error('Local finalized root did not advance.');await new Promise(resolve=>setTimeout(resolve,300));}}
try{
  const version=Date.now(),game=await rt.makeContext({version,isolated:true}),directory=path.join(LOCAL,`publisher-${version}`),configFile=path.join(directory,'operator.json');
  await finalized(game.connection);
  await durableJson(configFile,{cluster:'localnet',genesisHash:await game.connection.getGenesisHash(),rpcUrl:RPC_URL,programId:game.programId,gameVersion:String(version),piggyMint:game.piggyMint.toBase58(),
    publisherKeypair:path.join(LOCAL,'wallets','payer.json'),workspace:'./private',proofOutput:'./public',minPublishLamports:'1000',epochSeconds:60,excludedWallets:[]});
  const operator=await loadPublisher(configFile,{allowLocal:true});
  const initial=await withPublisherLock(operator.config.workspace,()=>initializePublisher(operator));check(initial.status==='opening-snapshot-saved','durable finalized opening snapshot precedes all holder fees');
  await assert.rejects(initializePublisher(operator),/already exists/);report.checks.push('reinitialization cannot replace historical eligibility');
  const late=await localKey(`publisher-late-${version}`),you=game.wallets.you,source=await getAssociatedTokenAddress(game.piggyMint,you.publicKey),destination=await getOrCreateAssociatedTokenAccount(game.connection,game.payer,game.piggyMint,late.publicKey);
  report.signatures.push(await transfer(game.connection,you,source,destination.address,you,100_000_000n));
  const feed=await rt.feed(game,{count:100,publish:false});report.signatures.push(feed.signature);await finalized(game.connection);
  const first=await withPublisherLock(operator.config.workspace,()=>publishCycle(operator));check(first.status==='published','funded epoch is submitted and finalized by the standalone publisher');report.signatures.push(first.signature);
  let stored=JSON.parse(await fs.readFile(operator.stateFile,'utf8')),plan=stored.plans[0];
  check(!plan.records.some(row=>row.wallet===late.publicKey.toBase58()),'a post-opening token buyer cannot receive the preceding fee epoch');
  check(plan.nextOpeningSnapshot.balances.some(([wallet])=>wallet===late.publicKey.toBase58()),'the late holder enters the next opening snapshot');
  const exported=await exportProofs(operator),walletFile=path.join(operator.config.proofOutput,'wallets',you.publicKey.toBase58()+'.json'),publicWallet=JSON.parse(await fs.readFile(walletFile,'utf8'));
  check(exported.epochs===1&&publicWallet.epochs.length===1&&publicWallet.cluster==='localnet','read-only wallet proof export carries the deployment domain');
  const row=plan.records.find(row=>row.wallet===you.publicKey.toBase58()),tokensBefore=(await getAccount(game.connection,source)).amount;
  const holderBefore=await rt.readAccount(game,sdk.holderConfigAddress(game.programId,game.game),sdk.decodeHolderConfig),vaultBefore=await rt.tokenAmount(game,holderBefore.vault),temp=await rt.temporaryWsol(game,you);
  report.signatures.push(await rt.send(game,[...temp.before,sdk.claimHolderInstruction({programId:game.programId,wallet:you.publicKey,version,epoch:plan.epoch,amount:row.amount,proof:row.proof.map(hexToBytes),destination:temp.account.publicKey}),...temp.after],[you,temp.account]));
  const holderAfter=await rt.readAccount(game,sdk.holderConfigAddress(game.programId,game.game),sdk.decodeHolderConfig),vaultAfter=await rt.tokenAmount(game,holderAfter.vault);
  check(vaultBefore-vaultAfter===BigInt(row.amount)&&holderBefore.reserved_amount-holderAfter.reserved_amount===BigInt(row.amount),'exported proof pays exactly its funded amount and reduces reservation atomically');
  check((await getAccount(game.connection,source)).amount===tokensBefore,'holder claim neither moves nor stakes PIGGY');
  check(!await game.connection.getAccountInfo(temp.account.publicKey),'claim unwrap closes its temporary WSOL account');
  // Reproduce an RPC timeout after the chain finalized but before local commit.
  plan.status='prepared';stored.openingSnapshot=plan.openingSnapshot;stored.pendingWindow={epoch:plan.epoch,nextOpeningSnapshot:plan.nextOpeningSnapshot};await durableJson(operator.stateFile,stored);
  const restarted=await loadPublisher(configFile,{allowLocal:true}),recovered=await reconcilePublisher(restarted);
  check(recovered.plans[0].status==='published'&&recovered.pendingWindow===null&&recovered.openingSnapshot.slot===plan.nextOpeningSnapshot.slot,'restart reconciles an ambiguous publication and advances the saved opening snapshot');
  const repeated=await withPublisherLock(restarted.config.workspace,()=>publishCycle(restarted));check(repeated.status==='waiting-for-cadence','restart does not reserve or publish the same epoch twice');
  const config=JSON.parse(await fs.readFile(configFile,'utf8'));config.publisherKeypair=path.join(LOCAL,'wallets',`publisher-late-${version}.json`);await durableJson(configFile,config);const wrong=await loadPublisher(configFile,{allowLocal:true});
  await assert.rejects(publishCycle(wrong),/not the holder publisher/);report.checks.push('a wrong publisher key cannot fund or publish a cycle');
  report.passed=true;report.directory=directory;
}catch(error){report.failure=error.stack;throw error;}finally{await fs.mkdir(path.join(LOCAL,'reports'),{recursive:true});await fs.writeFile(path.join(LOCAL,'reports','publisher-integration.json'),sdk.serializeChain(report));console.log(JSON.stringify({passed:report.passed,checks:report.checks.length,scope:report.scope,directory:report.directory}));}
