/** Isolated, faucet-funded canary. Mainnet is rejected before loading any keypair. */
import path from 'node:path';
import assert from 'node:assert/strict';
import { Keypair, Transaction, ComputeBudgetProgram, SystemProgram, SYSVAR_CLOCK_PUBKEY } from '@solana/web3.js';
import { createInitializeMintInstruction, createAssociatedTokenAccountIdempotentInstruction, getAssociatedTokenAddressSync, createMintToInstruction, createInitializeAccount3Instruction, createSyncNativeInstruction, createCloseAccountInstruction, getAccount, TOKEN_2022_PROGRAM_ID, ExtensionType, getMintLen, TYPE_SIZE, LENGTH_SIZE, createInitializeMetadataPointerInstruction } from '@solana/spl-token';
import { createInitializeInstruction as createInitializeTokenMetadataInstruction, pack as packTokenMetadata } from '@solana/spl-token-metadata';
import * as sdk from '../src/solana-instructions.mjs';
import { costForExactKeys } from '../src/solana-curve.mjs';
import { apportionHolderRewards, holderMerkleTree, bytesToHex } from '../src/solana-holder.mjs';
import { PUBLICNET, CLUSTERS, options, assertTestCluster, assertGenesis, publicRpc, rpc, rpcConnection, testKey, verifiedArtifact, writeJson, safeError } from './publicnet-common.mjs';
import { base58Encode } from '../src/solana-signature.mjs';
import { archivePriorRehearsal, acquireRehearsalLock, runLoggedDeployment, assertSimulationCustomError, deploymentCliArguments, deploymentReceiptDetails } from './publicnet-rehearsal-state.mjs';

const opts = options(); assertTestCluster(opts.cluster);
const deployTransport = opts['deploy-transport'] || 'rpc';
if (!['rpc', 'tpu'].includes(deployTransport)) throw new Error('--deploy-transport must be rpc or tpu.');
const cluster = opts.cluster, url = publicRpc(cluster, opts.rpc || process.env.PIGGY_RPC_URL), dir = path.join(PUBLICNET, cluster);
const conn = rpcConnection(url,{minIntervalMs:cluster==='testnet'?400:0}), reportFile = path.join(dir, 'rehearsal-report.json');
const priorityFee=Number(opts['priority-fee-micro-lamports']||0);
if(!Number.isSafeInteger(priorityFee)||priorityFee<0||priorityFee>1_000_000)throw new Error('Invalid test priority fee.');
const computeBudget=()=>[ComputeBudgetProgram.setComputeUnitLimit({units:1_300_000}),...(priorityFee?[ComputeBudgetProgram.setComputeUnitPrice({microLamports:priorityFee})]:[])];
const report = { schemaVersion: 1, cluster, testOnly: true, startedAt: new Date().toISOString(), ok: false, phase: 'network', checks: [], transactions: [], blockers: [] };
const runId = `${Date.now()}-${process.pid}`, refusedReport = path.join(dir, 'reports', `rehearsal-refused-${runId}.json`);
let payer, releaseLock, reportWritable = false;
async function persist() { await writeJson(reportWritable ? reportFile : refusedReport, report); }
async function pass(name, details = {}) { report.checks.push({ name, ...details }); await persist(); console.log('PASS ' + name); }
async function send(name, instructions, signers = [payer]) {
  assertGenesis(cluster, await conn.getGenesisHash());
  const block = await conn.getLatestBlockhash('confirmed');
  const tx = new Transaction({ feePayer: signers[0].publicKey, ...block }).add(...computeBudget(), ...instructions);
  tx.sign(...signers);
  const signature = base58Encode(tx.signature);
  const row = { name, signature, status: 'submitted', submittedAt: new Date().toISOString(), blockhash: block.blockhash, lastValidBlockHeight: block.lastValidBlockHeight }; report.transactions.push(row); await persist();
  try {
    const returned = await conn.sendRawTransaction(tx.serialize(), { skipPreflight: false, preflightCommitment: 'confirmed', maxRetries: 3 });
    if (returned !== signature) throw new Error('RPC returned a different transaction signature.');
  } catch (error) { row.submissionError = safeError(error, url); await persist(); throw new Error(name + ' submission requires reconciliation by retained signature ' + signature + '.'); }
  for (let i = 0; i < 75; i++) {
    const status = (await conn.getSignatureStatuses([signature])).value[0];
    if (status?.err) { row.status = 'failed'; row.error = status.err; await persist(); throw new Error(name + ' failed on chain.'); }
    if (status && ['confirmed', 'finalized'].includes(status.confirmationStatus)) { row.status = status.confirmationStatus; row.slot = status.slot; await persist(); return signature; }
    if (await conn.getBlockHeight('finalized') > block.lastValidBlockHeight) throw new Error(name + ' expired. Check the recorded signature before rerunning.');
    await new Promise(resolve => setTimeout(resolve, 600));
  }
  throw new Error(name + ' confirmation timed out. The submitted signature is retained; reconcile it before rerunning.');
}
async function account(address, decode) { const value = await conn.getAccountInfo(address, 'confirmed'); if (!value || value.owner.toBase58() !== report.programId) throw new Error('Expected owned program account ' + address.toBase58()); return decode(value.data); }
async function wsol(wallet, amount = 0n) { const temp = Keypair.generate(), rent = await conn.getMinimumBalanceForRentExemption(165); return { temp, before: [SystemProgram.createAccount({ fromPubkey: wallet.publicKey, newAccountPubkey: temp.publicKey, lamports: rent + Number(amount), space: 165, programId: sdk.TOKEN_PROGRAM_ID }), createInitializeAccount3Instruction(temp.publicKey, sdk.NATIVE_MINT, wallet.publicKey), createSyncNativeInstruction(temp.publicKey)], after: [createCloseAccountInstruction(temp.publicKey, wallet.publicKey, wallet.publicKey)] }; }
try {
  const genesis = await rpc(url, 'getGenesisHash'); assertGenesis(cluster, genesis); report.genesisHash = genesis;
  releaseLock = await acquireRehearsalLock(dir);
  report.previousReportArchive = await archivePriorRehearsal(reportFile, conn);
  reportWritable = true; report.phase = 'starting'; await persist();
  payer = await testKey(cluster, 'payer'); const program = await testKey(cluster, 'program');
  const a = await testKey(cluster, 'buyer-a'), b = await testKey(cluster, 'buyer-b'), mint = await testKey(cluster, 'mint'), community = await testKey(cluster, 'community');
  report.payer = payer.publicKey.toBase58(); report.programId = program.publicKey.toBase58();
  let balance = await conn.getBalance(payer.publicKey, 'confirmed'); report.startingBalanceLamports = balance;
  if (opts.airdrop && balance < 4_000_000_000) {
    report.phase = 'faucet'; await persist();
    try { const signature = await conn.requestAirdrop(payer.publicKey, 2_000_000_000); const row = { name: 'free test SOL faucet', signature, status: 'submitted' }; report.transactions.push(row); await persist(); for (let i = 0; i < 30; i++) { await new Promise(resolve => setTimeout(resolve, 1000)); balance = await conn.getBalance(payer.publicKey, 'confirmed'); const status = (await conn.getSignatureStatuses([signature])).value[0]; if (status?.err) throw new Error('Test faucet transaction failed.'); if (status && ['confirmed', 'finalized'].includes(status.confirmationStatus)) { row.status = status.confirmationStatus; row.slot = status.slot; break; } } }
    catch (error) { report.faucetError = safeError(error, url); }
  }
  const artifact = await verifiedArtifact(path.resolve(opts.manifest || path.join(PUBLICNET, 'build/manifest.json')));
  report.binarySha256 = artifact.manifest.binarySha256; report.sourceSha256 = artifact.manifest.sourceSha256;
  const programRent = await conn.getMinimumBalanceForRentExemption(36), dataRent = await conn.getMinimumBalanceForRentExemption(artifact.binary.length + 45), bufferRent = await conn.getMinimumBalanceForRentExemption(artifact.binary.length + 37);
  report.estimatedRent = { finalLamports: programRent + dataRent, conservativePeakLamports: programRent + dataRent + bufferRent };
  const existing = await conn.getAccountInfo(program.publicKey, 'confirmed');
  if (!existing) {
    report.phase = 'deployment funding'; report.balanceLamports = balance;
    if (!opts.deploy) throw new Error('Program not deployed. Re-run with --deploy once faucet-funded and after reviewing the artifact manifest.');
    if (balance < programRent + dataRent + bufferRent + 100_000_000) throw new Error(`Fresh test wallet has ${balance} lamports; conservative deploy and canary budget is ${programRent + dataRent + bufferRent + 100_000_000}. Faucet funding is required.`);
    const buffer = await testKey(cluster, 'deploy-buffer');
    const timeoutSeconds = Number(opts['deploy-timeout-seconds'] || 240);
    if (!Number.isSafeInteger(timeoutSeconds) || timeoutSeconds < 60 || timeoutSeconds > 1800) throw new Error('Deployment timeout must be 60–1,800 seconds.');
    const logDirectory = path.join(dir, 'deployment-attempts', runId);
    report.phase = 'deployment upload'; report.deploymentAttempt = { status: 'started', transport: deployTransport, buffer: buffer.publicKey.toBase58(), binarySha256: report.binarySha256, startedAt: new Date().toISOString(), timeoutSeconds, logDirectory };
    await persist();
    let result;
    const deploymentArgs = deploymentCliArguments({ rpcUrl: url, payerKeyFile: path.join(dir, 'wallets/payer.json'), binary: artifact.manifest.binary, programKeyFile: path.join(dir, 'wallets/program.json'), bufferKeyFile: path.join(dir, 'wallets/deploy-buffer.json'), upgradeAuthorityKeyFile: path.join(dir, 'wallets/payer.json'), binaryBytes: artifact.binary.length, transport: deployTransport });
    try { result = await runLoggedDeployment(deploymentArgs, { directory: logDirectory, timeoutMs: timeoutSeconds * 1000 }); }
    catch (error) { report.deploymentAttempt.status = 'requires-buffer-reconciliation'; report.deploymentFailure = error.deploymentDiagnostic ?? { message: String(error.message) }; await persist(); throw error; }
    report.deploymentAttempt.status = 'cli-completed'; report.deploymentDiagnostics = { stdoutLog: result.stdoutLog, stderrLog: result.stderrLog, combinedLog: result.combinedLog };
    const deployed = JSON.parse(result.stdout), receipt = deploymentReceiptDetails(deployed, { expectedProgramId: program.publicKey.toBase58(), transport: deployTransport });
    report.deployment = { ...deployed, buffer: buffer.publicKey.toBase58(), transport: deployTransport }; report.deploymentReceipt = { ...receipt, binarySha256: report.binarySha256, completedAt: new Date().toISOString() };
    const deploymentRow = { name: 'program deployment (CLI)', ...receipt, status: 'submitted' }; report.transactions.push(deploymentRow); await persist();
    const deploymentStatus = (await conn.getSignatureStatuses([receipt.signature], { searchTransactionHistory: true })).value[0];
    if (deploymentStatus?.err) { deploymentRow.status = 'failed'; deploymentRow.error = deploymentStatus.err; await persist(); throw new Error('Deployment signature failed on chain.'); }
    if (!deploymentStatus || !['confirmed', 'finalized'].includes(deploymentStatus.confirmationStatus)) throw new Error('Deployment CLI signature is unconfirmed or unknown; reconcile before retrying.');
    deploymentRow.status = deploymentStatus.confirmationStatus; deploymentRow.slot = deploymentStatus.slot; report.deploymentReceipt.status = deploymentRow.status; report.deploymentReceipt.slot = deploymentRow.slot; await persist();
  }
  report.phase = 'deployed binary verification';
  const executable = await conn.getAccountInfo(program.publicKey, 'confirmed'); assert(executable?.executable);
  const dataAddress = new sdk.PublicKey(executable.data.subarray(4, 36)), onchain = await conn.getAccountInfo(dataAddress, 'confirmed');
  assert(onchain.data.subarray(45, 45 + artifact.binary.length).equals(artifact.binary)); assert(!onchain.data.subarray(45 + artifact.binary.length).some(byte => byte));
  await pass('deployed public default bytes match reviewed artifact', { binarySha256: report.binarySha256 });
  report.phase = 'isolated game initialization'; const version = BigInt(Date.now()); report.gameVersion = version.toString(); report.piggyMint = mint.publicKey.toBase58();
  const gameAddress = sdk.gameAddress(program.publicKey, version), roundAddress = sdk.roundAddress(program.publicKey, 1, version);
  const holderAddress = sdk.holderConfigAddress(program.publicKey, gameAddress), vaultAddress = sdk.holderVaultAddress(program.publicKey, gameAddress);
  const aMint = getAssociatedTokenAddressSync(mint.publicKey, a.publicKey, false, TOKEN_2022_PROGRAM_ID), bMint = getAssociatedTokenAddressSync(mint.publicKey, b.publicKey, false, TOKEN_2022_PROGRAM_ID);
  const communityWsol = getAssociatedTokenAddressSync(sdk.NATIVE_MINT, community.publicKey), placeholder = getAssociatedTokenAddressSync(sdk.NATIVE_MINT, payer.publicKey);
  const existingMint = await conn.getAccountInfo(mint.publicKey);
  if (existingMint && !existingMint.owner.equals(TOKEN_2022_PROGRAM_ID)) throw new Error('Canary eligibility mint is legacy. Use a fresh isolated test mint for this release.');
  if (!existingMint) {
    const metadata = { updateAuthority: payer.publicKey, mint: mint.publicKey, name: 'PIGGY Test Canary', symbol: 'PIGGY', uri: 'https://example.invalid/piggy-test-only.json', additionalMetadata: [] };
    const mintBytes = getMintLen([ExtensionType.MetadataPointer]), metadataBytes = TYPE_SIZE + LENGTH_SIZE + packTokenMetadata(metadata).length;
    await send('create Token-2022 eligibility mint with metadata extensions', [SystemProgram.createAccount({ fromPubkey: payer.publicKey, newAccountPubkey: mint.publicKey, lamports: await conn.getMinimumBalanceForRentExemption(mintBytes + metadataBytes), space: mintBytes, programId: TOKEN_2022_PROGRAM_ID }), createInitializeMetadataPointerInstruction(mint.publicKey, payer.publicKey, mint.publicKey, TOKEN_2022_PROGRAM_ID), createInitializeMintInstruction(mint.publicKey, 6, payer.publicKey, null, TOKEN_2022_PROGRAM_ID), createInitializeTokenMetadataInstruction({ programId: TOKEN_2022_PROGRAM_ID, metadata: mint.publicKey, updateAuthority: payer.publicKey, mint: mint.publicKey, mintAuthority: payer.publicKey, name: metadata.name, symbol: metadata.symbol, uri: metadata.uri })], [payer, mint]);
  }
  await send('fund test actors and prepare holder token accounts', [SystemProgram.transfer({ fromPubkey: payer.publicKey, toPubkey: a.publicKey, lamports: 30_000_000 }), SystemProgram.transfer({ fromPubkey: payer.publicKey, toPubkey: b.publicKey, lamports: 30_000_000 }), ...[[mint.publicKey, aMint, a.publicKey, TOKEN_2022_PROGRAM_ID], [mint.publicKey, bMint, b.publicKey, TOKEN_2022_PROGRAM_ID], [sdk.NATIVE_MINT, communityWsol, community.publicKey, sdk.TOKEN_PROGRAM_ID], [sdk.NATIVE_MINT, placeholder, payer.publicKey, sdk.TOKEN_PROGRAM_ID]].map(([mintAddress, ata, owner, tokenProgram]) => createAssociatedTokenAccountIdempotentInstruction(payer.publicKey, ata, owner, mintAddress, tokenProgram)), createMintToInstruction(mint.publicKey, aMint, payer.publicKey, 1_000_000_000n, [], TOKEN_2022_PROGRAM_ID), createMintToInstruction(mint.publicKey, bMint, payer.publicKey, 2_000_000_000n, [], TOKEN_2022_PROGRAM_ID)]);
  await send('initialize isolated SOL game and holder vault', [sdk.initializeGameInstruction({ programId: program.publicKey, creator: payer.publicKey, version, communityWallet: communityWsol, p3dWallet: placeholder, initialSeconds: 120, incrementSeconds: 1, maxSeconds: 180 }), sdk.initializeHolderInstruction({ programId: program.publicKey, creator: payer.publicKey, version, eligibilityMint: mint.publicKey, publisher: payer.publicKey }), sdk.initializeRoundInstruction({ programId: program.publicKey, payer: payer.publicKey, version, roundId: 1 })]);
  const getRound = () => account(roundAddress, sdk.decodeRound), getPlayer = wallet => account(sdk.playerAddress(program.publicKey, wallet.publicKey, 1, version), sdk.decodePlayer);
  const snapshotSlot = await conn.getSlot('confirmed'), holdingSnapshot = new Map([[a.publicKey.toBase58(), (await getAccount(conn, aMint, 'confirmed', TOKEN_2022_PROGRAM_ID)).amount], [b.publicKey.toBase58(), (await getAccount(conn, bMint, 'confirmed', TOKEN_2022_PROGRAM_ID)).amount]]);
  for (const [i, mode] of Object.keys(sdk.TEAMS).entries()) {
    const wallet = i % 2 ? b : a, r = await getRound(), amount = costForExactKeys(r.accum_sol_pot, 1n).lamports, wrapped = await wsol(wallet, amount);
    if (!i) assert.equal(amount, 75001n);
    const slot = await conn.getSlot('confirmed');
    await send('guarded SOL feed in ' + mode + ' mode', [...wrapped.before, sdk.guardedPurchaseInstruction({ programId: program.publicKey, buyer: wallet.publicKey, version, roundId: 1, source: wrapped.temp.publicKey, amount, mode, minimumKeys: 1, expiresAtSlot: BigInt(slot + 150) }), ...wrapped.after], [wallet, wrapped.temp]);
    assert((await getRound()).accum_sol_by_team[mode] > 0n);
  }
  await pass('original first share price and all four payout modes execute');
  assert(sdk.claimableGame(await getPlayer(a), await getRound()).keys > 0n); await pass('earlier shares accrue rewards from later feeds');
  for (const [name, minimumKeys, expiresAtSlot, expectedCustom] of [['slippage', 1_000_000n, BigInt(await conn.getSlot('confirmed') + 150), 22], ['expired quote', 1n, 1n, 21]]) {
    const before = (await getRound()).accum_sol_pot, amount = costForExactKeys(before, 1n).lamports, wrapped = await wsol(a, amount);
    const block = await conn.getLatestBlockhash('confirmed');
    const tx = new Transaction({ feePayer: a.publicKey, ...block }).add(...computeBudget(), ...wrapped.before, sdk.guardedPurchaseInstruction({ programId: program.publicKey, buyer: a.publicKey, version, roundId: 1, source: wrapped.temp.publicKey, amount, minimumKeys, expiresAtSlot }), ...wrapped.after); tx.sign(a, wrapped.temp);
    const simulation = await conn.simulateTransaction(tx);
    const expectedInstructionIndex=computeBudget().length+3;
    const detail = { name, expectedCustom, expectedInstructionIndex, actualError: simulation.value.err, logs: simulation.value.logs ?? [], unitsConsumed: simulation.value.unitsConsumed ?? null };
    (report.guardSimulations ??= []).push(detail); await persist();
    assertSimulationCustomError(simulation.value.err, expectedCustom, expectedInstructionIndex); assert.equal((await getRound()).accum_sol_pot, before);
    await pass(name + ' rejects with the exact guard error without mutating game balances', detail);
  }
  const claim = await wsol(a); await send('claim live game rewards as native SOL', [...claim.before, sdk.withdrawGameInstruction({ programId: program.publicKey, wallet: a.publicKey, version, roundId: 1, destination: claim.temp.publicKey }), ...claim.after], [a, claim.temp]);
  report.phase = 'holder fee publication and claim'; await send('sweep original P3D fees into funded holder vault', [sdk.fundHolderVaultInstruction({ programId: program.publicKey, version, roundId: 1 })]);
  const funded = await getAccount(conn, vaultAddress); assert(funded.amount > 0n);
  const epochId = (await account(holderAddress, sdk.decodeHolderConfig)).next_epoch; assert(epochId >= 1n);
  const allocations = apportionHolderRewards(holdingSnapshot, funded.amount), tree = holderMerkleTree(allocations, { programId: program.publicKey, game: gameAddress, epoch: epochId });
  assert.equal(allocations.reduce((sum, row) => sum + row.amount, 0n), funded.amount);
  await writeJson(path.join(dir, 'holder-canary-proofs.json'), { cluster, genesisHash: genesis, programId: report.programId, gameVersion: report.gameVersion, piggyMint: report.piggyMint, epoch: epochId, root: bytesToHex(tree.root), snapshotSlot, records: tree.records.map(row => ({ ...row, leaf: bytesToHex(row.leaf), proof: row.proof.map(bytesToHex) })) });
  await send('publish backed holder entitlement root', [sdk.publishHolderEpochInstruction({ programId: program.publicKey, publisher: payer.publicKey, version, epoch: epochId, root: tree.root, totalAmount: funded.amount, snapshotSlot })]);
  const entry = tree.records.find(row => row.wallet === a.publicKey.toBase58()), holderClaim = await wsol(a);
  await send('claim token holder reward as native SOL', [...holderClaim.before, sdk.claimHolderInstruction({ programId: program.publicKey, wallet: a.publicKey, version, epoch: epochId, amount: entry.amount, proof: entry.proof, destination: holderClaim.temp.publicKey }), ...holderClaim.after], [a, holderClaim.temp]);
  const holder = await account(holderAddress, sdk.decodeHolderConfig); assert.equal(holder.total_claimed, entry.amount); assert.equal(holder.reserved_amount, funded.amount - entry.amount); await pass('token holder claim is backed by original P3D fees and preserves reserved liabilities');
  report.phase = 'real cluster clock settlement';
  for (let i = 0; i < 200; i++) { const clock = await conn.getAccountInfo(SYSVAR_CLOCK_PUBKEY, 'confirmed'), round = await getRound(); if (clock.data.readBigInt64LE(32) > BigInt(round.end_time)) break; if (i === 199) throw new Error('Round did not expire within the public canary budget.'); await new Promise(resolve => setTimeout(resolve, 1000)); }
  await send('settle round on real public cluster clock', [sdk.endRoundInstruction({ programId: program.publicKey, version, roundId: 1, winner: b.publicKey })]);
  const settled = await getRound(); assert(settled.ended); assert(settled.final_prize_share > 0n);
  await send('roll over into next round', [sdk.initializeRoundInstruction({ programId: program.publicKey, payer: payer.publicKey, version, roundId: 2 })]);
  const prize = await wsol(b); await send('claim historical jackpot after rollover', [...prize.before, sdk.withdrawGameInstruction({ programId: program.publicKey, wallet: b.publicKey, version, roundId: 1, destination: prize.temp.publicKey }), ...prize.after], [b, prize.temp]);
  await pass('public settlement, rollover and historical jackpot claim execute');
  report.phase = 'complete'; report.ok = true;
  report.clientConfig = { schemaVersion: 1, cluster, genesisHash: genesis, rpcUrl: new URL(url).search ? '[Use the deployment RPC URL]' : url, programId: report.programId, gameVersion: report.gameVersion, piggyMint: report.piggyMint, proofIndexUrl: opts['proof-index-url'] || 'REQUIRED_HTTPS_PROOF_INDEX', purchaseGuardVersion: 1, priorityFeeMicroLamports: 0, mainnetEnabled: false };
  await writeJson(path.join(dir, 'client-config.template.json'), report.clientConfig);
} catch (error) { report.blockers.push(safeError(error, url)); console.error(JSON.stringify({ ok: false, cluster, phase: report.phase, blocker: report.blockers.at(-1) })); process.exitCode = 1; }
finally { if (payer) { try { report.endingBalanceLamports = await conn.getBalance(payer.publicKey, 'confirmed'); } catch { /* retain partial report */ } } report.completedAt = new Date().toISOString(); try { await persist(); } finally { if (releaseLock) await releaseLock(); } console.log(JSON.stringify({ cluster, ok: report.ok, phase: report.phase, checks: report.checks.length, transactions: report.transactions.length, report: reportWritable ? reportFile : refusedReport })); }
