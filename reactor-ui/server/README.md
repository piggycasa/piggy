# PIGGY hosted RPC adapter

`rpc-worker.mjs` is a Sites-compatible default `fetch(request, env, ctx)` Worker. It serves embedded, unchanged Vite assets and proxies `/rpc` to a fixed Solana provider. The API key is read only from the runtime `HELIUS_API_KEY` secret. Never use a `VITE_` variable for it.

Runtime bindings:

- `SOLANA_CLUSTER`: `mainnet-beta`, `devnet`, or `testnet`.
- `HELIUS_API_KEY`: secret, required for mainnet/devnet. Testnet uses the official public Solana testnet endpoint without this key.
- `PIGGY_PROGRAM_ID`: deployed game program address; required for the narrowly filtered player history request.

Point the public client configuration `rpcUrl` at the Site's exact HTTPS origin plus `/rpc`. The proxy rejects cross-origin browser requests, batches, unrestricted program scans, unsupported methods, oversized bodies and unsafe transaction options. It never forwards caller authentication, arbitrary target URLs, or provider error text. Its 1,200 requests/minute/IP in-memory budget is best-effort per isolate, not a durable DDoS or billing safeguard; set provider-side billing/rate limits too. Multiple users behind one IP share it.

## Build an existing static Site as a Worker

The Site owner must retain the existing `project_id`, audience, and bindings and remove the `static` field from `.openai/hosting.json` only when proceeding with migration. Native Sites tools configure secrets. This adapter does not change identity or hosting files.

First build the public Vite client, with `VITE_PIGGY_CONFIG_URL` set to the approved public configuration path (for example `/deployment.json`):

```
npm run build -- --outDir .openai/local/site-client-dist --emptyOutDir
node scripts/build-site-worker.mjs --assets-dir .openai/local/site-client-dist --output-dir dist --replace-generated-output
node scripts/validate-site-worker.mjs
```

Pass those commands as ordered argument arrays to the Sites source workflow after environment/configuration is ready. The embed step produces only `dist/server/index.js` and `dist/.openai/hosting.json`, as required by the Worker ESM starter. Do not run a subsequent plain Vite build into `dist`, which would replace the Worker output. The generated output replacement flag removes only the explicit project-local generated output directory, never source/assets input.

The current complete scene produces approximately 3.76 MB gzip, so it exceeds Cloudflare's free-plan 3 MiB bound. The generator accepts up to the paid-plan 10 MiB gzip bound; the Sites hosting platform must confirm actual deployment compatibility. If it rejects that size, retain the existing static asset Site and host this small RPC Worker separately with an explicitly configured allowed origin, or use supported object storage; do not silently remove visual assets. Separate-origin hosting is not implemented by this same-origin adapter.

Local checks: `node --test tests/rpc-worker.test.mjs`. The suite covers upstream-secret redaction, unsupported inputs, real installed Solana web3 request serialization, asset bytes, and the request budget.

## Live holder proof publication

Optional runtime R2 binding `BUCKET` stores public proof JSON; optional secret `PIGGY_PROOF_UPLOAD_TOKEN` authorizes operator PUTs. Public reads are restricted to `/proofs/index.json`, `/proofs/wallets/<base58>.json`, and `/proofs/epochs/<positive integer>.json`. No object listing or arbitrary paths are exposed. Reads use R2 first and fall back to an embedded initial empty index if absent. Every response is uncached. The Worker never signs transactions.

Keep a private upload configuration and token file outside the public proof tree, both mode 0600:

```json
{"siteUrl":"https://YOUR-PUBLIC-SITE","proofDirectory":"./public-proofs","tokenFile":"./proof-upload-token"}
```

After the existing publisher exports finalized proofs, run `node scripts/sync-holder-proofs.mjs /absolute/private/upload-config.json`. It validates the complete local export before sending, uploads wallet documents, then bounded public epoch summaries, and uploads `index.json` last. Full local epoch plans/snapshot journals are never sent. A failed request stops the sequence; retrying the same export is safe. This is a separate operator step and must be included in the publisher's process schedule; merely funding an epoch does not upload it.

Each public object is limited to 4 MiB and 1,000 epochs. A token must have at least 32 URL-safe characters. PUTs are authenticated server to server, not enabled by CORS or exposed to the wallet browser. Configure the secret with native Sites tools; never embed it in a Vite variable or deployment manifest.

Existing proof entries cannot be removed or altered; new epochs append to wallet/index documents. Epoch metadata is immutable. Each R2 write uses an ETag precondition, so a concurrent upload conflict returns 409 instead of overwriting a newer file. This uses the documented [R2 conditional write API](https://developers.cloudflare.com/r2/api/workers/workers-api-reference/#conditional-operations).
