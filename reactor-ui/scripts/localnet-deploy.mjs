import fs from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { initializeLocalFiles, writeConfig, LOCAL, PROGRAM_ROOT, RPC_URL, connection } from './localnet-common.mjs';
const run=promisify(execFile);const{config}=await initializeLocalFiles();
const binary=process.env.PIGGY_PROGRAM_SO||path.join(PROGRAM_ROOT,process.argv.includes('--test-lottery')?'target/deploy-localtest/fomo3d.so':'target/deploy-default/fomo3d.so');
await fs.access(binary);
try{const result=await run('solana',['--url',RPC_URL,'--keypair',path.join(LOCAL,'wallets/payer.json'),'--commitment','confirmed','program','deploy','--program-id',path.join(LOCAL,'wallets/program.json'),'--upgrade-authority',path.join(LOCAL,'wallets/payer.json'),'--output','json',binary],{maxBuffer:2_000_000});const output=JSON.parse(result.stdout);config.lotteryPolicy=process.argv.includes('--test-lottery')?'predictable-local-test-only':'disabled-reserve-only';config.deployment={programId:output.programId||config.programId,signature:output.signature,binary,deployedAt:new Date().toISOString()};await writeConfig(config);const account=await connection().getAccountInfo(new (await import('@solana/web3.js')).PublicKey(config.programId));if(!account?.executable)throw new Error('Deployment did not create an executable program.');console.log(JSON.stringify({ok:true,...config.deployment}));}catch(error){await fs.writeFile(path.join(LOCAL,'deploy-error.log'),String(error.stderr||error.message),{mode:0o600});throw new Error('Local program deployment failed; diagnostic output retained in the ignored local directory.');}
