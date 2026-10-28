# Read-only release verification

These instructions read public Solana data and local files. They do not deploy, sign, connect to a wallet, or send a transaction. Node 24 supports the helper without installing dependencies.

```sh
node tools/source-digest.mjs
node tools/verify-release.mjs
```

The first command hashes the sorted `program/src/**/*.rs`, `Cargo.toml` and `Cargo.lock` inputs using their relative paths and NUL separators. Its expected source-tree digest is `1dfdc1cd411970f7d56659e10e4a6b0af760a091d79437dbf2920e076cd13211`.

The second checks mainnet genesis and the finalized upgradeable-loader accounts, validates the program's data pointer and full executable length, hashes all executable bytes, and reports the currently observed upgrade authority. It defaults to the official public mainnet RPC. If that RPC is busy, provide your own HTTPS endpoint with `--rpc YOUR_MAINNET_RPC_URL` or `SOLANA_RPC_URL`; keep any provider key private. It reports a mismatch or unavailable RPC as failure, never a successful check.

You can also use Solana CLI independently:

```sh
solana --url https://api.mainnet-beta.solana.com program dump 3c5jUPmmXR3zV47uGW4YjSeSQhHKk2H6yj5U5JcfvbfK /tmp/piggy-mainnet.so
shasum -a 256 /tmp/piggy-mainnet.so
wc -c /tmp/piggy-mainnet.so
```

Expected executable: **267,648 bytes**, SHA-256 **`7862ecd936cef7faaade05a834aca76065a37f8ad107fef3767f449bd653eb65`**. The dump contains the executable, not the 45-byte loader metadata header.

## What this establishes

A matching source digest identifies this publication's Rust inputs. A matching on-chain hash identifies the deployed executable. **A clean independent source-to-binary build has not been verified.** The recorded toolchain is cargo-build-sbf 4.0.0, platform-tools v1.53, rustc 1.89.0, with `--no-default-features --locked`. See the root README for the build command. Do not infer reproducibility solely from these two recorded digests.

No independent security audit is published. The program retains an upgrade authority that can replace it without an enforced timelock. Token-holder allocation accuracy trusts a snapshot publisher, which the game creator can replace. Current claims verify funding and Merkle proofs but do not independently prove historical token ownership or proportional allocation. The lottery is disabled; jackpot ordering remains exposed to bots and congestion. Matching bytes, public source and passing tests do not establish fairness or guarantee returns.

The website's [release check](https://piggy.casa/verify/) is convenient, but this helper can use an independent RPC and does not rely on the website's RPC proxy. [Solana's verified-build documentation](https://solana.com/docs/programs/verified-builds) describes a separate independent build process.
