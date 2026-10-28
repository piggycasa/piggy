import test from 'node:test';
import assert from 'node:assert/strict';
import { chainView, playerRoundRewards } from '../src/chain-view.mjs';

const scale = 1_000_000_000_000_000_000n;
test('chain projection preserves historical game earnings and claims rather than reweighting them', () => {
  const oldPlayer = { accum_keys: '10', reward_index: String(scale * 2n), reward_remainder: '0', accum_f3d: '200', withdrawn_f3d: '190', accum_winnings: '40', withdrawn_winnings: '40', accum_aff: '30', withdrawn_aff: '10' };
  assert.deepEqual(playerRoundRewards(oldPlayer, { reward_per_key: String(scale * 3n) }), { keyEarned: 210, claimed: 240, claimable: 40 });
  const raw = {
    game: { round_init_time: '3600', round_inc_time_per_key: '30', round_max_time: '86400' },
    round: { round_id: '2', start_time: '1800000000', end_time: '1800003600', ended: false, lead_player_pk: 'wallet-you', lead_player_team: 'Whale', accum_keys: '2', accum_sol_pot: '1275022', accum_sol_by_team: { whale: '41067', bear: '0', bull: '0', snek: '0' }, still_in_play: '1254491', reward_per_key: String(scale * 5n), accum_f3d_share: '12320', accum_p3d_share: '6570' },
    players: [{ id: 'you', wallet: 'wallet-you', name: 'You', balance: '1000000000', tokenBalance: '1000', playerRound: { accum_keys: '2' }, playerRounds: [{ player: oldPlayer, round: { reward_per_key: String(scale * 3n) } }, { player: { accum_keys: '2', reward_index: String(scale * 4n), accum_f3d: '8' }, round: { reward_per_key: String(scale * 5n) } }], holder: { claimable: '33', earned: '53', claimed: '20' } }],
    chainNow: '1800000001', network: 'localnet', programId: 'program', piggyMint: 'mint',
  };
  const state = chainView(raw);
  assert.equal(state.round.openingRollover, 1_233_955);
  assert.equal(state.round.grossEntries, 41_067);
  assert.equal(state.round.totalKeys, 2);
  assert.equal(state.players.you.claimable, 50);
  assert.equal(state.players.you.keyRewardsEarned, 220);
  assert.equal(state.players.you.keyRewardsAvailable, 30);
  assert.equal(state.players.you.jackpotRewardsAvailable, 0);
  assert.equal(state.players.you.jackpotRewardsEarned, 40);
  assert.equal(state.players.you.referralRewardsAvailable, 20);
  assert.equal(state.players.you.keyRewardsAvailable + state.players.you.jackpotRewardsAvailable + state.players.you.referralRewardsAvailable, state.players.you.claimable);
  assert.equal(state.players.you.tokenClaimable, 33);
  assert.equal(state.players.you.tokenRewardsEarned, 53);
  assert.equal(state.players.you.tokenBalance, 1000);
  assert.equal(state.round.lastBuyerId, 'you');
  assert.equal(state.config.extensionPerKeyMs, 30_000);
  assert.equal(JSON.stringify(raw).includes('openingRollover'), false, 'view must not mutate RPC results');
  oldPlayer.withdrawn_winnings = '10';
  const unclaimedHistory = chainView(raw).players.you;
  assert.equal(unclaimedHistory.jackpotRewardsAvailable, 30, 'a previous-round jackpot remains available after the next round starts');
  assert.equal(unclaimedHistory.claimable, 80);
  oldPlayer.withdrawn_winnings = '40';
});

test('a fractional reward checkpoint accumulates to the next lamport without inventing whole rewards', () => {
  const player = { accum_keys: '3', reward_index: '0', accum_f3d: '5', reward_remainder: String(scale / 2n) };
  assert.equal(playerRoundRewards(player, { reward_per_key: String(scale / 6n) }).keyEarned, 5);
  assert.equal(playerRoundRewards(player, { reward_per_key: String(scale / 6n + 1n) }).keyEarned, 6);
});

test('unsafe displayed balances and invalid chain reward debt fail instead of silently rounding', () => {
  assert.throws(() => playerRoundRewards({ accum_f3d: '9007199254740992' }, {}), /exact integer/);
  assert.throws(() => playerRoundRewards({ reward_index: '2' }, { reward_per_key: '1' }), /ahead/);
  assert.throws(() => playerRoundRewards({ accum_f3d: '1', withdrawn_f3d: '2' }, {}), /negative/);
  assert.throws(() => chainView({}), /Incomplete/);
});
