/** Local development signer. Fixture secrets remain in ignored node-only files. */
import http from 'node:http';
import crypto from 'node:crypto';
import { makeContext,getRawState,currentGame,quoteAmount,dispatch } from './localnet-runtime.mjs';
import { serializeChain } from '../src/solana-instructions.mjs';
import { BRIDGE_PORT } from './localnet-common.mjs';
const ctx=await makeContext({persist:true}),nonce=crypto.randomBytes(32).toString('hex');
const allowed=new Set(['http://127.0.0.1:4317','http://localhost:4317']);let queue=Promise.resolve();
function reply(res,status,value){res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(serializeChain(value));}
function queued(operation){const result=queue.then(operation);queue=result.catch(()=>{});return result;}
const server=http.createServer(async(req,res)=>{try{
 if(!['127.0.0.1:'+BRIDGE_PORT,'localhost:'+BRIDGE_PORT].includes(req.headers.host))return reply(res,403,{error:'Invalid local host.'});
 if(req.headers.origin&&!allowed.has(req.headers.origin))return reply(res,403,{error:'Origin is not the local game.'});
 const url=new URL(req.url,'http://127.0.0.1:'+BRIDGE_PORT);
 if(req.method==='GET'&&url.pathname==='/session')return reply(res,200,{csrfToken:nonce,network:'localnet',testMint:true});
 if(req.method==='GET'&&url.pathname==='/health')return reply(res,200,{ready:true,network:'localnet',programId:ctx.programId});
 if(req.method==='GET'&&url.pathname==='/state')return reply(res,200,await queued(()=>getRawState(ctx)));
 if(req.method==='GET'&&url.pathname==='/quote'){const quote=await queued(async()=>{const{round}=await currentGame(ctx);return{amount:quoteAmount(round,Number(url.searchParams.get('count')||1)).toString()};});return reply(res,200,quote);}
 if(req.method!=='POST'||url.pathname!=='/action')return reply(res,404,{error:'Unknown local endpoint.'});
 if(req.headers['x-piggy-csrf']!==nonce)return reply(res,403,{error:'Local session token required.'});
 if(!String(req.headers['content-type']||'').startsWith('application/json'))return reply(res,415,{error:'JSON required.'});
 let body='';for await(const part of req){body+=part;if(body.length>8192)return reply(res,413,{error:'Action too large.'});}const parsed=JSON.parse(body);
 return reply(res,200,await queued(()=>dispatch(ctx,parsed)));
 }catch(error){reply(res,400,{error:error.message});}});
server.listen(BRIDGE_PORT,'127.0.0.1',()=>console.log(JSON.stringify({ready:true,url:'http://127.0.0.1:'+BRIDGE_PORT,network:'localnet',programId:ctx.programId,piggyMint:ctx.piggyMint.toBase58()})));
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>server.close(()=>process.exit(0)));
