# PIGGY

Source for the game at [piggy.casa](https://piggy.casa). Feed Piggy with SOL to buy round keys; new feeds fund key rewards, and the last eligible feeder when the clock expires receives the jackpot. Holding $PIGGY has a separate, funded snapshot reward claim. Keys and $PIGGY are different assets.

This is a fresh source publication with new Git history. It contains only the PIGGY program, interface, related tooling and documentation. It does not contain previous repository history, private keys, operator journals, credentials or unrelated projects. Upstream authorship and applicable notices are preserved.

## Source and verification

- `program/`: the deployed Rust program's Cargo inputs and source, plus protocol notes.
- `reactor-ui/`: the interface, client instructions, tests and operator implementation; runtime secrets and state are excluded.
- `verification/release.json`: recorded mainnet addresses, executable hash and build-input digest.
- `tools/source-digest.mjs`: reproduce the recorded source-tree digest without installing dependencies.
- `tools/verify-release.mjs`: read finalized Solana accounts and compare the complete executable against the recorded release. It does not connect to a wallet, sign, deploy or send a transaction.
- [Read-only verification](docs/VERIFICATION.md): instructions and limits.

Recorded Rust source-tree SHA-256:

```text
1dfdc1cd411970f7d56659e10e4a6b0af760a091d79437dbf2920e076cd13211
```

Recorded executable: 267,648 bytes, SHA-256:

```text
7862ecd936cef7faaade05a834aca76065a37f8ad107fef3767f449bd653eb65
```

These are separate checks. A source digest identifies inputs; an executable match identifies bytes. **No clean independent source-to-binary build has been verified, and no independent security audit is published.** The program retains an upgrade authority, and holder allocations trust a snapshot publisher. Public source does not eliminate those powers.

## Build the program

Recorded toolchain: `cargo-build-sbf 4.0.0`, platform-tools `v1.53`, `rustc 1.89.0`. Use the locked dependencies and no optional features:

```sh
node tools/source-digest.mjs
cargo build-sbf --manifest-path program/Cargo.toml --sbf-out-dir program/target/deploy --no-default-features -- --locked
cargo test --manifest-path program/Cargo.toml --locked
```

The recorded public build uses the default reserve-only lottery policy. Do not enable `local-test-lottery` for a public deployment; that optional feature exists only for explicit local-validator tests. Building is not deploying.

## Interface

The frontend export is under `reactor-ui/`. Node `24.22.1` and npm `11.6.2` were used for the current deployment. Keep its `.npmrc` setting `install-links=true` for the pinned local dependency:

```sh
cd reactor-ui
npm ci
npm test
npm run build
npm run dev -- --port 4317 --strictPort
```

With no public deployment configuration the real-wallet client stays disabled. `/?demo=1` is explicitly simulated. Never put RPC credentials or signing keys in a `VITE_` variable. See the interface documentation for network configuration; none of these build commands deploys a program or authorizes a payment.

## Provenance and licenses

The Rust program derives from [ilmoi/solana_fomo3d](https://github.com/ilmoi/solana_fomo3d), based on upstream commit `a29cfe35049fe8f209421267983add1c28ec3237`. Its original authorship is retained, including Cargo metadata. The upstream program did not provide a clear reuse license; this publication does not invent one or grant rights to third-party code beyond its applicable terms. PIGGY's program changes and trust boundaries are described in `program/PIGGY_PROGRAM.md` and `program/HOLDER_REWARDS.md`.

The interface adapts WILD's Konterball design/code; the bundled Konterball MIT notice remains. Piggy Bank Glass is by tomgeurts, CC BY 4.0. The interface contains the corresponding artist attribution, bundled font licenses, and notices for Poimandres, Rapier and other reused assets. See `reactor-ui/public/asset-credits.html`, `reactor-ui/public/licenses/` and `reactor-ui/KONTERBALL_REUSE.md`. No blanket license here replaces those notices.
