'use strict';

const { Buffer } = require('buffer');
const MAX_BYTES = 1_048_576;

function bytes(input) {
  if (!Buffer.isBuffer(input) && !(input instanceof Uint8Array)) {
    throw new TypeError('Expected a Buffer or Uint8Array');
  }
  if (input.byteLength > MAX_BYTES) throw new RangeError('Integer buffer exceeds 1 MiB');
  return Buffer.from(input);
}

function toBigIntBE(input) {
  const hex = bytes(input).toString('hex');
  return hex.length ? BigInt('0x' + hex) : 0n;
}

function toBigIntLE(input) {
  return toBigIntBE(bytes(input).reverse());
}

function toBufferBE(value, width) {
  if (typeof value !== 'bigint') throw new TypeError('Expected an unsigned bigint');
  if (value < 0n) throw new RangeError('Integer must be unsigned');
  if (!Number.isSafeInteger(width) || width < 0 || width > MAX_BYTES) {
    throw new RangeError('Width must be an integer from 0 to 1 MiB');
  }
  if (width === 0) {
    if (value !== 0n) throw new RangeError('Integer does not fit requested width');
    return Buffer.alloc(0);
  }
  const hex = value.toString(16);
  if (hex.length > width * 2) throw new RangeError('Integer does not fit requested width');
  return Buffer.from(hex.padStart(width * 2, '0'), 'hex');
}

function toBufferLE(value, width) {
  return toBufferBE(value, width).reverse();
}

exports.toBigIntLE = toBigIntLE;
exports.toBigIntBE = toBigIntBE;
exports.toBufferLE = toBufferLE;
exports.toBufferBE = toBufferBE;
