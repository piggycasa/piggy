/** Browser wallet client. No fixture key, local bridge, custodial signer or admin
 * action is imported here. Every debit is signed by the connected user's wallet. */
import './solana-browser-polyfill.mjs';
import { Buffer } from 'buffer';
import { Connection, Keypair, Transaction, VersionedTransaction, ComputeBudgetProgram, SystemProgram, SYSVAR_CLOCK_PUBKEY } from '@solana/web3.js';
import { createInitializeAccount3Instruction, createSyncNativeInstruction, createCloseAccountInstruction, TOKEN_2022_PROGRAM_ID, unpackMint, unpackAccount } from '@solana/spl-token';
import * as sdk from './solana-instructions.mjs';
import { costForExactKeys } from './solana-curve.mjs';
import { verifyHolderProof, hexToBytes } from './solana-holder.mjs';
import { validatePublicConfig } from './solana-config.mjs';
import { base58Encode, isTransactionSignature } from './solana-signature.mjs';
import { createWalletConnector } from './wallet-connector.mjs';

const ZERO = SystemProgram.programId.toBase58(), COMMITMENT = 'confirmed';
const exact = value => { const number=Number(value); if(!Number.isSafeInteger(number)||number<0)throw new RangeError('Amount exceeds the exact browser display range.'); return number; };
const short = key => `${String(key).slice(0,4)}…${String(key).slice(-4)}`;
const jsonBig = value => JSON.stringify(value,(_,v)=>typeof v==='bigint'?v.toString():v);
export function programErrorExplanation(error){const code=error?.InstructionError?.[1]?.Custom;return({3:'That payment no longer buys a whole key. Refresh the cost.',21:'The feed quote expired or the round changed. Refresh and try again.',22:'Another feed changed the price. Your selected key count was protected. Refresh and try again.',23:'The feed quote is invalid. Refresh and try again.'})[code]||'Refresh the game and review the action before trying again.';}
export function walletProofUrl(indexUrl,wallet){const base=new URL(indexUrl);if(base.pathname.endsWith('/index.json'))base.pathname=base.pathname.slice(0,-10);else base.pathname=base.pathname.replace(/\/?$/,'/');return new URL(`wallets/${sdk.pk(wallet).toBase58()}.json`,base).href;}
export function validateProofManifest(manifest,config,wallet) {
  if(manifest?.schemaVersion!==1||manifest.cluster!==config.cluster||manifest.genesisHash!==config.genesisHash||manifest.programId!==config.programId||String(manifest.gameVersion)!==config.gameVersion||manifest.piggyMint!==config.piggyMint||manifest.wallet!==wallet||!Array.isArray(manifest.epochs)||manifest.epochs.length>1000)throw new Error('Holder proof manifest belongs to a different deployment or wallet.');
  const seen=new Set();return manifest.epochs.map(record=>{
    if(!/^[1-9]\d*$/.test(String(record.epoch))||!/^[1-9]\d*$/.test(String(record.amount))||BigInt(record.epoch)>(1n<<64n)-1n||BigInt(record.amount)>(1n<<64n)-1n||seen.has(String(record.epoch))||!Array.isArray(record.proof)||record.proof.length>32||record.proof.some(p=>typeof p!=='string'||!/^([a-f0-9]{64})$/i.test(p)))throw new Error('Malformed or duplicate holder entitlement.');
    seen.add(String(record.epoch));return{epoch:BigInt(record.epoch),amount:BigInt(record.amount),proof:record.proof.map(hexToBytes)};
  });
}
export class PendingTransactionError extends Error {
  constructor(signature){super(`Confirmation is pending. Check transaction ${signature} before retrying; it may already have landed.`);this.name='PendingTransactionError';this.signature=signature;}
}
/** HTTP confirmation also works in mobile wallet browsers and RPC deployments
 * that do not expose a WebSocket endpoint. A timeout never creates a new debit. */
export async function confirmByPolling(connection,{signature,lastValidBlockHeight},{timeoutMs=90_000,pollMs=650}={}){
  const deadline=Date.now()+timeoutMs;
  do{
    const status=(await connection.getSignatureStatuses([signature],{searchTransactionHistory:true})).value[0];
    if(status?.confirmationStatus==='confirmed'||status?.confirmationStatus==='finalized')return{...(Number.isSafeInteger(status.slot)?{context:{slot:status.slot}}:{}),value:{err:status.err||null}};
    if(!status&&await connection.getBlockHeight(COMMITMENT)>lastValidBlockHeight)throw new Error(`Transaction ${signature} expired before confirmation.`);
    if(Date.now()>=deadline)break;
    await new Promise(resolve=>setTimeout(resolve,pollMs));
  }while(Date.now()<=deadline);
  throw new PendingTransactionError(signature);
}
export function createPublicGameClient(source,{connection,fetch:fetcher=globalThis.fetch,walletScope=globalThis.window,walletRegistry,storage,onWalletChange=()=>{},onTransaction=()=>{}}={}) {
  const config=validatePublicConfig(source,{origin:globalThis.location?.origin}),conn=connection||new Connection(config.rpcUrl,{commitment:COMMITMENT,confirmTransactionInitialTimeout:60_000,disableRetryOnRateLimit:true});
  const connector=createWalletConnector({cluster:config.cluster,scope:walletScope,...(walletRegistry?{registry:walletRegistry}:{})});
  const program=sdk.pk(config.programId),version=BigInt(config.gameVersion),gameAddress=sdk.gameAddress(program,version),holderAddress=sdk.holderConfigAddress(program,gameAddress);
  let provider,wallet,listener,disconnectListener,busy=false,connecting=false,latest,unresolved,proofWarning='',activeActionWallet,minimumAccountSlot=0;const historicalRounds=new Map(),finalizedEpochs=new Map(),finalizedReceipts=new Map(),rentEstimates=new Map();
  if(storage===undefined){try{storage=globalThis.sessionStorage;}catch{/* Browsers may disable session storage. In-memory protection remains. */}}
  const pendingKey=who=>`piggy.pending.v1:${config.genesisHash}:${config.programId}:${config.gameVersion}:${who}`;
  function rememberPending(value,who=wallet){if(wallet===who)unresolved=value;try{if(value)storage?.setItem(pendingKey(who),JSON.stringify(value));else if(who)storage?.removeItem(pendingKey(who));}catch{/* Never lose the in-memory signature when browser storage is unavailable. */}}
  function restorePending(){unresolved=undefined;if(!wallet)return;try{const saved=JSON.parse(storage?.getItem(pendingKey(wallet))||'null');if(saved&&isTransactionSignature(saved.signature)&&Number.isSafeInteger(saved.lastValidBlockHeight)&&saved.lastValidBlockHeight>0)unresolved=saved;}catch{/* A malformed local record cannot sign or submit anything. */}}
  const walletKey=()=>wallet&&sdk.pk(wallet);
  const notify=()=>onWalletChange({connected:!!wallet,wallet:wallet||null,name:provider?.name||null,id:provider?.id||null});
  function clearConnection(){if(provider){if(listener)provider.provider.removeListener?.('accountChanged',listener);if(disconnectListener)provider.provider.removeListener?.('disconnect',disconnectListener);}provider=undefined;wallet=undefined;latest=undefined;unresolved=undefined;listener=undefined;disconnectListener=undefined;notify();}
  const unsubscribeConnector=connector.subscribe(choices=>{if(provider&&!choices.some(choice=>choice.id===provider.id&&choice.provider===provider.provider))clearConnection();});
  async function verifyNetwork(){if(await conn.getGenesisHash()!==config.genesisHash)throw new Error(`RPC is on the wrong Solana network. Expected ${config.cluster}.`);}
  function decoded(account,decoder,required=true){if(!account){if(required)throw new Error('The configured PIGGY deployment is not initialized.');return null;}if(!account.owner.equals(program))throw new Error('PIGGY account has an unexpected owner.');return decoder(account.data);}
  const confirmedRead=()=>({commitment:COMMITMENT,minContextSlot:minimumAccountSlot});
  async function account(address,decoder,required=true){return decoded(await conn.getAccountInfo(address,confirmedRead()),decoder,required);}
  async function identity(){
    await verifyNetwork();
    const result=await conn.getMultipleAccountsInfoAndContext([program,gameAddress,holderAddress,sdk.pk(config.piggyMint)],confirmedRead());
    if(result.context.slot<minimumAccountSlot)throw new Error('RPC returned an older account state. Waiting for it to catch up.');minimumAccountSlot=Math.max(minimumAccountSlot,result.context.slot);
    const [deployed,gameInfo,holderInfo,mintInfo]=result.value;
    if(!deployed?.executable)throw new Error('Configured PIGGY program is not executable on this network.');
    const game=decoded(gameInfo,sdk.decodeGame),holder=decoded(holderInfo,sdk.decodeHolderConfig);
    if(game.version!==version||game.mint!==sdk.NATIVE_MINT.toBase58()||holder.game!==gameAddress.toBase58()||holder.eligibility_mint!==config.piggyMint||holder.payment_mint!==sdk.NATIVE_MINT.toBase58()||holder.vault!==sdk.holderVaultAddress(program,gameAddress).toBase58()||game.p3d_wallet!==holder.vault)throw new Error('Game, payment mint and holder configuration do not match the deployment.');
    if(!mintInfo||!mintInfo.owner.equals(sdk.TOKEN_PROGRAM_ID)&&!mintInfo.owner.equals(TOKEN_2022_PROGRAM_ID))throw new Error('$PIGGY must be the configured SPL or Token-2022 mint.');
    const eligibility=unpackMint(sdk.pk(config.piggyMint),mintInfo,mintInfo.owner);if(!eligibility.isInitialized)throw new Error('$PIGGY mint is not initialized.');
    return{game,holder,decimals:eligibility.decimals,supply:eligibility.supply,eligibilityTokenProgram:mintInfo.owner,slot:result.context.slot};
  }
  async function proofs(holder){
    proofWarning='';if(!wallet)return{records:[],earned:0n,claimed:0n,claimable:0n};
    let manifest;
    try{const response=await fetcher(walletProofUrl(config.proofIndexUrl,wallet),{cache:'no-store',credentials:'omit',redirect:'error'});if(response.status===404)return{records:[],earned:0n,claimed:0n,claimable:0n};if(!response.ok)throw new Error('Holder proof index is temporarily unavailable.');manifest=await response.json();}
    catch(error){proofWarning=error.message;return{records:[],earned:0n,claimed:0n,claimable:0n,unavailable:true};}
    const entries=validateProofManifest(manifest,config,wallet),records=[],queries=new Map(),descriptors=entries.map(entry=>{const epAddress=sdk.holderEpochAddress(program,holderAddress,entry.epoch),receiptAddress=sdk.holderReceiptAddress(program,epAddress,wallet);if(!finalizedEpochs.has(epAddress.toBase58()))queries.set(epAddress.toBase58(),epAddress);if(!finalizedReceipts.has(receiptAddress.toBase58()))queries.set(receiptAddress.toBase58(),receiptAddress);return{entry,epAddress,receiptAddress};});let earned=0n,claimed=0n;
    const finalized=await batchAccounts([...queries.values()],'finalized'),pending=new Map();
    // Empty finalized receipts may have just been claimed at confirmed. Check
    // those together, but never cache a merely-confirmed receipt indefinitely.
    const missing=[...queries.values()].filter(address=>!finalized.get(address.toBase58()));
    for(const [address,value]of await batchAccounts(missing,COMMITMENT))pending.set(address,value);
    for(const{entry,epAddress,receiptAddress}of descriptors){
      const epKey=epAddress.toBase58(),receiptKey=receiptAddress.toBase58(),epFinal=finalized.get(epKey),receiptFinal=finalized.get(receiptKey);
      const epoch=finalizedEpochs.get(epKey)||decoded(epFinal||pending.get(epKey),sdk.decodeHolderEpoch),receipt=finalizedReceipts.get(receiptKey)||decoded(receiptFinal||pending.get(receiptKey),sdk.decodeHolderReceipt,false);
      if(epoch.config!==holderAddress.toBase58()||epoch.game!==gameAddress.toBase58()||epoch.epoch!==entry.epoch||entry.amount>epoch.total_amount||!verifyHolderProof({...entry,wallet},{programId:program,game:gameAddress,epoch:entry.epoch},hexToBytes(epoch.merkle_root)))throw new Error('Holder proof does not match its funded on-chain epoch.');
      if(receipt&&(receipt.epoch_account!==epAddress.toBase58()||receipt.wallet!==wallet||receipt.amount!==entry.amount))throw new Error('Invalid holder claim receipt.');
      if(epFinal)finalizedEpochs.set(epKey,epoch);if(receiptFinal)finalizedReceipts.set(receiptKey,receipt);
      earned+=entry.amount;if(receipt)claimed+=entry.amount;else records.push(entry);
    }
    if(holder.reserved_amount<records.reduce((sum,row)=>sum+row.amount,0n))throw new Error('Holder epoch funding is inconsistent.');
    return{records,earned,claimed,claimable:earned-claimed};
  }
  async function batchAccounts(addresses,commitment){const found=new Map();for(let offset=0;offset<addresses.length;offset+=100){const chunk=addresses.slice(offset,offset+100),values=await conn.getMultipleAccountsInfo(chunk,commitment===COMMITMENT?confirmedRead():commitment);for(const[index,address]of chunk.entries())found.set(address.toBase58(),values[index]);}return found;}
  async function getState(){
    if(unresolved){try{const result=await resolvePending();if(result)onTransaction({...result,wallet});}catch(error){if(!(error instanceof PendingTransactionError))throw error;}}
    const who=wallet,identityState=await identity(),{game,holder,decimals,supply,eligibilityTokenProgram}=identityState;
    if(game.round_id<1n)throw new Error('The first PIGGY round has not been initialized.');
    const round=await account(sdk.roundAddress(program,game.round_id,version),sdk.decodeRound);
    if(round.round_id!==game.round_id)throw new Error('Current round address mismatch.');
    const playerRecords=[];
    if(who){const rows=await conn.getProgramAccounts(program,{...confirmedRead(),filters:[{dataSize:233},{memcmp:{offset:1,bytes:who}}]});if(rows.length>1000)throw new Error('Wallet history requires a production indexer before it can be loaded safely.');for(const row of rows){if(row.account.data[0]!==5)continue;const player=decoded(row.account,sdk.decodePlayer);if(player.player_pk!==who||player.round_id>game.round_id||!row.pubkey.equals(sdk.playerAddress(program,who,player.round_id,version)))continue;const prior=player.round_id===game.round_id?round:await account(sdk.roundAddress(program,player.round_id,version),sdk.decodeRound);playerRecords.push({player,round:prior});}}
    const balance=who?await conn.getBalance(sdk.pk(who),confirmedRead()):0;
    let tokenBalance=0n;
    if(who){const accounts=await conn.getTokenAccountsByOwner(sdk.pk(who),{mint:sdk.pk(config.piggyMint)},confirmedRead());for(const item of accounts.value){const parsed=unpackAccount(item.pubkey,item.account,eligibilityTokenProgram);if(parsed.owner.toBase58()!==who||parsed.mint.toBase58()!==config.piggyMint||!parsed.isInitialized)throw new Error('Invalid wallet token account.');tokenBalance+=parsed.amount;}}
    let holderRewards;try{holderRewards=await proofs(holder);}catch(error){proofWarning=`Holder claim verification failed: ${error.message}`;holderRewards={records:[],earned:0n,claimed:0n,claimable:0n,unavailable:true};}
    let claimCosts={};if(who){try{claimCosts=await estimateClaimCosts(playerRecords,holderRewards,game.round_id);}catch(error){claimCosts={error:`Transaction cost estimate is unavailable: ${error.message}`};}}
    const clock=await conn.getAccountInfo(SYSVAR_CLOCK_PUBKEY,confirmedRead());if(!clock||clock.data.length<40)throw new Error('Solana clock is unavailable.');
    if(wallet!==who)throw new Error('Wallet changed while reading balances. Refreshing the new account.');
    const current=playerRecords.find(row=>row.player.round_id===game.round_id)?.player||null;
    const first=game.round_id>20n?game.round_id-19n:1n,missing=[];
    for(let id=first;id<game.round_id;id++)if(!historicalRounds.has(String(id)))missing.push(id);
    if(missing.length){const values=await conn.getMultipleAccountsInfo(missing.map(id=>sdk.roundAddress(program,id,version)),confirmedRead());for(const[index,value]of values.entries()){const prior=decoded(value,sdk.decodeRound);if(prior.round_id!==missing[index]||!prior.ended)throw new Error('Completed round history is inconsistent.');historicalRounds.set(String(prior.round_id),prior);}}
    const history=[...historicalRounds.values(),...(round.ended?[round]:[])].filter(r=>r.round_id>=first).sort((a,b)=>a.round_id>b.round_id?-1:1).map(r=>({roundId:exact(r.round_id),winnerId:r.lead_player_pk===ZERO?null:r.lead_player_pk===who?'you':r.lead_player_pk,totalKeys:exact(r.accum_keys),winnerPrize:exact(r.final_prize_share),rolloverAmount:exact(r.accum_next_round_share+r.accum_airdrop_share+r.accum_airdrop_carried)}));
    const raw={game,round,players:[{id:'you',name:who?short(who):'Connect wallet',wallet:who||ZERO,balance,tokenBalance,playerRound:current,playerRounds:playerRecords,holder:holderRewards}],holder:{config:holder,decimals,totalEligibleTokenBalance:supply,proofWarning,claimCosts,wallets:{[who||ZERO]:holderRewards}},history,activity:[],chainNow:Buffer.from(clock.data).readBigInt64LE(32),network:{name:config.cluster,genesisHash:config.genesisHash,testMint:config.cluster!=='mainnet-beta'},programId:config.programId,piggyMint:config.piggyMint,version:config.gameVersion,walletConnected:!!who,slot:identityState.slot};
    latest=raw;return raw;
  }
  async function connect(name,{onlyIfTrusted=false}={}){
    if(busy)throw new Error('Finish the pending transaction before changing wallets.');
    if(connecting)throw new Error('A wallet connection is already in progress.');
    connector.refresh();
    const choice=connector.list().find(item=>!name||item.id===name||item.name===name);if(!choice)throw new Error('No compatible Solana wallet was detected. Open PIGGY in your wallet browser or install a Solana wallet extension.');
    connecting=true;
    try{
    await verifyNetwork();await disconnect();provider=choice;
    let connected;try{connected=await choice.provider.connect(onlyIfTrusted?{onlyIfTrusted:true}:undefined);if(provider!==choice||!connector.list().some(item=>item.provider===choice.provider))throw new Error('Wallet was disconnected while connecting. Try again.');const address=connected?.publicKey||choice.provider.publicKey;if(!address)throw new Error('Wallet did not provide an account address.');wallet=sdk.pk(address).toBase58();}catch(error){clearConnection();throw error;}
    restorePending();
    listener=key=>{if(!key){clearConnection();return;}try{wallet=sdk.pk(key).toBase58();}catch{clearConnection();return;}latest=undefined;restorePending();notify();};disconnectListener=clearConnection;
    choice.provider.on?.('accountChanged',listener);choice.provider.on?.('disconnect',disconnectListener);notify();if(unresolved)onTransaction({status:'pending',wallet,signature:unresolved.signature});return{wallet};
    }finally{connecting=false;}
  }
  async function disconnect(){if(busy)throw new Error('Finish the pending transaction before disconnecting.');if(provider){const previous=provider;clearConnection();await previous.provider.disconnect?.();}}
  async function temporaryWsol(amount=0n){const pair=Keypair.generate(),rent=await conn.getMinimumBalanceForRentExemption(165,COMMITMENT);return{pair,rent,before:[SystemProgram.createAccount({fromPubkey:walletKey(),newAccountPubkey:pair.publicKey,lamports:exact(amount+BigInt(rent)),space:165,programId:sdk.TOKEN_PROGRAM_ID}),createInitializeAccount3Instruction(pair.publicKey,sdk.NATIVE_MINT,walletKey()),createSyncNativeInstruction(pair.publicKey)],after:[createCloseAccountInstruction(pair.publicKey,walletKey(),walletKey())]};}
  const budget=()=>[ComputeBudgetProgram.setComputeUnitLimit({units:1_300_000}),...(config.priorityFeeMicroLamports?[ComputeBudgetProgram.setComputeUnitPrice({microLamports:config.priorityFeeMicroLamports})]:[])];
  async function rentEstimate(bytes){const cached=rentEstimates.get(bytes);if(cached&&Date.now()-cached.at<60_000)return cached.value;const value=await conn.getMinimumBalanceForRentExemption(bytes,COMMITMENT);rentEstimates.set(bytes,{value,at:Date.now()});return value;}
  async function estimateClaimCosts(playerRecords,holderRewards,currentRound){
    const gameClaims=playerRecords.map(row=>sdk.claimableGame(row.player,row.round).total).filter(value=>value>0n),holderClaims=holderRewards.records||[];
    const latestBlock=await conn.getLatestBlockhashAndContext(confirmedRead()),dummy=Keypair.generate().publicKey,temporaryRent=await rentEstimate(165),receiptRent=holderClaims.length?await rentEstimate(81):0,playerRent=playerRecords.some(row=>row.player.round_id===currentRound)?0:await rentEstimate(233);
    // Both claim forms have exactly two signatures (wallet + temporary WSOL
    // account). Compute budget is identical to send(); message fees are fixed by
    // these signatures and its explicit compute-unit limit/price.
    const preview=new Transaction({feePayer:walletKey(),blockhash:latestBlock.value.blockhash,lastValidBlockHeight:latestBlock.value.lastValidBlockHeight}).add(...budget(),SystemProgram.createAccount({fromPubkey:walletKey(),newAccountPubkey:dummy,lamports:temporaryRent,space:165,programId:sdk.TOKEN_PROGRAM_ID}));
    const fee=(await conn.getFeeForMessage(preview.compileMessage(),COMMITMENT)).value;if(fee===null)throw new Error('RPC did not return a transaction fee.');
    const summary=(amounts,rentPerClaim)=>{const grossAmount=amounts.reduce((sum,value)=>sum+value,0n),networkFees=BigInt(fee)*BigInt(amounts.length),accountRent=BigInt(rentPerClaim)*BigInt(amounts.length);return{grossAmount,networkFees,accountRent,refundableRent:BigInt(temporaryRent),netAmount:grossAmount-networkFees-accountRent,transactions:amounts.length,estimated:true};};
    return{entry:{accountRent:BigInt(playerRent),networkFees:BigInt(fee),refundableRent:BigInt(temporaryRent)},...(gameClaims.length?{game:summary(gameClaims,0)}:{}),...(holderClaims.length?{holder:summary(holderClaims.map(row=>row.amount),receiptRent)}:{})};
  }
  async function resolvePending(candidate=unresolved,who=wallet){
    if(!candidate)return;
    const status=(await conn.getSignatureStatuses([candidate.signature],{searchTransactionHistory:true})).value[0];
    if(status?.confirmationStatus==='confirmed'||status?.confirmationStatus==='finalized'){if(Number.isSafeInteger(status.slot))minimumAccountSlot=Math.max(minimumAccountSlot,status.slot);rememberPending(undefined,who);return{status:status.err?'failed':'confirmed',signature:candidate.signature};}
    if(!status&&await conn.getBlockHeight(COMMITMENT)>candidate.lastValidBlockHeight){rememberPending(undefined,who);return{status:'expired',signature:candidate.signature};}
    throw new PendingTransactionError(candidate.signature);
  }
  async function send(instructions,{signers=[],debit=0n,rent=0,extraRent=0,claimAmount=0n,revalidate}={}){
    await resolvePending();await verifyNetwork();const who=wallet,signingProvider=provider;
    if(wallet!==activeActionWallet)throw new Error('Wallet changed during this action. Review the new wallet before trying again.');
    if(!who||!signingProvider)throw new Error('Connect your Solana wallet first.');
    const block=await conn.getLatestBlockhashAndContext(confirmedRead()),tx=new Transaction({feePayer:sdk.pk(who),blockhash:block.value.blockhash,lastValidBlockHeight:block.value.lastValidBlockHeight}).add(...budget(),...instructions);
    for(const signer of signers)tx.partialSign(signer);
    if(tx.serialize({requireAllSignatures:false,verifySignatures:false}).length>1232)throw new Error('This claim proof is too large for a legacy Solana transaction. A reviewed lookup-table client is required before it can be claimed.');
    const message=tx.serializeMessage(),fee=(await conn.getFeeForMessage(tx.compileMessage(),COMMITMENT)).value;if(fee===null)throw new Error('Unable to estimate the Solana transaction fee.');
    const available=await conn.getBalance(sdk.pk(who),confirmedRead());if(BigInt(available)<debit+BigInt(fee+rent+extraRent))throw new Error('Not enough SOL for this action, network fee and temporary account rent. Temporary wrapped-SOL rent is returned atomically.');
    const simulation=await conn.simulateTransaction(new VersionedTransaction(tx.compileMessage()),{commitment:COMMITMENT,sigVerify:false,minContextSlot:block.context.slot});if(simulation.value.err)throw new Error(`Solana simulation rejected this action. ${programErrorExplanation(simulation.value.err)} No transaction was sent.`);
    if(wallet!==who||provider!==signingProvider)throw new Error('Wallet changed before signing. No transaction was sent.');
    onTransaction({status:'awaiting-wallet',wallet:who,fee,debit:String(debit),refundableRent:rent,accountRent:extraRent,claimAmount:String(claimAmount)});
    const signed=await signingProvider.provider.signTransaction(tx);
    if(wallet!==who||provider!==signingProvider)throw new Error('Wallet changed while signing. No transaction was sent.');
    if(typeof signed?.serialize!=='function')throw new Error('Wallet returned an invalid transaction. No transaction was sent.');
    // Decode the actual wire bytes using our SDK. Do not trust methods on a
    // provider-supplied object to describe or verify a different byte payload.
    const canonical=Transaction.from(signed.serialize());
    if(!Buffer.from(canonical.serializeMessage()).equals(message))throw new Error('Wallet changed the prepared transaction. No transaction was sent.');
    const bytes=canonical.serialize();if(bytes.length>1232)throw new Error('Transaction exceeds the Solana packet limit.');
    if(await conn.getBlockHeight(COMMITMENT)>block.value.lastValidBlockHeight)throw new Error('Wallet approval took too long. Refresh and approve a new quote; no transaction was sent.');
    await verifyNetwork();if(revalidate)await revalidate();
    if(wallet!==who||provider!==signingProvider)throw new Error('Wallet changed before broadcast. No transaction was sent.');
    // Derive the signature before broadcast: a transport error may occur after
    // acceptance. Keep this identity and never create a replacement debit.
    const signatureBytes=canonical.signature;if(!signatureBytes||!canonical.verifySignatures())throw new Error('Wallet did not provide valid transaction signatures.');
    const signature=base58Encode(signatureBytes);
    const pending={signature,lastValidBlockHeight:block.value.lastValidBlockHeight};rememberPending(pending,who);let knownFailure=false;
    try{const returned=await conn.sendRawTransaction(bytes,{skipPreflight:false,preflightCommitment:COMMITMENT,maxRetries:3,minContextSlot:block.context.slot});if(returned!==signature)throw new Error('RPC returned an unexpected transaction signature.');onTransaction({status:'confirming',wallet:who,signature});const result=await confirmByPolling(conn,{signature,lastValidBlockHeight:block.value.lastValidBlockHeight});if(result.value.err){rememberPending(undefined,who);knownFailure=true;throw new Error(`Transaction failed on Solana: ${jsonBig(result.value.err)}.`);}if(Number.isSafeInteger(result.context?.slot))minimumAccountSlot=Math.max(minimumAccountSlot,result.context.slot);rememberPending(undefined,who);onTransaction({status:'confirmed',wallet:who,signature});return signature;}
    catch(error){if(knownFailure)throw error;try{await resolvePending(pending,who);}catch{throw new PendingTransactionError(signature);}const status=(await conn.getSignatureStatuses([signature],{searchTransactionHistory:true})).value[0];if(status&&!status.err&&(status.confirmationStatus==='confirmed'||status.confirmationStatus==='finalized'))return signature;throw new Error(`Transaction ${signature} was not confirmed. Check its status before trying again.`);}
  }
  async function action({action:kind,count=1,mode='whale',referral,maxCostLamports,expectedRound,roundId}={}){
    if(busy)throw new Error('A wallet transaction is already in progress.');if(!wallet)throw new Error('Connect your Solana wallet first.');busy=true;activeActionWallet=wallet;const signatures=[];
    try{
      const raw=await getState(),{game,round}=raw;
      if(kind==='feed'){
        if(!Number.isSafeInteger(count)||count<1||count>10_000)throw new Error('Feed size must be 1–10,000 whole keys.');
        if(round.ended||BigInt(raw.chainNow)>=round.end_time)throw new Error('This round has ended. Settle Piggy before starting another round.');
        if(expectedRound===undefined||BigInt(expectedRound)!==game.round_id||maxCostLamports===undefined)throw new Error('A displayed maximum cost and round are required.');
        const quote=costForExactKeys(round.accum_sol_pot,BigInt(count));if(!quote.ok)throw new Error(quote.error);
        const amount=quote.lamports;if(amount>BigInt(maxCostLamports))throw new Error('The price changed. Review the refreshed cost and try again.');
        const before=raw.players[0].playerRound,remaining=1_000_000_000n-(before?.accum_sol_added||0n);if(round.accum_sol_pot<100_000_000_000n&&amount>remaining)throw new Error('This feed exceeds the original 1 SOL early-round wallet limit.');
        const affiliate=referral?sdk.pk(referral):before?.last_affiliate_pk!==ZERO?before?.last_affiliate_pk:undefined;if(affiliate&&sdk.pk(affiliate).equals(walletKey()))throw new Error('Your wallet cannot refer itself.');
        const temp=await temporaryWsol(amount),expiry=BigInt(await conn.getSlot(COMMITMENT))+120n;
        const ix=sdk.guardedPurchaseInstruction({programId:program,buyer:walletKey(),version,roundId:game.round_id,source:temp.pair.publicKey,amount,mode,referral:affiliate,minimumKeys:BigInt(count),expiresAtSlot:expiry});
        const playerRent=before?0:await conn.getMinimumBalanceForRentExemption(233,COMMITMENT);
        signatures.push(await send([...temp.before,ix,...temp.after],{signers:[temp.pair],debit:amount,rent:temp.rent,extraRent:playerRent,revalidate:async()=>{if(BigInt(await conn.getSlot(COMMITMENT))>expiry)throw new Error('This feed quote expired during wallet approval. Refresh and try again.');}}));
      }else if(kind==='claimGame'){
        for(const row of raw.players[0].playerRounds){const amount=sdk.claimableGame(row.player,row.round).total;if(roundId&&BigInt(roundId)!==row.player.round_id||amount<=0n)continue;const temp=await temporaryWsol();signatures.push(await send([...temp.before,sdk.withdrawGameInstruction({programId:program,wallet:walletKey(),version,roundId:row.player.round_id,destination:temp.pair.publicKey}),...temp.after],{signers:[temp.pair],rent:temp.rent,claimAmount:amount}));}
        if(!signatures.length)throw new Error('No game SOL is available to claim.');
      }else if(kind==='claimHolder'){
        const rewards=raw.players[0].holder;if(rewards.unavailable)throw new Error(proofWarning||'Holder proofs are unavailable. Try again later.');
        for(const entry of rewards.records){const temp=await temporaryWsol(),receiptRent=await conn.getMinimumBalanceForRentExemption(81,COMMITMENT);signatures.push(await send([...temp.before,sdk.claimHolderInstruction({programId:program,wallet:walletKey(),version,epoch:entry.epoch,amount:entry.amount,proof:entry.proof,destination:temp.pair.publicKey}),...temp.after],{signers:[temp.pair],rent:temp.rent,extraRent:receiptRent,claimAmount:entry.amount}));}
        if(!signatures.length)throw new Error('No published holder rewards are available to claim.');
      }else if(kind==='endRound'){
        if(round.ended)throw new Error('This round is already settled.');if(BigInt(raw.chainNow)<round.end_time)throw new Error('Piggy can only settle after its countdown reaches zero.');
        signatures.push(await send([sdk.endRoundInstruction({programId:program,version,roundId:game.round_id,winner:round.lead_player_pk===ZERO?undefined:round.lead_player_pk})]));
      }else if(kind==='startRound'){
        if(!round.ended)throw new Error('Settle the current round before opening another.');
        const rent=await conn.getMinimumBalanceForRentExemption(403,COMMITMENT)+await conn.getMinimumBalanceForRentExemption(165,COMMITMENT);
        signatures.push(await send([sdk.initializeRoundInstruction({programId:program,payer:walletKey(),version,roundId:game.round_id+1n})],{extraRent:rent}));
      }else throw new Error('This action is unavailable in the public wallet client.');
      return{ok:true,wallet:activeActionWallet,signature:signatures.at(-1),signatures,state:await getState()};
    }catch(error){if(signatures.length)return{ok:true,wallet:activeActionWallet,signature:signatures.at(-1),signatures,warning:`${signatures.length} transaction(s) confirmed. ${error.message} Remaining claims can be retried after checking Wallet.`};if(unresolved)error.signature||=unresolved.signature;throw error;}finally{busy=false;activeActionWallet=undefined;}
  }
  return{config,mode:'public',get connected(){return!!wallet;},get wallet(){return wallet||null;},get walletName(){return provider?.name||null;},get walletId(){return provider?.id||null;},get pendingSignature(){return unresolved?.signature||null;},getState,getViewState:getState,getStatus:identity,connect,disconnect,availableWallets:()=>connector.list(),subscribeWallets:callback=>connector.subscribe(callback),refreshWallets:()=>connector.refresh(),dispose:()=>{unsubscribeConnector();clearConnection();connector.dispose();},action,
    feed:parameters=>action({action:'feed',...parameters}),claimGame:parameters=>action({action:'claimGame',...parameters}),claimHolder:parameters=>action({action:'claimHolder',...parameters}),endRound:()=>action({action:'endRound'}),startRound:()=>action({action:'startRound'})};
}
