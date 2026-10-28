# Live frontend deployment

Production is [piggy.casa](https://piggy.casa), Vercel project `piggy` in scope `trenchfun1`. The arena, `/fomo3d/` story and `/verify/` transparency view are separate Vite build entries; retain all three in `vite.config.js`. The address-only deployment configuration is `public/piggy-config.json`. `vercel.json` selects it during the production build, serves the RPC function at `/rpc`, and forwards `/proofs/*` to the existing durable proof backend.

The Node function `api/rpc.js` uses `server/rpc-worker.mjs`. Set `HELIUS_API_KEY` as a sensitive production environment variable, `SOLANA_CLUSTER=mainnet-beta`, and `PIGGY_PROGRAM_ID` to the reviewed program address. The Helius key must never use a `VITE_` prefix. The public configuration contains only addresses and same-origin URLs. Browser requests are checked for origin, method, parameters, body size and response size; upstream credentials and error text are not returned.

From a sanitized checkout authenticated to the existing project:

```sh
npm ci
vercel link --project piggy --scope trenchfun1
vercel --prod --yes --scope trenchfun1
```

Keep `.openai/`, `.env*` and authority keys out of the upload. The launch staging checkout is the sibling `piggy-vercel` directory; its `.vercel/project.json` links the existing project. The canonical source includes the same API, routing and public configuration for later deployments. Do not deploy a local fixture bridge.

The separate public Site at `piggy-play.windyhen258.chatgpt.site` retains immutable Pump metadata/image assets and persistent R2 proof storage. Its authenticated uploader receives only public wallet proofs, epoch metadata and the index, in that order. Neither `public/proofs/index.json` nor another static proof index should shadow the Vercel rewrite. The proof-upload secret belongs only to the private operator runtime and storage backend. See [HOLDER-PUBLISHER.md](HOLDER-PUBLISHER.md).

After deployment verify the public page, mainnet genesis through `/rpc`, address-only configuration, exact proof domain, the wallet picker, provider switching and remembered-wallet reconnect, feed simulation/confirmation, and claims. Fresh browser contexts were used for the recorded launch tests. Wallet discovery uses `@wallet-standard/app` and the configured Solana chain, with legacy injected fallback for Phantom, Solflare, Backpack and generic compatible providers. Only wallets exposing sign-only legacy transaction support are offered. Mobile users should open the site inside a compatible wallet’s browser; returning from a wallet website to an unrelated browser does not establish a wallet session there.

The frontend is hosted on Vercel. Round maintenance, reward publication and proof synchronization run on a separate Railway service with persistent storage and a single supervised instance; Vercel does not run those signers. The Mac LaunchAgents are stopped and disabled. See [OPERATORS-SERVER.md](OPERATORS-SERVER.md) for the verified migration and current recovery procedure.

The read-only `/api/sol-price` function fetches the fixed public Coinbase SOL/USD endpoint and caches a validated quote for one minute. It needs no environment secret. Failures never affect SOL pricing or claims; the frontend hides unavailable/stale USD estimates. No caller can supply an upstream URL or trading action.
