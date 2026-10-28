/**
 * Integer pricing port of ilmoi/solana_fomo3d at
 * a29cfe35049fe8f209421267983add1c28ec3237:
 *   src/math/curve.rs — constants, conversion formulas and domain limits
 *   src/math/common.rs — checked u128 arithmetic and integer square root
 *   src/processor/processor.rs:254,436,556 — cumulative pricing basis
 * https://github.com/ilmoi/solana_fomo3d/blob/a29cfe35049fe8f209421267983add1c28ec3237/src/math/curve.rs
 *
 * The pricing basis is opening rollover plus full cumulative contributions,
 * never the remaining jackpot after distributions. All arguments/results in
 * this module are BigInt; callers may store validated safe Numbers in JSON.
 */

export const MAX_CURVE_LAMPORTS = 10_000_000_000_000_000_000n;
export const MAX_CURVE_KEYS = 11_313_228_509n;
const U128_MAX = (1n << 128n) - 1n;
const A = 10_000_000n;
const B = 3_125_000n;
const C = 562_498_828_125_610_000_000_000n;
const D = 749_999_218_750n;
const E = 1_562_500n;

function rangeError(message, code = 'AMOUNT_TOO_LARGE') {
  const error = new RangeError(message);
  error.code = code;
  return error;
}

function uint(value, name) {
  if (typeof value !== 'bigint') throw new TypeError(`${name} must be a BigInt integer.`);
  if (value < 0n) throw rangeError(`${name} must not be negative.`, 'INVALID_AMOUNT');
  if (value > U128_MAX) throw rangeError(`${name} exceeds u128.`);
  return value;
}

function add(left, right) {
  const value = left + right;
  if (value > U128_MAX) throw rangeError('Curve addition exceeds u128.');
  return value;
}

function multiply(left, right) {
  const value = left * right;
  if (value > U128_MAX) throw rangeError('Curve multiplication exceeds u128.');
  return value;
}

function subtract(left, right) {
  if (left < right) throw rangeError('Curve subtraction underflows u128.', 'INVALID_AMOUNT');
  return left - right;
}

// Same restoring binary integer-root algorithm as spl-math 0.1.0's
// approximations::sqrt, which the source calls through TrySqrt. No floats.
function integerSqrt(value) {
  if (value === 0n) return 0n;
  const shift = (value.toString(2).length - 1) & ~1;
  let bit = 1n << BigInt(shift);
  let remainder = value;
  let result = 0n;
  while (bit !== 0n) {
    const candidate = add(result, bit);
    if (remainder >= candidate) {
      remainder -= candidate;
      result = add(result >> 1n, bit);
    } else result >>= 1n;
    bit >>= 2n;
  }
  return result;
}

/** Source sol_to_keys: total whole keys at cumulative curve lamports. */
export function keysForLamports(totalLamports) {
  uint(totalLamports, 'totalLamports');
  if (totalLamports === 0n) return 0n;
  if (totalLamports > MAX_CURVE_LAMPORTS) {
    throw rangeError('Cumulative lamports exceed the original 10bn SOL curve limit.', 'CURVE_LIMIT');
  }
  const radicand = add(multiply(multiply(totalLamports, A), B), C);
  return subtract(integerSqrt(radicand), D) / E;
}

/**
 * Source keys_to_sol, including its floor rounding. This native forward value
 * is not necessarily enough to mint that many keys through sol_to_keys.
 */
export function lamportsForKeys(totalKeys) {
  uint(totalKeys, 'totalKeys');
  if (totalKeys > MAX_CURVE_KEYS) {
    throw rangeError('Total keys exceed the original pricing curve limit.', 'CURVE_LIMIT');
  }
  const shifted = add(multiply(totalKeys, E), D);
  return subtract(multiply(shifted, shifted), C) / multiply(A, B);
}

/** Source keys_received, including whole-key floor differences. */
export function quoteKeysFromLamports(roundGrossLamports, paymentLamports) {
  uint(roundGrossLamports, 'roundGrossLamports');
  uint(paymentLamports, 'paymentLamports');
  const currentKeys = keysForLamports(roundGrossLamports);
  return subtract(keysForLamports(add(roundGrossLamports, paymentLamports)), currentKeys);
}

/**
 * The UI selects whole keys rather than an arbitrary payment. Find the minimum
 * integer-lamport payment for exactly that count using actual keys_received;
 * never infer price from independently rounded stored player/round key totals.
 */
export function costForExactKeys(roundGrossLamports, keyCount) {
  uint(roundGrossLamports, 'roundGrossLamports');
  uint(keyCount, 'keyCount');
  const currentKeys = keysForLamports(roundGrossLamports);
  if (keyCount === 0n) return { ok: true, lamports: 0n, keys: 0n };

  const remainingLamports = MAX_CURVE_LAMPORTS - roundGrossLamports;
  const availableKeys = keysForLamports(MAX_CURVE_LAMPORTS) - currentKeys;
  if (keyCount > availableKeys) {
    return {
      ok: false,
      code: 'CURVE_LIMIT',
      error: 'The requested keys exceed the original pricing curve limit.',
      maxKeys: availableKeys,
      maxLamports: remainingLamports,
    };
  }

  const mintedAt = payment => keysForLamports(add(roundGrossLamports, payment)) - currentKeys;
  // The native forward formula provides an estimate, then exponential search
  // corrects its rounding gap. Binary search establishes the exact minimum.
  const estimate = lamportsForKeys(add(currentKeys, keyCount)) - roundGrossLamports;
  let lower = 0n;
  let upper = estimate > 0n ? estimate : 1n;
  if (upper > remainingLamports) upper = remainingLamports;
  while (mintedAt(upper) < keyCount) {
    lower = upper;
    upper = upper * 2n > remainingLamports ? remainingLamports : upper * 2n;
  }
  while (lower + 1n < upper) {
    const middle = (lower + upper) / 2n;
    if (mintedAt(middle) >= keyCount) upper = middle;
    else lower = middle;
  }
  const received = mintedAt(upper);
  if (received !== keyCount) {
    return {
      ok: false,
      code: 'UNREACHABLE_KEY_COUNT',
      error: 'That exact key amount is unavailable at integer-lamport precision.',
      minimumLamports: upper,
      keysAtMinimum: received,
    };
  }
  return { ok: true, lamports: upper, keys: received };
}
