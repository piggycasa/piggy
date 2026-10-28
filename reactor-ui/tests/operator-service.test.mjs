import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { EventEmitter } from 'node:events';
import { setTimeout as delay } from 'node:timers/promises';
import { startOperatorService,parseOperatorHeartbeat } from '../scripts/operator-service.mjs';

async function fixture(t) {
  const dataDir=await fs.mkdtemp(path.join(os.tmpdir(),'piggy-service-'));t.after(()=>fs.rm(dataDir,{recursive:true,force:true}));
  const write=async(name,value)=>{const file=path.join(dataDir,name);await fs.mkdir(path.dirname(file),{recursive:true});await fs.writeFile(file,typeof value==='string'?value:JSON.stringify(value),{mode:0o600});return file;};
  const common={cluster:'mainnet-beta',mainnetEnabled:true,programId:'program',gameVersion:'1',piggyMint:'mint',genesisHash:'genesis'};
  await write('configs/keeper.active.json',{...common,workspace:'../keeper-state',publisherStateFile:'../publisher-state/state.json',keeperKeypair:'../keys/keeper.json'});
  await write('configs/publisher.active.json',{...common,workspace:'../publisher-state',publisherKeypair:'../keys/publisher.json',proofOutput:'../public/proofs'});
  await write('proof-upload-config.json',{siteUrl:'https://piggy.example',proofDirectory:'public/proofs',tokenFile:'upload-token'});
  await write('migration.json',{schemaVersion:1,id:'a'.repeat(64),domain:common,openingSlot:1});
  for(const file of ['keys/keeper.json','keys/publisher.json','upload-token'])await write(file,'SUPERVISOR_MUST_NOT_READ_SECRET_CONTENT');
  for(const file of ['keeper-state/keeper-state.json','publisher-state/state.json','public/proofs/index.json'])await write(file,{preserve:true});
  const children=[],spawnCalls=[];let pid=70000;
  const spawnProcess=(file,args,options)=>{const child=new EventEmitter();child.pid=++pid;child.stdout=new EventEmitter();child.stderr=new EventEmitter();child.kills=[];child.kill=signal=>{child.kills.push(signal);queueMicrotask(()=>child.emit('exit',0,signal));return true;};children.push(child);spawnCalls.push({file,args,options});queueMicrotask(()=>child.emit('spawn'));return child;};
  const env={PIGGY_OPERATOR_DATA_DIR:dataDir,PIGGY_OPERATOR_ENABLED:'true',PIGGY_OPERATOR_LOCK_HELD:'1',PORT:'0'};
  return {dataDir,write,env,spawnProcess,spawnCalls,children};
}

test('disabled unseeded mode serves safe health without starting signers or writing seed files',async t=>{
  const dataDir=path.join(os.tmpdir(),`unseeded-${process.pid}-${Date.now()}`);let calls=0;
  const service=await startOperatorService({env:{PIGGY_OPERATOR_DATA_DIR:dataDir,PORT:'0'},spawnProcess:()=>{calls++;throw new Error('must not spawn');},log:()=>{}});t.after(()=>service.stop());
  const response=await fetch(`${service.url}/health`),body=await response.json();assert.equal(response.status,200);assert.equal(body.ready,false);assert.equal(body.enabled,false);assert.equal(calls,0);assert.deepEqual(Object.keys(body),['ready','enabled','roles','lastExit']);await assert.rejects(fs.access(dataDir));
});

test('enabled mode requires inherited kernel-lock gate before launching any role',async t=>{
  const f=await fixture(t);delete f.env.PIGGY_OPERATOR_LOCK_HELD;
  await assert.rejects(startOperatorService({...f,log:()=>{}}),/kernel lock/);assert.equal(f.spawnCalls.length,0);
});

test('enabled startup waits for a matching completed migration marker',async t=>{
  const f=await fixture(t);await fs.unlink(path.join(f.dataDir,'migration.json'));
  const service=await startOperatorService({...f,isAlive:()=>false,log:()=>{}});t.after(()=>service.stop());
  assert.equal(service.status().ready,false);assert.equal(f.spawnCalls.length,0);assert.equal(service.status().roles.keeper.state,'blocked');
});

test('dead startup locks recover under kernel gate; exact watch commands share persistent data and stop gracefully',async t=>{
  const f=await fixture(t);for(const name of ['keeper-state/publisher.lock','publisher-state/publisher.lock','proof-upload-config.json.watch/publisher.lock'])await f.write(name,{pid:60000});
  const before=await fs.readFile(path.join(f.dataDir,'publisher-state/state.json'),'utf8');
  const service=await startOperatorService({...f,isAlive:()=>false,log:()=>{}});t.after(()=>service.stop());await delay(1);
  assert.equal(service.status().ready,false);assert.equal(f.spawnCalls.length,3);
  f.children[0].stdout.emit('data',Buffer.from('{"status":"waiting","reason":"countdown","seconds":100}\n'));
  f.children[1].stdout.emit('data',Buffer.from('{"status":"waiting-for-funded-threshold","available":"0"}\n'));
  assert.equal(service.status().ready,true);
  for(const call of f.spawnCalls)assert.equal(call.file,process.execPath);
  assert.ok(f.spawnCalls[0].args.includes('--allow-mainnet'));assert.ok(f.spawnCalls[1].args.includes('--allow-mainnet'));assert.deepEqual(f.spawnCalls[2].args.slice(-2),['--interval-seconds','30']);
  assert.equal(await fs.readFile(path.join(f.dataDir,'publisher-state/state.json'),'utf8'),before);
  await service.stop();for(const child of f.children)assert.deepEqual(child.kills,['SIGTERM']);
});

test('a live startup lock blocks all roles and is never silently removed',async t=>{
  const f=await fixture(t),filename=await f.write('keeper-state/publisher.lock',{pid:60000});
  const service=await startOperatorService({...f,isAlive:pid=>pid===60000,log:()=>{}});t.after(()=>service.stop());
  assert.equal(service.status().ready,false);assert.equal(f.spawnCalls.length,0);assert.equal(JSON.parse(await fs.readFile(filename)).pid,60000);
});

test('transient exit restarts with bounded backoff and removes only its own dead lock',async t=>{
  const f=await fixture(t);const service=await startOperatorService({...f,isAlive:()=>false,restartBaseMs:10,restartMaxMs:20,log:()=>{}});t.after(()=>service.stop());await delay(1);
  const child=f.children[0],filename=await f.write('keeper-state/publisher.lock',{pid:child.pid});child.emit('exit',1,null);await delay(35);
  assert.equal(f.spawnCalls.length,4);await assert.rejects(fs.access(filename));assert.equal(service.status().lastExit.role,'keeper');
  const replacement=f.children[3];await f.write('keeper-state/publisher.lock',{pid:99999});replacement.emit('exit',1,null);await delay(35);
  assert.equal(f.spawnCalls.length,4);assert.equal(service.status().roles.keeper.state,'blocked');assert.equal(JSON.parse(await fs.readFile(filename)).pid,99999);
});

test('shutdown escalates a nonresponsive child after its bounded drain window',async t=>{
  const f=await fixture(t);const service=await startOperatorService({...f,isAlive:()=>false,shutdownMs:5,log:()=>{}});t.after(()=>service.stop());await delay(1);
  const child=f.children[0];child.kill=signal=>{child.kills.push(signal);if(signal==='SIGKILL')queueMicrotask(()=>child.emit('exit',0,signal));return true;};
  await service.stop();assert.deepEqual(child.kills,['SIGTERM','SIGKILL']);assert.equal(service.status().ready,false);
});

test('heartbeats accept complete known JSON only and never expose arbitrary fields or raw errors',async t=>{
  assert.deepEqual(parseOperatorHeartbeat('keeper','{"status":"waiting","reason":"countdown","seconds":25,"warning":"SECRET","nested":{"token":"SECRET"}}'),{status:'waiting',reason:'countdown',seconds:25});
  assert.equal(parseOperatorHeartbeat('keeper','SECRET raw provider error'),null);
  assert.equal(parseOperatorHeartbeat('publisher','{"status":"waiting","reason":"SECRET"}'),null);
  const f=await fixture(t),service=await startOperatorService({...f,isAlive:()=>false,log:()=>{}});t.after(()=>service.stop());await delay(1);
  f.children[0].stdout.emit('data',Buffer.from('{"status":"waiting","reason":"count'));
  assert.equal(service.status().roles.keeper.lastActivityAt,null);
  f.children[0].stdout.emit('data',Buffer.from('down","seconds":25,"error":"SECRET"}\n'));
  f.children[1].stdout.emit('data',Buffer.from('{"status":"waiting-for-cadence"}\n'));
  assert.equal(service.status().ready,true);assert.equal(JSON.stringify(service.status()).includes('SECRET'),false);
  assert.equal(service.status().roles.proofSync.lastSuccessAt,null);
});
