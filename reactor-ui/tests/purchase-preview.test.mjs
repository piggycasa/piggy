import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, quotePurchase, buyKeys, previewJackpot, MODES } from '../src/holder-engine.mjs';
import { costForExactKeys } from '../src/solana-curve.mjs';
import { createPurchasePreview, previewDisplayNumber } from '../src/purchase-preview.mjs';

const NOW = 1_800_000_000_000;
function emptyRound() {
  const state = createGame(NOW);
  for (const player of Object.values(state.players)) { player.keys = 0; player.referral = null; player.roundContribution = 0; }
  Object.assign(state.round, { totalKeys: 0, pot: 0, openingRollover: 0, grossEntries: 0, lastBuyerId: null, lastBuyerTeam: null, endsAt: NOW + 3_600_000 });
  return state;
}

test('uses the original exact-key curve and does not mutate state or supplied quote', () => {
  const state = createGame(NOW), quote = quotePurchase(state, 10, 'you', 'whale');
  const before = JSON.stringify({ state, quote });
  const result = createPurchasePreview({ state, quote, count: 10, now: NOW });
  assert.equal(result.ok, true);
  assert.equal(result.entryCostLamports, costForExactKeys(BigInt(state.round.grossEntries + state.round.openingRollover), 10n).lamports);
  assert.equal(result.keysReceived, 10);
  assert.equal(JSON.stringify({ state, quote }), before);
});

test('shows current and next single-key prices from cumulative funding, including opening carry', () => {
  const state = createGame(NOW);
  state.round.openingRollover = 21_750;
  state.round.grossEntries = 76_634_611;
  const result = createPurchasePreview({ state, count: 1000, now: NOW });
  const funding = BigInt(state.round.openingRollover + state.round.grossEntries);
  assert.equal(result.nextKeyPriceBeforeLamports, costForExactKeys(funding, 1n).lamports);
  assert.equal(result.nextKeyPriceAfterLamports, costForExactKeys(funding + result.entryCostLamports, 1n).lamports);
  assert.equal(result.roundOpeningKeyPriceLamports, costForExactKeys(21_750n, 1n).lamports);
  assert.ok(result.nextKeyPriceAfterLamports >= result.nextKeyPriceBeforeLamports);
});

test('preserves a legitimate one-lamport dip from cumulative integer pricing', () => {
  const state = emptyRound();
  state.round.grossEntries = 75_078_047;
  const result = createPurchasePreview({ state, count: 1, now: NOW });
  assert.equal(result.ok, true);
  assert.equal(result.nextKeyPriceBeforeLamports, 75_157n);
  assert.equal(result.nextKeyPriceAfterLamports, 75_156n);
});

test('1,000 keys add only 30 seconds when 30 seconds remain below the cap', () => {
  const state = emptyRound();
  state.round.endsAt = NOW + 86_400_000 - 30_000;
  const result = createPurchasePreview({ state, count: 1000, now: NOW });
  assert.equal(result.ok, true);
  assert.equal(result.timeAddedMs, 30_000);
  assert.equal(result.resultingRemainingMs, 86_400_000);
  state.round.endsAt = NOW + 86_400_000;
  assert.equal(createPurchasePreview({ state, count: 1, now: NOW }).timeAddedMs, 0);
});

test('shows the resulting countdown as well as added time', () => {
  const state = emptyRound();
  const result = createPurchasePreview({ state, count: 1000, now: NOW + 10_000 });
  assert.equal(result.currentRemainingMs, 3_590_000);
  assert.equal(result.timeAddedMs, 30_000_000);
  assert.equal(result.resultingRemainingMs, 33_590_000);
});

test('uses owned and total keys after the purchase, including dilution', () => {
  const state = emptyRound();
  state.players.you.keys = 10;
  state.players.npc_fox.keys = 90;
  state.round.totalKeys = 100;
  const result = createPurchasePreview({ state, count: 1, now: NOW });
  assert.equal(result.keyShareBefore, 10 / 100);
  assert.equal(result.keyShareAfter, 11 / 101);
  assert.equal(result.ownedKeysAfter, 11);
  assert.equal(result.totalKeysAfter, 101);
  assert.equal(result.ownRebateEstimateLamports, result.keyRewardPoolLamports * 11n / 101n);
});

test('a sole key owner estimates the 30% Whale allocation as returned entry money', () => {
  const state = emptyRound();
  const result = createPurchasePreview({ state, count: 10, now: NOW });
  assert.equal(result.keyShareBefore, 0);
  assert.equal(result.keyShareAfter, 1);
  assert.equal(result.keyRewardPoolLamports, result.entryCostLamports * 30n / 100n);
  assert.equal(result.ownRebateEstimateLamports, result.keyRewardPoolLamports);
  assert.equal(result.estimated, true);
  assert.ok(result.ownRebateEstimateLamports < result.entryCostLamports);
});

test('projects the chosen closing mode and all rounding residue, matching the engine', () => {
  for (const mode of Object.keys(MODES)) {
    const state = createGame(NOW);
    const result = createPurchasePreview({ state, mode, count: 7, now: NOW });
    assert.equal(result.ok, true);
    assert.equal(buyKeys(state, 'you', 7, NOW, mode).ok, true);
    assert.equal(result.projectedPotLamports, BigInt(state.round.pot));
    assert.equal(result.projectedWinnerPrizeLamports, BigInt(previewJackpot(state)));
  }
});

test('keeps temporary rent separate from entry, network fee and permanent setup', () => {
  const state = emptyRound();
  const costs = { entry: { networkFees: 10_000n, accountRent: 2_512_560n, refundableRent: 2_039_280n } };
  const result = createPurchasePreview({ state, count: 1, costs });
  assert.equal(result.costsKnown, true);
  assert.equal(result.networkFeeLamports, 10_000n);
  assert.equal(result.nonRefundableDebitLamports, result.entryCostLamports + 10_000n + 2_512_560n);
  assert.equal(result.walletBalanceRequiredLamports, result.nonRefundableDebitLamports + 2_039_280n);
  assert.equal(result.refundableRentLamports, 2_039_280n);
  const unknown = createPurchasePreview({ state, count: 1 });
  assert.equal(unknown.costsKnown, false);
  assert.equal(unknown.networkFeeLamports, null);
  assert.equal(unknown.nonRefundableDebitLamports, null);
});

test('failed, missing, mismatched, settled and expired quotes cannot produce positive previews', () => {
  const state = emptyRound(), quote = quotePurchase(state, 1);
  assert.equal(createPurchasePreview({ state, count: 1, quote: { ok: false, code: 'LAUNCH_LIMIT', error: 'Limit.' } }).code, 'LAUNCH_LIMIT');
  assert.equal(createPurchasePreview({ state, count: 1, quote: null }).code, 'QUOTE_UNAVAILABLE');
  assert.equal(createPurchasePreview({ state, count: 2, quote }).code, 'QUOTE_MISMATCH');
  assert.equal(createPurchasePreview({ state, count: 1, mode: 'snek', quote }).code, 'QUOTE_MISMATCH');
  assert.equal(createPurchasePreview({ state, count: 0 }).ok, false);
  assert.equal(createPurchasePreview({ state, count: 1, now: state.round.endsAt }).code, 'ROUND_ENDED');
  state.round.status = 'settled';
  assert.equal(createPurchasePreview({ state, count: 1 }).code, 'ROUND_ENDED');
  assert.equal(createPurchasePreview().code, 'INVALID_STATE');
});

test('rejects unsafe numeric money and converts BigInt only inside the exact display range', () => {
  const state = emptyRound(), quote = quotePurchase(state, 1);
  quote.cost = Number.MAX_SAFE_INTEGER + 1;
  assert.equal(createPurchasePreview({ state, count: 1, quote }).ok, false);
  assert.equal(previewDisplayNumber(75_001n), 75_001);
  assert.throws(() => previewDisplayNumber(BigInt(Number.MAX_SAFE_INTEGER) + 1n), /display range/);
  assert.throws(() => previewDisplayNumber(Number.MAX_SAFE_INTEGER + 1), /integer lamports/);
  assert.equal(createPurchasePreview({ state, count: 1, costs: { entry: { networkFees: -1 } } }).ok, false);
});
