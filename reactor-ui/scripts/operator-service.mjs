#!/usr/bin/env node
/** Single-volume Linux supervisor. The deployment wrapper must hold the kernel flock. */
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';

const CODE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const inside = (root, candidate) => candidate === root || candidate.startsWith(root + path.sep);
const alive = pid => { try { process.kill(pid, 0); return true; } catch (error) { return error.code !== 'ESRCH'; } };
const HEARTBEATS = {
  keeper: new Set(['waiting','celebration','submitted','pending-reconciliation','legacy-settled','quiescent']),
  publisher: new Set(['waiting-for-cadence','waiting-for-funded-threshold','published']),
  proofSync: new Set(['synchronized','changed-during-upload']),
};
export function parseOperatorHeartbeat(role, line) {
  role={legacyKeeper:'keeper',legacyPublisher:'publisher',legacyProofSync:'proofSync'}[role]||role;
  if (typeof line !== 'string' || line.length > 16_384) return null;
  let value; try { value=JSON.parse(line); } catch { return null; }
  if (!value || Array.isArray(value) || !HEARTBEATS[role]?.has(value.status)) return null;
  const safe={status:value.status};
  if (['countdown','celebration'].includes(value.reason)) safe.reason=value.reason;
  if (['wait','start','settle','observe-ended'].includes(value.action)) safe.action=value.action;
  for(const key of ['roundId','epoch','amount','available'])if(typeof value[key]==='string'&&/^\d{1,39}$/.test(value[key]))safe[key]=value[key];
  for(const key of ['seconds','uploaded','wallets','epochs'])if(Number.isSafeInteger(value[key])&&value[key]>=0)safe[key]=value[key];
  return safe;
}

async function privateJson(filename) {
  const stat = await fs.stat(filename);
  if (!stat.isFile() || (stat.mode & 0o077)) throw new Error('Private operator file permissions are invalid.');
  return JSON.parse(await fs.readFile(filename, 'utf8'));
}

async function inspectFiles(dataDir, codeDir, { legacy = false } = {}) {
  const keeperFile = path.join(dataDir, `configs/keeper.${legacy?'legacy':'active'}.json`), publisherFile = path.join(dataDir, `configs/publisher.${legacy?'legacy':'active'}.json`), uploadFile = path.join(dataDir, 'proof-upload-config.json');
  const [keeper, publisher, upload, migration] = await Promise.all([privateJson(keeperFile), privateJson(publisherFile), privateJson(uploadFile), privateJson(path.join(dataDir,'migration.json'))]);
  const resolve = (filename, value) => { if (typeof value !== 'string') throw new Error('Missing operator path.'); const resolved = path.resolve(path.dirname(filename), value); if (!inside(dataDir, resolved)) throw new Error('Operator data path leaves the persistent volume.'); return resolved; };
  if (keeper.cluster !== 'mainnet-beta' || publisher.cluster !== 'mainnet-beta' || keeper.mainnetEnabled !== true || publisher.mainnetEnabled !== true || ['programId','gameVersion','piggyMint','genesisHash'].some(key => String(keeper[key]) !== String(publisher[key]))) throw new Error('Operator configurations do not share the enabled mainnet deployment.');
  if(legacy&&keeper.settleOnly!==true)throw new Error('Legacy keeper must be explicitly settle-only.');
  if (migration.schemaVersion !== 1 || !/^[a-f\d]{64}$/.test(migration.id??'') || !Number.isSafeInteger(migration.openingSlot) || migration.openingSlot < 0 || ['cluster','programId','gameVersion','piggyMint','genesisHash'].some(key=>String(migration.domain?.[key])!==String(keeper[key]))) throw new Error('A completed matching operator migration marker is required.');
  const keeperWorkspace = resolve(keeperFile, keeper.workspace), publisherWorkspace = resolve(publisherFile, publisher.workspace), proofOutput = resolve(publisherFile, publisher.proofOutput);
  const publisherState = resolve(keeperFile, keeper.publisherStateFile), keeperKey = resolve(keeperFile, keeper.keeperKeypair), publisherKey = resolve(publisherFile, publisher.publisherKeypair), tokenFile = resolve(uploadFile, upload.tokenFile);
  if (keeperWorkspace === publisherWorkspace || publisherState !== path.join(publisherWorkspace, 'state.json') || resolve(uploadFile, upload.proofDirectory) !== proofOutput || keeperKey === publisherKey || inside(proofOutput, keeperKey) || inside(proofOutput, publisherKey) || inside(proofOutput, tokenFile)) throw new Error('Operator paths overlap or refer to inconsistent journals.');
  // Presence and permissions only: this supervisor never loads secret key/token contents.
  for (const filename of [keeperKey, publisherKey, tokenFile, publisherState, path.join(keeperWorkspace, 'keeper-state.json')]) {
    const stat = await fs.stat(filename); if (!stat.isFile() || (stat.mode & 0o077) || !inside(dataDir, await fs.realpath(filename))) throw new Error('Required private operator data is missing, exposed or outside its volume.');
  }
  const index = path.join(proofOutput, 'index.json'); if (!inside(dataDir, await fs.realpath(index))) throw new Error('Proof index leaves the operator volume.');
  for (const script of ['round-keeper.mjs','holder-publisher.mjs','watch-holder-proofs.mjs']) await fs.access(path.join(codeDir, 'scripts', script));
  const definitions = [
    { name: 'keeper', args: [path.join(codeDir,'scripts/round-keeper.mjs'),'watch','--config',keeperFile,'--allow-mainnet'], lock: path.join(keeperWorkspace,'publisher.lock') },
    { name: 'publisher', args: [path.join(codeDir,'scripts/holder-publisher.mjs'),'watch','--config',publisherFile,'--allow-mainnet'], lock: path.join(publisherWorkspace,'publisher.lock') },
    { name: 'proofSync', args: [path.join(codeDir,'scripts/watch-holder-proofs.mjs'),'--config',uploadFile,'--interval-seconds','30'], lock: path.join(`${uploadFile}.watch`,'publisher.lock') },
  ];
  if(legacy)for(const definition of definitions)definition.name={keeper:'legacyKeeper',publisher:'legacyPublisher',proofSync:'legacyProofSync'}[definition.name];
  return {definitions,keeper,publisher,upload,resources:await Promise.all([keeperWorkspace,publisherWorkspace,proofOutput].map(value=>fs.realpath(value)))};
}

export async function inspectOperatorDefinitions(dataDir,codeDir,{legacyDataDir=null,combinedRentCapLamports=120_000_000,combinedFeeCapLamports=500_000}={}){
  const primary=await inspectFiles(dataDir,codeDir);
  if(!legacyDataDir)return primary.definitions;
  const legacy=await inspectFiles(legacyDataDir,codeDir,{legacy:true});
  if(legacyDataDir===dataDir||String(primary.keeper.gameVersion)===String(legacy.keeper.gameVersion)||['programId','piggyMint','genesisHash','cluster'].some(key=>primary.keeper[key]!==legacy.keeper[key]))throw new Error('Legacy and current operators must be different games on the same deployment.');
  if(primary.resources.some(a=>legacy.resources.some(b=>inside(a,b)||inside(b,a))))throw new Error('Legacy and current journals or proof directories overlap.');
  if(new URL(primary.upload.siteUrl).origin===new URL(legacy.upload.siteUrl).origin)throw new Error('Legacy and current proof origins must be independent.');
  for(const[field,cap]of[['maxDailyRentLamports',combinedRentCapLamports],['maxDailyFeeLamports',combinedFeeCapLamports]]){
    const values=[primary.keeper[field],legacy.keeper[field]];
    if(!Number.isSafeInteger(cap)||cap<1||values.some(x=>!Number.isSafeInteger(x)||x<1)||values[0]+values[1]>cap)throw new Error('Combined legacy and current keeper budgets exceed the shared cap.');
  }
  return [...primary.definitions,...legacy.definitions];
}

async function clearExitedLock(filename, { isAlive, expectedPid } = {}) {
  let stat, text;
  try { stat = await fs.stat(filename); text = await fs.readFile(filename, 'utf8'); } catch (error) { if (error.code === 'ENOENT') return; throw error; }
  const record = JSON.parse(text);
  if (!Number.isSafeInteger(record.pid) || record.pid < 1 || (expectedPid !== undefined && record.pid !== expectedPid) || isAlive(record.pid)) throw new Error('Operator lock belongs to a live or unverified process.');
  const now = await fs.stat(filename);
  if (now.ino !== stat.ino || now.mtimeMs !== stat.mtimeMs || await fs.readFile(filename,'utf8') !== text) throw new Error('Operator lock changed during recovery.');
  await fs.unlink(filename); // Only process locks, never a journal or pending transaction.
}

export async function startOperatorService({ env = process.env, codeDir = CODE, spawnProcess = spawn, isAlive = alive, log = value => console.error(JSON.stringify(value)), restartBaseMs = 1_000, restartMaxMs = 30_000, shutdownMs = 125_000, heartbeatTtlMs = 180_000 } = {}) {
  const requestedDataDir = path.resolve(env.PIGGY_OPERATOR_DATA_DIR || '/data/piggy');
  const dataDir = await fs.realpath(requestedDataDir).catch(error=>{if(error.code==='ENOENT')return requestedDataDir;throw error;});
  let legacyDataDir=null;
  if(env.PIGGY_OPERATOR_LEGACY_DATA_DIR){if(!path.isAbsolute(env.PIGGY_OPERATOR_LEGACY_DATA_DIR))throw new Error('Legacy operator directory must be absolute.');legacyDataDir=await fs.realpath(env.PIGGY_OPERATOR_LEGACY_DATA_DIR);if(legacyDataDir===dataDir)throw new Error('Legacy operator directory must differ from the current directory.');}
  const enabled = env.PIGGY_OPERATOR_ENABLED === 'true', port = Number(env.PORT || 8080);
  if (!Number.isInteger(port) || port < 0 || port > 65535 || (env.PIGGY_OPERATOR_ENABLED && !['true','false'].includes(env.PIGGY_OPERATOR_ENABLED))) throw new Error('Invalid operator service environment.');
  if (enabled && env.PIGGY_OPERATOR_LOCK_HELD !== '1') throw new Error('Enabled operators require the deployment wrapper kernel lock.');
  if(enabled&&legacyDataDir&&env.PIGGY_OPERATOR_LEGACY_LOCK_HELD!=='1')throw new Error('Legacy operators require their independent deployment wrapper kernel lock.');
  let stopping = false, seeded = false, definitions = [], lastExit = null;
  const roleNames=['keeper','publisher','proofSync',...(legacyDataDir?['legacyKeeper','legacyPublisher','legacyProofSync']:[])];
  const requiredHeartbeats=['keeper','publisher',...(legacyDataDir?['legacyKeeper','legacyPublisher']:[])];
  const roles = new Map(roleNames.map(name => [name,{name,state:enabled?'unseeded':'disabled',child:null,timer:null,failures:0,lastActivityAt:null,lastSuccessAt:null,lastStatus:null}]));
  const status = () => ({ ready: enabled && seeded && [...roles.values()].every(role => role.state === 'running') && requiredHeartbeats.every(name=>{const stamp=roles.get(name).lastSuccessAt;return stamp&&Date.now()-Date.parse(stamp)<=heartbeatTtlMs;}), enabled, roles: Object.fromEntries([...roles].map(([name,role]) => [name,{state:role.state,lastActivityAt:role.lastActivityAt,lastSuccessAt:role.lastSuccessAt,lastStatus:role.lastStatus}])), lastExit });
  const server = http.createServer((req,res) => { if (req.method !== 'GET' || !['/','/health','/ready'].includes(req.url)) { res.writeHead(404); res.end(); return; } const value = status(); res.writeHead(req.url === '/ready' && !value.ready ? 503 : 200,{'content-type':'application/json','cache-control':'no-store'}); res.end(JSON.stringify(value)); });
  await new Promise((resolve,reject) => { server.once('error',reject); server.listen(port,'0.0.0.0',resolve); });
  async function finished(role, child, started, code, signal) {
    if (role.child !== child) return;
    role.child = null; role.state = stopping ? 'stopped' : 'restarting'; lastExit = { role: role.name, code: Number.isInteger(code)?code:null, signal: signal || null, at: new Date().toISOString() };
    log({event:'operator-exit',...lastExit});
    try { await clearExitedLock(role.definition.lock,{isAlive,expectedPid:child.pid}); }
    catch { role.state='blocked'; log({event:'operator-lock-recovery-blocked',role:role.name}); return; }
    if (stopping) return;
    role.failures = Date.now()-started >= 60_000 ? 0 : role.failures+1;
    role.timer = setTimeout(() => launch(role),Math.min(restartMaxMs,restartBaseMs * 2 ** Math.min(role.failures-1,10)));
  }
  function launch(role) {
    if (stopping || role.child) return;
    role.timer = null; const started = Date.now(); let child;
    try { child=spawnProcess(process.execPath,role.definition.args,{cwd:codeDir,env:{...env},stdio:['ignore','pipe','pipe']}); }
    catch { role.failures++; role.state='restarting'; role.timer=setTimeout(()=>launch(role),Math.min(restartMaxMs,restartBaseMs*2**Math.min(role.failures-1,10))); log({event:'operator-spawn-failed',role:role.name}); return; }
    role.child=child; role.state='starting'; role.lastSuccessAt=null; role.lastActivityAt=null; role.lastStatus=null; let done=false,buffer='',discard=false;
    child.stdout?.on('data',chunk=>{
      buffer+=chunk.toString();let newline;
      while((newline=buffer.indexOf('\n'))>=0){const line=buffer.slice(0,newline);buffer=buffer.slice(newline+1);if(!discard&&role.child===child){const safe=parseOperatorHeartbeat(role.name,line);if(safe){role.lastActivityAt=new Date().toISOString();role.lastStatus=safe;const kind={legacyKeeper:'keeper',legacyPublisher:'publisher',legacyProofSync:'proofSync'}[role.name]||role.name;const success=kind==='publisher'||kind==='keeper'&&safe.status!=='pending-reconciliation'||kind==='proofSync'&&safe.status==='synchronized';if(success)role.lastSuccessAt=role.lastActivityAt;}}discard=false;}
      if(buffer.length>16_384){buffer='';discard=true;}
    });
    child.stderr?.on('data',()=>{}); // Never forward private provider errors to hosted logs.
    child.once('spawn',()=>{if(role.child===child)role.state='running';});
    const finish=(code,signal)=>{if(done)return;done=true;void finished(role,child,started,code,signal);};
    child.once('error',()=>finish(null,'SPAWN_ERROR')); child.once('exit',finish);
  }
  try {
    definitions=await inspectOperatorDefinitions(dataDir,codeDir,{legacyDataDir}); seeded=true;
    if (enabled) {
      // The external kernel lock excludes another supervisor on this volume.
      // A still-live PID fails closed, protecting orphaned children after a crash.
      for (const definition of definitions) await clearExitedLock(definition.lock,{isAlive});
      for (const definition of definitions) { const role=roles.get(definition.name);role.definition=definition;launch(role); }
    }
  } catch { seeded=false; for(const role of roles.values())if(!role.child)role.state=enabled?'blocked':'unseeded'; log({event:'operator-data-not-ready',enabled}); }
  let stopPromise;
  function stop() {
    if (stopPromise) return stopPromise;
    stopping=true;
    stopPromise=(async()=>{
      for(const role of roles.values()){clearTimeout(role.timer);role.timer=null;try{role.child?.kill('SIGTERM');}catch{}}
      const deadline=Date.now()+shutdownMs;
      while([...roles.values()].some(role=>role.child)&&Date.now()<deadline)await delay(25);
      for(const role of roles.values())try{role.child?.kill('SIGKILL');}catch{}
      const killDeadline=Date.now()+2_000;while([...roles.values()].some(role=>role.child)&&Date.now()<killDeadline)await delay(25);
      await new Promise(resolve=>{server.close(resolve);server.closeAllConnections();});
    })();
    return stopPromise;
  }
  return { status, stop, url:`http://127.0.0.1:${server.address().port}`, dataDir };
}

async function main() {
  const service=await startOperatorService(); let stopping=false;
  const stop=()=>{if(stopping)return;stopping=true;void service.stop().then(()=>{process.exitCode=0;});};
  process.once('SIGTERM',stop);process.once('SIGINT',stop);
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main().catch(()=>{console.error('Operator service startup failed; check its private configuration and kernel lock.');process.exitCode=1;});
