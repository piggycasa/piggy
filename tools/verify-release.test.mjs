import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {verifyRelease} from './verify-release.mjs';
const loader='BPFLoaderUpgradeab1e11111111111111111111111';
function fixture(change=()=>{}){
 const binary=Buffer.from('complete-test-executable');
 const release={programId:'fixture-program',programData:'11111111111111111111111111111111',genesisHash:'mainnet-fixture',binaryBytes:binary.length,binarySha256:createHash('sha256').update(binary).digest('hex'),observedUpgradeAuthority:null};
 const p=Buffer.alloc(36);p.writeUInt32LE(2);const d=Buffer.alloc(45+binary.length);d.writeUInt32LE(3);d.writeBigUInt64LE(120n,4);binary.copy(d,45);
 const state={release,p,d,slot:123,programOwner:loader,dataOwner:loader};change(state);
 const calls=[];
 const fetcher=async(_,options)=>{const body=JSON.parse(options.body);calls.push(body);return new Response(JSON.stringify({jsonrpc:'2.0',id:body.id,result:body.method==='getGenesisHash'?state.release.genesisHash:{context:{slot:state.slot},value:[{owner:state.programOwner,executable:true,data:[state.p.toString('base64'),'base64']},{owner:state.dataOwner,executable:false,data:[state.d.toString('base64'),'base64']}]}}));};
 return{...state,calls,fetcher};
}
test('checks all executable bytes using only finalized read-only methods',async()=>{const f=fixture(),r=await verifyRelease(f);assert.equal(r.sha256,f.release.binarySha256);assert.equal(r.bytes,f.release.binaryBytes);assert.equal(r.upgradeAuthority,null);assert.equal(r.independentSourceBuildVerified,false);assert.deepEqual(f.calls.map(x=>x.method),['getGenesisHash','getMultipleAccounts']);assert.equal(f.calls[1].params[1].commitment,'finalized');});
test('wrong genesis cannot produce a program match',async()=>{const f=fixture();let calls=0;await assert.rejects(verifyRelease({...f,fetcher:async()=>{calls++;return new Response(JSON.stringify({jsonrpc:'2.0',id:1,result:'other-chain'}));}}),/expected Solana mainnet/);assert.equal(calls,1);});
test('one changed executable byte fails the complete hash comparison',async()=>{const f=fixture(s=>s.d[s.d.length-1]^=1);await assert.rejects(verifyRelease(f),/executable differs/);});
test('malformed loader, pointer, size and finalized context fail closed',async()=>{for(const change of[s=>s.programOwner='wrong-loader',s=>s.p[4]=1,s=>s.d=s.d.subarray(0,s.d.length-1),s=>s.d[12]=9,s=>s.slot=null]){const f=fixture(change);await assert.rejects(verifyRelease(f));}});
test('RPC failure never exposes a private provider URL',async()=>{const f=fixture(),rpcUrl='https://rpc.invalid/?api-key=DO_NOT_LEAK';await assert.rejects(verifyRelease({...f,rpcUrl,fetcher:async()=>{throw new Error(rpcUrl);}}),error=>!error.message.includes('DO_NOT_LEAK')&&/transport failed/.test(error.message));await assert.rejects(verifyRelease({...f,fetcher:async()=>new Response('private upstream body',{status:503})}),/HTTP 503/);});
test('wrong response identity and missing accounts cannot yield a match',async()=>{const f=fixture();await assert.rejects(verifyRelease({...f,fetcher:async()=>new Response(JSON.stringify({jsonrpc:'2.0',id:999,result:'mainnet-fixture'}))}),/invalid/);await assert.rejects(verifyRelease({...f,fetcher:async(_,o)=>{const q=JSON.parse(o.body);return new Response(JSON.stringify({jsonrpc:'2.0',id:q.id,result:q.method==='getGenesisHash'?'mainnet-fixture':{context:{slot:123},value:[null,null]}}));}}),/loader/);});
