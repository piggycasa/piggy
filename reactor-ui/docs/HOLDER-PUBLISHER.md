# Holder rewards and round operations

Game entries use SOL. The separate Pump.fun $PIGGY token is an eligibility token; it is never staked, deposited or burned by the game. Pump's native holder-reward option is not enabled for the launched token. These game rewards are independent of Pump trading fees.

## Where the SOL comes from

The original Solana Fomo3D mode tables allocate 0–10% of entry purchases to P3D, plus the unassigned 10% referral allocation when no referrer is recorded. The resulting holder allocation is Whale 16%, Bear 10%, Snek 20%, Bull 18% without a referrer; with one it is 6%, 0%, 10%, 8%. At settlement, the final buyer's mode allocates another 0–20% of the remaining round pool to P3D. These are not percentages of Pump volume. See [ECONOMICS.md](../ECONOMICS.md) for the full tables.

Upstream's P3D withdrawal was unimplemented. Instruction 6 in this fork sweeps the unpaid round liability into the canonical WSOL holder vault. Each published epoch reserves only actual, unreserved vault funds. Instruction 9 pays a wallet's Merkle entitlement once; the client unwraps WSOL to native SOL. Publication never mints SOL or pays from later token buyers.

## Opening snapshots

The operator records a finalized opening snapshot S0 before the game exists. That snapshot determines the first window's holders. After fees accrue, the operator saves the next opening snapshot S1 before sweeping old liabilities and publishing the first window. S1 determines the following window's holders. A transfer does not revoke already published claims. Newly acquired tokens join the next opening snapshot, not earlier earnings.

Balances are aggregated by wallet across all initialized accounts of the actual mint, using its legacy SPL or Token-2022 program. Raw token units determine proportional allocations with deterministic largest-remainder rounding. The current policy includes on-curve wallet owners; off-curve owners such as bonding curves, pools and vault PDAs cannot directly sign claims and are excluded. Explicit exclusions must be disclosed before the first snapshot. The staged policy has no additional excluded wallets. This does not support a custody platform claiming on behalf of its users.

The publisher is trusted to report historical balances and allocation fairly. The program verifies funded budgets, authorized roots and wallet proofs, but cannot independently verify old RPC balance data. The UI verifies root metadata and claim receipts against the chain. This is a trusted snapshot distributor, not a trustless historical-balance oracle.

## Activate a new deployment

1. Verify the reviewed program, Pump mint and authorities. There must be at least one eligible token holder. No initial token purchase is encoded in the prepared Pump transaction.
2. Run `holder:publisher prepare-opening` before creating the game. It saves S0 and proves the game was absent at a finalized bank at or after S0.
3. Initialize the game and holder vault together, with original timing 3,600 / 30 / 86,400 seconds. Leave `round_id=0`.
4. Run `holder:publisher init`. It validates the deployment, activates the saved S0 without replacing it, and exports an empty proof index.
5. Start the separate keeper to open round 1. Confirm the actual round and complete release preflight before enabling the public UI.

This order also protects the opening eligibility if a third party uses the permissionless round-start instruction before the keeper. An already active game without its original snapshot and keeper journal must not be silently adopted.

Commands accept a private JSON configuration outside the hosted directory:

```sh
npm run holder:publisher -- prepare-opening --config /PRIVATE/publisher.json
npm run holder:publisher -- init --config /PRIVATE/publisher.json
npm run holder:publisher -- status --config /PRIVATE/publisher.json
npm run holder:publisher -- publish --config /PRIVATE/publisher.json
npm run holder:publisher -- watch --config /PRIVATE/publisher.json
node scripts/round-keeper.mjs status --config /PRIVATE/keeper.json
node scripts/round-keeper.mjs tick --config /PRIVATE/keeper.json
node scripts/round-keeper.mjs watch --config /PRIVATE/keeper.json
```

Mainnet signing requires both the configuration's `mainnetEnabled: true` and an explicit `--allow-mainnet`. The original `*.disabled.json` templates remain disabled; the installed operator services use separate private active configurations. Publisher and keeper transaction confirmation uses HTTP status polling and requires finalized success. A timeout remains ambiguous until reconciled; working WebSockets are not required for these operator confirmations.

## Claims and publication cost

The Mainnet publisher checks every 30 seconds and normally opens an epoch at most once per hour after the previous publication, with a minimum 0.01 SOL of funded holder rewards. Those are operator defaults, not a promise that an individual wallet earns enough to make claiming worthwhile. The production holder canary used an explicitly authorized one-off 60-second interval only in memory; the stored hourly configuration remained unchanged. Each holder claim permanently creates a single-use receipt; rent and network fees can exceed a small reward. The UI shows these costs and disables a negative-net claim by default. Tokens remain in the wallet and the entitlement remains on chain when a claim is deferred. Multiple epochs currently require separate claim transactions and receipts; waiting does not merge them.

The current legacy transaction format supports at most 65,536 positive entitlements in an epoch (Merkle depth 16). Publication fails before reserving an epoch beyond that limit. Larger distributions require a separately reviewed transport or sharding change. The publisher also refuses an unbounded history above 10,000 rounds; public release preflight limits its full proof-index audit to 5,000 epochs. Plan indexing and pagination before these limits.

## Operate and recover

Publisher state, immutable plans, keeper state and keys stay in separate private operator directories. Host only the exported proofs and static application. Public index and wallet documents must be served over HTTPS with browser CORS access; publish wallet/epoch files before the index. An index can safely lag publication, but the UI cannot claim a proof that has not reached the host. Back up private state and immutable manifests after every change.

The publisher pairs game/config/vault reads in one finalized bank, checks conservation and keeps a durable minimum context slot after every finalized write. It validates ordered, unique epoch journals and contiguous snapshot windows before mutation, and writes each next snapshot and epoch plan before publishing. Both operators require the reviewed `programBinarySha256` and `programBinaryBytes` and recheck live ProgramData bytes and upgrade authority before mutation. After a timeout, `reconcile` compares the planned epoch with the chain and adopts the confirmed result; never delete state or create a different root for that epoch. Sweeps are idempotent and epochs reject conflicting or duplicate publication. A stale lock requires verifying that its process is stopped before manual lock recovery. Run the processes under a supervisor: the publisher watch loop exits on an RPC failure rather than masking it.

The keeper has a separate low-balance key, enforces per-transaction and rolling 24-hour fee/rent budgets, and records the signed transaction identity before broadcasting once. It waits for finalized success or blockhash expiry before attempting another action. It reads the canonical on-chain Clock, settles expired rounds, leaves at least eight seconds for the celebration after observing settlement, then creates the next round. This is a continuous operator process; deployment alone does not run it. Monitor balances, process health, pending signatures, unpublished vault funds, proof-host availability and unexpected authority changes. Restart from durable journals, not an empty directory.

## Fresh launch and retained pre-launch claims

The fresh-launch client targets game version `1793155991891`, PDA `GXX38mLVdj2i2H3s5z5yvpkaZHpRQt1ZorrgsfeFKT5g`. It has a separate holder configuration (`JCiKUFDM62yd1VXUzgHTLa6m2Aa82i4fVZwtVXchHxkN`), vault (`D3azZR1kykY8rdabh9iAVmXcuo7rA2LYuDK9moY1mUUB`), opening snapshot, durable journals and `/launch-proofs/index.json` proof route. The program and $PIGGY mint remain the same. Round opening and verified operator activation are separate actions from selecting this configuration.

Version `1793081200001` is the pre-launch instance. Preserve its journals, snapshots, epochs and `/proofs/index.json` export so [existing game and token-holder rewards remain claimable](https://piggy.casa/test-claims/). The legacy keeper supports `settleOnly: true` and `settleOnlyRoundId: "3"`: it pins that round under its lock, waits for the finalized deadline, settles using the existing spending and release guards, then remains terminal without starting another round. Configuration and code support do not by themselves establish that a server cutover has completed.


## Pre-launch Mainnet services record

As of 27 October 2026, the Mainnet token, game and holder vault exist. The game uses version `1793081200001`, program `3c5jUPmmXR3zV47uGW4YjSeSQhHKk2H6yj5U5JcfvbfK` and mint `BwnmfvgEhAFboL8YW6CFoBUSH4QHriA9qBcAVPc71jRA`. S0 was captured at finalized slot `462231588`, with game absence proven at slot `462231590`, before game creation. The first snapshot contains an actual external holder; no operator token purchase was made to create eligibility.

The three current roles run in one supervised Railway service:

| Role | Function |
| --- | --- |
| `keeper` | Observe the round, settle it and start the next round within configured budgets. |
| `publisher` | Snapshot holders, sweep earned game fees, publish funded epochs and export proofs. |
| `proofSync` | Check exports every 30 seconds and upload changed proofs to the authenticated hosting endpoint. |

The active runtime is Railway service `353ecafb-2040-40f3-883d-6a84e6ce85c2` (`piggy-operators-v2`), with persistent data at `/data/piggy` and code in the reviewed container image. It runs one replica in SFO (`us-west2`). A kernel file lock prevents a second supervisor from using the same volume. See [OPERATORS-SERVER.md](OPERATORS-SERVER.md) for deployment identity, activation gates and migration receipts.

Under `/data/piggy`, `configs/` and `keys/` are private, `publisher-state/` and `keeper-state/` contain the authoritative durable journals, and `public/proofs/` contains the public export. The upload token and `proof-upload-config.json` remain private files outside that export. Only the keeper and holder-publisher signing keys were migrated. The original checkout and stopped Mac runtime are historical evidence, not the current journals. Preserve the server's latest journals and their opening snapshots during backup or migration.

The proof uploader writes wallet/epoch documents before the index to the Site's persistent R2 storage. The canonical read endpoint is [piggy.casa/proofs/index.json](https://piggy.casa/proofs/index.json), backed by [the native Site endpoint](https://piggy-play.windyhen258.chatgpt.site/proofs/index.json). Its private hash marker skips uploads when the export is unchanged. A successful empty index is expected until enough fees fund the first epoch; it does not mean rewards have already been published.

The supervisor restarts exited children with bounded backoff. Health becomes ready only after all three children run and the keeper and publisher emit recent valid status messages. The proof watcher reports successful uploads and stays silent when exports are unchanged. Inside the container, inspect health without starting another operator:

```sh
curl "http://127.0.0.1:${PORT:-8080}/health"
```

The earlier Mac LaunchAgents (`com.piggy.mainnet.keeper`, `com.piggy.mainnet.publisher`, `com.piggy.mainnet.proof-sync`) had verified graceful restarts and RPC-error recovery under launchd. All three were stopped and disabled before the server import. Railway then passed read-only chain checks, a healthy enabled startup, proof sync and forced keeper-crash recovery without a new transaction or changed S0. Operation no longer requires the Mac to remain awake, online or logged in. Do not restart the old Mac copy; any rollback must first stop Railway and copy its latest state back. Operator balances and budgets still need monitoring; the later 0.25 SOL keeper top-up and current caps are recorded in the server runbook.

The production holder canary finalized at slot 462274354, paying 0.01 SOL gross and 0.008928280 SOL net. Token balances and authorities were preserved, the temporary account closed, and an unsigned duplicate attempt was rejected without broadcast. Its two epochs used 0.02 SOL of disclosed sponsored funding plus 0.0000315 SOL of existing game fees, preserving the original S0 and subsequent S1 eligibility. See [VALIDATION.md](../VALIDATION.md) for receipts and the 22 post-claim checks. Operational service health and this successful claim do not satisfy every release gate: Testnet and physical wallet/device checks remain outstanding.
