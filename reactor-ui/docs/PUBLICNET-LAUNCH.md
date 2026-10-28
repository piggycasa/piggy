# PIGGY public-cluster deployment and launch gates

These tools separate a reachable network from a verified deployment. `networkReady: true` only means the RPC returned the expected genesis and a live blockhash. `launchReady: true` additionally requires the reviewed client configuration, exact deployed binary, initialized game and holder vault, a verified public proof index, and successful funded rehearsal evidence for the same release. Mainnet also requires real feed, game-claim and holder-claim receipts. A launch decision also needs the human checks below; this report does not constitute an independent security audit.

## Fresh-launch configuration: 28 October 2026

The completed 28 October check passed **244 unit tests, 130 live desktop/mobile UI checks and all 11 Mainnet release-preflight checks**, with no automated release blockers. Streamflow recipient attribution is described in [STREAMFLOW-REWARDS.md](STREAMFLOW-REWARDS.md); it does not create a token lock or change the on-chain program.

The reviewed Testnet program at `57SQAWzCikj2SNk55BFjeEUA6Hy39t86c9hV6G234p34` passed the full **7-check / 13-transaction** rehearsal after its earlier deployment. PublicNode completed the run with 400 ms request pacing and `--priority-fee-micro-lamports 50000`. All four modes, guard rejections, both reward paths, settlement, rollover and historical withdrawal passed. Earlier failed attempts remain archived; their signatures were reconciled before restarting. See [VALIDATION.md](../VALIDATION.md) for the fresh Mainnet feed and claim receipts, sponsored-funding disclosure and exact costs.

The production client configuration targets game version `1793155991891`, game PDA `GXX38mLVdj2i2H3s5z5yvpkaZHpRQt1ZorrgsfeFKT5g`, under the same reviewed program and $PIGGY mint. Its holder configuration is `JCiKUFDM62yd1VXUzgHTLa6m2Aa82i4fVZwtVXchHxkN`, holder vault is `D3azZR1kykY8rdabh9iAVmXcuo7rA2LYuDK9moY1mUUB`, and proof index is `/launch-proofs/index.json`.

Round 1 derives to `6TPGnFDLTA5CV1wxtyzySewGCEF8Q5wKr1755fWYwBsb`, with pot `2p4TZ1Q369HWFih53xAM8TyUztsbdpwddoZHNbDriJNG`. These derived addresses identify the intended accounts; opening the round requires its own confirmed initialization transaction. Game initialization, round opening, funded claims and operator activation are separate launch checks.

The previous version `1793081200001` retains its accounts and reward entitlements. Existing game and holder rewards remain available through [test-round claims](https://piggy.casa/test-claims/) using `/proofs/index.json`. Keep the two proof domains and operator journals separate. The dated receipts below belong to that pre-launch instance; current fresh-instance receipts are linked above.

## Pre-launch instance evidence: 27 October 2026

- Devnet, Testnet and Mainnet RPC identity and live blockhash checks succeeded.
- The guarded public build is 267,648 bytes, SHA-256 `7862ecd936cef7faaade05a834aca76065a37f8ad107fef3767f449bd653eb65`. The isolated SBF build fingerprints contain no optional features. Source SHA-256: `1dfdc1cd411970f7d56659e10e4a6b0af760a091d79437dbf2920e076cd13211`.
- Earlier faucet requests failed and the initial reports recorded zero balances. The user subsequently funded both deployment payers with **5 test SOL each**. That funding blocker is resolved.
- Devnet deployed the reviewed program at `GGadGZzXKX9Kznha7h61SMgjBFViHKSXEDxwx93gnMjh` and passed **7 checks / 14 confirmed canary transactions**, including both claims, settlement and rollover. A shared HTTP RPC upload hit rate limits; the explicit buffer was reconciled and successfully resumed using the official CLI TPU transport. Full evidence is in `devnet/manual-deployment-receipt.json` and `devnet/rehearsal-report.json`.
- Testnet remains funded with 5 test SOL. The official RPC timed out on account reads. PublicNode returned HTTP 403 before spending because its public tier allows at most 10 accounts per `getMultipleAccounts` request, while Agave's feature verification batches 100. Indexed `getProgramAccounts` queries also require a personal token. Ordinary reads and cluster health work, so this is a specific provider-access limit, not a stopped cluster or missing funds. This was the earlier blocked attempt. The 28 October deployment and paced PublicNode rehearsal resolved it without skipping feature verification.
- Before the user's transfer, the official faucet's programmatic proof-of-work alternative was investigated. Its recommended difficulty-3, 0.02-SOL source had zero lamports. Of all 23 discovered faucets, the only funded one paid 100 lamports per work item, below transaction and receipt rent costs. An isolated, low-priority, single-job CLI install was stopped after 55 seconds; no miner or claim transaction ran. That earlier route could not fund the rehearsal. Probe evidence is in `pow-faucet-probe.json` and `pow-faucet-discovery.json`.
- The pre-launch Mainnet instance used the reviewed program `3c5jUPmmXR3zV47uGW4YjSeSQhHKk2H6yj5U5JcfvbfK`, Pump mint `BwnmfvgEhAFboL8YW6CFoBUSH4QHriA9qBcAVPc71jRA`, and game version `1793081200001` with original 3,600 / 30 / 86,400-second timing. The opening snapshot was finalized at slot `462231588`, with game absence verified at slot `462231590`, before the game and holder vault were initialized. Round 1 was opened by the separately funded keeper. No initial PIGGY purchase was made by the operator.
- Actual Mainnet guarded feeds, game-reward withdrawals and a production PIGGY-holder claim succeeded. The holder claim finalized at slot `462274354` with 0.01 SOL gross and 0.008928280 SOL net; token-preservation, receipt/accounting, public proof, UI refresh and unsigned duplicate-rejection checks passed. Its funding included two disclosed sponsored 0.01-SOL vault deposits plus a sweep of 0.0000315 SOL in existing game fees, not additional game feeds. This historical result alone did not satisfy the fresh-instance gate; the 28 October rehearsal and fresh Mainnet receipts now supply that separate evidence. See [VALIDATION.md](../VALIDATION.md).
- [piggy.casa](https://piggy.casa) is the public site. Its [proof index](https://piggy.casa/proofs/index.json) and the [native Site proof route](https://piggy-play.windyhen258.chatgpt.site/proofs/index.json) were read back successfully with the exact Mainnet program, game and mint domain. At the operations check the index had no published epochs; the publisher was waiting for its funded threshold.
- At the recorded pre-launch cutover, keeper, publisher and proof synchronization ran on one Railway service with persistent `/data/piggy` storage. The Mac LaunchAgents were stopped and disabled before the nine-file import. Server checks verified the original snapshot, mainnet genesis/program/authorities, healthy role heartbeats, proof sync and automatic keeper recovery after SIGKILL with no new transaction. No awake or logged-in Mac is required; see [OPERATORS-SERVER.md](OPERATORS-SERVER.md).
- Current RPC rent quote for this binary: program account 833,120 lamports; ProgramData 1,360,530,680 lamports; deployment buffer 1,360,490,040 lamports. Final locked deployment rent is **1.361363800 SOL**. The conservative sum including a buffer is **2.721853840 SOL**, before transaction fees, mint, game and holder accounts. Requery before funding; rent and the final binary size can change.

Build and public rehearsal evidence lives in ignored `.openai/local/publicnet/`: `build/manifest.json`, per-cluster `preflight-report.json` and `rehearsal-report.json`, and `faucet-attempts.json`. A report with `ok: false` is a blocked attempt, not a successful deployment. The rehearsal tools cannot spend on Mainnet; separate, explicitly authorized Mainnet operations did spend real SOL. Their private evidence includes `.openai/local/mainnet/pump-create-receipt.json`, `launch-state.json` and `game-canary-report.json`. The bootstrap spent 0.077660400 SOL, including 0.02 SOL publisher and 0.05 SOL keeper funding; a later authorized 0.25 SOL keeper top-up is recorded separately. Current authoritative journals are on Railway, not the historical checkout or stopped Library runtime.

## Identity and build isolation

`publicnet-prepare.mjs` creates separate Devnet and Testnet identities under `.openai/local/publicnet/<cluster>/wallets/`, with directory mode 0700 and key files 0600. It never reads the user's default Solana CLI wallet or an existing local validator fixture. Its test identities must never become Mainnet authorities. Keep the entire `.openai/local/` tree out of Git and public hosting.

The public build uses `--no-default-features`, an isolated Cargo target directory, a locked dependency resolution, and a recorded source hash. Deployment checks the binary hash and source hash again. The `local-test-lottery` feature is forbidden in public artifacts: public builds reserve the original lottery allocation and carry unused reserve into later rounds; they do not run the predictable demonstration lottery.

From the frontend root:

```sh
node scripts/publicnet-prepare.mjs --cluster devnet --build
node scripts/publicnet-prepare.mjs --cluster testnet
```

If the Rust source changes, rebuild and rerun all chain and release verification. Do not reuse a manifest from a previous source tree.

## Devnet, then Testnet rehearsal

Supply at least 3 free test SOL to each new deployment payer, or use the faucet flag once. Do not buy test tokens or transfer real SOL to these test addresses. The harness requires a conservative deployment reserve plus 0.1 test SOL for the small canary. Faucet limits may require the official interactive faucet or a separate provider. Do not loop faucet requests.

```sh
node scripts/publicnet-rehearse.mjs --cluster devnet --airdrop --deploy
node scripts/publicnet-rehearse.mjs --cluster testnet --airdrop --deploy
```

Once funded, omit `--airdrop`. To avoid HTTP write fanout on a rate-limited shared RPC, the reviewed harness also accepts `--deploy-transport tpu`; this selects the official CLI's TPU transport, not a custom signer or uploader. `--deploy-timeout-seconds` accepts 60–1,800 seconds. The harness records the actual CLI deployment signature, transport, buffer identity and complete private stdout/stderr logs. It locks each cluster's rehearsal, archives old reports only after resolving submitted signatures, and refuses to overwrite an unknown transaction outcome. Mainnet operator planning remains a separate disabled path.

An HTTPS private testing RPC may be selected with `PIGGY_RPC_URL` or `--rpc`. The tool still checks the actual genesis before each signed canary transaction. It cannot generate keys, request airdrops, deploy or send on Mainnet. CLI commands pass explicit RPC, payer, program, upgrade authority and buffer paths without changing global CLI settings.

Each funded run verifies the on-chain executable bytes, creates a fresh isolated test game, and exercises:

1. A real Token-2022 test mint with MetadataPointer and TokenMetadata extensions, matching the account format used by current Pump `create_v2` coins, and holder balances before fee accrual. Game payment and reward vaults remain legacy WSOL.
2. The original 75,001-lamport first whole share price and all four payout modes, using the guarded purchase instruction.
3. Earlier holders earning rewards from later purchases, plus live game reward withdrawal back to native SOL.
4. Slippage and expired quote rejection through the public-chain simulator without game-state mutation. The local guard integration suite additionally submits rejection transactions and checks refunds and state rollback.
5. Original P3D fee sweeping into the holder vault, proportional funded allocation from the opening holdings, root publication, and a real holder claim preserving remaining reserves.
6. Settlement using the real public cluster clock, next-round rollover, and the winner claiming the old round after rollover.

The canary uses a short, explicitly test-only 120-second initial round, one-second increment and 180-second cap. It does not establish the intended production round parameters. It writes submitted signatures before waiting for confirmation. An ambiguous timeout must be reconciled by signature before rerunning; a failed deployment may leave the explicitly named buffer to resume or recover. Never close a buffer or program without checking its address, cluster, authority and transaction status.

Successful canaries create `client-config.template.json`. Set a real HTTPS `proofIndexUrl` before using it. The template is not automatically published. Rehearsal proofs are diagnostic; use the durable publisher for actual public holder epochs.

## Public deployment configuration and proof hosting

The frontend selects public mode using `VITE_PIGGY_CONFIG_URL`. The JSON must contain:

```json
{
  "schemaVersion": 1,
  "cluster": "devnet",
  "genesisHash": "EtWTRABZaYq6iMfeYKouRu166VU2xqa1wcaWoxPkrZBG",
  "rpcUrl": "https://YOUR_RPC",
  "programId": "DEPLOYED_PROGRAM_ADDRESS",
  "gameVersion": "POSITIVE_U64",
  "piggyMint": "ACTUAL_SPL_OR_TOKEN_2022_MINT",
  "proofIndexUrl": "https://YOUR_PUBLIC_PROOFS/index.json",
  "purchaseGuardVersion": 1,
  "priorityFeeMicroLamports": 0,
  "mainnetEnabled": false
}
```

Mainnet uses cluster `mainnet-beta`, its own genesis, identities, deployed program, token mint and game version, with `mainnetEnabled: true` only after review. RPC and proofs must use HTTPS and must not reference a local signer. Browser RPC credentials are visible to visitors; use domain restrictions and provider quotas. Never embed authority or wallet secret keys in a Vite environment variable.

Mainnet release configuration also requires the following explicit reviewed roles. These are public addresses; the game stores the community treasury's derived WSOL token account, not its raw wallet address:

```json
{
  "expectedAuthorities": {
    "gameCreator": "REVIEWED_DEPLOYER_PUBLIC_KEY",
    "communityTreasury": "REVIEWED_TREASURY_PUBLIC_KEY",
    "holderPublisher": "REVIEWED_PUBLISHER_PUBLIC_KEY",
    "upgradeAuthority": "REVIEWED_UPGRADE_AUTHORITY_PUBLIC_KEY"
  }
}
```

All four roles are mandatory and distinct on Mainnet. Preflight enforces the actual program upgrade authority, game creator, holder publisher, treasury WSOL ATA and its token-account owner. Mainnet timing must be exactly the original **3,600 seconds initially, 30 seconds per whole share and 86,400-second cap**. A successful short-timer test game cannot pass this production gate.

Proof index metadata is `{schemaVersion: 1, cluster, genesisHash, programId, gameVersion, piggyMint, epochs: [{epoch, root, snapshotSlot, totalAmount}]}`. Per-wallet proof files live alongside the index under `wallets/<base58-wallet>.json`. The endpoint is read-only. An empty index is valid before any published holder epoch; preserve the publisher's opening eligibility snapshot before fee accrual. The publisher and its signing key run separately from static public hosting.

```sh
node scripts/publicnet-preflight.mjs --cluster devnet --config PATH_TO_REVIEWED_CONFIG
node scripts/publicnet-preflight.mjs --cluster testnet --config PATH_TO_REVIEWED_CONFIG
node scripts/publicnet-preflight.mjs --cluster mainnet-beta --config PATH_TO_REVIEWED_MAINNET_CONFIG
```

Preflight is read-only on all networks. It checks genesis and a fresh blockhash, exact feature-free artifact/source hashes, live rent, actual deployed ProgramData bytes, upgrade authority metadata, native-SOL game payment configuration, current round existence, original P3D destination, holder mint and vault owner, reserve coverage, and proof index domain binding. Shared Solana public RPC explicitly fails the Mainnet production gate. Use a production provider and verify its HTTPS and WebSocket origin policy, capacity, priority-fee handling and usage limits under real browser traffic.

The private publisher and keeper use HTTP status polling for finalized transaction confirmation. Check actual status polling, block height, account reads and holder-account enumeration against the intended production provider; a successful genesis query alone is insufficient. Public operator configs pin `programBinarySha256`, `programBinaryBytes` and the reviewed upgrade authority, and both operators recheck deployed bytes before sending. RPC credentials remain in private operator configuration; the hosted browser uses the public application's RPC route.

The proof index must include every published on-chain epoch, starting at epoch 1 and ending at `next_epoch - 1`. Fresh holder state has `next_epoch = 1` and correctly accepts an empty index. Each root, snapshot slot and total is compared with the actual epoch account; the published total must reconcile with holder state. An unavailable or stale proof index blocks readiness.

Mainnet preflight also requires successful Devnet and Testnet rehearsal reports matching this exact binary and source. After the reviewed real Mainnet canary, record its signatures in ignored `.openai/local/publicnet/mainnet-beta/mainnet-canary-report.json` (or pass `--mainnet-canary-report PATH`):

```json
{
  "schemaVersion": 1,
  "cluster": "mainnet-beta",
  "genesisHash": "5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d",
  "programId": "REVIEWED_MAINNET_PROGRAM",
  "gameVersion": "REVIEWED_GAME_VERSION",
  "binarySha256": "EXACT_RELEASE_BINARY_HASH",
  "transactions": [
    { "kind": "feed", "signature": "CONFIRMED_GUARDED_FEED_SIGNATURE" },
    { "kind": "gameClaim", "signature": "CONFIRMED_GAME_CLAIM_SIGNATURE" },
    { "kind": "holderClaim", "signature": "CONFIRMED_HOLDER_CLAIM_SIGNATURE" }
  ]
}
```

The checker fetches each receipt from Mainnet and verifies successful execution of the expected program instruction against the configured game. Merely writing `ok: true` into a file cannot satisfy this gate. No command in these deployment tools performs the real Mainnet canary automatically.

## Final launch gates

- Funded Devnet and Testnet canaries both produce `ok: true` with confirmed signatures, not merely reachable RPCs.
- Root tests, default Rust tests, guarded on-chain rejection tests, adversarial chain tests and current visual/interaction checks pass against the same release commit.
- Browser wallet acceptance, rejection, disconnect/reconnect, wrong network, insufficient balance, fee display, stale quote recovery and both claim types are exercised against the actual hosted Devnet build. Test a physical mobile wallet browser; desktop emulation is insufficient for wallet handoffs.
- The Mainnet supply, mint authority and freeze authority policy, upgrade authority custody, creator/community destination and holder publisher are reviewed. Keep recoverable, access-controlled backups. Do not revoke an authority simply to make a launch checklist green.
- Mint, program, game, holder vault, opening eligibility snapshot, public proof endpoint and production RPC exist and pass the read-only Mainnet preflight. Confirm source verification with the deployed binary and documented build toolchain.
- A reviewed small Mainnet canary, signed by the intended wallet owner, verifies feed, game withdrawal and holder entitlement publication/claim before unrestricted promotion. This harness never spends real SOL. A launch should remain blocked until those actual Mainnet operations have succeeded.
- Settlement and holder publishing have a monitored operator, sufficient fee balance, durable state backup and restart/reconciliation procedure. Confirm loss of the publisher cannot spend user funds or erase already published claims; do not promise future holder distributions while that service is down.

Official references: [clusters and public RPC](https://solana.com/docs/references/clusters), [program deployment](https://solana.com/docs/programs/deploying), [production readiness](https://solana.com/docs/tools/production-readiness), and [genesis hash identity](https://solana.com/docs/rpc/http/getgenesishash).

## Disabled Mainnet operator plan

```sh
node scripts/mainnet-plan.mjs --cluster mainnet-beta
```

This tool creates `.openai/local/mainnet/disabled-deployment-plan.json`. It reads the dedicated Mainnet identities only to check their public addresses against the manifest and validate private file permissions; it never signs or broadcasts. It verifies the release manifest and real network genesis, records rent and funding, checks the completed same-release public rehearsals, and emits a disabled CLI argument array using explicit payer, program, upgrade-authority and recoverable buffer paths. The payer, upgrade authority, publisher, keeper, community treasury, token mint and program are distinct identities. A separate buffer identity is recorded alongside them.

The planned `solana program deploy` arguments use zero priority fee, three signing attempts, a fixed initial program allocation and explicit `--use-rpc`. They do not use `--final`, `--skip-preflight`, `--skip-feature-verify` or the default CLI wallet. The deployment buffer must be reconciled after any interruption before retrying.

The plan rejects `--deploy`, `--airdrop` and `--build`, and rejects an operator budget above 3 SOL. At the current rent quote, its conservative peak plus allowances totals **2.94185384 SOL**: deployment peak 2.72185384 SOL, 0.05 SOL deployment fee/retry allowance, 0.05 SOL game/canary allowance, 0.05 SOL keeper/initial-round allowance, 0.05 SOL Pump creation allowance and 0.02 SOL publisher fee allowance. No initial token buy is included. This is a planning ceiling, not a hard limit implemented by the native Solana CLI. The actual paid execution remains a separate, reviewed action after staging and checks; the planner always reports `launchReady: false`.

The 0.05-SOL keeper allocation is a monitored startup allowance. The actual first Mainnet round required 0.004185920 SOL of account rent plus its transaction fee; other versions or account layouts can differ. It does **not** guarantee 24 hours of unattended empty-round rollover. Monitor balance and the keeper's rolling fee/rent budgets, and refill before either is exhausted. Any later funding increase needs phase-accurate accounting after deployment-buffer recovery; do not raise the 3-SOL planning ceiling silently.

## Installed operator runtime and proof synchronization

The active Railway service is `353ecafb-2040-40f3-883d-6a84e6ce85c2`, with one supervised replica, a kernel file lock and persistent volume `a387e749-ac95-4445-9939-b09c08ec1076` mounted at `/data`. Deployment `3b67f294-436b-4deb-9268-a649d1b374b3` passed enabled health checks. The three historical Mac LaunchAgents were stopped and disabled at 23:44:27 before private state transfer; do not run that old copy alongside the server.

The authoritative publisher and keeper journals are `/data/piggy/publisher-state/state.json` and `/data/piggy/keeper-state/keeper-state.json`. The public export is `/data/piggy/public/proofs/`. A separate watcher checks every 30 seconds, uploads changed wallet/epoch files and then the index to persistent R2 storage, and records a private successful-export hash. Its unchanged path was previously checked on the Mac, and the server completed a successful one-file empty-index sync after import. The upload token never belongs in the public export or frontend.

The server supervisor uses bounded restart backoff and recovers only verified dead-process locks while holding its kernel lock. A forced keeper SIGKILL recovered automatically with the original S0 and no new transaction; activation/redeployment also preserved persistent state. The earlier Mac graceful-restart tests remain historical evidence. No Mac login or awake session is required now. Do not start a repository watch process alongside Railway, and never replace its latest journals with an old backup without chain reconciliation. See [HOLDER-PUBLISHER.md](./HOLDER-PUBLISHER.md) and [OPERATORS-SERVER.md](./OPERATORS-SERVER.md) for health and recovery details.

## Disabled game initialization packets

```sh
node scripts/publicnet-game-init.mjs --cluster mainnet-beta --config PATH_TO_REVIEWED_MAINNET_CONFIG --publisher-config PATH_TO_PRIVATE_PUBLISHER_CONFIG
```

Before the final public config exists, the same disabled Mainnet plan can use the dedicated public role manifest and an explicitly chosen positive-u64 `--game-version`. Keep that version identical in the frontend, publisher and launch records. The generated `game-initialization-plan.json` contains public addresses, exact instruction bytes, account privileges, original timing, two unsigned packets and rent estimates. No secret key is loaded, no transaction is signed, and execution flags are rejected.

The first packet creates the community treasury and creator WSOL ATAs idempotently. The second atomically initializes the game and canonical funded-holder vault/publisher, preserving original timing and leaving `round_id = 0`. Initializing the holder vault replaces the temporary creator WSOL destination before the first round exists. The reviewed packets fit the Solana transaction limit (418 and 613 bytes in the prepared Mainnet plan). The tool blocks readiness until the exact program is deployed, its bytes and upgrade authority match, the actual initialized PIGGY mint exists, creator rent/fees are funded, and the matching private publisher journal already holds finalized pre-creation S0 with game-absence proof. It also rejects rerunning initialization over an existing game. Refresh the blockhash and review the packet before any future signing.

The production startup order is:

1. Create and verify the Pump mint and intended initial holders. A Pump mint whose entire supply remains in an off-curve bonding-curve account has no eligible claim-capable holders; prepare the intended actual holder distribution before S0.
2. Run `node scripts/holder-publisher.mjs prepare-opening --config PRIVATE_PUBLISHER.json` **before creating the game**. It durably saves finalized S0 and proves the game PDA absent at a finalized bank at least as new as S0. Preserve this journal and backup; never replace it with a later snapshot.
3. Review the unsigned initialization plan with `--publisher-config`, then initialize Game+Holder only. The original timer configuration is stored while `round_id` remains zero.
4. Run `node scripts/holder-publisher.mjs init --config PRIVATE_PUBLISHER.json`. It activates the prepared journal while preserving S0 and exports the public empty proof index. Confirm the index deployment domain and publish it to the reviewed read-only HTTPS endpoint.
5. Review the keeper status and activation journal, then use the separately funded permissionless keeper to open round 1 after S0 activation. Paid Mainnet keeper execution remains gated by its operator configuration and explicit Mainnet flag.
6. Complete actual canaries and release preflight before enabling the public UI and promotion. Preflight rejects `round_id = 0`. Keep publisher and keeper services supervised, balances funded and restart/reconciliation procedures available.

An outside caller can permissionlessly initialize a round after game creation. Because S0 and its game-absence proof are already durable, such a round still starts after S0. The keeper may fail closed rather than adopt an externally opened first round; investigate and reconcile its activation journal without replacing S0. These disabled packets do not replace funded public rehearsals or real Mainnet receipt gates.

Official free-funding references: [Solana faucet's agent methods](https://faucet.solana.com/), [Devnet funding guide](https://solana.com/developers/cookbook/development/airdrops-and-faucets), and [proof-of-work faucet source](https://github.com/jarry-xiao/proof-of-work-faucet).

## Pump creation review bundle

`scripts/pump-prepare.mjs` builds an unsigned `create_v2` instruction and PNG/metadata review bundle. It never opens a secret key, signs, broadcasts, or buys tokens. Install the pinned official tooling separately so the application dependency graph is unaffected:

```sh
npm install --prefix .openai/local/pump-tools --no-audit --no-fund --ignore-scripts --save-exact @pump-fun/pump-sdk@4.3.1 sharp@0.34.5
node scripts/pump-prepare.mjs --cluster devnet --mint PUBLIC_MINT_ADDRESS --payer PUBLIC_PAYER_ADDRESS --creator PUBLIC_CREATOR_ADDRESS
```

Use `--cluster mainnet-beta` for the separate Mainnet public addresses. The tool checks the current official IDL discriminator, all 16 account addresses and privilege flags, independently derived PDAs, and decoded name/ticker/creator/optional flags. It checks actual Pump program availability, current global creation enablement and token supply, and quotes the unsigned transaction's network base fee. It does not assume Pump is deployed on Testnet.

The output is ignored `.openai/local/pump-launch/<cluster>/`: `create-v2-review.json`, `piggy-token-1024.png`, `metadata.template.json`, `official-pump-idl.json`, and artwork attribution. The PNG is the existing PIGGY silhouette rendered on the game's purple background, 1024×1024. Before signing, upload the approved image and metadata to immutable hosting, check the public content and social links, then rebuild with the final `--metadata-uri`. The default `.invalid` URI is deliberately unusable. The transaction's blockhash expires; rebuilding and review are required before signing.

The prepared SOL-paired coin has 6 decimals. On 27 October the live global supply was `1000000000000000` base units, or one billion whole tokens. Mayhem and deprecated cashback are false. Pump's separate permanent holder-reward launch option is false unless explicitly selected with `--holder-reward true`; review it before launch because it changes who receives Pump trade creator fees. It does not enable or replace PIGGY's game-fee holder claims.

The current official [Pump fee page](https://pump.fun/docs/fees) lists no platform creation charge; account rent and transaction fees still apply. The unsigned two-signer instruction quoted 10,000 lamports of base network fee; this excludes rent, priority fees and a first buy. The review reserves a provisional 0.05 SOL for account creation, fees and retries. That is an operational allowance, not an exact Pump charge. No initial buy budget is chosen or encoded. Final payer simulation and a fresh fee quote are required before spending. Official instruction reference: [Pump coin creation](https://github.com/pump-fun/pump-public-docs/blob/main/docs/instructions/COIN_CREATION.md).
