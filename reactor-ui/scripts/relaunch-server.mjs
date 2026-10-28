/** Mint-bound launch preparation on the private operator server. Signing is explicit. */
import fs from'node:fs/promises';import path from'node:path';import{fileURLToPath}from'node:url';import{createHash}from'node:crypto';
import{Connection,PublicKey}from'@solana/web3.js';import{relaunchConfigs,RELAUNCH}from'./relaunch-config.mjs';
import{loadPublisher,prepareOpeningSnapshot,initializePublisher,withPublisherLock,durableJson,readPublisherFunding}from'./holder-publisher.mjs';
import{loadKeeper,withKeeperLock,keeperTick}from'./round-keeper.mjs';import{publicationDomain}from'../src/holder-publication.mjs';
export async function serverLaunch({command,root,mint,execute=false}){
 if(!path.isAbsolute(root)||!root.startsWith('/data/piggy/'))throw Error('Dedicated operator directory required');
 const input=JSON.parse(await fs.readFile(path.join(root,'private-input.json'),'utf8'));
 if(command==='configure'){
  const conf=relaunchConfigs({mint,rpcUrl:input.rpcUrl,root,enabled:true});const c=new Connection(input.rpcUrl,'finalized');if(await c.getGenesisHash()!==conf.publicConfig.genesisHash)throw Error('Wrong cluster');
  try{const old=JSON.parse(await fs.readFile(path.join(root,'binding.json'),'utf8'));if(old.mint!==mint)throw Error('Existing launch mint cannot be replaced');}catch(e){if(e.code!=='ENOENT')throw e;}
  await durableJson(path.join(root,'configs/publisher.active.json'),conf.publisher);await durableJson(path.join(root,'configs/keeper.active.json'),conf.keeper);await durableJson(path.join(root,'binding.json'),{mint,programId:RELAUNCH.programId,gameVersion:'1'});return{configured:true,roundOpened:false};
 }
 const p=await loadPublisher(path.join(root,'configs/publisher.active.json'));if(p.config.programId!==RELAUNCH.programId||p.config.gameVersion!=='1')throw Error('Wrong relaunch domain');
 if(command==='prepare-opening')return withPublisherLock(p.config.workspace,async()=>{try{const s=JSON.parse(await fs.readFile(p.stateFile,'utf8'));if(s.activation!=='prepared-before-game')throw Error('Existing snapshot already activated');return{status:'existing-prepared-snapshot',state:s};}catch(e){if(e.code!=='ENOENT')throw e;}await prepareOpeningSnapshot(p);return{status:'prepared',state:JSON.parse(await fs.readFile(p.stateFile,'utf8'))};});
 if(command==='activate'){
  if(!execute)throw Error('Activation requires --execute');
  await withPublisherLock(p.config.workspace,async()=>{const s=JSON.parse(await fs.readFile(p.stateFile,'utf8'));if(s.activation==='prepared-before-game')await initializePublisher(p);else if(s.activation==='active')await readPublisherFunding(p);else throw Error('Invalid publisher stage');});
  const k=await loadKeeper(path.join(root,'configs/keeper.active.json'));let state;await withKeeperLock(k.config.workspace,async()=>{for(let i=0;i<90;i++){await keeperTick(k,{allowMainnet:true});state=JSON.parse(await fs.readFile(k.stateFile,'utf8'));if(state.activation&&!state.pending)return;await new Promise(r=>setTimeout(r,1500));}throw Error('Round opening still pending; reconcile saved signature');});
  const s=JSON.parse(await fs.readFile(p.stateFile,'utf8'));const domain=publicationDomain(p.config),id=createHash('sha256').update(JSON.stringify({domain,opening:s.openingSnapshot})).digest('hex');await durableJson(path.join(root,'migration.json'),{schemaVersion:1,id,domain,openingSlot:s.openingSnapshot.slot});return{status:'active',roundOpened:true,pending:state.pending};
 }
 throw Error('Unknown server launch command');
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){const [command,root,mint,...flags]=process.argv.slice(2);serverLaunch({command,root,mint,execute:flags.includes('--execute')}).then(x=>console.log(JSON.stringify(x))).catch(e=>{console.error(String(e.message).replace(/https?:\/\/\S+/g,'[URL]'));process.exitCode=1;});}
