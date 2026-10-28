/** Read-only Streamflow attribution. Never creates, changes or withdraws a lock. */
import { createHash } from 'node:crypto';
import { PublicKey } from '@solana/web3.js';
import { decodeStream, deriveEscrowPDA, STREAM_STRUCT_OFFSET_MINT } from '@streamflow/stream';
import { snapshotMintBalances } from '../src/solana-holder.mjs';

export const STREAMFLOW_PROGRAMS = Object.freeze({
  'mainnet-beta': 'strmRqUCoQUgGUan5YhzUZa6KqdzwX5L6FpUxfmKg5m',
  devnet: 'HqDGZjaVRXJ9MGRQEw7qDc2rAr6iH1n1kAQdCZaCMfMZ',
  testnet: 'HqDGZjaVRXJ9MGRQEw7qDc2rAr6iH1n1kAQdCZaCMfMZ',
});
const key = value => new PublicKey(value).toBase58();
const integer = value => BigInt(value.toString());
const hash = data => createHash('sha256').update(data).digest('hex');

async function readStreams(connection, programId, mint, commitment, minContextSlot) {
  const result = await connection.getProgramAccounts(new PublicKey(programId), {
    commitment, withContext: true, ...(minContextSlot === undefined ? {} : { minContextSlot }),
    filters: [{ memcmp: { offset: STREAM_STRUCT_OFFSET_MINT, bytes: mint } }],
  });
  if (!Number.isSafeInteger(result.context?.slot) || result.context.slot < (minContextSlot ?? 0)) throw new Error('Invalid Streamflow snapshot context.');
  const seen = new Set();
  const streams = result.value.map(({ pubkey, account }) => {
    const address = key(pubkey);
    if (seen.has(address) || !account.owner.equals(new PublicKey(programId))) throw new Error('Duplicate or wrongly owned Streamflow metadata.');
    seen.add(address);
    const stream = decodeStream(account.data);
    if (integer(stream.magic) !== 4n || integer(stream.version) !== 4n || key(stream.mint) !== mint) throw new Error('Unsupported Streamflow metadata version or mint.');
    return { address, hash: hash(account.data), stream };
  }).sort((a, b) => a.address.localeCompare(b.address));
  return { slot: result.context.slot, streams };
}

export function attributeStreamflowLocks(snapshot, streams, { programId, beforeSlot, afterSlot }) {
  if (!Object.values(STREAMFLOW_PROGRAMS).includes(programId)) throw new Error('Unsupported Streamflow program.');
  if (beforeSlot > snapshot.slot || afterSlot < snapshot.slot) throw new Error('Streamflow reads do not bracket the token snapshot.');
  const balances = new Map(snapshot.balances), accounts = new Map(snapshot.tokenAccounts.map(a => [a.address, a]));
  const assignments = [], seen = new Set();
  for (const { address, hash: metadataSha256, stream } of streams) {
    if (stream.closed || integer(stream.canceledAt) !== 0n) continue;
    const sender = key(stream.sender), recipient = key(stream.recipient);
    // Recipient ownership follows the current stream metadata, including transfers.
    if (!PublicKey.isOnCurve(new PublicKey(recipient).toBytes())) continue;
    if (!stream.oldMetadata.equals(PublicKey.default)) throw new Error('Migrated Streamflow recipient locks require separate validation.');
    const escrow = deriveEscrowPDA(new PublicKey(programId), new PublicKey(address)).toBase58();
    if (key(stream.escrowTokens) !== escrow || seen.has(escrow)) throw new Error('Invalid or duplicate Streamflow escrow.');
    seen.add(escrow);
    const deposited = integer(stream.depositedAmount), withdrawn = integer(stream.withdrawnAmount);
    const fees = integer(stream.streamflowFeeTotal) - integer(stream.streamflowFeeWithdrawn) + integer(stream.partnerFeeTotal) - integer(stream.partnerFeeWithdrawn);
    if (deposited < withdrawn || fees < 0n) throw new Error('Invalid Streamflow remaining balance.');
    const amount = deposited - withdrawn;
    if (!amount) continue;
    const account = accounts.get(escrow);
    if (!account || account.owner !== escrow || account.mint !== snapshot.mint || account.delegate || account.closeAuthority || account.amount < amount + fees) throw new Error('Streamflow recipient lock custody does not back its remaining balance.');
    const held = balances.get(escrow) ?? 0n;
    if (held < amount) throw new Error('Streamflow attribution exceeds snapshotted custody.');
    balances.set(escrow, held - amount);
    balances.set(recipient, (balances.get(recipient) ?? 0n) + amount);
    assignments.push({ metadata: address, metadataSha256, escrow, wallet: recipient, sender, recipient, deposited: deposited.toString(), withdrawn: withdrawn.toString(), amount: amount.toString(), escrowBalance: account.amount.toString(), unpaidFees: fees.toString() });
  }
  if ([...balances.values()].reduce((a, b) => a + b, 0n) !== snapshot.totalBalance) throw new Error('Streamflow attribution changed the total token balance.');
  return { ...snapshot, balances, streamflowLocks: { version: 1, programId, beforeSlot, afterSlot, assignments } };
}

export async function snapshotWithStreamflowLocks(connection, mint, { cluster, commitment = 'finalized', minContextSlot } = {}) {
  const programId = STREAMFLOW_PROGRAMS[cluster];
  if (!programId) throw new Error('Streamflow recipient lock attribution requires a supported public cluster.');
  const mintAddress = key(mint);
  for (let attempt = 0; attempt < 3; attempt++) {
    const before = await readStreams(connection, programId, mintAddress, commitment, minContextSlot);
    const snapshot = await snapshotMintBalances(connection, mintAddress, { commitment, minContextSlot: before.slot, includeAccounts: true });
    const after = await readStreams(connection, programId, mintAddress, commitment, snapshot.slot);
    // A transfer, cancellation, withdrawal or new lock must not be mixed with
    // a token bank from before that change. Restart the whole read instead.
    if (JSON.stringify(before.streams.map(s => [s.address, s.hash])) !== JSON.stringify(after.streams.map(s => [s.address, s.hash]))) { minContextSlot = after.slot; continue; }
    return attributeStreamflowLocks(snapshot, after.streams, { programId, beforeSlot: before.slot, afterSlot: after.slot });
  }
  throw new Error('Streamflow metadata kept changing during the holder snapshot; publication stopped.');
}
