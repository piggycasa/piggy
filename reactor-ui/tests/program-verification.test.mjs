import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { PublicKey } from '@solana/web3.js';
import { verifyProgramAccounts, checkLiveProgram, UPGRADEABLE_LOADER } from '../src/program-verification.mjs';

const release = JSON.parse(await fs.readFile(new URL('../public/verification/release.json', import.meta.url)));
const artifact = await fs.readFile(new URL('../public/verification/piggy-mainnet.so', import.meta.url));
function fixture() {
  const program = Buffer.alloc(36); program.writeUInt32LE(2); new PublicKey(release.programData).toBuffer().copy(program, 4);
  const data = Buffer.alloc(45 + artifact.length); data.writeUInt32LE(3); data.writeBigUInt64LE(BigInt(release.deploymentSlot), 4); data[12] = 1; new PublicKey(release.observedUpgradeAuthority).toBuffer().copy(data, 13); artifact.copy(data, 45);
  const account = (bytes, executable) => ({ owner: UPGRADEABLE_LOADER, executable, data: [bytes.toString('base64'), 'base64'] });
  return { release, genesisHash: release.genesisHash, program: account(program, true), programData: account(data, false), data, account };
}
test('published executable matches exact hash and reports retained authority separately', async () => {
  const result = await verifyProgramAccounts(fixture());
  assert.equal(result.hash, release.binarySha256); assert.equal(result.bytes, 267648); assert.equal(result.upgradeAuthority, release.observedUpgradeAuthority); assert.equal(result.authorityMatchesObservation, true);
  assert.equal(release.independentSourceBuildVerified, false); assert.equal(release.independentSecurityAudit, false);
});
test('rejects other clusters, loaders and wrong ProgramData pointers', async () => {
  const f = fixture();
  await assert.rejects(verifyProgramAccounts({ ...f, genesisHash: 'devnet' }), /not connected/);
  await assert.rejects(verifyProgramAccounts({ ...f, program: { ...f.program, owner: release.programId } }), /format/);
  await assert.rejects(verifyProgramAccounts({ ...f, program: { ...f.program, executable: false } }), /expected executable/);
  const pointer = Buffer.from(f.program.data[0], 'base64'); pointer[4] ^= 1;
  await assert.rejects(verifyProgramAccounts({ ...f, program: f.account(pointer, true) }), /expected executable/);
});
test('rejects even a one-byte executable change or changed length', async () => {
  const f = fixture(); f.data[100] ^= 1;
  await assert.rejects(verifyProgramAccounts({ ...f, programData: f.account(f.data, false) }), /differs/);
  await assert.rejects(verifyProgramAccounts({ ...f, programData: f.account(f.data.subarray(0, -1), false) }), /length/);
});
test('changed or removed upgrade authority is accurately reported and never confused with code changes', async () => {
  const f = fixture(); f.data[13] ^= 1;
  const changed = await verifyProgramAccounts({ ...f, programData: f.account(f.data, false) });
  assert.notEqual(changed.upgradeAuthority, release.observedUpgradeAuthority); assert.equal(changed.authorityMatchesObservation, false);
  f.data[12] = 0;
  const immutable = await verifyProgramAccounts({ ...f, programData: f.account(f.data, false) }); assert.equal(immutable.upgradeAuthority, null);
});
test('live check makes only two read-only finalized RPC requests', async () => {
  const f = fixture(); const calls = [];
  const result = await checkLiveProgram({ release, origin: 'https://piggy.casa', fetcher: async (url, init) => {
    assert.equal(url, '/rpc'); const call = JSON.parse(init.body); calls.push(call);
    return Response.json({ jsonrpc: '2.0', id: call.id, result: call.method === 'getGenesisHash' ? release.genesisHash : { context: { slot: 462285024 }, value: [f.program, f.programData] } });
  } });
  assert.equal(result.checkedSlot, 462285024); assert.deepEqual(calls.map(call => call.method), ['getGenesisHash', 'getMultipleAccounts']); assert.equal(calls[1].params[1].commitment, 'finalized');
});
test('failed or incomplete RPC cannot yield a verification result', async () => {
  await assert.rejects(checkLiveProgram({ release, fetcher: async () => new Response('', { status: 503 }) }), /unavailable/);
  await assert.rejects(checkLiveProgram({ release, fetcher: async (_, init) => Response.json({ jsonrpc: '2.0', id: JSON.parse(init.body).id, result: null }) }), /Missing finalized/);
});
