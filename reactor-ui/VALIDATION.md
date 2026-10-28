# PIGGY validation — 27–28 October 2026

PIGGY is live at [piggy.casa](https://piggy.casa). Mainnet token creation, guarded feeds, game-reward claims and a production $PIGGY-holder claim have finalized; their scope and sponsored test funding are recorded below. The fresh Mainnet instance and the complete Testnet rehearsal also passed on 28 October; see the current evidence below.

## 28 October: Streamflow recipient eligibility

The current suite passes **244 tests**. The live frontend passed **130 read-only production checks**, plus four dedicated desktop/phone/landscape checks for the Streamflow claim explanation. Railway deployment `05b1d3ac-8dd8-4a02-8a36-fe2be37ddbbc` runs the verified recipient-attribution module, with all six roles ready. The fresh publisher has `streamflowLocks: true`; the legacy publisher does not. A read-only capture returned the new recipient policy, and the existing publisher journal was byte-for-byte unchanged during verification. No lock was created, no token transfer was made, and no previous claim was rewritten. See [STREAMFLOW-REWARDS.md](docs/STREAMFLOW-REWARDS.md) for scope and snapshot timing.

## 28 October: completed fresh-instance launch checks

Testnet at `57SQAWzCikj2SNk55BFjeEUA6Hy39t86c9hV6G234p34` passed **7 checks / 13 finalized rehearsal transactions**, including all four payout modes, later-feed earnings, exact guard rejection, funded holder claims, real-clock settlement, rollover and a historical jackpot claim. The already-deployed binary matched the reviewed SHA-256. PublicNode completed the rehearsal with paced requests and a bounded test priority fee; no feature checks were bypassed.

Fresh Mainnet version `1793155991891` passed the **11-check release preflight with no blockers**. The live `piggy.casa` interface executed two one-key feeds and a game-reward claim with an isolated Node-backed wallet provider. They resulted in exactly two keys, 150,001 lamports contributed and 60 seconds added. These UI tests do not establish personal browser-extension or mobile-wallet handoff behavior.

| Fresh Mainnet operation | Finalized slot | Receipt |
| --- | ---: | --- |
| First one-key feed | 462370243 | [Transaction](https://solscan.io/tx/66RiUz9iM1swnzZxB4bekHV9g9qBqVYJzV8xU3U8s9NDei4mjxGCR5Th81gTckpFst89AbeX7of8VCZefdthp6MH) |
| Second one-key feed | 462370419 | [Transaction](https://solscan.io/tx/3HFDLZFkcXfMB5MvbJBhe4hkZJQLaZKCGMJ3XJx6JozZvG6Z13tyCZvr6aQG1XWiEnT4quteRbL7b7Vrh7Ke81uY) |
| Game rewards claimed | 462370467 | [Transaction](https://solscan.io/tx/5Gq5eJsxEJnmQRrzFdjA1FqUENSc69uDKdGhgWesRGNPw4YNihjcEoWEGM5DzSxMMqjJPHRtrHhLN2XcQStxShsT) |
| Holder rewards claimed | 462370858 | [Transaction](https://solscan.io/tx/49sPguTC4t3Le9PH1exNpgy6SjRUrfKkE7ZTAQwCSaTr2GcaGz69ZjGngZkvsv69i49DnEAEQML6xBFydJpC7pve) |

The holder allocation was **0.002024 SOL gross**, comprising a disclosed **0.002 SOL sponsored test deposit** and **0.000024 SOL of actual feed fees**. Net receipt was 0.00095228 SOL after 0.00106172 SOL of permanent claim-account rent and 0.00001 SOL transaction fees. The existing PIGGY token balance was unchanged, temporary WSOL rent returned, liabilities reconciled, an unsigned duplicate claim was rejected with error 1005, and the live UI disabled the already-claimed reward. An RPC minimum-context-slot delay was resolved with read-only reconciliation; the claim was not resubmitted.

The test returned **0.00194728 SOL** to the launch wallet and preserved the test wallet's original 0.003 SOL reserve. Total net cost across the launch, holder-test and publisher wallets was **0.004382801 SOL**, including retained account rent and remaining game pools. Gross payer debits were 0.008317361 SOL, within the approved 0.02 SOL ceiling. No token purchase, program upgrade or live-round reset occurred. The regular hourly publisher configuration remained unchanged and its process resumed; the next opening snapshot uses Streamflow-recipient policy while the original opening snapshot remains intact.

The current code passed **244 unit tests** and the live site passed **130 read-only production checks** over desktop, narrow panes, phones and landscape. This is tested launch evidence, not an independent security audit.

Local checks use a dedicated Solana validator at `127.0.0.1:18899`; the UI and fixture signer bridge run on loopback ports 4317 and 4318. Local wallets and eligibility mints are fixtures. Private keys, genesis ledger and generated reports remain in ignored `.openai/local/`. Devnet has separate real-network receipts. Passing these checks is not an independent security audit.

## Executed checks

- `npm test`: **154 passed**, including public-wallet cancellation/retry, actual signed-wire validation, quote guards, RPC monotonicity, batch proof caching, receipt cost, precise small reward shares, publisher/keeper recovery, HTTP-only finality, proof-sync retry diagnostics, and operator migration/supervisor checks.
- `npm run build`: production assets built successfully. A separate normal `npm ci` checkout also passed the full suite and build after refreshing the final sources.
- `npm audit`: **zero known findings**. Rust audit retains two vulnerabilities and fifteen warning entries with reviewed target/reachability limits; see [DEPENDENCY_REVIEW.md](DEPENDENCY_REVIEW.md).
- Default and `--all-features` locked Rust host suites: **48 passed each**.
- Both default and explicit `local-test-lottery` SBF binaries compiled.
- All **12 instruction tags** executed successfully on the local validator, including the public guarded purchase instruction 11.
- **58 integration checks** passed across the main, recovery and funded-empty-round suites.
- **12 adversarial transactions** were submitted with `skipPreflight: true` and confirmed failed with their expected program errors. Destination/vault balances, reservations, epoch claims and receipts remained unchanged; transaction fees were paid normally.

| Actual-chain report | Checks | Passed |
| --- | ---: | --- |
| integration | 49 | true |
| recovery | 5 | true |
| empty-rollover | 4 | true |
| adversarial | 12 confirmed rejections | true |
| public wallet, legacy SPL eligibility | 26 | true |
| public wallet, extended Token-2022 eligibility | 26 | true |
| standalone holder publisher | 12 | true |
| standalone round keeper | 13 | true |

The main suite covers all four entry modes, native SOL wrapping/refunds, persistent referrals, active/historical reward claims, the early contribution limiter, normal and empty settlement, prefunded account recovery, community and holder funding, snapshot eligibility after transfers, funded rollover and a real local-test lottery win/withdrawal. Recovery checks cover ambiguous publications, immutable proof manifests, funded reservations and honest reporting after partially confirmed operations. Funded empty rounds preserve separate jackpot and lottery reserves through repeated rollover.

Confirmed adverse cases cover forged amounts/proofs/signers, wrong owner/mint/vault/receipt, replay, unauthorized publication/rotation and overfunded epochs. Pure proof tests and RPC preflight checks are additional coverage, distinct from submitted failed transactions.

The public-wallet reports use the browser client API, real local program instructions and an injected test signer. Both legacy and Token-2022 MetadataPointer/TokenMetadata mints passed actual feeds, later-purchase rewards, game claims and holder claims. Expired, wrong-round and slipped-curve quotes are rejected without changing pot, keys, contributions or accrued rewards; their temporary WSOL setup rolls back. These reports translate the genesis in a local test adapter. They do not establish that a program exists on Devnet, Testnet or Mainnet, and do not exercise an installed personal wallet extension.

The client reparses the actual wallet-returned wire bytes before comparing the prepared message and verifying signatures. A malicious wrapper disguising a different debit is rejected before broadcast. Vite's default secret-file deny patterns are preserved and extended to all `.openai/` content. Harmless private-directory canaries returned HTTP 403 through both relative and absolute `/@fs` paths; no actual private key was requested. Source and build scans found no generated mainnet key contents, and private local artifacts are excluded from Git and hosting.

The publisher test verifies opening eligibility before fees, exclusion of later token buyers from earlier revenue, funded publication, read-only proof export, exact one-time holder claims preserving the token balance, ambiguous-publication reconciliation and publisher-key rejection. The keeper test submits a real first-round start, feed, settlement and next-round start, verifies winner/rollover amounts and at least eight chain seconds for celebration, and proves that an ambiguous acceptance does not trigger a second broadcast. Pure regressions additionally check finalized-bank consistency, durable minimum context slots, pre-creation opening snapshot activation, ordered unique epoch journals, release bytecode/upgrade-authority checks, per-transaction and daily budgets, and mainnet disabled flags.

Fresh actual-chain reports are `.openai/local/solana/reports/{public-wallet-integration,public-wallet-token2022-integration,publisher-integration,keeper-integration}.json`. The public release binary was independently rebuilt with no optional features and matched the recorded source and artifact hashes.

## Fresh-launch validation scope

The fresh-launch client selects version `1793155991891`, game PDA `GXX38mLVdj2i2H3s5z5yvpkaZHpRQt1ZorrgsfeFKT5g`, with a separate holder vault and `/launch-proofs/index.json` proof domain. It reuses the same program, mint and reviewed executable. The current fresh-instance transaction evidence is recorded above. Older initialization and operator-activation evidence remains separate from the pre-launch instance below.

The actual feed and claim receipts in the next section belong to pre-launch version `1793081200001`. They remain historical evidence for that instance. Its existing rewards and accounts are preserved at [test-round claims](https://piggy.casa/test-claims/) using the original `/proofs/index.json`. No fresh-instance canary result is inferred from those receipts.

## Pre-launch mainnet instance and limited canary

The tested pre-launch instance uses program `3c5jUPmmXR3zV47uGW4YjSeSQhHKk2H6yj5U5JcfvbfK`, game version `1793081200001`. Deployed ProgramData matched the reviewed feature-free binary and upgrade authority. Mainnet timing is 3,600 seconds initially, 30 seconds per key and an 86,400-second cap. The predictable lottery is disabled; its reserve remains accounted for.

Pump token creation finalized at slot 462230019 for mint `BwnmfvgEhAFboL8YW6CFoBUSH4QHriA9qBcAVPc71jRA`: Token-2022, six decimals, one billion tokens, zero initial token purchase, and mayhem/cashback/Pump holder-reward flags off. [Creation transaction](https://solscan.io/tx/2CM1ccJRqmwbpCKLLUusu7L8ZWLL78MfcCHie387916PNP2cgTr2TXLWSPaq7jT83Aghje8ZCvxYSQtageUN9CUk).

| Mainnet operation | Finalized slot | Receipt |
| --- | ---: | --- |
| Guarded one-key feed | 462232767 | [Transaction](https://solscan.io/tx/2nVrgchuS8TgKaiBk6C1BmtAgrLycGLUChJjK1TXPhdBWKQV6uzzrBkUjawX3SAUemtrKdUVWPANueeeZ6J5cHmu) |
| Game-reward claim paid in SOL | 462232811 | [Transaction](https://solscan.io/tx/UfS7NXnKEpVYvK5xYAcE6eBi2kWsFhU1AxZLevcqyxoLbtJZPYZ841QfdmsiK3g2SE3t7MFEasBQBPa7jpULMxs) |

These first transactions were signed through the Node client. A subsequent hosted-interface canary at `piggy.casa` passed through the public RPC proxy: [one guarded feed](https://explorer.solana.com/tx/jLjGZQvrkMWBbPR3yeS2nDrduUDUwJwLTc1wJUace7MikZJpNddbp9htZ9pe2eWBpJ42by6tu5yoBveEzrDdP6C) finalized at slot 462238446 and [one game claim](https://explorer.solana.com/tx/3UbmgDu8uTdfrBoepc5KrVTUPXPeyREsuzvAyKDcWVpHf8sH6CRdkbx3LakrgA19PW2V1HfcPm9tF6fAbYa1VLaW) at slot 462238521. The interface displayed both confirmations without browser exceptions. That test injected an isolated wallet interface with a strictly bounded Node-side operator signer; it did not exercise a personal extension, mobile wallet handoff or mainnet token-holder claim. No token purchase was made. Evidence is `.openai/local/mainnet/live-ui-authorized-canary.json` and its three screenshots.

The first holder snapshot was captured before game creation. The original Mac `launchd` deployment and graceful restarts were tested, then all three Mac LaunchAgents were stopped and disabled at 23:44:27 on 27 October. At that migration check, the keeper, publisher and proof-sync watcher ran on a single Railway service with persistent `/data/piggy` storage; no awake or logged-in Mac is required. Generated launch evidence remains `.openai/local/mainnet/{pump-create-receipt,deployed-program-verification,game-canary-report,operator-run-status}.json`.

The nine-file server import preserved original S0 at slot `462231588`, its activation hash, keys and journals. Remote read-only checks verified the mainnet genesis, reviewed program and authorities. Enabled deployment `3b67f294-436b-4deb-9268-a649d1b374b3` reported all three roles healthy: the keeper observed round 2, the publisher waited on 31,500 lamports below its threshold, and proof sync uploaded the one-file empty index. A forced keeper SIGKILL recovered automatically from PID 16 to 102 with the original activation preserved and no new transaction. Persistent data also survived activation/redeployment. Evidence is `.openai/local/mainnet/railway-{import-receipt,readonly-verification,restart-verification}.json` and `.openai/local/railway-provision/enabled-health-verification.json`. This operational migration does not add a mainnet holder-claim or Testnet result.

Read-only production QA inspected the desktop page and connected-wallet states at 390×844, 320×568 and 844×390. Mobile checks passed with no page scrolling, no browser errors and zero signing calls; balances, round state, reward dialogs and reconnect state were read from mainnet. These used an injected read-only wallet interface, not a physical mobile wallet. Evidence is `.openai/local/visual-qa/production-mobile/report.json` and production screenshots. An earlier browser canary timed out before signing while waiting for network idle on the polling page. The successful follow-up above used DOM readiness and explicit game-state checks.

### Pre-launch token-holder claim: 28 October

The pre-launch mainnet game and PIGGY mint were tested through `piggy.casa` using one Node-backed canary wallet. The [holder claim](https://explorer.solana.com/tx/2svi9jfKa3jmiCEUvqq4zyzh1SiWkyFPaLNchQfSLqh5fFaZFDFwWTc2Xmx4Sp3R4M2hwwJqzsqPXdJM3AoUPKLF) finalized at slot **462274354**. It paid **10,000,000 lamports gross** and **8,928,280 lamports net**, after a 10,000-lamport network fee and 1,061,720-lamport permanent receipt rent. The temporary WSOL account closed; all PIGGY balances and token authorities remained unchanged.

The test used two disclosed 0.01-SOL vault top-ups rather than new game feeds, avoiding timer extension. Epoch 1 allocated 10,031,500 lamports to the original S0 holder: 10,000,000 sponsored lamports plus 31,500 existing P3D game-fee lamports. Epoch 2 allocated the second 10,000,000 sponsored lamports to the actual canary holder in saved S1. No original snapshot or entitlement was fabricated. The canary acquired 174,830.423692 PIGGY in a separate post-launch purchase costing 0.004949992 SOL plus 0.002865040 SOL of reported rent/fees; the launch itself still had zero initial buy. Sponsored test funding is not evidence of organic returns.

The second publication used a one-off 60-second cadence in memory; the persisted configuration remained at 3,600 seconds with the 0.01-SOL funding threshold, and the regular publisher resumed. Both public epoch roots and the canary proof matched the saved journals. An unsigned duplicate simulation returned `AlreadyClaimed` / Custom 1005 without a broadcast or state change. The reloaded UI showed zero claimable SOL and a disabled claim action, with no browser errors. The **22 post-claim checks passed**. A transient minimum-context-slot read failure is retained in the report; recovery was read-only and sent no second claim. Evidence is `.openai/local/mainnet/holder-ui-canary.json` and `posttest-publisher-report.json`. This fills the production holder-claim test; it does not validate a personal wallet extension or the still-unverified Testnet release.

The post-claim preflight passed the deployed binary, configuration, funded reserve, public proofs and all three real mainnet transaction checks. Its only failed automated check was the previously incomplete Testnet rehearsal; `launchReady` therefore remains false. Evidence is `.openai/local/mainnet/post-holder-preflight.json`. Unused test funding of 0.098098248 SOL was returned to the launch wallet, leaving 0.003 SOL and the acquired PIGGY in the dedicated canary wallet. Its private key stays in the ignored local key directory and was never added to the server or browser.

## Actual Devnet rehearsal

On 27 October both test deployment payers received 5 test SOL. The first HTTP Devnet upload hit shared RPC rate limits and timed out, leaving the explicit recoverable buffer. Its loader, authority and partial bytes were checked before resuming with the official Solana CLI TPU transport. Deployment succeeded with signature `iKoW65iKe6xS6Su7u45aHgSUoc8KCAFx3XRruSe7tfszDwzA7KHrN2MxtZTWphwbbKZxjdakhz8kysnkts6ypNT` at program `GGadGZzXKX9Kznha7h61SMgjBFViHKSXEDxwx93gnMjh`. Actual ProgramData bytes match the same feature-free release hash recorded below.

The funded Devnet rehearsal passed **7 checks and 14 confirmed transactions**: extended Token-2022 mint/account setup, original first-key price and all four modes, later purchases increasing earlier key earnings, precise Custom 22 slippage and Custom 21 expiry rejection, game withdrawal, original P3D sweeping, funded root publication and holder withdrawal, real-clock settlement, rollover and historical jackpot withdrawal. Negative simulations verify the exact purchase instruction/error and unchanged round funding; other submitted operations have recorded real signatures. The canary uses 120 / 1 / 180-second test timing and is separate from the original-timing mainnet deployment.

Evidence is `.openai/local/publicnet/devnet/{manual-deployment-receipt,rehearsal-report,holder-canary-proofs}.json`. This verifies the program against the real Devnet RPC, not only a local genesis adapter. It does not publish or switch the frontend: public HTTPS proof hosting, hosted wallet checks and operator setup remain separate gates. Testnet's official account reads time out. The alternate PublicNode RPC rejected the CLI's 100-account feature-verification batch because its public tier permits at most 10 accounts per request; indexed holder enumeration also requires a personal token. No feature-verification bypass was used. Testnet's 5 test SOL remained unspent, and its report remains `ok: false` pending a compatible RPC endpoint.

A separate test exercised the exact browser facade through the Vite proxy with the allowed browser Origin: feed 5 keys, another test wallet feeds 2, game key earnings increase by 68,729 lamports, a 22,680-lamport holder claim leaves the $PIGGY balance unchanged, and a 309,479-lamport game claim clears its pending balance. These are individual test results, not a yield or expected return.

## Visual checks and limits

The claim guide passed 57 mocked-account/cost/error checks, 46 final layout and explanation checks, and seven deep-link/wallet-return checks. It distinguishes all-round available rewards from current-round entry payments and explains own-feed rebates. Two-epoch holder tests verify total fees and receipt costs; cancellation and uncertain signatures never broadcast another transaction. No new mainnet financial transaction was needed for this presentation change.

The `/fomo3d/` story passed 114 browser checks across all five chapters at 1440×900, 390×844, 320×568, 844×390 and 480×320. Both compact comparison views, source links/dialog, browser-back and keyboard navigation passed. Primary text measured at least 11px and 7.07:1 contrast. All chapter content stayed inside the fixed page. A further 15 checks verified the three-step tutorial and story link at the smallest portrait/landscape sizes. Reports are `.openai/local/visual-qa/{claim-story,claim-layout-final,claim-navigation,story,claim-tutorial-final}/`.

The multi-wallet connector uses the official Wallet Standard registry with live registration/unregistration and a sign-only adapter. The current unit suite passes **178 tests**, including 17 dedicated connector tests and standard-wallet purchase/message-validation tests. Coverage includes provider deduplication, account/chain checks, rejected or changed signing messages, disconnect during approval, and scoped pending transaction recovery. No broadcaster was added to the wallet adapters.

`npm run test:wallet-connector` builds a fresh production frontend and supplies Wallet Standard mocks plus in-memory RPC accounts. Its 57 checks passed for explicit selection, late providers, switching, account changes, cancellation/retry, unsupported accounts, unregistration, empty-state recovery, remembered-wallet trusted reconnect, pending-transaction isolation, and desktop/phone/short-landscape layouts. The main page remains fixed; long wallet details use internal dialog scrolling on small screens. This test has no private signing key and refuses signing, simulation and broadcast. Evidence is `.openai/local/visual-qa/wallet-connector/`. Mock-provider results do not establish compatibility with every physical extension or mobile browser. Six additional read-only checks used the deployed `piggy.casa` assets and mainnet RPC on desktop and phone, with a Standard-only mock provider and no signing. A focused 24-check run at 320×568 and 480×320 also verifies the empty-round wording, zero unfunded jackpot and reachable wallet details. Those reports are in the `production/` subdirectory and `.openai/local/visual-qa/wallet-empty-copy/`.

The illustrated three-step How to play overlay passed fresh local checks at 1440×900, 390×844, 320×568 and 844×390, followed by live `piggy.casa` checks at desktop, tiny phone and landscape sizes. All steps, keyboard navigation, the 20-of-100-key example, close/reset, 44px controls, diagram/text separation and no page or modal scrolling passed without browser exceptions. These explanatory checks used no wallet connections or transactions. Evidence is `.openai/local/visual-qa/rules-walkthrough/` and its `production/` subdirectory.

Local Playwright was explicitly requested for visual QA while the Work browser tool remained disabled. The checks use fresh Chrome contexts and the production Vite build on loopback port 4319; they do not access personal tabs or profiles.

`npm run test:visual` captures 1440×900, 1366×768, 1280×720, 1920×1080, 1024×768, 768×1024, 390×844, 360×640, 320×568, 430×932, 844×390, 667×375 and 480×320. Additional phone/landscape captures apply simulated safe-area insets; these are CSS-layout checks, not physical-device measurements.

The placement checks cover the initial arena, confirmed-feed banner, held jackpot coins and long exact SOL amounts. They check page overflow; visible controls' 44px size, center hit and separation; readable mobile text; unclipped numbers; separation of UI regions; and the actual authored pig and held coin geometry projected through the scene camera. Desktop prize/timer gaps are measured against the pig itself. Real demo notifications are checked for viewport containment and a usable dismiss button. NPC simulation lives in the wallet overlay so its control does not consume the mobile playfield.

Interaction coverage includes mode/reward dialogs, a feed increasing keys, another feed increasing visible claimable SOL without removing keys, a preview preserving balances, a feed cancelling preview, actual demo settlement and clean new-round restore. Dynamic reduced-motion changes and a static reduced-motion jackpot are checked at phone DPR2, and the DPR2 animated jackpot is recorded as a local WebM. The visual regression also delays RAF timestamps by 50ms to verify that reward and jackpot count-ups stay within their numeric bounds.

The placement run passed all 15 layouts, 57 placement states, 18 real-notification checks and eight interaction flows with no browser errors. It caught and prompted fixes for desktop banners covering score captions, a tablet reward digit wrapping into another row, and short-phone banners touching the timer. The final change suppressing redundant mobile jackpot/time popups during confirmation was then checked through real demo feeds at eight portrait/landscape sizes; claimable SOL, its reward delta and the time summary stayed visible. Desktop scores sit approximately 50px from the projected pig at 1440×900; the actual landscape pig is approximately 217px high at 844×390 and 205px at 667×375.

The public-mode production build additionally passed **68 browser checks** across desktop, phone, 480×320 and 844×390 landscape, and 320×568 small phone. Actual local-chain signing flows cover connect, cancel/retry, feed, another wallet becoming leader, visibly rising earned SOL, game and holder claims, and disconnect. Checks verify visible permanent setup/claim costs, no local signer requests, no fixture/admin controls, explicit mobile wallet-browser links, no page scrolling and no browser exceptions. A later **22-check** compiled run verified that small positive reward cuts read `0.02% → 0.04%` at 320×568 and 480×320 while cost and cut text stay contained. Evidence is `.openai/local/visual-qa/public-wallet/{report,precise-cut-report}.json` and accompanying screenshots. The signing provider is an isolated Node test key behind an injected wallet interface; physical wallet extensions and mobile handoffs remain untested.

`npm run test:coin-marks` additionally verifies the exact official Solana SVG-derived emblem on both faces in a close-up gallery and in the actual pile/jackpot at desktop, phone and landscape sizes. Seven browser checks and five geometry tests passed; the full physics run also passed with two complete emblems per coin. Coin lighting, gold materials and physics are unchanged.

`npm run test:visual-physics` uses the actual authored GLB and the same source modules. It checks edge-on slot traversal, both stamped coin faces, 24 spaced prize coins, eight glints, complete shell-fragment fading, bounded completion, reset/disposal and input preservation. At 110/180 coin capacities, it tests three capped 12-coin deposits each with 2,068 physics frames. Centers and 24 sampled cylinder surface points remain inside the authored pig at settled checkpoints. Prize surfaces fit all audited cameras including pointer extremes and impact zoom.

Reproduce after starting the app (Chrome required):

```sh
npm run build
npm run preview -- --port 4319 --strictPort
# In another terminal:
PIGGY_QA_URL=http://127.0.0.1:4319 PIGGY_QA_OUTPUT=.openai/local/visual-qa/placements-verified npm run test:visual
npm run test:visual-physics
```

The placement screenshots, browser report and animation clip are saved in ignored `.openai/local/visual-qa/placements-verified/`; the full physical check report is `.openai/local/visual-qa/physics-check.json`. The main localnet page was also opened through port 4317 at phone and small-landscape sizes, including a deliberately unavailable service: confirmed/disconnected labels, unclipped controls, one loaded 3D canvas, no page scrolling and no JavaScript errors. These captures are in `.openai/local/visual-qa/placements-localnet/`. Mobile coverage is Chromium emulation; physical iOS/Safari and Android hardware performance remain untested. A clearly labelled wallet action previews the complete celebration without changing financial state.

Local and Devnet tests are separate from the live-mainnet evidence above; none is an external audit. Holder eligibility remains dependent on the authorized snapshot publisher. The predictable legacy lottery is restricted to the explicit local test build; the deployed public binary disables draws and carries its reserve. Tiny per-epoch claims can cost more in receipt rent/transaction fees than their reward. The hourly/0.01-SOL publisher threshold is an operator setting, not a promise of profitable claims; negative-net claims are disabled by default in the UI. Testnet validation, physical wallet/device checks and the upstream reuse-licence question remain outstanding. The live operator processes and RPC service require ongoing monitoring. See [PUBLICNET-LAUNCH.md](docs/PUBLICNET-LAUNCH.md).

Local-test SBF artifact SHA-256: `d5fa340b3b23f88323d3f0b1c702ad9f3a90cdff0a725f6d340139c89ea5b33a`.

Default public SBF artifact SHA-256: `7862ecd936cef7faaade05a834aca76065a37f8ad107fef3767f449bd653eb65` (267,648 bytes, no optional features). Rust source SHA-256: `1dfdc1cd411970f7d56659e10e4a6b0af760a091d79437dbf2920e076cd13211`.

For reproduction commands and exact account/claim policies, read [LOCALNET.md](LOCALNET.md), the fork's `PIGGY_PROGRAM.md`, and `HOLDER_REWARDS.md`.
