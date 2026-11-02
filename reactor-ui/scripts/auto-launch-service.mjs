/** Persistent, fail-closed launch coordinator. No token purchases or program deployments. */
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {Connection, PublicKey, SYSVAR_CLOCK_PUBKEY} from '@solana/web3.js';
import {unpackMint, TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID} from '@solana/spl-token';
import {RELAUNCH, relaunchConfigs} from './relaunch-config.mjs';
import {PIGGY_TIMING} from '../src/game-timing.mjs';
import * as sdk from '../src/solana-instructions.mjs';
import {serverLaunch} from './relaunch-server.mjs';
import {initializeRelaunch} from './relaunch-initialize.mjs';
import {durableJson} from './holder-publisher.mjs';
import {startOperatorService} from './operator-service.mjs';
import {proofResponse} from './proof-http.mjs';

export function launchDecision({mintExists, mintValid, chainTime, launchAt}) {
  if (!Number.isSafeInteger(chainTime) || !Number.isSafeInteger(launchAt)) throw Error('Invalid launch clock');
  if (!mintExists) return 'waiting-for-token';
  if (!mintValid) return 'blocked';
  return chainTime < launchAt ? 'waiting-for-time' : 'initialize';
}

export async function launchTick({root, config, connection}) {
  const expected = relaunchConfigs({mint:config.mint,rpcUrl:'https://rpc.example',root,enabled:true}).publicConfig;
  if(config.programId!==RELAUNCH.programId || config.gameVersion!=='1' || config.enabled!==true) throw Error('Unapproved launch identity');
  const launchAt=Date.parse(config.launchAt)/1000;
  if(!Number.isSafeInteger(launchAt))throw Error('Invalid launch deadline');
  if(await connection.getGenesisHash()!==expected.genesisHash)throw Error('Wrong chain');
  const gameAddress=sdk.gameAddress(RELAUNCH.programId,1);
  const result=await connection.getMultipleAccountsInfoAndContext([new PublicKey(RELAUNCH.programId),new PublicKey(RELAUNCH.programData),new PublicKey(config.mint),SYSVAR_CLOCK_PUBKEY,gameAddress],{commitment:'finalized'});
  const [program,pd,mintInfo,clock,gameInfo]=result.value;
  const loader='BPFLoaderUpgradeab1e11111111111111111111111';
  if(!program?.executable || program.owner.toBase58()!==loader || !pd || pd.owner.toBase58()!==loader || pd.data[12]!==1 || new PublicKey(pd.data.subarray(13,45)).toBase58()!==RELAUNCH.authorities.upgradeAuthority || createHash('sha256').update(pd.data.subarray(45)).digest('hex')!==RELAUNCH.binarySha256)throw Error('Program verification failed');
  if(!clock || clock.data.length<40 || clock.owner.toBase58()!=='Sysvar1111111111111111111111111111111111111')throw Error('Chain clock unavailable');
  const chainTime=Number(clock.data.readBigInt64LE(32));
  let token=null;
  if(mintInfo){
    if(![TOKEN_PROGRAM_ID.toBase58(),TOKEN_2022_PROGRAM_ID.toBase58()].includes(mintInfo.owner.toBase58()))throw Error('Mint is not an SPL token');
    token=unpackMint(new PublicKey(config.mint),mintInfo,mintInfo.owner);
    if(!token.isInitialized || token.supply<=0n || token.freezeAuthority)throw Error('Mint validation failed');
  }
  const decision=launchDecision({mintExists:!!mintInfo,mintValid:!!token,chainTime,launchAt});
  const view={status:decision,ready:false,launchAt:config.launchAt,chainTime,checkedSlot:result.context.slot,programId:RELAUNCH.programId,piggyMint:config.mint};
  // Crucially, no game creation, key loading or transaction happens above this gate.
  if(decision!=='initialize')return view;
  const input=JSON.parse(await fs.readFile(path.join(root,'private-input.json'),'utf8'));
  if(!gameInfo){
    const journalFile=path.join(root,'game-initialization.json');
    try{
      const journal=JSON.parse(await fs.readFile(journalFile,'utf8'));
      const status=(await connection.getSignatureStatuses([journal.signature],{searchTransactionHistory:true})).value[0];
      if(status?.err)throw Error('Initialization transaction failed; operator review required');
      if(status || await connection.getBlockHeight('finalized')<=journal.lastValidBlockHeight)return {...view,status:'confirming-initialization'};
      await fs.rename(journalFile,path.join(root,`expired-initialization-${journal.signature}.json`));
    }catch(e){if(e.code!=='ENOENT')throw e;}
    await serverLaunch({command:'configure',root,mint:config.mint});
    await durableJson(path.join(root,'mint-binding.json'),{mint:config.mint,programId:RELAUNCH.programId,gameVersion:'1',status:'validated',mintDecimals:token.decimals,supply:token.supply.toString()});
    const opening=await serverLaunch({command:'prepare-opening',root,mint:config.mint});
    await durableJson(path.join(root,'prepared-opening.json'),opening.state);
    await initializeRelaunch({root,rpcUrl:input.rpcUrl,execute:true,notBeforeUnix:launchAt});
  }else{
    if(gameInfo.owner.toBase58()!==RELAUNCH.programId)throw Error('Wrong game owner');
    const game=sdk.decodeGame(gameInfo.data);
    if(game.version!==1n || game.game_creator!==RELAUNCH.authorities.gameCreator || game.round_init_time!==300n || game.round_inc_time_per_key!==30n || game.round_max_time!==600n)throw Error('Existing game does not match approved launch');
    // Never adopt an unknown third-party game or lose the pre-creation snapshot.
    await fs.access(path.join(root,'prepared-opening.json'));
    await fs.access(path.join(root,'game-initialization.json'));
  }
  await serverLaunch({command:'activate',root,mint:config.mint,execute:true});
  const gameAccount=await connection.getAccountInfo(gameAddress,'finalized');
  const game=sdk.decodeGame(gameAccount.data);
  if(game.round_id<1n)throw Error('First round not confirmed');
  return {...view,status:'starting-operators',gameVersion:'1',roundId:game.round_id.toString(),gameTiming:PIGGY_TIMING,initialized:true};
}

export async function startAutoLaunch({root,port=Number(process.env.PORT||8080),tickMs=3000,env=process.env}={}){
  const config=JSON.parse(await fs.readFile(path.join(root,'auto-launch.json'),'utf8'));
  const input=JSON.parse(await fs.readFile(path.join(root,'private-input.json'),'utf8'));
  const connection=new Connection(input.rpcUrl,{commitment:'finalized',disableRetryOnRateLimit:true});
  let state={status:'checking',ready:false,launchAt:config.launchAt,programId:config.programId,piggyMint:config.mint},operators=null,stopping=false,timer;
  const stateFile=path.join(root,'auto-launch-state.json');
  async function publish(){await durableJson(stateFile,state);}
  const server=http.createServer(async(req,res)=>{
    const route=new URL(req.url,'http://localhost').pathname;
    if(req.method==='GET'&&['/launch-status','/health','/ready','/'].includes(route)){
      const health=operators?.status();
      const body=route==='/launch-status'?state:{...state,operators:health??null};
      res.writeHead(route==='/ready'&&!state.ready?503:200,{'content-type':'application/json','cache-control':'no-store'});res.end(JSON.stringify(body));return;
    }
    const proof=await proofResponse({url:req.url,method:req.method,root:path.join(root,'public/proofs')});
    if(proof){res.writeHead(proof.status,proof.headers);res.end(proof.body);return;}
    res.writeHead(404);res.end();
  });
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(port,'0.0.0.0',resolve);});
  async function tick(){
    try{
      if(operators){const health=operators.status();state={...state,status:health.ready?'live':'starting-operators',ready:health.ready};}
      else{
        state=await launchTick({root,config,connection});
        if(state.initialized)operators=await startOperatorService({env:{...env,PORT:'0',PIGGY_OPERATOR_ENABLED:'true',PIGGY_OPERATOR_DATA_DIR:root,PIGGY_OPERATOR_LEGACY_DATA_DIR:'',PIGGY_PROOFS_MODE:'local'}});
      }
    }catch{state={...state,status:'checks-pending',ready:false};}
    await publish();
    if(!stopping)timer=setTimeout(tick,tickMs);
  }
  void tick();
  return {status:()=>state,stop:async()=>{stopping=true;clearTimeout(timer);await operators?.stop();await new Promise(resolve=>{server.close(resolve);server.closeAllConnections();});}};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const root=path.resolve(process.env.PIGGY_OPERATOR_DATA_DIR||'/data/piggy');
  const service=await startAutoLaunch({root});
  for(const signal of ['SIGTERM','SIGINT'])process.once(signal,()=>{void service.stop().then(()=>{process.exitCode=0;});});
}
