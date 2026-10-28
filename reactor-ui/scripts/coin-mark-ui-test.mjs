/** Local visual inspection harness. No wallet connection, RPC or signing. */
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createServer} from 'vite';
import {chromium} from '@playwright/test';

const output=path.resolve(process.env.PIGGY_COIN_QA_OUTPUT||'.openai/local/visual-qa/coin-marks');
const port=Number(process.env.PIGGY_COIN_QA_PORT||4325),checks=[],errors=[],viewportFilter=process.env.PIGGY_COIN_QA_VIEWPORT;
const check=(label,value)=>{assert.ok(value,label);checks.push(label);};
const gallery=`<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{margin:0;width:100%;height:100%;overflow:hidden;background:#2f2475;color:white;font:16px system-ui}canvas{display:block;width:100%;height:100%}.labels{position:absolute;inset:0;display:flex;pointer-events:none}.labels span{width:50%;text-align:center;padding-top:18px}</style></head><body><div class="labels"><span>Front face</span><span>Back face</span></div><script type="module">
import * as THREE from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {createSolanaCoinMarkGeometry,setSolanaCoinMarkMatrix,SOLANA_MARKS_PER_COIN} from '/src/solana-coin-mark.mjs';
const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(devicePixelRatio);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.NoToneMapping;document.body.append(renderer.domElement);
const scene=new THREE.Scene();scene.background=new THREE.Color(0x2f2475);const pmrem=new THREE.PMREMGenerator(renderer);scene.environment=pmrem.fromScene(new RoomEnvironment(),.04).texture;
scene.add(new THREE.AmbientLight(0xffffff,.25));const light=new THREE.DirectionalLight(0xffffff,.85);light.position.set(-3,5,4);scene.add(light);
const aspect=innerWidth/innerHeight,camera=new THREE.OrthographicCamera(-1.08,1.08,1.08/aspect,-1.08/aspect,.1,10);camera.position.set(0,3,0);camera.up.set(0,0,-1);camera.lookAt(0,0,0);
const scale=2,profile=[[0,-.021],[.126,-.021],[.137,-.015],[.14,-.008],[.14,.008],[.137,.015],[.126,.021],[0,.021]].map(([x,y])=>new THREE.Vector2(x*scale,y*scale));
const geometry=new THREE.LatheGeometry(profile,64),markGeometry=createSolanaCoinMarkGeometry({coinScale:scale});
for(let i=0;i<2;i++){const coin=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({color:0xd6aa48,metalness:1,roughness:.28,envMapIntensity:.98}));coin.position.x=i?.53:-.53;if(i)coin.rotation.z=Math.PI;coin.updateMatrix();scene.add(coin);
const marks=new THREE.InstancedMesh(markGeometry,new THREE.MeshStandardMaterial({color:0x75552b,metalness:1,roughness:.43,envMapIntensity:.7}),SOLANA_MARKS_PER_COIN);const matrix=new THREE.Matrix4();for(let face=0;face<SOLANA_MARKS_PER_COIN;face++){setSolanaCoinMarkMatrix(matrix,coin.matrix,face,scale);marks.setMatrixAt(face,matrix);}marks.instanceMatrix.needsUpdate=true;scene.add(marks);}
renderer.render(scene,camera);window.__coinQa={ready:true,marksPerCoin:SOLANA_MARKS_PER_COIN,bars:markGeometry.userData.bars,source:markGeometry.userData.source};
</script></body></html>`;
let server,browser,page;
try{
  await fs.mkdir(output,{recursive:true});
  server=await createServer({logLevel:'warn',server:{host:'127.0.0.1',port,strictPort:true},plugins:[{name:'coin-gallery-qa',configureServer(server){server.middlewares.use(async(req,res,next)=>{if(req.url?.split('?')[0]!=='/coin-gallery.html')return next();try{res.setHeader('Content-Type','text/html');res.end(await server.transformIndexHtml('/coin-gallery.html',gallery));}catch(error){next(error);}});}}]});await server.listen();
  browser=await chromium.launch({channel:'chrome',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  for(const[name,width,height]of[['desktop',1440,900],['laptop',1496,696],['phone',390,844],['tiny-phone',320,568],['landscape',844,390],['tiny-landscape',480,320]]){
    if(viewportFilter&&!viewportFilter.split(',').includes(name))continue;
    const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1,reducedMotion:'no-preference'});page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));
    await page.goto(`http://127.0.0.1:${port}/coin-gallery.html`,{waitUntil:'networkidle'});await page.waitForFunction(()=>window.__coinQa?.ready);
    const info=await page.evaluate(()=>window.__coinQa);check(`${name} renders official three-part emblem on two faces`,info.marksPerCoin===2&&info.bars===3&&info.source==='https://solana.com/src/img/branding/solanaLogoMark.svg');await page.screenshot({path:path.join(output,`${name}-faces.png`)});
    await page.goto(`http://127.0.0.1:${port}/?demo=1`,{waitUntil:'domcontentloaded'});await page.locator('#safe-art.model-ready').waitFor({timeout:60000});await page.waitForTimeout(1500);await page.screenshot({path:path.join(output,`${name}-vault.png`)});
    await page.locator('.wallet-button').click();await page.locator('#wallet-dialog[open]').waitFor();
    if(name==='desktop'){await page.locator('#preview-payout').click();await page.waitForTimeout(500);check('visual-only preview opens without settling a round',await page.locator('#app').evaluate(node=>node.classList.contains('payout-preview')&&!node.classList.contains('round-over')));await page.waitForTimeout(4500);check('visual-only preview returns to the same active round',await page.locator('#app').evaluate(node=>!node.classList.contains('payout-preview')&&!node.classList.contains('round-over')));await page.locator('.wallet-button').click();}
    await page.locator('#fast-forward').click();await page.waitForFunction(()=>document.querySelector('#app')?.classList.contains('round-over'));
    if(await page.locator('#toast-dismiss').isVisible())await page.locator('#toast-dismiss').click();
    await page.waitForTimeout(800);await page.screenshot({path:path.join(output,`${name}-jackpot.png`)});
    await page.waitForTimeout(2500);await page.screenshot({path:path.join(output,`${name}-jackpot-climax.png`)});
    check(`${name} holds the actual demo settlement for visual inspection`,await page.locator('#app').evaluate(node=>node.classList.contains('round-over')));
    check(`${name} actual vault and jackpot keep page fixed`,await page.evaluate(()=>document.documentElement.scrollHeight<=innerHeight&&document.documentElement.scrollWidth<=innerWidth));await context.close();
  }
  check('coin harness has no browser exceptions',errors.length===0);await fs.writeFile(path.join(output,'report.json'),JSON.stringify({ok:true,checks,errors,scope:'Official coin mark geometry, preview lifecycle and held local-demo settlement at six sizes; no external wallet or chain actions.'},null,2));console.log(JSON.stringify({ok:true,checks:checks.length,output}));
}catch(error){if(page&&!page.isClosed())await page.screenshot({path:path.join(output,'failed.png')});await fs.writeFile(path.join(output,'failure.json'),JSON.stringify({ok:false,error:error.message,errors},null,2));throw error;}
finally{await browser?.close();await server?.close();}
