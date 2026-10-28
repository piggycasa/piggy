/** Isolated Wallet Standard browser QA. No wallet secret, signer or network debit exists. */
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {build,preview} from 'vite';
import {chromium} from '@playwright/test';
import {Keypair,SystemProgram,SYSVAR_CLOCK_PUBKEY} from '@solana/web3.js';
import * as sdk from '../src/solana-instructions.mjs';
import {CLUSTER_GENESIS} from '../src/solana-config.mjs';
import {base58Encode} from '../src/solana-signature.mjs';

const output=path.resolve(process.env.PIGGY_WALLET_QA_OUTPUT||'.openai/local/visual-qa/wallet-connector'),buildDir=path.join(output,'build');
const emptyOnly=process.env.PIGGY_WALLET_QA_FOCUS==='empty';
const keys=Array.from({length:6},()=>Keypair.generate().publicKey),[program,mint,...wallets]=keys,version=6789n;
const game=sdk.gameAddress(program,version),holder=sdk.holderConfigAddress(program,game),vault=sdk.holderVaultAddress(program,game),round=sdk.roundAddress(program,1n,version);
const now=BigInt(Math.floor(Date.now()/1000)),owner=wallets[0];
const config={schemaVersion:1,cluster:'mainnet-beta',genesisHash:CLUSTER_GENESIS['mainnet-beta'],mainnetEnabled:true,rpcUrl:'https://wallet-qa-rpc.invalid/',proofIndexUrl:'https://wallet-qa-proofs.invalid/proofs/index.json',programId:program.toBase58(),piggyMint:mint.toBase58(),gameVersion:version.toString(),purchaseGuardVersion:1};
const account=(data,ownerAddress=program,executable=false)=>({owner:ownerAddress.toBase58(),data:[data.toString('base64'),'base64'],lamports:1,executable,rentEpoch:0});
const gameData=Buffer.concat([Buffer.from([3]),...[1n,3600n,30n,86400n,version].map(sdk.u64),sdk.NATIVE_MINT.toBuffer(),owner.toBuffer(),owner.toBuffer(),vault.toBuffer()]);
const holderData=Buffer.concat([Buffer.from('PHCFG001'),game.toBuffer(),owner.toBuffer(),mint.toBuffer(),sdk.NATIVE_MINT.toBuffer(),vault.toBuffer(),...Array.from({length:4},()=>sdk.u64(0n)),Buffer.from([1])]);
const roundData=Buffer.concat([Buffer.from([4]),sdk.u64(1n),SystemProgram.programId.toBuffer(),Buffer.from([0]),sdk.u64(now-10n),sdk.u64(now+3600n),Buffer.from([0]),...Array.from({length:17},()=>sdk.u128(0n)),sdk.u64(0n),...Array.from({length:4},()=>sdk.u128(0n))]);
const mintData=Buffer.alloc(82);mintData[44]=6;mintData[45]=1;mintData.writeBigUInt64LE(1_000_000_000_000_000n,36);
const clock=Buffer.alloc(40);clock.writeBigInt64LE(now,32);
const accounts=new Map([[program.toBase58(),account(Buffer.alloc(0),program,true)],[game.toBase58(),account(gameData)],[holder.toBase58(),account(holderData)],[round.toBase58(),account(roundData)],[mint.toBase58(),account(mintData,sdk.TOKEN_PROGRAM_ID)],[SYSVAR_CLOCK_PUBKEY.toBase58(),account(clock,SystemProgram.programId)]]);
const blockhash=Keypair.generate().publicKey.toBase58(),checks=[],requests=[],failures=[];
const check=(label,value)=>{assert.ok(value,label);checks.push(label);};
let server,browser,activePage;

function rpcResponse(request) {
  requests.push(request.method);const params=request.params||[],context={slot:500};let result;
  switch(request.method){
    case'getGenesisHash':result=config.genesisHash;break;
    case'getMultipleAccounts':result={context,value:params[0].map(key=>accounts.get(key)||null)};break;
    case'getAccountInfo':result={context,value:accounts.get(params[0])||null};break;
    case'getProgramAccounts':result=[];break;
    case'getBalance':result={context,value:10_000_000_000*(wallets.findIndex(key=>key.toBase58()===params[0])+1)};break;
    case'getTokenAccountsByOwner':result={context,value:[]};break;
    case'getLatestBlockhash':result={context,value:{blockhash,lastValidBlockHeight:1000}};break;
    case'getMinimumBalanceForRentExemption':result=params[0]===233?1_833_880:1_488_440;break;
    case'getFeeForMessage':result={context,value:10_000};break;
    case'getSlot':result=500;break;
    case'getBlockHeight':result=500;break;
    case'getSignatureStatuses':result={context,value:params[0].map(()=>null)};break;
    default:failures.push(`Unexpected RPC ${request.method}`);return{jsonrpc:'2.0',id:request.id,error:{code:-32601,message:'Unexpected QA RPC method'}};
  }
  return{jsonrpc:'2.0',id:request.id,result};
}

async function injectStandards(page,{initial=true}={}) {
  await page.addInitScript(({addresses,initial})=>{
    const registry=new Map(),counts={connect:0,sign:0,disconnect:0,options:[]};
    const icon='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
    function register(name,index=0,{accountChain='solana:mainnet',walletChain='solana:mainnet'}={}) {
      const listeners=new Set(),unregisters=[];let connected=[];
      const account=which=>({address:addresses[which].address,publicKey:new Uint8Array(addresses[which].bytes),chains:[accountChain],features:['solana:signTransaction']});
      const wallet={version:'1.0.0',name,icon,chains:[walletChain],get accounts(){return connected;},features:{
        'standard:connect':{version:'1.0.0',connect:async options=>{counts.connect++;counts.options.push(options??null);if(window.__qaReject===name){window.__qaReject=null;throw new Error('User rejected connection');}connected=[account(index)];for(const fn of listeners)fn({accounts:connected});return{accounts:connected};}},
        'standard:disconnect':{version:'1.0.0',disconnect:async()=>{counts.disconnect++;connected=[];for(const fn of listeners)fn({accounts:connected});}},
        'standard:events':{version:'1.0.0',on:(event,listener)=>{if(event==='change')listeners.add(listener);return()=>listeners.delete(listener);}},
        'solana:signTransaction':{version:'1.0.0',supportedTransactionVersions:['legacy',0],signTransaction:async()=>{counts.sign++;throw new Error('QA never permits signing');}},
      }};
      const callback=api=>{unregisters.push(api.register(wallet));};
      const ready=event=>callback(event.detail);window.addEventListener('wallet-standard:app-ready',ready);window.dispatchEvent(new CustomEvent('wallet-standard:register-wallet',{detail:callback}));
      registry.set(name,{wallet,change:which=>{connected=which===null?[]:[account(which)];for(const fn of listeners)fn({accounts:connected});},remove:()=>{for(const remove of unregisters)remove();window.removeEventListener('wallet-standard:app-ready',ready);registry.delete(name);}});
    }
    window.__qaWallets={register,change:(name,index)=>registry.get(name).change(index),remove:name=>registry.get(name).remove(),counts};
    if(initial){register('Phantom',0);register('Solflare',1);}
  },{addresses:wallets.map(key=>({address:key.toBase58(),bytes:[...key.toBytes()]})),initial});
}

async function openChooser(page) {await page.locator('.wallet-button').click();await page.locator('#wallet-dialog[open]').waitFor();}
async function dismissToast(page){const button=page.locator('#toast-dismiss');if(await button.isVisible())await button.click();}
const row=(page,name)=>page.locator('[data-wallet-id]').filter({hasText:name});
async function connect(page,name,index){await row(page,name).click();await page.waitForFunction(wallet=>document.querySelector('#chain-wallet')?.textContent===wallet,wallets[index].toBase58());await dismissToast(page);}
async function screenshot(page,name){await page.screenshot({path:path.join(output,`${name}.png`)});}
async function fixturePage(width,height,{initial=true,remembered,pending=false}={}){
  const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1,reducedMotion:'reduce'}),page=await context.newPage();activePage=page;
  page.on('pageerror',error=>failures.push(error.message));
  await page.route('**/*',async route=>{
    const url=new URL(route.request().url());
    if(url.pathname==='/wallet-qa-config.json')return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(config)});
    if(url.hostname==='wallet-qa-rpc.invalid'){if(route.request().method()==='OPTIONS')return route.fulfill({status:204,headers:{'access-control-allow-origin':'*','access-control-allow-headers':'*'}});return route.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify(rpcResponse(route.request().postDataJSON()))});}
    if(url.hostname==='wallet-qa-proofs.invalid')return route.fulfill({status:404,headers:{'access-control-allow-origin':'*'},body:'No QA entitlements'});
    if(url.hostname==='127.0.0.1')return route.continue();
    failures.push(`Unexpected external request ${url.origin}`);return route.abort();
  });
  await injectStandards(page,{initial});
  await page.addInitScript(({remembered,pending,config,owner,signature})=>{
    if(remembered)sessionStorage.setItem(`piggy.wallet-choice:${config.genesisHash}:${config.programId}`,remembered);
    if(pending)sessionStorage.setItem(`piggy.pending.v1:${config.genesisHash}:${config.programId}:${config.gameVersion}:${owner}`,JSON.stringify({signature,lastValidBlockHeight:1000}));
  },{remembered,pending,config,owner:wallets[0].toBase58(),signature:base58Encode(new Uint8Array(64).fill(9))});
  await page.goto(`http://127.0.0.1:${server.config.preview.port}/`,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelector('.demo-badge')?.textContent.includes('Mainnet'),null,{timeout:20_000});
  return{context,page};
}

try{
  await fs.mkdir(output,{recursive:true});process.env.VITE_PIGGY_CONFIG_URL='/wallet-qa-config.json';
  await build({logLevel:'warn',build:{outDir:buildDir,emptyOutDir:true}});
  server=await preview({logLevel:'warn',build:{outDir:buildDir},preview:{host:'127.0.0.1',port:Number(process.env.PIGGY_WALLET_QA_PORT||4324),strictPort:true}});
  browser=await chromium.launch({channel:'chrome',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  if(!emptyOnly){
  {
    const{page,context}=await fixturePage(1440,900);await openChooser(page);
    check('Standard-only Phantom and Solflare are discovered',await row(page,'Phantom').count()===1&&await row(page,'Solflare').count()===1);
    check('no injected legacy provider exists',await page.evaluate(()=>!window.phantom&&!window.solflare&&!window.solana));
    check('opening chooser does not connect silently',await page.evaluate(()=>window.__qaWallets.counts.connect===0));
    await connect(page,'Solflare',1);check('explicit wallet selection connects the chosen account',await page.locator('#chain-wallet').textContent()===wallets[1].toBase58());
    await openChooser(page);await page.evaluate(()=>window.__qaWallets.register('Backpack',2));await row(page,'Backpack').waitFor();check('late Wallet Standard registration updates the open chooser',await row(page,'Backpack').count()===1);
    await connect(page,'Backpack',2);check('switching providers updates the account',await page.locator('#chain-wallet').textContent()===wallets[2].toBase58());
    await page.evaluate(()=>window.__qaWallets.change('Backpack',3));await page.waitForFunction(wallet=>document.querySelector('#chain-wallet')?.textContent===wallet,wallets[3].toBase58());check('standard account-change event updates identity',true);
    await openChooser(page);await page.locator('#public-wallet-disconnect').click();await page.waitForFunction(old=>document.querySelector('#buy-label')?.textContent==='Connect wallet'&&document.querySelector('#chain-wallet')?.textContent!==old,wallets[3].toBase58());check('disconnect clears current wallet',true);
    await page.evaluate(()=>window.__qaReject='Phantom');await row(page,'Phantom').click();await page.waitForFunction(()=>document.querySelector('#public-wallet-status')?.textContent.includes('Connection cancelled'));check('declined connection stays recoverable',await page.locator('#public-wallet-connect').isEnabled());
    await page.locator('#public-wallet-connect').click();await page.waitForFunction(wallet=>document.querySelector('#chain-wallet')?.textContent===wallet,wallets[0].toBase58());check('explicit retry after decline connects the selected wallet',true);await dismissToast(page);await openChooser(page);
    await page.evaluate(()=>window.__qaWallets.register('Wrong account chain',0,{accountChain:'solana:devnet'}));await row(page,'Wrong account chain').waitFor();await row(page,'Wrong account chain').click();await page.waitForFunction(()=>document.querySelector('#public-wallet-status')?.textContent.includes('authorized account'));await page.waitForFunction(()=>document.querySelector('#buy-label')?.textContent==='Connect wallet');check('unsupported account chain cannot connect',true);await page.evaluate(()=>window.__qaWallets.remove('Wrong account chain'));
    await connect(page,'Phantom',0);await page.evaluate(()=>window.__qaWallets.remove('Phantom'));await page.waitForFunction(()=>document.querySelector('#buy-label')?.textContent==='Connect wallet');check('unregistered selected wallet invalidates identity',true);
    check('wallet flows never request transaction signing',await page.evaluate(()=>window.__qaWallets.counts.sign===0));await screenshot(page,'desktop-after-flow');await context.close();
  }
  {
    const{page,context}=await fixturePage(390,844,{initial:false});await openChooser(page);check('missing-wallet state is explicit',await page.locator('#public-wallet-controls').textContent().then(text=>/wallet|install|open/i.test(text)));await page.evaluate(()=>window.__qaWallets.register('Phantom',0));await row(page,'Phantom').waitFor();check('late registration never connects an unremembered wallet automatically',await page.evaluate(()=>window.__qaWallets.counts.connect===0));await connect(page,'Phantom',0);check('late registration recovers an initially empty registry',await page.locator('#chain-wallet').textContent()===wallets[0].toBase58());await context.close();
  }
  {
    const{page,context}=await fixturePage(390,844,{initial:false,remembered:'Phantom'});
    await page.evaluate(()=>window.__qaWallets.register('Phantom',0));await page.waitForFunction(wallet=>document.querySelector('#chain-wallet')?.textContent===wallet,wallets[0].toBase58());
    check('late remembered wallet reconnects with trusted-only standard request',await page.evaluate(()=>window.__qaWallets.counts.connect===1&&window.__qaWallets.counts.options[0]?.silent===true));
    await page.evaluate(()=>window.__qaWallets.register('Solflare',1));await openChooser(page);await row(page,'Solflare').waitFor();check('a later registration does not repeat automatic reconnect',await page.evaluate(()=>window.__qaWallets.counts.connect===1));await context.close();
  }
  {
    const{page,context}=await fixturePage(390,844,{initial:false,remembered:'Phantom'});await openChooser(page);await page.evaluate(()=>window.__qaWallets.register('Solflare',1));await row(page,'Solflare').waitFor();await connect(page,'Solflare',1);await page.evaluate(()=>window.__qaWallets.register('Phantom',0));
    check('explicit wallet choice takes precedence over a late remembered provider',await page.locator('#chain-wallet').textContent()===wallets[1].toBase58()&&await page.evaluate(()=>window.__qaWallets.counts.connect===1));await context.close();
  }
  {
    const{page,context}=await fixturePage(390,844,{pending:true});await openChooser(page);await connect(page,'Phantom',0);await page.waitForFunction(()=>document.querySelector('#buy-label')?.textContent.includes('Confirmation pending'));
    check('restored unresolved signature disables another debit for its wallet',await page.locator('#buy-button').isDisabled());await openChooser(page);await connect(page,'Solflare',1);await page.waitForFunction(()=>!document.querySelector('#buy-button').disabled);
    check('switching wallets does not attach the previous account pending transaction',!await page.locator('#buy-label').textContent().then(value=>value.includes('pending')));await openChooser(page);await connect(page,'Phantom',0);await page.waitForFunction(()=>document.querySelector('#buy-label')?.textContent.includes('Confirmation pending'));
    check('switching back preserves the original pending transaction',await page.locator('#buy-button').isDisabled());check('pending-wallet checks never sign',await page.evaluate(()=>window.__qaWallets.counts.sign===0));await context.close();
  }
  }
  const layouts=emptyOnly?[['tiny-phone',320,568],['tiny-landscape',480,320]]:[['phone',390,844],['tiny-phone',320,568],['landscape',844,390],['tiny-landscape',480,320]];
  for(const[name,width,height]of layouts){
    const{page,context}=await fixturePage(width,height);
    if(emptyOnly){await page.waitForFunction(()=>document.querySelector('#timer-caption')?.textContent==='Empty round ends in');check(`${name} empty round describes the actual timer`,await page.locator('#leader-name').textContent()==='No feeds yet');check(`${name} unfunded round has no fabricated jackpot`,parseFloat((await page.locator('#pot-value').textContent()).replace(/,/g,''))===0&&parseFloat((await page.locator('#winner-prize').textContent()).replace(/,/g,''))===0);check(`${name} first-feed explanation is explicit`,await page.locator('.pot-caption').textContent()==='No feeds yet. First feed starts the pot.');await screenshot(page,`${name}-empty-round`);}
    await openChooser(page);await row(page,'Phantom').waitFor();
    const layout=await page.locator('#wallet-dialog').evaluate(dialog=>{const r=dialog.getBoundingClientRect(),buttons=[...dialog.querySelectorAll('[data-wallet-id],#public-wallet-connect,.dialog-close')].filter(el=>getComputedStyle(el).display!=='none');return{inside:r.left>=-1&&r.top>=-1&&r.right<=innerWidth+1&&r.bottom<=innerHeight+1,pageNoScroll:document.documentElement.scrollWidth<=innerWidth&&document.documentElement.scrollHeight<=innerHeight,buttons:buttons.map(el=>{const b=el.getBoundingClientRect(),hit=document.elementFromPoint(b.left+b.width/2,b.top+b.height/2);return{height:b.height,width:b.width,visible:b.top>=r.top&&b.bottom<=r.bottom&&!!hit&&(hit===el||el.contains(hit))};})};});
    check(`${name} chooser fits viewport without page scroll`,layout.inside&&layout.pageNoScroll);check(`${name} wallet rows and controls have usable hit targets`,layout.buttons.length>=3&&layout.buttons.every(button=>button.visible&&button.width>=40&&button.height>=40));await screenshot(page,`${name}-chooser`);
    for(const selector of ['.wallet-browser-help','.wallet-account-details']){
      const summary=page.locator(`#wallet-dialog ${selector} > summary`);await summary.scrollIntoViewIfNeeded();await summary.click();
      const target=page.locator(selector==='.wallet-browser-help'?'#wallet-dialog .wallet-browser-help > p':'#wallet-mode-note');await target.scrollIntoViewIfNeeded();
      check(`${name} ${selector} details are reachable inside the dialog`,await target.evaluate(node=>{const r=node.getBoundingClientRect(),dialog=node.closest('dialog').getBoundingClientRect();return r.top>=dialog.top-1&&r.bottom<=dialog.bottom+1;}));
      check(`${name} internal detail scrolling keeps the page fixed`,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth&&document.documentElement.scrollHeight<=innerHeight&&scrollY===0));
      await summary.scrollIntoViewIfNeeded();await summary.click();
    }
    await connect(page,'Phantom',0);check(`${name} wallet can connect`,await page.locator('#chain-wallet').textContent()===wallets[0].toBase58());check(`${name} never signs`,await page.evaluate(()=>window.__qaWallets.counts.sign===0));await context.close();
  }
  check('no signing, simulation or broadcast RPC was used',!requests.some(method=>['sendTransaction','simulateTransaction'].includes(method)));check('no unexpected external requests or browser errors',failures.length===0);
  await fs.writeFile(path.join(output,'report.json'),JSON.stringify({ok:true,checks,requests,failures,scope:'Isolated production build with Wallet Standard mocks and fake RPC accounts; no real wallet or chain transaction.'},null,2));console.log(JSON.stringify({ok:true,checks:checks.length,output}));
}catch(error){if(activePage&&!activePage.isClosed())await screenshot(activePage,'failed');await fs.writeFile(path.join(output,'failure.json'),JSON.stringify({ok:false,error:error.message,checks,failures},null,2));throw error;}
finally{await browser?.close();await new Promise(resolve=>server?.httpServer?server.httpServer.close(resolve):resolve());}
