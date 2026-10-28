# Actual local Solana game

The game bridge signs **real transactions on a dedicated local validator**, not mainnet or devnet. SOL and the six-decimal PIGGY eligibility mint are local test fixtures. Browser code receives account reads and public signatures; fixture private keys stay in ignored, node-only `.openai/local/solana/wallets` files with mode 0600.

Prerequisites: Node, the Solana CLI/test-validator, and `cargo-build-sbf`. Install JavaScript dependencies with `npm ci`. Build the Rust program from its repository root:

```sh
cargo build-sbf --sbf-out-dir target/deploy-localtest --features local-test-lottery
```

For a standalone UI checkout the program lives at `.openai/local/github-fork`. Inside the fork's `reactor-ui` folder, the scripts resolve its parent Cargo project automatically. `PIGGY_PROGRAM_SO` may select a different explicit artifact.

Use separate terminals for the long-running validator and signer bridge:

```sh
npm run localnet:validator
npm run localnet:deploy
npm run localnet:bootstrap
npm run localnet:serve
npm run dev -- --port 4317
```

The validator uses dedicated RPC 18899 and WebSocket 18900 ports with a newly created ignored ledger. Its validator traffic is requested on 127.0.0.1. Agave 4.0.1 nevertheless binds its test-validator RPC, WebSocket and faucet listeners to wildcard addresses; the CLI exposes no separate RPC bind option. The signer bridge and Vite server bind only 127.0.0.1. This harness is for an isolated development machine, with test funds only; it does not configure an OS firewall or expose the signer publicly. An occupied RPC port causes a failure. Existing ledgers are never reset and global Solana CLI configuration is never changed. Restarting the same validator script reopens its saved ledger. Bootstrap resumes missing game/config/round stages and validates the saved genesis hash. Existing local game accounts are reused.

`localnet:deploy` deliberately selects the **predictable, local-test-only lottery** build so original lottery behavior can be exercised locally. It must never be deployed on a public network. For the default reserve-only build, run `node scripts/localnet-deploy.mjs` after building `target/deploy-default/fomo3d.so` without that feature. Public-network lottery activation requires verifiable randomness and an independent security review.

Run deterministic unit tests with `npm test`. Run actual on-chain integration checks against the already-running dedicated validator with:

```sh
npm run localnet:test
npm run localnet:recovery-test
npm run localnet:empty-rollover-test
npm run localnet:adversarial-test
```

The integration suite creates fresh versioned games with isolated fixture wallets and eligibility mints. It does not reset the ledger or mutate the browser's saved game. Ignored reports record public transaction signatures and verified cases at `.openai/local/solana/{integration,recovery,empty-rollover,adversarial}-report.json`.

# Bridge and account data

The Vite proxy maps `/api/local` to 127.0.0.1:4318. `GET /session` returns a random session nonce. `POST /action` requires that nonce in `X-Piggy-CSRF`, JSON content, a loopback host, and a matching local origin when an Origin header exists. The signer server binds only 127.0.0.1; it must never be exposed through a tunnel or public host. `src/solana-client.mjs` is a browser fetch facade. `src/solana-instructions.mjs` contains the actual Borsh builders/codecs for all seven original instructions plus four holder instructions.

`GET /state` reads confirmed program accounts, actual native SOL balances, all fixture players' historical round accounts, the real eligibility-mint token accounts, funded holder epochs, and Clock sysvar time. Monetary fields use integer lamports serialized as decimal strings. PIGGY balances use raw SPL units and `holder.decimals` specifies their scale. All game rewards and holder rewards are paid by on-chain instructions. WSOL entries wrap native SOL into a temporary SPL account, purchase, then close and unwrap any unspent funds atomically; claims withdraw WSOL and close the temporary account atomically. Public mode instead reads RPC directly and signs through an injected wallet, without this bridge. It requires the guarded instruction 11 in addition to the eleven original/holder instruction tags.

# Holder epoch policy

There is no staking. The publisher persists an **open token-balance snapshot before fees accrue**. Each feed or settlement sweeps the program's P3D fee bucket into the canonical holder vault and publishes an epoch allocating only new, unreserved fees to that preceding snapshot. Before publication the complete immutable proof plan and the next window's balance snapshot are saved atomically. Bootstrap reconciles an ambiguous publication against its on-chain epoch account before retrying or exposing claims.

Snapshots aggregate all initialized legacy SPL accounts for the eligibility mint by owning wallet at one RPC context slot, including holders outside the fixture wallets. Every lamport is apportioned with deterministic largest remainders, using raw public-key byte ordering for ties. A token transfer after a snapshot does not revoke that wallet's published entitlement, and a late buyer cannot claim the preceding window. Claims require the wallet signer, its correct payment-mint destination account, a domain-separated Merkle proof, and a single-use claim receipt. Persistent empty-PDA tests use the current validator's minimum empty-account rent because isolated one-lamport account creation is rejected by runtime rent policy; a one-lamport prefund is also exercised within a successful claim transaction.

The local publisher is trusted to report historical holdings and allocations; the on-chain program validates funding and proof membership, not historical SPL balances. This is not a trustless token-balance oracle.

The application still uses the classic Solana JavaScript SDK. The vulnerable native bigint codec is replaced by a locally named unsigned pure-JavaScript implementation and Jayson is overridden to the official current major version. `npm ci`, a clean production build and zero-finding `npm audit` were verified. The Rust dependency tree still has advisories, reviewed with their target/reachability limits in [DEPENDENCY_REVIEW.md](DEPENDENCY_REVIEW.md). This is not an independent audit.

# Verification recorded 2026-10-27

The deployed local-test build passed 49 main integration checks, 5 interrupted-publication/partial-claim checks, and 4 funded-empty-round rollover checks (58 checks). The adversarial suite additionally submitted and confirmed 12 failed transactions with preflight disabled: missing signer, forged amount/proof, wrong signing wallet, wrong destination owner/mint, duplicate claim, unauthorized publication, over-reservation, cross-epoch proof, unauthorized publisher rotation, and unauthorized initialization. Each rejection preserved token destination/vault balances, config reservation, epoch claimed amount, and receipt bytes/ownership. Their confirmed failure signatures and custom errors are saved in the adversarial report. The main suite also contains deployed-program preflight rejection checks; these are distinct from the explicitly confirmed failures.

The checks include an actual qualified local-test lottery win and withdrawal, native WSOL wrap/refund/unwrap transactions, all four original modes, referral persistence, early-wallet cap, active/historical game claims, prospective holder eligibility, immutable epoch recovery, normal/empty settlement, community/P3D funding, and separate unused lottery reserve rollover. All eleven original/holder discriminants were exercised by actual successful transactions. The public-client suites additionally exercise successful guarded instruction 11 and failed expired/slipped/wrong-round purchases with no financial state changes. The browser facade was also exercised through the loopback HTTP service, and twelve concurrent reads queued with a feed mapped coherently through the account adapter. Current JavaScript counts and reports are recorded in [VALIDATION.md](VALIDATION.md).

Additional actual-validator checks, independent of a public deployment:

```sh
npm run localnet:public-wallet-test
node scripts/localnet-public-wallet-test.mjs --token-2022
npm run localnet:publisher-test
npm run localnet:keeper-test
```

The public client tests cover legacy eligibility and the actual Token-2022 MetadataPointer/TokenMetadata account format used by Pump. The standalone publisher test verifies prospective eligibility, funded claims, public proof export and restart recovery. The keeper test exercises real start/feed/settle/celebration/next-round transactions with short fixture clocks. Private reports are saved under `.openai/local/solana/reports/`. Full public launch instructions, disabled Pump preparations and blocked public-network evidence are in [PUBLICNET-LAUNCH.md](docs/PUBLICNET-LAUNCH.md).
