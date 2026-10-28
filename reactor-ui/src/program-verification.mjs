import { PublicKey } from '@solana/web3.js';

export const UPGRADEABLE_LOADER = 'BPFLoaderUpgradeab1e11111111111111111111111';
const dataBytes = account => {
  if (account?.owner !== UPGRADEABLE_LOADER || !Array.isArray(account.data) || account.data[1] !== 'base64' || typeof account.data[0] !== 'string' || account.data[0].length > 1_000_000) throw new Error('Unexpected program account format.');
  return Uint8Array.from(atob(account.data[0]), character => character.charCodeAt(0));
};

/** Checks release bytes and loader metadata, not source reproducibility or safety. */
export async function verifyProgramAccounts({ genesisHash, program, programData, release, digest = bytes => globalThis.crypto.subtle.digest('SHA-256', bytes) }) {
  if (genesisHash !== release.genesisHash) throw new Error('The RPC is not connected to the expected Solana mainnet.');
  if (!Number.isSafeInteger(release.binaryBytes) || release.binaryBytes < 1 || !/^[a-f0-9]{64}$/.test(release.binarySha256)) throw new Error('Invalid published release manifest.');
  const programBytes = dataBytes(program);
  if (!program.executable || programBytes.length !== 36 || new DataView(programBytes.buffer).getUint32(0, true) !== 2 || new PublicKey(programBytes.slice(4)).toBase58() !== release.programData) throw new Error('Program address does not point to the expected executable data.');
  const bytes = dataBytes(programData);
  if (programData.executable || bytes.length !== release.binaryBytes + 45 || new DataView(bytes.buffer).getUint32(0, true) !== 3 || ![0, 1].includes(bytes[12])) throw new Error('Executable layout or length differs from this release.');
  const slot = new DataView(bytes.buffer).getBigUint64(4, true);
  const upgradeAuthority = bytes[12] === 1 ? new PublicKey(bytes.slice(13, 45)).toBase58() : null;
  const hash = Array.from(new Uint8Array(await digest(bytes.slice(45))), byte => byte.toString(16).padStart(2, '0')).join('');
  if (hash !== release.binarySha256) throw new Error('Deployed code differs from this published release. Do not treat it as verified.');
  return { hash, bytes: release.binaryBytes, deploymentSlot: slot.toString(), upgradeAuthority, authorityMatchesObservation: upgradeAuthority === release.observedUpgradeAuthority };
}

export async function checkLiveProgram({ release, fetcher = globalThis.fetch, origin = globalThis.location?.origin } = {}) {
  let id = 0;
  const rpc = async (method, params = []) => {
    const response = await fetcher('/rpc', { method: 'POST', headers: { 'content-type': 'application/json', ...(origin ? { origin } : {}) }, body: JSON.stringify({ jsonrpc: '2.0', id: ++id, method, params }), signal: AbortSignal.timeout(20_000) });
    if (!response.ok) throw new Error('Live RPC check is unavailable. Try again later.');
    const body = await response.json();
    if (body.error || body.id !== id || body.jsonrpc !== '2.0') throw new Error('Live RPC check failed. No verification result is available.');
    return body.result;
  };
  const genesisHash = await rpc('getGenesisHash');
  const accounts = await rpc('getMultipleAccounts', [[release.programId, release.programData], { encoding: 'base64', commitment: 'finalized' }]);
  if (!Number.isSafeInteger(accounts?.context?.slot) || !Array.isArray(accounts.value) || accounts.value.length !== 2) throw new Error('Missing finalized account data.');
  return { ...await verifyProgramAccounts({ genesisHash, program: accounts.value[0], programData: accounts.value[1], release }), checkedSlot: accounts.context.slot, checkedAt: new Date().toISOString() };
}
