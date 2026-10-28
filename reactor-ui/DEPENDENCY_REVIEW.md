# Dependency review — 27 October 2026

This records package-advisory checks and the scope of the inspected code. It is not an independent security audit or a promise that all defects have been found.

## JavaScript release dependencies

The initial locked installation had nine npm findings: three high and six moderate, including transitive parent packages. The supported SDK versions remain `@solana/web3.js 1.98.4` and `@solana/spl-token 0.4.14`.

| Finding | Concrete change | Verification |
| --- | --- | --- |
| `bigint-buffer <=1.1.5` native `toBigIntLE` buffer overflow; no upstream patched release ([advisory](https://github.com/advisories/GHSA-3gc7-fjrx-p6mg)) | Replace its four conversion functions with the explicitly named local `@piggy/unsigned-bigint-buffer` package in `vendor/bigint-buffer`. No native addon, `bindings` loader or installation script remains. | Endian fixtures, independent round trips through 4 KiB, u64/u128/u192/u256 maximums, overflow/width rejection, and actual SPL mint/account layout encoding. |
| Older `uuid` bounds checking and `stream-json` parser issues through Jayson ([UUID advisory](https://github.com/advisories/GHSA-w5hq-g745-h8pq), [stream parser advisory](https://github.com/advisories/GHSA-mjw6-4jj6-33hc)) | Override Jayson with official `5.0.0`, which removes both dependencies. Its browser JSON-RPC client retains the API imported by Solana Web3. Node 20 or later is required by this version. | Single and batch requests, generated request IDs, RPC errors, and Solana Web3 response validation; release build. |

`npm audit` reports **zero known vulnerabilities** after these changes. `tests/dependency-safety.test.mjs` has seven passing checks. The local package has its own truthful identity; no upstream version has been invented to suppress an advisory. The `.npmrc` setting `install-links=true` packs the local dependency as a regular installed package and is required with the committed lock file. A separate clean installation is checked using `npm ci --ignore-scripts`, followed by the same seven tests.

The integer replacement deliberately rejects negative values, incorrect types, values too large for their requested byte width, and allocations above 1 MiB. Solana layouts use at most 32-byte integers. Silent truncation of payment or reward values is not preserved.

## Rust program dependency scope

The program lock includes the legacy Solana 1.18.26 SDK and official SPL Token-2022 3.0.5 parser. `cargo audit --json` against the current RustSec database reports **two vulnerabilities and fifteen warning entries** (eight unmaintained, seven unsound). These findings have not been ignored, hidden or represented as a clean scan.

| Advisory / packages | Inspected reachability and remaining work |
| --- | --- |
| [RUSTSEC-2024-0344](https://rustsec.org/advisories/RUSTSEC-2024-0344.html), `curve25519-dalek 3.2.1` | Secret-scalar timing variability. The dependency is behind `cfg(not(target_os = "solana"))` in `solana-program` and `solana-zk-token-sdk`, so it is excluded from the SBF target. PIGGY's Rust code does not provide a private-key signing service. Upgrade the host SDK before adding such a service. |
| [RUSTSEC-2022-0093](https://rustsec.org/advisories/RUSTSEC-2022-0093.html), `ed25519-dalek 1.0.1` | Unsafe signing with attacker-selected public/private key pair combinations. It enters through `solana-sdk` under `solana-zk-token-sdk`'s non-Solana target dependencies and is excluded from SBF. No PIGGY Rust signing oracle exists. The old host dependency remains maintenance debt. |
| [RUSTSEC-2023-0033](https://rustsec.org/advisories/RUSTSEC-2023-0033.html), `borsh 0.7.2` and `0.9.3` | Requires deserializing non-Copy/non-Clone zero-sized types. Inspected PIGGY account/instruction types have nonzero size; its only untrusted variable-length collection is a vector of 32-byte Merkle siblings. That affected type pattern is absent. The old versions remain in the lock. |
| `im`, `bitmaps`, `sized-chunks`, `memmap2` | Aliasing/panic safety or invalid pointer offsets plus maintenance warnings. They enter via `solana-frozen-abi`'s non-Solana target dependency table, outside SBF. PIGGY does not call the affected host container or mmap APIs. |
| `atty` | Unmaintained and a Windows pointer-alignment warning. It enters through host-side Solana logging; PIGGY does not call it or ship it in SBF. |
| `rand 0.7.3` | Unsoundness requires a custom logger re-entering thread RNG during reseeding. PIGGY defines no such logger. This old host dependency remains. |
| `bincode`, `derivative`, `libsecp256k1`, `paste` | Maintenance warnings rather than a demonstrated PIGGY runtime exploit. They require a planned SDK migration with full binary and transaction regression checks. |

The program preserves `Cargo.lock`. The 48 host tests pass for both default and explicit local-test feature configurations, and both SBF binaries compile. The default build does not execute the predictable lottery. The `local-test-lottery` feature must never be enabled in a public artifact.

A future SDK migration should remove this dependency debt. This review does not silently force a major Solana SDK migration immediately before launch: that would change the binary and require another complete runtime review. A public launch decision must acknowledge the remaining locked host dependency findings and separate program, economic, asset-license, operations and wallet checks.
