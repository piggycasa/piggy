/** Comprehension-state regression checks, not a human usability study.
 * Real rendering/client code; original curve-generated synthetic accounts;
 * every RPC is intercepted. The mock wallet can only reject signing. */
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {build,preview} from 'vite';
import {chromium} from '@playwright/test';
import {Keypair,SystemProgram,SYSVAR_CLOCK_PUBKEY} from '@solana/web3.js';
import * as sdk from '../src/solana-instructions.mjs';
import {createGame,buyKeys,settleRound,previewJackpot} from '../src/holder-engine.mjs';
import {costForExactKeys} from '../src/solana-curve.mjs';
import {CLUSTER_GENESIS} from '../src/solana-config.mjs';
import {holderMerkleTree} from '../src/solana-holder.mjs';

const output=path.resolve(process.env.PIGGY_INTUITIVE_QA_OUTPUT||'.openai/local/visual-qa/intuitive'),buildDir=path.resolve(process.env.PIGGY_INTUITIVE_QA_BUILD_DIR||path.join(output,'build'));
const focus=process.env.PIGGY_INTUITIVE_QA_FOCUS||'all';
const viewportFilter=process.env.PIGGY_INTUITIVE_QA_VIEWPORT;
const [program,mint,wallet,other,tokenAddress]=Array.from({length:5},()=>Keypair.generate().publicKey),version=6899n;
const game=sdk.gameAddress(program,version),holder=sdk.holderConfigAddress(program,game),vault=sdk.holderVaultAddress(program,game),round=sdk.roundAddress(program,1n,version),player=sdk.playerAddress(program,wallet,1n,version);
const base=Math.floor(Date.now()/1000)*1000;
const config={schemaVersion:1,cluster:'mainnet-beta',genesisHash:CLUSTER_GENESIS['mainnet-beta'],mainnetEnabled:true,rpcUrl:'https://intuitive-qa-rpc.invalid/',proofIndexUrl:'https://intuitive-qa-proofs.invalid/proofs/index.json',programId:program.toBase58(),piggyMint:mint.toBase58(),gameVersion:String(version),purchaseGuardVersion:1};
const account=(data,owner=program,executable=false)=>({owner:owner.toBase58(),data:[data.toString('base64'),'base64'],lamports:1,executable,rentEpoch:0});
const blockhash=Keypair.generate().publicKey.toBase58(),checks=[],failures=[],measurements=[];
const check=(label,value)=>{assert.ok(value,label);checks.push(label);};
let server,browser,activePage;

function model(name){
  const state=createGame(base,{seeded:false});
  // A legitimate opening-rollover shape stresses large-money layout without
  // inventing purchases or token entitlements. Still only synthetic RPC data.
  if(name==='large'){state.round.id=2;state.round.openingRollover=100_000_000_000_000;state.round.pot=state.round.openingRollover;}
  if(name!=='empty')assert.ok(buyKeys(state,'you',1000,base+1000,'whale').ok);
  if(name==='outbid'||name==='settled-other')assert.ok(buyKeys(state,'npc_fox',1,base+2000,'whale').ok);
  if(name.startsWith('settled'))assert.ok(settleRound(state,state.round.endsAt+1000).ok);
  if(name==='cap')state.round.endsAt=state.lastActionAt+86_390_000;
  return state;
}
function fixture(initial='empty',{holderAmount=0n}={}){
  let state=model(initial),name=initial,revision=500;const requests=[],archivedAccounts=new Map();
  function data(){
    const r=state.round,p=state.players.you,ended=r.status==='settled',contribution=state.activity.filter(a=>a.type==='purchase'&&a.playerId==='you').reduce((sum,a)=>sum+a.cost,0),byTeam=['whale','bear','snek','bull'].map(team=>BigInt(state.activity.filter(a=>a.type==='purchase'&&a.mode===team).reduce((sum,a)=>sum+a.cost,0)));
    const activeRound=sdk.roundAddress(program,BigInt(r.id),version),activePlayer=sdk.playerAddress(program,wallet,BigInt(r.id),version);
    const accounts=new Map(archivedAccounts);accounts.set(program.toBase58(),account(Buffer.alloc(0),program,true));
    accounts.set(game.toBase58(),account(Buffer.concat([Buffer.from([3]),...[BigInt(r.id),3600n,30n,86400n,version].map(sdk.u64),sdk.NATIVE_MINT.toBuffer(),wallet.toBuffer(),wallet.toBuffer(),vault.toBuffer()])));
    accounts.set(holder.toBase58(),account(Buffer.concat([Buffer.from('PHCFG001'),game.toBuffer(),wallet.toBuffer(),mint.toBuffer(),sdk.NATIVE_MINT.toBuffer(),vault.toBuffer(),...[holderAmount,holderAmount?2n:1n,holderAmount,0n].map(sdk.u64),Buffer.from([1])])));
    if(holderAmount){
      const tree=holderMerkleTree([{wallet,amount:holderAmount}],{programId:program,game,epoch:1n});
      accounts.set(sdk.holderEpochAddress(program,holder,1n).toBase58(),account(Buffer.concat([Buffer.from('PHEPO001'),holder.toBuffer(),game.toBuffer(),sdk.u64(1n),sdk.u64(490n),Buffer.from(tree.root),sdk.u64(holderAmount),sdk.u64(0n),Buffer.from([1])])));
    }
    const lead=r.lastBuyerId==='you'?wallet:r.lastBuyerId?other:SystemProgram.programId;
    const values=[BigInt(r.totalKeys),BigInt(r.openingRollover+r.grossEntries),...byTeam,BigInt(r.communityAllocated),BigInt(state.airdropReserve),BigInt(r.rolloverAllocated),0n,BigInt(r.tokenRewardsAllocated),BigInt(r.playerRewardsAllocated),BigInt(ended?0:r.pot),BigInt(ended?r.settlement.winnerPrize:0),0n,0n,0n];
    const roundData=Buffer.concat([Buffer.from([4]),sdk.u64(BigInt(r.id)),lead.toBuffer(),Buffer.from([0]),sdk.u64(BigInt(r.startedAt/1000)),sdk.u64(BigInt(r.endsAt/1000)),Buffer.from([ended?1:0]),...values.map(sdk.u128),sdk.u64(0n),...Array.from({length:4},()=>sdk.u128(0n))]);
    accounts.set(activeRound.toBase58(),account(roundData));
    if(p.keys){const playerData=Buffer.concat([Buffer.from([5]),wallet.toBuffer(),sdk.u64(BigInt(r.id)),SystemProgram.programId.toBuffer(),...[BigInt(p.keys),BigInt(contribution),BigInt(p.jackpotRewardsEarned),0n,0n,0n,0n,0n,0n,BigInt(p.keyRewardsEarned)].map(sdk.u128)]);accounts.set(activePlayer.toBase58(),account(playerData));}
    const mintData=Buffer.alloc(82);mintData[44]=6;mintData[45]=1;mintData.writeBigUInt64LE(1_000_000_000_000_000n,36);accounts.set(mint.toBase58(),account(mintData,sdk.TOKEN_PROGRAM_ID));
    const clock=Buffer.alloc(40);clock.writeBigInt64LE(BigInt(state.lastActionAt/1000),32);accounts.set(SYSVAR_CLOCK_PUBKEY.toBase58(),account(clock,SystemProgram.programId));
    const tokenData=Buffer.alloc(165);mint.toBuffer().copy(tokenData);wallet.toBuffer().copy(tokenData,32);tokenData.writeBigUInt64LE(150_000_000n,64);tokenData[108]=1;
    return{accounts,token:account(tokenData,sdk.TOKEN_PROGRAM_ID),contribution,activePlayer};
  }
  function rpc(request){
    requests.push(request.method);const params=request.params||[],context={slot:revision},{accounts,token,activePlayer}=data();let result;
    switch(request.method){
      case'getGenesisHash':result=config.genesisHash;break;
      case'getMultipleAccounts':result={context,value:params[0].map(key=>accounts.get(key)||null)};break;
      case'getAccountInfo':result={context,value:accounts.get(params[0])||null};break;
      case'getProgramAccounts':result=[...accounts].filter(([,value])=>Buffer.from(value.data[0],'base64')[0]===5).map(([pubkey,account])=>({pubkey,account}));break;
      case'getBalance':result={context,value:state.players.you.balance};break;
      case'getTokenAccountsByOwner':result={context,value:[{pubkey:tokenAddress.toBase58(),account:token}]};break;
      case'getLatestBlockhash':result={context,value:{blockhash,lastValidBlockHeight:1000}};break;
      case'getMinimumBalanceForRentExemption':result=params[0]===81?1_061_720:params[0]===165?2_039_280:1_833_880;break;
      case'getFeeForMessage':result={context,value:10_000};break;
      case'getSlot':case'getBlockHeight':result=revision;break;
      case'getSignatureStatuses':result={context,value:params[0].map(()=>null)};break;
      case'simulateTransaction':result={context,value:{err:null,logs:[],accounts:null,unitsConsumed:100_000,returnData:null,innerInstructions:null}};break;
      default:failures.push(`Unexpected RPC ${request.method}`);return{jsonrpc:'2.0',id:request.id,error:{code:-32601,message:'Unexpected QA RPC method'}};
    }
    return{jsonrpc:'2.0',id:request.id,result};
  }
  const manifest={schemaVersion:1,cluster:config.cluster,genesisHash:config.genesisHash,programId:config.programId,gameVersion:config.gameVersion,piggyMint:config.piggyMint,wallet:wallet.toBase58(),epochs:holderAmount?[{epoch:'1',amount:String(holderAmount),proof:[]}]:[]};
  return{rpc,requests,manifest,get state(){return state;},get name(){return name;},get contribution(){return data().contribution;},set(next){const nextState=model(next);if(nextState.round.id>state.round.id){for(const[key,value]of data().accounts){const tag=Buffer.from(value.data[0],'base64')[0];if(tag===4||tag===5)archivedAccounts.set(key,value);}}name=next;state=nextState;revision++;}};
}

async function openPage(width,height,{initial='empty',firstVisit=false,query='',remembered=false,usdUnavailable=false,proofUnavailable=false,holderAmount=0n}={}){
  const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1,reducedMotion:'reduce'}),page=await context.newPage(),data=fixture(initial,{holderAmount});activePage=page;
  page.on('pageerror',error=>failures.push(error.message));
  await page.route('**/*',async route=>{const url=new URL(route.request().url());if(url.pathname==='/api/sol-price')return route.fulfill(usdUnavailable?{status:503,contentType:'application/json',body:JSON.stringify({error:'Price unavailable'})}:{status:200,contentType:'application/json',body:JSON.stringify({schemaVersion:1,base:'SOL',quote:'USD',price:'200',asOf:Date.now(),source:'Coinbase'})});if(url.pathname==='/intuitive-qa-config.json')return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(config)});if(url.hostname==='intuitive-qa-rpc.invalid'){if(route.request().method()==='OPTIONS')return route.fulfill({status:204,headers:{'access-control-allow-origin':'*','access-control-allow-headers':'*'}});return route.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify(data.rpc(route.request().postDataJSON()))});}if(url.hostname==='intuitive-qa-proofs.invalid')return route.fulfill({status:proofUnavailable?503:holderAmount?200:404,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:proofUnavailable?'Proof service unavailable':holderAmount?JSON.stringify(data.manifest):'No published fixture allocation'});if(url.hostname==='127.0.0.1')return route.continue();failures.push(`Unexpected external request ${url.origin}`);return route.abort();});
  await page.addInitScript(({address,bytes,firstVisit,remembered,config})=>{
    if(!firstVisit)localStorage.setItem('piggy.intro.v1','seen');
    if(remembered)sessionStorage.setItem(`piggy.wallet-choice:${config.genesisHash}:${config.programId}`,'Intuitive QA');
    // Accelerate only the client's five-second account/activities polling. All
    // displayed round times remain the mock on-chain Clock and original rules.
    const interval=window.setInterval;window.setInterval=(fn,ms,...args)=>interval(fn,ms===5000?150:ms,...args);
    const account={address,publicKey:new Uint8Array(bytes),chains:['solana:mainnet'],features:['solana:signTransaction']},listeners=new Set();let accounts=[];
    window.__intuitiveQa={signCalls:0,release:null};
    const mock={version:'1.0.0',name:'Intuitive QA',icon:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',chains:['solana:mainnet'],get accounts(){return accounts;},features:{'standard:connect':{version:'1.0.0',connect:async()=>{accounts=[account];for(const fn of listeners)fn({accounts});return{accounts};}},'standard:disconnect':{version:'1.0.0',disconnect:async()=>{accounts=[];for(const fn of listeners)fn({accounts});}},'standard:events':{version:'1.0.0',on:(_,fn)=>{listeners.add(fn);return()=>listeners.delete(fn);}},'solana:signTransaction':{version:'1.0.0',supportedTransactionVersions:['legacy'],signTransaction:async()=>{window.__intuitiveQa.signCalls++;await new Promise(resolve=>window.__intuitiveQa.release=resolve);throw new Error('User rejected transaction request');}}}};
    const register=api=>api.register(mock);window.addEventListener('wallet-standard:app-ready',event=>register(event.detail));window.dispatchEvent(new CustomEvent('wallet-standard:register-wallet',{detail:register}));
  },{address:wallet.toBase58(),bytes:[...wallet.toBytes()],firstVisit,remembered,config});
  await page.goto(`http://127.0.0.1:${server.config.preview.port}/${query}`,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>document.querySelector('.demo-badge')?.textContent.includes('Mainnet'));await page.locator('#safe-art.model-ready').waitFor();
  return{page,context,data};
}
async function connect(page){await page.locator('.wallet-button').click();await page.locator('[data-wallet-id]').filter({hasText:'Intuitive QA'}).click();await page.waitForFunction(address=>document.querySelector('#chain-wallet')?.textContent===address,wallet.toBase58());if(await page.locator('#toast-dismiss').isVisible())await page.locator('#toast-dismiss').click();}
async function shot(page,name){await page.screenshot({path:path.join(output,`${name}.png`)});}
const numeric=async selector=>parseFloat((await selector.textContent()).replaceAll(',',''));
async function exactLamports(locator){
  const value=await locator.getAttribute('data-lamports');
  if(value!==null){assert.match(value,/^\d+$/);return BigInt(value);}
  const title=await locator.getAttribute('title');
  if(title&&/^\d[\d,]*(?:\.\d{1,9})? SOL/.test(title)){
    const [whole,fraction='']=title.split(' ')[0].replaceAll(',','').split('.');
    return BigInt(whole)*1_000_000_000n+BigInt(fraction.padEnd(9,'0'));
  }
  const text=(await locator.textContent()).replaceAll(',','').trim();
  assert.match(text,/^\d+(?:\.\d{1,9})?(?:\s*SOL)?$/,'An exact SOL amount or data-lamports is required for financial assertions.');
  const [whole,fraction='']=text.replace(/\s*SOL$/,'').split('.');
  return BigInt(whole)*1_000_000_000n+BigInt(fraction.padEnd(9,'0'));
}
function expectedUsd(lamports,{compact=false}={}){
  const numerator=BigInt(lamports)*200n,denominator=1_000_000_000n;
  if(compact)for(const[scale,suffix]of[[1_000_000_000_000n,'T'],[1_000_000_000n,'B'],[1_000_000n,'M'],[1000n,'K']]){
    if(numerator<denominator*scale)continue;
    const rounded=(numerator*100n+denominator*scale/2n)/(denominator*scale),fraction=String(rounded%100n).padStart(2,'0').replace(/0+$/,'');
    return `≈ $${rounded/100n}${fraction?'.'+fraction:''}${suffix}`;
  }
  if(numerator>0n&&numerator*100n<denominator)return `≈ $${Number(Number(numerator)/Number(denominator)).toLocaleString('en-US',{maximumSignificantDigits:2,useGrouping:false})}`;
  const cents=(numerator*100n+denominator/2n)/denominator;
  return `≈ $${(cents/100n).toLocaleString('en-US')}.${String(cents%100n).padStart(2,'0')}`;
}
async function usdMatches(page,id,lamports,label){
  const compact=await page.locator(`#${id}`).getAttribute('data-usd-compact')==='true',expected=expectedUsd(lamports,{compact}),full=expectedUsd(lamports);
  await page.waitForFunction(({id,expected,full})=>{const node=document.getElementById(id);return node&&!node.hidden&&getComputedStyle(node).display!=='none'&&node.textContent===expected&&node.title.startsWith(full+'. ');},{id,expected,full});
  check(label,await page.locator(`#${id}`).isVisible());
}

async function openGameRewards(page){
  await page.locator(await page.locator('#loot-claim').isVisible()?'#loot-claim':'.rewards-button').click();
  await page.locator('#rewards-dialog[open]').waitFor();await page.locator('#claim-tab-game').click();
}
async function gameRewardUsd(page,lamports,label){
  if(await page.locator('.key-loot').isVisible())return usdMatches(page,'rewards-usd',lamports,label);
  check(`${label}: compact screen retains an accessible rewards action`,await page.locator('.rewards-button').isVisible());
  await openGameRewards(page);await usdMatches(page,'game-claim-usd',lamports,label);
  check(`${label}: compact claim panel preserves the exact SOL amount`,await exactLamports(page.locator('#game-claimable'))===BigInt(lamports));
  await page.keyboard.press('Escape');await page.locator('#rewards-dialog').waitFor({state:'hidden'});
}
async function measured(page,name){
  const result=await page.evaluate(()=>{
    const visible=node=>{const r=node.getBoundingClientRect(),s=getComputedStyle(node);return r.width>3&&r.height>3&&s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity)!==0;};
    const rect=node=>{const r=node.getBoundingClientRect();return{left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height};};
    const ids=['leader-name','pot-value','jackpot-usd','purchase-cost','purchase-usd','key-loot-value','rewards-usd','holder-earn-amount','holder-earn-usd','preview-keys-after','preview-share-after'];
    const rows=ids.map(id=>document.getElementById(id)).filter(node=>node&&visible(node)).map(node=>({id:node.id,text:node.textContent.trim(),font:parseFloat(getComputedStyle(node).fontSize),...rect(node)}));
    const essential=['.pot-caption','#timer-caption','.countdown','#leader-name','#action-title','.loot-label','.holder-heading h2','.holder-heading p','.position-values>div>span','.position-values strong','#purchase-cost','#purchase-usd','#buy-label','#buy-extra-cost'];
    const rgba=value=>{const c=value.match(/[\d.]+/g)?.map(Number)||[0,0,0,0];return[c[0]/255,c[1]/255,c[2]/255,c[3]??1];};
    const over=(fg,bg)=>fg.slice(0,3).map((n,i)=>n*fg[3]+bg[i]*(1-fg[3]));
    const lum=c=>c.map(n=>n<=.04045?n/12.92:((n+.055)/1.055)**2.4).reduce((v,n,i)=>v+n*[.2126,.7152,.0722][i],0);
    const text=essential.flatMap(selector=>[...document.querySelectorAll(selector)].filter(visible).map(node=>{const parents=[];for(let p=node;p;p=p.parentElement)parents.push(p);let bg=rgba(getComputedStyle(document.body).backgroundColor).slice(0,3);for(const p of parents.reverse())bg=over(rgba(getComputedStyle(p).backgroundColor),bg);const style=getComputedStyle(node),fg=over(rgba(style.color),bg),a=lum(fg),b=lum(bg);return{selector,text:node.textContent.trim(),font:parseFloat(style.fontSize),weight:parseFloat(style.fontWeight)||400,contrast:(Math.max(a,b)+.05)/(Math.min(a,b)+.05),...rect(node)};}));
    const stage=rect(document.querySelector('#safe-art')),main=rect(document.querySelector('#arena'));
    const numericLines=['pot-value','jackpot-usd','key-loot-value','rewards-usd','purchase-cost','purchase-usd'].map(id=>document.getElementById(id)).filter(node=>node&&visible(node)).map(node=>{const range=document.createRange();range.selectNodeContents(node);return{id:node.id,lines:new Set([...range.getClientRects()].map(r=>Math.round(r.top))).size};});
    const hero=document.querySelector('#jackpot-usd'),clock=document.querySelector('.timer-group');
    return{rows,text,numericLines,hero:hero&&visible(hero)?rect(hero):null,clock:rect(clock),scene:stage,main,panels:['.play-ticket','.holder-ticket','.key-loot'].filter(selector=>visible(document.querySelector(selector))).map(selector=>({selector,...rect(document.querySelector(selector))})),headerBottom:document.querySelector('.topbar').getBoundingClientRect().bottom,footerTop:visible(document.querySelector('.live-footer'))?document.querySelector('.live-footer').getBoundingClientRect().top:innerHeight,noScroll:document.documentElement.scrollWidth<=innerWidth&&document.documentElement.scrollHeight<=innerHeight&&scrollY===0,width:innerWidth,height:innerHeight};
  });
  measurements.push({name,...result});
  check(`${name}: page stays fixed`,result.noScroll);
  check(`${name}: visible money stays within viewport`,result.rows.every(row=>row.left>=-1&&row.right<=result.width+1&&row.top>=result.headerBottom-1&&row.bottom<=result.height+1));
  check(`${name}: monetary values never split digits across lines`,result.numericLines.every(row=>row.lines<=1));
  check(`${name}: jackpot amount does not collide with the countdown`,!result.hero||result.hero.right<=result.clock.left-3||result.hero.bottom<=result.clock.top||result.hero.top>=result.clock.bottom);
  check(`${name}: cards do not collide with header or footer`,result.panels.every(row=>row.top>=result.headerBottom-1&&row.bottom<=result.footerTop+1));
  check(`${name}: essential text is readable and has sufficient contrast`,['#timer-caption','.countdown','#action-title','#buy-label'].every(selector=>result.text.some(row=>row.selector===selector))&&result.text.every(row=>row.font>=11&&row.contrast>=(row.font>=24||row.font>=18.66&&row.weight>=700?3:4.5)));
  check(`${name}: essential text stays inside its viewport`,result.text.every(row=>row.left>=-1&&row.right<=result.width+1&&row.top>=result.headerBottom-1&&row.bottom<=result.height+1));
  check(`${name}: pig has a substantial render area`,result.scene.height>=100&&result.scene.width>=Math.min(210,result.width*.6));
  for(const selector of ['#buy-button','#decrease','#increase','.help-button','.wallet-button','.rewards-button','#loot-claim','.holder-claim','.quote-details-trigger','.mode-button','a.holder-heading']){
    const node=page.locator(selector);if(!await node.count()||!await node.isVisible())continue;
    check(`${name}: ${selector} has an available44px target`,await node.evaluate(node=>{const r=node.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2,hit=document.elementFromPoint(x,y);return r.width>=44&&r.height>=44&&x>=0&&y>=0&&x<=innerWidth&&y<=innerHeight&&(node===hit||node.contains(hit));}));
  }
  for(const[prefix,primary,secondary]of[['jackpot','#jackpot-usd','#pot-value'],['entry','#purchase-usd','#purchase-cost'],['game reward','#rewards-usd','#key-loot-value']]){
    const usd=page.locator(primary),sol=page.locator(secondary);if(!await usd.isVisible())continue;
    check(`${name}: ${prefix} shows primary USD and compact SOL`,await sol.isVisible()&&await usd.evaluate(node=>parseFloat(getComputedStyle(node).fontSize))>await sol.evaluate(node=>parseFloat(getComputedStyle(node).fontSize)));
  }
}

async function practice(page,name){
  await page.locator('.help-button').click();await page.locator('#rules-dialog[open]').waitFor();
  const dialog=page.locator('#rules-dialog');
  check(`${name}: practice is explicitly separate from real funds`,/practice only.*no real SOL/i.test(await dialog.textContent()));
  for(let step=0;step<4;step++){
    await page.locator(`[data-learn-step="${step}"]`).click();const panel=page.locator(`[data-learn-panel="${step}"]`);
    check(`${name}: practice step${step+1} is selected`,await panel.isVisible()&&await page.locator('[data-learn-panel]:visible').count()===1);
    if(step<3){check(`${name}: practice keeps10userkeys at step${step+1}`,await page.locator('#learn-you-keys').textContent()==='10');check(`${name}: practice leader and clock update at step${step+1}`,await page.locator('#learn-other-keys').textContent()===(step?'1':'0')&&await page.locator('#learn-key-share').textContent()===(step?'90.9%':'100%')&&await page.locator('#learn-practice-clock').textContent()===(step===0?'1:05:00':step===1?'1:05:30':'00:00'));}
    if(step===1)check(`${name}: practice explains new buyer funding and retainedkeys`,/new buyer.s SOL/i.test(await panel.textContent())&&/keep your 10 keys/i.test(await panel.textContent())&&/not 90.9% of their whole payment/i.test(await panel.textContent()));
    if(step===2)check(`${name}: practice separates finalwinner and accruedSOL`,/other buyer wins/i.test(await panel.textContent())&&/earned SOL is still yours/i.test(await panel.textContent()));
    if(step===3){let last=0;for(const funding of [0,100,1000,10000]){await page.locator(`[data-curve-funding="${funding}"]`).click();const expected=costForExactKeys(BigInt(funding)*1_000_000_000n,1000n).lamports,shown=Math.round(await numeric(page.locator('#learn-curve-cost'))*1e9);check(`${name}: illustrative curve ${funding}SOL matches original`,shown===Number(expected)&&shown>last);last=shown;}check(`${name}: curve explains non-resale and hypotheticals`,/hypothetical/i.test(await panel.textContent())&&/cannot be sold back/i.test(await panel.textContent()));}
    await panel.scrollIntoViewIfNeeded();await shot(page,`${name}-practice-${step+1}`);
    const next=page.locator('#learn-next');await next.scrollIntoViewIfNeeded();check(`${name}: practice next has reachable44px target`,await next.evaluate(node=>{const r=node.getBoundingClientRect(),hit=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return r.width>=44&&r.height>=44&&r.top>=0&&r.bottom<=innerHeight&&(node===hit||node.contains(hit));}));check(`${name}: practice never scrolls the page`,await page.evaluate(()=>scrollY===0&&document.documentElement.scrollHeight<=innerHeight));
  }
  await page.locator('[data-learn-step="0"]').click();await page.keyboard.press('End');check(`${name}: practice keyboard reacheslaststep`,await page.locator('[data-learn-step="3"]').getAttribute('aria-selected')==='true');await page.keyboard.press('Home');check(`${name}: practice keyboard returnsfirststep`,await page.locator('[data-learn-step="0"]').getAttribute('aria-selected')==='true');
  await page.locator('#rules-dialog .dialog-close').click();await page.locator('.help-button').click();check(`${name}: practice reopens reset`,await page.locator('[data-learn-step="0"]').getAttribute('aria-selected')==='true'&&await page.locator('#learn-other-keys').textContent()==='0');await page.locator('#rules-dialog .dialog-close').click();
}

async function reviewPurchase(page,{name,cost,count,initial=false,expectedClock}={}){
  await page.locator('.quote-details-trigger').click();await page.locator('#mode-dialog[open]').waitFor();
  check(`${name}: exact purchase review fits the viewport`,await page.locator('#mode-dialog').evaluate(node=>{const r=node.getBoundingClientRect();return r.top>=-1&&r.left>=-1&&r.bottom<=innerHeight+1&&r.right<=innerWidth+1;}));
  check(`${name}: exact purchase review identifies the selected keys`,await numeric(page.locator('#entry-review-keys'))===count);
  check(`${name}: exact purchase review preserves all entry lamports`,await exactLamports(page.locator('#entry-review-cost'))===cost);
  const fee=await exactLamports(page.locator('#entry-review-fee')),setup=await exactLamports(page.locator('#entry-review-setup')),rent=await exactLamports(page.locator('#entry-review-returned-rent'));
  check(`${name}: review separates permanent cost from returned rent`,fee===10_000n&&setup===(initial?1_833_880n:0n)&&rent===2_039_280n&&await exactLamports(page.locator('#entry-review-total'))===cost+fee+setup&&await exactLamports(page.locator('#entry-review-balance-needed'))===cost+fee+setup+rent);
  if(expectedClock!==undefined)check(`${name}: review shows the actual capped countdown`,await page.locator('#entry-review-clock').textContent()===expectedClock);
  for(const id of ['entry-review-cost','entry-review-total','entry-review-time','entry-review-clock']){
    check(`${name}: ${id} is reachable before signing`,await page.evaluate(id=>{const node=document.getElementById(id),dialog=node?.closest('dialog');if(!node||!dialog)return false;node.scrollIntoView({block:'center',behavior:'instant'});const r=node.getBoundingClientRect(),d=dialog.getBoundingClientRect();return r.top>=Math.max(0,d.top)&&r.bottom<=Math.min(innerHeight,d.bottom)&&r.left>=Math.max(0,d.left)&&r.right<=Math.min(innerWidth,d.right);},id));
  }
  check(`${name}: purchase review has not requested a signature`,await page.evaluate(()=>window.__intuitiveQa.signCalls===0));
  await shot(page,`${name}-exact-review`);await page.keyboard.press('Escape');await page.locator('#mode-dialog').waitFor({state:'hidden'});
}

try{
  await fs.mkdir(output,{recursive:true});process.env.VITE_PIGGY_CONFIG_URL='/intuitive-qa-config.json';if(!process.env.PIGGY_INTUITIVE_QA_SKIP_BUILD)await build({logLevel:'warn',build:{outDir:buildDir,emptyOutDir:true}});server=await preview({logLevel:'warn',build:{outDir:buildDir},preview:{host:'127.0.0.1',port:Number(process.env.PIGGY_INTUITIVE_QA_PORT||4329),strictPort:true}});browser=await chromium.launch({channel:'chrome',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  for(const[name,width,height]of [['desktop',1440,900],['laptop',1496,696],['phone',390,844],['tiny-phone',320,568],['landscape',844,390],['tiny-landscape',480,320]]){
    if(focus==='errors')break;
    if(viewportFilter&&!viewportFilter.split(',').includes(name))continue;
    const{page,context,data}=await openPage(width,height,{firstVisit:true});
    check(`${name}: a fresh visit does not force the long guide`,!await page.locator('#rules-dialog').isVisible());
    if(focus==='probe'){
      await page.waitForTimeout(700);
      await shot(page,`${name}-disconnected`);
      await connect(page);data.set(process.env.PIGGY_INTUITIVE_QA_PROBE_STATE||'sole');
      await page.waitForFunction(()=>Number(document.querySelector('#your-keys')?.textContent.replaceAll(',',''))===1000);
      await page.waitForTimeout(700);
      measurements.push({name,...await page.evaluate(()=>({width:innerWidth,height:innerHeight,pageWidth:document.documentElement.scrollWidth,pageHeight:document.documentElement.scrollHeight,rows:[...document.querySelectorAll('#app,#arena,.jackpot-stage,.countdown-arena,.safe-stage,.purchase-panel,#safe-art,.play-ticket,.holder-ticket,.key-loot,.topbar,.live-footer,#buy-button,#decrease,#increase,.help-button,.wallet-button,#pot-value,#jackpot-usd,#purchase-cost,#purchase-usd,#key-loot-value,#rewards-usd')].map(node=>{const r=node.getBoundingClientRect(),s=getComputedStyle(node);return{selector:node.id||node.className,text:node.textContent.trim().slice(0,100),left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height,font:s.fontSize,display:s.display,position:s.position,heightCss:s.height,minHeight:s.minHeight,maxHeight:s.maxHeight,gridTemplateRows:s.gridTemplateRows,gridTemplateAreas:s.gridTemplateAreas,gridArea:s.gridArea,overflow:s.overflow,transform:s.transform,flex:s.flex,flexDirection:s.flexDirection};})}))});
      await shot(page,`${name}-funded`);await page.waitForTimeout(4200);await shot(page,`${name}-idle`);await page.locator('#safe-art').screenshot({path:path.join(output,`${name}-pig-crop.png`)});await context.close();continue;
    }
    if(focus==='intro'){
      check(`${name}: fresh visit opens the game without a mandatory guide`,!await page.locator('#rules-dialog').isVisible()&&await page.evaluate(()=>window.__intuitiveQa.signCalls===0));await shot(page,`${name}-first-visit`);await page.locator('.help-button').click();await page.locator('#rules-dialog[open]').waitFor();check(`${name}: manual practice opens its first illustrative step`,await page.locator('[data-learn-step="0"]').getAttribute('aria-selected')==='true');await page.keyboard.press('Escape');await page.locator('#rules-dialog').waitFor({state:'hidden'});check(`${name}: Escape returns from the guide without signing`,await page.evaluate(()=>window.__intuitiveQa.signCalls===0));await page.reload({waitUntil:'domcontentloaded'});await page.locator('#safe-art.model-ready').waitFor();check(`${name}: returning visit does not interrupt with introduction`,!await page.locator('#rules-dialog').isVisible());await page.locator('.help-button').click();check(`${name}: introduction remains available manually`,await page.locator('#rules-dialog').isVisible());await context.close();continue;
    }
    if(focus!=='arena'){await practice(page,name);check(`${name}: practice did not sign`,await page.evaluate(()=>window.__intuitiveQa.signCalls===0));}if(focus==='tutorial'){await context.close();continue;}
    check(`${name}: disconnected balances are unknown, not a fabricated zero`,await page.locator('#key-loot-value').getAttribute('data-money-state')==='unknown'&&await page.locator('#holder-earn-amount').getAttribute('data-money-state')==='unknown'&&await page.locator('#rewards-usd').isHidden()&&await page.locator('#holder-earn-usd').isHidden());
    await shot(page,`${name}-disconnected`);await connect(page);
    check(`${name}: empty round shows zero jackpot`,await exactLamports(page.locator('#pot-value'))===0n);await usdMatches(page,'jackpot-usd',0n,`${name}: known empty jackpot has an accurate USD equivalent`);await gameRewardUsd(page,0n,`${name}: known zero rewards have an accurate USD equivalent`);await measured(page,`${name}/empty`);await shot(page,`${name}-empty`);
    await page.locator('#key-quantity').fill('1000');const expected=costForExactKeys(0n,1000n);await page.waitForFunction(()=>Number(document.querySelector('#preview-keys-after')?.textContent.replaceAll(',',''))===1000);
    check(`${name}: four-digit key quantity is readable in its input`,await page.locator('#key-quantity').evaluate(node=>{const style=getComputedStyle(node),canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');ctx.font=style.font;return ctx.measureText(node.value).width<=node.clientWidth-parseFloat(style.paddingLeft)-parseFloat(style.paddingRight)+1;}));
    check(`${name}: quote uses original cumulative curve`,await exactLamports(page.locator('#purchase-cost'))===expected.lamports);await usdMatches(page,'purchase-usd',expected.lamports,`${name}: USD estimate updates with selected key cost`);check(`${name}: game-key entry and token holding are visibly separate`,await page.locator('.play-ticket').isVisible()&&await page.locator('.holder-ticket').isVisible()&&/keys/i.test(await page.locator('.play-ticket').textContent())&&/PIGGY/.test(await page.locator('#holder-title').textContent())&&/round keys/i.test(await page.locator('#key-quantity').getAttribute('aria-label')));
    check(`${name}: later feeds and game fees identify the distinct reward sources`,/share later feeds/i.test(await page.locator('#action-subtitle').textContent())&&/game fees.*SOL.*no staking/i.test(await page.locator('.holder-heading p').textContent()));
    const initialPrice=costForExactKeys(0n,1n).lamports;
    check(`${name}: current single-key price matches the curve`,await exactLamports(page.locator('#next-key-price'))===initialPrice);
    check(`${name}: feed accessible label includes selected keys and exact SOL`,(await page.locator('#buy-button').getAttribute('aria-label')).includes('1000')&&(await page.locator('#buy-button').getAttribute('aria-label')).includes('0.075078047 SOL'));await shot(page,`${name}-quote`);await reviewPurchase(page,{name,cost:expected.lamports,count:1000,initial:true});
    if(await page.locator('.key-price-preview').getAttribute('data-dialog')){await page.locator('.key-price-preview').click();await page.locator('#rules-dialog[open]').waitFor();check(`${name}: price explanation opens the curve chapter directly`,await page.locator('[data-learn-step="3"]').getAttribute('aria-selected')==='true');await page.locator('#rules-dialog .dialog-close').click();}
    await page.locator('#key-quantity').fill('1');data.set('sole');await page.waitForFunction(()=>Number(document.querySelector('#your-keys')?.textContent.replaceAll(',',''))===1000);check(`${name}: sole feeder retains all1000keys`,await numeric(page.locator('#your-keys'))===1000);check(`${name}: earned rewards remain separate from displayed jackpot`,await exactLamports(page.locator('#key-loot-value'))===BigInt(data.state.players.you.claimable)&&await exactLamports(page.locator('#pot-value'))===BigInt(previewJackpot(data.state)));await usdMatches(page,'jackpot-usd',previewJackpot(data.state),`${name}: funded jackpot updates its USD equivalent`);await gameRewardUsd(page,data.state.players.you.claimable,`${name}: earned rewards update their USD equivalent`);check(`${name}: entries-paid is not confused with earnedSOL`,await exactLamports(page.locator('#round-entry-spent'))===BigInt(data.contribution)&&data.contribution>data.state.players.you.claimable);await measured(page,`${name}/sole`);await shot(page,`${name}-sole`);await openGameRewards(page);await page.locator('#rewards-dialog[open]').waitFor();await page.locator('#claim-panel-game .claim-breakdown summary').first().click();await page.locator('#claim-paid-this-round').scrollIntoViewIfNeeded();check(`${name}: full entries-paid disclosure remains available in claims`,await page.locator('#claim-paid-this-round').isVisible()&&Math.round(await numeric(page.locator('#claim-paid-this-round'))*1e9)===data.contribution);await page.locator('#rewards-dialog .dialog-close').click();
    const priorEarned=data.state.players.you.claimable;data.set('outbid');await page.waitForFunction(address=>document.querySelector('#leader-name')?.textContent!== 'You'&&document.querySelector('#leader-name')?.textContent.includes(address),other.toBase58().slice(0,4));check(`${name}: outbid keeps keys and accumulated reward`,await numeric(page.locator('#your-keys'))===1000&&await exactLamports(page.locator('#key-loot-value'))>=BigInt(priorEarned));await measured(page,`${name}/outbid`);await shot(page,`${name}-outbid`);
    data.set('cap');await page.waitForFunction(()=>document.querySelector('#leader-name')?.textContent==='You');await page.locator('#key-quantity').fill('1000');await page.waitForFunction(()=>Number(document.querySelector('#preview-keys-after')?.textContent.replaceAll(',',''))===2000);check(`${name}: timer preview obeys original24-hourremaining cap`,Number(await page.locator('#preview-countdown').getAttribute('data-seconds'))===86400);const timeAddedLabel=(await page.locator('#purchase-time').textContent()).trim();check(`${name}: added-time label shows the cap rather than nominal500minutes (${timeAddedLabel})`,/^\d+ seconds$/.test(timeAddedLabel)&&parseInt(timeAddedLabel,10)<=12);await shot(page,`${name}-cap`);await reviewPurchase(page,{name:`${name}-capped`,cost:await exactLamports(page.locator('#purchase-cost')),count:1000,expectedClock:'24:00:00'});
    data.set('settled-other');await page.waitForFunction(()=>document.querySelector('#app')?.classList.contains('round-over'));check(`${name}: settled earned SOL stays claimable`,await exactLamports(page.locator('#key-loot-value'))===BigInt(data.state.players.you.claimable));check(`${name}: a newly observed buy and settlement announce the final outcome`,/jackpot|round complete/i.test(await page.locator('.arena-feedback__headline').textContent()));await measured(page,`${name}/settled`);await shot(page,`${name}-settled`);
    data.set('large');await page.waitForFunction(()=>Number(document.querySelector('#pot-value')?.dataset.lamports)>1_000_000_000_000);await usdMatches(page,'jackpot-usd',previewJackpot(data.state),`${name}: high-value rollover jackpot converts accurately`);await measured(page,`${name}/large-jackpot`);await shot(page,`${name}-large-jackpot`);
    check(`${name}: state-review flow never signs or broadcasts`,await page.evaluate(()=>window.__intuitiveQa.signCalls===0)&&!data.requests.includes('sendTransaction'));await context.close();
  }
  if(!['tutorial','intro','probe'].includes(focus)&&(!viewportFilter||viewportFilter==='phone')){
    const{page,context,data}=await openPage(390,844);await connect(page);await page.locator('#buy-button').click();await page.waitForFunction(()=>window.__intuitiveQa.signCalls===1);check('pending wallet approval blocks a duplicate feed',await page.locator('#buy-button').isDisabled());await measured(page,'phone/pending');await shot(page,'pending-wallet');await page.evaluate(()=>window.__intuitiveQa.release());await page.waitForFunction(()=>!document.querySelector('#buy-button').disabled);check('declined feed changes no account fixture and sends no transaction',data.name==='empty'&&!data.requests.includes('sendTransaction'));await context.close();
    const missing=await openPage(390,844,{initial:'sole',usdUnavailable:true});await connect(missing.page);await missing.page.waitForFunction(()=>document.querySelector('#key-loot-value')?.dataset.moneyState==='known');check('missing USD quote does not invent a zero-dollar value',await missing.page.locator('#jackpot-usd').isHidden()&&await missing.page.locator('#rewards-usd').isHidden()&&await missing.page.locator('#purchase-usd').isHidden());check('missing USD keeps real SOL readable',await missing.page.locator('#pot-value').isVisible()&&await missing.page.locator('#key-loot-value').isVisible()&&await missing.page.locator('#purchase-cost').isVisible()&&await exactLamports(missing.page.locator('#key-loot-value'))===BigInt(missing.data.state.players.you.claimable));await shot(missing.page,'missing-price');await missing.context.close();
    const holders=await openPage(390,844,{initial:'sole',holderAmount:25_000_000n});await connect(holders.page);await holders.page.waitForFunction(()=>document.querySelector('#holder-earn-amount')?.dataset.lamports==='25000000');if(await holders.page.locator('#holder-earn-usd').isVisible())await usdMatches(holders.page,'holder-earn-usd',25_000_000n,'token-holder allocation has its own accurate dollar value');check('holder and game rewards are not combined on either card',await exactLamports(holders.page.locator('#holder-earn-amount'))===25_000_000n&&await exactLamports(holders.page.locator('#key-loot-value'))===BigInt(holders.data.state.players.you.claimable));await holders.page.locator('[data-open-holder]').click();await holders.page.locator('#rewards-dialog[open]').waitFor();check('holder card opens the correct claim panel',await holders.page.locator('#claim-tab-holder').getAttribute('aria-selected')==='true'&&await exactLamports(holders.page.locator('#token-claimable'))===25_000_000n);await usdMatches(holders.page,'holder-claim-usd',25_000_000n,'compact holder card exposes its exact claim amount in the separate panel');await shot(holders.page,'holder-allocation');await holders.context.close();
    const proofFailure=await openPage(390,844,{initial:'sole',proofUnavailable:true});await connect(proofFailure.page);await proofFailure.page.locator('.rewards-button').click();await usdMatches(proofFailure.page,'game-claim-usd',proofFailure.data.state.players.you.claimable,'holder proof outage leaves independent gameUSD known');await proofFailure.page.locator('#claim-tab-holder').click();check('unknown holder allocation is not shown as zeroUSD',await proofFailure.page.locator('#holder-claim-usd').isHidden()&&/unavailable/i.test(await proofFailure.page.locator('#claim-holder-status').textContent()));await proofFailure.context.close();
  }
  if(focus==='intro'){
    for(const[caseName,options]of [['claim-link',{firstVisit:true,query:'?claim=game'}],['remembered-wallet',{firstVisit:true,remembered:true}]]){const{page,context}=await openPage(390,844,options);check(`${caseName}: first-visit guide does not interrupt the intended flow`,!await page.locator('#rules-dialog').isVisible());check(`${caseName}: skipped guide never signs`,await page.evaluate(()=>window.__intuitiveQa.signCalls===0));await context.close();}
  }
  check('no unexpected external access or browser exception',failures.length===0);await fs.writeFile(path.join(output,'report.json'),JSON.stringify({ok:true,checks,failures,measurements,scope:'Original-curve-generated synthetic RPC states and a refusing wallet; no funds or real chain transactions; no human usability claim.'},null,2));console.log(JSON.stringify({ok:true,checks:checks.length,output}));
}catch(error){if(activePage&&!activePage.isClosed())await shot(activePage,'failed');await fs.writeFile(path.join(output,'failure.json'),JSON.stringify({ok:false,error:error.message,checks,failures,measurements},null,2));throw error;}
finally{await browser?.close();await new Promise(resolve=>server?.httpServer?server.httpServer.close(resolve):resolve());}
