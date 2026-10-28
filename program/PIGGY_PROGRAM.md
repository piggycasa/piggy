# PIGGY program V2

This is a deliberately modified fork of `ilmoi/solana_fomo3d`, based on upstream commit `a29cfe35049fe8f209421267983add1c28ec3237`. It requires fresh V2 accounts; there is no V1 account migration. The browser simulation is separate from this program.

## Funding and original economics

The program transfers the configured legacy SPL payment mint. The local PIGGY deployment uses wrapped SOL, so monetary integers are lamports: `1 SOL = 1_000_000_000` payment units. The local bridge wraps entries and unwraps claims. `$PIGGY` eligibility tokens are a separate mint; holding them does not replace SOL payment or require staking. Eligibility supports initialized mints owned by either canonical legacy SPL Token or Token-2022, including mint extensions. This is read-only eligibility support: Token-2022 payment transfers are not implemented.

The original integer bonding curve, four entry/closing team tables, referral allocation, and early launch limit are preserved. The curve input is cumulative funding: **opening jackpot rollover + opening lottery carry + full purchase contributions**, not the remaining jackpot balance or total issued keys. In an empty round, 75,000 lamports mints zero keys, 75,001 mints one whole key, and 1 SOL mints 13,153 keys. The source accepts a payment amount and derives whole keys; clients invert that function to quote a requested whole-key count. The source curve cap is `10_000_000_000_000_000_000` lamports.

Until cumulative round funding reaches 100 SOL, each wallet may contribute at most 1 SOL during that round. The processor retains the original behavior of capping an oversized incoming contribution to that wallet's remaining allowance; client previews may reject it instead of submitting a smaller effective purchase.

Entry percentages (unassigned referral rewards join holder fees):

| Team | Key holders | Base token-holder fees | Playable pool |
| --- | ---: | ---: | ---: |
| Whale | 30% | 6% | 50% |
| Bear | 43% | 0% | 43% |
| Snek | 56% | 10% | 20% |
| Bull | 43% | 8% | 35% |

Every entry also allocates 2% community, 1% lottery reserve, 1% next-round jackpot, and 10% referral. When no referral exists, that 10% goes to token-holder fees. Percentages floor independently; entry rounding residue remains playable.

At expiry, the last buyer's team divides the playable balance. The winner gets 48% plus rounding residue and the community gets 2%; the remaining percentages are:

| Last buyer's team | Key holders | Token-holder fees | Next jackpot |
| --- | ---: | ---: | ---: |
| Whale | 15% | 10% | 25% |
| Bear | 25% | 0% | 25% |
| Snek | 20% | 20% | 10% |
| Bull | 30% | 10% | 10% |

## Corrected accounting and timing

V1 calculated every player's historical key income from their current key fraction. V2 uses a cumulative reward index with `REWARD_SCALE = 1_000_000_000_000_000_000`, a player checkpoint, and carried fractional remainders. Before a purchase changes a player's keys, their existing income is checkpointed. New keys participate in that purchase's allocation, but cannot claim older allocations. `accum_f3d` records lifetime earned key rewards; withdrawal changes only withdrawal counters. Pending whole lamports are:

```text
pendingNumerator = keys * (round.reward_per_key - player.reward_index)
                 + player.reward_remainder
lifetimeKeyEarned = player.accum_f3d + floor(pendingNumerator / REWARD_SCALE)
keyClaimable = lifetimeKeyEarned - player.withdrawn_f3d
```

The program uses checked U256 intermediates for index arithmetic. Fractional rewards carry forward rather than being paid early; terminal sub-lamport dust is not withdrawable. Earlier-round player accounts and their pots remain claimable after new rounds begin.

## Guarded public purchases

Instruction 11, `PurchaseKeysGuarded`, protects a wallet-approved quote against concurrent curve changes. It uses the same accounts as original purchase instruction 2. Its Borsh fields are, in order, `sol_to_be_added:u128`, `team:u8`, `minimum_keys:u128`, `expected_round:u64`, `expires_at_slot:u64` (50 bytes including the one-byte tag). `sol_to_be_added` is the maximum token debit, expressed in raw payment units. The original early launch cap may reduce that debit; it cannot increase it.

The program requires a positive payment no greater than `u64::MAX`, a positive minimum whole-key count, the same current round, and `Clock.slot <= expires_at_slot`. It evaluates the minimum against the actual integer-curve result **after** applying the launch cap, before transferring payment. A changed quote either delivers at least the approved minimum for at most the approved amount or rejects the entire transaction. It cannot silently accept fewer keys after another player's purchase. Clients should use a short slot deadline and refresh the quote after rejection; instruction 2 remains available for source compatibility and controlled tests, but public clients must use instruction 11.

New appended error codes are 21 (`StaleQuote`), 22 (`MinimumKeysNotMet`) and 23 (`InvalidPurchaseGuard`). Existing instruction tags, account layouts, pricing constants, fee tables and error numbers are unchanged. Every accepted purchase must still receive at least one whole key before becoming the last feeder; zero-key contributions cannot take the lead or extend time.

Timing remains configurable at game initialization, with positive initial time/increment, `initial <= maximum`, and `maximum <= 86_400` seconds. Each whole key adds the configured increment, while **remaining time** is capped at the configured maximum. A purchase is rejected at or after the exact expiry timestamp. Settlement is permissionless after expiry and rejects repeat settlement. An empty round is marked ended and its playable balance returns entirely to jackpot rollover; it needs no winner account.

New-round initialization transfers the unwithdrawn jackpot rollover and live, unawarded lottery reserve. It places the former in `still_in_play` and the latter in `accum_airdrop_share`. Both contribute to cumulative curve funding. The previous round zeros its live lottery reserve, increments `accum_airdrop_carried`, and advances its jackpot withdrawal counter, preventing a second sweep. Lottery awards increment `airdrop_awarded`, preserving the round's lifetime conservation equation:

```text
accum_sol_pot = community + liveLottery + nextJackpot + affiliate
             + tokenHolderFees + keyRewards + stillInPlay + finalPrize
             + lotteryAwarded + lotteryCarried
```

Allocation totals are lifetime counters, not the current SPL vault balance; individual claims and fee withdrawals reduce vault funds separately. Donations to a pot do not create claim entitlements.

## V2 account layout and address derivation

Borsh integers are little-endian. State tags 0/1/2 remain reserved for V1; deserializers accept only V2 tags below and verify account owners and stored wallet/round bindings.

| Account | V2 tag | Total bytes | Appended V2 fields, in order |
| --- | ---: | ---: | --- |
| GameState | 3 | 169 | None; existing fields retained |
| RoundState | 4 | 403 | `reward_per_key:u128` at 339, `reward_remainder:u128` at 355, `airdrop_awarded:u128` at 371, `accum_airdrop_carried:u128` at 387 |
| PlayerRoundState | 5 | 233 | `reward_index:u128` at 185, `reward_remainder:u128` at 201, `accum_f3d:u128` at 217 |

PDA seeds are distinct byte slices; `version` and `roundId` are full eight-byte little-endian u64 values:

```text
game   = [b"game-v2", version]
round  = [b"round-v2", roundId, version]
player = [b"player-v2", fullWalletPubkey32, roundId, version]
pot    = [b"pot-v2", roundId, version]
```

This removes the original truncated-wallet seed and ambiguous decimal concatenation. Account creation supports prefunded, empty System-owned PDAs by topping up rent, then using signed allocation and assignment. Unexpected account counts return errors rather than indexing beyond an owner list. Self-referrals are rejected. The payment token program is checked by its canonical Tokenkeg program ID and executable flag, allowing both legacy and upgradeable loader deployments instead of hardcoding an old loader owner.

## Holder payouts and lottery mode

Instruction tags 0–6 retain their original order. Tag 6 now transfers accrued holder fees into the canonical configured holder vault, with accounts `[game, round, pot, holderVault, holderConfig, tokenProgram]`. Anyone can trigger this sweep; the destination, mint, vault authority, and game binding are verified. It cannot redirect fees to a caller-selected wallet. The holder extension appends tags 7–10 for setup, funded epoch publication, proof claims, and publisher rotation. See [HOLDER_REWARDS.md](HOLDER_REWARDS.md) for its exact protocol and trusted snapshot publisher model.

Default builds do **not** draw from the original predictable on-chain RNG. Qualifying purchases still fund the lottery reserve and advance its tracker, and unused reserve carries into the next lottery bucket. A production lottery needs an asynchronous verifiable randomness integration.

`--features local-test-lottery` explicitly enables the original predictable draw solely for local demonstrations. It must be identified as test-only and must not be used for a public deployment. Its thresholds and prize tiers remain the source's: payments greater than 0.1 SOL qualify; a win pays 25%, 50%, or 75% of the reserve that existed before that purchase, according to the original strict 1 SOL and 10 SOL tier boundaries.

## Local verification

The modified core and holder module have **48 passing Rust host tests** in both the default and explicit local-test feature configurations, including original curve vectors, guarded quote encoding/expiry/round/minimum checks, reward history, randomized changing-supply dividend conservation, carried precision, timing bounds, V2 layouts/bindings, reserve conservation/double-sweep checks, holder claim budget/proof/authority checks, and legacy/Token-2022 eligibility validation with malformed-extension rejection. These are unit tests, not a security audit or a claim of public-network readiness.

Both actual SBF builds have compiled successfully:

```sh
cargo test --lib --no-default-features
cargo test --lib --all-features
cargo build-sbf --no-default-features --sbf-out-dir target/deploy-default
cargo build-sbf --no-default-features --features local-test-lottery --sbf-out-dir target/deploy-localtest
```

`target/deploy-default/fomo3d.so` disables predictable draws; `target/deploy-localtest/fomo3d.so` enables the explicit local test feature. The build uses the generated `Cargo.lock`; upstream ignores that filename, so retain it explicitly when packaging this fork.
