#!/usr/bin/env node
/** Upload finalized public proof documents; the signer/keypair is never read. */
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {isPrivateHost} from '../src/solana-config.mjs';
const KEY=/^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
const domainFields=['schemaVersion','cluster','genesisHash','programId','gameVersion','piggyMint'];
export async function syncHolderProofs(configFile,{fetcher=globalThis.fetch}={}){
  const filename=path.resolve(configFile),info=await fs.stat(filename);if((info.mode&0o077)!==0)throw new Error('Upload configuration must be private (0600).');
  const config=JSON.parse(await fs.readFile(filename,'utf8')),origin=new URL(config.siteUrl);
  if(origin.protocol!=='https:'||origin.username||origin.password||origin.search||origin.hash||origin.pathname!=='/'||isPrivateHost(origin.hostname))throw new Error('Upload requires the exact public HTTPS Site origin.');
  const root=await fs.realpath(path.resolve(path.dirname(filename),config.proofDirectory)),tokenFile=await fs.realpath(path.resolve(path.dirname(filename),config.tokenFile)),tokenInfo=await fs.stat(tokenFile);
  if((tokenInfo.mode&0o077)!==0||tokenFile===root||tokenFile.startsWith(root+path.sep))throw new Error('Upload token must be private (0600) and outside public proofs.');
  const token=(await fs.readFile(tokenFile,'utf8')).trim();if(!/^[A-Za-z0-9_-]{32,256}$/.test(token))throw new Error('Invalid upload token format.');
  async function read(relative){const candidate=path.join(root,relative),real=await fs.realpath(candidate);if(real!==candidate||!real.startsWith(root+path.sep))throw new Error('Proof symlinks are not allowed.');if((await fs.stat(real)).size>128*1024*1024)throw new Error('Local proof exceeds the upload preparation limit.');return JSON.parse(await fs.readFile(real,'utf8'));}
  const index=await read('index.json');if(index.schemaVersion!==1||!Array.isArray(index.epochs)||index.epochs.length>1000)throw new Error('Invalid proof index.');
  const jobs=[];for(const name of (await fs.readdir(path.join(root,'wallets')).catch(error=>{if(error.code==='ENOENT')return[];throw error;})).sort()){if(!/^[1-9A-HJ-NP-Za-km-z]{32,44}\.json$/.test(name))throw new Error('Unexpected wallet proof file.');jobs.push({relative:'wallets/'+name,value:await read('wallets/'+name)});}
  for(const entry of index.epochs){if(!/^[1-9]\d{0,19}$/.test(entry.epoch))throw new Error('Invalid indexed epoch.');const plan=await read(`epochs/${entry.epoch}.json`);if(plan.status!=='published'||plan.root!==entry.root)throw new Error('Only indexed finalized published epochs may be uploaded.');const summary=Object.fromEntries([...domainFields,'epoch','root','snapshotSlot','totalAmount','signature'].filter(key=>plan[key]!==undefined).map(key=>[key,plan[key]]));jobs.push({relative:`epochs/${entry.epoch}.json`,value:summary});}
  jobs.push({relative:'index.json',value:index});
  const domain=Object.fromEntries(domainFields.map(key=>[key,index[key]]));
  for(const job of jobs){if(domainFields.some(key=>String(job.value[key])!==String(domain[key])))throw new Error('Proof tree contains mixed deployment domains.');const body=JSON.stringify(job.value);if(Buffer.byteLength(body)>4*1024*1024)throw new Error('Public proof document exceeds 4 MiB.');}
  let uploaded=0;
  for(const job of jobs){let response;try{response=await fetcher(new URL('/proofs/'+job.relative,origin),{method:'PUT',headers:{authorization:'Bearer '+token,'content-type':'application/json'},body:JSON.stringify(job.value),redirect:'error',signal:AbortSignal.timeout(30_000)});}catch{throw new Error('Proof upload transport failed. Rerun the same export to resume safely.');}if(!response.ok)throw new Error(`Proof upload rejected (${response.status}); index was not advanced unless it was the final successful upload.`);uploaded++;}
  return{ok:true,uploaded,wallets:jobs.filter(job=>job.relative.startsWith('wallets/')).length,epochs:index.epochs.length};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){try{if(!process.argv[2])throw new Error('Usage: node scripts/sync-holder-proofs.mjs PRIVATE_CONFIG.json');console.log(JSON.stringify(await syncHolderProofs(process.argv[2])));}catch(error){console.error(error.message);process.exitCode=1;}}
