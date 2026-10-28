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

async function legacyPair(t){
  const f=await fixture(t),old=await fixture(t);
  const change=async(root,name,update)=>{const file=path.join(root,name),value=JSON.parse(await fs.readFile(file,'utf8'));update(value);await fs.writeFile(file,JSON.stringify(value),{mode:0o600});};
  await change(f.dataDir,'configs/keeper.active.json',v=>{v.maxDailyRentLamports=107442240;v.maxDailyFeeLamports=470000;});
  for(const name of ['configs/keeper.active.json','configs/publisher.active.json'])await change(old.dataDir,name,v=>{v.gameVersion='2';if(name.includes('keeper')){v.settleOnly=true;v.maxDailyRentLamports=12557760;v.maxDailyFeeLamports=30000;}});
  await change(old.dataDir,'migration.json',v=>{v.domain.gameVersion='2';});
  await change(old.dataDir,'proof-upload-config.json',v=>{v.siteUrl='https://legacy-piggy.example';});
  for(const role of ['keeper','publisher'])await fs.copyFile(path.join(old.dataDir,`configs/${role}.active.json`),path.join(old.dataDir,`configs/${role}.legacy.json`));
  // The production fresh instance is a child of the old mounted data root.
  const nested=path.join(old.dataDir,'instances/new');await fs.mkdir(path.dirname(nested),{recursive:true});await fs.rename(f.dataDir,nested);f.dataDir=nested;f.env.PIGGY_OPERATOR_DATA_DIR=nested;
  f.env.PIGGY_OPERATOR_LEGACY_DATA_DIR=old.dataDir;f.env.PIGGY_OPERATOR_LEGACY_LOCK_HELD='1';
  const edit=async(root,name,update)=>{await change(root,name,update);if(root===old.dataDir&&name.endsWith('.active.json'))await fs.copyFile(path.join(root,name),path.join(root,name.replace('.active.json','.legacy.json')));};
  return{...f,legacyDir:old.dataDir,change:edit};
}

test('optional legacy roles supervise an independent game and accept terminal keeper quiescence',async t=>{
  const f=await legacyPair(t),service=await startOperatorService({...f,isAlive:()=>false,log:()=>{}});t.after(()=>service.stop());await delay(1);
  assert.equal(f.spawnCalls.length,6);assert.deepEqual(Object.keys(service.status().roles),['keeper','publisher','proofSync','legacyKeeper','legacyPublisher','legacyProofSync']);
  assert.equal(f.spawnCalls[0].args.includes(path.join(await fs.realpath(f.dataDir),'configs/keeper.active.json')),true);assert.equal(f.spawnCalls[3].args.includes(path.join(await fs.realpath(f.legacyDir),'configs/keeper.legacy.json')),true);
  for(const[i,value]of[[0,{status:'waiting',reason:'countdown'}],[1,{status:'waiting-for-cadence'}],[3,{status:'legacy-settled',roundId:'3'}],[4,{status:'waiting-for-funded-threshold',available:'0'}]])f.children[i].stdout.emit('data',Buffer.from(JSON.stringify(value)+'\n'));
  assert.equal(service.status().ready,true);assert.equal(service.status().roles.legacyKeeper.lastStatus.status,'legacy-settled');await delay(10);assert.equal(f.spawnCalls.length,6);
  await service.stop();for(const child of f.children)assert.deepEqual(child.kills,['SIGTERM']);
});

test('legacy startup requires both kernel locks and never starts a partial role set',async t=>{
  const f=await legacyPair(t);delete f.env.PIGGY_OPERATOR_LEGACY_LOCK_HELD;await assert.rejects(startOperatorService({...f,log:()=>{}}),/independent.*kernel lock/);assert.equal(f.spawnCalls.length,0);
});

test('legacy normal-rollover, mixed domains, same proof origin and doubled budgets fail before spawning',async t=>{
  for(const mutate of[
    f=>f.change(f.legacyDir,'configs/keeper.active.json',v=>{v.settleOnly=false;}),
    async f=>{for(const name of ['configs/keeper.active.json','configs/publisher.active.json'])await f.change(f.legacyDir,name,v=>{v.gameVersion='1';});await f.change(f.legacyDir,'migration.json',v=>{v.domain.gameVersion='1';});},
    async f=>{for(const name of ['configs/keeper.active.json','configs/publisher.active.json'])await f.change(f.legacyDir,name,v=>{v.piggyMint='other-mint';});await f.change(f.legacyDir,'migration.json',v=>{v.domain.piggyMint='other-mint';});},
    f=>f.change(f.legacyDir,'proof-upload-config.json',v=>{v.siteUrl='https://piggy.example';}),
    f=>f.change(f.legacyDir,'configs/keeper.active.json',v=>{v.maxDailyRentLamports=120000000;}),
    f=>f.change(f.legacyDir,'configs/keeper.active.json',v=>{v.maxDailyFeeLamports=500000;}),
  ]){const f=await legacyPair(t);await mutate(f);const service=await startOperatorService({...f,isAlive:()=>false,log:()=>{}});assert.equal(service.status().ready,false);assert.equal(f.spawnCalls.length,0);await service.stop();}
});

test('a legacy alias of the new keeper journal is rejected even under a shared parent volume',async t=>{
  const f=await legacyPair(t);await f.change(f.legacyDir,'configs/keeper.active.json',v=>{v.workspace=path.join(f.dataDir,'keeper-state');});
  const service=await startOperatorService({...f,isAlive:()=>false,log:()=>{}});t.after(()=>service.stop());assert.equal(service.status().ready,false);assert.equal(f.spawnCalls.length,0);
});

test('legacy heartbeat filtering keeps terminal status but strips private fields',()=>{
  assert.deepEqual(parseOperatorHeartbeat('legacyKeeper','{"status":"quiescent","roundId":"0","private":"SECRET"}'),{status:'quiescent',roundId:'0'});
  assert.deepEqual(parseOperatorHeartbeat('legacyPublisher','{"status":"published","epoch":"4","rpc":"SECRET"}'),{status:'published',epoch:'4'});
  assert.equal(parseOperatorHeartbeat('legacyProofSync','{"status":"unknown","secret":"SECRET"}'),null);
});
