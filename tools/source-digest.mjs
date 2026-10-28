#!/usr/bin/env node
/** Read-only digest using the same file ordering and separators as publicnet-common.mjs. */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../program');
const files=[];
async function walk(directory){for(const entry of await fs.readdir(directory,{withFileTypes:true})){const filename=path.join(directory,entry.name);if(entry.isDirectory())await walk(filename);else if(entry.name.endsWith('.rs'))files.push(filename);}}
await walk(path.join(root,'src'));
files.push(path.join(root,'Cargo.toml'),path.join(root,'Cargo.lock'));
const digest=createHash('sha256');
for(const filename of files.sort()){digest.update(path.relative(root,filename));digest.update('\0');digest.update(await fs.readFile(filename));digest.update('\0');}
const sha256=digest.digest('hex');
const expected='1dfdc1cd411970f7d56659e10e4a6b0af760a091d79437dbf2920e076cd13211';
console.log(JSON.stringify({sha256,expected,matches:sha256===expected,files:files.length}));
if(sha256!==expected)process.exitCode=1;
