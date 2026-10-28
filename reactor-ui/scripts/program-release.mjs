/** Shared read-only operator guard. No keys, signing, HTTP server or CLI state. */
import { createHash } from 'node:crypto';
import { pk } from '../src/solana-instructions.mjs';

export async function verifyOperatorProgram(ctx, minimumSlot = ctx.minContextSlot ?? 0) {
  if (ctx.config.localTest === true && ctx.config.cluster === 'localnet') return;
  const { programBinarySha256, programBinaryBytes } = ctx.config;
  if (!/^[a-f\d]{64}$/i.test(String(programBinarySha256)) || !Number.isSafeInteger(programBinaryBytes) || programBinaryBytes < 1) throw new Error('Operator requires the reviewed binary SHA-256 and byte length.');
  const loader = pk('BPFLoaderUpgradeab1e11111111111111111111111');
  const program = await ctx.connection.getAccountInfoAndContext(pk(ctx.config.programId), { commitment: 'confirmed', minContextSlot: minimumSlot });
  if (!Number.isSafeInteger(program.context?.slot) || program.context.slot < minimumSlot || !program.value?.executable || !program.value.owner.equals(loader) || program.value.data.length !== 36 || program.value.data.readUInt32LE(0) !== 2) throw new Error('Operator expected the reviewed upgradeable-loader executable.');
  const address = pk(program.value.data.subarray(4, 36));
  const result = await ctx.connection.getAccountInfoAndContext(address, { commitment: 'confirmed', minContextSlot: program.context.slot });
  const info = result.value;
  if (!Number.isSafeInteger(result.context?.slot) || result.context.slot < program.context.slot || !info?.owner.equals(loader) || info.data.length < 45 + programBinaryBytes || info.data.readUInt32LE(0) !== 3 || info.data[12] > 1) throw new Error('Operator ProgramData is missing or has the wrong owner/layout.');
  const binary = info.data.subarray(45, 45 + programBinaryBytes);
  if (createHash('sha256').update(binary).digest('hex') !== programBinarySha256.toLowerCase() || info.data.subarray(45 + programBinaryBytes).some(byte => byte !== 0)) throw new Error('Operator executable changed from the reviewed release.');
  const authority = info.data[12] ? pk(info.data.subarray(13, 45)).toBase58() : null;
  const expected = ctx.config.expectedAuthorities?.upgradeAuthority ?? ctx.config.upgradeAuthority ?? null;
  if (authority !== expected) throw new Error('Operator program upgrade authority differs from the reviewed role.');
}
