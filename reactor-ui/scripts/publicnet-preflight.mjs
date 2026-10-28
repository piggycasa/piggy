/** Read-only on every cluster, including mainnet. A reachable RPC is not a launch approval. */
import fs from 'node:fs/promises';
import path from 'node:path';
import { PublicKey } from '@solana/web3.js';
import { getMint, getAccount, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';
import * as sdk from '../src/solana-instructions.mjs';
import { validatePublicConfig } from '../src/solana-config.mjs';
import { validatePublishedEpochIndex, requireMainnetAuthorities, validateMainnetGameConfiguration, requireActivatedGame } from './publicnet-validation.mjs';
import { CLUSTERS, PUBLICNET, UPGRADEABLE_LOADER, options, publicRpc, rpc, rpcConnection, assertGenesis, verifiedArtifact, sha256, writeJson, safeError } from './publicnet-common.mjs';

const opts = options(), cluster = opts.cluster, suppliedConfig = opts.config ? JSON.parse(await fs.readFile(path.resolve(opts.config), 'utf8')) : null;
const url = publicRpc(cluster, opts.rpc || process.env.PIGGY_RPC_URL || suppliedConfig?.rpcUrl);
const output = path.resolve(opts.output || path.join(PUBLICNET, cluster, 'preflight-report.json'));
const report = { schemaVersion: 1, cluster, checkedAt: new Date().toISOString(), readOnly: true, rpcOrigin: new URL(url).origin, networkReady: false, launchReady: false, checks: [], blockers: [] };
async function check(name, fn) { try { const details = await fn(); report.checks.push({ name, ok: true, details }); return details; } catch (error) { const detail = safeError(error, url); report.checks.push({ name, ok: false, error: detail }); report.blockers.push(`${name}: ${detail}`); return null; } }
const network = await check('cluster identity and live blockhash', async () => {
  const genesisHash = await rpc(url, 'getGenesisHash'); assertGenesis(cluster, genesisHash);
  const version = await rpc(url, 'getVersion'), slot = await rpc(url, 'getSlot', [{ commitment: 'confirmed' }]);
  const blockhash = await rpc(url, 'getLatestBlockhash', [{ commitment: 'confirmed' }]);
  return { genesisHash, version, slot, blockhash: blockhash.value.blockhash, lastValidBlockHeight: blockhash.value.lastValidBlockHeight };
});
report.networkReady = !!network;
let binary = null;
const manifest = path.resolve(opts.manifest || path.join(PUBLICNET, 'build/manifest.json'));
await check('feature-free source and binary provenance', () => verifiedArtifact(manifest).then(value => {
  binary = value; return { binarySha256: value.manifest.binarySha256, binaryBytes: value.binary.length, sourceSha256: value.manifest.sourceSha256, lotteryPolicy: value.manifest.lotteryPolicy };
}));
// Retain the verified bytes separately; the report contains only public evidence.
if (network && binary) await check('deployment rent estimate', async () => {
  const bytes = binary.binary.length;
  const [program, programData, buffer] = await Promise.all([36, bytes + 45, bytes + 37].map(n => rpc(url, 'getMinimumBalanceForRentExemption', [n])));
  return { binaryBytes: bytes, programLamports: program, programDataLamports: programData, bufferLamports: buffer, finalRentLamports: program + programData, peakRentLamports: program + programData + buffer, note: 'Rent estimate excludes transaction and priority fees, game state, mint and holder epoch accounts. Buffer rent is ordinarily recovered by successful deployment.' };
});
if (!suppliedConfig) report.blockers.push('No reviewed public client configuration supplied (--config). Program, mint, game, proof service and holder vault are unverified.');
if (cluster === 'mainnet-beta') await check('production RPC', async () => {
  if (['api.mainnet-beta.solana.com', 'api.mainnet.solana.com'].includes(new URL(url).hostname)) throw new Error('Shared Solana public RPC cannot be the production transaction endpoint. Configure a dedicated RPC.');
  return { rpcOrigin: new URL(url).origin, note: 'Provider capacity, allowed origins and quota still require an operator check.' };
});
if (suppliedConfig && network) {
  const c = suppliedConfig, conn = rpcConnection(url);
  let expectedAuthorities;
  const configOk = await check('reviewed cluster configuration', async () => {
    validatePublicConfig(c);
    if (c.cluster !== cluster || c.genesisHash !== CLUSTERS[cluster].genesisHash) throw new Error('Config cluster does not match the requested network.');
    const proof = new URL(c.proofIndexUrl);
    if (cluster === 'mainnet-beta') expectedAuthorities = requireMainnetAuthorities(c);
    return { programId: c.programId, gameVersion: String(c.gameVersion), piggyMint: c.piggyMint, proofIndexOrigin: proof.origin };
  });
  if (configOk) {
    await check('deployed program byte-for-byte verification', async () => {
      if (!binary) throw new Error('Verified local public build is required for an on-chain comparison.');
      const program = await conn.getAccountInfo(new PublicKey(c.programId), 'confirmed');
      if (!program?.executable || program.owner.toBase58() !== UPGRADEABLE_LOADER || program.data.readUInt32LE(0) !== 2) throw new Error('Expected an executable upgradeable-loader program.');
      const programDataAddress = new PublicKey(program.data.subarray(4, 36));
      const data = await conn.getAccountInfo(programDataAddress, 'confirmed');
      if (!data || data.owner.toBase58() !== UPGRADEABLE_LOADER || data.data.readUInt32LE(0) !== 3) throw new Error('ProgramData is missing or has the wrong owner.');
      const bytes = data.data.subarray(45, 45 + binary.binary.length);
      if (!bytes.equals(binary.binary) || data.data.subarray(45 + binary.binary.length).some(byte => byte !== 0)) throw new Error('On-chain executable differs from the recorded feature-free binary.');
      const authority = data.data[12] ? new PublicKey(data.data.subarray(13, 45)).toBase58() : null;
      if (cluster === 'mainnet-beta' && authority !== expectedAuthorities.upgradeAuthority || c.upgradeAuthority && c.upgradeAuthority !== authority) throw new Error('Upgrade authority differs from reviewed configuration.');
      return { binarySha256: sha256(bytes), programData: programDataAddress.toBase58(), deployedSlot: data.data.readBigUInt64LE(4).toString(), upgradeAuthority: authority };
    });
    await check('game, mint and funded holder reserve', async () => {
      const gameAddress = sdk.gameAddress(c.programId, c.gameVersion), holderAddress = sdk.holderConfigAddress(c.programId, gameAddress);
      const [gameAccount, holderAccount] = await conn.getMultipleAccountsInfo([gameAddress, holderAddress], 'confirmed');
      if (!gameAccount || !holderAccount || !gameAccount.owner.equals(new PublicKey(c.programId)) || !holderAccount.owner.equals(new PublicKey(c.programId))) throw new Error('Game or holder configuration missing or owned by the wrong program.');
      const game = sdk.decodeGame(gameAccount.data), holder = sdk.decodeHolderConfig(holderAccount.data);
      if (game.version !== BigInt(c.gameVersion) || game.mint !== sdk.NATIVE_MINT.toBase58() || holder.game !== gameAddress.toBase58() || holder.eligibility_mint !== c.piggyMint || holder.payment_mint !== sdk.NATIVE_MINT.toBase58()) throw new Error('Game payment mint or holder eligibility configuration mismatches.');
      if (game.p3d_wallet !== holder.vault) throw new Error('Original P3D fee destination is not the holder vault.');
      if (holder.vault !== sdk.holderVaultAddress(c.programId, gameAddress).toBase58() || holder.total_published < holder.total_claimed || holder.total_published - holder.total_claimed !== holder.reserved_amount) throw new Error('Canonical holder vault or published/claimed/reserved accounting does not reconcile.');
      if (cluster === 'mainnet-beta') {
        validateMainnetGameConfiguration(game, holder, expectedAuthorities);
        const community = await getAccount(conn, new PublicKey(game.community_wallet), 'confirmed');
        if (community.mint.toBase58() !== sdk.NATIVE_MINT.toBase58() || community.owner.toBase58() !== expectedAuthorities.communityTreasury) throw new Error('Mainnet community token-account mint or owner differs from the reviewed treasury.');
      }
      const mintInfo = await conn.getAccountInfo(new PublicKey(c.piggyMint), 'confirmed');
      if (!mintInfo || !mintInfo.owner.equals(sdk.TOKEN_PROGRAM_ID) && !mintInfo.owner.equals(TOKEN_2022_PROGRAM_ID)) throw new Error('Eligibility mint must belong to SPL Token or Token-2022.');
      const [mint, vault] = await Promise.all([getMint(conn, new PublicKey(c.piggyMint), 'confirmed', mintInfo.owner), getAccount(conn, new PublicKey(holder.vault), 'confirmed')]);
      if (vault.mint.toBase58() !== sdk.NATIVE_MINT.toBase58() || vault.owner.toBase58() !== holderAddress.toBase58() || vault.amount < holder.reserved_amount) throw new Error('Holder vault owner, mint or reserved-fund conservation failed.');
      requireActivatedGame(game);
      const round = await conn.getAccountInfo(sdk.roundAddress(c.programId, game.round_id, c.gameVersion), 'confirmed');
      if (!round?.owner.equals(new PublicKey(c.programId))) throw new Error('Current round is uninitialized.');
      const r = sdk.decodeRound(round.data);
      return { game: gameAddress.toBase58(), gameCreator: game.game_creator, communityTokenAccount: game.community_wallet, expectedAuthorities, round: game.round_id.toString(), roundEnded: r.ended, initialSeconds: game.round_init_time.toString(), secondsPerShare: game.round_inc_time_per_key.toString(), maxSeconds: game.round_max_time.toString(), holderPublisher: holder.publisher, vault: holder.vault, vaultLamports: vault.amount.toString(), reservedLamports: holder.reserved_amount.toString(), eligibilitySupply: mint.supply.toString(), eligibilityTokenProgram: mintInfo.owner.toBase58(), mintDecimals: mint.decimals, mintAuthority: mint.mintAuthority?.toBase58() || null, freezeAuthority: mint.freezeAuthority?.toBase58() || null };
    });
    await check('public proof index availability and cluster binding', async () => {
      const response = await fetch(c.proofIndexUrl, { signal: AbortSignal.timeout(15_000) });
      if (!response.ok) throw new Error(`Proof index returned HTTP ${response.status}.`);
      const proof = await response.json();
      if (proof.schemaVersion !== 1 || proof.cluster !== cluster || proof.genesisHash !== c.genesisHash || proof.programId !== c.programId || String(proof.gameVersion) !== String(c.gameVersion) || proof.piggyMint !== c.piggyMint || !Array.isArray(proof.epochs)) throw new Error('Proof index schema or deployment domain does not match client configuration.');
      const game = sdk.gameAddress(c.programId, c.gameVersion), holderAddress = sdk.holderConfigAddress(c.programId, game), holderInfo = await conn.getAccountInfo(holderAddress, 'confirmed');
      if (!holderInfo?.owner.equals(new PublicKey(c.programId))) throw new Error('Holder state is missing.');
      const holder = sdk.decodeHolderConfig(holderInfo.data);
      const validatedEntries = validatePublishedEpochIndex(proof.epochs, holder.next_epoch);
      let total = 0n;
      for (let offset = 0; offset < validatedEntries.length; offset += 100) {
        const entries = validatedEntries.slice(offset, offset + 100), addresses = entries.map(entry => sdk.holderEpochAddress(c.programId, holderAddress, entry.epoch));
        const accounts = await conn.getMultipleAccountsInfo(addresses, 'confirmed');
        for (let i = 0; i < entries.length; i++) {
          const entry = entries[i], epoch = String(entry.epoch), info = accounts[i];
          if (!info?.owner.equals(new PublicKey(c.programId))) throw new Error('Proof index references a missing or invalid on-chain epoch.');
          const onchain = sdk.decodeHolderEpoch(info.data);
          if (onchain.config !== holderAddress.toBase58() || onchain.game !== game.toBase58() || onchain.epoch !== BigInt(epoch) || onchain.merkle_root !== entry.root || onchain.snapshot_slot !== BigInt(entry.snapshotSlot) || onchain.total_amount !== BigInt(entry.totalAmount)) throw new Error('Published proof index root or funding metadata differs from the on-chain epoch.');
          total += onchain.total_amount;
        }
      }
      if (total !== holder.total_published) throw new Error('Proof index total does not reconcile with published holder funds.');
      return { epochs: proof.epochs.length, totalPublishedLamports: total.toString(), note: 'Epoch roots and funding metadata match on chain. Each wallet claim is independently verified against its epoch by the wallet client.' };
    });
  }
}
// Passing read-only deployment checks alone must never advertise a tested launch.
if (binary) {
  for (const testedCluster of cluster === 'mainnet-beta' ? ['devnet', 'testnet'] : [cluster]) await check(`${testedCluster} funded release rehearsal`, async () => {
    const filename = path.resolve(opts[`${testedCluster}-report`] || path.join(PUBLICNET, testedCluster, 'rehearsal-report.json'));
    let rehearsal; try { rehearsal = JSON.parse(await fs.readFile(filename, 'utf8')); } catch { throw new Error('No funded public rehearsal report exists for this release.'); }
    if (rehearsal.ok !== true || rehearsal.cluster !== testedCluster || rehearsal.genesisHash !== CLUSTERS[testedCluster].genesisHash || rehearsal.binarySha256 !== binary.manifest.binarySha256 || rehearsal.sourceSha256 !== binary.manifest.sourceSha256 || !rehearsal.transactions?.length || rehearsal.transactions.some(tx => !['confirmed', 'finalized'].includes(tx.status))) throw new Error('Public rehearsal has not completed successfully against this exact release.');
    return { transactions: rehearsal.transactions.length, checks: rehearsal.checks.length, binarySha256: rehearsal.binarySha256 };
  });
}
if (cluster === 'mainnet-beta' && suppliedConfig && network) await check('real mainnet canary receipts', async () => {
  const filename = path.resolve(opts['mainnet-canary-report'] || path.join(PUBLICNET, cluster, 'mainnet-canary-report.json'));
  let canary; try { canary = JSON.parse(await fs.readFile(filename, 'utf8')); } catch { throw new Error('No actual mainnet feed, game-claim and holder-claim receipts have been supplied. A dry run is insufficient.'); }
  if (!binary || canary.schemaVersion !== 1 || canary.cluster !== cluster || canary.genesisHash !== CLUSTERS[cluster].genesisHash || canary.programId !== suppliedConfig.programId || String(canary.gameVersion) !== String(suppliedConfig.gameVersion) || canary.binarySha256 !== binary.manifest.binarySha256) throw new Error('Mainnet canary receipt domain does not match this deployment and artifact.');
  const conn = rpcConnection(url), game = sdk.gameAddress(suppliedConfig.programId, suppliedConfig.gameVersion);
  const verified = [];
  for (const [kind, tag] of [['feed', 11], ['gameClaim', 3], ['holderClaim', 9]]) {
    const receipt = canary.transactions?.find(tx => tx.kind === kind); if (!receipt?.signature) throw new Error(`Actual mainnet ${kind} receipt is missing.`);
    const tx = await conn.getTransaction(receipt.signature, { commitment: 'confirmed', maxSupportedTransactionVersion: 0 });
    if (!tx || !tx.meta || tx.meta.err) throw new Error(`Mainnet ${kind} is missing or failed.`);
    const message = tx.transaction.message, keys = message.getAccountKeys({ accountKeysFromLookups: tx.meta.loadedAddresses });
    const matching = message.compiledInstructions.some(ix => keys.get(ix.programIdIndex)?.toBase58() === suppliedConfig.programId && ix.data[0] === tag && ix.accountKeyIndexes.some(index => keys.get(index)?.equals(game)));
    if (!matching) throw new Error(`Mainnet ${kind} receipt does not invoke the expected instruction and game.`);
    verified.push({ kind, signature: receipt.signature, slot: tx.slot });
  }
  return verified;
});
report.launchReady = report.blockers.length === 0;
await writeJson(output, report);
console.log(JSON.stringify({ cluster, readOnly: true, networkReady: report.networkReady, launchReady: report.launchReady, checks: report.checks.length, blockers: report.blockers, report: output }));
if (!report.launchReady) process.exitCode = 1;
