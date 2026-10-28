import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
const dir=resolve(process.argv[2]||'dist');
const source=await readFile(resolve(dir,'server/index.js'),'utf8');
const manifest=JSON.parse(await readFile(resolve(dir,'.openai/hosting.json'),'utf8'));
assert.ok(manifest.project_id);assert.equal(manifest.static,undefined);
const module=await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
assert.equal(typeof module.default?.fetch,'function');
for(const path of ['/','/models/piggy-bank-glass.glb','/favicon.svg']){const response=await module.default.fetch(new Request('https://piggy.invalid'+path),{});assert.equal(response.status,200,path);assert.ok((await response.arrayBuffer()).byteLength>0,path);}
assert.equal((await module.default.fetch(new Request('https://piggy.invalid/.openai/hosting.json'),{})).status,404);
assert.equal((await module.default.fetch(new Request('https://piggy.invalid/rpc'),{})).status,405);
console.log('Worker artifact validated: ESM entry, manifest, HTML, model, favicon and private-path exclusion.');
