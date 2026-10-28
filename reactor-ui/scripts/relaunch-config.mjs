/** Pure, non-signing configuration builder for the new PIGGY deployment. */
import path from 'node:path';
import {PublicKey} from '@solana/web3.js';
import * as sdk from '../src/solana-instructions.mjs';
import {CLUSTER_GENESIS} from '../src/solana-config.mjs';
export const RELAUNCH={programId:'BVqivL3X8JvuaNgiVAZb9WitRnT2LYGPLvdm3tD8a6Ph',gameVersion:'1',programData:'9ZFD4RMsiidwceQPBuDaxiqeXRpNaSk2fmRAoy5uJpkJ',binarySha256:'7862ecd936cef7faaade05a834aca76065a37f8ad107fef3767f449bd653eb65',binaryBytes:267648,authorities:{gameCreator:'5rMH86vPLuC6HzuaiiPRqA7qc8nwJ3w3RF5PyoJKwVkW',communityTreasury:'GsNnut7bZLFh3CBMvg5RAzV4U71MADgx2qF4TSDMuEQK',holderPublisher:'4pXeGfHBiUmcAyW3TwvJZK9PmaXxRsqST6hFspFbfQEa',upgradeAuthority:'T91QQBy8BogXTkdoMzSrecpcTvghp3TmQL2zWNQKswj'},keeper:'AKgknx81B2YCYu5gJm9z23aBdFjdeRBkJTWs2DLHLEYP'};
export const RETIRED_MINT='BwnmfvgEhAFboL8YW6CFoBUSH4QHriA9qBcAVPc71jRA';
export function relaunchConfigs({mint,rpcUrl,root,enabled=false,origin='https://piggy.casa'}){
 const key=new PublicKey(mint);if(!PublicKey.isOnCurve(key)||key.equals(PublicKey.default)||mint===RETIRED_MINT||mint===RELAUNCH.programId)throw Error('Supply the new token mint; retired mint and placeholders are forbidden.');
 const rpc=new URL(rpcUrl);if(rpc.protocol!=='https:'||rpc.username||rpc.password||rpc.hash)throw Error('Explicit HTTPS RPC required.');
 if(!path.isAbsolute(root))throw Error('Absolute private operator root required.');
 const base={schemaVersion:1,cluster:'mainnet-beta',genesisHash:CLUSTER_GENESIS['mainnet-beta'],programId:RELAUNCH.programId,gameVersion:RELAUNCH.gameVersion,piggyMint:key.toBase58(),expectedAuthorities:RELAUNCH.authorities,priorityFeeMicroLamports:0,mainnetEnabled:enabled,purchaseGuardVersion:1,streamflowLocks:true};
 const publicConfig={...base,rpcUrl:origin+'/rpc',proofIndexUrl:origin+'/launch-proofs/index.json'};
 const common={...base,rpcUrl:rpc.href,programBinarySha256:RELAUNCH.binarySha256,programBinaryBytes:RELAUNCH.binaryBytes};
 return{publicConfig,publisher:{...common,publisherKeypair:path.join(root,'keys/holder-publisher.json'),workspace:path.join(root,'publisher-state'),proofOutput:path.join(root,'public/proofs'),epochSeconds:3600,minPublishLamports:'10000000',excludedWallets:[]},keeper:{...common,keeperPublicKey:RELAUNCH.keeper,keeperKeypair:path.join(root,'keys/keeper.json'),workspace:path.join(root,'keeper-state'),publisherStateFile:path.join(root,'publisher-state/state.json'),pollSeconds:2,celebrationSeconds:8,maxFeeLamportsPerTransaction:100000,maxDailyFeeLamports:500000,maxDailyRentLamports:120000000,minBalanceLamports:1000000,settleOnly:false}};
}
export function rebindLaunchText(text,config){return text.replaceAll('3c5jUPmmXR3zV47uGW4YjSeSQhHKk2H6yj5U5JcfvbfK',config.programId).replaceAll(RETIRED_MINT,config.piggyMint).replaceAll('1793155991891',config.gameVersion).replaceAll('GXX38mLVdj2i2H3s5z5yvpkaZHpRQt1ZorrgsfeFKT5g',sdk.gameAddress(config.programId,config.gameVersion).toBase58()).replaceAll('AaD3ws5nVeUntDpmciiqx5NxYQKpN6idm59j6SJ7SZdX',config.expectedAuthorities.upgradeAuthority).replaceAll('href="/proofs/index.json"','href="/launch-proofs/index.json"');}
