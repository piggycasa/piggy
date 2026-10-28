import { isTestClaimsPath, TEST_CONFIG_PATH } from './legacy-claims.mjs';
/** Public deployment configuration contains addresses only, never signing keys. */
import { PublicKey } from '@solana/web3.js';
export const PUBLIC_CLUSTERS = Object.freeze(['devnet', 'testnet', 'mainnet-beta']);
export const CLUSTER_GENESIS = Object.freeze({
  devnet: 'EtWTRABZaYq6iMfeYKouRu166VU2xqa1wcaWoxPkrZBG',
  testnet: '4uhcVJyU9pJkvQyS88uRDiswHXSCkY3zQawwpjk2NsNY',
  'mainnet-beta': '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d',
});
export const isLoopback = hostname => ['localhost','127.0.0.1','[::1]','::1'].includes(hostname);
/** URL parsers normalize decimal/hex IPv4 and mapped IPv6 before this check.
 * DNS names cannot be resolved safely in a browser; deployment probes must also
 * validate the resolved RPC service. Literal private/local hosts fail closed. */
export function isPrivateHost(input) {
  const hostname=String(input).toLowerCase().replace(/\.+$/,'');
  if(isLoopback(hostname)||hostname.endsWith('.localhost')||hostname.endsWith('.local')||hostname==='local'||hostname.endsWith('.internal'))return true;
  if(/^\d+(\.\d+){3}$/.test(hostname)){
    const[a,b]=hostname.split('.').map(Number);
    return a===0||a===10||a===127||a===169&&b===254||a===172&&b>=16&&b<=31||a===192&&(b===168||b===0)||a===100&&b>=64&&b<=127||a===198&&(b===18||b===19)||a>=224;
  }
  if(hostname.includes(':')){
    const text=hostname.replace(/^\[|\]$/g,''),sides=text.split('::');
    if(sides.length>2||text.includes('%'))return true;
    const left=sides[0]?sides[0].split(':'):[],right=sides[1]?sides[1].split(':'):[];
    if(left.length+right.length>8)return true;
    const words=sides.length===2?[...left,...Array(8-left.length-right.length).fill('0'),...right]:left;
    if(words.length!==8||words.some(word=>!/^([a-f\d]{1,4})$/.test(word)))return true;
    const first=parseInt(words[0],16);
    // Only global-unicast IPv6 is appropriate for a public RPC/proof endpoint.
    // This also excludes ULA, link/site-local and IPv4 mapped/compatible hosts.
    return(first&0xe000)!==0x2000||first===0x2001&&parseInt(words[1],16)===0x0db8;
  }
  return !hostname||!hostname.includes('.');
}
function url(value, label, origin) {
  if(typeof value!=='string'||!value||value!==value.trim())throw new TypeError(`${label} requires an explicit absolute HTTPS URL.`);
  const parsed = new URL(value);
  if (parsed.username || parsed.password || parsed.hash || parsed.protocol !== 'https:') throw new TypeError(`${label} requires an HTTPS URL without embedded credentials or a fragment.`);
  if (isPrivateHost(parsed.hostname)) throw new TypeError(`${label} cannot use a private or local service.`);
  return parsed.href;
}
export function validatePublicConfig(source, { origin = 'https://piggy.invalid' } = {}) {
  if (!source || source.schemaVersion !== 1 || !PUBLIC_CLUSTERS.includes(source.cluster)) throw new TypeError('An explicit PIGGY public-cluster configuration is required.');
  if (source.genesisHash !== CLUSTER_GENESIS[source.cluster]) throw new TypeError('Configured genesis hash does not match the selected Solana cluster.');
  const programId = new PublicKey(source.programId).toBase58(), piggyMint = new PublicKey(source.piggyMint).toBase58();
  if (programId === PublicKey.default.toBase58() || piggyMint === PublicKey.default.toBase58()) throw new TypeError('Deployment addresses cannot be placeholders.');
  if (typeof source.gameVersion==='number'&&!Number.isSafeInteger(source.gameVersion)||!/^[1-9]\d*$/.test(String(source.gameVersion)) || BigInt(source.gameVersion) > (1n<<64n)-1n) throw new TypeError('A positive u64 game version is required.');
  if (source.purchaseGuardVersion !== 1) throw new TypeError('Public deployments must support the on-chain guarded purchase instruction.');
  const priorityFeeMicroLamports = source.priorityFeeMicroLamports ?? 0;
  if (!Number.isSafeInteger(priorityFeeMicroLamports) || priorityFeeMicroLamports < 0 || priorityFeeMicroLamports > 1_000_000) throw new TypeError('Priority fee must be 0–1,000,000 micro-lamports per compute unit.');
  if (source.cluster === 'mainnet-beta' && source.mainnetEnabled !== true) throw new TypeError('Mainnet actions are not enabled in this deployment configuration.');
  return Object.freeze({schemaVersion:1,cluster:source.cluster,genesisHash:source.genesisHash,programId,piggyMint,gameVersion:String(source.gameVersion),purchaseGuardVersion:1,
    rpcUrl:url(source.rpcUrl,'RPC',origin),proofIndexUrl:url(source.proofIndexUrl,'Holder proof index',origin),priorityFeeMicroLamports,mainnetEnabled:source.mainnetEnabled===true});
}
/** Hosted builds fail closed. Only loopback hosts may use the fixture signer. */
export function selectClientMode(location, env = {}) {
  if (isTestClaimsPath(location.pathname)) {
    if (!env.VITE_PIGGY_CONFIG_URL) return { mode:'unconfigured', error:'The test-claims deployment is not configured. Transactions are disabled.' };
    return { mode:'public', configUrl:new URL(TEST_CONFIG_PATH,location.origin).href, claimOnly:true };
  }
  const query = new URLSearchParams(location.search || '');
  if (query.get('demo') === '1') return { mode:'demo' };
  const configured = env.VITE_PIGGY_CONFIG_URL;
  if (configured){try{return {mode:'public',configUrl:new URL(configured,location.origin).href};}catch{return{mode:'unconfigured',error:'The public deployment configuration URL is invalid. Transactions are disabled.'};}}
  if (isLoopback(location.hostname)) return {mode:'localnet'};
  return {mode:'unconfigured',error:'Public Solana deployment is not configured. Transactions are disabled.'};
}
export async function loadPublicConfig(configUrl, { fetch:fetcher=globalThis.fetch, origin=globalThis.location?.origin } = {}) {
  const target = new URL(configUrl,origin);
  const localOrigin=target.origin===origin&&isLoopback(target.hostname);
  if(target.username||target.password||target.hash||!localOrigin&&(target.protocol!=='https:'||isPrivateHost(target.hostname)))throw new TypeError('Public configuration requires HTTPS hosting without credentials, private addresses or a fragment.');
  const response = await fetcher(target.href,{cache:'no-store',credentials:'omit',redirect:'error'});
  if (!response.ok) throw new Error(`Unable to load deployment configuration (${response.status}).`);
  return validatePublicConfig(await response.json(),{origin});
}
