# PIGGY — Feed Piggy. Take the crown.

PIGGY is live at [piggy.casa](https://piggy.casa). It combines the original Solana Fomo3D curve and four payout modes with the piggy-bank game and adapted Konterball interface. Production entries use SOL and transactions are signed through the visitor's wallet.

- Mainnet program: `3c5jUPmmXR3zV47uGW4YjSeSQhHKk2H6yj5U5JcfvbfK`; game version: `1793081200001`.
- $PIGGY mint: [`BwnmfvgEhAFboL8YW6CFoBUSH4QHriA9qBcAVPc71jRA`](https://pump.fun/coin/BwnmfvgEhAFboL8YW6CFoBUSH4QHriA9qBcAVPc71jRA). Pump creation finalized with no initial token purchase: Token-2022, six decimals, one billion tokens.
- Real mainnet feeds, game-reward claims and a production $PIGGY-holder claim finalized. The holder test used disclosed sponsored vault funding; its token-preservation and duplicate-claim checks passed. Testnet remains unverified; these results are not an independent audit.

## Run and verify

See [LOCALNET.md](LOCALNET.md) for the complete validator, program build/deploy, bootstrap, signer bridge and integration-test workflow. The interface runs at `http://127.0.0.1:4317/`; its loopback-only signer bridge runs at port 4318, and its isolated RPC runs at port 18899. Keypairs, ledger, local configuration and snapshot manifests stay under ignored `.openai/local/solana/`, with no private keys in the browser bundle. Solana CLI global settings are not changed.

```sh
npm ci
npm test
npm run build
npm run dev -- --port 4317 --strictPort
```

A separate browser-only concept remains available at `/?demo=1`. It is explicitly simulated, has labelled NPCs and uses session state `piggy.holder-demo.v4`. The default chain interface never silently falls back to that simulation when RPC or a transaction fails.

For public deployment, set `VITE_PIGGY_CONFIG_URL` to an HTTPS-hosted address-only configuration and rebuild. Hosted builds without configuration disable transactions. Public mode has no fixture signer or admin controls. Devnet passed its funded rehearsal with 14 confirmed transactions; Testnet is funded but its account-read/upload RPC failures remain unresolved. [Public deployment gates](docs/PUBLICNET-LAUNCH.md) distinguish actual receipts from network reachability. The live Pump coin uses Token-2022; game payments remain native SOL wrapped atomically through legacy WSOL.

The current Vercel build, runtime environment and proof routing are documented in [VERCEL.md](docs/VERCEL.md). Use the public site for a real wallet; the default localhost environment uses an isolated test wallet. The wallet picker discovers compatible Wallet Standard providers, including wallets registered after page load, and retains the existing injected-wallet fallback. Users choose a provider explicitly; a previously authorized provider can reconnect silently in the same browser session. Mobile users can play inside a compatible wallet’s browser; opening an external wallet website does not connect the original browser.

## Understand the game before buying

The first visit opens a wallet-free practice round: ten of your keys, another buyer's one key, and the resulting change of leader while your keys remain. A fourth step uses the exact curve to compare 1,000-key costs at hypothetical funding levels. Returning wallets and direct claim links skip the introduction. The main view names round keys, previews key-reward share and the resulting countdown, and separates the current jackpot from available rewards and entry spending. Preset allocation modes remain available under “Where your SOL goes.”

SOL remains the payment/accounting currency. Approximate USD equivalents use a cached public Coinbase SOL/USD spot quote from `/api/sol-price`; there are no price-feed credentials in the frontend. Quotes older than five minutes disappear instead of becoming a fake zero. A changed USD estimate never changes a signed SOL amount.

## Claims and the Fomo3D story

The Claim SOL screen separates game rewards from $PIGGY-holder rewards. It shows the connected wallet, currently available SOL, estimated net total after costs, and the wallet approvals needed. Game details separate unclaimed key, jackpot and referral amounts across rounds; current-round entry payments are labelled separately and exclude network/setup costs. Claims remain available after new rounds start. Rewards can include part of the player's own feed, so a positive claim balance is not necessarily profit.

The standalone [/fomo3d/](https://piggy.casa/fomo3d/) story has five viewport-sized chapters: the verified 2018 jackpot, early/late incentives, the congested finish, the PIGGY comparison and play/claim links. It cites original transactions and firsthand research. The 10,469 ETH historical jackpot is not a token market cap or a PIGGY return forecast. The arena and story remain no-scroll; long claim details and citations scroll inside overlays.

## Game and holder rewards

- **Feed Piggy** shows the exact SOL cost and the current → next reward cut. A feed buys round keys, adds time and takes the crown. More keys increase the cut of subsequent key-reward allocations.
- Pricing uses the original integer curve, including opening funding and all gross contributions. A fresh unfunded round's first key costs **0.000075001 SOL**. Prices are not a made-up fixed 0.01 SOL.
- The four modes, 1 SOL per-wallet launch limit below 100 SOL funding, persistent referrals, player claims, permissionless settlement and next-round rollover run in the Rust program.
- The source's recommended timing is one hour initially, 30 seconds per key and at most 24 hours remaining. The keeper also opens empty rounds, so their clock runs before anyone feeds; an empty countdown is not a funded payout promise. Integration tests use a separate short-lived game version through the same initialization parameters.
- Game rewards preserve lifetime earned amounts through later buys and claims. Past rounds remain claimable. A later feeder takes the crown without deleting anyone's keys or accrued SOL.
- $PIGGY-holder SOL is separate. It comes from the original P3D fee allocation, unused referral fees, and closing P3D allocations. Wallets do not stake or surrender $PIGGY to claim.

Upstream left P3D withdrawal unimplemented and had no individual token-holder distributor. This fork completes that fee sweep and adds funded Merkle epochs, wallet-signed claims and one-time receipts. The publisher captures real SPL balances **before** a fee window, aggregates accounts by wallet, persists the proof manifest and next opening snapshot, then publishes a funded root. Published entitlements stay with snapshot wallets after transfers. New holders join a later window. The program checks funding and claims; the snapshot publisher remains trusted for accurate historical eligibility. See [ECONOMICS.md](ECONOMICS.md) and the fork's `HOLDER_REWARDS.md`.

The standalone [publisher and round keeper](docs/HOLDER-PUBLISHER.md) keep private durable journals and separate signing keys. The publisher records the first holder snapshot before game creation. The keeper opens rounds, settles expired rounds using the on-chain Clock and leaves time for the jackpot celebration before restarting. The mainnet keeper, publisher and proof-sync watcher now run on one [Railway service with persistent storage](docs/OPERATORS-SERVER.md). The Mac LaunchAgents are stopped and disabled; operation no longer depends on that Mac staying awake or logged in. The cloud processes must still be funded and monitored separately from the static site. Game setup rent and holder-claim receipt rent are shown before wallet approval; a tiny holder claim can cost more than its reward.

The original predictable lottery is available only in the explicitly enabled `local-test-lottery` binary. Default program builds collect and carry its reserve without insecure draws; production randomness still requires a verifiable oracle. Unawarded lottery SOL carries into the next lottery reserve separately from jackpot rollover.

## Presentation

The How to play overlay now uses a four-step practice round: you buy ten keys, another buyer takes the lead with one key while your ten remain, the timer ends, and a real-curve price example shows how funding changes the price of new keys. The money-flow example distinguishes the key-reward allocation from the whole payment; the guide is explicitly simulated and never opens a wallet or sends a transaction. Keys are not resale tokens and are separate from $PIGGY.

The viewport-height arena retains Konterball's adapted palette, layout, button rules and staggered screen transitions, with mobile controls and reduced motion. Desktop scores flank the pig; portrait phones stack readable scores, artwork and actions; short landscape screens use a large pig beside the controls. The main arena never scrolls. Confirmation banners replace the desktop heading instead of covering scores. A warm museum spotlight and front bounce reveal the glass and gold coins. Feeding visibly deposits coins. Both coin faces use the exact official Solana logomark silhouette, including its opposite-leaning middle bar; the same emblem is retained in the jackpot animation. On an awarded settlement, the actual pig mesh briefly separates and fades while illuminated coins rise into two spaced prize arcs above the loose treasure pile. Eight glints and a bounded payout flash finish the celebration. Empty rounds do not crack Piggy or show a jackpot celebration. Reduced motion uses a static lifted coin arrangement. A new round restores the intact pig. The local test-wallet overlay also offers a clearly labelled, visuals-only jackpot preview without changing the round or balances.

The artist mesh is **Piggy Bank Glass** by tomgeurts under CC BY 4.0. Its source geometry is retained, with adapted materials, normalized placement and a logo projected from that mesh. Drei-vanilla supplies the transmission shader; Rapier produces the bounded coin pile. Coins are bevelled Three.js geometry. Fonts and visual assets are bundled locally. See [asset credits](public/asset-credits.html), [bundled licences](public/licenses), and [KONTERBALL_REUSE.md](KONTERBALL_REUSE.md). The original Konterball MIT notice is retained; its proprietary fonts and commissioned audio are not copied.

## Source and verification boundaries

The public [Code and control page](https://piggy.casa/verify/) provides a wallet-free, read-only comparison of finalized mainnet executable bytes against `public/verification/piggy-mainnet.so`. The whitelist-only release manifest includes a recorded source-tree digest, executable hash and build toolchain. The manifest links to the public PIGGY source and pins the program-source commit. It contains no operator keys or private paths. See [VERIFICATION.md](docs/VERIFICATION.md).

**Source access is public; no independent source build is verified. The program remains upgradeable and token-holder allocation accuracy trusts the publisher.** A matching executable is not an independently reproduced source build, security audit or guarantee of safety. The page states these limitations explicitly.

Historical upstream: [ilmoi/solana_fomo3d](https://github.com/ilmoi/solana_fomo3d), pinned at `a29cfe35049fe8f209421267983add1c28ec3237`. PIGGY’s modified source is published at [piggycasa/piggy](https://github.com/piggycasa/piggy); the [release and control page](https://piggy.casa/verify/) publishes mainnet addresses, executable-byte checks, independent checking steps and retained controls.

The Rust V2 program deliberately fixes the original dividend dilution, timing cap, rollover/lottery invariants, empty settlement, truncated PDA seeds and prefunded-address denial. Fresh V2 accounts are incompatible with historical V1 layouts. Curve constants and economic allocation tables are retained. The original source has no clear reuse licence; neither the visual asset licences nor this frontend grants one for that code.

`npm test` checks pricing, exact SOL formatting, reward conservation, historical entitlements, public-wallet boundaries, RPC consistency, keeper recovery and holder Merkle arithmetic. Public purchases use instruction 11, binding the quoted minimum keys, round and expiry slot to the user's signed transaction. Rust tests and actual local-validator integration cover program execution and funds movement; see the generated integration report described in LOCALNET.md. Passing these is not an independent production audit. Browser visual QA is distinct from build/accounting verification. `npm run test:visual` uses fresh local Playwright/Chrome contexts, captures desktop/phone/landscape screens, and exercises feeds, rewards, the full jackpot and new-round restore. `npm run test:public-wallet-ui` exercises the production build with a fresh test signing provider against the real local program. `npm run test:visual-physics` checks the authored GLB, slot entry, enlarged-coin containment, printed marks, prize spacing, camera bounds and reduced motion. See [VALIDATION.md](VALIDATION.md) for the tested sizes and limits. Current npm audit findings are zero; the Rust dependency review has remaining advisories documented in [DEPENDENCY_REVIEW.md](DEPENDENCY_REVIEW.md).
