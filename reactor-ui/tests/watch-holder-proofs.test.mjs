import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { syncChangedProofIndex } from '../scripts/watch-holder-proofs.mjs';

async function fixture(t) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'proof-watch-')); t.after(() => fs.rm(root, { recursive: true, force: true }));
  const configFile = path.join(root, 'private.json'), proofDirectory = path.join(root, 'proofs'); await fs.mkdir(proofDirectory);
  await fs.writeFile(configFile, JSON.stringify({ siteUrl: 'https://piggy.example', proofDirectory, tokenFile: 'NEVER_READ_BY_WATCHER' }), { mode: 0o600 });
  const update = epochs => fs.writeFile(path.join(proofDirectory, 'index.json'), JSON.stringify({ schemaVersion: 1, epochs })); await update([]);
  return { root, configFile, update };
}

test('unchanged successful export makes no upload call; changed index or destination synchronizes again', async t => {
  const { configFile, update } = await fixture(t); let calls = 0; const sync = async () => { calls++; return { uploaded: 1 }; };
  assert.equal((await syncChangedProofIndex({ configFile, sync })).status, 'synchronized');
  assert.equal((await syncChangedProofIndex({ configFile, sync })).status, 'unchanged'); assert.equal(calls, 1);
  await update([{ epoch: '1' }]); assert.equal((await syncChangedProofIndex({ configFile, sync })).status, 'synchronized'); assert.equal(calls, 2);
  const config = JSON.parse(await fs.readFile(configFile)); config.siteUrl = 'https://new-piggy.example'; await fs.writeFile(configFile, JSON.stringify(config));
  assert.equal((await syncChangedProofIndex({ configFile, sync })).status, 'synchronized'); assert.equal(calls, 3);
  assert.equal((await fs.stat(`${configFile}.watch-state.json`)).mode & 0o077, 0);
});

test('failed upload never advances the marker and retries the identical export', async t => {
  const { configFile } = await fixture(t); let calls = 0;
  const sync = async () => { if (++calls === 1) throw new Error('failure'); return { uploaded: 1 }; };
  await assert.rejects(syncChangedProofIndex({ configFile, sync })); await assert.rejects(fs.access(`${configFile}.watch-state.json`));
  assert.equal((await syncChangedProofIndex({ configFile, sync })).status, 'synchronized'); assert.equal(calls, 2);
});

test('publication racing the upload stays unmarked and is retried from its new index', async t => {
  const { configFile, update } = await fixture(t);
  assert.equal((await syncChangedProofIndex({ configFile, sync: async () => { await update([{ epoch: '1' }]); return { uploaded: 1 }; } })).status, 'changed-during-upload');
  await assert.rejects(fs.access(`${configFile}.watch-state.json`));
  assert.equal((await syncChangedProofIndex({ configFile, sync: async () => ({ uploaded: 1 }) })).status, 'synchronized');
});
