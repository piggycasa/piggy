import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { base58Encode } from '../src/solana-signature.mjs';
import { archivePriorRehearsal, acquireRehearsalLock, runLoggedDeployment, assertSimulationCustomError, deploymentCliArguments, deploymentReceiptDetails } from '../scripts/publicnet-rehearsal-state.mjs';

test('deployment transport flags are exclusive and both argument arrays pass dry CLI help parsing', () => {
  const fields = { rpcUrl: 'https://api.testnet.solana.com', payerKeyFile: '/tmp/piggy-test-payer.json', binary: '/tmp/piggy-test-program.so', programKeyFile: '/tmp/piggy-test-program.json', bufferKeyFile: '/tmp/piggy-test-buffer.json', upgradeAuthorityKeyFile: '/tmp/piggy-test-payer.json', binaryBytes: 267648 };
  for (const transport of ['rpc', 'tpu']) {
    const args = deploymentCliArguments({ ...fields, transport });
    assert.equal(args.includes('--use-rpc'), transport === 'rpc'); assert.equal(args.includes('--use-tpu-client'), transport === 'tpu');
    assert.equal(args[args.indexOf('--max-sign-attempts') + 1], '3');
    const result = spawnSync('solana', [...args, '--help'], { encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr); assert(result.stdout.includes('solana-program-deploy'));
  }
  assert.throws(() => deploymentCliArguments({ ...fields, transport: 'unknown' }), /rpc or tpu/);
});

test('deployment receipts require the actual signed CLI signature and expected program identity', () => {
  const programId = 'GGadGZzXKX9Kznha7h61SMgjBFViHKSXEDxwx93gnMjh', signature = base58Encode(new Uint8Array(64).fill(7));
  assert.deepEqual(deploymentReceiptDetails({ programId, signature }, { expectedProgramId: programId, transport: 'tpu' }), { programId, signature, transport: 'tpu' });
  assert.throws(() => deploymentReceiptDetails({ programId }, { expectedProgramId: programId, transport: 'rpc' }), /actual signed/);
  assert.throws(() => deploymentReceiptDetails({ programId: 'wrong', signature }, { expectedProgramId: programId, transport: 'tpu' }), /expected program/);
});

test('guard simulations must reject for the precise purchase instruction and custom code', () => {
  assert.doesNotThrow(() => assertSimulationCustomError({ InstructionError: [4, { Custom: 22 }] }, 22));
  assert.doesNotThrow(() => assertSimulationCustomError({ InstructionError: [4, { Custom: 21 }] }, 21));
  for (const error of [null, 'BlockhashNotFound', { InstructionError: [1, { Custom: 22 }] }, { InstructionError: [4, { Custom: 21 }] }]) assert.throws(() => assertSimulationCustomError(error, 22));
});

test('unknown submitted signatures preserve the original report and block a fresh run', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'piggy-rehearsal-pending-'));
  try {
    const filename = path.join(dir, 'rehearsal-report.json'), original = JSON.stringify({ transactions: [{ signature: 'pending-test-signature', status: 'submitted' }] });
    await fs.writeFile(filename, original);
    await assert.rejects(archivePriorRehearsal(filename, { getSignatureStatuses: async () => ({ value: [null] }) }), /unconfirmed or unknown/);
    assert.equal(await fs.readFile(filename, 'utf8'), original);
    await assert.rejects(fs.access(path.join(dir, 'reports')));
  } finally { await fs.rm(dir, { recursive: true, force: true }); }
});

test('reconciled signatures are retained in an archived report before replacement', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'piggy-rehearsal-resolved-'));
  try {
    const filename = path.join(dir, 'rehearsal-report.json');
    await fs.writeFile(filename, JSON.stringify({ transactions: [{ signature: 'confirmed-test-signature', status: 'submitted' }] }));
    const archive = await archivePriorRehearsal(filename, { getSignatureStatuses: async (signatures, options) => { assert.equal(options.searchTransactionHistory, true); assert.equal(signatures.length, 1); return { value: [{ confirmationStatus: 'finalized', slot: 42, err: null }] }; } });
    const stored = JSON.parse(await fs.readFile(archive, 'utf8'));
    assert.equal(stored.transactions[0].status, 'finalized'); assert.equal(stored.transactions[0].slot, 42);
    assert.equal(JSON.parse(await fs.readFile(filename, 'utf8')).transactions[0].status, 'submitted');
    assert.equal((await fs.stat(archive)).mode & 0o077, 0);
  } finally { await fs.rm(dir, { recursive: true, force: true }); }
});

test('concurrent rehearsals cannot share the same deployment buffer and report', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'piggy-rehearsal-lock-'));
  try { const release = await acquireRehearsalLock(dir); await assert.rejects(acquireRehearsalLock(dir), /lock exists/); await release(); const again = await acquireRehearsalLock(dir); await again(); }
  finally { await fs.rm(dir, { recursive: true, force: true }); }
});

test('failed CLI diagnostics remain complete in separate private logs and error details', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'piggy-rehearsal-logs-'));
  try {
    const badFlag = '--invalid-piggy-rehearsal-option-' + 'x'.repeat(1500);
    let failure;
    try { await runLoggedDeployment([badFlag], { directory: dir, timeoutMs: 5000 }); } catch (error) { failure = error; }
    assert(failure?.deploymentDiagnostic);
    const detail = failure.deploymentDiagnostic, stderr = await fs.readFile(detail.stderrLog, 'utf8');
    assert(stderr.length > 1500); assert.equal(stderr, detail.stderr); assert(stderr.includes(badFlag));
    assert.equal((await fs.stat(detail.stderrLog)).mode & 0o077, 0);
    assert((await fs.readFile(detail.combinedLog, 'utf8')).includes(badFlag));
  } finally { await fs.rm(dir, { recursive: true, force: true }); }
});
