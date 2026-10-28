/** One-time private state import. Run by SSH on a disabled operator instance. */
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {Keypair} from '@solana/web3.js';
import {validateKeeperConfig} from './round-keeper.mjs';
import {publicationDomain, assertPublicationDomain, validatePublicationJournal, eligibleOpeningSnapshot} from '../src/holder-publication.mjs';
import {durableJson} from './holder-publisher.mjs';

export const migrationHash=value=>createHash('sha256').update(value).digest('hex');
const required=['configs/keeper.active.json','configs/publisher.active.json','keys/keeper.json','keys/holder-publisher.json','keeper-state/keeper-state.json','publisher-state/state.json','public/proofs/index.json','proof-upload-config.json','proof-upload-token'];
const allowed=name=>required.includes(name)||/^public\/proofs\/(wallets\/[1-9A-HJ-NP-Za-km-z]{32,44}|epochs\/[1-9]\d*)\.json$/.test(name);
export function validateMigration(snapshot,root){
  if(snapshot?.schemaVersion!==1||!Array.isArray(snapshot.files)||snapshot.files.length>100000||snapshot.files.some(f=>!allowed(f.path))||new Set(snapshot.files.map(f=>f.path)).size!==snapshot.files.length)throw new Error('Invalid operator migration manifest.');
  const files=new Map();let size=0;
  for(const f of snapshot.files){const bytes=Buffer.from(f.contentBase64,'base64');size+=bytes.length;if(size>64*1024*1024||migrationHash(bytes)!==f.sha256)throw new Error('Migration size or checksum mismatch.');files.set(f.path,bytes);}
  for(const name of required)if(!files.has(name))throw new Error('Missing required operator migration file.');
  const json=name=>JSON.parse(files.get(name).toString()),keeper=json('configs/keeper.active.json'),publisher=json('configs/publisher.active.json'),journal=json('publisher-state/state.json'),storedKeeper=json('keeper-state/keeper-state.json'),upload=json('proof-upload-config.json');
  const domain=publicationDomain(keeper);if(domain.cluster!=='mainnet-beta')throw new Error('This migration requires the live mainnet domain.');assertPublicationDomain(publisher,domain);assertPublicationDomain(journal,domain);assertPublicationDomain(storedKeeper,domain);assertPublicationDomain(json('public/proofs/index.json'),domain);validatePublicationJournal(journal,domain);validateKeeperConfig(keeper,{base:root});
  const destinations={'keeperKeypair':'keys/keeper.json','workspace':'keeper-state','publisherStateFile':'publisher-state/state.json'};
  for(const[k,v]of Object.entries(destinations))if(path.resolve(root,keeper[k])!==path.join(root,v))throw new Error('Keeper migration paths must stay inside the data volume.');
  for(const[k,v]of Object.entries({publisherKeypair:'keys/holder-publisher.json',workspace:'publisher-state',proofOutput:'public/proofs'}))if(path.resolve(root,publisher[k])!==path.join(root,v))throw new Error('Publisher migration paths must stay inside the data volume.');
  if(path.resolve(root,upload.proofDirectory)!==path.join(root,'public/proofs')||path.resolve(root,upload.tokenFile)!==path.join(root,'proof-upload-token'))throw new Error('Proof uploader paths must stay inside the data volume.');
  const signingKey=name=>{const data=json(name);if(!Array.isArray(data)||data.length!==64)throw new Error('Invalid operator signing key.');return Keypair.fromSecretKey(Uint8Array.from(data)).publicKey.toBase58();};
  if(signingKey('keys/keeper.json')!==keeper.keeperPublicKey||signingKey('keys/holder-publisher.json')!==publisher.expectedAuthorities.holderPublisher)throw new Error('Operator key identity mismatch.');
  if(journal.activation!=='active'||!storedKeeper.activation||keeper.mainnetEnabled!==true||publisher.mainnetEnabled!==true)throw new Error('Migration requires the active historical journals.');
  if(storedKeeper.role!=='round-keeper-v1'||storedKeeper.keeperPublicKey!==keeper.keeperPublicKey)throw new Error('Keeper journal identity mismatch.');
  const opening=journal.plans[0]?.openingSnapshot??journal.openingSnapshot;
  const eligible=eligibleOpeningSnapshot({...opening,balances:new Map(opening.balances)},{excludedWallets:opening.excludedWallets??[],excludeOffCurve:true});
  if(!Number.isSafeInteger(journal.preGameAbsenceSlot)||opening.policy!==eligible.policy||opening.mint!==domain.piggyMint||JSON.stringify(eligible.balances)!==JSON.stringify(opening.balances)||eligible.totalEligibleBalance!==opening.totalEligibleBalance||storedKeeper.activation.snapshotSlot!==opening.slot||storedKeeper.activation.snapshotHash!==migrationHash(JSON.stringify(opening))||journal.preGameAbsenceSlot<opening.slot)throw new Error('Historical opening snapshot changed during migration.');
  if(journal.pendingWindow||storedKeeper.pending)throw new Error('Reconcile pending transactions before migration.');
  if(!/^[A-Za-z0-9_-]{32,256}$/.test(files.get('proof-upload-token').toString().trim()))throw new Error('Invalid private upload token.');
  const identity=migrationHash(JSON.stringify(snapshot.files.map(f=>[f.path,f.sha256]).sort((a,b)=>a[0].localeCompare(b[0]))));
  if(snapshot.id!==identity)throw new Error('Migration manifest identity mismatch.');
  return{files,domain,id:identity,openingSlot:journal.plans?.[0]?.openingSnapshot?.slot??journal.openingSnapshot.slot};
}
export async function importMigration(snapshot,{root=process.env.PIGGY_OPERATOR_DATA_DIR||'/data/piggy',enabled=process.env.PIGGY_OPERATOR_ENABLED}={}){
  if(enabled==='true')throw new Error('Disable the operator service before importing state.');
  root=path.resolve(root);const checked=validateMigration(snapshot,root),marker=path.join(root,'migration.json');
  let existing;try{existing=JSON.parse(await fs.readFile(marker,'utf8'));}catch(error){if(error.code!=='ENOENT')throw error;}
  if(existing){if(existing.id!==checked.id)throw new Error('A different migration is already installed. Refusing to overwrite live history.');return{ok:true,id:checked.id,alreadyImported:true};}
  // An interrupted import may be resumed from the identical manifest. The
  // marker is committed last; operators refuse to start without this marker.
  await fs.mkdir(root,{recursive:true,mode:0o700});
  for(const[name,bytes]of checked.files){const target=path.join(root,name);await fs.mkdir(path.dirname(target),{recursive:true,mode:0o700});let existingBytes;try{existingBytes=await fs.readFile(target);}catch(error){if(error.code!=='ENOENT')throw error;}if(existingBytes&&!existingBytes.equals(bytes))throw new Error('Existing migration file differs. Refusing to overwrite history.');const temp=target+'.import.tmp';await fs.writeFile(temp,bytes,{mode:0o600});const file=await fs.open(temp,'r+');try{await file.sync();}finally{await file.close();}await fs.rename(temp,target);await fs.chmod(target,0o600);const directory=await fs.open(path.dirname(target),'r');try{await directory.sync();}finally{await directory.close();}}
  await durableJson(marker,{schemaVersion:1,id:checked.id,domain:checked.domain,openingSlot:checked.openingSlot,importedAt:new Date().toISOString()});
  return{ok:true,id:checked.id,files:checked.files.size,openingSlot:checked.openingSlot};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{const chunks=[];let size=0;for await(const chunk of process.stdin){size+=chunk.length;if(size>96*1024*1024)throw new Error('Migration input too large.');chunks.push(chunk);}console.log(JSON.stringify(await importMigration(JSON.parse(Buffer.concat(chunks).toString()))));}
  catch(error){console.error(error.message);process.exitCode=1;}
}
