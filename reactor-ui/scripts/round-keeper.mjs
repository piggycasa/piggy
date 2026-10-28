/** Offline permissionless round maintenance. Never expose this signer by HTTP. */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { setTimeout as delay } from 'node:timers/promises';
import { Connection, Keypair, Transaction, VersionedTransaction, ComputeBudgetProgram, SystemProgram, SYSVAR_CLOCK_PUBKEY } from '@solana/web3.js';
import * as sdk from '../src/solana-instructions.mjs';
import { base58Encode } from '../src/solana-signature.mjs';
import { CLUSTER_GENESIS, isPrivateHost } from '../src/solana-config.mjs';
import { publicationDomain, assertPublicationDomain, eligibleOpeningSnapshot } from '../src/holder-publication.mjs';
import { durableJson, withPublisherLock } from './holder-publisher.mjs';
import { requireMainnetAuthorities, validateMainnetGameConfiguration } from './publicnet-validation.mjs';
import { verifyOperatorProgram } from './program-release.mjs';

const ZERO = SystemProgram.programId.toBase58(), U64_MAX = (1n << 64n) - 1n;
const hash = value => createHash('sha256').update(sdk.serializeChain(value)).digest('hex');
const validAmount = (value, label) => { if (!/^[1-9]\d*$/.test(String(value)) || BigInt(value) > BigInt(Number.MAX_SAFE_INTEGER)) throw new Error(`Invalid keeper ${label}.`); return Number(value); };
export const withKeeperLock = withPublisherLock;

export function validateKeeperConfig(raw, { base = process.cwd(), allowLocal = false } = {}) {
  if (raw.schemaVersion !== 1) throw new Error('Keeper schemaVersion must be 1.');
  if (raw.settleOnly !== undefined && typeof raw.settleOnly !== 'boolean') throw new Error('Keeper settleOnly must be a boolean.');
  if (raw.settleOnlyRoundId !== undefined && (raw.settleOnly !== true || typeof raw.settleOnlyRoundId !== 'string' || !/^[1-9]\d*$/.test(raw.settleOnlyRoundId) || BigInt(raw.settleOnlyRoundId) > U64_MAX)) throw new Error('Keeper settleOnlyRoundId requires settleOnly:true and a positive u64 string.');
  const url = new URL(raw.rpcUrl);
  const local = allowLocal && raw.cluster === 'localnet' && url.protocol === 'http:' && url.hostname === '127.0.0.1' && url.port === '18899';
  if (!local && (!CLUSTER_GENESIS[raw.cluster] || url.protocol !== 'https:' || isPrivateHost(url.hostname))) throw new Error('Keeper requires an explicit public cluster and HTTPS public RPC.');
  if (url.username || url.password || url.hash || !local && raw.genesisHash !== CLUSTER_GENESIS[raw.cluster]) throw new Error('Invalid keeper RPC credentials or genesis hash.');
  if (!/^[1-9]\d*$/.test(String(raw.gameVersion)) || BigInt(raw.gameVersion) > U64_MAX) throw new Error('Invalid keeper game version.');
  const config = { ...raw, rpcUrl: url.href, gameVersion: String(raw.gameVersion),
    programId: sdk.pk(raw.programId).toBase58(), piggyMint: sdk.pk(raw.piggyMint).toBase58(), keeperPublicKey: sdk.pk(raw.keeperPublicKey).toBase58(),
    keeperKeypair: path.resolve(base, raw.keeperKeypair), workspace: path.resolve(base, raw.workspace), publisherStateFile: path.resolve(base, raw.publisherStateFile),
    celebrationSeconds: raw.celebrationSeconds ?? 8, pollSeconds: raw.pollSeconds ?? 2, settleOnly: raw.settleOnly ?? false,
    priorityFeeMicroLamports: raw.priorityFeeMicroLamports ?? 0,
    maxFeeLamportsPerTransaction: validAmount(raw.maxFeeLamportsPerTransaction ?? 100_000, 'transaction fee cap'),
    maxDailyFeeLamports: validAmount(raw.maxDailyFeeLamports ?? 1_000_000, 'rolling daily fee cap'),
    maxDailyRentLamports: validAmount(raw.maxDailyRentLamports ?? 200_000_000, 'rolling daily rent cap'),
    minBalanceLamports: validAmount(raw.minBalanceLamports ?? 1_000_000, 'balance reserve'), localTest: local };
  if ([config.programId, config.piggyMint, config.keeperPublicKey].includes(ZERO)) throw new Error('Keeper addresses cannot be placeholders.');
  if (!Number.isSafeInteger(config.celebrationSeconds) || config.celebrationSeconds < 8 || config.celebrationSeconds > 300 || !Number.isSafeInteger(config.pollSeconds) || config.pollSeconds < 1 || config.pollSeconds > 60) throw new Error('Keeper requires an 8–300 second celebration and a 1–60 second poll interval.');
  if (!Number.isSafeInteger(config.priorityFeeMicroLamports) || config.priorityFeeMicroLamports < 0 || config.priorityFeeMicroLamports > 1_000_000) throw new Error('Invalid keeper priority fee.');
  if (config.keeperKeypair === config.publisherStateFile || config.publisherStateFile.startsWith(config.workspace + path.sep)) throw new Error('Keeper and publisher need separate private workspaces.');
  if (!local && /\/solana\/wallets\/|\/publicnet\/(devnet|testnet)\/wallets\/(payer|buyer-[ab]|community)\.json$/.test(config.keeperKeypair)) throw new Error('Public keeper cannot use local fixture or rehearsal payment keys.');
  if (raw.cluster === 'mainnet-beta') config.expectedAuthorities = requireMainnetAuthorities(raw);
  if (!local && (!/^[a-f\d]{64}$/i.test(String(raw.programBinarySha256)) || !Number.isSafeInteger(raw.programBinaryBytes) || raw.programBinaryBytes < 1)) throw new Error('Public keeper requires the reviewed binary SHA-256 and byte length.');
  return config;
}

export async function loadKeeper(filename, { allowLocal = false } = {}) {
  const file = path.resolve(filename), raw = JSON.parse(await fs.readFile(file, 'utf8'));
  const config = validateKeeperConfig(raw, { base: path.dirname(file), allowLocal });
  const connection = new Connection(config.rpcUrl, { commitment: 'confirmed', confirmTransactionInitialTimeout: 60_000, disableRetryOnRateLimit: true });
  if (await connection.getGenesisHash() !== config.genesisHash) throw new Error('Keeper RPC genesis mismatch.');
  return { config, connection, domain: publicationDomain(config), game: sdk.gameAddress(config.programId, config.gameVersion), stateFile: path.join(config.workspace, 'keeper-state.json'), minContextSlot: 0 };
}

async function journal(ctx) {
  let value;
  try { value = JSON.parse(await fs.readFile(ctx.stateFile, 'utf8')); }
  catch (error) { if (error.code !== 'ENOENT') throw error; value = { ...ctx.domain, role: 'round-keeper-v1', keeperPublicKey: ctx.config.keeperPublicKey, activation: null, pending: null, observedEnded: null, transactions: [], minContextSlot: 0 }; }
  assertPublicationDomain(value, ctx.domain);
  if (value.role !== 'round-keeper-v1' || value.keeperPublicKey !== ctx.config.keeperPublicKey || !Array.isArray(value.transactions)) throw new Error('Keeper journal identity mismatch.');
  ctx.minContextSlot = Math.max(ctx.minContextSlot ?? 0, value.minContextSlot ?? 0);
  return value;
}
async function save(ctx, stored) { stored.minContextSlot = ctx.minContextSlot; await durableJson(ctx.stateFile, stored); }

export async function readKeeperState(ctx) {
  if (await ctx.connection.getGenesisHash() !== ctx.config.genesisHash) throw new Error('Keeper RPC changed networks.');
  const configAddress = sdk.holderConfigAddress(ctx.config.programId, ctx.game);
  const commitment = ctx.config.settleOnly ? 'finalized' : 'confirmed';
  const result = await ctx.connection.getMultipleAccountsInfoAndContext([sdk.pk(ctx.config.programId), ctx.game, configAddress, SYSVAR_CLOCK_PUBKEY], { commitment, minContextSlot: ctx.minContextSlot ?? 0 });
  if (!Number.isSafeInteger(result.context?.slot) || result.context.slot < (ctx.minContextSlot ?? 0)) throw new Error('Keeper read returned a stale context.');
  const [program, gameInfo, holderInfo, clockInfo] = result.value;
  if (!program?.executable || !gameInfo?.owner.equals(sdk.pk(ctx.config.programId)) || !holderInfo?.owner.equals(sdk.pk(ctx.config.programId))) throw new Error('Keeper deployment is missing or has wrong account owners.');
  let game = sdk.decodeGame(gameInfo.data), slot = result.context.slot, clockAccount = clockInfo;
  const holder = sdk.decodeHolderConfig(holderInfo.data);
  if (game.version !== BigInt(ctx.config.gameVersion) || game.mint !== sdk.NATIVE_MINT.toBase58() || holder.game !== ctx.game.toBase58() || holder.eligibility_mint !== ctx.config.piggyMint || holder.payment_mint !== sdk.NATIVE_MINT.toBase58() || holder.vault !== sdk.holderVaultAddress(ctx.config.programId, ctx.game).toBase58() || game.p3d_wallet !== holder.vault) throw new Error('Keeper game, holder mint or WSOL configuration mismatch.');
  if (ctx.config.cluster === 'mainnet-beta') validateMainnetGameConfiguration(game, holder, ctx.config.expectedAuthorities);
  let round = null;
  if (game.round_id > 0n) {
    // Read the selected round and its Clock in one bank. A later round read
    // paired with an older Clock could shorten the celebration below 8 seconds.
    const synced = await ctx.connection.getMultipleAccountsInfoAndContext([ctx.game, sdk.roundAddress(ctx.config.programId, game.round_id, ctx.config.gameVersion), SYSVAR_CLOCK_PUBKEY], { commitment, minContextSlot: result.context.slot });
    if (!Number.isSafeInteger(synced.context?.slot) || synced.context.slot < result.context.slot || !synced.value[0]?.owner.equals(sdk.pk(ctx.config.programId))) throw new Error('Keeper round read returned a stale or invalid bank.');
    const syncedGame = sdk.decodeGame(synced.value[0].data); if (syncedGame.round_id !== game.round_id) throw new Error('Keeper round changed during refresh; retry without broadcasting.');
    game = syncedGame; slot = synced.context.slot; clockAccount = synced.value[2]; const info = synced.value[1];
    if (!info?.owner.equals(sdk.pk(ctx.config.programId))) throw new Error('Keeper round account owner mismatch.');
    round = sdk.decodeRound(info.data); if (round.round_id !== game.round_id) throw new Error('Keeper round address mismatch.');
  }
  if (!clockAccount || !clockAccount.owner.equals(sdk.pk('Sysvar1111111111111111111111111111111111111')) || clockAccount.data.length < 40) throw new Error('Keeper requires the canonical on-chain Clock.');
  const chainTime = Number(Buffer.from(clockAccount.data).readBigInt64LE(32));
  if (!Number.isSafeInteger(chainTime) || chainTime < 1) throw new Error('Keeper Clock timestamp is invalid.');
  return { game, holder, round, chainTime, slot };
}

async function openingSnapshot(ctx) {
  // Publisher journals include every wallet proof. Verify once per process,
  // then use the immutable S0 identity already pinned in the private journal.
  if (ctx.verifiedOpening) return ctx.verifiedOpening;
  const publisher = JSON.parse(await fs.readFile(ctx.config.publisherStateFile, 'utf8')); assertPublicationDomain(publisher, ctx.domain);
  if (!ctx.config.localTest && (publisher.activation !== 'active' || !Number.isSafeInteger(publisher.preGameAbsenceSlot))) throw new Error('Public keeper requires an active publisher journal prepared before game creation.');
  const snapshot = publisher.plans?.[0]?.openingSnapshot ?? publisher.openingSnapshot;
  if (!snapshot || !Array.isArray(snapshot.balances) || new Set(snapshot.balances.map(([wallet]) => wallet)).size !== snapshot.balances.length || !ctx.config.localTest && publisher.preGameAbsenceSlot < snapshot.slot) throw new Error('Keeper requires a durable pre-launch opening holder snapshot.');
  const validated = eligibleOpeningSnapshot({ ...snapshot, balances: new Map(snapshot.balances) }, { excludedWallets: snapshot.excludedWallets ?? [], excludeOffCurve: true });
  if (snapshot.policy !== validated.policy || snapshot.mint !== ctx.config.piggyMint || snapshot.totalEligibleBalance !== validated.totalEligibleBalance || JSON.stringify(snapshot.balances) !== JSON.stringify(validated.balances)) throw new Error('Keeper opening holder snapshot is invalid.');
  ctx.minContextSlot = Math.max(ctx.minContextSlot, snapshot.slot, publisher.preGameAbsenceSlot ?? 0, publisher.minContextSlot ?? 0);
  ctx.verifiedOpening = { slot: snapshot.slot, hash: hash(snapshot) };
  return ctx.verifiedOpening;
}

export function keeperDecision(current, stored, celebrationSeconds = 8, { settleOnly = false } = {}) {
  if (current.game.round_id === 0n) return settleOnly ? { action: 'quiescent', roundId: 0n, reason: 'no-round' } : { action: 'start', roundId: 1n };
  if (settleOnly && current.round.ended) return { action: 'legacy-settled', roundId: current.game.round_id };
  if (!stored.activation) throw new Error('Existing public rounds require the verified keeper activation journal. Restore its backup.');
  if (!current.round.ended) return current.chainTime >= Number(current.round.end_time) ? { action: 'settle', roundId: current.game.round_id } : { action: 'wait', reason: 'countdown', seconds: Number(current.round.end_time) - current.chainTime };
  if (stored.observedEnded?.roundId !== current.game.round_id.toString()) return { action: 'observe-ended', roundId: current.game.round_id };
  const left = stored.observedEnded.chainTime + celebrationSeconds - current.chainTime;
  return left > 0 ? { action: 'wait', reason: 'celebration', seconds: left } : { action: 'start', roundId: current.game.round_id + 1n };
}

export function keeperSpending(stored, chainTime) {
  return stored.transactions.filter(row => row.status !== 'expired' && chainTime - row.chainTime <= 86_400).reduce((total, row) => ({ fees: total.fees + row.feeLamports, rent: total.rent + (row.status === 'failed' ? 0 : row.rentLamports) }), { fees: 0, rent: 0 });
}
export async function reconcileKeeper(ctx, stored) {
  if (!stored.pending) return false;
  const pending = stored.pending, status = (await ctx.connection.getSignatureStatuses([pending.signature], { searchTransactionHistory: true })).value[0];
  if (status?.confirmationStatus === 'finalized') {
    const record = stored.transactions.find(row => row.signature === pending.signature); if (!record) throw new Error('Keeper pending transaction is missing its spending reservation.');
    record.status = status.err ? 'failed' : 'confirmed'; record.error = status.err ?? null;
    ctx.minContextSlot = Math.max(ctx.minContextSlot, status.slot); stored.pending = null; await save(ctx, stored); return true;
  }
  if (!status && await ctx.connection.getBlockHeight('finalized') > pending.lastValidBlockHeight) {
    const record = stored.transactions.find(row => row.signature === pending.signature); if (!record) throw new Error('Keeper pending reservation is missing.');
    record.status = 'expired'; stored.pending = null; await save(ctx, stored); return true;
  }
  return false;
}

async function keeperKey(ctx, current, { allowMainnet = false } = {}) {
  if (ctx.config.cluster === 'mainnet-beta' && (!allowMainnet || ctx.config.mainnetEnabled !== true)) throw new Error('Mainnet keeper needs mainnetEnabled and explicit --allow-mainnet.');
  const stat = await fs.stat(ctx.config.keeperKeypair); if ((stat.mode & 0o077) !== 0) throw new Error('Keeper keypair requires mode 0600 or stricter.');
  const key = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(await fs.readFile(ctx.config.keeperKeypair, 'utf8'))));
  if (key.publicKey.toBase58() !== ctx.config.keeperPublicKey) throw new Error('Keeper signing key does not match its reviewed public role.');
  if ([current.game.game_creator, current.holder.publisher, ctx.config.programId, ctx.config.piggyMint, ...Object.values(ctx.config.expectedAuthorities ?? {})].includes(key.publicKey.toBase58())) throw new Error('Keeper signing role must be separate from program, mint, treasury and authorities.');
  return key;
}

export const verifyKeeperProgram = verifyOperatorProgram;

async function submit(ctx, stored, current, decision, key) {
  if (ctx.config.settleOnly && decision.action !== 'settle') throw new Error('Settle-only keeper cannot start or roll over rounds.');
  await verifyKeeperProgram(ctx, Math.max(ctx.minContextSlot, current.slot));
  const ix = decision.action === 'settle' ? sdk.endRoundInstruction({ programId: ctx.config.programId, version: ctx.config.gameVersion, roundId: decision.roundId, winner: current.round.lead_player_pk === ZERO ? undefined : current.round.lead_player_pk }) : sdk.initializeRoundInstruction({ programId: ctx.config.programId, payer: key.publicKey, version: ctx.config.gameVersion, roundId: decision.roundId });
  const rentLamports = decision.action === 'start' ? await ctx.connection.getMinimumBalanceForRentExemption(403, 'confirmed') + await ctx.connection.getMinimumBalanceForRentExemption(165, 'confirmed') : 0;
  const latest = await ctx.connection.getLatestBlockhashAndContext({ commitment: 'confirmed', minContextSlot: Math.max(ctx.minContextSlot, current.slot) });
  const build = units => new Transaction({ ...latest.value, feePayer: key.publicKey }).add(ComputeBudgetProgram.setComputeUnitLimit({ units }), ...(ctx.config.priorityFeeMicroLamports ? [ComputeBudgetProgram.setComputeUnitPrice({ microLamports: ctx.config.priorityFeeMicroLamports })] : []), ix);
  const probe = build(1_400_000); probe.sign(key);
  const simulation = await ctx.connection.simulateTransaction(new VersionedTransaction(probe.compileMessage()), { commitment: 'confirmed', sigVerify: false, minContextSlot: Math.max(ctx.minContextSlot, current.slot) });
  if (simulation.value.err) throw new Error(`Keeper simulation rejected ${decision.action}: ${JSON.stringify(simulation.value.err)}`);
  const used = simulation.value.unitsConsumed; if (!Number.isSafeInteger(used) || used < 1 || used > 1_400_000) throw new Error('Keeper simulation did not provide a valid compute estimate.');
  const tx = build(Math.min(1_400_000, Math.ceil(used * 1.2) + 5_000)); tx.sign(key);
  const feeLamports = (await ctx.connection.getFeeForMessage(tx.compileMessage(), 'confirmed')).value;
  if (!Number.isSafeInteger(feeLamports) || feeLamports < 1 || feeLamports > ctx.config.maxFeeLamportsPerTransaction) throw new Error('Keeper fee estimate exceeds its transaction budget.');
  const spent = keeperSpending(stored, current.chainTime);
  if (spent.fees + feeLamports > ctx.config.maxDailyFeeLamports || spent.rent + rentLamports > ctx.config.maxDailyRentLamports) throw new Error('Keeper rolling 24-hour fee or rent budget is exhausted.');
  if (await ctx.connection.getBalance(key.publicKey, 'confirmed') < feeLamports + rentLamports + ctx.config.minBalanceLamports) throw new Error('Keeper needs more SOL for fees, round rent and its balance reserve.');
  if (await ctx.connection.getGenesisHash() !== ctx.config.genesisHash) throw new Error('Keeper network changed before broadcast.');
  await verifyKeeperProgram(ctx, Math.max(ctx.minContextSlot, current.slot));
  const signature = base58Encode(tx.signature), record = { signature, action: decision.action, roundId: decision.roundId.toString(), chainTime: current.chainTime, feeLamports, rentLamports, status: 'pending' };
  stored.transactions.push(record); stored.pending = { ...record, blockhash: latest.value.blockhash, lastValidBlockHeight: latest.value.lastValidBlockHeight };
  await save(ctx, stored); // Reserve costs and identity BEFORE any broadcast.
  try {
    const returned = await ctx.connection.sendRawTransaction(tx.serialize(), { skipPreflight: false, preflightCommitment: 'confirmed', maxRetries: 0, minContextSlot: Math.max(ctx.minContextSlot, current.slot) });
    if (returned !== signature) throw new Error('RPC returned a different keeper signature.');
    return { ...record, status: 'submitted' };
  } catch (error) { return { status: 'pending-reconciliation', signature, warning: error.message }; }
}

function legacyMaintenance(stored, configuredTarget) {
  const value = stored.legacyMaintenance;
  if (!value) return null;
  if (!/^(0|[1-9]\d*)$/.test(value.targetRoundId) || BigInt(value.targetRoundId) > U64_MAX || !Number.isSafeInteger(value.pinnedSlot) || value.pinnedSlot < 1) throw new Error('Invalid settle-only keeper journal target.');
  if (configuredTarget !== undefined && value.targetRoundId !== configuredTarget) throw new Error('Configured settle-only round differs from the pinned keeper journal target.');
  const done = value.terminal;
  if (done && (!['legacy-settled','quiescent'].includes(done.status) || done.roundId !== value.targetRoundId || !Number.isSafeInteger(done.finalizedSlot) || done.finalizedSlot < value.pinnedSlot || !Number.isSafeInteger(done.chainTime) || done.chainTime < 1 || (done.status === 'quiescent') !== (value.targetRoundId === '0'))) throw new Error('Invalid settle-only keeper terminal receipt.');
  return value;
}

async function readLegacyTarget(ctx, current, target) {
  if (target === 0n || current.game.round_id === target) return current;
  if (current.game.round_id < target) throw new Error('Keeper finalized round predates its pinned legacy target.');
  // Somebody else may have settled and advanced the game while we were offline.
  // Prove the pinned round ended; never adopt the later active round.
  const result = await ctx.connection.getMultipleAccountsInfoAndContext([sdk.roundAddress(ctx.config.programId, target, ctx.config.gameVersion), SYSVAR_CLOCK_PUBKEY], { commitment: 'finalized', minContextSlot: Math.max(ctx.minContextSlot, current.slot) });
  const [info, clock] = result.value ?? [];
  if (!Number.isSafeInteger(result.context?.slot) || result.context.slot < Math.max(ctx.minContextSlot, current.slot) || !info?.owner.equals(sdk.pk(ctx.config.programId)) || !clock?.owner.equals(sdk.pk('Sysvar1111111111111111111111111111111111111')) || clock.data.length < 40) throw new Error('Keeper cannot verify its finalized legacy round.');
  const round = sdk.decodeRound(info.data), chainTime = Number(Buffer.from(clock.data).readBigInt64LE(32));
  if (round.round_id !== target || !round.ended || !Number.isSafeInteger(chainTime) || chainTime < 1) throw new Error('Keeper pinned legacy round has no finalized end.');
  return { ...current, game: { ...current.game, round_id: target }, round, chainTime, slot: result.context.slot };
}

async function settleOnlyTick(ctx, stored, opening, observed, options) {
  let legacy = legacyMaintenance(stored, ctx.config.settleOnlyRoundId);
  if (!legacy) {
    const target = ctx.config.settleOnlyRoundId === undefined ? observed.game.round_id : BigInt(ctx.config.settleOnlyRoundId);
    if (target > observed.game.round_id) throw new Error('Settle-only keeper cannot pin a future round.');
    legacy = stored.legacyMaintenance = { targetRoundId: target.toString(), pinnedSlot: observed.slot, terminal: null };
    ctx.minContextSlot = Math.max(ctx.minContextSlot, observed.slot); await save(ctx, stored);
  }
  if (legacy.terminal) return { ...legacy.terminal, settleOnly: true };
  const current = await readLegacyTarget(ctx, observed, BigInt(legacy.targetRoundId));
  const decision = BigInt(legacy.targetRoundId) === 0n ? { action: 'quiescent', roundId: 0n, reason: 'no-round' } : keeperDecision(current, stored, ctx.config.celebrationSeconds, { settleOnly: true });
  if (['quiescent','legacy-settled'].includes(decision.action)) {
    legacy.terminal = { status: decision.action, roundId: legacy.targetRoundId, chainTime: current.chainTime, finalizedSlot: current.slot };
    ctx.minContextSlot = Math.max(ctx.minContextSlot, current.slot); await save(ctx, stored);
    return { ...legacy.terminal, settleOnly: true };
  }
  if (stored.activation.snapshotSlot !== opening.slot || stored.activation.snapshotHash !== opening.hash) throw new Error('Keeper activation snapshot changed. Restore verified history.');
  if (decision.action === 'wait') return { status: 'waiting', ...decision, settleOnly: true, roundId: legacy.targetRoundId };
  const key = await keeperKey(ctx, current, options);
  return submit(ctx, stored, current, decision, key);
}

export async function keeperStatus(ctx) {
  if (ctx.config.settleOnly) {
    const stored = await journal(ctx), legacy = legacyMaintenance(stored, ctx.config.settleOnlyRoundId);
    if (legacy?.terminal) return { ...legacy.terminal, settleOnly: true };
    const opening = await openingSnapshot(ctx), observed = await readKeeperState(ctx), target = legacy?.targetRoundId ?? ctx.config.settleOnlyRoundId;
    if (target !== undefined && BigInt(target) > observed.game.round_id) throw new Error('Settle-only keeper cannot pin a future round.');
    const current = target === undefined ? observed : await readLegacyTarget(ctx, observed, BigInt(target));
    const decision = target === '0' ? { action: 'quiescent', roundId: 0n, reason: 'no-round' } : keeperDecision(current, stored, ctx.config.celebrationSeconds, { settleOnly: true });
    return { status: stored.pending ? 'pending-reconciliation' : ['quiescent','legacy-settled'].includes(decision.action) ? decision.action : 'ready', settleOnly: true, cluster: ctx.config.cluster, keeper: ctx.config.keeperPublicKey, roundId: (legacy?.targetRoundId ?? current.game.round_id.toString()), chainTime: current.chainTime, finalizedSlot: current.slot, snapshotSlot: opening.slot, activated: !!stored.activation, pending: stored.pending?.signature ?? null, spending: keeperSpending(stored, current.chainTime), decision };
  }
  const stored = await journal(ctx), opening = await openingSnapshot(ctx), current = await readKeeperState(ctx);
  return { status: stored.pending ? 'pending-reconciliation' : 'ready', cluster: ctx.config.cluster, keeper: ctx.config.keeperPublicKey, roundId: current.game.round_id.toString(), chainTime: current.chainTime, snapshotSlot: opening.slot, activated: !!stored.activation, pending: stored.pending?.signature ?? null, spending: keeperSpending(stored, current.chainTime), decision: keeperDecision(current, stored, ctx.config.celebrationSeconds) };
}
export async function keeperTick(ctx, options = {}) {
  const stored = await journal(ctx); await reconcileKeeper(ctx, stored);
  if (stored.pending) return { status: 'pending-reconciliation', signature: stored.pending.signature };
  if (ctx.config.settleOnly && legacyMaintenance(stored, ctx.config.settleOnlyRoundId)?.terminal) return { ...stored.legacyMaintenance.terminal, settleOnly: true };
  const opening = await openingSnapshot(ctx), current = await readKeeperState(ctx);
  if (ctx.config.settleOnly) return settleOnlyTick(ctx, stored, opening, current, options);
  const key = await keeperKey(ctx, current, options);
  if (stored.activation && (stored.activation.snapshotSlot !== opening.slot || stored.activation.snapshotHash !== opening.hash)) throw new Error('Keeper activation snapshot changed. Restore verified history.');
  if (!stored.activation) {
    if (current.game.round_id !== 0n) throw new Error('Keeper cannot adopt an existing public round without its activation journal.');
    stored.activation = { snapshotSlot: opening.slot, snapshotHash: opening.hash, chainTime: current.chainTime, slot: current.slot }; await save(ctx, stored);
  }
  const decision = keeperDecision(current, stored, ctx.config.celebrationSeconds);
  if (decision.action === 'observe-ended') { stored.observedEnded = { roundId: decision.roundId.toString(), chainTime: current.chainTime }; await save(ctx, stored); return { status: 'celebration', seconds: ctx.config.celebrationSeconds, roundId: decision.roundId.toString() }; }
  if (decision.action === 'wait') return { status: 'waiting', ...decision };
  return submit(ctx, stored, current, decision, key);
}

async function main() {
  const args = process.argv.slice(2), command = args[0], i = args.indexOf('--config');
  if (!['status', 'tick', 'watch'].includes(command) || i < 0 || !args[i + 1]) throw new Error('Usage: node scripts/round-keeper.mjs <status|tick|watch> --config PRIVATE.json [--allow-mainnet]');
  const ctx = await loadKeeper(args[i + 1]), options = { allowMainnet: args.includes('--allow-mainnet') };
  const shutdown = new AbortController(), stop = () => shutdown.abort();
  if (command === 'watch') { process.once('SIGINT', stop); process.once('SIGTERM', stop); }
  try {
    await withKeeperLock(ctx.config.workspace, async () => {
      if (command === 'status') { console.log(sdk.serializeChain(await keeperStatus(ctx))); return; }
      do {
        // Finish any in-flight transaction journal before releasing the operator lock.
        try { console.log(sdk.serializeChain(await keeperTick(ctx, options))); } catch (error) { if (command !== 'watch') throw error; console.error(error.message); }
        if (command !== 'watch' || shutdown.signal.aborted) break;
        try { await delay(ctx.config.pollSeconds * 1_000, undefined, { signal: shutdown.signal }); }
        catch (error) { if (error.name !== 'AbortError') throw error; }
      } while (!shutdown.signal.aborted);
    });
  } finally {
    process.removeListener('SIGINT', stop); process.removeListener('SIGTERM', stop);
  }
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main().catch(error => { console.error(error.message); process.exitCode = 1; });
