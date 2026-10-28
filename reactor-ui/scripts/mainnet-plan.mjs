/** Read-only Mainnet deployment plan. It never invokes Solana deploy, signs, or broadcasts. */
import fs from 'node:fs/promises';
import path from 'node:path';
import { Keypair } from '@solana/web3.js';
import { ROOT, PUBLICNET, options, publicRpc, rpc, assertGenesis, verifiedArtifact, writeJson, safeError } from './publicnet-common.mjs';

const opts = options();
if (opts.cluster !== 'mainnet-beta') throw new Error('This is the disabled Mainnet operator plan. Use publicnet-rehearse for free testing clusters.');
if (opts.deploy || opts.airdrop || opts.build) throw new Error('Mainnet planning cannot deploy, airdrop, or build. Prepare and verify the release separately.');
const maxBudget = BigInt(opts['max-budget-lamports'] || '3000000000');
if (maxBudget <= 0n || maxBudget > 3_000_000_000n) throw new Error('The operator plan ceiling is at most 3 SOL.');
const url = publicRpc('mainnet-beta', opts.rpc || process.env.PIGGY_RPC_URL);
const dir = path.join(ROOT, '.openai/local/mainnet'), keyRoot = path.join(dir, 'keys');
const output = path.resolve(opts.output || path.join(dir, 'disabled-deployment-plan.json'));
const report = { schemaVersion: 1, cluster: 'mainnet-beta', preparedAt: new Date().toISOString(), disabled: true, signed: false, broadcast: false, executionSupported: false, maxBudgetLamports: maxBudget.toString(), rpcOrigin: new URL(url).origin, checks: [], blockers: [], operatorReviewRequired: true };
async function check(name, fn) { try { const value = await fn(); report.checks.push({ name, ok: true, details: value }); return value; } catch (error) { const message = safeError(error, url); report.checks.push({ name, ok: false, error: message }); report.blockers.push(name + ': ' + message); return null; } }
const manifestPath = path.resolve(opts.manifest || path.join(PUBLICNET, 'build/manifest.json'));
let artifact;
await check('reviewed public release artifact', async () => { artifact = await verifiedArtifact(manifestPath); return { binaryBytes: artifact.binary.length, binarySha256: artifact.manifest.binarySha256, sourceSha256: artifact.manifest.sourceSha256, lotteryPolicy: artifact.manifest.lotteryPolicy }; });
const roles = {};
await check('separate offline mainnet identities and private key permissions', async () => {
  const addresses = JSON.parse(await fs.readFile(path.join(dir, 'public-addresses.json'), 'utf8'));
  if (addresses.cluster !== 'mainnet-beta') throw new Error('Public address manifest does not identify Mainnet.');
  const realRoot = await fs.realpath(keyRoot), rootStat = await fs.stat(realRoot);
  if (rootStat.mode & 0o077) throw new Error('Mainnet key directory must be private (0700).');
  for (const role of ['deployer', 'upgrade-authority', 'holder-publisher', 'community-treasury', 'piggy-mint', 'program', 'keeper']) {
    const entry = addresses.keys.find(row => row.role === role); if (!entry) throw new Error('Missing ' + role + ' address manifest entry.');
    const expectedPath = path.join(realRoot, role + '.json'), realFile = await fs.realpath(entry.path);
    if (realFile !== expectedPath) throw new Error(role + ' must use its explicit isolated Mainnet key file.');
    const stat = await fs.stat(realFile); if (stat.mode & 0o077 || process.getuid && stat.uid !== process.getuid()) throw new Error(role + ' key file must be owner-only (0600).');
    const key = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(await fs.readFile(realFile, 'utf8'))));
    if (key.publicKey.toBase58() !== entry.publicKey) throw new Error(role + ' private key differs from its recorded public address.');
    roles[role] = { publicKey: entry.publicKey, keyFile: realFile };
  }
  if (new Set(Object.values(roles).map(row => row.publicKey)).size !== Object.keys(roles).length) throw new Error('Mainnet roles must use separate identities.');
  return roles;
});
const network = await check('actual mainnet genesis and fresh blockhash', async () => {
  const genesis = await rpc(url, 'getGenesisHash'); assertGenesis('mainnet-beta', genesis); const block = await rpc(url, 'getLatestBlockhash', [{ commitment: 'confirmed' }]); return { genesisHash: genesis, slot: block.context.slot, lastValidBlockHeight: block.value.lastValidBlockHeight };
});
await check('production RPC configured', async () => { if (['api.mainnet-beta.solana.com', 'api.mainnet.solana.com'].includes(new URL(url).hostname)) throw new Error('Supply a dedicated production HTTPS RPC using --rpc or PIGGY_RPC_URL. Public RPC is used only for read-only cost and identity checks.'); return { rpcOrigin: new URL(url).origin }; });
if (network && artifact) await check('3 SOL conservative deployment and launch allowance', async () => {
  const [program, data, buffer] = await Promise.all([36, artifact.binary.length + 45, artifact.binary.length + 37].map(n => rpc(url, 'getMinimumBalanceForRentExemption', [n])));
  const reserves = { deploymentFeeAndRetryAllowance: 50_000_000, gameAndCanaryAllowance: 50_000_000, keeperFeeAndInitialRoundRentAllowance: 50_000_000, pumpCreationAllowance: 50_000_000, holderPublisherFeeAllowance: 20_000_000 };
  const peak = BigInt(program + data + buffer), total = peak + Object.values(reserves).reduce((sum, value) => sum + BigInt(value), 0n);
  report.cost = { programRentLamports: program, programDataRentLamports: data, bufferRentLamports: buffer, finalLockedRentLamports: program + data, conservativePeakRentLamports: peak.toString(), reserves, conservativeTotalLamports: total.toString(), maxBudgetLamports: maxBudget.toString(), initialTokenBuyLamports: 0, note: 'This is an operational allowance, not a native Solana CLI hard spending limit. No initial buy is authorized or encoded. Recheck live rent, actual fees, remaining balance and interrupted buffers immediately before any paid operation.' };
  if (total > maxBudget) throw new Error('Conservative rent and allowances exceed the 3 SOL operator ceiling.');
  return report.cost;
});
if (network && roles.deployer) await check('deployer funding and unused program address', async () => {
  const balance = await rpc(url, 'getBalance', [roles.deployer.publicKey, { commitment: 'confirmed' }]);
  const existing = (await rpc(url, 'getAccountInfo', [roles.program.publicKey, { commitment: 'confirmed', encoding: 'base64' }])).value;
  report.funding = { payer: roles.deployer.publicKey, balanceLamports: balance.value, maxBudgetLamports: maxBudget.toString(), programExists: !!existing };
  if (existing) throw new Error('Program address already exists. Reconcile the deployment and authority before producing an initial-deploy plan.');
  if (BigInt(balance.value) < BigInt(report.cost?.conservativeTotalLamports || maxBudget)) throw new Error('Mainnet deployer does not yet hold the reviewed deployment and launch allowance.');
  return report.funding;
});
let bufferKeyFile;
await check('explicit recoverable deployment buffer identity', async () => {
  bufferKeyFile = path.join(keyRoot, 'deploy-buffer.json'); const stat = await fs.stat(bufferKeyFile);
  if (stat.mode & 0o077) throw new Error('Deployment buffer key must be private (0600).');
  const key = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(await fs.readFile(bufferKeyFile, 'utf8'))));
  if (Object.values(roles).some(row => row.publicKey === key.publicKey.toBase58())) throw new Error('Deployment buffer must use a separate identity.');
  return { publicKey: key.publicKey.toBase58(), keyFile: bufferKeyFile };
});
for (const cluster of ['devnet', 'testnet']) await check(cluster + ' funded same-release rehearsal', async () => {
  const result = JSON.parse(await fs.readFile(path.join(PUBLICNET, cluster, 'rehearsal-report.json'), 'utf8'));
  if (!artifact || !result.ok || result.binarySha256 !== artifact.manifest.binarySha256 || result.sourceSha256 !== artifact.manifest.sourceSha256) throw new Error('Successful funded public rehearsal is missing for this exact release.');
  return { checks: result.checks.length, transactions: result.transactions.length };
});
if (artifact && roles.deployer && roles.program && roles['upgrade-authority']) report.disabledCommand = {
  executable: 'solana', disabled: true,
  arguments: ['--url', '<DEDICATED_PRODUCTION_RPC_FROM_REVIEWED_ENVIRONMENT>', '--keypair', roles.deployer.keyFile, '--commitment', 'confirmed', '--output', 'json', 'program', 'deploy', artifact.manifest.binary, '--fee-payer', roles.deployer.keyFile, '--program-id', roles.program.keyFile, '--upgrade-authority', roles['upgrade-authority'].keyFile, '--buffer', bufferKeyFile || '<REQUIRED_EXPLICIT_BUFFER_KEY_FILE>', '--max-len', String(artifact.binary.length), '--with-compute-unit-price', '0', '--max-sign-attempts', '3', '--use-rpc'],
  note: 'Review-only argument array. This tool cannot execute it. No --final, --skip-preflight, --skip-feature-verify or default CLI wallet is used. Recover or reconcile the named buffer after any interruption before retrying.',
};
report.planChecksPass = report.blockers.length === 0;
report.launchReady = false;
report.nextGate = 'Stage and verify the actual public app, finalized holder snapshot and HTTPS proofs; pass public rehearsals, then complete concrete operator review before any real SOL deployment. Mainnet launch additionally requires successful on-chain canary receipts.';
await writeJson(output, report);
console.log(JSON.stringify({ disabled: true, signed: false, broadcast: false, planChecksPass: report.planChecksPass, launchReady: false, checks: report.checks.length, blockers: report.blockers, cost: report.cost, report: output }));
if (!report.planChecksPass) process.exitCode = 1;
