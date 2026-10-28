#!/usr/bin/env node
/** Read-only: two finalized RPC reads, no wallet, signer, deployment or transaction. */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const loader='BPFLoaderUpgradeab1e11111111111111111111111';
const alphabet='123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const base58=bytes=>{let n=BigInt('0x'+Buffer.from(bytes).toString('hex')),out='';while(n){out=alphabet[Number(n%58n)]+out;n/=58n;}for(const byte of bytes){if(byte!==0)break;out='1'+out;}return out;};

export async function verifyRelease({release,rpcUrl='https://api.mainnet-beta.solana.com',fetcher=globalThis.fetch}){
 const endpoint=new URL(rpcUrl);
 if(endpoint.protocol!=='https:'||endpoint.username||endpoint.password)throw new Error('Use an HTTPS Solana RPC without embedded login credentials.');
 if(!Number.isSafeInteger(release.binaryBytes)||release.binaryBytes<1||!/^[a-f0-9]{64}$/.test(release.binarySha256))throw new Error('Invalid release manifest.');
 let id=0;
 async function rpc(method,params=[]){
  let response;
  try{response=await fetcher(endpoint,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:++id,method,params}),signal:AbortSignal.timeout(20000)});}catch{throw new Error('RPC transport failed; no verification result is available.');}
  if(!response.ok)throw new Error(`RPC returned HTTP ${response.status}.`);
  let body;try{body=await response.json();}catch{throw new Error('RPC response was not valid JSON.');}
  if(body.error||body.id!==id||body.jsonrpc!=='2.0')throw new Error('RPC result was unavailable or invalid.');return body.result;
 }
 if(await rpc('getGenesisHash')!==release.genesisHash)throw new Error('RPC is not the expected Solana mainnet.');
 const result=await rpc('getMultipleAccounts',[[release.programId,release.programData],{encoding:'base64',commitment:'finalized'}]);
 if(!Number.isSafeInteger(result?.context?.slot)||!Array.isArray(result.value)||result.value.length!==2)throw new Error('Finalized accounts are missing.');
 const [program,data]=result.value;
 const bytes=account=>{if(account?.owner!==loader||!Array.isArray(account.data)||account.data[1]!=='base64'||typeof account.data[0]!=='string'||account.data[0].length>1000000)throw new Error('Unexpected loader or account encoding.');return Buffer.from(account.data[0],'base64');};
 const p=bytes(program),d=bytes(data);
 if(!program.executable||p.length!==36||p.readUInt32LE(0)!==2||base58(p.subarray(4))!==release.programData)throw new Error('Program data pointer differs from the release.');
 if(data.executable||d.length!==release.binaryBytes+45||d.readUInt32LE(0)!==3||![0,1].includes(d[12]))throw new Error('ProgramData layout or size differs from the release.');
 const executable=d.subarray(45),sha256=createHash('sha256').update(executable).digest('hex');
 if(sha256!==release.binarySha256)throw new Error('The deployed executable differs from the recorded release.');
 const upgradeAuthority=d[12]===1?base58(d.subarray(13,45)):null;
 return{matches:true,programId:release.programId,finalizedSlot:result.context.slot,deploymentSlot:d.readBigUInt64LE(4).toString(),bytes:executable.length,sha256,upgradeAuthority,authorityMatchesObservation:upgradeAuthority===release.observedUpgradeAuthority,independentSourceBuildVerified:false};
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{
  const args=process.argv.slice(2);
  if(args.length===1&&args[0]==='--help'){console.log('Usage: node tools/verify-release.mjs [--rpc HTTPS_MAINNET_RPC_URL]\nSOLANA_RPC_URL is also supported. Read-only; no wallet or signing.');process.exit(0);}
  if(args.length!==0&&(args.length!==2||args[0]!=='--rpc'))throw new Error('Use --rpc HTTPS_MAINNET_RPC_URL or SOLANA_RPC_URL.');
  const release=JSON.parse(await fs.readFile(new URL('../verification/release.json',import.meta.url),'utf8'));
  console.log(JSON.stringify(await verifyRelease({release,rpcUrl:args[1]||process.env.SOLANA_RPC_URL||'https://api.mainnet-beta.solana.com'}),null,2));
 }catch(error){console.error(error instanceof Error?error.message:'Read-only verification failed.');process.exitCode=1;}
}
