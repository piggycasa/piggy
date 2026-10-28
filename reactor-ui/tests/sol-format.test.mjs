import test from 'node:test';
import assert from 'node:assert/strict';
import { formatSol } from '../src/sol-format.mjs';

test('formats balances with at least two decimal places', () => {
  assert.equal(formatSol(0), '0.00');
  assert.equal(formatSol(1_000_000_000), '1.00');
  assert.equal(formatSol(500_000_000_000), '500.00');
  assert.equal(formatSol(1_234_500_000_000), '1,234.50');
});

test('preserves the original first-share price and tiny reward deltas', () => {
  assert.equal(formatSol(75_001), '0.000075001');
  assert.equal(formatSol(1), '0.000000001');
  assert.equal(formatSol(100), '0.0000001');
  assert.equal(formatSol(150), '0.00000015');
  assert.equal(formatSol(10_000_001), '0.010000001');
});

test('trims only insignificant decimal zeros', () => {
  assert.equal(formatSol(1_000), '0.000001');
  assert.equal(formatSol(120_000_000), '0.12');
  assert.equal(formatSol(123_400_000), '0.1234');
  assert.equal(formatSol(1_000_000_010), '1.00000001');
});

test('every displayed value converts back to the exact original lamports', () => {
  const values = [
    0, 1, 9, 10, 99, 100, 999, 1_000, 75_001, 10_000_001, 100_000_000,
    999_999_999, 1_000_000_000, 1_000_000_001, 500_000_000_000,
    999_999_999_999_999, Number.MAX_SAFE_INTEGER,
  ];
  for (const value of values) {
    const text = formatSol(value);
    assert.match(text, /^\d{1,3}(,\d{3})*\.\d{2,9}$/);
    const [whole, fraction] = text.replaceAll(',', '').split('.');
    const restored = BigInt(whole) * 1_000_000_000n + BigInt(fraction.padEnd(9, '0'));
    assert.equal(restored, BigInt(value), `${value} must survive ${text}`);
  }
});

test('rejects invalid types, fractional lamports and unsafe amounts', () => {
  for (const value of ['75001', null, undefined, true, 1n, {}]) {
    assert.throws(() => formatSol(value), TypeError);
  }
  for (const value of [-1, .5, Number.MIN_VALUE, NaN, Infinity, -Infinity, Number.MAX_SAFE_INTEGER + 1]) {
    assert.throws(() => formatSol(value), RangeError);
  }
});
