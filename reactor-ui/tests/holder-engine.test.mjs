import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createGame, quotePurchase, buyKeys, settleRound, claimPayout,
  claimTokenRewards, startNextRound, timeRemaining, previewJackpot,
  MODES, MAX_REMAINING_MS, MAX_KEYS_PER_PURCHASE, CREDIT_SCALE,
} from '../src/holder-engine.mjs';
import { quoteKeysFromLamports, costForExactKeys } from '../src/solana-curve.mjs';

const NOW = 1_800_000_000_000;
const ids = ['you', 'npc_fox', 'npc_orbit', 'npc_void', 'npc_koi'];
const names = ['whale', 'bear', 'snek', 'bull'];
const entryPercentages = {
  whale: [50, 30, 16, 2, 1, 1], bear: [43, 43, 10, 2, 1, 1],
  snek: [20, 56, 20, 2, 1, 1], bull: [35, 43, 18, 2, 1, 1],
};
const finalPercentages = {
  whale: [48, 2, 15, 10, 25], bear: [48, 2, 25, 0, 25],
  snek: [48, 2, 20, 20, 10], bull: [48, 2, 30, 10, 10],
};

function conserved(state) {
  let sol = state.round.pot + state.communityReserve + state.rolloverReserve + state.airdropReserve;
  let tokens = 0;
  for (const p of Object.values(state.players)) {
    for (const field of ['balance', 'claimable', 'tokenClaimable', 'tokenBalance']) {
      assert.ok(Number.isSafeInteger(p[field]) && p[field] >= 0, `${p.id}.${field}`);
    }
    sol += p.balance + p.claimable + p.tokenClaimable;
    tokens += p.tokenBalance;
  }
  assert.equal(sol, state.totalSupply);
  assert.equal(tokens, state.totalTokenSupply);
  assert.equal(Object.values(state.round.entryAllocations).reduce((sum, value) => sum + value, 0), state.round.grossEntries);
}

function nextRound() {
  const state = createGame(NOW);
  const end = state.round.endsAt;
  assert.equal(settleRound(state, end).ok, true);
  assert.equal(startNextRound(state, end).ok, true);
  return state;
}

test('funded seed is deterministic; holders earn directly without staking fields', () => {
  const state = createGame(NOW);
  assert.deepEqual(state, createGame(NOW));
  assert.equal(state.version, 4);
  assert.equal(state.round.grossEntries, 11_026_677);
  assert.equal(state.round.totalKeys, 147);
  assert.equal(state.round.lastBuyerId, 'npc_fox');
  assert.equal(state.round.lastBuyerTeam, 'whale');
  assert.equal(timeRemaining(state, NOW), 87_000);
  assert.equal(state.players.you.balance, 500 * CREDIT_SCALE);
  assert.equal(state.players.you.claimable, 0);
  assert.ok(state.players.you.tokenClaimable > 0);
  assert.equal(ids.slice(1).reduce((sum, id) => sum + 2_000 * CREDIT_SCALE - state.players[id].balance, 0), 11_026_677);
  for (const id of ids) {
    assert.equal(state.players[id].tokenBalance, 1_000);
    assert.equal('stakedTokens' in state.players[id], false);
  }
  conserved(state);
});

test('all four entry profiles preserve source percentages plus affiliate redirect', () => {
  for (const name of names) {
    const state = nextRound();
    const quote = quotePurchase(state, 1, 'you', name);
    // Opening rollover puts the source curve between two key boundaries.
    assert.equal(quote.cost, 41_067);
    const expected = Object.fromEntries(['pot', 'keyHolders', 'tokenHolders', 'community', 'rollover', 'airdrop'].map((key, i) => [key, Math.floor(quote.cost * entryPercentages[name][i] / 100)]));
    expected.tokenHolders = Math.floor(quote.cost * MODES[name].originalHolderBps / 10_000) + Math.floor(quote.cost / 10);
    expected.pot = quote.cost - Object.entries(expected).filter(([key]) => key !== 'pot').reduce((sum, [,value]) => sum + value, 0);
    assert.deepEqual(quote.breakdown, expected);
    assert.equal(MODES[name].entryBps.tokenHolders, MODES[name].originalHolderBps + 1_000);
    assert.equal(Object.values(MODES[name].entryBps).reduce((sum, value) => sum + value, 0), 10_000);
    const potBefore = state.round.pot;
    const holderBefore = ids.reduce((sum, id) => sum + state.players[id].tokenClaimable, 0);
    buyKeys(state, 'you', 1, state.lastActionAt, name);
    assert.equal(state.round.pot - potBefore, expected.pot);
    assert.equal(ids.reduce((sum, id) => sum + state.players[id].tokenClaimable, 0) - holderBefore, expected.tokenHolders);
    assert.equal(state.round.lastBuyerTeam, name);
    conserved(state);
  }
});

test('new keys earn their own entry allocation and never earlier entries', () => {
  const state = nextRound();
  const now = state.lastActionAt;
  const old = state.players.you.claimable;
  const quote = quotePurchase(state, 1, 'you', 'whale');
  assert.equal(quote.keyShareAfter, 1);
  assert.equal(quote.estimatedKeyReward, 12_320);
  buyKeys(state, 'you', 1, now, 'whale');
  assert.equal(state.players.you.claimable - old, 12_320);
  const prior = state.players.you.claimable;
  const entrant = state.players.npc_koi.claimable;
  const next = quotePurchase(state, 3, 'npc_koi', 'snek');
  buyKeys(state, 'npc_koi', 3, now + 1, 'snek');
  assert.equal(state.players.npc_koi.claimable - entrant, next.estimatedKeyReward);
  assert.ok(state.players.you.claimable >= prior);
  assert.equal(state.players.you.claimable - prior + next.estimatedKeyReward, next.breakdown.keyHolders);
  conserved(state);
});

test('claimed key rewards are not reduced or paid again after later entries', () => {
  const state = createGame(NOW);
  const initial = state.players.npc_koi.claimable;
  assert.ok(initial > 0);
  assert.equal(claimPayout(state, 'npc_koi').amount, initial);
  assert.equal(claimPayout(state, 'npc_koi').code, 'NOTHING_TO_CLAIM');
  const quote = quotePurchase(state, 1, 'you', 'bear');
  const keys = state.players.npc_koi.keys;
  buyKeys(state, 'you', 1, NOW, 'bear');
  const nextReward = state.players.npc_koi.claimable;
  assert.ok(Math.abs(nextReward - quote.breakdown.keyHolders * keys / state.round.totalKeys) < 1);
  assert.equal(claimPayout(state, 'npc_koi').amount, nextReward);
  assert.equal(state.players.npc_koi.totalClaimed, initial + nextReward);
  conserved(state);
});

test('holder claims are separate SOL rewards and do not alter token principal', () => {
  const state = createGame(NOW);
  const p = state.players.npc_fox;
  const game = p.claimable;
  const holder = p.tokenClaimable;
  const balance = p.balance;
  assert.ok(game > 0 && holder > 0);
  assert.equal(claimPayout(state, p.id).amount, game);
  assert.equal(p.tokenClaimable, holder);
  assert.equal(claimTokenRewards(state, p.id).amount, holder);
  assert.equal(p.balance, balance + game + holder);
  assert.equal(p.tokenBalance, 1_000);
  assert.equal(p.tokenRewardsClaimed, holder);
  assert.equal(p.totalClaimed, game);
  assert.equal(claimTokenRewards(state, p.id).code, 'NOTHING_TO_CLAIM');
  conserved(state);
});

test('per-event holder snapshots preserve earlier earnings when balances change', () => {
  const state = createGame(NOW);
  const old = state.players.you.tokenClaimable;
  // Fixture-only balance transfer, not a UI/API feature: test prospective
  // snapshot accounting while keeping the fixed token supply conserved.
  state.players.npc_fox.tokenBalance += state.players.you.tokenBalance;
  state.players.you.tokenBalance = 0;
  buyKeys(state, 'npc_koi', 1, NOW, 'whale');
  assert.equal(state.players.you.tokenClaimable, old);
  const previous = state.players.you.tokenClaimable;
  state.players.npc_fox.tokenBalance -= 1_000;
  state.players.you.tokenBalance = 1_000;
  assert.equal(state.players.you.tokenClaimable, previous);
  const quote = quotePurchase(state, 1, 'you', 'bull');
  buyKeys(state, 'you', 1, NOW + 1, 'bull');
  assert.equal(state.players.you.tokenClaimable - previous, quote.estimatedTokenReward);
  conserved(state);
});

test('closing uses the last buyer mode and distributes the correct remaining-pot fractions', () => {
  for (const name of names) {
    const state = createGame(NOW);
    buyKeys(state, 'you', 1, NOW, name);
    // Previewing a different mode must not change the last buyer's policy.
    quotePurchase(state, 1, 'npc_koi', names[(names.indexOf(name) + 1) % 4]);
    const pot = state.round.pot;
    const expectedWinner = previewJackpot(state);
    const gameBefore = ids.reduce((sum, id) => sum + state.players[id].claimable, 0);
    const holdersBefore = ids.reduce((sum, id) => sum + state.players[id].tokenClaimable, 0);
    const result = settleRound(state, state.round.endsAt);
    const [, community, key, holder, rollover] = finalPercentages[name];
    assert.equal(result.mode, name);
    assert.equal(result.winnerId, 'you');
    assert.equal(result.winnerPrize, pot - [community, key, holder, rollover].reduce((sum, percent) => sum + Math.floor(pot * percent / 100), 0));
    assert.equal(result.winnerPrize, expectedWinner);
    assert.equal(result.closingAllocations.community, Math.floor(pot * community / 100));
    assert.equal(result.closingAllocations.keyHolders, Math.floor(pot * key / 100));
    assert.equal(result.closingAllocations.tokenHolders, Math.floor(pot * holder / 100));
    assert.equal(Object.values(result.closingAllocations).reduce((sum, value) => sum + value, 0), pot);
    assert.equal(ids.reduce((sum, id) => sum + state.players[id].claimable, 0) - gameBefore, result.winnerPrize + result.holderPool);
    assert.equal(ids.reduce((sum, id) => sum + state.players[id].tokenClaimable, 0) - holdersBefore, result.closingAllocations.tokenHolders);
    assert.equal(state.round.pot, 0);
    assert.equal(state.round.finalPot, pot);
    assert.equal(previewJackpot(state), expectedWinner);
    const settled = JSON.stringify(state);
    assert.equal(settleRound(state, state.lastActionAt).code, 'ROUND_SETTLED');
    assert.equal(JSON.stringify(state), settled);
    conserved(state);
  }
});

test('round rollover is funded, preserves claims and carries empty rounds forward', () => {
  const state = createGame(NOW);
  settleRound(state, state.round.endsAt);
  const rollover = state.rolloverReserve;
  const before = Object.fromEntries(ids.map((id) => [id, { ...state.players[id] }]));
  const history = JSON.stringify(state.history);
  assert.ok(rollover > 0);
  assert.equal(startNextRound(state, state.lastActionAt).openingRollover, rollover);
  assert.equal(state.round.pot, rollover);
  assert.equal(state.rolloverReserve, 0);
  assert.equal(state.round.grossEntries, 0);
  assert.equal(state.round.lastBuyerTeam, null);
  for (const id of ids) {
    assert.equal(state.players[id].keys, 0);
    for (const field of ['claimable', 'tokenClaimable', 'tokenBalance', 'totalKeys']) assert.equal(state.players[id][field], before[id][field]);
  }
  assert.equal(JSON.stringify(state.history), history);
  const empty = settleRound(state, state.round.endsAt);
  assert.equal(empty.winnerId, null);
  assert.equal(empty.winnerPrize, 0);
  assert.equal(state.rolloverReserve, rollover);
  assert.equal(state.round.pot, 0);
  conserved(state);
});

test('entry rounding leaves residue in the pot and preserves every lamport', () => {
  const state = nextRound();
  const now = state.lastActionAt;
  for (let i = 0; i < 24; i++) {
    const id = ids[i % ids.length];
    const name = names[i % names.length];
    const quote = quotePurchase(state, 1, id, name);
    assert.equal(Object.values(quote.breakdown).reduce((sum, value) => sum + value, 0), quote.cost);
    for (const bucket of ['keyHolders', 'community', 'airdrop', 'rollover']) {
      assert.equal(quote.breakdown[bucket], Math.floor(quote.cost * MODES[name].entryBps[bucket] / 10_000));
    }
    assert.equal(quote.breakdown.tokenHolders,
      Math.floor(quote.cost * MODES[name].originalHolderBps / 10_000) + Math.floor(quote.cost * 1_000 / 10_000));
    assert.equal(buyKeys(state, id, 1, now + i, name).ok, true);
    conserved(state);
  }
});

test('affiliate redirection preserves independent source-bucket rounding', () => {
  const state = nextRound();
  buyKeys(state, 'you', 1, state.lastActionAt, 'whale');
  const quote = quotePurchase(state, 1, 'you', 'snek');
  assert.equal(quote.cost, 75_002);
  // Source rounds the two 10% buckets independently before combining them.
  assert.equal(quote.breakdown.tokenHolders, 15_000);
  assert.equal(Object.values(quote.breakdown).reduce((sum, value) => sum + value, 0), 75_002);
  conserved(state);
});

test('invalid inputs, expired entries and early settlement are atomic', () => {
  const actions = [
    (s) => buyKeys(s, 'you', 0, NOW), (s) => buyKeys(s, 'you', NaN, NOW),
    (s) => buyKeys(s, 'you', 1.5, NOW), (s) => buyKeys(s, 'you', MAX_KEYS_PER_PURCHASE + 1, NOW),
    (s) => buyKeys(s, '__proto__', 1, NOW), (s) => buyKeys(s, 'you', 1, NOW, '__proto__'),
    (s) => buyKeys(s, 'you', 1, NOW, 'dragon'), (s) => buyKeys(s, 'you', 1, NOW - 1),
    (s) => buyKeys(s, 'you', 1, s.round.endsAt), (s) => settleRound(s, NOW),
    (s) => startNextRound(s, NOW), (s) => claimTokenRewards(s, 'missing'),
  ];
  for (const action of actions) {
    const state = createGame(NOW);
    const before = JSON.stringify(state);
    assert.equal(action(state).ok, false);
    assert.equal(JSON.stringify(state), before);
  }
});

test('quotes mint the selected exact keys using gross funding, not pot or issued-key pricing', () => {
  const state = createGame(NOW);
  for (const count of [1, 5, 10, 1_000, MAX_KEYS_PER_PURCHASE]) {
    const quote = quotePurchase(state, count);
    assert.equal(quote.ok, true);
    assert.equal(quoteKeysFromLamports(BigInt(state.round.grossEntries), BigInt(quote.cost)), BigInt(count));
    assert.ok(quoteKeysFromLamports(BigInt(state.round.grossEntries), BigInt(quote.cost - 1)) < BigInt(count));
  }
  const next = nextRound();
  const quote = quotePurchase(next, 10);
  assert.equal(quote.curveFunding, next.round.openingRollover);
  assert.equal(BigInt(quote.cost), costForExactKeys(BigInt(next.round.openingRollover), 10n).lamports);
  next.players.you.balance = 0;
  const before = JSON.stringify(next);
  assert.equal(buyKeys(next, 'you', 10, next.lastActionAt).code, 'INSUFFICIENT_BALANCE');
  assert.equal(JSON.stringify(next), before);
});

test('an unfunded first round uses the source single-lamport boundary without fake seed funds', () => {
  const state = createGame(NOW, { seeded: false });
  assert.equal(state.round.pot, 0);
  assert.equal(state.round.totalKeys, 0);
  assert.equal(state.activity.length, 0);
  assert.equal(quotePurchase(state, 1).cost, 75_001);
  assert.equal(buyKeys(state, 'you', 1, NOW).cost, 75_001);
  assert.equal(state.players.you.keys, 1);
  conserved(state);
});

test('new rounds use the original hour and each key adds thirty seconds', () => {
  const state = nextRound();
  const now = state.lastActionAt;
  assert.equal(timeRemaining(state, now), 3_600_000);
  const purchase = buyKeys(state, 'you', 10, now, 'whale');
  assert.equal(purchase.ok, true);
  assert.equal(purchase.actualExtensionMs, 300_000);
  assert.equal(timeRemaining(state, now), 3_900_000);
  conserved(state);
});

test('timer cap and serialization remain compatible with browser persistence', () => {
  const state = createGame(NOW);
  state.round.endsAt = NOW + MAX_REMAINING_MS - 1_000;
  assert.equal(buyKeys(state, 'you', 1, NOW, 'bull').actualExtensionMs, 1_000);
  assert.equal(timeRemaining(state, NOW), MAX_REMAINING_MS);
  const restored = JSON.parse(JSON.stringify(state));
  assert.deepEqual(restored, state);
  assert.equal(claimTokenRewards(restored, 'you').ok, true);
  conserved(restored);
});

test('mixed mode purchases, both claim types and repeated rollovers conserve all funds', () => {
  const state = createGame(NOW);
  let seed = 77;
  const random = () => { seed = (Math.imul(seed, 1_664_525) + 1_013_904_223) >>> 0; return seed; };
  let now = NOW;
  for (let i = 0; i < 180; i++) {
    const id = ids[random() % ids.length];
    now += 10;
    const before = JSON.stringify(state);
    const action = random() % 3;
    const result = action === 0 ? buyKeys(state, id, random() % 3 + 1, now, names[random() % names.length])
      : action === 1 ? claimPayout(state, id) : claimTokenRewards(state, id);
    if (!result.ok) assert.equal(JSON.stringify(state), before);
    conserved(state);
    if (i % 45 === 44) {
      now = state.round.endsAt;
      assert.equal(settleRound(state, now).ok, true);
      conserved(state);
      assert.equal(startNextRound(state, now).ok, true);
      conserved(state);
    }
  }
});
