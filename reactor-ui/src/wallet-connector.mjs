/** Wallet discovery and sign-only adapters. Submission stays in solana-public-client. */
import { getWallets } from '@wallet-standard/app';
import { PublicKey, Transaction } from '@solana/web3.js';

const CHAINS=Object.freeze({'mainnet-beta':'solana:mainnet',devnet:'solana:devnet',testnet:'solana:testnet'});
const CONNECT='standard:connect',EVENTS='standard:events',DISCONNECT='standard:disconnect',SIGN='solana:signTransaction';
const version1=value=>typeof value==='string'&&/^1\.\d+\.\d+$/.test(value);
const label=value=>typeof value==='string'?value.replace(/[\u0000-\u001f\u007f]/g,'').trim().slice(0,80):'';
const nameKey=value=>label(value).normalize('NFKC').toLowerCase();
const idFor=(kind,name)=>`${kind}:${encodeURIComponent(nameKey(name))}`;
const uint8=value=>ArrayBuffer.isView(value)&&Object.prototype.toString.call(value)==='[object Uint8Array]';
const sameBytes=(left,right)=>left.length===right.length&&left.every((value,index)=>value===right[index]);

/** Only self-contained image data is exposed to the UI; never wallet-provided URLs. */
export function sanitizeWalletIcon(value){
  if(typeof value!=='string'||value.length>131072)return null;
  const base=value.match(/^data:image\/(png|jpeg|gif|webp|svg\+xml);base64,([a-z\d+/]+={0,2})$/i);
  let kind,bytes,text;
  try{if(base){kind=base[1].toLowerCase();const raw=atob(base[2]);bytes=Uint8Array.from(raw,char=>char.charCodeAt(0));if(kind==='svg+xml')text=new TextDecoder().decode(bytes);}
    else if(/^data:image\/svg\+xml(?:;charset=utf-8)?,/i.test(value)){kind='svg+xml';text=decodeURIComponent(value.slice(value.indexOf(',')+1));}else return null;
  }catch{return null;}
  if(kind==='svg+xml'){
    if(!/^\s*(?:<\?xml[^>]*>\s*)?<svg\b/i.test(text)||/<\s*(?:script|foreignObject|iframe|object|embed|image|audio|video|style|animate|set)\b/i.test(text)||/<!\s*(?:DOCTYPE|ENTITY)|\bon[a-z]+\s*=|\b(?:href|src|style)\s*=|&(?:#|[a-z])|@import/i.test(text))return null;
    for(const match of text.matchAll(/url\(\s*(['"]?)(.*?)\1\s*\)/gi))if(!match[2].trim().startsWith('#'))return null;
    return `data:image/svg+xml,${encodeURIComponent(text)}`;
  }
  const prefix=new TextDecoder('latin1').decode(bytes.subarray(0,12));
  if(kind==='png'&&!sameBytes(bytes.subarray(0,8),Uint8Array.of(137,80,78,71,13,10,26,10)))return null;
  if(kind==='jpeg'&&!(bytes[0]===255&&bytes[1]===216&&bytes[2]===255))return null;
  if(kind==='gif'&&!/^GIF8[79]a/.test(prefix))return null;
  if(kind==='webp'&&!(prefix.startsWith('RIFF')&&prefix.slice(8)==='WEBP'))return null;
  return value;
}
function emitter(){const events=new Map();return{on(name,callback){if(!['accountChanged','disconnect'].includes(name)||typeof callback!=='function')return;let listeners=events.get(name);if(!listeners)events.set(name,listeners=new Set());listeners.add(callback);},removeListener(name,callback){events.get(name)?.delete(callback);},emit(name,value){for(const callback of [...events.get(name)||[]])try{callback(value);}catch{/* Listener errors cannot alter wallet identity. */}},clear(){events.clear();}};}
function supported(wallet,chain){try{const features=wallet.features;return version1(wallet.version)&&label(wallet.name)&&Array.isArray(wallet.chains)&&wallet.chains.includes(chain)&&version1(features?.[CONNECT]?.version)&&typeof features[CONNECT].connect==='function'&&version1(features?.[EVENTS]?.version)&&typeof features[EVENTS].on==='function'&&version1(features?.[SIGN]?.version)&&typeof features[SIGN].signTransaction==='function'&&Array.isArray(features[SIGN].supportedTransactionVersions)&&features[SIGN].supportedTransactionVersions.includes('legacy');}catch{return false;}}
function accountsFor(accounts,chain){if(!Array.isArray(accounts))throw new Error('Wallet did not return an account list.');return accounts.filter(account=>Array.isArray(account?.chains)&&account.chains.includes(chain)&&Array.isArray(account.features)&&account.features.includes(SIGN)).map(account=>{if(typeof account.address!=='string'||!uint8(account.publicKey)||account.publicKey.length!==32)throw new Error('Wallet returned an invalid Solana account.');const publicKey=new PublicKey(account.publicKey);if(publicKey.toBase58()!==account.address)throw new Error('Wallet address and public key do not match.');return{account,publicKey};});}
function parseSigned(result,original){if(!uint8(result)||result.length<1||result.length>1232)throw new Error('Wallet must return serialized legacy transaction bytes.');const signed=Transaction.from(new Uint8Array(result));if(!sameBytes(signed.serializeMessage(),original))throw new Error('Wallet changed the prepared transaction.');return signed;}

function standardAdapter(wallet,chain,changed){
  const events=emitter();let active=false,off,current=null,generation=0,connecting=0;
  function select(value){const old=current?.publicKey.toBase58(),next=value?.publicKey.toBase58();current=value;if(old!==next){events.emit('accountChanged',value?.publicKey||null);if(old&&!next)events.emit('disconnect');}}
  function invalidated(){generation++;connecting++;select(null);}
  function change(properties={}){generation++;if(current){try{if(!supported(wallet,chain))select(null);else{const accounts=accountsFor(properties.accounts??wallet.accounts,chain);select(accounts.find(row=>row.publicKey.equals(current.publicKey))||accounts[0]||null);}}catch{select(null);}}changed();}
  const provider={get publicKey(){return current?.publicKey||null;},
    async connect({onlyIfTrusted=false}={}){if(!active||!supported(wallet,chain))throw new Error('Wallet is not available for this Solana network.');const request=++connecting;const result=await wallet.features[CONNECT].connect({silent:!!onlyIfTrusted});if(!active||request!==connecting||!supported(wallet,chain))throw new Error('Wallet changed while connecting.');const candidates=accountsFor(result?.accounts,chain);if(!candidates.length)throw new Error('Wallet has no authorized account for this Solana network.');const chosen=candidates.find(row=>row.publicKey.equals(current?.publicKey||PublicKey.default))||candidates[0];const advertised=accountsFor(wallet.accounts,chain).find(row=>row.publicKey.equals(chosen.publicKey));if(!advertised)throw new Error('Wallet changed its authorized accounts while connecting.');generation++;select(advertised);return{publicKey:current.publicKey};},
    async disconnect(){connecting++;generation++;try{const feature=wallet.features?.[DISCONNECT];if(active&&typeof feature?.disconnect==='function')await feature.disconnect();}finally{select(null);}},
    on:events.on,removeListener:events.removeListener,
    async signTransaction(transaction){if(!active||!current||!supported(wallet,chain))throw new Error('Connect an available Solana wallet first.');if(!(transaction instanceof Transaction))throw new Error('Only legacy Solana transactions are supported.');const account=accountsFor(wallet.accounts,chain).find(row=>row.publicKey.equals(current.publicKey));if(!account)throw new Error('The connected wallet account is no longer authorized.');const expected=generation,address=current.publicKey.toBase58(),message=transaction.serializeMessage(),bytes=new Uint8Array(transaction.serialize({requireAllSignatures:false,verifySignatures:false}));const output=await wallet.features[SIGN].signTransaction({account:account.account,chain,transaction:bytes});if(!active||generation!==expected||current?.publicKey.toBase58()!==address||!supported(wallet,chain))throw new Error('Wallet changed while signing.');const after=accountsFor(wallet.accounts,chain).find(row=>row.publicKey.toBase58()===address);if(!after)throw new Error('Wallet account changed while signing.');if(!Array.isArray(output)||output.length!==1)throw new Error('Wallet returned an invalid signing response.');return parseSigned(output[0]?.signedTransaction,message);},
  };
  return{source:wallet,provider,activate(){if(active)return;active=true;try{if(typeof wallet.features?.[EVENTS]?.on==='function'){const cleanup=wallet.features[EVENTS].on('change',change);if(typeof cleanup!=='function'){active=false;return;}off=cleanup;}}catch{active=false;}},deactivate(){if(!active)return;active=false;try{off?.();}catch{}off=undefined;invalidated();},usable:()=>active&&supported(wallet,chain)};
}
function legacyKey(value){const key=value&&typeof value==='object'&&'publicKey'in value?value.publicKey:value;return key==null?null:new PublicKey(key);}
function legacyAdapter(raw,changed){
  const events=emitter();let active=false,current=null,generation=0,connecting=0;
  function select(value){const old=current?.toBase58(),next=value?.toBase58();current=value;if(old!==next){events.emit('accountChanged',value);if(old&&!next)events.emit('disconnect');}}
  function accountChanged(key){generation++;if(current){try{select(legacyKey(key));}catch{select(null);}}changed();}
  function disconnected(){generation++;connecting++;select(null);changed();}
  function assertCurrent(){if(!active||!current)throw new Error('Connect an available Solana wallet first.');if(raw.publicKey&&!new PublicKey(raw.publicKey).equals(current))throw new Error('Wallet account changed.');}
  const provider={get publicKey(){return current;},on:events.on,removeListener:events.removeListener,
    async connect(options){if(!active)throw new Error('Wallet is no longer available.');const request=++connecting;const result=await raw.connect(options);if(!active||request!==connecting)throw new Error('Wallet changed while connecting.');const key=new PublicKey(result?.publicKey||raw.publicKey);if(raw.publicKey&&!key.equals(new PublicKey(raw.publicKey)))throw new Error('Wallet returned inconsistent account addresses.');generation++;select(key);return{publicKey:key};},
    async disconnect(){generation++;connecting++;try{await raw.disconnect?.();}finally{select(null);}},
    async signTransaction(transaction){assertCurrent();if(!(transaction instanceof Transaction))throw new Error('Only legacy Solana transactions are supported.');const expected=generation,message=transaction.serializeMessage(),signed=await raw.signTransaction(transaction);assertCurrent();if(generation!==expected)throw new Error('Wallet changed while signing.');if(typeof signed?.serialize!=='function')throw new Error('Wallet returned an invalid transaction.');return parseSigned(signed.serialize({requireAllSignatures:false,verifySignatures:false}),message);},
  };
  return{source:raw,provider,activate(){if(active)return;active=true;try{raw.on?.('accountChanged',accountChanged);raw.on?.('disconnect',disconnected);}catch{/* Legacy providers may not implement events. */}},deactivate(){if(!active)return;active=false;generation++;connecting++;const remove=raw.removeListener||raw.off;try{remove?.call(raw,'accountChanged',accountChanged);remove?.call(raw,'disconnect',disconnected);}catch{}select(null);},usable:()=>active};
}

/** Registry events are automatic; list/refresh also pick up late legacy injection.
 * subscribe reports future changes (use list once for the initial snapshot).
 * dispose removes subscriptions and invalidates adapters without requesting funds. */
export function createWalletConnector({cluster,scope=globalThis.window,registry=getWallets()}={}){
  const chain=CHAINS[cluster];if(!chain)throw new Error('An explicit supported Solana cluster is required.');
  const standards=new Map(),legacies=new Map(),subscribers=new Set();let disposed=false,refreshing=false,entries=[];
  function notify(){const list=entries.slice();for(const callback of [...subscribers])try{callback(list);}catch{}}
  function refresh(){if(disposed)return[];if(refreshing)return entries.slice();refreshing=true;try{
    let registered=[];try{registered=[...registry.get()];}catch{}const registeredSet=new Set(registered),activeLegacy=new Set(),next=[],names=new Set(),sources=new Set();
    for(const[source,control]of standards)if(!registeredSet.has(source))control.deactivate();
    for(const wallet of registered){if(!wallet||typeof wallet!=='object')continue;let control=standards.get(wallet);if(!control){control=standardAdapter(wallet,chain,()=>refresh());standards.set(wallet,control);}control.activate();if(!control.usable())continue;const name=label(wallet.name),nameId=nameKey(name);if(names.has(nameId)||sources.has(wallet))continue;names.add(nameId);sources.add(wallet);next.push(Object.freeze({id:idFor('standard',name),name,icon:sanitizeWalletIcon(wallet.icon),kind:'standard',provider:control.provider}));}
    const candidates=[['Phantom',scope?.phantom?.solana],['Solflare',scope?.solflare],['Backpack',scope?.backpack],['Solana wallet',scope?.solana]];
    for(let[name,raw]of candidates){if(!raw||typeof raw.connect!=='function'||typeof raw.signTransaction!=='function')continue;if(raw===scope?.phantom?.solana||raw.isPhantom===true)name='Phantom';else if(raw===scope?.solflare||raw.isSolflare===true)name='Solflare';else if(raw===scope?.backpack||raw.isBackpack===true)name='Backpack';if(sources.has(raw)||names.has(nameKey(name)))continue;let control=legacies.get(raw);if(!control){control=legacyAdapter(raw,()=>refresh());legacies.set(raw,control);}control.activate();activeLegacy.add(raw);sources.add(raw);names.add(nameKey(name));next.push(Object.freeze({id:idFor('legacy',name),name,icon:sanitizeWalletIcon(raw.icon),kind:'legacy',provider:control.provider}));}
    for(const[source,control]of legacies)if(!activeLegacy.has(source))control.deactivate();
    const different=next.length!==entries.length||next.some((entry,index)=>entry.id!==entries[index]?.id||entry.provider!==entries[index]?.provider||entry.name!==entries[index]?.name||entry.icon!==entries[index]?.icon);entries=next;if(different)notify();return entries.slice();
  }finally{refreshing=false;}}
  const unsubscribers=[registry.on('register',refresh),registry.on('unregister',refresh)];refresh();
  return{list:refresh,refresh,subscribe(callback){if(disposed)return()=>{};if(typeof callback!=='function')throw new TypeError('Wallet subscriber must be a function.');subscribers.add(callback);return()=>subscribers.delete(callback);},dispose(){if(disposed)return;disposed=true;unsubscribers.forEach(off=>{try{off?.();}catch{}});for(const control of standards.values())control.deactivate();for(const control of legacies.values())control.deactivate();entries=[];subscribers.clear();standards.clear();legacies.clear();}};
}
