/** Reviewable game initialization packets. This module never signs or broadcasts. */
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { PublicKey, Transaction, ComputeBudgetProgram } from '@solana/web3.js';
import { createAssociatedTokenAccountIdempotentInstruction, getAssociatedTokenAddressSync, unpackMint, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';
import * as sdk from '../src/solana-instructions.mjs';
import { ROOT, PUBLICNET, CLUSTERS, options, publicRpc, rpc, assertGenesis, verifiedArtifact, writeJson, safeError, UPGRADEABLE_LOADER } from './publicnet-common.mjs';
import { requireMainnetAuthorities, validatePreparedOpeningJournal } from './publicnet-validation.mjs';
import { publicationDomain, assertPublicationDomain } from '../src/holder-publication.mjs';

export function gameInitializationInstructions({ programId, gameVersion, piggyMint, gameCreator, communityTreasury, holderPublisher }) {
  const creator = new PublicKey(gameCreator), community = new PublicKey(communityTreasury), mint = new PublicKey(piggyMint);
  const version = BigInt(gameVersion); if (version < 1n || version >= 1n << 64n) throw new Error('A positive u64 game version is required.');
  const communityAta = getAssociatedTokenAddressSync(sdk.NATIVE_MINT, community), placeholderAta = getAssociatedTokenAddressSync(sdk.NATIVE_MINT, creator);
  return {
    addresses: { game: sdk.gameAddress(programId, version).toBase58(), round: sdk.roundAddress(programId, 1, version).toBase58(), pot: sdk.potAddress(programId, 1, version).toBase58(), holderConfig: sdk.holderConfigAddress(programId, sdk.gameAddress(programId, version)).toBase58(), holderVault: sdk.holderVaultAddress(programId, sdk.gameAddress(programId, version)).toBase58(), communityAta: communityAta.toBase58(), placeholderAta: placeholderAta.toBase58() },
    steps: [
      { name: 'Create canonical WSOL destination accounts', instructions: [createAssociatedTokenAccountIdempotentInstruction(creator, communityAta, community, sdk.NATIVE_MINT), createAssociatedTokenAccountIdempotentInstruction(creator, placeholderAta, creator, sdk.NATIVE_MINT)] },
      // S0 is prepared while this game PDA is absent. Leave round_id=0 so the
      // publisher can activate that journal before the keeper opens round 1.
      { name: 'Atomically initialize original-timing game and holder vault; keep first round closed', instructions: [sdk.initializeGameInstruction({ programId, creator, version, communityWallet: communityAta, p3dWallet: placeholderAta, initialSeconds: 3600, incrementSeconds: 30, maxSeconds: 86400 }), sdk.initializeHolderInstruction({ programId, creator, version, eligibilityMint: mint, publisher: holderPublisher })] },
    ],
  };
}

export async function prepareGameInitialization(argv = process.argv.slice(2)) {
  const opts = options(argv), cluster = opts.cluster;
  if (opts.deploy || opts.airdrop || opts.execute || opts.apply) throw new Error('Game initialization planning cannot execute, sign, deploy or broadcast.');
  let config;
  if (opts.config) config = JSON.parse(await fs.readFile(path.resolve(opts.config), 'utf8'));
  else {
    if (cluster !== 'mainnet-beta' || !opts['game-version']) throw new Error('Supply --config, or Mainnet --game-version with the isolated public role manifest.');
    const manifest = JSON.parse(await fs.readFile(path.join(ROOT, '.openai/local/mainnet/public-addresses.json'), 'utf8'));
    const role = name => manifest.keys.find(row => row.role === name)?.publicKey;
    config = { schemaVersion: 1, cluster, genesisHash: CLUSTERS[cluster].genesisHash, programId: role('program'), gameVersion: opts['game-version'], piggyMint: role('piggy-mint'), expectedAuthorities: { gameCreator: role('deployer'), communityTreasury: role('community-treasury'), holderPublisher: role('holder-publisher'), upgradeAuthority: role('upgrade-authority') } };
  }
  if (config.cluster !== cluster || config.genesisHash !== CLUSTERS[cluster].genesisHash) throw new Error('Initialization configuration does not match the requested public cluster.');
  const expected = requireMainnetAuthorities(config);
  const plan = gameInitializationInstructions({ ...config, ...expected });
  const url = publicRpc(cluster, opts.rpc || process.env.PIGGY_RPC_URL || config.rpcUrl);
  const output = path.resolve(opts.output || path.join(PUBLICNET, cluster, 'game-initialization-plan.json'));
  const report = { schemaVersion: 1, cluster, preparedAt: new Date().toISOString(), disabled: true, executionSupported: false, signed: false, broadcast: false, programId: config.programId, gameVersion: String(config.gameVersion), piggyMint: config.piggyMint, expectedAuthorities: expected, timing: { initialSeconds: 3600, secondsPerShare: 30, maxSeconds: 86400 }, paymentMint: sdk.NATIVE_MINT.toBase58(), activation: { requiredBeforeGameCreation: 'Durable finalized S0 with game absence proven at a bank at least as new as S0', initializedRoundId: '0', firstRoundCreated: false, requiredBeforeRound1: 'Publisher init activates the preserved pre-creation S0 journal and exports the public empty proof index', actionAfterPublisherActivation: 'A separate permissionless keeper tick creates round 1', enablePublicUiAfter: 'Confirmed round 1 initialization, release preflight and actual canaries' }, addresses: plan.addresses, checks: [], blockers: [], steps: [] };
  async function check(name, fn) { try { const details = await fn(); report.checks.push({ name, ok: true, details }); return details; } catch (error) { const message = safeError(error, url); report.checks.push({ name, ok: false, error: message }); report.blockers.push(name + ': ' + message); return null; } }
  let artifact;
  await check('reviewed public artifact', async () => { artifact = await verifiedArtifact(path.resolve(opts.manifest || path.join(PUBLICNET, 'build/manifest.json'))); return { binarySha256: artifact.manifest.binarySha256, sourceSha256: artifact.manifest.sourceSha256 }; });
  let opening;
  await check('finalized S0 prepared before game creation', async () => {
    if (!opts['publisher-config']) throw new Error('Prepare S0 before game creation and supply --publisher-config PRIVATE_OPERATOR.json.');
    const filename = path.resolve(opts['publisher-config']), operator = JSON.parse(await fs.readFile(filename, 'utf8'));
    const expectedDomain = publicationDomain(config); assertPublicationDomain(publicationDomain(operator), expectedDomain);
    const stateFile = path.join(path.resolve(path.dirname(filename), operator.workspace), 'state.json');
    const journal = JSON.parse(await fs.readFile(stateFile, 'utf8'));
    opening = { ...validatePreparedOpeningJournal(journal, expectedDomain), stateFile };
    report.preparedOpening = opening; return opening;
  });
  const network = await check('actual cluster and fresh blockhash', async () => { const genesis = await rpc(url, 'getGenesisHash'); assertGenesis(cluster, genesis); return rpc(url, 'getLatestBlockhash', [{ commitment: 'confirmed' }]); });
  if (network) {
    await check('deployed binary and reviewed upgrade authority', async () => {
      if (!artifact) throw new Error('Verified public build is required.');
      const account = (await rpc(url, 'getAccountInfo', [config.programId, { encoding: 'base64', commitment: 'confirmed' }])).value;
      if (!account?.executable || account.owner !== UPGRADEABLE_LOADER) throw new Error('Deploy and verify the reviewed game program before initialization.');
      const programData = new PublicKey(Buffer.from(account.data[0], 'base64').subarray(4, 36));
      const info = (await rpc(url, 'getAccountInfo', [programData.toBase58(), { encoding: 'base64', commitment: 'confirmed' }])).value;
      if (!info || info.owner !== UPGRADEABLE_LOADER) throw new Error('ProgramData is missing.');
      const data = Buffer.from(info.data[0], 'base64');
      if (data.readUInt32LE(0) !== 3 || !data.subarray(45, 45 + artifact.binary.length).equals(artifact.binary) || data.subarray(45 + artifact.binary.length).some(byte => byte)) throw new Error('Deployed executable differs from the reviewed artifact.');
      if (!data[12] || new PublicKey(data.subarray(13, 45)).toBase58() !== expected.upgradeAuthority) throw new Error('Deployed upgrade authority differs from the explicit reviewed role.');
      return { programData: programData.toBase58(), binarySha256: artifact.manifest.binarySha256, upgradeAuthority: expected.upgradeAuthority };
    });
    await check('actual eligibility mint exists and is initialized', async () => {
      const value = (await rpc(url, 'getAccountInfo', [config.piggyMint, { encoding: 'base64', commitment: 'confirmed' }])).value;
      if (!value) throw new Error('Create and verify the reviewed PIGGY mint before initializing holder eligibility.');
      const owner = new PublicKey(value.owner); if (!owner.equals(sdk.TOKEN_PROGRAM_ID) && !owner.equals(TOKEN_2022_PROGRAM_ID)) throw new Error('Eligibility mint has the wrong token program.');
      const mint = unpackMint(new PublicKey(config.piggyMint), { ...value, owner, data: Buffer.from(value.data[0], 'base64') }, owner);
      if (!mint.isInitialized) throw new Error('PIGGY mint is uninitialized.');
      return { tokenProgram: owner.toBase58(), supply: mint.supply.toString(), decimals: mint.decimals };
    });
    await check('initial game address is unused', async () => {
      const value = (await rpc(url, 'getAccountInfo', [plan.addresses.game, { encoding: 'base64', commitment: 'confirmed', ...(opening ? { minContextSlot: opening.preGameAbsenceSlot } : {}) }])).value;
      if (value && Buffer.from(value.data[0], 'base64').length) throw new Error('Game is already initialized. Reconcile its state and use deployment preflight instead of rerunning initialization.');
      return { game: plan.addresses.game };
    });
    await check('initialization rent and fee allowance', async () => {
      const allocations = [{ name: 'community ATA', bytes: 165 }, { name: 'temporary P3D destination ATA', bytes: 165 }, { name: 'game state', bytes: 169 }, { name: 'holder config', bytes: 201 }, { name: 'holder vault', bytes: 165 }];
      for (const row of allocations) row.rentLamports = await rpc(url, 'getMinimumBalanceForRentExemption', [row.bytes]);
      const rent = allocations.reduce((sum, row) => sum + row.rentLamports, 0), balance = (await rpc(url, 'getBalance', [expected.gameCreator, { commitment: 'confirmed' }])).value;
      report.funding = { allocations, maximumNewAccountRentLamports: rent, feeAllowanceLamports: 100_000, creatorBalanceLamports: balance };
      if (balance < rent + 100_000) throw new Error('Game creator needs the recorded account rent and transaction fee allowance.');
      return report.funding;
    });
  }
  const blockhash = network?.value.blockhash || PublicKey.default.toBase58();
  for (const step of plan.steps) {
    const tx = new Transaction({ feePayer: new PublicKey(expected.gameCreator), recentBlockhash: blockhash }).add(ComputeBudgetProgram.setComputeUnitLimit({ units: 1_300_000 }), ...step.instructions);
    const bytes = tx.serialize({ requireAllSignatures: false, verifySignatures: false });
    if (bytes.length > 1232) throw new Error('Initialization packet exceeds the Solana transaction limit.');
    report.steps.push({ name: step.name, requiredSigner: expected.gameCreator, unsignedTransactionBase64: bytes.toString('base64'), bytes: bytes.length, blockhashValidWhenPrepared: !!network, instructions: step.instructions.map(ix => ({ programId: ix.programId.toBase58(), dataBase64: ix.data.toString('base64'), accounts: ix.keys.map(k => ({ address: k.pubkey.toBase58(), isSigner: k.isSigner, isWritable: k.isWritable })) })) });
  }
  report.readyForOperatorReview = report.blockers.length === 0;
  report.launchReady = false;
  report.nextSteps = ['Create and verify the Pump mint and intended initial holders before preparing game eligibility.', 'Run publisher prepare-opening BEFORE game creation: persist finalized S0 and prove the game PDA absent at a bank at least as new as S0.', 'Rebuild these unsigned packets with a fresh blockhash and --publisher-config; review and initialize Game+Holder only, leaving round_id=0. This tool does not sign or send.', 'Run publisher init after game creation to activate the prepared journal without replacing S0, and export the public empty proof index.', 'After verifying the active journal and preserved S0, the permissionless keeper tick creates round 1 using its explicit rent/fee allowance.', 'Complete actual canaries and release checks before enabling the public UI. Any early third-party round activation is after S0; reconcile the keeper rather than replacing S0.'];
  await writeJson(output, report);
  console.log(JSON.stringify({ cluster, disabled: true, signed: false, broadcast: false, readyForOperatorReview: report.readyForOperatorReview, launchReady: false, gameVersion: report.gameVersion, packetBytes: report.steps.map(row => row.bytes), blockers: report.blockers, report: output }));
  if (!report.readyForOperatorReview) process.exitCode = 1;
  return report;
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) await prepareGameInitialization();
