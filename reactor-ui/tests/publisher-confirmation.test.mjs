import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { confirmPublisherTransactionByPolling,checkpointFinalizedSlot } from '../scripts/holder-publisher.mjs';

test('HTTP finality returns the actual finalized slot and advances the durable read floor',async t=>{
  const signature='reviewed-publisher-signature',calls=[];
  const connection={getSignatureStatuses:async(signatures,options)=>{calls.push([signatures,options]);return {context:{slot:999},value:[{confirmationStatus:'finalized',slot:207,err:null}]};},confirmTransaction:()=>{throw new Error('WebSocket confirmation must not be used');}};
  const result=await confirmPublisherTransactionByPolling(connection,{signature,lastValidBlockHeight:123},{timeoutMs:100,pollMs:1});
  assert.deepEqual(result,{context:{slot:207},value:{err:null}});assert.deepEqual(calls,[[[signature],{searchTransactionHistory:true}]]);
  const directory=await fs.mkdtemp(path.join(os.tmpdir(),'publisher-finality-'));t.after(()=>fs.rm(directory,{recursive:true,force:true}));
  const ctx={minContextSlot:200,stateFile:path.join(directory,'state.json'),journal:{minContextSlot:200}};
  await checkpointFinalizedSlot(ctx,result.context.slot);assert.equal(ctx.minContextSlot,207);assert.equal(JSON.parse(await fs.readFile(ctx.stateFile,'utf8')).minContextSlot,207);
});

test('expiry requires absent history and finalized block height strictly above last-valid height',async()=>{
  const signature='expired-publisher-signature';let polls=0;
  const connection={getSignatureStatuses:async()=>({value:[null]}),getBlockHeight:async commitment=>{assert.equal(commitment,'finalized');return ++polls===1?100:101;}};
  await assert.rejects(confirmPublisherTransactionByPolling(connection,{signature,lastValidBlockHeight:100},{timeoutMs:100,pollMs:1}),error=>error.code==='PUBLISHER_TRANSACTION_EXPIRED'&&error.signature===signature);
  assert.equal(polls,2);
});

test('processed or confirmed errors are not terminal until finalized; timeout remains ambiguous',async()=>{
  let polls=0;
  const connection={getSignatureStatuses:async()=>({value:[{confirmationStatus:['processed','confirmed','finalized'][Math.min(polls++,2)],slot:55,err:{InstructionError:[0,'Custom']}}]}),getBlockHeight:()=>{throw new Error('Present signatures cannot expire through height');}};
  const result=await confirmPublisherTransactionByPolling(connection,{signature:'forkable-error',lastValidBlockHeight:0},{timeoutMs:100,pollMs:1});assert.equal(polls,3);assert.deepEqual(result.value.err,{InstructionError:[0,'Custom']});
  await assert.rejects(confirmPublisherTransactionByPolling({getSignatureStatuses:async()=>({value:[{confirmationStatus:'processed',slot:55,err:{InstructionError:[0,'Custom']}}]})},{signature:'still-ambiguous',lastValidBlockHeight:0},{timeoutMs:5,pollMs:1}),error=>error.code==='PUBLISHER_CONFIRMATION_AMBIGUOUS'&&error.signature==='still-ambiguous');
  await assert.rejects(confirmPublisherTransactionByPolling({getSignatureStatuses:()=>new Promise(()=>{})},{signature:'http-hung',lastValidBlockHeight:0},{timeoutMs:5,pollMs:1}),error=>error.code==='PUBLISHER_CONFIRMATION_AMBIGUOUS'&&error.signature==='http-hung');
});
