# Fresh program launch preparation

The replacement program is `BVqivL3X8JvuaNgiVAZb9WitRnT2LYGPLvdm3tD8a6Ph`, with original reviewed bytecode. It is not yet an initialized game. The new token mint is supplied later; the retired mint is explicitly rejected by the binding helper.

## Mint-dependent steps

1. `relaunch-bind.mjs` validates mainnet, the executable, retained upgrade authority and the real mint. It produces private keeper/publisher configs and a website stage. Token links, program identifiers, verification facts and proof routes are rebound together. It signs nothing and refuses a different mint after a binding already exists.
2. `relaunch-server.mjs configure` installs the config under a dedicated private directory. `prepare-opening` captures a durable finalized holder snapshot before game creation. Existing snapshots are retained.
3. `relaunch-initialize.mjs` simulates first and requires `--execute` before signing. It verifies the prepared snapshot, known signer and executable, creates canonical SOL destinations and Game+Holder atomically, and leaves `round_id=0`. Its durable signature journal blocks blind repeats.
4. `relaunch-server.mjs activate` requires `--execute`, activates the saved snapshot, opens the first round through the existing keeper and produces a matching supervisor marker. Existing transaction reconciliation stays in the keeper.
5. Deploy the mint-bound frontend and enable the new operator directory. Complete current-domain, proof, device and real-wallet checks before announcing the game as live. A historical canary cannot prove this new game’s transactions.

These helpers do not create a token, make a token purchase or create a Streamflow lock. Private key paths and RPC credentials remain outside public source and frontend artifacts.

## Direct proof serving

With `PIGGY_PROOFS_MODE=local`, the supervisor runs two roles: keeper and publisher. The same server provides GET/HEAD access only to `/proofs/index.json`, `/proofs/wallets/<public-key>.json` and `/proofs/epochs/<number>.json` beneath the publisher's public export directory. Other paths, write methods, oversized files and file symlinks are rejected. No HTTP signing interface is exposed. Public web requests use `/launch-proofs` rewritten to this server.

The original external-upload mode remains the default for compatibility. Retired directories and their snapshots are not reused for the replacement game.

## Launch gates

The token must exist before its supply and ownership snapshot can be checked. No round is opened merely by deploying the executable or preparing these files. The hosting account must be authorised for the actual production project, and the operator image must be successfully deployed. Provider errors do not count as completed launch steps.
