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

const output=path.resolve(process.env.PIGGY_CLAIM_QA_OUTPUT||'.openai/local/visual-qa/claim-story'),buildDir=path.join(output,'build');
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
  const requests=[];
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
  return{rpc,requests,manifest,proofError};
}

async function openPage(width,height,options={}){
  const data=fixture(options),context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1,reducedMotion:'reduce'}),page=await context.newPage();activePage=page;
  await context.addInitScript(()=>localStorage.setItem('piggy.intro.v1','seen'));
  page.on('pageerror',error=>failures.push(error.message));
  await page.route('**/*',async route=>{
    const url=new URL(route.request().url());
    if(url.pathname==='/claim-qa-config.json')return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(config)});
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
  await page.goto(`http://127.0.0.1:${server.config.preview.port}/${options.query||''}`,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelector('.demo-badge')?.textContent.includes('Mainnet'));
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
  await build({logLevel:'warn',build:{outDir:buildDir,emptyOutDir:true}});
  server=await preview({logLevel:'warn',build:{outDir:buildDir},preview:{host:'127.0.0.1',port:Number(process.env.PIGGY_CLAIM_QA_PORT||4326),strictPort:true}});
  browser=await chromium.launch({channel:'chrome',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  if(!['story','navigation','tutorial'].includes(mode)){
    if(mode!=='layout'){
    {
      const{page,context,data}=await openPage(1440,900);await rewards(page);check('disconnected claim flow asks for a wallet without claiming zero',await page.locator('#claim-connect-wallet').isVisible()&&await page.locator('#claim-button').isDisabled()&&await page.locator('#claim-token-button').isDisabled());await shot(page,'disconnected');await page.locator('#rewards-dialog .dialog-close').click();await connect(page);await rewards(page);
      check('connected zero rewards disable game claim',await page.locator('#claim-button').isDisabled());await page.locator('#claim-tab-holder').click();check('connected zero rewards disable holder claim',await page.locator('#claim-token-button').isDisabled());check('no reward fixture did not request signing',await page.evaluate(()=>window.__claimQa.signCalls===0));await shot(page,'zero-rewards');check('no transaction broadcast in zero fixture',!data.requests.includes('sendTransaction'));await context.close();
    }
    {
      const{page,context,data}=await openPage(1440,900,{gameAmount:20_000_000n,holderAmounts:[30_000_000n,20_000_000n]});await connect(page);await rewards(page);
      check('game gross matches the confirmed account fixture',await number(page.locator('#game-claimable'))===.02);check('game estimated net subtracts network fee',await number(page.locator('#claim-game-net'))===.01999);check('positive game claim is enabled',await page.locator('#claim-button').isEnabled());await shot(page,'positive-game');
      await page.locator('#claim-tab-holder').click();check('holder gross matches funded proof fixtures',await number(page.locator('#token-claimable'))===.05);check('holder estimated net subtracts both approval fees and receipt rents',await number(page.locator('#claim-holder-net'))===.04785656);check('positive holder claim is enabled',await page.locator('#claim-token-button').isEnabled());await shot(page,'positive-holder');
      await page.locator('#claim-token-button').click();await page.waitForFunction(()=>window.__claimQa.signCalls===1);check('awaiting approval disables repeat claim',await page.locator('#claim-token-button').isDisabled());check('pending action is explained in claim flow',/wallet|approv|confirm/i.test(await page.locator('#claim-flow-status').textContent()));await shot(page,'awaiting-wallet');await page.evaluate(()=>window.__claimQa.release());await page.waitForFunction(()=>document.querySelector('#claim-token-button')?.disabled===false);check('cancelled wallet request leaves reward available',await number(page.locator('#token-claimable'))===.05);check('cancelled request never broadcasts',!data.requests.includes('sendTransaction'));await shot(page,'cancelled-wallet');await context.close();
    }
    for(const[type,options]of [['game',{gameAmount:5_000n}],['holder',{holderAmounts:[100_000n]}]]){
      const{page,context}=await openPage(390,844,options);await connect(page);await rewards(page);await page.locator(`#claim-tab-${type}`).click();check(`${type} reward below cost is not presented as a profitable claim`,await number(page.locator(`#claim-${type}-net`))<0&&await page.locator(type==='game'?'#claim-button':'#claim-token-button').isDisabled());await shot(page,`below-cost-${type}`);await context.close();
    }
    for(const[type,options]of [['proof',{proofError:true,gameAmount:20_000_000n}],['fee',{feeError:true,gameAmount:20_000_000n,holderAmounts:[10_000_000n]}],['pending',{pending:true,gameAmount:20_000_000n,holderAmounts:[10_000_000n]}]]){
      const{page,context}=await openPage(390,844,options);await connect(page);await rewards(page);if(type==='proof'){await page.locator('#claim-tab-holder').click();check('unavailable holder proof is distinguished from a zero reward',/unavail|verif|refresh|temporar/i.test(await page.locator('#claim-holder-status').textContent()));await page.locator('#claim-tab-game').click();check('holder proof outage leaves independent game claim available',await page.locator('#claim-button').isEnabled());}else{check(`${type} unresolved state disables a new claim`,await page.locator('#claim-button').isDisabled());}await shot(page,type);await context.close();
    }
    }
    for(const[name,width,height]of [['desktop',1440,900],['phone',390,844],['tiny-phone',320,568],['landscape',844,390],['tiny-landscape',480,320]]){
      const{page,context}=await openPage(width,height,{gameAmount:20_000_000n,holderAmounts:[30_000_000n,20_000_000n]});await connect(page);await rewards(page);await layout(page,name);await shot(page,`${name}-claims`);await page.locator('#claim-tab-game').click();await page.keyboard.press('ArrowRight');check(`${name}: tabs support keyboard navigation`,await page.locator('#claim-tab-holder').getAttribute('aria-selected')==='true');
      await page.locator('#claim-tab-game').click();const example=page.locator('.claim-pool-example');await example.locator('summary').click();const caveat=example.locator('p').last();await caveat.scrollIntoViewIfNeeded();check(`${name}: separate-pools explanation remains reachable`,await caveat.evaluate(node=>{const r=node.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight;})&&/not 0.30 SOL profit/.test(await caveat.textContent()));check(`${name}: expanded explanation preserves no page scroll`,await page.evaluate(()=>scrollY===0&&document.documentElement.scrollHeight<=innerHeight));await shot(page,`${name}-pool-example`);await context.close();
    }
  }
  if(mode==='navigation'){
    for(const type of ['game','holder']){
      const{page,context}=await openPage(390,844,{query:`?claim=${type}`,gameAmount:20_000_000n,holderAmounts:[30_000_000n,20_000_000n]});
      await page.locator('#rewards-dialog[open]').waitFor();check(`${type} deep link opens the requested claim balance`,await page.locator(`#claim-tab-${type}`).getAttribute('aria-selected')==='true');
      await page.locator('#claim-connect-wallet').click();await page.locator('#wallet-dialog[open]').waitFor();await page.locator('[data-wallet-id]').filter({hasText:'Claim QA wallet'}).click();
      await page.locator('#rewards-dialog[open]').waitFor();await page.waitForFunction(address=>document.querySelector('#chain-wallet')?.textContent===address,wallet.toBase58());
      check(`${type} connect returns to the requested claim panel`,await page.locator(`#claim-panel-${type}`).isVisible());
      const details=page.locator(`#claim-${type}-cost-details`);await details.locator('summary').click();const note=page.locator(type==='game'?'#game-claim-cost':'#holder-claim-cost');await note.scrollIntoViewIfNeeded();
      check(`${type} fees and approval details are available before signing`,/wallet approval/.test(await note.textContent())&&await page.evaluate(()=>window.__claimQa.signCalls===0));
      await shot(page,`navigation-${type}`);await context.close();
    }
  }
  if(mode==='tutorial'){
    for(const[name,width,height]of [['tiny-phone',320,568],['tiny-landscape',480,320]]){
      const{page,context}=await openPage(width,height,{gameAmount:20_000_000n,holderAmounts:[30_000_000n]});await connect(page);await rewards(page);await readableText(page,'#claim-panel-game .claim-panel-intro,#claim-game-status,#claim-game-net,#claim-button',`${name}/claim`);await page.locator('#rewards-dialog .dialog-close').click();await page.locator('.help-button').click();await page.locator('#rules-dialog[open]').waitFor();
      for(const index of [0,1,2,3]){
        await page.locator(`[data-learn-step="${index}"]`).click();const panel=page.locator(`[data-learn-panel="${index}"]`);
        check(`${name}/tutorial${index+1}: exactly one practice panel is visible`,await panel.isVisible()&&await page.locator('[data-learn-panel]:visible').count()===1);
        if(index<3){
          check(`${name}/tutorial${index+1}: prior keys remain owned`,await page.locator('#learn-you-keys').textContent()==='10');
          check(`${name}/tutorial${index+1}: the new buyer changes the denominator`,await page.locator('#learn-other-keys').textContent()===(index?'1':'0')&&await page.locator('#learn-key-share').textContent()===(index?'90.9%':'100%'));
          check(`${name}/tutorial${index+1}: countdown follows purchases and expiry`,await page.locator('#learn-practice-clock').textContent()===(index===0?'1:05:00':index===1?'1:05:30':'00:00'));
        }
        if(index===0)check(`${name}/tutorial: more keys do not confer a stronger lead`,/One key would take the same lead/.test(await panel.textContent()));
        if(index===1)check(`${name}/tutorial: reward percentage has the correct denominator`,/not 90.9% of their whole payment/.test(await panel.textContent()));
        if(index===2)check(`${name}/tutorial: losing the lead preserves accrued SOL`,/other buyer wins/.test(await panel.textContent())&&/earned SOL is still yours/.test(await panel.textContent()));
        if(index===3){
          for(const funding of [0,100,1000,10000]){
            await page.locator(`[data-curve-funding="${funding}"]`).click();
            const expected=costForExactKeys(BigInt(funding)*1_000_000_000n,1000n).lamports;
            check(`${name}/tutorial: ${funding} SOL curve example uses source pricing`,BigInt(Math.round(await number(page.locator('#learn-curve-cost'))*1e9))===expected);
          }
          check(`${name}/tutorial: price example is hypothetical and not resale value`,/hypothetical/.test(await panel.textContent())&&/cannot be sold back/.test(await panel.textContent()));
        }
        await panel.scrollIntoViewIfNeeded();await shot(page,`${name}-tutorial-${index+1}`);
        const next=page.locator('#learn-next');await next.scrollIntoViewIfNeeded();
        check(`${name}/tutorial${index+1}: next action remains reachable`,await next.evaluate(node=>{const r=node.getBoundingClientRect(),hit=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return r.width>=44&&r.height>=44&&r.top>=0&&r.bottom<=innerHeight&&(hit===node||node.contains(hit));}));
        const story=page.locator('#rules-dialog a[href^="/fomo3d/"]');await story.scrollIntoViewIfNeeded();
        check(`${name}/tutorial${index+1}: story link remains reachable`,await story.evaluate(node=>{const r=node.getBoundingClientRect(),hit=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return r.top>=0&&r.bottom<=innerHeight&&r.width>=40&&(hit===node||node.contains(hit));}));
        check(`${name}/tutorial${index+1}: page stays fixed while guide scrolls`,await page.evaluate(()=>scrollY===0&&document.documentElement.scrollHeight<=innerHeight));
      }
      await page.keyboard.press('Escape');await page.locator('.help-button').click();
      check(`${name}/tutorial: reopened practice resets independently of game state`,await page.locator('[data-learn-step="0"]').getAttribute('aria-selected')==='true'&&await page.locator('#learn-other-keys').textContent()==='0');
      check(`${name}/tutorial: practice does not request a wallet signature`,await page.evaluate(()=>window.__claimQa.signCalls===0));
      await context.close();
    }
  }
  if(!['claims','navigation','layout','tutorial'].includes(mode)){
    const storyFindings=[];
    for(const[name,width,height]of [['desktop',1440,900],['phone',390,844],['tiny-phone',320,568],['landscape',844,390],['tiny-landscape',480,320]]){
      const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1,reducedMotion:'reduce'}),page=await context.newPage();activePage=page;page.on('pageerror',error=>failures.push(error.message));
      await page.route('**/*',route=>{if(new URL(route.request().url()).hostname==='127.0.0.1')return route.continue();failures.push('Unexpected story external request');return route.abort();});
      await page.goto(`http://127.0.0.1:${server.config.preview.port}/fomo3d/`,{waitUntil:'domcontentloaded'});
      check(`${name}: history page is a real built entry`,await page.title().then(title=>title.includes('PIGGY'))&&await page.locator('.story-chapter').count()===5);
      for(const id of ['origin','incentives','ending','compare','piggy']){
        await page.locator(`[data-chapter="${id}"]`).click();await page.locator(`#${id}:not([hidden])`).waitFor();
        const sizing=await page.locator(`#${id}`).evaluate(chapter=>{
          const main=document.querySelector('#story-main').getBoundingClientRect(),text=[...chapter.querySelectorAll('h1,h2,p,th,td,.archive-label,.archive-clock,.archive-prize,.archive-note,#role-headline,#role-note,.piggy-rule')].filter(node=>node.getClientRects().length&&getComputedStyle(node).display!=='none');
          const outside=text.map(node=>{const r=node.getBoundingClientRect();return{text:node.textContent.trim().slice(0,75),top:Math.round(r.top),bottom:Math.round(r.bottom),left:Math.round(r.left),right:Math.round(r.right),font:getComputedStyle(node).fontSize};}).filter(r=>r.left< -1||r.right>innerWidth+1||r.top<main.top-1||r.bottom>main.bottom+1);
          return{outside,pageNoScroll:document.documentElement.scrollWidth<=innerWidth&&document.documentElement.scrollHeight<=innerHeight&&scrollY===0};
        });
        if(!sizing.pageNoScroll||sizing.outside.length)storyFindings.push({name,id,...sizing});
        await fs.writeFile(path.join(output,'story-layout-findings.json'),JSON.stringify(storyFindings,null,2));
        check(`${name}/${id}: exactly one chapter is visible`,await page.locator('.story-chapter:not([hidden])').count()===1);
        await readableText(page,`#${id} .story-lead,#${id} .story-support,#${id} .comparison-table th,#${id} .comparison-table td`,`${name}/${id}`);
        await shot(page,`story-${name}-${id}`);
        if(id==='incentives'){
          await page.locator('#role-keys').focus();await page.keyboard.press('ArrowRight');check(`${name}: incentive tabs support keyboard and explain jackpot`,await page.locator('#role-last').getAttribute('aria-selected')==='true'&&/jackpot/i.test(await page.locator('#role-headline').textContent()));
          await page.keyboard.press('Home');check(`${name}: key incentive explains source of rewards`,/later buys/i.test(await page.locator('#role-headline').textContent()));
        }
        if(id==='compare'&&await page.locator('#compare-rewards').isVisible()){
          await page.locator('#compare-rewards').click();check(`${name}: comparison switches to rewards`,await page.locator('#compare-rewards').getAttribute('aria-selected')==='true'&&await page.locator('[data-compare-set="rewards"]').first().isVisible());
          const hiddenGame=await page.locator('[data-compare-set="game"]').first().isVisible();check(`${name}: compact comparison hides the other rows`,!hiddenGame);
          const overflow=await page.locator('#compare').evaluate(chapter=>{const box=document.querySelector('#story-main').getBoundingClientRect();return [...chapter.querySelectorAll('h2,p,th,td')].filter(node=>node.getClientRects().length).map(node=>({text:node.textContent.trim().slice(0,70),r:node.getBoundingClientRect()})).filter(({r})=>r.left< -1||r.right>innerWidth+1||r.top<box.top-1||r.bottom>box.bottom+1).map(({text})=>text);});if(overflow.length)storyFindings.push({name,id:'compare-rewards',outside:overflow});
          await shot(page,`story-${name}-compare-rewards`);await page.locator('#compare-rewards').focus();await page.keyboard.press('Home');check(`${name}: compact comparison supports keyboard`,await page.locator('#compare-game').getAttribute('aria-selected')==='true');
        }
      }
      check(`${name}: final chapter exposes correct claim guide link`,await page.locator('.story-claim').getAttribute('href')==='/?claim=game');
      await page.locator('[data-chapter="origin"]').click();await page.locator('#origin [data-sources]').click();await page.locator('#story-sources[open]').waitFor();
      const sources=page.locator('#story-sources');check(`${name}: sources dialog stays within viewport`,await sources.evaluate(node=>{const r=node.getBoundingClientRect();return r.left>=-1&&r.right<=innerWidth+1&&r.top>=-1&&r.bottom<=innerHeight+1;}));
      const links=await sources.locator('li a').evaluateAll(nodes=>nodes.map(node=>({href:node.href,rel:node.rel})));check(`${name}: cited sources use HTTPS and opener protection`,links.length>=3&&links.every(link=>link.href.startsWith('https://')&&link.rel.includes('noopener')));
      await sources.locator('.sources-return').scrollIntoViewIfNeeded();check(`${name}: last sources action remains reachable`,await sources.locator('.sources-return').evaluate(node=>{const r=node.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight;}));
      await shot(page,`story-${name}-sources`);await page.keyboard.press('Escape');check(`${name}: Escape closes sources`,!await sources.isVisible());
      await page.locator('#origin-title').focus();await page.keyboard.press('ArrowRight');check(`${name}: chapter keyboard navigation updates URL`,new URL(page.url()).hash==='#incentives');await page.goBack();check(`${name}: browser back restores prior chapter`,await page.locator('#origin').isVisible());
      await context.close();
    }
    await fs.writeFile(path.join(output,'story-layout-findings.json'),JSON.stringify(storyFindings,null,2));
    check('all story text is within the visible content area without page scrolling',storyFindings.length===0);
  }
  check('no unexpected request or browser exception',failures.length===0);
  await fs.writeFile(path.join(output,'report.json'),JSON.stringify({ok:true,checks,failures,textMetrics,scope:'Mock public RPC and refusing Wallet Standard signer; no real wallet or chain transaction.'},null,2));console.log(JSON.stringify({ok:true,checks:checks.length,output}));
}catch(error){if(activePage&&!activePage.isClosed())await shot(activePage,'failed');await fs.writeFile(path.join(output,'failure.json'),JSON.stringify({ok:false,error:error.message,checks,failures},null,2));throw error;}
finally{await browser?.close();await new Promise(resolve=>server?.httpServer?server.httpServer.close(resolve):resolve());}
