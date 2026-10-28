/** Deterministic, inspectable holder publication plans. No signing keys or I/O. */
import { PublicKey } from '@solana/web3.js';
import { Buffer } from 'buffer';
import { apportionHolderRewards, holderMerkleTree, bytesToHex, verifyHolderProof, hexToBytes } from './solana-holder.mjs';
import { gameAddress, pk } from './solana-instructions.mjs';

export const ELIGIBILITY_POLICY = 'opening-snapshot-on-curve-owners-v1';
export const STREAMFLOW_ELIGIBILITY_POLICY = 'opening-snapshot-streamflow-recipients-v2';
export const SUPPORTED_ELIGIBILITY_POLICIES = [ELIGIBILITY_POLICY, STREAMFLOW_ELIGIBILITY_POLICY];
// Two-signature WSOL claims fit legacy1232-byte packets through depth16,
// including the configured priority fee. Never reserve an unclaimable root.
export const MAX_HOLDER_LEAVES = 65_536;
const positive = (value,label) => { if(!/^[1-9]\d*$/.test(String(value))||BigInt(value)>(1n<<64n)-1n)throw new Error(`Invalid ${label}.`);return BigInt(value); };
export function publicationDomain(config) {
  return {schemaVersion:1,cluster:config.cluster,genesisHash:config.genesisHash,programId:pk(config.programId).toBase58(),gameVersion:String(config.gameVersion),piggyMint:pk(config.piggyMint).toBase58()};
}
export function assertPublicationDomain(actual,expected) {
  for(const field of ['schemaVersion','cluster','genesisHash','programId','gameVersion','piggyMint'])if(actual[field]!==expected[field])throw new Error(`Holder publication ${field} mismatch.`);
}
export function eligibleOpeningSnapshot(snapshot,{excludedWallets=[],excludeOffCurve=true}={}) {
  if(!Number.isSafeInteger(snapshot.slot)||snapshot.slot<0)throw new Error('Invalid snapshot slot.');
  if(excludeOffCurve!==true)throw new Error('Public holder policy requires claim-capable on-curve owners.');
  const excluded=new Set(excludedWallets.map(wallet=>pk(wallet).toBase58())),balances=[],seen=new Set();let excludedBalance=0n;
  for(const [address,rawAmount] of snapshot.balances){
    const wallet=pk(address).toBase58(),amount=BigInt(rawAmount);if(amount<0n||seen.has(wallet))throw new Error('Invalid or duplicate snapshot owner.');seen.add(wallet);if(!amount)continue;
    if(excluded.has(wallet)||!PublicKey.isOnCurve(pk(wallet).toBytes())){excludedBalance+=amount;continue;}balances.push([wallet,amount.toString()]);
  }
  balances.sort(([a],[b])=>Buffer.compare(pk(a).toBuffer(),pk(b).toBuffer()));
  if(!balances.length)throw new Error('No claim-capable eligible holders exist.');
  const streamflowLocks=snapshot.streamflowLocks?{...snapshot.streamflowLocks,assignments:snapshot.streamflowLocks.assignments.filter(a=>!excluded.has(a.wallet))}:null;
  const result={policy:streamflowLocks?STREAMFLOW_ELIGIBILITY_POLICY:ELIGIBILITY_POLICY,slot:snapshot.slot,mint:pk(snapshot.mint).toBase58(),tokenProgram:snapshot.tokenProgram,decimals:snapshot.decimals,
    excludedWallets:[...excluded].sort(),excludedBalance:excludedBalance.toString(),balances,totalEligibleBalance:balances.reduce((sum,[,amount])=>sum+BigInt(amount),0n).toString(),...(streamflowLocks?{streamflowLocks}:{})};
  validateStreamflowEvidence(result);
  return result;
}
function validateStreamflowEvidence(snapshot){
  if(snapshot.policy===ELIGIBILITY_POLICY){if(snapshot.streamflowLocks)throw new Error('Legacy snapshots cannot contain Streamflow attribution.');return;}
  const evidence=snapshot.streamflowLocks;
  if(snapshot.policy!==STREAMFLOW_ELIGIBILITY_POLICY||evidence?.version!==1||!['strmRqUCoQUgGUan5YhzUZa6KqdzwX5L6FpUxfmKg5m','HqDGZjaVRXJ9MGRQEw7qDc2rAr6iH1n1kAQdCZaCMfMZ'].includes(evidence.programId)||!Array.isArray(evidence.assignments)||!Number.isSafeInteger(evidence.beforeSlot)||evidence.beforeSlot<0||!Number.isSafeInteger(evidence.afterSlot)||evidence.beforeSlot>snapshot.slot||evidence.afterSlot<snapshot.slot)throw new Error('Invalid Streamflow snapshot evidence.');
  const seen=new Set(),attributed=new Map(),balances=new Map(snapshot.balances);
  for(const a of evidence.assignments){
    const escrow=PublicKey.findProgramAddressSync([Buffer.from('strm'),pk(a.metadata).toBuffer()],pk(evidence.programId))[0].toBase58();
    if(a.escrow!==escrow||seen.has(escrow)||a.wallet!==a.recipient||!PublicKey.isOnCurve(pk(a.wallet).toBytes())||!/^[a-f0-9]{64}$/.test(a.metadataSha256))throw new Error('Invalid Streamflow recipient lock attribution.');
    const amount=positive(a.amount,'locked balance'),deposited=positive(a.deposited,'lock deposit'),withdrawn=BigInt(a.withdrawn),fees=BigInt(a.unpaidFees);
    if(withdrawn<0n||fees<0n||deposited-withdrawn!==amount||BigInt(a.escrowBalance)<amount+fees)throw new Error('Unbacked Streamflow recipient lock attribution.');
    seen.add(escrow);attributed.set(a.wallet,(attributed.get(a.wallet)??0n)+amount);
  }
  for(const [wallet,amount]of attributed)if(!balances.has(wallet)||BigInt(balances.get(wallet))<amount)throw new Error('Streamflow attribution exceeds eligible wallet balance.');
}
export function makePublicationPlan({domain,epoch,totalAmount,openingSnapshot,nextOpeningSnapshot}) {
  const number=positive(epoch,'epoch'),total=positive(totalAmount,'epoch amount');
  for(const snapshot of [openingSnapshot,nextOpeningSnapshot]){
    if(!SUPPORTED_ELIGIBILITY_POLICIES.includes(snapshot.policy)||snapshot.mint!==domain.piggyMint||!Number.isSafeInteger(snapshot.slot)||snapshot.slot<0)throw new Error('Snapshot does not match holder policy/mint.');
    validateStreamflowEvidence(snapshot);
    const seen=new Set(),excluded=new Set(snapshot.excludedWallets??[]);let sum=0n;
    for(const [wallet,amount] of snapshot.balances){if(seen.has(wallet)||!PublicKey.isOnCurve(pk(wallet).toBytes())||excluded.has(wallet))throw new Error('Invalid or duplicate eligible owner.');seen.add(wallet);sum+=positive(amount,'snapshot balance');}
    if(!sum||sum!==BigInt(snapshot.totalEligibleBalance))throw new Error('Snapshot total does not match eligible balances.');
  }
  if(nextOpeningSnapshot.slot<openingSnapshot.slot)throw new Error('Holder snapshots moved backwards.');
  const records=apportionHolderRewards(new Map(openingSnapshot.balances.map(([wallet,amount])=>[wallet,BigInt(amount)])),total);
  if(records.length>MAX_HOLDER_LEAVES)throw new Error('Holder epoch exceeds the reviewed 65,536-leaf legacy claim capacity. Upgrade to reviewed sharded epochs or lookup-table claims before publication.');
  const tree=holderMerkleTree(records,{programId:domain.programId,game:gameAddress(domain.programId,domain.gameVersion),epoch:number});
  return {...domain,epoch:number.toString(),totalAmount:total.toString(),snapshotSlot:openingSnapshot.slot,root:bytesToHex(tree.root),status:'prepared',openingSnapshot,nextOpeningSnapshot,
    records:tree.records.map(row=>({wallet:row.wallet,tokenBalance:row.tokenBalance.toString(),amount:row.amount.toString(),proof:row.proof.map(bytesToHex)}))};
}
export function validatePublicationPlan(plan,domain) {
  assertPublicationDomain(plan,domain);
  const expected=makePublicationPlan({domain,epoch:plan.epoch,totalAmount:plan.totalAmount,openingSnapshot:plan.openingSnapshot,nextOpeningSnapshot:plan.nextOpeningSnapshot});
  if(plan.snapshotSlot!==expected.snapshotSlot||plan.root!==expected.root||JSON.stringify(plan.records)!==JSON.stringify(expected.records))throw new Error('Holder plan does not match the complete deterministic snapshot allocation.');
  const proofDomain={programId:domain.programId,game:gameAddress(domain.programId,domain.gameVersion),epoch:BigInt(plan.epoch)};
  for(const record of plan.records)if(!verifyHolderProof({...record,amount:BigInt(record.amount),proof:record.proof.map(hexToBytes)},proofDomain,hexToBytes(plan.root)))throw new Error('Holder plan contains an invalid proof.');
  return plan;
}
export function validatePublicationJournal(stored,domain) {
  assertPublicationDomain(stored,domain);
  if(!Array.isArray(stored.plans)||!stored.openingSnapshot)throw new Error('Publisher state is incomplete. Restore its durable backup.');
  let published=0,pending=null;
  for(const [index,plan] of stored.plans.entries()){
    if(plan.epoch!==String(index+1)||!['published','prepared'].includes(plan.status)||pending)throw new Error('Publisher journal epochs must be unique, ordered and contiguous, with at most one final prepared plan.');
    validatePublicationPlan(plan,domain);
    if(index>0&&JSON.stringify(plan.openingSnapshot)!==JSON.stringify(stored.plans[index-1].nextOpeningSnapshot))throw new Error('Publisher journal snapshot windows are not contiguous.');
    if(plan.status==='published')published++;else pending=plan;
  }
  const current=pending?.openingSnapshot??stored.plans.at(-1)?.nextOpeningSnapshot;
  if(current&&JSON.stringify(stored.openingSnapshot)!==JSON.stringify(current))throw new Error('Publisher journal opening snapshot does not match its epoch history.');
  if(stored.pendingWindow&&(stored.pendingWindow.epoch!==String(published+1)||pending&&JSON.stringify(stored.pendingWindow.nextOpeningSnapshot)!==JSON.stringify(pending.nextOpeningSnapshot)))throw new Error('Publisher journal pending window does not match its next epoch.');
  if(pending&&!stored.pendingWindow)throw new Error('Publisher prepared plan is missing its durable next window.');
  return {published,pending};
}
export function proofDocuments(plans,domain) {
  const wallets=new Map(),epochs=[],seen=new Set();
  for(const plan of plans){
    if(plan.status!=='published')continue;validatePublicationPlan(plan,domain);
    if(seen.has(plan.epoch))throw new Error('Duplicate published holder epoch.');seen.add(plan.epoch);
    epochs.push({epoch:plan.epoch,root:plan.root,snapshotSlot:plan.snapshotSlot,totalAmount:plan.totalAmount,signature:plan.signature??null,...(plan.openingSnapshot.policy===STREAMFLOW_ELIGIBILITY_POLICY?{eligibilityPolicy:plan.openingSnapshot.policy}:{})});
    for(const row of plan.records){if(!wallets.has(row.wallet))wallets.set(row.wallet,{...domain,wallet:row.wallet,epochs:[]});wallets.get(row.wallet).epochs.push({epoch:plan.epoch,amount:row.amount,proof:row.proof});}
  }
  epochs.sort((a,b)=>BigInt(a.epoch)<BigInt(b.epoch)?-1:1);
  for(const wallet of wallets.values())wallet.epochs.sort((a,b)=>BigInt(a.epoch)<BigInt(b.epoch)?-1:1);
  return {index:{...domain,eligibilityPolicy:epochs.at(-1)?.eligibilityPolicy??ELIGIBILITY_POLICY,epochs},wallets};
}
