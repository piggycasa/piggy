/** Prepare the stopped Mac's private operator state. Never include in an image. */
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {migrationHash,validateMigration} from './operator-import.mjs';
import {durableJson} from './holder-publisher.mjs';
export async function prepareOperatorMigration(source,target='/data/piggy'){
  source=path.resolve(source);target=path.resolve(target);
  for(const name of ['publisher-state/publisher.lock','keeper-state/publisher.lock','proof-upload-config.json.watch/publisher.lock']){try{await fs.access(path.join(source,name));throw new Error('An operator lock remains; stop and verify every Mac operator before exporting.');}catch(error){if(error.code!=='ENOENT')throw error;}}
  const files=[],add=(name,bytes)=>files.push({path:name,sha256:migrationHash(bytes),contentBase64:Buffer.from(bytes).toString('base64')});
  for(const role of ['keeper','publisher']){const raw=JSON.parse(await fs.readFile(path.join(source,'configs',role+'.active.json'),'utf8'));if(role==='keeper'){raw.keeperKeypair=path.join(target,'keys/keeper.json');raw.workspace=path.join(target,'keeper-state');raw.publisherStateFile=path.join(target,'publisher-state/state.json');}else{raw.publisherKeypair=path.join(target,'keys/holder-publisher.json');raw.workspace=path.join(target,'publisher-state');raw.proofOutput=path.join(target,'public/proofs');}add('configs/'+role+'.active.json',Buffer.from(JSON.stringify(raw)));}
  const upload=JSON.parse(await fs.readFile(path.join(source,'proof-upload-config.json'),'utf8'));upload.proofDirectory=path.join(target,'public/proofs');upload.tokenFile=path.join(target,'proof-upload-token');add('proof-upload-config.json',Buffer.from(JSON.stringify(upload)));
  for(const name of ['keys/keeper.json','keys/holder-publisher.json','publisher-state/state.json','keeper-state/keeper-state.json','proof-upload-token'])add(name,await fs.readFile(path.join(source,name)));
  async function walk(relative){for(const entry of await fs.readdir(path.join(source,relative),{withFileTypes:true})){if(entry.isSymbolicLink())throw new Error('Proof symlinks cannot be migrated.');const name=relative+'/'+entry.name;if(entry.isDirectory())await walk(name);else if(entry.isFile())add(name,await fs.readFile(path.join(source,name)));}}await walk('public/proofs');
  const id=migrationHash(JSON.stringify(files.map(f=>[f.path,f.sha256]).sort((a,b)=>a[0].localeCompare(b[0]))));const snapshot={schemaVersion:1,id,createdAt:new Date().toISOString(),files};validateMigration(snapshot,target);return snapshot;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){try{const[source,output]=process.argv.slice(2);if(!source||!output)throw new Error('Usage: prepare-operator-migration.mjs STOPPED_RUNTIME PRIVATE_OUTPUT.json');const snapshot=await prepareOperatorMigration(source);await durableJson(path.resolve(output),snapshot);console.log(JSON.stringify({ok:true,id:snapshot.id,files:snapshot.files.length,output:path.resolve(output)}));}catch(error){console.error(error.message);process.exitCode=1;}}
