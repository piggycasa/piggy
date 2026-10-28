import fs from 'node:fs/promises';
import net from 'node:net';
import { spawn } from 'node:child_process';
import { initializeLocalFiles, waitForRpc, writeConfig, RPC_URL } from './localnet-common.mjs';
const {config,payer}=await initializeLocalFiles();
await new Promise((resolve,reject)=>{const server=net.createServer();server.once('error',()=>reject(new Error('Port 18899 is occupied; refusing to stop or replace another validator.')));server.listen(18899,'127.0.0.1',()=>server.close(resolve));});
const args=['--ledger',config.ledger,'--rpc-port','18899','--faucet-port','18901','--gossip-port','18902','--dynamic-port-range','18910-18950','--bind-address','127.0.0.1','--mint',payer.publicKey.toBase58(),'--quiet'];
const child=spawn('solana-test-validator',args,{stdio:['ignore','inherit','inherit']});
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>child.kill(signal));
child.on('exit',code=>process.exit(code??1));
try{config.genesisHash=await waitForRpc();config.validatorPid=child.pid;await writeConfig(config);await fs.writeFile(config.ledger+'/piggy-localnet.marker','Dedicated Piggy test ledger. No real funds.\n');console.log(`Piggy local validator ready at ${RPC_URL}; pid ${child.pid}.`);}catch(error){child.kill('SIGTERM');throw error;}
