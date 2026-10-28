import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { AccountLayout, MintLayout, AccountState } from '@solana/spl-token';
import { Connection, PublicKey } from '@solana/web3.js';

const require = createRequire(import.meta.url);
const layoutRequire = createRequire(require.resolve('@solana/buffer-layout-utils'));
const codec = layoutRequire('bigint-buffer');
const RpcClient = require('jayson/lib/client/browser');
const { u64, u128, u192, u256, u64be, u128be, u192be, u256be } = require('@solana/buffer-layout-utils');

test('replacement integer codec preserves endian bytes without mutating input', () => {
  const bytes = Buffer.from([0x01, 0x23, 0x45, 0x67, 0x89, 0xab, 0xcd, 0xef]);
  const saved = Buffer.from(bytes);
  assert.equal(codec.toBigIntBE(bytes), 0x0123456789abcdefn);
  assert.equal(codec.toBigIntLE(bytes), 0xefcdab8967452301n);
  assert.deepEqual(codec.toBufferBE(0x0123456789abcdefn, 8), bytes);
  assert.deepEqual(codec.toBufferLE(0xefcdab8967452301n, 8), bytes);
  assert.deepEqual(bytes, saved);
  for (const endian of ['BE', 'LE']) {
    assert.equal(codec['toBigInt' + endian](Buffer.alloc(0)), 0n);
    assert.deepEqual(codec['toBuffer' + endian](0n, 0), Buffer.alloc(0));
    assert.deepEqual(codec['toBuffer' + endian](1n, 3), Buffer.from(endian === 'BE' ? [0, 0, 1] : [1, 0, 0]));
  }
});

test('integer codec round trips independent unsigned fixtures including large byte buffers', () => {
  for (const width of [1, 8, 16, 24, 32, 128, 1024, 4096]) {
    const bytes = Buffer.from(Array.from({ length: width }, (_, i) => (i * 71 + width) & 255));
    let expected = 0n;
    for (const byte of bytes) expected = (expected << 8n) + BigInt(byte);
    assert.equal(codec.toBigIntBE(bytes), expected);
    assert.deepEqual(codec.toBufferBE(expected, width), bytes);
    assert.equal(codec.toBigIntLE(Uint8Array.from(bytes).reverse()), expected);
    assert.deepEqual(codec.toBufferLE(expected, width), Buffer.from(bytes).reverse());
  }
});

test('unsigned financial codecs reject truncation, invalid widths and excessive allocation', () => {
  for (const endian of ['BE', 'LE']) {
    const encode = codec['toBuffer' + endian];
    for (const [value, width] of [[-1n, 8], [256n, 1], [1n, 0], [0n, -1], [0n, 1.5], [0n, NaN], [0n, Infinity], [0n, 1_048_577]]) {
      assert.throws(() => encode(value, width), RangeError);
    }
    assert.throws(() => encode(1, 8), TypeError);
    assert.throws(() => codec['toBigInt' + endian]('ff'), TypeError);
    assert.throws(() => codec['toBigInt' + endian](Buffer.alloc(1_048_577)), RangeError);
  }
});

test('real SPL integer layouts retain full u64, u128, u192 and u256 precision', () => {
  for (const [width, le, be] of [[8, u64, u64be], [16, u128, u128be], [24, u192, u192be], [32, u256, u256be]]) {
    const max = (1n << BigInt(width * 8)) - 1n;
    for (const layout of [le(), be()]) {
      const bytes = Buffer.alloc(width);
      layout.encode(max, bytes, 0);
      assert(bytes.every(byte => byte === 255));
      assert.equal(layout.decode(bytes), max);
      assert.throws(() => layout.encode(max + 1n, bytes, 0), RangeError);
    }
  }
});

test('actual SPL token account and mint layouts preserve amounts above Number safe range', () => {
  const zero = new PublicKey(new Uint8Array(32));
  const max = (1n << 64n) - 1n;
  const account = Buffer.alloc(AccountLayout.span);
  AccountLayout.encode({ mint: zero, owner: zero, amount: max, delegateOption: 0, delegate: zero, state: AccountState.Initialized, isNativeOption: 0, isNative: 0n, delegatedAmount: 0n, closeAuthorityOption: 0, closeAuthority: zero }, account);
  assert.equal(AccountLayout.decode(account).amount, max);
  const mint = Buffer.alloc(MintLayout.span);
  MintLayout.encode({ mintAuthorityOption: 0, mintAuthority: zero, supply: max, decimals: 6, isInitialized: true, freezeAuthorityOption: 0, freezeAuthority: zero }, mint);
  assert.equal(MintLayout.decode(mint).supply, max);
});

test('patched Jayson browser client preserves single, batch and RPC error responses', async () => {
  const calls = [];
  const rpc = new RpcClient((body, callback) => {
    const input = JSON.parse(body);
    calls.push(input);
    callback(null, JSON.stringify(Array.isArray(input) ? input.map(item => ({ jsonrpc: '2.0', id: item.id, result: item.method })) : { jsonrpc: '2.0', id: input.id, result: input.params }));
  });
  const response = await new Promise((resolve, reject) => rpc.request('getSlot', [1], (error, result) => error ? reject(error) : resolve(result)));
  assert.deepEqual(response.result, [1]);
  assert.match(calls[0].id, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  const batch = [rpc.request('one', [], 1), rpc.request('two', [], 2)];
  const batchResponse = await new Promise((resolve, reject) => rpc.request(batch, (error, result) => error ? reject(error) : resolve(result)));
  assert.deepEqual(batchResponse.map(item => item.result), ['one', 'two']);
  const failure = new RpcClient((_body, callback) => callback(new Error('RPC unavailable')));
  await assert.rejects(new Promise((resolve, reject) => failure.request('getSlot', [], (error, result) => error ? reject(error) : resolve(result))), /RPC unavailable/);
});

test('Solana Web3 uses patched JSON-RPC client with unchanged response validation', async () => {
  const methods = [];
  const connection = new Connection('http://127.0.0.1:18899', {
    fetch: async (_url, options) => {
      const request = JSON.parse(options.body);
      methods.push(request.method);
      return new Response(JSON.stringify({ jsonrpc: '2.0', id: request.id, result: request.method === 'getSlot' ? 123 : 'genesis-test' }));
    },
  });
  assert.equal(await connection.getSlot(), 123);
  assert.equal(await connection.getGenesisHash(), 'genesis-test');
  assert.deepEqual(methods, ['getSlot', 'getGenesisHash']);
});
