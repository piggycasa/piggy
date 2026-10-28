/** Isolated claim/story browser QA. Fixture public keys have no funded accounts;
 * every RPC is intercepted and the injected wallet can only reject signing. */
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {build,preview} from 'vite';
import {chromium} from '@playwright/test';
import {Keypair,SystemProgram,SYSVAR_CLOCK_PUBKEY} from '@solana/web3.js';
import * as sdk from '../src/solana-instructions.mjs';
import {holderMerkleTree} from '../src/solana-holder.mjs';
import {CLUSTER_GENESIS} from '../src/solana-config.mjs';
import {base58Encode} from '../src/solana-signature.mjs';
import {costForExactKeys} from '../src/solana-curve.mjs';

const output=path.resolve(process.env.PIGGY_LEGACY_QA_OUTPUT||'.openai/local/visual-qa/legacy-claims-final'),buildDir=path.join(output,'build');
const mode=process.env.PIGGY_CLAIM_QA_FOCUS||'all';
const [program,mint,wallet,tokenAccount]=Array.from({length:4},()=>Keypair.generate().publicKey),version=6811n;
const game=sdk.gameAddress(program,version),holder=sdk.holderConfigAddress(program,game),vault=sdk.holderVaultAddress(program,game),round=sdk.roundAddress(program,1n,version),player=sdk.playerAddress(program,wallet,1n,version);
const now=BigInt(Math.floor(Date.now()/1000));
const config={schemaVersion:1,cluster:'mainnet-beta',genesisHash:CLUSTER_GENESIS['mainnet-beta'],mainnetEnabled:true,rpcUrl:'https://claim-qa-rpc.invalid/',proofIndexUrl:'https://claim-qa-proofs.invalid/proofs/index.json',programId:program.toBase58(),piggyMint:mint.toBase58(),gameVersion:String(version),purchaseGuardVersion:1};
const account=(data,owner=program,executable=false)=>({owner:owner.toBase58(),data:[data.toString('base64'),'base64'],lamports:1,executable,rentEpoch:0});
const blockhash=Keypair.generate().publicKey.toBase58(),checks=[],failures=[],textMetrics=[];
const check=(label,value)=>{assert.ok(value,label);checks.push(label);};
let server,browser,activePage;

function fixture({gameAmount=0n,holderAmounts=[],proofError=false,feeError=false}={}){
  const total=holderAmounts.reduce((a,b)=>a+b,0n),accounts=new Map();
  accounts.set(program.toBase58(),account(Buffer.alloc(0),program,true));
  accounts.set(game.toBase58(),account(Buffer.concat([Buffer.from([3]),...[1n,3600n,30n,86400n,version].map(sdk.u64),sdk.NATIVE_MINT.toBuffer(),wallet.toBuffer(),wallet.toBuffer(),vault.toBuffer()])));
  accounts.set(holder.toBase58(),account(Buffer.concat([Buffer.from('PHCFG001'),game.toBuffer(),wallet.toBuffer(),mint.toBuffer(),sdk.NATIVE_MINT.toBuffer(),vault.toBuffer(),...[total,BigInt(holderAmounts.length+1),total,0n].map(sdk.u64),Buffer.from([1])])));
  const roundValues=[100n,100_000_000n,100_000_000n,0n,0n,0n,0n,0n,0n,0n,0n,gameAmount,20_000_000n,0n,0n,0n,0n];
  const roundData=Buffer.concat([Buffer.from([4]),sdk.u64(1n),wallet.toBuffer(),Buffer.from([0]),sdk.u64(now-10n),sdk.u64(now+3600n),Buffer.from([0]),...roundValues.map(sdk.u128),sdk.u64(0n),...Array.from({length:4},()=>sdk.u128(0n))]);
  assert.equal(sdk.decodeRound(roundData).accum_f3d_share,gameAmount);
  accounts.set(round.toBase58(),account(roundData));
  const playerData=Buffer.concat([Buffer.from([5]),wallet.toBuffer(),sdk.u64(1n),SystemProgram.programId.toBuffer(),...[5n,1_000_000n,0n,0n,0n,0n,0n,0n,0n,gameAmount].map(sdk.u128)]);
  assert.equal(sdk.decodePlayer(playerData).accum_f3d,gameAmount);
  accounts.set(player.toBase58(),account(playerData));
  const mintData=Buffer.alloc(82);mintData[44]=6;mintData[45]=1;mintData.writeBigUInt64LE(1_000_000_000_000_000n,36);accounts.set(mint.toBase58(),account(mintData,sdk.TOKEN_PROGRAM_ID));
  const clock=Buffer.alloc(40);clock.writeBigInt64LE(now,32);accounts.set(SYSVAR_CLOCK_PUBKEY.toBase58(),account(clock,SystemProgram.programId));
  const tokenData=Buffer.alloc(165);mint.toBuffer().copy(tokenData);wallet.toBuffer().copy(tokenData,32);tokenData.writeBigUInt64LE(150_000_000n,64);tokenData[108]=1;
  const token=account(tokenData,sdk.TOKEN_PROGRAM_ID),epochs=[];
  for(const[index,amount]of holderAmounts.entries()){
    const epoch=BigInt(index+1),tree=holderMerkleTree([{wallet,amount}],{programId:program,game,epoch}),address=sdk.holderEpochAddress(program,holder,epoch);
    accounts.set(address.toBase58(),account(Buffer.concat([Buffer.from('PHEPO001'),holder.toBuffer(),game.toBuffer(),sdk.u64(epoch),sdk.u64(490n),Buffer.from(tree.root),sdk.u64(amount),sdk.u64(0n),Buffer.from([1])])));
    epochs.push({epoch:String(epoch),amount:String(amount),proof:[]});
  }
  const manifest={schemaVersion:1,cluster:config.cluster,genesisHash:config.genesisHash,programId:config.programId,gameVersion:config.gameVersion,piggyMint:config.piggyMint,wallet:wallet.toBase58(),epochs};
  const requests=[],configRequests=[],modelRequests=[];
  function rpc(request){
    requests.push(request.method);const params=request.params||[],context={slot:500};let result;
    switch(request.method){
      case'getGenesisHash':result=config.genesisHash;break;
      case'getMultipleAccounts':result={context,value:params[0].map(key=>accounts.get(key)||null)};break;
      case'getAccountInfo':result={context,value:accounts.get(params[0])||null};break;
      case'getProgramAccounts':result=[{pubkey:player.toBase58(),account:accounts.get(player.toBase58())}];break;
      case'getBalance':result={context,value:10_000_000_000};break;
      case'getTokenAccountsByOwner':result={context,value:[{pubkey:tokenAccount.toBase58(),account:token}]};break;
      case'getLatestBlockhash':result={context,value:{blockhash,lastValidBlockHeight:1000}};break;
      case'getMinimumBalanceForRentExemption':result=params[0]===81?1_061_720:params[0]===165?2_039_280:1_833_880;break;
      case'getFeeForMessage':result={context,value:feeError?null:10_000};break;
      case'getSlot':case'getBlockHeight':result=500;break;
      case'getSignatureStatuses':result={context,value:params[0].map(()=>null)};break;
      case'simulateTransaction':result={context,value:{err:null,logs:[],accounts:null,unitsConsumed:100_000,returnData:null,innerInstructions:null}};break;
      default:failures.push(`Unexpected RPC ${request.method}`);return{jsonrpc:'2.0',id:request.id,error:{code:-32601,message:'Unexpected QA RPC method'}};
    }
    return{jsonrpc:'2.0',id:request.id,result};
  }
  return{rpc,requests,manifest,proofError,configRequests,modelRequests};
}

async function openPage(width,height,options={}){
  const data=fixture(options),context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1,reducedMotion:'reduce'}),page=await context.newPage();activePage=page;
  await context.addInitScript(()=>localStorage.setItem('piggy.intro.v1','seen'));
  page.on('pageerror',error=>failures.push(error.message));
  await page.route('**/*',async route=>{
    const url=new URL(route.request().url());
    if(url.pathname.endsWith('.glb'))data.modelRequests.push(url.pathname);
    if(url.pathname==='/claim-qa-config.json'||url.pathname==='/piggy-test-config.json'){data.configRequests.push(url.pathname);return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(config)});}
    if(url.hostname==='claim-qa-rpc.invalid'){if(route.request().method()==='OPTIONS')return route.fulfill({status:204,headers:{'access-control-allow-origin':'*','access-control-allow-headers':'*'}});return route.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify(data.rpc(route.request().postDataJSON()))});}
    if(url.hostname==='claim-qa-proofs.invalid')return route.fulfill(data.proofError?{status:503,headers:{'access-control-allow-origin':'*'},body:'Unavailable'}:{status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify(data.manifest)});
    if(url.hostname==='127.0.0.1')return route.continue();
    failures.push(`Unexpected external request ${url.origin}`);return route.abort();
  });
  await page.addInitScript(({address,bytes,pending,config,signature})=>{
    const account={address,publicKey:new Uint8Array(bytes),chains:['solana:mainnet'],features:['solana:signTransaction']},listeners=new Set();let accounts=[];
    window.__claimQa={signCalls:0,connectCalls:0,release:null};
    const wallet={version:'1.0.0',name:'Claim QA wallet',icon:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',chains:['solana:mainnet'],get accounts(){return accounts;},features:{
      'standard:connect':{version:'1.0.0',connect:async()=>{window.__claimQa.connectCalls++;accounts=[account];for(const f of listeners)f({accounts});return{accounts};}},
      'standard:disconnect':{version:'1.0.0',disconnect:async()=>{accounts=[];for(const f of listeners)f({accounts});}},
      'standard:events':{version:'1.0.0',on:(_,fn)=>{listeners.add(fn);return()=>listeners.delete(fn);}},
      'solana:signTransaction':{version:'1.0.0',supportedTransactionVersions:['legacy'],signTransaction:async()=>{window.__claimQa.signCalls++;await new Promise(resolve=>window.__claimQa.release=resolve);throw new Error('User rejected transaction request');}},
    }};
    const register=api=>api.register(wallet);window.addEventListener('wallet-standard:app-ready',event=>register(event.detail));window.dispatchEvent(new CustomEvent('wallet-standard:register-wallet',{detail:register}));
    if(pending)sessionStorage.setItem(`piggy.pending.v1:${config.genesisHash}:${config.programId}:${config.gameVersion}:${address}`,JSON.stringify({signature,lastValidBlockHeight:1000}));
  },{address:wallet.toBase58(),bytes:[...wallet.toBytes()],pending:options.pending,config,signature:base58Encode(new Uint8Array(64).fill(7))});
  await page.goto(`http://127.0.0.1:${server.config.preview.port}/test-claims/${options.query||''}`,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(program=>document.querySelector('#chain-program')?.textContent===program,config.programId);
  return{page,context,data};
}
async function rewards(page){await page.locator('.rewards-button').click();await page.locator('#rewards-dialog[open]').waitFor();}
async function connect(page){await page.locator('.wallet-button').click();await page.locator('[data-wallet-id]').filter({hasText:'Claim QA wallet'}).click();await page.waitForFunction(address=>document.querySelector('#chain-wallet')?.textContent===address,wallet.toBase58());const toast=page.locator('#toast-dismiss');if(await toast.isVisible())await toast.click();}
async function shot(page,name){await page.screenshot({path:path.join(output,`${name}.png`)});}
const number=async locator=>parseFloat((await locator.textContent()).replace(/[−,]/g,value=>value==='−'?'-':''));
async function readableText(page,selector,label,{minimumFont=11}={}){
  const rows=await page.locator(selector).evaluateAll(nodes=>{
    const rgba=value=>{const c=value.match(/[\d.]+/g)?.map(Number)||[0,0,0,0];return[c[0]/255,c[1]/255,c[2]/255,c[3]??1];},over=(fg,bg)=>fg.slice(0,3).map((n,i)=>n*fg[3]+bg[i]*(1-fg[3])),lum=c=>c.map(n=>n<=.04045?n/12.92:((n+.055)/1.055)**2.4).reduce((v,n,i)=>v+n*[.2126,.7152,.0722][i],0);
    return nodes.filter(node=>node.getClientRects().length).map(node=>{const chain=[];for(let p=node;p;p=p.parentElement)chain.push(p);let bg=[47/255,36/255,117/255];for(const parent of chain.reverse()){const c=rgba(getComputedStyle(parent).backgroundColor);bg=over(c,bg);}const style=getComputedStyle(node),fg=over(rgba(style.color),bg),a=lum(fg),b=lum(bg);return{text:node.textContent.trim().slice(0,70),font:parseFloat(style.fontSize),contrast:(Math.max(a,b)+.05)/(Math.min(a,b)+.05)};});
  });
  textMetrics.push({label,rows});check(`${label}: primary copy has readable font size and contrast`,rows.length>0&&rows.every(row=>row.font>=minimumFont&&row.contrast>=4.5));
}
async function layout(page,label){
  check(`${label}: page stays fixed`,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth&&document.documentElement.scrollHeight<=innerHeight&&scrollY===0));
  const dialog=page.locator('#rewards-dialog');check(`${label}: dialog fits viewport`,await dialog.evaluate(node=>{const r=node.getBoundingClientRect();return r.left>=-1&&r.top>=-1&&r.right<=innerWidth+1&&r.bottom<=innerHeight+1;}));
  for(const type of ['game','holder']){
    await page.locator(`#claim-tab-${type}`).click();const panel=page.locator(`#claim-panel-${type}`);check(`${label}: ${type} panel is the only visible panel`,await panel.isVisible()&&!await page.locator(`#claim-panel-${type==='game'?'holder':'game'}`).isVisible());
    const button=page.locator(type==='game'?'#claim-button':'#claim-token-button');await button.scrollIntoViewIfNeeded();check(`${label}: ${type} action is reachable`,await button.evaluate(node=>{const r=node.getBoundingClientRect(),d=node.closest('dialog').getBoundingClientRect(),hit=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return r.width>=40&&r.height>=40&&r.top>=d.top&&r.bottom<=d.bottom&&(hit===node||node.contains(hit));}));
  }
}

try{
  await fs.mkdir(output,{recursive:true});process.env.VITE_PIGGY_CONFIG_URL='/claim-qa-config.json';
  const shipped=JSON.parse(await fs.readFile('public/piggy-test-config.json','utf8'));
  check('shipped legacy config pins the pre-launch version',shipped.gameVersion==='1793081200001'&&shipped.programId==='3c5jUPmmXR3zV47uGW4YjSeSQhHKk2H6yj5U5JcfvbfK');
  await build({logLevel:'warn',build:{outDir:buildDir,emptyOutDir:true}});
  server=await preview({logLevel:'warn',build:{outDir:buildDir},preview:{host:'127.0.0.1',port:Number(process.env.PIGGY_LEGACY_QA_PORT||4334),strictPort:true}});
  browser=await chromium.launch({channel:'chrome',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  for(const[name,width,height]of[['phone',390,844],['actual-pane',794,783],['tiny-landscape',480,320]]){
    const{page,context,data}=await openPage(width,height,{query:'?demo=1&config=https%3A%2F%2Fevil.invalid%2Foverride.json',gameAmount:20_000_000n,holderAmounts:[30_000_000n,20_000_000n]});
    await page.locator('#rewards-dialog[open]').waitFor();
    check(`${name}: legacy route ignores demo and opens real-wallet game claims`,await page.locator('#claim-tab-game').getAttribute('aria-selected')==='true'&&await page.locator('#claim-connect-wallet').isVisible()&&await page.locator('.demo-badge').textContent().then(t=>t.includes('Test claims')&&t.includes('SOL')));
    check(`${name}: only the fixed old-config path was selected`,data.configRequests.length===1&&data.configRequests[0]==='/piggy-test-config.json');
    check(`${name}: no pig model or active entry control is exposed`,data.modelRequests.length===0&&await page.locator('#safe-art canvas').count()===0&&await page.locator('#arena').isHidden()&&await page.locator('#buy-button').isDisabled());
    await page.locator('#claim-connect-wallet').click();await page.locator('#wallet-dialog[open]').waitFor();await page.locator('[data-wallet-id]').filter({hasText:'Claim QA wallet'}).click();await page.locator('#rewards-dialog[open]').waitFor();await page.waitForFunction(address=>document.querySelector('#chain-wallet')?.textContent===address,wallet.toBase58());
    check(`${name}: connection reads the legacy fixture program`,await page.locator('#chain-program').textContent()===config.programId);
    check(`${name}: old game SOL is readable after connection`,await number(page.locator('#game-claimable'))===.02);
    await page.evaluate(()=>{document.querySelector('#buy-button').dispatchEvent(new MouseEvent('click',{bubbles:true}));for(const node of document.querySelectorAll('[data-chain-action]'))node.dispatchEvent(new MouseEvent('click',{bubbles:true}));});
    await page.waitForTimeout(100);
    check(`${name}: feed/start/admin dispatch cannot ask for a signature`,await page.evaluate(()=>window.__claimQa.signCalls===0)&&!data.requests.includes('sendTransaction'));
    for(const[type,amount]of[['game',.02],['holder',.05]]){
      await page.locator(`#claim-tab-${type}`).click();const button=page.locator(type==='game'?'#claim-button':'#claim-token-button'),value=page.locator(type==='game'?'#game-claimable':'#token-claimable');
      await button.scrollIntoViewIfNeeded();check(`${name}: ${type} legacy claim amount and control are available`,await number(value)===amount&&await button.isEnabled());
      const before=await page.evaluate(()=>window.__claimQa.signCalls);await button.click();await page.waitForFunction(count=>window.__claimQa.signCalls===count,before+1);
      check(`${name}: ${type} claim reaches wallet approval and blocks repeats`,await button.isDisabled()&&/wallet|approv|confirm/i.test(await page.locator('#claim-flow-status').textContent()));
      await shot(page,`${name}-${type}-approval`);await page.evaluate(()=>window.__claimQa.release());await page.waitForFunction(selector=>!document.querySelector(selector).disabled,type==='game'?'#claim-button':'#claim-token-button');
      check(`${name}: rejecting ${type} claim preserves its balance and sends nothing`,await number(value)===amount&&!data.requests.includes('sendTransaction'));
    }
    await layout(page,`${name}/legacy`);await readableText(page,'#claim-panel-holder .claim-panel-intro,#claim-holder-status,#claim-token-button',`${name}/legacy-text`);await shot(page,`${name}-claims`);
    await page.locator('#rewards-dialog .dialog-close').click();check(`${name}: closing claims exposes a fixed landing and live-game link`,await page.locator('.test-claims-landing').isVisible()&&await page.locator('.test-claims-landing>a').getAttribute('href')==='/'&&await page.evaluate(()=>document.documentElement.scrollHeight<=innerHeight&&document.documentElement.scrollWidth<=innerWidth));
    await shot(page,`${name}-landing`);await page.locator('#open-test-claims').click();await page.locator('#rewards-dialog[open]').waitFor();check(`${name}: landing reopens game claims`,await page.locator('#claim-tab-game').getAttribute('aria-selected')==='true');
    check(`${name}: legacy claim test never broadcast a transaction`,!data.requests.includes('sendTransaction'));await context.close();
  }
  check('legacy UI produced no unexpected requests or browser exceptions',failures.length===0);await fs.writeFile(path.join(output,'report.json'),JSON.stringify({ok:true,checks,failures,scope:'Fixed legacy pathname, synthetic old-config RPC/proofs and refusing signer. No wallet, real account or transaction broadcast.'},null,2));console.log(JSON.stringify({ok:true,checks:checks.length,output}));
}catch(error){if(activePage&&!activePage.isClosed())await shot(activePage,'failed');await fs.writeFile(path.join(output,'failure.json'),JSON.stringify({ok:false,error:error.message,checks,failures},null,2));throw error;}
finally{await browser?.close();await new Promise(resolve=>server?.httpServer?server.httpServer.close(resolve):resolve());}
