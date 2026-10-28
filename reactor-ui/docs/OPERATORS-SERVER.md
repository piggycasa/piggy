# Running the PIGGY operators

The keeper, holder publisher and proof-sync watcher are separate backend processes. Their implementation is included; production keys, configuration secrets, journals, opening snapshots, migration bundles and provider account identifiers are deliberately excluded from this source publication. Never copy real operator state into the Docker image or repository.

## Container and persistence

Build `Dockerfile.operators` from the `reactor-ui` directory with pinned Node 24.22.1 and npm 11.6.2. The `.npmrc` setting `install-links=true` is required by the local dependency override. Install locked dependencies using `npm ci --omit=dev --ignore-scripts`.

Mount one persistent volume at `/data` and set `PIGGY_OPERATOR_DATA_DIR=/data/piggy`. Start with `PIGGY_OPERATOR_ENABLED=false`, one service instance and one volume. The entrypoint takes a kernel `flock`; do not set `PIGGY_OPERATOR_LOCK_HELD` yourself. `GET /health` reports liveness even while disabled; `/ready` requires active processes and fresh keeper/publisher status. Allow the supervisor to drain on SIGTERM.

## Existing-game migration

Stop the previous runtime and resolve every pending transaction before exporting its state. Preserve the original opening snapshot, publication plans, transaction identities and proof export. Import only through `scripts/operator-import.mjs` into a disabled runtime; its migration marker is written last. A different migration cannot overwrite existing state.

Use an independent read-only check for the exact cluster genesis, program bytes, game version, mint, signing-role addresses and journal continuity. Never initialize a new opening snapshot for an existing game. Enable only after persistent storage, configuration and reconciliation pass. Run exactly one active publisher/keeper set; an old local copy must stay stopped.

## Recovery and operation

The supervisor restarts exited children with bounded backoff. Keeper and publisher transactions are journaled before broadcast; ambiguous outcomes must be reconciled against finalized Solana state. Do not delete lock files owned by a live or unverified process, erase a pending plan, or reset the opening snapshot to bypass an error.

Use separate signing identities, least-privilege storage credentials, owner-only private file permissions, RPC credentials outside frontend variables, persistent-volume backups and monitoring. Backup restore requires transaction reconciliation before enabling signers. Keep minimum balances and explicit spending caps in private operator configuration; this publication does not authorize a budget or fund operators.

Proof sync uploads wallet and epoch documents before the public index and skips unchanged exports. Only wallet proofs and public epoch metadata belong at the public proof endpoint. No uploader token belongs in Git or browser code.

See [HOLDER-PUBLISHER.md](HOLDER-PUBLISHER.md) for publisher invariants and [PUBLICNET-LAUNCH.md](PUBLICNET-LAUNCH.md) for the deployment gates. Passing source tests does not establish production readiness, independent security review or correct operation of an arbitrary host.
