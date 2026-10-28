import test from 'node:test';
import assert from 'node:assert/strict';
import { Keypair, PublicKey } from '@solana/web3.js';
import { AccountLayout, MintLayout, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { decodeStream, deriveEscrowPDA } from '@streamflow/stream';
import { attributeStreamflowLocks, snapshotWithStreamflowLocks, STREAMFLOW_PROGRAMS } from '../scripts/streamflow-holder.mjs';
import { eligibleOpeningSnapshot, makePublicationPlan, validatePublicationPlan, STREAMFLOW_ELIGIBILITY_POLICY, ELIGIBILITY_POLICY } from '../src/holder-publication.mjs';

const random = () => Keypair.generate().publicKey;
const programId = STREAMFLOW_PROGRAMS['mainnet-beta'];
const wallet = random(), other = random(), mint = random(), metadata = random();
const escrow = deriveEscrowPDA(new PublicKey(programId), metadata);
function metadataBytes({ deposited=700n, withdrawn=0n, recipient=wallet, canceled=0n, closed=false, fees=0n }={}) {
  const b=Buffer.alloc(1104);b.writeBigUInt64LE(4n,0);b[8]=4;
  wallet.toBuffer().copy(b,49);recipient.toBuffer().copy(b,113);mint.toBuffer().copy(b,177);escrow.toBuffer().copy(b,209);
  b.writeBigUInt64LE(fees,305);b.writeBigUInt64LE(deposited,417);b.writeBigUInt64LE(withdrawn,17);b.writeBigUInt64LE(canceled,25);b[671]=closed?1:0;
  return b;
}
function fixture(opts={}) {
  const amount=opts.escrowAmount??(700n-(opts.withdrawn??0n)+(opts.fees??0n));
  const tokenAccounts=[{address:escrow.toBase58(),owner:escrow.toBase58(),mint:mint.toBase58(),amount,delegate:null,closeAuthority:null}];
  const snapshot={slot:101,mint:mint.toBase58(),tokenProgram:TOKEN_PROGRAM_ID.toBase58(),decimals:6,supply:2000n,tokenAccounts,balances:new Map([[other.toBase58(),300n],[wallet.toBase58(),opts.withdrawn??0n],[escrow.toBase58(),amount]]),totalBalance:300n+(opts.withdrawn??0n)+amount};
  const rows=[{address:metadata.toBase58(),hash:'a'.repeat(64),stream:decodeStream(metadataBytes(opts))}];
  return {snapshot,rows,options:{programId,beforeSlot:100,afterSlot:102}};
}
function adjusted(opts) { const f=fixture(opts);return attributeStreamflowLocks(f.snapshot,f.rows,f.options); }
test('a 70% recipient lock earns 70% without staking and has a claim-capable proof',()=>{
  const opening=eligibleOpeningSnapshot(adjusted());assert.equal(opening.policy,STREAMFLOW_ELIGIBILITY_POLICY);
  const domain={schemaVersion:1,cluster:'mainnet-beta',genesisHash:'test',programId:random().toBase58(),gameVersion:'1',piggyMint:mint.toBase58()};
  const plan=makePublicationPlan({domain,epoch:1,totalAmount:100,openingSnapshot:opening,nextOpeningSnapshot:opening});
  assert.equal(plan.records.find(x=>x.wallet===wallet.toBase58()).amount,'70');
  assert.equal(plan.records.find(x=>x.wallet===other.toBase58()).amount,'30');validatePublicationPlan(plan,domain);
});
test('partial withdrawal moves tokens to liquid holdings without double counting',()=>{
  const result=adjusted({withdrawn:200n});assert.equal(result.balances.get(wallet.toBase58()),700n);assert.equal(result.balances.get(escrow.toBase58()),0n);assert.equal(result.totalBalance,1000n);
  assert.equal(result.streamflowLocks.assignments[0].amount,'500');
});
test('fees and unsolicited escrow surplus are not credited as beneficiary tokens',()=>{
  const result=adjusted({fees:7n,escrowAmount:712n});assert.equal(result.balances.get(wallet.toBase58()),700n);assert.equal(result.balances.get(escrow.toBase58()),12n);
});
test('the recipient receives locked eligibility, and closed/canceled streams receive none',()=>{
  const transferred=adjusted({recipient:other});assert.equal(transferred.balances.get(other.toBase58()),1000n);assert.equal(transferred.balances.get(wallet.toBase58()),0n);
  for(const opts of[{closed:true},{canceled:1n}])assert.equal(adjusted(opts).streamflowLocks.assignments.length,0);
});
test('missing, mismatched, delegated or underfunded escrow fails closed',()=>{
  for(const alter of[
    f=>f.snapshot.tokenAccounts.splice(0),f=>f.snapshot.tokenAccounts[0].owner=wallet.toBase58(),
    f=>f.snapshot.tokenAccounts[0].delegate=wallet.toBase58(),f=>f.snapshot.tokenAccounts[0].amount=699n,
    f=>f.rows[0].stream.escrowTokens=random(),f=>f.rows.push(f.rows[0]),
  ]){const f=fixture();alter(f);assert.throws(()=>attributeStreamflowLocks(f.snapshot,f.rows,f.options),/custody|escrow/);}
});
test('v2 snapshots retain exclusions and reject edited attribution evidence',()=>{
  const excluded=eligibleOpeningSnapshot(adjusted(),{excludedWallets:[wallet.toBase58()]});assert.deepEqual(excluded.balances,[[other.toBase58(),'300']]);assert.equal(excluded.streamflowLocks.assignments.length,0);
  const opening=eligibleOpeningSnapshot(adjusted());const domain={schemaVersion:1,cluster:'mainnet-beta',genesisHash:'test',programId:random().toBase58(),gameVersion:'1',piggyMint:mint.toBase58()};
  for(const change of[a=>a.amount='701',a=>a.recipient=other.toBase58(),a=>a.escrow=other.toBase58()]){const bad=structuredClone(opening);change(bad.streamflowLocks.assignments[0]);assert.throws(()=>makePublicationPlan({domain,epoch:1,totalAmount:100,openingSnapshot:bad,nextOpeningSnapshot:opening}),/Streamflow/);}
});
test('policy changes do not rewrite an already captured opening snapshot',()=>{
  const old=eligibleOpeningSnapshot(fixture().snapshot),next=eligibleOpeningSnapshot(adjusted());assert.equal(old.policy,ELIGIBILITY_POLICY);
  const domain={schemaVersion:1,cluster:'mainnet-beta',genesisHash:'test',programId:random().toBase58(),gameVersion:'1',piggyMint:mint.toBase58()};
  const plan=makePublicationPlan({domain,epoch:1,totalAmount:100,openingSnapshot:old,nextOpeningSnapshot:next});assert.equal(plan.records.length,1);assert.equal(plan.records[0].wallet,other.toBase58());assert.equal(plan.records[0].amount,'100');
});
function rpcFixture({unstable=false}={}){
  let streamReads=0;const f=fixture(),mintData=Buffer.alloc(82);MintLayout.encode({mintAuthorityOption:0,mintAuthority:PublicKey.default,supply:1000n,decimals:6,isInitialized:true,freezeAuthorityOption:0,freezeAuthority:PublicKey.default},mintData);
  const tokenRow=(owner,amount)=>{const data=Buffer.alloc(165);AccountLayout.encode({mint,owner,amount,delegateOption:0,delegate:PublicKey.default,state:1,isNativeOption:0,isNative:0n,delegatedAmount:0n,closeAuthorityOption:0,closeAuthority:PublicKey.default},data);return{pubkey:owner.equals(escrow)?escrow:random(),account:{owner:TOKEN_PROGRAM_ID,data}}};
  return {getAccountInfo:async()=>({owner:TOKEN_PROGRAM_ID,data:mintData}),getProgramAccounts:async(p,options)=>{
    if(p.equals(TOKEN_PROGRAM_ID))return{context:{slot:100+streamReads},value:[tokenRow(escrow,700n),tokenRow(other,300n)]};
    assert.equal(options.filters[0].memcmp.offset,177);streamReads++;return{context:{slot:100+streamReads},value:[{pubkey:metadata,account:{owner:new PublicKey(programId),data:metadataBytes({withdrawn:unstable&&streamReads%2===0?1n:0n})}}]};
  }};
}
test('atomic token inventory is bracketed by stable Streamflow metadata reads',async()=>{
  const result=await snapshotWithStreamflowLocks(rpcFixture(),mint,{cluster:'mainnet-beta'});assert.equal(result.balances.get(wallet.toBase58()),700n);
  await assert.rejects(snapshotWithStreamflowLocks(rpcFixture({unstable:true}),mint,{cluster:'mainnet-beta'}),/kept changing/);
});
