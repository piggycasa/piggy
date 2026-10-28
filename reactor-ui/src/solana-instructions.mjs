/** Borsh codec and instructions for the hardened V2 fork of ilmoi/solana_fomo3d. */
import { Buffer } from 'buffer';
import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY, TransactionInstruction } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, NATIVE_MINT } from '@solana/spl-token';
export { PublicKey, TOKEN_PROGRAM_ID, NATIVE_MINT };
export const REWARD_SCALE = 1_000_000_000_000_000_000n;
export const TEAMS = Object.freeze({ whale: 0, bear: 1, snek: 2, bull: 3 });
export const pk = value => value instanceof PublicKey ? value : new PublicKey(value);
export const key = (pubkey, isWritable = false, isSigner = false) => ({ pubkey: pk(pubkey), isWritable, isSigner });
export function uint(value, bytes = 8) {
  let n = BigInt(value); if (n < 0n || n >= 1n << BigInt(bytes * 8)) throw new RangeError(`Invalid u${bytes * 8}`);
  const output = Buffer.alloc(bytes); for (let i = 0; i < bytes; i++) { output[i] = Number(n & 255n); n >>= 8n; } return output;
}
export function u64(value) { return uint(value, 8); }
export function u128(value) { return uint(value, 16); }
function i64(value) { return uint(BigInt.asUintN(64, BigInt(value)), 8); }
function ix(programId, keys, ...data) { return new TransactionInstruction({ programId: pk(programId), keys, data: Buffer.concat(data) }); }
function address(programId, ...seeds) { return PublicKey.findProgramAddressSync(seeds.map(seed => Buffer.from(seed)), pk(programId))[0]; }
export function gameAddress(programId, version) { return address(programId, Buffer.from('game-v2'), u64(version)); }
export function roundAddress(programId, round, version) { return address(programId, Buffer.from('round-v2'), u64(round), u64(version)); }
export function potAddress(programId, round, version) { return address(programId, Buffer.from('pot-v2'), u64(round), u64(version)); }
export function playerAddress(programId, wallet, round, version) { return address(programId, Buffer.from('player-v2'), pk(wallet).toBytes(), u64(round), u64(version)); }
export function holderConfigAddress(programId, game) { return address(programId, Buffer.from('holder-config'), pk(game).toBytes()); }
export function holderVaultAddress(programId, game) { return address(programId, Buffer.from('holder-vault'), pk(game).toBytes()); }
export function holderEpochAddress(programId, config, epoch) { return address(programId, Buffer.from('holder-epoch'), pk(config).toBytes(), u64(epoch)); }
export function holderReceiptAddress(programId, epochAccount, wallet) { return address(programId, Buffer.from('holder-claim'), pk(epochAccount).toBytes(), pk(wallet).toBytes()); }

export function initializeGameInstruction({ programId, creator, version, communityWallet, p3dWallet, mint = NATIVE_MINT, initialSeconds = 3600, incrementSeconds = 30, maxSeconds = 86400 }) {
  return ix(programId, [key(creator,true,true),key(gameAddress(programId,version),true),key(communityWallet),key(p3dWallet),key(mint),key(SystemProgram.programId)], Buffer.from([0]),u64(version),i64(initialSeconds),i64(incrementSeconds),i64(maxSeconds));
}
export function initializeRoundInstruction({ programId, payer, version, roundId, mint = NATIVE_MINT }) {
  const keys = [key(payer,true,true),key(gameAddress(programId,version),true),key(roundAddress(programId,roundId,version),true),key(potAddress(programId,roundId,version),true),key(mint),key(SYSVAR_RENT_PUBKEY),key(SystemProgram.programId),key(TOKEN_PROGRAM_ID)];
  if (BigInt(roundId)>1n) keys.push(key(roundAddress(programId,BigInt(roundId)-1n,version),true),key(potAddress(programId,BigInt(roundId)-1n,version),true));
  return ix(programId,keys,Buffer.from([1]));
}
export function purchaseInstruction({ programId, buyer, version, roundId, source, amount, mode = 'whale', referral }) {
  const team = typeof mode === 'number' ? mode : TEAMS[mode]; if (!Number.isInteger(team) || team < 0 || team > 3) throw new RangeError('Choose one of the four payout modes.');
  const keys = [key(buyer,true,true),key(gameAddress(programId,version)),key(roundAddress(programId,roundId,version),true),key(playerAddress(programId,buyer,roundId,version),true),key(potAddress(programId,roundId,version),true),key(source,true),key(SystemProgram.programId),key(TOKEN_PROGRAM_ID)];
  if (referral) keys.push(key(playerAddress(programId,referral,roundId,version),true),key(referral));
  return ix(programId,keys,Buffer.from([2]),u128(amount),Buffer.from([team]));
}
/** Public purchases enforce the displayed maximum debit, minimum keys and expiry
 * inside the same transaction that moves SOL. Legacy tag 2 is local/test only. */
export function guardedPurchaseInstruction({ minimumKeys, expiresAtSlot, ...options }) {
  if (BigInt(minimumKeys) < 1n) throw new RangeError('A guarded purchase requires at least one key.');
  const legacy = purchaseInstruction(options);
  legacy.data = Buffer.concat([Buffer.from([11]), u128(options.amount), legacy.data.subarray(17,18), u128(minimumKeys), u64(options.roundId), u64(expiresAtSlot)]);
  return legacy;
}
export function withdrawGameInstruction({ programId, wallet, version, roundId, destination }) {
  return ix(programId,[key(wallet,true,true),key(gameAddress(programId,version)),key(roundAddress(programId,roundId,version)),key(playerAddress(programId,wallet,roundId,version),true),key(potAddress(programId,roundId,version),true),key(destination,true),key(SystemProgram.programId),key(TOKEN_PROGRAM_ID)],Buffer.from([3]),u64(roundId));
}
export function endRoundInstruction({ programId, version, roundId, winner }) {
  const keys=[key(gameAddress(programId,version)),key(roundAddress(programId,roundId,version),true)];
  if(winner) keys.push(key(playerAddress(programId,winner,roundId,version),true));
  return ix(programId,keys,Buffer.from([4]));
}
export function withdrawCommunityInstruction({ programId, version, roundId, destination, authority }) {
  return ix(programId,[key(gameAddress(programId,version)),key(roundAddress(programId,roundId,version),true),key(potAddress(programId,roundId,version),true),key(destination,true),key(authority,false,true),key(TOKEN_PROGRAM_ID)],Buffer.from([5]),u64(roundId));
}
export function fundHolderVaultInstruction({ programId, version, roundId }) {
  const game=gameAddress(programId,version);
  return ix(programId,[key(game),key(roundAddress(programId,roundId,version),true),key(potAddress(programId,roundId,version),true),key(holderVaultAddress(programId,game),true),key(holderConfigAddress(programId,game)),key(TOKEN_PROGRAM_ID)],Buffer.from([6]),u64(roundId));
}
export function initializeHolderInstruction({ programId, creator, version, eligibilityMint, publisher, paymentMint = NATIVE_MINT }) {
  const game=gameAddress(programId,version);
  return ix(programId,[key(creator,true,true),key(game,true),key(holderConfigAddress(programId,game),true),key(holderVaultAddress(programId,game),true),key(paymentMint),key(eligibilityMint),key(TOKEN_PROGRAM_ID),key(SystemProgram.programId),key(SYSVAR_RENT_PUBKEY)],Buffer.from([7]),pk(publisher).toBuffer());
}
export function publishHolderEpochInstruction({ programId, publisher, version, epoch, root, totalAmount, snapshotSlot }) {
  const game=gameAddress(programId,version),config=holderConfigAddress(programId,game);
  if(root.length!==32) throw new RangeError('Merkle root must have 32 bytes.');
  return ix(programId,[key(publisher,true,true),key(game),key(config,true),key(holderEpochAddress(programId,config,epoch),true),key(holderVaultAddress(programId,game)),key(SystemProgram.programId)],Buffer.from([8]),u64(epoch),Buffer.from(root),u64(totalAmount),u64(snapshotSlot));
}
export function claimHolderInstruction({ programId, wallet, version, epoch, amount, proof = [], destination }) {
  const game=gameAddress(programId,version),config=holderConfigAddress(programId,game),epochAccount=holderEpochAddress(programId,config,epoch);
  if(proof.length>32 || proof.some(p=>p.length!==32)) throw new RangeError('Invalid Merkle proof.');
  return ix(programId,[key(wallet,true,true),key(game),key(config,true),key(epochAccount,true),key(holderVaultAddress(programId,game),true),key(destination,true),key(holderReceiptAddress(programId,epochAccount,wallet),true),key(TOKEN_PROGRAM_ID),key(SystemProgram.programId)],Buffer.from([9]),u64(epoch),u64(amount),uint(proof.length,4),...proof.map(p=>Buffer.from(p)));
}
export function setHolderPublisherInstruction({ programId, creator, version, publisher }) {
  const game=gameAddress(programId,version); return ix(programId,[key(creator,false,true),key(game),key(holderConfigAddress(programId,game),true)],Buffer.from([10]),pk(publisher).toBuffer());
}

class Reader {
  constructor(data) { this.data=Buffer.from(data); this.at=0; }
  bytes(n) { if(this.at+n>this.data.length) throw new RangeError('Truncated on-chain account.'); const b=this.data.subarray(this.at,this.at+n);this.at+=n;return b; }
  uint(n=8) { const b=this.bytes(n);let value=0n;for(let i=b.length-1;i>=0;i--)value=value*256n+BigInt(b[i]);return value; }
  u8(){return Number(this.uint(1));} pubkey(){return new PublicKey(this.bytes(32)).toBase58();}
  tag(text){if(this.bytes(8).toString()!==text)throw new TypeError('Unexpected holder account discriminator.');}
}
export function decodeGame(data) {
  const r=new Reader(data),type=r.u8();if(type!==3)throw new TypeError('Expected V2 game account.');
  const out={type}; for(const n of ['round_id','round_init_time','round_inc_time_per_key','round_max_time','version'])out[n]=r.uint();
  for(const n of ['mint','game_creator','community_wallet','p3d_wallet'])out[n]=r.pubkey();return out;
}
export function decodeRound(data) {
  const r=new Reader(data),type=r.u8();if(type!==4)throw new TypeError('Expected V2 round account.');
  const out={type,round_id:r.uint(),lead_player_pk:r.pubkey(),lead_player_team:r.u8(),start_time:r.uint(),end_time:r.uint(),ended:!!r.u8(),accum_keys:r.uint(16),accum_sol_pot:r.uint(16),accum_sol_by_team:{}};
  for(const n of ['whale','bear','snek','bull'])out.accum_sol_by_team[n]=r.uint(16);
  for(const n of ['accum_community_share','accum_airdrop_share','accum_next_round_share','accum_aff_share','accum_p3d_share','accum_f3d_share','still_in_play','final_prize_share','withdrawn_com','withdrawn_next_round','withdrawn_p3d'])out[n]=r.uint(16);
  out.airdrop_tracker=r.uint(); for(const n of ['reward_per_key','reward_remainder','airdrop_awarded','accum_airdrop_carried'])out[n]=r.uint(16); return out;
}
export function decodePlayer(data) {
  const r=new Reader(data),type=r.u8();if(type!==5)throw new TypeError('Expected V2 player account.');
  const out={type,player_pk:r.pubkey(),round_id:r.uint(),last_affiliate_pk:r.pubkey()};
  for(const n of ['accum_keys','accum_sol_added','accum_winnings','accum_aff','withdrawn_winnings','withdrawn_aff','withdrawn_f3d','reward_index','reward_remainder','accum_f3d'])out[n]=r.uint(16);return out;
}
export function decodeHolderConfig(data){const r=new Reader(data);r.tag('PHCFG001');const o={};for(const n of ['game','publisher','eligibility_mint','payment_mint','vault'])o[n]=r.pubkey();for(const n of ['reserved_amount','next_epoch','total_published','total_claimed'])o[n]=r.uint();o.bump=r.u8();return o;}
export function decodeHolderEpoch(data){const r=new Reader(data);r.tag('PHEPO001');const o={config:r.pubkey(),game:r.pubkey(),epoch:r.uint(),snapshot_slot:r.uint(),merkle_root:r.bytes(32).toString('hex'),total_amount:r.uint(),claimed_amount:r.uint(),bump:r.u8()};return o;}
export function decodeHolderReceipt(data){const r=new Reader(data);r.tag('PHCLM001');return {epoch_account:r.pubkey(),wallet:r.pubkey(),amount:r.uint(),bump:r.u8()};}
export function claimableGame(player,round){if(!player)return {keys:0n,winnings:0n,affiliate:0n,total:0n,earned:0n};const numerator=player.accum_keys*(round.reward_per_key-player.reward_index)+player.reward_remainder;const earned=player.accum_f3d+numerator/REWARD_SCALE;const keys=earned-player.withdrawn_f3d,winnings=player.accum_winnings-player.withdrawn_winnings,affiliate=player.accum_aff-player.withdrawn_aff;return{keys,winnings,affiliate,total:keys+winnings+affiliate,earned};}
export const serializeChain = value => JSON.stringify(value,(_,v)=>typeof v==='bigint'?v.toString():v);
