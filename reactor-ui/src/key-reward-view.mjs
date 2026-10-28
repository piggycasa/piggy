import { MAX_KEYS_PER_PURCHASE } from './holder-engine.mjs';

const wholeAmount = value => Number.isSafeInteger(value) && value >= 0;
const amount = value => wholeAmount(value) ? value : 0;
const ratio = value => Number.isFinite(value) && value >= 0 && value <= 1 ? value : 0;
const roundId = value => Number.isSafeInteger(value) && value > 0 ? value : null;

function playerIn(state, playerId) {
  const players = state?.players;
  return players && typeof players === 'object' && Object.hasOwn(players, playerId)
    ? players[playerId]
    : undefined;
}

/** A value snapshot, independent of subsequent engine mutations or claims. */
export function captureRewardPosition(state, playerId = 'you') {
  const player = playerIn(state, playerId);
  const keys = amount(player?.keys);
  const totalKeys = amount(state?.round?.totalKeys);
  return {
    roundId: player ? roundId(state?.round?.id) : null,
    keys,
    totalKeys,
    keyEarned: amount(player?.keyRewardsEarned),
    tokenEarned: amount(player?.tokenRewardsEarned),
    share: totalKeys > 0 ? ratio(keys / totalKeys) : 0,
  };
}

function validPosition(position) {
  return position && roundId(position.roundId) !== null
    && ['keys', 'totalKeys', 'keyEarned', 'tokenEarned'].every(field => wholeAmount(position[field]))
    && position.keys <= position.totalKeys;
}

/**
 * Only lifetime key/token earnings can create a reward increment. Claimable
 * balances include jackpot money and decrease on claims, so never use them.
 * New rounds and resets establish a fresh baseline rather than replaying income.
 */
export function getPurchaseRewardChange(before, after) {
  const shareBefore = ratio(before?.share);
  const shareAfter = ratio(after?.share);
  const reset = !validPosition(before) || !validPosition(after)
    || before.roundId !== after.roundId
    || ['keys', 'totalKeys', 'keyEarned', 'tokenEarned'].some(field => after[field] < before[field]);
  return {
    keyDelta: reset ? 0 : after.keyEarned - before.keyEarned,
    tokenDelta: reset ? 0 : after.tokenEarned - before.tokenEarned,
    shareBefore,
    shareAfter,
  };
}

/**
 * Prospective share of the key-reward pool, not of the entire entry or jackpot.
 * This is ownership arithmetic; affordability and purchase timing remain the
 * engine's responsibility. Invalid input leaves the current position unchanged.
 */
export function previewKeyShare(state, count, playerId = 'you') {
  const current = captureRewardPosition(state, playerId);
  const unchanged = {
    currentShare: current.share,
    afterShare: current.share,
    gainedShare: 0,
    afterKeys: current.keys,
    valid: false,
  };
  const player = playerIn(state, playerId);
  if (!player || state?.round?.status !== 'active'
    || !Number.isSafeInteger(count) || count < 1 || count > MAX_KEYS_PER_PURCHASE
    || !wholeAmount(player.keys) || !wholeAmount(state.round.totalKeys)
    || player.keys > state.round.totalKeys || current.roundId === null) return unchanged;

  const afterKeys = player.keys + count;
  const afterTotal = state.round.totalKeys + count;
  if (!wholeAmount(afterKeys) || !wholeAmount(afterTotal)) return unchanged;
  const afterShare = afterKeys / afterTotal;
  return {
    currentShare: current.share,
    afterShare,
    gainedShare: Math.max(0, afterShare - current.share),
    afterKeys,
    valid: true,
  };
}
