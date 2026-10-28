/** Real local-validator transactions through the public browser-wallet adapter.
 * The injected signing provider below is an isolated TEST keypair, not shipped
 * code. Only the genesis response is translated so strict public configuration
 * can exercise the same production path against the loopback test validator. */
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { SystemProgram } from '@solana/web3.js';
import { TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';
import { makeContext, currentGame, readAccount, temporaryWsol, send, publishAvailable } from './localnet-runtime.mjs';
import { LOCAL } from './localnet-common.mjs';
import { createPublicGameClient } from '../src/solana-public-client.mjs';
import { CLUSTER_GENESIS } from '../src/solana-config.mjs';
import { costForExactKeys } from '../src/solana-curve.mjs';
import * as sdk from '../src/solana-instructions.mjs';
const token2022=process.argv.includes('--token-2022');
const ctx=await makeContext({version:BigInt(Date.now()),isolated:true,...(token2022?{eligibilityTokenProgram:TOKEN_2022_PROGRAM_ID,eligibilityMetadataPointer:true}:{})}),checks=[],signatures=[];
const publicConnection=new Proxy(ctx.connection,{get(target,name){if(name==='getGenesisHash')return async()=>CLUSTER_GENESIS.devnet;const value=target[name];return typeof value==='function'?value.bind(target):value;}});
const config={schemaVersion:1,cluster:'devnet',genesisHash:CLUSTER_GENESIS.devnet,rpcUrl:'https://local-test-adapter.invalid',programId:ctx.programId,piggyMint:ctx.piggyMint.toBase58(),gameVersion:ctx.version.toString(),proofIndexUrl:'https://local-test-proofs.invalid/',purchaseGuardVersion:1};
function makeClient(actor){const pair=ctx.wallets[actor],wallet=pair.publicKey.toBase58();return createPublicGameClient(config,{connection:publicConnection,walletScope:{phantom:{solana:{publicKey:pair.publicKey,connect:async()=>({publicKey:pair.publicKey}),disconnect:async()=>{},on(){},removeListener(){},signTransaction:async tx=>{tx.partialSign(pair);return tx;}}}},fetch:async()=>({ok:true,status:200,json:async()=>({...config,wallet,epochs:ctx.epochs.filter(e=>e.status==='published').flatMap(epoch=>epoch.records.filter(r=>r.wallet===wallet).map(row=>({epoch:epoch.epoch,amount:row.amount,proof:row.proof})))})})});}
const client=makeClient('you'),other=makeClient('npc_fox');
const check=(name,value)=>{assert.ok(value,name);checks.push(name);};
const signed=async result=>{signatures.push(...result.signatures);check('confirmed signature returned',result.ok&&result.signature);return result;};
check('public adapter reads authoritative accounts while disconnected',!(await client.getState()).walletConnected);
await client.connect();await other.connect();
const{game,round}=await currentGame(ctx),quote=costForExactKeys(round.accum_sol_pot,10n);
await signed(await client.feed({count:10,mode:'snek',expectedRound:String(game.round_id),maxCostLamports:String(quote.lamports)}));
let view=await client.getState();check('guarded purchase minted the displayed ten keys',view.players[0].playerRound.accum_keys===10n);
const beforeRewards=sdk.claimableGame(view.players[0].playerRound,view.round).total;
const otherQuote=costForExactKeys(view.round.accum_sol_pot,20n);
await signed(await other.feed({count:20,mode:'snek',expectedRound:'1',maxCostLamports:String(otherQuote.lamports)}));
view=await client.getState();check('another wallet feed increases existing key income',sdk.claimableGame(view.players[0].playerRound,view.round).total>beforeRewards);
const nativeAccountsBefore=(await ctx.connection.getTokenAccountsByOwner(ctx.wallets.you.publicKey,{mint:sdk.NATIVE_MINT},'confirmed')).value.length;
await signed(await client.claimGame());view=await client.getState();check('game claim leaves zero outstanding game liability',sdk.claimableGame(view.players[0].playerRound,view.round).total===0n);
check('atomic game claim closed its temporary wrapped-SOL account',(await ctx.connection.getTokenAccountsByOwner(ctx.wallets.you.publicKey,{mint:sdk.NATIVE_MINT},'confirmed')).value.length===nativeAccountsBefore);
await publishAvailable(ctx);view=await client.getState();check('wallet proof verifies a funded holder allocation',view.players[0].holder.claimable>0n);const tokensBefore=view.players[0].tokenBalance;
await signed(await client.claimHolder());view=await client.getState();check('holder claim paid once and kept token principal',view.players[0].holder.claimable===0n&&view.players[0].tokenBalance===tokensBefore);
await assert.rejects(client.claimHolder(),/No published holder rewards/);checks.push('duplicate holder claim is blocked');

async function ledger(){const{game,round}=await currentGame(ctx),player=await readAccount(ctx,sdk.playerAddress(ctx.programId,ctx.wallets.you.publicKey,game.round_id,ctx.version),sdk.decodePlayer);return sdk.serializeChain({round,player,pot:await ctx.connection.getTokenAccountBalance(sdk.potAddress(ctx.programId,game.round_id,ctx.version),'confirmed')});}
async function guardedRejected(name,{amount,count=1n,expected=1n,expiry,code}){
  const before=await ledger(),temp=await temporaryWsol(ctx,ctx.wallets.you,amount),ix=sdk.guardedPurchaseInstruction({programId:ctx.programId,buyer:ctx.wallets.you.publicKey,version:ctx.version,roundId:expected,source:temp.account.publicKey,amount,mode:'whale',minimumKeys:count,expiresAtSlot:expiry});
  // Expected round is in the data AND PDA accounts; use actual round accounts to
  // prove the guarded stale-round check itself rejects the data mismatch.
  const actual=await currentGame(ctx);if(expected!==actual.game.round_id){const valid=sdk.guardedPurchaseInstruction({programId:ctx.programId,buyer:ctx.wallets.you.publicKey,version:ctx.version,roundId:actual.game.round_id,source:temp.account.publicKey,amount,mode:'whale',minimumKeys:count,expiresAtSlot:expiry});valid.data=ix.data;ix.keys=valid.keys;}
  let caught;try{await send(ctx,[...temp.before,ix,...temp.after],[ctx.wallets.you,temp.account]);}catch(error){caught=error;}
  check(name+' rejected',!!caught); if(!JSON.stringify(caught?.transactionLogs||caught?.logs||caught?.message||'').includes(`0x${code.toString(16)}`)) console.error(name, caught?.message, caught?.transactionLogs||caught?.logs); check(name+' precise on-chain guard error',JSON.stringify(caught?.transactionLogs||caught?.logs||caught?.message||'').includes(`0x${code.toString(16)}`)||JSON.stringify(caught).includes(`"Custom":${code}`));
  check(name+' leaves pot, keys, rewards and player contribution unchanged',await ledger()===before);
  check(name+' rolls back temporary wrapped-SOL account creation',await ctx.connection.getAccountInfo(temp.account.publicKey,'confirmed')===null);
}
let active=await currentGame(ctx),q=costForExactKeys(active.round.accum_sol_pot,1n),slot=await ctx.connection.getSlot('confirmed');
await guardedRejected('expired quote',{amount:q.lamports,expiry:BigInt(slot-1),code:21});
await guardedRejected('wrong round quote',{amount:q.lamports,expected:99n,expiry:BigInt(slot+120),code:21});
// Two wallets quote the same exact final available key price. One moves the
// curve before the first executes; the first cannot debit SOL for fewer keys.
const old=costForExactKeys(active.round.accum_sol_pot,10n).lamports;const competing=costForExactKeys(active.round.accum_sol_pot,100n);await signed(await other.feed({count:100,mode:'whale',expectedRound:'1',maxCostLamports:String(competing.lamports)}));
await guardedRejected('concurrent curve movement',{amount:old,count:10n,expiry:BigInt(await ctx.connection.getSlot('confirmed')+120),code:22});
await assert.rejects(client.action({action:'publishHolderEpoch'}),/unavailable/);checks.push('browser public client cannot invoke publisher or treasury admin actions');
await client.disconnect();await other.disconnect();
const report={ok:true,network:'localnet-only',eligibilityMintKind:token2022?'Token-2022 with MetadataPointer and TokenMetadata':'legacy SPL',programId:ctx.programId,gameVersion:ctx.version.toString(),piggyMint:ctx.piggyMint.toBase58(),checks,signatures,limitations:['Wallet signing provider is a test keypair; no browser extension or physical mobile device is exercised.','Only genesis is translated in the injected local RPC adapter; this is not proof of a public-cluster deployment.']};
await fs.mkdir(path.join(LOCAL,'reports'),{recursive:true});const filename=path.join(LOCAL,'reports',token2022?'public-wallet-token2022-integration.json':'public-wallet-integration.json');await fs.writeFile(filename,JSON.stringify(report,null,2));console.log(JSON.stringify({ok:true,checks:checks.length,signatures:signatures.length,report:filename}));
