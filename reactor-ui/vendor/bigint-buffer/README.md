# PIGGY unsigned BigInt conversion

This is a small, independent JavaScript implementation of the four conversion functions used by `@solana/buffer-layout-utils`. The root npm override installs it under the dependency's requested `bigint-buffer` name. Its own package name identifies this replacement; it does not claim to be a patched upstream release.

Upstream `bigint-buffer <=1.1.5` has an unpatched native `toBigIntLE` buffer overflow ([GHSA-3gc7-fjrx-p6mg](https://github.com/advisories/GHSA-3gc7-fjrx-p6mg)). This package contains no native addon, installation script or dynamic `bindings` loader. Both Node and browser bundles use the same implementation.

The API accepts unsigned BigInts and Buffer/Uint8Array bytes, preserves leading zero padding and both byte orders, and does not mutate input bytes. It rejects negative/non-BigInt values, fractional/negative widths, values that do not fit the requested width, and byte sizes over 1 MiB. Solana's layouts use 8, 16, 24 and 32 bytes. Overflow rejection is intentional; silent truncation of financial amounts is unsafe.

Coverage in `tests/dependency-safety.test.mjs` includes endian round trips, u64/u128/u192/u256 limits, independent byte fixtures, malformed inputs, large buffers, actual SPL Token account/mint layouts, and the JSON-RPC client path used by Solana Web3.
