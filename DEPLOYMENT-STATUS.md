# Deployment status — 2 November 2026

- Mainnet program: `BVqivL3X8JvuaNgiVAZb9WitRnT2LYGPLvdm3tD8a6Ph`.
- ProgramData: `9ZFD4RMsiidwceQPBuDaxiqeXRpNaSk2fmRAoy5uJpkJ`.
- Same 267,648-byte executable; no program redeployment or upgrade for the clock change.
- Approved initialization: **300-second start, 30 seconds per key, 600-second remaining cap**. Original curve and payout tables are unchanged.
- New game not initialized; new token mint not supplied. Operator activation and fresh Mainnet transaction tests are still pending.
- The website countdown is scheduled for **2 November 2026 at 21:00 Europe/London**. Reaching zero does not automatically open the game.
- Public source includes `launch-site/` for the current holding page/countdown and `reactor-ui/` for the game and operators. Branding/font assets remain in the interface's public assets.
- Previous PIGGY program is permanently retired. Old claims are unavailable; archived test evidence is explicitly historical.

Use [read-only verification](docs/VERIFICATION.md) or the website's [Check live program](https://piggy.casa/verify/). Matching executable bytes is not an independent source build or a security audit.

## Validation for this configuration

251 JavaScript tests passed. A full local-validator rehearsal loaded the unchanged executable and checked 300/30/600 initialization, the cap, key rewards, funded holder claims, duplicate-claim rejection, real-time expiry, settlement, treasury withdrawal and the next five-minute round. See `verification/short-round-local-rehearsal.json`. This is local evidence; the new Mainnet game and token have not yet been initialized.
