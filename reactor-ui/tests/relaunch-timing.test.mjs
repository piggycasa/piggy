import test from 'node:test';
import assert from 'node:assert/strict';
import {Keypair, PublicKey} from '@solana/web3.js';
import {getAssociatedTokenAddressSync, NATIVE_MINT} from '@solana/spl-token';
import {PIGGY_TIMING} from '../src/game-timing.mjs';
import {relaunchConfigs, RELAUNCH} from '../scripts/relaunch-config.mjs';
import {gameInitializationInstructions} from '../scripts/publicnet-game-init.mjs';
import {validateMainnetGameConfiguration} from '../scripts/publicnet-validation.mjs';
import {createGame, buyKeys, timeRemaining, NEW_ROUND_DURATION_MS, MAX_REMAINING_MS} from '../src/holder-engine.mjs';
import {createPurchasePreview} from '../src/purchase-preview.mjs';
import {countdownParts} from '../public/launch-clock.js';

test('relaunch config, unsigned initialization and operator gates agree on 300/30/600', () => {
  const {publicConfig,keeper,publisher} = relaunchConfigs({mint:Keypair.generate().publicKey.toBase58(),rpcUrl:'https://rpc.example',root:'/private/piggy'});
  for (const config of [publicConfig,keeper,publisher]) assert.deepEqual(config.gameTiming,PIGGY_TIMING);
  const plan=gameInitializationInstructions({...publicConfig,...RELAUNCH.authorities});
  const data=plan.steps[1].instructions[0].data;
  assert.deepEqual([9,17,25].map(offset=>data.readBigInt64LE(offset)),[300n,30n,600n]);
  const game={round_init_time:300n,round_inc_time_per_key:30n,round_max_time:600n,game_creator:RELAUNCH.authorities.gameCreator,community_wallet:getAssociatedTokenAddressSync(NATIVE_MINT,new PublicKey(RELAUNCH.authorities.communityTreasury)).toBase58()};
  const holder={publisher:RELAUNCH.authorities.holderPublisher};
  assert.equal(validateMainnetGameConfiguration(game,holder,RELAUNCH.authorities,PIGGY_TIMING).maxSeconds,600);
  for (const field of ['round_init_time','round_inc_time_per_key','round_max_time']) assert.throws(()=>validateMainnetGameConfiguration({...game,[field]:game[field]+1n},holder,RELAUNCH.authorities,PIGGY_TIMING));
  assert.throws(()=>validateMainnetGameConfiguration(game,holder,RELAUNCH.authorities));
});

test('five-minute opening, quote cap, full-cap purchase and subsequent extension agree', () => {
  const now=1800000000000,state=createGame(now,{seeded:false});
  assert.equal(NEW_ROUND_DURATION_MS,300000);assert.equal(MAX_REMAINING_MS,600000);
  assert.equal(timeRemaining(state,now),300000);
  let preview=createPurchasePreview({state,count:100,now});
  assert.equal(preview.timeAddedMs,300000);assert.equal(preview.resultingRemainingMs,600000);
  assert.equal(buyKeys(state,'you',100,now).actualExtensionMs,300000);
  preview=createPurchasePreview({state,count:1,now});assert.equal(preview.timeAddedMs,0);
  assert.equal(buyKeys(state,'npc_fox',1,now).actualExtensionMs,0);
  preview=createPurchasePreview({state,count:1,now:now+10000});assert.equal(preview.timeAddedMs,10000);
  assert.equal(buyKeys(state,'you',1,now+10000).actualExtensionMs,10000);
});

test('launch clock reaches zero once, never goes negative or signals that trading is live', () => {
  const target='2026-11-02T21:00:00Z',t=Date.parse(target);
  assert.deepEqual(countdownParts(target,t-3600000),{reached:false,text:'01:00:00'});
  assert.deepEqual(countdownParts(target,t-1),{reached:false,text:'00:00:01'});
  assert.deepEqual(countdownParts(target,t),{reached:true,text:'00:00:00'});
  assert.deepEqual(countdownParts(target,t+86400000),{reached:true,text:'00:00:00'});
  assert.throws(()=>countdownParts('invalid'));
});
