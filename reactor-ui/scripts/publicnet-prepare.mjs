import fs from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { ROOT, PUBLICNET, options, assertTestCluster, testKey, sourceDigest, sha256, writeJson } from './publicnet-common.mjs';
const run = promisify(execFile), opts = options();
assertTestCluster(opts.cluster);
const addresses = {};
for (const role of ['payer', 'program', 'buyer-a', 'buyer-b', 'mint', 'community']) addresses[role] = (await testKey(opts.cluster, role)).publicKey.toBase58();
await writeJson(path.join(PUBLICNET, opts.cluster, 'addresses.json'), { cluster: opts.cluster, testOnly: true, createdAt: new Date().toISOString(), addresses });
if (opts.build) {
  const programRoot = path.resolve(opts['program-root'] || path.join(ROOT, '../program'));
  const output = path.join(PUBLICNET, 'build');
  await fs.mkdir(output, { recursive: true, mode: 0o700 });
  const before = await sourceDigest(programRoot);
  const target = path.join(output, 'cargo-target');
  const args = ['build-sbf', '--manifest-path', path.join(programRoot, 'Cargo.toml'), '--sbf-out-dir', output, '--no-default-features', '--', '--locked'];
  const result = await run('cargo', args, { cwd: programRoot, env: { ...process.env, CARGO_TARGET_DIR: target }, maxBuffer: 12_000_000 });
  await fs.writeFile(path.join(output, 'build.log'), result.stdout + '\n' + result.stderr, { mode: 0o600 });
  // cargo-build-sbf does not preserve Cargo's JSON event stream. Inspect the isolated
  // SBF compilation fingerprints instead; host-test fingerprints cannot satisfy this.
  const fingerprints = path.join(target, 'sbpf-solana-solana/release/.fingerprint');
  const artifacts = [];
  for (const entry of await fs.readdir(fingerprints)) if (entry.startsWith('fomo3d-')) {
    try { artifacts.push(JSON.parse(await fs.readFile(path.join(fingerprints, entry, 'lib-fomo3d.json'), 'utf8'))); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
  if (!artifacts.length || artifacts.some(entry => entry.features !== '[]')) throw new Error('Could not verify feature-free public build; see ignored build log.');
  const after = await sourceDigest(programRoot);
  if (before !== after) throw new Error('Program source changed during compilation. Rebuild after code is frozen.');
  const binary = path.join(output, 'fomo3d.so'), data = await fs.readFile(binary);
  const manifest = { schemaVersion: 1, builtAt: new Date().toISOString(), programRoot, sourceSha256: after, binary, binarySha256: sha256(data), binaryBytes: data.length, features: [], lotteryPolicy: 'disabled-reserve-only', command: ['cargo', ...args], tools: (await run('cargo-build-sbf', ['--version'])).stdout.trim() };
  await writeJson(path.join(output, 'manifest.json'), manifest);
  console.log(JSON.stringify({ build: 'ready', binaryBytes: data.length, binarySha256: manifest.binarySha256, sourceSha256: after }));
}
console.log(JSON.stringify({ cluster: opts.cluster, testOnly: true, addresses, manifest: path.join(PUBLICNET, 'build/manifest.json') }));
