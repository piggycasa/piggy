import test from 'node:test';
import assert from 'node:assert/strict';
import {
  keysForLamports, lamportsForKeys, quoteKeysFromLamports, costForExactKeys,
  MAX_CURVE_LAMPORTS, MAX_CURVE_KEYS,
} from '../src/solana-curve.mjs';

const SOL = 1_000_000_000n;

test('sol_to_keys reproduces the upstream Rust conversion vectors including both bounds', () => {
  // src/math/curve.rs::test_sol_to_keys and test_keys_received.
  for (const [lamports, keys] of [
    [0n, 0n], [1n, 0n], [75_000n, 0n], [75_001n, 1n],
    [SOL, 13_153n], [10n * SOL, 118_665n], [100n * SOL, 748_983n],
    [SOL * SOL, 3_577_228_796n], [10n * SOL * SOL, 11_313_228_509n],
  ]) assert.equal(keysForLamports(lamports), keys, `${lamports} lamports`);
});

test('native keys_to_sol reproduces every upstream forward conversion vector', () => {
  for (const [keys, lamports] of [
    [0n, 0n], [1n, 75_000n], [100n, 7_500_773n],
    [10_000n, 757_811_718n], [1_000_000n, 153_124_921_875n],
    [11_313_228_509n, 9_999_999_998_820_763_638n],
  ]) assert.equal(lamportsForKeys(keys), lamports, `${keys} keys`);

  // Upstream sol_received vectors exercise differences of the native formula.
  assert.equal((lamportsForKeys(1_000n) - lamportsForKeys(900n)) / 100n, 75_148n);
  assert.equal((lamportsForKeys(100_000n) - lamportsForKeys(90_000n)) / 10_000n, 89_843n);
  assert.equal((lamportsForKeys(100_000_000n) - lamportsForKeys(90_000_000n)) / 10_000_000n, 14_918_749n);
  assert.equal(lamportsForKeys(MAX_CURVE_KEYS - 1n) - lamportsForKeys(MAX_CURVE_KEYS - 2n), 1_767_766_955n);
});

test('keys_received matches the original cumulative-money purchase vectors', () => {
  for (const [basis, payment, keys] of [
    [0n, 0n, 0n], [0n, 75_000n, 0n], [0n, 75_001n, 1n],
    [0n, SOL, 13_153n], [100n * SOL, SOL, 5_197n],
    [10_000n * SOL, SOL, 565n],
    [MAX_CURVE_LAMPORTS - 1_767_766_955n, 1_767_766_955n, 1n],
  ]) assert.equal(quoteKeysFromLamports(basis, payment), keys);
});

test('minimum exact-key quotes correct the native forward rounding gap', () => {
  // Constants independently checked with Python integer math.isqrt, not a
  // floating-point approximation or the module's own forward conversion.
  for (const [basis, count, minimum] of [
    [0n, 1n, 75_001n], [0n, 2n, 150_001n], [0n, 10n, 750_008n],
    [0n, 10_000n, 757_811_719n], [75_001n, 1n, 75_000n],
    [SOL, 1n, 66_763n], [SOL, 10n, 760_267n],
    [SOL, 10_000n, 778_352_989n], [100n * SOL, 10n, 1_800_396n],
    [10_000n * SOL, 100n, 175_631_579n],
  ]) {
    const result = costForExactKeys(basis, count);
    assert.deepEqual(result, { ok: true, lamports: minimum, keys: count });
    assert.equal(quoteKeysFromLamports(basis, minimum), count);
    assert.ok(quoteKeysFromLamports(basis, minimum - 1n) < count);
  }
  assert.equal(quoteKeysFromLamports(0n, lamportsForKeys(1n)), 0n);
  assert.deepEqual(costForExactKeys(SOL, 0n), { ok: true, lamports: 0n, keys: 0n });
});

test('a funded new round prices against opening rollover plus full contributions', () => {
  const openingRollover = 2n * SOL;
  const contributions = 500_000_000n;
  const basis = openingRollover + contributions;
  const quote = costForExactKeys(basis, 5n);
  assert.deepEqual(quote, { ok: true, lamports: 322_521n, keys: 5n });
  assert.equal(quoteKeysFromLamports(basis, quote.lamports), 5n);
  assert.notEqual(quote.lamports, costForExactKeys(contributions, 5n).lamports);
});

test('successive purchases retain cumulative floor rounding instead of independently rounding each payment', () => {
  const first = 75_001n;
  const second = 75_000n;
  assert.equal(quoteKeysFromLamports(0n, first), 1n);
  assert.equal(quoteKeysFromLamports(first, second), 1n);
  assert.equal(quoteKeysFromLamports(0n, first + second), 2n);
  assert.equal(keysForLamports(first) + keysForLamports(second), 1n);

  let basis = 0n;
  for (let index = 0; index < 10; index++) {
    const quote = costForExactKeys(basis, 1n);
    assert.equal(quote.ok, true);
    basis += quote.lamports;
  }
  assert.equal(basis, costForExactKeys(0n, 10n).lamports);
  assert.equal(quoteKeysFromLamports(0n, basis), 10n);
});

test('search preserves single-lamport precision above Number.MAX_SAFE_INTEGER', () => {
  const basis = 9_000_000_000_000_000_000n;
  const quote = costForExactKeys(basis, 10_000n);
  assert.deepEqual(quote, { ok: true, lamports: 16_770_128_425_899n, keys: 10_000n });
  assert.equal(quoteKeysFromLamports(basis, quote.lamports), 10_000n);
  assert.equal(quoteKeysFromLamports(basis, quote.lamports - 1n), 9_999n);
  assert.equal(Number(basis + 1n), Number(basis), 'fixture demonstrates why pricing cannot use Number math');
});

test('the exact source upper limit returns a bounded failure when no requested keys remain', () => {
  const maximum = costForExactKeys(0n, MAX_CURVE_KEYS);
  assert.deepEqual(maximum, {
    ok: true, lamports: 9_999_999_998_820_763_639n, keys: MAX_CURVE_KEYS,
  });
  assert.equal(quoteKeysFromLamports(0n, maximum.lamports), MAX_CURVE_KEYS);
  assert.ok(quoteKeysFromLamports(0n, maximum.lamports - 1n) < MAX_CURVE_KEYS);
  assert.deepEqual(costForExactKeys(MAX_CURVE_LAMPORTS, 1n), {
    ok: false, code: 'CURVE_LIMIT',
    error: 'The requested keys exceed the original pricing curve limit.',
    maxKeys: 0n, maxLamports: 0n,
  });
  assert.equal(costForExactKeys(0n, MAX_CURVE_KEYS + 1n).code, 'CURVE_LIMIT');
});

test('negative, imprecisely typed, over-limit and overflowing inputs are rejected', () => {
  const u128Overflow = 1n << 128n;
  const typeFailures = [
    () => keysForLamports(75_001), () => keysForLamports(NaN),
    () => lamportsForKeys(1), () => quoteKeysFromLamports(0n, '75001'),
    () => quoteKeysFromLamports(0, 75_001n), () => costForExactKeys(0n, 1),
  ];
  for (const action of typeFailures) assert.throws(action, TypeError);
  const rangeFailures = [
    () => keysForLamports(-1n), () => keysForLamports(u128Overflow),
    () => keysForLamports(MAX_CURVE_LAMPORTS + 1n),
    () => lamportsForKeys(-1n), () => lamportsForKeys(MAX_CURVE_KEYS + 1n),
    () => quoteKeysFromLamports(MAX_CURVE_LAMPORTS, 1n),
    () => quoteKeysFromLamports(1n, u128Overflow - 1n),
    () => quoteKeysFromLamports(0n, -1n),
    () => costForExactKeys(MAX_CURVE_LAMPORTS + 1n, 1n),
    () => costForExactKeys(0n, -1n), () => costForExactKeys(0n, u128Overflow),
  ];
  for (const action of rangeFailures) assert.throws(action, RangeError);
});

test('minimum-payment property holds across varying cumulative positions and UI-sized quantities', () => {
  let seed = 29n;
  for (let index = 0; index < 40; index++) {
    seed = (seed * 1_664_525n + 1_013_904_223n) % (1n << 32n);
    const basis = seed * 10_000n;
    const count = seed % 10_000n + 1n;
    const quote = costForExactKeys(basis, count);
    assert.equal(quote.ok, true);
    assert.equal(quote.keys, count);
    assert.equal(quoteKeysFromLamports(basis, quote.lamports), count);
    assert.ok(quoteKeysFromLamports(basis, quote.lamports - 1n) < count);
  }
});
