/** Read-only serving of the publisher's public export; never exposes operator files. */
import fs from 'node:fs/promises';
import path from 'node:path';
const allowed=/^\/proofs\/(?:index\.json|wallets\/[1-9A-HJ-NP-Za-km-z]{32,44}\.json|epochs\/[1-9]\d{0,19}\.json)$/;
export async function proofResponse({url,method='GET',root}) {
  let pathname;try{pathname=new URL(url,'http://localhost').pathname;}catch{return {status:400,headers:{'content-type':'application/json'},body:'{}'};}
  if(!pathname.startsWith('/proofs/'))return null;
  const headers={'content-type':'application/json','cache-control':'no-store','x-content-type-options':'nosniff'};
  const reply=(status,body)=>({status,headers,body:method==='HEAD'?'':JSON.stringify(body)});
  if(!['GET','HEAD'].includes(method))return reply(405,{error:'Read only'});
  if(!allowed.test(pathname))return reply(404,{error:'Not found'});
  try {
    const base=await fs.realpath(root),file=path.join(base,pathname.slice('/proofs/'.length));
    if(await fs.realpath(file)!==file||!file.startsWith(base+path.sep))return reply(404,{error:'Not found'});
    const stat=await fs.stat(file);if(!stat.isFile()||stat.size>4*1024*1024)return reply(404,{error:'Not found'});
    const bytes=await fs.readFile(file);JSON.parse(bytes.toString());
    return{status:200,headers,body:method==='HEAD'?'':bytes};
  }catch(error){if(['ENOENT','ENOTDIR'].includes(error.code))return reply(404,{error:'Not found'});return reply(503,{error:'Proofs temporarily unavailable'});}
}
