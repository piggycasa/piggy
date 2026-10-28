# PIGGY — feeds, $PIGGY and SOL rewards

**Feed Piggy. Take the crown.** Each SOL feed adds time, takes the lead and establishes or increases the feeder's cut of game rewards. The last feeder at zero receives the displayed pot under the historical Fomo3D payout rules below. The game is live at [piggy.casa](https://piggy.casa), using the visitor's wallet on mainnet. Program `3c5jUPmmXR3zV47uGW4YjSeSQhHKk2H6yj5U5JcfvbfK` runs game version `1793081200001`. The separate local validator and `?demo=1` browser concept remain development tools.

$PIGGY was created on Pump with mint `BwnmfvgEhAFboL8YW6CFoBUSH4QHriA9qBcAVPc71jRA`: one billion Token-2022 tokens, six decimals, and **no initial token purchase**. Mayhem, cashback and Pump's separate holder-reward flag are off. Game-fee claims use the system described below; no token price or fixed yield is promised.

## Confirmed product direction

- Game entries are purchased with SOL.
- The main interaction explicitly buys **round keys** with SOL. It previews key count, share of the key-reward pool, next-key pricing and the resulting countdown. The pig is fed visually; keys remain the underlying game entry.
- The underlying round-specific units remain `keys`, inherited from Fomo3D and explained in technical rules and reward details. They are separate from $PIGGY; the accounting unit is unchanged, and no new participation-unit brand is introduced.
- $PIGGY holders do not stake. Holding the project token makes them eligible for its allocated SOL rewards, which they claim separately from game rewards.
- The latest upstream Solana source is still commit `a29cfe35049fe8f209421267983add1c28ec3237` (26 August 2021). The four original payout modes remain the reference. A new fixed 60/30/5/5 allocation has **not** been adopted.

## What the revised preview demonstrates

The Rust program preserves the four source modes and referral behavior. A wallet can supply a referrer, remembered on later feeds. The table below shows no-referrer funding: the original unassigned 10% affiliate allocation joins P3D. With a referrer, that 10% goes to the referrer and holder entry funding falls to Whale 6%, Bear 0%, Snek 10%, Bull 8%.

### Every SOL of entry purchases

| Mode | Remaining round pool | Key rewards now | Token-holder rewards now | Community | Next round | Legacy bonus reserve |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Whale | 50% | 30% | 16% | 2% | 1% | 1% |
| Bear | 43% | 43% | 10% | 2% | 1% | 1% |
| Snek | 20% | 56% | 20% | 2% | 1% | 1% |
| Bull | 35% | 43% | 18% | 2% | 1% | 1% |

The token-holder column includes the original 10% referral fallback. It must not be presented as only the original mode's 0–10% P3D allocation.

### When the round ends

The remaining round pool is divided using the final buyer's mode. The last buyer's jackpot is 48% of this remaining pool, not 48% of all entries ever purchased.

| Final buyer's mode | Last buyer | Key holders | Token holders | Next round | Community |
| --- | ---: | ---: | ---: | ---: | ---: |
| Whale | 48% | 15% | 10% | 25% | 2% |
| Bear | 48% | 25% | 0% | 25% | 2% |
| Snek | 48% | 20% | 20% | 10% | 2% |
| Bull | 48% | 30% | 10% | 10% | 2% |

The main number in the interface is the actual 48% jackpot. The final buyer may separately have ordinary key rewards and token-holder rewards. A larger feed purchases more keys and increases their cut of key distributions, but a later 1× feed can still take the lead.

The feed action shows the actual SOL payment. Animated gold coins depict SOL paid into Piggy; the main position display is **Your cut**, rather than the underlying key count.

## Claimable balances and previews

**Game SOL to claim** is the player's booked, unclaimed game balance: accrued key rewards plus any jackpot or closing allocation already awarded. A claim reduces this balance. Purchase feedback reports the actual key-reward credit from that event, excluding the separate $PIGGY-holder credit.

The current-cut → after-feed preview compares the player's key percentage before and after the selected feed. That percentage applies to the applicable key-reward pool; the pool itself varies by mode and entry amount. It is not the same percentage of the whole SOL feed. New keys participate in their own purchase's allocation, as described below.

A closing-reward estimate depends on the current remaining pool, final mode and key holdings. It can change before settlement and is not claimable SOL. $PIGGY-holder SOL has its own funded balance and claim action. None of these displays specifies a fixed yield.

### Why your claim can exceed the displayed jackpot

In an illustrative 1 SOL Whale entry, 0.30 SOL goes to key rewards and 0.50 SOL enters the remaining round pool. The final buyer receives 48% of that pool: 0.24 SOL attributable to this entry, before considering other contributions, opening rollover and integer rounding. A sole key holder can therefore receive a larger immediate key allocation than the displayed winner allocation. At settlement, that holder also receives the key-holder closing share. These are different portions of the same contributed money, not newly created profit; fees and other allocations still reduce the total returned.

The claim dialog exposes this example and distinguishes all-round available rewards from current-round entry payments. Those entry payments exclude network fees and account setup costs. The UI does not calculate a profit from the claim balance alone.

## Original Solana feed-pricing curve

The browser independently implements the arithmetic in upstream [`src/math/curve.rs`](https://github.com/ilmoi/solana_fomo3d/blob/a29cfe35049fe8f209421267983add1c28ec3237/src/math/curve.rs), preserving its constants, integer square root and floor division. The input is **opening rollover plus cumulative gross SOL contributions**, matching how upstream [`src/processor/processor.rs`](https://github.com/ilmoi/solana_fomo3d/blob/a29cfe35049fe8f209421267983add1c28ec3237/src/processor/processor.rs) seeds and updates `accum_sol_pot`. It is not the displayed jackpot, the remaining pool after allocations, or a price inferred only from the number of keys already issued.

Let `K(G)` be the original whole-key conversion at cumulative funding `G` lamports. A payment of `L` lamports produces `K(G + L) − K(G)` new keys. The interface selects a whole-key count through feed size, then quotes the **smallest integer lamport payment** that produces that count. This uses the forward minting calculation to check the quote, including the original rounding boundaries.

Source test vectors at zero opening funding and no prior entries:

| Payment | SOL | Whole keys produced |
| --- | ---: | ---: |
| 75,000 lamports | 0.000075000 | 0 |
| 75,001 lamports | 0.000075001 | 1 |
| 1,000,000,000 lamports | 1 | 13,153 |

These are curve examples, not a fixed price for every round. Rollover and later contributions move the curve forward. The interface's selected-count limit remains 10,000 per feed; the 1 SOL vector is also a formula-level reference. The on-chain program enforces the original early launch limit: below 100 SOL cumulative funding, each wallet may contribute at most 1 SOL. The UI refuses an oversized selected feed; the original payment instruction reduces a raw oversized amount to the remaining allowance and rejects it if no whole key can be minted.

State version 4 stores money as safe integer lamports, with `CREDIT_SCALE = 1_000_000_000`; curve intermediates use exact integer arithmetic. SOL quotes and earned amounts retain up to nine decimal places. The local wallet remains 500 simulated SOL and each NPC wallet remains 2,000 simulated SOL. The new `piggy.holder-demo.v4` session starts fresh; version 3 data remains under its old storage key and is not converted into the new curve.

## Accounting changes

The historical Solana program recalculates entitlement using current key ownership against all previous fee allocations. That can make a player's calculated entitlement decrease after they have already withdrawn rewards. The preview instead books each purchase's distribution against that purchase's eligible positions. Earned rewards never decrease when another person buys.

New keys participate in the dividend from the purchase that creates them, preserving the original rule. They cannot earn distributions from before they existed. All earned payouts remain available after a round ends. Claims move only a player's own pending SOL into their balance and cannot be repeated.

The browser model uses five bounded demonstration wallets and integer lamports. It can distribute each event directly and allocate indivisible remainders deterministically. Its pricing reproduces the source curve, while the reward bookkeeping intentionally corrects the historical entitlement problem. This describes the separate browser-only `?demo=1` model. The default local chain interface instead reads the Rust checkpoint accounting and real test-mint holder epochs described below.

The legacy 1% lottery reserve is funded on every purchase. Explicit local-test builds retain the original predictable draw for qualified payments strictly greater than 0.1 SOL. Default builds disable these draws. Unawarded SOL is carried into the next lottery reserve without changing it into jackpot funding.

The awarded-settlement effect is a bounded 3.6-second visual using the actual pig mesh and current coin poses. Illuminated coins rise and stay lifted; reduced motion shows a static separated pig and coin fan. It neither creates rewards nor changes payout amounts, claims or holder eligibility.

## Implemented Rust V2 and holder claims

The fork now modifies the original Rust program. Fresh V2 layouts use full wallet keys and separate binary seeds; V1 accounts cannot be reused. The program uses a cumulative key-reward index with player checkpoints and carried fractions. New keys participate in their own feed's allocation, never in earlier distributions. Withdrawals do not erase lifetime earnings or let later key dilution claw them back.

P3D allocations are first ledger liabilities in the round's wrapped-SOL pot. Completed instruction 6 transfers the unpaid amount into the canonical holder vault. The creator configures the $PIGGY eligibility mint and authorized snapshot publisher. Only funded, unreserved vault SOL can back a newly published epoch.

The standalone publisher persists an opening balance snapshot before the fee window. After fees accrue it sweeps the P3D liability, computes exact wallet allocations from that opening snapshot and persists an immutable proof manifest plus the next opening snapshot before publishing. Ambiguous publication outcomes are reconciled against the epoch account, so a timeout cannot strand published claims. The next snapshot applies to future fees. This is snapshot eligibility, not continuous holding or staking; published claims remain with the original eligible wallet after a transfer.

A claim requires that wallet's signature, a valid proof bound to program/game/epoch/wallet/amount, a payment account owned by the wallet, and an unconsumed canonical receipt. Transfer and accounting writes are atomic. The claim does not transfer or burn $PIGGY. The client closes the temporary wrapped-SOL destination into the claimant's wallet. Holder claim receipts and transaction fees cost SOL; short test epochs demonstrate accounting rather than efficient production claim economics.

The snapshot publisher is trusted for the historical holder list and allocation. The program enforces the signed root and funded budgets, but cannot independently prove past RPC balance data or fairness. The public policy includes on-curve wallet owners, excludes pool/vault PDAs, and aggregates all initialized legacy SPL or Token-2022 accounts of the actual mint. It saves the opening snapshot before game creation, defaults to hourly publication with at least 0.01 SOL in new fees, and rejects epochs above 65,536 positive claims under the current transaction format. Claims have permanent receipt rent, refundable temporary WSOL rent and network fees; publication does not imply a profitable individual claim. See [HOLDER-PUBLISHER.md](docs/HOLDER-PUBLISHER.md).

Mainnet token creation, guarded feeds, game-reward claims and a production $PIGGY-holder claim have finalized. The holder test used 0.02 SOL of explicitly sponsored vault top-ups and swept 0.0000315 SOL of existing game fees; no extra game feeds extended the timer. Epoch 1 preserved the original holder's entitlement, and epoch 2 used the following saved snapshot. The 0.01 SOL claim paid 0.008928280 SOL net after its 0.00001 SOL network fee and 0.001061720 SOL permanent receipt rent. The wallet's PIGGY balance and token authorities remained unchanged. These test-funded proceeds are not evidence of organic yield. The one-off publication used a 60-second cadence only in memory; the stored hourly configuration remained unchanged.

The token launch still had no initial buy. A separate post-launch canary bought 174,830.423692 PIGGY: 0.004949992 SOL for the trade plus 0.002865040 SOL of reported rent and fees. Testnet remains unverified. External program review and the historical upstream source's missing reuse licence are unresolved. The deployed public binary disables the predictable lottery and carries its reserve; enabling a production lottery would require reviewed verifiable randomness. Details are in the fork's `HOLDER_REWARDS.md` and `PIGGY_PROGRAM.md`; local transaction checks are described in `LOCALNET.md`.

## Original timing

Live mainnet rounds use the original **3,600 / 30 / 86,400-second** settings: one hour initially, 30 seconds added per underlying key, and at most 24 hours remaining. Thus 1× adds 30 seconds and 5× adds 150 seconds, subject to the cap. These are the original settings documented in upstream `src/instruction.rs` and recommended in `client/src/main.ts`; the client’s two-second/zero-extension values are explicitly for tests. The separate demo opening round is seeded with purchases and starts at 87 seconds remaining, to make an ending easy to try. NPCs are labelled simulated.
