#!/usr/bin/env node
/** Watch public proof exports; only the child uploader reads its private upload token. */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { durableJson, withPublisherLock } from './holder-publisher.mjs';

const SCRIPT = path.join(path.dirname(fileURLToPath(import.meta.url)), 'sync-holder-proofs.mjs');
const sha256 = value => createHash('sha256').update(value).digest('hex');

async function fingerprint(configFile) {
  const stat = await fs.stat(configFile); if (stat.mode & 0o077) throw new Error('Proof watcher configuration must be private (0600).');
  const config = JSON.parse(await fs.readFile(configFile, 'utf8'));
  if (typeof config.proofDirectory !== 'string' || typeof config.siteUrl !== 'string') throw new Error('Proof watcher requires the uploader configuration.');
  const root = await fs.realpath(path.resolve(path.dirname(configFile), config.proofDirectory)), index = path.join(root, 'index.json');
  if (await fs.realpath(index) !== index) throw new Error('Proof watcher index must not be a symlink.');
  if ((await fs.stat(index)).size > 4 * 1024 * 1024) throw new Error('Proof index exceeds the watcher limit.');
  const bytes = await fs.readFile(index), parsed = JSON.parse(bytes);
  if (parsed.schemaVersion !== 1 || !Array.isArray(parsed.epochs)) throw new Error('Proof watcher index is invalid.');
  return { indexSha256: sha256(bytes), destinationSha256: sha256(JSON.stringify({ siteUrl: config.siteUrl, proofDirectory: root })) };
}

export function runProofSyncChild(configFile, { timeoutMs = 120_000 } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [SCRIPT, configFile], { stdio: ['ignore', 'pipe', 'ignore'] });
    let output = '', timedOut = false, killTimer;
    const timer = setTimeout(() => { timedOut = true; child.kill('SIGTERM'); killTimer = setTimeout(() => child.kill('SIGKILL'), 2_000); }, timeoutMs);
    child.stdout.on('data', chunk => { if (output.length < 65_536) output += chunk.toString(); });
    child.once('error', () => { clearTimeout(timer); clearTimeout(killTimer); reject(new Error('Proof synchronization process could not start.')); });
    child.once('close', code => {
      clearTimeout(timer); clearTimeout(killTimer);
      if (code !== 0 || timedOut) { reject(new Error(timedOut ? 'Proof synchronization timed out; the same export will be retried.' : `Proof synchronization failed (exit ${Number.isInteger(code) ? code : 'signal'}); the same export will be retried.`)); return; }
      let result; try { result = JSON.parse(output); } catch { reject(new Error('Proof synchronization did not return a valid completion result.')); return; }
      if (result.ok !== true || !Number.isSafeInteger(result.uploaded) || result.uploaded < 1) { reject(new Error('Proof synchronization did not confirm successful uploads.')); return; }
      resolve({ uploaded: result.uploaded, wallets: Number.isSafeInteger(result.wallets) ? result.wallets : 0, epochs: Number.isSafeInteger(result.epochs) ? result.epochs : 0 });
    });
  });
}

/** Caller owns the single-writer lock; injected sync lets tests avoid HTTP and tokens. */
export async function syncChangedProofIndex({ configFile, sync = runProofSyncChild } = {}) {
  const filename = path.resolve(configFile), stateFile = `${filename}.watch-state.json`, current = await fingerprint(filename);
  let previous;
  try {
    if ((await fs.stat(stateFile)).mode & 0o077) throw new Error('Proof watcher state must be private (0600).');
    previous = JSON.parse(await fs.readFile(stateFile, 'utf8'));
  } catch (error) { if (error.code !== 'ENOENT') throw error; }
  if (previous?.schemaVersion === 1 && previous.indexSha256 === current.indexSha256 && previous.destinationSha256 === current.destinationSha256) return { status: 'unchanged', indexSha256: current.indexSha256 };
  const result = await sync(filename), after = await fingerprint(filename);
  if (after.indexSha256 !== current.indexSha256 || after.destinationSha256 !== current.destinationSha256) return { status: 'changed-during-upload' };
  await durableJson(stateFile, { schemaVersion: 1, ...current, synchronizedAt: new Date().toISOString() });
  return { status: 'synchronized', indexSha256: current.indexSha256, ...result };
}

async function main() {
  const args = process.argv.slice(2), values = {};
  for (let i = 0; i < args.length; i += 2) { if (!['--config', '--interval-seconds'].includes(args[i]) || !args[i + 1] || values[args[i]]) throw new Error('Usage: node scripts/watch-holder-proofs.mjs --config PRIVATE.json [--interval-seconds 30]'); values[args[i]] = args[i + 1]; }
  if (!values['--config']) throw new Error('A private --config is required.');
  const configFile = path.resolve(values['--config']), interval = Number(values['--interval-seconds'] ?? 30);
  if (!Number.isFinite(interval) || interval < 1 || interval > 3600) throw new Error('Proof watcher interval must be 1–3600 seconds.');
  const shutdown = new AbortController(), stop = () => shutdown.abort(); process.once('SIGTERM', stop); process.once('SIGINT', stop);
  try {
    await withPublisherLock(`${configFile}.watch`, async () => {
      while (!shutdown.signal.aborted) {
        try { const result = await syncChangedProofIndex({ configFile }); if (result.status !== 'unchanged') console.log(JSON.stringify(result)); }
        catch { console.error('Proof synchronization is pending; retrying on the next interval. Check the private configuration and upload service.'); }
        if (shutdown.signal.aborted) break;
        try { await delay(interval * 1000, undefined, { signal: shutdown.signal }); } catch (error) { if (error.name !== 'AbortError') throw error; }
      }
    });
  } finally { process.removeListener('SIGTERM', stop); process.removeListener('SIGINT', stop); }
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main().catch(() => { console.error('Proof watcher could not start. Check its private configuration and single-writer lock.'); process.exitCode = 1; });
