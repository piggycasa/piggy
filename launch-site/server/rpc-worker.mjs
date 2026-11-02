/** Public, same-origin Solana RPC adapter. Runtime secrets never enter assets. */
const METHODS = new Set(['getGenesisHash','getLatestBlockhash','getSlot','getBlockHeight','getAccountInfo','getMultipleAccounts','getProgramAccounts','getBalance','getTokenAccountsByOwner','getMinimumBalanceForRentExemption','getFeeForMessage','getSignatureStatuses','simulateTransaction','sendTransaction']);
const KEY=/^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
const SIGNATURE=/^[1-9A-HJ-NP-Za-km-z]{64,88}$/;
const MAX_REQUEST=20_000,MAX_RESPONSE=2_000_000;
const buckets=new Map();
const json=(value,status=200,headers={})=>new Response(JSON.stringify(value),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff',...headers}});
const failure=(id,code,message,status=200)=>json({jsonrpc:'2.0',id:id??null,error:{code,message}},status);
const object=value=>value&&typeof value==='object'&&!Array.isArray(value);
const exact=(value,names)=>object(value)&&Object.keys(value).every(key=>names.includes(key));
const unsigned=value=>Number.isSafeInteger(value)&&value>=0;
function options(value,names=['commitment','minContextSlot','encoding']){return value===undefined||exact(value,names)&&(!('commitment'in value)||['confirmed','finalized'].includes(value.commitment))&&(!('minContextSlot'in value)||unsigned(value.minContextSlot))&&(!('encoding'in value)||value.encoding==='base64');}
function base64(value){if(typeof value!=='string'||value.length>1644||!value.length||! /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(value))return false;try{return atob(value).length<=1232;}catch{return false;}}
function validParams(method,p,programId){
  if(!Array.isArray(p)||p.length>3)return false;
  switch(method){
    case'getGenesisHash':return p.length===0;
    case'getLatestBlockhash':case'getSlot':case'getBlockHeight':return p.length<=1&&options(p[0],['commitment','minContextSlot']);
    case'getAccountInfo':case'getBalance':return p.length>=1&&p.length<=2&&KEY.test(p[0])&&options(p[1]);
    case'getMultipleAccounts':return p.length>=1&&p.length<=2&&Array.isArray(p[0])&&p[0].length>=1&&p[0].length<=100&&p[0].every(key=>typeof key==='string'&&KEY.test(key))&&options(p[1]);
    case'getProgramAccounts':{const c=p[1];return p.length===2&&typeof programId==='string'&&p[0]===programId&&options(c,['commitment','minContextSlot','encoding','filters'])&&Array.isArray(c.filters)&&c.filters.length===2&&c.filters[0]?.dataSize===233&&exact(c.filters[0],['dataSize'])&&exact(c.filters[1],['memcmp'])&&exact(c.filters[1]?.memcmp,['offset','bytes','encoding'])&&c.filters[1].memcmp.offset===1&&(!('encoding'in c.filters[1].memcmp)||c.filters[1].memcmp.encoding==='base58')&&KEY.test(c.filters[1].memcmp.bytes);}
    case'getTokenAccountsByOwner':return p.length===3&&KEY.test(p[0])&&exact(p[1],['mint'])&&KEY.test(p[1].mint)&&options(p[2]);
    case'getMinimumBalanceForRentExemption':return p.length>=1&&p.length<=2&&[81,165,233,403].includes(p[0])&&options(p[1],['commitment']);
    case'getFeeForMessage':return p.length>=1&&p.length<=2&&base64(p[0])&&options(p[1],['commitment']);
    case'getSignatureStatuses':return p.length>=1&&p.length<=2&&Array.isArray(p[0])&&p[0].length>=1&&p[0].length<=16&&p[0].every(sig=>typeof sig==='string'&&SIGNATURE.test(sig))&&(p[1]===undefined||exact(p[1],['searchTransactionHistory'])&&p[1].searchTransactionHistory===true);
    case'simulateTransaction':return p.length===2&&base64(p[0])&&options(p[1],['encoding','commitment','minContextSlot','sigVerify'])&&p[1].encoding==='base64'&&p[1].sigVerify===false;
    case'sendTransaction':return p.length===2&&base64(p[0])&&exact(p[1],['encoding','skipPreflight','preflightCommitment','maxRetries','minContextSlot'])&&p[1].encoding==='base64'&&(!('skipPreflight'in p[1])||p[1].skipPreflight===false)&&p[1].preflightCommitment==='confirmed'&&unsigned(p[1].maxRetries)&&p[1].maxRetries<=3&&(!('minContextSlot'in p[1])||unsigned(p[1].minContextSlot));
    default:return false;
  }
}
async function limitedText(stream,maximum){if(!stream)return'';const reader=stream.getReader();const chunks=[];let total=0;try{while(true){const {value,done}=await reader.read();if(done)break;total+=value.byteLength;if(total>maximum){await reader.cancel();throw new Error('Body too large');}chunks.push(value);}}finally{reader.releaseLock();}const bytes=new Uint8Array(total);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}return new TextDecoder().decode(bytes);}
function takeBudget(request,now){const ip=request.headers.get('cf-connecting-ip');if(!ip)return true;const key=ip.slice(0,64);let bucket=buckets.get(key);if(!bucket||now-bucket.since>=60_000)bucket={since:now,count:0};bucket.count++;buckets.set(key,bucket);if(buckets.size>5000){for(const[k,v]of buckets)if(now-v.since>=60_000)buckets.delete(k);if(buckets.size>5000)buckets.delete(buckets.keys().next().value);}return bucket.count<=1200;}
function upstream(env){if(env.SOLANA_CLUSTER==='testnet')return'https://api.testnet.solana.com';const host=env.SOLANA_CLUSTER==='devnet'?'devnet.helius-rpc.com':env.SOLANA_CLUSTER==='mainnet-beta'?'mainnet.helius-rpc.com':null;if(!host||typeof env.HELIUS_API_KEY!=='string'||env.HELIUS_API_KEY.length<8)return null;return`https://${host}/?api-key=${encodeURIComponent(env.HELIUS_API_KEY)}`;}
export function createWorker({assets={},programId,fetcher=globalThis.fetch,now=Date.now}={}){
  return{async fetch(request,env={}){
    const url=new URL(request.url);
    if(url.pathname.startsWith('/proofs/'))return serveProof(request,env,assets);
    if(url.pathname!=='/rpc')return serveAsset(request,assets);
    if(request.method!=='POST')return failure(null,-32600,'RPC requires POST.',405);
    if(url.search||request.headers.get('origin')!==url.origin||request.headers.get('sec-fetch-site')==='cross-site')return failure(null,-32600,'Same-origin requests only.',403);
    if(!/^application\/json(?:\s*;|$)/i.test(request.headers.get('content-type')||''))return failure(null,-32600,'JSON content type required.',415);
    if(!takeBudget(request,now()))return failure(null,-32005,'RPC request limit reached. Retry shortly.',429);
    if(Number(request.headers.get('content-length')||0)>MAX_REQUEST)return failure(null,-32600,'RPC request is too large.',413);
    let call;try{call=JSON.parse(await limitedText(request.body,MAX_REQUEST));}catch{return failure(null,-32700,'Invalid or oversized JSON request.',400);}
    if(!exact(call,['jsonrpc','id','method','params'])||call.jsonrpc!=='2.0'||!(typeof call.id==='string'&&call.id.length<=100||unsigned(call.id))||!METHODS.has(call.method))return failure(call?.id,-32601,'RPC method is not available.',400);
    if(!validParams(call.method,call.params??[],programId||env.PIGGY_PROGRAM_ID))return failure(call.id,-32602,'RPC parameters are not allowed.',400);
    const target=upstream(env);if(!target)return failure(call.id,-32000,'RPC service is not configured.',503);
    try{
      const response=await fetcher(target,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(call),redirect:'error',signal:AbortSignal.timeout(15_000)});
      if(!response.ok)return failure(call.id,-32000,'RPC provider is temporarily unavailable.',response.status===429?429:502);
      const result=JSON.parse(await limitedText(response.body,MAX_RESPONSE));
      if(!object(result)||result.jsonrpc!=='2.0'||result.id!==call.id||!('result'in result||'error'in result))return failure(call.id,-32000,'Invalid RPC provider response.',502);
      // Upstream errors may include its request URL. Never relay upstream text/data.
      if(result.error)return failure(call.id,Number.isInteger(result.error.code)?result.error.code:-32000,'RPC rejected this request.');
      if(call.method==='getProgramAccounts'&&(!Array.isArray(result.result)||result.result.length>1000))return failure(call.id,-32000,'Wallet history exceeds the supported RPC window.');
      let text=JSON.stringify({jsonrpc:'2.0',id:call.id,result:result.result});
      if(env.HELIUS_API_KEY){text=text.split(env.HELIUS_API_KEY).join('[redacted]').split(encodeURIComponent(env.HELIUS_API_KEY)).join('[redacted]');}
      return new Response(text,{headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'}});
    }catch{return failure(call.id,-32000,'RPC provider is temporarily unavailable.',502);}
  }};
}
const PROOF_PATH=/^\/proofs\/(?:index\.json|wallets\/[1-9A-HJ-NP-Za-km-z]{32,44}\.json|epochs\/[1-9]\d{0,19}\.json)$/;
const PROOF_MAX=4*1024*1024;
function proofDocument(value,path,env){
  const base=['schemaVersion','cluster','genesisHash','programId','gameVersion','piggyMint'];
  if(!object(value)||value.schemaVersion!==1||value.cluster!==env.SOLANA_CLUSTER||value.programId!==env.PIGGY_PROGRAM_ID||!KEY.test(value.genesisHash)||!KEY.test(value.piggyMint)||!/^[1-9]\d{0,19}$/.test(String(value.gameVersion)))return false;
  const positive=value=>typeof value==='string'&&/^[1-9]\d{0,19}$/.test(value)&&BigInt(value)<(1n<<64n);
  const epoch=row=>object(row)&&positive(row.epoch)&&/^[a-f\d]{64}$/i.test(row.root)&&unsigned(row.snapshotSlot)&&positive(String(row.totalAmount));
  if(path==='/proofs/index.json')return exact(value,[...base,'eligibilityPolicy','epochs'])&&Array.isArray(value.epochs)&&value.epochs.length<=1000&&value.epochs.every(row=>exact(row,['epoch','root','snapshotSlot','totalAmount','signature'])&&epoch(row)&&(row.signature===undefined||row.signature===null||SIGNATURE.test(row.signature)));
  if(path.includes('/wallets/'))return exact(value,[...base,'wallet','epochs'])&&path===`/proofs/wallets/${value.wallet}.json`&&Array.isArray(value.epochs)&&value.epochs.length<=1000&&value.epochs.every(row=>exact(row,['epoch','amount','proof'])&&positive(row.epoch)&&positive(row.amount)&&Array.isArray(row.proof)&&row.proof.length<=32&&row.proof.every(item=>/^[a-f\d]{64}$/i.test(item)));
  return exact(value,[...base,'epoch','root','snapshotSlot','totalAmount','signature'])&&path===`/proofs/epochs/${value.epoch}.json`&&epoch(value)&&(value.signature===undefined||value.signature===null||SIGNATURE.test(value.signature));
}
function validUploadToken(request,env){const expected=env.PIGGY_PROOF_UPLOAD_TOKEN,header=request.headers.get('authorization')||'';if(typeof expected!=='string'||!/^[A-Za-z0-9_-]{32,256}$/.test(expected)||header.length!==expected.length+7||!header.startsWith('Bearer '))return false;let difference=0;for(let index=0;index<expected.length;index++)difference|=header.charCodeAt(index+7)^expected.charCodeAt(index);return difference===0;}
const canonical=value=>JSON.stringify(value,(_,item)=>object(item)?Object.fromEntries(Object.keys(item).sort().map(key=>[key,item[key]])):item);
export async function serveProof(request,env,assets={}){
  const url=new URL(request.url),path=url.pathname;
  if(!PROOF_PATH.test(path)||url.search)return json({error:'Unknown proof path.'},404);
  if(['GET','HEAD'].includes(request.method)){
    try{const item=await env.BUCKET?.get(path.slice(1));if(!item)return serveAsset(request,assets);if(item.size>PROOF_MAX)return json({error:'Proof file exceeds the supported size.'},503);return new Response(request.method==='HEAD'?null:item.body,{headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'}});}catch{return json({error:'Proof storage is temporarily unavailable.'},503);}
  }
  if(request.method!=='PUT')return json({error:'Method not allowed.'},405);
  if(!validUploadToken(request,env))return json({error:'Upload is not authorized.'},401);
  if(!env.BUCKET?.put)return json({error:'Proof storage is not configured.'},503);
  if(!/^application\/json(?:\s*;|$)/i.test(request.headers.get('content-type')||''))return json({error:'JSON content type required.'},415);
  if(Number(request.headers.get('content-length')||0)>PROOF_MAX)return json({error:'Proof file is too large.'},413);
  try{const text=await limitedText(request.body,PROOF_MAX),value=JSON.parse(text);if(!proofDocument(value,path,env))return json({error:'Proof document does not match this deployment or path.'},400);const previous=await env.BUCKET.get(path.slice(1));
    if(previous){const old=JSON.parse(await limitedText(previous.body,PROOF_MAX)),fields=['schemaVersion','cluster','genesisHash','programId','gameVersion','piggyMint'];if(fields.some(field=>String(old[field])!==String(value[field])))return json({error:'Existing proof deployment cannot be replaced.'},409);if(path.includes('/epochs/')){if(canonical(old)!==canonical(value))return json({error:'Published epoch metadata is immutable.'},409);}else{const next=new Map(value.epochs.map(row=>[row.epoch,canonical(row)]));if(old.epochs.some(row=>next.get(row.epoch)!==canonical(row)))return json({error:'Published proof entries cannot be removed or changed.'},409);}}
    const onlyIf=new Headers(previous?{'if-match':previous.httpEtag||`"${previous.etag}"`}:{'if-none-match':'*'});
    const stored=await env.BUCKET.put(path.slice(1),JSON.stringify(value),{onlyIf,httpMetadata:{contentType:'application/json; charset=utf-8',cacheControl:'no-store'}});if(!stored)return json({error:'Proof changed concurrently. Retry this upload.'},409);return json({ok:true});}catch{return json({error:'Proof upload failed.'},400);}
}
export function serveAsset(request,assets){const url=new URL(request.url);if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405});const path=url.pathname==='/'?'/index.html':url.pathname;const item=Object.hasOwn(assets,path)?assets[path]:undefined;if(!item)return new Response('Not found',{status:404});const headers={'content-type':item.type,'cache-control':path.startsWith('/assets/')?'public, max-age=31536000, immutable':path.includes('/proofs/')||path.endsWith('.json')?'no-store':'public, max-age=0, must-revalidate','x-content-type-options':'nosniff','referrer-policy':'strict-origin-when-cross-origin',etag:item.etag};if(request.headers.get('if-none-match')===item.etag)return new Response(null,{status:304,headers});if(request.method==='HEAD')return new Response(null,{headers});const bytes=Uint8Array.from(atob(item.base64),char=>char.charCodeAt(0));return new Response(bytes,{headers});}
export default createWorker();
