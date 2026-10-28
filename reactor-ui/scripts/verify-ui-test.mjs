/** Read-only browser verification QA. Synthetic loader accounts contain the
 * public release bytes. No wallet, keypair secret, simulation or send exists. */
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {PublicKey} from '@solana/web3.js';
import {build,preview} from 'vite';
import {chromium} from '@playwright/test';
import {UPGRADEABLE_LOADER} from '../src/program-verification.mjs';

const output=path.resolve(process.env.PIGGY_VERIFY_QA_OUTPUT||'.openai/local/visual-qa/verification'),buildDir=path.join(output,'build');
const release=JSON.parse(await fs.readFile(new URL('../public/verification/release.json',import.meta.url))),binary=await fs.readFile(new URL('../public/verification/piggy-mainnet.so',import.meta.url));
assert.equal(binary.length,release.binaryBytes);assert.equal(createHash('sha256').update(binary).digest('hex'),release.binarySha256);
const checks=[],failures=[],methods=[];let browser,server,activePage;
const check=(label,value)=>{assert.ok(value,label);checks.push(label);};
function accounts(mode){
  const program=Buffer.alloc(36);program.writeUInt32LE(2);new PublicKey(release.programData).toBuffer().copy(program,4);
  const data=Buffer.alloc(45+binary.length);data.writeUInt32LE(3);data.writeBigUInt64LE(BigInt(release.deploymentSlot),4);data[12]=1;new PublicKey(release.observedUpgradeAuthority).toBuffer().copy(data,13);binary.copy(data,45);
  if(mode==='mismatch')data[100]^=1;
  if(mode==='authority')new PublicKey('11111111111111111111111111111111').toBuffer().copy(data,13);
  if(mode==='immutable'){data[12]=0;data.fill(0,13,45);}
  const account=(bytes,executable)=>({owner:UPGRADEABLE_LOADER,executable,lamports:1,rentEpoch:0,data:[bytes.toString('base64'),'base64']});
  return[account(program,true),account(data,false)];
}
async function open(width,height){
  const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1}),page=await context.newPage();activePage=page;let mode='match';
  page.on('pageerror',error=>failures.push(error.message));
  await page.route('**/*',async route=>{
    const url=new URL(route.request().url());
    if(url.pathname==='/rpc'){
      const body=route.request().postDataJSON();methods.push(body.method);
      if(!['getGenesisHash','getMultipleAccounts'].includes(body.method)){failures.push(`Unexpected RPC ${body.method}`);return route.abort();}
      if(mode==='outage')return route.fulfill({status:503,body:'RPC unavailable'});
      const result=body.method==='getGenesisHash'?(mode==='network'?'unexpected-network':release.genesisHash):{context:{slot:release.observedSlot+10},value:accounts(mode)};
      return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({jsonrpc:'2.0',id:body.id,result})});
    }
    if(url.hostname==='127.0.0.1')return route.continue();
    failures.push(`Unexpected external request ${url.origin}`);return route.abort();
  });
  await page.goto(`http://127.0.0.1:${server.config.preview.port}/verify/`,{waitUntil:'networkidle'});
  return{page,context,setMode:value=>mode=value};
}
async function runCheck(page,state){await page.locator('#check-program').click();await page.waitForFunction(state=>document.querySelector('#check-status')?.dataset.state===state,state);}
async function shot(page,name){await page.screenshot({path:path.join(output,`${name}.png`)});}
try{
  await fs.mkdir(output,{recursive:true});await build({logLevel:'warn',build:{outDir:buildDir,emptyOutDir:true}});server=await preview({logLevel:'warn',build:{outDir:buildDir},preview:{host:'127.0.0.1',port:Number(process.env.PIGGY_VERIFY_QA_PORT||4335),strictPort:true}});browser=await chromium.launch({channel:'chrome',headless:true});
  for(const[name,width,height]of [['desktop',1440,900],['phone',390,844],['tiny-phone',320,568],['landscape',844,390],['tiny-landscape',480,320]]){
    const{page,context}=await open(width,height);check(`${name}: unchecked state does not claim verification`,/not checked/i.test(await page.locator('#check-status').textContent()));await runCheck(page,'match');
    check(`${name}: exact release bytes report a match`,/matches the published release/i.test(await page.locator('#check-status').textContent()));check(`${name}: current authority remains explicitly retained`,await page.locator('#live-authority').textContent()===release.observedUpgradeAuthority&&/key retained/i.test(await page.locator('#authority-state').textContent()));check(`${name}: byte match is explicitly not an audit`,/not an audit|not a security audit/i.test(await page.locator('#check-detail').textContent()));
    await shot(page,`${name}-match`);
    for(const tab of ['release','control','source']){
      await page.locator(`[data-tab="${tab}"]`).click();await page.locator(`[data-panel="${tab}"]`).waitFor();
      const fit=await page.locator('.panels').evaluate(node=>{const r=node.getBoundingClientRect();return r.left>=-1&&r.top>=-1&&r.right<=innerWidth+1&&r.bottom<=innerHeight+1&&document.documentElement.scrollHeight<=innerHeight&&document.documentElement.scrollWidth<=innerWidth&&scrollY===0;});check(`${name}/${tab}: content scroll stays inside fixed page`,fit);
      await page.locator('.panels').evaluate(node=>node.scrollTop=0);await shot(page,`${name}-${tab}`);await page.locator('.panels').evaluate(node=>node.scrollTop=node.scrollHeight);check(`${name}/${tab}: last content is reachable`,await page.locator(`[data-panel="${tab}"]`).evaluate(node=>node.getBoundingClientRect().bottom<=document.querySelector('.panels').getBoundingClientRect().bottom+21));
    }
    await page.locator('[data-tab="release"]').focus();await page.keyboard.press('Tab');await page.keyboard.press('Enter');check(`${name}: keyboard reaches control topic`,await page.locator('[data-panel="control"]').isVisible());
    await context.close();
  }
  {
    const{page,context,setMode}=await open(1440,900);
    setMode('mismatch');await runCheck(page,'error');check('modified executable cannot report a match',/differs from this published release/i.test(await page.locator('#check-detail').textContent())&&/unknown/i.test(await page.locator('#authority-state').textContent()));await shot(page,'mismatch');
    setMode('outage');await runCheck(page,'error');check('unavailable RPC does not reuse a verified status',/unavailable/i.test(await page.locator('#check-detail').textContent())&&/not verified/i.test(await page.locator('#live-authority').textContent()));
    setMode('network');await runCheck(page,'error');check('wrong network is rejected',/expected Solana mainnet/i.test(await page.locator('#check-detail').textContent()));
    setMode('authority');await runCheck(page,'match');check('changed authority is reported despite matching bytes',/changed since/i.test(await page.locator('#authority-state').textContent()));await shot(page,'changed-authority');
    setMode('immutable');await runCheck(page,'match');check('an absent loader authority is distinguished from retained key',/no upgrade key/i.test(await page.locator('#authority-state').textContent()));
    setMode('match');await runCheck(page,'match');check('retry recovers from failures by making a fresh read',await page.locator('#live-authority').textContent()===release.observedUpgradeAuthority);await context.close();
  }
  check('all calls were read-only and no browser error occurred',failures.length===0&&methods.every(method=>['getGenesisHash','getMultipleAccounts'].includes(method)));
  await fs.writeFile(path.join(output,'report.json'),JSON.stringify({ok:true,checks,failures,methods,releaseHash:release.binarySha256,scope:'Synthetic read-only loader accounts using public release bytes; no wallets or transactions.'},null,2));console.log(JSON.stringify({ok:true,checks:checks.length,output}));
}catch(error){if(activePage&&!activePage.isClosed())await shot(activePage,'failed');await fs.writeFile(path.join(output,'failure.json'),JSON.stringify({ok:false,error:error.message,checks,failures,methods},null,2));throw error;}
finally{await browser?.close();await new Promise(resolve=>server?.httpServer?server.httpServer.close(resolve):resolve());}
