import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { Keypair, SystemProgram, Transaction, SYSVAR_CLOCK_PUBKEY } from '@solana/web3.js';
import { getAssociatedTokenAddressSync } from '@solana/spl-token';
import * as sdk from '../src/solana-instructions.mjs';
import { CLUSTER_GENESIS } from '../src/solana-config.mjs';
import { publicationDomain, eligibleOpeningSnapshot } from '../src/holder-publication.mjs';
import { durableJson } from '../scripts/holder-publisher.mjs';
import { validateKeeperConfig, keeperDecision, keeperSpending, keeperTick, keeperStatus, verifyKeeperProgram } from '../scripts/round-keeper.mjs';
import { base58Encode } from '../src/solana-signature.mjs';

async function fixture({ mainnet = false, transportError = false } = {}) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'piggy-keeper-')), keeper = Keypair.generate(), creator = Keypair.generate(), publisher = Keypair.generate(), treasury = Keypair.generate(), upgrade = Keypair.generate(), program = Keypair.generate().publicKey, mint = Keypair.generate().publicKey;
  const raw = { schemaVersion: 1, cluster: mainnet ? 'mainnet-beta' : 'localnet', genesisHash: mainnet ? CLUSTER_GENESIS['mainnet-beta'] : 'test-genesis', rpcUrl: mainnet ? 'https://rpc.example.test' : 'http://127.0.0.1:18899', programId: program.toBase58(), piggyMint: mint.toBase58(), gameVersion: '123', keeperPublicKey: keeper.publicKey.toBase58(), keeperKeypair: path.join(dir, 'keeper.json'), workspace: path.join(dir, 'private'), publisherStateFile: path.join(dir, 'publisher', 'state.json'), expectedAuthorities: { gameCreator: creator.publicKey.toBase58(), holderPublisher: publisher.publicKey.toBase58(), communityTreasury: treasury.publicKey.toBase58(), upgradeAuthority: upgrade.publicKey.toBase58() } };
  const binary = Buffer.from([0x7f, 0x45, 0x4c, 0x46]); raw.programBinarySha256 = createHash('sha256').update(binary).digest('hex'); raw.programBinaryBytes = binary.length;
  const config = validateKeeperConfig(raw, { allowLocal: !mainnet }), domain = publicationDomain(config), gameAddress = sdk.gameAddress(program, 123n), holderAddress = sdk.holderConfigAddress(program, gameAddress), vault = sdk.holderVaultAddress(program, gameAddress);
  const snapshot = eligibleOpeningSnapshot({ slot: 10, mint: mint.toBase58(), balances: new Map([[creator.publicKey.toBase58(), 1n]]) });
  await durableJson(raw.keeperKeypair, [...keeper.secretKey]); await durableJson(raw.publisherStateFile, { ...domain, activation: 'active', preGameAbsenceSlot: 11, minContextSlot: 11, openingSnapshot: snapshot, plans: [] });
  const state = { roundId: 0n, now: 1_000, slot: 100, ended: false, deadline: 2_000n, status: null, height: 100, genesis: raw.genesisHash }, counters = { send: 0, simulate: 0, fee: 5_000, compute: null };
  const programInfo = data => ({ owner: program, data });
  const clockInfo = () => { const data = Buffer.alloc(40); data.writeBigInt64LE(BigInt(state.now), 32); return { owner: sdk.pk('Sysvar1111111111111111111111111111111111111'), data }; };
  const gameData = () => Buffer.concat([Buffer.from([3]), ...[state.roundId, 3600n, 30n, 86400n, 123n].map(sdk.u64), sdk.NATIVE_MINT.toBuffer(), creator.publicKey.toBuffer(), getAssociatedTokenAddressSync(sdk.NATIVE_MINT, treasury.publicKey).toBuffer(), vault.toBuffer()]);
  const holderData = () => Buffer.concat([Buffer.from('PHCFG001'), gameAddress.toBuffer(), publisher.publicKey.toBuffer(), mint.toBuffer(), sdk.NATIVE_MINT.toBuffer(), vault.toBuffer(), ...[0n, 1n, 0n, 0n].map(sdk.u64), Buffer.from([1])]);
  const roundData = () => Buffer.concat([Buffer.from([4]), sdk.u64(state.roundId), SystemProgram.programId.toBuffer(), Buffer.from([0]), sdk.u64(900n), sdk.u64(state.deadline), Buffer.from([state.ended ? 1 : 0]), ...Array.from({ length: 17 }, () => sdk.u128(0n)), sdk.u64(0n), ...Array.from({ length: 4 }, () => sdk.u128(0n))]);
  const connection = {
    getGenesisHash: async () => state.genesis,
    getMultipleAccountsInfoAndContext: async (keys, options) => { assert(state.slot >= options.minContextSlot); return { context: { slot: state.slot }, value: keys.map(key => key.equals(program) ? { executable: true } : key.equals(gameAddress) ? programInfo(gameData()) : key.equals(holderAddress) ? programInfo(holderData()) : key.equals(SYSVAR_CLOCK_PUBKEY) ? clockInfo() : programInfo(roundData())) }; },
    getSignatureStatuses: async () => ({ value: [state.status] }), getBlockHeight: async () => state.height,
    getMinimumBalanceForRentExemption: async size => size === 403 ? 3_000_000 : 2_000_000,
    getLatestBlockhashAndContext: async () => ({ context: { slot: state.slot }, value: { blockhash: Keypair.generate().publicKey.toBase58(), lastValidBlockHeight: 1_000 } }),
    simulateTransaction: async () => { counters.simulate++; return { value: { err: null, unitsConsumed: 30_000 } }; },
    getFeeForMessage: async message => { counters.compute = Buffer.from(message.instructions[0].data, 'base64'); return { value: counters.fee }; },
    getBalance: async () => 100_000_000,
    getAccountInfoAndContext: async key => {
      const loader = sdk.pk('BPFLoaderUpgradeab1e11111111111111111111111'), data = Buffer.alloc(key.equals(program) ? 36 : 45 + binary.length);
      data.writeUInt32LE(key.equals(program) ? 2 : 3); if (key.equals(program)) mint.toBuffer().copy(data, 4); else { data[12] = 1; upgrade.publicKey.toBuffer().copy(data, 13); binary.copy(data, 45); }
      return { context: { slot: state.slot }, value: { owner: loader, executable: key.equals(program), data } };
    },
    sendRawTransaction: async bytes => { counters.send++; const tx = Transaction.from(bytes); counters.compute = tx.instructions[0].data.readUInt32LE(1); if (transportError) throw new Error('RPC lost response after acceptance'); return base58Encode(tx.signature); },
  };
  const ctx = { config, domain, connection, game: gameAddress, stateFile: path.join(config.workspace, 'keeper-state.json'), minContextSlot: 0 };
  return { dir, ctx, raw, state, counters, cleanup: () => fs.rm(dir, { recursive: true, force: true }) };
}

test('keeper public configuration rejects unsafe RPCs, fixture signing keys and short celebrations', async () => {
  const f = await fixture(); try {
    for (const rpcUrl of ['http://api.devnet.solana.com', 'https://127.0.0.1:18899', 'https://x:secret@rpc.example.test']) assert.throws(() => validateKeeperConfig({ ...f.raw, cluster: 'devnet', genesisHash: CLUSTER_GENESIS.devnet, rpcUrl }));
    assert.throws(() => validateKeeperConfig({ ...f.raw, celebrationSeconds: 7 }, { allowLocal: true }));
    assert.throws(() => validateKeeperConfig({ ...f.raw, cluster: 'devnet', genesisHash: CLUSTER_GENESIS.devnet, rpcUrl: 'https://rpc.example.test', keeperKeypair: '/repo/.openai/local/solana/wallets/payer.json' }), /fixture/);
  } finally { await f.cleanup(); }
});
test('keeper uses the exact on-chain deadline and at least eight chain seconds for celebration', () => {
  const stored = { activation: {}, observedEnded: null }, current = { game: { round_id: 1n }, round: { ended: false, end_time: 100n }, chainTime: 99 };
  assert.equal(keeperDecision(current, stored).reason, 'countdown'); current.chainTime = 100; assert.equal(keeperDecision(current, stored).action, 'settle');
  current.round.ended = true; assert.equal(keeperDecision(current, stored).action, 'observe-ended'); stored.observedEnded = { roundId: '1', chainTime: 100 };
  current.chainTime = 107; assert.equal(keeperDecision(current, stored).reason, 'celebration'); current.chainTime = 108; assert.equal(keeperDecision(current, stored).roundId, 2n);
});
test('keeper persists activation, exact pending identity and costs before one broadcast', async () => {
  const f = await fixture(); try {
    const result = await keeperTick(f.ctx); assert.equal(result.status, 'submitted'); assert.equal(f.counters.compute, 41_000);
    const saved = JSON.parse(await fs.readFile(f.ctx.stateFile, 'utf8')); assert.equal(saved.pending.signature, result.signature); assert.equal(saved.transactions[0].rentLamports, 5_000_000); assert(saved.activation.snapshotHash); assert.equal((await fs.stat(f.ctx.stateFile)).mode & 0o077, 0);
    assert.equal((await keeperTick(f.ctx)).status, 'pending-reconciliation'); assert.equal(f.counters.send, 1);
  } finally { await f.cleanup(); }
});
test('ambiguous acceptance survives restart and cannot create a replacement broadcast', async () => {
  const f = await fixture({ transportError: true }); try {
    const first = await keeperTick(f.ctx); assert.equal(first.status, 'pending-reconciliation');
    const restarted = { ...f.ctx, minContextSlot: 0 }; assert.equal((await keeperTick(restarted)).signature, first.signature); assert.equal(f.counters.send, 1);
    f.state.status = { confirmationStatus: 'finalized', slot: 120, err: null }; f.state.slot = 120; f.state.roundId = 1n;
    assert.equal((await keeperTick(restarted)).status, 'waiting'); const saved = JSON.parse(await fs.readFile(f.ctx.stateFile, 'utf8')); assert.equal(saved.pending, null); assert.equal(saved.transactions[0].status, 'confirmed'); assert.equal(saved.minContextSlot, 120); assert.equal(f.counters.send, 1);
  } finally { await f.cleanup(); }
});
test('expired absent transactions release reservations before a new signed attempt', async () => {
  const f = await fixture({ transportError: true }); try {
    const first = await keeperTick(f.ctx); f.state.height = 1_001; const second = await keeperTick(f.ctx); assert.notEqual(second.signature, first.signature); assert.equal(f.counters.send, 2);
    const stored = JSON.parse(await fs.readFile(f.ctx.stateFile, 'utf8')); assert.equal(stored.transactions[0].status, 'expired'); assert.deepEqual(keeperSpending(stored, f.state.now), { fees: 5_000, rent: 5_000_000 });
  } finally { await f.cleanup(); }
});
test('fee and rolling rent budgets reject spending before any broadcast', async () => {
  for (const changed of [{ maxFeeLamportsPerTransaction: 4_999 }, { maxDailyFeeLamports: 4_999 }, { maxDailyRentLamports: 4_999_999 }]) {
    const f = await fixture(); try { Object.assign(f.ctx.config, changed); await assert.rejects(keeperTick(f.ctx), /budget/); assert.equal(f.counters.send, 0); } finally { await f.cleanup(); }
  }
});
test('mainnet needs both explicit flags and a pre-game active publisher snapshot', async () => {
  const f = await fixture({ mainnet: true }); try {
    await assert.rejects(keeperTick(f.ctx, { allowMainnet: true }), /mainnetEnabled/); f.ctx.config.mainnetEnabled = true;
    await assert.rejects(keeperTick(f.ctx), /allow-mainnet/); assert.equal(f.counters.send, 0);
    const pub = JSON.parse(await fs.readFile(f.ctx.config.publisherStateFile, 'utf8')); delete pub.preGameAbsenceSlot; await durableJson(f.ctx.config.publisherStateFile, pub);
    delete f.ctx.verifiedOpening;
    await assert.rejects(keeperTick(f.ctx, { allowMainnet: true }), /prepared before/);
  } finally { await f.cleanup(); }
});
test('wrong genesis and an existing unverified round cannot activate a keeper', async () => {
  const f = await fixture(); try {
    f.state.genesis = 'wrong'; await assert.rejects(keeperStatus(f.ctx), /networks/); f.state.genesis = f.raw.genesisHash; f.state.roundId = 1n;
    await assert.rejects(keeperTick(f.ctx), /cannot adopt/); assert.equal(f.counters.send, 0);
  } finally { await f.cleanup(); }
});
test('public keeper rechecks exact bytecode and upgrade authority before signing a debit', async () => {
  const f = await fixture({ mainnet: true }); try {
    await verifyKeeperProgram(f.ctx);
    f.ctx.config.programBinarySha256 = '00'.repeat(32); await assert.rejects(verifyKeeperProgram(f.ctx), /executable changed/);
    f.ctx.config.programBinarySha256 = f.raw.programBinarySha256; f.ctx.config.expectedAuthorities.upgradeAuthority = Keypair.generate().publicKey.toBase58(); await assert.rejects(verifyKeeperProgram(f.ctx), /upgrade authority/);
    assert.equal(f.counters.send, 0);
  } finally { await f.cleanup(); }
});
