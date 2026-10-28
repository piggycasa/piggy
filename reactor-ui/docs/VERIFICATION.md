# Public program verification

`/verify/` exposes release evidence, public source and retained powers without requiring a wallet connection. PIGGY’s modified program, interface and operator source are published at https://github.com/piggycasa/piggy; the deployed executable and its published hashes remain public. Its check calls only `getGenesisHash` and finalized `getMultipleAccounts`, validates the upgradeable-loader accounts and hashes the complete executable region. Different code, lengths, loaders, ProgramData pointers, malformed data or unavailable RPC fail closed. An upgrade-authority change is reported separately from an executable change.

Release artifact: `public/verification/piggy-mainnet.so`, 267,648 bytes. SHA-256: `7862ecd936cef7faaade05a834aca76065a37f8ad107fef3767f449bd653eb65`. The published manifest is a whitelist of public facts, not a copy of an operator manifest.

The finalized mainnet observation at 2026-10-28 01:09:33 UTC (slot 462285024) matched that artifact exactly. The manifest retains the recorded Rust/Cargo build-input digest, and pins the public program-source commit. **Source access is public. No clean independent source-to-binary reproduction has been established.** The external OtterSec endpoint returned `is_verified:false` at that observation.

## Remaining powers

- Upgrade authority `AaD3ws5nVeUntDpmciiqx5NxYQKpN6idm59j6SJ7SZdX` can replace the entire program. No enforced timelock was observed.
- Game creator `Av1VgVPpKayA9ywDbuKwdY9RnSFHynWN2M4nT1vDm7s9` can replace the token-holder publisher.
- Publisher `GtYibRAwaQ3h3whr5WeCzJkRYtysUvv21i6ZGTmYswx6` controls new allocations against unreserved holder funds. The program verifies available funding, signatures, Merkle claims and duplicate prevention, but not historical ownership or proportional allocation. It could therefore allocate unreserved funds to itself. Existing published epochs cannot be rewritten through current instructions.
- Community treasury `5eA9boszSXd9iGWikN5NoP98L2Uk2HUDmotFz1PopQTU` can withdraw its accrued allocation under current code.
- Keeper `9xzFd9KcUsuGBUDVDfSx9zuSyu7EutLjFnMUev4tQLoD` has no special game privilege. Settlement and rollover are permissionless under current code.
- Mint and freeze authorities are absent. This does not establish liquidity locking.

The lottery is disabled. The jackpot follows on-chain purchase ordering, which remains exposed to bots and congestion. A matching release is neither a security audit nor proof of fairness. Avoid “rug-proof”, “fully trustless”, “audited”, “immutable” and “provably fair” claims.

The browser check uses the site's RPC and manifest. An independent RPC can compare the deployed executable with the published release hash; the pinned public source and exact Cargo inputs are available for independent build attempts. See [Solana's verified-build process](https://solana.com/docs/programs/verified-builds). Independent reproducible builds, an external security review and a reviewed authority policy remain separate work. No authority was transferred or revoked for this page.


## Check without trusting this site

1. Confirm the mainnet program is `3c5jUPmmXR3zV47uGW4YjSeSQhHKk2H6yj5U5JcfvbfK` and token mint is `BwnmfvgEhAFboL8YW6CFoBUSH4QHriA9qBcAVPc71jRA`. The game account is `GXX38mLVdj2i2H3s5z5yvpkaZHpRQt1ZorrgsfeFKT5g` (version `1793155991891`).
2. Open [the public PIGGY repository](https://github.com/piggycasa/piggy). The program is in `program/`; interface and operator implementations are in `reactor-ui/`. Source commit and release hashes are pinned in this site's `/verification/release.json`.
3. Clone that repository and run `node tools/source-digest.mjs`; it must produce the recorded source-tree digest above.
4. Run `node tools/verify-release.mjs --rpc YOUR_MAINNET_RPC_URL` using an independent HTTPS mainnet endpoint. It reads finalized accounts, verifies the genesis, loader and ProgramData pointer, hashes the full executable and reports the current upgrade authority. It uses no wallet and sends no transaction.
5. To attempt a source rebuild, use the recorded toolchain and locked inputs: `cargo build-sbf --manifest-path program/Cargo.toml --sbf-out-dir target/deploy --no-default-features -- --locked`. Compare the resulting executable with the recorded SHA-256. A mismatch means reproduction failed; it is not evidence that source verification passed.

The browser button compares published bytes against finalized chain data. Public source and a matching input digest do not establish an independently reproduced source build. The official Solana verification procedure requires a controlled build and matching deployed binary; no such independent verification is claimed here.

Pinned public program-source commit: [`f7ba440e8667dd920d89bf6a8fba0158c3887e68`](https://github.com/piggycasa/piggy/tree/f7ba440e8667dd920d89bf6a8fba0158c3887e68/program).


## Pre-launch test instance

The fresh launch uses a different game PDA under the same program and $PIGGY mint. The previous game `FZ6QVPqc8tmpEfzNzxHq7reKshtphoU13vjfNDqdf3Xm`, version `1793081200001`, retains its accounts and claims. Existing game and token-holder rewards remain accessible at [test-round claims](https://piggy.casa/test-claims/). Its proof index remains at `/proofs/index.json`; the fresh game has a separate `/launch-proofs/index.json`. No old account balance or transaction history was erased.
