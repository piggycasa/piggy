import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { createCoinSimulation } from '../src/coin-simulation.js';
import { createPiggyBurst } from '../src/piggy-burst.js';

// Explicitly requested local visual QA. Fresh contexts only; no personal profile.
const baseUrl = process.env.PIGGY_QA_URL || 'http://127.0.0.1:4317';
const output = path.resolve(process.env.PIGGY_QA_OUTPUT || '.openai/local/visual-qa/final');
await fs.mkdir(output, { recursive: true });
const report = { url: baseUrl, browser: 'Chromium, fresh local test contexts', viewports: [], measurements:[], toasts:[], flows: [], errors: [], layoutFailures:[] };
const layoutOnly = process.env.PIGGY_QA_LAYOUT_ONLY === '1';
const collectFailures = process.env.PIGGY_QA_COLLECT === '1';
const selectedSizes = process.env.PIGGY_QA_SIZES?.split(',').filter(Boolean);

// Project the authored mesh, not the transparent canvas. Camera/normalization
// constants match vault-scene.js; zero parallax is established before measuring.
async function makeProjectedObjectAudit() {
  const bytes = await fs.readFile(new URL('../public/models/piggy-bank-glass.glb', import.meta.url));
  const gltf = await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), '');
  const wrapper = new THREE.Group(); wrapper.add(gltf.scene); wrapper.rotation.y = Math.PI / 2; wrapper.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(wrapper), center = bounds.getCenter(new THREE.Vector3());
  const scale = 3.8 / bounds.getSize(new THREE.Vector3()).x;
  const normalization = new THREE.Matrix4().makeScale(scale, scale, scale).setPosition(-center.x * scale, 1.9 - center.y * scale, -center.z * scale);
  const pigPoints = []; let body;
  gltf.scene.traverse(object => {
    if (!object.isMesh) return;
    const geometry = object.geometry.clone().applyMatrix4(object.matrixWorld).applyMatrix4(normalization);
    for (let i = 0; i < geometry.attributes.position.count; i++) pigPoints.push(new THREE.Vector3().fromBufferAttribute(geometry.attributes.position, i));
    if (object.name === 'Object_9') body = new THREE.Mesh(geometry); else geometry.dispose();
    object.geometry.dispose();
    for (const material of Array.isArray(object.material) ? object.material : [object.material]) material.dispose();
  });
  assert(body, 'The authored pig body is missing from the GLB.');
  const heldCache = new Map(), coinScale = .17 / .14;
  const profile = [[0,-.021],[.126,-.021],[.137,-.015],[.14,-.008],[.14,.008],[.137,.015],[.126,.021],[0,.021]]
    .map(([x,y]) => new THREE.Vector2(x * coinScale, y * coinScale));
  async function heldPoints(mobile) {
    if (heldCache.has(mobile)) return heldCache.get(mobile);
    const bank = new THREE.Group(); bank.add(body); bank.updateMatrixWorld(true);
    const capacity = mobile ? 110 : 180, count = mobile ? 110 : 147;
    const physics = await createCoinSimulation({ shellMesh:body, maxCoins:capacity, radius:.17, halfHeight:.023 * coinScale });
    physics.setCount(count); physics.step(0);
    const matrices = physics.getTransforms().filter(pose => pose.visible !== false).map(pose => new THREE.Matrix4().compose(
      new THREE.Vector3().copy(pose.position), new THREE.Quaternion().copy(pose.quaternion), new THREE.Vector3(1,1,1),
    ));
    const geometry = new THREE.LatheGeometry(profile, mobile ? 32 : 48), material = new THREE.MeshStandardMaterial();
    const burst = createPiggyBurst({ body, bank, coinGeometry:geometry, coinMaterial:material, coinScale, maxCoins:capacity });
    burst.start(matrices); burst.update(4);
    const coins = burst.group.getObjectByName('piggy-prize-burst-coins'), groups = [], matrix = new THREE.Matrix4();
    for (let n = 0; n < coins.count; n++) {
      coins.getMatrixAt(n, matrix); const points = [];
      for (let i = 0; i < geometry.attributes.position.count; i++) points.push(new THREE.Vector3().fromBufferAttribute(geometry.attributes.position, i).applyMatrix4(matrix));
      groups.push({ hero:new Set(Array.from({length:Math.min(24,coins.count)},(_,rank)=>Math.floor(rank*coins.count/Math.min(24,coins.count)))).has(n), points });
    }
    burst.dispose(); physics.dispose(); geometry.dispose(); material.dispose();
    heldCache.set(mobile, groups); return groups;
  }
  function project(points, rect) {
    const camera = new THREE.PerspectiveCamera(47, rect.width / rect.height, .1, 60);
    const vertical = THREE.MathUtils.degToRad(47), horizontal = 2 * Math.atan(Math.tan(vertical / 2) * camera.aspect);
    const distance = Math.max(4.9 / (2 * Math.tan(vertical / 2)), 4.8 / (2 * Math.tan(horizontal / 2))) * 1.035;
    camera.position.copy(new THREE.Vector3(0,2.3,8.5).normalize()).multiplyScalar(distance).add(new THREE.Vector3(0,1.9,0));
    camera.lookAt(0,1.9,0); camera.updateMatrixWorld();
    let left = Infinity, top = Infinity, right = -Infinity, bottom = -Infinity;
    for (const point of points) {
      const ndc = point.clone().project(camera), x = rect.x + (ndc.x + 1) * rect.width / 2, y = rect.y + (1 - ndc.y) * rect.height / 2;
      left = Math.min(left,x); right = Math.max(right,x); top = Math.min(top,y); bottom = Math.max(bottom,y);
    }
    return { x:left, y:top, left, top, right, bottom, width:right-left, height:bottom-top, centerX:(left+right)/2, centerY:(top+bottom)/2 };
  }
  return {
    pig:rect => project(pigPoints, rect),
    held:async (rect,mobile) => {
      const groups = await heldPoints(mobile);
      return { bounds:project(groups.flatMap(group => group.points),rect), coins:groups.map(group => ({ hero:group.hero, ...project(group.points,rect) })) };
    },
    dispose() { body.geometry.dispose(); body.material.dispose(); },
  };
}
const objects = await makeProjectedObjectAudit();
const browser = await chromium.launch({ channel: process.env.PIGGY_QA_BROWSER || 'chrome', headless: true });

async function ready(page) {
  await page.locator('#safe-art.model-ready').waitFor({ timeout: 60_000 });
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.querySelectorAll('.kb-wipe *')].flatMap(element => element.getAnimations().map(animation => animation.finished.catch(() => {}))));
  });
}
async function open(viewport, options = {}) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1, isMobile: viewport.width < 500, hasTouch: viewport.width < 900, ...options });
  const page = await context.newPage();
  page.on('pageerror', error => report.errors.push(error.stack || error.message));
  page.on('console', message => { if (message.type() === 'error') report.errors.push(message.text()); });
  await page.goto(`${baseUrl}/?demo=1`, { waitUntil: 'networkidle' });
  await ready(page);
  // Freeze autonomous demo purchases; all subsequent actions are explicit.
  await page.locator('.wallet-button').click();
  await ready(page);
  await page.locator('#npc-toggle').scrollIntoViewIfNeeded();
  const npc = await page.locator('#npc-toggle').evaluate(element => {
    const rect = element.getBoundingClientRect(), hit = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2);
    return { width:rect.width, height:rect.height, hit:hit === element || element.contains(hit) };
  });
  assert.ok(npc.width >= 44 && npc.height >= 44 && npc.hit, 'NPC control must remain a usable 44px target inside Wallet');
  if (await page.locator('#npc-toggle').getAttribute('aria-pressed') === 'true') await page.locator('#npc-toggle').click();
  await page.locator('#wallet-dialog .dialog-close').click();
  await ready(page);
  await checkVisibleToast(page,viewport);
  await page.locator('#toast-dismiss').click();
  await page.locator('#toast.visible').waitFor({state:'hidden'});
  await page.waitForFunction(() => getComputedStyle(document.querySelector('#toast')).opacity === '0');
  return { context, page };
}
async function checkVisibleToast(page, viewport) {
  // NPC pause is a real UI event already performed in this fresh demo context.
  // Check the notification before dismissing it; no financial state is changed.
  await page.locator('#toast.visible').waitFor({timeout:2_000});
  await page.waitForFunction(() => Number(getComputedStyle(document.querySelector('#toast')).opacity) >= .99, undefined, {timeout:2_000});
  const metrics = await page.locator('#toast').evaluate(toast => {
    const box = element => { const rect = element.getBoundingClientRect(); return { left:rect.left, top:rect.top, right:rect.right, bottom:rect.bottom, width:rect.width, height:rect.height }; };
    const button = toast.querySelector('#toast-dismiss'), buttonBox = box(button);
    const hit = document.elementFromPoint((buttonBox.left + buttonBox.right) / 2,(buttonBox.top + buttonBox.bottom) / 2);
    const text = [...toast.querySelectorAll('#toast-title,#toast-detail')].map(element => {
      const range = document.createRange(); range.selectNodeContents(element);
      return { selector:`#${element.id}`, text:element.textContent, ...box(element), rects:[...range.getClientRects()].map(rect => ({left:rect.left,top:rect.top,right:rect.right,bottom:rect.bottom})) };
    });
    return { width:innerWidth, height:innerHeight, toast:box(toast), button:{...buttonBox,hit:hit === button || button.contains(hit)}, text };
  });
  report.toasts.push(metrics);
  const { toast,button } = metrics;
  assert.ok(toast.left >= -1 && toast.top >= -1 && toast.right <= metrics.width + 1 && toast.bottom <= metrics.height + 1, `Visible toast is outside ${metrics.width}×${metrics.height} viewport`);
  assert.ok(button.width >= 44 && button.height >= 44 && button.hit, 'Visible toast dismiss control must be 44px and reachable');
  assert.ok(button.left >= toast.left - 1 && button.right <= toast.right + 1 && button.top >= toast.top - 1 && button.bottom <= toast.bottom + 1, 'Toast dismiss control extends outside notification');
  for (const item of metrics.text) for (const rect of item.rects) {
    assert.ok(rect.left >= toast.left - 1 && rect.right <= toast.right + 1 && rect.top >= toast.top - 2 && rect.bottom <= toast.bottom + 2, `${item.selector} clips outside visible toast`);
    const overlap = intersection(rect,button);
    assert.ok(overlap.width <= 1 || overlap.height <= 1, `${item.selector} overlaps toast dismiss control`);
  }
  if (viewport.width === 480 && viewport.height === 320 || viewport.width === 320 && viewport.height === 568) await screenshot(page,`toast-${viewport.width}x${viewport.height}`);
}
async function layout(page) {
  return page.evaluate(() => {
    const box = element => { const r = element.getBoundingClientRect(); return { x:r.x, y:r.y, left:r.left, top:r.top, width:r.width, height:r.height, right:r.right, bottom:r.bottom, centerX:r.x+r.width/2, centerY:r.y+r.height/2 }; };
    const visible = element => {
      if (!element || !element.getClientRects().length) return false;
      for (let node = element; node; node = node.parentElement) {
        const style = getComputedStyle(node);
        if (node.hidden || node.tagName === 'DIALOG' && !node.open || style.display === 'none' || style.visibility !== 'visible' || Number(style.opacity) === 0) return false;
      }
      const rect = element.getBoundingClientRect(); return rect.width > 0 && rect.height > 0;
    };
    const describe = element => element.id ? `#${element.id}` : `${element.tagName.toLowerCase()}.${[...element.classList].join('.')}`;
    const activeDialog = document.querySelector('dialog[open]'), scope = activeDialog || document.querySelector('#app');
    const targetElements = [...scope.querySelectorAll('button,input:not([type=hidden]),select,a[href]')].filter(visible);
    const targets = targetElements.map(element => {
      const rect = box(element), hit = document.elementFromPoint(rect.centerX, rect.centerY);
      return { selector:describe(element), ...rect, minSize:element.tagName === 'A' ? 0 : 44,
        hit:hit === element || element.contains(hit), hitElement:hit ? describe(hit) : null,
        // A deliberately disabled claim button still occupies its own target.
        disabled:Boolean(element.disabled) };
    });
    const overlaps = [];
    for (let a = 0; a < targetElements.length; a++) for (let b = a + 1; b < targetElements.length; b++) {
      if (targetElements[a].contains(targetElements[b]) || targetElements[b].contains(targetElements[a])) continue;
      const first = targets[a], second = targets[b];
      const width = Math.min(first.right,second.right) - Math.max(first.left,second.left);
      const height = Math.min(first.bottom,second.bottom) - Math.max(first.top,second.top);
      if (width > 1 && height > 1) overlaps.push({ first:first.selector, second:second.selector, width, height });
    }
    const textRules = [
      ['.purchase-summary > div > span',12], ['#purchase-cost',16], ['#purchase-time',12],
      ['.mode-button',11], ['.mode-button > span',11], ['.mode-button > strong',11],
      ['#key-loot-reason',11], ['.loot-share-line',11], ['#loot-share',11],
      ['.loot-label',12], ['.quiet-label',12], ['.timer-caption',12],
      ['.loot-amount',16], ['.pot-amount',16], ['.countdown',18], ['#purchase-outcome',11], ['#your-share',11],
      ['.leader-label',11], ['.leader-chip > strong',12], ['.demo-badge',10], ['.round-badge',10], ['.activity-row',11],
      ['.position-values > div:last-child > span',11], ['#key-quantity',16],
    ];
    const text = textRules.flatMap(([selector,minimum]) => [...document.querySelectorAll(selector)].filter(visible).map(element => {
      let size = parseFloat(getComputedStyle(element).fontSize);
      // Some compact labels replace source wording with a visible pseudo label.
      if (size === 0) for (const pseudo of ['::before','::after']) {
        const style = getComputedStyle(element,pseudo);
        if (!['none','normal','""'].includes(style.content) && style.display !== 'none') size = Math.max(size,parseFloat(style.fontSize));
      }
      return { selector, text:element.textContent.trim().slice(0,100), size, minimum };
    }));
    const amountSelectors = ['.pot-amount','.loot-amount','#purchase-cost','#purchase-time','#buy-label','#hud-rewards','#your-share','#key-loot-reason'];
    const amounts = amountSelectors.flatMap(selector => [...document.querySelectorAll(selector)].filter(visible).map(element => {
      const walker = document.createTreeWalker(element,NodeFilter.SHOW_TEXT), rects = [];
      for (let node = walker.nextNode(); node; node = walker.nextNode()) if (node.textContent.trim() && visible(node.parentElement)) {
        const range = document.createRange(); range.selectNodeContents(node); rects.push(...range.getClientRects());
      }
      const rect = { left:Math.min(...rects.map(rect => rect.left)), right:Math.max(...rects.map(rect => rect.right)), top:Math.min(...rects.map(rect => rect.top)), bottom:Math.max(...rects.map(rect => rect.bottom)) };
      const bounds = box(element), clipAncestors = [];
      for (let node = element; node; node = node.parentElement) {
        if (/hidden|clip|scroll|auto/.test(getComputedStyle(node).overflowX)) {
          const clip = node.getBoundingClientRect();
          if (rect.left < clip.left - 1 || rect.right > clip.right + 1) clipAncestors.push(describe(node));
        }
      }
      for (let node=element;node;node=node.parentElement) if (/hidden|clip|scroll|auto/.test(getComputedStyle(node).overflowY)) {
        const clip=node.getBoundingClientRect(); if(rect.top<clip.top-2 || rect.bottom>clip.bottom+2) clipAncestors.push(describe(node)+'(vertical)');
      }
      return { selector, text:element.textContent.trim(), ...bounds, textLeft:rect.left, textRight:rect.right, textTop:rect.top, textBottom:rect.bottom,
        scrollWidth:element.scrollWidth, clientWidth:element.clientWidth, clipAncestors };
    }));
    const regionSelectors = ['.topbar','.pot-block','.timer-group','.key-loot','.purchase-panel','.leader-group','.arena-feedback'];
    const regions = Object.fromEntries(regionSelectors.map(selector => [selector,document.querySelector(selector)]).filter(([,element]) => visible(element)).map(([selector,element]) => [selector,box(element)]));
    return { width:innerWidth, height:innerHeight, portrait:innerHeight > innerWidth, scrollWidth:document.documentElement.scrollWidth, scrollHeight:document.documentElement.scrollHeight,
      canvas:box(document.querySelector('.vault-canvas')), targets, overlaps, text, amounts, regions,
      payout:document.querySelector('#app').classList.contains('has-jackpot') || document.querySelector('#app').classList.contains('payout-preview') };
  });
}
const intersection = (a,b) => ({ width:Math.min(a.right,b.right)-Math.max(a.left,b.left), height:Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top) });
function checkLayout(metrics, phase = 'baseline') {
  assert.ok(metrics.scrollWidth <= metrics.width + 1, 'Page scrolls horizontally');
  assert.ok(metrics.scrollHeight <= metrics.height + 1, 'Page scrolls vertically');
  const smallLandscape = metrics.width > metrics.height && metrics.height <= 420;
  const sceneMinimum = smallLandscape ? (metrics.height <= 320 ? 160 : 200) : 120;
  assert.ok(metrics.canvas.height >= sceneMinimum, `Pig scene height ${metrics.canvas.height}px is below ${sceneMinimum}px`);
  for (const target of metrics.targets) {
    assert.ok(target.width >= target.minSize && target.height >= target.minSize, `${target.selector} touch target is ${target.width}×${target.height}`);
    assert.ok(target.x >= -1 && target.y >= -1 && target.right <= metrics.width + 1 && target.bottom <= metrics.height + 1, `${target.selector} is outside viewport`);
    if (!target.disabled) assert.ok(target.hit, `${target.selector} center is covered by ${target.hitElement}`);
  }
  assert.deepEqual(metrics.overlaps, [], 'Interactive targets overlap');
  if (metrics.width <= 767 || smallLandscape) for (const label of metrics.text) {
    assert.ok(label.size >= label.minimum - .01, `${label.selector} is ${label.size}px; minimum is ${label.minimum}px`);
  }
  for (const amount of metrics.amounts) {
    assert.ok(amount.clientWidth === 0 || amount.textLeft >= amount.left - 1 && amount.textRight <= amount.right + 1, `${amount.selector} overflows its own horizontal bounds`);
    assert.deepEqual(amount.clipAncestors, [], `${amount.selector} is clipped by an ancestor`);
    assert.ok(amount.textLeft >= -1 && amount.textRight <= metrics.width + 1 && amount.textTop >= -2 && amount.textBottom <= metrics.height + 2, `${amount.selector} text extends beyond viewport`);
  }
  for (const [firstSelector,secondSelector] of [['#purchase-cost','#purchase-time'],['.loot-amount','#loot-claim'],['.loot-amount','#key-loot-reason']]) {
    const first = metrics.amounts.find(item => item.selector === firstSelector);
    const second = metrics.amounts.find(item => item.selector === secondSelector) || metrics.targets.find(item => item.selector === secondSelector);
    if (!first || !second) continue;
    const overlap = intersection(first,second);
    assert.ok(overlap.width <= 1 || overlap.height <= 1, `${firstSelector} overlaps ${secondSelector}`);
  }
  const regions=Object.entries(metrics.regions);
  for(let a=0;a<regions.length;a++) for(let b=a+1;b<regions.length;b++){
    const overlap=intersection(regions[a][1],regions[b][1]);
    assert.ok(overlap.width<=2 || overlap.height<=2,`${regions[a][0]} and ${regions[b][0]} overlap by ${overlap.width.toFixed(1)}×${overlap.height.toFixed(1)}px`);
  }
  if (!metrics.pig) return;
  const pig = metrics.pig;
  const visible=metrics.payout ? metrics.held.coins.filter(coin=>coin.hero) : [pig];
  for(const object of visible){
    assert.ok(object.left>=Math.max(0,metrics.canvas.left)-2 && object.right<=Math.min(metrics.width,metrics.canvas.right)+2 && object.top>=Math.max(0,metrics.canvas.top)-2 && object.bottom<=Math.min(metrics.height,metrics.canvas.bottom)+2,'Projected object is clipped by the viewport or canvas');
  }
  if (smallLandscape && !metrics.payout) {
    const minimum = metrics.height <= 320 ? 145 : 200;
    assert.ok(pig.height >= minimum, `Actual projected pig is ${pig.height.toFixed(1)}px high; minimum is ${minimum}px`);
  }
  const obstacles = Object.entries(metrics.regions).filter(([selector]) => ['.topbar','.pot-block','.timer-group','.key-loot','.purchase-panel','.arena-feedback'].includes(selector));
  const objectsToCheck = metrics.payout ? metrics.held.coins.filter(coin => coin.hero) : [pig];
  for (const [selector,region] of obstacles) for (const object of objectsToCheck) {
    const overlap = intersection(region,object);
    // Projection includes the shell and every coin vertex; tolerate <2px edges.
    assert.ok(overlap.width <= 2 || overlap.height <= 2, `${selector} overlaps ${metrics.payout ? 'a held prize coin' : 'the actual pig'} in ${phase}: ${overlap.width.toFixed(1)}×${overlap.height.toFixed(1)}px`);
  }
  if (metrics.width >= 1024 && metrics.height >= 600 && !metrics.payout) {
    const pot = metrics.regions['.pot-block'], timer = metrics.regions['.timer-group'];
    metrics.statGaps = { jackpot:pig.left-pot.right, timer:timer.left-pig.right, jackpotVertical:pot.centerY-pig.centerY, timerVertical:timer.centerY-pig.centerY };
    for (const [label,gap] of [['jackpot',metrics.statGaps.jackpot],['timer',metrics.statGaps.timer]]) {
      assert.ok(gap <= Math.max(90,pig.width*.2), `${label} is detached from pig: ${gap.toFixed(1)}px gap`);
    }
    assert.ok(Math.abs(metrics.statGaps.jackpotVertical) <= pig.height*.7+40 && Math.abs(metrics.statGaps.timerVertical) <= pig.height*.7+40, 'Desktop stats are too far above/below the pig');
  }
}
async function placement(page, phase = 'baseline', settleMs = 950) {
  await page.mouse.move(2,2); // Remove lingering pointer parallax before exact projection.
  if (settleMs) await page.waitForTimeout(settleMs);
  const metrics = await layout(page);
  metrics.pig = objects.pig(metrics.canvas);
  if (metrics.payout) metrics.held = await objects.held(metrics.canvas,metrics.width <= 767 || metrics.width <= 1100 && metrics.height <= 500);
  try { checkLayout(metrics,phase); } catch(error) { await screenshot(page,phase.replaceAll(':','-')+'-failed'); report.layoutFailures.push({phase,message:error.message}); if(!collectFailures) throw error; } finally { report.measurements.push({ phase,...metrics }); }
  return metrics;
}
async function longAmounts(page, action) {
  const saved = await page.evaluate(() => {
    const values = { '#pot-value':'9,007,199.254740991', '#key-loot-value':'9,007,199.254740991', '#purchase-cost':'1.123456789 <small>SOL</small>',
      '#buy-label':'Feed Piggy · 1.123456789 SOL', '#hud-rewards':'9,007,199.254740991 SOL', '#your-share':'99.9<small>%</small>',
      '#loot-share':'99.9% of reward pool', '#key-loot-reason':'Your cut earned 0.123456789 SOL from this feed.' };
    const originals = [];
    for (const [selector,value] of Object.entries(values)) {
      const element = document.querySelector(selector); if (!element) continue;
      originals.push({ selector,html:element.innerHTML }); element.innerHTML = value;
    }
    const classes = ['.pot-amount','.loot-amount'].map(selector => {
      const element = document.querySelector(selector), className = element.className;
      const amountChars = element.style.getPropertyValue('--amount-chars'), amountCharsPriority = element.style.getPropertyPriority('--amount-chars');
      element.classList.add('is-precise'); element.classList.toggle('is-long',document.querySelector(selector === '.pot-amount' ? '#pot-value' : '#key-loot-value').textContent.length>14); element.style.setProperty('--amount-chars',String(document.querySelector(selector === '.pot-amount' ? '#pot-value' : '#key-loot-value').textContent.length));
      return {selector,className,amountChars,amountCharsPriority};
    });
    return { originals,classes };
  });
  try { return await action(); } finally {
    await page.evaluate(saved => {
      for (const item of saved.originals) document.querySelector(item.selector).innerHTML = item.html;
      for (const item of saved.classes) {
        const element = document.querySelector(item.selector); element.className = item.className;
        if (item.amountChars) element.style.setProperty('--amount-chars',item.amountChars,item.amountCharsPriority); else element.style.removeProperty('--amount-chars');
      }
    },saved);
  }
}
async function screenshot(page, name) { await page.evaluate(async()=>{await Promise.all([...document.querySelectorAll('.kb-wipe *')].flatMap(e=>e.getAnimations().map(a=>a.finished.catch(()=>{}))));}); await page.screenshot({ path: path.join(output, `${name}.png`) }); }
async function walletAction(page, selector) { await page.locator('.wallet-button').click(); await page.locator(selector).click(); }
async function dismissToast(page) {
  await page.locator('#toast-dismiss').click();
  await page.locator('#toast.visible').waitFor({state:'hidden'});
  await page.waitForFunction(() => getComputedStyle(document.querySelector('#toast')).opacity === '0');
}
const parseSol = text => BigInt(text.replace(/[^\d.]/g, '').split('.')[0] || 0) * 1_000_000_000n + BigInt((text.replace(/[^\d.]/g, '').split('.')[1] || '').padEnd(9, '0'));
try {
  const sizes = [ ['desktop',1440,900], ['desktop-1366',1366,768], ['laptop',1280,720], ['wide',1920,1080], ['tablet',1024,768], ['tablet-portrait',768,1024],
    ['phone',390,844], ['small-phone',360,640], ['tiny-phone',320,568], ['large-phone',430,932],
    ['landscape',844,390], ['compact-landscape',667,375], ['small-landscape',480,320] ];
  for (const [name,width,height] of sizes) {
    if (selectedSizes && !selectedSizes.includes(name)) continue;
    const {context,page} = await open({width,height});
    const metrics = await placement(page,`${name}:baseline`);
    await screenshot(page,name);
    await longAmounts(page,async () => {
      await placement(page,`${name}:long-exact-amounts`,0);
      await screenshot(page,`${name}-long-amounts`);
    });
    if(layoutOnly){report.viewports.push({name,...metrics,checks:['placement baseline and long exact amounts']});await context.close();continue;}
    await page.locator('.mode-button').click();
    assert.equal(await page.locator('#mode-dialog').evaluate(dialog => dialog.open), true);
    await page.locator('#reward-mode').selectOption('snek');
    await page.locator('#mode-dialog .dialog-done').click();
    assert.equal(await page.locator('#mode-name').textContent(), 'Snek');
    await page.locator('.rewards-button').click();
    await screenshot(page,`${name}-rewards`);
    await page.locator('#rewards-dialog .dialog-close').click();
    if (!layoutOnly) {
      await page.locator('#buy-button').click();
      await placement(page,`${name}:feed-banner`);
      assert.ok(await page.locator('.arena-feedback.is-visible').count(), 'Confirmed feed banner is missing');
      if (width <= 1023) for (const selector of ['.pot-increase','.time-extension']) {
        assert.equal(await page.locator(selector).evaluate(element => getComputedStyle(element).visibility), 'hidden', `${selector} must not collide with the mobile confirmation banner`);
      }
      await screenshot(page,`${name}-feed`);
      await walletAction(page,'#fast-forward');
      await dismissToast(page);
      await page.locator('#app.round-over.has-jackpot').waitFor({timeout:10_000});
      await page.waitForTimeout(3_700);
      await placement(page,`${name}:held-prize`,0);
      await screenshot(page,`${name}-settled`);
    }
    report.viewports.push({name, ...metrics, checks:['no page scrolling','visible control size, center hit and pair overlap','portrait core text minima','long exact SOL amounts without clipping',
      'actual authored pig projection, UI separation and desktop stat gaps','mode dialog and selection','rewards dialog',...(!layoutOnly ? ['feed banner placement','settled prize coin placement'] : [])]});
    await context.close();
  }

  if (!layoutOnly) {
  const { context, page } = await open({width:1440,height:900});
  await page.locator('#buy-button').click();
  const keys = await page.locator('#your-keys').textContent();
  assert.equal(keys, '1');
  const rewardBefore = parseSol(await page.locator('#key-loot-value').textContent());
  await walletAction(page, '#demo-feed-button');
  await page.waitForFunction(before => {
    const raw = document.querySelector('#key-loot-value').textContent.replace(/,/g, '');
    const [whole, fraction=''] = raw.split('.');
    return BigInt(whole) * 1_000_000_000n + BigInt(fraction.padEnd(9, '0')) > BigInt(before);
  }, rewardBefore.toString());
  assert.equal(await page.locator('#your-keys').textContent(), keys, 'Losing the crown must preserve keys');
  await screenshot(page,'feed-rewards');
  report.flows.push('Feed buys keys; another feed visibly increases claimable SOL while keys stay held');

  const values = async () => page.locator('#wallet-balance,#key-loot-value,#your-keys,#token-claimable').allTextContents();
  // Reward numbers use a bounded650ms count-up. Compare settled values.
  await page.waitForTimeout(700);
  const beforePreview = await values();
  await walletAction(page,'#preview-payout');
  assert.ok(await page.locator('#app').evaluate(element => element.classList.contains('payout-preview')));
  assert.equal(await page.locator('.arena-feedback__headline').textContent(), 'Jackpot preview');
  await page.waitForTimeout(900); await screenshot(page,'preview-rise');
  await page.waitForTimeout(2800); await screenshot(page,'preview-held');
  assert.deepEqual(await values(),beforePreview,'Visual preview changed balances');
  await page.waitForFunction(() => !document.querySelector('#app').classList.contains('payout-preview'));
  await screenshot(page,'preview-restored');
  assert.deepEqual(await values(),beforePreview);
  report.flows.push('Jackpot preview runs full gold sequence, changes no balances and restores intact pig');

  await walletAction(page,'#preview-payout');
  await page.locator('#buy-button').click();
  assert.equal(await page.locator('#app').evaluate(e=>e.classList.contains('payout-preview')),false);
  assert.equal(await page.locator('#your-keys').textContent(),'2');
  report.flows.push('A feed during preview cancels preview and shows the confirmed feed');

  await walletAction(page,'#fast-forward');
  await page.locator('#app.round-over.has-jackpot').waitFor({timeout:10_000});
  await page.waitForTimeout(850); await screenshot(page,'jackpot-rise');
  await page.waitForTimeout(2850); await screenshot(page,'jackpot-held');
  assert.match(await page.locator('.arena-feedback__headline').textContent(), /Jackpot/);
  assert.equal(await page.locator('#leader-name').textContent(),'You');
  await page.locator('#buy-button').click();
  await ready(page);
  assert.equal(await page.locator('#app').evaluate(e=>e.classList.contains('has-jackpot')),false);
  assert.equal(await page.locator('.arena-feedback').evaluate(e=>e.classList.contains('is-visible')),false);
  assert.equal(await page.locator('#your-keys').textContent(),'0');
  await screenshot(page,'next-round');
  report.flows.push('Actual demo settlement pays the last feeder, holds the gold scene and clears it on new round');

  await page.emulateMedia({ reducedMotion:'reduce' }); await ready(page);
  assert.equal(await page.locator('.vault-canvas').count(),1,'Changing motion preference duplicates canvas');
  await page.emulateMedia({ reducedMotion:'no-preference' }); await ready(page);
  assert.equal(await page.locator('.vault-canvas').count(),1);
  report.flows.push('Changing reduced-motion preference rebuilds a single scene');
  await context.close();

  const reduced = await open({width:390,height:844},{deviceScaleFactor:2,reducedMotion:'reduce'});
  await screenshot(reduced.page,'phone-dpr2-reduced');
  await reduced.page.locator('#buy-button').click();
  await walletAction(reduced.page,'#fast-forward');
  await reduced.page.locator('#app.round-over.has-jackpot').waitFor({timeout:10_000});
  await screenshot(reduced.page,'phone-reduced-jackpot');
  const staticFirst=await reduced.page.locator('.vault-canvas').screenshot();
  await reduced.page.waitForTimeout(450);
  const staticSecond=await reduced.page.locator('.vault-canvas').screenshot();
  assert.ok(staticFirst.equals(staticSecond),'Reduced-motion prize scene animates');
  report.flows.push('DPR2 phone renders; reduced-motion jackpot is static');
  await reduced.context.close();

  const phone = await open({width:390,height:844},{deviceScaleFactor:2,recordVideo:{dir:path.join(output,'recordings'),size:{width:390,height:844}}});
  await phone.page.locator('#buy-button').click();
  await walletAction(phone.page,'#fast-forward');
  await phone.page.locator('#app.round-over.has-jackpot').waitFor({timeout:10_000});
  await phone.page.waitForTimeout(850); await screenshot(phone.page,'phone-jackpot-rise');
  await phone.page.waitForTimeout(2850); await screenshot(phone.page,'phone-jackpot-held');
  await placement(phone.page,'phone-dpr2:held-prize',0);
  await phone.page.locator('#buy-button').click(); await ready(phone.page);
  assert.equal(await phone.page.locator('.arena-feedback').evaluate(e=>e.classList.contains('is-visible')),false);
  await screenshot(phone.page,'phone-next-round');
  const clip = phone.page.video(); await phone.context.close();
  await clip.saveAs(path.join(output,'phone-jackpot.webm'));
  report.flows.push('DPR2 phone completes animated jackpot and next-round restore; clip captured');
  }

  for(const [name,width,height,insets] of [
    ['phone-safe-area',390,844,{top:47,bottom:34,left:0,right:0}],
    ['landscape-safe-area',844,390,{top:0,bottom:21,left:44,right:44}],
  ]) {
    if (selectedSizes && !selectedSizes.includes(name)) continue;
    const safe=await open({width,height});
    await safe.page.evaluate(insets=>{
      for(const [side,value] of Object.entries(insets)) document.documentElement.style.setProperty(`--kb-safe-${side}`,`${value}px`);
      return new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
    },insets);
    const metrics=await placement(safe.page,name);
    await longAmounts(safe.page,async () => {
      await placement(safe.page,`${name}:long-exact-amounts`,0);
      await screenshot(safe.page,`${name}-long-amounts`);
    });
    await screenshot(safe.page,name);
    report.viewports.push({name,...metrics,checks:['simulated safe-area insets','no page scrolling','44px controls in viewport']});
    await safe.context.close();
  }
  // RAF timestamps can precede a performance.now() captured in the same frame.
  // Exercise that boundary in the real UI, preserving strict lamport formatting.
  if (!layoutOnly) {
  const timingContext=await browser.newContext({viewport:{width:390,height:844}});
  const timing=await timingContext.newPage();
  timing.on('pageerror',error=>report.errors.push(error.stack || error.message));
  await timing.addInitScript(()=>{
    const nativeFrame=window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame=callback=>nativeFrame(time=>callback(time-50));
  });
  await timing.goto(`${baseUrl}/?demo=1`,{waitUntil:'networkidle'}); await ready(timing);
  await timing.locator('#buy-button').click();
  await timing.waitForTimeout(800);
  assert.ok(parseSol(await timing.locator('#key-loot-value').textContent())>=0n);
  report.flows.push('Counters tolerate a RAF timestamp before animation start without invalid SOL');
  await timingContext.close();
  }
  assert.deepEqual(report.errors,[],'Browser errors detected');
  assert.deepEqual(report.layoutFailures,[],'Layout checks failed');
  report.result='passed';
} catch(error) {
  report.result='failed'; report.failure=error.stack; throw error;
} finally {
  await fs.writeFile(path.join(output,'report.json'),JSON.stringify(report,null,2));
  await browser.close();
  objects.dispose();
  console.log(JSON.stringify({result:report.result,viewports:report.viewports.length,flows:report.flows,errors:report.errors,output},null,2));
}
