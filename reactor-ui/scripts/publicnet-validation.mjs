/** Pure release checks shared by operator tooling and their regression tests. */
import { PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddressSync, NATIVE_MINT } from '@solana/spl-token';
import { assertPublicationDomain, ELIGIBILITY_POLICY } from '../src/holder-publication.mjs';

export function validatePublishedEpochIndex(entries, nextEpoch) {
  const next = BigInt(nextEpoch);
  if (next < 1n || next > 5001n || !Array.isArray(entries) || BigInt(entries.length) !== next - 1n) throw new Error('Proof index must cover epochs 1 through next_epoch - 1; a separate audit is required above 5,000 epochs.');
  const seen = new Set();
  return entries.map(entry => {
    if (!/^[1-9][0-9]*$/.test(String(entry.epoch))) throw new Error('Published epoch IDs start at 1.');
    const epoch = BigInt(entry.epoch);
    if (epoch >= next || seen.has(epoch.toString())) throw new Error('Proof index contains a duplicate, missing or out-of-range epoch.');
    seen.add(epoch.toString());
    if (!/^[0-9a-fA-F]{64}$/.test(entry.root) || !/^[0-9]+$/.test(String(entry.snapshotSlot)) || !/^[1-9][0-9]*$/.test(String(entry.totalAmount))) throw new Error('Published epoch root, snapshot slot and funded amount are required.');
    if (BigInt(entry.snapshotSlot) >= 1n << 64n || BigInt(entry.totalAmount) >= 1n << 64n) throw new Error('Published epoch metadata must fit u64.');
    return { ...entry, epoch: epoch.toString(), root: entry.root.toLowerCase() };
  });
}

export function requireMainnetAuthorities(config) {
  const source = config.expectedAuthorities;
  if (!source || typeof source !== 'object') throw new Error('Mainnet config requires explicit expectedAuthorities.');
  const result = {};
  for (const role of ['gameCreator', 'communityTreasury', 'holderPublisher', 'upgradeAuthority']) {
    if (typeof source[role] !== 'string') throw new Error(`Mainnet expectedAuthorities.${role} is required.`);
    const key = new PublicKey(source[role]);
    if (key.equals(PublicKey.default)) throw new Error(`Mainnet ${role} cannot be a placeholder.`);
    result[role] = key.toBase58();
  }
  if (new Set(Object.values(result)).size !== 4) throw new Error('Mainnet creator, treasury, publisher and upgrade authority must be separate identities.');
  return result;
}

export function validateMainnetGameConfiguration(game, holder, expected) {
  for (const [field, value] of [['round_init_time', 3600n], ['round_inc_time_per_key', 30n], ['round_max_time', 86400n]]) if (BigInt(game[field]) !== value) throw new Error(`Mainnet ${field} must be the original ${value} seconds.`);
  if (game.game_creator !== expected.gameCreator) throw new Error('Mainnet game creator differs from the reviewed role.');
  if (holder.publisher !== expected.holderPublisher) throw new Error('Mainnet holder publisher differs from the reviewed role.');
  const communityAccount = getAssociatedTokenAddressSync(NATIVE_MINT, new PublicKey(expected.communityTreasury));
  if (game.community_wallet !== communityAccount.toBase58()) throw new Error('Mainnet community payment account is not the reviewed treasury WSOL ATA.');
  return { expectedAuthorities: expected, communityTokenAccount: communityAccount.toBase58(), initialSeconds: 3600, secondsPerShare: 30, maxSeconds: 86400 };
}

export function requireActivatedGame(game) {
  if (BigInt(game.round_id) < 1n) throw new Error('First round is not active. Persist the finalized opening holder snapshot S0 and complete first-round activation before enabling the public UI.');
  return BigInt(game.round_id);
}

export function validatePreparedOpeningJournal(journal, domain) {
  assertPublicationDomain(journal, domain);
  const snapshot = journal.openingSnapshot;
  if (journal.activation !== 'prepared-before-game' || !snapshot || snapshot.policy !== ELIGIBILITY_POLICY || snapshot.mint !== domain.piggyMint || !Number.isSafeInteger(snapshot.slot) || snapshot.slot < 0 || !Number.isSafeInteger(journal.preGameAbsenceSlot) || journal.preGameAbsenceSlot < snapshot.slot || !Array.isArray(journal.plans) || journal.plans.length || journal.pendingWindow !== null) throw new Error('Publisher journal does not contain the matching finalized pre-creation S0 and game-absence proof.');
  return { snapshotSlot: snapshot.slot, preGameAbsenceSlot: journal.preGameAbsenceSlot, activation: journal.activation };
}
