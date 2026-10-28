#!/usr/bin/env node
/** Embed an already-built Vite site into the documented single-ESM Sites artifact. */
import {readFile,writeFile,mkdir,readdir,stat,rm} from 'node:fs/promises';
import {resolve,relative,extname,join} from 'node:path';
import {createHash} from 'node:crypto';
import {gzipSync} from 'node:zlib';
const args=process.argv.slice(2),arg=(name,fallback)=>args.includes(name)?args[args.indexOf(name)+1]:fallback;
const root=process.cwd(),assetsDir=resolve(arg('--assets-dir','.openai/local/site-client-dist')),outputDir=resolve(arg('--output-dir','dist')),manifestPath=resolve(arg('--manifest','.openai/hosting.json'));
if(assetsDir===outputDir||!relative(assetsDir,outputDir).startsWith('..')||!relative(outputDir,assetsDir).startsWith('..'))throw new Error('Assets and output directories must be separate, non-nested paths.');
const manifest=JSON.parse(await readFile(manifestPath,'utf8'));
if(!manifest.project_id||manifest.static)throw new Error('Worker manifest requires the existing project_id and no static field. The Site owner must migrate the manifest.');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.glb':'model/gltf-binary','.woff':'font/woff','.woff2':'font/woff2','.txt':'text/plain; charset=utf-8','.wasm':'application/wasm'};
const assets={};let bytes=0;
async function collect(dir){for(const item of await readdir(dir,{withFileTypes:true})){if(item.name.startsWith('.')||item.isSymbolicLink())throw new Error('Hidden files and symlinks are prohibited in public assets.');const path=join(dir,item.name);if(item.isDirectory()){await collect(path);continue;}if(!item.isFile())throw new Error('Unsupported public asset.');const extension=extname(path).toLowerCase();if(!types[extension]||extension==='.map')throw new Error(`Unsupported public asset type: ${extension}`);const data=await readFile(path);bytes+=data.length;assets['/'+relative(assetsDir,path).split('\\').join('/')]={type:types[extension],etag:'"'+createHash('sha256').update(data).digest('hex')+'"',base64:data.toString('base64')};}}
await collect(assetsDir);if(!assets['/index.html'])throw new Error('No built index.html found.');
const source=await readFile(resolve(root,'server/rpc-worker.mjs'),'utf8');
const bundled=source.replace('export default createWorker();',`export default createWorker({assets:${JSON.stringify(assets)}});`);
const compressed=gzipSync(bundled).length;
// Keep within the 10 MiB compressed Worker paid-plan limit; Sites deployment is authoritative.
if(compressed>10*1024*1024)throw new Error(`Embedded Worker is ${compressed} bytes compressed, exceeding 10 MiB. Move assets to supported storage before publishing.`);
try{await stat(outputDir);if(!args.includes('--replace-generated-output'))throw new Error('Output already exists; use --replace-generated-output only for generated build output.');if(outputDir===root||!relative(root,outputDir)||relative(root,outputDir).startsWith('..'))throw new Error('Refusing to replace output outside this project.');await rm(outputDir,{recursive:true});}catch(error){if(error.code!=='ENOENT')throw error;}
await mkdir(join(outputDir,'server'),{recursive:true});await mkdir(join(outputDir,'.openai'),{recursive:true});
await writeFile(join(outputDir,'server/index.js'),bundled);await writeFile(join(outputDir,'.openai/hosting.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify({assetCount:Object.keys(assets).length,assetBytes:bytes,workerBytes:Buffer.byteLength(bundled),workerGzipBytes:compressed,outputDir}));
