/**
 * FOMO3D: EXPERIMENTAL, browser-local holder-reward adaptation.
 * Original four-mode percentage tables follow ilmoi/solana_fomo3d (2021).
 * This is an original simulation, not a deployable program or a token offer.
 * It uses no wallet, network, staking, token transfers, inflation or fixed APY.
 *
 * Money: integer lamports, 1_000_000_000 = 1 demo SOL. Tokens: 1,000 fixed demo tokens
 * per player, 5,000 total. Rewards are funded lamports, not newly issued tokens.
 * Times: injected integer milliseconds. State is JSON-safe, version 4.
 *
 * API: createGame(now); quotePurchase(state,count,playerId='you',mode='whale');
 * buyKeys(state,id,count,now,mode='whale'); settleRound(state,now);
 * claimPayout(state,id) for key/jackpot income; claimTokenRewards(state,id);
 * startNextRound(state,now); timeRemaining(state,now); previewJackpot(state).
 * Mutations return {ok:true,...} or {ok:false,code,error}; failures are atomic.
 *
 * Purchased keys participate in THAT entry's key allocation. Each entry and
 * closing allocation snapshots current keys/token balances; later holdings
 * never dilute or create historical rewards. This bounded five-player model
 * iterates recipients. Production requires audited scalable historical reward
 * accounting and explicit mint/custody/transfer eligibility rules.
 *
 * There is no referral input: the original unassigned affiliate 10% joins the
 * token-holder allocation. Community, next-round rollover, and the unawarded
 * airdrop reserve stay separate. No predictable airdrop RNG is implemented.
 * Original percentage buckets are floored per event before the affiliate
 * allocation is combined with holder rewards; entry residue stays in the pot,
 * and settlement residue goes to the winner, matching the source.
 * Recipients within a reward pool use deterministic largest-remainder splits.
 * Per-event rounding can make batched and individual entries differ slightly.
 *
 * round.pot = remaining in-play reserve, NOT total entries or winner's prize.
 * At expiry the LAST BUYER'S mode splits it: 48% winner, 2% community, and
 * mode-specific key/holder/rollover percentages. No previous rewards are paid
 * again. finalPot preserves the pre-settlement reserve. The next round takes
 * funded rollover; if nobody buys, expiry returns it wholly to rollover.
 *
 * Conservation: sum(player.balance + player.claimable + player.tokenClaimable)
 * + round.pot + communityReserve + rolloverReserve + airdropReserve
 * = totalSupply. All earned/allocated/gross counters are metrics, not funds.
 */

import { costForExactKeys } from './solana-curve.mjs';

export const CREDIT_SCALE = 1_000_000_000;
export const KEY_EXTENSION_MS = 30_000;
export const MAX_REMAINING_MS = 86_400_000;
export const NEW_ROUND_DURATION_MS = 3_600_000;
export const MAX_KEYS_PER_PURCHASE = 10_000;

function mode(id, name, key, originalHolder, pot, finalKey, finalHolder, finalRollover) {
  return Object.freeze({
    id, name,
    originalHolderBps: originalHolder,
    affiliateRedirectBps: 1_000,
    entryBps: Object.freeze({ pot, keyHolders: key, tokenHolders: originalHolder + 1_000, community: 200, rollover: 100, airdrop: 100 }),
    closingBps: Object.freeze({ winner: 4_800, community: 200, keyHolders: finalKey, tokenHolders: finalHolder, rollover: finalRollover }),
  });
}

export const MODES = Object.freeze({
  whale: mode('whale', 'Whale', 3_000, 600, 5_000, 1_500, 1_000, 2_500),
  bear: mode('bear', 'Bear', 4_300, 0, 4_300, 2_500, 0, 2_500),
  snek: mode('snek', 'Snek', 5_600, 1_000, 2_000, 2_000, 2_000, 1_000),
  bull: mode('bull', 'Bull', 4_300, 800, 3_500, 3_000, 1_000, 1_000),
});

const fail = (code, error) => ({ ok: false, code, error });
const validTime = (now) => Number.isSafeInteger(now) && now >= 0;
const validMode = (id) => typeof id === 'string' && Object.hasOwn(MODES, id);

function assertTime(now) {
  if (!validTime(now)) throw new TypeError('Use a non-negative integer timestamp in milliseconds.');
}

function splitPercent(amount, percentages, residualBucket) {
  const output = {};
  let allocated = 0;
  for (const [bucket, bps] of Object.entries(percentages)) {
    output[bucket] = Number(BigInt(amount) * BigInt(bps) / 10_000n);
    allocated += output[bucket];
  }
  output[residualBucket] += amount - allocated;
  return output;
}

function splitEntry(amount, team, hasAffiliate = false) {
  const profile = MODES[team];
  const output = splitPercent(amount, {
    ...profile.entryBps,
    tokenHolders: profile.originalHolderBps,
    affiliate: profile.affiliateRedirectBps,
  }, 'pot');
  if (!hasAffiliate) { output.tokenHolders += output.affiliate; delete output.affiliate; }
  return output;
}

function apportion(amount, weightedEntries) {
  const denominator = weightedEntries.reduce((total, [, weight]) => total + BigInt(weight), 0n);
  if (denominator === 0n) return {};
  const rows = weightedEntries.map(([id, weight], order) => {
    const numerator = BigInt(amount) * BigInt(weight);
    return { id, order, value: Number(numerator / denominator), remainder: numerator % denominator };
  });
  let remaining = amount - rows.reduce((total, row) => total + row.value, 0);
  const ranking = [...rows].sort((a, b) => a.remainder === b.remainder ? a.order - b.order : a.remainder > b.remainder ? -1 : 1);
  for (const row of ranking) {
    if (!remaining) break;
    row.value += 1;
    remaining -= 1;
  }
  return Object.fromEntries(rows.map(({ id, value }) => [id, value]));
}

function weights(state, field) {
  return Object.values(state.players).filter((p) => p[field] > 0).map((p) => [p.id, p[field]]);
}

function log(state, type, timestamp, details = {}) {
  state.activity.unshift({ id: state.nextActivityId++, type, timestamp, roundId: state.round.id, ...details });
  state.activity.length = Math.min(state.activity.length, 40);
}

function makePlayer(id, name, handle, color, avatar, balance) {
  return {
    id, name, handle, color, avatar, balance,
    keys: 0, totalKeys: 0, claimable: 0, totalClaimed: 0,
    keyRewardsEarned: 0, jackpotRewardsEarned: 0,
    tokenBalance: 1_000, tokenClaimable: 0, tokenRewardsEarned: 0, tokenRewardsClaimed: 0,
  };
}

function makeRound(id, now, openingRollover = 0) {
  return {
    id, status: 'active', startedAt: now, endsAt: now + NEW_ROUND_DURATION_MS,
    pot: openingRollover, openingRollover, finalPot: null, grossEntries: 0,
    totalKeys: 0, lastBuyerId: null, lastBuyerTeam: null, winnerId: null,
    playerRewardsAllocated: 0, tokenRewardsAllocated: 0,
    communityAllocated: 0, rolloverAllocated: 0, airdropAllocated: 0,
    entryAllocations: { pot: 0, keyHolders: 0, tokenHolders: 0, community: 0, rollover: 0, airdrop: 0 },
    keyRewardsByPlayer: {}, tokenRewardsByPlayer: {},
    settledAt: null, settlement: null,
  };
}

export function createGame(now, { seeded = true } = {}) {
  assertTime(now);
  const state = {
    version: 4, economyVersion: 'solana-native-curve-lamports-1', localPlayerId: 'you',
    config: { label: 'EXPERIMENTAL', affiliatePolicy: 'unassigned-to-token-holders', tokenEligibility: 'held-balance-demo-snapshot', airdropPolicy: 'reserve-only-no-draws' },
    players: {
      you: makePlayer('you', 'You', '@you', '#e6ff6b', 'Y', 500 * CREDIT_SCALE),
      npc_fox: makePlayer('npc_fox', 'Neon Fox', '@neonfox', '#ff8b57', 'F', 2_000 * CREDIT_SCALE),
      npc_orbit: makePlayer('npc_orbit', 'Orbit', '@orbit', '#ad9bff', 'O', 2_000 * CREDIT_SCALE),
      npc_void: makePlayer('npc_void', 'Void', '@void', '#65d8ec', 'V', 2_000 * CREDIT_SCALE),
      npc_koi: makePlayer('npc_koi', 'Koi', '@koi', '#f297cc', 'K', 2_000 * CREDIT_SCALE),
    },
    communityReserve: 0, rolloverReserve: 0, airdropReserve: 0,
    totalSupply: 8_500 * CREDIT_SCALE, totalTokenSupply: 5_000,
    round: makeRound(1, seeded ? now - (NEW_ROUND_DURATION_MS + 147 * KEY_EXTENSION_MS - 87_000) : now),
    history: [], activity: [], nextActivityId: 1, lastActionAt: now,
  };
  for (const [id, count, elapsed, team] of seeded ? [
    ['npc_koi', 17, 10_000, 'snek'], ['npc_void', 29, 100_000, 'bear'],
    ['npc_orbit', 43, 500_000, 'bull'], ['npc_fox', 58, 1_500_000, 'whale'],
  ] : []) {
    applyPurchase(state, id, quotePurchase(state, count, id, team), state.round.startedAt + elapsed, true);
  }
  state.lastActionAt = now;
  return state;
}

export function timeRemaining(state, now) {
  assertTime(now);
  return state.round.status === 'active' ? Math.max(0, state.round.endsAt - now) : 0;
}

export function previewJackpot(state) {
  if (state.round.status === 'settled') return state.round.settlement.winnerPrize;
  if (!state.round.lastBuyerId) return 0;
  return splitPercent(state.round.pot, MODES[state.round.lastBuyerTeam].closingBps, 'winner').winner;
}

export function quotePurchase(state, count, playerId = state.localPlayerId, team = 'whale', affiliateId) {
  if (!Number.isSafeInteger(count) || count < 1 || count > MAX_KEYS_PER_PURCHASE) return fail('INVALID_COUNT', `Choose between 1 and ${MAX_KEYS_PER_PURCHASE.toLocaleString('en-US')} whole keys.`);
  if (!Object.hasOwn(state.players, playerId)) return fail('UNKNOWN_PLAYER', 'That player is not in this demo.');
  if (!validMode(team)) return fail('INVALID_MODE', 'Choose Whale, Bear, Snek or Bull.');
  if (state.round.status !== 'active') return fail('ROUND_SETTLED', 'This round has ended. Start the next round.');
  // The source prices from ALL contributions, including opening rollover.
  // Remaining pot and issued key counts are not the curve's funding input.
  const funding = state.round.openingRollover + state.round.grossEntries;
  if (!Number.isSafeInteger(funding) || funding < 0) return fail('AMOUNT_TOO_LARGE', 'Invalid cumulative funding.');
  let exact, first, next, previous;
  try {
    exact = costForExactKeys(BigInt(funding), BigInt(count));
    if (!exact.ok) return fail(exact.code, exact.error);
    first = costForExactKeys(BigInt(funding), 1n);
    next = costForExactKeys(BigInt(funding) + exact.lamports, 1n);
    previous = costForExactKeys(BigInt(funding), BigInt(count - 1));
  } catch (error) { return fail(error.code || 'AMOUNT_TOO_LARGE', error.message); }
  if (!first.ok || !next.ok || !previous.ok) return fail('CURVE_LIMIT', 'The requested feed reaches the original curve limit.');
  const cost = Number(exact.lamports), nextPrice = Number(next.lamports);
  if (!Number.isSafeInteger(cost) || !Number.isSafeInteger(funding + cost) || !Number.isSafeInteger(nextPrice)) return fail('AMOUNT_TOO_LARGE', 'This purchase is too large for this preview.');
  if (state.economyVersion === 'solana-program-v2' && funding < 100 * CREDIT_SCALE && cost + (state.players[playerId].roundContribution || 0) > CREDIT_SCALE) return fail('LAUNCH_LIMIT', 'The original launch limit is 1 SOL per wallet until round funding reaches 100 SOL. Choose a smaller feed.');
  const breakdown = splitEntry(cost, team, Boolean(affiliateId || state.players[playerId].referral));
  const projected = Object.values(state.players).map((p) => [p.id, p.keys + (p.id === playerId ? count : 0)]).filter(([, amount]) => amount > 0);
  const holderWeights = weights(state, 'tokenBalance');
  const tokenSupply = holderWeights.reduce((sum, [, amount]) => sum + amount, 0);
  const playerKeysAfter = state.players[playerId].keys + count;
  const totalKeysAfter = state.round.totalKeys + count;
  return {
    ok: true, count, cost, mode: team,
    curveFunding: funding, pricePerKey: Number(first.lamports), lastKeyPrice: Number(exact.lamports - previous.lamports), nextPrice,
    extensionMs: count * (state.config?.extensionPerKeyMs ?? KEY_EXTENSION_MS), breakdown,
    playerKeysAfter, totalKeysAfter,
    keyShareBefore: state.round.totalKeys ? state.players[playerId].keys / state.round.totalKeys : 0,
    keyShareAfter: playerKeysAfter / totalKeysAfter,
    tokenShare: tokenSupply ? state.players[playerId].tokenBalance / tokenSupply : 0,
    estimatedKeyReward: apportion(breakdown.keyHolders, projected)[playerId] || 0,
    estimatedTokenReward: apportion(breakdown.tokenHolders, holderWeights)[playerId] || 0,
  };
}

function allocateKeys(state, amount) {
  const payouts = apportion(amount, weights(state, 'keys'));
  for (const [id, value] of Object.entries(payouts)) {
    const p = state.players[id];
    p.claimable += value;
    p.keyRewardsEarned += value;
    state.round.keyRewardsByPlayer[id] = (state.round.keyRewardsByPlayer[id] || 0) + value;
  }
  state.round.playerRewardsAllocated += amount;
  return payouts;
}

function allocateHolders(state, amount) {
  const payouts = apportion(amount, weights(state, 'tokenBalance'));
  for (const [id, value] of Object.entries(payouts)) {
    const p = state.players[id];
    p.tokenClaimable += value;
    p.tokenRewardsEarned += value;
    state.round.tokenRewardsByPlayer[id] = (state.round.tokenRewardsByPlayer[id] || 0) + value;
  }
  state.round.tokenRewardsAllocated += amount;
  return payouts;
}

function applyPurchase(state, playerId, quote, now, seeded = false) {
  const { count, cost, breakdown } = quote;
  const p = state.players[playerId];
  const previousEnd = state.round.endsAt;
  p.balance -= cost;
  p.keys += count;
  p.totalKeys += count;
  state.round.totalKeys += count;
  state.round.lastBuyerId = playerId;
  state.round.lastBuyerTeam = quote.mode;
  state.round.endsAt = Math.min(previousEnd + quote.extensionMs, now + MAX_REMAINING_MS);
  state.round.grossEntries += cost;
  state.round.pot += breakdown.pot;
  allocateKeys(state, breakdown.keyHolders);
  allocateHolders(state, breakdown.tokenHolders);
  state.communityReserve += breakdown.community;
  state.rolloverReserve += breakdown.rollover;
  state.airdropReserve += breakdown.airdrop;
  state.round.communityAllocated += breakdown.community;
  state.round.rolloverAllocated += breakdown.rollover;
  state.round.airdropAllocated += breakdown.airdrop;
  for (const [bucket, value] of Object.entries(breakdown)) state.round.entryAllocations[bucket] += value;
  state.lastActionAt = now;
  log(state, 'purchase', now, { playerId, count, cost, mode: quote.mode, breakdown: { ...breakdown }, extensionMs: state.round.endsAt - previousEnd, seeded });
  return { ...quote, playerId, endsAt: state.round.endsAt, actualExtensionMs: state.round.endsAt - previousEnd };
}

function checkTimedPlayer(state, playerId, now) {
  if (!validTime(now)) return fail('INVALID_TIME', 'The demo clock is invalid.');
  if (now < state.lastActionAt) return fail('STALE_TIME', 'The demo clock cannot move backwards.');
  if (!Object.hasOwn(state.players, playerId)) return fail('UNKNOWN_PLAYER', 'That player is not in this demo.');
  return null;
}

export function buyKeys(state, playerId, count, now, team = 'whale') {
  const invalid = checkTimedPlayer(state, playerId, now);
  if (invalid) return invalid;
  const quote = quotePurchase(state, count, playerId, team);
  if (!quote.ok) return quote;
  if (now >= state.round.endsAt) return fail('ROUND_EXPIRED', 'The countdown has ended. Settle this round first.');
  if (state.players[playerId].balance < quote.cost) return fail('INSUFFICIENT_BALANCE', 'Not enough demo SOL for those keys.');
  return applyPurchase(state, playerId, quote, now);
}

export function settleRound(state, now) {
  if (!validTime(now)) return fail('INVALID_TIME', 'The demo clock is invalid.');
  if (now < state.lastActionAt) return fail('STALE_TIME', 'The demo clock cannot move backwards.');
  if (state.round.status !== 'active') return fail('ROUND_SETTLED', 'This round has already been settled.');
  if (now < state.round.endsAt) return fail('ROUND_ACTIVE', 'The countdown is still running.');
  const pot = state.round.pot;
  const winnerId = state.round.lastBuyerId;
  const team = state.round.lastBuyerTeam;
  const closing = winnerId
    ? splitPercent(pot, MODES[team].closingBps, 'winner')
    : { winner: 0, community: 0, keyHolders: 0, tokenHolders: 0, rollover: pot };
  const holderPayouts = winnerId ? allocateKeys(state, closing.keyHolders) : {};
  const tokenPayouts = winnerId ? allocateHolders(state, closing.tokenHolders) : {};
  const payouts = { ...holderPayouts };
  if (winnerId) {
    state.players[winnerId].claimable += closing.winner;
    state.players[winnerId].jackpotRewardsEarned += closing.winner;
    payouts[winnerId] = (payouts[winnerId] || 0) + closing.winner;
  }
  state.communityReserve += closing.community;
  state.rolloverReserve += closing.rollover;
  state.round.communityAllocated += closing.community;
  state.round.rolloverAllocated += closing.rollover;
  const settlement = {
    roundId: state.round.id, winnerId, mode: team, pot, winnerPrize: closing.winner,
    grossEntries: state.round.grossEntries, openingRollover: state.round.openingRollover,
    closingAllocations: { ...closing }, entryAllocations: { ...state.round.entryAllocations },
    holderPool: closing.keyHolders, holderPayouts, tokenPayouts, payouts,
    treasuryAmount: closing.community, rolloverAmount: closing.rollover,
    playerRewardsAllocated: state.round.playerRewardsAllocated,
    tokenRewardsAllocated: state.round.tokenRewardsAllocated,
    keyRewardsByPlayer: { ...state.round.keyRewardsByPlayer },
    tokenRewardsByPlayer: { ...state.round.tokenRewardsByPlayer },
    totalKeys: state.round.totalKeys, settledAt: now,
    keysByPlayer: Object.fromEntries(Object.values(state.players).map((p) => [p.id, p.keys])),
  };
  Object.assign(state.round, { status: 'settled', winnerId, settledAt: now, finalPot: pot, pot: 0, settlement });
  state.lastActionAt = now;
  state.history.unshift(JSON.parse(JSON.stringify(settlement)));
  log(state, 'settlement', now, { winnerId, mode: team, pot, winnerPrize: closing.winner });
  return { ok: true, ...settlement };
}

export function claimPayout(state, playerId) {
  if (!Object.hasOwn(state.players, playerId)) return fail('UNKNOWN_PLAYER', 'That player is not in this demo.');
  const p = state.players[playerId];
  if (!p.claimable) return fail('NOTHING_TO_CLAIM', 'No game rewards to claim yet.');
  const amount = p.claimable;
  p.claimable = 0;
  p.balance += amount;
  p.totalClaimed += amount;
  log(state, 'claim', state.lastActionAt, { playerId, amount });
  return { ok: true, playerId, amount };
}

export function claimTokenRewards(state, playerId) {
  if (!Object.hasOwn(state.players, playerId)) return fail('UNKNOWN_PLAYER', 'That player is not in this demo.');
  const p = state.players[playerId];
  if (!p.tokenClaimable) return fail('NOTHING_TO_CLAIM', 'No token-holder rewards to claim yet.');
  const amount = p.tokenClaimable;
  p.tokenClaimable = 0;
  p.balance += amount;
  p.tokenRewardsClaimed += amount;
  log(state, 'token-claim', state.lastActionAt, { playerId, amount });
  return { ok: true, playerId, amount };
}

export function startNextRound(state, now) {
  if (!validTime(now)) return fail('INVALID_TIME', 'The demo clock is invalid.');
  if (now < state.lastActionAt) return fail('STALE_TIME', 'The demo clock cannot move backwards.');
  if (state.round.status !== 'settled') return fail('ROUND_ACTIVE', 'Settle this round before starting another.');
  const openingRollover = state.rolloverReserve;
  state.rolloverReserve = 0;
  state.round = makeRound(state.round.id + 1, now, openingRollover);
  for (const p of Object.values(state.players)) p.keys = 0;
  state.lastActionAt = now;
  log(state, 'new-round', now, { openingRollover });
  return { ok: true, roundId: state.round.id, endsAt: state.round.endsAt, openingRollover };
}
