import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs/promises';import path from 'node:path';import os from 'node:os';
import {Keypair} from '@solana/web3.js';
import {importMigration,validateMigration,migrationHash} from '../scripts/operator-import.mjs';
import {publicationDomain,eligibleOpeningSnapshot} from '../src/holder-publication.mjs';
import {CLUSTER_GENESIS} from '../src/solana-config.mjs';
function fixture(root){
 const kp=Keypair.generate(),pp=Keypair.generate(),key=()=>Keypair.generate().publicKey.toBase58();
 const config={schemaVersion:1,cluster:'mainnet-beta',genesisHash:CLUSTER_GENESIS['mainnet-beta'],rpcUrl:'https://example.com/',programId:key(),gameVersion:'123',piggyMint:key(),expectedAuthorities:{gameCreator:key(),holderPublisher:pp.publicKey.toBase58(),communityTreasury:key(),upgradeAuthority:key()},programBinarySha256:'a'.repeat(64),programBinaryBytes:123,mainnetEnabled:true};
 const domain=publicationDomain(config),opening=eligibleOpeningSnapshot({slot:100,mint:config.piggyMint,balances:new Map([[key(),2n]])});
 const entries={
 'configs/keeper.active.json':{...config,keeperPublicKey:kp.publicKey.toBase58(),keeperKeypair:path.join(root,'keys/keeper.json'),workspace:path.join(root,'keeper-state'),publisherStateFile:path.join(root,'publisher-state/state.json')},
 'configs/publisher.active.json':{...config,publisherKeypair:path.join(root,'keys/holder-publisher.json'),workspace:path.join(root,'publisher-state'),proofOutput:path.join(root,'public/proofs')},
 'keys/keeper.json':Array.from(kp.secretKey),'keys/holder-publisher.json':Array.from(pp.secretKey),
 'publisher-state/state.json':{...domain,activation:'active',openingSnapshot:opening,preGameAbsenceSlot:101,plans:[],pendingWindow:null},
 'keeper-state/keeper-state.json':{...domain,role:'round-keeper-v1',keeperPublicKey:kp.publicKey.toBase58(),activation:{snapshotSlot:100,snapshotHash:migrationHash(JSON.stringify(opening))},pending:null},
 'public/proofs/index.json':{...domain,epochs:[]},
 'proof-upload-config.json':{siteUrl:'https://example.com',proofDirectory:path.join(root,'public/proofs'),tokenFile:path.join(root,'proof-upload-token')},
 'proof-upload-token':'t'.repeat(64)};
 const files=Object.entries(entries).map(([p,v])=>{const bytes=Buffer.from(typeof v==='string'?v:JSON.stringify(v));return{path:p,sha256:migrationHash(bytes),contentBase64:bytes.toString('base64')};});return reseal({schemaVersion:1,files});
}
function reseal(s){s.id=migrationHash(JSON.stringify(s.files.map(f=>[f.path,f.sha256]).sort((a,b)=>a[0].localeCompare(b[0]))));return s;}
function alter(s,name,fn){const f=s.files.find(f=>f.path===name),value=JSON.parse(Buffer.from(f.contentBase64,'base64'));fn(value);const bytes=Buffer.from(JSON.stringify(value));f.contentBase64=bytes.toString('base64');f.sha256=migrationHash(bytes);return reseal(s);}
test('migration preserves private state, writes marker last and never overwrites a later journal on retry',async()=>{const root=await fs.mkdtemp(path.join(os.tmpdir(),'piggy-import-'));try{const s=fixture(root);const result=await importMigration(s,{root,enabled:'false'});assert.equal(result.ok,true);assert.equal(result.openingSlot,100);assert.equal((await fs.stat(path.join(root,'keys/keeper.json'))).mode&0o777,0o600);const file=path.join(root,'keeper-state/keeper-state.json');await fs.writeFile(file,'newer live journal');assert.equal((await importMigration(s,{root,enabled:'false'})).alreadyImported,true);assert.equal(await fs.readFile(file,'utf8'),'newer live journal');await assert.rejects(importMigration(fixture(root),{root,enabled:'false'}),/different migration/);}finally{await fs.rm(root,{recursive:true,force:true});}});
test('migration rejects enabled service, tampering, path traversal and wrong opening snapshot',async()=>{const root='/tmp/piggy-import-test';await assert.rejects(importMigration(fixture(root),{root,enabled:'true'}),/Disable/);let s=fixture(root);s.files[0].contentBase64=Buffer.from('{}').toString('base64');assert.throws(()=>validateMigration(s,root),/checksum/);s=fixture(root);s.files[0].path='../leak';assert.throws(()=>validateMigration(s,root),/manifest/);s=alter(fixture(root),'keeper-state/keeper-state.json',v=>v.activation.snapshotHash='b'.repeat(64));assert.throws(()=>validateMigration(s,root),/snapshot changed/);});
test('migration refuses in-flight transactions and signing key substitution',()=>{const root='/tmp/piggy-import-test';let s=alter(fixture(root),'keeper-state/keeper-state.json',v=>v.pending={signature:'pending'});assert.throws(()=>validateMigration(s,root),/Reconcile/);s=alter(fixture(root),'keys/keeper.json',v=>v.splice(0,64,...Keypair.generate().secretKey));assert.throws(()=>validateMigration(s,root),/key identity/);});
