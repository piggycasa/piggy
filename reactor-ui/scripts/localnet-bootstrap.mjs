import { makeContext, getRawState } from './localnet-runtime.mjs';
const ctx=await makeContext({persist:true});const state=await getRawState(ctx);
console.log(JSON.stringify({ok:true,network:state.network,programId:state.programId,piggyMint:state.piggyMint,version:state.version,round:state.round.round_id.toString()}));
