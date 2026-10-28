import test from 'node:test';
import assert from 'node:assert/strict';
import { Keypair, PublicKey, Transaction, ComputeBudgetProgram } from '@solana/web3.js';
import { getAssociatedTokenAddressSync, NATIVE_MINT } from '@solana/spl-token';
import { validatePublishedEpochIndex, requireMainnetAuthorities, validateMainnetGameConfiguration, requireActivatedGame, validatePreparedOpeningJournal } from '../scripts/publicnet-validation.mjs';
import { gameInitializationInstructions } from '../scripts/publicnet-game-init.mjs';
const row = epoch => ({ epoch: String(epoch), root: 'ab'.repeat(32), snapshotSlot: '1234', totalAmount: '99' });

test('unpublished holder state next_epoch=1 accepts an empty public index', () => {
  assert.deepEqual(validatePublishedEpochIndex([], 1n), []);
});
test('published epoch 1 with next_epoch=2 is a complete valid index', () => {
  assert.deepEqual(validatePublishedEpochIndex([row(1)], 2n), [row(1)]);
  assert.equal(validatePublishedEpochIndex([row(2), row(1)], 3n).length, 2);
});
test('index coverage rejects epoch zero, duplicates, missing epochs and future IDs', () => {
  for (const [entries, next] of [[[], 0n], [[], 2n], [[row(0)], 2n], [[row(2)], 2n], [[row(1), row(1)], 3n], [[row(1), row(3)], 3n], [[row(1)], 3n], [[row(1), row(3)], 4n]]) assert.throws(() => validatePublishedEpochIndex(entries, next));
});
test('published roots and funding metadata cannot be absent, zero funded or overflow u64', () => {
  for (const entry of [{ ...row(1), root: 'wrong' }, { ...row(1), totalAmount: '0' }, { ...row(1), snapshotSlot: '-1' }, { ...row(1), totalAmount: (1n << 64n).toString() }]) assert.throws(() => validatePublishedEpochIndex([entry], 2n));
});

const authorityConfig = () => ({ expectedAuthorities: Object.fromEntries(['gameCreator', 'communityTreasury', 'holderPublisher', 'upgradeAuthority'].map(role => [role, Keypair.generate().publicKey.toBase58()])) });
test('mainnet configuration requires every distinct reviewed authority role', () => {
  const config = authorityConfig(); assert.deepEqual(requireMainnetAuthorities(config), config.expectedAuthorities);
  assert.throws(() => requireMainnetAuthorities({}), /expectedAuthorities/);
  for (const role of Object.keys(config.expectedAuthorities)) { const bad = structuredClone(config); delete bad.expectedAuthorities[role]; assert.throws(() => requireMainnetAuthorities(bad), /required/); }
  assert.throws(() => requireMainnetAuthorities({ expectedAuthorities: { ...config.expectedAuthorities, upgradeAuthority: config.expectedAuthorities.gameCreator } }), /separate/);
});
test('mainnet accepts original timing and exact game creator, treasury ATA and publisher', () => {
  const expected = requireMainnetAuthorities(authorityConfig());
  const game = { round_init_time: 3600n, round_inc_time_per_key: 30n, round_max_time: 86400n, game_creator: expected.gameCreator, community_wallet: getAssociatedTokenAddressSync(NATIVE_MINT, new PublicKey(expected.communityTreasury)).toBase58() };
  const holder = { publisher: expected.holderPublisher };
  assert.equal(validateMainnetGameConfiguration(game, holder, expected).secondsPerShare, 30);
  for (const [field, value] of [['round_init_time', 120n], ['round_inc_time_per_key', 1n], ['round_max_time', 180n]]) assert.throws(() => validateMainnetGameConfiguration({ ...game, [field]: value }, holder, expected), /must be the original/);
  assert.throws(() => validateMainnetGameConfiguration({ ...game, game_creator: expected.upgradeAuthority }, holder, expected), /creator differs/);
  assert.throws(() => validateMainnetGameConfiguration(game, { publisher: expected.gameCreator }, expected), /publisher differs/);
  assert.throws(() => validateMainnetGameConfiguration({ ...game, community_wallet: expected.communityTreasury }, holder, expected), /WSOL ATA/);
});
test('operator initialization packets establish original timing and holder vault while leaving round 1 for the post-snapshot keeper', () => {
  const expected = requireMainnetAuthorities(authorityConfig());
  const plan = gameInitializationInstructions({ programId: Keypair.generate().publicKey, gameVersion: '123456', piggyMint: Keypair.generate().publicKey, ...expected });
  assert.equal(plan.steps.length, 2);
  assert.deepEqual(plan.steps[1].instructions.map(ix => ix.data[0]), [0, 7]);
  const game = plan.steps[1].instructions[0].data;
  assert.equal(game.readBigUInt64LE(1), 123456n);
  assert.equal(game.readBigInt64LE(9), 3600n);
  assert.equal(game.readBigInt64LE(17), 30n);
  assert.equal(game.readBigInt64LE(25), 86400n);
  assert.equal(new PublicKey(plan.steps[1].instructions[1].data.subarray(1, 33)).toBase58(), expected.holderPublisher);
  assert.equal(plan.steps[0].instructions[0].keys[2].pubkey.toBase58(), expected.communityTreasury);
  assert(plan.steps[0].instructions[0].keys[3].pubkey.equals(NATIVE_MINT));
  for (const step of plan.steps) {
    const tx = new Transaction({ feePayer: new PublicKey(expected.gameCreator), recentBlockhash: PublicKey.default.toBase58() }).add(ComputeBudgetProgram.setComputeUnitLimit({ units: 1_300_000 }), ...step.instructions);
    assert(tx.serialize({ requireAllSignatures: false, verifySignatures: false }).length <= 1232);
  }
});
test('public readiness remains blocked at round zero until first-round activation', () => {
  assert.throws(() => requireActivatedGame({ round_id: 0n }), /First round is not active/);
  assert.equal(requireActivatedGame({ round_id: 1n }), 1n);
  assert.equal(requireActivatedGame({ round_id: 2n }), 2n);
});
test('game initialization requires matching pre-creation S0 and absence proof at a bank at least as new as S0', () => {
  const domain = { schemaVersion: 1, cluster: 'devnet', genesisHash: 'test-genesis', programId: Keypair.generate().publicKey.toBase58(), gameVersion: '123', piggyMint: Keypair.generate().publicKey.toBase58() };
  const journal = { ...domain, activation: 'prepared-before-game', preGameAbsenceSlot: 101, openingSnapshot: { policy: 'opening-snapshot-on-curve-owners-v1', mint: domain.piggyMint, slot: 100 }, plans: [], pendingWindow: null };
  assert.deepEqual(validatePreparedOpeningJournal(journal, domain), { snapshotSlot: 100, preGameAbsenceSlot: 101, activation: 'prepared-before-game' });
  for (const bad of [{ ...journal, activation: 'active' }, { ...journal, preGameAbsenceSlot: 99 }, { ...journal, pendingWindow: {} }, { ...journal, plans: [{}] }, { ...journal, gameVersion: '124' }]) assert.throws(() => validatePreparedOpeningJournal(bad, domain));
});
