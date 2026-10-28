import { MODES, KEY_EXTENSION_MS, MAX_REMAINING_MS, quotePurchase } from './holder-engine.mjs';
import { previewKeyShare } from './key-reward-view.mjs';
import { costForExactKeys } from './solana-curve.mjs';

const fail = (code, error) => ({ ok: false, code, error });
const whole = value => Number.isSafeInteger(value) && value >= 0;

function lamports(value, label) {
  if (typeof value === 'bigint' && value >= 0n) return value;
  if (whole(value)) return BigInt(value);
  throw new TypeError(`${label} must be nonnegative integer lamports.`);
}

/** Convert only at a display boundary; never silently round financial amounts. */
export function previewDisplayNumber(value) {
  const amount = lamports(value, 'Display amount');
  if (amount > BigInt(Number.MAX_SAFE_INTEGER)) throw new RangeError('Preview amount exceeds the exact display range.');
  return Number(amount);
}

/**
 * Read-only consequences of the current curve quote. The rebate is an estimate
 * of this purchase's key allocation, not profit or a guaranteed payout: the
 * on-chain reward checkpoint can carry fractional lamports between purchases.
 * Callers should pass their synchronized clock as `now`; the snapshot's clock
 * is the deterministic fallback. Unknown account/fee costs stay null.
 */
export function createPurchasePreview({ state, count, mode = 'whale', quote, costs, now = state?.lastActionAt } = {}) {
  try {
    const round = state?.round;
    if (!round || !state?.players?.you || !whole(now) || !whole(round.endsAt)) {
      return fail('INVALID_STATE', 'A confirmed round, wallet position and clock are required.');
    }
    if (!Object.hasOwn(MODES, mode)) return fail('INVALID_MODE', 'Choose a supported payout mode.');
    if (round.status !== 'active' || round.endsAt <= now) return fail('ROUND_ENDED', 'This round has ended.');
    const share = previewKeyShare(state, count, 'you');
    if (!share.valid) return fail('INVALID_COUNT', 'Choose a valid whole-key quantity.');
    const selected = quote === undefined ? quotePurchase(state, count, 'you', mode) : quote;
    if (!selected || selected.ok !== true) return fail(selected?.code || 'QUOTE_UNAVAILABLE', selected?.error || 'A valid current purchase quote is required.');
    if (selected.count !== count || selected.mode !== mode) return fail('QUOTE_MISMATCH', 'The quote does not match the selected keys and mode.');
    const entryCostLamports = lamports(selected.cost, 'Entry cost');
    const keyRewardPoolLamports = lamports(selected.breakdown?.keyHolders, 'Key allocation');
    const potAdded = lamports(selected.breakdown?.pot, 'Pot allocation');
    if (entryCostLamports === 0n || keyRewardPoolLamports + potAdded > entryCostLamports) {
      return fail('INVALID_QUOTE', 'The quote contains inconsistent allocations.');
    }
    const existingPot = lamports(round.pot, 'Round pot');
    const openingFunding = lamports(round.openingRollover, 'Opening funding');
    const cumulativeFunding = openingFunding + lamports(round.grossEntries, 'Round entries');
    const priceAt = funding => {
      const price = costForExactKeys(funding, 1n);
      if (!price.ok) throw new RangeError(price.error || 'The next key exceeds the pricing curve range.');
      return price.lamports;
    };
    const nextKeyPriceBeforeLamports = priceAt(cumulativeFunding);
    const nextKeyPriceAfterLamports = priceAt(cumulativeFunding + entryCostLamports);
    const roundOpeningKeyPriceLamports = priceAt(openingFunding);
    const projectedPotLamports = existingPot + potAdded;
    const ownedKeysAfter = share.afterKeys;
    const totalKeysAfter = round.totalKeys + count;
    const ownRebateEstimateLamports = keyRewardPoolLamports * BigInt(ownedKeysAfter) / BigInt(totalKeysAfter);
    const closing = MODES[mode].closingBps;
    let otherClosingAllocations = 0n;
    for (const key of ['community', 'keyHolders', 'tokenHolders', 'rollover']) {
      otherClosingAllocations += projectedPotLamports * BigInt(closing[key]) / 10_000n;
    }
    const projectedWinnerPrizeLamports = projectedPotLamports - otherClosingAllocations;

    const extension = state.config?.extensionPerKeyMs ?? KEY_EXTENSION_MS;
    const maximum = state.config?.maxRemainingMs ?? MAX_REMAINING_MS;
    if (!whole(extension) || extension === 0 || !whole(maximum) || maximum === 0 || !whole(count * extension)) {
      return fail('INVALID_TIME', 'The round timing configuration is invalid.');
    }
    const currentRemainingMs = Math.min(maximum, round.endsAt - now);
    const timeAddedMs = Math.min(count * extension, maximum - currentRemainingMs);
    const resultingRemainingMs = currentRemainingMs + timeAddedMs;
    const entryCosts = costs?.entry;
    const optionalCost = (key, label) => entryCosts?.[key] == null ? null : lamports(entryCosts[key], label);
    const networkFeeLamports = optionalCost('networkFees', 'Network fee');
    const accountRentLamports = optionalCost('accountRent', 'Account setup');
    const refundableRentLamports = optionalCost('refundableRent', 'Temporary rent');
    const costsKnown = [networkFeeLamports, accountRentLamports, refundableRentLamports].every(value => value !== null);
    const nonRefundableDebitLamports = networkFeeLamports !== null && accountRentLamports !== null
      ? entryCostLamports + networkFeeLamports + accountRentLamports : null;
    const walletBalanceRequiredLamports = costsKnown ? nonRefundableDebitLamports + refundableRentLamports : null;

    return {
      ok: true, estimated: true, keysReceived: count, count, mode,
      ownedKeysAfter, totalKeysAfter, keyShareBefore: share.currentShare, keyShareAfter: share.afterShare,
      currentRemainingMs, timeAddedMs, resultingRemainingMs,
      entryCostLamports, keyRewardPoolLamports, ownRebateEstimateLamports,
      nextKeyPriceBeforeLamports, nextKeyPriceAfterLamports, roundOpeningKeyPriceLamports,
      projectedPotLamports, projectedWinnerPrizeLamports,
      costsKnown, networkFeeLamports, accountRentLamports, refundableRentLamports,
      nonRefundableDebitLamports, walletBalanceRequiredLamports,
    };
  } catch (error) {
    return fail('INVALID_PREVIEW', error.message);
  }
}
