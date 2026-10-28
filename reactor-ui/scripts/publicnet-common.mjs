/** Public-cluster tooling. Test identities are isolated; this module never loads the CLI wallet. */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { Keypair, Connection } from '@solana/web3.js';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const PUBLICNET = path.join(ROOT, '.openai/local/publicnet');
export const CLUSTERS = Object.freeze({
  devnet: { rpcUrl: 'https://api.devnet.solana.com', genesisHash: 'EtWTRABZaYq6iMfeYKouRu166VU2xqa1wcaWoxPkrZBG' },
  testnet: { rpcUrl: 'https://api.testnet.solana.com', genesisHash: '4uhcVJyU9pJkvQyS88uRDiswHXSCkY3zQawwpjk2NsNY' },
  'mainnet-beta': { rpcUrl: 'https://api.mainnet-beta.solana.com', genesisHash: '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d' },
});
export const UPGRADEABLE_LOADER = 'BPFLoaderUpgradeab1e11111111111111111111111';
export const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
export function options(argv = process.argv.slice(2)) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const name = argv[i];
    if (!name.startsWith('--')) throw new Error('Use named options only.');
    if (['--build', '--airdrop', '--deploy'].includes(name)) out[name.slice(2)] = true;
    else { if (!argv[i + 1] || argv[i + 1].startsWith('--')) throw new Error(`Missing ${name} value.`); out[name.slice(2)] = argv[++i]; }
  }
  if (!CLUSTERS[out.cluster]) throw new Error('--cluster must be devnet, testnet, or mainnet-beta.');
  return out;
}
export function publicRpc(cluster, override) {
  if (!CLUSTERS[cluster]) throw new Error('Unknown public cluster.');
  const url = new URL(override || CLUSTERS[cluster].rpcUrl);
  if (url.protocol !== 'https:' || url.username || url.password || ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) throw new Error('Public cluster RPC must use HTTPS without embedded credentials.');
  return url.href;
}
export function assertGenesis(cluster, actual) {
  if (actual !== CLUSTERS[cluster]?.genesisHash) throw new Error(`RPC genesis mismatch for ${cluster}; transaction sending is disabled.`);
}
export function assertTestCluster(cluster) {
  if (!['devnet', 'testnet'].includes(cluster)) throw new Error('This harness cannot generate identities, request airdrops, deploy, or send on mainnet. Use the reviewed launch procedure.');
}
export function rpcConnection(url) {
  return new Connection(url, { commitment: 'confirmed', disableRetryOnRateLimit: true, confirmTransactionInitialTimeout: 45_000, fetch: publicRpcFetch });
}
/** Only retry reads. A transaction submission always retains its original journal outcome. */
export async function publicRpcFetch(resource, init = {}, { transport = fetch, wait = ms => new Promise(resolve => setTimeout(resolve, ms)) } = {}) {
  let request;try { request=JSON.parse(init.body); } catch { /* non-JSON requests are not retried */ }
  const readOnly=request&&!Array.isArray(request)&&typeof request.method==='string'&&(request.method.startsWith('get')||request.method==='simulateTransaction');
  for(let attempt=0;;attempt++){
    const response=await transport(resource,{...init,signal:init.signal??AbortSignal.timeout(20_000)});
    if(response.status!==429||!readOnly||attempt>=3)return response;
    await response.body?.cancel();
    const seconds=Number(response.headers.get('retry-after'));
    await wait(Number.isFinite(seconds)&&seconds>0?Math.min(seconds*1000,10_000):1000*2**attempt);
  }
}
export async function rpc(url, method, params = [], timeout = 20_000) {
  const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }), signal: AbortSignal.timeout(timeout) });
  if (!response.ok) throw new Error(`RPC ${method} returned HTTP ${response.status}.`);
  const body = await response.json();
  if (body.error) throw new Error(`RPC ${method}: ${body.error.message}`);
  return body.result;
}
export async function writeJson(filename, value) {
  await fs.mkdir(path.dirname(filename), { recursive: true, mode: 0o700 });
  const temp = `${filename}.${process.pid}.tmp`;
  await fs.writeFile(temp, JSON.stringify(value, (_, v) => typeof v === 'bigint' ? v.toString() : v, 2) + '\n', { mode: 0o600 });
  await fs.rename(temp, filename);
}
export async function testKey(cluster, role) {
  assertTestCluster(cluster);
  if (!/^[a-z][a-z0-9-]*$/.test(role)) throw new Error('Invalid test role.');
  const filename = path.join(PUBLICNET, cluster, 'wallets', role + '.json');
  await fs.mkdir(path.dirname(filename), { recursive: true, mode: 0o700 });
  try { await fs.chmod(filename, 0o600); return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(await fs.readFile(filename, 'utf8')))); }
  catch (error) { if (error.code !== 'ENOENT') throw error; const pair = Keypair.generate(); await fs.writeFile(filename, JSON.stringify([...pair.secretKey]), { flag: 'wx', mode: 0o600 }); return pair; }
}
export async function sourceDigest(programRoot) {
  const files = [];
  async function walk(dir) { for (const ent of await fs.readdir(dir, { withFileTypes: true })) { const name = path.join(dir, ent.name); if (ent.isDirectory()) await walk(name); else if (ent.name.endsWith('.rs')) files.push(name); } }
  await walk(path.join(programRoot, 'src'));
  files.push(path.join(programRoot, 'Cargo.toml'), path.join(programRoot, 'Cargo.lock'));
  const hash = createHash('sha256');
  for (const filename of files.sort()) { hash.update(path.relative(programRoot, filename)); hash.update('\0'); hash.update(await fs.readFile(filename)); hash.update('\0'); }
  return hash.digest('hex');
}
export async function verifiedArtifact(manifestFile) {
  const manifest = JSON.parse(await fs.readFile(manifestFile, 'utf8'));
  if (manifest.schemaVersion !== 1 || manifest.lotteryPolicy !== 'disabled-reserve-only' || !Array.isArray(manifest.features) || manifest.features.length !== 0) throw new Error('Public deploy requires a recorded build without optional features.');
  const binary = await fs.readFile(manifest.binary);
  if (sha256(binary) !== manifest.binarySha256 || binary.length !== manifest.binaryBytes) throw new Error('Program artifact differs from the reviewed build manifest.');
  if (await sourceDigest(manifest.programRoot) !== manifest.sourceSha256) throw new Error('Rust source changed since the public artifact was built. Rebuild and rerun verification.');
  return { manifest, binary };
}
export function safeError(error, secretUrl) { return String(error.message || error).replaceAll(secretUrl || '\u0000', '[RPC]').slice(0, 600); }
