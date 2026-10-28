/** Wallet-balance holder epochs: real SPL mint snapshots, no staking. */
import { Buffer } from 'buffer';
import { keccak_256 } from '@noble/hashes/sha3';
import { TOKEN_2022_PROGRAM_ID, unpackMint, unpackAccount } from '@solana/spl-token';
import { pk, u64, TOKEN_PROGRAM_ID } from './solana-instructions.mjs';
const LEAF=Buffer.from('PIGGY_HOLDER_REWARDS_V1'), NODE=Buffer.from('PIGGY_HOLDER_NODE_V1');
export const bytesToHex=bytes=>Buffer.from(bytes).toString('hex');
export const hexToBytes=hex=>Uint8Array.from(Buffer.from(hex,'hex'));
export function holderLeaf({programId,game,epoch,wallet,amount}){return Uint8Array.from(keccak_256(Buffer.concat([LEAF,pk(programId).toBuffer(),pk(game).toBuffer(),u64(epoch),pk(wallet).toBuffer(),u64(amount)])));}
export function holderParent(a,b){const x=Buffer.from(a),y=Buffer.from(b);return Uint8Array.from(keccak_256(Buffer.concat([NODE,...(Buffer.compare(x,y)<=0?[x,y]:[y,x])])));}
export function holderMerkleTree(records,domain){
  if(!records.length)throw new Error('Cannot publish an empty holder tree.');
  const wallets=new Set(records.map(r=>pk(r.wallet).toBase58()));if(wallets.size!==records.length)throw new Error('Duplicate holder wallet.');if(records.some(r=>BigInt(r.amount)<=0n))throw new Error('Positive holder entitlements required.');
  const leaves=records.map(record=>holderLeaf({...domain,...record}));const levels=[leaves];
  while(levels.at(-1).length>1){const level=levels.at(-1),next=[];for(let i=0;i<level.length;i+=2)next.push(i+1<level.length?holderParent(level[i],level[i+1]):level[i]);levels.push(next);}
  return{root:levels.at(-1)[0],records:records.map((record,index)=>{const proof=[];let cursor=index;for(const level of levels.slice(0,-1)){const sibling=cursor^1;if(sibling<level.length)proof.push(level[sibling]);cursor=Math.floor(cursor/2);}return{...record,leaf:leaves[index],proof};})};
}
export function verifyHolderProof(record,domain,root){let hash=holderLeaf({...domain,...record});for(const sibling of record.proof)hash=holderParent(hash,sibling);return Buffer.from(hash).equals(Buffer.from(root));}
export async function snapshotMintBalances(connection,mint,{commitment='confirmed',minContextSlot,includeAccounts=false}={}){
  const mintKey=pk(mint),mintAccount=await connection.getAccountInfo(mintKey,{commitment,...(minContextSlot===undefined?{}:{minContextSlot})});
  if(!mintAccount||![TOKEN_PROGRAM_ID,TOKEN_2022_PROGRAM_ID].some(program=>mintAccount.owner.equals(program)))throw new Error('Holder eligibility requires an initialized SPL or Token-2022 mint.');
  const tokenProgram=mintAccount.owner,mintInfo=unpackMint(mintKey,mintAccount,tokenProgram);
  if(!mintInfo.isInitialized)throw new Error('Holder eligibility mint is not initialized.');
  // Token-2022 token accounts can carry extensions; dataSize:165 would omit them.
  const filters=[...(tokenProgram.equals(TOKEN_PROGRAM_ID)?[{dataSize:165}]:[]),{memcmp:{offset:0,bytes:mintKey.toBase58()}}];
  const result=await connection.getProgramAccounts(tokenProgram,{commitment,withContext:true,...(minContextSlot===undefined?{}:{minContextSlot}),filters});
  if(!Number.isSafeInteger(result.context?.slot)||result.context.slot<0||minContextSlot!==undefined&&result.context.slot<minContextSlot)throw new Error('Holder snapshot RPC returned an invalid context slot.');
  const balances=new Map(),seen=new Set(),tokenAccounts=[];for(const{pubkey,account}of result.value){
    const address=pk(pubkey).toBase58();if(seen.has(address))throw new Error('Holder snapshot RPC returned a duplicate token account.');seen.add(address);
    const decoded=unpackAccount(pk(pubkey),account,tokenProgram);
    if(!decoded.mint.equals(mintKey)||account.data[108]>2)throw new Error('Holder snapshot RPC returned an invalid token account.');
    if(!decoded.isInitialized)continue;const owner=decoded.owner.toBase58(),amount=decoded.amount;if(amount>0n)balances.set(owner,(balances.get(owner)||0n)+amount);
    if(includeAccounts)tokenAccounts.push({address,owner,amount,mint:decoded.mint.toBase58(),delegate:decoded.delegate?.toBase58()??null,closeAuthority:decoded.closeAuthority?.toBase58()??null});
  }
  const totalBalance=[...balances.values()].reduce((a,b)=>a+b,0n);
  if(totalBalance>mintInfo.supply)throw new Error('Holder snapshot balances exceed mint supply.');
  return{slot:result.context.slot,mint:mintKey.toBase58(),tokenProgram:tokenProgram.toBase58(),decimals:mintInfo.decimals,supply:mintInfo.supply,balances,totalBalance,...(includeAccounts?{tokenAccounts}:{})};
}
export function apportionHolderRewards(balances,totalAmount){
  const total=BigInt(totalAmount),denominator=[...balances.values()].reduce((a,b)=>a+BigInt(b),0n);if(total<=0n||denominator===0n)throw new Error('Positive funded rewards and holder balances are required.');
  const rows=[...balances].filter(([,balance])=>BigInt(balance)>0n).sort(([a],[b])=>Buffer.compare(pk(a).toBuffer(),pk(b).toBuffer())).map(([wallet,balance],order)=>({wallet,tokenBalance:BigInt(balance),amount:BigInt(balance)*total/denominator,remainder:BigInt(balance)*total%denominator,order}));
  let dust=total-rows.reduce((sum,row)=>sum+row.amount,0n);for(const row of [...rows].sort((a,b)=>a.remainder===b.remainder?a.order-b.order:a.remainder>b.remainder?-1:1)){if(!dust)break;row.amount++;dust--;}
  return rows.filter(row=>row.amount>0n).map(({wallet,tokenBalance,amount})=>({wallet,tokenBalance,amount}));
}
