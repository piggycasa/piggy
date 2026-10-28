import test from 'node:test';
import assert from 'node:assert/strict';
import { publicRpcFetch } from '../scripts/publicnet-common.mjs';

test('public rehearsal retries rate-limited reads with bounded backoff',async()=>{
  const waits=[];let calls=0;
  const result=await publicRpcFetch('https://rpc.invalid',{body:JSON.stringify({method:'getMinimumBalanceForRentExemption'})},{transport:async()=>new Response('',{status:++calls<3?429:200}),wait:async ms=>waits.push(ms)});
  assert.equal(result.status,200);assert.equal(calls,3);assert.deepEqual(waits,[1000,2000]);
});
test('rate-limit retry honors the bounded retry-after header and eventually returns failure',async()=>{
  const waits=[];let calls=0;
  const result=await publicRpcFetch('https://rpc.invalid',{body:JSON.stringify({method:'getAccountInfo'})},{transport:async()=>{calls++;return new Response('',{status:429,headers:{'retry-after':'60'}})},wait:async ms=>waits.push(ms)});
  assert.equal(result.status,429);assert.equal(calls,4);assert.deepEqual(waits,[10000,10000,10000]);
});
test('transport never automatically resubmits a rate-limited transaction or airdrop',async()=>{
  for(const method of['sendTransaction','requestAirdrop']){let calls=0;const result=await publicRpcFetch('https://rpc.invalid',{body:JSON.stringify({method})},{transport:async()=>{calls++;return new Response('',{status:429})},wait:async()=>assert.fail('write retry')});assert.equal(calls,1);assert.equal(result.status,429);}
});
