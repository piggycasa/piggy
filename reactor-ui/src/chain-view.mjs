import { MODES } from './holder-engine.mjs';

const INDEX_SCALE = 1_000_000_000_000_000_000n;
const ZERO_WALLET = '11111111111111111111111111111111';
const TEAMS = ['whale', 'bear', 'snek', 'bull'];
const big = value => BigInt(value ?? 0);
function integer(value, label = 'chain amount') {
  const result = Number(big(value));
  if (!Number.isSafeInteger(result) || result < 0) throw new RangeError(`${label} exceeds the display's exact integer range.`);
  return result;
}
const teamName = value => typeof value === 'string' && TEAMS.includes(value.toLowerCase()) ? value.toLowerCase() : TEAMS[Number(value)] || 'snek';

/** Mirrors V2 checkpoint accounting without ever recomputing historical income
 * from a player's present fraction of the entire past fee pool. */
export function playerRoundRewards(player = {}, round = {}) {
  const difference = big(round.reward_per_key) - big(player.reward_index);
  if (difference < 0n) throw new RangeError('Player reward checkpoint is ahead of its round.');
  const earned = big(player.accum_f3d) + (big(player.accum_keys) * difference + big(player.reward_remainder)) / INDEX_SCALE;
  const keyAvailable = earned - big(player.withdrawn_f3d);
  const winnings = big(player.accum_winnings) - big(player.withdrawn_winnings);
  const affiliate = big(player.accum_aff) - big(player.withdrawn_aff);
  if ([keyAvailable, winnings, affiliate].some(value => value < 0n)) throw new RangeError('Invalid negative chain liability.');
  return { keyEarned: integer(earned), claimed: integer(big(player.withdrawn_f3d) + big(player.withdrawn_winnings) + big(player.withdrawn_aff)), claimable: integer(keyAvailable + winnings + affiliate) };
}

function closing(round, mode) {
  const pot = big(round.still_in_play);
  const table = MODES[mode].closingBps;
  const allocations = {};
  let other = 0n;
  for (const bucket of ['community', 'keyHolders', 'tokenHolders', 'rollover']) {
    const value = pot * BigInt(table[bucket]) / 10_000n;
    allocations[bucket] = integer(value);
    other += value;
  }
  allocations.winner = integer(pot - other);
  return allocations;
}

/** Chain data is authoritative. This adapter only reshapes confirmed account
 * reads for the existing PIGGY renderer; it never creates or pays rewards. */
export function chainView(raw) {
  if (!raw?.game || !raw?.round || !Array.isArray(raw.players)) throw new TypeError('Incomplete local Solana account response.');
  const r = raw.round;
  const roundId = integer(r.round_id);
  const wallets = Object.fromEntries(raw.players.map(p => [p.wallet, p.id]));
  const idFor = wallet => !wallet || wallet === ZERO_WALLET ? null : wallets[wallet] || wallet;
  const leaderId = idFor(r.lead_player_pk);
  const mode = teamName(r.lead_player_team);
  const players = {};
  for (const [index, source] of raw.players.entries()) {
    const current = source.playerRound || source.player_round || {};
    const records = source.playerRounds || source.player_rounds || [{ player: current, round: r }];
    let claimable = 0n, keyRewardsEarned = 0n, totalClaimed = 0n;
    let keyRewardsAvailable = 0n, jackpotRewardsAvailable = 0n, referralRewardsAvailable = 0n, jackpotRewardsEarned = 0n;
    for (const item of records) {
      const record = item.player || item.playerRound || item;
      const reward = playerRoundRewards(record, item.round || r);
      claimable += BigInt(reward.claimable); keyRewardsEarned += BigInt(reward.keyEarned); totalClaimed += BigInt(reward.claimed);
      keyRewardsAvailable += BigInt(reward.keyEarned) - big(record.withdrawn_f3d);
      jackpotRewardsAvailable += big(record.accum_winnings) - big(record.withdrawn_winnings);
      referralRewardsAvailable += big(record.accum_aff) - big(record.withdrawn_aff);
      jackpotRewardsEarned += big(record.accum_winnings);
    }
    const holder = source.holder || raw.holder?.wallets?.[source.wallet] || {};
    players[source.id] = {
      id: source.id, name: source.name || source.wallet.slice(0, 6), handle: source.wallet,
      avatar: source.avatar || (source.id === 'you' ? 'Y' : String(index)), color: source.color || '#e6ff6b', wallet: source.wallet,
      balance: integer(source.balance), tokenBalance: integer(source.tokenBalance ?? source.token_balance),
      keys: integer(current.accum_keys), totalKeys: integer(current.accum_keys),
      claimable: integer(claimable), keyRewardsEarned: integer(keyRewardsEarned), totalClaimed: integer(totalClaimed),
      keyRewardsAvailable: integer(keyRewardsAvailable), jackpotRewardsAvailable: integer(jackpotRewardsAvailable),
      referralRewardsAvailable: integer(referralRewardsAvailable), jackpotRewardsEarned: integer(jackpotRewardsEarned),
      tokenClaimable: integer(holder.claimable ?? source.tokenClaimable),
      tokenRewardsEarned: integer(holder.earned ?? source.tokenRewardsEarned),
      tokenRewardsClaimed: integer(holder.claimed ?? source.tokenRewardsClaimed),
      roundContribution: integer(current.accum_sol_added),
      referral: idFor(current.last_affiliate_pk),
    };
  }
  if (leaderId && !players[leaderId]) players[leaderId] = {
    id: leaderId, name: `${leaderId.slice(0, 4)}…${leaderId.slice(-4)}`, handle: leaderId, wallet: leaderId, avatar: 'P', color: '#e6ff6b',
    balance: 0, keys: 0, tokenBalance: 0, claimable: 0, totalClaimed: 0, keyRewardsEarned: 0,
    tokenClaimable: 0, tokenRewardsEarned: 0, tokenRewardsClaimed: 0,
  };
  const ended = Boolean(r.ended);
  const grossEntries = Object.values(r.accum_sol_by_team || {}).reduce((sum, value) => sum + integer(value), 0);
  const funding = integer(r.accum_sol_pot);
  const close = closing(r, mode);
  const winnerPrize = ended ? integer(r.final_prize_share) : close.winner;
  const round = {
    id: roundId, status: ended ? 'settled' : 'active', startedAt: integer(r.start_time) * 1_000, endsAt: integer(r.end_time) * 1_000,
    pot: ended ? 0 : integer(r.still_in_play), openingRollover: funding - grossEntries, grossEntries,
    totalKeys: integer(r.accum_keys), lastBuyerId: leaderId, lastBuyerTeam: leaderId ? mode : null,
    winnerId: ended ? leaderId : null, finalPot: ended && raw.finalPot !== undefined ? integer(raw.finalPot) : null,
    playerRewardsAllocated: integer(r.accum_f3d_share), tokenRewardsAllocated: integer(r.accum_p3d_share),
    settlement: ended ? { winnerId: leaderId, mode, winnerPrize } : null,
  };
  return {
    version: 4, network: typeof raw.network === 'string' ? raw.network : raw.network?.name || 'localnet', economyVersion: 'solana-program-v2', localPlayerId: 'you',
    players, round, totalTokenSupply: integer(raw.holder?.totalEligibleTokenBalance ?? raw.players.reduce((sum, p) => sum + big(p.tokenBalance ?? p.token_balance), 0n)), history: raw.history || [], activity: raw.activity || [],
    communityReserve: integer(big(r.accum_community_share) - big(r.withdrawn_com)),
    rolloverReserve: integer(big(r.accum_next_round_share) - big(r.withdrawn_next_round)),
    airdropReserve: integer(r.accum_airdrop_share), lastActionAt: integer(raw.chainNow) * 1_000,
    config: { tokenDecimals: integer(raw.holder?.decimals ?? raw.tokenDecimals ?? 6), initialDurationMs: integer(raw.game.round_init_time) * 1_000, extensionPerKeyMs: integer(raw.game.round_inc_time_per_key) * 1_000, maxRemainingMs: integer(raw.game.round_max_time) * 1_000 },
    chain: { programId: raw.programId, piggyMint: raw.piggyMint, network: typeof raw.network === 'string' ? raw.network : raw.network?.name || 'localnet', holder: raw.holder, wallet: raw.walletConnected === false ? null : players.you?.wallet, walletConnected: raw.walletConnected !== false },
  };
}
