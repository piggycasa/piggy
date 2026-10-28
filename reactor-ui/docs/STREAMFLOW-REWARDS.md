# Streamflow recipient rewards

The holder publisher can include unwithdrawn PIGGY in standard Streamflow v4 locks and vesting contracts. Set `streamflowLocks: true` in the **fresh game's** publisher configuration. A missing flag preserves the original wallet-only policy, including the legacy game.

Rewards belong to the **current Streamflow recipient**, whether or not that wallet created the lock. The recipient claims SOL through the normal PIGGY claim flow without withdrawing or unlocking PIGGY. Off-curve recipients remain excluded because the existing claim instruction requires a wallet signature.

## Balance calculation

Eligible recipient balance is liquid wallet PIGGY plus the contract's unwithdrawn net deposit. Streamflow and partner fees, unsolicited escrow deposits, canceled contracts and closed contracts are not credited. The canonical escrow PDA, token owner, mint and backing balance are checked using the pinned official `@streamflow/stream` 13.4.0 decoder. Migrated/aligned proxy contracts are rejected for separate review rather than guessed from their layout.

A 700-token lock and 300 tokens held by other eligible wallets allocate 70% of a funded holder epoch to the recipient. Withdrawing 200 of those tokens leaves 500 attributed through the lock and 200 in the wallet: the recipient still has 700 eligible tokens, not 900. Moving a stream to another recipient changes future eligibility after the next snapshot.

## Consistent snapshots and existing claims

The publisher reads Streamflow metadata before and after the atomic token-account snapshot. Both metadata sets must be identical, and their finalized context slots must bracket the token snapshot. Changes trigger a fresh read, with a bounded retry limit. Publication stops if a consistent snapshot cannot be obtained.

New snapshots identify `opening-snapshot-streamflow-recipients-v2` and retain metadata hashes, canonical escrows and attributed amounts for inspection. Historical wallet-only snapshots and published Merkle roots remain unchanged. Enabling this policy does not rewrite the saved opening snapshot: it applies when the publisher captures the next opening window. Existing claims remain valid under their original policy.

The public index identifies v2 epochs separately. On-chain claim instructions, token custody, game pricing and fee splits are unchanged. No program upgrade, token lock or transfer is performed by this integration.

## Validation

`tests/streamflow-holder.test.mjs` covers 70/30 allocation, another recipient, partial withdrawals without double counting, exclusions, fees/surplus, invalid custody, historical snapshot preservation and metadata changing across a snapshot. The live read-only probe against the current PIGGY mint is stored in the private launch evidence directory. Creating a future 70% lock remains a separate transaction, with its recipient, amount and duration reviewed before signing.
