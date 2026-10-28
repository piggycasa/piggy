import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createGame, buyKeys, quotePurchase, settleRound, startNextRound,
  claimPayout, claimTokenRewards, MAX_KEYS_PER_PURCHASE,
} from '../src/holder-engine.mjs';
import {
  captureRewardPosition, getPurchaseRewardChange, previewKeyShare,
} from '../src/key-reward-view.mjs';

const NOW = 1_800_000_000_000;
const change = (before, state) => getPurchaseRewardChange(before, captureRewardPosition(state));

test('a player with zero keys receives no key income from other purchases, while token income stays separate', () => {
  const state = createGame(NOW);
  const before = captureRewardPosition(state);
  assert.equal(before.keys, 0);
  assert.equal(before.keyEarned, 0);
  assert.ok(before.tokenEarned > 0);
  assert.equal(buyKeys(state, 'npc_koi', 2, NOW, 'snek').ok, true);
  const result = change(before, state);
  assert.equal(result.keyDelta, 0);
  assert.equal(result.tokenDelta, state.players.you.tokenRewardsEarned - before.tokenEarned);
  assert.ok(result.tokenDelta > 0);
  assert.equal(result.shareBefore, 0);
  assert.equal(result.shareAfter, 0);
});

test('buying keys grows pool share; another buyer produces only the real key allocation', () => {
  const state = createGame(NOW);
  const beforeOwnBuy = captureRewardPosition(state);
  const purchase = buyKeys(state, 'you', 3, NOW, 'whale');
  assert.equal(purchase.ok, true);
  const own = change(beforeOwnBuy, state);
  assert.equal(own.keyDelta, purchase.estimatedKeyReward);
  assert.equal(own.tokenDelta, purchase.estimatedTokenReward);
  assert.equal(own.shareBefore, 0);
  assert.equal(own.shareAfter, 3 / 150);

  const beforeNpc = captureRewardPosition(state);
  const claimableBefore = state.players.you.claimable;
  const quote = quotePurchase(state, 2, 'npc_koi', 'snek');
  assert.equal(buyKeys(state, 'npc_koi', 2, NOW + 1, 'snek').ok, true);
  const npc = change(beforeNpc, state);
  assert.ok(npc.keyDelta > 0);
  assert.equal(npc.keyDelta, state.players.you.claimable - claimableBefore);
  assert.ok(Math.abs(npc.keyDelta - quote.breakdown.keyHolders * 3 / 152) < 1);
  assert.equal(npc.shareBefore, 3 / 150);
  assert.equal(npc.shareAfter, 3 / 152);
  assert.equal(beforeNpc.totalKeys, 150, 'capture must not retain mutable engine objects');
});

test('claiming either reward pool creates no earnings pulse and does not erase the next actual reward', () => {
  const state = createGame(NOW);
  assert.equal(buyKeys(state, 'you', 2, NOW, 'bull').ok, true);
  const beforeClaims = captureRewardPosition(state);
  assert.ok(claimPayout(state, 'you').amount > 0);
  assert.ok(claimTokenRewards(state, 'you').amount > 0);
  assert.equal(state.players.you.claimable, 0);
  assert.equal(state.players.you.tokenClaimable, 0);
  assert.deepEqual(change(beforeClaims, state), {
    keyDelta: 0, tokenDelta: 0,
    shareBefore: beforeClaims.share, shareAfter: beforeClaims.share,
  });
  const beforeNext = captureRewardPosition(state);
  assert.equal(buyKeys(state, 'npc_fox', 1, NOW + 1, 'whale').ok, true);
  const earned = change(beforeNext, state);
  assert.equal(earned.keyDelta, state.players.you.claimable);
  assert.equal(earned.tokenDelta, state.players.you.tokenClaimable);
  assert.ok(earned.keyDelta > 0 && earned.tokenDelta > 0);
});

test('settlement reports actual closing key/token allocations and excludes the winner jackpot', () => {
  for (const mode of ['whale', 'bear', 'snek', 'bull']) {
    const state = createGame(NOW);
    assert.equal(buyKeys(state, 'you', 1, NOW, mode).ok, true);
    const before = captureRewardPosition(state);
    const claimableBefore = state.players.you.claimable;
    const result = settleRound(state, state.round.endsAt);
    assert.equal(result.ok, true);
    assert.equal(result.winnerId, 'you');
    assert.ok(result.winnerPrize > 0);
    const earned = change(before, state);
    assert.equal(earned.keyDelta, result.holderPayouts.you || 0);
    assert.equal(earned.tokenDelta, result.tokenPayouts.you || 0);
    assert.equal(state.players.you.claimable - claimableBefore, earned.keyDelta + result.winnerPrize);
    const after = captureRewardPosition(state);
    assert.equal(settleRound(state, state.lastActionAt).ok, false);
    assert.equal(change(after, state).keyDelta, 0);
    assert.equal(change(after, state).tokenDelta, 0);
  }
});

test('successive new rounds and same-round demo resets cannot replay historical income', () => {
  const state = createGame(NOW);
  let now = NOW;
  for (let round = 0; round < 3; round++) {
    assert.equal(buyKeys(state, 'you', 2, now, 'whale').ok, true);
    assert.equal(buyKeys(state, 'npc_koi', 1, now + 1, 'snek').ok, true);
    const beforeClosing = captureRewardPosition(state);
    now = state.round.endsAt;
    assert.equal(settleRound(state, now).ok, true);
    const settled = captureRewardPosition(state);
    assert.equal(startNextRound(state, now).ok, true);
    const fresh = captureRewardPosition(state);
    assert.equal(fresh.keys, 0);
    assert.equal(fresh.share, 0);
    for (const before of [beforeClosing, settled, fresh]) {
      const result = getPurchaseRewardChange(before, fresh);
      assert.equal(result.keyDelta, 0);
      assert.equal(result.tokenDelta, 0);
    }
  }
  const original = createGame(NOW);
  const initial = captureRewardPosition(original);
  assert.equal(buyKeys(original, 'you', 3, NOW, 'snek').ok, true);
  const earned = captureRewardPosition(original);
  const reset = captureRewardPosition(createGame(NOW));
  assert.equal(earned.roundId, reset.roundId);
  assert.deepEqual(reset, initial);
  assert.equal(getPurchaseRewardChange(earned, reset).keyDelta, 0);
  assert.equal(getPurchaseRewardChange(earned, reset).tokenDelta, 0);
});

test('share preview explains quantity and dilution using the actual engine ownership model', () => {
  const state = createGame(NOW);
  assert.equal(buyKeys(state, 'you', 3, NOW, 'whale').ok, true);
  const before = JSON.stringify(state);
  const one = previewKeyShare(state, 1);
  const ten = previewKeyShare(state, 10);
  assert.equal(one.currentShare, 3 / 150);
  assert.equal(one.afterShare, 4 / 151);
  assert.deepEqual(ten, {
    currentShare: 3 / 150, afterShare: 13 / 160,
    gainedShare: 13 / 160 - 3 / 150, afterKeys: 13, valid: true,
  });
  assert.ok(ten.afterShare > one.afterShare);
  assert.equal(ten.afterShare, quotePurchase(state, 10).keyShareAfter);
  assert.equal(JSON.stringify(state), before);
  assert.equal(buyKeys(state, 'npc_fox', 10, NOW + 1, 'whale').ok, true);
  const diluted = previewKeyShare(state, 10);
  assert.equal(diluted.currentShare, 3 / 160);
  assert.equal(diluted.afterShare, 13 / 170);
  assert.ok(diluted.afterShare < ten.afterShare);
});

test('empty-round and maximum-count previews stay finite without implying affordability', () => {
  const state = createGame(NOW);
  const now = state.round.endsAt;
  assert.equal(settleRound(state, now).ok, true);
  assert.equal(startNextRound(state, now).ok, true);
  assert.deepEqual(previewKeyShare(state, 1), {
    currentShare: 0, afterShare: 1, gainedShare: 1, afterKeys: 1, valid: true,
  });
  assert.equal(previewKeyShare(state, MAX_KEYS_PER_PURCHASE).afterKeys, MAX_KEYS_PER_PURCHASE);
  assert.equal(previewKeyShare(state, MAX_KEYS_PER_PURCHASE).valid, true);
});

test('invalid counts and unavailable positions are atomic, finite and show no invented growth', () => {
  const state = createGame(NOW);
  assert.equal(buyKeys(state, 'you', 2, NOW, 'whale').ok, true);
  const current = captureRewardPosition(state);
  const before = JSON.stringify(state);
  for (const count of [0, -1, 1.5, NaN, Infinity, -Infinity, '2', undefined, null, {}, MAX_KEYS_PER_PURCHASE + 1, Number.MAX_SAFE_INTEGER]) {
    const result = previewKeyShare(state, count);
    assert.deepEqual(result, {
      currentShare: current.share, afterShare: current.share,
      gainedShare: 0, afterKeys: current.keys, valid: false,
    });
    assert.equal(JSON.stringify(state), before);
  }
  for (const result of [previewKeyShare(null, 1), previewKeyShare(state, 1, 'missing'), previewKeyShare(state, 1, '__proto__')]) {
    assert.equal(result.valid, false);
    assert.ok(Object.values(result).every(value => typeof value === 'boolean' || Number.isFinite(value)));
  }
  assert.equal(getPurchaseRewardChange(null, current).keyDelta, 0);
  assert.equal(getPurchaseRewardChange(null, current).tokenDelta, 0);
  assert.equal(settleRound(state, state.round.endsAt).ok, true);
  assert.equal(previewKeyShare(state, 1).valid, false);
});
