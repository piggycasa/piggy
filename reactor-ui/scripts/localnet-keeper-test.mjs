/** Actual permissionless keeper cycle, isolated on the dedicated local validator. */
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { Keypair, SystemProgram } from '@solana/web3.js';
import { getOrCreateAssociatedTokenAccount } from '@solana/spl-token';
import * as rt from './localnet-runtime.mjs';
import * as sdk from '../src/solana-instructions.mjs';
import { LOCAL, RPC_URL } from './localnet-common.mjs';
import { durableJson, loadPublisher, initializePublisher } from './holder-publisher.mjs';
import { loadKeeper, keeperTick, keeperStatus, reconcileKeeper, withKeeperLock } from './round-keeper.mjs';

const report = { scope: 'dedicated local validator; no public-network or mainnet transactions', checks: [], signatures: [], passed: false };
const check = (value, label) => { assert.ok(value, label); report.checks.push(label); console.log('PASS ' + label); };
const pause = () => new Promise(resolve => setTimeout(resolve, 700));
try {
  const base = await rt.makeContext({ version: Date.now(), isolated: true }), version = base.version + 1_000_000n;
  const game = { ...base, version, game: sdk.gameAddress(base.programId, version), manifestFile: path.join(LOCAL, `keeper-game-${version}.json`), epochs: [], activity: [] };
  const keeper = Keypair.generate(), directory = path.join(LOCAL, `keeper-${version}`), keyFile = path.join(directory, 'keys', 'keeper.json');
  await durableJson(keyFile, [...keeper.secretKey]);
  const placeholder = (await getOrCreateAssociatedTokenAccount(game.connection, game.payer, sdk.NATIVE_MINT, game.payer.publicKey)).address;
  report.signatures.push(await rt.send(game, [
    SystemProgram.transfer({ fromPubkey: game.payer.publicKey, toPubkey: keeper.publicKey, lamports: 100_000_000 }),
    sdk.initializeGameInstruction({ programId: game.programId, creator: game.payer.publicKey, version, communityWallet: game.communityAccount, p3dWallet: placeholder, initialSeconds: 18, incrementSeconds: 1, maxSeconds: 30 }),
    sdk.initializeHolderInstruction({ programId: game.programId, creator: game.payer.publicKey, version, eligibilityMint: game.piggyMint, publisher: game.payer.publicKey }),
  ]));
  // Initialization must be finalized before the finalized publisher snapshot.
  const initializedSlot = await game.connection.getSlot('confirmed');
  while (await game.connection.getSlot('finalized') < initializedSlot) await pause();
  const common = { schemaVersion: 1, cluster: 'localnet', genesisHash: await game.connection.getGenesisHash(), rpcUrl: RPC_URL, programId: game.programId, gameVersion: version.toString(), piggyMint: game.piggyMint.toBase58() };
  const publisherConfig = path.join(directory, 'publisher.json');
  await durableJson(publisherConfig, { ...common, publisherKeypair: path.join(LOCAL, 'wallets', 'payer.json'), workspace: './publisher-private', proofOutput: './proofs', minPublishLamports: '1000', epochSeconds: 60 });
  const publisher = await loadPublisher(publisherConfig, { allowLocal: true });
  await initializePublisher(publisher);
  check((await rt.readAccount(game, game.game, sdk.decodeGame)).round_id === 0n, 'opening holder snapshot exists before the keeper creates round 1');
  const configFile = path.join(directory, 'keeper.json');
  await durableJson(configFile, { ...common, keeperPublicKey: keeper.publicKey.toBase58(), keeperKeypair: keyFile, workspace: './keeper-private', publisherStateFile: publisher.stateFile, celebrationSeconds: 8, pollSeconds: 1, maxDailyRentLamports: 100_000_000 });
  let operator = await loadKeeper(configFile, { allowLocal: true }), broadcasts = 0;
  const originalSend = operator.connection.sendRawTransaction.bind(operator.connection);
  operator.connection.sendRawTransaction = async (...args) => { broadcasts++; const signature = await originalSend(...args); if (broadcasts === 1) throw new Error('Test: response lost after RPC accepted signed transaction'); return signature; };
  const first = await withKeeperLock(operator.config.workspace, () => keeperTick(operator));
  check(first.status === 'pending-reconciliation', 'a lost acceptance response retains the exact durable transaction identity');
  report.signatures.push(first.signature);
  await withKeeperLock(operator.config.workspace, () => keeperTick(operator));
  check(broadcasts === 1, 'a pending initial-round transaction is never broadcast twice');
  // The transaction is real despite the simulated lost response. Feed quickly
  // after confirmed initialization while the keeper waits for finality.
  while ((await rt.readAccount(game, game.game, sdk.decodeGame)).round_id === 0n) await pause();
  const feed = await rt.feed(game, { count: 1, publish: false }); report.signatures.push(feed.signature);
  check(feed.result.count === 1, 'a real user feed creates a winner and funds the original fee buckets');
  operator = await loadKeeper(configFile, { allowLocal: true });
  const originalRestartSend = operator.connection.sendRawTransaction.bind(operator.connection);
  operator.connection.sendRawTransaction = async (...args) => { broadcasts++; return originalRestartSend(...args); };
  const deadline = Date.now() + 120_000; let observedAt, secondRound;
  while (Date.now() < deadline) {
    const step = await withKeeperLock(operator.config.workspace, () => keeperTick(operator));
    if (step.signature && !report.signatures.includes(step.signature)) report.signatures.push(step.signature);
    if (step.status === 'celebration' && step.roundId === '1') {
      observedAt = JSON.parse(await fs.readFile(operator.stateFile, 'utf8')).observedEnded.chainTime;
      const round = await rt.readAccount(game, sdk.roundAddress(game.programId, 1n, version), sdk.decodeRound);
      check(round.ended && round.final_prize_share > 0n, 'keeper permissionlessly settles the funded round after its on-chain deadline');
      const winner = await rt.readAccount(game, sdk.playerAddress(game.programId, game.wallets.you.publicKey, 1n, version), sdk.decodePlayer);
      check(winner.accum_winnings === round.final_prize_share, 'settlement credits exactly the winner allocation');
      check((await keeperStatus(operator)).decision.reason === 'celebration', 'keeper waits instead of immediately opening the next round');
    }
    if (step.action === 'start' && step.roundId === '2') {
      // Finish only this target transaction. A live watch correctly keeps
      // settling later short test rounds if finalization outlasts their timer.
      while (Date.now() < deadline) {
        const stored = JSON.parse(await fs.readFile(operator.stateFile, 'utf8'));
        await withKeeperLock(operator.config.workspace, () => reconcileKeeper(operator, stored));
        secondRound = await keeperStatus(operator); if (!secondRound.pending) break; await pause();
      }
      if (secondRound?.pending) secondRound = undefined;
      break;
    }
    const state = await keeperStatus(operator);
    if (state.roundId === '2' && !state.pending) { secondRound = state; break; }
    await pause();
  }
  check(!!secondRound, 'a restarted keeper opens round 2 and finalizes its journal');
  const ended = await rt.readAccount(game, sdk.roundAddress(game.programId, 1n, version), sdk.decodeRound), next = await rt.readAccount(game, sdk.roundAddress(game.programId, 2n, version), sdk.decodeRound);
  check(Number(next.start_time) >= observedAt + 8, 'the jackpot celebration lasts at least eight on-chain seconds');
  check(next.still_in_play === ended.accum_next_round_share && next.accum_airdrop_share === ended.accum_airdrop_carried, 'new-round initialization preserves jackpot rollover and the separate lottery reserve');
  const journal = JSON.parse(await fs.readFile(operator.stateFile, 'utf8'));
  check(journal.transactions.length === 3 && journal.transactions.every(row => row.status === 'confirmed') && broadcasts === 3, 'only initial start, settlement and next start were broadcast, once each');
  check(journal.transactions.every(row => row.feeLamports > 0 && row.feeLamports <= operator.config.maxFeeLamportsPerTransaction), 'real fee estimates and round-account rent remain inside configured budgets');
  check((await fs.stat(operator.stateFile)).mode % 512 === 0o600, 'keeper journal remains owner-only');
  report.directory = directory; report.passed = true;
} catch (error) { report.failure = error.stack; throw error; }
finally { await fs.mkdir(path.join(LOCAL, 'reports'), { recursive: true }); await durableJson(path.join(LOCAL, 'reports', 'keeper-integration.json'), report); console.log(JSON.stringify({ passed: report.passed, checks: report.checks.length, scope: report.scope, directory: report.directory })); }
