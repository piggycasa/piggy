/** Rehearsal diagnostics and replay protection; no transaction signing or sending. */
import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { isTransactionSignature } from '../src/solana-signature.mjs';

export function deploymentCliArguments({ rpcUrl, payerKeyFile, binary, programKeyFile, bufferKeyFile, upgradeAuthorityKeyFile, binaryBytes, transport = 'rpc' }) {
  if (!['rpc', 'tpu'].includes(transport)) throw new Error('Deployment transport must be rpc or tpu.');
  if (!Number.isSafeInteger(binaryBytes) || binaryBytes < 1) throw new Error('Deployment requires the reviewed binary byte length.');
  return ['--url', rpcUrl, '--keypair', payerKeyFile, '--commitment', 'confirmed', '--output', 'json', 'program', 'deploy', binary, '--program-id', programKeyFile, '--buffer', bufferKeyFile, '--upgrade-authority', upgradeAuthorityKeyFile, '--max-len', String(binaryBytes), '--max-sign-attempts', '3', transport === 'rpc' ? '--use-rpc' : '--use-tpu-client'];
}

export function deploymentReceiptDetails(output, { expectedProgramId, transport }) {
  if (output?.programId !== expectedProgramId || !isTransactionSignature(output?.signature)) throw new Error('Deployment CLI output must contain the expected program ID and actual signed deployment transaction signature. Inspect complete CLI logs before retrying.');
  return { programId: output.programId, signature: output.signature, transport };
}

export function assertSimulationCustomError(error, expectedCode, expectedInstructionIndex = 4) {
  const detail = error?.InstructionError;
  if (!Array.isArray(detail) || detail[0] !== expectedInstructionIndex || detail[1]?.Custom !== expectedCode) throw new Error(`Guard simulation expected Custom ${expectedCode} at instruction ${expectedInstructionIndex}, received ${JSON.stringify(error)}.`);
}

export async function archivePriorRehearsal(filename, connection) {
  let previous;
  try { previous = JSON.parse(await fs.readFile(filename, 'utf8')); }
  catch (error) { if (error.code === 'ENOENT') return null; throw new Error('Previous rehearsal report is unreadable; preserve and reconcile it before retrying.'); }
  const transactions = previous.transactions ?? [];
  if (!Array.isArray(transactions)) throw new Error('Previous rehearsal has malformed transaction history.');
  const terminal = new Set(['confirmed', 'finalized', 'failed']);
  const pending = transactions.filter(row => !terminal.has(row.status));
  if (pending.length) {
    if (pending.some(row => typeof row.signature !== 'string' || !row.signature)) throw new Error('Previous rehearsal has an unresolved transaction without a signature. Reconcile it before retrying.');
    const statuses = (await connection.getSignatureStatuses(pending.map(row => row.signature), { searchTransactionHistory: true })).value;
    for (let i = 0; i < pending.length; i++) {
      const status = statuses[i];
      if (status?.err) { pending[i].status = 'failed'; pending[i].error = status.err; }
      else if (status && ['confirmed', 'finalized'].includes(status.confirmationStatus)) { pending[i].status = status.confirmationStatus; pending[i].slot = status.slot; }
      else throw new Error(`Previous rehearsal signature ${pending[i].signature} is still unconfirmed or unknown. The original report is preserved; reconcile it before retrying.`);
    }
  }
  const directory = path.join(path.dirname(filename), 'reports');
  await fs.mkdir(directory, { recursive: true, mode: 0o700 });
  const archive = path.join(directory, `rehearsal-${new Date().toISOString().replace(/[:.]/g, '-')}-${process.pid}.json`);
  previous.archivedAt = new Date().toISOString();
  await fs.writeFile(archive, JSON.stringify(previous, null, 2) + '\n', { mode: 0o600, flag: 'wx' });
  return archive;
}

export async function acquireRehearsalLock(directory) {
  await fs.mkdir(directory, { recursive: true, mode: 0o700 });
  const filename = path.join(directory, 'rehearsal.lock');
  let lock;
  try { lock = await fs.open(filename, 'wx', 0o600); }
  catch (error) { if (error.code === 'EEXIST') throw new Error('Rehearsal lock exists. Confirm that the previous rehearsal and deployment process stopped before recovering it.'); throw error; }
  await lock.writeFile(JSON.stringify({ pid: process.pid, startedAt: new Date().toISOString() })); await lock.sync();
  return async () => { await lock.close(); await fs.unlink(filename); };
}

export async function runLoggedDeployment(args, { directory, timeoutMs = 240_000 } = {}) {
  await fs.mkdir(directory, { recursive: true, mode: 0o700 });
  const files = { stdoutLog: path.join(directory, 'deploy.stdout.log'), stderrLog: path.join(directory, 'deploy.stderr.log'), combinedLog: path.join(directory, 'deploy.log') };
  const handles = await Promise.all(Object.values(files).map(filename => fs.open(filename, 'w', 0o600)));
  const stdout = [], stderr = []; let writes = Promise.resolve(), writeError, spawnError, timedOut = false;
  const child = spawn('solana', args, { stdio: ['ignore', 'pipe', 'pipe'] });
  const append = (chunks, handle, chunk) => { chunks.push(Buffer.from(chunk)); writes = writes.then(async () => { await handle.write(chunk); await handles[2].write(chunk); }).catch(error => { writeError ??= error; child.kill('SIGTERM'); }); };
  child.stdout.on('data', chunk => append(stdout, handles[0], chunk));
  child.stderr.on('data', chunk => append(stderr, handles[1], chunk));
  child.once('error', error => { spawnError = error; });
  let forceStop;
  const timer = setTimeout(() => { timedOut = true; child.kill('SIGTERM'); forceStop = setTimeout(() => child.kill('SIGKILL'), 5_000); }, timeoutMs);
  const ended = await new Promise(resolve => child.once('close', (code, signal) => resolve({ code, signal })));
  clearTimeout(timer); clearTimeout(forceStop); await writes;
  try { for (const handle of handles) await handle.sync(); } finally { await Promise.all(handles.map(handle => handle.close())); }
  const result = { ...files, exitCode: ended.code, signal: ended.signal, timedOut, stdout: Buffer.concat(stdout).toString(), stderr: Buffer.concat(stderr).toString() };
  if (writeError || spawnError || timedOut || ended.code !== 0) {
    const error = new Error(`Solana deployment ${timedOut ? 'timed out' : `failed with exit ${ended.code}`}. Complete stdout/stderr are retained at ${files.stdoutLog} and ${files.stderrLog}; reconcile the explicit buffer before retrying.`);
    error.deploymentDiagnostic = { ...result, ioError: writeError?.message, spawnError: spawnError?.message }; throw error;
  }
  return result;
}
