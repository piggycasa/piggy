# PIGGY wallet-held-token reward extension

This is a new implementation in `src/holder_rewards.rs`. Upstream Solana Fomo3D allocated P3D fees but left `WithdrawP3DRewards` unimplemented; it did not enumerate token holders or pay individual wallets. This extension adds funded snapshot epochs and signed wallet claims without staking.

## Funding and trust

Participants' game payments fund the original P3D allocations: Whale 6%, Bear 0%, Snek 10%, Bull 8%, plus the original 10% affiliate allocation when no affiliate is supplied. Closing P3D allocations are 10%, 0%, 20%, 10% of the remaining pool respectively. The completed instruction 6 moves only the round's unpaid P3D allocation into the canonical payment-token vault and records the withdrawal.

The original game creator initializes the holder configuration, selecting a separate eligibility-token mint and an authorized publisher. Configuration changes the game's P3D destination to the canonical vault; its SPL authority is the holder-config PDA. The creator can rotate the publisher but cannot change the eligibility mint, replace the vault, cancel epochs, withdraw vault funds or remove published reservations through this extension.

The publisher must read actual token accounts under the configured eligibility mint’s canonical token program at a recorded snapshot slot, aggregate balances by token-account owner and publish the resulting wallet entitlements. Eligibility accepts both legacy SPL Token and Token-2022 mints. Initialization uses the official Token-2022 `StateWithExtensions<Mint>` parser to validate initialized base state, account type and TLV boundaries, and rejects non-mint/duplicate extensions and arbitrary owners. Payment custody remains legacy SPL Token/WSOL. A Token-2022 eligibility token is not accepted as game collateral or transferred by the reward program. The local workflow persists an **open snapshot before the first relevant fees**. It allocates only the subsequent fee interval to those saved balances, persists a recoverable entitlement manifest before sending the publication transaction, then takes a new snapshot for the next interval. After a feed or settlement, a sweep/publication closes that interval; it does not give newly acquired balances a claim on an earlier one.

Eligibility therefore means holdings at the start of the fee window, not continuous holding or verified transfer history. A published claim remains with its snapshot wallet after its tokens are sold; a new holder becomes eligible in the next window whose opening snapshot includes it. The program cannot independently enforce that publisher scheduling policy. No stake transaction occurs.

**Publisher trust is explicit:** the program verifies the authorized signer, recorded slot, proof, token custody and funded limits; it cannot independently verify historical off-chain RPC results, completeness of the holder list, fair eligibility policy or that leaf amounts sum to the announced total. A dishonest publisher can omit holders, publish unfair entitlements or lock reservations in an unusable root. Publish only an independently checked snapshot/allocation manifest. Epoch roots are immutable; rotating the publisher affects future publications only.

Publishing reserves at most `vault.amount - config.reserved_amount`. Claims reduce both vault tokens and that reservation by the same amount. Each epoch also enforces its own total claim budget. There is no minting of reward tokens, borrowing from the jackpot, staking, reward expiry or admin withdrawal. Payment amounts use raw units of the game's payment mint; with wrapped SOL, one SOL is 1,000,000,000 units. The eligibility mint is separate from that payment mint.

## Instruction encoding and account order

Instructions use Borsh: one-byte enum tag followed by the fields below in order. Integers are unsigned little-endian. Pubkeys/hashes occupy 32 bytes. The original tags 0–6 retain their ordering.

`S` = signer; `W` = writable; other accounts are read-only.

| Tag / instruction | Fields after tag | Accounts, in order |
| --- | --- | --- |
| 6 `WithdrawP3DRewards` | `withdraw_for_round: u64` | game; round W; round pot W; holder vault W; holder config; SPL Token Program |
| 7 `InitializeHolderRewards` | `publisher: Pubkey` | creator SW; game W; holder config W; holder vault W; payment mint; eligibility mint; SPL Token Program; System Program; Rent sysvar |
| 8 `PublishHolderEpoch` | `epoch: u64`, `root: [u8;32]`, `total: u64`, `snapshot_slot: u64` | publisher SW; game; holder config W; epoch W; holder vault; System Program |
| 9 `ClaimHolderRewards` | `epoch: u64`, `amount: u64`, `proof: Vec<[u8;32]>` | wallet SW; game; holder config W; epoch W; holder vault W; destination token account W; claim receipt W; SPL Token Program; System Program |
| 10 `SetHolderPublisher` | `publisher: Pubkey` | creator S; game; holder config W |

A proof vector is encoded as a `u32` sibling count followed by that many 32-byte hashes. At most 32 siblings are accepted. Epoch numbering starts at 1 and advances by one. `snapshot_slot` cannot exceed the current chain slot. Epoch totals and claim amounts must be positive. Claim destinations must have the configured payment mint and the signing wallet as their SPL owner.

## PDA seeds

Derive each address under this program ID, appending the standard one-byte PDA bump internally:

| Account | Seeds before bump |
| --- | --- |
| Holder config | UTF-8 `holder-config`, full game pubkey |
| Holder vault | UTF-8 `holder-vault`, full game pubkey |
| Epoch | UTF-8 `holder-epoch`, holder-config pubkey, epoch `u64LE` |
| Claim receipt | UTF-8 `holder-claim`, epoch-account pubkey, wallet pubkey |

Empty System-owned PDAs may be pre-funded. Initialization pays only the rent deficit, then allocates and assigns the account with PDA signatures, so sending dust to an address cannot block a claim. Config, epoch and receipt records are program-owned. The vault account is SPL Token Program-owned with the config PDA as its token authority and no delegate or close authority.

## Canonical Merkle format

Use **Keccak-256**, not standardized SHA3-256. Concatenate raw bytes without length prefixes:

```text
leaf = keccak256(
  UTF8("PIGGY_HOLDER_REWARDS_V1") ||
  program_id[32] || game[32] || epoch_u64LE[8] ||
  wallet[32] || amount_u64LE[8]
)
node(a, b) = keccak256(
  UTF8("PIGGY_HOLDER_NODE_V1") || min_lex(a,b)[32] || max_lex(a,b)[32]
)
```

Start verification with the leaf, then apply `node(current, sibling)` for every proof sibling in bottom-up order. A single-leaf tree has its leaf as the root and an empty proof. For a canonical publisher tree, sort wallet entries by raw wallet bytes before building leaves, pair adjacent nodes and promote an unpaired final node unchanged; no proof entry is added for an absent sibling. All amounts must be calculated before hashing. Maintain only one positive entitlement per wallet per epoch and verify their sum against `total` before publication.

The program/game/epoch/wallet/amount bindings prevent reusing a proof for a different deployment, game, epoch, signer or amount. The receipt PDA allows a wallet to claim only once per epoch, even if a defective publisher tree contains duplicate wallet leaves. Receipt creation, token transfer and ledger writes are part of one Solana instruction and roll back together if any step fails.

## Account layouts

All layouts use Borsh with no padding. The eight-byte tags below are raw UTF-8 bytes.

```text
HolderConfig (201 bytes)
  tag[8] = PHCFG001
  game[32], publisher[32], eligibility_mint[32], payment_mint[32], vault[32]
  reserved_amount:u64, next_epoch:u64, total_published:u64, total_claimed:u64
  bump:u8

HolderEpoch (137 bytes)
  tag[8] = PHEPO001
  config[32], game[32]
  epoch:u64, snapshot_slot:u64, merkle_root[32]
  total_amount:u64, claimed_amount:u64, bump:u8

HolderClaimReceipt (81 bytes)
  tag[8] = PHCLM001
  epoch_account[32], wallet[32], amount:u64, bump:u8
```

## Checks

The module's focused Rust tests cover exact layout lengths, valid and invalid Merkle proofs, all leaf-domain bindings, proof-depth limits, already-reserved funding caps, per-epoch claim caps and duplicate-claim ledger nonmutation. Run `cargo test --lib holder_rewards::tests` for those checks. Actual token movement and failed-transaction rollback require the separate local-validator integration test; unit tests alone do not establish deployed behavior. No mainnet transaction is required for this workflow.
