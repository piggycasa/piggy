import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Keypair, Connection } from '@solana/web3.js';
export const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export const LOCAL=path.join(ROOT,'.openai/local/solana');
export const CONFIG_FILE=path.join(LOCAL,'config.json');
export const RPC_URL='http://127.0.0.1:18899';
export const BRIDGE_PORT=4318;
export const PROGRAM_ROOT=existsSync(path.join(ROOT,'../program/Cargo.toml'))?path.resolve(ROOT,'../program'):existsSync(path.join(ROOT,'../Cargo.toml'))?path.resolve(ROOT,'..'):path.join(ROOT,'.openai/local/github-fork');
export const PROGRAM_SO=path.join(PROGRAM_ROOT,'target/deploy/fomo3d.so');
export function assertLocalRpc(url){const u=new URL(url);if(u.protocol!=='http:'||u.hostname!=='127.0.0.1'||u.port!=='18899')throw new Error('This development harness only permits http://127.0.0.1:18899.');}
export function connection(){assertLocalRpc(RPC_URL);return new Connection(RPC_URL,{commitment:'confirmed',wsEndpoint:'ws://127.0.0.1:18900',confirmTransactionInitialTimeout:20_000});}
export async function localKey(name){if(!/^[a-z0-9_-]+$/.test(name))throw new Error('Invalid local key name');await fs.mkdir(path.join(LOCAL,'wallets'),{recursive:true,mode:0o700});const filename=path.join(LOCAL,'wallets',name+'.json');try{return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(await fs.readFile(filename,'utf8'))));}catch(error){if(error.code!=='ENOENT')throw error;const pair=Keypair.generate();await fs.writeFile(filename,JSON.stringify(Array.from(pair.secretKey)),{flag:'wx',mode:0o600});return pair;}}
export async function readConfig(){return JSON.parse(await fs.readFile(CONFIG_FILE,'utf8'));}
export async function writeConfig(config){await fs.mkdir(LOCAL,{recursive:true,mode:0o700});await fs.writeFile(CONFIG_FILE,JSON.stringify(config,null,2),{mode:0o600});}
export async function waitForRpc(timeout=45_000){const start=Date.now();while(Date.now()-start<timeout){try{return await connection().getGenesisHash();}catch{await new Promise(resolve=>setTimeout(resolve,500));}}throw new Error('Dedicated local validator did not become ready.');}
export async function initializeLocalFiles(){await fs.mkdir(LOCAL,{recursive:true,mode:0o700});const payer=await localKey('payer'),program=await localKey('program');let config;try{config=await readConfig();}catch(error){if(error.code!=='ENOENT')throw error;config={rpcUrl:RPC_URL,bridgePort:BRIDGE_PORT,programId:program.publicKey.toBase58(),payer:payer.publicKey.toBase58(),version:Date.now(),ledger:path.join(LOCAL,'ledger-'+Date.now()),createdAt:new Date().toISOString(),testMint:true};await writeConfig(config);}return{config,payer,program};}
