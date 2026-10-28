import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { assertTestCluster, assertGenesis, CLUSTERS, publicRpc, sourceDigest, verifiedArtifact, sha256 } from '../scripts/publicnet-common.mjs';

test('all public send tooling rejects mainnet before loading an identity', () => {
  assert.doesNotThrow(() => assertTestCluster('devnet'));
  assert.doesNotThrow(() => assertTestCluster('testnet'));
  for (const name of ['mainnet-beta', 'mainnet', 'localnet', undefined]) assert.throws(() => assertTestCluster(name), /cannot generate identities/);
});
test('disabled mainnet planner rejects execution flags and budgets above 3 SOL before accessing a wallet', () => {
  const script = fileURLToPath(new URL('../scripts/mainnet-plan.mjs', import.meta.url));
  for (const args of [['--cluster', 'mainnet-beta', '--deploy'], ['--cluster', 'mainnet-beta', '--max-budget-lamports', '3000000001']]) {
    const result = spawnSync(process.execPath, [script, ...args], { encoding: 'utf8' });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /cannot deploy|at most 3 SOL/);
  }
});
test('a named network must match the actual genesis, including custom RPCs', () => {
  for (const [name, network] of Object.entries(CLUSTERS)) {
    assert.doesNotThrow(() => assertGenesis(name, network.genesisHash));
    for (const [other, otherNetwork] of Object.entries(CLUSTERS)) if (name !== other) assert.throws(() => assertGenesis(name, otherNetwork.genesisHash), /genesis mismatch/);
  }
});
test('public RPC cannot silently target a local development server or embed credentials', () => {
  for (const url of ['http://api.devnet.solana.com', 'https://localhost:18899', 'https://127.0.0.1', 'https://name:secret@example.com']) assert.throws(() => publicRpc('devnet', url));
  assert.equal(publicRpc('devnet', 'https://rpc.example.com/path?api-key=private'), 'https://rpc.example.com/path?api-key=private');
});
test('public artifacts fail closed on enabled lottery features, tampering and stale source', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'piggy-public-artifact-'));
  try {
    const programRoot = path.join(dir, 'program'); await fs.mkdir(path.join(programRoot, 'src'), { recursive: true });
    await fs.writeFile(path.join(programRoot, 'src/lib.rs'), 'pub fn program() {}');
    await fs.writeFile(path.join(programRoot, 'Cargo.toml'), '[package]\nname="example"');
    await fs.writeFile(path.join(programRoot, 'Cargo.lock'), '# lockfile');
    const binary = path.join(dir, 'program.so'), bytes = Buffer.from([127, 69, 76, 70]); await fs.writeFile(binary, bytes);
    const manifestFile = path.join(dir, 'manifest.json');
    const manifest = { schemaVersion: 1, lotteryPolicy: 'disabled-reserve-only', features: [], binary, binarySha256: sha256(bytes), binaryBytes: bytes.length, programRoot, sourceSha256: await sourceDigest(programRoot) };
    const save = value => fs.writeFile(manifestFile, JSON.stringify(value));
    await save(manifest); assert.deepEqual((await verifiedArtifact(manifestFile)).binary, bytes);
    await save({ ...manifest, features: ['local-test-lottery'] }); await assert.rejects(verifiedArtifact(manifestFile), /without optional features/);
    await save({ ...manifest, lotteryPolicy: 'predictable-local-test-only' }); await assert.rejects(verifiedArtifact(manifestFile), /without optional features/);
    await save(manifest); await fs.writeFile(binary, Buffer.from([127, 69, 76, 71])); await assert.rejects(verifiedArtifact(manifestFile), /differs/);
    await fs.writeFile(binary, bytes); await fs.writeFile(path.join(programRoot, 'src/lib.rs'), 'pub fn changed() {}'); await assert.rejects(verifiedArtifact(manifestFile), /source changed/);
  } finally { await fs.rm(dir, { recursive: true, force: true }); }
});
