const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/coin-simulation-BBrB85bH.js","assets/modulepreload-polyfill-B5Qt9EMX.js","assets/index.browser.esm-CUMt3pVM.js","assets/konterball-fonts-D0LP_Rd2.css","assets/solana-public-client-DO2kGNFr.js"])))=>i.map(i=>d[i]);
import"./modulepreload-polyfill-B5Qt9EMX.js";import{b as Mf,P as no}from"./index.browser.esm-CUMt3pVM.js";/* empty css                         */const bf="modulepreload",wf=function(i){return"/"+i},jc={},hc=function(e,t,n){let r=Promise.resolve();if(t&&t.length>0){let l=function(c){return Promise.all(c.map(u=>Promise.resolve(u).then(d=>({status:"fulfilled",value:d}),d=>({status:"rejected",reason:d}))))};document.getElementsByTagName("link");const o=document.querySelector("meta[property=csp-nonce]"),a=o?.nonce||o?.getAttribute("nonce");r=l(t.map(c=>{if(c=wf(c),c in jc)return;jc[c]=!0;const u=c.endsWith(".css"),d=u?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${c}"]${d}`))return;const h=document.createElement("link");if(h.rel=u?"stylesheet":bf,u||(h.as="script"),h.crossOrigin="",h.href=c,a&&h.setAttribute("nonce",a),document.head.appendChild(h),u)return new Promise((f,g)=>{h.addEventListener("load",f),h.addEventListener("error",()=>g(new Error(`Unable to preload CSS for ${c}`)))})}))}function s(o){const a=new Event("vite:preloadError",{cancelable:!0});if(a.payload=o,window.dispatchEvent(a),!a.defaultPrevented)throw o}return r.then(o=>{for(const a of o||[])a.status==="rejected"&&s(a.reason);return e().catch(s)})};globalThis.Buffer||(globalThis.Buffer=Mf.Buffer);const Ef="/test-claims/",Tf="/piggy-test-config.json";function Af(i){return i==="/test-claims"||i===Ef}function Cf(i,e){if(i&&e!=="claimGame"&&e!=="claimHolder")throw new Error("The test instance is closed to new entries here. Existing game and token-holder rewards can still be claimed.")}function Rf(){return{setCoins(){},deposit(){},setEnded(){},cancelPreview(){},previewPayout(){return!1},dispose(){}}}const fc=Object.freeze({initialSeconds:300,incrementSeconds:30,maxSeconds:600}),sl=10000000000000000000n,Lf=11313228509n,pc=(1n<<128n)-1n,Hd=10000000n,Vd=3125000n,Gd=562498828125610000000000n,Wd=749999218750n,Xd=1562500n;function Ji(i,e="AMOUNT_TOO_LARGE"){const t=new RangeError(i);return t.code=e,t}function Jo(i,e){if(typeof i!="bigint")throw new TypeError(`${e} must be a BigInt integer.`);if(i<0n)throw Ji(`${e} must not be negative.`,"INVALID_AMOUNT");if(i>pc)throw Ji(`${e} exceeds u128.`);return i}function kr(i,e){const t=i+e;if(t>pc)throw Ji("Curve addition exceeds u128.");return t}function Es(i,e){const t=i*e;if(t>pc)throw Ji("Curve multiplication exceeds u128.");return t}function qd(i,e){if(i<e)throw Ji("Curve subtraction underflows u128.","INVALID_AMOUNT");return i-e}function Pf(i){if(i===0n)return 0n;const e=i.toString(2).length-1&-2;let t=1n<<BigInt(e),n=i,r=0n;for(;t!==0n;){const s=kr(r,t);n>=s?(n-=s,r=kr(r>>1n,t)):r>>=1n,t>>=2n}return r}function fa(i){if(Jo(i,"totalLamports"),i===0n)return 0n;if(i>sl)throw Ji("Cumulative lamports exceed the original 10bn SOL curve limit.","CURVE_LIMIT");const e=kr(Es(Es(i,Hd),Vd),Gd);return qd(Pf(e),Wd)/Xd}function If(i){if(Jo(i,"totalKeys"),i>Lf)throw Ji("Total keys exceed the original pricing curve limit.","CURVE_LIMIT");const e=kr(Es(i,Xd),Wd);return qd(Es(e,e),Gd)/Es(Hd,Vd)}function Cr(i,e){Jo(i,"roundGrossLamports"),Jo(e,"keyCount");const t=fa(i);if(e===0n)return{ok:!0,lamports:0n,keys:0n};const n=sl-i,r=fa(sl)-t;if(e>r)return{ok:!1,code:"CURVE_LIMIT",error:"The requested keys exceed the original pricing curve limit.",maxKeys:r,maxLamports:n};const s=u=>fa(kr(i,u))-t,o=If(kr(t,e))-i;let a=0n,l=o>0n?o:1n;for(l>n&&(l=n);s(l)<e;)a=l,l=l*2n>n?n:l*2n;for(;a+1n<l;){const u=(a+l)/2n;s(u)>=e?l=u:a=u}const c=s(l);return c!==e?{ok:!1,code:"UNREACHABLE_KEY_COUNT",error:"That exact key amount is unavailable at integer-lamport precision.",minimumLamports:l,keysAtMinimum:c}:{ok:!0,lamports:l,keys:c}}const bi=1e9,mc=fc.incrementSeconds*1e3,Kd=fc.maxSeconds*1e3,$d=fc.initialSeconds*1e3,ol=1e4;function io(i,e,t,n,r,s,o,a){return Object.freeze({id:i,name:e,originalHolderBps:n,affiliateRedirectBps:1e3,entryBps:Object.freeze({pot:r,keyHolders:t,tokenHolders:n+1e3,community:200,rollover:100,airdrop:100}),closingBps:Object.freeze({winner:4800,community:200,keyHolders:s,tokenHolders:o,rollover:a})})}const Zi=Object.freeze({whale:io("whale","Whale",3e3,600,5e3,1500,1e3,2500),bear:io("bear","Bear",4300,0,4300,2500,0,2500),snek:io("snek","Snek",5600,1e3,2e3,2e3,2e3,1e3),bull:io("bull","Bull",4300,800,3500,3e3,1e3,1e3)}),St=(i,e)=>({ok:!1,code:i,error:e}),oa=i=>Number.isSafeInteger(i)&&i>=0,Nf=i=>typeof i=="string"&&Object.hasOwn(Zi,i);function Yd(i){if(!oa(i))throw new TypeError("Use a non-negative integer timestamp in milliseconds.")}function gc(i,e,t){const n={};let r=0;for(const[s,o]of Object.entries(e))n[s]=Number(BigInt(i)*BigInt(o)/10000n),r+=n[s];return n[t]+=i-r,n}function Df(i,e,t=!1){const n=Zi[e],r=gc(i,{...n.entryBps,tokenHolders:n.originalHolderBps,affiliate:n.affiliateRedirectBps},"pot");return t||(r.tokenHolders+=r.affiliate,delete r.affiliate),r}function Zo(i,e){const t=e.reduce((o,[,a])=>o+BigInt(a),0n);if(t===0n)return{};const n=e.map(([o,a],l)=>{const c=BigInt(i)*BigInt(a);return{id:o,order:l,value:Number(c/t),remainder:c%t}});let r=i-n.reduce((o,a)=>o+a.value,0);const s=[...n].sort((o,a)=>o.remainder===a.remainder?o.order-a.order:o.remainder>a.remainder?-1:1);for(const o of s){if(!r)break;o.value+=1,r-=1}return Object.fromEntries(n.map(({id:o,value:a})=>[o,a]))}function _c(i,e){return Object.values(i.players).filter(t=>t[e]>0).map(t=>[t.id,t[e]])}function js(i,e,t,n={}){i.activity.unshift({id:i.nextActivityId++,type:e,timestamp:t,roundId:i.round.id,...n}),i.activity.length=Math.min(i.activity.length,40)}function hs(i,e,t,n,r,s){return{id:i,name:e,handle:t,color:n,avatar:r,balance:s,keys:0,totalKeys:0,claimable:0,totalClaimed:0,keyRewardsEarned:0,jackpotRewardsEarned:0,tokenBalance:1e3,tokenClaimable:0,tokenRewardsEarned:0,tokenRewardsClaimed:0}}function jd(i,e,t=0){return{id:i,status:"active",startedAt:e,endsAt:e+$d,pot:t,openingRollover:t,finalPot:null,grossEntries:0,totalKeys:0,lastBuyerId:null,lastBuyerTeam:null,winnerId:null,playerRewardsAllocated:0,tokenRewardsAllocated:0,communityAllocated:0,rolloverAllocated:0,airdropAllocated:0,entryAllocations:{pot:0,keyHolders:0,tokenHolders:0,community:0,rollover:0,airdrop:0},keyRewardsByPlayer:{},tokenRewardsByPlayer:{},settledAt:null,settlement:null}}function vc(i,{seeded:e=!0}={}){Yd(i);const t={version:4,economyVersion:"solana-native-curve-lamports-1",localPlayerId:"you",config:{label:"EXPERIMENTAL",affiliatePolicy:"unassigned-to-token-holders",tokenEligibility:"held-balance-demo-snapshot",airdropPolicy:"reserve-only-no-draws"},players:{you:hs("you","You","@you","#e6ff6b","Y",500*bi),npc_fox:hs("npc_fox","Neon Fox","@neonfox","#ff8b57","F",2e3*bi),npc_orbit:hs("npc_orbit","Orbit","@orbit","#ad9bff","O",2e3*bi),npc_void:hs("npc_void","Void","@void","#65d8ec","V",2e3*bi),npc_koi:hs("npc_koi","Koi","@koi","#f297cc","K",2e3*bi)},communityReserve:0,rolloverReserve:0,airdropReserve:0,totalSupply:8500*bi,totalTokenSupply:5e3,round:jd(1,e?i-($d+147*mc-87e3):i),history:[],activity:[],nextActivityId:1,lastActionAt:i};for(const[n,r,s,o]of e?[["npc_koi",17,1e4,"snek"],["npc_void",29,1e5,"bear"],["npc_orbit",43,5e5,"bull"],["npc_fox",58,15e5,"whale"]]:[])Qd(t,n,Qi(t,r,n,o),t.round.startedAt+s,!0);return e&&(t.round.endsAt=i+87e3),t.lastActionAt=i,t}function Vn(i,e){return Yd(e),i.round.status==="active"?Math.max(0,i.round.endsAt-e):0}function Ci(i){return i.round.status==="settled"?i.round.settlement.winnerPrize:i.round.lastBuyerId?gc(i.round.pot,Zi[i.round.lastBuyerTeam].closingBps,"winner").winner:0}function Qi(i,e,t=i.localPlayerId,n="whale",r){if(!Number.isSafeInteger(e)||e<1||e>ol)return St("INVALID_COUNT",`Choose between 1 and ${ol.toLocaleString("en-US")} whole keys.`);if(!Object.hasOwn(i.players,t))return St("UNKNOWN_PLAYER","That player is not in this demo.");if(!Nf(n))return St("INVALID_MODE","Choose Whale, Bear, Snek or Bull.");if(i.round.status!=="active")return St("ROUND_SETTLED","This round has ended. Start the next round.");const s=i.round.openingRollover+i.round.grossEntries;if(!Number.isSafeInteger(s)||s<0)return St("AMOUNT_TOO_LARGE","Invalid cumulative funding.");let o,a,l,c;try{if(o=Cr(BigInt(s),BigInt(e)),!o.ok)return St(o.code,o.error);a=Cr(BigInt(s),1n),l=Cr(BigInt(s)+o.lamports,1n),c=Cr(BigInt(s),BigInt(e-1))}catch(M){return St(M.code||"AMOUNT_TOO_LARGE",M.message)}if(!a.ok||!l.ok||!c.ok)return St("CURVE_LIMIT","The requested feed reaches the original curve limit.");const u=Number(o.lamports),d=Number(l.lamports);if(!Number.isSafeInteger(u)||!Number.isSafeInteger(s+u)||!Number.isSafeInteger(d))return St("AMOUNT_TOO_LARGE","This purchase is too large for this preview.");if(i.economyVersion==="solana-program-v2"&&s<100*bi&&u+(i.players[t].roundContribution||0)>bi)return St("LAUNCH_LIMIT","The original launch limit is 1 SOL per wallet until round funding reaches 100 SOL. Choose a smaller feed.");const h=Df(u,n,!!(r||i.players[t].referral)),f=Object.values(i.players).map(M=>[M.id,M.keys+(M.id===t?e:0)]).filter(([,M])=>M>0),g=_c(i,"tokenBalance"),_=g.reduce((M,[,S])=>M+S,0),m=i.players[t].keys+e,p=i.round.totalKeys+e;return{ok:!0,count:e,cost:u,mode:n,curveFunding:s,pricePerKey:Number(a.lamports),lastKeyPrice:Number(o.lamports-c.lamports),nextPrice:d,extensionMs:e*(i.config?.extensionPerKeyMs??mc),breakdown:h,playerKeysAfter:m,totalKeysAfter:p,keyShareBefore:i.round.totalKeys?i.players[t].keys/i.round.totalKeys:0,keyShareAfter:m/p,tokenShare:_?i.players[t].tokenBalance/_:0,estimatedKeyReward:Zo(h.keyHolders,f)[t]||0,estimatedTokenReward:Zo(h.tokenHolders,g)[t]||0}}function Jd(i,e){const t=Zo(e,_c(i,"keys"));for(const[n,r]of Object.entries(t)){const s=i.players[n];s.claimable+=r,s.keyRewardsEarned+=r,i.round.keyRewardsByPlayer[n]=(i.round.keyRewardsByPlayer[n]||0)+r}return i.round.playerRewardsAllocated+=e,t}function Zd(i,e){const t=Zo(e,_c(i,"tokenBalance"));for(const[n,r]of Object.entries(t)){const s=i.players[n];s.tokenClaimable+=r,s.tokenRewardsEarned+=r,i.round.tokenRewardsByPlayer[n]=(i.round.tokenRewardsByPlayer[n]||0)+r}return i.round.tokenRewardsAllocated+=e,t}function Qd(i,e,t,n,r=!1){const{count:s,cost:o,breakdown:a}=t,l=i.players[e],c=i.round.endsAt;l.balance-=o,l.keys+=s,l.totalKeys+=s,i.round.totalKeys+=s,i.round.lastBuyerId=e,i.round.lastBuyerTeam=t.mode,i.round.endsAt=Math.min(c+t.extensionMs,n+Kd),i.round.grossEntries+=o,i.round.pot+=a.pot,Jd(i,a.keyHolders),Zd(i,a.tokenHolders),i.communityReserve+=a.community,i.rolloverReserve+=a.rollover,i.airdropReserve+=a.airdrop,i.round.communityAllocated+=a.community,i.round.rolloverAllocated+=a.rollover,i.round.airdropAllocated+=a.airdrop;for(const[u,d]of Object.entries(a))i.round.entryAllocations[u]+=d;return i.lastActionAt=n,js(i,"purchase",n,{playerId:e,count:s,cost:o,mode:t.mode,breakdown:{...a},extensionMs:i.round.endsAt-c,seeded:r}),{...t,playerId:e,endsAt:i.round.endsAt,actualExtensionMs:i.round.endsAt-c}}function Uf(i,e,t){return oa(t)?t<i.lastActionAt?St("STALE_TIME","The demo clock cannot move backwards."):Object.hasOwn(i.players,e)?null:St("UNKNOWN_PLAYER","That player is not in this demo."):St("INVALID_TIME","The demo clock is invalid.")}function eh(i,e,t,n,r="whale"){const s=Uf(i,e,n);if(s)return s;const o=Qi(i,t,e,r);return o.ok?n>=i.round.endsAt?St("ROUND_EXPIRED","The countdown has ended. Settle this round first."):i.players[e].balance<o.cost?St("INSUFFICIENT_BALANCE","Not enough demo SOL for those keys."):Qd(i,e,o,n):o}function Of(i,e){if(!oa(e))return St("INVALID_TIME","The demo clock is invalid.");if(e<i.lastActionAt)return St("STALE_TIME","The demo clock cannot move backwards.");if(i.round.status!=="active")return St("ROUND_SETTLED","This round has already been settled.");if(e<i.round.endsAt)return St("ROUND_ACTIVE","The countdown is still running.");const t=i.round.pot,n=i.round.lastBuyerId,r=i.round.lastBuyerTeam,s=n?gc(t,Zi[r].closingBps,"winner"):{winner:0,community:0,keyHolders:0,tokenHolders:0,rollover:t},o=n?Jd(i,s.keyHolders):{},a=n?Zd(i,s.tokenHolders):{},l={...o};n&&(i.players[n].claimable+=s.winner,i.players[n].jackpotRewardsEarned+=s.winner,l[n]=(l[n]||0)+s.winner),i.communityReserve+=s.community,i.rolloverReserve+=s.rollover,i.round.communityAllocated+=s.community,i.round.rolloverAllocated+=s.rollover;const c={roundId:i.round.id,winnerId:n,mode:r,pot:t,winnerPrize:s.winner,grossEntries:i.round.grossEntries,openingRollover:i.round.openingRollover,closingAllocations:{...s},entryAllocations:{...i.round.entryAllocations},holderPool:s.keyHolders,holderPayouts:o,tokenPayouts:a,payouts:l,treasuryAmount:s.community,rolloverAmount:s.rollover,playerRewardsAllocated:i.round.playerRewardsAllocated,tokenRewardsAllocated:i.round.tokenRewardsAllocated,keyRewardsByPlayer:{...i.round.keyRewardsByPlayer},tokenRewardsByPlayer:{...i.round.tokenRewardsByPlayer},totalKeys:i.round.totalKeys,settledAt:e,keysByPlayer:Object.fromEntries(Object.values(i.players).map(u=>[u.id,u.keys]))};return Object.assign(i.round,{status:"settled",winnerId:n,settledAt:e,finalPot:t,pot:0,settlement:c}),i.lastActionAt=e,i.history.unshift(JSON.parse(JSON.stringify(c))),js(i,"settlement",e,{winnerId:n,mode:r,pot:t,winnerPrize:s.winner}),{ok:!0,...c}}function Ff(i,e){if(!Object.hasOwn(i.players,e))return St("UNKNOWN_PLAYER","That player is not in this demo.");const t=i.players[e];if(!t.claimable)return St("NOTHING_TO_CLAIM","No game rewards to claim yet.");const n=t.claimable;return t.claimable=0,t.balance+=n,t.totalClaimed+=n,js(i,"claim",i.lastActionAt,{playerId:e,amount:n}),{ok:!0,playerId:e,amount:n}}function kf(i,e){if(!Object.hasOwn(i.players,e))return St("UNKNOWN_PLAYER","That player is not in this demo.");const t=i.players[e];if(!t.tokenClaimable)return St("NOTHING_TO_CLAIM","No token-holder rewards to claim yet.");const n=t.tokenClaimable;return t.tokenClaimable=0,t.balance+=n,t.tokenRewardsClaimed+=n,js(i,"token-claim",i.lastActionAt,{playerId:e,amount:n}),{ok:!0,playerId:e,amount:n}}function Bf(i,e){if(!oa(e))return St("INVALID_TIME","The demo clock is invalid.");if(e<i.lastActionAt)return St("STALE_TIME","The demo clock cannot move backwards.");if(i.round.status!=="settled")return St("ROUND_ACTIVE","Settle this round before starting another.");const t=i.rolloverReserve;i.rolloverReserve=0,i.round=jd(i.round.id+1,e,t);for(const n of Object.values(i.players))n.keys=0;return i.lastActionAt=e,js(i,"new-round",e,{openingRollover:t}),{ok:!0,roundId:i.round.id,endsAt:i.round.endsAt,openingRollover:t}}const Rr=i=>Number.isSafeInteger(i)&&i>=0,ro=i=>Rr(i)?i:0,al=i=>Number.isFinite(i)&&i>=0&&i<=1?i:0,th=i=>Number.isSafeInteger(i)&&i>0?i:null;function nh(i,e){const t=i?.players;return t&&typeof t=="object"&&Object.hasOwn(t,e)?t[e]:void 0}function Ii(i,e="you"){const t=nh(i,e),n=ro(t?.keys),r=ro(i?.round?.totalKeys);return{roundId:t?th(i?.round?.id):null,keys:n,totalKeys:r,keyEarned:ro(t?.keyRewardsEarned),tokenEarned:ro(t?.tokenRewardsEarned),share:r>0?al(n/r):0}}function Jc(i){return i&&th(i.roundId)!==null&&["keys","totalKeys","keyEarned","tokenEarned"].every(e=>Rr(i[e]))&&i.keys<=i.totalKeys}function xc(i,e){const t=al(i?.share),n=al(e?.share),r=!Jc(i)||!Jc(e)||i.roundId!==e.roundId||["keys","totalKeys","keyEarned","tokenEarned"].some(s=>e[s]<i[s]);return{keyDelta:r?0:e.keyEarned-i.keyEarned,tokenDelta:r?0:e.tokenEarned-i.tokenEarned,shareBefore:t,shareAfter:n}}function ih(i,e,t="you"){const n=Ii(i,t),r={currentShare:n.share,afterShare:n.share,gainedShare:0,afterKeys:n.keys,valid:!1},s=nh(i,t);if(!s||i?.round?.status!=="active"||!Number.isSafeInteger(e)||e<1||e>ol||!Rr(s.keys)||!Rr(i.round.totalKeys)||s.keys>i.round.totalKeys||n.roundId===null)return r;const o=s.keys+e,a=i.round.totalKeys+e;if(!Rr(o)||!Rr(a))return r;const l=o/a;return{currentShare:n.share,afterShare:l,gainedShare:Math.max(0,l-n.share),afterKeys:o,valid:!0}}const Jn=(i,e)=>({ok:!1,code:i,error:e}),Ar=i=>Number.isSafeInteger(i)&&i>=0;function Mi(i,e){if(typeof i=="bigint"&&i>=0n)return i;if(Ar(i))return BigInt(i);throw new TypeError(`${e} must be nonnegative integer lamports.`)}function Zc(i){const e=Mi(i,"Display amount");if(e>BigInt(Number.MAX_SAFE_INTEGER))throw new RangeError("Preview amount exceeds the exact display range.");return Number(e)}function zf({state:i,count:e,mode:t="whale",quote:n,costs:r,now:s=i?.lastActionAt}={}){try{const o=i?.round;if(!o||!i?.players?.you||!Ar(s)||!Ar(o.endsAt))return Jn("INVALID_STATE","A confirmed round, wallet position and clock are required.");if(!Object.hasOwn(Zi,t))return Jn("INVALID_MODE","Choose a supported payout mode.");if(o.status!=="active"||o.endsAt<=s)return Jn("ROUND_ENDED","This round has ended.");const a=ih(i,e,"you");if(!a.valid)return Jn("INVALID_COUNT","Choose a valid whole-key quantity.");const l=n===void 0?Qi(i,e,"you",t):n;if(!l||l.ok!==!0)return Jn(l?.code||"QUOTE_UNAVAILABLE",l?.error||"A valid current purchase quote is required.");if(l.count!==e||l.mode!==t)return Jn("QUOTE_MISMATCH","The quote does not match the selected keys and mode.");const c=Mi(l.cost,"Entry cost"),u=Mi(l.breakdown?.keyHolders,"Key allocation"),d=Mi(l.breakdown?.pot,"Pot allocation");if(c===0n||u+d>c)return Jn("INVALID_QUOTE","The quote contains inconsistent allocations.");const h=Mi(o.pot,"Round pot"),f=Mi(o.openingRollover,"Opening funding"),g=f+Mi(o.grossEntries,"Round entries"),_=ae=>{const ye=Cr(ae,1n);if(!ye.ok)throw new RangeError(ye.error||"The next key exceeds the pricing curve range.");return ye.lamports},m=_(g),p=_(g+c),M=_(f),S=h+d,x=a.afterKeys,A=o.totalKeys+e,C=u*BigInt(x)/BigInt(A),R=Zi[t].closingBps;let N=0n;for(const ae of["community","keyHolders","tokenHolders","rollover"])N+=S*BigInt(R[ae])/10000n;const w=S-N,y=i.config?.extensionPerKeyMs??mc,L=i.config?.maxRemainingMs??Kd;if(!Ar(y)||y===0||!Ar(L)||L===0||!Ar(e*y))return Jn("INVALID_TIME","The round timing configuration is invalid.");const k=Math.min(L,o.endsAt-s),W=Math.min(e*y,L-k),X=k+W,q=r?.entry,z=(ae,ye)=>q?.[ae]==null?null:Mi(q[ae],ye),oe=z("networkFees","Network fee"),V=z("accountRent","Account setup"),pe=z("refundableRent","Temporary rent"),K=[oe,V,pe].every(ae=>ae!==null),ne=oe!==null&&V!==null?c+oe+V:null,ce=K?ne+pe:null;return{ok:!0,estimated:!0,keysReceived:e,count:e,mode:t,ownedKeysAfter:x,totalKeysAfter:A,keyShareBefore:a.currentShare,keyShareAfter:a.afterShare,currentRemainingMs:k,timeAddedMs:W,resultingRemainingMs:X,entryCostLamports:c,keyRewardPoolLamports:u,ownRebateEstimateLamports:C,nextKeyPriceBeforeLamports:m,nextKeyPriceAfterLamports:p,roundOpeningKeyPriceLamports:M,projectedPotLamports:S,projectedWinnerPrizeLamports:w,costsKnown:K,networkFeeLamports:oe,accountRentLamports:V,refundableRentLamports:pe,nonRefundableDebitLamports:ne,walletBalanceRequiredLamports:ce}}catch(o){return Jn("INVALID_PREVIEW",o.message)}}const rh=3e5,Hf=i=>{const e=i/100n,t=String(i%100n).padStart(2,"0");return`$${e.toLocaleString("en-US")}.${t}`},Vf=(i,e)=>{let t=2,n=100n;for(;i*n<e;)t++,n*=10n;t++,n*=10n;const r=(i*n+e/2n)/e;return`$${r/n}.${String(r%n).padStart(t,"0")}`};function Gf(i,e=Date.now()){if(i?.schemaVersion!==1||i.base!=="SOL"||i.quote!=="USD"||typeof i.price!="string"||!/^\d{1,6}(?:\.\d{1,8})?$/.test(i.price)||!Number.isSafeInteger(i.asOf)||i.asOf>e+1e4||e-i.asOf>rh)return null;const[t,n=""]=i.price.split("."),r=BigInt(t)*100000000n+BigInt(n.padEnd(8,"0"));return r<=0n||r>=1000000n*100000000n?null:{priceUnits:r,asOf:i.asOf,source:"Coinbase"}}function sh(i,e){if(i==null||!e||typeof i=="number"&&(!Number.isSafeInteger(i)||i<0)||typeof i!="number"&&typeof i!="bigint")return null;const t=BigInt(i);if(t<0n)return null;const n=t*e.priceUnits,r=1000000000n*100000000n;if(n>0n&&n*100n<r)return`≈ ${Vf(n,r)}`;const s=(n*100n+r/2n)/r;return`≈ ${Hf(s)}`}function Wf(i,e){const t=sh(i,e);if(!t)return null;const n=BigInt(i)*e.priceUnits,r=1000000000n*100000000n;for(const[s,o]of[[1000000000000n,"T"],[1000000000n,"B"],[1000000n,"M"],[1000n,"K"]]){if(n<r*s)continue;const a=(n*100n+r*s/2n)/(r*s),l=String(a%100n).padStart(2,"0").replace(/0+$/,"");return`≈ $${a/100n}${l?"."+l:""}${o}`}return t}function Xf({enabled:i=!0,elements:e={},fetch:t=globalThis.fetch,now:n=Date.now,setInterval:r=globalThis.setInterval,clearInterval:s=globalThis.clearInterval}={}){let o=null,a={},l=!1,c=!1;function u(){const f=o&&n()-o.asOf<=rh?o:null;for(const[g,_]of Object.entries(e)){if(!_)continue;const m=sh(a[g],f),p=_.dataset?.usdCompact==="true"?Wf(a[g],f):m;_.hidden=!p,_.textContent=p||"",_.title=p?`${m}. Approximate USD from a Coinbase SOL/USD quote at ${new Date(f.asOf).toLocaleTimeString()}. All payments and rewards use SOL.`:"",_.dataset&&(_.dataset.moneyState=p?"available":a[g]===null||a[g]===void 0?"unknown":"unavailable");const M=_.closest?.(".money-pair");M?.dataset&&(M.dataset.usdAvailable=String(!!p))}}async function d(){if(!c&&(u(),!(!i||l))){l=!0;try{const f=await t("/api/sol-price",{credentials:"omit",cache:"no-store",redirect:"error",signal:globalThis.AbortSignal?.timeout?.(5e3)});if(!f.ok)throw new Error("Price unavailable");o=Gf(await f.json(),n())}catch{}finally{l=!1,c||u()}}}u(),i&&d();const h=i?r(()=>{globalThis.document?.hidden?u():d()},6e4):null;return h?.unref?.(),{setAmounts(f){a={...f},u()},refresh:d,dispose(){c=!0,h!==null&&s(h)}}}function qf({dialog:i,openDialog:e,onConnect:t,formatSol:n}){const r=h=>i.querySelector(h),s={game:r("#claim-tab-game"),holder:r("#claim-tab-holder")},o={game:r("#claim-panel-game"),holder:r("#claim-panel-holder")};let a="game",l;const c=(h,f)=>{const g=r(h);g.textContent!==f&&(g.textContent=f)};function u(h,f=!1){if(s[h]){a=h;for(const g of Object.keys(s))s[g].setAttribute("aria-selected",String(g===h)),s[g].tabIndex=g===h?0:-1,o[g].hidden=g!==h;f&&s[h].focus(),l&&d(l)}}Object.entries(s).forEach(([h,f])=>{f.addEventListener("click",()=>u(h,!0)),f.addEventListener("keydown",g=>{["ArrowLeft","ArrowRight","Home","End"].includes(g.key)&&(g.preventDefault(),u(g.key==="Home"?"game":g.key==="End"||a==="game"?"holder":"game",!0))})}),r("#claim-connect-wallet").addEventListener("click",t);function d(h){l=h;const{state:f,offlineDemo:g,publicChain:_,connected:m,ready:p,chainPending:M,pendingSignature:S,walletName:x,wallet:A,action:C,progress:R,result:N,readError:w}=h,y=f.players.you,L=g||m&&p,k=f.chain?.holder?.claimCosts,W=f.chain?.holder?.proofWarning,X=C==="claimGame"||C==="claimHolder",q=C==="claimHolder"?"holder":"game",z=M||!!S,oe=g?"Demo wallet · simulated SOL":m?`${x||"Connected wallet"}${A?` · ${A.slice(0,4)}…${A.slice(-4)}`:""}`:_?"Use the wallet that earned these rewards.":"Waiting for your local test wallet.";c("#claim-wallet-identity",oe),r("#claim-connect-wallet").hidden=!_||m,r("#claim-connect-wallet").disabled=z;const V=N?.status==="success"&&(N.wallet===A||g)&&N.kind===a,pe=!m&&!g?"connect":z&&X?"approve":V?"received":"choose";for(const ae of i.querySelectorAll("[data-claim-step]"))ae.classList.toggle("is-current",ae.dataset.claimStep===pe),ae.classList.toggle("is-complete",ae.dataset.claimStep==="connect"&&(m||g)||V),ae.dataset.claimStep===pe?ae.setAttribute("aria-current","step"):ae.removeAttribute("aria-current");const K={game:y.claimable||0,holder:y.tokenClaimable||0};if(!L)for(const ae of["#game-claimable","#token-claimable","#key-earned","#token-earned","#token-balance","#game-share","#token-share"])c(ae,"—");c("#claim-key-available",L&&y.keyRewardsAvailable!==void 0?n(y.keyRewardsAvailable):"—"),c("#claim-jackpot-available",L&&y.jackpotRewardsAvailable!==void 0?n(y.jackpotRewardsAvailable):"—"),c("#claim-referral-available",L&&y.referralRewardsAvailable!==void 0?n(y.referralRewardsAvailable):"—"),c("#claim-game-claimed",L?n(y.totalClaimed||0):"—"),c("#claim-paid-this-round",L?n(y.roundContribution||0):"—");for(const[ae,ye]of[["#claim-key-available","keyRewardsAvailable"],["#claim-jackpot-available","jackpotRewardsAvailable"],["#claim-referral-available","referralRewardsAvailable"]])r(ae).closest("div").hidden=y[ye]===void 0;r("#claim-holder-status").classList.toggle("is-unavailable",!!W&&L);for(const ae of["game","holder"]){const ye=K[ae],Ue=k?.[ae],Z=r(`#claim-${ae}-net-row`);if(Z.hidden=!L||!Ue||ye<=0,!Z.hidden){const Xe=BigInt(Ue.netAmount);c(`#claim-${ae}-net`,`${Xe<0n?"−":""}${n(Number(Xe<0n?-Xe:Xe))} SOL`)}const ee=r(`#claim-${ae}-cost-details`),Me=r(ae==="game"?"#game-claim-cost":"#holder-claim-cost");ee.hidden=!Me.textContent.trim();let Te;!m&&!g?Te=_?"Connect the same wallet to see what you can claim.":"Waiting for confirmed test-wallet balances.":!p&&!g?Te=w?"Rewards could not refresh. Retrying automatically; your existing rewards stay on chain.":"Reading your confirmed rewards from Solana…":ae==="holder"&&W?Te="Holder reward data is temporarily unavailable. Existing allocations stay on chain; try again when the data is available.":Ue&&BigInt(Ue.netAmount)<=0n&&ye>0?Te="This balance is below the estimated withdrawal cost. Your rewards stay available to claim later.":_&&ye>0&&!Ue?Te=k?.error||"Checking withdrawal fees and account costs before enabling your claim.":ye>0?Te=ae==="game"?"Available now. Claiming withdraws earned rewards, not a refund of everything you paid. Claiming does not end a round or remove your current keys.":"Published and funded for this wallet. Claiming SOL does not sell or stake your $PIGGY.":ae==="game"?Te=y.keys>0?"No unclaimed SOL yet. Your keys can earn a cut when another feed arrives.":y.totalClaimed>0?"All game rewards earned so far have been claimed. New earned rewards will appear here.":"No game rewards for this wallet yet. Feed Piggy to receive keys.":Te=y.tokenBalance>0?"No published, unclaimed holder reward for this wallet. New funded allocations appear here; no staking is needed.":"No unclaimed holder reward for this wallet. Only eligible balances included in funded snapshots receive an allocation.",c(`#claim-${ae}-status`,Te),o[ae].setAttribute("aria-busy",String(z&&X&&q===ae));const Ae=r(ae==="game"?"#claim-button":"#claim-token-button");!m&&!g?(Ae.disabled=!0,Ae.textContent="Connect wallet first"):!p&&!g?(Ae.disabled=!0,Ae.textContent=w?"Rewards unavailable":"Reading rewards…"):z&&(Ae.disabled=!0,Ae.textContent=X&&ae===q?R?.status==="awaiting-wallet"?"Approve in your wallet…":"Confirming withdrawal…":"Wallet transaction in progress…")}let ne="",ce="";z&&X?(ce="pending",ne=R?.status==="awaiting-wallet"?"Review and approve in your wallet. Multiple rounds or snapshots can require more than one approval.":R?.status==="confirmed"?"A transaction confirmed. Checking for any remaining approvals…":"Checking confirmation on Solana. Your rewards are not claimed again while this is pending."):S?(ce="pending",ne="A signed transaction is still being checked. Wait for confirmation before trying another claim."):N&&(N.wallet===A||g)&&N.kind===a&&(ce=N.status,ne=N.status==="success"?N.warning||"Withdrawal confirmed. SOL was sent to the wallet that approved it.":N.status==="pending"?"Confirmation is still pending. Check the transaction in your wallet before trying again.":/reject|cancel|declin|denied/i.test(N.message||"")?"You cancelled the approval. Unclaimed rewards remain available.":N.message||"The withdrawal did not complete. Review the message and try again."),c("#claim-flow-status",ne),r("#claim-flow-status").hidden=!ne,r("#claim-flow-status").dataset.tone=ce}return{render:d,select:u,open(h=a){u(h),e(i)}}}const yc="180",Kf=0,Qc=1,$f=2,oh=1,Yf=2,ri=3,Kn=0,tn=1,fn=2,Ri=0,Nr=1,ll=2,eu=3,tu=4,jf=5,Ki=100,Jf=101,Zf=102,Qf=103,ep=104,tp=200,np=201,ip=202,rp=203,cl=204,ul=205,sp=206,op=207,ap=208,lp=209,cp=210,up=211,dp=212,hp=213,fp=214,dl=0,hl=1,fl=2,Br=3,pl=4,ml=5,gl=6,_l=7,ah=0,pp=1,mp=2,Wn=0,gp=1,_p=2,vp=3,xp=4,yp=5,Sp=6,Mp=7,nu="attached",bp="detached",lh=300,zr=301,Hr=302,vl=303,xl=304,aa=306,Vr=1e3,Ti=1001,Qo=1002,nn=1003,ch=1004,Ms=1005,Zt=1006,Bo=1007,si=1008,In=1009,uh=1010,dh=1011,Ns=1012,Sc=1013,er=1014,Rn=1015,Jr=1016,Mc=1017,bc=1018,Ds=1020,hh=35902,fh=35899,ph=1021,mh=1022,yn=1023,Us=1026,Os=1027,wc=1028,Ec=1029,gh=1030,Tc=1031,Ac=1033,zo=33776,Ho=33777,Vo=33778,Go=33779,yl=35840,Sl=35841,Ml=35842,bl=35843,wl=36196,El=37492,Tl=37496,Al=37808,Cl=37809,Rl=37810,Ll=37811,Pl=37812,Il=37813,Nl=37814,Dl=37815,Ul=37816,Ol=37817,Fl=37818,kl=37819,Bl=37820,zl=37821,Hl=36492,Vl=36494,Gl=36495,Wl=36283,Xl=36284,ql=36285,Kl=36286,Fs=2300,ks=2301,pa=2302,iu=2400,ru=2401,su=2402,wp=2500,Ep=0,_h=1,$l=2,Tp=3200,Ap=3201,vh=0,Cp=1,wi="",Ut="srgb",zt="srgb-linear",ea="linear",_t="srgb",ur=7680,ou=519,Rp=512,Lp=513,Pp=514,xh=515,Ip=516,Np=517,Dp=518,Up=519,Yl=35044,Wo=35048,au="300 es",Gn=2e3,ta=2001;class Zr{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){const n=this._listeners;return n===void 0?!1:n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){const n=this._listeners;if(n===void 0)return;const r=n[e];if(r!==void 0){const s=r.indexOf(t);s!==-1&&r.splice(s,1)}}dispatchEvent(e){const t=this._listeners;if(t===void 0)return;const n=t[e.type];if(n!==void 0){e.target=this;const r=n.slice(0);for(let s=0,o=r.length;s<o;s++)r[s].call(this,e);e.target=null}}}const Ht=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];let lu=1234567;const Ts=Math.PI/180,Gr=180/Math.PI;function Sn(){const i=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Ht[i&255]+Ht[i>>8&255]+Ht[i>>16&255]+Ht[i>>24&255]+"-"+Ht[e&255]+Ht[e>>8&255]+"-"+Ht[e>>16&15|64]+Ht[e>>24&255]+"-"+Ht[t&63|128]+Ht[t>>8&255]+"-"+Ht[t>>16&255]+Ht[t>>24&255]+Ht[n&255]+Ht[n>>8&255]+Ht[n>>16&255]+Ht[n>>24&255]).toLowerCase()}function nt(i,e,t){return Math.max(e,Math.min(t,i))}function Cc(i,e){return(i%e+e)%e}function Op(i,e,t,n,r){return n+(i-e)*(r-n)/(t-e)}function Fp(i,e,t){return i!==e?(t-i)/(e-i):0}function As(i,e,t){return(1-t)*i+t*e}function kp(i,e,t,n){return As(i,e,1-Math.exp(-t*n))}function Bp(i,e=1){return e-Math.abs(Cc(i,e*2)-e)}function zp(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*(3-2*i))}function Hp(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*i*(i*(i*6-15)+10))}function Vp(i,e){return i+Math.floor(Math.random()*(e-i+1))}function Gp(i,e){return i+Math.random()*(e-i)}function Wp(i){return i*(.5-Math.random())}function Xp(i){i!==void 0&&(lu=i);let e=lu+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function qp(i){return i*Ts}function Kp(i){return i*Gr}function $p(i){return(i&i-1)===0&&i!==0}function Yp(i){return Math.pow(2,Math.ceil(Math.log(i)/Math.LN2))}function jp(i){return Math.pow(2,Math.floor(Math.log(i)/Math.LN2))}function Jp(i,e,t,n,r){const s=Math.cos,o=Math.sin,a=s(t/2),l=o(t/2),c=s((e+n)/2),u=o((e+n)/2),d=s((e-n)/2),h=o((e-n)/2),f=s((n-e)/2),g=o((n-e)/2);switch(r){case"XYX":i.set(a*u,l*d,l*h,a*c);break;case"YZY":i.set(l*h,a*u,l*d,a*c);break;case"ZXZ":i.set(l*d,l*h,a*u,a*c);break;case"XZX":i.set(a*u,l*g,l*f,a*c);break;case"YXY":i.set(l*f,a*u,l*g,a*c);break;case"ZYZ":i.set(l*g,l*f,a*u,a*c);break;default:console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+r)}}function An(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("Invalid component type.")}}function ft(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("Invalid component type.")}}const Ei={DEG2RAD:Ts,RAD2DEG:Gr,generateUUID:Sn,clamp:nt,euclideanModulo:Cc,mapLinear:Op,inverseLerp:Fp,lerp:As,damp:kp,pingpong:Bp,smoothstep:zp,smootherstep:Hp,randInt:Vp,randFloat:Gp,randFloatSpread:Wp,seededRandom:Xp,degToRad:qp,radToDeg:Kp,isPowerOfTwo:$p,ceilPowerOfTwo:Yp,floorPowerOfTwo:jp,setQuaternionFromProperEuler:Jp,normalize:ft,denormalize:An};class _e{constructor(e=0,t=0){_e.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,n=this.y,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6],this.y=r[1]*t+r[4]*n+r[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=nt(this.x,e.x,t.x),this.y=nt(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=nt(this.x,e,t),this.y=nt(this.y,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(nt(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(nt(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const n=Math.cos(t),r=Math.sin(t),s=this.x-e.x,o=this.y-e.y;return this.x=s*n-o*r+e.x,this.y=s*r+o*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class Pn{constructor(e=0,t=0,n=0,r=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=r}static slerpFlat(e,t,n,r,s,o,a){let l=n[r+0],c=n[r+1],u=n[r+2],d=n[r+3];const h=s[o+0],f=s[o+1],g=s[o+2],_=s[o+3];if(a===0){e[t+0]=l,e[t+1]=c,e[t+2]=u,e[t+3]=d;return}if(a===1){e[t+0]=h,e[t+1]=f,e[t+2]=g,e[t+3]=_;return}if(d!==_||l!==h||c!==f||u!==g){let m=1-a;const p=l*h+c*f+u*g+d*_,M=p>=0?1:-1,S=1-p*p;if(S>Number.EPSILON){const A=Math.sqrt(S),C=Math.atan2(A,p*M);m=Math.sin(m*C)/A,a=Math.sin(a*C)/A}const x=a*M;if(l=l*m+h*x,c=c*m+f*x,u=u*m+g*x,d=d*m+_*x,m===1-a){const A=1/Math.sqrt(l*l+c*c+u*u+d*d);l*=A,c*=A,u*=A,d*=A}}e[t]=l,e[t+1]=c,e[t+2]=u,e[t+3]=d}static multiplyQuaternionsFlat(e,t,n,r,s,o){const a=n[r],l=n[r+1],c=n[r+2],u=n[r+3],d=s[o],h=s[o+1],f=s[o+2],g=s[o+3];return e[t]=a*g+u*d+l*f-c*h,e[t+1]=l*g+u*h+c*d-a*f,e[t+2]=c*g+u*f+a*h-l*d,e[t+3]=u*g-a*d-l*h-c*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,r){return this._x=e,this._y=t,this._z=n,this._w=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const n=e._x,r=e._y,s=e._z,o=e._order,a=Math.cos,l=Math.sin,c=a(n/2),u=a(r/2),d=a(s/2),h=l(n/2),f=l(r/2),g=l(s/2);switch(o){case"XYZ":this._x=h*u*d+c*f*g,this._y=c*f*d-h*u*g,this._z=c*u*g+h*f*d,this._w=c*u*d-h*f*g;break;case"YXZ":this._x=h*u*d+c*f*g,this._y=c*f*d-h*u*g,this._z=c*u*g-h*f*d,this._w=c*u*d+h*f*g;break;case"ZXY":this._x=h*u*d-c*f*g,this._y=c*f*d+h*u*g,this._z=c*u*g+h*f*d,this._w=c*u*d-h*f*g;break;case"ZYX":this._x=h*u*d-c*f*g,this._y=c*f*d+h*u*g,this._z=c*u*g-h*f*d,this._w=c*u*d+h*f*g;break;case"YZX":this._x=h*u*d+c*f*g,this._y=c*f*d+h*u*g,this._z=c*u*g-h*f*d,this._w=c*u*d-h*f*g;break;case"XZY":this._x=h*u*d-c*f*g,this._y=c*f*d-h*u*g,this._z=c*u*g+h*f*d,this._w=c*u*d+h*f*g;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+o)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const n=t/2,r=Math.sin(n);return this._x=e.x*r,this._y=e.y*r,this._z=e.z*r,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,n=t[0],r=t[4],s=t[8],o=t[1],a=t[5],l=t[9],c=t[2],u=t[6],d=t[10],h=n+a+d;if(h>0){const f=.5/Math.sqrt(h+1);this._w=.25/f,this._x=(u-l)*f,this._y=(s-c)*f,this._z=(o-r)*f}else if(n>a&&n>d){const f=2*Math.sqrt(1+n-a-d);this._w=(u-l)/f,this._x=.25*f,this._y=(r+o)/f,this._z=(s+c)/f}else if(a>d){const f=2*Math.sqrt(1+a-n-d);this._w=(s-c)/f,this._x=(r+o)/f,this._y=.25*f,this._z=(l+u)/f}else{const f=2*Math.sqrt(1+d-n-a);this._w=(o-r)/f,this._x=(s+c)/f,this._y=(l+u)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(nt(this.dot(e),-1,1)))}rotateTowards(e,t){const n=this.angleTo(e);if(n===0)return this;const r=Math.min(1,t/n);return this.slerp(e,r),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const n=e._x,r=e._y,s=e._z,o=e._w,a=t._x,l=t._y,c=t._z,u=t._w;return this._x=n*u+o*a+r*c-s*l,this._y=r*u+o*l+s*a-n*c,this._z=s*u+o*c+n*l-r*a,this._w=o*u-n*a-r*l-s*c,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);const n=this._x,r=this._y,s=this._z,o=this._w;let a=o*e._w+n*e._x+r*e._y+s*e._z;if(a<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,a=-a):this.copy(e),a>=1)return this._w=o,this._x=n,this._y=r,this._z=s,this;const l=1-a*a;if(l<=Number.EPSILON){const f=1-t;return this._w=f*o+t*this._w,this._x=f*n+t*this._x,this._y=f*r+t*this._y,this._z=f*s+t*this._z,this.normalize(),this}const c=Math.sqrt(l),u=Math.atan2(c,a),d=Math.sin((1-t)*u)/c,h=Math.sin(t*u)/c;return this._w=o*d+this._w*h,this._x=n*d+this._x*h,this._y=r*d+this._y*h,this._z=s*d+this._z*h,this._onChangeCallback(),this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){const e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),r=Math.sqrt(1-n),s=Math.sqrt(n);return this.set(r*Math.sin(e),r*Math.cos(e),s*Math.sin(t),s*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class I{constructor(e=0,t=0,n=0){I.prototype.isVector3=!0,this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(cu.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(cu.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,n=this.y,r=this.z,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6]*r,this.y=s[1]*t+s[4]*n+s[7]*r,this.z=s[2]*t+s[5]*n+s[8]*r,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,n=this.y,r=this.z,s=e.elements,o=1/(s[3]*t+s[7]*n+s[11]*r+s[15]);return this.x=(s[0]*t+s[4]*n+s[8]*r+s[12])*o,this.y=(s[1]*t+s[5]*n+s[9]*r+s[13])*o,this.z=(s[2]*t+s[6]*n+s[10]*r+s[14])*o,this}applyQuaternion(e){const t=this.x,n=this.y,r=this.z,s=e.x,o=e.y,a=e.z,l=e.w,c=2*(o*r-a*n),u=2*(a*t-s*r),d=2*(s*n-o*t);return this.x=t+l*c+o*d-a*u,this.y=n+l*u+a*c-s*d,this.z=r+l*d+s*u-o*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,n=this.y,r=this.z,s=e.elements;return this.x=s[0]*t+s[4]*n+s[8]*r,this.y=s[1]*t+s[5]*n+s[9]*r,this.z=s[2]*t+s[6]*n+s[10]*r,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=nt(this.x,e.x,t.x),this.y=nt(this.y,e.y,t.y),this.z=nt(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=nt(this.x,e,t),this.y=nt(this.y,e,t),this.z=nt(this.z,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(nt(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const n=e.x,r=e.y,s=e.z,o=t.x,a=t.y,l=t.z;return this.x=r*l-s*a,this.y=s*o-n*l,this.z=n*a-r*o,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return ma.copy(this).projectOnVector(e),this.sub(ma)}reflect(e){return this.sub(ma.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(nt(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y,r=this.z-e.z;return t*t+n*n+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){const r=Math.sin(t)*e;return this.x=r*Math.sin(n),this.y=Math.cos(t)*e,this.z=r*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),r=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=r,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const ma=new I,cu=new Pn;class Qe{constructor(e,t,n,r,s,o,a,l,c){Qe.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,r,s,o,a,l,c)}set(e,t,n,r,s,o,a,l,c){const u=this.elements;return u[0]=e,u[1]=r,u[2]=a,u[3]=t,u[4]=s,u[5]=l,u[6]=n,u[7]=o,u[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,r=t.elements,s=this.elements,o=n[0],a=n[3],l=n[6],c=n[1],u=n[4],d=n[7],h=n[2],f=n[5],g=n[8],_=r[0],m=r[3],p=r[6],M=r[1],S=r[4],x=r[7],A=r[2],C=r[5],R=r[8];return s[0]=o*_+a*M+l*A,s[3]=o*m+a*S+l*C,s[6]=o*p+a*x+l*R,s[1]=c*_+u*M+d*A,s[4]=c*m+u*S+d*C,s[7]=c*p+u*x+d*R,s[2]=h*_+f*M+g*A,s[5]=h*m+f*S+g*C,s[8]=h*p+f*x+g*R,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[1],r=e[2],s=e[3],o=e[4],a=e[5],l=e[6],c=e[7],u=e[8];return t*o*u-t*a*c-n*s*u+n*a*l+r*s*c-r*o*l}invert(){const e=this.elements,t=e[0],n=e[1],r=e[2],s=e[3],o=e[4],a=e[5],l=e[6],c=e[7],u=e[8],d=u*o-a*c,h=a*l-u*s,f=c*s-o*l,g=t*d+n*h+r*f;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);const _=1/g;return e[0]=d*_,e[1]=(r*c-u*n)*_,e[2]=(a*n-r*o)*_,e[3]=h*_,e[4]=(u*t-r*l)*_,e[5]=(r*s-a*t)*_,e[6]=f*_,e[7]=(n*l-c*t)*_,e[8]=(o*t-n*s)*_,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,r,s,o,a){const l=Math.cos(s),c=Math.sin(s);return this.set(n*l,n*c,-n*(l*o+c*a)+o+e,-r*c,r*l,-r*(-c*o+l*a)+a+t,0,0,1),this}scale(e,t){return this.premultiply(ga.makeScale(e,t)),this}rotate(e){return this.premultiply(ga.makeRotation(-e)),this}translate(e,t){return this.premultiply(ga.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,n=e.elements;for(let r=0;r<9;r++)if(t[r]!==n[r])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}}const ga=new Qe;function yh(i){for(let e=i.length-1;e>=0;--e)if(i[e]>=65535)return!0;return!1}function Bs(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function Zp(){const i=Bs("canvas");return i.style.display="block",i}const uu={};function zs(i){i in uu||(uu[i]=!0,console.warn(i))}function Qp(i,e,t){return new Promise(function(n,r){function s(){switch(i.clientWaitSync(e,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:r();break;case i.TIMEOUT_EXPIRED:setTimeout(s,t);break;default:n()}}setTimeout(s,t)})}const du=new Qe().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),hu=new Qe().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function em(){const i={enabled:!0,workingColorSpace:zt,spaces:{},convert:function(r,s,o){return this.enabled===!1||s===o||!s||!o||(this.spaces[s].transfer===_t&&(r.r=ci(r.r),r.g=ci(r.g),r.b=ci(r.b)),this.spaces[s].primaries!==this.spaces[o].primaries&&(r.applyMatrix3(this.spaces[s].toXYZ),r.applyMatrix3(this.spaces[o].fromXYZ)),this.spaces[o].transfer===_t&&(r.r=Dr(r.r),r.g=Dr(r.g),r.b=Dr(r.b))),r},workingToColorSpace:function(r,s){return this.convert(r,this.workingColorSpace,s)},colorSpaceToWorking:function(r,s){return this.convert(r,s,this.workingColorSpace)},getPrimaries:function(r){return this.spaces[r].primaries},getTransfer:function(r){return r===wi?ea:this.spaces[r].transfer},getToneMappingMode:function(r){return this.spaces[r].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(r,s=this.workingColorSpace){return r.fromArray(this.spaces[s].luminanceCoefficients)},define:function(r){Object.assign(this.spaces,r)},_getMatrix:function(r,s,o){return r.copy(this.spaces[s].toXYZ).multiply(this.spaces[o].fromXYZ)},_getDrawingBufferColorSpace:function(r){return this.spaces[r].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(r=this.workingColorSpace){return this.spaces[r].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(r,s){return zs("THREE.ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),i.workingToColorSpace(r,s)},toWorkingColorSpace:function(r,s){return zs("THREE.ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),i.colorSpaceToWorking(r,s)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],n=[.3127,.329];return i.define({[zt]:{primaries:e,whitePoint:n,transfer:ea,toXYZ:du,fromXYZ:hu,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:Ut},outputColorSpaceConfig:{drawingBufferColorSpace:Ut}},[Ut]:{primaries:e,whitePoint:n,transfer:_t,toXYZ:du,fromXYZ:hu,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:Ut}}}),i}const ot=em();function ci(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function Dr(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}let dr;class tm{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{dr===void 0&&(dr=Bs("canvas")),dr.width=e.width,dr.height=e.height;const r=dr.getContext("2d");e instanceof ImageData?r.putImageData(e,0,0):r.drawImage(e,0,0,e.width,e.height),n=dr}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=Bs("canvas");t.width=e.width,t.height=e.height;const n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);const r=n.getImageData(0,0,e.width,e.height),s=r.data;for(let o=0;o<s.length;o++)s[o]=ci(s[o]/255)*255;return n.putImageData(r,0,0),t}else if(e.data){const t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(ci(t[n]/255)*255):t[n]=ci(t[n]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let nm=0;class Rc{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:nm++}),this.uuid=Sn(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){const t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):t instanceof VideoFrame?e.set(t.displayHeight,t.displayWidth,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const n={uuid:this.uuid,url:""},r=this.data;if(r!==null){let s;if(Array.isArray(r)){s=[];for(let o=0,a=r.length;o<a;o++)r[o].isDataTexture?s.push(_a(r[o].image)):s.push(_a(r[o]))}else s=_a(r);n.url=s}return t||(e.images[this.uuid]=n),n}}function _a(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?tm.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let im=0;const va=new I;class Ft extends Zr{constructor(e=Ft.DEFAULT_IMAGE,t=Ft.DEFAULT_MAPPING,n=Ti,r=Ti,s=Zt,o=si,a=yn,l=In,c=Ft.DEFAULT_ANISOTROPY,u=wi){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:im++}),this.uuid=Sn(),this.name="",this.source=new Rc(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=r,this.magFilter=s,this.minFilter=o,this.anisotropy=c,this.format=a,this.internalFormat=null,this.type=l,this.offset=new _e(0,0),this.repeat=new _e(1,1),this.center=new _e(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Qe,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0}get width(){return this.source.getSize(va).x}get height(){return this.source.getSize(va).y}get depth(){return this.source.getSize(va).z}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(const t in e){const n=e[t];if(n===void 0){console.warn(`THREE.Texture.setValues(): parameter '${t}' has value of undefined.`);continue}const r=this[t];if(r===void 0){console.warn(`THREE.Texture.setValues(): property '${t}' does not exist.`);continue}r&&n&&r.isVector2&&n.isVector2||r&&n&&r.isVector3&&n.isVector3||r&&n&&r.isMatrix3&&n.isMatrix3?r.copy(n):this[t]=n}}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==lh)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case Vr:e.x=e.x-Math.floor(e.x);break;case Ti:e.x=e.x<0?0:1;break;case Qo:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case Vr:e.y=e.y-Math.floor(e.y);break;case Ti:e.y=e.y<0?0:1;break;case Qo:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}Ft.DEFAULT_IMAGE=null;Ft.DEFAULT_MAPPING=lh;Ft.DEFAULT_ANISOTROPY=1;class ut{constructor(e=0,t=0,n=0,r=1){ut.prototype.isVector4=!0,this.x=e,this.y=t,this.z=n,this.w=r}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,r){return this.x=e,this.y=t,this.z=n,this.w=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,n=this.y,r=this.z,s=this.w,o=e.elements;return this.x=o[0]*t+o[4]*n+o[8]*r+o[12]*s,this.y=o[1]*t+o[5]*n+o[9]*r+o[13]*s,this.z=o[2]*t+o[6]*n+o[10]*r+o[14]*s,this.w=o[3]*t+o[7]*n+o[11]*r+o[15]*s,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,r,s;const l=e.elements,c=l[0],u=l[4],d=l[8],h=l[1],f=l[5],g=l[9],_=l[2],m=l[6],p=l[10];if(Math.abs(u-h)<.01&&Math.abs(d-_)<.01&&Math.abs(g-m)<.01){if(Math.abs(u+h)<.1&&Math.abs(d+_)<.1&&Math.abs(g+m)<.1&&Math.abs(c+f+p-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const S=(c+1)/2,x=(f+1)/2,A=(p+1)/2,C=(u+h)/4,R=(d+_)/4,N=(g+m)/4;return S>x&&S>A?S<.01?(n=0,r=.707106781,s=.707106781):(n=Math.sqrt(S),r=C/n,s=R/n):x>A?x<.01?(n=.707106781,r=0,s=.707106781):(r=Math.sqrt(x),n=C/r,s=N/r):A<.01?(n=.707106781,r=.707106781,s=0):(s=Math.sqrt(A),n=R/s,r=N/s),this.set(n,r,s,t),this}let M=Math.sqrt((m-g)*(m-g)+(d-_)*(d-_)+(h-u)*(h-u));return Math.abs(M)<.001&&(M=1),this.x=(m-g)/M,this.y=(d-_)/M,this.z=(h-u)/M,this.w=Math.acos((c+f+p-1)/2),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=nt(this.x,e.x,t.x),this.y=nt(this.y,e.y,t.y),this.z=nt(this.z,e.z,t.z),this.w=nt(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=nt(this.x,e,t),this.y=nt(this.y,e,t),this.z=nt(this.z,e,t),this.w=nt(this.w,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(nt(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class rm extends Zr{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Zt,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new ut(0,0,e,t),this.scissorTest=!1,this.viewport=new ut(0,0,e,t);const r={width:e,height:t,depth:n.depth},s=new Ft(r);this.textures=[];const o=n.count;for(let a=0;a<o;a++)this.textures[a]=s.clone(),this.textures[a].isRenderTargetTexture=!0,this.textures[a].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview}_setTextureOptions(e={}){const t={minFilter:Zt,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),e!==null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let r=0,s=this.textures.length;r<s;r++)this.textures[r].image.width=e,this.textures[r].image.height=t,this.textures[r].image.depth=n,this.textures[r].isArrayTexture=this.textures[r].image.depth>1;this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;const r=Object.assign({},e.textures[t].image);this.textures[t].source=new Rc(r)}return this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class di extends rm{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}}class Sh extends Ft{constructor(e=null,t=1,n=1,r=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:r},this.magFilter=nn,this.minFilter=nn,this.wrapR=Ti,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class sm extends Ft{constructor(e=null,t=1,n=1,r=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:r},this.magFilter=nn,this.minFilter=nn,this.wrapR=Ti,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Nn{constructor(e=new I(1/0,1/0,1/0),t=new I(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(bn.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(bn.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const n=bn.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const n=e.geometry;if(n!==void 0){const s=n.getAttribute("position");if(t===!0&&s!==void 0&&e.isInstancedMesh!==!0)for(let o=0,a=s.count;o<a;o++)e.isMesh===!0?e.getVertexPosition(o,bn):bn.fromBufferAttribute(s,o),bn.applyMatrix4(e.matrixWorld),this.expandByPoint(bn);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),so.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),so.copy(n.boundingBox)),so.applyMatrix4(e.matrixWorld),this.union(so)}const r=e.children;for(let s=0,o=r.length;s<o;s++)this.expandByObject(r[s],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,bn),bn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(fs),oo.subVectors(this.max,fs),hr.subVectors(e.a,fs),fr.subVectors(e.b,fs),pr.subVectors(e.c,fs),pi.subVectors(fr,hr),mi.subVectors(pr,fr),Fi.subVectors(hr,pr);let t=[0,-pi.z,pi.y,0,-mi.z,mi.y,0,-Fi.z,Fi.y,pi.z,0,-pi.x,mi.z,0,-mi.x,Fi.z,0,-Fi.x,-pi.y,pi.x,0,-mi.y,mi.x,0,-Fi.y,Fi.x,0];return!xa(t,hr,fr,pr,oo)||(t=[1,0,0,0,1,0,0,0,1],!xa(t,hr,fr,pr,oo))?!1:(ao.crossVectors(pi,mi),t=[ao.x,ao.y,ao.z],xa(t,hr,fr,pr,oo))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,bn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(bn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Zn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Zn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Zn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Zn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Zn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Zn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Zn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Zn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Zn),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}}const Zn=[new I,new I,new I,new I,new I,new I,new I,new I],bn=new I,so=new Nn,hr=new I,fr=new I,pr=new I,pi=new I,mi=new I,Fi=new I,fs=new I,oo=new I,ao=new I,ki=new I;function xa(i,e,t,n,r){for(let s=0,o=i.length-3;s<=o;s+=3){ki.fromArray(i,s);const a=r.x*Math.abs(ki.x)+r.y*Math.abs(ki.y)+r.z*Math.abs(ki.z),l=e.dot(ki),c=t.dot(ki),u=n.dot(ki);if(Math.max(-Math.max(l,c,u),Math.min(l,c,u))>a)return!1}return!0}const om=new Nn,ps=new I,ya=new I;class $n{constructor(e=new I,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const n=this.center;t!==void 0?n.copy(t):om.setFromPoints(e).getCenter(n);let r=0;for(let s=0,o=e.length;s<o;s++)r=Math.max(r,n.distanceToSquared(e[s]));return this.radius=Math.sqrt(r),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;ps.subVectors(e,this.center);const t=ps.lengthSq();if(t>this.radius*this.radius){const n=Math.sqrt(t),r=(n-this.radius)*.5;this.center.addScaledVector(ps,r/n),this.radius+=r}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(ya.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(ps.copy(e.center).add(ya)),this.expandByPoint(ps.copy(e.center).sub(ya))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}}const Qn=new I,Sa=new I,lo=new I,gi=new I,Ma=new I,co=new I,ba=new I;class la{constructor(e=new I,t=new I(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Qn)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=Qn.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Qn.copy(this.origin).addScaledVector(this.direction,t),Qn.distanceToSquared(e))}distanceSqToSegment(e,t,n,r){Sa.copy(e).add(t).multiplyScalar(.5),lo.copy(t).sub(e).normalize(),gi.copy(this.origin).sub(Sa);const s=e.distanceTo(t)*.5,o=-this.direction.dot(lo),a=gi.dot(this.direction),l=-gi.dot(lo),c=gi.lengthSq(),u=Math.abs(1-o*o);let d,h,f,g;if(u>0)if(d=o*l-a,h=o*a-l,g=s*u,d>=0)if(h>=-g)if(h<=g){const _=1/u;d*=_,h*=_,f=d*(d+o*h+2*a)+h*(o*d+h+2*l)+c}else h=s,d=Math.max(0,-(o*h+a)),f=-d*d+h*(h+2*l)+c;else h=-s,d=Math.max(0,-(o*h+a)),f=-d*d+h*(h+2*l)+c;else h<=-g?(d=Math.max(0,-(-o*s+a)),h=d>0?-s:Math.min(Math.max(-s,-l),s),f=-d*d+h*(h+2*l)+c):h<=g?(d=0,h=Math.min(Math.max(-s,-l),s),f=h*(h+2*l)+c):(d=Math.max(0,-(o*s+a)),h=d>0?s:Math.min(Math.max(-s,-l),s),f=-d*d+h*(h+2*l)+c);else h=o>0?-s:s,d=Math.max(0,-(o*h+a)),f=-d*d+h*(h+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,d),r&&r.copy(Sa).addScaledVector(lo,h),f}intersectSphere(e,t){Qn.subVectors(e.center,this.origin);const n=Qn.dot(this.direction),r=Qn.dot(Qn)-n*n,s=e.radius*e.radius;if(r>s)return null;const o=Math.sqrt(s-r),a=n-o,l=n+o;return l<0?null:a<0?this.at(l,t):this.at(a,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){const n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,r,s,o,a,l;const c=1/this.direction.x,u=1/this.direction.y,d=1/this.direction.z,h=this.origin;return c>=0?(n=(e.min.x-h.x)*c,r=(e.max.x-h.x)*c):(n=(e.max.x-h.x)*c,r=(e.min.x-h.x)*c),u>=0?(s=(e.min.y-h.y)*u,o=(e.max.y-h.y)*u):(s=(e.max.y-h.y)*u,o=(e.min.y-h.y)*u),n>o||s>r||((s>n||isNaN(n))&&(n=s),(o<r||isNaN(r))&&(r=o),d>=0?(a=(e.min.z-h.z)*d,l=(e.max.z-h.z)*d):(a=(e.max.z-h.z)*d,l=(e.min.z-h.z)*d),n>l||a>r)||((a>n||n!==n)&&(n=a),(l<r||r!==r)&&(r=l),r<0)?null:this.at(n>=0?n:r,t)}intersectsBox(e){return this.intersectBox(e,Qn)!==null}intersectTriangle(e,t,n,r,s){Ma.subVectors(t,e),co.subVectors(n,e),ba.crossVectors(Ma,co);let o=this.direction.dot(ba),a;if(o>0){if(r)return null;a=1}else if(o<0)a=-1,o=-o;else return null;gi.subVectors(this.origin,e);const l=a*this.direction.dot(co.crossVectors(gi,co));if(l<0)return null;const c=a*this.direction.dot(Ma.cross(gi));if(c<0||l+c>o)return null;const u=-a*gi.dot(ba);return u<0?null:this.at(u/o,s)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class $e{constructor(e,t,n,r,s,o,a,l,c,u,d,h,f,g,_,m){$e.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,r,s,o,a,l,c,u,d,h,f,g,_,m)}set(e,t,n,r,s,o,a,l,c,u,d,h,f,g,_,m){const p=this.elements;return p[0]=e,p[4]=t,p[8]=n,p[12]=r,p[1]=s,p[5]=o,p[9]=a,p[13]=l,p[2]=c,p[6]=u,p[10]=d,p[14]=h,p[3]=f,p[7]=g,p[11]=_,p[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new $e().fromArray(this.elements)}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){const t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){const t=this.elements,n=e.elements,r=1/mr.setFromMatrixColumn(e,0).length(),s=1/mr.setFromMatrixColumn(e,1).length(),o=1/mr.setFromMatrixColumn(e,2).length();return t[0]=n[0]*r,t[1]=n[1]*r,t[2]=n[2]*r,t[3]=0,t[4]=n[4]*s,t[5]=n[5]*s,t[6]=n[6]*s,t[7]=0,t[8]=n[8]*o,t[9]=n[9]*o,t[10]=n[10]*o,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,n=e.x,r=e.y,s=e.z,o=Math.cos(n),a=Math.sin(n),l=Math.cos(r),c=Math.sin(r),u=Math.cos(s),d=Math.sin(s);if(e.order==="XYZ"){const h=o*u,f=o*d,g=a*u,_=a*d;t[0]=l*u,t[4]=-l*d,t[8]=c,t[1]=f+g*c,t[5]=h-_*c,t[9]=-a*l,t[2]=_-h*c,t[6]=g+f*c,t[10]=o*l}else if(e.order==="YXZ"){const h=l*u,f=l*d,g=c*u,_=c*d;t[0]=h+_*a,t[4]=g*a-f,t[8]=o*c,t[1]=o*d,t[5]=o*u,t[9]=-a,t[2]=f*a-g,t[6]=_+h*a,t[10]=o*l}else if(e.order==="ZXY"){const h=l*u,f=l*d,g=c*u,_=c*d;t[0]=h-_*a,t[4]=-o*d,t[8]=g+f*a,t[1]=f+g*a,t[5]=o*u,t[9]=_-h*a,t[2]=-o*c,t[6]=a,t[10]=o*l}else if(e.order==="ZYX"){const h=o*u,f=o*d,g=a*u,_=a*d;t[0]=l*u,t[4]=g*c-f,t[8]=h*c+_,t[1]=l*d,t[5]=_*c+h,t[9]=f*c-g,t[2]=-c,t[6]=a*l,t[10]=o*l}else if(e.order==="YZX"){const h=o*l,f=o*c,g=a*l,_=a*c;t[0]=l*u,t[4]=_-h*d,t[8]=g*d+f,t[1]=d,t[5]=o*u,t[9]=-a*u,t[2]=-c*u,t[6]=f*d+g,t[10]=h-_*d}else if(e.order==="XZY"){const h=o*l,f=o*c,g=a*l,_=a*c;t[0]=l*u,t[4]=-d,t[8]=c*u,t[1]=h*d+_,t[5]=o*u,t[9]=f*d-g,t[2]=g*d-f,t[6]=a*u,t[10]=_*d+h}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(am,e,lm)}lookAt(e,t,n){const r=this.elements;return dn.subVectors(e,t),dn.lengthSq()===0&&(dn.z=1),dn.normalize(),_i.crossVectors(n,dn),_i.lengthSq()===0&&(Math.abs(n.z)===1?dn.x+=1e-4:dn.z+=1e-4,dn.normalize(),_i.crossVectors(n,dn)),_i.normalize(),uo.crossVectors(dn,_i),r[0]=_i.x,r[4]=uo.x,r[8]=dn.x,r[1]=_i.y,r[5]=uo.y,r[9]=dn.y,r[2]=_i.z,r[6]=uo.z,r[10]=dn.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,r=t.elements,s=this.elements,o=n[0],a=n[4],l=n[8],c=n[12],u=n[1],d=n[5],h=n[9],f=n[13],g=n[2],_=n[6],m=n[10],p=n[14],M=n[3],S=n[7],x=n[11],A=n[15],C=r[0],R=r[4],N=r[8],w=r[12],y=r[1],L=r[5],k=r[9],W=r[13],X=r[2],q=r[6],z=r[10],oe=r[14],V=r[3],pe=r[7],K=r[11],ne=r[15];return s[0]=o*C+a*y+l*X+c*V,s[4]=o*R+a*L+l*q+c*pe,s[8]=o*N+a*k+l*z+c*K,s[12]=o*w+a*W+l*oe+c*ne,s[1]=u*C+d*y+h*X+f*V,s[5]=u*R+d*L+h*q+f*pe,s[9]=u*N+d*k+h*z+f*K,s[13]=u*w+d*W+h*oe+f*ne,s[2]=g*C+_*y+m*X+p*V,s[6]=g*R+_*L+m*q+p*pe,s[10]=g*N+_*k+m*z+p*K,s[14]=g*w+_*W+m*oe+p*ne,s[3]=M*C+S*y+x*X+A*V,s[7]=M*R+S*L+x*q+A*pe,s[11]=M*N+S*k+x*z+A*K,s[15]=M*w+S*W+x*oe+A*ne,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[4],r=e[8],s=e[12],o=e[1],a=e[5],l=e[9],c=e[13],u=e[2],d=e[6],h=e[10],f=e[14],g=e[3],_=e[7],m=e[11],p=e[15];return g*(+s*l*d-r*c*d-s*a*h+n*c*h+r*a*f-n*l*f)+_*(+t*l*f-t*c*h+s*o*h-r*o*f+r*c*u-s*l*u)+m*(+t*c*d-t*a*f-s*o*d+n*o*f+s*a*u-n*c*u)+p*(-r*a*u-t*l*d+t*a*h+r*o*d-n*o*h+n*l*u)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){const r=this.elements;return e.isVector3?(r[12]=e.x,r[13]=e.y,r[14]=e.z):(r[12]=e,r[13]=t,r[14]=n),this}invert(){const e=this.elements,t=e[0],n=e[1],r=e[2],s=e[3],o=e[4],a=e[5],l=e[6],c=e[7],u=e[8],d=e[9],h=e[10],f=e[11],g=e[12],_=e[13],m=e[14],p=e[15],M=d*m*c-_*h*c+_*l*f-a*m*f-d*l*p+a*h*p,S=g*h*c-u*m*c-g*l*f+o*m*f+u*l*p-o*h*p,x=u*_*c-g*d*c+g*a*f-o*_*f-u*a*p+o*d*p,A=g*d*l-u*_*l-g*a*h+o*_*h+u*a*m-o*d*m,C=t*M+n*S+r*x+s*A;if(C===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const R=1/C;return e[0]=M*R,e[1]=(_*h*s-d*m*s-_*r*f+n*m*f+d*r*p-n*h*p)*R,e[2]=(a*m*s-_*l*s+_*r*c-n*m*c-a*r*p+n*l*p)*R,e[3]=(d*l*s-a*h*s-d*r*c+n*h*c+a*r*f-n*l*f)*R,e[4]=S*R,e[5]=(u*m*s-g*h*s+g*r*f-t*m*f-u*r*p+t*h*p)*R,e[6]=(g*l*s-o*m*s-g*r*c+t*m*c+o*r*p-t*l*p)*R,e[7]=(o*h*s-u*l*s+u*r*c-t*h*c-o*r*f+t*l*f)*R,e[8]=x*R,e[9]=(g*d*s-u*_*s-g*n*f+t*_*f+u*n*p-t*d*p)*R,e[10]=(o*_*s-g*a*s+g*n*c-t*_*c-o*n*p+t*a*p)*R,e[11]=(u*a*s-o*d*s-u*n*c+t*d*c+o*n*f-t*a*f)*R,e[12]=A*R,e[13]=(u*_*r-g*d*r+g*n*h-t*_*h-u*n*m+t*d*m)*R,e[14]=(g*a*r-o*_*r-g*n*l+t*_*l+o*n*m-t*a*m)*R,e[15]=(o*d*r-u*a*r+u*n*l-t*d*l-o*n*h+t*a*h)*R,this}scale(e){const t=this.elements,n=e.x,r=e.y,s=e.z;return t[0]*=n,t[4]*=r,t[8]*=s,t[1]*=n,t[5]*=r,t[9]*=s,t[2]*=n,t[6]*=r,t[10]*=s,t[3]*=n,t[7]*=r,t[11]*=s,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],r=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,r))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const n=Math.cos(t),r=Math.sin(t),s=1-n,o=e.x,a=e.y,l=e.z,c=s*o,u=s*a;return this.set(c*o+n,c*a-r*l,c*l+r*a,0,c*a+r*l,u*a+n,u*l-r*o,0,c*l-r*a,u*l+r*o,s*l*l+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,r,s,o){return this.set(1,n,s,0,e,1,o,0,t,r,1,0,0,0,0,1),this}compose(e,t,n){const r=this.elements,s=t._x,o=t._y,a=t._z,l=t._w,c=s+s,u=o+o,d=a+a,h=s*c,f=s*u,g=s*d,_=o*u,m=o*d,p=a*d,M=l*c,S=l*u,x=l*d,A=n.x,C=n.y,R=n.z;return r[0]=(1-(_+p))*A,r[1]=(f+x)*A,r[2]=(g-S)*A,r[3]=0,r[4]=(f-x)*C,r[5]=(1-(h+p))*C,r[6]=(m+M)*C,r[7]=0,r[8]=(g+S)*R,r[9]=(m-M)*R,r[10]=(1-(h+_))*R,r[11]=0,r[12]=e.x,r[13]=e.y,r[14]=e.z,r[15]=1,this}decompose(e,t,n){const r=this.elements;let s=mr.set(r[0],r[1],r[2]).length();const o=mr.set(r[4],r[5],r[6]).length(),a=mr.set(r[8],r[9],r[10]).length();this.determinant()<0&&(s=-s),e.x=r[12],e.y=r[13],e.z=r[14],wn.copy(this);const c=1/s,u=1/o,d=1/a;return wn.elements[0]*=c,wn.elements[1]*=c,wn.elements[2]*=c,wn.elements[4]*=u,wn.elements[5]*=u,wn.elements[6]*=u,wn.elements[8]*=d,wn.elements[9]*=d,wn.elements[10]*=d,t.setFromRotationMatrix(wn),n.x=s,n.y=o,n.z=a,this}makePerspective(e,t,n,r,s,o,a=Gn,l=!1){const c=this.elements,u=2*s/(t-e),d=2*s/(n-r),h=(t+e)/(t-e),f=(n+r)/(n-r);let g,_;if(l)g=s/(o-s),_=o*s/(o-s);else if(a===Gn)g=-(o+s)/(o-s),_=-2*o*s/(o-s);else if(a===ta)g=-o/(o-s),_=-o*s/(o-s);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return c[0]=u,c[4]=0,c[8]=h,c[12]=0,c[1]=0,c[5]=d,c[9]=f,c[13]=0,c[2]=0,c[6]=0,c[10]=g,c[14]=_,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,r,s,o,a=Gn,l=!1){const c=this.elements,u=2/(t-e),d=2/(n-r),h=-(t+e)/(t-e),f=-(n+r)/(n-r);let g,_;if(l)g=1/(o-s),_=o/(o-s);else if(a===Gn)g=-2/(o-s),_=-(o+s)/(o-s);else if(a===ta)g=-1/(o-s),_=-s/(o-s);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return c[0]=u,c[4]=0,c[8]=0,c[12]=h,c[1]=0,c[5]=d,c[9]=0,c[13]=f,c[2]=0,c[6]=0,c[10]=g,c[14]=_,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){const t=this.elements,n=e.elements;for(let r=0;r<16;r++)if(t[r]!==n[r])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}}const mr=new I,wn=new $e,am=new I(0,0,0),lm=new I(1,1,1),_i=new I,uo=new I,dn=new I,fu=new $e,pu=new Pn;class Dn{constructor(e=0,t=0,n=0,r=Dn.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=r}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,r=this._order){return this._x=e,this._y=t,this._z=n,this._order=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){const r=e.elements,s=r[0],o=r[4],a=r[8],l=r[1],c=r[5],u=r[9],d=r[2],h=r[6],f=r[10];switch(t){case"XYZ":this._y=Math.asin(nt(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-u,f),this._z=Math.atan2(-o,s)):(this._x=Math.atan2(h,c),this._z=0);break;case"YXZ":this._x=Math.asin(-nt(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(a,f),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-d,s),this._z=0);break;case"ZXY":this._x=Math.asin(nt(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(-d,f),this._z=Math.atan2(-o,c)):(this._y=0,this._z=Math.atan2(l,s));break;case"ZYX":this._y=Math.asin(-nt(d,-1,1)),Math.abs(d)<.9999999?(this._x=Math.atan2(h,f),this._z=Math.atan2(l,s)):(this._x=0,this._z=Math.atan2(-o,c));break;case"YZX":this._z=Math.asin(nt(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-u,c),this._y=Math.atan2(-d,s)):(this._x=0,this._y=Math.atan2(a,f));break;case"XZY":this._z=Math.asin(-nt(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(h,c),this._y=Math.atan2(a,s)):(this._x=Math.atan2(-u,f),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return fu.makeRotationFromQuaternion(e),this.setFromRotationMatrix(fu,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return pu.setFromEuler(this),this.setFromQuaternion(pu,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}Dn.DEFAULT_ORDER="XYZ";class Mh{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let cm=0;const mu=new I,gr=new Pn,ei=new $e,ho=new I,ms=new I,um=new I,dm=new Pn,gu=new I(1,0,0),_u=new I(0,1,0),vu=new I(0,0,1),xu={type:"added"},hm={type:"removed"},_r={type:"childadded",child:null},wa={type:"childremoved",child:null};class Mt extends Zr{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:cm++}),this.uuid=Sn(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=Mt.DEFAULT_UP.clone();const e=new I,t=new Dn,n=new Pn,r=new I(1,1,1);function s(){n.setFromEuler(t,!1)}function o(){t.setFromQuaternion(n,void 0,!1)}t._onChange(s),n._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:r},modelViewMatrix:{value:new $e},normalMatrix:{value:new Qe}}),this.matrix=new $e,this.matrixWorld=new $e,this.matrixAutoUpdate=Mt.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=Mt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Mh,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return gr.setFromAxisAngle(e,t),this.quaternion.multiply(gr),this}rotateOnWorldAxis(e,t){return gr.setFromAxisAngle(e,t),this.quaternion.premultiply(gr),this}rotateX(e){return this.rotateOnAxis(gu,e)}rotateY(e){return this.rotateOnAxis(_u,e)}rotateZ(e){return this.rotateOnAxis(vu,e)}translateOnAxis(e,t){return mu.copy(e).applyQuaternion(this.quaternion),this.position.add(mu.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(gu,e)}translateY(e){return this.translateOnAxis(_u,e)}translateZ(e){return this.translateOnAxis(vu,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(ei.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?ho.copy(e):ho.set(e,t,n);const r=this.parent;this.updateWorldMatrix(!0,!1),ms.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?ei.lookAt(ms,ho,this.up):ei.lookAt(ho,ms,this.up),this.quaternion.setFromRotationMatrix(ei),r&&(ei.extractRotation(r.matrixWorld),gr.setFromRotationMatrix(ei),this.quaternion.premultiply(gr.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(xu),_r.child=e,this.dispatchEvent(_r),_r.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(hm),wa.child=e,this.dispatchEvent(wa),wa.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),ei.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),ei.multiply(e.parent.matrixWorld)),e.applyMatrix4(ei),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(xu),_r.child=e,this.dispatchEvent(_r),_r.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,r=this.children.length;n<r;n++){const o=this.children[n].getObjectByProperty(e,t);if(o!==void 0)return o}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);const r=this.children;for(let s=0,o=r.length;s<o;s++)r[s].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(ms,e,um),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(ms,dm,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);const t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t){const n=this.parent;if(e===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){const r=this.children;for(let s=0,o=r.length;s<o;s++)r[s].updateWorldMatrix(!1,!0)}}toJSON(e){const t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});const r={};r.uuid=this.uuid,r.type=this.type,this.name!==""&&(r.name=this.name),this.castShadow===!0&&(r.castShadow=!0),this.receiveShadow===!0&&(r.receiveShadow=!0),this.visible===!1&&(r.visible=!1),this.frustumCulled===!1&&(r.frustumCulled=!1),this.renderOrder!==0&&(r.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(r.userData=this.userData),r.layers=this.layers.mask,r.matrix=this.matrix.toArray(),r.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(r.matrixAutoUpdate=!1),this.isInstancedMesh&&(r.type="InstancedMesh",r.count=this.count,r.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(r.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(r.type="BatchedMesh",r.perObjectFrustumCulled=this.perObjectFrustumCulled,r.sortObjects=this.sortObjects,r.drawRanges=this._drawRanges,r.reservedRanges=this._reservedRanges,r.geometryInfo=this._geometryInfo.map(a=>({...a,boundingBox:a.boundingBox?a.boundingBox.toJSON():void 0,boundingSphere:a.boundingSphere?a.boundingSphere.toJSON():void 0})),r.instanceInfo=this._instanceInfo.map(a=>({...a})),r.availableInstanceIds=this._availableInstanceIds.slice(),r.availableGeometryIds=this._availableGeometryIds.slice(),r.nextIndexStart=this._nextIndexStart,r.nextVertexStart=this._nextVertexStart,r.geometryCount=this._geometryCount,r.maxInstanceCount=this._maxInstanceCount,r.maxVertexCount=this._maxVertexCount,r.maxIndexCount=this._maxIndexCount,r.geometryInitialized=this._geometryInitialized,r.matricesTexture=this._matricesTexture.toJSON(e),r.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(r.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(r.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(r.boundingBox=this.boundingBox.toJSON()));function s(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?r.background=this.background.toJSON():this.background.isTexture&&(r.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(r.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){r.geometry=s(e.geometries,this.geometry);const a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){const l=a.shapes;if(Array.isArray(l))for(let c=0,u=l.length;c<u;c++){const d=l[c];s(e.shapes,d)}else s(e.shapes,l)}}if(this.isSkinnedMesh&&(r.bindMode=this.bindMode,r.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(s(e.skeletons,this.skeleton),r.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const a=[];for(let l=0,c=this.material.length;l<c;l++)a.push(s(e.materials,this.material[l]));r.material=a}else r.material=s(e.materials,this.material);if(this.children.length>0){r.children=[];for(let a=0;a<this.children.length;a++)r.children.push(this.children[a].toJSON(e).object)}if(this.animations.length>0){r.animations=[];for(let a=0;a<this.animations.length;a++){const l=this.animations[a];r.animations.push(s(e.animations,l))}}if(t){const a=o(e.geometries),l=o(e.materials),c=o(e.textures),u=o(e.images),d=o(e.shapes),h=o(e.skeletons),f=o(e.animations),g=o(e.nodes);a.length>0&&(n.geometries=a),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),u.length>0&&(n.images=u),d.length>0&&(n.shapes=d),h.length>0&&(n.skeletons=h),f.length>0&&(n.animations=f),g.length>0&&(n.nodes=g)}return n.object=r,n;function o(a){const l=[];for(const c in a){const u=a[c];delete u.metadata,l.push(u)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){const r=e.children[n];this.add(r.clone())}return this}}Mt.DEFAULT_UP=new I(0,1,0);Mt.DEFAULT_MATRIX_AUTO_UPDATE=!0;Mt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const En=new I,ti=new I,Ea=new I,ni=new I,vr=new I,xr=new I,yu=new I,Ta=new I,Aa=new I,Ca=new I,Ra=new ut,La=new ut,Pa=new ut;class Cn{constructor(e=new I,t=new I,n=new I){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,r){r.subVectors(n,t),En.subVectors(e,t),r.cross(En);const s=r.lengthSq();return s>0?r.multiplyScalar(1/Math.sqrt(s)):r.set(0,0,0)}static getBarycoord(e,t,n,r,s){En.subVectors(r,t),ti.subVectors(n,t),Ea.subVectors(e,t);const o=En.dot(En),a=En.dot(ti),l=En.dot(Ea),c=ti.dot(ti),u=ti.dot(Ea),d=o*c-a*a;if(d===0)return s.set(0,0,0),null;const h=1/d,f=(c*l-a*u)*h,g=(o*u-a*l)*h;return s.set(1-f-g,g,f)}static containsPoint(e,t,n,r){return this.getBarycoord(e,t,n,r,ni)===null?!1:ni.x>=0&&ni.y>=0&&ni.x+ni.y<=1}static getInterpolation(e,t,n,r,s,o,a,l){return this.getBarycoord(e,t,n,r,ni)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(s,ni.x),l.addScaledVector(o,ni.y),l.addScaledVector(a,ni.z),l)}static getInterpolatedAttribute(e,t,n,r,s,o){return Ra.setScalar(0),La.setScalar(0),Pa.setScalar(0),Ra.fromBufferAttribute(e,t),La.fromBufferAttribute(e,n),Pa.fromBufferAttribute(e,r),o.setScalar(0),o.addScaledVector(Ra,s.x),o.addScaledVector(La,s.y),o.addScaledVector(Pa,s.z),o}static isFrontFacing(e,t,n,r){return En.subVectors(n,t),ti.subVectors(e,t),En.cross(ti).dot(r)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,r){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[r]),this}setFromAttributeAndIndices(e,t,n,r){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,r),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return En.subVectors(this.c,this.b),ti.subVectors(this.a,this.b),En.cross(ti).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return Cn.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return Cn.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,r,s){return Cn.getInterpolation(e,this.a,this.b,this.c,t,n,r,s)}containsPoint(e){return Cn.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return Cn.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const n=this.a,r=this.b,s=this.c;let o,a;vr.subVectors(r,n),xr.subVectors(s,n),Ta.subVectors(e,n);const l=vr.dot(Ta),c=xr.dot(Ta);if(l<=0&&c<=0)return t.copy(n);Aa.subVectors(e,r);const u=vr.dot(Aa),d=xr.dot(Aa);if(u>=0&&d<=u)return t.copy(r);const h=l*d-u*c;if(h<=0&&l>=0&&u<=0)return o=l/(l-u),t.copy(n).addScaledVector(vr,o);Ca.subVectors(e,s);const f=vr.dot(Ca),g=xr.dot(Ca);if(g>=0&&f<=g)return t.copy(s);const _=f*c-l*g;if(_<=0&&c>=0&&g<=0)return a=c/(c-g),t.copy(n).addScaledVector(xr,a);const m=u*g-f*d;if(m<=0&&d-u>=0&&f-g>=0)return yu.subVectors(s,r),a=(d-u)/(d-u+(f-g)),t.copy(r).addScaledVector(yu,a);const p=1/(m+_+h);return o=_*p,a=h*p,t.copy(n).addScaledVector(vr,o).addScaledVector(xr,a)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}const bh={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},vi={h:0,s:0,l:0},fo={h:0,s:0,l:0};function Ia(i,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?i+(e-i)*6*t:t<1/2?e:t<2/3?i+(e-i)*6*(2/3-t):i}class Ge{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){const r=e;r&&r.isColor?this.copy(r):typeof r=="number"?this.setHex(r):typeof r=="string"&&this.setStyle(r)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Ut){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,ot.colorSpaceToWorking(this,t),this}setRGB(e,t,n,r=ot.workingColorSpace){return this.r=e,this.g=t,this.b=n,ot.colorSpaceToWorking(this,r),this}setHSL(e,t,n,r=ot.workingColorSpace){if(e=Cc(e,1),t=nt(t,0,1),n=nt(n,0,1),t===0)this.r=this.g=this.b=n;else{const s=n<=.5?n*(1+t):n+t-n*t,o=2*n-s;this.r=Ia(o,s,e+1/3),this.g=Ia(o,s,e),this.b=Ia(o,s,e-1/3)}return ot.colorSpaceToWorking(this,r),this}setStyle(e,t=Ut){function n(s){s!==void 0&&parseFloat(s)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let r;if(r=/^(\w+)\(([^\)]*)\)/.exec(e)){let s;const o=r[1],a=r[2];switch(o){case"rgb":case"rgba":if(s=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(s[4]),this.setRGB(Math.min(255,parseInt(s[1],10))/255,Math.min(255,parseInt(s[2],10))/255,Math.min(255,parseInt(s[3],10))/255,t);if(s=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(s[4]),this.setRGB(Math.min(100,parseInt(s[1],10))/100,Math.min(100,parseInt(s[2],10))/100,Math.min(100,parseInt(s[3],10))/100,t);break;case"hsl":case"hsla":if(s=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(s[4]),this.setHSL(parseFloat(s[1])/360,parseFloat(s[2])/100,parseFloat(s[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(r=/^\#([A-Fa-f\d]+)$/.exec(e)){const s=r[1],o=s.length;if(o===3)return this.setRGB(parseInt(s.charAt(0),16)/15,parseInt(s.charAt(1),16)/15,parseInt(s.charAt(2),16)/15,t);if(o===6)return this.setHex(parseInt(s,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Ut){const n=bh[e.toLowerCase()];return n!==void 0?this.setHex(n,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=ci(e.r),this.g=ci(e.g),this.b=ci(e.b),this}copyLinearToSRGB(e){return this.r=Dr(e.r),this.g=Dr(e.g),this.b=Dr(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Ut){return ot.workingToColorSpace(Vt.copy(this),e),Math.round(nt(Vt.r*255,0,255))*65536+Math.round(nt(Vt.g*255,0,255))*256+Math.round(nt(Vt.b*255,0,255))}getHexString(e=Ut){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=ot.workingColorSpace){ot.workingToColorSpace(Vt.copy(this),t);const n=Vt.r,r=Vt.g,s=Vt.b,o=Math.max(n,r,s),a=Math.min(n,r,s);let l,c;const u=(a+o)/2;if(a===o)l=0,c=0;else{const d=o-a;switch(c=u<=.5?d/(o+a):d/(2-o-a),o){case n:l=(r-s)/d+(r<s?6:0);break;case r:l=(s-n)/d+2;break;case s:l=(n-r)/d+4;break}l/=6}return e.h=l,e.s=c,e.l=u,e}getRGB(e,t=ot.workingColorSpace){return ot.workingToColorSpace(Vt.copy(this),t),e.r=Vt.r,e.g=Vt.g,e.b=Vt.b,e}getStyle(e=Ut){ot.workingToColorSpace(Vt.copy(this),e);const t=Vt.r,n=Vt.g,r=Vt.b;return e!==Ut?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${r.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(r*255)})`}offsetHSL(e,t,n){return this.getHSL(vi),this.setHSL(vi.h+e,vi.s+t,vi.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(vi),e.getHSL(fo);const n=As(vi.h,fo.h,t),r=As(vi.s,fo.s,t),s=As(vi.l,fo.l,t);return this.setHSL(n,r,s),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,n=this.g,r=this.b,s=e.elements;return this.r=s[0]*t+s[3]*n+s[6]*r,this.g=s[1]*t+s[4]*n+s[7]*r,this.b=s[2]*t+s[5]*n+s[8]*r,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const Vt=new Ge;Ge.NAMES=bh;let fm=0;class Xn extends Zr{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:fm++}),this.uuid=Sn(),this.name="",this.type="Material",this.blending=Nr,this.side=Kn,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=cl,this.blendDst=ul,this.blendEquation=Ki,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Ge(0,0,0),this.blendAlpha=0,this.depthFunc=Br,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=ou,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=ur,this.stencilZFail=ur,this.stencilZPass=ur,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const n=e[t];if(n===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}const r=this[t];if(r===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}r&&r.isColor?r.set(n):r&&r.isVector3&&n&&n.isVector3?r.copy(n):this[t]=n}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==Nr&&(n.blending=this.blending),this.side!==Kn&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==cl&&(n.blendSrc=this.blendSrc),this.blendDst!==ul&&(n.blendDst=this.blendDst),this.blendEquation!==Ki&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==Br&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==ou&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==ur&&(n.stencilFail=this.stencilFail),this.stencilZFail!==ur&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==ur&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function r(s){const o=[];for(const a in s){const l=s[a];delete l.metadata,o.push(l)}return o}if(t){const s=r(e.textures),o=r(e.images);s.length>0&&(n.textures=s),o.length>0&&(n.images=o)}return n}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let n=null;if(t!==null){const r=t.length;n=new Array(r);for(let s=0;s!==r;++s)n[s]=t[s].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}}class oi extends Xn{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Ge(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Dn,this.combine=ah,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const Pt=new I,po=new _e;let pm=0;class Bt{constructor(e,t,n=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:pm++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=Yl,this.updateRanges=[],this.gpuType=Rn,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let r=0,s=this.itemSize;r<s;r++)this.array[e+r]=t.array[n+r];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)po.fromBufferAttribute(this,t),po.applyMatrix3(e),this.setXY(t,po.x,po.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)Pt.fromBufferAttribute(this,t),Pt.applyMatrix3(e),this.setXYZ(t,Pt.x,Pt.y,Pt.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)Pt.fromBufferAttribute(this,t),Pt.applyMatrix4(e),this.setXYZ(t,Pt.x,Pt.y,Pt.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Pt.fromBufferAttribute(this,t),Pt.applyNormalMatrix(e),this.setXYZ(t,Pt.x,Pt.y,Pt.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Pt.fromBufferAttribute(this,t),Pt.transformDirection(e),this.setXYZ(t,Pt.x,Pt.y,Pt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=An(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=ft(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=An(t,this.array)),t}setX(e,t){return this.normalized&&(t=ft(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=An(t,this.array)),t}setY(e,t){return this.normalized&&(t=ft(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=An(t,this.array)),t}setZ(e,t){return this.normalized&&(t=ft(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=An(t,this.array)),t}setW(e,t){return this.normalized&&(t=ft(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=ft(t,this.array),n=ft(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,r){return e*=this.itemSize,this.normalized&&(t=ft(t,this.array),n=ft(n,this.array),r=ft(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this}setXYZW(e,t,n,r,s){return e*=this.itemSize,this.normalized&&(t=ft(t,this.array),n=ft(n,this.array),r=ft(r,this.array),s=ft(s,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this.array[e+3]=s,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==Yl&&(e.usage=this.usage),e}}class wh extends Bt{constructor(e,t,n){super(new Uint16Array(e),t,n)}}class Eh extends Bt{constructor(e,t,n){super(new Uint32Array(e),t,n)}}class Xt extends Bt{constructor(e,t,n){super(new Float32Array(e),t,n)}}let mm=0;const vn=new $e,Na=new Mt,yr=new I,hn=new Nn,gs=new Nn,Dt=new I;class ln extends Zr{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:mm++}),this.uuid=Sn(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(yh(e)?Eh:wh)(e,1):this.index=e,this}setIndirect(e){return this.indirect=e,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const n=this.attributes.normal;if(n!==void 0){const s=new Qe().getNormalMatrix(e);n.applyNormalMatrix(s),n.needsUpdate=!0}const r=this.attributes.tangent;return r!==void 0&&(r.transformDirection(e),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return vn.makeRotationFromQuaternion(e),this.applyMatrix4(vn),this}rotateX(e){return vn.makeRotationX(e),this.applyMatrix4(vn),this}rotateY(e){return vn.makeRotationY(e),this.applyMatrix4(vn),this}rotateZ(e){return vn.makeRotationZ(e),this.applyMatrix4(vn),this}translate(e,t,n){return vn.makeTranslation(e,t,n),this.applyMatrix4(vn),this}scale(e,t,n){return vn.makeScale(e,t,n),this.applyMatrix4(vn),this}lookAt(e){return Na.lookAt(e),Na.updateMatrix(),this.applyMatrix4(Na.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(yr).negate(),this.translate(yr.x,yr.y,yr.z),this}setFromPoints(e){const t=this.getAttribute("position");if(t===void 0){const n=[];for(let r=0,s=e.length;r<s;r++){const o=e[r];n.push(o.x,o.y,o.z||0)}this.setAttribute("position",new Xt(n,3))}else{const n=Math.min(e.length,t.count);for(let r=0;r<n;r++){const s=e[r];t.setXYZ(r,s.x,s.y,s.z||0)}e.length>t.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Nn);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new I(-1/0,-1/0,-1/0),new I(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,r=t.length;n<r;n++){const s=t[n];hn.setFromBufferAttribute(s),this.morphTargetsRelative?(Dt.addVectors(this.boundingBox.min,hn.min),this.boundingBox.expandByPoint(Dt),Dt.addVectors(this.boundingBox.max,hn.max),this.boundingBox.expandByPoint(Dt)):(this.boundingBox.expandByPoint(hn.min),this.boundingBox.expandByPoint(hn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new $n);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new I,1/0);return}if(e){const n=this.boundingSphere.center;if(hn.setFromBufferAttribute(e),t)for(let s=0,o=t.length;s<o;s++){const a=t[s];gs.setFromBufferAttribute(a),this.morphTargetsRelative?(Dt.addVectors(hn.min,gs.min),hn.expandByPoint(Dt),Dt.addVectors(hn.max,gs.max),hn.expandByPoint(Dt)):(hn.expandByPoint(gs.min),hn.expandByPoint(gs.max))}hn.getCenter(n);let r=0;for(let s=0,o=e.count;s<o;s++)Dt.fromBufferAttribute(e,s),r=Math.max(r,n.distanceToSquared(Dt));if(t)for(let s=0,o=t.length;s<o;s++){const a=t[s],l=this.morphTargetsRelative;for(let c=0,u=a.count;c<u;c++)Dt.fromBufferAttribute(a,c),l&&(yr.fromBufferAttribute(e,c),Dt.add(yr)),r=Math.max(r,n.distanceToSquared(Dt))}this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const n=t.position,r=t.normal,s=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new Bt(new Float32Array(4*n.count),4));const o=this.getAttribute("tangent"),a=[],l=[];for(let N=0;N<n.count;N++)a[N]=new I,l[N]=new I;const c=new I,u=new I,d=new I,h=new _e,f=new _e,g=new _e,_=new I,m=new I;function p(N,w,y){c.fromBufferAttribute(n,N),u.fromBufferAttribute(n,w),d.fromBufferAttribute(n,y),h.fromBufferAttribute(s,N),f.fromBufferAttribute(s,w),g.fromBufferAttribute(s,y),u.sub(c),d.sub(c),f.sub(h),g.sub(h);const L=1/(f.x*g.y-g.x*f.y);isFinite(L)&&(_.copy(u).multiplyScalar(g.y).addScaledVector(d,-f.y).multiplyScalar(L),m.copy(d).multiplyScalar(f.x).addScaledVector(u,-g.x).multiplyScalar(L),a[N].add(_),a[w].add(_),a[y].add(_),l[N].add(m),l[w].add(m),l[y].add(m))}let M=this.groups;M.length===0&&(M=[{start:0,count:e.count}]);for(let N=0,w=M.length;N<w;++N){const y=M[N],L=y.start,k=y.count;for(let W=L,X=L+k;W<X;W+=3)p(e.getX(W+0),e.getX(W+1),e.getX(W+2))}const S=new I,x=new I,A=new I,C=new I;function R(N){A.fromBufferAttribute(r,N),C.copy(A);const w=a[N];S.copy(w),S.sub(A.multiplyScalar(A.dot(w))).normalize(),x.crossVectors(C,w);const L=x.dot(l[N])<0?-1:1;o.setXYZW(N,S.x,S.y,S.z,L)}for(let N=0,w=M.length;N<w;++N){const y=M[N],L=y.start,k=y.count;for(let W=L,X=L+k;W<X;W+=3)R(e.getX(W+0)),R(e.getX(W+1)),R(e.getX(W+2))}}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new Bt(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let h=0,f=n.count;h<f;h++)n.setXYZ(h,0,0,0);const r=new I,s=new I,o=new I,a=new I,l=new I,c=new I,u=new I,d=new I;if(e)for(let h=0,f=e.count;h<f;h+=3){const g=e.getX(h+0),_=e.getX(h+1),m=e.getX(h+2);r.fromBufferAttribute(t,g),s.fromBufferAttribute(t,_),o.fromBufferAttribute(t,m),u.subVectors(o,s),d.subVectors(r,s),u.cross(d),a.fromBufferAttribute(n,g),l.fromBufferAttribute(n,_),c.fromBufferAttribute(n,m),a.add(u),l.add(u),c.add(u),n.setXYZ(g,a.x,a.y,a.z),n.setXYZ(_,l.x,l.y,l.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let h=0,f=t.count;h<f;h+=3)r.fromBufferAttribute(t,h+0),s.fromBufferAttribute(t,h+1),o.fromBufferAttribute(t,h+2),u.subVectors(o,s),d.subVectors(r,s),u.cross(d),n.setXYZ(h+0,u.x,u.y,u.z),n.setXYZ(h+1,u.x,u.y,u.z),n.setXYZ(h+2,u.x,u.y,u.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)Dt.fromBufferAttribute(e,t),Dt.normalize(),e.setXYZ(t,Dt.x,Dt.y,Dt.z)}toNonIndexed(){function e(a,l){const c=a.array,u=a.itemSize,d=a.normalized,h=new c.constructor(l.length*u);let f=0,g=0;for(let _=0,m=l.length;_<m;_++){a.isInterleavedBufferAttribute?f=l[_]*a.data.stride+a.offset:f=l[_]*u;for(let p=0;p<u;p++)h[g++]=c[f++]}return new Bt(h,u,d)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new ln,n=this.index.array,r=this.attributes;for(const a in r){const l=r[a],c=e(l,n);t.setAttribute(a,c)}const s=this.morphAttributes;for(const a in s){const l=[],c=s[a];for(let u=0,d=c.length;u<d;u++){const h=c[u],f=e(h,n);l.push(f)}t.morphAttributes[a]=l}t.morphTargetsRelative=this.morphTargetsRelative;const o=this.groups;for(let a=0,l=o.length;a<l;a++){const c=o[a];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){const e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){const l=this.parameters;for(const c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const n=this.attributes;for(const l in n){const c=n[l];e.data.attributes[l]=c.toJSON(e.data)}const r={};let s=!1;for(const l in this.morphAttributes){const c=this.morphAttributes[l],u=[];for(let d=0,h=c.length;d<h;d++){const f=c[d];u.push(f.toJSON(e.data))}u.length>0&&(r[l]=u,s=!0)}s&&(e.data.morphAttributes=r,e.data.morphTargetsRelative=this.morphTargetsRelative);const o=this.groups;o.length>0&&(e.data.groups=JSON.parse(JSON.stringify(o)));const a=this.boundingSphere;return a!==null&&(e.data.boundingSphere=a.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const n=e.index;n!==null&&this.setIndex(n.clone());const r=e.attributes;for(const c in r){const u=r[c];this.setAttribute(c,u.clone(t))}const s=e.morphAttributes;for(const c in s){const u=[],d=s[c];for(let h=0,f=d.length;h<f;h++)u.push(d[h].clone(t));this.morphAttributes[c]=u}this.morphTargetsRelative=e.morphTargetsRelative;const o=e.groups;for(let c=0,u=o.length;c<u;c++){const d=o[c];this.addGroup(d.start,d.count,d.materialIndex)}const a=e.boundingBox;a!==null&&(this.boundingBox=a.clone());const l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const Su=new $e,Bi=new la,mo=new $n,Mu=new I,go=new I,_o=new I,vo=new I,Da=new I,xo=new I,bu=new I,yo=new I;class kt extends Mt{constructor(e=new ln,t=new oi){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const r=t[n[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,o=r.length;s<o;s++){const a=r[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=s}}}}getVertexPosition(e,t){const n=this.geometry,r=n.attributes.position,s=n.morphAttributes.position,o=n.morphTargetsRelative;t.fromBufferAttribute(r,e);const a=this.morphTargetInfluences;if(s&&a){xo.set(0,0,0);for(let l=0,c=s.length;l<c;l++){const u=a[l],d=s[l];u!==0&&(Da.fromBufferAttribute(d,e),o?xo.addScaledVector(Da,u):xo.addScaledVector(Da.sub(t),u))}t.add(xo)}return t}raycast(e,t){const n=this.geometry,r=this.material,s=this.matrixWorld;r!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),mo.copy(n.boundingSphere),mo.applyMatrix4(s),Bi.copy(e.ray).recast(e.near),!(mo.containsPoint(Bi.origin)===!1&&(Bi.intersectSphere(mo,Mu)===null||Bi.origin.distanceToSquared(Mu)>(e.far-e.near)**2))&&(Su.copy(s).invert(),Bi.copy(e.ray).applyMatrix4(Su),!(n.boundingBox!==null&&Bi.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,Bi)))}_computeIntersections(e,t,n){let r;const s=this.geometry,o=this.material,a=s.index,l=s.attributes.position,c=s.attributes.uv,u=s.attributes.uv1,d=s.attributes.normal,h=s.groups,f=s.drawRange;if(a!==null)if(Array.isArray(o))for(let g=0,_=h.length;g<_;g++){const m=h[g],p=o[m.materialIndex],M=Math.max(m.start,f.start),S=Math.min(a.count,Math.min(m.start+m.count,f.start+f.count));for(let x=M,A=S;x<A;x+=3){const C=a.getX(x),R=a.getX(x+1),N=a.getX(x+2);r=So(this,p,e,n,c,u,d,C,R,N),r&&(r.faceIndex=Math.floor(x/3),r.face.materialIndex=m.materialIndex,t.push(r))}}else{const g=Math.max(0,f.start),_=Math.min(a.count,f.start+f.count);for(let m=g,p=_;m<p;m+=3){const M=a.getX(m),S=a.getX(m+1),x=a.getX(m+2);r=So(this,o,e,n,c,u,d,M,S,x),r&&(r.faceIndex=Math.floor(m/3),t.push(r))}}else if(l!==void 0)if(Array.isArray(o))for(let g=0,_=h.length;g<_;g++){const m=h[g],p=o[m.materialIndex],M=Math.max(m.start,f.start),S=Math.min(l.count,Math.min(m.start+m.count,f.start+f.count));for(let x=M,A=S;x<A;x+=3){const C=x,R=x+1,N=x+2;r=So(this,p,e,n,c,u,d,C,R,N),r&&(r.faceIndex=Math.floor(x/3),r.face.materialIndex=m.materialIndex,t.push(r))}}else{const g=Math.max(0,f.start),_=Math.min(l.count,f.start+f.count);for(let m=g,p=_;m<p;m+=3){const M=m,S=m+1,x=m+2;r=So(this,o,e,n,c,u,d,M,S,x),r&&(r.faceIndex=Math.floor(m/3),t.push(r))}}}}function gm(i,e,t,n,r,s,o,a){let l;if(e.side===tn?l=n.intersectTriangle(o,s,r,!0,a):l=n.intersectTriangle(r,s,o,e.side===Kn,a),l===null)return null;yo.copy(a),yo.applyMatrix4(i.matrixWorld);const c=t.ray.origin.distanceTo(yo);return c<t.near||c>t.far?null:{distance:c,point:yo.clone(),object:i}}function So(i,e,t,n,r,s,o,a,l,c){i.getVertexPosition(a,go),i.getVertexPosition(l,_o),i.getVertexPosition(c,vo);const u=gm(i,e,t,n,go,_o,vo,bu);if(u){const d=new I;Cn.getBarycoord(bu,go,_o,vo,d),r&&(u.uv=Cn.getInterpolatedAttribute(r,a,l,c,d,new _e)),s&&(u.uv1=Cn.getInterpolatedAttribute(s,a,l,c,d,new _e)),o&&(u.normal=Cn.getInterpolatedAttribute(o,a,l,c,d,new I),u.normal.dot(n.direction)>0&&u.normal.multiplyScalar(-1));const h={a,b:l,c,normal:new I,materialIndex:0};Cn.getNormal(go,_o,vo,h.normal),u.face=h,u.barycoord=d}return u}class Js extends ln{constructor(e=1,t=1,n=1,r=1,s=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:r,heightSegments:s,depthSegments:o};const a=this;r=Math.floor(r),s=Math.floor(s),o=Math.floor(o);const l=[],c=[],u=[],d=[];let h=0,f=0;g("z","y","x",-1,-1,n,t,e,o,s,0),g("z","y","x",1,-1,n,t,-e,o,s,1),g("x","z","y",1,1,e,n,t,r,o,2),g("x","z","y",1,-1,e,n,-t,r,o,3),g("x","y","z",1,-1,e,t,n,r,s,4),g("x","y","z",-1,-1,e,t,-n,r,s,5),this.setIndex(l),this.setAttribute("position",new Xt(c,3)),this.setAttribute("normal",new Xt(u,3)),this.setAttribute("uv",new Xt(d,2));function g(_,m,p,M,S,x,A,C,R,N,w){const y=x/R,L=A/N,k=x/2,W=A/2,X=C/2,q=R+1,z=N+1;let oe=0,V=0;const pe=new I;for(let K=0;K<z;K++){const ne=K*L-W;for(let ce=0;ce<q;ce++){const ae=ce*y-k;pe[_]=ae*M,pe[m]=ne*S,pe[p]=X,c.push(pe.x,pe.y,pe.z),pe[_]=0,pe[m]=0,pe[p]=C>0?1:-1,u.push(pe.x,pe.y,pe.z),d.push(ce/R),d.push(1-K/N),oe+=1}}for(let K=0;K<N;K++)for(let ne=0;ne<R;ne++){const ce=h+ne+q*K,ae=h+ne+q*(K+1),ye=h+(ne+1)+q*(K+1),Ue=h+(ne+1)+q*K;l.push(ce,ae,Ue),l.push(ae,ye,Ue),V+=6}a.addGroup(f,V,w),f+=V,h+=oe}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Js(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}function Wr(i){const e={};for(const t in i){e[t]={};for(const n in i[t]){const r=i[t][n];r&&(r.isColor||r.isMatrix3||r.isMatrix4||r.isVector2||r.isVector3||r.isVector4||r.isTexture||r.isQuaternion)?r.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=r.clone():Array.isArray(r)?e[t][n]=r.slice():e[t][n]=r}}return e}function Yt(i){const e={};for(let t=0;t<i.length;t++){const n=Wr(i[t]);for(const r in n)e[r]=n[r]}return e}function _m(i){const e=[];for(let t=0;t<i.length;t++)e.push(i[t].clone());return e}function Th(i){const e=i.getRenderTarget();return e===null?i.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:ot.workingColorSpace}const Ah={clone:Wr,merge:Yt};var vm=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,xm=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class Un extends Xn{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=vm,this.fragmentShader=xm,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Wr(e.uniforms),this.uniformsGroups=_m(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const r in this.uniforms){const o=this.uniforms[r].value;o&&o.isTexture?t.uniforms[r]={type:"t",value:o.toJSON(e).uuid}:o&&o.isColor?t.uniforms[r]={type:"c",value:o.getHex()}:o&&o.isVector2?t.uniforms[r]={type:"v2",value:o.toArray()}:o&&o.isVector3?t.uniforms[r]={type:"v3",value:o.toArray()}:o&&o.isVector4?t.uniforms[r]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?t.uniforms[r]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?t.uniforms[r]={type:"m4",value:o.toArray()}:t.uniforms[r]={value:o}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const n={};for(const r in this.extensions)this.extensions[r]===!0&&(n[r]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}}class Ch extends Mt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new $e,this.projectionMatrix=new $e,this.projectionMatrixInverse=new $e,this.coordinateSystem=Gn,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const xi=new I,wu=new _e,Eu=new _e;class Jt extends Ch{constructor(e=50,t=1,n=.1,r=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=r,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=Gr*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(Ts*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Gr*2*Math.atan(Math.tan(Ts*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){xi.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(xi.x,xi.y).multiplyScalar(-e/xi.z),xi.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(xi.x,xi.y).multiplyScalar(-e/xi.z)}getViewSize(e,t){return this.getViewBounds(e,wu,Eu),t.subVectors(Eu,wu)}setViewOffset(e,t,n,r,s,o){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=s,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(Ts*.5*this.fov)/this.zoom,n=2*t,r=this.aspect*n,s=-.5*r;const o=this.view;if(this.view!==null&&this.view.enabled){const l=o.fullWidth,c=o.fullHeight;s+=o.offsetX*r/l,t-=o.offsetY*n/c,r*=o.width/l,n*=o.height/c}const a=this.filmOffset;a!==0&&(s+=e*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(s,s+r,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}const Sr=-90,Mr=1;class ym extends Mt{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;const r=new Jt(Sr,Mr,e,t);r.layers=this.layers,this.add(r);const s=new Jt(Sr,Mr,e,t);s.layers=this.layers,this.add(s);const o=new Jt(Sr,Mr,e,t);o.layers=this.layers,this.add(o);const a=new Jt(Sr,Mr,e,t);a.layers=this.layers,this.add(a);const l=new Jt(Sr,Mr,e,t);l.layers=this.layers,this.add(l);const c=new Jt(Sr,Mr,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[n,r,s,o,a,l]=t;for(const c of t)this.remove(c);if(e===Gn)n.up.set(0,1,0),n.lookAt(1,0,0),r.up.set(0,1,0),r.lookAt(-1,0,0),s.up.set(0,0,-1),s.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===ta)n.up.set(0,-1,0),n.lookAt(-1,0,0),r.up.set(0,-1,0),r.lookAt(1,0,0),s.up.set(0,0,1),s.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:n,activeMipmapLevel:r}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[s,o,a,l,c,u]=this.children,d=e.getRenderTarget(),h=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),g=e.xr.enabled;e.xr.enabled=!1;const _=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,e.setRenderTarget(n,0,r),e.render(t,s),e.setRenderTarget(n,1,r),e.render(t,o),e.setRenderTarget(n,2,r),e.render(t,a),e.setRenderTarget(n,3,r),e.render(t,l),e.setRenderTarget(n,4,r),e.render(t,c),n.texture.generateMipmaps=_,e.setRenderTarget(n,5,r),e.render(t,u),e.setRenderTarget(d,h,f),e.xr.enabled=g,n.texture.needsPMREMUpdate=!0}}class Rh extends Ft{constructor(e=[],t=zr,n,r,s,o,a,l,c,u){super(e,t,n,r,s,o,a,l,c,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class Sm extends di{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const n={width:e,height:e,depth:1},r=[n,n,n,n,n,n];this.texture=new Rh(r),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},r=new Js(5,5,5),s=new Un({name:"CubemapFromEquirect",uniforms:Wr(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:tn,blending:Ri});s.uniforms.tEquirect.value=t;const o=new kt(r,s),a=t.minFilter;return t.minFilter===si&&(t.minFilter=Zt),new ym(1,10,this).update(e,o),t.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(e,t=!0,n=!0,r=!0){const s=e.getRenderTarget();for(let o=0;o<6;o++)e.setRenderTarget(this,o),e.clear(t,n,r);e.setRenderTarget(s)}}class Ln extends Mt{constructor(){super(),this.isGroup=!0,this.type="Group"}}const Mm={type:"move"};class Ua{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Ln,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Ln,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new I,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new I),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Ln,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new I,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new I),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let r=null,s=null,o=null;const a=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){o=!0;for(const _ of e.hand.values()){const m=t.getJointPose(_,n),p=this._getHandJoint(c,_);m!==null&&(p.matrix.fromArray(m.transform.matrix),p.matrix.decompose(p.position,p.rotation,p.scale),p.matrixWorldNeedsUpdate=!0,p.jointRadius=m.radius),p.visible=m!==null}const u=c.joints["index-finger-tip"],d=c.joints["thumb-tip"],h=u.position.distanceTo(d.position),f=.02,g=.005;c.inputState.pinching&&h>f+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&h<=f-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(s=t.getPose(e.gripSpace,n),s!==null&&(l.matrix.fromArray(s.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,s.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(s.linearVelocity)):l.hasLinearVelocity=!1,s.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(s.angularVelocity)):l.hasAngularVelocity=!1));a!==null&&(r=t.getPose(e.targetRaySpace,n),r===null&&s!==null&&(r=s),r!==null&&(a.matrix.fromArray(r.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,r.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(r.linearVelocity)):a.hasLinearVelocity=!1,r.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(r.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(Mm)))}return a!==null&&(a.visible=r!==null),l!==null&&(l.visible=s!==null),c!==null&&(c.visible=o!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const n=new Ln;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}}class Tu extends Mt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Dn,this.environmentIntensity=1,this.environmentRotation=new Dn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}}class bm{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=Yl,this.updateRanges=[],this.version=0,this.uuid=Sn()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,n){e*=this.stride,n*=t.stride;for(let r=0,s=this.stride;r<s;r++)this.array[e+r]=t.array[n+r];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Sn()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);const t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(t,this.stride);return n.setUsage(this.usage),n}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){return e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Sn()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}}const $t=new I;class Lc{constructor(e,t,n,r=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=n,this.normalized=r}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,n=this.data.count;t<n;t++)$t.fromBufferAttribute(this,t),$t.applyMatrix4(e),this.setXYZ(t,$t.x,$t.y,$t.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)$t.fromBufferAttribute(this,t),$t.applyNormalMatrix(e),this.setXYZ(t,$t.x,$t.y,$t.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)$t.fromBufferAttribute(this,t),$t.transformDirection(e),this.setXYZ(t,$t.x,$t.y,$t.z);return this}getComponent(e,t){let n=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(n=An(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=ft(n,this.array)),this.data.array[e*this.data.stride+this.offset+t]=n,this}setX(e,t){return this.normalized&&(t=ft(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=ft(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=ft(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=ft(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=An(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=An(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=An(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=An(t,this.array)),t}setXY(e,t,n){return e=e*this.data.stride+this.offset,this.normalized&&(t=ft(t,this.array),n=ft(n,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this}setXYZ(e,t,n,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=ft(t,this.array),n=ft(n,this.array),r=ft(r,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=r,this}setXYZW(e,t,n,r,s){return e=e*this.data.stride+this.offset,this.normalized&&(t=ft(t,this.array),n=ft(n,this.array),r=ft(r,this.array),s=ft(s,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=r,this.data.array[e+3]=s,this}clone(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let n=0;n<this.count;n++){const r=n*this.data.stride+this.offset;for(let s=0;s<this.itemSize;s++)t.push(this.data.array[r+s])}return new Bt(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new Lc(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let n=0;n<this.count;n++){const r=n*this.data.stride+this.offset;for(let s=0;s<this.itemSize;s++)t.push(this.data.array[r+s])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}}const Au=new I,Cu=new ut,Ru=new ut,wm=new I,Lu=new $e,Mo=new I,Oa=new $n,Pu=new $e,Fa=new la;class Em extends kt{constructor(e,t){super(e,t),this.isSkinnedMesh=!0,this.type="SkinnedMesh",this.bindMode=nu,this.bindMatrix=new $e,this.bindMatrixInverse=new $e,this.boundingBox=null,this.boundingSphere=null}computeBoundingBox(){const e=this.geometry;this.boundingBox===null&&(this.boundingBox=new Nn),this.boundingBox.makeEmpty();const t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,Mo),this.boundingBox.expandByPoint(Mo)}computeBoundingSphere(){const e=this.geometry;this.boundingSphere===null&&(this.boundingSphere=new $n),this.boundingSphere.makeEmpty();const t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,Mo),this.boundingSphere.expandByPoint(Mo)}copy(e,t){return super.copy(e,t),this.bindMode=e.bindMode,this.bindMatrix.copy(e.bindMatrix),this.bindMatrixInverse.copy(e.bindMatrixInverse),this.skeleton=e.skeleton,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}raycast(e,t){const n=this.material,r=this.matrixWorld;n!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Oa.copy(this.boundingSphere),Oa.applyMatrix4(r),e.ray.intersectsSphere(Oa)!==!1&&(Pu.copy(r).invert(),Fa.copy(e.ray).applyMatrix4(Pu),!(this.boundingBox!==null&&Fa.intersectsBox(this.boundingBox)===!1)&&this._computeIntersections(e,t,Fa)))}getVertexPosition(e,t){return super.getVertexPosition(e,t),this.applyBoneTransform(e,t),t}bind(e,t){this.skeleton=e,t===void 0&&(this.updateMatrixWorld(!0),this.skeleton.calculateInverses(),t=this.matrixWorld),this.bindMatrix.copy(t),this.bindMatrixInverse.copy(t).invert()}pose(){this.skeleton.pose()}normalizeSkinWeights(){const e=new ut,t=this.geometry.attributes.skinWeight;for(let n=0,r=t.count;n<r;n++){e.fromBufferAttribute(t,n);const s=1/e.manhattanLength();s!==1/0?e.multiplyScalar(s):e.set(1,0,0,0),t.setXYZW(n,e.x,e.y,e.z,e.w)}}updateMatrixWorld(e){super.updateMatrixWorld(e),this.bindMode===nu?this.bindMatrixInverse.copy(this.matrixWorld).invert():this.bindMode===bp?this.bindMatrixInverse.copy(this.bindMatrix).invert():console.warn("THREE.SkinnedMesh: Unrecognized bindMode: "+this.bindMode)}applyBoneTransform(e,t){const n=this.skeleton,r=this.geometry;Cu.fromBufferAttribute(r.attributes.skinIndex,e),Ru.fromBufferAttribute(r.attributes.skinWeight,e),Au.copy(t).applyMatrix4(this.bindMatrix),t.set(0,0,0);for(let s=0;s<4;s++){const o=Ru.getComponent(s);if(o!==0){const a=Cu.getComponent(s);Lu.multiplyMatrices(n.bones[a].matrixWorld,n.boneInverses[a]),t.addScaledVector(wm.copy(Au).applyMatrix4(Lu),o)}}return t.applyMatrix4(this.bindMatrixInverse)}}class Lh extends Mt{constructor(){super(),this.isBone=!0,this.type="Bone"}}class Ph extends Ft{constructor(e=null,t=1,n=1,r,s,o,a,l,c=nn,u=nn,d,h){super(null,o,a,l,c,u,r,s,d,h),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}const Iu=new $e,Tm=new $e;class Pc{constructor(e=[],t=[]){this.uuid=Sn(),this.bones=e.slice(0),this.boneInverses=t,this.boneMatrices=null,this.boneTexture=null,this.init()}init(){const e=this.bones,t=this.boneInverses;if(this.boneMatrices=new Float32Array(e.length*16),t.length===0)this.calculateInverses();else if(e.length!==t.length){console.warn("THREE.Skeleton: Number of inverse bone matrices does not match amount of bones."),this.boneInverses=[];for(let n=0,r=this.bones.length;n<r;n++)this.boneInverses.push(new $e)}}calculateInverses(){this.boneInverses.length=0;for(let e=0,t=this.bones.length;e<t;e++){const n=new $e;this.bones[e]&&n.copy(this.bones[e].matrixWorld).invert(),this.boneInverses.push(n)}}pose(){for(let e=0,t=this.bones.length;e<t;e++){const n=this.bones[e];n&&n.matrixWorld.copy(this.boneInverses[e]).invert()}for(let e=0,t=this.bones.length;e<t;e++){const n=this.bones[e];n&&(n.parent&&n.parent.isBone?(n.matrix.copy(n.parent.matrixWorld).invert(),n.matrix.multiply(n.matrixWorld)):n.matrix.copy(n.matrixWorld),n.matrix.decompose(n.position,n.quaternion,n.scale))}}update(){const e=this.bones,t=this.boneInverses,n=this.boneMatrices,r=this.boneTexture;for(let s=0,o=e.length;s<o;s++){const a=e[s]?e[s].matrixWorld:Tm;Iu.multiplyMatrices(a,t[s]),Iu.toArray(n,s*16)}r!==null&&(r.needsUpdate=!0)}clone(){return new Pc(this.bones,this.boneInverses)}computeBoneTexture(){let e=Math.sqrt(this.bones.length*4);e=Math.ceil(e/4)*4,e=Math.max(e,4);const t=new Float32Array(e*e*4);t.set(this.boneMatrices);const n=new Ph(t,e,e,yn,Rn);return n.needsUpdate=!0,this.boneMatrices=t,this.boneTexture=n,this}getBoneByName(e){for(let t=0,n=this.bones.length;t<n;t++){const r=this.bones[t];if(r.name===e)return r}}dispose(){this.boneTexture!==null&&(this.boneTexture.dispose(),this.boneTexture=null)}fromJSON(e,t){this.uuid=e.uuid;for(let n=0,r=e.bones.length;n<r;n++){const s=e.bones[n];let o=t[s];o===void 0&&(console.warn("THREE.Skeleton: No bone found with UUID:",s),o=new Lh),this.bones.push(o),this.boneInverses.push(new $e().fromArray(e.boneInverses[n]))}return this.init(),this}toJSON(){const e={metadata:{version:4.7,type:"Skeleton",generator:"Skeleton.toJSON"},bones:[],boneInverses:[]};e.uuid=this.uuid;const t=this.bones,n=this.boneInverses;for(let r=0,s=t.length;r<s;r++){const o=t[r];e.bones.push(o.uuid);const a=n[r];e.boneInverses.push(a.toArray())}return e}}class jl extends Bt{constructor(e,t,n,r=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=r}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){const e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}}const br=new $e,Nu=new $e,bo=[],Du=new Nn,Am=new $e,_s=new kt,vs=new $n;class Hs extends kt{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new jl(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let r=0;r<n;r++)this.setMatrixAt(r,Am)}computeBoundingBox(){const e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new Nn),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,br),Du.copy(e.boundingBox).applyMatrix4(br),this.boundingBox.union(Du)}computeBoundingSphere(){const e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new $n),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,br),vs.copy(e.boundingSphere).applyMatrix4(br),this.boundingSphere.union(vs)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){const n=t.morphTargetInfluences,r=this.morphTexture.source.data.data,s=n.length+1,o=e*s+1;for(let a=0;a<n.length;a++)n[a]=r[o+a]}raycast(e,t){const n=this.matrixWorld,r=this.count;if(_s.geometry=this.geometry,_s.material=this.material,_s.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),vs.copy(this.boundingSphere),vs.applyMatrix4(n),e.ray.intersectsSphere(vs)!==!1))for(let s=0;s<r;s++){this.getMatrixAt(s,br),Nu.multiplyMatrices(n,br),_s.matrixWorld=Nu,_s.raycast(e,bo);for(let o=0,a=bo.length;o<a;o++){const l=bo[o];l.instanceId=s,l.object=this,t.push(l)}bo.length=0}}setColorAt(e,t){this.instanceColor===null&&(this.instanceColor=new jl(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3)}setMatrixAt(e,t){t.toArray(this.instanceMatrix.array,e*16)}setMorphAt(e,t){const n=t.morphTargetInfluences,r=n.length+1;this.morphTexture===null&&(this.morphTexture=new Ph(new Float32Array(r*this.count),r,this.count,wc,Rn));const s=this.morphTexture.source.data.data;let o=0;for(let c=0;c<n.length;c++)o+=n[c];const a=this.geometry.morphTargetsRelative?1:1-o,l=r*e;s[l]=a,s.set(n,l+1)}updateMorphTargets(){}dispose(){this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}}const ka=new I,Cm=new I,Rm=new Qe;class Wi{constructor(e=new I(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,r){return this.normal.set(e,t,n),this.constant=r,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){const r=ka.subVectors(n,t).cross(Cm.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(r,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){const n=e.delta(ka),r=this.normal.dot(n);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const s=-(e.start.dot(this.normal)+this.constant)/r;return s<0||s>1?null:t.copy(e.start).addScaledVector(n,s)}intersectsLine(e){const t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const n=t||Rm.getNormalMatrix(e),r=this.coplanarPoint(ka).applyMatrix4(e),s=this.normal.applyMatrix3(n).normalize();return this.constant=-r.dot(s),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const zi=new $n,Lm=new _e(.5,.5),wo=new I;class Ic{constructor(e=new Wi,t=new Wi,n=new Wi,r=new Wi,s=new Wi,o=new Wi){this.planes=[e,t,n,r,s,o]}set(e,t,n,r,s,o){const a=this.planes;return a[0].copy(e),a[1].copy(t),a[2].copy(n),a[3].copy(r),a[4].copy(s),a[5].copy(o),this}copy(e){const t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=Gn,n=!1){const r=this.planes,s=e.elements,o=s[0],a=s[1],l=s[2],c=s[3],u=s[4],d=s[5],h=s[6],f=s[7],g=s[8],_=s[9],m=s[10],p=s[11],M=s[12],S=s[13],x=s[14],A=s[15];if(r[0].setComponents(c-o,f-u,p-g,A-M).normalize(),r[1].setComponents(c+o,f+u,p+g,A+M).normalize(),r[2].setComponents(c+a,f+d,p+_,A+S).normalize(),r[3].setComponents(c-a,f-d,p-_,A-S).normalize(),n)r[4].setComponents(l,h,m,x).normalize(),r[5].setComponents(c-l,f-h,p-m,A-x).normalize();else if(r[4].setComponents(c-l,f-h,p-m,A-x).normalize(),t===Gn)r[5].setComponents(c+l,f+h,p+m,A+x).normalize();else if(t===ta)r[5].setComponents(l,h,m,x).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),zi.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),zi.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(zi)}intersectsSprite(e){zi.center.set(0,0,0);const t=Lm.distanceTo(e.center);return zi.radius=.7071067811865476+t,zi.applyMatrix4(e.matrixWorld),this.intersectsSphere(zi)}intersectsSphere(e){const t=this.planes,n=e.center,r=-e.radius;for(let s=0;s<6;s++)if(t[s].distanceToPoint(n)<r)return!1;return!0}intersectsBox(e){const t=this.planes;for(let n=0;n<6;n++){const r=t[n];if(wo.x=r.normal.x>0?e.max.x:e.min.x,wo.y=r.normal.y>0?e.max.y:e.min.y,wo.z=r.normal.z>0?e.max.z:e.min.z,r.distanceToPoint(wo)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}class Ih extends Xn{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new Ge(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}}const na=new I,ia=new I,Uu=new $e,xs=new la,Eo=new $n,Ba=new I,Ou=new I;class Nc extends Mt{constructor(e=new ln,t=new Ih){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,n=[0];for(let r=1,s=t.count;r<s;r++)na.fromBufferAttribute(t,r-1),ia.fromBufferAttribute(t,r),n[r]=n[r-1],n[r]+=na.distanceTo(ia);e.setAttribute("lineDistance",new Xt(n,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){const n=this.geometry,r=this.matrixWorld,s=e.params.Line.threshold,o=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Eo.copy(n.boundingSphere),Eo.applyMatrix4(r),Eo.radius+=s,e.ray.intersectsSphere(Eo)===!1)return;Uu.copy(r).invert(),xs.copy(e.ray).applyMatrix4(Uu);const a=s/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,c=this.isLineSegments?2:1,u=n.index,h=n.attributes.position;if(u!==null){const f=Math.max(0,o.start),g=Math.min(u.count,o.start+o.count);for(let _=f,m=g-1;_<m;_+=c){const p=u.getX(_),M=u.getX(_+1),S=To(this,e,xs,l,p,M,_);S&&t.push(S)}if(this.isLineLoop){const _=u.getX(g-1),m=u.getX(f),p=To(this,e,xs,l,_,m,g-1);p&&t.push(p)}}else{const f=Math.max(0,o.start),g=Math.min(h.count,o.start+o.count);for(let _=f,m=g-1;_<m;_+=c){const p=To(this,e,xs,l,_,_+1,_);p&&t.push(p)}if(this.isLineLoop){const _=To(this,e,xs,l,g-1,f,g-1);_&&t.push(_)}}}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const r=t[n[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,o=r.length;s<o;s++){const a=r[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=s}}}}}function To(i,e,t,n,r,s,o){const a=i.geometry.attributes.position;if(na.fromBufferAttribute(a,r),ia.fromBufferAttribute(a,s),t.distanceSqToSegment(na,ia,Ba,Ou)>n)return;Ba.applyMatrix4(i.matrixWorld);const c=e.ray.origin.distanceTo(Ba);if(!(c<e.near||c>e.far))return{distance:c,point:Ou.clone().applyMatrix4(i.matrixWorld),index:o,face:null,faceIndex:null,barycoord:null,object:i}}const Fu=new I,ku=new I;class Pm extends Nc{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,n=[];for(let r=0,s=t.count;r<s;r+=2)Fu.fromBufferAttribute(t,r),ku.fromBufferAttribute(t,r+1),n[r]=r===0?0:n[r-1],n[r+1]=n[r]+Fu.distanceTo(ku);e.setAttribute("lineDistance",new Xt(n,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class Im extends Nc{constructor(e,t){super(e,t),this.isLineLoop=!0,this.type="LineLoop"}}class Nh extends Xn{constructor(e){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new Ge(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}const Bu=new $e,Jl=new la,Ao=new $n,Co=new I;class Dh extends Mt{constructor(e=new ln,t=new Nh){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}raycast(e,t){const n=this.geometry,r=this.matrixWorld,s=e.params.Points.threshold,o=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Ao.copy(n.boundingSphere),Ao.applyMatrix4(r),Ao.radius+=s,e.ray.intersectsSphere(Ao)===!1)return;Bu.copy(r).invert(),Jl.copy(e.ray).applyMatrix4(Bu);const a=s/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,c=n.index,d=n.attributes.position;if(c!==null){const h=Math.max(0,o.start),f=Math.min(c.count,o.start+o.count);for(let g=h,_=f;g<_;g++){const m=c.getX(g);Co.fromBufferAttribute(d,m),zu(Co,m,l,r,e,t,this)}}else{const h=Math.max(0,o.start),f=Math.min(d.count,o.start+o.count);for(let g=h,_=f;g<_;g++)Co.fromBufferAttribute(d,g),zu(Co,g,l,r,e,t,this)}}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const r=t[n[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,o=r.length;s<o;s++){const a=r[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=s}}}}}function zu(i,e,t,n,r,s,o){const a=Jl.distanceSqToPoint(i);if(a<t){const l=new I;Jl.closestPointToPoint(i,l),l.applyMatrix4(n);const c=r.ray.origin.distanceTo(l);if(c<r.near||c>r.far)return;s.push({distance:c,distanceToRay:Math.sqrt(a),point:l,index:e,face:null,faceIndex:null,barycoord:null,object:o})}}class Uh extends Ft{constructor(e,t,n=er,r,s,o,a=nn,l=nn,c,u=Us,d=1){if(u!==Us&&u!==Os)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");const h={width:e,height:t,depth:d};super(h,r,s,o,a,l,u,n,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new Rc(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}}class Oh extends Ft{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}}class Yn{constructor(){this.type="Curve",this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){console.warn("THREE.Curve: .getPoint() not implemented.")}getPointAt(e,t){const n=this.getUtoTmapping(e);return this.getPoint(n,t)}getPoints(e=5){const t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return t}getSpacedPoints(e=5){const t=[];for(let n=0;n<=e;n++)t.push(this.getPointAt(n/e));return t}getLength(){const e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;const t=[];let n,r=this.getPoint(0),s=0;t.push(0);for(let o=1;o<=e;o++)n=this.getPoint(o/e),s+=n.distanceTo(r),t.push(s),r=n;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t=null){const n=this.getLengths();let r=0;const s=n.length;let o;t?o=t:o=e*n[s-1];let a=0,l=s-1,c;for(;a<=l;)if(r=Math.floor(a+(l-a)/2),c=n[r]-o,c<0)a=r+1;else if(c>0)l=r-1;else{l=r;break}if(r=l,n[r]===o)return r/(s-1);const u=n[r],h=n[r+1]-u,f=(o-u)/h;return(r+f)/(s-1)}getTangent(e,t){let r=e-1e-4,s=e+1e-4;r<0&&(r=0),s>1&&(s=1);const o=this.getPoint(r),a=this.getPoint(s),l=t||(o.isVector2?new _e:new I);return l.copy(a).sub(o).normalize(),l}getTangentAt(e,t){const n=this.getUtoTmapping(e);return this.getTangent(n,t)}computeFrenetFrames(e,t=!1){const n=new I,r=[],s=[],o=[],a=new I,l=new $e;for(let f=0;f<=e;f++){const g=f/e;r[f]=this.getTangentAt(g,new I)}s[0]=new I,o[0]=new I;let c=Number.MAX_VALUE;const u=Math.abs(r[0].x),d=Math.abs(r[0].y),h=Math.abs(r[0].z);u<=c&&(c=u,n.set(1,0,0)),d<=c&&(c=d,n.set(0,1,0)),h<=c&&n.set(0,0,1),a.crossVectors(r[0],n).normalize(),s[0].crossVectors(r[0],a),o[0].crossVectors(r[0],s[0]);for(let f=1;f<=e;f++){if(s[f]=s[f-1].clone(),o[f]=o[f-1].clone(),a.crossVectors(r[f-1],r[f]),a.length()>Number.EPSILON){a.normalize();const g=Math.acos(nt(r[f-1].dot(r[f]),-1,1));s[f].applyMatrix4(l.makeRotationAxis(a,g))}o[f].crossVectors(r[f],s[f])}if(t===!0){let f=Math.acos(nt(s[0].dot(s[e]),-1,1));f/=e,r[0].dot(a.crossVectors(s[0],s[e]))>0&&(f=-f);for(let g=1;g<=e;g++)s[g].applyMatrix4(l.makeRotationAxis(r[g],f*g)),o[g].crossVectors(r[g],s[g])}return{tangents:r,normals:s,binormals:o}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){const e={metadata:{version:4.7,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}}class Dc extends Yn{constructor(e=0,t=0,n=1,r=1,s=0,o=Math.PI*2,a=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=n,this.yRadius=r,this.aStartAngle=s,this.aEndAngle=o,this.aClockwise=a,this.aRotation=l}getPoint(e,t=new _e){const n=t,r=Math.PI*2;let s=this.aEndAngle-this.aStartAngle;const o=Math.abs(s)<Number.EPSILON;for(;s<0;)s+=r;for(;s>r;)s-=r;s<Number.EPSILON&&(o?s=0:s=r),this.aClockwise===!0&&!o&&(s===r?s=-r:s=s-r);const a=this.aStartAngle+e*s;let l=this.aX+this.xRadius*Math.cos(a),c=this.aY+this.yRadius*Math.sin(a);if(this.aRotation!==0){const u=Math.cos(this.aRotation),d=Math.sin(this.aRotation),h=l-this.aX,f=c-this.aY;l=h*u-f*d+this.aX,c=h*d+f*u+this.aY}return n.set(l,c)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){const e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}}class Nm extends Dc{constructor(e,t,n,r,s,o){super(e,t,n,n,r,s,o),this.isArcCurve=!0,this.type="ArcCurve"}}function Uc(){let i=0,e=0,t=0,n=0;function r(s,o,a,l){i=s,e=a,t=-3*s+3*o-2*a-l,n=2*s-2*o+a+l}return{initCatmullRom:function(s,o,a,l,c){r(o,a,c*(a-s),c*(l-o))},initNonuniformCatmullRom:function(s,o,a,l,c,u,d){let h=(o-s)/c-(a-s)/(c+u)+(a-o)/u,f=(a-o)/u-(l-o)/(u+d)+(l-a)/d;h*=u,f*=u,r(o,a,h,f)},calc:function(s){const o=s*s,a=o*s;return i+e*s+t*o+n*a}}}const Ro=new I,za=new Uc,Ha=new Uc,Va=new Uc;class Dm extends Yn{constructor(e=[],t=!1,n="centripetal",r=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=n,this.tension=r}getPoint(e,t=new I){const n=t,r=this.points,s=r.length,o=(s-(this.closed?0:1))*e;let a=Math.floor(o),l=o-a;this.closed?a+=a>0?0:(Math.floor(Math.abs(a)/s)+1)*s:l===0&&a===s-1&&(a=s-2,l=1);let c,u;this.closed||a>0?c=r[(a-1)%s]:(Ro.subVectors(r[0],r[1]).add(r[0]),c=Ro);const d=r[a%s],h=r[(a+1)%s];if(this.closed||a+2<s?u=r[(a+2)%s]:(Ro.subVectors(r[s-1],r[s-2]).add(r[s-1]),u=Ro),this.curveType==="centripetal"||this.curveType==="chordal"){const f=this.curveType==="chordal"?.5:.25;let g=Math.pow(c.distanceToSquared(d),f),_=Math.pow(d.distanceToSquared(h),f),m=Math.pow(h.distanceToSquared(u),f);_<1e-4&&(_=1),g<1e-4&&(g=_),m<1e-4&&(m=_),za.initNonuniformCatmullRom(c.x,d.x,h.x,u.x,g,_,m),Ha.initNonuniformCatmullRom(c.y,d.y,h.y,u.y,g,_,m),Va.initNonuniformCatmullRom(c.z,d.z,h.z,u.z,g,_,m)}else this.curveType==="catmullrom"&&(za.initCatmullRom(c.x,d.x,h.x,u.x,this.tension),Ha.initCatmullRom(c.y,d.y,h.y,u.y,this.tension),Va.initCatmullRom(c.z,d.z,h.z,u.z,this.tension));return n.set(za.calc(l),Ha.calc(l),Va.calc(l)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const r=e.points[t];this.points.push(r.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){const e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){const r=this.points[t];e.points.push(r.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const r=e.points[t];this.points.push(new I().fromArray(r))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}}function Hu(i,e,t,n,r){const s=(n-e)*.5,o=(r-t)*.5,a=i*i,l=i*a;return(2*t-2*n+s+o)*l+(-3*t+3*n-2*s-o)*a+s*i+t}function Um(i,e){const t=1-i;return t*t*e}function Om(i,e){return 2*(1-i)*i*e}function Fm(i,e){return i*i*e}function Cs(i,e,t,n){return Um(i,e)+Om(i,t)+Fm(i,n)}function km(i,e){const t=1-i;return t*t*t*e}function Bm(i,e){const t=1-i;return 3*t*t*i*e}function zm(i,e){return 3*(1-i)*i*i*e}function Hm(i,e){return i*i*i*e}function Rs(i,e,t,n,r){return km(i,e)+Bm(i,t)+zm(i,n)+Hm(i,r)}class Fh extends Yn{constructor(e=new _e,t=new _e,n=new _e,r=new _e){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=n,this.v3=r}getPoint(e,t=new _e){const n=t,r=this.v0,s=this.v1,o=this.v2,a=this.v3;return n.set(Rs(e,r.x,s.x,o.x,a.x),Rs(e,r.y,s.y,o.y,a.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}}class Vm extends Yn{constructor(e=new I,t=new I,n=new I,r=new I){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=n,this.v3=r}getPoint(e,t=new I){const n=t,r=this.v0,s=this.v1,o=this.v2,a=this.v3;return n.set(Rs(e,r.x,s.x,o.x,a.x),Rs(e,r.y,s.y,o.y,a.y),Rs(e,r.z,s.z,o.z,a.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}}class kh extends Yn{constructor(e=new _e,t=new _e){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new _e){const n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new _e){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class Gm extends Yn{constructor(e=new I,t=new I){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new I){const n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new I){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class Bh extends Yn{constructor(e=new _e,t=new _e,n=new _e){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new _e){const n=t,r=this.v0,s=this.v1,o=this.v2;return n.set(Cs(e,r.x,s.x,o.x),Cs(e,r.y,s.y,o.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class Wm extends Yn{constructor(e=new I,t=new I,n=new I){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new I){const n=t,r=this.v0,s=this.v1,o=this.v2;return n.set(Cs(e,r.x,s.x,o.x),Cs(e,r.y,s.y,o.y),Cs(e,r.z,s.z,o.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class zh extends Yn{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new _e){const n=t,r=this.points,s=(r.length-1)*e,o=Math.floor(s),a=s-o,l=r[o===0?o:o-1],c=r[o],u=r[o>r.length-2?r.length-1:o+1],d=r[o>r.length-3?r.length-1:o+2];return n.set(Hu(a,l.x,c.x,u.x,d.x),Hu(a,l.y,c.y,u.y,d.y)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const r=e.points[t];this.points.push(r.clone())}return this}toJSON(){const e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){const r=this.points[t];e.points.push(r.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const r=e.points[t];this.points.push(new _e().fromArray(r))}return this}}var Zl=Object.freeze({__proto__:null,ArcCurve:Nm,CatmullRomCurve3:Dm,CubicBezierCurve:Fh,CubicBezierCurve3:Vm,EllipseCurve:Dc,LineCurve:kh,LineCurve3:Gm,QuadraticBezierCurve:Bh,QuadraticBezierCurve3:Wm,SplineCurve:zh});class Xm extends Yn{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(e){this.curves.push(e)}closePath(){const e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);if(!e.equals(t)){const n=e.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new Zl[n](t,e))}return this}getPoint(e,t){const n=e*this.getLength(),r=this.getCurveLengths();let s=0;for(;s<r.length;){if(r[s]>=n){const o=r[s]-n,a=this.curves[s],l=a.getLength(),c=l===0?0:1-o/l;return a.getPointAt(c,t)}s++}return null}getLength(){const e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;const e=[];let t=0;for(let n=0,r=this.curves.length;n<r;n++)t+=this.curves[n].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){const t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return this.autoClose&&t.push(t[0]),t}getPoints(e=12){const t=[];let n;for(let r=0,s=this.curves;r<s.length;r++){const o=s[r],a=o.isEllipseCurve?e*2:o.isLineCurve||o.isLineCurve3?1:o.isSplineCurve?e*o.points.length:e,l=o.getPoints(a);for(let c=0;c<l.length;c++){const u=l[c];n&&n.equals(u)||(t.push(u),n=u)}}return this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0])&&t.push(t[0]),t}copy(e){super.copy(e),this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){const r=e.curves[t];this.curves.push(r.clone())}return this.autoClose=e.autoClose,this}toJSON(){const e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,n=this.curves.length;t<n;t++){const r=this.curves[t];e.curves.push(r.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){const r=e.curves[t];this.curves.push(new Zl[r.type]().fromJSON(r))}return this}}class Vu extends Xm{constructor(e){super(),this.type="Path",this.currentPoint=new _e,e&&this.setFromPoints(e)}setFromPoints(e){this.moveTo(e[0].x,e[0].y);for(let t=1,n=e.length;t<n;t++)this.lineTo(e[t].x,e[t].y);return this}moveTo(e,t){return this.currentPoint.set(e,t),this}lineTo(e,t){const n=new kh(this.currentPoint.clone(),new _e(e,t));return this.curves.push(n),this.currentPoint.set(e,t),this}quadraticCurveTo(e,t,n,r){const s=new Bh(this.currentPoint.clone(),new _e(e,t),new _e(n,r));return this.curves.push(s),this.currentPoint.set(n,r),this}bezierCurveTo(e,t,n,r,s,o){const a=new Fh(this.currentPoint.clone(),new _e(e,t),new _e(n,r),new _e(s,o));return this.curves.push(a),this.currentPoint.set(s,o),this}splineThru(e){const t=[this.currentPoint.clone()].concat(e),n=new zh(t);return this.curves.push(n),this.currentPoint.copy(e[e.length-1]),this}arc(e,t,n,r,s,o){const a=this.currentPoint.x,l=this.currentPoint.y;return this.absarc(e+a,t+l,n,r,s,o),this}absarc(e,t,n,r,s,o){return this.absellipse(e,t,n,n,r,s,o),this}ellipse(e,t,n,r,s,o,a,l){const c=this.currentPoint.x,u=this.currentPoint.y;return this.absellipse(e+c,t+u,n,r,s,o,a,l),this}absellipse(e,t,n,r,s,o,a,l){const c=new Dc(e,t,n,r,s,o,a,l);if(this.curves.length>0){const d=c.getPoint(0);d.equals(this.currentPoint)||this.lineTo(d.x,d.y)}this.curves.push(c);const u=c.getPoint(1);return this.currentPoint.copy(u),this}copy(e){return super.copy(e),this.currentPoint.copy(e.currentPoint),this}toJSON(){const e=super.toJSON();return e.currentPoint=this.currentPoint.toArray(),e}fromJSON(e){return super.fromJSON(e),this.currentPoint.fromArray(e.currentPoint),this}}class Hh extends Vu{constructor(e){super(e),this.uuid=Sn(),this.type="Shape",this.holes=[]}getPointsHoles(e){const t=[];for(let n=0,r=this.holes.length;n<r;n++)t[n]=this.holes[n].getPoints(e);return t}extractPoints(e){return{shape:this.getPoints(e),holes:this.getPointsHoles(e)}}copy(e){super.copy(e),this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){const r=e.holes[t];this.holes.push(r.clone())}return this}toJSON(){const e=super.toJSON();e.uuid=this.uuid,e.holes=[];for(let t=0,n=this.holes.length;t<n;t++){const r=this.holes[t];e.holes.push(r.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.uuid=e.uuid,this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){const r=e.holes[t];this.holes.push(new Vu().fromJSON(r))}return this}}function qm(i,e,t=2){const n=e&&e.length,r=n?e[0]*t:i.length;let s=Vh(i,0,r,t,!0);const o=[];if(!s||s.next===s.prev)return o;let a,l,c;if(n&&(s=Jm(i,e,s,t)),i.length>80*t){a=1/0,l=1/0;let u=-1/0,d=-1/0;for(let h=t;h<r;h+=t){const f=i[h],g=i[h+1];f<a&&(a=f),g<l&&(l=g),f>u&&(u=f),g>d&&(d=g)}c=Math.max(u-a,d-l),c=c!==0?32767/c:0}return Vs(s,o,t,a,l,c,0),o}function Vh(i,e,t,n,r){let s;if(r===lg(i,e,t,n)>0)for(let o=e;o<t;o+=n)s=Gu(o/n|0,i[o],i[o+1],s);else for(let o=t-n;o>=e;o-=n)s=Gu(o/n|0,i[o],i[o+1],s);return s&&Xr(s,s.next)&&(Ws(s),s=s.next),s}function tr(i,e){if(!i)return i;e||(e=i);let t=i,n;do if(n=!1,!t.steiner&&(Xr(t,t.next)||Ct(t.prev,t,t.next)===0)){if(Ws(t),t=e=t.prev,t===t.next)break;n=!0}else t=t.next;while(n||t!==e);return e}function Vs(i,e,t,n,r,s,o){if(!i)return;!o&&s&&ng(i,n,r,s);let a=i;for(;i.prev!==i.next;){const l=i.prev,c=i.next;if(s?$m(i,n,r,s):Km(i)){e.push(l.i,i.i,c.i),Ws(i),i=c.next,a=c.next;continue}if(i=c,i===a){o?o===1?(i=Ym(tr(i),e),Vs(i,e,t,n,r,s,2)):o===2&&jm(i,e,t,n,r,s):Vs(tr(i),e,t,n,r,s,1);break}}}function Km(i){const e=i.prev,t=i,n=i.next;if(Ct(e,t,n)>=0)return!1;const r=e.x,s=t.x,o=n.x,a=e.y,l=t.y,c=n.y,u=Math.min(r,s,o),d=Math.min(a,l,c),h=Math.max(r,s,o),f=Math.max(a,l,c);let g=n.next;for(;g!==e;){if(g.x>=u&&g.x<=h&&g.y>=d&&g.y<=f&&bs(r,a,s,l,o,c,g.x,g.y)&&Ct(g.prev,g,g.next)>=0)return!1;g=g.next}return!0}function $m(i,e,t,n){const r=i.prev,s=i,o=i.next;if(Ct(r,s,o)>=0)return!1;const a=r.x,l=s.x,c=o.x,u=r.y,d=s.y,h=o.y,f=Math.min(a,l,c),g=Math.min(u,d,h),_=Math.max(a,l,c),m=Math.max(u,d,h),p=Ql(f,g,e,t,n),M=Ql(_,m,e,t,n);let S=i.prevZ,x=i.nextZ;for(;S&&S.z>=p&&x&&x.z<=M;){if(S.x>=f&&S.x<=_&&S.y>=g&&S.y<=m&&S!==r&&S!==o&&bs(a,u,l,d,c,h,S.x,S.y)&&Ct(S.prev,S,S.next)>=0||(S=S.prevZ,x.x>=f&&x.x<=_&&x.y>=g&&x.y<=m&&x!==r&&x!==o&&bs(a,u,l,d,c,h,x.x,x.y)&&Ct(x.prev,x,x.next)>=0))return!1;x=x.nextZ}for(;S&&S.z>=p;){if(S.x>=f&&S.x<=_&&S.y>=g&&S.y<=m&&S!==r&&S!==o&&bs(a,u,l,d,c,h,S.x,S.y)&&Ct(S.prev,S,S.next)>=0)return!1;S=S.prevZ}for(;x&&x.z<=M;){if(x.x>=f&&x.x<=_&&x.y>=g&&x.y<=m&&x!==r&&x!==o&&bs(a,u,l,d,c,h,x.x,x.y)&&Ct(x.prev,x,x.next)>=0)return!1;x=x.nextZ}return!0}function Ym(i,e){let t=i;do{const n=t.prev,r=t.next.next;!Xr(n,r)&&Wh(n,t,t.next,r)&&Gs(n,r)&&Gs(r,n)&&(e.push(n.i,t.i,r.i),Ws(t),Ws(t.next),t=i=r),t=t.next}while(t!==i);return tr(t)}function jm(i,e,t,n,r,s){let o=i;do{let a=o.next.next;for(;a!==o.prev;){if(o.i!==a.i&&sg(o,a)){let l=Xh(o,a);o=tr(o,o.next),l=tr(l,l.next),Vs(o,e,t,n,r,s,0),Vs(l,e,t,n,r,s,0);return}a=a.next}o=o.next}while(o!==i)}function Jm(i,e,t,n){const r=[];for(let s=0,o=e.length;s<o;s++){const a=e[s]*n,l=s<o-1?e[s+1]*n:i.length,c=Vh(i,a,l,n,!1);c===c.next&&(c.steiner=!0),r.push(rg(c))}r.sort(Zm);for(let s=0;s<r.length;s++)t=Qm(r[s],t);return t}function Zm(i,e){let t=i.x-e.x;if(t===0&&(t=i.y-e.y,t===0)){const n=(i.next.y-i.y)/(i.next.x-i.x),r=(e.next.y-e.y)/(e.next.x-e.x);t=n-r}return t}function Qm(i,e){const t=eg(i,e);if(!t)return e;const n=Xh(t,i);return tr(n,n.next),tr(t,t.next)}function eg(i,e){let t=e;const n=i.x,r=i.y;let s=-1/0,o;if(Xr(i,t))return t;do{if(Xr(i,t.next))return t.next;if(r<=t.y&&r>=t.next.y&&t.next.y!==t.y){const d=t.x+(r-t.y)*(t.next.x-t.x)/(t.next.y-t.y);if(d<=n&&d>s&&(s=d,o=t.x<t.next.x?t:t.next,d===n))return o}t=t.next}while(t!==e);if(!o)return null;const a=o,l=o.x,c=o.y;let u=1/0;t=o;do{if(n>=t.x&&t.x>=l&&n!==t.x&&Gh(r<c?n:s,r,l,c,r<c?s:n,r,t.x,t.y)){const d=Math.abs(r-t.y)/(n-t.x);Gs(t,i)&&(d<u||d===u&&(t.x>o.x||t.x===o.x&&tg(o,t)))&&(o=t,u=d)}t=t.next}while(t!==a);return o}function tg(i,e){return Ct(i.prev,i,e.prev)<0&&Ct(e.next,i,i.next)<0}function ng(i,e,t,n){let r=i;do r.z===0&&(r.z=Ql(r.x,r.y,e,t,n)),r.prevZ=r.prev,r.nextZ=r.next,r=r.next;while(r!==i);r.prevZ.nextZ=null,r.prevZ=null,ig(r)}function ig(i){let e,t=1;do{let n=i,r;i=null;let s=null;for(e=0;n;){e++;let o=n,a=0;for(let c=0;c<t&&(a++,o=o.nextZ,!!o);c++);let l=t;for(;a>0||l>0&&o;)a!==0&&(l===0||!o||n.z<=o.z)?(r=n,n=n.nextZ,a--):(r=o,o=o.nextZ,l--),s?s.nextZ=r:i=r,r.prevZ=s,s=r;n=o}s.nextZ=null,t*=2}while(e>1);return i}function Ql(i,e,t,n,r){return i=(i-t)*r|0,e=(e-n)*r|0,i=(i|i<<8)&16711935,i=(i|i<<4)&252645135,i=(i|i<<2)&858993459,i=(i|i<<1)&1431655765,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,i|e<<1}function rg(i){let e=i,t=i;do(e.x<t.x||e.x===t.x&&e.y<t.y)&&(t=e),e=e.next;while(e!==i);return t}function Gh(i,e,t,n,r,s,o,a){return(r-o)*(e-a)>=(i-o)*(s-a)&&(i-o)*(n-a)>=(t-o)*(e-a)&&(t-o)*(s-a)>=(r-o)*(n-a)}function bs(i,e,t,n,r,s,o,a){return!(i===o&&e===a)&&Gh(i,e,t,n,r,s,o,a)}function sg(i,e){return i.next.i!==e.i&&i.prev.i!==e.i&&!og(i,e)&&(Gs(i,e)&&Gs(e,i)&&ag(i,e)&&(Ct(i.prev,i,e.prev)||Ct(i,e.prev,e))||Xr(i,e)&&Ct(i.prev,i,i.next)>0&&Ct(e.prev,e,e.next)>0)}function Ct(i,e,t){return(e.y-i.y)*(t.x-e.x)-(e.x-i.x)*(t.y-e.y)}function Xr(i,e){return i.x===e.x&&i.y===e.y}function Wh(i,e,t,n){const r=Po(Ct(i,e,t)),s=Po(Ct(i,e,n)),o=Po(Ct(t,n,i)),a=Po(Ct(t,n,e));return!!(r!==s&&o!==a||r===0&&Lo(i,t,e)||s===0&&Lo(i,n,e)||o===0&&Lo(t,i,n)||a===0&&Lo(t,e,n))}function Lo(i,e,t){return e.x<=Math.max(i.x,t.x)&&e.x>=Math.min(i.x,t.x)&&e.y<=Math.max(i.y,t.y)&&e.y>=Math.min(i.y,t.y)}function Po(i){return i>0?1:i<0?-1:0}function og(i,e){let t=i;do{if(t.i!==i.i&&t.next.i!==i.i&&t.i!==e.i&&t.next.i!==e.i&&Wh(t,t.next,i,e))return!0;t=t.next}while(t!==i);return!1}function Gs(i,e){return Ct(i.prev,i,i.next)<0?Ct(i,e,i.next)>=0&&Ct(i,i.prev,e)>=0:Ct(i,e,i.prev)<0||Ct(i,i.next,e)<0}function ag(i,e){let t=i,n=!1;const r=(i.x+e.x)/2,s=(i.y+e.y)/2;do t.y>s!=t.next.y>s&&t.next.y!==t.y&&r<(t.next.x-t.x)*(s-t.y)/(t.next.y-t.y)+t.x&&(n=!n),t=t.next;while(t!==i);return n}function Xh(i,e){const t=ec(i.i,i.x,i.y),n=ec(e.i,e.x,e.y),r=i.next,s=e.prev;return i.next=e,e.prev=i,t.next=r,r.prev=t,n.next=t,t.prev=n,s.next=n,n.prev=s,n}function Gu(i,e,t,n){const r=ec(i,e,t);return n?(r.next=n.next,r.prev=n,n.next.prev=r,n.next=r):(r.prev=r,r.next=r),r}function Ws(i){i.next.prev=i.prev,i.prev.next=i.next,i.prevZ&&(i.prevZ.nextZ=i.nextZ),i.nextZ&&(i.nextZ.prevZ=i.prevZ)}function ec(i,e,t){return{i,x:e,y:t,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}function lg(i,e,t,n){let r=0;for(let s=e,o=t-n;s<t;s+=n)r+=(i[o]-i[s])*(i[s+1]+i[o+1]),o=s;return r}class cg{static triangulate(e,t,n=2){return qm(e,t,n)}}class Lr{static area(e){const t=e.length;let n=0;for(let r=t-1,s=0;s<t;r=s++)n+=e[r].x*e[s].y-e[s].x*e[r].y;return n*.5}static isClockWise(e){return Lr.area(e)<0}static triangulateShape(e,t){const n=[],r=[],s=[];Wu(e),Xu(n,e);let o=e.length;t.forEach(Wu);for(let l=0;l<t.length;l++)r.push(o),o+=t[l].length,Xu(n,t[l]);const a=cg.triangulate(n,r);for(let l=0;l<a.length;l+=3)s.push(a.slice(l,l+3));return s}}function Wu(i){const e=i.length;e>2&&i[e-1].equals(i[0])&&i.pop()}function Xu(i,e){for(let t=0;t<e.length;t++)i.push(e[t].x),i.push(e[t].y)}class Oc extends ln{constructor(e=new Hh([new _e(.5,.5),new _e(-.5,.5),new _e(-.5,-.5),new _e(.5,-.5)]),t={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:e,options:t},e=Array.isArray(e)?e:[e];const n=this,r=[],s=[];for(let a=0,l=e.length;a<l;a++){const c=e[a];o(c)}this.setAttribute("position",new Xt(r,3)),this.setAttribute("uv",new Xt(s,2)),this.computeVertexNormals();function o(a){const l=[],c=t.curveSegments!==void 0?t.curveSegments:12,u=t.steps!==void 0?t.steps:1,d=t.depth!==void 0?t.depth:1;let h=t.bevelEnabled!==void 0?t.bevelEnabled:!0,f=t.bevelThickness!==void 0?t.bevelThickness:.2,g=t.bevelSize!==void 0?t.bevelSize:f-.1,_=t.bevelOffset!==void 0?t.bevelOffset:0,m=t.bevelSegments!==void 0?t.bevelSegments:3;const p=t.extrudePath,M=t.UVGenerator!==void 0?t.UVGenerator:ug;let S,x=!1,A,C,R,N;p&&(S=p.getSpacedPoints(u),x=!0,h=!1,A=p.computeFrenetFrames(u,!1),C=new I,R=new I,N=new I),h||(m=0,f=0,g=0,_=0);const w=a.extractPoints(c);let y=w.shape;const L=w.holes;if(!Lr.isClockWise(y)){y=y.reverse();for(let le=0,re=L.length;le<re;le++){const ie=L[le];Lr.isClockWise(ie)&&(L[le]=ie.reverse())}}function W(le){const ie=10000000000000001e-36;let te=le[0];for(let xe=1;xe<=le.length;xe++){const F=xe%le.length,Q=le[F],me=Q.x-te.x,de=Q.y-te.y,E=me*me+de*de,v=Math.max(Math.abs(Q.x),Math.abs(Q.y),Math.abs(te.x),Math.abs(te.y)),U=ie*v*v;if(E<=U){le.splice(F,1),xe--;continue}te=Q}}W(y),L.forEach(W);const X=L.length,q=y;for(let le=0;le<X;le++){const re=L[le];y=y.concat(re)}function z(le,re,ie){return re||console.error("THREE.ExtrudeGeometry: vec does not exist"),le.clone().addScaledVector(re,ie)}const oe=y.length;function V(le,re,ie){let te,xe,F;const Q=le.x-re.x,me=le.y-re.y,de=ie.x-le.x,E=ie.y-le.y,v=Q*Q+me*me,U=Q*E-me*de;if(Math.abs(U)>Number.EPSILON){const G=Math.sqrt(v),Y=Math.sqrt(de*de+E*E),H=re.x-me/G,be=re.y+Q/G,fe=ie.x-E/Y,we=ie.y+de/Y,Ee=((fe-H)*E-(we-be)*de)/(Q*E-me*de);te=H+Q*Ee-le.x,xe=be+me*Ee-le.y;const he=te*te+xe*xe;if(he<=2)return new _e(te,xe);F=Math.sqrt(he/2)}else{let G=!1;Q>Number.EPSILON?de>Number.EPSILON&&(G=!0):Q<-Number.EPSILON?de<-Number.EPSILON&&(G=!0):Math.sign(me)===Math.sign(E)&&(G=!0),G?(te=-me,xe=Q,F=Math.sqrt(v)):(te=Q,xe=me,F=Math.sqrt(v/2))}return new _e(te/F,xe/F)}const pe=[];for(let le=0,re=q.length,ie=re-1,te=le+1;le<re;le++,ie++,te++)ie===re&&(ie=0),te===re&&(te=0),pe[le]=V(q[le],q[ie],q[te]);const K=[];let ne,ce=pe.concat();for(let le=0,re=X;le<re;le++){const ie=L[le];ne=[];for(let te=0,xe=ie.length,F=xe-1,Q=te+1;te<xe;te++,F++,Q++)F===xe&&(F=0),Q===xe&&(Q=0),ne[te]=V(ie[te],ie[F],ie[Q]);K.push(ne),ce=ce.concat(ne)}let ae;if(m===0)ae=Lr.triangulateShape(q,L);else{const le=[],re=[];for(let ie=0;ie<m;ie++){const te=ie/m,xe=f*Math.cos(te*Math.PI/2),F=g*Math.sin(te*Math.PI/2)+_;for(let Q=0,me=q.length;Q<me;Q++){const de=z(q[Q],pe[Q],F);Te(de.x,de.y,-xe),te===0&&le.push(de)}for(let Q=0,me=X;Q<me;Q++){const de=L[Q];ne=K[Q];const E=[];for(let v=0,U=de.length;v<U;v++){const G=z(de[v],ne[v],F);Te(G.x,G.y,-xe),te===0&&E.push(G)}te===0&&re.push(E)}}ae=Lr.triangulateShape(le,re)}const ye=ae.length,Ue=g+_;for(let le=0;le<oe;le++){const re=h?z(y[le],ce[le],Ue):y[le];x?(R.copy(A.normals[0]).multiplyScalar(re.x),C.copy(A.binormals[0]).multiplyScalar(re.y),N.copy(S[0]).add(R).add(C),Te(N.x,N.y,N.z)):Te(re.x,re.y,0)}for(let le=1;le<=u;le++)for(let re=0;re<oe;re++){const ie=h?z(y[re],ce[re],Ue):y[re];x?(R.copy(A.normals[le]).multiplyScalar(ie.x),C.copy(A.binormals[le]).multiplyScalar(ie.y),N.copy(S[le]).add(R).add(C),Te(N.x,N.y,N.z)):Te(ie.x,ie.y,d/u*le)}for(let le=m-1;le>=0;le--){const re=le/m,ie=f*Math.cos(re*Math.PI/2),te=g*Math.sin(re*Math.PI/2)+_;for(let xe=0,F=q.length;xe<F;xe++){const Q=z(q[xe],pe[xe],te);Te(Q.x,Q.y,d+ie)}for(let xe=0,F=L.length;xe<F;xe++){const Q=L[xe];ne=K[xe];for(let me=0,de=Q.length;me<de;me++){const E=z(Q[me],ne[me],te);x?Te(E.x,E.y+S[u-1].y,S[u-1].x+ie):Te(E.x,E.y,d+ie)}}}Z(),ee();function Z(){const le=r.length/3;if(h){let re=0,ie=oe*re;for(let te=0;te<ye;te++){const xe=ae[te];Ae(xe[2]+ie,xe[1]+ie,xe[0]+ie)}re=u+m*2,ie=oe*re;for(let te=0;te<ye;te++){const xe=ae[te];Ae(xe[0]+ie,xe[1]+ie,xe[2]+ie)}}else{for(let re=0;re<ye;re++){const ie=ae[re];Ae(ie[2],ie[1],ie[0])}for(let re=0;re<ye;re++){const ie=ae[re];Ae(ie[0]+oe*u,ie[1]+oe*u,ie[2]+oe*u)}}n.addGroup(le,r.length/3-le,0)}function ee(){const le=r.length/3;let re=0;Me(q,re),re+=q.length;for(let ie=0,te=L.length;ie<te;ie++){const xe=L[ie];Me(xe,re),re+=xe.length}n.addGroup(le,r.length/3-le,1)}function Me(le,re){let ie=le.length;for(;--ie>=0;){const te=ie;let xe=ie-1;xe<0&&(xe=le.length-1);for(let F=0,Q=u+m*2;F<Q;F++){const me=oe*F,de=oe*(F+1),E=re+te+me,v=re+xe+me,U=re+xe+de,G=re+te+de;Xe(E,v,U,G)}}}function Te(le,re,ie){l.push(le),l.push(re),l.push(ie)}function Ae(le,re,ie){it(le),it(re),it(ie);const te=r.length/3,xe=M.generateTopUV(n,r,te-3,te-2,te-1);P(xe[0]),P(xe[1]),P(xe[2])}function Xe(le,re,ie,te){it(le),it(re),it(te),it(re),it(ie),it(te);const xe=r.length/3,F=M.generateSideWallUV(n,r,xe-6,xe-3,xe-2,xe-1);P(F[0]),P(F[1]),P(F[3]),P(F[1]),P(F[2]),P(F[3])}function it(le){r.push(l[le*3+0]),r.push(l[le*3+1]),r.push(l[le*3+2])}function P(le){s.push(le.x),s.push(le.y)}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){const e=super.toJSON(),t=this.parameters.shapes,n=this.parameters.options;return dg(t,n,e)}static fromJSON(e,t){const n=[];for(let s=0,o=e.shapes.length;s<o;s++){const a=t[e.shapes[s]];n.push(a)}const r=e.options.extrudePath;return r!==void 0&&(e.options.extrudePath=new Zl[r.type]().fromJSON(r)),new Oc(n,e.options)}}const ug={generateTopUV:function(i,e,t,n,r){const s=e[t*3],o=e[t*3+1],a=e[n*3],l=e[n*3+1],c=e[r*3],u=e[r*3+1];return[new _e(s,o),new _e(a,l),new _e(c,u)]},generateSideWallUV:function(i,e,t,n,r,s){const o=e[t*3],a=e[t*3+1],l=e[t*3+2],c=e[n*3],u=e[n*3+1],d=e[n*3+2],h=e[r*3],f=e[r*3+1],g=e[r*3+2],_=e[s*3],m=e[s*3+1],p=e[s*3+2];return Math.abs(a-u)<Math.abs(o-c)?[new _e(o,1-l),new _e(c,1-d),new _e(h,1-g),new _e(_,1-p)]:[new _e(a,1-l),new _e(u,1-d),new _e(f,1-g),new _e(m,1-p)]}};function dg(i,e,t){if(t.shapes=[],Array.isArray(i))for(let n=0,r=i.length;n<r;n++){const s=i[n];t.shapes.push(s.uuid)}else t.shapes.push(i.uuid);return t.options=Object.assign({},e),e.extrudePath!==void 0&&(t.options.extrudePath=e.extrudePath.toJSON()),t}class Fc extends ln{constructor(e=[new _e(0,-.5),new _e(.5,0),new _e(0,.5)],t=12,n=0,r=Math.PI*2){super(),this.type="LatheGeometry",this.parameters={points:e,segments:t,phiStart:n,phiLength:r},t=Math.floor(t),r=nt(r,0,Math.PI*2);const s=[],o=[],a=[],l=[],c=[],u=1/t,d=new I,h=new _e,f=new I,g=new I,_=new I;let m=0,p=0;for(let M=0;M<=e.length-1;M++)switch(M){case 0:m=e[M+1].x-e[M].x,p=e[M+1].y-e[M].y,f.x=p*1,f.y=-m,f.z=p*0,_.copy(f),f.normalize(),l.push(f.x,f.y,f.z);break;case e.length-1:l.push(_.x,_.y,_.z);break;default:m=e[M+1].x-e[M].x,p=e[M+1].y-e[M].y,f.x=p*1,f.y=-m,f.z=p*0,g.copy(f),f.x+=_.x,f.y+=_.y,f.z+=_.z,f.normalize(),l.push(f.x,f.y,f.z),_.copy(g)}for(let M=0;M<=t;M++){const S=n+M*u*r,x=Math.sin(S),A=Math.cos(S);for(let C=0;C<=e.length-1;C++){d.x=e[C].x*x,d.y=e[C].y,d.z=e[C].x*A,o.push(d.x,d.y,d.z),h.x=M/t,h.y=C/(e.length-1),a.push(h.x,h.y);const R=l[3*C+0]*x,N=l[3*C+1],w=l[3*C+0]*A;c.push(R,N,w)}}for(let M=0;M<t;M++)for(let S=0;S<e.length-1;S++){const x=S+M*e.length,A=x,C=x+e.length,R=x+e.length+1,N=x+1;s.push(A,C,N),s.push(R,N,C)}this.setIndex(s),this.setAttribute("position",new Xt(o,3)),this.setAttribute("uv",new Xt(a,2)),this.setAttribute("normal",new Xt(c,3))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Fc(e.points,e.segments,e.phiStart,e.phiLength)}}class qr extends ln{constructor(e=1,t=1,n=1,r=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:r};const s=e/2,o=t/2,a=Math.floor(n),l=Math.floor(r),c=a+1,u=l+1,d=e/a,h=t/l,f=[],g=[],_=[],m=[];for(let p=0;p<u;p++){const M=p*h-o;for(let S=0;S<c;S++){const x=S*d-s;g.push(x,-M,0),_.push(0,0,1),m.push(S/a),m.push(1-p/l)}}for(let p=0;p<l;p++)for(let M=0;M<a;M++){const S=M+c*p,x=M+c*(p+1),A=M+1+c*(p+1),C=M+1+c*p;f.push(S,x,C),f.push(x,A,C)}this.setIndex(f),this.setAttribute("position",new Xt(g,3)),this.setAttribute("normal",new Xt(_,3)),this.setAttribute("uv",new Xt(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new qr(e.width,e.height,e.widthSegments,e.heightSegments)}}class Ur extends Xn{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new Ge(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ge(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=vh,this.normalScale=new _e(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Dn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class Mn extends Ur{constructor(e){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new _e(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return nt(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(t){this.ior=(1+.4*t)/(1-.4*t)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new Ge(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new Ge(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new Ge(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._sheen=0,this._transmission=0,this.setValues(e)}get anisotropy(){return this._anisotropy}set anisotropy(e){this._anisotropy>0!=e>0&&this.version++,this._anisotropy=e}get clearcoat(){return this._clearcoat}set clearcoat(e){this._clearcoat>0!=e>0&&this.version++,this._clearcoat=e}get iridescence(){return this._iridescence}set iridescence(e){this._iridescence>0!=e>0&&this.version++,this._iridescence=e}get dispersion(){return this._dispersion}set dispersion(e){this._dispersion>0!=e>0&&this.version++,this._dispersion=e}get sheen(){return this._sheen}set sheen(e){this._sheen>0!=e>0&&this.version++,this._sheen=e}get transmission(){return this._transmission}set transmission(e){this._transmission>0!=e>0&&this.version++,this._transmission=e}copy(e){return super.copy(e),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=e.anisotropy,this.anisotropyRotation=e.anisotropyRotation,this.anisotropyMap=e.anisotropyMap,this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.dispersion=e.dispersion,this.ior=e.ior,this.iridescence=e.iridescence,this.iridescenceMap=e.iridescenceMap,this.iridescenceIOR=e.iridescenceIOR,this.iridescenceThicknessRange=[...e.iridescenceThicknessRange],this.iridescenceThicknessMap=e.iridescenceThicknessMap,this.sheen=e.sheen,this.sheenColor.copy(e.sheenColor),this.sheenColorMap=e.sheenColorMap,this.sheenRoughness=e.sheenRoughness,this.sheenRoughnessMap=e.sheenRoughnessMap,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this.thickness=e.thickness,this.thicknessMap=e.thicknessMap,this.attenuationDistance=e.attenuationDistance,this.attenuationColor.copy(e.attenuationColor),this.specularIntensity=e.specularIntensity,this.specularIntensityMap=e.specularIntensityMap,this.specularColor.copy(e.specularColor),this.specularColorMap=e.specularColorMap,this}}class hg extends Xn{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Tp,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class fg extends Xn{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}function Io(i,e){return!i||i.constructor===e?i:typeof e.BYTES_PER_ELEMENT=="number"?new e(i):Array.prototype.slice.call(i)}function pg(i){return ArrayBuffer.isView(i)&&!(i instanceof DataView)}function mg(i){function e(r,s){return i[r]-i[s]}const t=i.length,n=new Array(t);for(let r=0;r!==t;++r)n[r]=r;return n.sort(e),n}function qu(i,e,t){const n=i.length,r=new i.constructor(n);for(let s=0,o=0;o!==n;++s){const a=t[s]*e;for(let l=0;l!==e;++l)r[o++]=i[a+l]}return r}function qh(i,e,t,n){let r=1,s=i[0];for(;s!==void 0&&s[n]===void 0;)s=i[r++];if(s===void 0)return;let o=s[n];if(o!==void 0)if(Array.isArray(o))do o=s[n],o!==void 0&&(e.push(s.time),t.push(...o)),s=i[r++];while(s!==void 0);else if(o.toArray!==void 0)do o=s[n],o!==void 0&&(e.push(s.time),o.toArray(t,t.length)),s=i[r++];while(s!==void 0);else do o=s[n],o!==void 0&&(e.push(s.time),t.push(o)),s=i[r++];while(s!==void 0)}class Zs{constructor(e,t,n,r){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=r!==void 0?r:new t.constructor(n),this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){const t=this.parameterPositions;let n=this._cachedIndex,r=t[n],s=t[n-1];n:{e:{let o;t:{i:if(!(e<r)){for(let a=n+2;;){if(r===void 0){if(e<s)break i;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===a)break;if(s=r,r=t[++n],e<r)break e}o=t.length;break t}if(!(e>=s)){const a=t[1];e<a&&(n=2,s=a);for(let l=n-2;;){if(s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===l)break;if(r=s,s=t[--n-1],e>=s)break e}o=n,n=0;break t}break n}for(;n<o;){const a=n+o>>>1;e<t[a]?o=a:n=a+1}if(r=t[n],s=t[n-1],s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(r===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,s,r)}return this.interpolate_(n,s,e,r)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){const t=this.resultBuffer,n=this.sampleValues,r=this.valueSize,s=e*r;for(let o=0;o!==r;++o)t[o]=n[s+o];return t}interpolate_(){throw new Error("call to abstract method")}intervalChanged_(){}}class gg extends Zs{constructor(e,t,n,r){super(e,t,n,r),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:iu,endingEnd:iu}}intervalChanged_(e,t,n){const r=this.parameterPositions;let s=e-2,o=e+1,a=r[s],l=r[o];if(a===void 0)switch(this.getSettings_().endingStart){case ru:s=e,a=2*t-n;break;case su:s=r.length-2,a=t+r[s]-r[s+1];break;default:s=e,a=n}if(l===void 0)switch(this.getSettings_().endingEnd){case ru:o=e,l=2*n-t;break;case su:o=1,l=n+r[1]-r[0];break;default:o=e-1,l=t}const c=(n-t)*.5,u=this.valueSize;this._weightPrev=c/(t-a),this._weightNext=c/(l-n),this._offsetPrev=s*u,this._offsetNext=o*u}interpolate_(e,t,n,r){const s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,u=this._offsetPrev,d=this._offsetNext,h=this._weightPrev,f=this._weightNext,g=(n-t)/(r-t),_=g*g,m=_*g,p=-h*m+2*h*_-h*g,M=(1+h)*m+(-1.5-2*h)*_+(-.5+h)*g+1,S=(-1-f)*m+(1.5+f)*_+.5*g,x=f*m-f*_;for(let A=0;A!==a;++A)s[A]=p*o[u+A]+M*o[c+A]+S*o[l+A]+x*o[d+A];return s}}class _g extends Zs{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){const s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,u=(n-t)/(r-t),d=1-u;for(let h=0;h!==a;++h)s[h]=o[c+h]*d+o[l+h]*u;return s}}class vg extends Zs{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e){return this.copySampleValue_(e-1)}}class Fn{constructor(e,t,n,r){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=Io(t,this.TimeBufferType),this.values=Io(n,this.ValueBufferType),this.setInterpolation(r||this.DefaultInterpolation)}static toJSON(e){const t=e.constructor;let n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:Io(e.times,Array),values:Io(e.values,Array)};const r=e.getInterpolation();r!==e.DefaultInterpolation&&(n.interpolation=r)}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new vg(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new _g(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new gg(this.times,this.values,this.getValueSize(),e)}setInterpolation(e){let t;switch(e){case Fs:t=this.InterpolantFactoryMethodDiscrete;break;case ks:t=this.InterpolantFactoryMethodLinear;break;case pa:t=this.InterpolantFactoryMethodSmooth;break}if(t===void 0){const n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return console.warn("THREE.KeyframeTrack:",n),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Fs;case this.InterpolantFactoryMethodLinear:return ks;case this.InterpolantFactoryMethodSmooth:return pa}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){const t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]+=e}return this}scale(e){if(e!==1){const t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]*=e}return this}trim(e,t){const n=this.times,r=n.length;let s=0,o=r-1;for(;s!==r&&n[s]<e;)++s;for(;o!==-1&&n[o]>t;)--o;if(++o,s!==0||o!==r){s>=o&&(o=Math.max(o,1),s=o-1);const a=this.getValueSize();this.times=n.slice(s,o),this.values=this.values.slice(s*a,o*a)}return this}validate(){let e=!0;const t=this.getValueSize();t-Math.floor(t)!==0&&(console.error("THREE.KeyframeTrack: Invalid value size in track.",this),e=!1);const n=this.times,r=this.values,s=n.length;s===0&&(console.error("THREE.KeyframeTrack: Track is empty.",this),e=!1);let o=null;for(let a=0;a!==s;a++){const l=n[a];if(typeof l=="number"&&isNaN(l)){console.error("THREE.KeyframeTrack: Time is not a valid number.",this,a,l),e=!1;break}if(o!==null&&o>l){console.error("THREE.KeyframeTrack: Out of order keys.",this,a,l,o),e=!1;break}o=l}if(r!==void 0&&pg(r))for(let a=0,l=r.length;a!==l;++a){const c=r[a];if(isNaN(c)){console.error("THREE.KeyframeTrack: Value is not a valid number.",this,a,c),e=!1;break}}return e}optimize(){const e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),r=this.getInterpolation()===pa,s=e.length-1;let o=1;for(let a=1;a<s;++a){let l=!1;const c=e[a],u=e[a+1];if(c!==u&&(a!==1||c!==e[0]))if(r)l=!0;else{const d=a*n,h=d-n,f=d+n;for(let g=0;g!==n;++g){const _=t[d+g];if(_!==t[h+g]||_!==t[f+g]){l=!0;break}}}if(l){if(a!==o){e[o]=e[a];const d=a*n,h=o*n;for(let f=0;f!==n;++f)t[h+f]=t[d+f]}++o}}if(s>0){e[o]=e[s];for(let a=s*n,l=o*n,c=0;c!==n;++c)t[l+c]=t[a+c];++o}return o!==e.length?(this.times=e.slice(0,o),this.values=t.slice(0,o*n)):(this.times=e,this.values=t),this}clone(){const e=this.times.slice(),t=this.values.slice(),n=this.constructor,r=new n(this.name,e,t);return r.createInterpolant=this.createInterpolant,r}}Fn.prototype.ValueTypeName="";Fn.prototype.TimeBufferType=Float32Array;Fn.prototype.ValueBufferType=Float32Array;Fn.prototype.DefaultInterpolation=ks;class Qr extends Fn{constructor(e,t,n){super(e,t,n)}}Qr.prototype.ValueTypeName="bool";Qr.prototype.ValueBufferType=Array;Qr.prototype.DefaultInterpolation=Fs;Qr.prototype.InterpolantFactoryMethodLinear=void 0;Qr.prototype.InterpolantFactoryMethodSmooth=void 0;class Kh extends Fn{constructor(e,t,n,r){super(e,t,n,r)}}Kh.prototype.ValueTypeName="color";class Kr extends Fn{constructor(e,t,n,r){super(e,t,n,r)}}Kr.prototype.ValueTypeName="number";class xg extends Zs{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){const s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=(n-t)/(r-t);let c=e*a;for(let u=c+a;c!==u;c+=4)Pn.slerpFlat(s,0,o,c-a,o,c,l);return s}}class $r extends Fn{constructor(e,t,n,r){super(e,t,n,r)}InterpolantFactoryMethodLinear(e){return new xg(this.times,this.values,this.getValueSize(),e)}}$r.prototype.ValueTypeName="quaternion";$r.prototype.InterpolantFactoryMethodSmooth=void 0;class es extends Fn{constructor(e,t,n){super(e,t,n)}}es.prototype.ValueTypeName="string";es.prototype.ValueBufferType=Array;es.prototype.DefaultInterpolation=Fs;es.prototype.InterpolantFactoryMethodLinear=void 0;es.prototype.InterpolantFactoryMethodSmooth=void 0;class Yr extends Fn{constructor(e,t,n,r){super(e,t,n,r)}}Yr.prototype.ValueTypeName="vector";class yg{constructor(e="",t=-1,n=[],r=wp){this.name=e,this.tracks=n,this.duration=t,this.blendMode=r,this.uuid=Sn(),this.userData={},this.duration<0&&this.resetDuration()}static parse(e){const t=[],n=e.tracks,r=1/(e.fps||1);for(let o=0,a=n.length;o!==a;++o)t.push(Mg(n[o]).scale(r));const s=new this(e.name,e.duration,t,e.blendMode);return s.uuid=e.uuid,s.userData=JSON.parse(e.userData||"{}"),s}static toJSON(e){const t=[],n=e.tracks,r={name:e.name,duration:e.duration,tracks:t,uuid:e.uuid,blendMode:e.blendMode,userData:JSON.stringify(e.userData)};for(let s=0,o=n.length;s!==o;++s)t.push(Fn.toJSON(n[s]));return r}static CreateFromMorphTargetSequence(e,t,n,r){const s=t.length,o=[];for(let a=0;a<s;a++){let l=[],c=[];l.push((a+s-1)%s,a,(a+1)%s),c.push(0,1,0);const u=mg(l);l=qu(l,1,u),c=qu(c,1,u),!r&&l[0]===0&&(l.push(s),c.push(c[0])),o.push(new Kr(".morphTargetInfluences["+t[a].name+"]",l,c).scale(1/n))}return new this(e,-1,o)}static findByName(e,t){let n=e;if(!Array.isArray(e)){const r=e;n=r.geometry&&r.geometry.animations||r.animations}for(let r=0;r<n.length;r++)if(n[r].name===t)return n[r];return null}static CreateClipsFromMorphTargetSequences(e,t,n){const r={},s=/^([\w-]*?)([\d]+)$/;for(let a=0,l=e.length;a<l;a++){const c=e[a],u=c.name.match(s);if(u&&u.length>1){const d=u[1];let h=r[d];h||(r[d]=h=[]),h.push(c)}}const o=[];for(const a in r)o.push(this.CreateFromMorphTargetSequence(a,r[a],t,n));return o}static parseAnimation(e,t){if(console.warn("THREE.AnimationClip: parseAnimation() is deprecated and will be removed with r185"),!e)return console.error("THREE.AnimationClip: No animation in JSONLoader data."),null;const n=function(d,h,f,g,_){if(f.length!==0){const m=[],p=[];qh(f,m,p,g),m.length!==0&&_.push(new d(h,m,p))}},r=[],s=e.name||"default",o=e.fps||30,a=e.blendMode;let l=e.length||-1;const c=e.hierarchy||[];for(let d=0;d<c.length;d++){const h=c[d].keys;if(!(!h||h.length===0))if(h[0].morphTargets){const f={};let g;for(g=0;g<h.length;g++)if(h[g].morphTargets)for(let _=0;_<h[g].morphTargets.length;_++)f[h[g].morphTargets[_]]=-1;for(const _ in f){const m=[],p=[];for(let M=0;M!==h[g].morphTargets.length;++M){const S=h[g];m.push(S.time),p.push(S.morphTarget===_?1:0)}r.push(new Kr(".morphTargetInfluence["+_+"]",m,p))}l=f.length*o}else{const f=".bones["+t[d].name+"]";n(Yr,f+".position",h,"pos",r),n($r,f+".quaternion",h,"rot",r),n(Yr,f+".scale",h,"scl",r)}}return r.length===0?null:new this(s,l,r,a)}resetDuration(){const e=this.tracks;let t=0;for(let n=0,r=e.length;n!==r;++n){const s=this.tracks[n];t=Math.max(t,s.times[s.times.length-1])}return this.duration=t,this}trim(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].trim(0,this.duration);return this}validate(){let e=!0;for(let t=0;t<this.tracks.length;t++)e=e&&this.tracks[t].validate();return e}optimize(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].optimize();return this}clone(){const e=[];for(let n=0;n<this.tracks.length;n++)e.push(this.tracks[n].clone());const t=new this.constructor(this.name,this.duration,e,this.blendMode);return t.userData=JSON.parse(JSON.stringify(this.userData)),t}toJSON(){return this.constructor.toJSON(this)}}function Sg(i){switch(i.toLowerCase()){case"scalar":case"double":case"float":case"number":case"integer":return Kr;case"vector":case"vector2":case"vector3":case"vector4":return Yr;case"color":return Kh;case"quaternion":return $r;case"bool":case"boolean":return Qr;case"string":return es}throw new Error("THREE.KeyframeTrack: Unsupported typeName: "+i)}function Mg(i){if(i.type===void 0)throw new Error("THREE.KeyframeTrack: track type undefined, can not parse");const e=Sg(i.type);if(i.times===void 0){const t=[],n=[];qh(i.keys,t,n,"value"),i.times=t,i.values=n}return e.parse!==void 0?e.parse(i):new e(i.name,i.times,i.values,i.interpolation)}const ai={enabled:!1,files:{},add:function(i,e){this.enabled!==!1&&(this.files[i]=e)},get:function(i){if(this.enabled!==!1)return this.files[i]},remove:function(i){delete this.files[i]},clear:function(){this.files={}}};class bg{constructor(e,t,n){const r=this;let s=!1,o=0,a=0,l;const c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this.abortController=new AbortController,this.itemStart=function(u){a++,s===!1&&r.onStart!==void 0&&r.onStart(u,o,a),s=!0},this.itemEnd=function(u){o++,r.onProgress!==void 0&&r.onProgress(u,o,a),o===a&&(s=!1,r.onLoad!==void 0&&r.onLoad())},this.itemError=function(u){r.onError!==void 0&&r.onError(u)},this.resolveURL=function(u){return l?l(u):u},this.setURLModifier=function(u){return l=u,this},this.addHandler=function(u,d){return c.push(u,d),this},this.removeHandler=function(u){const d=c.indexOf(u);return d!==-1&&c.splice(d,2),this},this.getHandler=function(u){for(let d=0,h=c.length;d<h;d+=2){const f=c[d],g=c[d+1];if(f.global&&(f.lastIndex=0),f.test(u))return g}return null},this.abort=function(){return this.abortController.abort(),this.abortController=new AbortController,this}}}const wg=new bg;class ts{constructor(e){this.manager=e!==void 0?e:wg,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(e,t){const n=this;return new Promise(function(r,s){n.load(e,r,t,s)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}abort(){return this}}ts.DEFAULT_MATERIAL_NAME="__DEFAULT";const ii={};class Eg extends Error{constructor(e,t){super(e),this.response=t}}class $h extends ts{constructor(e){super(e),this.mimeType="",this.responseType="",this._abortController=new AbortController}load(e,t,n,r){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const s=ai.get(`file:${e}`);if(s!==void 0)return this.manager.itemStart(e),setTimeout(()=>{t&&t(s),this.manager.itemEnd(e)},0),s;if(ii[e]!==void 0){ii[e].push({onLoad:t,onProgress:n,onError:r});return}ii[e]=[],ii[e].push({onLoad:t,onProgress:n,onError:r});const o=new Request(e,{headers:new Headers(this.requestHeader),credentials:this.withCredentials?"include":"same-origin",signal:typeof AbortSignal.any=="function"?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal}),a=this.mimeType,l=this.responseType;fetch(o).then(c=>{if(c.status===200||c.status===0){if(c.status===0&&console.warn("THREE.FileLoader: HTTP Status 0 received."),typeof ReadableStream>"u"||c.body===void 0||c.body.getReader===void 0)return c;const u=ii[e],d=c.body.getReader(),h=c.headers.get("X-File-Size")||c.headers.get("Content-Length"),f=h?parseInt(h):0,g=f!==0;let _=0;const m=new ReadableStream({start(p){M();function M(){d.read().then(({done:S,value:x})=>{if(S)p.close();else{_+=x.byteLength;const A=new ProgressEvent("progress",{lengthComputable:g,loaded:_,total:f});for(let C=0,R=u.length;C<R;C++){const N=u[C];N.onProgress&&N.onProgress(A)}p.enqueue(x),M()}},S=>{p.error(S)})}}});return new Response(m)}else throw new Eg(`fetch for "${c.url}" responded with ${c.status}: ${c.statusText}`,c)}).then(c=>{switch(l){case"arraybuffer":return c.arrayBuffer();case"blob":return c.blob();case"document":return c.text().then(u=>new DOMParser().parseFromString(u,a));case"json":return c.json();default:if(a==="")return c.text();{const d=/charset="?([^;"\s]*)"?/i.exec(a),h=d&&d[1]?d[1].toLowerCase():void 0,f=new TextDecoder(h);return c.arrayBuffer().then(g=>f.decode(g))}}}).then(c=>{ai.add(`file:${e}`,c);const u=ii[e];delete ii[e];for(let d=0,h=u.length;d<h;d++){const f=u[d];f.onLoad&&f.onLoad(c)}}).catch(c=>{const u=ii[e];if(u===void 0)throw this.manager.itemError(e),c;delete ii[e];for(let d=0,h=u.length;d<h;d++){const f=u[d];f.onError&&f.onError(c)}this.manager.itemError(e)}).finally(()=>{this.manager.itemEnd(e)}),this.manager.itemStart(e)}setResponseType(e){return this.responseType=e,this}setMimeType(e){return this.mimeType=e,this}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}}const wr=new WeakMap;class Tg extends ts{constructor(e){super(e)}load(e,t,n,r){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const s=this,o=ai.get(`image:${e}`);if(o!==void 0){if(o.complete===!0)s.manager.itemStart(e),setTimeout(function(){t&&t(o),s.manager.itemEnd(e)},0);else{let d=wr.get(o);d===void 0&&(d=[],wr.set(o,d)),d.push({onLoad:t,onError:r})}return o}const a=Bs("img");function l(){u(),t&&t(this);const d=wr.get(this)||[];for(let h=0;h<d.length;h++){const f=d[h];f.onLoad&&f.onLoad(this)}wr.delete(this),s.manager.itemEnd(e)}function c(d){u(),r&&r(d),ai.remove(`image:${e}`);const h=wr.get(this)||[];for(let f=0;f<h.length;f++){const g=h[f];g.onError&&g.onError(d)}wr.delete(this),s.manager.itemError(e),s.manager.itemEnd(e)}function u(){a.removeEventListener("load",l,!1),a.removeEventListener("error",c,!1)}return a.addEventListener("load",l,!1),a.addEventListener("error",c,!1),e.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(a.crossOrigin=this.crossOrigin),ai.add(`image:${e}`,a),s.manager.itemStart(e),a.src=e,a}}class Ag extends ts{constructor(e){super(e)}load(e,t,n,r){const s=new Ft,o=new Tg(this.manager);return o.setCrossOrigin(this.crossOrigin),o.setPath(this.path),o.load(e,function(a){s.image=a,s.needsUpdate=!0,t!==void 0&&t(s)},n,r),s}}class ca extends Mt{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Ge(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(t.object.target=this.target.uuid),t}}const Ga=new $e,Ku=new I,$u=new I;class kc{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new _e(512,512),this.mapType=In,this.map=null,this.mapPass=null,this.matrix=new $e,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Ic,this._frameExtents=new _e(1,1),this._viewportCount=1,this._viewports=[new ut(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){const t=this.camera,n=this.matrix;Ku.setFromMatrixPosition(e.matrixWorld),t.position.copy(Ku),$u.setFromMatrixPosition(e.target.matrixWorld),t.lookAt($u),t.updateMatrixWorld(),Ga.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Ga,t.coordinateSystem,t.reversedDepth),t.reversedDepth?n.set(.5,0,0,.5,0,.5,0,.5,0,0,1,0,0,0,0,1):n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(Ga)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}class Cg extends kc{constructor(){super(new Jt(50,1,.5,500)),this.isSpotLightShadow=!0,this.focus=1,this.aspect=1}updateMatrices(e){const t=this.camera,n=Gr*2*e.angle*this.focus,r=this.mapSize.width/this.mapSize.height*this.aspect,s=e.distance||t.far;(n!==t.fov||r!==t.aspect||s!==t.far)&&(t.fov=n,t.aspect=r,t.far=s,t.updateProjectionMatrix()),super.updateMatrices(e)}copy(e){return super.copy(e),this.focus=e.focus,this}}class Yh extends ca{constructor(e,t,n=0,r=Math.PI/3,s=0,o=2){super(e,t),this.isSpotLight=!0,this.type="SpotLight",this.position.copy(Mt.DEFAULT_UP),this.updateMatrix(),this.target=new Mt,this.distance=n,this.angle=r,this.penumbra=s,this.decay=o,this.map=null,this.shadow=new Cg}get power(){return this.intensity*Math.PI}set power(e){this.intensity=e/Math.PI}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.angle=e.angle,this.penumbra=e.penumbra,this.decay=e.decay,this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}}const Yu=new $e,ys=new I,Wa=new I;class Rg extends kc{constructor(){super(new Jt(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new _e(4,2),this._viewportCount=6,this._viewports=[new ut(2,1,1,1),new ut(0,1,1,1),new ut(3,1,1,1),new ut(1,1,1,1),new ut(3,0,1,1),new ut(1,0,1,1)],this._cubeDirections=[new I(1,0,0),new I(-1,0,0),new I(0,0,1),new I(0,0,-1),new I(0,1,0),new I(0,-1,0)],this._cubeUps=[new I(0,1,0),new I(0,1,0),new I(0,1,0),new I(0,1,0),new I(0,0,1),new I(0,0,-1)]}updateMatrices(e,t=0){const n=this.camera,r=this.matrix,s=e.distance||n.far;s!==n.far&&(n.far=s,n.updateProjectionMatrix()),ys.setFromMatrixPosition(e.matrixWorld),n.position.copy(ys),Wa.copy(n.position),Wa.add(this._cubeDirections[t]),n.up.copy(this._cubeUps[t]),n.lookAt(Wa),n.updateMatrixWorld(),r.makeTranslation(-ys.x,-ys.y,-ys.z),Yu.multiplyMatrices(n.projectionMatrix,n.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Yu,n.coordinateSystem,n.reversedDepth)}}class jh extends ca{constructor(e,t,n=0,r=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=r,this.shadow=new Rg}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}}class Bc extends Ch{constructor(e=-1,t=1,n=1,r=-1,s=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=r,this.near=s,this.far=o,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,r,s,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=s,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,r=(this.top+this.bottom)/2;let s=n-e,o=n+e,a=r+t,l=r-t;if(this.view!==null&&this.view.enabled){const c=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;s+=c*this.view.offsetX,o=s+c*this.view.width,a-=u*this.view.offsetY,l=a-u*this.view.height}this.projectionMatrix.makeOrthographic(s,o,a,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}class Lg extends kc{constructor(){super(new Bc(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class Xo extends ca{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Mt.DEFAULT_UP),this.updateMatrix(),this.target=new Mt,this.shadow=new Lg}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}}class Pg extends ca{constructor(e,t){super(e,t),this.isAmbientLight=!0,this.type="AmbientLight"}}class Ls{static extractUrlBase(e){const t=e.lastIndexOf("/");return t===-1?"./":e.slice(0,t+1)}static resolveURL(e,t){return typeof e!="string"||e===""?"":(/^https?:\/\//i.test(t)&&/^\//.test(e)&&(t=t.replace(/(^https?:\/\/[^\/]+).*/i,"$1")),/^(https?:)?\/\//i.test(e)||/^data:.*,.*$/i.test(e)||/^blob:.*$/i.test(e)?e:t+e)}}const Xa=new WeakMap;class Ig extends ts{constructor(e){super(e),this.isImageBitmapLoader=!0,typeof createImageBitmap>"u"&&console.warn("THREE.ImageBitmapLoader: createImageBitmap() not supported."),typeof fetch>"u"&&console.warn("THREE.ImageBitmapLoader: fetch() not supported."),this.options={premultiplyAlpha:"none"},this._abortController=new AbortController}setOptions(e){return this.options=e,this}load(e,t,n,r){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const s=this,o=ai.get(`image-bitmap:${e}`);if(o!==void 0){if(s.manager.itemStart(e),o.then){o.then(c=>{if(Xa.has(o)===!0)r&&r(Xa.get(o)),s.manager.itemError(e),s.manager.itemEnd(e);else return t&&t(c),s.manager.itemEnd(e),c});return}return setTimeout(function(){t&&t(o),s.manager.itemEnd(e)},0),o}const a={};a.credentials=this.crossOrigin==="anonymous"?"same-origin":"include",a.headers=this.requestHeader,a.signal=typeof AbortSignal.any=="function"?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal;const l=fetch(e,a).then(function(c){return c.blob()}).then(function(c){return createImageBitmap(c,Object.assign(s.options,{colorSpaceConversion:"none"}))}).then(function(c){return ai.add(`image-bitmap:${e}`,c),t&&t(c),s.manager.itemEnd(e),c}).catch(function(c){r&&r(c),Xa.set(l,c),ai.remove(`image-bitmap:${e}`),s.manager.itemError(e),s.manager.itemEnd(e)});ai.add(`image-bitmap:${e}`,l),s.manager.itemStart(e)}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}}class Ng extends Jt{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}}const zc="\\[\\]\\.:\\/",Dg=new RegExp("["+zc+"]","g"),Hc="[^"+zc+"]",Ug="[^"+zc.replace("\\.","")+"]",Og=/((?:WC+[\/:])*)/.source.replace("WC",Hc),Fg=/(WCOD+)?/.source.replace("WCOD",Ug),kg=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Hc),Bg=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Hc),zg=new RegExp("^"+Og+Fg+kg+Bg+"$"),Hg=["material","materials","bones","map"];class Vg{constructor(e,t,n){const r=n||pt.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,r)}getValue(e,t){this.bind();const n=this._targetGroup.nCachedObjects_,r=this._bindings[n];r!==void 0&&r.getValue(e,t)}setValue(e,t){const n=this._bindings;for(let r=this._targetGroup.nCachedObjects_,s=n.length;r!==s;++r)n[r].setValue(e,t)}bind(){const e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){const e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}}class pt{constructor(e,t,n){this.path=t,this.parsedPath=n||pt.parseTrackName(t),this.node=pt.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,n){return e&&e.isAnimationObjectGroup?new pt.Composite(e,t,n):new pt(e,t,n)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(Dg,"")}static parseTrackName(e){const t=zg.exec(e);if(t===null)throw new Error("PropertyBinding: Cannot parse trackName: "+e);const n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},r=n.nodeName&&n.nodeName.lastIndexOf(".");if(r!==void 0&&r!==-1){const s=n.nodeName.substring(r+1);Hg.indexOf(s)!==-1&&(n.nodeName=n.nodeName.substring(0,r),n.objectName=s)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("PropertyBinding: can not parse propertyName from trackName: "+e);return n}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){const n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){const n=function(s){for(let o=0;o<s.length;o++){const a=s[o];if(a.name===t||a.uuid===t)return a;const l=n(a.children);if(l)return l}return null},r=n(e.children);if(r)return r}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){const n=this.resolvedProperty;for(let r=0,s=n.length;r!==s;++r)e[t++]=n[r]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){const n=this.resolvedProperty;for(let r=0,s=n.length;r!==s;++r)n[r]=e[t++]}_setValue_array_setNeedsUpdate(e,t){const n=this.resolvedProperty;for(let r=0,s=n.length;r!==s;++r)n[r]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){const n=this.resolvedProperty;for(let r=0,s=n.length;r!==s;++r)n[r]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node;const t=this.parsedPath,n=t.objectName,r=t.propertyName;let s=t.propertyIndex;if(e||(e=pt.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){console.warn("THREE.PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let c=t.objectIndex;switch(n){case"materials":if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let u=0;u<e.length;u++)if(e[u].name===c){c=u;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){console.error("THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[n]===void 0){console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[n]}if(c!==void 0){if(e[c]===void 0){console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[c]}}const o=e[r];if(o===void 0){const c=t.nodeName;console.error("THREE.PropertyBinding: Trying to update property for track: "+c+"."+r+" but it wasn't found.",e);return}let a=this.Versioning.None;this.targetObject=e,e.isMaterial===!0?a=this.Versioning.NeedsUpdate:e.isObject3D===!0&&(a=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(s!==void 0){if(r==="morphTargetInfluences"){if(!e.geometry){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[s]!==void 0&&(s=e.morphTargetDictionary[s])}l=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=s}else o.fromArray!==void 0&&o.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(l=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=r;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][a]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}}pt.Composite=Vg;pt.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};pt.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};pt.prototype.GetterByBindingType=[pt.prototype._getValue_direct,pt.prototype._getValue_array,pt.prototype._getValue_arrayElement,pt.prototype._getValue_toArray];pt.prototype.SetterByBindingTypeAndVersioning=[[pt.prototype._setValue_direct,pt.prototype._setValue_direct_setNeedsUpdate,pt.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[pt.prototype._setValue_array,pt.prototype._setValue_array_setNeedsUpdate,pt.prototype._setValue_array_setMatrixWorldNeedsUpdate],[pt.prototype._setValue_arrayElement,pt.prototype._setValue_arrayElement_setNeedsUpdate,pt.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[pt.prototype._setValue_fromArray,pt.prototype._setValue_fromArray_setNeedsUpdate,pt.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];function ju(i,e,t,n){const r=Gg(n);switch(t){case ph:return i*e;case wc:return i*e/r.components*r.byteLength;case Ec:return i*e/r.components*r.byteLength;case gh:return i*e*2/r.components*r.byteLength;case Tc:return i*e*2/r.components*r.byteLength;case mh:return i*e*3/r.components*r.byteLength;case yn:return i*e*4/r.components*r.byteLength;case Ac:return i*e*4/r.components*r.byteLength;case zo:case Ho:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case Vo:case Go:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Sl:case bl:return Math.max(i,16)*Math.max(e,8)/4;case yl:case Ml:return Math.max(i,8)*Math.max(e,8)/2;case wl:case El:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case Tl:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Al:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Cl:return Math.floor((i+4)/5)*Math.floor((e+3)/4)*16;case Rl:return Math.floor((i+4)/5)*Math.floor((e+4)/5)*16;case Ll:return Math.floor((i+5)/6)*Math.floor((e+4)/5)*16;case Pl:return Math.floor((i+5)/6)*Math.floor((e+5)/6)*16;case Il:return Math.floor((i+7)/8)*Math.floor((e+4)/5)*16;case Nl:return Math.floor((i+7)/8)*Math.floor((e+5)/6)*16;case Dl:return Math.floor((i+7)/8)*Math.floor((e+7)/8)*16;case Ul:return Math.floor((i+9)/10)*Math.floor((e+4)/5)*16;case Ol:return Math.floor((i+9)/10)*Math.floor((e+5)/6)*16;case Fl:return Math.floor((i+9)/10)*Math.floor((e+7)/8)*16;case kl:return Math.floor((i+9)/10)*Math.floor((e+9)/10)*16;case Bl:return Math.floor((i+11)/12)*Math.floor((e+9)/10)*16;case zl:return Math.floor((i+11)/12)*Math.floor((e+11)/12)*16;case Hl:case Vl:case Gl:return Math.ceil(i/4)*Math.ceil(e/4)*16;case Wl:case Xl:return Math.ceil(i/4)*Math.ceil(e/4)*8;case ql:case Kl:return Math.ceil(i/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function Gg(i){switch(i){case In:case uh:return{byteLength:1,components:1};case Ns:case dh:case Jr:return{byteLength:2,components:1};case Mc:case bc:return{byteLength:2,components:4};case er:case Sc:case Rn:return{byteLength:4,components:1};case hh:case fh:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${i}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:yc}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=yc);function Jh(){let i=null,e=!1,t=null,n=null;function r(s,o){t(s,o),n=i.requestAnimationFrame(r)}return{start:function(){e!==!0&&t!==null&&(n=i.requestAnimationFrame(r),e=!0)},stop:function(){i.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(s){t=s},setContext:function(s){i=s}}}function Wg(i){const e=new WeakMap;function t(a,l){const c=a.array,u=a.usage,d=c.byteLength,h=i.createBuffer();i.bindBuffer(l,h),i.bufferData(l,c,u),a.onUploadCallback();let f;if(c instanceof Float32Array)f=i.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)f=i.HALF_FLOAT;else if(c instanceof Uint16Array)a.isFloat16BufferAttribute?f=i.HALF_FLOAT:f=i.UNSIGNED_SHORT;else if(c instanceof Int16Array)f=i.SHORT;else if(c instanceof Uint32Array)f=i.UNSIGNED_INT;else if(c instanceof Int32Array)f=i.INT;else if(c instanceof Int8Array)f=i.BYTE;else if(c instanceof Uint8Array)f=i.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)f=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:h,type:f,bytesPerElement:c.BYTES_PER_ELEMENT,version:a.version,size:d}}function n(a,l,c){const u=l.array,d=l.updateRanges;if(i.bindBuffer(c,a),d.length===0)i.bufferSubData(c,0,u);else{d.sort((f,g)=>f.start-g.start);let h=0;for(let f=1;f<d.length;f++){const g=d[h],_=d[f];_.start<=g.start+g.count+1?g.count=Math.max(g.count,_.start+_.count-g.start):(++h,d[h]=_)}d.length=h+1;for(let f=0,g=d.length;f<g;f++){const _=d[f];i.bufferSubData(c,_.start*u.BYTES_PER_ELEMENT,u,_.start,_.count)}l.clearUpdateRanges()}l.onUploadCallback()}function r(a){return a.isInterleavedBufferAttribute&&(a=a.data),e.get(a)}function s(a){a.isInterleavedBufferAttribute&&(a=a.data);const l=e.get(a);l&&(i.deleteBuffer(l.buffer),e.delete(a))}function o(a,l){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){const u=e.get(a);(!u||u.version<a.version)&&e.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}const c=e.get(a);if(c===void 0)e.set(a,t(a,l));else if(c.version<a.version){if(c.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,a,l),c.version=a.version}}return{get:r,remove:s,update:o}}var Xg=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,qg=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,Kg=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,$g=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Yg=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,jg=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Jg=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,Zg=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Qg=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,e0=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,t0=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,n0=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,i0=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,r0=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,s0=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,o0=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,a0=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,l0=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,c0=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,u0=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,d0=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,h0=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,f0=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,p0=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,m0=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,g0=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,_0=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,v0=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,x0=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,y0=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,S0="gl_FragColor = linearToOutputTexel( gl_FragColor );",M0=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,b0=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,w0=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,E0=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,T0=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,A0=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,C0=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,R0=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,L0=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,P0=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,I0=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,N0=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,D0=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,U0=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,O0=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,F0=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,k0=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,B0=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,z0=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,H0=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,V0=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,G0=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,W0=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,X0=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,q0=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,K0=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,$0=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Y0=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,j0=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,J0=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Z0=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Q0=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,e_=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,t_=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,n_=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,i_=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,r_=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,s_=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,o_=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,a_=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,l_=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,c_=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,u_=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,d_=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,h_=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,f_=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,p_=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,m_=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,g_=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,__=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,v_=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,x_=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,y_=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,S_=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,M_=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,b_=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,w_=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,E_=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,T_=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		float depth = unpackRGBAToDepth( texture2D( depths, uv ) );
		#ifdef USE_REVERSED_DEPTH_BUFFER
			return step( depth, compare );
		#else
			return step( compare, depth );
		#endif
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow( sampler2D shadow, vec2 uv, float compare ) {
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		#ifdef USE_REVERSED_DEPTH_BUFFER
			float hard_shadow = step( distribution.x, compare );
		#else
			float hard_shadow = step( compare, distribution.x );
		#endif
		if ( hard_shadow != 1.0 ) {
			float distance = compare - distribution.x;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,A_=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,C_=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,R_=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,L_=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,P_=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,I_=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,N_=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,D_=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,U_=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,O_=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,F_=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,k_=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,B_=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,z_=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,H_=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,V_=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,G_=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const W_=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,X_=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,q_=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,K_=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,$_=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Y_=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,j_=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,J_=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,Z_=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,Q_=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,ev=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,tv=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,nv=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,iv=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,rv=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,sv=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,ov=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,av=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,lv=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,cv=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,uv=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,dv=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,hv=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,fv=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,pv=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,mv=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,gv=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,_v=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,vv=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,xv=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,yv=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Sv=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Mv=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,bv=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,tt={alphahash_fragment:Xg,alphahash_pars_fragment:qg,alphamap_fragment:Kg,alphamap_pars_fragment:$g,alphatest_fragment:Yg,alphatest_pars_fragment:jg,aomap_fragment:Jg,aomap_pars_fragment:Zg,batching_pars_vertex:Qg,batching_vertex:e0,begin_vertex:t0,beginnormal_vertex:n0,bsdfs:i0,iridescence_fragment:r0,bumpmap_pars_fragment:s0,clipping_planes_fragment:o0,clipping_planes_pars_fragment:a0,clipping_planes_pars_vertex:l0,clipping_planes_vertex:c0,color_fragment:u0,color_pars_fragment:d0,color_pars_vertex:h0,color_vertex:f0,common:p0,cube_uv_reflection_fragment:m0,defaultnormal_vertex:g0,displacementmap_pars_vertex:_0,displacementmap_vertex:v0,emissivemap_fragment:x0,emissivemap_pars_fragment:y0,colorspace_fragment:S0,colorspace_pars_fragment:M0,envmap_fragment:b0,envmap_common_pars_fragment:w0,envmap_pars_fragment:E0,envmap_pars_vertex:T0,envmap_physical_pars_fragment:F0,envmap_vertex:A0,fog_vertex:C0,fog_pars_vertex:R0,fog_fragment:L0,fog_pars_fragment:P0,gradientmap_pars_fragment:I0,lightmap_pars_fragment:N0,lights_lambert_fragment:D0,lights_lambert_pars_fragment:U0,lights_pars_begin:O0,lights_toon_fragment:k0,lights_toon_pars_fragment:B0,lights_phong_fragment:z0,lights_phong_pars_fragment:H0,lights_physical_fragment:V0,lights_physical_pars_fragment:G0,lights_fragment_begin:W0,lights_fragment_maps:X0,lights_fragment_end:q0,logdepthbuf_fragment:K0,logdepthbuf_pars_fragment:$0,logdepthbuf_pars_vertex:Y0,logdepthbuf_vertex:j0,map_fragment:J0,map_pars_fragment:Z0,map_particle_fragment:Q0,map_particle_pars_fragment:e_,metalnessmap_fragment:t_,metalnessmap_pars_fragment:n_,morphinstance_vertex:i_,morphcolor_vertex:r_,morphnormal_vertex:s_,morphtarget_pars_vertex:o_,morphtarget_vertex:a_,normal_fragment_begin:l_,normal_fragment_maps:c_,normal_pars_fragment:u_,normal_pars_vertex:d_,normal_vertex:h_,normalmap_pars_fragment:f_,clearcoat_normal_fragment_begin:p_,clearcoat_normal_fragment_maps:m_,clearcoat_pars_fragment:g_,iridescence_pars_fragment:__,opaque_fragment:v_,packing:x_,premultiplied_alpha_fragment:y_,project_vertex:S_,dithering_fragment:M_,dithering_pars_fragment:b_,roughnessmap_fragment:w_,roughnessmap_pars_fragment:E_,shadowmap_pars_fragment:T_,shadowmap_pars_vertex:A_,shadowmap_vertex:C_,shadowmask_pars_fragment:R_,skinbase_vertex:L_,skinning_pars_vertex:P_,skinning_vertex:I_,skinnormal_vertex:N_,specularmap_fragment:D_,specularmap_pars_fragment:U_,tonemapping_fragment:O_,tonemapping_pars_fragment:F_,transmission_fragment:k_,transmission_pars_fragment:B_,uv_pars_fragment:z_,uv_pars_vertex:H_,uv_vertex:V_,worldpos_vertex:G_,background_vert:W_,background_frag:X_,backgroundCube_vert:q_,backgroundCube_frag:K_,cube_vert:$_,cube_frag:Y_,depth_vert:j_,depth_frag:J_,distanceRGBA_vert:Z_,distanceRGBA_frag:Q_,equirect_vert:ev,equirect_frag:tv,linedashed_vert:nv,linedashed_frag:iv,meshbasic_vert:rv,meshbasic_frag:sv,meshlambert_vert:ov,meshlambert_frag:av,meshmatcap_vert:lv,meshmatcap_frag:cv,meshnormal_vert:uv,meshnormal_frag:dv,meshphong_vert:hv,meshphong_frag:fv,meshphysical_vert:pv,meshphysical_frag:mv,meshtoon_vert:gv,meshtoon_frag:_v,points_vert:vv,points_frag:xv,shadow_vert:yv,shadow_frag:Sv,sprite_vert:Mv,sprite_frag:bv},Le={common:{diffuse:{value:new Ge(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Qe},alphaMap:{value:null},alphaMapTransform:{value:new Qe},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Qe}},envmap:{envMap:{value:null},envMapRotation:{value:new Qe},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Qe}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Qe}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Qe},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Qe},normalScale:{value:new _e(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Qe},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Qe}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Qe}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Qe}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Ge(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Ge(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Qe},alphaTest:{value:0},uvTransform:{value:new Qe}},sprite:{diffuse:{value:new Ge(16777215)},opacity:{value:1},center:{value:new _e(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Qe},alphaMap:{value:null},alphaMapTransform:{value:new Qe},alphaTest:{value:0}}},Hn={basic:{uniforms:Yt([Le.common,Le.specularmap,Le.envmap,Le.aomap,Le.lightmap,Le.fog]),vertexShader:tt.meshbasic_vert,fragmentShader:tt.meshbasic_frag},lambert:{uniforms:Yt([Le.common,Le.specularmap,Le.envmap,Le.aomap,Le.lightmap,Le.emissivemap,Le.bumpmap,Le.normalmap,Le.displacementmap,Le.fog,Le.lights,{emissive:{value:new Ge(0)}}]),vertexShader:tt.meshlambert_vert,fragmentShader:tt.meshlambert_frag},phong:{uniforms:Yt([Le.common,Le.specularmap,Le.envmap,Le.aomap,Le.lightmap,Le.emissivemap,Le.bumpmap,Le.normalmap,Le.displacementmap,Le.fog,Le.lights,{emissive:{value:new Ge(0)},specular:{value:new Ge(1118481)},shininess:{value:30}}]),vertexShader:tt.meshphong_vert,fragmentShader:tt.meshphong_frag},standard:{uniforms:Yt([Le.common,Le.envmap,Le.aomap,Le.lightmap,Le.emissivemap,Le.bumpmap,Le.normalmap,Le.displacementmap,Le.roughnessmap,Le.metalnessmap,Le.fog,Le.lights,{emissive:{value:new Ge(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:tt.meshphysical_vert,fragmentShader:tt.meshphysical_frag},toon:{uniforms:Yt([Le.common,Le.aomap,Le.lightmap,Le.emissivemap,Le.bumpmap,Le.normalmap,Le.displacementmap,Le.gradientmap,Le.fog,Le.lights,{emissive:{value:new Ge(0)}}]),vertexShader:tt.meshtoon_vert,fragmentShader:tt.meshtoon_frag},matcap:{uniforms:Yt([Le.common,Le.bumpmap,Le.normalmap,Le.displacementmap,Le.fog,{matcap:{value:null}}]),vertexShader:tt.meshmatcap_vert,fragmentShader:tt.meshmatcap_frag},points:{uniforms:Yt([Le.points,Le.fog]),vertexShader:tt.points_vert,fragmentShader:tt.points_frag},dashed:{uniforms:Yt([Le.common,Le.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:tt.linedashed_vert,fragmentShader:tt.linedashed_frag},depth:{uniforms:Yt([Le.common,Le.displacementmap]),vertexShader:tt.depth_vert,fragmentShader:tt.depth_frag},normal:{uniforms:Yt([Le.common,Le.bumpmap,Le.normalmap,Le.displacementmap,{opacity:{value:1}}]),vertexShader:tt.meshnormal_vert,fragmentShader:tt.meshnormal_frag},sprite:{uniforms:Yt([Le.sprite,Le.fog]),vertexShader:tt.sprite_vert,fragmentShader:tt.sprite_frag},background:{uniforms:{uvTransform:{value:new Qe},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:tt.background_vert,fragmentShader:tt.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Qe}},vertexShader:tt.backgroundCube_vert,fragmentShader:tt.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:tt.cube_vert,fragmentShader:tt.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:tt.equirect_vert,fragmentShader:tt.equirect_frag},distanceRGBA:{uniforms:Yt([Le.common,Le.displacementmap,{referencePosition:{value:new I},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:tt.distanceRGBA_vert,fragmentShader:tt.distanceRGBA_frag},shadow:{uniforms:Yt([Le.lights,Le.fog,{color:{value:new Ge(0)},opacity:{value:1}}]),vertexShader:tt.shadow_vert,fragmentShader:tt.shadow_frag}};Hn.physical={uniforms:Yt([Hn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Qe},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Qe},clearcoatNormalScale:{value:new _e(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Qe},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Qe},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Qe},sheen:{value:0},sheenColor:{value:new Ge(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Qe},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Qe},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Qe},transmissionSamplerSize:{value:new _e},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Qe},attenuationDistance:{value:0},attenuationColor:{value:new Ge(0)},specularColor:{value:new Ge(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Qe},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Qe},anisotropyVector:{value:new _e},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Qe}}]),vertexShader:tt.meshphysical_vert,fragmentShader:tt.meshphysical_frag};const No={r:0,b:0,g:0},Hi=new Dn,wv=new $e;function Ev(i,e,t,n,r,s,o){const a=new Ge(0);let l=s===!0?0:1,c,u,d=null,h=0,f=null;function g(S){let x=S.isScene===!0?S.background:null;return x&&x.isTexture&&(x=(S.backgroundBlurriness>0?t:e).get(x)),x}function _(S){let x=!1;const A=g(S);A===null?p(a,l):A&&A.isColor&&(p(A,1),x=!0);const C=i.xr.getEnvironmentBlendMode();C==="additive"?n.buffers.color.setClear(0,0,0,1,o):C==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,o),(i.autoClear||x)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function m(S,x){const A=g(x);A&&(A.isCubeTexture||A.mapping===aa)?(u===void 0&&(u=new kt(new Js(1,1,1),new Un({name:"BackgroundCubeMaterial",uniforms:Wr(Hn.backgroundCube.uniforms),vertexShader:Hn.backgroundCube.vertexShader,fragmentShader:Hn.backgroundCube.fragmentShader,side:tn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),u.geometry.deleteAttribute("normal"),u.geometry.deleteAttribute("uv"),u.onBeforeRender=function(C,R,N){this.matrixWorld.copyPosition(N.matrixWorld)},Object.defineProperty(u.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),r.update(u)),Hi.copy(x.backgroundRotation),Hi.x*=-1,Hi.y*=-1,Hi.z*=-1,A.isCubeTexture&&A.isRenderTargetTexture===!1&&(Hi.y*=-1,Hi.z*=-1),u.material.uniforms.envMap.value=A,u.material.uniforms.flipEnvMap.value=A.isCubeTexture&&A.isRenderTargetTexture===!1?-1:1,u.material.uniforms.backgroundBlurriness.value=x.backgroundBlurriness,u.material.uniforms.backgroundIntensity.value=x.backgroundIntensity,u.material.uniforms.backgroundRotation.value.setFromMatrix4(wv.makeRotationFromEuler(Hi)),u.material.toneMapped=ot.getTransfer(A.colorSpace)!==_t,(d!==A||h!==A.version||f!==i.toneMapping)&&(u.material.needsUpdate=!0,d=A,h=A.version,f=i.toneMapping),u.layers.enableAll(),S.unshift(u,u.geometry,u.material,0,0,null)):A&&A.isTexture&&(c===void 0&&(c=new kt(new qr(2,2),new Un({name:"BackgroundMaterial",uniforms:Wr(Hn.background.uniforms),vertexShader:Hn.background.vertexShader,fragmentShader:Hn.background.fragmentShader,side:Kn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),r.update(c)),c.material.uniforms.t2D.value=A,c.material.uniforms.backgroundIntensity.value=x.backgroundIntensity,c.material.toneMapped=ot.getTransfer(A.colorSpace)!==_t,A.matrixAutoUpdate===!0&&A.updateMatrix(),c.material.uniforms.uvTransform.value.copy(A.matrix),(d!==A||h!==A.version||f!==i.toneMapping)&&(c.material.needsUpdate=!0,d=A,h=A.version,f=i.toneMapping),c.layers.enableAll(),S.unshift(c,c.geometry,c.material,0,0,null))}function p(S,x){S.getRGB(No,Th(i)),n.buffers.color.setClear(No.r,No.g,No.b,x,o)}function M(){u!==void 0&&(u.geometry.dispose(),u.material.dispose(),u=void 0),c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0)}return{getClearColor:function(){return a},setClearColor:function(S,x=1){a.set(S),l=x,p(a,l)},getClearAlpha:function(){return l},setClearAlpha:function(S){l=S,p(a,l)},render:_,addToRenderList:m,dispose:M}}function Tv(i,e){const t=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},r=h(null);let s=r,o=!1;function a(y,L,k,W,X){let q=!1;const z=d(W,k,L);s!==z&&(s=z,c(s.object)),q=f(y,W,k,X),q&&g(y,W,k,X),X!==null&&e.update(X,i.ELEMENT_ARRAY_BUFFER),(q||o)&&(o=!1,x(y,L,k,W),X!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,e.get(X).buffer))}function l(){return i.createVertexArray()}function c(y){return i.bindVertexArray(y)}function u(y){return i.deleteVertexArray(y)}function d(y,L,k){const W=k.wireframe===!0;let X=n[y.id];X===void 0&&(X={},n[y.id]=X);let q=X[L.id];q===void 0&&(q={},X[L.id]=q);let z=q[W];return z===void 0&&(z=h(l()),q[W]=z),z}function h(y){const L=[],k=[],W=[];for(let X=0;X<t;X++)L[X]=0,k[X]=0,W[X]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:L,enabledAttributes:k,attributeDivisors:W,object:y,attributes:{},index:null}}function f(y,L,k,W){const X=s.attributes,q=L.attributes;let z=0;const oe=k.getAttributes();for(const V in oe)if(oe[V].location>=0){const K=X[V];let ne=q[V];if(ne===void 0&&(V==="instanceMatrix"&&y.instanceMatrix&&(ne=y.instanceMatrix),V==="instanceColor"&&y.instanceColor&&(ne=y.instanceColor)),K===void 0||K.attribute!==ne||ne&&K.data!==ne.data)return!0;z++}return s.attributesNum!==z||s.index!==W}function g(y,L,k,W){const X={},q=L.attributes;let z=0;const oe=k.getAttributes();for(const V in oe)if(oe[V].location>=0){let K=q[V];K===void 0&&(V==="instanceMatrix"&&y.instanceMatrix&&(K=y.instanceMatrix),V==="instanceColor"&&y.instanceColor&&(K=y.instanceColor));const ne={};ne.attribute=K,K&&K.data&&(ne.data=K.data),X[V]=ne,z++}s.attributes=X,s.attributesNum=z,s.index=W}function _(){const y=s.newAttributes;for(let L=0,k=y.length;L<k;L++)y[L]=0}function m(y){p(y,0)}function p(y,L){const k=s.newAttributes,W=s.enabledAttributes,X=s.attributeDivisors;k[y]=1,W[y]===0&&(i.enableVertexAttribArray(y),W[y]=1),X[y]!==L&&(i.vertexAttribDivisor(y,L),X[y]=L)}function M(){const y=s.newAttributes,L=s.enabledAttributes;for(let k=0,W=L.length;k<W;k++)L[k]!==y[k]&&(i.disableVertexAttribArray(k),L[k]=0)}function S(y,L,k,W,X,q,z){z===!0?i.vertexAttribIPointer(y,L,k,X,q):i.vertexAttribPointer(y,L,k,W,X,q)}function x(y,L,k,W){_();const X=W.attributes,q=k.getAttributes(),z=L.defaultAttributeValues;for(const oe in q){const V=q[oe];if(V.location>=0){let pe=X[oe];if(pe===void 0&&(oe==="instanceMatrix"&&y.instanceMatrix&&(pe=y.instanceMatrix),oe==="instanceColor"&&y.instanceColor&&(pe=y.instanceColor)),pe!==void 0){const K=pe.normalized,ne=pe.itemSize,ce=e.get(pe);if(ce===void 0)continue;const ae=ce.buffer,ye=ce.type,Ue=ce.bytesPerElement,Z=ye===i.INT||ye===i.UNSIGNED_INT||pe.gpuType===Sc;if(pe.isInterleavedBufferAttribute){const ee=pe.data,Me=ee.stride,Te=pe.offset;if(ee.isInstancedInterleavedBuffer){for(let Ae=0;Ae<V.locationSize;Ae++)p(V.location+Ae,ee.meshPerAttribute);y.isInstancedMesh!==!0&&W._maxInstanceCount===void 0&&(W._maxInstanceCount=ee.meshPerAttribute*ee.count)}else for(let Ae=0;Ae<V.locationSize;Ae++)m(V.location+Ae);i.bindBuffer(i.ARRAY_BUFFER,ae);for(let Ae=0;Ae<V.locationSize;Ae++)S(V.location+Ae,ne/V.locationSize,ye,K,Me*Ue,(Te+ne/V.locationSize*Ae)*Ue,Z)}else{if(pe.isInstancedBufferAttribute){for(let ee=0;ee<V.locationSize;ee++)p(V.location+ee,pe.meshPerAttribute);y.isInstancedMesh!==!0&&W._maxInstanceCount===void 0&&(W._maxInstanceCount=pe.meshPerAttribute*pe.count)}else for(let ee=0;ee<V.locationSize;ee++)m(V.location+ee);i.bindBuffer(i.ARRAY_BUFFER,ae);for(let ee=0;ee<V.locationSize;ee++)S(V.location+ee,ne/V.locationSize,ye,K,ne*Ue,ne/V.locationSize*ee*Ue,Z)}}else if(z!==void 0){const K=z[oe];if(K!==void 0)switch(K.length){case 2:i.vertexAttrib2fv(V.location,K);break;case 3:i.vertexAttrib3fv(V.location,K);break;case 4:i.vertexAttrib4fv(V.location,K);break;default:i.vertexAttrib1fv(V.location,K)}}}}M()}function A(){N();for(const y in n){const L=n[y];for(const k in L){const W=L[k];for(const X in W)u(W[X].object),delete W[X];delete L[k]}delete n[y]}}function C(y){if(n[y.id]===void 0)return;const L=n[y.id];for(const k in L){const W=L[k];for(const X in W)u(W[X].object),delete W[X];delete L[k]}delete n[y.id]}function R(y){for(const L in n){const k=n[L];if(k[y.id]===void 0)continue;const W=k[y.id];for(const X in W)u(W[X].object),delete W[X];delete k[y.id]}}function N(){w(),o=!0,s!==r&&(s=r,c(s.object))}function w(){r.geometry=null,r.program=null,r.wireframe=!1}return{setup:a,reset:N,resetDefaultState:w,dispose:A,releaseStatesOfGeometry:C,releaseStatesOfProgram:R,initAttributes:_,enableAttribute:m,disableUnusedAttributes:M}}function Av(i,e,t){let n;function r(c){n=c}function s(c,u){i.drawArrays(n,c,u),t.update(u,n,1)}function o(c,u,d){d!==0&&(i.drawArraysInstanced(n,c,u,d),t.update(u,n,d))}function a(c,u,d){if(d===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,c,0,u,0,d);let f=0;for(let g=0;g<d;g++)f+=u[g];t.update(f,n,1)}function l(c,u,d,h){if(d===0)return;const f=e.get("WEBGL_multi_draw");if(f===null)for(let g=0;g<c.length;g++)o(c[g],u[g],h[g]);else{f.multiDrawArraysInstancedWEBGL(n,c,0,u,0,h,0,d);let g=0;for(let _=0;_<d;_++)g+=u[_]*h[_];t.update(g,n,1)}}this.setMode=r,this.render=s,this.renderInstances=o,this.renderMultiDraw=a,this.renderMultiDrawInstances=l}function Cv(i,e,t,n){let r;function s(){if(r!==void 0)return r;if(e.has("EXT_texture_filter_anisotropic")===!0){const R=e.get("EXT_texture_filter_anisotropic");r=i.getParameter(R.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else r=0;return r}function o(R){return!(R!==yn&&n.convert(R)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(R){const N=R===Jr&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(R!==In&&n.convert(R)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE)&&R!==Rn&&!N)}function l(R){if(R==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";R="mediump"}return R==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp";const u=l(c);u!==c&&(console.warn("THREE.WebGLRenderer:",c,"not supported, using",u,"instead."),c=u);const d=t.logarithmicDepthBuffer===!0,h=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control"),f=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),g=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),_=i.getParameter(i.MAX_TEXTURE_SIZE),m=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),p=i.getParameter(i.MAX_VERTEX_ATTRIBS),M=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),S=i.getParameter(i.MAX_VARYING_VECTORS),x=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),A=g>0,C=i.getParameter(i.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:s,getMaxPrecision:l,textureFormatReadable:o,textureTypeReadable:a,precision:c,logarithmicDepthBuffer:d,reversedDepthBuffer:h,maxTextures:f,maxVertexTextures:g,maxTextureSize:_,maxCubemapSize:m,maxAttributes:p,maxVertexUniforms:M,maxVaryings:S,maxFragmentUniforms:x,vertexTextures:A,maxSamples:C}}function Rv(i){const e=this;let t=null,n=0,r=!1,s=!1;const o=new Wi,a=new Qe,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(d,h){const f=d.length!==0||h||n!==0||r;return r=h,n=d.length,f},this.beginShadows=function(){s=!0,u(null)},this.endShadows=function(){s=!1},this.setGlobalState=function(d,h){t=u(d,h,0)},this.setState=function(d,h,f){const g=d.clippingPlanes,_=d.clipIntersection,m=d.clipShadows,p=i.get(d);if(!r||g===null||g.length===0||s&&!m)s?u(null):c();else{const M=s?0:n,S=M*4;let x=p.clippingState||null;l.value=x,x=u(g,h,S,f);for(let A=0;A!==S;++A)x[A]=t[A];p.clippingState=x,this.numIntersection=_?this.numPlanes:0,this.numPlanes+=M}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function u(d,h,f,g){const _=d!==null?d.length:0;let m=null;if(_!==0){if(m=l.value,g!==!0||m===null){const p=f+_*4,M=h.matrixWorldInverse;a.getNormalMatrix(M),(m===null||m.length<p)&&(m=new Float32Array(p));for(let S=0,x=f;S!==_;++S,x+=4)o.copy(d[S]).applyMatrix4(M,a),o.normal.toArray(m,x),m[x+3]=o.constant}l.value=m,l.needsUpdate=!0}return e.numPlanes=_,e.numIntersection=0,m}}function Lv(i){let e=new WeakMap;function t(o,a){return a===vl?o.mapping=zr:a===xl&&(o.mapping=Hr),o}function n(o){if(o&&o.isTexture){const a=o.mapping;if(a===vl||a===xl)if(e.has(o)){const l=e.get(o).texture;return t(l,o.mapping)}else{const l=o.image;if(l&&l.height>0){const c=new Sm(l.height);return c.fromEquirectangularTexture(i,o),e.set(o,c),o.addEventListener("dispose",r),t(c.texture,o.mapping)}else return null}}return o}function r(o){const a=o.target;a.removeEventListener("dispose",r);const l=e.get(a);l!==void 0&&(e.delete(a),l.dispose())}function s(){e=new WeakMap}return{get:n,dispose:s}}const Pr=4,Ju=[.125,.215,.35,.446,.526,.582],$i=20,qa=new Bc,Zu=new Ge;let Ka=null,$a=0,Ya=0,ja=!1;const Xi=(1+Math.sqrt(5))/2,Er=1/Xi,Qu=[new I(-Xi,Er,0),new I(Xi,Er,0),new I(-Er,0,Xi),new I(Er,0,Xi),new I(0,Xi,-Er),new I(0,Xi,Er),new I(-1,1,-1),new I(1,1,-1),new I(-1,1,1),new I(1,1,1)],Pv=new I;class tc{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,n=.1,r=100,s={}){const{size:o=256,position:a=Pv}=s;Ka=this._renderer.getRenderTarget(),$a=this._renderer.getActiveCubeFace(),Ya=this._renderer.getActiveMipmapLevel(),ja=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(o);const l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(e,n,r,l,a),t>0&&this._blur(l,0,0,t),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=nd(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=td(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(Ka,$a,Ya),this._renderer.xr.enabled=ja,e.scissorTest=!1,Do(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===zr||e.mapping===Hr?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Ka=this._renderer.getRenderTarget(),$a=this._renderer.getActiveCubeFace(),Ya=this._renderer.getActiveMipmapLevel(),ja=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:Zt,minFilter:Zt,generateMipmaps:!1,type:Jr,format:yn,colorSpace:zt,depthBuffer:!1},r=ed(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=ed(e,t,n);const{_lodMax:s}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=Iv(s)),this._blurMaterial=Nv(s,e,t)}return r}_compileMaterial(e){const t=new kt(this._lodPlanes[0],e);this._renderer.compile(t,qa)}_sceneToCubeUV(e,t,n,r,s){const l=new Jt(90,1,t,n),c=[1,-1,1,1,1,1],u=[1,1,1,-1,-1,-1],d=this._renderer,h=d.autoClear,f=d.toneMapping;d.getClearColor(Zu),d.toneMapping=Wn,d.autoClear=!1,d.state.buffers.depth.getReversed()&&(d.setRenderTarget(r),d.clearDepth(),d.setRenderTarget(null));const _=new oi({name:"PMREM.Background",side:tn,depthWrite:!1,depthTest:!1}),m=new kt(new Js,_);let p=!1;const M=e.background;M?M.isColor&&(_.color.copy(M),e.background=null,p=!0):(_.color.copy(Zu),p=!0);for(let S=0;S<6;S++){const x=S%3;x===0?(l.up.set(0,c[S],0),l.position.set(s.x,s.y,s.z),l.lookAt(s.x+u[S],s.y,s.z)):x===1?(l.up.set(0,0,c[S]),l.position.set(s.x,s.y,s.z),l.lookAt(s.x,s.y+u[S],s.z)):(l.up.set(0,c[S],0),l.position.set(s.x,s.y,s.z),l.lookAt(s.x,s.y,s.z+u[S]));const A=this._cubeSize;Do(r,x*A,S>2?A:0,A,A),d.setRenderTarget(r),p&&d.render(m,l),d.render(e,l)}m.geometry.dispose(),m.material.dispose(),d.toneMapping=f,d.autoClear=h,e.background=M}_textureToCubeUV(e,t){const n=this._renderer,r=e.mapping===zr||e.mapping===Hr;r?(this._cubemapMaterial===null&&(this._cubemapMaterial=nd()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=td());const s=r?this._cubemapMaterial:this._equirectMaterial,o=new kt(this._lodPlanes[0],s),a=s.uniforms;a.envMap.value=e;const l=this._cubeSize;Do(t,0,0,3*l,2*l),n.setRenderTarget(t),n.render(o,qa)}_applyPMREM(e){const t=this._renderer,n=t.autoClear;t.autoClear=!1;const r=this._lodPlanes.length;for(let s=1;s<r;s++){const o=Math.sqrt(this._sigmas[s]*this._sigmas[s]-this._sigmas[s-1]*this._sigmas[s-1]),a=Qu[(r-s-1)%Qu.length];this._blur(e,s-1,s,o,a)}t.autoClear=n}_blur(e,t,n,r,s){const o=this._pingPongRenderTarget;this._halfBlur(e,o,t,n,r,"latitudinal",s),this._halfBlur(o,e,n,n,r,"longitudinal",s)}_halfBlur(e,t,n,r,s,o,a){const l=this._renderer,c=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const u=3,d=new kt(this._lodPlanes[r],c),h=c.uniforms,f=this._sizeLods[n]-1,g=isFinite(s)?Math.PI/(2*f):2*Math.PI/(2*$i-1),_=s/g,m=isFinite(s)?1+Math.floor(u*_):$i;m>$i&&console.warn(`sigmaRadians, ${s}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${$i}`);const p=[];let M=0;for(let R=0;R<$i;++R){const N=R/_,w=Math.exp(-N*N/2);p.push(w),R===0?M+=w:R<m&&(M+=2*w)}for(let R=0;R<p.length;R++)p[R]=p[R]/M;h.envMap.value=e.texture,h.samples.value=m,h.weights.value=p,h.latitudinal.value=o==="latitudinal",a&&(h.poleAxis.value=a);const{_lodMax:S}=this;h.dTheta.value=g,h.mipInt.value=S-n;const x=this._sizeLods[r],A=3*x*(r>S-Pr?r-S+Pr:0),C=4*(this._cubeSize-x);Do(t,A,C,3*x,2*x),l.setRenderTarget(t),l.render(d,qa)}}function Iv(i){const e=[],t=[],n=[];let r=i;const s=i-Pr+1+Ju.length;for(let o=0;o<s;o++){const a=Math.pow(2,r);t.push(a);let l=1/a;o>i-Pr?l=Ju[o-i+Pr-1]:o===0&&(l=0),n.push(l);const c=1/(a-2),u=-c,d=1+c,h=[u,u,d,u,d,d,u,u,d,d,u,d],f=6,g=6,_=3,m=2,p=1,M=new Float32Array(_*g*f),S=new Float32Array(m*g*f),x=new Float32Array(p*g*f);for(let C=0;C<f;C++){const R=C%3*2/3-1,N=C>2?0:-1,w=[R,N,0,R+2/3,N,0,R+2/3,N+1,0,R,N,0,R+2/3,N+1,0,R,N+1,0];M.set(w,_*g*C),S.set(h,m*g*C);const y=[C,C,C,C,C,C];x.set(y,p*g*C)}const A=new ln;A.setAttribute("position",new Bt(M,_)),A.setAttribute("uv",new Bt(S,m)),A.setAttribute("faceIndex",new Bt(x,p)),e.push(A),r>Pr&&r--}return{lodPlanes:e,sizeLods:t,sigmas:n}}function ed(i,e,t){const n=new di(i,e,t);return n.texture.mapping=aa,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function Do(i,e,t,n,r){i.viewport.set(e,t,n,r),i.scissor.set(e,t,n,r)}function Nv(i,e,t){const n=new Float32Array($i),r=new I(0,1,0);return new Un({name:"SphericalGaussianBlur",defines:{n:$i,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:r}},vertexShader:Vc(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:Ri,depthTest:!1,depthWrite:!1})}function td(){return new Un({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Vc(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:Ri,depthTest:!1,depthWrite:!1})}function nd(){return new Un({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Vc(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Ri,depthTest:!1,depthWrite:!1})}function Vc(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function Dv(i){let e=new WeakMap,t=null;function n(a){if(a&&a.isTexture){const l=a.mapping,c=l===vl||l===xl,u=l===zr||l===Hr;if(c||u){let d=e.get(a);const h=d!==void 0?d.texture.pmremVersion:0;if(a.isRenderTargetTexture&&a.pmremVersion!==h)return t===null&&(t=new tc(i)),d=c?t.fromEquirectangular(a,d):t.fromCubemap(a,d),d.texture.pmremVersion=a.pmremVersion,e.set(a,d),d.texture;if(d!==void 0)return d.texture;{const f=a.image;return c&&f&&f.height>0||u&&f&&r(f)?(t===null&&(t=new tc(i)),d=c?t.fromEquirectangular(a):t.fromCubemap(a),d.texture.pmremVersion=a.pmremVersion,e.set(a,d),a.addEventListener("dispose",s),d.texture):null}}}return a}function r(a){let l=0;const c=6;for(let u=0;u<c;u++)a[u]!==void 0&&l++;return l===c}function s(a){const l=a.target;l.removeEventListener("dispose",s);const c=e.get(l);c!==void 0&&(e.delete(l),c.dispose())}function o(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:n,dispose:o}}function Uv(i){const e={};function t(n){if(e[n]!==void 0)return e[n];let r;switch(n){case"WEBGL_depth_texture":r=i.getExtension("WEBGL_depth_texture")||i.getExtension("MOZ_WEBGL_depth_texture")||i.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":r=i.getExtension("EXT_texture_filter_anisotropic")||i.getExtension("MOZ_EXT_texture_filter_anisotropic")||i.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":r=i.getExtension("WEBGL_compressed_texture_s3tc")||i.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":r=i.getExtension("WEBGL_compressed_texture_pvrtc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:r=i.getExtension(n)}return e[n]=r,r}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){const r=t(n);return r===null&&zs("THREE.WebGLRenderer: "+n+" extension not supported."),r}}}function Ov(i,e,t,n){const r={},s=new WeakMap;function o(d){const h=d.target;h.index!==null&&e.remove(h.index);for(const g in h.attributes)e.remove(h.attributes[g]);h.removeEventListener("dispose",o),delete r[h.id];const f=s.get(h);f&&(e.remove(f),s.delete(h)),n.releaseStatesOfGeometry(h),h.isInstancedBufferGeometry===!0&&delete h._maxInstanceCount,t.memory.geometries--}function a(d,h){return r[h.id]===!0||(h.addEventListener("dispose",o),r[h.id]=!0,t.memory.geometries++),h}function l(d){const h=d.attributes;for(const f in h)e.update(h[f],i.ARRAY_BUFFER)}function c(d){const h=[],f=d.index,g=d.attributes.position;let _=0;if(f!==null){const M=f.array;_=f.version;for(let S=0,x=M.length;S<x;S+=3){const A=M[S+0],C=M[S+1],R=M[S+2];h.push(A,C,C,R,R,A)}}else if(g!==void 0){const M=g.array;_=g.version;for(let S=0,x=M.length/3-1;S<x;S+=3){const A=S+0,C=S+1,R=S+2;h.push(A,C,C,R,R,A)}}else return;const m=new(yh(h)?Eh:wh)(h,1);m.version=_;const p=s.get(d);p&&e.remove(p),s.set(d,m)}function u(d){const h=s.get(d);if(h){const f=d.index;f!==null&&h.version<f.version&&c(d)}else c(d);return s.get(d)}return{get:a,update:l,getWireframeAttribute:u}}function Fv(i,e,t){let n;function r(h){n=h}let s,o;function a(h){s=h.type,o=h.bytesPerElement}function l(h,f){i.drawElements(n,f,s,h*o),t.update(f,n,1)}function c(h,f,g){g!==0&&(i.drawElementsInstanced(n,f,s,h*o,g),t.update(f,n,g))}function u(h,f,g){if(g===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,f,0,s,h,0,g);let m=0;for(let p=0;p<g;p++)m+=f[p];t.update(m,n,1)}function d(h,f,g,_){if(g===0)return;const m=e.get("WEBGL_multi_draw");if(m===null)for(let p=0;p<h.length;p++)c(h[p]/o,f[p],_[p]);else{m.multiDrawElementsInstancedWEBGL(n,f,0,s,h,0,_,0,g);let p=0;for(let M=0;M<g;M++)p+=f[M]*_[M];t.update(p,n,1)}}this.setMode=r,this.setIndex=a,this.render=l,this.renderInstances=c,this.renderMultiDraw=u,this.renderMultiDrawInstances=d}function kv(i){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(s,o,a){switch(t.calls++,o){case i.TRIANGLES:t.triangles+=a*(s/3);break;case i.LINES:t.lines+=a*(s/2);break;case i.LINE_STRIP:t.lines+=a*(s-1);break;case i.LINE_LOOP:t.lines+=a*s;break;case i.POINTS:t.points+=a*s;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",o);break}}function r(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:r,update:n}}function Bv(i,e,t){const n=new WeakMap,r=new ut;function s(o,a,l){const c=o.morphTargetInfluences,u=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,d=u!==void 0?u.length:0;let h=n.get(a);if(h===void 0||h.count!==d){let w=function(){R.dispose(),n.delete(a),a.removeEventListener("dispose",w)};h!==void 0&&h.texture.dispose();const f=a.morphAttributes.position!==void 0,g=a.morphAttributes.normal!==void 0,_=a.morphAttributes.color!==void 0,m=a.morphAttributes.position||[],p=a.morphAttributes.normal||[],M=a.morphAttributes.color||[];let S=0;f===!0&&(S=1),g===!0&&(S=2),_===!0&&(S=3);let x=a.attributes.position.count*S,A=1;x>e.maxTextureSize&&(A=Math.ceil(x/e.maxTextureSize),x=e.maxTextureSize);const C=new Float32Array(x*A*4*d),R=new Sh(C,x,A,d);R.type=Rn,R.needsUpdate=!0;const N=S*4;for(let y=0;y<d;y++){const L=m[y],k=p[y],W=M[y],X=x*A*4*y;for(let q=0;q<L.count;q++){const z=q*N;f===!0&&(r.fromBufferAttribute(L,q),C[X+z+0]=r.x,C[X+z+1]=r.y,C[X+z+2]=r.z,C[X+z+3]=0),g===!0&&(r.fromBufferAttribute(k,q),C[X+z+4]=r.x,C[X+z+5]=r.y,C[X+z+6]=r.z,C[X+z+7]=0),_===!0&&(r.fromBufferAttribute(W,q),C[X+z+8]=r.x,C[X+z+9]=r.y,C[X+z+10]=r.z,C[X+z+11]=W.itemSize===4?r.w:1)}}h={count:d,texture:R,size:new _e(x,A)},n.set(a,h),a.addEventListener("dispose",w)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)l.getUniforms().setValue(i,"morphTexture",o.morphTexture,t);else{let f=0;for(let _=0;_<c.length;_++)f+=c[_];const g=a.morphTargetsRelative?1:1-f;l.getUniforms().setValue(i,"morphTargetBaseInfluence",g),l.getUniforms().setValue(i,"morphTargetInfluences",c)}l.getUniforms().setValue(i,"morphTargetsTexture",h.texture,t),l.getUniforms().setValue(i,"morphTargetsTextureSize",h.size)}return{update:s}}function zv(i,e,t,n){let r=new WeakMap;function s(l){const c=n.render.frame,u=l.geometry,d=e.get(l,u);if(r.get(d)!==c&&(e.update(d),r.set(d,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",a)===!1&&l.addEventListener("dispose",a),r.get(l)!==c&&(t.update(l.instanceMatrix,i.ARRAY_BUFFER),l.instanceColor!==null&&t.update(l.instanceColor,i.ARRAY_BUFFER),r.set(l,c))),l.isSkinnedMesh){const h=l.skeleton;r.get(h)!==c&&(h.update(),r.set(h,c))}return d}function o(){r=new WeakMap}function a(l){const c=l.target;c.removeEventListener("dispose",a),t.remove(c.instanceMatrix),c.instanceColor!==null&&t.remove(c.instanceColor)}return{update:s,dispose:o}}const Zh=new Ft,id=new Uh(1,1),Qh=new Sh,ef=new sm,tf=new Rh,rd=[],sd=[],od=new Float32Array(16),ad=new Float32Array(9),ld=new Float32Array(4);function ns(i,e,t){const n=i[0];if(n<=0||n>0)return i;const r=e*t;let s=rd[r];if(s===void 0&&(s=new Float32Array(r),rd[r]=s),e!==0){n.toArray(s,0);for(let o=1,a=0;o!==e;++o)a+=t,i[o].toArray(s,a)}return s}function It(i,e){if(i.length!==e.length)return!1;for(let t=0,n=i.length;t<n;t++)if(i[t]!==e[t])return!1;return!0}function Nt(i,e){for(let t=0,n=e.length;t<n;t++)i[t]=e[t]}function ua(i,e){let t=sd[e];t===void 0&&(t=new Int32Array(e),sd[e]=t);for(let n=0;n!==e;++n)t[n]=i.allocateTextureUnit();return t}function Hv(i,e){const t=this.cache;t[0]!==e&&(i.uniform1f(this.addr,e),t[0]=e)}function Vv(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(It(t,e))return;i.uniform2fv(this.addr,e),Nt(t,e)}}function Gv(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(i.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(It(t,e))return;i.uniform3fv(this.addr,e),Nt(t,e)}}function Wv(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(It(t,e))return;i.uniform4fv(this.addr,e),Nt(t,e)}}function Xv(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(It(t,e))return;i.uniformMatrix2fv(this.addr,!1,e),Nt(t,e)}else{if(It(t,n))return;ld.set(n),i.uniformMatrix2fv(this.addr,!1,ld),Nt(t,n)}}function qv(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(It(t,e))return;i.uniformMatrix3fv(this.addr,!1,e),Nt(t,e)}else{if(It(t,n))return;ad.set(n),i.uniformMatrix3fv(this.addr,!1,ad),Nt(t,n)}}function Kv(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(It(t,e))return;i.uniformMatrix4fv(this.addr,!1,e),Nt(t,e)}else{if(It(t,n))return;od.set(n),i.uniformMatrix4fv(this.addr,!1,od),Nt(t,n)}}function $v(i,e){const t=this.cache;t[0]!==e&&(i.uniform1i(this.addr,e),t[0]=e)}function Yv(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(It(t,e))return;i.uniform2iv(this.addr,e),Nt(t,e)}}function jv(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(It(t,e))return;i.uniform3iv(this.addr,e),Nt(t,e)}}function Jv(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(It(t,e))return;i.uniform4iv(this.addr,e),Nt(t,e)}}function Zv(i,e){const t=this.cache;t[0]!==e&&(i.uniform1ui(this.addr,e),t[0]=e)}function Qv(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(It(t,e))return;i.uniform2uiv(this.addr,e),Nt(t,e)}}function ex(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(It(t,e))return;i.uniform3uiv(this.addr,e),Nt(t,e)}}function tx(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(It(t,e))return;i.uniform4uiv(this.addr,e),Nt(t,e)}}function nx(i,e,t){const n=this.cache,r=t.allocateTextureUnit();n[0]!==r&&(i.uniform1i(this.addr,r),n[0]=r);let s;this.type===i.SAMPLER_2D_SHADOW?(id.compareFunction=xh,s=id):s=Zh,t.setTexture2D(e||s,r)}function ix(i,e,t){const n=this.cache,r=t.allocateTextureUnit();n[0]!==r&&(i.uniform1i(this.addr,r),n[0]=r),t.setTexture3D(e||ef,r)}function rx(i,e,t){const n=this.cache,r=t.allocateTextureUnit();n[0]!==r&&(i.uniform1i(this.addr,r),n[0]=r),t.setTextureCube(e||tf,r)}function sx(i,e,t){const n=this.cache,r=t.allocateTextureUnit();n[0]!==r&&(i.uniform1i(this.addr,r),n[0]=r),t.setTexture2DArray(e||Qh,r)}function ox(i){switch(i){case 5126:return Hv;case 35664:return Vv;case 35665:return Gv;case 35666:return Wv;case 35674:return Xv;case 35675:return qv;case 35676:return Kv;case 5124:case 35670:return $v;case 35667:case 35671:return Yv;case 35668:case 35672:return jv;case 35669:case 35673:return Jv;case 5125:return Zv;case 36294:return Qv;case 36295:return ex;case 36296:return tx;case 35678:case 36198:case 36298:case 36306:case 35682:return nx;case 35679:case 36299:case 36307:return ix;case 35680:case 36300:case 36308:case 36293:return rx;case 36289:case 36303:case 36311:case 36292:return sx}}function ax(i,e){i.uniform1fv(this.addr,e)}function lx(i,e){const t=ns(e,this.size,2);i.uniform2fv(this.addr,t)}function cx(i,e){const t=ns(e,this.size,3);i.uniform3fv(this.addr,t)}function ux(i,e){const t=ns(e,this.size,4);i.uniform4fv(this.addr,t)}function dx(i,e){const t=ns(e,this.size,4);i.uniformMatrix2fv(this.addr,!1,t)}function hx(i,e){const t=ns(e,this.size,9);i.uniformMatrix3fv(this.addr,!1,t)}function fx(i,e){const t=ns(e,this.size,16);i.uniformMatrix4fv(this.addr,!1,t)}function px(i,e){i.uniform1iv(this.addr,e)}function mx(i,e){i.uniform2iv(this.addr,e)}function gx(i,e){i.uniform3iv(this.addr,e)}function _x(i,e){i.uniform4iv(this.addr,e)}function vx(i,e){i.uniform1uiv(this.addr,e)}function xx(i,e){i.uniform2uiv(this.addr,e)}function yx(i,e){i.uniform3uiv(this.addr,e)}function Sx(i,e){i.uniform4uiv(this.addr,e)}function Mx(i,e,t){const n=this.cache,r=e.length,s=ua(t,r);It(n,s)||(i.uniform1iv(this.addr,s),Nt(n,s));for(let o=0;o!==r;++o)t.setTexture2D(e[o]||Zh,s[o])}function bx(i,e,t){const n=this.cache,r=e.length,s=ua(t,r);It(n,s)||(i.uniform1iv(this.addr,s),Nt(n,s));for(let o=0;o!==r;++o)t.setTexture3D(e[o]||ef,s[o])}function wx(i,e,t){const n=this.cache,r=e.length,s=ua(t,r);It(n,s)||(i.uniform1iv(this.addr,s),Nt(n,s));for(let o=0;o!==r;++o)t.setTextureCube(e[o]||tf,s[o])}function Ex(i,e,t){const n=this.cache,r=e.length,s=ua(t,r);It(n,s)||(i.uniform1iv(this.addr,s),Nt(n,s));for(let o=0;o!==r;++o)t.setTexture2DArray(e[o]||Qh,s[o])}function Tx(i){switch(i){case 5126:return ax;case 35664:return lx;case 35665:return cx;case 35666:return ux;case 35674:return dx;case 35675:return hx;case 35676:return fx;case 5124:case 35670:return px;case 35667:case 35671:return mx;case 35668:case 35672:return gx;case 35669:case 35673:return _x;case 5125:return vx;case 36294:return xx;case 36295:return yx;case 36296:return Sx;case 35678:case 36198:case 36298:case 36306:case 35682:return Mx;case 35679:case 36299:case 36307:return bx;case 35680:case 36300:case 36308:case 36293:return wx;case 36289:case 36303:case 36311:case 36292:return Ex}}class Ax{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=ox(t.type)}}class Cx{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=Tx(t.type)}}class Rx{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){const r=this.seq;for(let s=0,o=r.length;s!==o;++s){const a=r[s];a.setValue(e,t[a.id],n)}}}const Ja=/(\w+)(\])?(\[|\.)?/g;function cd(i,e){i.seq.push(e),i.map[e.id]=e}function Lx(i,e,t){const n=i.name,r=n.length;for(Ja.lastIndex=0;;){const s=Ja.exec(n),o=Ja.lastIndex;let a=s[1];const l=s[2]==="]",c=s[3];if(l&&(a=a|0),c===void 0||c==="["&&o+2===r){cd(t,c===void 0?new Ax(a,i,e):new Cx(a,i,e));break}else{let d=t.map[a];d===void 0&&(d=new Rx(a),cd(t,d)),t=d}}}class qo{constructor(e,t){this.seq=[],this.map={};const n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let r=0;r<n;++r){const s=e.getActiveUniform(t,r),o=e.getUniformLocation(t,s.name);Lx(s,o,this)}}setValue(e,t,n,r){const s=this.map[t];s!==void 0&&s.setValue(e,n,r)}setOptional(e,t,n){const r=t[n];r!==void 0&&this.setValue(e,n,r)}static upload(e,t,n,r){for(let s=0,o=t.length;s!==o;++s){const a=t[s],l=n[a.id];l.needsUpdate!==!1&&a.setValue(e,l.value,r)}}static seqWithValue(e,t){const n=[];for(let r=0,s=e.length;r!==s;++r){const o=e[r];o.id in t&&n.push(o)}return n}}function ud(i,e,t){const n=i.createShader(e);return i.shaderSource(n,t),i.compileShader(n),n}const Px=37297;let Ix=0;function Nx(i,e){const t=i.split(`
`),n=[],r=Math.max(e-6,0),s=Math.min(e+6,t.length);for(let o=r;o<s;o++){const a=o+1;n.push(`${a===e?">":" "} ${a}: ${t[o]}`)}return n.join(`
`)}const dd=new Qe;function Dx(i){ot._getMatrix(dd,ot.workingColorSpace,i);const e=`mat3( ${dd.elements.map(t=>t.toFixed(4))} )`;switch(ot.getTransfer(i)){case ea:return[e,"LinearTransferOETF"];case _t:return[e,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",i),[e,"LinearTransferOETF"]}}function hd(i,e,t){const n=i.getShaderParameter(e,i.COMPILE_STATUS),s=(i.getShaderInfoLog(e)||"").trim();if(n&&s==="")return"";const o=/ERROR: 0:(\d+)/.exec(s);if(o){const a=parseInt(o[1]);return t.toUpperCase()+`

`+s+`

`+Nx(i.getShaderSource(e),a)}else return s}function Ux(i,e){const t=Dx(e);return[`vec4 ${i}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}function Ox(i,e){let t;switch(e){case gp:t="Linear";break;case _p:t="Reinhard";break;case vp:t="Cineon";break;case xp:t="ACESFilmic";break;case Sp:t="AgX";break;case Mp:t="Neutral";break;case yp:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+i+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}const Uo=new I;function Fx(){ot.getLuminanceCoefficients(Uo);const i=Uo.x.toFixed(4),e=Uo.y.toFixed(4),t=Uo.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function kx(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(ws).join(`
`)}function Bx(i){const e=[];for(const t in i){const n=i[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function zx(i,e){const t={},n=i.getProgramParameter(e,i.ACTIVE_ATTRIBUTES);for(let r=0;r<n;r++){const s=i.getActiveAttrib(e,r),o=s.name;let a=1;s.type===i.FLOAT_MAT2&&(a=2),s.type===i.FLOAT_MAT3&&(a=3),s.type===i.FLOAT_MAT4&&(a=4),t[o]={type:s.type,location:i.getAttribLocation(e,o),locationSize:a}}return t}function ws(i){return i!==""}function fd(i,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return i.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function pd(i,e){return i.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const Hx=/^[ \t]*#include +<([\w\d./]+)>/gm;function nc(i){return i.replace(Hx,Gx)}const Vx=new Map;function Gx(i,e){let t=tt[e];if(t===void 0){const n=Vx.get(e);if(n!==void 0)t=tt[n],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n);else throw new Error("Can not resolve #include <"+e+">")}return nc(t)}const Wx=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function md(i){return i.replace(Wx,Xx)}function Xx(i,e,t,n){let r="";for(let s=parseInt(e);s<parseInt(t);s++)r+=n.replace(/\[\s*i\s*\]/g,"[ "+s+" ]").replace(/UNROLLED_LOOP_INDEX/g,s);return r}function gd(i){let e=`precision ${i.precision} float;
	precision ${i.precision} int;
	precision ${i.precision} sampler2D;
	precision ${i.precision} samplerCube;
	precision ${i.precision} sampler3D;
	precision ${i.precision} sampler2DArray;
	precision ${i.precision} sampler2DShadow;
	precision ${i.precision} samplerCubeShadow;
	precision ${i.precision} sampler2DArrayShadow;
	precision ${i.precision} isampler2D;
	precision ${i.precision} isampler3D;
	precision ${i.precision} isamplerCube;
	precision ${i.precision} isampler2DArray;
	precision ${i.precision} usampler2D;
	precision ${i.precision} usampler3D;
	precision ${i.precision} usamplerCube;
	precision ${i.precision} usampler2DArray;
	`;return i.precision==="highp"?e+=`
#define HIGH_PRECISION`:i.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:i.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}function qx(i){let e="SHADOWMAP_TYPE_BASIC";return i.shadowMapType===oh?e="SHADOWMAP_TYPE_PCF":i.shadowMapType===Yf?e="SHADOWMAP_TYPE_PCF_SOFT":i.shadowMapType===ri&&(e="SHADOWMAP_TYPE_VSM"),e}function Kx(i){let e="ENVMAP_TYPE_CUBE";if(i.envMap)switch(i.envMapMode){case zr:case Hr:e="ENVMAP_TYPE_CUBE";break;case aa:e="ENVMAP_TYPE_CUBE_UV";break}return e}function $x(i){let e="ENVMAP_MODE_REFLECTION";return i.envMap&&i.envMapMode===Hr&&(e="ENVMAP_MODE_REFRACTION"),e}function Yx(i){let e="ENVMAP_BLENDING_NONE";if(i.envMap)switch(i.combine){case ah:e="ENVMAP_BLENDING_MULTIPLY";break;case pp:e="ENVMAP_BLENDING_MIX";break;case mp:e="ENVMAP_BLENDING_ADD";break}return e}function jx(i){const e=i.envMapCubeUVHeight;if(e===null)return null;const t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:n,maxMip:t}}function Jx(i,e,t,n){const r=i.getContext(),s=t.defines;let o=t.vertexShader,a=t.fragmentShader;const l=qx(t),c=Kx(t),u=$x(t),d=Yx(t),h=jx(t),f=kx(t),g=Bx(s),_=r.createProgram();let m,p,M=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(ws).join(`
`),m.length>0&&(m+=`
`),p=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(ws).join(`
`),p.length>0&&(p+=`
`)):(m=[gd(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+u:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(ws).join(`
`),p=[gd(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+u:"",t.envMap?"#define "+d:"",h?"#define CUBEUV_TEXEL_WIDTH "+h.texelWidth:"",h?"#define CUBEUV_TEXEL_HEIGHT "+h.texelHeight:"",h?"#define CUBEUV_MAX_MIP "+h.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor||t.batchingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==Wn?"#define TONE_MAPPING":"",t.toneMapping!==Wn?tt.tonemapping_pars_fragment:"",t.toneMapping!==Wn?Ox("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",tt.colorspace_pars_fragment,Ux("linearToOutputTexel",t.outputColorSpace),Fx(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(ws).join(`
`)),o=nc(o),o=fd(o,t),o=pd(o,t),a=nc(a),a=fd(a,t),a=pd(a,t),o=md(o),a=md(a),t.isRawShaderMaterial!==!0&&(M=`#version 300 es
`,m=[f,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,p=["#define varying in",t.glslVersion===au?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===au?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+p);const S=M+m+o,x=M+p+a,A=ud(r,r.VERTEX_SHADER,S),C=ud(r,r.FRAGMENT_SHADER,x);r.attachShader(_,A),r.attachShader(_,C),t.index0AttributeName!==void 0?r.bindAttribLocation(_,0,t.index0AttributeName):t.morphTargets===!0&&r.bindAttribLocation(_,0,"position"),r.linkProgram(_);function R(L){if(i.debug.checkShaderErrors){const k=r.getProgramInfoLog(_)||"",W=r.getShaderInfoLog(A)||"",X=r.getShaderInfoLog(C)||"",q=k.trim(),z=W.trim(),oe=X.trim();let V=!0,pe=!0;if(r.getProgramParameter(_,r.LINK_STATUS)===!1)if(V=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(r,_,A,C);else{const K=hd(r,A,"vertex"),ne=hd(r,C,"fragment");console.error("THREE.WebGLProgram: Shader Error "+r.getError()+" - VALIDATE_STATUS "+r.getProgramParameter(_,r.VALIDATE_STATUS)+`

Material Name: `+L.name+`
Material Type: `+L.type+`

Program Info Log: `+q+`
`+K+`
`+ne)}else q!==""?console.warn("THREE.WebGLProgram: Program Info Log:",q):(z===""||oe==="")&&(pe=!1);pe&&(L.diagnostics={runnable:V,programLog:q,vertexShader:{log:z,prefix:m},fragmentShader:{log:oe,prefix:p}})}r.deleteShader(A),r.deleteShader(C),N=new qo(r,_),w=zx(r,_)}let N;this.getUniforms=function(){return N===void 0&&R(this),N};let w;this.getAttributes=function(){return w===void 0&&R(this),w};let y=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return y===!1&&(y=r.getProgramParameter(_,Px)),y},this.destroy=function(){n.releaseStatesOfProgram(this),r.deleteProgram(_),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=Ix++,this.cacheKey=e,this.usedTimes=1,this.program=_,this.vertexShader=A,this.fragmentShader=C,this}let Zx=0;class Qx{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){const t=e.vertexShader,n=e.fragmentShader,r=this._getShaderStage(t),s=this._getShaderStage(n),o=this._getShaderCacheForMaterial(e);return o.has(r)===!1&&(o.add(r),r.usedTimes++),o.has(s)===!1&&(o.add(s),s.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){const t=this.shaderCache;let n=t.get(e);return n===void 0&&(n=new ey(e),t.set(e,n)),n}}class ey{constructor(e){this.id=Zx++,this.code=e,this.usedTimes=0}}function ty(i,e,t,n,r,s,o){const a=new Mh,l=new Qx,c=new Set,u=[],d=r.logarithmicDepthBuffer,h=r.vertexTextures;let f=r.precision;const g={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function _(w){return c.add(w),w===0?"uv":`uv${w}`}function m(w,y,L,k,W){const X=k.fog,q=W.geometry,z=w.isMeshStandardMaterial?k.environment:null,oe=(w.isMeshStandardMaterial?t:e).get(w.envMap||z),V=oe&&oe.mapping===aa?oe.image.height:null,pe=g[w.type];w.precision!==null&&(f=r.getMaxPrecision(w.precision),f!==w.precision&&console.warn("THREE.WebGLProgram.getParameters:",w.precision,"not supported, using",f,"instead."));const K=q.morphAttributes.position||q.morphAttributes.normal||q.morphAttributes.color,ne=K!==void 0?K.length:0;let ce=0;q.morphAttributes.position!==void 0&&(ce=1),q.morphAttributes.normal!==void 0&&(ce=2),q.morphAttributes.color!==void 0&&(ce=3);let ae,ye,Ue,Z;if(pe){const at=Hn[pe];ae=at.vertexShader,ye=at.fragmentShader}else ae=w.vertexShader,ye=w.fragmentShader,l.update(w),Ue=l.getVertexShaderID(w),Z=l.getFragmentShaderID(w);const ee=i.getRenderTarget(),Me=i.state.buffers.depth.getReversed(),Te=W.isInstancedMesh===!0,Ae=W.isBatchedMesh===!0,Xe=!!w.map,it=!!w.matcap,P=!!oe,le=!!w.aoMap,re=!!w.lightMap,ie=!!w.bumpMap,te=!!w.normalMap,xe=!!w.displacementMap,F=!!w.emissiveMap,Q=!!w.metalnessMap,me=!!w.roughnessMap,de=w.anisotropy>0,E=w.clearcoat>0,v=w.dispersion>0,U=w.iridescence>0,G=w.sheen>0,Y=w.transmission>0,H=de&&!!w.anisotropyMap,be=E&&!!w.clearcoatMap,fe=E&&!!w.clearcoatNormalMap,we=E&&!!w.clearcoatRoughnessMap,Ee=U&&!!w.iridescenceMap,he=U&&!!w.iridescenceThicknessMap,Ce=G&&!!w.sheenColorMap,We=G&&!!w.sheenRoughnessMap,ke=!!w.specularMap,Re=!!w.specularColorMap,Ze=!!w.specularIntensityMap,D=Y&&!!w.transmissionMap,ge=Y&&!!w.thicknessMap,Se=!!w.gradientMap,Ie=!!w.alphaMap,ue=w.alphaTest>0,se=!!w.alphaHash,Oe=!!w.extensions;let je=Wn;w.toneMapped&&(ee===null||ee.isXRRenderTarget===!0)&&(je=i.toneMapping);const ht={shaderID:pe,shaderType:w.type,shaderName:w.name,vertexShader:ae,fragmentShader:ye,defines:w.defines,customVertexShaderID:Ue,customFragmentShaderID:Z,isRawShaderMaterial:w.isRawShaderMaterial===!0,glslVersion:w.glslVersion,precision:f,batching:Ae,batchingColor:Ae&&W._colorsTexture!==null,instancing:Te,instancingColor:Te&&W.instanceColor!==null,instancingMorph:Te&&W.morphTexture!==null,supportsVertexTextures:h,outputColorSpace:ee===null?i.outputColorSpace:ee.isXRRenderTarget===!0?ee.texture.colorSpace:zt,alphaToCoverage:!!w.alphaToCoverage,map:Xe,matcap:it,envMap:P,envMapMode:P&&oe.mapping,envMapCubeUVHeight:V,aoMap:le,lightMap:re,bumpMap:ie,normalMap:te,displacementMap:h&&xe,emissiveMap:F,normalMapObjectSpace:te&&w.normalMapType===Cp,normalMapTangentSpace:te&&w.normalMapType===vh,metalnessMap:Q,roughnessMap:me,anisotropy:de,anisotropyMap:H,clearcoat:E,clearcoatMap:be,clearcoatNormalMap:fe,clearcoatRoughnessMap:we,dispersion:v,iridescence:U,iridescenceMap:Ee,iridescenceThicknessMap:he,sheen:G,sheenColorMap:Ce,sheenRoughnessMap:We,specularMap:ke,specularColorMap:Re,specularIntensityMap:Ze,transmission:Y,transmissionMap:D,thicknessMap:ge,gradientMap:Se,opaque:w.transparent===!1&&w.blending===Nr&&w.alphaToCoverage===!1,alphaMap:Ie,alphaTest:ue,alphaHash:se,combine:w.combine,mapUv:Xe&&_(w.map.channel),aoMapUv:le&&_(w.aoMap.channel),lightMapUv:re&&_(w.lightMap.channel),bumpMapUv:ie&&_(w.bumpMap.channel),normalMapUv:te&&_(w.normalMap.channel),displacementMapUv:xe&&_(w.displacementMap.channel),emissiveMapUv:F&&_(w.emissiveMap.channel),metalnessMapUv:Q&&_(w.metalnessMap.channel),roughnessMapUv:me&&_(w.roughnessMap.channel),anisotropyMapUv:H&&_(w.anisotropyMap.channel),clearcoatMapUv:be&&_(w.clearcoatMap.channel),clearcoatNormalMapUv:fe&&_(w.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:we&&_(w.clearcoatRoughnessMap.channel),iridescenceMapUv:Ee&&_(w.iridescenceMap.channel),iridescenceThicknessMapUv:he&&_(w.iridescenceThicknessMap.channel),sheenColorMapUv:Ce&&_(w.sheenColorMap.channel),sheenRoughnessMapUv:We&&_(w.sheenRoughnessMap.channel),specularMapUv:ke&&_(w.specularMap.channel),specularColorMapUv:Re&&_(w.specularColorMap.channel),specularIntensityMapUv:Ze&&_(w.specularIntensityMap.channel),transmissionMapUv:D&&_(w.transmissionMap.channel),thicknessMapUv:ge&&_(w.thicknessMap.channel),alphaMapUv:Ie&&_(w.alphaMap.channel),vertexTangents:!!q.attributes.tangent&&(te||de),vertexColors:w.vertexColors,vertexAlphas:w.vertexColors===!0&&!!q.attributes.color&&q.attributes.color.itemSize===4,pointsUvs:W.isPoints===!0&&!!q.attributes.uv&&(Xe||Ie),fog:!!X,useFog:w.fog===!0,fogExp2:!!X&&X.isFogExp2,flatShading:w.flatShading===!0&&w.wireframe===!1,sizeAttenuation:w.sizeAttenuation===!0,logarithmicDepthBuffer:d,reversedDepthBuffer:Me,skinning:W.isSkinnedMesh===!0,morphTargets:q.morphAttributes.position!==void 0,morphNormals:q.morphAttributes.normal!==void 0,morphColors:q.morphAttributes.color!==void 0,morphTargetsCount:ne,morphTextureStride:ce,numDirLights:y.directional.length,numPointLights:y.point.length,numSpotLights:y.spot.length,numSpotLightMaps:y.spotLightMap.length,numRectAreaLights:y.rectArea.length,numHemiLights:y.hemi.length,numDirLightShadows:y.directionalShadowMap.length,numPointLightShadows:y.pointShadowMap.length,numSpotLightShadows:y.spotShadowMap.length,numSpotLightShadowsWithMaps:y.numSpotLightShadowsWithMaps,numLightProbes:y.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:w.dithering,shadowMapEnabled:i.shadowMap.enabled&&L.length>0,shadowMapType:i.shadowMap.type,toneMapping:je,decodeVideoTexture:Xe&&w.map.isVideoTexture===!0&&ot.getTransfer(w.map.colorSpace)===_t,decodeVideoTextureEmissive:F&&w.emissiveMap.isVideoTexture===!0&&ot.getTransfer(w.emissiveMap.colorSpace)===_t,premultipliedAlpha:w.premultipliedAlpha,doubleSided:w.side===fn,flipSided:w.side===tn,useDepthPacking:w.depthPacking>=0,depthPacking:w.depthPacking||0,index0AttributeName:w.index0AttributeName,extensionClipCullDistance:Oe&&w.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Oe&&w.extensions.multiDraw===!0||Ae)&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:w.customProgramCacheKey()};return ht.vertexUv1s=c.has(1),ht.vertexUv2s=c.has(2),ht.vertexUv3s=c.has(3),c.clear(),ht}function p(w){const y=[];if(w.shaderID?y.push(w.shaderID):(y.push(w.customVertexShaderID),y.push(w.customFragmentShaderID)),w.defines!==void 0)for(const L in w.defines)y.push(L),y.push(w.defines[L]);return w.isRawShaderMaterial===!1&&(M(y,w),S(y,w),y.push(i.outputColorSpace)),y.push(w.customProgramCacheKey),y.join()}function M(w,y){w.push(y.precision),w.push(y.outputColorSpace),w.push(y.envMapMode),w.push(y.envMapCubeUVHeight),w.push(y.mapUv),w.push(y.alphaMapUv),w.push(y.lightMapUv),w.push(y.aoMapUv),w.push(y.bumpMapUv),w.push(y.normalMapUv),w.push(y.displacementMapUv),w.push(y.emissiveMapUv),w.push(y.metalnessMapUv),w.push(y.roughnessMapUv),w.push(y.anisotropyMapUv),w.push(y.clearcoatMapUv),w.push(y.clearcoatNormalMapUv),w.push(y.clearcoatRoughnessMapUv),w.push(y.iridescenceMapUv),w.push(y.iridescenceThicknessMapUv),w.push(y.sheenColorMapUv),w.push(y.sheenRoughnessMapUv),w.push(y.specularMapUv),w.push(y.specularColorMapUv),w.push(y.specularIntensityMapUv),w.push(y.transmissionMapUv),w.push(y.thicknessMapUv),w.push(y.combine),w.push(y.fogExp2),w.push(y.sizeAttenuation),w.push(y.morphTargetsCount),w.push(y.morphAttributeCount),w.push(y.numDirLights),w.push(y.numPointLights),w.push(y.numSpotLights),w.push(y.numSpotLightMaps),w.push(y.numHemiLights),w.push(y.numRectAreaLights),w.push(y.numDirLightShadows),w.push(y.numPointLightShadows),w.push(y.numSpotLightShadows),w.push(y.numSpotLightShadowsWithMaps),w.push(y.numLightProbes),w.push(y.shadowMapType),w.push(y.toneMapping),w.push(y.numClippingPlanes),w.push(y.numClipIntersection),w.push(y.depthPacking)}function S(w,y){a.disableAll(),y.supportsVertexTextures&&a.enable(0),y.instancing&&a.enable(1),y.instancingColor&&a.enable(2),y.instancingMorph&&a.enable(3),y.matcap&&a.enable(4),y.envMap&&a.enable(5),y.normalMapObjectSpace&&a.enable(6),y.normalMapTangentSpace&&a.enable(7),y.clearcoat&&a.enable(8),y.iridescence&&a.enable(9),y.alphaTest&&a.enable(10),y.vertexColors&&a.enable(11),y.vertexAlphas&&a.enable(12),y.vertexUv1s&&a.enable(13),y.vertexUv2s&&a.enable(14),y.vertexUv3s&&a.enable(15),y.vertexTangents&&a.enable(16),y.anisotropy&&a.enable(17),y.alphaHash&&a.enable(18),y.batching&&a.enable(19),y.dispersion&&a.enable(20),y.batchingColor&&a.enable(21),y.gradientMap&&a.enable(22),w.push(a.mask),a.disableAll(),y.fog&&a.enable(0),y.useFog&&a.enable(1),y.flatShading&&a.enable(2),y.logarithmicDepthBuffer&&a.enable(3),y.reversedDepthBuffer&&a.enable(4),y.skinning&&a.enable(5),y.morphTargets&&a.enable(6),y.morphNormals&&a.enable(7),y.morphColors&&a.enable(8),y.premultipliedAlpha&&a.enable(9),y.shadowMapEnabled&&a.enable(10),y.doubleSided&&a.enable(11),y.flipSided&&a.enable(12),y.useDepthPacking&&a.enable(13),y.dithering&&a.enable(14),y.transmission&&a.enable(15),y.sheen&&a.enable(16),y.opaque&&a.enable(17),y.pointsUvs&&a.enable(18),y.decodeVideoTexture&&a.enable(19),y.decodeVideoTextureEmissive&&a.enable(20),y.alphaToCoverage&&a.enable(21),w.push(a.mask)}function x(w){const y=g[w.type];let L;if(y){const k=Hn[y];L=Ah.clone(k.uniforms)}else L=w.uniforms;return L}function A(w,y){let L;for(let k=0,W=u.length;k<W;k++){const X=u[k];if(X.cacheKey===y){L=X,++L.usedTimes;break}}return L===void 0&&(L=new Jx(i,y,w,s),u.push(L)),L}function C(w){if(--w.usedTimes===0){const y=u.indexOf(w);u[y]=u[u.length-1],u.pop(),w.destroy()}}function R(w){l.remove(w)}function N(){l.dispose()}return{getParameters:m,getProgramCacheKey:p,getUniforms:x,acquireProgram:A,releaseProgram:C,releaseShaderCache:R,programs:u,dispose:N}}function ny(){let i=new WeakMap;function e(o){return i.has(o)}function t(o){let a=i.get(o);return a===void 0&&(a={},i.set(o,a)),a}function n(o){i.delete(o)}function r(o,a,l){i.get(o)[a]=l}function s(){i=new WeakMap}return{has:e,get:t,remove:n,update:r,dispose:s}}function iy(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.material.id!==e.material.id?i.material.id-e.material.id:i.z!==e.z?i.z-e.z:i.id-e.id}function _d(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.z!==e.z?e.z-i.z:i.id-e.id}function vd(){const i=[];let e=0;const t=[],n=[],r=[];function s(){e=0,t.length=0,n.length=0,r.length=0}function o(d,h,f,g,_,m){let p=i[e];return p===void 0?(p={id:d.id,object:d,geometry:h,material:f,groupOrder:g,renderOrder:d.renderOrder,z:_,group:m},i[e]=p):(p.id=d.id,p.object=d,p.geometry=h,p.material=f,p.groupOrder=g,p.renderOrder=d.renderOrder,p.z=_,p.group=m),e++,p}function a(d,h,f,g,_,m){const p=o(d,h,f,g,_,m);f.transmission>0?n.push(p):f.transparent===!0?r.push(p):t.push(p)}function l(d,h,f,g,_,m){const p=o(d,h,f,g,_,m);f.transmission>0?n.unshift(p):f.transparent===!0?r.unshift(p):t.unshift(p)}function c(d,h){t.length>1&&t.sort(d||iy),n.length>1&&n.sort(h||_d),r.length>1&&r.sort(h||_d)}function u(){for(let d=e,h=i.length;d<h;d++){const f=i[d];if(f.id===null)break;f.id=null,f.object=null,f.geometry=null,f.material=null,f.group=null}}return{opaque:t,transmissive:n,transparent:r,init:s,push:a,unshift:l,finish:u,sort:c}}function ry(){let i=new WeakMap;function e(n,r){const s=i.get(n);let o;return s===void 0?(o=new vd,i.set(n,[o])):r>=s.length?(o=new vd,s.push(o)):o=s[r],o}function t(){i=new WeakMap}return{get:e,dispose:t}}function sy(){const i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new I,color:new Ge};break;case"SpotLight":t={position:new I,direction:new I,color:new Ge,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new I,color:new Ge,distance:0,decay:0};break;case"HemisphereLight":t={direction:new I,skyColor:new Ge,groundColor:new Ge};break;case"RectAreaLight":t={color:new Ge,position:new I,halfWidth:new I,halfHeight:new I};break}return i[e.id]=t,t}}}function oy(){const i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new _e};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new _e};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new _e,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[e.id]=t,t}}}let ay=0;function ly(i,e){return(e.castShadow?2:0)-(i.castShadow?2:0)+(e.map?1:0)-(i.map?1:0)}function cy(i){const e=new sy,t=oy(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new I);const r=new I,s=new $e,o=new $e;function a(c){let u=0,d=0,h=0;for(let w=0;w<9;w++)n.probe[w].set(0,0,0);let f=0,g=0,_=0,m=0,p=0,M=0,S=0,x=0,A=0,C=0,R=0;c.sort(ly);for(let w=0,y=c.length;w<y;w++){const L=c[w],k=L.color,W=L.intensity,X=L.distance,q=L.shadow&&L.shadow.map?L.shadow.map.texture:null;if(L.isAmbientLight)u+=k.r*W,d+=k.g*W,h+=k.b*W;else if(L.isLightProbe){for(let z=0;z<9;z++)n.probe[z].addScaledVector(L.sh.coefficients[z],W);R++}else if(L.isDirectionalLight){const z=e.get(L);if(z.color.copy(L.color).multiplyScalar(L.intensity),L.castShadow){const oe=L.shadow,V=t.get(L);V.shadowIntensity=oe.intensity,V.shadowBias=oe.bias,V.shadowNormalBias=oe.normalBias,V.shadowRadius=oe.radius,V.shadowMapSize=oe.mapSize,n.directionalShadow[f]=V,n.directionalShadowMap[f]=q,n.directionalShadowMatrix[f]=L.shadow.matrix,M++}n.directional[f]=z,f++}else if(L.isSpotLight){const z=e.get(L);z.position.setFromMatrixPosition(L.matrixWorld),z.color.copy(k).multiplyScalar(W),z.distance=X,z.coneCos=Math.cos(L.angle),z.penumbraCos=Math.cos(L.angle*(1-L.penumbra)),z.decay=L.decay,n.spot[_]=z;const oe=L.shadow;if(L.map&&(n.spotLightMap[A]=L.map,A++,oe.updateMatrices(L),L.castShadow&&C++),n.spotLightMatrix[_]=oe.matrix,L.castShadow){const V=t.get(L);V.shadowIntensity=oe.intensity,V.shadowBias=oe.bias,V.shadowNormalBias=oe.normalBias,V.shadowRadius=oe.radius,V.shadowMapSize=oe.mapSize,n.spotShadow[_]=V,n.spotShadowMap[_]=q,x++}_++}else if(L.isRectAreaLight){const z=e.get(L);z.color.copy(k).multiplyScalar(W),z.halfWidth.set(L.width*.5,0,0),z.halfHeight.set(0,L.height*.5,0),n.rectArea[m]=z,m++}else if(L.isPointLight){const z=e.get(L);if(z.color.copy(L.color).multiplyScalar(L.intensity),z.distance=L.distance,z.decay=L.decay,L.castShadow){const oe=L.shadow,V=t.get(L);V.shadowIntensity=oe.intensity,V.shadowBias=oe.bias,V.shadowNormalBias=oe.normalBias,V.shadowRadius=oe.radius,V.shadowMapSize=oe.mapSize,V.shadowCameraNear=oe.camera.near,V.shadowCameraFar=oe.camera.far,n.pointShadow[g]=V,n.pointShadowMap[g]=q,n.pointShadowMatrix[g]=L.shadow.matrix,S++}n.point[g]=z,g++}else if(L.isHemisphereLight){const z=e.get(L);z.skyColor.copy(L.color).multiplyScalar(W),z.groundColor.copy(L.groundColor).multiplyScalar(W),n.hemi[p]=z,p++}}m>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=Le.LTC_FLOAT_1,n.rectAreaLTC2=Le.LTC_FLOAT_2):(n.rectAreaLTC1=Le.LTC_HALF_1,n.rectAreaLTC2=Le.LTC_HALF_2)),n.ambient[0]=u,n.ambient[1]=d,n.ambient[2]=h;const N=n.hash;(N.directionalLength!==f||N.pointLength!==g||N.spotLength!==_||N.rectAreaLength!==m||N.hemiLength!==p||N.numDirectionalShadows!==M||N.numPointShadows!==S||N.numSpotShadows!==x||N.numSpotMaps!==A||N.numLightProbes!==R)&&(n.directional.length=f,n.spot.length=_,n.rectArea.length=m,n.point.length=g,n.hemi.length=p,n.directionalShadow.length=M,n.directionalShadowMap.length=M,n.pointShadow.length=S,n.pointShadowMap.length=S,n.spotShadow.length=x,n.spotShadowMap.length=x,n.directionalShadowMatrix.length=M,n.pointShadowMatrix.length=S,n.spotLightMatrix.length=x+A-C,n.spotLightMap.length=A,n.numSpotLightShadowsWithMaps=C,n.numLightProbes=R,N.directionalLength=f,N.pointLength=g,N.spotLength=_,N.rectAreaLength=m,N.hemiLength=p,N.numDirectionalShadows=M,N.numPointShadows=S,N.numSpotShadows=x,N.numSpotMaps=A,N.numLightProbes=R,n.version=ay++)}function l(c,u){let d=0,h=0,f=0,g=0,_=0;const m=u.matrixWorldInverse;for(let p=0,M=c.length;p<M;p++){const S=c[p];if(S.isDirectionalLight){const x=n.directional[d];x.direction.setFromMatrixPosition(S.matrixWorld),r.setFromMatrixPosition(S.target.matrixWorld),x.direction.sub(r),x.direction.transformDirection(m),d++}else if(S.isSpotLight){const x=n.spot[f];x.position.setFromMatrixPosition(S.matrixWorld),x.position.applyMatrix4(m),x.direction.setFromMatrixPosition(S.matrixWorld),r.setFromMatrixPosition(S.target.matrixWorld),x.direction.sub(r),x.direction.transformDirection(m),f++}else if(S.isRectAreaLight){const x=n.rectArea[g];x.position.setFromMatrixPosition(S.matrixWorld),x.position.applyMatrix4(m),o.identity(),s.copy(S.matrixWorld),s.premultiply(m),o.extractRotation(s),x.halfWidth.set(S.width*.5,0,0),x.halfHeight.set(0,S.height*.5,0),x.halfWidth.applyMatrix4(o),x.halfHeight.applyMatrix4(o),g++}else if(S.isPointLight){const x=n.point[h];x.position.setFromMatrixPosition(S.matrixWorld),x.position.applyMatrix4(m),h++}else if(S.isHemisphereLight){const x=n.hemi[_];x.direction.setFromMatrixPosition(S.matrixWorld),x.direction.transformDirection(m),_++}}}return{setup:a,setupView:l,state:n}}function xd(i){const e=new cy(i),t=[],n=[];function r(u){c.camera=u,t.length=0,n.length=0}function s(u){t.push(u)}function o(u){n.push(u)}function a(){e.setup(t)}function l(u){e.setupView(t,u)}const c={lightsArray:t,shadowsArray:n,camera:null,lights:e,transmissionRenderTarget:{}};return{init:r,state:c,setupLights:a,setupLightsView:l,pushLight:s,pushShadow:o}}function uy(i){let e=new WeakMap;function t(r,s=0){const o=e.get(r);let a;return o===void 0?(a=new xd(i),e.set(r,[a])):s>=o.length?(a=new xd(i),o.push(a)):a=o[s],a}function n(){e=new WeakMap}return{get:t,dispose:n}}const dy=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,hy=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function fy(i,e,t){let n=new Ic;const r=new _e,s=new _e,o=new ut,a=new hg({depthPacking:Ap}),l=new fg,c={},u=t.maxTextureSize,d={[Kn]:tn,[tn]:Kn,[fn]:fn},h=new Un({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new _e},radius:{value:4}},vertexShader:dy,fragmentShader:hy}),f=h.clone();f.defines.HORIZONTAL_PASS=1;const g=new ln;g.setAttribute("position",new Bt(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const _=new kt(g,h),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=oh;let p=this.type;this.render=function(C,R,N){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||C.length===0)return;const w=i.getRenderTarget(),y=i.getActiveCubeFace(),L=i.getActiveMipmapLevel(),k=i.state;k.setBlending(Ri),k.buffers.depth.getReversed()===!0?k.buffers.color.setClear(0,0,0,0):k.buffers.color.setClear(1,1,1,1),k.buffers.depth.setTest(!0),k.setScissorTest(!1);const W=p!==ri&&this.type===ri,X=p===ri&&this.type!==ri;for(let q=0,z=C.length;q<z;q++){const oe=C[q],V=oe.shadow;if(V===void 0){console.warn("THREE.WebGLShadowMap:",oe,"has no shadow.");continue}if(V.autoUpdate===!1&&V.needsUpdate===!1)continue;r.copy(V.mapSize);const pe=V.getFrameExtents();if(r.multiply(pe),s.copy(V.mapSize),(r.x>u||r.y>u)&&(r.x>u&&(s.x=Math.floor(u/pe.x),r.x=s.x*pe.x,V.mapSize.x=s.x),r.y>u&&(s.y=Math.floor(u/pe.y),r.y=s.y*pe.y,V.mapSize.y=s.y)),V.map===null||W===!0||X===!0){const ne=this.type!==ri?{minFilter:nn,magFilter:nn}:{};V.map!==null&&V.map.dispose(),V.map=new di(r.x,r.y,ne),V.map.texture.name=oe.name+".shadowMap",V.camera.updateProjectionMatrix()}i.setRenderTarget(V.map),i.clear();const K=V.getViewportCount();for(let ne=0;ne<K;ne++){const ce=V.getViewport(ne);o.set(s.x*ce.x,s.y*ce.y,s.x*ce.z,s.y*ce.w),k.viewport(o),V.updateMatrices(oe,ne),n=V.getFrustum(),x(R,N,V.camera,oe,this.type)}V.isPointLightShadow!==!0&&this.type===ri&&M(V,N),V.needsUpdate=!1}p=this.type,m.needsUpdate=!1,i.setRenderTarget(w,y,L)};function M(C,R){const N=e.update(_);h.defines.VSM_SAMPLES!==C.blurSamples&&(h.defines.VSM_SAMPLES=C.blurSamples,f.defines.VSM_SAMPLES=C.blurSamples,h.needsUpdate=!0,f.needsUpdate=!0),C.mapPass===null&&(C.mapPass=new di(r.x,r.y)),h.uniforms.shadow_pass.value=C.map.texture,h.uniforms.resolution.value=C.mapSize,h.uniforms.radius.value=C.radius,i.setRenderTarget(C.mapPass),i.clear(),i.renderBufferDirect(R,null,N,h,_,null),f.uniforms.shadow_pass.value=C.mapPass.texture,f.uniforms.resolution.value=C.mapSize,f.uniforms.radius.value=C.radius,i.setRenderTarget(C.map),i.clear(),i.renderBufferDirect(R,null,N,f,_,null)}function S(C,R,N,w){let y=null;const L=N.isPointLight===!0?C.customDistanceMaterial:C.customDepthMaterial;if(L!==void 0)y=L;else if(y=N.isPointLight===!0?l:a,i.localClippingEnabled&&R.clipShadows===!0&&Array.isArray(R.clippingPlanes)&&R.clippingPlanes.length!==0||R.displacementMap&&R.displacementScale!==0||R.alphaMap&&R.alphaTest>0||R.map&&R.alphaTest>0||R.alphaToCoverage===!0){const k=y.uuid,W=R.uuid;let X=c[k];X===void 0&&(X={},c[k]=X);let q=X[W];q===void 0&&(q=y.clone(),X[W]=q,R.addEventListener("dispose",A)),y=q}if(y.visible=R.visible,y.wireframe=R.wireframe,w===ri?y.side=R.shadowSide!==null?R.shadowSide:R.side:y.side=R.shadowSide!==null?R.shadowSide:d[R.side],y.alphaMap=R.alphaMap,y.alphaTest=R.alphaToCoverage===!0?.5:R.alphaTest,y.map=R.map,y.clipShadows=R.clipShadows,y.clippingPlanes=R.clippingPlanes,y.clipIntersection=R.clipIntersection,y.displacementMap=R.displacementMap,y.displacementScale=R.displacementScale,y.displacementBias=R.displacementBias,y.wireframeLinewidth=R.wireframeLinewidth,y.linewidth=R.linewidth,N.isPointLight===!0&&y.isMeshDistanceMaterial===!0){const k=i.properties.get(y);k.light=N}return y}function x(C,R,N,w,y){if(C.visible===!1)return;if(C.layers.test(R.layers)&&(C.isMesh||C.isLine||C.isPoints)&&(C.castShadow||C.receiveShadow&&y===ri)&&(!C.frustumCulled||n.intersectsObject(C))){C.modelViewMatrix.multiplyMatrices(N.matrixWorldInverse,C.matrixWorld);const W=e.update(C),X=C.material;if(Array.isArray(X)){const q=W.groups;for(let z=0,oe=q.length;z<oe;z++){const V=q[z],pe=X[V.materialIndex];if(pe&&pe.visible){const K=S(C,pe,w,y);C.onBeforeShadow(i,C,R,N,W,K,V),i.renderBufferDirect(N,null,W,K,C,V),C.onAfterShadow(i,C,R,N,W,K,V)}}}else if(X.visible){const q=S(C,X,w,y);C.onBeforeShadow(i,C,R,N,W,q,null),i.renderBufferDirect(N,null,W,q,C,null),C.onAfterShadow(i,C,R,N,W,q,null)}}const k=C.children;for(let W=0,X=k.length;W<X;W++)x(k[W],R,N,w,y)}function A(C){C.target.removeEventListener("dispose",A);for(const N in c){const w=c[N],y=C.target.uuid;y in w&&(w[y].dispose(),delete w[y])}}}const py={[dl]:hl,[fl]:gl,[pl]:_l,[Br]:ml,[hl]:dl,[gl]:fl,[_l]:pl,[ml]:Br};function my(i,e){function t(){let D=!1;const ge=new ut;let Se=null;const Ie=new ut(0,0,0,0);return{setMask:function(ue){Se!==ue&&!D&&(i.colorMask(ue,ue,ue,ue),Se=ue)},setLocked:function(ue){D=ue},setClear:function(ue,se,Oe,je,ht){ht===!0&&(ue*=je,se*=je,Oe*=je),ge.set(ue,se,Oe,je),Ie.equals(ge)===!1&&(i.clearColor(ue,se,Oe,je),Ie.copy(ge))},reset:function(){D=!1,Se=null,Ie.set(-1,0,0,0)}}}function n(){let D=!1,ge=!1,Se=null,Ie=null,ue=null;return{setReversed:function(se){if(ge!==se){const Oe=e.get("EXT_clip_control");se?Oe.clipControlEXT(Oe.LOWER_LEFT_EXT,Oe.ZERO_TO_ONE_EXT):Oe.clipControlEXT(Oe.LOWER_LEFT_EXT,Oe.NEGATIVE_ONE_TO_ONE_EXT),ge=se;const je=ue;ue=null,this.setClear(je)}},getReversed:function(){return ge},setTest:function(se){se?ee(i.DEPTH_TEST):Me(i.DEPTH_TEST)},setMask:function(se){Se!==se&&!D&&(i.depthMask(se),Se=se)},setFunc:function(se){if(ge&&(se=py[se]),Ie!==se){switch(se){case dl:i.depthFunc(i.NEVER);break;case hl:i.depthFunc(i.ALWAYS);break;case fl:i.depthFunc(i.LESS);break;case Br:i.depthFunc(i.LEQUAL);break;case pl:i.depthFunc(i.EQUAL);break;case ml:i.depthFunc(i.GEQUAL);break;case gl:i.depthFunc(i.GREATER);break;case _l:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}Ie=se}},setLocked:function(se){D=se},setClear:function(se){ue!==se&&(ge&&(se=1-se),i.clearDepth(se),ue=se)},reset:function(){D=!1,Se=null,Ie=null,ue=null,ge=!1}}}function r(){let D=!1,ge=null,Se=null,Ie=null,ue=null,se=null,Oe=null,je=null,ht=null;return{setTest:function(at){D||(at?ee(i.STENCIL_TEST):Me(i.STENCIL_TEST))},setMask:function(at){ge!==at&&!D&&(i.stencilMask(at),ge=at)},setFunc:function(at,Ne,qe){(Se!==at||Ie!==Ne||ue!==qe)&&(i.stencilFunc(at,Ne,qe),Se=at,Ie=Ne,ue=qe)},setOp:function(at,Ne,qe){(se!==at||Oe!==Ne||je!==qe)&&(i.stencilOp(at,Ne,qe),se=at,Oe=Ne,je=qe)},setLocked:function(at){D=at},setClear:function(at){ht!==at&&(i.clearStencil(at),ht=at)},reset:function(){D=!1,ge=null,Se=null,Ie=null,ue=null,se=null,Oe=null,je=null,ht=null}}}const s=new t,o=new n,a=new r,l=new WeakMap,c=new WeakMap;let u={},d={},h=new WeakMap,f=[],g=null,_=!1,m=null,p=null,M=null,S=null,x=null,A=null,C=null,R=new Ge(0,0,0),N=0,w=!1,y=null,L=null,k=null,W=null,X=null;const q=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let z=!1,oe=0;const V=i.getParameter(i.VERSION);V.indexOf("WebGL")!==-1?(oe=parseFloat(/^WebGL (\d)/.exec(V)[1]),z=oe>=1):V.indexOf("OpenGL ES")!==-1&&(oe=parseFloat(/^OpenGL ES (\d)/.exec(V)[1]),z=oe>=2);let pe=null,K={};const ne=i.getParameter(i.SCISSOR_BOX),ce=i.getParameter(i.VIEWPORT),ae=new ut().fromArray(ne),ye=new ut().fromArray(ce);function Ue(D,ge,Se,Ie){const ue=new Uint8Array(4),se=i.createTexture();i.bindTexture(D,se),i.texParameteri(D,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(D,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let Oe=0;Oe<Se;Oe++)D===i.TEXTURE_3D||D===i.TEXTURE_2D_ARRAY?i.texImage3D(ge,0,i.RGBA,1,1,Ie,0,i.RGBA,i.UNSIGNED_BYTE,ue):i.texImage2D(ge+Oe,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,ue);return se}const Z={};Z[i.TEXTURE_2D]=Ue(i.TEXTURE_2D,i.TEXTURE_2D,1),Z[i.TEXTURE_CUBE_MAP]=Ue(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),Z[i.TEXTURE_2D_ARRAY]=Ue(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),Z[i.TEXTURE_3D]=Ue(i.TEXTURE_3D,i.TEXTURE_3D,1,1),s.setClear(0,0,0,1),o.setClear(1),a.setClear(0),ee(i.DEPTH_TEST),o.setFunc(Br),ie(!1),te(Qc),ee(i.CULL_FACE),le(Ri);function ee(D){u[D]!==!0&&(i.enable(D),u[D]=!0)}function Me(D){u[D]!==!1&&(i.disable(D),u[D]=!1)}function Te(D,ge){return d[D]!==ge?(i.bindFramebuffer(D,ge),d[D]=ge,D===i.DRAW_FRAMEBUFFER&&(d[i.FRAMEBUFFER]=ge),D===i.FRAMEBUFFER&&(d[i.DRAW_FRAMEBUFFER]=ge),!0):!1}function Ae(D,ge){let Se=f,Ie=!1;if(D){Se=h.get(ge),Se===void 0&&(Se=[],h.set(ge,Se));const ue=D.textures;if(Se.length!==ue.length||Se[0]!==i.COLOR_ATTACHMENT0){for(let se=0,Oe=ue.length;se<Oe;se++)Se[se]=i.COLOR_ATTACHMENT0+se;Se.length=ue.length,Ie=!0}}else Se[0]!==i.BACK&&(Se[0]=i.BACK,Ie=!0);Ie&&i.drawBuffers(Se)}function Xe(D){return g!==D?(i.useProgram(D),g=D,!0):!1}const it={[Ki]:i.FUNC_ADD,[Jf]:i.FUNC_SUBTRACT,[Zf]:i.FUNC_REVERSE_SUBTRACT};it[Qf]=i.MIN,it[ep]=i.MAX;const P={[tp]:i.ZERO,[np]:i.ONE,[ip]:i.SRC_COLOR,[cl]:i.SRC_ALPHA,[cp]:i.SRC_ALPHA_SATURATE,[ap]:i.DST_COLOR,[sp]:i.DST_ALPHA,[rp]:i.ONE_MINUS_SRC_COLOR,[ul]:i.ONE_MINUS_SRC_ALPHA,[lp]:i.ONE_MINUS_DST_COLOR,[op]:i.ONE_MINUS_DST_ALPHA,[up]:i.CONSTANT_COLOR,[dp]:i.ONE_MINUS_CONSTANT_COLOR,[hp]:i.CONSTANT_ALPHA,[fp]:i.ONE_MINUS_CONSTANT_ALPHA};function le(D,ge,Se,Ie,ue,se,Oe,je,ht,at){if(D===Ri){_===!0&&(Me(i.BLEND),_=!1);return}if(_===!1&&(ee(i.BLEND),_=!0),D!==jf){if(D!==m||at!==w){if((p!==Ki||x!==Ki)&&(i.blendEquation(i.FUNC_ADD),p=Ki,x=Ki),at)switch(D){case Nr:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case ll:i.blendFunc(i.ONE,i.ONE);break;case eu:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case tu:i.blendFuncSeparate(i.DST_COLOR,i.ONE_MINUS_SRC_ALPHA,i.ZERO,i.ONE);break;default:console.error("THREE.WebGLState: Invalid blending: ",D);break}else switch(D){case Nr:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case ll:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE,i.ONE,i.ONE);break;case eu:console.error("THREE.WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case tu:console.error("THREE.WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:console.error("THREE.WebGLState: Invalid blending: ",D);break}M=null,S=null,A=null,C=null,R.set(0,0,0),N=0,m=D,w=at}return}ue=ue||ge,se=se||Se,Oe=Oe||Ie,(ge!==p||ue!==x)&&(i.blendEquationSeparate(it[ge],it[ue]),p=ge,x=ue),(Se!==M||Ie!==S||se!==A||Oe!==C)&&(i.blendFuncSeparate(P[Se],P[Ie],P[se],P[Oe]),M=Se,S=Ie,A=se,C=Oe),(je.equals(R)===!1||ht!==N)&&(i.blendColor(je.r,je.g,je.b,ht),R.copy(je),N=ht),m=D,w=!1}function re(D,ge){D.side===fn?Me(i.CULL_FACE):ee(i.CULL_FACE);let Se=D.side===tn;ge&&(Se=!Se),ie(Se),D.blending===Nr&&D.transparent===!1?le(Ri):le(D.blending,D.blendEquation,D.blendSrc,D.blendDst,D.blendEquationAlpha,D.blendSrcAlpha,D.blendDstAlpha,D.blendColor,D.blendAlpha,D.premultipliedAlpha),o.setFunc(D.depthFunc),o.setTest(D.depthTest),o.setMask(D.depthWrite),s.setMask(D.colorWrite);const Ie=D.stencilWrite;a.setTest(Ie),Ie&&(a.setMask(D.stencilWriteMask),a.setFunc(D.stencilFunc,D.stencilRef,D.stencilFuncMask),a.setOp(D.stencilFail,D.stencilZFail,D.stencilZPass)),F(D.polygonOffset,D.polygonOffsetFactor,D.polygonOffsetUnits),D.alphaToCoverage===!0?ee(i.SAMPLE_ALPHA_TO_COVERAGE):Me(i.SAMPLE_ALPHA_TO_COVERAGE)}function ie(D){y!==D&&(D?i.frontFace(i.CW):i.frontFace(i.CCW),y=D)}function te(D){D!==Kf?(ee(i.CULL_FACE),D!==L&&(D===Qc?i.cullFace(i.BACK):D===$f?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):Me(i.CULL_FACE),L=D}function xe(D){D!==k&&(z&&i.lineWidth(D),k=D)}function F(D,ge,Se){D?(ee(i.POLYGON_OFFSET_FILL),(W!==ge||X!==Se)&&(i.polygonOffset(ge,Se),W=ge,X=Se)):Me(i.POLYGON_OFFSET_FILL)}function Q(D){D?ee(i.SCISSOR_TEST):Me(i.SCISSOR_TEST)}function me(D){D===void 0&&(D=i.TEXTURE0+q-1),pe!==D&&(i.activeTexture(D),pe=D)}function de(D,ge,Se){Se===void 0&&(pe===null?Se=i.TEXTURE0+q-1:Se=pe);let Ie=K[Se];Ie===void 0&&(Ie={type:void 0,texture:void 0},K[Se]=Ie),(Ie.type!==D||Ie.texture!==ge)&&(pe!==Se&&(i.activeTexture(Se),pe=Se),i.bindTexture(D,ge||Z[D]),Ie.type=D,Ie.texture=ge)}function E(){const D=K[pe];D!==void 0&&D.type!==void 0&&(i.bindTexture(D.type,null),D.type=void 0,D.texture=void 0)}function v(){try{i.compressedTexImage2D(...arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function U(){try{i.compressedTexImage3D(...arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function G(){try{i.texSubImage2D(...arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function Y(){try{i.texSubImage3D(...arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function H(){try{i.compressedTexSubImage2D(...arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function be(){try{i.compressedTexSubImage3D(...arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function fe(){try{i.texStorage2D(...arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function we(){try{i.texStorage3D(...arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function Ee(){try{i.texImage2D(...arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function he(){try{i.texImage3D(...arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function Ce(D){ae.equals(D)===!1&&(i.scissor(D.x,D.y,D.z,D.w),ae.copy(D))}function We(D){ye.equals(D)===!1&&(i.viewport(D.x,D.y,D.z,D.w),ye.copy(D))}function ke(D,ge){let Se=c.get(ge);Se===void 0&&(Se=new WeakMap,c.set(ge,Se));let Ie=Se.get(D);Ie===void 0&&(Ie=i.getUniformBlockIndex(ge,D.name),Se.set(D,Ie))}function Re(D,ge){const Ie=c.get(ge).get(D);l.get(ge)!==Ie&&(i.uniformBlockBinding(ge,Ie,D.__bindingPointIndex),l.set(ge,Ie))}function Ze(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),o.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),u={},pe=null,K={},d={},h=new WeakMap,f=[],g=null,_=!1,m=null,p=null,M=null,S=null,x=null,A=null,C=null,R=new Ge(0,0,0),N=0,w=!1,y=null,L=null,k=null,W=null,X=null,ae.set(0,0,i.canvas.width,i.canvas.height),ye.set(0,0,i.canvas.width,i.canvas.height),s.reset(),o.reset(),a.reset()}return{buffers:{color:s,depth:o,stencil:a},enable:ee,disable:Me,bindFramebuffer:Te,drawBuffers:Ae,useProgram:Xe,setBlending:le,setMaterial:re,setFlipSided:ie,setCullFace:te,setLineWidth:xe,setPolygonOffset:F,setScissorTest:Q,activeTexture:me,bindTexture:de,unbindTexture:E,compressedTexImage2D:v,compressedTexImage3D:U,texImage2D:Ee,texImage3D:he,updateUBOMapping:ke,uniformBlockBinding:Re,texStorage2D:fe,texStorage3D:we,texSubImage2D:G,texSubImage3D:Y,compressedTexSubImage2D:H,compressedTexSubImage3D:be,scissor:Ce,viewport:We,reset:Ze}}function gy(i,e,t,n,r,s,o){const a=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new _e,u=new WeakMap;let d;const h=new WeakMap;let f=!1;try{f=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(E,v){return f?new OffscreenCanvas(E,v):Bs("canvas")}function _(E,v,U){let G=1;const Y=de(E);if((Y.width>U||Y.height>U)&&(G=U/Math.max(Y.width,Y.height)),G<1)if(typeof HTMLImageElement<"u"&&E instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&E instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&E instanceof ImageBitmap||typeof VideoFrame<"u"&&E instanceof VideoFrame){const H=Math.floor(G*Y.width),be=Math.floor(G*Y.height);d===void 0&&(d=g(H,be));const fe=v?g(H,be):d;return fe.width=H,fe.height=be,fe.getContext("2d").drawImage(E,0,0,H,be),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+Y.width+"x"+Y.height+") to ("+H+"x"+be+")."),fe}else return"data"in E&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+Y.width+"x"+Y.height+")."),E;return E}function m(E){return E.generateMipmaps}function p(E){i.generateMipmap(E)}function M(E){return E.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:E.isWebGL3DRenderTarget?i.TEXTURE_3D:E.isWebGLArrayRenderTarget||E.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function S(E,v,U,G,Y=!1){if(E!==null){if(i[E]!==void 0)return i[E];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+E+"'")}let H=v;if(v===i.RED&&(U===i.FLOAT&&(H=i.R32F),U===i.HALF_FLOAT&&(H=i.R16F),U===i.UNSIGNED_BYTE&&(H=i.R8)),v===i.RED_INTEGER&&(U===i.UNSIGNED_BYTE&&(H=i.R8UI),U===i.UNSIGNED_SHORT&&(H=i.R16UI),U===i.UNSIGNED_INT&&(H=i.R32UI),U===i.BYTE&&(H=i.R8I),U===i.SHORT&&(H=i.R16I),U===i.INT&&(H=i.R32I)),v===i.RG&&(U===i.FLOAT&&(H=i.RG32F),U===i.HALF_FLOAT&&(H=i.RG16F),U===i.UNSIGNED_BYTE&&(H=i.RG8)),v===i.RG_INTEGER&&(U===i.UNSIGNED_BYTE&&(H=i.RG8UI),U===i.UNSIGNED_SHORT&&(H=i.RG16UI),U===i.UNSIGNED_INT&&(H=i.RG32UI),U===i.BYTE&&(H=i.RG8I),U===i.SHORT&&(H=i.RG16I),U===i.INT&&(H=i.RG32I)),v===i.RGB_INTEGER&&(U===i.UNSIGNED_BYTE&&(H=i.RGB8UI),U===i.UNSIGNED_SHORT&&(H=i.RGB16UI),U===i.UNSIGNED_INT&&(H=i.RGB32UI),U===i.BYTE&&(H=i.RGB8I),U===i.SHORT&&(H=i.RGB16I),U===i.INT&&(H=i.RGB32I)),v===i.RGBA_INTEGER&&(U===i.UNSIGNED_BYTE&&(H=i.RGBA8UI),U===i.UNSIGNED_SHORT&&(H=i.RGBA16UI),U===i.UNSIGNED_INT&&(H=i.RGBA32UI),U===i.BYTE&&(H=i.RGBA8I),U===i.SHORT&&(H=i.RGBA16I),U===i.INT&&(H=i.RGBA32I)),v===i.RGB&&(U===i.UNSIGNED_INT_5_9_9_9_REV&&(H=i.RGB9_E5),U===i.UNSIGNED_INT_10F_11F_11F_REV&&(H=i.R11F_G11F_B10F)),v===i.RGBA){const be=Y?ea:ot.getTransfer(G);U===i.FLOAT&&(H=i.RGBA32F),U===i.HALF_FLOAT&&(H=i.RGBA16F),U===i.UNSIGNED_BYTE&&(H=be===_t?i.SRGB8_ALPHA8:i.RGBA8),U===i.UNSIGNED_SHORT_4_4_4_4&&(H=i.RGBA4),U===i.UNSIGNED_SHORT_5_5_5_1&&(H=i.RGB5_A1)}return(H===i.R16F||H===i.R32F||H===i.RG16F||H===i.RG32F||H===i.RGBA16F||H===i.RGBA32F)&&e.get("EXT_color_buffer_float"),H}function x(E,v){let U;return E?v===null||v===er||v===Ds?U=i.DEPTH24_STENCIL8:v===Rn?U=i.DEPTH32F_STENCIL8:v===Ns&&(U=i.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):v===null||v===er||v===Ds?U=i.DEPTH_COMPONENT24:v===Rn?U=i.DEPTH_COMPONENT32F:v===Ns&&(U=i.DEPTH_COMPONENT16),U}function A(E,v){return m(E)===!0||E.isFramebufferTexture&&E.minFilter!==nn&&E.minFilter!==Zt?Math.log2(Math.max(v.width,v.height))+1:E.mipmaps!==void 0&&E.mipmaps.length>0?E.mipmaps.length:E.isCompressedTexture&&Array.isArray(E.image)?v.mipmaps.length:1}function C(E){const v=E.target;v.removeEventListener("dispose",C),N(v),v.isVideoTexture&&u.delete(v)}function R(E){const v=E.target;v.removeEventListener("dispose",R),y(v)}function N(E){const v=n.get(E);if(v.__webglInit===void 0)return;const U=E.source,G=h.get(U);if(G){const Y=G[v.__cacheKey];Y.usedTimes--,Y.usedTimes===0&&w(E),Object.keys(G).length===0&&h.delete(U)}n.remove(E)}function w(E){const v=n.get(E);i.deleteTexture(v.__webglTexture);const U=E.source,G=h.get(U);delete G[v.__cacheKey],o.memory.textures--}function y(E){const v=n.get(E);if(E.depthTexture&&(E.depthTexture.dispose(),n.remove(E.depthTexture)),E.isWebGLCubeRenderTarget)for(let G=0;G<6;G++){if(Array.isArray(v.__webglFramebuffer[G]))for(let Y=0;Y<v.__webglFramebuffer[G].length;Y++)i.deleteFramebuffer(v.__webglFramebuffer[G][Y]);else i.deleteFramebuffer(v.__webglFramebuffer[G]);v.__webglDepthbuffer&&i.deleteRenderbuffer(v.__webglDepthbuffer[G])}else{if(Array.isArray(v.__webglFramebuffer))for(let G=0;G<v.__webglFramebuffer.length;G++)i.deleteFramebuffer(v.__webglFramebuffer[G]);else i.deleteFramebuffer(v.__webglFramebuffer);if(v.__webglDepthbuffer&&i.deleteRenderbuffer(v.__webglDepthbuffer),v.__webglMultisampledFramebuffer&&i.deleteFramebuffer(v.__webglMultisampledFramebuffer),v.__webglColorRenderbuffer)for(let G=0;G<v.__webglColorRenderbuffer.length;G++)v.__webglColorRenderbuffer[G]&&i.deleteRenderbuffer(v.__webglColorRenderbuffer[G]);v.__webglDepthRenderbuffer&&i.deleteRenderbuffer(v.__webglDepthRenderbuffer)}const U=E.textures;for(let G=0,Y=U.length;G<Y;G++){const H=n.get(U[G]);H.__webglTexture&&(i.deleteTexture(H.__webglTexture),o.memory.textures--),n.remove(U[G])}n.remove(E)}let L=0;function k(){L=0}function W(){const E=L;return E>=r.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+E+" texture units while this GPU supports only "+r.maxTextures),L+=1,E}function X(E){const v=[];return v.push(E.wrapS),v.push(E.wrapT),v.push(E.wrapR||0),v.push(E.magFilter),v.push(E.minFilter),v.push(E.anisotropy),v.push(E.internalFormat),v.push(E.format),v.push(E.type),v.push(E.generateMipmaps),v.push(E.premultiplyAlpha),v.push(E.flipY),v.push(E.unpackAlignment),v.push(E.colorSpace),v.join()}function q(E,v){const U=n.get(E);if(E.isVideoTexture&&Q(E),E.isRenderTargetTexture===!1&&E.isExternalTexture!==!0&&E.version>0&&U.__version!==E.version){const G=E.image;if(G===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(G.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{Z(U,E,v);return}}else E.isExternalTexture&&(U.__webglTexture=E.sourceTexture?E.sourceTexture:null);t.bindTexture(i.TEXTURE_2D,U.__webglTexture,i.TEXTURE0+v)}function z(E,v){const U=n.get(E);if(E.isRenderTargetTexture===!1&&E.version>0&&U.__version!==E.version){Z(U,E,v);return}t.bindTexture(i.TEXTURE_2D_ARRAY,U.__webglTexture,i.TEXTURE0+v)}function oe(E,v){const U=n.get(E);if(E.isRenderTargetTexture===!1&&E.version>0&&U.__version!==E.version){Z(U,E,v);return}t.bindTexture(i.TEXTURE_3D,U.__webglTexture,i.TEXTURE0+v)}function V(E,v){const U=n.get(E);if(E.version>0&&U.__version!==E.version){ee(U,E,v);return}t.bindTexture(i.TEXTURE_CUBE_MAP,U.__webglTexture,i.TEXTURE0+v)}const pe={[Vr]:i.REPEAT,[Ti]:i.CLAMP_TO_EDGE,[Qo]:i.MIRRORED_REPEAT},K={[nn]:i.NEAREST,[ch]:i.NEAREST_MIPMAP_NEAREST,[Ms]:i.NEAREST_MIPMAP_LINEAR,[Zt]:i.LINEAR,[Bo]:i.LINEAR_MIPMAP_NEAREST,[si]:i.LINEAR_MIPMAP_LINEAR},ne={[Rp]:i.NEVER,[Up]:i.ALWAYS,[Lp]:i.LESS,[xh]:i.LEQUAL,[Pp]:i.EQUAL,[Dp]:i.GEQUAL,[Ip]:i.GREATER,[Np]:i.NOTEQUAL};function ce(E,v){if(v.type===Rn&&e.has("OES_texture_float_linear")===!1&&(v.magFilter===Zt||v.magFilter===Bo||v.magFilter===Ms||v.magFilter===si||v.minFilter===Zt||v.minFilter===Bo||v.minFilter===Ms||v.minFilter===si)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(E,i.TEXTURE_WRAP_S,pe[v.wrapS]),i.texParameteri(E,i.TEXTURE_WRAP_T,pe[v.wrapT]),(E===i.TEXTURE_3D||E===i.TEXTURE_2D_ARRAY)&&i.texParameteri(E,i.TEXTURE_WRAP_R,pe[v.wrapR]),i.texParameteri(E,i.TEXTURE_MAG_FILTER,K[v.magFilter]),i.texParameteri(E,i.TEXTURE_MIN_FILTER,K[v.minFilter]),v.compareFunction&&(i.texParameteri(E,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(E,i.TEXTURE_COMPARE_FUNC,ne[v.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(v.magFilter===nn||v.minFilter!==Ms&&v.minFilter!==si||v.type===Rn&&e.has("OES_texture_float_linear")===!1)return;if(v.anisotropy>1||n.get(v).__currentAnisotropy){const U=e.get("EXT_texture_filter_anisotropic");i.texParameterf(E,U.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(v.anisotropy,r.getMaxAnisotropy())),n.get(v).__currentAnisotropy=v.anisotropy}}}function ae(E,v){let U=!1;E.__webglInit===void 0&&(E.__webglInit=!0,v.addEventListener("dispose",C));const G=v.source;let Y=h.get(G);Y===void 0&&(Y={},h.set(G,Y));const H=X(v);if(H!==E.__cacheKey){Y[H]===void 0&&(Y[H]={texture:i.createTexture(),usedTimes:0},o.memory.textures++,U=!0),Y[H].usedTimes++;const be=Y[E.__cacheKey];be!==void 0&&(Y[E.__cacheKey].usedTimes--,be.usedTimes===0&&w(v)),E.__cacheKey=H,E.__webglTexture=Y[H].texture}return U}function ye(E,v,U){return Math.floor(Math.floor(E/U)/v)}function Ue(E,v,U,G){const H=E.updateRanges;if(H.length===0)t.texSubImage2D(i.TEXTURE_2D,0,0,0,v.width,v.height,U,G,v.data);else{H.sort((he,Ce)=>he.start-Ce.start);let be=0;for(let he=1;he<H.length;he++){const Ce=H[be],We=H[he],ke=Ce.start+Ce.count,Re=ye(We.start,v.width,4),Ze=ye(Ce.start,v.width,4);We.start<=ke+1&&Re===Ze&&ye(We.start+We.count-1,v.width,4)===Re?Ce.count=Math.max(Ce.count,We.start+We.count-Ce.start):(++be,H[be]=We)}H.length=be+1;const fe=i.getParameter(i.UNPACK_ROW_LENGTH),we=i.getParameter(i.UNPACK_SKIP_PIXELS),Ee=i.getParameter(i.UNPACK_SKIP_ROWS);i.pixelStorei(i.UNPACK_ROW_LENGTH,v.width);for(let he=0,Ce=H.length;he<Ce;he++){const We=H[he],ke=Math.floor(We.start/4),Re=Math.ceil(We.count/4),Ze=ke%v.width,D=Math.floor(ke/v.width),ge=Re,Se=1;i.pixelStorei(i.UNPACK_SKIP_PIXELS,Ze),i.pixelStorei(i.UNPACK_SKIP_ROWS,D),t.texSubImage2D(i.TEXTURE_2D,0,Ze,D,ge,Se,U,G,v.data)}E.clearUpdateRanges(),i.pixelStorei(i.UNPACK_ROW_LENGTH,fe),i.pixelStorei(i.UNPACK_SKIP_PIXELS,we),i.pixelStorei(i.UNPACK_SKIP_ROWS,Ee)}}function Z(E,v,U){let G=i.TEXTURE_2D;(v.isDataArrayTexture||v.isCompressedArrayTexture)&&(G=i.TEXTURE_2D_ARRAY),v.isData3DTexture&&(G=i.TEXTURE_3D);const Y=ae(E,v),H=v.source;t.bindTexture(G,E.__webglTexture,i.TEXTURE0+U);const be=n.get(H);if(H.version!==be.__version||Y===!0){t.activeTexture(i.TEXTURE0+U);const fe=ot.getPrimaries(ot.workingColorSpace),we=v.colorSpace===wi?null:ot.getPrimaries(v.colorSpace),Ee=v.colorSpace===wi||fe===we?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,v.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,v.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,v.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,Ee);let he=_(v.image,!1,r.maxTextureSize);he=me(v,he);const Ce=s.convert(v.format,v.colorSpace),We=s.convert(v.type);let ke=S(v.internalFormat,Ce,We,v.colorSpace,v.isVideoTexture);ce(G,v);let Re;const Ze=v.mipmaps,D=v.isVideoTexture!==!0,ge=be.__version===void 0||Y===!0,Se=H.dataReady,Ie=A(v,he);if(v.isDepthTexture)ke=x(v.format===Os,v.type),ge&&(D?t.texStorage2D(i.TEXTURE_2D,1,ke,he.width,he.height):t.texImage2D(i.TEXTURE_2D,0,ke,he.width,he.height,0,Ce,We,null));else if(v.isDataTexture)if(Ze.length>0){D&&ge&&t.texStorage2D(i.TEXTURE_2D,Ie,ke,Ze[0].width,Ze[0].height);for(let ue=0,se=Ze.length;ue<se;ue++)Re=Ze[ue],D?Se&&t.texSubImage2D(i.TEXTURE_2D,ue,0,0,Re.width,Re.height,Ce,We,Re.data):t.texImage2D(i.TEXTURE_2D,ue,ke,Re.width,Re.height,0,Ce,We,Re.data);v.generateMipmaps=!1}else D?(ge&&t.texStorage2D(i.TEXTURE_2D,Ie,ke,he.width,he.height),Se&&Ue(v,he,Ce,We)):t.texImage2D(i.TEXTURE_2D,0,ke,he.width,he.height,0,Ce,We,he.data);else if(v.isCompressedTexture)if(v.isCompressedArrayTexture){D&&ge&&t.texStorage3D(i.TEXTURE_2D_ARRAY,Ie,ke,Ze[0].width,Ze[0].height,he.depth);for(let ue=0,se=Ze.length;ue<se;ue++)if(Re=Ze[ue],v.format!==yn)if(Ce!==null)if(D){if(Se)if(v.layerUpdates.size>0){const Oe=ju(Re.width,Re.height,v.format,v.type);for(const je of v.layerUpdates){const ht=Re.data.subarray(je*Oe/Re.data.BYTES_PER_ELEMENT,(je+1)*Oe/Re.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,ue,0,0,je,Re.width,Re.height,1,Ce,ht)}v.clearLayerUpdates()}else t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,ue,0,0,0,Re.width,Re.height,he.depth,Ce,Re.data)}else t.compressedTexImage3D(i.TEXTURE_2D_ARRAY,ue,ke,Re.width,Re.height,he.depth,0,Re.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else D?Se&&t.texSubImage3D(i.TEXTURE_2D_ARRAY,ue,0,0,0,Re.width,Re.height,he.depth,Ce,We,Re.data):t.texImage3D(i.TEXTURE_2D_ARRAY,ue,ke,Re.width,Re.height,he.depth,0,Ce,We,Re.data)}else{D&&ge&&t.texStorage2D(i.TEXTURE_2D,Ie,ke,Ze[0].width,Ze[0].height);for(let ue=0,se=Ze.length;ue<se;ue++)Re=Ze[ue],v.format!==yn?Ce!==null?D?Se&&t.compressedTexSubImage2D(i.TEXTURE_2D,ue,0,0,Re.width,Re.height,Ce,Re.data):t.compressedTexImage2D(i.TEXTURE_2D,ue,ke,Re.width,Re.height,0,Re.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):D?Se&&t.texSubImage2D(i.TEXTURE_2D,ue,0,0,Re.width,Re.height,Ce,We,Re.data):t.texImage2D(i.TEXTURE_2D,ue,ke,Re.width,Re.height,0,Ce,We,Re.data)}else if(v.isDataArrayTexture)if(D){if(ge&&t.texStorage3D(i.TEXTURE_2D_ARRAY,Ie,ke,he.width,he.height,he.depth),Se)if(v.layerUpdates.size>0){const ue=ju(he.width,he.height,v.format,v.type);for(const se of v.layerUpdates){const Oe=he.data.subarray(se*ue/he.data.BYTES_PER_ELEMENT,(se+1)*ue/he.data.BYTES_PER_ELEMENT);t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,se,he.width,he.height,1,Ce,We,Oe)}v.clearLayerUpdates()}else t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,he.width,he.height,he.depth,Ce,We,he.data)}else t.texImage3D(i.TEXTURE_2D_ARRAY,0,ke,he.width,he.height,he.depth,0,Ce,We,he.data);else if(v.isData3DTexture)D?(ge&&t.texStorage3D(i.TEXTURE_3D,Ie,ke,he.width,he.height,he.depth),Se&&t.texSubImage3D(i.TEXTURE_3D,0,0,0,0,he.width,he.height,he.depth,Ce,We,he.data)):t.texImage3D(i.TEXTURE_3D,0,ke,he.width,he.height,he.depth,0,Ce,We,he.data);else if(v.isFramebufferTexture){if(ge)if(D)t.texStorage2D(i.TEXTURE_2D,Ie,ke,he.width,he.height);else{let ue=he.width,se=he.height;for(let Oe=0;Oe<Ie;Oe++)t.texImage2D(i.TEXTURE_2D,Oe,ke,ue,se,0,Ce,We,null),ue>>=1,se>>=1}}else if(Ze.length>0){if(D&&ge){const ue=de(Ze[0]);t.texStorage2D(i.TEXTURE_2D,Ie,ke,ue.width,ue.height)}for(let ue=0,se=Ze.length;ue<se;ue++)Re=Ze[ue],D?Se&&t.texSubImage2D(i.TEXTURE_2D,ue,0,0,Ce,We,Re):t.texImage2D(i.TEXTURE_2D,ue,ke,Ce,We,Re);v.generateMipmaps=!1}else if(D){if(ge){const ue=de(he);t.texStorage2D(i.TEXTURE_2D,Ie,ke,ue.width,ue.height)}Se&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,Ce,We,he)}else t.texImage2D(i.TEXTURE_2D,0,ke,Ce,We,he);m(v)&&p(G),be.__version=H.version,v.onUpdate&&v.onUpdate(v)}E.__version=v.version}function ee(E,v,U){if(v.image.length!==6)return;const G=ae(E,v),Y=v.source;t.bindTexture(i.TEXTURE_CUBE_MAP,E.__webglTexture,i.TEXTURE0+U);const H=n.get(Y);if(Y.version!==H.__version||G===!0){t.activeTexture(i.TEXTURE0+U);const be=ot.getPrimaries(ot.workingColorSpace),fe=v.colorSpace===wi?null:ot.getPrimaries(v.colorSpace),we=v.colorSpace===wi||be===fe?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,v.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,v.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,v.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,we);const Ee=v.isCompressedTexture||v.image[0].isCompressedTexture,he=v.image[0]&&v.image[0].isDataTexture,Ce=[];for(let se=0;se<6;se++)!Ee&&!he?Ce[se]=_(v.image[se],!0,r.maxCubemapSize):Ce[se]=he?v.image[se].image:v.image[se],Ce[se]=me(v,Ce[se]);const We=Ce[0],ke=s.convert(v.format,v.colorSpace),Re=s.convert(v.type),Ze=S(v.internalFormat,ke,Re,v.colorSpace),D=v.isVideoTexture!==!0,ge=H.__version===void 0||G===!0,Se=Y.dataReady;let Ie=A(v,We);ce(i.TEXTURE_CUBE_MAP,v);let ue;if(Ee){D&&ge&&t.texStorage2D(i.TEXTURE_CUBE_MAP,Ie,Ze,We.width,We.height);for(let se=0;se<6;se++){ue=Ce[se].mipmaps;for(let Oe=0;Oe<ue.length;Oe++){const je=ue[Oe];v.format!==yn?ke!==null?D?Se&&t.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+se,Oe,0,0,je.width,je.height,ke,je.data):t.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+se,Oe,Ze,je.width,je.height,0,je.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):D?Se&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+se,Oe,0,0,je.width,je.height,ke,Re,je.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+se,Oe,Ze,je.width,je.height,0,ke,Re,je.data)}}}else{if(ue=v.mipmaps,D&&ge){ue.length>0&&Ie++;const se=de(Ce[0]);t.texStorage2D(i.TEXTURE_CUBE_MAP,Ie,Ze,se.width,se.height)}for(let se=0;se<6;se++)if(he){D?Se&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+se,0,0,0,Ce[se].width,Ce[se].height,ke,Re,Ce[se].data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+se,0,Ze,Ce[se].width,Ce[se].height,0,ke,Re,Ce[se].data);for(let Oe=0;Oe<ue.length;Oe++){const ht=ue[Oe].image[se].image;D?Se&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+se,Oe+1,0,0,ht.width,ht.height,ke,Re,ht.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+se,Oe+1,Ze,ht.width,ht.height,0,ke,Re,ht.data)}}else{D?Se&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+se,0,0,0,ke,Re,Ce[se]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+se,0,Ze,ke,Re,Ce[se]);for(let Oe=0;Oe<ue.length;Oe++){const je=ue[Oe];D?Se&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+se,Oe+1,0,0,ke,Re,je.image[se]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+se,Oe+1,Ze,ke,Re,je.image[se])}}}m(v)&&p(i.TEXTURE_CUBE_MAP),H.__version=Y.version,v.onUpdate&&v.onUpdate(v)}E.__version=v.version}function Me(E,v,U,G,Y,H){const be=s.convert(U.format,U.colorSpace),fe=s.convert(U.type),we=S(U.internalFormat,be,fe,U.colorSpace),Ee=n.get(v),he=n.get(U);if(he.__renderTarget=v,!Ee.__hasExternalTextures){const Ce=Math.max(1,v.width>>H),We=Math.max(1,v.height>>H);Y===i.TEXTURE_3D||Y===i.TEXTURE_2D_ARRAY?t.texImage3D(Y,H,we,Ce,We,v.depth,0,be,fe,null):t.texImage2D(Y,H,we,Ce,We,0,be,fe,null)}t.bindFramebuffer(i.FRAMEBUFFER,E),F(v)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,G,Y,he.__webglTexture,0,xe(v)):(Y===i.TEXTURE_2D||Y>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&Y<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,G,Y,he.__webglTexture,H),t.bindFramebuffer(i.FRAMEBUFFER,null)}function Te(E,v,U){if(i.bindRenderbuffer(i.RENDERBUFFER,E),v.depthBuffer){const G=v.depthTexture,Y=G&&G.isDepthTexture?G.type:null,H=x(v.stencilBuffer,Y),be=v.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,fe=xe(v);F(v)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,fe,H,v.width,v.height):U?i.renderbufferStorageMultisample(i.RENDERBUFFER,fe,H,v.width,v.height):i.renderbufferStorage(i.RENDERBUFFER,H,v.width,v.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,be,i.RENDERBUFFER,E)}else{const G=v.textures;for(let Y=0;Y<G.length;Y++){const H=G[Y],be=s.convert(H.format,H.colorSpace),fe=s.convert(H.type),we=S(H.internalFormat,be,fe,H.colorSpace),Ee=xe(v);U&&F(v)===!1?i.renderbufferStorageMultisample(i.RENDERBUFFER,Ee,we,v.width,v.height):F(v)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,Ee,we,v.width,v.height):i.renderbufferStorage(i.RENDERBUFFER,we,v.width,v.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function Ae(E,v){if(v&&v.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(i.FRAMEBUFFER,E),!(v.depthTexture&&v.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");const G=n.get(v.depthTexture);G.__renderTarget=v,(!G.__webglTexture||v.depthTexture.image.width!==v.width||v.depthTexture.image.height!==v.height)&&(v.depthTexture.image.width=v.width,v.depthTexture.image.height=v.height,v.depthTexture.needsUpdate=!0),q(v.depthTexture,0);const Y=G.__webglTexture,H=xe(v);if(v.depthTexture.format===Us)F(v)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,Y,0,H):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,Y,0);else if(v.depthTexture.format===Os)F(v)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,Y,0,H):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,Y,0);else throw new Error("Unknown depthTexture format")}function Xe(E){const v=n.get(E),U=E.isWebGLCubeRenderTarget===!0;if(v.__boundDepthTexture!==E.depthTexture){const G=E.depthTexture;if(v.__depthDisposeCallback&&v.__depthDisposeCallback(),G){const Y=()=>{delete v.__boundDepthTexture,delete v.__depthDisposeCallback,G.removeEventListener("dispose",Y)};G.addEventListener("dispose",Y),v.__depthDisposeCallback=Y}v.__boundDepthTexture=G}if(E.depthTexture&&!v.__autoAllocateDepthBuffer){if(U)throw new Error("target.depthTexture not supported in Cube render targets");const G=E.texture.mipmaps;G&&G.length>0?Ae(v.__webglFramebuffer[0],E):Ae(v.__webglFramebuffer,E)}else if(U){v.__webglDepthbuffer=[];for(let G=0;G<6;G++)if(t.bindFramebuffer(i.FRAMEBUFFER,v.__webglFramebuffer[G]),v.__webglDepthbuffer[G]===void 0)v.__webglDepthbuffer[G]=i.createRenderbuffer(),Te(v.__webglDepthbuffer[G],E,!1);else{const Y=E.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,H=v.__webglDepthbuffer[G];i.bindRenderbuffer(i.RENDERBUFFER,H),i.framebufferRenderbuffer(i.FRAMEBUFFER,Y,i.RENDERBUFFER,H)}}else{const G=E.texture.mipmaps;if(G&&G.length>0?t.bindFramebuffer(i.FRAMEBUFFER,v.__webglFramebuffer[0]):t.bindFramebuffer(i.FRAMEBUFFER,v.__webglFramebuffer),v.__webglDepthbuffer===void 0)v.__webglDepthbuffer=i.createRenderbuffer(),Te(v.__webglDepthbuffer,E,!1);else{const Y=E.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,H=v.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,H),i.framebufferRenderbuffer(i.FRAMEBUFFER,Y,i.RENDERBUFFER,H)}}t.bindFramebuffer(i.FRAMEBUFFER,null)}function it(E,v,U){const G=n.get(E);v!==void 0&&Me(G.__webglFramebuffer,E,E.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),U!==void 0&&Xe(E)}function P(E){const v=E.texture,U=n.get(E),G=n.get(v);E.addEventListener("dispose",R);const Y=E.textures,H=E.isWebGLCubeRenderTarget===!0,be=Y.length>1;if(be||(G.__webglTexture===void 0&&(G.__webglTexture=i.createTexture()),G.__version=v.version,o.memory.textures++),H){U.__webglFramebuffer=[];for(let fe=0;fe<6;fe++)if(v.mipmaps&&v.mipmaps.length>0){U.__webglFramebuffer[fe]=[];for(let we=0;we<v.mipmaps.length;we++)U.__webglFramebuffer[fe][we]=i.createFramebuffer()}else U.__webglFramebuffer[fe]=i.createFramebuffer()}else{if(v.mipmaps&&v.mipmaps.length>0){U.__webglFramebuffer=[];for(let fe=0;fe<v.mipmaps.length;fe++)U.__webglFramebuffer[fe]=i.createFramebuffer()}else U.__webglFramebuffer=i.createFramebuffer();if(be)for(let fe=0,we=Y.length;fe<we;fe++){const Ee=n.get(Y[fe]);Ee.__webglTexture===void 0&&(Ee.__webglTexture=i.createTexture(),o.memory.textures++)}if(E.samples>0&&F(E)===!1){U.__webglMultisampledFramebuffer=i.createFramebuffer(),U.__webglColorRenderbuffer=[],t.bindFramebuffer(i.FRAMEBUFFER,U.__webglMultisampledFramebuffer);for(let fe=0;fe<Y.length;fe++){const we=Y[fe];U.__webglColorRenderbuffer[fe]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,U.__webglColorRenderbuffer[fe]);const Ee=s.convert(we.format,we.colorSpace),he=s.convert(we.type),Ce=S(we.internalFormat,Ee,he,we.colorSpace,E.isXRRenderTarget===!0),We=xe(E);i.renderbufferStorageMultisample(i.RENDERBUFFER,We,Ce,E.width,E.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+fe,i.RENDERBUFFER,U.__webglColorRenderbuffer[fe])}i.bindRenderbuffer(i.RENDERBUFFER,null),E.depthBuffer&&(U.__webglDepthRenderbuffer=i.createRenderbuffer(),Te(U.__webglDepthRenderbuffer,E,!0)),t.bindFramebuffer(i.FRAMEBUFFER,null)}}if(H){t.bindTexture(i.TEXTURE_CUBE_MAP,G.__webglTexture),ce(i.TEXTURE_CUBE_MAP,v);for(let fe=0;fe<6;fe++)if(v.mipmaps&&v.mipmaps.length>0)for(let we=0;we<v.mipmaps.length;we++)Me(U.__webglFramebuffer[fe][we],E,v,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+fe,we);else Me(U.__webglFramebuffer[fe],E,v,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+fe,0);m(v)&&p(i.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(be){for(let fe=0,we=Y.length;fe<we;fe++){const Ee=Y[fe],he=n.get(Ee);let Ce=i.TEXTURE_2D;(E.isWebGL3DRenderTarget||E.isWebGLArrayRenderTarget)&&(Ce=E.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(Ce,he.__webglTexture),ce(Ce,Ee),Me(U.__webglFramebuffer,E,Ee,i.COLOR_ATTACHMENT0+fe,Ce,0),m(Ee)&&p(Ce)}t.unbindTexture()}else{let fe=i.TEXTURE_2D;if((E.isWebGL3DRenderTarget||E.isWebGLArrayRenderTarget)&&(fe=E.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(fe,G.__webglTexture),ce(fe,v),v.mipmaps&&v.mipmaps.length>0)for(let we=0;we<v.mipmaps.length;we++)Me(U.__webglFramebuffer[we],E,v,i.COLOR_ATTACHMENT0,fe,we);else Me(U.__webglFramebuffer,E,v,i.COLOR_ATTACHMENT0,fe,0);m(v)&&p(fe),t.unbindTexture()}E.depthBuffer&&Xe(E)}function le(E){const v=E.textures;for(let U=0,G=v.length;U<G;U++){const Y=v[U];if(m(Y)){const H=M(E),be=n.get(Y).__webglTexture;t.bindTexture(H,be),p(H),t.unbindTexture()}}}const re=[],ie=[];function te(E){if(E.samples>0){if(F(E)===!1){const v=E.textures,U=E.width,G=E.height;let Y=i.COLOR_BUFFER_BIT;const H=E.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,be=n.get(E),fe=v.length>1;if(fe)for(let Ee=0;Ee<v.length;Ee++)t.bindFramebuffer(i.FRAMEBUFFER,be.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+Ee,i.RENDERBUFFER,null),t.bindFramebuffer(i.FRAMEBUFFER,be.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+Ee,i.TEXTURE_2D,null,0);t.bindFramebuffer(i.READ_FRAMEBUFFER,be.__webglMultisampledFramebuffer);const we=E.texture.mipmaps;we&&we.length>0?t.bindFramebuffer(i.DRAW_FRAMEBUFFER,be.__webglFramebuffer[0]):t.bindFramebuffer(i.DRAW_FRAMEBUFFER,be.__webglFramebuffer);for(let Ee=0;Ee<v.length;Ee++){if(E.resolveDepthBuffer&&(E.depthBuffer&&(Y|=i.DEPTH_BUFFER_BIT),E.stencilBuffer&&E.resolveStencilBuffer&&(Y|=i.STENCIL_BUFFER_BIT)),fe){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,be.__webglColorRenderbuffer[Ee]);const he=n.get(v[Ee]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,he,0)}i.blitFramebuffer(0,0,U,G,0,0,U,G,Y,i.NEAREST),l===!0&&(re.length=0,ie.length=0,re.push(i.COLOR_ATTACHMENT0+Ee),E.depthBuffer&&E.resolveDepthBuffer===!1&&(re.push(H),ie.push(H),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,ie)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,re))}if(t.bindFramebuffer(i.READ_FRAMEBUFFER,null),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),fe)for(let Ee=0;Ee<v.length;Ee++){t.bindFramebuffer(i.FRAMEBUFFER,be.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+Ee,i.RENDERBUFFER,be.__webglColorRenderbuffer[Ee]);const he=n.get(v[Ee]).__webglTexture;t.bindFramebuffer(i.FRAMEBUFFER,be.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+Ee,i.TEXTURE_2D,he,0)}t.bindFramebuffer(i.DRAW_FRAMEBUFFER,be.__webglMultisampledFramebuffer)}else if(E.depthBuffer&&E.resolveDepthBuffer===!1&&l){const v=E.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[v])}}}function xe(E){return Math.min(r.maxSamples,E.samples)}function F(E){const v=n.get(E);return E.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&v.__useRenderToTexture!==!1}function Q(E){const v=o.render.frame;u.get(E)!==v&&(u.set(E,v),E.update())}function me(E,v){const U=E.colorSpace,G=E.format,Y=E.type;return E.isCompressedTexture===!0||E.isVideoTexture===!0||U!==zt&&U!==wi&&(ot.getTransfer(U)===_t?(G!==yn||Y!==In)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",U)),v}function de(E){return typeof HTMLImageElement<"u"&&E instanceof HTMLImageElement?(c.width=E.naturalWidth||E.width,c.height=E.naturalHeight||E.height):typeof VideoFrame<"u"&&E instanceof VideoFrame?(c.width=E.displayWidth,c.height=E.displayHeight):(c.width=E.width,c.height=E.height),c}this.allocateTextureUnit=W,this.resetTextureUnits=k,this.setTexture2D=q,this.setTexture2DArray=z,this.setTexture3D=oe,this.setTextureCube=V,this.rebindTextures=it,this.setupRenderTarget=P,this.updateRenderTargetMipmap=le,this.updateMultisampleRenderTarget=te,this.setupDepthRenderbuffer=Xe,this.setupFrameBufferTexture=Me,this.useMultisampledRTT=F}function _y(i,e){function t(n,r=wi){let s;const o=ot.getTransfer(r);if(n===In)return i.UNSIGNED_BYTE;if(n===Mc)return i.UNSIGNED_SHORT_4_4_4_4;if(n===bc)return i.UNSIGNED_SHORT_5_5_5_1;if(n===hh)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===fh)return i.UNSIGNED_INT_10F_11F_11F_REV;if(n===uh)return i.BYTE;if(n===dh)return i.SHORT;if(n===Ns)return i.UNSIGNED_SHORT;if(n===Sc)return i.INT;if(n===er)return i.UNSIGNED_INT;if(n===Rn)return i.FLOAT;if(n===Jr)return i.HALF_FLOAT;if(n===ph)return i.ALPHA;if(n===mh)return i.RGB;if(n===yn)return i.RGBA;if(n===Us)return i.DEPTH_COMPONENT;if(n===Os)return i.DEPTH_STENCIL;if(n===wc)return i.RED;if(n===Ec)return i.RED_INTEGER;if(n===gh)return i.RG;if(n===Tc)return i.RG_INTEGER;if(n===Ac)return i.RGBA_INTEGER;if(n===zo||n===Ho||n===Vo||n===Go)if(o===_t)if(s=e.get("WEBGL_compressed_texture_s3tc_srgb"),s!==null){if(n===zo)return s.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===Ho)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===Vo)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===Go)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(s=e.get("WEBGL_compressed_texture_s3tc"),s!==null){if(n===zo)return s.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===Ho)return s.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===Vo)return s.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===Go)return s.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===yl||n===Sl||n===Ml||n===bl)if(s=e.get("WEBGL_compressed_texture_pvrtc"),s!==null){if(n===yl)return s.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===Sl)return s.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===Ml)return s.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===bl)return s.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===wl||n===El||n===Tl)if(s=e.get("WEBGL_compressed_texture_etc"),s!==null){if(n===wl||n===El)return o===_t?s.COMPRESSED_SRGB8_ETC2:s.COMPRESSED_RGB8_ETC2;if(n===Tl)return o===_t?s.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:s.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(n===Al||n===Cl||n===Rl||n===Ll||n===Pl||n===Il||n===Nl||n===Dl||n===Ul||n===Ol||n===Fl||n===kl||n===Bl||n===zl)if(s=e.get("WEBGL_compressed_texture_astc"),s!==null){if(n===Al)return o===_t?s.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:s.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===Cl)return o===_t?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:s.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===Rl)return o===_t?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:s.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===Ll)return o===_t?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:s.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===Pl)return o===_t?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:s.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===Il)return o===_t?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:s.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===Nl)return o===_t?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:s.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===Dl)return o===_t?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:s.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===Ul)return o===_t?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:s.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===Ol)return o===_t?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:s.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===Fl)return o===_t?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:s.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===kl)return o===_t?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:s.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===Bl)return o===_t?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:s.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===zl)return o===_t?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:s.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===Hl||n===Vl||n===Gl)if(s=e.get("EXT_texture_compression_bptc"),s!==null){if(n===Hl)return o===_t?s.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:s.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===Vl)return s.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===Gl)return s.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===Wl||n===Xl||n===ql||n===Kl)if(s=e.get("EXT_texture_compression_rgtc"),s!==null){if(n===Wl)return s.COMPRESSED_RED_RGTC1_EXT;if(n===Xl)return s.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===ql)return s.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===Kl)return s.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===Ds?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:t}}const vy=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,xy=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class yy{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){const n=new Oh(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){const t=e.cameras[0].viewport,n=new Un({vertexShader:vy,fragmentShader:xy,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new kt(new qr(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class Sy extends Zr{constructor(e,t){super();const n=this;let r=null,s=1,o=null,a="local-floor",l=1,c=null,u=null,d=null,h=null,f=null,g=null;const _=typeof XRWebGLBinding<"u",m=new yy,p={},M=t.getContextAttributes();let S=null,x=null;const A=[],C=[],R=new _e;let N=null;const w=new Jt;w.viewport=new ut;const y=new Jt;y.viewport=new ut;const L=[w,y],k=new Ng;let W=null,X=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(Z){let ee=A[Z];return ee===void 0&&(ee=new Ua,A[Z]=ee),ee.getTargetRaySpace()},this.getControllerGrip=function(Z){let ee=A[Z];return ee===void 0&&(ee=new Ua,A[Z]=ee),ee.getGripSpace()},this.getHand=function(Z){let ee=A[Z];return ee===void 0&&(ee=new Ua,A[Z]=ee),ee.getHandSpace()};function q(Z){const ee=C.indexOf(Z.inputSource);if(ee===-1)return;const Me=A[ee];Me!==void 0&&(Me.update(Z.inputSource,Z.frame,c||o),Me.dispatchEvent({type:Z.type,data:Z.inputSource}))}function z(){r.removeEventListener("select",q),r.removeEventListener("selectstart",q),r.removeEventListener("selectend",q),r.removeEventListener("squeeze",q),r.removeEventListener("squeezestart",q),r.removeEventListener("squeezeend",q),r.removeEventListener("end",z),r.removeEventListener("inputsourceschange",oe);for(let Z=0;Z<A.length;Z++){const ee=C[Z];ee!==null&&(C[Z]=null,A[Z].disconnect(ee))}W=null,X=null,m.reset();for(const Z in p)delete p[Z];e.setRenderTarget(S),f=null,h=null,d=null,r=null,x=null,Ue.stop(),n.isPresenting=!1,e.setPixelRatio(N),e.setSize(R.width,R.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(Z){s=Z,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(Z){a=Z,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||o},this.setReferenceSpace=function(Z){c=Z},this.getBaseLayer=function(){return h!==null?h:f},this.getBinding=function(){return d===null&&_&&(d=new XRWebGLBinding(r,t)),d},this.getFrame=function(){return g},this.getSession=function(){return r},this.setSession=async function(Z){if(r=Z,r!==null){if(S=e.getRenderTarget(),r.addEventListener("select",q),r.addEventListener("selectstart",q),r.addEventListener("selectend",q),r.addEventListener("squeeze",q),r.addEventListener("squeezestart",q),r.addEventListener("squeezeend",q),r.addEventListener("end",z),r.addEventListener("inputsourceschange",oe),M.xrCompatible!==!0&&await t.makeXRCompatible(),N=e.getPixelRatio(),e.getSize(R),_&&"createProjectionLayer"in XRWebGLBinding.prototype){let Me=null,Te=null,Ae=null;M.depth&&(Ae=M.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,Me=M.stencil?Os:Us,Te=M.stencil?Ds:er);const Xe={colorFormat:t.RGBA8,depthFormat:Ae,scaleFactor:s};d=this.getBinding(),h=d.createProjectionLayer(Xe),r.updateRenderState({layers:[h]}),e.setPixelRatio(1),e.setSize(h.textureWidth,h.textureHeight,!1),x=new di(h.textureWidth,h.textureHeight,{format:yn,type:In,depthTexture:new Uh(h.textureWidth,h.textureHeight,Te,void 0,void 0,void 0,void 0,void 0,void 0,Me),stencilBuffer:M.stencil,colorSpace:e.outputColorSpace,samples:M.antialias?4:0,resolveDepthBuffer:h.ignoreDepthValues===!1,resolveStencilBuffer:h.ignoreDepthValues===!1})}else{const Me={antialias:M.antialias,alpha:!0,depth:M.depth,stencil:M.stencil,framebufferScaleFactor:s};f=new XRWebGLLayer(r,t,Me),r.updateRenderState({baseLayer:f}),e.setPixelRatio(1),e.setSize(f.framebufferWidth,f.framebufferHeight,!1),x=new di(f.framebufferWidth,f.framebufferHeight,{format:yn,type:In,colorSpace:e.outputColorSpace,stencilBuffer:M.stencil,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1})}x.isXRRenderTarget=!0,this.setFoveation(l),c=null,o=await r.requestReferenceSpace(a),Ue.setContext(r),Ue.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode},this.getDepthTexture=function(){return m.getDepthTexture()};function oe(Z){for(let ee=0;ee<Z.removed.length;ee++){const Me=Z.removed[ee],Te=C.indexOf(Me);Te>=0&&(C[Te]=null,A[Te].disconnect(Me))}for(let ee=0;ee<Z.added.length;ee++){const Me=Z.added[ee];let Te=C.indexOf(Me);if(Te===-1){for(let Xe=0;Xe<A.length;Xe++)if(Xe>=C.length){C.push(Me),Te=Xe;break}else if(C[Xe]===null){C[Xe]=Me,Te=Xe;break}if(Te===-1)break}const Ae=A[Te];Ae&&Ae.connect(Me)}}const V=new I,pe=new I;function K(Z,ee,Me){V.setFromMatrixPosition(ee.matrixWorld),pe.setFromMatrixPosition(Me.matrixWorld);const Te=V.distanceTo(pe),Ae=ee.projectionMatrix.elements,Xe=Me.projectionMatrix.elements,it=Ae[14]/(Ae[10]-1),P=Ae[14]/(Ae[10]+1),le=(Ae[9]+1)/Ae[5],re=(Ae[9]-1)/Ae[5],ie=(Ae[8]-1)/Ae[0],te=(Xe[8]+1)/Xe[0],xe=it*ie,F=it*te,Q=Te/(-ie+te),me=Q*-ie;if(ee.matrixWorld.decompose(Z.position,Z.quaternion,Z.scale),Z.translateX(me),Z.translateZ(Q),Z.matrixWorld.compose(Z.position,Z.quaternion,Z.scale),Z.matrixWorldInverse.copy(Z.matrixWorld).invert(),Ae[10]===-1)Z.projectionMatrix.copy(ee.projectionMatrix),Z.projectionMatrixInverse.copy(ee.projectionMatrixInverse);else{const de=it+Q,E=P+Q,v=xe-me,U=F+(Te-me),G=le*P/E*de,Y=re*P/E*de;Z.projectionMatrix.makePerspective(v,U,G,Y,de,E),Z.projectionMatrixInverse.copy(Z.projectionMatrix).invert()}}function ne(Z,ee){ee===null?Z.matrixWorld.copy(Z.matrix):Z.matrixWorld.multiplyMatrices(ee.matrixWorld,Z.matrix),Z.matrixWorldInverse.copy(Z.matrixWorld).invert()}this.updateCamera=function(Z){if(r===null)return;let ee=Z.near,Me=Z.far;m.texture!==null&&(m.depthNear>0&&(ee=m.depthNear),m.depthFar>0&&(Me=m.depthFar)),k.near=y.near=w.near=ee,k.far=y.far=w.far=Me,(W!==k.near||X!==k.far)&&(r.updateRenderState({depthNear:k.near,depthFar:k.far}),W=k.near,X=k.far),k.layers.mask=Z.layers.mask|6,w.layers.mask=k.layers.mask&3,y.layers.mask=k.layers.mask&5;const Te=Z.parent,Ae=k.cameras;ne(k,Te);for(let Xe=0;Xe<Ae.length;Xe++)ne(Ae[Xe],Te);Ae.length===2?K(k,w,y):k.projectionMatrix.copy(w.projectionMatrix),ce(Z,k,Te)};function ce(Z,ee,Me){Me===null?Z.matrix.copy(ee.matrixWorld):(Z.matrix.copy(Me.matrixWorld),Z.matrix.invert(),Z.matrix.multiply(ee.matrixWorld)),Z.matrix.decompose(Z.position,Z.quaternion,Z.scale),Z.updateMatrixWorld(!0),Z.projectionMatrix.copy(ee.projectionMatrix),Z.projectionMatrixInverse.copy(ee.projectionMatrixInverse),Z.isPerspectiveCamera&&(Z.fov=Gr*2*Math.atan(1/Z.projectionMatrix.elements[5]),Z.zoom=1)}this.getCamera=function(){return k},this.getFoveation=function(){if(!(h===null&&f===null))return l},this.setFoveation=function(Z){l=Z,h!==null&&(h.fixedFoveation=Z),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=Z)},this.hasDepthSensing=function(){return m.texture!==null},this.getDepthSensingMesh=function(){return m.getMesh(k)},this.getCameraTexture=function(Z){return p[Z]};let ae=null;function ye(Z,ee){if(u=ee.getViewerPose(c||o),g=ee,u!==null){const Me=u.views;f!==null&&(e.setRenderTargetFramebuffer(x,f.framebuffer),e.setRenderTarget(x));let Te=!1;Me.length!==k.cameras.length&&(k.cameras.length=0,Te=!0);for(let P=0;P<Me.length;P++){const le=Me[P];let re=null;if(f!==null)re=f.getViewport(le);else{const te=d.getViewSubImage(h,le);re=te.viewport,P===0&&(e.setRenderTargetTextures(x,te.colorTexture,te.depthStencilTexture),e.setRenderTarget(x))}let ie=L[P];ie===void 0&&(ie=new Jt,ie.layers.enable(P),ie.viewport=new ut,L[P]=ie),ie.matrix.fromArray(le.transform.matrix),ie.matrix.decompose(ie.position,ie.quaternion,ie.scale),ie.projectionMatrix.fromArray(le.projectionMatrix),ie.projectionMatrixInverse.copy(ie.projectionMatrix).invert(),ie.viewport.set(re.x,re.y,re.width,re.height),P===0&&(k.matrix.copy(ie.matrix),k.matrix.decompose(k.position,k.quaternion,k.scale)),Te===!0&&k.cameras.push(ie)}const Ae=r.enabledFeatures;if(Ae&&Ae.includes("depth-sensing")&&r.depthUsage=="gpu-optimized"&&_){d=n.getBinding();const P=d.getDepthInformation(Me[0]);P&&P.isValid&&P.texture&&m.init(P,r.renderState)}if(Ae&&Ae.includes("camera-access")&&_){e.state.unbindTexture(),d=n.getBinding();for(let P=0;P<Me.length;P++){const le=Me[P].camera;if(le){let re=p[le];re||(re=new Oh,p[le]=re);const ie=d.getCameraImage(le);re.sourceTexture=ie}}}}for(let Me=0;Me<A.length;Me++){const Te=C[Me],Ae=A[Me];Te!==null&&Ae!==void 0&&Ae.update(Te,ee,c||o)}ae&&ae(Z,ee),ee.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:ee}),g=null}const Ue=new Jh;Ue.setAnimationLoop(ye),this.setAnimationLoop=function(Z){ae=Z},this.dispose=function(){}}}const Vi=new Dn,My=new $e;function by(i,e){function t(m,p){m.matrixAutoUpdate===!0&&m.updateMatrix(),p.value.copy(m.matrix)}function n(m,p){p.color.getRGB(m.fogColor.value,Th(i)),p.isFog?(m.fogNear.value=p.near,m.fogFar.value=p.far):p.isFogExp2&&(m.fogDensity.value=p.density)}function r(m,p,M,S,x){p.isMeshBasicMaterial||p.isMeshLambertMaterial?s(m,p):p.isMeshToonMaterial?(s(m,p),d(m,p)):p.isMeshPhongMaterial?(s(m,p),u(m,p)):p.isMeshStandardMaterial?(s(m,p),h(m,p),p.isMeshPhysicalMaterial&&f(m,p,x)):p.isMeshMatcapMaterial?(s(m,p),g(m,p)):p.isMeshDepthMaterial?s(m,p):p.isMeshDistanceMaterial?(s(m,p),_(m,p)):p.isMeshNormalMaterial?s(m,p):p.isLineBasicMaterial?(o(m,p),p.isLineDashedMaterial&&a(m,p)):p.isPointsMaterial?l(m,p,M,S):p.isSpriteMaterial?c(m,p):p.isShadowMaterial?(m.color.value.copy(p.color),m.opacity.value=p.opacity):p.isShaderMaterial&&(p.uniformsNeedUpdate=!1)}function s(m,p){m.opacity.value=p.opacity,p.color&&m.diffuse.value.copy(p.color),p.emissive&&m.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity),p.map&&(m.map.value=p.map,t(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.bumpMap&&(m.bumpMap.value=p.bumpMap,t(p.bumpMap,m.bumpMapTransform),m.bumpScale.value=p.bumpScale,p.side===tn&&(m.bumpScale.value*=-1)),p.normalMap&&(m.normalMap.value=p.normalMap,t(p.normalMap,m.normalMapTransform),m.normalScale.value.copy(p.normalScale),p.side===tn&&m.normalScale.value.negate()),p.displacementMap&&(m.displacementMap.value=p.displacementMap,t(p.displacementMap,m.displacementMapTransform),m.displacementScale.value=p.displacementScale,m.displacementBias.value=p.displacementBias),p.emissiveMap&&(m.emissiveMap.value=p.emissiveMap,t(p.emissiveMap,m.emissiveMapTransform)),p.specularMap&&(m.specularMap.value=p.specularMap,t(p.specularMap,m.specularMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest);const M=e.get(p),S=M.envMap,x=M.envMapRotation;S&&(m.envMap.value=S,Vi.copy(x),Vi.x*=-1,Vi.y*=-1,Vi.z*=-1,S.isCubeTexture&&S.isRenderTargetTexture===!1&&(Vi.y*=-1,Vi.z*=-1),m.envMapRotation.value.setFromMatrix4(My.makeRotationFromEuler(Vi)),m.flipEnvMap.value=S.isCubeTexture&&S.isRenderTargetTexture===!1?-1:1,m.reflectivity.value=p.reflectivity,m.ior.value=p.ior,m.refractionRatio.value=p.refractionRatio),p.lightMap&&(m.lightMap.value=p.lightMap,m.lightMapIntensity.value=p.lightMapIntensity,t(p.lightMap,m.lightMapTransform)),p.aoMap&&(m.aoMap.value=p.aoMap,m.aoMapIntensity.value=p.aoMapIntensity,t(p.aoMap,m.aoMapTransform))}function o(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,p.map&&(m.map.value=p.map,t(p.map,m.mapTransform))}function a(m,p){m.dashSize.value=p.dashSize,m.totalSize.value=p.dashSize+p.gapSize,m.scale.value=p.scale}function l(m,p,M,S){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.size.value=p.size*M,m.scale.value=S*.5,p.map&&(m.map.value=p.map,t(p.map,m.uvTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function c(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.rotation.value=p.rotation,p.map&&(m.map.value=p.map,t(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function u(m,p){m.specular.value.copy(p.specular),m.shininess.value=Math.max(p.shininess,1e-4)}function d(m,p){p.gradientMap&&(m.gradientMap.value=p.gradientMap)}function h(m,p){m.metalness.value=p.metalness,p.metalnessMap&&(m.metalnessMap.value=p.metalnessMap,t(p.metalnessMap,m.metalnessMapTransform)),m.roughness.value=p.roughness,p.roughnessMap&&(m.roughnessMap.value=p.roughnessMap,t(p.roughnessMap,m.roughnessMapTransform)),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)}function f(m,p,M){m.ior.value=p.ior,p.sheen>0&&(m.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen),m.sheenRoughness.value=p.sheenRoughness,p.sheenColorMap&&(m.sheenColorMap.value=p.sheenColorMap,t(p.sheenColorMap,m.sheenColorMapTransform)),p.sheenRoughnessMap&&(m.sheenRoughnessMap.value=p.sheenRoughnessMap,t(p.sheenRoughnessMap,m.sheenRoughnessMapTransform))),p.clearcoat>0&&(m.clearcoat.value=p.clearcoat,m.clearcoatRoughness.value=p.clearcoatRoughness,p.clearcoatMap&&(m.clearcoatMap.value=p.clearcoatMap,t(p.clearcoatMap,m.clearcoatMapTransform)),p.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap,t(p.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),p.clearcoatNormalMap&&(m.clearcoatNormalMap.value=p.clearcoatNormalMap,t(p.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),p.side===tn&&m.clearcoatNormalScale.value.negate())),p.dispersion>0&&(m.dispersion.value=p.dispersion),p.iridescence>0&&(m.iridescence.value=p.iridescence,m.iridescenceIOR.value=p.iridescenceIOR,m.iridescenceThicknessMinimum.value=p.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=p.iridescenceThicknessRange[1],p.iridescenceMap&&(m.iridescenceMap.value=p.iridescenceMap,t(p.iridescenceMap,m.iridescenceMapTransform)),p.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=p.iridescenceThicknessMap,t(p.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),p.transmission>0&&(m.transmission.value=p.transmission,m.transmissionSamplerMap.value=M.texture,m.transmissionSamplerSize.value.set(M.width,M.height),p.transmissionMap&&(m.transmissionMap.value=p.transmissionMap,t(p.transmissionMap,m.transmissionMapTransform)),m.thickness.value=p.thickness,p.thicknessMap&&(m.thicknessMap.value=p.thicknessMap,t(p.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=p.attenuationDistance,m.attenuationColor.value.copy(p.attenuationColor)),p.anisotropy>0&&(m.anisotropyVector.value.set(p.anisotropy*Math.cos(p.anisotropyRotation),p.anisotropy*Math.sin(p.anisotropyRotation)),p.anisotropyMap&&(m.anisotropyMap.value=p.anisotropyMap,t(p.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=p.specularIntensity,m.specularColor.value.copy(p.specularColor),p.specularColorMap&&(m.specularColorMap.value=p.specularColorMap,t(p.specularColorMap,m.specularColorMapTransform)),p.specularIntensityMap&&(m.specularIntensityMap.value=p.specularIntensityMap,t(p.specularIntensityMap,m.specularIntensityMapTransform))}function g(m,p){p.matcap&&(m.matcap.value=p.matcap)}function _(m,p){const M=e.get(p).light;m.referencePosition.value.setFromMatrixPosition(M.matrixWorld),m.nearDistance.value=M.shadow.camera.near,m.farDistance.value=M.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:r}}function wy(i,e,t,n){let r={},s={},o=[];const a=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function l(M,S){const x=S.program;n.uniformBlockBinding(M,x)}function c(M,S){let x=r[M.id];x===void 0&&(g(M),x=u(M),r[M.id]=x,M.addEventListener("dispose",m));const A=S.program;n.updateUBOMapping(M,A);const C=e.render.frame;s[M.id]!==C&&(h(M),s[M.id]=C)}function u(M){const S=d();M.__bindingPointIndex=S;const x=i.createBuffer(),A=M.__size,C=M.usage;return i.bindBuffer(i.UNIFORM_BUFFER,x),i.bufferData(i.UNIFORM_BUFFER,A,C),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,S,x),x}function d(){for(let M=0;M<a;M++)if(o.indexOf(M)===-1)return o.push(M),M;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function h(M){const S=r[M.id],x=M.uniforms,A=M.__cache;i.bindBuffer(i.UNIFORM_BUFFER,S);for(let C=0,R=x.length;C<R;C++){const N=Array.isArray(x[C])?x[C]:[x[C]];for(let w=0,y=N.length;w<y;w++){const L=N[w];if(f(L,C,w,A)===!0){const k=L.__offset,W=Array.isArray(L.value)?L.value:[L.value];let X=0;for(let q=0;q<W.length;q++){const z=W[q],oe=_(z);typeof z=="number"||typeof z=="boolean"?(L.__data[0]=z,i.bufferSubData(i.UNIFORM_BUFFER,k+X,L.__data)):z.isMatrix3?(L.__data[0]=z.elements[0],L.__data[1]=z.elements[1],L.__data[2]=z.elements[2],L.__data[3]=0,L.__data[4]=z.elements[3],L.__data[5]=z.elements[4],L.__data[6]=z.elements[5],L.__data[7]=0,L.__data[8]=z.elements[6],L.__data[9]=z.elements[7],L.__data[10]=z.elements[8],L.__data[11]=0):(z.toArray(L.__data,X),X+=oe.storage/Float32Array.BYTES_PER_ELEMENT)}i.bufferSubData(i.UNIFORM_BUFFER,k,L.__data)}}}i.bindBuffer(i.UNIFORM_BUFFER,null)}function f(M,S,x,A){const C=M.value,R=S+"_"+x;if(A[R]===void 0)return typeof C=="number"||typeof C=="boolean"?A[R]=C:A[R]=C.clone(),!0;{const N=A[R];if(typeof C=="number"||typeof C=="boolean"){if(N!==C)return A[R]=C,!0}else if(N.equals(C)===!1)return N.copy(C),!0}return!1}function g(M){const S=M.uniforms;let x=0;const A=16;for(let R=0,N=S.length;R<N;R++){const w=Array.isArray(S[R])?S[R]:[S[R]];for(let y=0,L=w.length;y<L;y++){const k=w[y],W=Array.isArray(k.value)?k.value:[k.value];for(let X=0,q=W.length;X<q;X++){const z=W[X],oe=_(z),V=x%A,pe=V%oe.boundary,K=V+pe;x+=pe,K!==0&&A-K<oe.storage&&(x+=A-K),k.__data=new Float32Array(oe.storage/Float32Array.BYTES_PER_ELEMENT),k.__offset=x,x+=oe.storage}}}const C=x%A;return C>0&&(x+=A-C),M.__size=x,M.__cache={},this}function _(M){const S={boundary:0,storage:0};return typeof M=="number"||typeof M=="boolean"?(S.boundary=4,S.storage=4):M.isVector2?(S.boundary=8,S.storage=8):M.isVector3||M.isColor?(S.boundary=16,S.storage=12):M.isVector4?(S.boundary=16,S.storage=16):M.isMatrix3?(S.boundary=48,S.storage=48):M.isMatrix4?(S.boundary=64,S.storage=64):M.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",M),S}function m(M){const S=M.target;S.removeEventListener("dispose",m);const x=o.indexOf(S.__bindingPointIndex);o.splice(x,1),i.deleteBuffer(r[S.id]),delete r[S.id],delete s[S.id]}function p(){for(const M in r)i.deleteBuffer(r[M]);o=[],r={},s={}}return{bind:l,update:c,dispose:p}}class Ey{constructor(e={}){const{canvas:t=Zp(),context:n=null,depth:r=!0,stencil:s=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:u="default",failIfMajorPerformanceCaveat:d=!1,reversedDepthBuffer:h=!1}=e;this.isWebGLRenderer=!0;let f;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");f=n.getContextAttributes().alpha}else f=o;const g=new Uint32Array(4),_=new Int32Array(4);let m=null,p=null;const M=[],S=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Wn,this.toneMappingExposure=1,this.transmissionResolutionScale=1;const x=this;let A=!1;this._outputColorSpace=Ut;let C=0,R=0,N=null,w=-1,y=null;const L=new ut,k=new ut;let W=null;const X=new Ge(0);let q=0,z=t.width,oe=t.height,V=1,pe=null,K=null;const ne=new ut(0,0,z,oe),ce=new ut(0,0,z,oe);let ae=!1;const ye=new Ic;let Ue=!1,Z=!1;const ee=new $e,Me=new I,Te=new ut,Ae={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let Xe=!1;function it(){return N===null?V:1}let P=n;function le(b,O){return t.getContext(b,O)}try{const b={alpha:!0,depth:r,stencil:s,antialias:a,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:u,failIfMajorPerformanceCaveat:d};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${yc}`),t.addEventListener("webglcontextlost",Se,!1),t.addEventListener("webglcontextrestored",Ie,!1),t.addEventListener("webglcontextcreationerror",ue,!1),P===null){const O="webgl2";if(P=le(O,b),P===null)throw le(O)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(b){throw console.error("THREE.WebGLRenderer: "+b.message),b}let re,ie,te,xe,F,Q,me,de,E,v,U,G,Y,H,be,fe,we,Ee,he,Ce,We,ke,Re,Ze;function D(){re=new Uv(P),re.init(),ke=new _y(P,re),ie=new Cv(P,re,e,ke),te=new my(P,re),ie.reversedDepthBuffer&&h&&te.buffers.depth.setReversed(!0),xe=new kv(P),F=new ny,Q=new gy(P,re,te,F,ie,ke,xe),me=new Lv(x),de=new Dv(x),E=new Wg(P),Re=new Tv(P,E),v=new Ov(P,E,xe,Re),U=new zv(P,v,E,xe),he=new Bv(P,ie,Q),fe=new Rv(F),G=new ty(x,me,de,re,ie,Re,fe),Y=new by(x,F),H=new ry,be=new uy(re),Ee=new Ev(x,me,de,te,U,f,l),we=new fy(x,U,ie),Ze=new wy(P,xe,ie,te),Ce=new Av(P,re,xe),We=new Fv(P,re,xe),xe.programs=G.programs,x.capabilities=ie,x.extensions=re,x.properties=F,x.renderLists=H,x.shadowMap=we,x.state=te,x.info=xe}D();const ge=new Sy(x,P);this.xr=ge,this.getContext=function(){return P},this.getContextAttributes=function(){return P.getContextAttributes()},this.forceContextLoss=function(){const b=re.get("WEBGL_lose_context");b&&b.loseContext()},this.forceContextRestore=function(){const b=re.get("WEBGL_lose_context");b&&b.restoreContext()},this.getPixelRatio=function(){return V},this.setPixelRatio=function(b){b!==void 0&&(V=b,this.setSize(z,oe,!1))},this.getSize=function(b){return b.set(z,oe)},this.setSize=function(b,O,j=!0){if(ge.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}z=b,oe=O,t.width=Math.floor(b*V),t.height=Math.floor(O*V),j===!0&&(t.style.width=b+"px",t.style.height=O+"px"),this.setViewport(0,0,b,O)},this.getDrawingBufferSize=function(b){return b.set(z*V,oe*V).floor()},this.setDrawingBufferSize=function(b,O,j){z=b,oe=O,V=j,t.width=Math.floor(b*j),t.height=Math.floor(O*j),this.setViewport(0,0,b,O)},this.getCurrentViewport=function(b){return b.copy(L)},this.getViewport=function(b){return b.copy(ne)},this.setViewport=function(b,O,j,J){b.isVector4?ne.set(b.x,b.y,b.z,b.w):ne.set(b,O,j,J),te.viewport(L.copy(ne).multiplyScalar(V).round())},this.getScissor=function(b){return b.copy(ce)},this.setScissor=function(b,O,j,J){b.isVector4?ce.set(b.x,b.y,b.z,b.w):ce.set(b,O,j,J),te.scissor(k.copy(ce).multiplyScalar(V).round())},this.getScissorTest=function(){return ae},this.setScissorTest=function(b){te.setScissorTest(ae=b)},this.setOpaqueSort=function(b){pe=b},this.setTransparentSort=function(b){K=b},this.getClearColor=function(b){return b.copy(Ee.getClearColor())},this.setClearColor=function(){Ee.setClearColor(...arguments)},this.getClearAlpha=function(){return Ee.getClearAlpha()},this.setClearAlpha=function(){Ee.setClearAlpha(...arguments)},this.clear=function(b=!0,O=!0,j=!0){let J=0;if(b){let B=!1;if(N!==null){const ve=N.texture.format;B=ve===Ac||ve===Tc||ve===Ec}if(B){const ve=N.texture.type,Pe=ve===In||ve===er||ve===Ns||ve===Ds||ve===Mc||ve===bc,Be=Ee.getClearColor(),De=Ee.getClearAlpha(),Ke=Be.r,Ye=Be.g,He=Be.b;Pe?(g[0]=Ke,g[1]=Ye,g[2]=He,g[3]=De,P.clearBufferuiv(P.COLOR,0,g)):(_[0]=Ke,_[1]=Ye,_[2]=He,_[3]=De,P.clearBufferiv(P.COLOR,0,_))}else J|=P.COLOR_BUFFER_BIT}O&&(J|=P.DEPTH_BUFFER_BIT),j&&(J|=P.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),P.clear(J)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",Se,!1),t.removeEventListener("webglcontextrestored",Ie,!1),t.removeEventListener("webglcontextcreationerror",ue,!1),Ee.dispose(),H.dispose(),be.dispose(),F.dispose(),me.dispose(),de.dispose(),U.dispose(),Re.dispose(),Ze.dispose(),G.dispose(),ge.dispose(),ge.removeEventListener("sessionstart",qe),ge.removeEventListener("sessionend",mt),Et.stop()};function Se(b){b.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),A=!0}function Ie(){console.log("THREE.WebGLRenderer: Context Restored."),A=!1;const b=xe.autoReset,O=we.enabled,j=we.autoUpdate,J=we.needsUpdate,B=we.type;D(),xe.autoReset=b,we.enabled=O,we.autoUpdate=j,we.needsUpdate=J,we.type=B}function ue(b){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",b.statusMessage)}function se(b){const O=b.target;O.removeEventListener("dispose",se),Oe(O)}function Oe(b){je(b),F.remove(b)}function je(b){const O=F.get(b).programs;O!==void 0&&(O.forEach(function(j){G.releaseProgram(j)}),b.isShaderMaterial&&G.releaseShaderCache(b))}this.renderBufferDirect=function(b,O,j,J,B,ve){O===null&&(O=Ae);const Pe=B.isMesh&&B.matrixWorld.determinant()<0,Be=bt(b,O,j,J,B);te.setMaterial(J,Pe);let De=j.index,Ke=1;if(J.wireframe===!0){if(De=v.getWireframeAttribute(j),De===void 0)return;Ke=2}const Ye=j.drawRange,He=j.attributes.position;let st=Ye.start*Ke,gt=(Ye.start+Ye.count)*Ke;ve!==null&&(st=Math.max(st,ve.start*Ke),gt=Math.min(gt,(ve.start+ve.count)*Ke)),De!==null?(st=Math.max(st,0),gt=Math.min(gt,De.count)):He!=null&&(st=Math.max(st,0),gt=Math.min(gt,He.count));const Rt=gt-st;if(Rt<0||Rt===1/0)return;Re.setup(B,J,Be,j,De);let wt,xt=Ce;if(De!==null&&(wt=E.get(De),xt=We,xt.setIndex(wt)),B.isMesh)J.wireframe===!0?(te.setLineWidth(J.wireframeLinewidth*it()),xt.setMode(P.LINES)):xt.setMode(P.TRIANGLES);else if(B.isLine){let Ve=J.linewidth;Ve===void 0&&(Ve=1),te.setLineWidth(Ve*it()),B.isLineSegments?xt.setMode(P.LINES):B.isLineLoop?xt.setMode(P.LINE_LOOP):xt.setMode(P.LINE_STRIP)}else B.isPoints?xt.setMode(P.POINTS):B.isSprite&&xt.setMode(P.TRIANGLES);if(B.isBatchedMesh)if(B._multiDrawInstances!==null)zs("THREE.WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection."),xt.renderMultiDrawInstances(B._multiDrawStarts,B._multiDrawCounts,B._multiDrawCount,B._multiDrawInstances);else if(re.get("WEBGL_multi_draw"))xt.renderMultiDraw(B._multiDrawStarts,B._multiDrawCounts,B._multiDrawCount);else{const Ve=B._multiDrawStarts,Tt=B._multiDrawCounts,ct=B._multiDrawCount,cn=De?E.get(De).bytesPerElement:1,cr=F.get(J).currentProgram.getUniforms();for(let un=0;un<ct;un++)cr.setValue(P,"_gl_DrawID",un),xt.render(Ve[un]/cn,Tt[un])}else if(B.isInstancedMesh)xt.renderInstances(st,Rt,B.count);else if(j.isInstancedBufferGeometry){const Ve=j._maxInstanceCount!==void 0?j._maxInstanceCount:1/0,Tt=Math.min(j.instanceCount,Ve);xt.renderInstances(st,Rt,Tt)}else xt.render(st,Rt)};function ht(b,O,j){b.transparent===!0&&b.side===fn&&b.forceSinglePass===!1?(b.side=tn,b.needsUpdate=!0,Ui(b,O,j),b.side=Kn,b.needsUpdate=!0,Ui(b,O,j),b.side=fn):Ui(b,O,j)}this.compile=function(b,O,j=null){j===null&&(j=b),p=be.get(j),p.init(O),S.push(p),j.traverseVisible(function(B){B.isLight&&B.layers.test(O.layers)&&(p.pushLight(B),B.castShadow&&p.pushShadow(B))}),b!==j&&b.traverseVisible(function(B){B.isLight&&B.layers.test(O.layers)&&(p.pushLight(B),B.castShadow&&p.pushShadow(B))}),p.setupLights();const J=new Set;return b.traverse(function(B){if(!(B.isMesh||B.isPoints||B.isLine||B.isSprite))return;const ve=B.material;if(ve)if(Array.isArray(ve))for(let Pe=0;Pe<ve.length;Pe++){const Be=ve[Pe];ht(Be,j,B),J.add(Be)}else ht(ve,j,B),J.add(ve)}),p=S.pop(),J},this.compileAsync=function(b,O,j=null){const J=this.compile(b,O,j);return new Promise(B=>{function ve(){if(J.forEach(function(Pe){F.get(Pe).currentProgram.isReady()&&J.delete(Pe)}),J.size===0){B(b);return}setTimeout(ve,10)}re.get("KHR_parallel_shader_compile")!==null?ve():setTimeout(ve,10)})};let at=null;function Ne(b){at&&at(b)}function qe(){Et.stop()}function mt(){Et.start()}const Et=new Jh;Et.setAnimationLoop(Ne),typeof self<"u"&&Et.setContext(self),this.setAnimationLoop=function(b){at=b,ge.setAnimationLoop(b),b===null?Et.stop():Et.start()},ge.addEventListener("sessionstart",qe),ge.addEventListener("sessionend",mt),this.render=function(b,O){if(O!==void 0&&O.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(A===!0)return;if(b.matrixWorldAutoUpdate===!0&&b.updateMatrixWorld(),O.parent===null&&O.matrixWorldAutoUpdate===!0&&O.updateMatrixWorld(),ge.enabled===!0&&ge.isPresenting===!0&&(ge.cameraAutoUpdate===!0&&ge.updateCamera(O),O=ge.getCamera()),b.isScene===!0&&b.onBeforeRender(x,b,O,N),p=be.get(b,S.length),p.init(O),S.push(p),ee.multiplyMatrices(O.projectionMatrix,O.matrixWorldInverse),ye.setFromProjectionMatrix(ee,Gn,O.reversedDepth),Z=this.localClippingEnabled,Ue=fe.init(this.clippingPlanes,Z),m=H.get(b,M.length),m.init(),M.push(m),ge.enabled===!0&&ge.isPresenting===!0){const ve=x.xr.getDepthSensingMesh();ve!==null&&rn(ve,O,-1/0,x.sortObjects)}rn(b,O,0,x.sortObjects),m.finish(),x.sortObjects===!0&&m.sort(pe,K),Xe=ge.enabled===!1||ge.isPresenting===!1||ge.hasDepthSensing()===!1,Xe&&Ee.addToRenderList(m,b),this.info.render.frame++,Ue===!0&&fe.beginShadows();const j=p.state.shadowsArray;we.render(j,b,O),Ue===!0&&fe.endShadows(),this.info.autoReset===!0&&this.info.reset();const J=m.opaque,B=m.transmissive;if(p.setupLights(),O.isArrayCamera){const ve=O.cameras;if(B.length>0)for(let Pe=0,Be=ve.length;Pe<Be;Pe++){const De=ve[Pe];kn(J,B,b,De)}Xe&&Ee.render(b);for(let Pe=0,Be=ve.length;Pe<Be;Pe++){const De=ve[Pe];vt(m,b,De,De.viewport)}}else B.length>0&&kn(J,B,b,O),Xe&&Ee.render(b),vt(m,b,O);N!==null&&R===0&&(Q.updateMultisampleRenderTarget(N),Q.updateRenderTargetMipmap(N)),b.isScene===!0&&b.onAfterRender(x,b,O),Re.resetDefaultState(),w=-1,y=null,S.pop(),S.length>0?(p=S[S.length-1],Ue===!0&&fe.setGlobalState(x.clippingPlanes,p.state.camera)):p=null,M.pop(),M.length>0?m=M[M.length-1]:m=null};function rn(b,O,j,J){if(b.visible===!1)return;if(b.layers.test(O.layers)){if(b.isGroup)j=b.renderOrder;else if(b.isLOD)b.autoUpdate===!0&&b.update(O);else if(b.isLight)p.pushLight(b),b.castShadow&&p.pushShadow(b);else if(b.isSprite){if(!b.frustumCulled||ye.intersectsSprite(b)){J&&Te.setFromMatrixPosition(b.matrixWorld).applyMatrix4(ee);const Pe=U.update(b),Be=b.material;Be.visible&&m.push(b,Pe,Be,j,Te.z,null)}}else if((b.isMesh||b.isLine||b.isPoints)&&(!b.frustumCulled||ye.intersectsObject(b))){const Pe=U.update(b),Be=b.material;if(J&&(b.boundingSphere!==void 0?(b.boundingSphere===null&&b.computeBoundingSphere(),Te.copy(b.boundingSphere.center)):(Pe.boundingSphere===null&&Pe.computeBoundingSphere(),Te.copy(Pe.boundingSphere.center)),Te.applyMatrix4(b.matrixWorld).applyMatrix4(ee)),Array.isArray(Be)){const De=Pe.groups;for(let Ke=0,Ye=De.length;Ke<Ye;Ke++){const He=De[Ke],st=Be[He.materialIndex];st&&st.visible&&m.push(b,Pe,st,j,Te.z,He)}}else Be.visible&&m.push(b,Pe,Be,j,Te.z,null)}}const ve=b.children;for(let Pe=0,Be=ve.length;Pe<Be;Pe++)rn(ve[Pe],O,j,J)}function vt(b,O,j,J){const B=b.opaque,ve=b.transmissive,Pe=b.transparent;p.setupLightsView(j),Ue===!0&&fe.setGlobalState(x.clippingPlanes,j),J&&te.viewport(L.copy(J)),B.length>0&&qt(B,O,j),ve.length>0&&qt(ve,O,j),Pe.length>0&&qt(Pe,O,j),te.buffers.depth.setTest(!0),te.buffers.depth.setMask(!0),te.buffers.color.setMask(!0),te.setPolygonOffset(!1)}function kn(b,O,j,J){if((j.isScene===!0?j.overrideMaterial:null)!==null)return;p.state.transmissionRenderTarget[J.id]===void 0&&(p.state.transmissionRenderTarget[J.id]=new di(1,1,{generateMipmaps:!0,type:re.has("EXT_color_buffer_half_float")||re.has("EXT_color_buffer_float")?Jr:In,minFilter:si,samples:4,stencilBuffer:s,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:ot.workingColorSpace}));const ve=p.state.transmissionRenderTarget[J.id],Pe=J.viewport||L;ve.setSize(Pe.z*x.transmissionResolutionScale,Pe.w*x.transmissionResolutionScale);const Be=x.getRenderTarget(),De=x.getActiveCubeFace(),Ke=x.getActiveMipmapLevel();x.setRenderTarget(ve),x.getClearColor(X),q=x.getClearAlpha(),q<1&&x.setClearColor(16777215,.5),x.clear(),Xe&&Ee.render(j);const Ye=x.toneMapping;x.toneMapping=Wn;const He=J.viewport;if(J.viewport!==void 0&&(J.viewport=void 0),p.setupLightsView(J),Ue===!0&&fe.setGlobalState(x.clippingPlanes,J),qt(b,j,J),Q.updateMultisampleRenderTarget(ve),Q.updateRenderTargetMipmap(ve),re.has("WEBGL_multisampled_render_to_texture")===!1){let st=!1;for(let gt=0,Rt=O.length;gt<Rt;gt++){const wt=O[gt],xt=wt.object,Ve=wt.geometry,Tt=wt.material,ct=wt.group;if(Tt.side===fn&&xt.layers.test(J.layers)){const cn=Tt.side;Tt.side=tn,Tt.needsUpdate=!0,cs(xt,j,J,Ve,Tt,ct),Tt.side=cn,Tt.needsUpdate=!0,st=!0}}st===!0&&(Q.updateMultisampleRenderTarget(ve),Q.updateRenderTargetMipmap(ve))}x.setRenderTarget(Be,De,Ke),x.setClearColor(X,q),He!==void 0&&(J.viewport=He),x.toneMapping=Ye}function qt(b,O,j){const J=O.isScene===!0?O.overrideMaterial:null;for(let B=0,ve=b.length;B<ve;B++){const Pe=b[B],Be=Pe.object,De=Pe.geometry,Ke=Pe.group;let Ye=Pe.material;Ye.allowOverride===!0&&J!==null&&(Ye=J),Be.layers.test(j.layers)&&cs(Be,O,j,De,Ye,Ke)}}function cs(b,O,j,J,B,ve){b.onBeforeRender(x,O,j,J,B,ve),b.modelViewMatrix.multiplyMatrices(j.matrixWorldInverse,b.matrixWorld),b.normalMatrix.getNormalMatrix(b.modelViewMatrix),B.onBeforeRender(x,O,j,J,b,ve),B.transparent===!0&&B.side===fn&&B.forceSinglePass===!1?(B.side=tn,B.needsUpdate=!0,x.renderBufferDirect(j,O,J,B,b,ve),B.side=Kn,B.needsUpdate=!0,x.renderBufferDirect(j,O,J,B,b,ve),B.side=fn):x.renderBufferDirect(j,O,J,B,b,ve),b.onAfterRender(x,O,j,J,B,ve)}function Ui(b,O,j){O.isScene!==!0&&(O=Ae);const J=F.get(b),B=p.state.lights,ve=p.state.shadowsArray,Pe=B.state.version,Be=G.getParameters(b,B.state,ve,O,j),De=G.getProgramCacheKey(Be);let Ke=J.programs;J.environment=b.isMeshStandardMaterial?O.environment:null,J.fog=O.fog,J.envMap=(b.isMeshStandardMaterial?de:me).get(b.envMap||J.environment),J.envMapRotation=J.environment!==null&&b.envMap===null?O.environmentRotation:b.envMapRotation,Ke===void 0&&(b.addEventListener("dispose",se),Ke=new Map,J.programs=Ke);let Ye=Ke.get(De);if(Ye!==void 0){if(J.currentProgram===Ye&&J.lightsStateVersion===Pe)return to(b,Be),Ye}else Be.uniforms=G.getUniforms(b),b.onBeforeCompile(Be,x),Ye=G.acquireProgram(Be,De),Ke.set(De,Ye),J.uniforms=Be.uniforms;const He=J.uniforms;return(!b.isShaderMaterial&&!b.isRawShaderMaterial||b.clipping===!0)&&(He.clippingPlanes=fe.uniform),to(b,Be),J.needsLights=us(b),J.lightsStateVersion=Pe,J.needsLights&&(He.ambientLightColor.value=B.state.ambient,He.lightProbe.value=B.state.probe,He.directionalLights.value=B.state.directional,He.directionalLightShadows.value=B.state.directionalShadow,He.spotLights.value=B.state.spot,He.spotLightShadows.value=B.state.spotShadow,He.rectAreaLights.value=B.state.rectArea,He.ltc_1.value=B.state.rectAreaLTC1,He.ltc_2.value=B.state.rectAreaLTC2,He.pointLights.value=B.state.point,He.pointLightShadows.value=B.state.pointShadow,He.hemisphereLights.value=B.state.hemi,He.directionalShadowMap.value=B.state.directionalShadowMap,He.directionalShadowMatrix.value=B.state.directionalShadowMatrix,He.spotShadowMap.value=B.state.spotShadowMap,He.spotLightMatrix.value=B.state.spotLightMatrix,He.spotLightMap.value=B.state.spotLightMap,He.pointShadowMap.value=B.state.pointShadowMap,He.pointShadowMatrix.value=B.state.pointShadowMatrix),J.currentProgram=Ye,J.uniformsList=null,Ye}function eo(b){if(b.uniformsList===null){const O=b.currentProgram.getUniforms();b.uniformsList=qo.seqWithValue(O.seq,b.uniforms)}return b.uniformsList}function to(b,O){const j=F.get(b);j.outputColorSpace=O.outputColorSpace,j.batching=O.batching,j.batchingColor=O.batchingColor,j.instancing=O.instancing,j.instancingColor=O.instancingColor,j.instancingMorph=O.instancingMorph,j.skinning=O.skinning,j.morphTargets=O.morphTargets,j.morphNormals=O.morphNormals,j.morphColors=O.morphColors,j.morphTargetsCount=O.morphTargetsCount,j.numClippingPlanes=O.numClippingPlanes,j.numIntersection=O.numClipIntersection,j.vertexAlphas=O.vertexAlphas,j.vertexTangents=O.vertexTangents,j.toneMapping=O.toneMapping}function bt(b,O,j,J,B){O.isScene!==!0&&(O=Ae),Q.resetTextureUnits();const ve=O.fog,Pe=J.isMeshStandardMaterial?O.environment:null,Be=N===null?x.outputColorSpace:N.isXRRenderTarget===!0?N.texture.colorSpace:zt,De=(J.isMeshStandardMaterial?de:me).get(J.envMap||Pe),Ke=J.vertexColors===!0&&!!j.attributes.color&&j.attributes.color.itemSize===4,Ye=!!j.attributes.tangent&&(!!J.normalMap||J.anisotropy>0),He=!!j.morphAttributes.position,st=!!j.morphAttributes.normal,gt=!!j.morphAttributes.color;let Rt=Wn;J.toneMapped&&(N===null||N.isXRRenderTarget===!0)&&(Rt=x.toneMapping);const wt=j.morphAttributes.position||j.morphAttributes.normal||j.morphAttributes.color,xt=wt!==void 0?wt.length:0,Ve=F.get(J),Tt=p.state.lights;if(Ue===!0&&(Z===!0||b!==y)){const Kt=b===y&&J.id===w;fe.setState(J,b,Kt)}let ct=!1;J.version===Ve.__version?(Ve.needsLights&&Ve.lightsStateVersion!==Tt.state.version||Ve.outputColorSpace!==Be||B.isBatchedMesh&&Ve.batching===!1||!B.isBatchedMesh&&Ve.batching===!0||B.isBatchedMesh&&Ve.batchingColor===!0&&B.colorTexture===null||B.isBatchedMesh&&Ve.batchingColor===!1&&B.colorTexture!==null||B.isInstancedMesh&&Ve.instancing===!1||!B.isInstancedMesh&&Ve.instancing===!0||B.isSkinnedMesh&&Ve.skinning===!1||!B.isSkinnedMesh&&Ve.skinning===!0||B.isInstancedMesh&&Ve.instancingColor===!0&&B.instanceColor===null||B.isInstancedMesh&&Ve.instancingColor===!1&&B.instanceColor!==null||B.isInstancedMesh&&Ve.instancingMorph===!0&&B.morphTexture===null||B.isInstancedMesh&&Ve.instancingMorph===!1&&B.morphTexture!==null||Ve.envMap!==De||J.fog===!0&&Ve.fog!==ve||Ve.numClippingPlanes!==void 0&&(Ve.numClippingPlanes!==fe.numPlanes||Ve.numIntersection!==fe.numIntersection)||Ve.vertexAlphas!==Ke||Ve.vertexTangents!==Ye||Ve.morphTargets!==He||Ve.morphNormals!==st||Ve.morphColors!==gt||Ve.toneMapping!==Rt||Ve.morphTargetsCount!==xt)&&(ct=!0):(ct=!0,Ve.__version=J.version);let cn=Ve.currentProgram;ct===!0&&(cn=Ui(J,O,B));let cr=!1,un=!1,ds=!1;const At=cn.getUniforms(),gn=Ve.uniforms;if(te.useProgram(cn.program)&&(cr=!0,un=!0,ds=!0),J.id!==w&&(w=J.id,un=!0),cr||y!==b){te.buffers.depth.getReversed()&&b.reversedDepth!==!0&&(b._reversedDepth=!0,b.updateProjectionMatrix()),At.setValue(P,"projectionMatrix",b.projectionMatrix),At.setValue(P,"viewMatrix",b.matrixWorldInverse);const sn=At.map.cameraPosition;sn!==void 0&&sn.setValue(P,Me.setFromMatrixPosition(b.matrixWorld)),ie.logarithmicDepthBuffer&&At.setValue(P,"logDepthBufFC",2/(Math.log(b.far+1)/Math.LN2)),(J.isMeshPhongMaterial||J.isMeshToonMaterial||J.isMeshLambertMaterial||J.isMeshBasicMaterial||J.isMeshStandardMaterial||J.isShaderMaterial)&&At.setValue(P,"isOrthographic",b.isOrthographicCamera===!0),y!==b&&(y=b,un=!0,ds=!0)}if(B.isSkinnedMesh){At.setOptional(P,B,"bindMatrix"),At.setOptional(P,B,"bindMatrixInverse");const Kt=B.skeleton;Kt&&(Kt.boneTexture===null&&Kt.computeBoneTexture(),At.setValue(P,"boneTexture",Kt.boneTexture,Q))}B.isBatchedMesh&&(At.setOptional(P,B,"batchingTexture"),At.setValue(P,"batchingTexture",B._matricesTexture,Q),At.setOptional(P,B,"batchingIdTexture"),At.setValue(P,"batchingIdTexture",B._indirectTexture,Q),At.setOptional(P,B,"batchingColorTexture"),B._colorsTexture!==null&&At.setValue(P,"batchingColorTexture",B._colorsTexture,Q));const _n=j.morphAttributes;if((_n.position!==void 0||_n.normal!==void 0||_n.color!==void 0)&&he.update(B,j,cn),(un||Ve.receiveShadow!==B.receiveShadow)&&(Ve.receiveShadow=B.receiveShadow,At.setValue(P,"receiveShadow",B.receiveShadow)),J.isMeshGouraudMaterial&&J.envMap!==null&&(gn.envMap.value=De,gn.flipEnvMap.value=De.isCubeTexture&&De.isRenderTargetTexture===!1?-1:1),J.isMeshStandardMaterial&&J.envMap===null&&O.environment!==null&&(gn.envMapIntensity.value=O.environmentIntensity),un&&(At.setValue(P,"toneMappingExposure",x.toneMappingExposure),Ve.needsLights&&jn(gn,ds),ve&&J.fog===!0&&Y.refreshFogUniforms(gn,ve),Y.refreshMaterialUniforms(gn,J,V,oe,p.state.transmissionRenderTarget[b.id]),qo.upload(P,eo(Ve),gn,Q)),J.isShaderMaterial&&J.uniformsNeedUpdate===!0&&(qo.upload(P,eo(Ve),gn,Q),J.uniformsNeedUpdate=!1),J.isSpriteMaterial&&At.setValue(P,"center",B.center),At.setValue(P,"modelViewMatrix",B.modelViewMatrix),At.setValue(P,"normalMatrix",B.normalMatrix),At.setValue(P,"modelMatrix",B.matrixWorld),J.isShaderMaterial||J.isRawShaderMaterial){const Kt=J.uniformsGroups;for(let sn=0,ha=Kt.length;sn<ha;sn++){const Oi=Kt[sn];Ze.update(Oi,cn),Ze.bind(Oi,cn)}}return cn}function jn(b,O){b.ambientLightColor.needsUpdate=O,b.lightProbe.needsUpdate=O,b.directionalLights.needsUpdate=O,b.directionalLightShadows.needsUpdate=O,b.pointLights.needsUpdate=O,b.pointLightShadows.needsUpdate=O,b.spotLights.needsUpdate=O,b.spotLightShadows.needsUpdate=O,b.rectAreaLights.needsUpdate=O,b.hemisphereLights.needsUpdate=O}function us(b){return b.isMeshLambertMaterial||b.isMeshToonMaterial||b.isMeshPhongMaterial||b.isMeshStandardMaterial||b.isShadowMaterial||b.isShaderMaterial&&b.lights===!0}this.getActiveCubeFace=function(){return C},this.getActiveMipmapLevel=function(){return R},this.getRenderTarget=function(){return N},this.setRenderTargetTextures=function(b,O,j){const J=F.get(b);J.__autoAllocateDepthBuffer=b.resolveDepthBuffer===!1,J.__autoAllocateDepthBuffer===!1&&(J.__useRenderToTexture=!1),F.get(b.texture).__webglTexture=O,F.get(b.depthTexture).__webglTexture=J.__autoAllocateDepthBuffer?void 0:j,J.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(b,O){const j=F.get(b);j.__webglFramebuffer=O,j.__useDefaultFramebuffer=O===void 0};const da=P.createFramebuffer();this.setRenderTarget=function(b,O=0,j=0){N=b,C=O,R=j;let J=!0,B=null,ve=!1,Pe=!1;if(b){const De=F.get(b);if(De.__useDefaultFramebuffer!==void 0)te.bindFramebuffer(P.FRAMEBUFFER,null),J=!1;else if(De.__webglFramebuffer===void 0)Q.setupRenderTarget(b);else if(De.__hasExternalTextures)Q.rebindTextures(b,F.get(b.texture).__webglTexture,F.get(b.depthTexture).__webglTexture);else if(b.depthBuffer){const He=b.depthTexture;if(De.__boundDepthTexture!==He){if(He!==null&&F.has(He)&&(b.width!==He.image.width||b.height!==He.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");Q.setupDepthRenderbuffer(b)}}const Ke=b.texture;(Ke.isData3DTexture||Ke.isDataArrayTexture||Ke.isCompressedArrayTexture)&&(Pe=!0);const Ye=F.get(b).__webglFramebuffer;b.isWebGLCubeRenderTarget?(Array.isArray(Ye[O])?B=Ye[O][j]:B=Ye[O],ve=!0):b.samples>0&&Q.useMultisampledRTT(b)===!1?B=F.get(b).__webglMultisampledFramebuffer:Array.isArray(Ye)?B=Ye[j]:B=Ye,L.copy(b.viewport),k.copy(b.scissor),W=b.scissorTest}else L.copy(ne).multiplyScalar(V).floor(),k.copy(ce).multiplyScalar(V).floor(),W=ae;if(j!==0&&(B=da),te.bindFramebuffer(P.FRAMEBUFFER,B)&&J&&te.drawBuffers(b,B),te.viewport(L),te.scissor(k),te.setScissorTest(W),ve){const De=F.get(b.texture);P.framebufferTexture2D(P.FRAMEBUFFER,P.COLOR_ATTACHMENT0,P.TEXTURE_CUBE_MAP_POSITIVE_X+O,De.__webglTexture,j)}else if(Pe){const De=O;for(let Ke=0;Ke<b.textures.length;Ke++){const Ye=F.get(b.textures[Ke]);P.framebufferTextureLayer(P.FRAMEBUFFER,P.COLOR_ATTACHMENT0+Ke,Ye.__webglTexture,j,De)}}else if(b!==null&&j!==0){const De=F.get(b.texture);P.framebufferTexture2D(P.FRAMEBUFFER,P.COLOR_ATTACHMENT0,P.TEXTURE_2D,De.__webglTexture,j)}w=-1},this.readRenderTargetPixels=function(b,O,j,J,B,ve,Pe,Be=0){if(!(b&&b.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let De=F.get(b).__webglFramebuffer;if(b.isWebGLCubeRenderTarget&&Pe!==void 0&&(De=De[Pe]),De){te.bindFramebuffer(P.FRAMEBUFFER,De);try{const Ke=b.textures[Be],Ye=Ke.format,He=Ke.type;if(!ie.textureFormatReadable(Ye)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!ie.textureTypeReadable(He)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}O>=0&&O<=b.width-J&&j>=0&&j<=b.height-B&&(b.textures.length>1&&P.readBuffer(P.COLOR_ATTACHMENT0+Be),P.readPixels(O,j,J,B,ke.convert(Ye),ke.convert(He),ve))}finally{const Ke=N!==null?F.get(N).__webglFramebuffer:null;te.bindFramebuffer(P.FRAMEBUFFER,Ke)}}},this.readRenderTargetPixelsAsync=async function(b,O,j,J,B,ve,Pe,Be=0){if(!(b&&b.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let De=F.get(b).__webglFramebuffer;if(b.isWebGLCubeRenderTarget&&Pe!==void 0&&(De=De[Pe]),De)if(O>=0&&O<=b.width-J&&j>=0&&j<=b.height-B){te.bindFramebuffer(P.FRAMEBUFFER,De);const Ke=b.textures[Be],Ye=Ke.format,He=Ke.type;if(!ie.textureFormatReadable(Ye))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!ie.textureTypeReadable(He))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");const st=P.createBuffer();P.bindBuffer(P.PIXEL_PACK_BUFFER,st),P.bufferData(P.PIXEL_PACK_BUFFER,ve.byteLength,P.STREAM_READ),b.textures.length>1&&P.readBuffer(P.COLOR_ATTACHMENT0+Be),P.readPixels(O,j,J,B,ke.convert(Ye),ke.convert(He),0);const gt=N!==null?F.get(N).__webglFramebuffer:null;te.bindFramebuffer(P.FRAMEBUFFER,gt);const Rt=P.fenceSync(P.SYNC_GPU_COMMANDS_COMPLETE,0);return P.flush(),await Qp(P,Rt,4),P.bindBuffer(P.PIXEL_PACK_BUFFER,st),P.getBufferSubData(P.PIXEL_PACK_BUFFER,0,ve),P.deleteBuffer(st),P.deleteSync(Rt),ve}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(b,O=null,j=0){const J=Math.pow(2,-j),B=Math.floor(b.image.width*J),ve=Math.floor(b.image.height*J),Pe=O!==null?O.x:0,Be=O!==null?O.y:0;Q.setTexture2D(b,0),P.copyTexSubImage2D(P.TEXTURE_2D,j,0,0,Pe,Be,B,ve),te.unbindTexture()};const yf=P.createFramebuffer(),Sf=P.createFramebuffer();this.copyTextureToTexture=function(b,O,j=null,J=null,B=0,ve=null){ve===null&&(B!==0?(zs("WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels."),ve=B,B=0):ve=0);let Pe,Be,De,Ke,Ye,He,st,gt,Rt;const wt=b.isCompressedTexture?b.mipmaps[ve]:b.image;if(j!==null)Pe=j.max.x-j.min.x,Be=j.max.y-j.min.y,De=j.isBox3?j.max.z-j.min.z:1,Ke=j.min.x,Ye=j.min.y,He=j.isBox3?j.min.z:0;else{const _n=Math.pow(2,-B);Pe=Math.floor(wt.width*_n),Be=Math.floor(wt.height*_n),b.isDataArrayTexture?De=wt.depth:b.isData3DTexture?De=Math.floor(wt.depth*_n):De=1,Ke=0,Ye=0,He=0}J!==null?(st=J.x,gt=J.y,Rt=J.z):(st=0,gt=0,Rt=0);const xt=ke.convert(O.format),Ve=ke.convert(O.type);let Tt;O.isData3DTexture?(Q.setTexture3D(O,0),Tt=P.TEXTURE_3D):O.isDataArrayTexture||O.isCompressedArrayTexture?(Q.setTexture2DArray(O,0),Tt=P.TEXTURE_2D_ARRAY):(Q.setTexture2D(O,0),Tt=P.TEXTURE_2D),P.pixelStorei(P.UNPACK_FLIP_Y_WEBGL,O.flipY),P.pixelStorei(P.UNPACK_PREMULTIPLY_ALPHA_WEBGL,O.premultiplyAlpha),P.pixelStorei(P.UNPACK_ALIGNMENT,O.unpackAlignment);const ct=P.getParameter(P.UNPACK_ROW_LENGTH),cn=P.getParameter(P.UNPACK_IMAGE_HEIGHT),cr=P.getParameter(P.UNPACK_SKIP_PIXELS),un=P.getParameter(P.UNPACK_SKIP_ROWS),ds=P.getParameter(P.UNPACK_SKIP_IMAGES);P.pixelStorei(P.UNPACK_ROW_LENGTH,wt.width),P.pixelStorei(P.UNPACK_IMAGE_HEIGHT,wt.height),P.pixelStorei(P.UNPACK_SKIP_PIXELS,Ke),P.pixelStorei(P.UNPACK_SKIP_ROWS,Ye),P.pixelStorei(P.UNPACK_SKIP_IMAGES,He);const At=b.isDataArrayTexture||b.isData3DTexture,gn=O.isDataArrayTexture||O.isData3DTexture;if(b.isDepthTexture){const _n=F.get(b),Kt=F.get(O),sn=F.get(_n.__renderTarget),ha=F.get(Kt.__renderTarget);te.bindFramebuffer(P.READ_FRAMEBUFFER,sn.__webglFramebuffer),te.bindFramebuffer(P.DRAW_FRAMEBUFFER,ha.__webglFramebuffer);for(let Oi=0;Oi<De;Oi++)At&&(P.framebufferTextureLayer(P.READ_FRAMEBUFFER,P.COLOR_ATTACHMENT0,F.get(b).__webglTexture,B,He+Oi),P.framebufferTextureLayer(P.DRAW_FRAMEBUFFER,P.COLOR_ATTACHMENT0,F.get(O).__webglTexture,ve,Rt+Oi)),P.blitFramebuffer(Ke,Ye,Pe,Be,st,gt,Pe,Be,P.DEPTH_BUFFER_BIT,P.NEAREST);te.bindFramebuffer(P.READ_FRAMEBUFFER,null),te.bindFramebuffer(P.DRAW_FRAMEBUFFER,null)}else if(B!==0||b.isRenderTargetTexture||F.has(b)){const _n=F.get(b),Kt=F.get(O);te.bindFramebuffer(P.READ_FRAMEBUFFER,yf),te.bindFramebuffer(P.DRAW_FRAMEBUFFER,Sf);for(let sn=0;sn<De;sn++)At?P.framebufferTextureLayer(P.READ_FRAMEBUFFER,P.COLOR_ATTACHMENT0,_n.__webglTexture,B,He+sn):P.framebufferTexture2D(P.READ_FRAMEBUFFER,P.COLOR_ATTACHMENT0,P.TEXTURE_2D,_n.__webglTexture,B),gn?P.framebufferTextureLayer(P.DRAW_FRAMEBUFFER,P.COLOR_ATTACHMENT0,Kt.__webglTexture,ve,Rt+sn):P.framebufferTexture2D(P.DRAW_FRAMEBUFFER,P.COLOR_ATTACHMENT0,P.TEXTURE_2D,Kt.__webglTexture,ve),B!==0?P.blitFramebuffer(Ke,Ye,Pe,Be,st,gt,Pe,Be,P.COLOR_BUFFER_BIT,P.NEAREST):gn?P.copyTexSubImage3D(Tt,ve,st,gt,Rt+sn,Ke,Ye,Pe,Be):P.copyTexSubImage2D(Tt,ve,st,gt,Ke,Ye,Pe,Be);te.bindFramebuffer(P.READ_FRAMEBUFFER,null),te.bindFramebuffer(P.DRAW_FRAMEBUFFER,null)}else gn?b.isDataTexture||b.isData3DTexture?P.texSubImage3D(Tt,ve,st,gt,Rt,Pe,Be,De,xt,Ve,wt.data):O.isCompressedArrayTexture?P.compressedTexSubImage3D(Tt,ve,st,gt,Rt,Pe,Be,De,xt,wt.data):P.texSubImage3D(Tt,ve,st,gt,Rt,Pe,Be,De,xt,Ve,wt):b.isDataTexture?P.texSubImage2D(P.TEXTURE_2D,ve,st,gt,Pe,Be,xt,Ve,wt.data):b.isCompressedTexture?P.compressedTexSubImage2D(P.TEXTURE_2D,ve,st,gt,wt.width,wt.height,xt,wt.data):P.texSubImage2D(P.TEXTURE_2D,ve,st,gt,Pe,Be,xt,Ve,wt);P.pixelStorei(P.UNPACK_ROW_LENGTH,ct),P.pixelStorei(P.UNPACK_IMAGE_HEIGHT,cn),P.pixelStorei(P.UNPACK_SKIP_PIXELS,cr),P.pixelStorei(P.UNPACK_SKIP_ROWS,un),P.pixelStorei(P.UNPACK_SKIP_IMAGES,ds),ve===0&&O.generateMipmaps&&P.generateMipmap(Tt),te.unbindTexture()},this.initRenderTarget=function(b){F.get(b).__webglFramebuffer===void 0&&Q.setupRenderTarget(b)},this.initTexture=function(b){b.isCubeTexture?Q.setTextureCube(b,0):b.isData3DTexture?Q.setTexture3D(b,0):b.isDataArrayTexture||b.isCompressedArrayTexture?Q.setTexture2DArray(b,0):Q.setTexture2D(b,0),te.unbindTexture()},this.resetState=function(){C=0,R=0,N=null,te.reset(),Re.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Gn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorSpace=ot._getDrawingBufferColorSpace(e),t.unpackColorSpace=ot._getUnpackColorSpace()}}function yd(i,e){if(e===Ep)return console.warn("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles."),i;if(e===$l||e===_h){let t=i.getIndex();if(t===null){const o=[],a=i.getAttribute("position");if(a!==void 0){for(let l=0;l<a.count;l++)o.push(l);i.setIndex(o),t=i.getIndex()}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible."),i}const n=t.count-2,r=[];if(e===$l)for(let o=1;o<=n;o++)r.push(t.getX(0)),r.push(t.getX(o)),r.push(t.getX(o+1));else for(let o=0;o<n;o++)o%2===0?(r.push(t.getX(o)),r.push(t.getX(o+1)),r.push(t.getX(o+2))):(r.push(t.getX(o+2)),r.push(t.getX(o+1)),r.push(t.getX(o)));r.length/3!==n&&console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles.");const s=i.clone();return s.setIndex(r),s.clearGroups(),s}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:",e),i}class Ty extends ts{constructor(e){super(e),this.dracoLoader=null,this.ktx2Loader=null,this.meshoptDecoder=null,this.pluginCallbacks=[],this.register(function(t){return new Py(t)}),this.register(function(t){return new Iy(t)}),this.register(function(t){return new Hy(t)}),this.register(function(t){return new Vy(t)}),this.register(function(t){return new Gy(t)}),this.register(function(t){return new Dy(t)}),this.register(function(t){return new Uy(t)}),this.register(function(t){return new Oy(t)}),this.register(function(t){return new Fy(t)}),this.register(function(t){return new Ly(t)}),this.register(function(t){return new ky(t)}),this.register(function(t){return new Ny(t)}),this.register(function(t){return new zy(t)}),this.register(function(t){return new By(t)}),this.register(function(t){return new Cy(t)}),this.register(function(t){return new Wy(t)}),this.register(function(t){return new Xy(t)})}load(e,t,n,r){const s=this;let o;if(this.resourcePath!=="")o=this.resourcePath;else if(this.path!==""){const c=Ls.extractUrlBase(e);o=Ls.resolveURL(c,this.path)}else o=Ls.extractUrlBase(e);this.manager.itemStart(e);const a=function(c){r?r(c):console.error(c),s.manager.itemError(e),s.manager.itemEnd(e)},l=new $h(this.manager);l.setPath(this.path),l.setResponseType("arraybuffer"),l.setRequestHeader(this.requestHeader),l.setWithCredentials(this.withCredentials),l.load(e,function(c){try{s.parse(c,o,function(u){t(u),s.manager.itemEnd(e)},a)}catch(u){a(u)}},n,a)}setDRACOLoader(e){return this.dracoLoader=e,this}setKTX2Loader(e){return this.ktx2Loader=e,this}setMeshoptDecoder(e){return this.meshoptDecoder=e,this}register(e){return this.pluginCallbacks.indexOf(e)===-1&&this.pluginCallbacks.push(e),this}unregister(e){return this.pluginCallbacks.indexOf(e)!==-1&&this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(e),1),this}parse(e,t,n,r){let s;const o={},a={},l=new TextDecoder;if(typeof e=="string")s=JSON.parse(e);else if(e instanceof ArrayBuffer)if(l.decode(new Uint8Array(e,0,4))===nf){try{o[rt.KHR_BINARY_GLTF]=new qy(e)}catch(d){r&&r(d);return}s=JSON.parse(o[rt.KHR_BINARY_GLTF].content)}else s=JSON.parse(l.decode(e));else s=e;if(s.asset===void 0||s.asset.version[0]<2){r&&r(new Error("THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported."));return}const c=new sS(s,{path:t||this.resourcePath||"",crossOrigin:this.crossOrigin,requestHeader:this.requestHeader,manager:this.manager,ktx2Loader:this.ktx2Loader,meshoptDecoder:this.meshoptDecoder});c.fileLoader.setRequestHeader(this.requestHeader);for(let u=0;u<this.pluginCallbacks.length;u++){const d=this.pluginCallbacks[u](c);d.name||console.error("THREE.GLTFLoader: Invalid plugin found: missing name"),a[d.name]=d,o[d.name]=!0}if(s.extensionsUsed)for(let u=0;u<s.extensionsUsed.length;++u){const d=s.extensionsUsed[u],h=s.extensionsRequired||[];switch(d){case rt.KHR_MATERIALS_UNLIT:o[d]=new Ry;break;case rt.KHR_DRACO_MESH_COMPRESSION:o[d]=new Ky(s,this.dracoLoader);break;case rt.KHR_TEXTURE_TRANSFORM:o[d]=new $y;break;case rt.KHR_MESH_QUANTIZATION:o[d]=new Yy;break;default:h.indexOf(d)>=0&&a[d]===void 0&&console.warn('THREE.GLTFLoader: Unknown extension "'+d+'".')}}c.setExtensions(o),c.setPlugins(a),c.parse(n,r)}parseAsync(e,t){const n=this;return new Promise(function(r,s){n.parse(e,t,r,s)})}}function Ay(){let i={};return{get:function(e){return i[e]},add:function(e,t){i[e]=t},remove:function(e){delete i[e]},removeAll:function(){i={}}}}const rt={KHR_BINARY_GLTF:"KHR_binary_glTF",KHR_DRACO_MESH_COMPRESSION:"KHR_draco_mesh_compression",KHR_LIGHTS_PUNCTUAL:"KHR_lights_punctual",KHR_MATERIALS_CLEARCOAT:"KHR_materials_clearcoat",KHR_MATERIALS_DISPERSION:"KHR_materials_dispersion",KHR_MATERIALS_IOR:"KHR_materials_ior",KHR_MATERIALS_SHEEN:"KHR_materials_sheen",KHR_MATERIALS_SPECULAR:"KHR_materials_specular",KHR_MATERIALS_TRANSMISSION:"KHR_materials_transmission",KHR_MATERIALS_IRIDESCENCE:"KHR_materials_iridescence",KHR_MATERIALS_ANISOTROPY:"KHR_materials_anisotropy",KHR_MATERIALS_UNLIT:"KHR_materials_unlit",KHR_MATERIALS_VOLUME:"KHR_materials_volume",KHR_TEXTURE_BASISU:"KHR_texture_basisu",KHR_TEXTURE_TRANSFORM:"KHR_texture_transform",KHR_MESH_QUANTIZATION:"KHR_mesh_quantization",KHR_MATERIALS_EMISSIVE_STRENGTH:"KHR_materials_emissive_strength",EXT_MATERIALS_BUMP:"EXT_materials_bump",EXT_TEXTURE_WEBP:"EXT_texture_webp",EXT_TEXTURE_AVIF:"EXT_texture_avif",EXT_MESHOPT_COMPRESSION:"EXT_meshopt_compression",EXT_MESH_GPU_INSTANCING:"EXT_mesh_gpu_instancing"};class Cy{constructor(e){this.parser=e,this.name=rt.KHR_LIGHTS_PUNCTUAL,this.cache={refs:{},uses:{}}}_markDefs(){const e=this.parser,t=this.parser.json.nodes||[];for(let n=0,r=t.length;n<r;n++){const s=t[n];s.extensions&&s.extensions[this.name]&&s.extensions[this.name].light!==void 0&&e._addNodeRef(this.cache,s.extensions[this.name].light)}}_loadLight(e){const t=this.parser,n="light:"+e;let r=t.cache.get(n);if(r)return r;const s=t.json,l=((s.extensions&&s.extensions[this.name]||{}).lights||[])[e];let c;const u=new Ge(16777215);l.color!==void 0&&u.setRGB(l.color[0],l.color[1],l.color[2],zt);const d=l.range!==void 0?l.range:0;switch(l.type){case"directional":c=new Xo(u),c.target.position.set(0,0,-1),c.add(c.target);break;case"point":c=new jh(u),c.distance=d;break;case"spot":c=new Yh(u),c.distance=d,l.spot=l.spot||{},l.spot.innerConeAngle=l.spot.innerConeAngle!==void 0?l.spot.innerConeAngle:0,l.spot.outerConeAngle=l.spot.outerConeAngle!==void 0?l.spot.outerConeAngle:Math.PI/4,c.angle=l.spot.outerConeAngle,c.penumbra=1-l.spot.innerConeAngle/l.spot.outerConeAngle,c.target.position.set(0,0,-1),c.add(c.target);break;default:throw new Error("THREE.GLTFLoader: Unexpected light type: "+l.type)}return c.position.set(0,0,0),zn(c,l),l.intensity!==void 0&&(c.intensity=l.intensity),c.name=t.createUniqueName(l.name||"light_"+e),r=Promise.resolve(c),t.cache.add(n,r),r}getDependency(e,t){if(e==="light")return this._loadLight(t)}createNodeAttachment(e){const t=this,n=this.parser,s=n.json.nodes[e],a=(s.extensions&&s.extensions[this.name]||{}).light;return a===void 0?null:this._loadLight(a).then(function(l){return n._getNodeRef(t.cache,a,l)})}}class Ry{constructor(){this.name=rt.KHR_MATERIALS_UNLIT}getMaterialType(){return oi}extendParams(e,t,n){const r=[];e.color=new Ge(1,1,1),e.opacity=1;const s=t.pbrMetallicRoughness;if(s){if(Array.isArray(s.baseColorFactor)){const o=s.baseColorFactor;e.color.setRGB(o[0],o[1],o[2],zt),e.opacity=o[3]}s.baseColorTexture!==void 0&&r.push(n.assignTexture(e,"map",s.baseColorTexture,Ut))}return Promise.all(r)}}class Ly{constructor(e){this.parser=e,this.name=rt.KHR_MATERIALS_EMISSIVE_STRENGTH}extendMaterialParams(e,t){const r=this.parser.json.materials[e];if(!r.extensions||!r.extensions[this.name])return Promise.resolve();const s=r.extensions[this.name].emissiveStrength;return s!==void 0&&(t.emissiveIntensity=s),Promise.resolve()}}class Py{constructor(e){this.parser=e,this.name=rt.KHR_MATERIALS_CLEARCOAT}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Mn}extendMaterialParams(e,t){const n=this.parser,r=n.json.materials[e];if(!r.extensions||!r.extensions[this.name])return Promise.resolve();const s=[],o=r.extensions[this.name];if(o.clearcoatFactor!==void 0&&(t.clearcoat=o.clearcoatFactor),o.clearcoatTexture!==void 0&&s.push(n.assignTexture(t,"clearcoatMap",o.clearcoatTexture)),o.clearcoatRoughnessFactor!==void 0&&(t.clearcoatRoughness=o.clearcoatRoughnessFactor),o.clearcoatRoughnessTexture!==void 0&&s.push(n.assignTexture(t,"clearcoatRoughnessMap",o.clearcoatRoughnessTexture)),o.clearcoatNormalTexture!==void 0&&(s.push(n.assignTexture(t,"clearcoatNormalMap",o.clearcoatNormalTexture)),o.clearcoatNormalTexture.scale!==void 0)){const a=o.clearcoatNormalTexture.scale;t.clearcoatNormalScale=new _e(a,a)}return Promise.all(s)}}class Iy{constructor(e){this.parser=e,this.name=rt.KHR_MATERIALS_DISPERSION}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Mn}extendMaterialParams(e,t){const r=this.parser.json.materials[e];if(!r.extensions||!r.extensions[this.name])return Promise.resolve();const s=r.extensions[this.name];return t.dispersion=s.dispersion!==void 0?s.dispersion:0,Promise.resolve()}}class Ny{constructor(e){this.parser=e,this.name=rt.KHR_MATERIALS_IRIDESCENCE}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Mn}extendMaterialParams(e,t){const n=this.parser,r=n.json.materials[e];if(!r.extensions||!r.extensions[this.name])return Promise.resolve();const s=[],o=r.extensions[this.name];return o.iridescenceFactor!==void 0&&(t.iridescence=o.iridescenceFactor),o.iridescenceTexture!==void 0&&s.push(n.assignTexture(t,"iridescenceMap",o.iridescenceTexture)),o.iridescenceIor!==void 0&&(t.iridescenceIOR=o.iridescenceIor),t.iridescenceThicknessRange===void 0&&(t.iridescenceThicknessRange=[100,400]),o.iridescenceThicknessMinimum!==void 0&&(t.iridescenceThicknessRange[0]=o.iridescenceThicknessMinimum),o.iridescenceThicknessMaximum!==void 0&&(t.iridescenceThicknessRange[1]=o.iridescenceThicknessMaximum),o.iridescenceThicknessTexture!==void 0&&s.push(n.assignTexture(t,"iridescenceThicknessMap",o.iridescenceThicknessTexture)),Promise.all(s)}}class Dy{constructor(e){this.parser=e,this.name=rt.KHR_MATERIALS_SHEEN}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Mn}extendMaterialParams(e,t){const n=this.parser,r=n.json.materials[e];if(!r.extensions||!r.extensions[this.name])return Promise.resolve();const s=[];t.sheenColor=new Ge(0,0,0),t.sheenRoughness=0,t.sheen=1;const o=r.extensions[this.name];if(o.sheenColorFactor!==void 0){const a=o.sheenColorFactor;t.sheenColor.setRGB(a[0],a[1],a[2],zt)}return o.sheenRoughnessFactor!==void 0&&(t.sheenRoughness=o.sheenRoughnessFactor),o.sheenColorTexture!==void 0&&s.push(n.assignTexture(t,"sheenColorMap",o.sheenColorTexture,Ut)),o.sheenRoughnessTexture!==void 0&&s.push(n.assignTexture(t,"sheenRoughnessMap",o.sheenRoughnessTexture)),Promise.all(s)}}class Uy{constructor(e){this.parser=e,this.name=rt.KHR_MATERIALS_TRANSMISSION}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Mn}extendMaterialParams(e,t){const n=this.parser,r=n.json.materials[e];if(!r.extensions||!r.extensions[this.name])return Promise.resolve();const s=[],o=r.extensions[this.name];return o.transmissionFactor!==void 0&&(t.transmission=o.transmissionFactor),o.transmissionTexture!==void 0&&s.push(n.assignTexture(t,"transmissionMap",o.transmissionTexture)),Promise.all(s)}}class Oy{constructor(e){this.parser=e,this.name=rt.KHR_MATERIALS_VOLUME}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Mn}extendMaterialParams(e,t){const n=this.parser,r=n.json.materials[e];if(!r.extensions||!r.extensions[this.name])return Promise.resolve();const s=[],o=r.extensions[this.name];t.thickness=o.thicknessFactor!==void 0?o.thicknessFactor:0,o.thicknessTexture!==void 0&&s.push(n.assignTexture(t,"thicknessMap",o.thicknessTexture)),t.attenuationDistance=o.attenuationDistance||1/0;const a=o.attenuationColor||[1,1,1];return t.attenuationColor=new Ge().setRGB(a[0],a[1],a[2],zt),Promise.all(s)}}class Fy{constructor(e){this.parser=e,this.name=rt.KHR_MATERIALS_IOR}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Mn}extendMaterialParams(e,t){const r=this.parser.json.materials[e];if(!r.extensions||!r.extensions[this.name])return Promise.resolve();const s=r.extensions[this.name];return t.ior=s.ior!==void 0?s.ior:1.5,Promise.resolve()}}class ky{constructor(e){this.parser=e,this.name=rt.KHR_MATERIALS_SPECULAR}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Mn}extendMaterialParams(e,t){const n=this.parser,r=n.json.materials[e];if(!r.extensions||!r.extensions[this.name])return Promise.resolve();const s=[],o=r.extensions[this.name];t.specularIntensity=o.specularFactor!==void 0?o.specularFactor:1,o.specularTexture!==void 0&&s.push(n.assignTexture(t,"specularIntensityMap",o.specularTexture));const a=o.specularColorFactor||[1,1,1];return t.specularColor=new Ge().setRGB(a[0],a[1],a[2],zt),o.specularColorTexture!==void 0&&s.push(n.assignTexture(t,"specularColorMap",o.specularColorTexture,Ut)),Promise.all(s)}}class By{constructor(e){this.parser=e,this.name=rt.EXT_MATERIALS_BUMP}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Mn}extendMaterialParams(e,t){const n=this.parser,r=n.json.materials[e];if(!r.extensions||!r.extensions[this.name])return Promise.resolve();const s=[],o=r.extensions[this.name];return t.bumpScale=o.bumpFactor!==void 0?o.bumpFactor:1,o.bumpTexture!==void 0&&s.push(n.assignTexture(t,"bumpMap",o.bumpTexture)),Promise.all(s)}}class zy{constructor(e){this.parser=e,this.name=rt.KHR_MATERIALS_ANISOTROPY}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Mn}extendMaterialParams(e,t){const n=this.parser,r=n.json.materials[e];if(!r.extensions||!r.extensions[this.name])return Promise.resolve();const s=[],o=r.extensions[this.name];return o.anisotropyStrength!==void 0&&(t.anisotropy=o.anisotropyStrength),o.anisotropyRotation!==void 0&&(t.anisotropyRotation=o.anisotropyRotation),o.anisotropyTexture!==void 0&&s.push(n.assignTexture(t,"anisotropyMap",o.anisotropyTexture)),Promise.all(s)}}class Hy{constructor(e){this.parser=e,this.name=rt.KHR_TEXTURE_BASISU}loadTexture(e){const t=this.parser,n=t.json,r=n.textures[e];if(!r.extensions||!r.extensions[this.name])return null;const s=r.extensions[this.name],o=t.options.ktx2Loader;if(!o){if(n.extensionsRequired&&n.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setKTX2Loader must be called before loading KTX2 textures");return null}return t.loadTextureImage(e,s.source,o)}}class Vy{constructor(e){this.parser=e,this.name=rt.EXT_TEXTURE_WEBP}loadTexture(e){const t=this.name,n=this.parser,r=n.json,s=r.textures[e];if(!s.extensions||!s.extensions[t])return null;const o=s.extensions[t],a=r.images[o.source];let l=n.textureLoader;if(a.uri){const c=n.options.manager.getHandler(a.uri);c!==null&&(l=c)}return n.loadTextureImage(e,o.source,l)}}class Gy{constructor(e){this.parser=e,this.name=rt.EXT_TEXTURE_AVIF}loadTexture(e){const t=this.name,n=this.parser,r=n.json,s=r.textures[e];if(!s.extensions||!s.extensions[t])return null;const o=s.extensions[t],a=r.images[o.source];let l=n.textureLoader;if(a.uri){const c=n.options.manager.getHandler(a.uri);c!==null&&(l=c)}return n.loadTextureImage(e,o.source,l)}}class Wy{constructor(e){this.name=rt.EXT_MESHOPT_COMPRESSION,this.parser=e}loadBufferView(e){const t=this.parser.json,n=t.bufferViews[e];if(n.extensions&&n.extensions[this.name]){const r=n.extensions[this.name],s=this.parser.getDependency("buffer",r.buffer),o=this.parser.options.meshoptDecoder;if(!o||!o.supported){if(t.extensionsRequired&&t.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files");return null}return s.then(function(a){const l=r.byteOffset||0,c=r.byteLength||0,u=r.count,d=r.byteStride,h=new Uint8Array(a,l,c);return o.decodeGltfBufferAsync?o.decodeGltfBufferAsync(u,d,h,r.mode,r.filter).then(function(f){return f.buffer}):o.ready.then(function(){const f=new ArrayBuffer(u*d);return o.decodeGltfBuffer(new Uint8Array(f),u,d,h,r.mode,r.filter),f})})}else return null}}class Xy{constructor(e){this.name=rt.EXT_MESH_GPU_INSTANCING,this.parser=e}createNodeMesh(e){const t=this.parser.json,n=t.nodes[e];if(!n.extensions||!n.extensions[this.name]||n.mesh===void 0)return null;const r=t.meshes[n.mesh];for(const c of r.primitives)if(c.mode!==xn.TRIANGLES&&c.mode!==xn.TRIANGLE_STRIP&&c.mode!==xn.TRIANGLE_FAN&&c.mode!==void 0)return null;const o=n.extensions[this.name].attributes,a=[],l={};for(const c in o)a.push(this.parser.getDependency("accessor",o[c]).then(u=>(l[c]=u,l[c])));return a.length<1?null:(a.push(this.parser.createNodeMesh(e)),Promise.all(a).then(c=>{const u=c.pop(),d=u.isGroup?u.children:[u],h=c[0].count,f=[];for(const g of d){const _=new $e,m=new I,p=new Pn,M=new I(1,1,1),S=new Hs(g.geometry,g.material,h);for(let x=0;x<h;x++)l.TRANSLATION&&m.fromBufferAttribute(l.TRANSLATION,x),l.ROTATION&&p.fromBufferAttribute(l.ROTATION,x),l.SCALE&&M.fromBufferAttribute(l.SCALE,x),S.setMatrixAt(x,_.compose(m,p,M));for(const x in l)if(x==="_COLOR_0"){const A=l[x];S.instanceColor=new jl(A.array,A.itemSize,A.normalized)}else x!=="TRANSLATION"&&x!=="ROTATION"&&x!=="SCALE"&&g.geometry.setAttribute(x,l[x]);Mt.prototype.copy.call(S,g),this.parser.assignFinalMaterial(S),f.push(S)}return u.isGroup?(u.clear(),u.add(...f),u):f[0]}))}}const nf="glTF",Ss=12,Sd={JSON:1313821514,BIN:5130562};class qy{constructor(e){this.name=rt.KHR_BINARY_GLTF,this.content=null,this.body=null;const t=new DataView(e,0,Ss),n=new TextDecoder;if(this.header={magic:n.decode(new Uint8Array(e.slice(0,4))),version:t.getUint32(4,!0),length:t.getUint32(8,!0)},this.header.magic!==nf)throw new Error("THREE.GLTFLoader: Unsupported glTF-Binary header.");if(this.header.version<2)throw new Error("THREE.GLTFLoader: Legacy binary file detected.");const r=this.header.length-Ss,s=new DataView(e,Ss);let o=0;for(;o<r;){const a=s.getUint32(o,!0);o+=4;const l=s.getUint32(o,!0);if(o+=4,l===Sd.JSON){const c=new Uint8Array(e,Ss+o,a);this.content=n.decode(c)}else if(l===Sd.BIN){const c=Ss+o;this.body=e.slice(c,c+a)}o+=a}if(this.content===null)throw new Error("THREE.GLTFLoader: JSON content not found.")}}class Ky{constructor(e,t){if(!t)throw new Error("THREE.GLTFLoader: No DRACOLoader instance provided.");this.name=rt.KHR_DRACO_MESH_COMPRESSION,this.json=e,this.dracoLoader=t,this.dracoLoader.preload()}decodePrimitive(e,t){const n=this.json,r=this.dracoLoader,s=e.extensions[this.name].bufferView,o=e.extensions[this.name].attributes,a={},l={},c={};for(const u in o){const d=ic[u]||u.toLowerCase();a[d]=o[u]}for(const u in e.attributes){const d=ic[u]||u.toLowerCase();if(o[u]!==void 0){const h=n.accessors[e.attributes[u]],f=Or[h.componentType];c[d]=f.name,l[d]=h.normalized===!0}}return t.getDependency("bufferView",s).then(function(u){return new Promise(function(d,h){r.decodeDracoFile(u,function(f){for(const g in f.attributes){const _=f.attributes[g],m=l[g];m!==void 0&&(_.normalized=m)}d(f)},a,c,zt,h)})})}}class $y{constructor(){this.name=rt.KHR_TEXTURE_TRANSFORM}extendTexture(e,t){return(t.texCoord===void 0||t.texCoord===e.channel)&&t.offset===void 0&&t.rotation===void 0&&t.scale===void 0||(e=e.clone(),t.texCoord!==void 0&&(e.channel=t.texCoord),t.offset!==void 0&&e.offset.fromArray(t.offset),t.rotation!==void 0&&(e.rotation=t.rotation),t.scale!==void 0&&e.repeat.fromArray(t.scale),e.needsUpdate=!0),e}}class Yy{constructor(){this.name=rt.KHR_MESH_QUANTIZATION}}class rf extends Zs{constructor(e,t,n,r){super(e,t,n,r)}copySampleValue_(e){const t=this.resultBuffer,n=this.sampleValues,r=this.valueSize,s=e*r*3+r;for(let o=0;o!==r;o++)t[o]=n[s+o];return t}interpolate_(e,t,n,r){const s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=a*2,c=a*3,u=r-t,d=(n-t)/u,h=d*d,f=h*d,g=e*c,_=g-c,m=-2*f+3*h,p=f-h,M=1-m,S=p-h+d;for(let x=0;x!==a;x++){const A=o[_+x+a],C=o[_+x+l]*u,R=o[g+x+a],N=o[g+x]*u;s[x]=M*A+S*C+m*R+p*N}return s}}const jy=new Pn;class Jy extends rf{interpolate_(e,t,n,r){const s=super.interpolate_(e,t,n,r);return jy.fromArray(s).normalize().toArray(s),s}}const xn={POINTS:0,LINES:1,LINE_LOOP:2,LINE_STRIP:3,TRIANGLES:4,TRIANGLE_STRIP:5,TRIANGLE_FAN:6},Or={5120:Int8Array,5121:Uint8Array,5122:Int16Array,5123:Uint16Array,5125:Uint32Array,5126:Float32Array},Md={9728:nn,9729:Zt,9984:ch,9985:Bo,9986:Ms,9987:si},bd={33071:Ti,33648:Qo,10497:Vr},Za={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT2:4,MAT3:9,MAT4:16},ic={POSITION:"position",NORMAL:"normal",TANGENT:"tangent",TEXCOORD_0:"uv",TEXCOORD_1:"uv1",TEXCOORD_2:"uv2",TEXCOORD_3:"uv3",COLOR_0:"color",WEIGHTS_0:"skinWeight",JOINTS_0:"skinIndex"},yi={scale:"scale",translation:"position",rotation:"quaternion",weights:"morphTargetInfluences"},Zy={CUBICSPLINE:void 0,LINEAR:ks,STEP:Fs},Qa={OPAQUE:"OPAQUE",MASK:"MASK",BLEND:"BLEND"};function Qy(i){return i.DefaultMaterial===void 0&&(i.DefaultMaterial=new Ur({color:16777215,emissive:0,metalness:1,roughness:1,transparent:!1,depthTest:!0,side:Kn})),i.DefaultMaterial}function Gi(i,e,t){for(const n in t.extensions)i[n]===void 0&&(e.userData.gltfExtensions=e.userData.gltfExtensions||{},e.userData.gltfExtensions[n]=t.extensions[n])}function zn(i,e){e.extras!==void 0&&(typeof e.extras=="object"?Object.assign(i.userData,e.extras):console.warn("THREE.GLTFLoader: Ignoring primitive type .extras, "+e.extras))}function eS(i,e,t){let n=!1,r=!1,s=!1;for(let c=0,u=e.length;c<u;c++){const d=e[c];if(d.POSITION!==void 0&&(n=!0),d.NORMAL!==void 0&&(r=!0),d.COLOR_0!==void 0&&(s=!0),n&&r&&s)break}if(!n&&!r&&!s)return Promise.resolve(i);const o=[],a=[],l=[];for(let c=0,u=e.length;c<u;c++){const d=e[c];if(n){const h=d.POSITION!==void 0?t.getDependency("accessor",d.POSITION):i.attributes.position;o.push(h)}if(r){const h=d.NORMAL!==void 0?t.getDependency("accessor",d.NORMAL):i.attributes.normal;a.push(h)}if(s){const h=d.COLOR_0!==void 0?t.getDependency("accessor",d.COLOR_0):i.attributes.color;l.push(h)}}return Promise.all([Promise.all(o),Promise.all(a),Promise.all(l)]).then(function(c){const u=c[0],d=c[1],h=c[2];return n&&(i.morphAttributes.position=u),r&&(i.morphAttributes.normal=d),s&&(i.morphAttributes.color=h),i.morphTargetsRelative=!0,i})}function tS(i,e){if(i.updateMorphTargets(),e.weights!==void 0)for(let t=0,n=e.weights.length;t<n;t++)i.morphTargetInfluences[t]=e.weights[t];if(e.extras&&Array.isArray(e.extras.targetNames)){const t=e.extras.targetNames;if(i.morphTargetInfluences.length===t.length){i.morphTargetDictionary={};for(let n=0,r=t.length;n<r;n++)i.morphTargetDictionary[t[n]]=n}else console.warn("THREE.GLTFLoader: Invalid extras.targetNames length. Ignoring names.")}}function nS(i){let e;const t=i.extensions&&i.extensions[rt.KHR_DRACO_MESH_COMPRESSION];if(t?e="draco:"+t.bufferView+":"+t.indices+":"+el(t.attributes):e=i.indices+":"+el(i.attributes)+":"+i.mode,i.targets!==void 0)for(let n=0,r=i.targets.length;n<r;n++)e+=":"+el(i.targets[n]);return e}function el(i){let e="";const t=Object.keys(i).sort();for(let n=0,r=t.length;n<r;n++)e+=t[n]+":"+i[t[n]]+";";return e}function rc(i){switch(i){case Int8Array:return 1/127;case Uint8Array:return 1/255;case Int16Array:return 1/32767;case Uint16Array:return 1/65535;default:throw new Error("THREE.GLTFLoader: Unsupported normalized accessor component type.")}}function iS(i){return i.search(/\.jpe?g($|\?)/i)>0||i.search(/^data\:image\/jpeg/)===0?"image/jpeg":i.search(/\.webp($|\?)/i)>0||i.search(/^data\:image\/webp/)===0?"image/webp":i.search(/\.ktx2($|\?)/i)>0||i.search(/^data\:image\/ktx2/)===0?"image/ktx2":"image/png"}const rS=new $e;class sS{constructor(e={},t={}){this.json=e,this.extensions={},this.plugins={},this.options=t,this.cache=new Ay,this.associations=new Map,this.primitiveCache={},this.nodeCache={},this.meshCache={refs:{},uses:{}},this.cameraCache={refs:{},uses:{}},this.lightCache={refs:{},uses:{}},this.sourceCache={},this.textureCache={},this.nodeNamesUsed={};let n=!1,r=-1,s=!1,o=-1;if(typeof navigator<"u"){const a=navigator.userAgent;n=/^((?!chrome|android).)*safari/i.test(a)===!0;const l=a.match(/Version\/(\d+)/);r=n&&l?parseInt(l[1],10):-1,s=a.indexOf("Firefox")>-1,o=s?a.match(/Firefox\/([0-9]+)\./)[1]:-1}typeof createImageBitmap>"u"||n&&r<17||s&&o<98?this.textureLoader=new Ag(this.options.manager):this.textureLoader=new Ig(this.options.manager),this.textureLoader.setCrossOrigin(this.options.crossOrigin),this.textureLoader.setRequestHeader(this.options.requestHeader),this.fileLoader=new $h(this.options.manager),this.fileLoader.setResponseType("arraybuffer"),this.options.crossOrigin==="use-credentials"&&this.fileLoader.setWithCredentials(!0)}setExtensions(e){this.extensions=e}setPlugins(e){this.plugins=e}parse(e,t){const n=this,r=this.json,s=this.extensions;this.cache.removeAll(),this.nodeCache={},this._invokeAll(function(o){return o._markDefs&&o._markDefs()}),Promise.all(this._invokeAll(function(o){return o.beforeRoot&&o.beforeRoot()})).then(function(){return Promise.all([n.getDependencies("scene"),n.getDependencies("animation"),n.getDependencies("camera")])}).then(function(o){const a={scene:o[0][r.scene||0],scenes:o[0],animations:o[1],cameras:o[2],asset:r.asset,parser:n,userData:{}};return Gi(s,a,r),zn(a,r),Promise.all(n._invokeAll(function(l){return l.afterRoot&&l.afterRoot(a)})).then(function(){for(const l of a.scenes)l.updateMatrixWorld();e(a)})}).catch(t)}_markDefs(){const e=this.json.nodes||[],t=this.json.skins||[],n=this.json.meshes||[];for(let r=0,s=t.length;r<s;r++){const o=t[r].joints;for(let a=0,l=o.length;a<l;a++)e[o[a]].isBone=!0}for(let r=0,s=e.length;r<s;r++){const o=e[r];o.mesh!==void 0&&(this._addNodeRef(this.meshCache,o.mesh),o.skin!==void 0&&(n[o.mesh].isSkinnedMesh=!0)),o.camera!==void 0&&this._addNodeRef(this.cameraCache,o.camera)}}_addNodeRef(e,t){t!==void 0&&(e.refs[t]===void 0&&(e.refs[t]=e.uses[t]=0),e.refs[t]++)}_getNodeRef(e,t,n){if(e.refs[t]<=1)return n;const r=n.clone(),s=(o,a)=>{const l=this.associations.get(o);l!=null&&this.associations.set(a,l);for(const[c,u]of o.children.entries())s(u,a.children[c])};return s(n,r),r.name+="_instance_"+e.uses[t]++,r}_invokeOne(e){const t=Object.values(this.plugins);t.push(this);for(let n=0;n<t.length;n++){const r=e(t[n]);if(r)return r}return null}_invokeAll(e){const t=Object.values(this.plugins);t.unshift(this);const n=[];for(let r=0;r<t.length;r++){const s=e(t[r]);s&&n.push(s)}return n}getDependency(e,t){const n=e+":"+t;let r=this.cache.get(n);if(!r){switch(e){case"scene":r=this.loadScene(t);break;case"node":r=this._invokeOne(function(s){return s.loadNode&&s.loadNode(t)});break;case"mesh":r=this._invokeOne(function(s){return s.loadMesh&&s.loadMesh(t)});break;case"accessor":r=this.loadAccessor(t);break;case"bufferView":r=this._invokeOne(function(s){return s.loadBufferView&&s.loadBufferView(t)});break;case"buffer":r=this.loadBuffer(t);break;case"material":r=this._invokeOne(function(s){return s.loadMaterial&&s.loadMaterial(t)});break;case"texture":r=this._invokeOne(function(s){return s.loadTexture&&s.loadTexture(t)});break;case"skin":r=this.loadSkin(t);break;case"animation":r=this._invokeOne(function(s){return s.loadAnimation&&s.loadAnimation(t)});break;case"camera":r=this.loadCamera(t);break;default:if(r=this._invokeOne(function(s){return s!=this&&s.getDependency&&s.getDependency(e,t)}),!r)throw new Error("Unknown type: "+e);break}this.cache.add(n,r)}return r}getDependencies(e){let t=this.cache.get(e);if(!t){const n=this,r=this.json[e+(e==="mesh"?"es":"s")]||[];t=Promise.all(r.map(function(s,o){return n.getDependency(e,o)})),this.cache.add(e,t)}return t}loadBuffer(e){const t=this.json.buffers[e],n=this.fileLoader;if(t.type&&t.type!=="arraybuffer")throw new Error("THREE.GLTFLoader: "+t.type+" buffer type is not supported.");if(t.uri===void 0&&e===0)return Promise.resolve(this.extensions[rt.KHR_BINARY_GLTF].body);const r=this.options;return new Promise(function(s,o){n.load(Ls.resolveURL(t.uri,r.path),s,void 0,function(){o(new Error('THREE.GLTFLoader: Failed to load buffer "'+t.uri+'".'))})})}loadBufferView(e){const t=this.json.bufferViews[e];return this.getDependency("buffer",t.buffer).then(function(n){const r=t.byteLength||0,s=t.byteOffset||0;return n.slice(s,s+r)})}loadAccessor(e){const t=this,n=this.json,r=this.json.accessors[e];if(r.bufferView===void 0&&r.sparse===void 0){const o=Za[r.type],a=Or[r.componentType],l=r.normalized===!0,c=new a(r.count*o);return Promise.resolve(new Bt(c,o,l))}const s=[];return r.bufferView!==void 0?s.push(this.getDependency("bufferView",r.bufferView)):s.push(null),r.sparse!==void 0&&(s.push(this.getDependency("bufferView",r.sparse.indices.bufferView)),s.push(this.getDependency("bufferView",r.sparse.values.bufferView))),Promise.all(s).then(function(o){const a=o[0],l=Za[r.type],c=Or[r.componentType],u=c.BYTES_PER_ELEMENT,d=u*l,h=r.byteOffset||0,f=r.bufferView!==void 0?n.bufferViews[r.bufferView].byteStride:void 0,g=r.normalized===!0;let _,m;if(f&&f!==d){const p=Math.floor(h/f),M="InterleavedBuffer:"+r.bufferView+":"+r.componentType+":"+p+":"+r.count;let S=t.cache.get(M);S||(_=new c(a,p*f,r.count*f/u),S=new bm(_,f/u),t.cache.add(M,S)),m=new Lc(S,l,h%f/u,g)}else a===null?_=new c(r.count*l):_=new c(a,h,r.count*l),m=new Bt(_,l,g);if(r.sparse!==void 0){const p=Za.SCALAR,M=Or[r.sparse.indices.componentType],S=r.sparse.indices.byteOffset||0,x=r.sparse.values.byteOffset||0,A=new M(o[1],S,r.sparse.count*p),C=new c(o[2],x,r.sparse.count*l);a!==null&&(m=new Bt(m.array.slice(),m.itemSize,m.normalized)),m.normalized=!1;for(let R=0,N=A.length;R<N;R++){const w=A[R];if(m.setX(w,C[R*l]),l>=2&&m.setY(w,C[R*l+1]),l>=3&&m.setZ(w,C[R*l+2]),l>=4&&m.setW(w,C[R*l+3]),l>=5)throw new Error("THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.")}m.normalized=g}return m})}loadTexture(e){const t=this.json,n=this.options,s=t.textures[e].source,o=t.images[s];let a=this.textureLoader;if(o.uri){const l=n.manager.getHandler(o.uri);l!==null&&(a=l)}return this.loadTextureImage(e,s,a)}loadTextureImage(e,t,n){const r=this,s=this.json,o=s.textures[e],a=s.images[t],l=(a.uri||a.bufferView)+":"+o.sampler;if(this.textureCache[l])return this.textureCache[l];const c=this.loadImageSource(t,n).then(function(u){u.flipY=!1,u.name=o.name||a.name||"",u.name===""&&typeof a.uri=="string"&&a.uri.startsWith("data:image/")===!1&&(u.name=a.uri);const h=(s.samplers||{})[o.sampler]||{};return u.magFilter=Md[h.magFilter]||Zt,u.minFilter=Md[h.minFilter]||si,u.wrapS=bd[h.wrapS]||Vr,u.wrapT=bd[h.wrapT]||Vr,u.generateMipmaps=!u.isCompressedTexture&&u.minFilter!==nn&&u.minFilter!==Zt,r.associations.set(u,{textures:e}),u}).catch(function(){return null});return this.textureCache[l]=c,c}loadImageSource(e,t){const n=this,r=this.json,s=this.options;if(this.sourceCache[e]!==void 0)return this.sourceCache[e].then(d=>d.clone());const o=r.images[e],a=self.URL||self.webkitURL;let l=o.uri||"",c=!1;if(o.bufferView!==void 0)l=n.getDependency("bufferView",o.bufferView).then(function(d){c=!0;const h=new Blob([d],{type:o.mimeType});return l=a.createObjectURL(h),l});else if(o.uri===void 0)throw new Error("THREE.GLTFLoader: Image "+e+" is missing URI and bufferView");const u=Promise.resolve(l).then(function(d){return new Promise(function(h,f){let g=h;t.isImageBitmapLoader===!0&&(g=function(_){const m=new Ft(_);m.needsUpdate=!0,h(m)}),t.load(Ls.resolveURL(d,s.path),g,void 0,f)})}).then(function(d){return c===!0&&a.revokeObjectURL(l),zn(d,o),d.userData.mimeType=o.mimeType||iS(o.uri),d}).catch(function(d){throw console.error("THREE.GLTFLoader: Couldn't load texture",l),d});return this.sourceCache[e]=u,u}assignTexture(e,t,n,r){const s=this;return this.getDependency("texture",n.index).then(function(o){if(!o)return null;if(n.texCoord!==void 0&&n.texCoord>0&&(o=o.clone(),o.channel=n.texCoord),s.extensions[rt.KHR_TEXTURE_TRANSFORM]){const a=n.extensions!==void 0?n.extensions[rt.KHR_TEXTURE_TRANSFORM]:void 0;if(a){const l=s.associations.get(o);o=s.extensions[rt.KHR_TEXTURE_TRANSFORM].extendTexture(o,a),s.associations.set(o,l)}}return r!==void 0&&(o.colorSpace=r),e[t]=o,o})}assignFinalMaterial(e){const t=e.geometry;let n=e.material;const r=t.attributes.tangent===void 0,s=t.attributes.color!==void 0,o=t.attributes.normal===void 0;if(e.isPoints){const a="PointsMaterial:"+n.uuid;let l=this.cache.get(a);l||(l=new Nh,Xn.prototype.copy.call(l,n),l.color.copy(n.color),l.map=n.map,l.sizeAttenuation=!1,this.cache.add(a,l)),n=l}else if(e.isLine){const a="LineBasicMaterial:"+n.uuid;let l=this.cache.get(a);l||(l=new Ih,Xn.prototype.copy.call(l,n),l.color.copy(n.color),l.map=n.map,this.cache.add(a,l)),n=l}if(r||s||o){let a="ClonedMaterial:"+n.uuid+":";r&&(a+="derivative-tangents:"),s&&(a+="vertex-colors:"),o&&(a+="flat-shading:");let l=this.cache.get(a);l||(l=n.clone(),s&&(l.vertexColors=!0),o&&(l.flatShading=!0),r&&(l.normalScale&&(l.normalScale.y*=-1),l.clearcoatNormalScale&&(l.clearcoatNormalScale.y*=-1)),this.cache.add(a,l),this.associations.set(l,this.associations.get(n))),n=l}e.material=n}getMaterialType(){return Ur}loadMaterial(e){const t=this,n=this.json,r=this.extensions,s=n.materials[e];let o;const a={},l=s.extensions||{},c=[];if(l[rt.KHR_MATERIALS_UNLIT]){const d=r[rt.KHR_MATERIALS_UNLIT];o=d.getMaterialType(),c.push(d.extendParams(a,s,t))}else{const d=s.pbrMetallicRoughness||{};if(a.color=new Ge(1,1,1),a.opacity=1,Array.isArray(d.baseColorFactor)){const h=d.baseColorFactor;a.color.setRGB(h[0],h[1],h[2],zt),a.opacity=h[3]}d.baseColorTexture!==void 0&&c.push(t.assignTexture(a,"map",d.baseColorTexture,Ut)),a.metalness=d.metallicFactor!==void 0?d.metallicFactor:1,a.roughness=d.roughnessFactor!==void 0?d.roughnessFactor:1,d.metallicRoughnessTexture!==void 0&&(c.push(t.assignTexture(a,"metalnessMap",d.metallicRoughnessTexture)),c.push(t.assignTexture(a,"roughnessMap",d.metallicRoughnessTexture))),o=this._invokeOne(function(h){return h.getMaterialType&&h.getMaterialType(e)}),c.push(Promise.all(this._invokeAll(function(h){return h.extendMaterialParams&&h.extendMaterialParams(e,a)})))}s.doubleSided===!0&&(a.side=fn);const u=s.alphaMode||Qa.OPAQUE;if(u===Qa.BLEND?(a.transparent=!0,a.depthWrite=!1):(a.transparent=!1,u===Qa.MASK&&(a.alphaTest=s.alphaCutoff!==void 0?s.alphaCutoff:.5)),s.normalTexture!==void 0&&o!==oi&&(c.push(t.assignTexture(a,"normalMap",s.normalTexture)),a.normalScale=new _e(1,1),s.normalTexture.scale!==void 0)){const d=s.normalTexture.scale;a.normalScale.set(d,d)}if(s.occlusionTexture!==void 0&&o!==oi&&(c.push(t.assignTexture(a,"aoMap",s.occlusionTexture)),s.occlusionTexture.strength!==void 0&&(a.aoMapIntensity=s.occlusionTexture.strength)),s.emissiveFactor!==void 0&&o!==oi){const d=s.emissiveFactor;a.emissive=new Ge().setRGB(d[0],d[1],d[2],zt)}return s.emissiveTexture!==void 0&&o!==oi&&c.push(t.assignTexture(a,"emissiveMap",s.emissiveTexture,Ut)),Promise.all(c).then(function(){const d=new o(a);return s.name&&(d.name=s.name),zn(d,s),t.associations.set(d,{materials:e}),s.extensions&&Gi(r,d,s),d})}createUniqueName(e){const t=pt.sanitizeNodeName(e||"");return t in this.nodeNamesUsed?t+"_"+ ++this.nodeNamesUsed[t]:(this.nodeNamesUsed[t]=0,t)}loadGeometries(e){const t=this,n=this.extensions,r=this.primitiveCache;function s(a){return n[rt.KHR_DRACO_MESH_COMPRESSION].decodePrimitive(a,t).then(function(l){return wd(l,a,t)})}const o=[];for(let a=0,l=e.length;a<l;a++){const c=e[a],u=nS(c),d=r[u];if(d)o.push(d.promise);else{let h;c.extensions&&c.extensions[rt.KHR_DRACO_MESH_COMPRESSION]?h=s(c):h=wd(new ln,c,t),r[u]={primitive:c,promise:h},o.push(h)}}return Promise.all(o)}loadMesh(e){const t=this,n=this.json,r=this.extensions,s=n.meshes[e],o=s.primitives,a=[];for(let l=0,c=o.length;l<c;l++){const u=o[l].material===void 0?Qy(this.cache):this.getDependency("material",o[l].material);a.push(u)}return a.push(t.loadGeometries(o)),Promise.all(a).then(function(l){const c=l.slice(0,l.length-1),u=l[l.length-1],d=[];for(let f=0,g=u.length;f<g;f++){const _=u[f],m=o[f];let p;const M=c[f];if(m.mode===xn.TRIANGLES||m.mode===xn.TRIANGLE_STRIP||m.mode===xn.TRIANGLE_FAN||m.mode===void 0)p=s.isSkinnedMesh===!0?new Em(_,M):new kt(_,M),p.isSkinnedMesh===!0&&p.normalizeSkinWeights(),m.mode===xn.TRIANGLE_STRIP?p.geometry=yd(p.geometry,_h):m.mode===xn.TRIANGLE_FAN&&(p.geometry=yd(p.geometry,$l));else if(m.mode===xn.LINES)p=new Pm(_,M);else if(m.mode===xn.LINE_STRIP)p=new Nc(_,M);else if(m.mode===xn.LINE_LOOP)p=new Im(_,M);else if(m.mode===xn.POINTS)p=new Dh(_,M);else throw new Error("THREE.GLTFLoader: Primitive mode unsupported: "+m.mode);Object.keys(p.geometry.morphAttributes).length>0&&tS(p,s),p.name=t.createUniqueName(s.name||"mesh_"+e),zn(p,s),m.extensions&&Gi(r,p,m),t.assignFinalMaterial(p),d.push(p)}for(let f=0,g=d.length;f<g;f++)t.associations.set(d[f],{meshes:e,primitives:f});if(d.length===1)return s.extensions&&Gi(r,d[0],s),d[0];const h=new Ln;s.extensions&&Gi(r,h,s),t.associations.set(h,{meshes:e});for(let f=0,g=d.length;f<g;f++)h.add(d[f]);return h})}loadCamera(e){let t;const n=this.json.cameras[e],r=n[n.type];if(!r){console.warn("THREE.GLTFLoader: Missing camera parameters.");return}return n.type==="perspective"?t=new Jt(Ei.radToDeg(r.yfov),r.aspectRatio||1,r.znear||1,r.zfar||2e6):n.type==="orthographic"&&(t=new Bc(-r.xmag,r.xmag,r.ymag,-r.ymag,r.znear,r.zfar)),n.name&&(t.name=this.createUniqueName(n.name)),zn(t,n),Promise.resolve(t)}loadSkin(e){const t=this.json.skins[e],n=[];for(let r=0,s=t.joints.length;r<s;r++)n.push(this._loadNodeShallow(t.joints[r]));return t.inverseBindMatrices!==void 0?n.push(this.getDependency("accessor",t.inverseBindMatrices)):n.push(null),Promise.all(n).then(function(r){const s=r.pop(),o=r,a=[],l=[];for(let c=0,u=o.length;c<u;c++){const d=o[c];if(d){a.push(d);const h=new $e;s!==null&&h.fromArray(s.array,c*16),l.push(h)}else console.warn('THREE.GLTFLoader: Joint "%s" could not be found.',t.joints[c])}return new Pc(a,l)})}loadAnimation(e){const t=this.json,n=this,r=t.animations[e],s=r.name?r.name:"animation_"+e,o=[],a=[],l=[],c=[],u=[];for(let d=0,h=r.channels.length;d<h;d++){const f=r.channels[d],g=r.samplers[f.sampler],_=f.target,m=_.node,p=r.parameters!==void 0?r.parameters[g.input]:g.input,M=r.parameters!==void 0?r.parameters[g.output]:g.output;_.node!==void 0&&(o.push(this.getDependency("node",m)),a.push(this.getDependency("accessor",p)),l.push(this.getDependency("accessor",M)),c.push(g),u.push(_))}return Promise.all([Promise.all(o),Promise.all(a),Promise.all(l),Promise.all(c),Promise.all(u)]).then(function(d){const h=d[0],f=d[1],g=d[2],_=d[3],m=d[4],p=[];for(let S=0,x=h.length;S<x;S++){const A=h[S],C=f[S],R=g[S],N=_[S],w=m[S];if(A===void 0)continue;A.updateMatrix&&A.updateMatrix();const y=n._createAnimationTracks(A,C,R,N,w);if(y)for(let L=0;L<y.length;L++)p.push(y[L])}const M=new yg(s,void 0,p);return zn(M,r),M})}createNodeMesh(e){const t=this.json,n=this,r=t.nodes[e];return r.mesh===void 0?null:n.getDependency("mesh",r.mesh).then(function(s){const o=n._getNodeRef(n.meshCache,r.mesh,s);return r.weights!==void 0&&o.traverse(function(a){if(a.isMesh)for(let l=0,c=r.weights.length;l<c;l++)a.morphTargetInfluences[l]=r.weights[l]}),o})}loadNode(e){const t=this.json,n=this,r=t.nodes[e],s=n._loadNodeShallow(e),o=[],a=r.children||[];for(let c=0,u=a.length;c<u;c++)o.push(n.getDependency("node",a[c]));const l=r.skin===void 0?Promise.resolve(null):n.getDependency("skin",r.skin);return Promise.all([s,Promise.all(o),l]).then(function(c){const u=c[0],d=c[1],h=c[2];h!==null&&u.traverse(function(f){f.isSkinnedMesh&&f.bind(h,rS)});for(let f=0,g=d.length;f<g;f++)u.add(d[f]);return u})}_loadNodeShallow(e){const t=this.json,n=this.extensions,r=this;if(this.nodeCache[e]!==void 0)return this.nodeCache[e];const s=t.nodes[e],o=s.name?r.createUniqueName(s.name):"",a=[],l=r._invokeOne(function(c){return c.createNodeMesh&&c.createNodeMesh(e)});return l&&a.push(l),s.camera!==void 0&&a.push(r.getDependency("camera",s.camera).then(function(c){return r._getNodeRef(r.cameraCache,s.camera,c)})),r._invokeAll(function(c){return c.createNodeAttachment&&c.createNodeAttachment(e)}).forEach(function(c){a.push(c)}),this.nodeCache[e]=Promise.all(a).then(function(c){let u;if(s.isBone===!0?u=new Lh:c.length>1?u=new Ln:c.length===1?u=c[0]:u=new Mt,u!==c[0])for(let d=0,h=c.length;d<h;d++)u.add(c[d]);if(s.name&&(u.userData.name=s.name,u.name=o),zn(u,s),s.extensions&&Gi(n,u,s),s.matrix!==void 0){const d=new $e;d.fromArray(s.matrix),u.applyMatrix4(d)}else s.translation!==void 0&&u.position.fromArray(s.translation),s.rotation!==void 0&&u.quaternion.fromArray(s.rotation),s.scale!==void 0&&u.scale.fromArray(s.scale);if(!r.associations.has(u))r.associations.set(u,{});else if(s.mesh!==void 0&&r.meshCache.refs[s.mesh]>1){const d=r.associations.get(u);r.associations.set(u,{...d})}return r.associations.get(u).nodes=e,u}),this.nodeCache[e]}loadScene(e){const t=this.extensions,n=this.json.scenes[e],r=this,s=new Ln;n.name&&(s.name=r.createUniqueName(n.name)),zn(s,n),n.extensions&&Gi(t,s,n);const o=n.nodes||[],a=[];for(let l=0,c=o.length;l<c;l++)a.push(r.getDependency("node",o[l]));return Promise.all(a).then(function(l){for(let u=0,d=l.length;u<d;u++)s.add(l[u]);const c=u=>{const d=new Map;for(const[h,f]of r.associations)(h instanceof Xn||h instanceof Ft)&&d.set(h,f);return u.traverse(h=>{const f=r.associations.get(h);f!=null&&d.set(h,f)}),d};return r.associations=c(s),s})}_createAnimationTracks(e,t,n,r,s){const o=[],a=e.name?e.name:e.uuid,l=[];yi[s.path]===yi.weights?e.traverse(function(h){h.morphTargetInfluences&&l.push(h.name?h.name:h.uuid)}):l.push(a);let c;switch(yi[s.path]){case yi.weights:c=Kr;break;case yi.rotation:c=$r;break;case yi.translation:case yi.scale:c=Yr;break;default:n.itemSize===1?c=Kr:c=Yr;break}const u=r.interpolation!==void 0?Zy[r.interpolation]:ks,d=this._getArrayFromAccessor(n);for(let h=0,f=l.length;h<f;h++){const g=new c(l[h]+"."+yi[s.path],t.array,d,u);r.interpolation==="CUBICSPLINE"&&this._createCubicSplineTrackInterpolant(g),o.push(g)}return o}_getArrayFromAccessor(e){let t=e.array;if(e.normalized){const n=rc(t.constructor),r=new Float32Array(t.length);for(let s=0,o=t.length;s<o;s++)r[s]=t[s]*n;t=r}return t}_createCubicSplineTrackInterpolant(e){e.createInterpolant=function(n){const r=this instanceof $r?Jy:rf;return new r(this.times,this.values,this.getValueSize()/3,n)},e.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline=!0}}function oS(i,e,t){const n=e.attributes,r=new Nn;if(n.POSITION!==void 0){const a=t.json.accessors[n.POSITION],l=a.min,c=a.max;if(l!==void 0&&c!==void 0){if(r.set(new I(l[0],l[1],l[2]),new I(c[0],c[1],c[2])),a.normalized){const u=rc(Or[a.componentType]);r.min.multiplyScalar(u),r.max.multiplyScalar(u)}}else{console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.");return}}else return;const s=e.targets;if(s!==void 0){const a=new I,l=new I;for(let c=0,u=s.length;c<u;c++){const d=s[c];if(d.POSITION!==void 0){const h=t.json.accessors[d.POSITION],f=h.min,g=h.max;if(f!==void 0&&g!==void 0){if(l.setX(Math.max(Math.abs(f[0]),Math.abs(g[0]))),l.setY(Math.max(Math.abs(f[1]),Math.abs(g[1]))),l.setZ(Math.max(Math.abs(f[2]),Math.abs(g[2]))),h.normalized){const _=rc(Or[h.componentType]);l.multiplyScalar(_)}a.max(l)}else console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.")}}r.expandByVector(a)}i.boundingBox=r;const o=new $n;r.getCenter(o.center),o.radius=r.min.distanceTo(r.max)/2,i.boundingSphere=o}function wd(i,e,t){const n=e.attributes,r=[];function s(o,a){return t.getDependency("accessor",o).then(function(l){i.setAttribute(a,l)})}for(const o in n){const a=ic[o]||o.toLowerCase();a in i.attributes||r.push(s(n[o],a))}if(e.indices!==void 0&&!i.index){const o=t.getDependency("accessor",e.indices).then(function(a){i.setIndex(a)});r.push(o)}return ot.workingColorSpace!==zt&&"COLOR_0"in n&&console.warn(`THREE.GLTFLoader: Converting vertex colors from "srgb-linear" to "${ot.workingColorSpace}" not supported.`),zn(i,e),oS(i,e,t),Promise.all(r).then(function(){return e.targets!==void 0?eS(i,e.targets,t):i})}function aS(i,e,t,n){const r=Object.entries(i);class s extends Un{static key=Ei.generateUUID();constructor(a){super({uniforms:r.reduce((l,[c,u])=>{const d=Ah.clone({[c]:{value:u}});return{...l,...d}},{}),vertexShader:e,fragmentShader:t});for(const[l]of r)Object.defineProperty(this,l,{get:()=>this.uniforms[l].value,set:c=>this.uniforms[l].value=c});Object.assign(this,a)}}return s}const lS=aS({},"void main() { }","void main() { gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0); discard;  }");class cS extends Mn{constructor({samples:e=6,transmissionSampler:t=!1,chromaticAberration:n=.05,transmission:r=0,_transmission:s=1,transmissionMap:o=null,roughness:a=0,thickness:l=0,thicknessMap:c=null,attenuationDistance:u=1/0,attenuationColor:d=new Ge("white"),anisotropicBlur:h=.1,time:f=0,distortion:g=0,distortionScale:_=.5,temporalDistortion:m=0,buffer:p=null}={}){super(),this.uniforms={chromaticAberration:{value:n},transmission:{value:r},_transmission:{value:s},transmissionMap:{value:o},roughness:{value:a},thickness:{value:l},thicknessMap:{value:c},attenuationDistance:{value:u},attenuationColor:{value:d},anisotropicBlur:{value:h},time:{value:f},distortion:{value:g},distortionScale:{value:_},temporalDistortion:{value:m},buffer:{value:p}},this.onBeforeCompile=M=>{M.uniforms={...M.uniforms,...this.uniforms},t?M.defines.USE_SAMPLER="":M.defines.USE_TRANSMISSION="",M.fragmentShader=`
      uniform float chromaticAberration;         
      uniform float anisotropicBlur;      
      uniform float time;
      uniform float distortion;
      uniform float distortionScale;
      uniform float temporalDistortion;
      uniform sampler2D buffer;

      vec3 random3(vec3 c) {
        float j = 4096.0*sin(dot(c,vec3(17.0, 59.4, 15.0)));
        vec3 r;
        r.z = fract(512.0*j);
        j *= .125;
        r.x = fract(512.0*j);
        j *= .125;
        r.y = fract(512.0*j);
        return r-0.5;
      }

      uint hash( uint x ) {
        x += ( x << 10u );
        x ^= ( x >>  6u );
        x += ( x <<  3u );
        x ^= ( x >> 11u );
        x += ( x << 15u );
        return x;
      }

      // Compound versions of the hashing algorithm I whipped together.
      uint hash( uvec2 v ) { return hash( v.x ^ hash(v.y)                         ); }
      uint hash( uvec3 v ) { return hash( v.x ^ hash(v.y) ^ hash(v.z)             ); }
      uint hash( uvec4 v ) { return hash( v.x ^ hash(v.y) ^ hash(v.z) ^ hash(v.w) ); }

      // Construct a float with half-open range [0:1] using low 23 bits.
      // All zeroes yields 0.0, all ones yields the next smallest representable value below 1.0.
      float floatConstruct( uint m ) {
        const uint ieeeMantissa = 0x007FFFFFu; // binary32 mantissa bitmask
        const uint ieeeOne      = 0x3F800000u; // 1.0 in IEEE binary32
        m &= ieeeMantissa;                     // Keep only mantissa bits (fractional part)
        m |= ieeeOne;                          // Add fractional part to 1.0
        float  f = uintBitsToFloat( m );       // Range [1:2]
        return f - 1.0;                        // Range [0:1]
      }

      // Pseudo-random value in half-open range [0:1].
      float randomBase( float x ) { return floatConstruct(hash(floatBitsToUint(x))); }
      float randomBase( vec2  v ) { return floatConstruct(hash(floatBitsToUint(v))); }
      float randomBase( vec3  v ) { return floatConstruct(hash(floatBitsToUint(v))); }
      float randomBase( vec4  v ) { return floatConstruct(hash(floatBitsToUint(v))); }
      float rand(float seed) {
        float result = randomBase(vec3(gl_FragCoord.xy, seed));
        return result;
      }

      const float F3 =  0.3333333;
      const float G3 =  0.1666667;

      float snoise(vec3 p) {
        vec3 s = floor(p + dot(p, vec3(F3)));
        vec3 x = p - s + dot(s, vec3(G3));
        vec3 e = step(vec3(0.0), x - x.yzx);
        vec3 i1 = e*(1.0 - e.zxy);
        vec3 i2 = 1.0 - e.zxy*(1.0 - e);
        vec3 x1 = x - i1 + G3;
        vec3 x2 = x - i2 + 2.0*G3;
        vec3 x3 = x - 1.0 + 3.0*G3;
        vec4 w, d;
        w.x = dot(x, x);
        w.y = dot(x1, x1);
        w.z = dot(x2, x2);
        w.w = dot(x3, x3);
        w = max(0.6 - w, 0.0);
        d.x = dot(random3(s), x);
        d.y = dot(random3(s + i1), x1);
        d.z = dot(random3(s + i2), x2);
        d.w = dot(random3(s + 1.0), x3);
        w *= w;
        w *= w;
        d *= w;
        return dot(d, vec4(52.0));
      }

      float snoiseFractal(vec3 m) {
        return 0.5333333* snoise(m)
              +0.2666667* snoise(2.0*m)
              +0.1333333* snoise(4.0*m)
              +0.0666667* snoise(8.0*m);
      }
`+M.fragmentShader,M.fragmentShader=M.fragmentShader.replace("#include <transmission_pars_fragment>",`
        #ifdef USE_TRANSMISSION
          // Transmission code is based on glTF-Sampler-Viewer
          // https://github.com/KhronosGroup/glTF-Sample-Viewer
          uniform float _transmission;
          uniform float thickness;
          uniform float attenuationDistance;
          uniform vec3 attenuationColor;
          #ifdef USE_TRANSMISSIONMAP
            uniform sampler2D transmissionMap;
          #endif
          #ifdef USE_THICKNESSMAP
            uniform sampler2D thicknessMap;
          #endif
          uniform vec2 transmissionSamplerSize;
          uniform sampler2D transmissionSamplerMap;
          uniform mat4 modelMatrix;
          uniform mat4 projectionMatrix;
          varying vec3 vWorldPosition;
          vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
            // Direction of refracted light.
            vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
            // Compute rotation-independant scaling of the model matrix.
            vec3 modelScale;
            modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
            modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
            modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
            // The thickness is specified in local space.
            return normalize( refractionVector ) * thickness * modelScale;
          }
          float applyIorToRoughness( const in float roughness, const in float ior ) {
            // Scale roughness with IOR so that an IOR of 1.0 results in no microfacet refraction and
            // an IOR of 1.5 results in the default amount of microfacet refraction.
            return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
          }
          vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
            float framebufferLod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );            
            #ifdef USE_SAMPLER
              #ifdef texture2DLodEXT
                return texture2DLodEXT(transmissionSamplerMap, fragCoord.xy, framebufferLod);
              #else
                return texture2D(transmissionSamplerMap, fragCoord.xy, framebufferLod);
              #endif
            #else
              return texture2D(buffer, fragCoord.xy);
            #endif
          }
          vec3 applyVolumeAttenuation( const in vec3 radiance, const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
            if ( isinf( attenuationDistance ) ) {
              // Attenuation distance is +∞, i.e. the transmitted color is not attenuated at all.
              return radiance;
            } else {
              // Compute light attenuation using Beer's law.
              vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
              vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance ); // Beer's law
              return transmittance * radiance;
            }
          }
          vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
            const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
            const in mat4 viewMatrix, const in mat4 projMatrix, const in float ior, const in float thickness,
            const in vec3 attenuationColor, const in float attenuationDistance ) {
            vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
            vec3 refractedRayExit = position + transmissionRay;
            // Project refracted vector on the framebuffer, while mapping to normalized device coordinates.
            vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
            vec2 refractionCoords = ndcPos.xy / ndcPos.w;
            refractionCoords += 1.0;
            refractionCoords /= 2.0;
            // Sample framebuffer to get pixel the refracted ray hits.
            vec4 transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
            vec3 attenuatedColor = applyVolumeAttenuation( transmittedLight.rgb, length( transmissionRay ), attenuationColor, attenuationDistance );
            // Get the specular component.
            vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
            return vec4( ( 1.0 - F ) * attenuatedColor * diffuseColor, transmittedLight.a );
          }
        #endif
`),M.fragmentShader=M.fragmentShader.replace("#include <transmission_fragment>",`  
        // Improve the refraction to use the world pos
        material.transmission = _transmission;
        material.transmissionAlpha = 1.0;
        material.thickness = thickness;
        material.attenuationDistance = attenuationDistance;
        material.attenuationColor = attenuationColor;
        #ifdef USE_TRANSMISSIONMAP
          material.transmission *= texture2D( transmissionMap, vUv ).r;
        #endif
        #ifdef USE_THICKNESSMAP
          material.thickness *= texture2D( thicknessMap, vUv ).g;
        #endif
        
        vec3 pos = vWorldPosition;
        float runningSeed = 0.0;
        vec3 v = normalize( cameraPosition - pos );
        vec3 n = inverseTransformDirection( normal, viewMatrix );
        vec3 transmission = vec3(0.0);
        float transmissionR, transmissionB, transmissionG;
        float randomCoords = rand(runningSeed++);
        float thickness_smear = thickness * max(pow(roughnessFactor, 0.33), anisotropicBlur);
        vec3 distortionNormal = vec3(0.0);
        vec3 temporalOffset = vec3(time, -time, -time) * temporalDistortion;
        if (distortion > 0.0) {
          distortionNormal = distortion * vec3(snoiseFractal(vec3((pos * distortionScale + temporalOffset))), snoiseFractal(vec3(pos.zxy * distortionScale - temporalOffset)), snoiseFractal(vec3(pos.yxz * distortionScale + temporalOffset)));
        }
        for (float i = 0.0; i < ${e}.0; i ++) {
          vec3 sampleNorm = normalize(n + roughnessFactor * roughnessFactor * 2.0 * normalize(vec3(rand(runningSeed++) - 0.5, rand(runningSeed++) - 0.5, rand(runningSeed++) - 0.5)) * pow(rand(runningSeed++), 0.33) + distortionNormal);
          transmissionR = getIBLVolumeRefraction(
            sampleNorm, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
            pos, modelMatrix, viewMatrix, projectionMatrix, material.ior, material.thickness  + thickness_smear * (i + randomCoords) / float(${e}),
            material.attenuationColor, material.attenuationDistance
          ).r;
          transmissionG = getIBLVolumeRefraction(
            sampleNorm, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
            pos, modelMatrix, viewMatrix, projectionMatrix, material.ior  * (1.0 + chromaticAberration * (i + randomCoords) / float(${e})) , material.thickness + thickness_smear * (i + randomCoords) / float(${e}),
            material.attenuationColor, material.attenuationDistance
          ).g;
          transmissionB = getIBLVolumeRefraction(
            sampleNorm, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
            pos, modelMatrix, viewMatrix, projectionMatrix, material.ior * (1.0 + 2.0 * chromaticAberration * (i + randomCoords) / float(${e})), material.thickness + thickness_smear * (i + randomCoords) / float(${e}),
            material.attenuationColor, material.attenuationDistance
          ).b;
          transmission.r += transmissionR;
          transmission.g += transmissionG;
          transmission.b += transmissionB;
        }
        transmission /= ${e}.0;
        totalDiffuse = mix( totalDiffuse, transmission.rgb, material.transmission );
`)},Object.keys(this.uniforms).forEach(M=>Object.defineProperty(this,M,{get:()=>this.uniforms[M].value,set:S=>this.uniforms[M].value=S}))}}function uS({renderer:i,scene:e,camera:t,body:n,resolution:r}={}){if(!i||!e||!t||!n?.isMesh)throw new TypeError("createTransmissionPass needs renderer, scene, camera, and a body mesh.");const s=typeof window<"u"&&window.matchMedia("(max-width: 767px), (max-height: 500px) and (max-width: 1100px)").matches,o=s?768:2048,a=Number.isFinite(r)&&r>0?Math.min(o,Math.max(256,Math.floor(r))):o,l=i.extensions.has("EXT_color_buffer_float")||i.extensions.has("EXT_color_buffer_half_float"),c=!s&&i.capabilities.isWebGL2?Math.min(4,i.capabilities.maxSamples||0):0,u={type:l?Jr:In,minFilter:Zt,magFilter:Zt,generateMipmaps:!1,depthBuffer:!0,stencilBuffer:!1,samples:c},d=new di(1,1,u),h=new di(1,1,u);d.texture.colorSpace=zt,h.texture.colorSpace=zt,d.texture.name="prize-bank-backside-capture",h.texture.name="prize-bank-front-capture";const f=new lS,g=n.material,_=new cS({samples:s?3:10,transmissionSampler:!1,transmission:0,_transmission:1,roughness:s?.018:.012,thickness:.055,chromaticAberration:.002,anisotropicBlur:0,distortion:0,temporalDistortion:0,attenuationDistance:1/0,attenuationColor:new Ge("white"),buffer:h.texture});_.name="prize-bank-poimandres-transmission",_.color.set("white"),_.metalness=0,_.ior=1.45,_.opacity=1,_.transparent=!1,_.depthWrite=!0,_.depthTest=!0,_.side=Kn,_.envMap=e.environment,_.envMapIntensity=.45,_.clearcoat=0,n.material=_;const m=new _e,p=new Ge("#2f2475");let M=!1,S=!1;function x(R,N){if(M)return;let w,y;if(Number.isFinite(R)&&R>0&&Number.isFinite(N)&&N>0){const X=i.getPixelRatio();w=R*X,y=N*X}else i.getDrawingBufferSize(m),w=m.x,y=m.y;const L=Math.min(1,a/Math.max(w,y,1)),k=Math.max(1,Math.round(w*L)),W=Math.max(1,Math.round(y*L));h.width===k&&h.height===W||(d.setSize(k,W),h.setSize(k,W))}function A(R){_.side!==R&&(_.side=R,_.needsUpdate=!0)}function C(){if(M||S||i.getContext().isContextLost())return;_.envMap!==e.environment&&(_.envMap=e.environment,_.needsUpdate=!0),S=!0;const R=i.getRenderTarget(),N=i.getActiveCubeFace(),w=i.getActiveMipmapLevel(),y=i.toneMapping,L=e.background,k=_.side,W=_.thickness,X=_.envMapIntensity,q=n.material;let z=!1;try{i.toneMapping=Wn,e.background=L||p,n.material=f,i.setRenderTarget(d),i.clear(!0,!0,!0),i.render(e,t),n.material=_,_.buffer=d.texture,_.thickness=.045,_.envMapIntensity=.2,A(tn),i.setRenderTarget(h),i.clear(!0,!0,!0),i.render(e,t),z=!0}finally{_.buffer=h.texture,_.thickness=W,_.envMapIntensity=X,A(k),n.material=q,e.background=L,i.toneMapping=y,i.setRenderTarget(R,N,w),S=!1}z&&i.render(e,t)}return x(),{material:_,render:C,resize:x,dispose(){M||(M=!0,(n.material===_||n.material===f)&&(n.material=g),d.dispose(),h.dispose(),f.dispose(),_.dispose())}}}const dS="https://solana.com/src/img/branding/solanaLogoMark.svg",hS="3d3401109aa061dec40a8659f1847817a8e647f98de1e65e76e86a95bbe1f08a",fS="M100.48 69.3817L83.8068 86.8015C83.4444 87.1799 83.0058 87.4816 82.5185 87.6878C82.0312 87.894 81.5055 88.0003 80.9743 88H1.93563C1.55849 88 1.18957 87.8926 0.874202 87.6912C0.558829 87.4897 0.31074 87.2029 0.160416 86.8659C0.0100923 86.529 -0.0359181 86.1566 0.0280382 85.7945C0.0919944 85.4324 0.263131 85.0964 0.520422 84.8278L17.2061 67.408C17.5676 67.0306 18.0047 66.7295 18.4904 66.5234C18.9762 66.3172 19.5002 66.2104 20.0301 66.2095H99.0644C99.4415 66.2095 99.8104 66.3169 100.126 66.5183C100.441 66.7198 100.689 67.0067 100.84 67.3436C100.99 67.6806 101.036 68.0529 100.972 68.415C100.908 68.7771 100.737 69.1131 100.48 69.3817ZM83.8068 34.3032C83.4444 33.9248 83.0058 33.6231 82.5185 33.4169C82.0312 33.2108 81.5055 33.1045 80.9743 33.1048H1.93563C1.55849 33.1048 1.18957 33.2121 0.874202 33.4136C0.558829 33.6151 0.31074 33.9019 0.160416 34.2388C0.0100923 34.5758 -0.0359181 34.9482 0.0280382 35.3103C0.0919944 35.6723 0.263131 36.0083 0.520422 36.277L17.2061 53.6968C17.5676 54.0742 18.0047 54.3752 18.4904 54.5814C18.9762 54.7875 19.5002 54.8944 20.0301 54.8952H99.0644C99.4415 54.8952 99.8104 54.7879 100.126 54.5864C100.441 54.3849 100.689 54.0981 100.84 53.7612C100.99 53.4242 101.036 53.0518 100.972 52.6897C100.908 52.3277 100.737 51.9917 100.48 51.723L83.8068 34.3032ZM1.93563 21.7905H80.9743C81.5055 21.7907 82.0312 21.6845 82.5185 21.4783C83.0058 21.2721 83.4444 20.9704 83.8068 20.592L100.48 3.17219C100.737 2.90357 100.908 2.56758 100.972 2.2055C101.036 1.84342 100.99 1.47103 100.84 1.13408C100.689 0.79713 100.441 0.510296 100.126 0.308823C99.8104 0.107349 99.4415 1.24074e-05 99.0644 0L20.0301 0C19.5002 0.000878397 18.9762 0.107699 18.4904 0.313848C18.0047 0.519998 17.5676 0.821087 17.2061 1.19848L0.524723 18.6183C0.267681 18.8866 0.0966198 19.2223 0.0325185 19.5839C-0.0315829 19.9456 0.0140624 20.3177 0.163856 20.6545C0.31365 20.9913 0.561081 21.2781 0.875804 21.4799C1.19053 21.6817 1.55886 21.7896 1.93563 21.7905Z",Ai=2,pS=.0225;function mS(i){const e=[];let t,n=0,r=0;const s=i/101,o=(a,l)=>[(a-50.5)*s,(44-l)*s];for(const a of fS.match(/[MLHCZ][^MLHCZ]*/g)){const l=a[0],c=(a.slice(1).match(/[+-]?(?:\d*\.)?\d+(?:[eE][+-]?\d+)?/g)||[]).map(Number);l==="M"?(t=new Hh,e.push(t),[n,r]=c,t.moveTo(...o(n,r))):l==="L"?([n,r]=c,t.lineTo(...o(n,r))):l==="H"?(n=c[0],t.lineTo(...o(n,r))):l==="C"?(t.bezierCurveTo(...o(c[0],c[1]),...o(c[2],c[3]),...o(c[4],c[5])),[n,r]=c.slice(4)):l==="Z"&&t.closePath()}if(e.length!==3)throw new Error("The official Solana mark must contain three separate bars.");return e}function gS({coinScale:i=1,width:e=.168,depth:t=.0015}={}){if(!Number.isFinite(i)||i<=0||!Number.isFinite(e)||e<=0||!Number.isFinite(t)||t<=0)throw new RangeError("Positive coin mark dimensions are required.");const n=new Oc(mS(e),{depth:t,bevelEnabled:!1,curveSegments:5});return n.rotateX(-Math.PI/2),n.scale(i,i,i),n.computeBoundingBox(),n.computeBoundingSphere(),n.name="solana-official-coin-emblem",n.userData={source:dS,sha256:hS,bars:3,coinScale:i},n}const tl=new $e,_S=new $e().makeRotationZ(Math.PI);function sf(i,e,t,n=1){if(t!==0&&t!==1)throw new RangeError("Coin face index must be0 or1.");return tl.makeTranslation(0,(t===0?1:-1)*pS*n,0),t===1&&tl.multiply(_S),i.multiplyMatrices(e,tl)}function vS({body:i,bank:e,coinGeometry:t,coinMaterial:n,coinMarkGeometry:r,coinMarkMaterial:s,maxCoins:o=160,coinScale:a=1,reducedMotion:l=!1}={}){if(!i?.isMesh||!i.geometry?.getAttribute("position")||!e?.isObject3D)throw new TypeError("createPiggyBurst needs the source body mesh and bank group.");if(!t?.isBufferGeometry||!n)throw new TypeError("createPiggyBurst needs coin geometry and material.");if((r||s)&&(!r?.isBufferGeometry||!s))throw new TypeError("Burst coin marks need both geometry and material.");const c=Number.isFinite(o)?Math.max(1,Math.min(192,Math.floor(o))):160,u=Number.isFinite(a)&&a>0?a:1,d=c<=110?4:6,h=3.6,f=new Ln;f.name="piggy-settlement-burst",f.visible=!1,e.add(f);const g=new Mn({color:16777215,metalness:0,roughness:.12,transmission:0,transparent:!0,opacity:.12,depthWrite:!1,side:fn,clearcoat:.1,clearcoatRoughness:.12,envMapIntensity:.45});g.forceSinglePass=!0;const _=[],m=[],p=new I,M=new I,S=new I;e.updateWorldMatrix(!0,!1),i.updateWorldMatrix(!0,!1);const x=new $e().copy(e.matrixWorld).invert().multiply(i.matrixWorld);let A=i.geometry.clone().applyMatrix4(x);if(A.index){const F=A.toNonIndexed();A.dispose(),A=F}A.getAttribute("normal")||A.computeVertexNormals(),A.computeBoundingBox(),A.boundingBox.getCenter(M),A.boundingBox.getSize(S);const C=A.boundingBox.min.y-S.y*.055,R=A.getAttribute("position"),N=A.getAttribute("normal"),w=Array.from({length:d*3},()=>({positions:[],normals:[]}));for(let F=0;F+2<R.count;F+=3){p.set(0,0,0);for(let v=0;v<3;v++)p.x+=R.getX(F+v)/3,p.y+=R.getY(F+v)/3,p.z+=R.getZ(F+v)/3;const Q=Math.atan2(p.z-M.z,p.x-M.x)+Math.PI,me=Math.min(d-1,Math.floor(Q/(Math.PI*2)*d)),de=Math.min(2,Math.max(0,Math.floor((p.y-A.boundingBox.min.y)/Math.max(S.y,.001)*3))),E=w[de*d+me];for(let v=0;v<3;v++){const U=F+v;E.positions.push(R.getX(U),R.getY(U),R.getZ(U)),E.normals.push(N.getX(U),N.getY(U),N.getZ(U))}}A.dispose();function y(F,Q){const me=Math.sin((F+1)*12.9898+Q*78.233)*43758.5453;return me-Math.floor(me)}w.forEach((F,Q)=>{if(!F.positions.length)return;const me=new I;for(let G=0;G<F.positions.length;G+=3)me.x+=F.positions[G],me.y+=F.positions[G+1],me.z+=F.positions[G+2];me.multiplyScalar(3/F.positions.length);for(let G=0;G<F.positions.length;G+=3)F.positions[G]-=me.x,F.positions[G+1]-=me.y,F.positions[G+2]-=me.z;const de=new ln;de.setAttribute("position",new Xt(F.positions,3)),de.setAttribute("normal",new Xt(F.normals,3)),de.computeBoundingSphere(),_.push(de);const E=new kt(de,g);E.position.copy(me),E.name=`piggy-shell-shard-${Q}`,f.add(E);const v=new I(me.x-M.x,0,me.z-M.z);v.lengthSq()<.001&&v.set(Math.cos(Q*2.4),0,Math.sin(Q*2.4)),v.normalize();const U=new I(y(Q,1)-.5,y(Q,2)-.5,y(Q,3)-.5).normalize();m.push({mesh:E,origin:me,radial:v,axis:U,speed:.35+y(Q,4)*.25,lift:.25+y(Q,5)*.35,spin:(y(Q,6)-.5)*.8})});const k=(Array.isArray(n)?n:[n]).map(F=>{const Q=F.clone();return Q.emissive&&Q.emissive.set(16758313),Q.emissiveIntensity=.04,Q.roughness=.26,Q.envMapIntensity=1,Q}),W=s?(Array.isArray(s)?s:[s]).map(F=>F.clone()):[],X=new Hs(t,Array.isArray(n)?k:k[0],c);X.name="piggy-prize-burst-coins",X.count=0,X.frustumCulled=!1,X.instanceMatrix.setUsage(Wo),f.add(X);const q=r?new Hs(r,Array.isArray(s)?W:W[0],c*Ai):null;q&&(q.name="piggy-prize-burst-sol-marks",q.count=0,q.frustumCulled=!1,q.instanceMatrix.setUsage(Wo),f.add(q));const z=new Mt,oe=new $e,V=new Pn,pe=new Pn,K=new Dn,ne=new $e,ce=new Float32Array(c*3),ae=new Float32Array(c);for(let F=0;F<c;F++)ae[F]=y(F,28);const ye=new ln;ye.setAttribute("position",new Bt(ce,3).setUsage(Wo)),ye.setAttribute("seed",new Bt(ae,1));const Ue=new Un({transparent:!0,depthWrite:!1,blending:ll,uniforms:{elapsed:{value:0},radiance:{value:l?.15:0},gold:{value:new Ge(16769696)}},vertexShader:`attribute float seed; uniform float elapsed; varying float sparkle;
      void main(){ vec4 view=modelViewMatrix*vec4(position,1.0);
        sparkle=0.35+0.65*pow(0.5+0.5*sin(elapsed*8.0+seed*37.0),5.0);
        gl_PointSize=clamp((1.0+seed)*78.0/-view.z,4.0,18.0);
        gl_Position=projectionMatrix*view; }`,fragmentShader:`uniform vec3 gold; uniform float radiance; varying float sparkle;
      void main(){ vec2 p=abs(gl_PointCoord-0.5);
        float core=exp(-dot(p,p)*80.0);
        float x=pow(max(0.0,1.0-p.x*15.0),2.0)*pow(max(0.0,1.0-p.y*2.0),3.0);
        float y=pow(max(0.0,1.0-p.y*15.0),2.0)*pow(max(0.0,1.0-p.x*2.0),3.0);
        float alpha=min(1.0,core+x+y)*sparkle*radiance;
        if(alpha<0.015)discard;
        gl_FragColor=vec4(gold,alpha);
        #include <colorspace_fragment>
      }`}),Z=new Dh(ye,Ue);Z.frustumCulled=!1,Z.name="jackpot-coin-glints",f.add(Z);const ee=new jh(16765554,0,9,2);ee.position.copy(M).add(new I(0,1.3,2)),f.add(ee);let Me=[],Te=0,Ae=!1,Xe=!1;function it(){let F=e;for(;F.parent;)F=F.parent;const Q=Array.isArray(i.material)?i.material[0]:i.material,me=F.isScene?F.environment:Q?.envMap||null;for(const de of[g,...k,...W])de.envMap!==me&&(de.envMap=me,de.needsUpdate=!0)}function P(F){if(F?.visible===!1)return null;const Q=new I,me=new Pn,de=new I(1,1,1);if(F?.elements?.length===16){if(!F.elements.every(Number.isFinite))return null;oe.fromArray(F.elements).decompose(Q,me,de)}else if(F?.position&&F?.quaternion)Q.copy(F.position),me.copy(F.quaternion),Number.isFinite(F.scale)?de.setScalar(F.scale):F.scale&&de.copy(F.scale);else return null;return[Q.x,Q.y,Q.z,me.x,me.y,me.z,me.w,de.x,de.y,de.z].every(Number.isFinite)?(me.normalize(),{position:Q,quaternion:me,scale:de}):null}function le(F){Me.forEach((de,E)=>{z.position.copy(de.position),z.quaternion.copy(de.quaternion),z.scale.copy(de.scale);const v=l?1:Ei.clamp((F-de.delay)/(h-de.delay),0,1),U=1-(1-v)**2.7;z.position.lerp(de.destination,U),z.position.y+=Math.sin(v*Math.PI)*de.arcHeight,z.position.x+=Math.sin(v*Math.PI)*de.sway,z.position.z+=Math.sin(v*Math.PI)*.25,V.setFromAxisAngle(de.axis,de.spin*Math.sin(v*Math.PI*.5)),z.quaternion.multiply(V);const G=Ei.smoothstep(v,.55,1);if(de.hero?(pe.setFromEuler(K.set(Math.PI/2-.18,de.faceAngle,0)),z.quaternion.slerp(pe,G)):z.quaternion.slerp(de.quaternion,G),z.updateMatrix(),X.setMatrixAt(E,z.matrix),q)for(let Y=0;Y<Ai;Y++)sf(ne,z.matrix,Y,u),q.setMatrixAt(E*Ai+Y,ne);if(de.glintIndex>=0){const Y=de.glintIndex*3;ce[Y]=z.position.x,ce[Y+1]=z.position.y+.06,ce[Y+2]=z.position.z+.18}}),X.count=Me.length,X.instanceMatrix.needsUpdate=!0,q&&(q.count=Me.length*Ai,q.instanceMatrix.needsUpdate=!0),ye.setDrawRange(0,Math.min(8,Me.filter(de=>de.hero).length)),ye.attributes.position.needsUpdate=!0,Ue.uniforms.elapsed.value=F;const Q=Math.sin(Math.min(1,F/h)*Math.PI),me=Ei.smoothstep(F,.25,.9);Ue.uniforms.radiance.value=l?.15:me*(.28+.4*Q);for(const de of k)de.emissiveIntensity=l?.04:.04+.24*Q,de.envMapIntensity=l?1:1+.15*Q;ee.intensity=l?.3:.3+1.5*Q}function re(F){const Q=l?0:Ei.smoothstep(F,.12,.65);m.forEach(me=>{const de=me.mesh;if(de.visible=l||Q<1,de.position.copy(me.origin),de.quaternion.identity(),l){de.position.addScaledVector(me.radial,Math.min(S.x,S.z)*.035),de.position.y+=me.origin.y>M.y?.06:-.02,de.quaternion.setFromAxisAngle(me.axis,.04);return}const E=(1-Math.exp(-4*F))/4;de.position.addScaledVector(me.radial,me.speed*E),de.position.y=Math.max(C+.1,me.origin.y+me.lift*F-.8*F*F),de.quaternion.setFromAxisAngle(me.axis,me.spin*Math.min(F,.65))}),g.opacity=l?.06:Ei.lerp(.12,0,Q)}function ie(F=[]){if(Xe||Ae)return!1;if(!Array.isArray(F))throw new TypeError("Burst coin transforms must be an array of snapshots.");Ae=!0,Te=0,Me=[];for(const Y of F){if(Me.length>=c)break;const H=P(Y);if(!H)continue;const be=Me.length;H.delay=y(be,24)*.35,H.sway=(y(be,25)-.5)*.32,H.arcHeight=.55+y(be,9)*.3,H.axis=new I(y(be,11)-.5,y(be,12)-.5,y(be,13)-.5).normalize(),H.spin=(y(be,14)-.5)*12,H.faceAngle=(y(be,15)-.5)*.8,H.hero=!1,H.glintIndex=-1,H.destination=H.position.clone(),H.destination.x=M.x+(H.position.x-M.x)*.96,H.destination.z=M.z+(H.position.z-M.z)*.9+.18,Me.push(H)}const Q=Math.min(24,Me.length),me=Math.ceil(Q*13/24),de=Q-me,E=[{radiusX:2.05,radiusY:1.4,span:1.4,baseY:-.1,depth:.5},{radiusX:1.78,radiusY:1.15,span:1.32,baseY:-.55,depth:.75}].map(Y=>{const H=[];let be=0;for(let fe=0;fe<=128;fe++){const we=-Y.span+fe*Y.span*2/128,Ee=new _e(Math.sin(we)*Y.radiusX,Math.cos(we)*Y.radiusY);H.length&&(be+=Ee.distanceTo(H[H.length-1].point)),H.push({point:Ee,length:be})}return{...Y,points:H,length:be}});function v(Y,H,be){if(be<=1)return new _e(0,Y.radiusY);const fe=Y.length*H/(be-1),we=Y.points.findIndex(Ce=>Ce.length>=fe);if(we<=0)return Y.points[0].point.clone();const Ee=Y.points[we-1],he=Y.points[we];return Ee.point.clone().lerp(he.point,(fe-Ee.length)/(he.length-Ee.length))}const U=Math.min(8,Q),G=new Map(Array.from({length:U},(Y,H)=>[Math.floor(H*Q/U),H]));for(let Y=0;Y<Q;Y++){const H=Me[Math.floor(Y*Me.length/Q)],be=Y<me,fe=be?me:de,we=be?Y:Y-me,Ee=E[be?0:1],he=v(Ee,we,fe);H.hero=!0,H.glintIndex=G.get(Y)??-1,H.arcHeight=.22+y(Y,10)*.12,H.sway=(y(Y,25)-.5)*.5,H.destination.set(M.x+he.x,M.y+Ee.baseY+he.y,M.z+Ee.depth+(Y%2?-.025:.025))}return it(),f.visible=!0,re(0),le(0),!0}function te(F){return Xe||!Ae||(it(),l||Te>=h)?!1:(Te=Math.min(h,Te+(Number.isFinite(F)?Math.max(0,F):0)),re(Te),le(Te),Te<h)}function xe(){Xe||(Ae=!1,Te=0,Me=[],f.visible=!1,X.count=0,q&&(q.count=0),ye.setDrawRange(0,0),ee.intensity=0,Ue.uniforms.radiance.value=0,g.opacity=.12)}return{group:f,start:ie,update:te,reset:xe,dispose(){Xe||(xe(),Xe=!0,f.removeFromParent(),_.forEach(F=>F.dispose()),g.dispose(),k.forEach(F=>F.dispose()),W.forEach(F=>F.dispose()),ye.dispose(),Ue.dispose(),X.dispose(),q?.dispose())}}}function of(i){const e=matchMedia("(prefers-reduced-motion: reduce)").matches,t=matchMedia("(max-width: 767px), (max-height: 500px) and (max-width: 1100px)").matches,n=document.createElement("div");n.className="bank-load-status",n.role="status",n.textContent="Preparing the prize bank…",i.append(n);let r;try{r=new Ey({alpha:!1,antialias:!0,powerPreference:"high-performance"})}catch{return n.textContent="3D preview unavailable. The game is ready to play.",{setCoins(){},deposit(){},setEnded(){},cancelPreview(){},previewPayout(){return!1},dispose(){n.remove()}}}const s=r.domElement;s.className="vault-canvas",s.setAttribute("aria-hidden","true"),s.style.cssText="position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none",i.prepend(s),r.setPixelRatio(Math.min(devicePixelRatio||1,t?1.5:2));const o=new Ge(4400629);r.setClearColor(o,1),r.outputColorSpace=Ut,r.toneMapping=Wn,r.toneMappingExposure=1;const a=new Tu;a.background=o;const l=new Jt(47,1,.1,60),c=new Set,u=Ne=>(c.add(Ne),Ne),d=new Ln;a.add(d);let h=!1,f=!1,g=!1,_=0,m,p,M,S,x;const A=[];let C=!1,R=!1,N,w=0,y=0,L=!1,k=1,W=1,X=9,q=0,z=0,oe=0,V=0,pe=0,K=0;const ne=new I(0,1.9,0),ce=new I(0,2.3,8.5).normalize(),ae=new I(0,1,0),ye=new Nn(new I(-1.9,.2,-1.4),new I(1.9,3.6,1.4)),Ue=new I,Z=[],ee=new Mt,Me=new $e,Te=new Tu;Te.background=new Ge(1314884);const Ae=new Ln;Te.add(Ae);const Xe=u(new qr(1,1));function it(Ne,qe,mt,Et=16777215){const rn=u(new oi({color:new Ge(Et).multiplyScalar(Ne),side:fn,toneMapped:!1})),vt=new kt(Xe,rn);vt.position.set(...qe),vt.scale.set(...mt),vt.lookAt(0,1.8,0),Ae.add(vt)}it(4.2,[-3.7,4.8,4],[2.5,4.2,1],16316927),it(4.5,[4,3.1,-2.8],[1.25,4.6,1],9435903),it(.85,[0,7,0],[3.5,2,1],15590911),it(3,[-3.5,2.5,-4],[2.2,4.8,1],16731537),it(1.6,[1.4,2.8,4.2],[.6,4,1],16731537),it(2.2,[0,3,-6],[5,4,1],16316927),it(.7,[0,1.8,6],[4.5,3.2,1],16316927),it(1.1,[-1.8,6.2,3.8],[.4,3.2,1],16316927);function P(){if(h)return;const Ne=new tc(r),qe=Ne.fromScene(Te,.04,.1,100),mt=M;M=qe,a.environment=qe.texture,a.environmentIntensity=1;for(const Et of c)mt&&Et.isMaterial&&Et.envMap===mt.texture&&(Et.envMap=qe.texture,Et.needsUpdate=!0);mt?.dispose(),Ne.dispose()}P(),a.add(new Pg(16316927,.24));const le=new Xo(16316927,1.6);le.position.set(0,2.4,6),a.add(le);const re=new Xo(16316927,1.4);re.position.set(-3,5,4),a.add(re);const ie=new Xo(13095935,.65);ie.position.set(4,3,-4),a.add(ie);const te=new Mt;te.position.set(0,1.2,0),a.add(te);const xe=new Yh(16316927,18,16,Math.PI/7,.9,2);xe.position.set(-1.8,7.8,4.5),xe.target=te,a.add(xe);const F=u(new qr(6.5,6.5)),Q=u(new Un({transparent:!0,depthWrite:!1,uniforms:{lightColor:{value:new Ge(2231964)}},vertexShader:"varying vec2 poolUV; void main(){poolUV=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}",fragmentShader:`varying vec2 poolUV; uniform vec3 lightColor;
      void main(){float radius=length((poolUV-.5)*2.0);float a=exp(-radius*radius*6.0)*.20*(1.0-smoothstep(.65,1.0,radius));
        gl_FragColor=vec4(lightColor,a);
        #include <colorspace_fragment>
      }`})),me=new kt(F,Q);me.rotation.x=-Math.PI/2,me.position.set(0,.12,0),a.add(me);const de=u(new Ur({color:2299173,metalness:.12,roughness:.24,side:fn})),E=u(new oi({visible:!1})),v=.17/.14,U=[new _e(0,-.021),new _e(.126,-.021),new _e(.137,-.015),new _e(.14,-.008),new _e(.14,.008),new _e(.137,.015),new _e(.126,.021),new _e(0,.021)];U.forEach(Ne=>Ne.multiplyScalar(v));const G=u(new Fc(U,t?32:48)),Y=u(new Ur({color:16763711,metalness:1,roughness:.26,envMap:a.environment,envMapIntensity:1.1})),H=u(new Ur({color:6635549,metalness:.9,roughness:.4,envMap:a.environment,envMapIntensity:.65})),be=u(gS({coinScale:v})),fe=t?110:180,we=new Hs(G,Y,fe),Ee=new Hs(be,H,fe*Ai);for(const Ne of[we,Ee])Ne.count=0,Ne.frustumCulled=!1,Ne.instanceMatrix.setUsage(Wo),d.add(Ne);function he(){if(!m)return;let Ne=0;for(const qe of m.getTransforms())if(qe.visible!==!1){ee.position.copy(qe.position),ee.quaternion.copy(qe.quaternion),ee.scale.setScalar(1),ee.updateMatrix(),we.setMatrixAt(Ne,ee.matrix);for(let mt=0;mt<Ai;mt++)sf(Me,ee.matrix,mt,v),Ee.setMatrixAt(Ne*Ai+mt,Me);Ne++}we.count=Ne,Ee.count=Ne*Ai;for(const qe of[we,Ee])qe.instanceMatrix.needsUpdate=!0}function Ce(Ne){const qe=Number.isFinite(Ne)?Math.max(0,Math.floor(Ne)):0;qe!==w&&(w=qe,m?.setCount(w),ue())}function We(Ne){Ze();const qe=Math.max(0,Math.floor(Number(Ne)||0));m?m.deposit(qe):y+=qe,e||(K=1),ue()}function ke(){if(!S||!m||C)return;m.step(0),he();const Ne=[];for(let qe=0;qe<we.count;qe++){const mt=new $e;we.getMatrixAt(qe,mt),Ne.push(mt)}S.start(Ne),C=!0,q=0,x.visible=!1,A.forEach(qe=>{qe.visible=!1}),we.visible=Ee.visible=!1,K=0}function Re(Ne){L!==!!Ne&&(L=!!Ne,L?(clearTimeout(N),R&&(S?.reset(),C=!1),R=!1,ke()):(S?.reset(),C=!1,x&&(x.visible=!0),A.forEach(qe=>{qe.visible=!0}),we.visible=Ee.visible=!0),ue())}function Ze(){clearTimeout(N),R&&(R=!1,!(h||L)&&(S?.reset(),C=!1,x&&(x.visible=!0),A.forEach(Ne=>{Ne.visible=!0}),we.visible=Ee.visible=!0,ue()))}function D(){return!g||L||R||!S||!we.count?!1:(R=!0,ke(),ue(),N=setTimeout(Ze,4400),!0)}function ge(){const Ne=ce.clone().applyAxisAngle(ae,V*.13);Ne.y+=pe*.045,l.position.copy(Ne.normalize()).multiplyScalar(X*(1-K*.015)).add(ne),l.lookAt(ne),l.updateMatrixWorld()}function Se(){if(h)return;k=Math.max(1,i.clientWidth),W=Math.max(1,i.clientHeight),r.setSize(k,W,!1),l.aspect=k/W;const Ne=Math.tan(Ei.degToRad(l.fov)/2),qe=Ne*l.aspect,mt=new I().crossVectors(ae,ce).normalize(),Et=new I().crossVectors(ce,mt).normalize();X=0;const rn=()=>{Ue.sub(ne);const vt=Ue.dot(ce);X=Math.max(X,vt+Math.abs(Ue.dot(mt))/(qe*.9),vt+Math.abs(Ue.dot(Et))/(Ne*.9))};if(Z.length)for(const vt of Z){const kn=vt.getAttribute("position");for(let qt=0;qt<kn.count;qt++)Ue.fromBufferAttribute(kn,qt),rn()}else for(let vt=0;vt<8;vt++)Ue.set(vt&1?ye.max.x:ye.min.x,vt&2?ye.max.y:ye.min.y,vt&4?ye.max.z:ye.min.z),rn();l.updateProjectionMatrix(),ge(),p?.resize(k,W),ue()}function Ie(Ne){if(_=0,h||f)return;const qe=q?Math.max(0,(Ne-q)/1e3):1/60,mt=Math.min(.05,qe);q=Ne;const Et=L||R,rn=!Et&&(m?.step(mt)??!1);m&&!Et&&he();const vt=S?.update(qe)??!1,kn=1-Math.exp(-mt*6);V+=(z-V)*kn,pe+=(oe-pe)*kn,K*=Math.exp(-mt*4),K<.001&&(K=0),ge(),p&&!Et?p.render():r.render(a,l),(rn||vt||K||Math.abs(z-V)+Math.abs(oe-pe)>.001)&&ue()}function ue(){!_&&!h&&!f&&(_=requestAnimationFrame(Ie))}const se=new ResizeObserver(Se);se.observe(i);const Oe=Ne=>{if(e||Ne.pointerType!=="mouse")return;const qe=i.getBoundingClientRect();z=(Ne.clientX-qe.left)/qe.width*2-1,oe=(Ne.clientY-qe.top)/qe.height*2-1,ue()},je=()=>{z=oe=0,ue()},ht=Ne=>{Ne.preventDefault(),f=!0,cancelAnimationFrame(_),_=0},at=()=>{f=!1,P(),Se()};return i.addEventListener("pointermove",Oe),i.addEventListener("pointerleave",je),s.addEventListener("webglcontextlost",ht),s.addEventListener("webglcontextrestored",at),Se(),(async()=>{try{const Ne=await new Ty().loadAsync("/models/piggy-bank-glass.glb");if(h){Ne.scene.traverse(bt=>{bt.isMesh&&(bt.geometry.dispose(),bt.material.dispose())});return}const qe=Ne.scene,mt=new Ln;mt.add(qe),mt.rotation.y=Math.PI/2,mt.updateMatrixWorld(!0);const Et=new Nn().setFromObject(mt),rn=Et.getCenter(new I),vt=3.8/Et.getSize(new I).x,kn=new $e().makeScale(vt,vt,vt).setPosition(-rn.x*vt,1.9-rn.y*vt,-rn.z*vt);let qt;ye.makeEmpty();const cs=new Set,Ui=new Set;if(qe.traverse(bt=>{if(!bt.isMesh)return;const jn=u(bt.geometry.clone().applyMatrix4(bt.matrixWorld).applyMatrix4(kn));jn.computeBoundingBox(),jn.computeBoundingSphere(),ye.union(jn.boundingBox),Z.push(jn);const us=new kt(jn,bt.name==="Object_9"?E:de);d.add(us),bt.name==="Object_9"?qt=us:A.push(us),Ui.add(bt.geometry);for(const da of Array.isArray(bt.material)?bt.material:[bt.material])cs.add(da)}),Ui.forEach(bt=>bt.dispose()),cs.forEach(bt=>bt.dispose()),!qt)throw new Error("Model body is missing.");x=qt,d.updateMatrixWorld(!0),p=uS({renderer:r,scene:a,camera:l,body:qt}),p.material.color.set(16777215),p.material._transmission=.97,p.material.attenuationColor.set(16777215),p.material.attenuationDistance=1/0,p.material.roughness=t?.016:.011,p.material.thickness=.055,p.material.ior=1.46,p.material.envMapIntensity=1.1;const eo=p.material.onBeforeCompile;p.material.onBeforeCompile=(bt,jn)=>{eo(bt,jn),bt.fragmentShader=bt.fragmentShader.replace("totalDiffuse = mix( totalDiffuse, transmission.rgb, material.transmission );","totalDiffuse = mix( totalDiffuse * vec3(0.93, 0.95, 1.0), transmission.rgb, material.transmission );")},p.material.customProgramCacheKey=()=>"piggy-arcade-clear-v1",Se();const{createCoinSimulation:to}=await hc(async()=>{const{createCoinSimulation:bt}=await import("./coin-simulation-BBrB85bH.js");return{createCoinSimulation:bt}},__vite__mapDeps([0,1,2,3]));if(m=await to({shellMesh:qt,maxCoins:fe,radius:.17,halfHeight:.023*v,reducedMotion:e,onImpact:()=>{e||(K=Math.max(K,.3))}}),h){m.dispose();return}m.setCount(w),y&&m.deposit(y),y=0,S=vS({body:qt,bank:d,coinGeometry:G,coinMaterial:Y,coinMarkGeometry:be,coinMarkMaterial:H,coinScale:v,maxCoins:fe,reducedMotion:e}),L&&ke(),g=!0,n.remove(),i.classList.add("model-ready"),ue()}catch(Ne){h||(n.textContent="Prize bank could not load. The game is ready to play.",n.classList.add("load-error"),console.error("Prize bank:",Ne))}})(),{setCoins:Ce,deposit:We,setEnded:Re,cancelPreview:Ze,previewPayout:D,dispose(){h||(h=!0,clearTimeout(N),cancelAnimationFrame(_),se.disconnect(),i.removeEventListener("pointermove",Oe),i.removeEventListener("pointerleave",je),s.removeEventListener("webglcontextlost",ht),s.removeEventListener("webglcontextrestored",at),S?.dispose(),m?.dispose(),p?.dispose(),M?.dispose(),c.forEach(Ne=>Ne.dispose()),r.dispose(),s.remove(),n.remove(),i.classList.remove("model-ready"))}}}const xS=new Intl.NumberFormat("en-US",{maximumSignificantDigits:5,useGrouping:!0});function af(i){if(typeof i!="number"||!Number.isSafeInteger(i)||i<0)throw new RangeError("SOL display amounts must be nonnegative safe integer lamports.");return xS.format(i/1e9)}function yS({offlineDemo:i=!1,publicChain:e=!1,chainReady:t=!1,chainHasState:n=!1,connected:r=!1,wallet:s=null,stateWallet:o=null,proofWarning:a=!1}={}){const l=i||t&&n,c=l&&(!e||r&&!!s&&o===s);return{gameKnown:l,walletKnown:c,holderKnown:c&&!a}}const Oo=new WeakMap;function Fo(i){if(typeof i=="number"&&Number.isSafeInteger(i)&&i>=0)return{text:af(i),positive:i>0};if(typeof i=="string"){const e=i.trim().replace(/\s*(?:demo\s+)?SOL\s*$/i,""),t=Number(e.replaceAll(",",""));if(e&&Number.isFinite(t)&&t>=0)return{text:e,positive:t>0}}return null}function SS(i,e){return typeof i=="string"&&i.trim()?i.trim().slice(0,72):e}function Si(i,e){const t=document.createElement(i);return t.className=e,t}function MS(){const i=document.querySelector("#reactor-stage");if(!i)return{purchase(){},settled(){},preview(){},clear(){},dispose(){}};if(Oo.has(i))return Oo.get(i);const e=Si("div","arena-feedback");e.setAttribute("role","status"),e.setAttribute("aria-live","polite"),e.setAttribute("aria-atomic","true");const t=Si("div","arena-feedback__headline"),n=Si("div","arena-feedback__detail"),r=Si("div","arena-feedback__changes");e.append(t,n,r),i.append(e);const s=window.matchMedia("(prefers-reduced-motion: reduce)");let o=s.matches,a=!1,l,c,u,d;function h(){window.clearTimeout(l),window.clearTimeout(c),window.clearTimeout(u)}function f(){h(),e.classList.remove("is-visible"),e.removeAttribute("data-tone"),i.classList.remove("feedback-active"),t.textContent="",n.textContent="",r.replaceChildren(),r.hidden=!0,d?.classList.remove("is-playing"),d?.remove(),d=void 0}function g(M,S){if(o)return;const x=document.querySelector("#safe-art");x&&((!d||d.parentElement!==x)&&(d?.remove(),d=Si("div","arena-feedback-impact"),d.setAttribute("aria-hidden","true"),d.append(Si("i","arena-feedback-impact__ring"),Si("i","arena-feedback-impact__shine")),x.append(d)),d.dataset.tone=M,d.dataset.force=S?"strong":"soft",d.classList.remove("is-playing"),d.offsetWidth,d.classList.add("is-playing"),u=window.setTimeout(()=>d?.classList.remove("is-playing"),M==="win"?3600:1400))}function _({title:M,description:S,deltas:x,tone:A,isYou:C,lifetime:R}){if(!a){h(),e.classList.remove("is-visible"),t.textContent=M,n.textContent=S,r.replaceChildren();for(const N of x){const w=Si("span","arena-feedback__change");w.textContent=N,r.append(w)}r.hidden=x.length===0,e.dataset.tone=A,e.dataset.reduced=String(o),i.classList.add("feedback-active"),e.offsetWidth,e.classList.add("is-visible"),g(A,C),l=window.setTimeout(()=>{e.classList.remove("is-visible"),i.classList.remove("feedback-active"),c=window.setTimeout(()=>{t.textContent="",n.textContent="",r.replaceChildren()},o?0:240)},R)}}const m=M=>{o=M.matches,e.dataset.reduced=String(o),o&&d?.classList.remove("is-playing")};s.addEventListener("change",m);const p={purchase({isYou:M=!1,playerName:S,jackpot:x,jackpotDelta:A,rewardDelta:C,tokenRewardDelta:R,count:N,yourKeys:w=0,shareAfter:y=0,hasKeys:L=!1,lostCrown:k=!1}={}){const W=Fo(A),X=Fo(C),q=Fo(R),z=[];W?.positive&&z.push("Jackpot +"+W.text+" SOL"),q?.positive&&z.push("Your $PIGGY holder rewards +"+q.text+" SOL"),!z.length&&Number.isSafeInteger(N)&&N>0&&z.push(N.toLocaleString("en-US")+(N===1?" key received":" keys received")),_({title:M?"You are the last buyer.":"Another buyer took the lead.",description:X?.positive?M?`Key rewards +${X.text} SOL. Own buys can return a share too.`:`You keep your keys. Key rewards +${X.text} SOL.`:L?"Your keys and earned SOL stay yours.":"Buy round keys to share future key rewards.",deltas:z,tone:"blue",isYou:M,lifetime:M?5800:4200})},settled({isYou:M=!1,winnerName:S,jackpot:x}={}){const A=Fo(x),C=M||typeof S=="string"&&S.trim().length>0;_({title:C?M?"Jackpot. You cracked Piggy!":"Jackpot for "+SS(S,"the last feeder")+"!":"Round complete",description:C?A?A.text+(M?" SOL ready to claim.":" SOL awarded."):"The jackpot has been awarded.":"No buyer entered. The pool rolls forward.",deltas:[],tone:C?"win":"quiet",isYou:M,lifetime:M?8500:6e3})},preview(){_({title:"Jackpot preview",description:"Visual preview only. No funds moved.",deltas:[],tone:"win",isYou:!1,lifetime:4400})},clear:f,dispose(){a||(f(),a=!0,s.removeEventListener("change",m),e.remove(),Oo.delete(i))}};return Oo.set(i,p),p}const Ed=1e3,Td=100,Ad="cubic-bezier(.77,0,.175,1)";function bS(){const i=matchMedia("(prefers-reduced-motion: reduce)"),e=new Set;function t(r=document.body){if(i.matches)return;const s=document.createElement("div");s.className="kb-wipe",s.setAttribute("aria-hidden","true");const o=["green","blue","pink"].map((a,l)=>{const c=document.createElement("div");return c.className=`transition-color-screen ${a}`,s.append(c),c.animate([{transform:"translateX(-100%)"},{transform:"translateX(0)",offset:.5},{transform:"translateX(100%)"}],{duration:Ed*2,delay:l*Td,easing:Ad,fill:"both"})});return r.append(s),e.add(s),Promise.allSettled(o.map(a=>a.finished)).then(()=>{s.remove(),e.delete(s)}),()=>o.forEach(a=>a.cancel())}function n(r){if(r.open||(document.querySelectorAll("dialog[open]").forEach(l=>l.close()),r.showModal(),i.matches))return;const s=t(r),a=r.querySelector(".kb-dialog-content")?.animate([{transform:"translateX(-110vw)"},{transform:"translateX(0)"}],{duration:Ed,delay:Td*3,easing:Ad,fill:"backwards"});r.addEventListener("close",()=>{s?.(),a?.cancel()},{once:!0})}return{wipe:t,open:n,dispose(){for(const r of e)r.remove();e.clear()}}}const Cd=1e9,wS=new Intl.NumberFormat("en-US",{maximumFractionDigits:0});function lf(i){if(typeof i!="number")throw new TypeError("SOL amounts must be numeric integer lamports.");if(!Number.isSafeInteger(i)||i<0)throw new RangeError("SOL amounts must be nonnegative safe integer lamports.");const e=Math.floor(i/Cd),t=i%Cd,n=String(t).padStart(9,"0").replace(/0+$/,"").padEnd(2,"0");return`${wS.format(e)}.${n}`}function ES(i){if(typeof i!="number"||!Number.isFinite(i)||i<0||i>1)throw new RangeError("Reward share must be a finite fraction between zero and one.");const e=i*100;if(e===0)return"0.0%";if(e>=.1)return`${e.toFixed(1)}%`;if(e<1e-6)return"<0.000001%";const t=Math.min(6,Math.max(2,Math.ceil(-Math.log10(e))+1));return`${e.toFixed(t).replace(/0+$/,"").replace(/\.$/,"")}%`}const TS=1000000000000000000n,AS="11111111111111111111111111111111",Rd=["whale","bear","snek","bull"],yt=i=>BigInt(i??0);function et(i,e="chain amount"){const t=Number(yt(i));if(!Number.isSafeInteger(t)||t<0)throw new RangeError(`${e} exceeds the display's exact integer range.`);return t}const CS=i=>typeof i=="string"&&Rd.includes(i.toLowerCase())?i.toLowerCase():Rd[Number(i)]||"snek";function RS(i={},e={}){const t=yt(e.reward_per_key)-yt(i.reward_index);if(t<0n)throw new RangeError("Player reward checkpoint is ahead of its round.");const n=yt(i.accum_f3d)+(yt(i.accum_keys)*t+yt(i.reward_remainder))/TS,r=n-yt(i.withdrawn_f3d),s=yt(i.accum_winnings)-yt(i.withdrawn_winnings),o=yt(i.accum_aff)-yt(i.withdrawn_aff);if([r,s,o].some(a=>a<0n))throw new RangeError("Invalid negative chain liability.");return{keyEarned:et(n),claimed:et(yt(i.withdrawn_f3d)+yt(i.withdrawn_winnings)+yt(i.withdrawn_aff)),claimable:et(r+s+o)}}function LS(i,e){const t=yt(i.still_in_play),n=Zi[e].closingBps,r={};let s=0n;for(const o of["community","keyHolders","tokenHolders","rollover"]){const a=t*BigInt(n[o])/10000n;r[o]=et(a),s+=a}return r.winner=et(t-s),r}function PS(i){if(!i?.game||!i?.round||!Array.isArray(i.players))throw new TypeError("Incomplete local Solana account response.");const e=i.round,t=et(e.round_id),n=Object.fromEntries(i.players.map(g=>[g.wallet,g.id])),r=g=>!g||g===AS?null:n[g]||g,s=r(e.lead_player_pk),o=CS(e.lead_player_team),a={};for(const[g,_]of i.players.entries()){const m=_.playerRound||_.player_round||{},p=_.playerRounds||_.player_rounds||[{player:m,round:e}];let M=0n,S=0n,x=0n,A=0n,C=0n,R=0n,N=0n;for(const y of p){const L=y.player||y.playerRound||y,k=RS(L,y.round||e);M+=BigInt(k.claimable),S+=BigInt(k.keyEarned),x+=BigInt(k.claimed),A+=BigInt(k.keyEarned)-yt(L.withdrawn_f3d),C+=yt(L.accum_winnings)-yt(L.withdrawn_winnings),R+=yt(L.accum_aff)-yt(L.withdrawn_aff),N+=yt(L.accum_winnings)}const w=_.holder||i.holder?.wallets?.[_.wallet]||{};a[_.id]={id:_.id,name:_.name||_.wallet.slice(0,6),handle:_.wallet,avatar:_.avatar||(_.id==="you"?"Y":String(g)),color:_.color||"#e6ff6b",wallet:_.wallet,balance:et(_.balance),tokenBalance:et(_.tokenBalance??_.token_balance),keys:et(m.accum_keys),totalKeys:et(m.accum_keys),claimable:et(M),keyRewardsEarned:et(S),totalClaimed:et(x),keyRewardsAvailable:et(A),jackpotRewardsAvailable:et(C),referralRewardsAvailable:et(R),jackpotRewardsEarned:et(N),tokenClaimable:et(w.claimable??_.tokenClaimable),tokenRewardsEarned:et(w.earned??_.tokenRewardsEarned),tokenRewardsClaimed:et(w.claimed??_.tokenRewardsClaimed),roundContribution:et(m.accum_sol_added),referral:r(m.last_affiliate_pk)}}s&&!a[s]&&(a[s]={id:s,name:`${s.slice(0,4)}…${s.slice(-4)}`,handle:s,wallet:s,avatar:"P",color:"#e6ff6b",balance:0,keys:0,tokenBalance:0,claimable:0,totalClaimed:0,keyRewardsEarned:0,tokenClaimable:0,tokenRewardsEarned:0,tokenRewardsClaimed:0});const l=!!e.ended,c=Object.values(e.accum_sol_by_team||{}).reduce((g,_)=>g+et(_),0),u=et(e.accum_sol_pot),d=LS(e,o),h=l?et(e.final_prize_share):d.winner,f={id:t,status:l?"settled":"active",startedAt:et(e.start_time)*1e3,endsAt:et(e.end_time)*1e3,pot:l?0:et(e.still_in_play),openingRollover:u-c,grossEntries:c,totalKeys:et(e.accum_keys),lastBuyerId:s,lastBuyerTeam:s?o:null,winnerId:l?s:null,finalPot:l&&i.finalPot!==void 0?et(i.finalPot):null,playerRewardsAllocated:et(e.accum_f3d_share),tokenRewardsAllocated:et(e.accum_p3d_share),settlement:l?{winnerId:s,mode:o,winnerPrize:h}:null};return{version:4,network:typeof i.network=="string"?i.network:i.network?.name||"localnet",economyVersion:"solana-program-v2",localPlayerId:"you",players:a,round:f,totalTokenSupply:et(i.holder?.totalEligibleTokenBalance??i.players.reduce((g,_)=>g+yt(_.tokenBalance??_.token_balance),0n)),history:i.history||[],activity:i.activity||[],communityReserve:et(yt(e.accum_community_share)-yt(e.withdrawn_com)),rolloverReserve:et(yt(e.accum_next_round_share)-yt(e.withdrawn_next_round)),airdropReserve:et(e.accum_airdrop_share),lastActionAt:et(i.chainNow)*1e3,config:{tokenDecimals:et(i.holder?.decimals??i.tokenDecimals??6),initialDurationMs:et(i.game.round_init_time)*1e3,extensionPerKeyMs:et(i.game.round_inc_time_per_key)*1e3,maxRemainingMs:et(i.game.round_max_time)*1e3},chain:{programId:i.programId,piggyMint:i.piggyMint,network:typeof i.network=="string"?i.network:i.network?.name||"localnet",holder:i.holder,wallet:i.walletConnected===!1?null:a.you?.wallet,walletConnected:i.walletConnected!==!1}}}const IS=Object.freeze(["devnet","testnet","mainnet-beta"]),NS=Object.freeze({devnet:"EtWTRABZaYq6iMfeYKouRu166VU2xqa1wcaWoxPkrZBG",testnet:"4uhcVJyU9pJkvQyS88uRDiswHXSCkY3zQawwpjk2NsNY","mainnet-beta":"5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d"}),Gc=i=>["localhost","127.0.0.1","[::1]","::1"].includes(i);function cf(i){const e=String(i).toLowerCase().replace(/\.+$/,"");if(Gc(e)||e.endsWith(".localhost")||e.endsWith(".local")||e==="local"||e.endsWith(".internal"))return!0;if(/^\d+(\.\d+){3}$/.test(e)){const[t,n]=e.split(".").map(Number);return t===0||t===10||t===127||t===169&&n===254||t===172&&n>=16&&n<=31||t===192&&(n===168||n===0)||t===100&&n>=64&&n<=127||t===198&&(n===18||n===19)||t>=224}if(e.includes(":")){const t=e.replace(/^\[|\]$/g,""),n=t.split("::");if(n.length>2||t.includes("%"))return!0;const r=n[0]?n[0].split(":"):[],s=n[1]?n[1].split(":"):[];if(r.length+s.length>8)return!0;const o=n.length===2?[...r,...Array(8-r.length-s.length).fill("0"),...s]:r;if(o.length!==8||o.some(l=>!/^([a-f\d]{1,4})$/.test(l)))return!0;const a=parseInt(o[0],16);return(a&57344)!==8192||a===8193&&parseInt(o[1],16)===3512}return!e||!e.includes(".")}function Ld(i,e,t){if(typeof i!="string"||!i||i!==i.trim())throw new TypeError(`${e} requires an explicit absolute HTTPS URL.`);const n=new URL(i);if(n.username||n.password||n.hash||n.protocol!=="https:")throw new TypeError(`${e} requires an HTTPS URL without embedded credentials or a fragment.`);if(cf(n.hostname))throw new TypeError(`${e} cannot use a private or local service.`);return n.href}function DS(i,{origin:e="https://piggy.invalid"}={}){if(!i||i.schemaVersion!==1||!IS.includes(i.cluster))throw new TypeError("An explicit PIGGY public-cluster configuration is required.");if(i.genesisHash!==NS[i.cluster])throw new TypeError("Configured genesis hash does not match the selected Solana cluster.");const t=new no(i.programId).toBase58(),n=new no(i.piggyMint).toBase58();if(t===no.default.toBase58()||n===no.default.toBase58())throw new TypeError("Deployment addresses cannot be placeholders.");if(typeof i.gameVersion=="number"&&!Number.isSafeInteger(i.gameVersion)||!/^[1-9]\d*$/.test(String(i.gameVersion))||BigInt(i.gameVersion)>(1n<<64n)-1n)throw new TypeError("A positive u64 game version is required.");if(i.purchaseGuardVersion!==1)throw new TypeError("Public deployments must support the on-chain guarded purchase instruction.");const r=i.priorityFeeMicroLamports??0;if(!Number.isSafeInteger(r)||r<0||r>1e6)throw new TypeError("Priority fee must be 0–1,000,000 micro-lamports per compute unit.");if(i.cluster==="mainnet-beta"&&i.mainnetEnabled!==!0)throw new TypeError("Mainnet actions are not enabled in this deployment configuration.");if(i.streamflowLocks!==void 0&&typeof i.streamflowLocks!="boolean")throw new TypeError("Streamflow lock eligibility must be an explicit boolean.");return Object.freeze({schemaVersion:1,cluster:i.cluster,genesisHash:i.genesisHash,programId:t,piggyMint:n,gameVersion:String(i.gameVersion),purchaseGuardVersion:1,rpcUrl:Ld(i.rpcUrl,"RPC"),proofIndexUrl:Ld(i.proofIndexUrl,"Holder proof index"),priorityFeeMicroLamports:r,mainnetEnabled:i.mainnetEnabled===!0,streamflowLocks:i.streamflowLocks===!0})}function US(i,e={}){if(Af(i.pathname))return e.VITE_PIGGY_CONFIG_URL?{mode:"public",configUrl:new URL(Tf,i.origin).href,claimOnly:!0}:{mode:"unconfigured",error:"The test-claims deployment is not configured. Transactions are disabled."};if(new URLSearchParams(i.search||"").get("demo")==="1")return{mode:"demo"};const n=e.VITE_PIGGY_CONFIG_URL;if(n)try{return{mode:"public",configUrl:new URL(n,i.origin).href}}catch{return{mode:"unconfigured",error:"The public deployment configuration URL is invalid. Transactions are disabled."}}return Gc(i.hostname)?{mode:"localnet"}:{mode:"unconfigured",error:"Public Solana deployment is not configured. Transactions are disabled."}}async function OS(i,{fetch:e=globalThis.fetch,origin:t=globalThis.location?.origin}={}){const n=new URL(i,t),r=n.origin===t&&Gc(n.hostname);if(n.username||n.password||n.hash||!r&&(n.protocol!=="https:"||cf(n.hostname)))throw new TypeError("Public configuration requires HTTPS hosting without credentials, private addresses or a fragment.");const s=await e(n.href,{cache:"no-store",credentials:"omit",redirect:"error"});if(!s.ok)throw new Error(`Unable to load deployment configuration (${s.status}).`);return DS(await s.json(),{origin:t})}const FS={VITE_PIGGY_CONFIG_URL:"/piggy-config.json"},T=i=>document.querySelector(i),Je=lf,mn=af;function is(){return yS({offlineDemo:dt,publicChain:lt,chainReady:On,chainHasState:Ni,connected:!!ze?.connected,wallet:ze?.wallet,stateWallet:$.chain?.wallet,proofWarning:!!$.chain?.holder?.proofWarning})}function on(i,e,{unit:t=!1,unknown:n="—"}={}){const r=T(i);if(!r)return;const s=Number.isSafeInteger(e)&&e>=0;r.textContent=s?`${mn(e)}${t?" SOL":""}`:n,r.title=s?`${Je(e)} SOL${dt?" · simulated":""}`:n,r.dataset.moneyState=s?"known":"unknown",s?r.dataset.lamports=String(e):delete r.dataset.lamports}const kS=i=>{const e=$.config?.tokenDecimals??0,t=BigInt(i).toString().padStart(e+1,"0"),n=(e?t.slice(0,-e):t).replace(/\B(?=(\d{3})+(?!\d))/g,","),r=e?t.slice(-e).replace(/0+$/,""):"";return n+(r?`.${r}`:"")},Tn=ES,uf="piggy.holder-demo.v4",Li=US(location,FS),dt=Li.mode==="demo",lt=Li.mode==="public",rs=Li.claimOnly===!0;rs&&document.documentElement.classList.add("test-claims-mode");let ze,On=!1,Ni=!1,Qt=!1,jt="",nl=!1,Pd,il=0,Id=0,Xs=null,qs=null,ji=null,ra=!1,Ps=null,Nd=-1,Ko=!1,$o=!1,Is=null,Yi=null,ko,nr,Bn=()=>{},ss=0,$,pn=!0,qi=!1,Tr;try{const i=JSON.parse(sessionStorage.getItem(uf));dt&&i?.state?.version===4&&i.state.players?.you&&Number.isSafeInteger(i.state.round?.endsAt)&&($=i.state,ss=Number.isSafeInteger(i.offset)?i.offset:0,pn=!!i.npcEnabled)}catch{}$||($=vc(Date.now(),{seeded:dt}));if(!dt){for(const i of Object.values($.players))i.balance=0,i.tokenBalance=0;$.round.status="connecting",$.round.id=0}const Wt=()=>Date.now()+ss;let ir=rs?Rf():of(T("#safe-art"));const qn=MS();T(".safe-stage").append(T("#reactor-stage .arena-feedback"));const Di=bS(),BS=Xf({enabled:lt,elements:{jackpot:T("#jackpot-usd"),rewards:T("#rewards-usd"),purchase:T("#purchase-usd"),gameClaim:T("#game-claim-usd"),holderClaim:T("#holder-claim-usd"),holderEarn:T("#holder-earn-usd"),keyEarn:T("#your-key-earn-usd")}}),os=qf({dialog:T("#rewards-dialog"),openDialog:i=>Di.open(i),formatSol:Je,onConnect:()=>{ra=!0,nr?nr():Di.open(T("#wallet-dialog"))}});function df(){os.render({state:$,offlineDemo:dt,publicChain:lt,connected:dt||(lt?!!ze?.connected:On),ready:is().walletKnown,chainPending:Qt,pendingSignature:lt?ze?.pendingSignature:null,walletName:lt?ze?.walletName:"Local test wallet",wallet:lt?ze?.wallet:$.chain?.wallet,readError:jt,action:Xs,progress:qs,result:ji})}const rl=new URLSearchParams(location.search).get("claim");(["game","holder"].includes(rl)||rs)&&queueMicrotask(()=>os.open(["game","holder"].includes(rl)?rl:"game"));if(rs){const i=Fe("main","test-claims-landing");i.innerHTML='<h1>Test-round claims.</h1><p>The launch has a fresh game. Your pre-launch SOL rewards stay available here.</p><button id="open-test-claims" type="button">View my test rewards</button><a href="/">Back to the live game</a>',T("#arena").before(i),T("#open-test-claims").addEventListener("click",()=>os.open("game")),T(".brand").href="/",T("#claim-dialog-title").textContent="Claim test rewards.",T(".claim-heading p").textContent="Pre-launch game and token-holder rewards. Connect the same wallet to claim."}let Dd,Yo,Ks=null,Ud,Od,Fd;const hf=window.matchMedia("(prefers-reduced-motion: reduce)");let Qs=hf.matches,ff,sc=!1;function ui(){clearTimeout(ff),sc&&(sc=!1,T("#app").classList.remove("payout-preview"),ir.cancelPreview(),qn.clear())}hf.addEventListener("change",i=>{Qs=i.matches,ui(),ir.dispose(),ir=of(T("#safe-art")),gf()});let Pi=Date.now()+28e3,kd,Bd,jo,oc,Fr=null,hi=null,fi="";function zS(i){if(T(".loot-amount").style.setProperty("--amount-chars",mn(i).length),T(".loot-amount").classList.toggle("is-long",mn(i).length>14),T(".loot-amount").classList.toggle("is-precise",mn(i).length>8),i===Fr){Yi=i,on("#key-loot-value",i);return}const e=Fr;if(Fr=i,cancelAnimationFrame(jo),$o=e!==null&&i>e&&!Qs,!$o){Yi=i,on("#key-loot-value",i);return}const t=performance.now(),n=r=>{const s=Math.max(0,Math.min(1,(r-t)/650));Yi=Math.round(e+(i-e)*(1-(1-s)**3)),on("#key-loot-value",Yi),Ys(),s<1?jo=requestAnimationFrame(n):($o=!1,Ys())};jo=requestAnimationFrame(n)}function HS(){const i=$.players.you,e=is(),t=dt||(lt?!!ze?.connected:On),n=t?"Updating…":"Connect wallet";T(".key-loot").dataset.walletKnown=String(e.walletKnown);const r=$.round.totalKeys?i.keys/$.round.totalKeys:0;e.walletKnown?zS(i.claimable):(cancelAnimationFrame(jo),Fr=null,Yi=null,$o=!1,on("#key-loot-value",null,{unknown:n})),on("#round-entry-spent",e.walletKnown?i.roundContribution||0:null),T("#loot-keys").textContent="Your share",T("#loot-share").textContent=e.walletKnown?`${Tn(r)} of key rewards`:"Connect to see your share",T("#loot-claim").textContent=t?i.claimable?"Claim":"View":"Connect wallet",T("#loot-claim").setAttribute("aria-label",e.walletKnown?`View and claim ${Je(i.claimable)} game SOL`:"Connect your wallet to see game rewards");const s=T("#holder-short-status"),o=T(".holder-money");o&&(o.dataset.empty=String(e.holderKnown&&i.tokenClaimable===0)),s&&(s.textContent=t?e.walletKnown?e.holderKnown?i.tokenClaimable>0?"Ready to claim":i.tokenBalance>0||ze?.config?.streamflowLocks?"No new rewards yet":"Hold $PIGGY to earn":"Rewards unavailable":"Reading rewards…":"Connect to see your rewards"),on("#holder-earn-amount",e.holderKnown?i.tokenClaimable:null,{unit:!0,unknown:t?e.walletKnown?"Unavailable":"Updating…":"Connect wallet"});const a=T(".holder-claim");if(a){const c=e.holderKnown&&i.tokenClaimable>0?"Claim SOL":"View rewards",u=[...a.childNodes].find(d=>d.nodeType===Node.TEXT_NODE);u&&(u.textContent=c),a.setAttribute("aria-label",c+" from holding $PIGGY")}let l;if(fi)l=fi;else if($.round.status==="settled")l=$.round.winnerId==="you"?"Your jackpot is ready to claim.":"Round over; earned SOL stays yours.";else if(hi?.roundId===$.round.id){const c=hi,u=c.isYou?"Your buy":dt?"NPC buy":"Another buy";l=c.keyDelta>0?`Key rewards +${mn(c.keyDelta)} SOL, including any own-feed share.`:i.keys?`${u}: no additional key reward this time.`:"Buy keys for a share of future feeds."}else l=i.keys?"Your keys earn a share of new feeds.":"Buy keys to earn a share of later feeds.";T("#key-loot-reason").textContent=t?l:"Connect your wallet to see rewards from your keys."}function sa(i,e="Key rewards"){if(!i)return;const t=T(".key-loot");if(T("#key-loot-pop").textContent=`+${mn(i)} SOL`,t.classList.remove("is-paid"),t.offsetWidth,t.classList.add("is-paid"),T("#key-loot-pop").classList.add("is-visible"),clearTimeout(oc),oc=setTimeout(()=>{t.classList.remove("is-paid"),T("#key-loot-pop").classList.remove("is-visible")},4e3),Qs)return;const n=T("#safe-art").getBoundingClientRect(),r=T(".loot-amount").getBoundingClientRect(),s=r.width&&r.height?r:T(".rewards-button").getBoundingClientRect(),o=Fe("span","loot-flight",`+${mn(i)} SOL`);o.setAttribute("aria-hidden","true"),o.title=e;const a=n.left+n.width*.5,l=n.top+n.height*.62,c=s.left+s.width*.5-a,u=s.top+s.height*.5-l;o.style.left=`${a}px`,o.style.top=`${l}px`,document.body.append(o),o.animate([{transform:"translate(-50%,-50%) scale(.85)",opacity:0},{transform:`translate(calc(-50% + ${c*.35}px),calc(-50% + ${u*.35-24}px)) scale(1)`,opacity:1,offset:.35},{transform:`translate(calc(-50% + ${c}px),calc(-50% + ${u}px)) scale(.85)`,opacity:0}],{duration:950,easing:"cubic-bezier(.2,.7,.3,1)",fill:"forwards"}).finished.then(()=>o.remove(),()=>o.remove())}function as(){clearTimeout(oc),T(".key-loot").classList.remove("is-paid"),T("#key-loot-pop").classList.remove("is-visible")}function pf(i,e,t,n,r){ui();const s=xc(e,Ii($)),o=$.players[i.playerId];hi={roundId:$.round.id,isYou:n,name:o.name,keyDelta:s.keyDelta},fi="",as(),an(),_f(i.count,t),sa(s.keyDelta),qn.purchase({isYou:n,playerName:n?"You":rr(i.playerId),jackpot:Ci($),jackpotDelta:Ci($)-t,rewardDelta:s.keyDelta,tokenRewardDelta:s.tokenDelta,count:i.count,yourKeys:$.players.you.keys,shareAfter:s.shareAfter,hasKeys:$.players.you.keys>0,lostCrown:!n&&r==="you"})}function mf(){if($.round.status!=="active"||Vn($,Wt())===0)return!1;const i=["whale","bear","snek","bull"],e=i[Math.floor(Math.random()*i.length)],t=["npc_fox","npc_orbit","npc_void","npc_koi"].filter(c=>{const u=Qi($,1,c,e);return u.ok&&u.cost<=$.players[c].balance});if(!t.length)return!1;const n=t[Math.floor(Math.random()*t.length)];let r=1+Math.floor(Math.random()*2);Qi($,r,n,e).cost>$.players[n].balance&&(r=1);const s=Ii($),o=$.round.lastBuyerId,a=Ci($),l=eh($,n,r,Wt(),e);return l.ok?(pf(l,s,a,!1,o),!0):!1}function Wc(){T("#app").classList.remove("purchase-flash"),T("#app").offsetWidth,T("#app").classList.add("purchase-flash"),clearTimeout(Dd),Dd=setTimeout(()=>T("#app").classList.remove("purchase-flash"),1700)}function VS(i){T(".pot-amount").style.setProperty("--amount-chars",mn(i).length),T(".pot-amount").classList.toggle("is-long",mn(i).length>14),T(".pot-amount").classList.toggle("is-precise",mn(i).length>8);const e=Ks;if(Ks=i,cancelAnimationFrame(Yo),Ko=e!==null&&i>e&&!Qs,!Ko){Is=i,on("#pot-value",i);return}const t=performance.now(),n=r=>{const s=Math.max(0,Math.min(1,(r-t)/650));Is=Math.round(e+(i-e)*(1-Math.pow(1-s,3))),on("#pot-value",Is),Ys(),s<1?Yo=requestAnimationFrame(n):(Ko=!1,Ys())};Yo=requestAnimationFrame(n)}function gf(){const i=dt&&$.round.id===1?147:$.round.openingRollover>0?12:0,e=dt&&$.round.id===1?Math.max(0,$.round.totalKeys-147):$.round.totalKeys;ir.setCoins(i+e),ir.setEnded($.round.status==="settled"&&!!$.round.winnerId)}function _f(i,e){T("#toast").classList.remove("visible"),Wc();const t=Ks-(e??Ks);t>0&&(T("#pot-increase").textContent=`+${Je(t)} SOL`,T("#pot-increase").classList.add("visible"),clearTimeout(Ud),Ud=setTimeout(()=>T("#pot-increase").classList.remove("visible"),2300)),ir.deposit(i)}function Xc(){if(dt)try{sessionStorage.setItem(uf,JSON.stringify({state:$,offset:ss,npcEnabled:pn}))}catch{}}function ar(i="buy"){if(qi)try{Tr||=new(window.AudioContext||window.webkitAudioContext),Tr.resume();const e=Tr.currentTime,t=i==="win"?[523.25,659.25,783.99]:[988,1483,2471],n=i==="win"?.085:.025;t.forEach((r,s)=>{const o=Tr.createOscillator(),a=Tr.createGain();o.type="sine",o.frequency.setValueAtTime(r,e+s*n),a.gain.setValueAtTime(0,e+s*n),a.gain.linearRampToValueAtTime(.022,e+s*n+.015),a.gain.exponentialRampToValueAtTime(.001,e+s*n+.18),o.connect(a),a.connect(Tr.destination),o.start(e+s*n),o.stop(e+s*n+.2)})}catch{}}function Ot(i,e="",t=!1){(document.querySelector("dialog[open]")||document.body).append(T("#toast")),T("#toast-title").textContent=i,T("#toast-detail").textContent=e,T("#toast").classList.toggle("error",t),T("#toast").classList.add("visible"),clearTimeout(kd),kd=setTimeout(()=>T("#toast").classList.remove("visible"),5e3)}T("#toast-dismiss").addEventListener("click",()=>T("#toast").classList.remove("visible"));const rr=i=>i?i==="you"?"You":`${dt||i.startsWith("npc_")?"NPC · ":""}${$.players[i]?.name||"Player"}`:"Nobody yet",$s=i=>{const e=Math.round(i/1e3);return e>=60?`${Math.floor(e/60)}m${e%60?` ${e%60}s`:""}`:`${e} seconds`};function Fe(i,e,t){const n=document.createElement(i);return e&&(n.className=e),t!==void 0&&(n.textContent=t),n}const jr=()=>T("#key-quantity").value===""?NaN:Number(T("#key-quantity").value),sr=()=>T("#reward-mode").value,ac=()=>Qi($,jr(),"you",sr(),dt?void 0:T("#referral-wallet")?.value.trim());function vf(){const i=Ps?.roundId===$.round.id?Ps.quote:null,e=Ps?.count,t=zf({state:$,count:e,mode:sr(),quote:i,costs:$.chain?.holder?.claimCosts,now:Wt()}),n=is(),r=t.ok&&n.gameKnown,s=n.walletKnown;T("#preview-keys-after").textContent=r&&s?String(t.ownedKeysAfter):"—",T("#preview-share-after").textContent=r&&s?Tn(t.keyShareAfter):"—",s||(T("#your-keys").textContent="—",T("#your-share").textContent="—"),on("#next-key-price",r?Zc(t.nextKeyPriceBeforeLamports):null),on("#next-key-price-after",r?Zc(t.nextKeyPriceAfterLamports):null);const o=T("#compact-share");o&&(o.textContent=r&&s?`${Tn(t.keyShareAfter)} of key rewards`:"Connect to see your share");const a=r?Math.ceil(t.resultingRemainingMs/1e3):null;return T("#preview-countdown").textContent=a===null?"—":[Math.floor(a/3600),Math.floor(a%3600/60),a%60].map(l=>String(l).padStart(2,"0")).join(":"),T("#preview-countdown").dataset.seconds=a===null?"":String(a),T("#purchase-time").textContent=r?$s(t.timeAddedMs):"—",T("#entry-review-time")&&(T("#entry-review-time").textContent=T("#purchase-time").textContent),T("#entry-review-clock")&&(T("#entry-review-clock").textContent=T("#preview-countdown").textContent),T("#preview-lead-result").textContent=$.round.status==="settled"?"Open a fresh round to buy keys":r?$.round.lastBuyerId==="you"?"This buy keeps you as the last buyer":"This buy makes you the last buyer":"Waiting for a valid live quote",t}function GS(i,e,t){let n=T("#entry-quote-review");n||(n=Fe("dl","feed-cost-review"),n.id="entry-quote-review",n.setAttribute("aria-label","Exact entry and wallet cost"),T("#entry-breakdown").before(n)),n.replaceChildren();const r=is(),s=(a,l,c)=>{const u=Fe("div"),d=Fe("dd","",l);c&&(d.id=c),u.append(Fe("dt","",a),d),n.append(u)};if(!r.gameKnown||!i.ok){s("Selected entry",i.ok?"Reading the current round…":i.error||"Choose a valid number of keys.");return}s("Keys to receive",e.toLocaleString(),"entry-review-keys"),s("Entry price",`${Je(i.cost)} SOL`,"entry-review-cost");const o=r.walletKnown?$.chain?.holder?.claimCosts?.entry:null;if(o){const a=BigInt(o.networkFees),l=BigInt(o.accountRent),c=BigInt(o.refundableRent);s("Estimated network fee",`${Je(Number(a))} SOL`,"entry-review-fee"),s("Account setup for this feed",`${Je(Number(l))} SOL`,"entry-review-setup"),s("Estimated total spent",`${Je(Number(BigInt(i.cost)+a+l))} SOL`,"entry-review-total"),s("Temporary rent, returned",`${Je(Number(c))} SOL`,"entry-review-returned-rent"),s("Estimated wallet balance needed",`${Je(Number(BigInt(i.cost)+a+l+c))} SOL`,"entry-review-balance-needed")}else n.append(Fe("small","",dt?"Simulated SOL; no wallet fee is charged.":"Connect your wallet for its fee and account-setup estimate."));s("Time added",$s(t.timeAddedMs),"entry-review-time"),s("Clock after this feed",T("#preview-countdown").textContent,"entry-review-clock"),r.walletKnown&&s("Your key-reward share after",Tn(t.keyShareAfter),"entry-review-share"),n.append(Fe("small","","USD is an estimate. Your wallet pays SOL; temporary rent is returned in the same transaction."))}function en(){const i=jr(),e=ac(),t=e.code==="LAUNCH_LIMIT"?"1 SOL wallet limit until 100 SOL enters this round.":e.error,n=$.round.status==="settled",r=$.players.you,s=is(),o=dt?"demo SOL":"SOL";on("#balance-value",s.walletKnown?r.balance:null,{unit:!0,unknown:lt&&!ze?.connected?"Connect wallet":"Updating…"}),T("#wallet-balance").innerHTML=s.walletKnown?`${Je(r.balance)} <small>SOL</small>`:lt&&!ze?.connected?"Connect wallet":"Updating…",T("#your-keys").textContent=r.keys.toLocaleString();const a=$.round.totalKeys?r.keys/$.round.totalKeys:0;T("#your-share").replaceChildren(document.createTextNode(Tn(a).slice(0,-1)),Fe("small","","%"));const l=n?"Start next round":e.ok?"Feed Piggy":"Choose keys";T("#buy-label").textContent=l,T("#buy-button").disabled=!n&&(!e.ok||e.cost>r.balance||Vn($,Wt())===0),T("#buy-button").setAttribute("aria-label",n?l:e.ok?`Buy ${i} round ${i===1?"key":"keys"} for ${Je(e.cost)} ${dt?"demo SOL":"SOL"}`:l),on("#purchase-cost",e.ok&&s.gameKnown?e.cost:null,{unit:!0}),T("#purchase-time").textContent=e.ok?$s(Math.min(e.extensionMs,Math.max(0,($.config?.maxRemainingMs??864e5)-Vn($,Wt())))):"—",T("#purchase-footnote").textContent=n?"Earned SOL stays yours. A new round resets keys.":e.ok?e.cost>r.balance?`Not enough ${o}. Try a smaller feed.`:"Not last? Your keys still earn from new buys.":t;const c=ih($,i);T("#purchase-outcome").title=e.ok?"":e.error,T("#purchase-outcome").textContent=n?"New round = a fresh position. Earned SOL stays yours.":e.ok?e.cost>r.balance?`Not enough ${o}. Choose a smaller feed.`:`Your share of key rewards: ${Tn(c.currentShare)} → ${Tn(c.afterShare)}`:t,T("#purchase-outcome").hidden=e.ok&&!n,Ps={quote:e,count:i,roundId:$.round.id};const u=vf();GS(e,i,u),T("#key-share-current").style.width=`${c.currentShare*100}%`,T("#key-share-preview").style.width=`${c.afterShare*100}%`,T(".key-share-track").setAttribute("aria-label",`Your cut of the key reward pool: ${Tn(c.currentShare)} now, ${Tn(c.afterShare)} after this feed`),T("#decrease").disabled=!Number.isSafeInteger(i)||i<=1||n,T("#increase").disabled=!Number.isSafeInteger(i)||i>=1e4||n,T("#key-quantity").disabled=n,T("#reward-mode").disabled=n,document.querySelectorAll("[data-quantity]").forEach(p=>{p.classList.toggle("selected",Number(p.dataset.quantity)===i),p.disabled=n}),T("#max-keys").disabled=n,T("#fast-forward").disabled=n,T("#demo-feed-button").disabled=n;const d={whale:"Whale puts the largest share of your purchase into the round pool.",bear:"Bear balances the round pool with immediate player rewards.",snek:"Snek puts the largest share into immediate player rewards.",bull:"Bull balances player rewards, the round pool and token-holder rewards."};T("#mode-explanation").textContent=`${d[sr()]} The last buyer’s mode also sets the round-closing distribution.`;const h=T("#entry-breakdown");if(h.replaceChildren(),e.ok){const p=[["Round pool",e.breakdown.pot],["Key rewards now",e.breakdown.keyHolders],["Token-holder rewards now",e.breakdown.tokenHolders],["Community + future reserves",e.breakdown.community+e.breakdown.rollover+e.breakdown.airdrop]];e.breakdown.affiliate&&p.push(["Referrer reward",e.breakdown.affiliate]);for(const[M,S]of p){const x=Fe("div");x.append(Fe("span","",M),Fe("strong","",`${Je(S)} SOL`)),h.append(x)}}const f=r.claimable+r.tokenClaimable,g=lt&&!ze?.connected,_=g?"Connect wallet":"Updating…";on("#hud-rewards",s.holderKnown?f:null,{unit:!0,unknown:s.walletKnown?"View rewards":_}),on("#dock-rewards",s.holderKnown?f:null,{unknown:s.walletKnown?"View rewards":_}),T(".rewards-button").setAttribute("aria-label",s.holderKnown?`View game and $PIGGY rewards, ${Je(f)} SOL available to claim`:g?"Connect your wallet to see claimable rewards":"View your reward balances"),T(".reward-dot").hidden=!s.walletKnown||!(r.claimable+(s.holderKnown?r.tokenClaimable:0)),T(".mode-button").setAttribute("aria-label","Review exact feed costs and payout split"),T("#mode-name").textContent={whale:"Jackpot focus",bear:"Balanced",snek:"Key rewards",bull:"Mixed rewards"}[sr()],T("#game-claimable").textContent=Je(r.claimable),T("#key-earned").textContent=Je(r.keyRewardsEarned||0),T("#game-share").textContent=Tn(a),T("#claim-button").disabled=!r.claimable,T("#claim-button").textContent=r.claimable?`Claim ${Je(r.claimable)} SOL`:"No game rewards to claim yet";const m=$.totalTokenSupply??Object.values($.players).reduce((p,M)=>p+M.tokenBalance,0);if(T("#token-balance").textContent=kS(r.tokenBalance),T("#token-share").textContent=Tn(m?r.tokenBalance/m:0),T("#token-claimable").textContent=Je(r.tokenClaimable),T("#token-earned").textContent=Je(r.tokenRewardsEarned||0),T("#claim-token-button").disabled=!r.tokenClaimable,T("#claim-token-button").textContent=r.tokenClaimable?`Claim ${Je(r.tokenClaimable)} SOL`:"No token rewards to claim yet",lt){const p=$.chain?.holder?.claimCosts,M=T("#buy-extra-cost"),S=p?.entry,x=S&&s.walletKnown&&!Qt&&!ze?.pendingSignature&&$.round.status==="active"&&Vn($,Wt())>0&&e.ok;if(M&&(M.hidden=!x,T("#buy-button").classList.toggle("has-cost-review",!!x),x)){const A=Number(S.accountRent);T("#buy-label").textContent="Feed Piggy",M.textContent=A?`+${mn(A)} setup +${mn(Number(S.networkFees))} fee`:`+${mn(Number(S.networkFees))} SOL fee`,M.title=`${Je(A)} SOL permanent setup + ${Je(Number(S.networkFees))} SOL network fee; ${Je(Number(S.refundableRent))} SOL temporary rent is returned.`,T("#buy-button").setAttribute("aria-label",`Buy ${i} round keys for ${Je(e.cost)} SOL, plus ${Je(A)} SOL permanent first-feed account setup and approximately ${Je(Number(S.networkFees))} SOL network fees. Temporary ${Je(Number(S.refundableRent))} SOL account rent is returned.`)}for(const[A,C,R,N]of[["game","game-claim-cost","claim-button",r.claimable],["holder","holder-claim-cost","claim-token-button",r.tokenClaimable]]){const w=T(`#${C}`);if(!w)continue;const y=p?.[A];if(y){const L=BigInt(y.netAmount),k=L<0n?`−${Je(Number(-L))}`:Je(Number(L));w.textContent=`Estimated net: ${k} SOL after ${Je(Number(y.networkFees))} SOL network fees${BigInt(y.accountRent)>0n?` + ${Je(Number(y.accountRent))} SOL in permanent claim-account rent`:""}. Temporary ${Je(Number(y.refundableRent))} SOL wrapped-account rent is returned. ${y.transactions} wallet approval${y.transactions===1?"":"s"}.`,L<=0n&&(T(`#${R}`).disabled=!0,T(`#${R}`).textContent="Reward is below claim cost",w.textContent+=" This reward stays on chain; the default claim avoids spending more than it receives.")}else w.textContent=p?.error||(N?"Claim costs are refreshing. Review the fee and account-rent estimate before claiming.":""),N&&(T(`#${R}`).disabled=!0)}}if(!dt){const p=lt&&!!ze?.pendingSignature,M=!On||Qt||p||lt&&ze?.connected&&!s.walletKnown;T("#buy-button").disabled||=M,T("#claim-button").disabled||=M,T("#claim-token-button").disabled||=M,T("#demo-feed-button").disabled||=M,T("#fast-forward").disabled=!0,T("#reset-demo").disabled=!0,M?T("#buy-label").textContent=p?"Confirmation pending…":Qt?"Confirm in wallet…":jt?"Solana unavailable":"Connecting…":!n&&Vn($,Wt())===0&&(T("#buy-label").textContent="Crack Piggy · Settle round",T("#buy-button").disabled=!1),jt&&(T("#purchase-footnote").textContent=jt);for(const x of document.querySelectorAll("[data-chain-action]"))x.disabled=M||lt&&!ze?.connected;const S=document.querySelector(".quantity-label > span");S&&(S.textContent=`+${$s($.config?.extensionPerKeyMs??3e4)} per key`),lt&&!ze?.connected&&!Qt&&(T("#buy-label").textContent="Connect wallet",T("#buy-button").disabled=!ze,T("#claim-button").disabled=!0,T("#claim-token-button").disabled=!0,Ni&&!jt&&(T("#purchase-footnote").textContent="Buy round keys with SOL.",T("#purchase-outcome").textContent="New key buys fund rewards. More keys mean a larger share.")),lt&&Bn()}if(HS(),df(),!dt&&!Ni){for(const p of["pot-value","winner-prize","game-claimable","key-earned","token-claimable","token-earned","token-balance","purchase-cost"]){const M=T(`#${p}`);M.textContent="—",M.removeAttribute("title"),delete M.dataset.lamports,M.dataset.moneyState="unknown"}Is=null,Ks=null,cancelAnimationFrame(Yo),Ko=!1,T("#purchase-footnote").textContent=jt||"Reading confirmed balances and game state from Solana.",T("#key-loot-reason").textContent="Waiting for confirmed account data.",T("#purchase-outcome").textContent=jt?lt?jt:"Solana is unavailable. Open Wallet for details.":"Connecting…"}Ys(e),rs&&(T("#buy-button").disabled=!0,T("#buy-label").textContent="Test claims only",T(".demo-badge").lastChild.textContent="Test claims · SOL",T("#claim-network-note").textContent="Pre-launch mainnet instance. New entries are disabled on this page; existing game and funded token-holder SOL rewards remain claimable.")}function Ys(i=Ps?.quote){const e=$.players.you,t=is();BS.setAmounts({jackpot:t.gameKnown?Is:null,rewards:t.walletKnown?Yi:null,keyEarn:t.walletKnown?Yi:null,gameClaim:t.walletKnown?e.claimable:null,holderClaim:t.holderKnown?e.tokenClaimable:null,holderEarn:t.holderKnown?e.tokenClaimable:null,purchase:t.gameKnown&&i?.ok?i.cost:null})}function lc(){if(!dt&&!Ni){for(const e of["hours","minutes","seconds"])T(`#${e}`).textContent="—";return}const i=Math.ceil(Vn($,Wt())/1e3);i!==Nd&&(Nd=i,vf()),T("#hours").textContent=String(Math.floor(i/3600)).padStart(2,"0"),T("#minutes").textContent=String(Math.floor(i%3600/60)).padStart(2,"0"),T("#seconds").textContent=String(i%60).padStart(2,"0"),T("#app").classList.toggle("urgent",i>0&&i<=20&&$.round.status==="active"),T("#app").classList.toggle("final-minute",i>0&&i<=60&&$.round.status==="active"),T(".countdown-meter").style.setProperty("--clock-ratio",`${Math.min(100,i/60*100)}%`),i>0&&i<=10&&i!==Od&&!Qs&&(T("#app").classList.remove("clock-tick"),T("#app").offsetWidth,T("#app").classList.add("clock-tick"),clearTimeout(Fd),Fd=setTimeout(()=>T("#app").classList.remove("clock-tick"),350)),Od=i}function WS(i){const e=Math.max(0,Math.floor((Wt()-i)/1e3));return e<5?"Just now":e<60?`${e}s ago`:e<3600?`${Math.floor(e/60)}m ago`:`${Math.floor(e/3600)}h ago`}function xf(){const i=T("#activity-list");i.replaceChildren();for(const e of $.activity.slice(0,3)){const t=Fe("div","activity-row"),n=e.playerId||e.winnerId,r=$.players[n],s=Fe("div","activity-user"),o=Fe("span","activity-avatar",r?.avatar||"↻");o.style.background=r?`${r.color}12`:"#1c2931",o.style.color=r?.color||"#8aa0af",s.append(o,Fe("span","",rr(n))),t.append(s);const a={settlement:"Won the jackpot",claim:"Claimed game SOL","token-claim":"Claimed token SOL","claim-token":"Claimed token SOL","new-round":"New round"},l=e.type==="settlement"&&!n?"Unclaimed pool rolled forward":e.type==="purchase"?`Bought ${e.count} ${e.count===1?"key":"keys"}`:a[e.type]||"Received rewards",c=e.cost??e.amount??e.winnerPrize;t.append(Fe("span","",l),Fe("span","",c===void 0?"—":`${Je(c)} SOL`),Fe("time","",WS(e.timestamp))),i.append(t)}}function qc(){const i=T("#history-list");if(i.replaceChildren(),!$.history.length){const e=Fe("div","empty-history");e.append(Fe("strong","","No completed rounds yet."),Fe("span","","The jackpot winner and actual payout will appear here.")),i.append(e);return}for(const e of $.history){const t=Fe("div","history-item"),n=Fe("div"),r=Fe("div");n.append(Fe("strong","",`Round ${String(e.roundId).padStart(2,"0")}`),Fe("span","",e.winnerId?rr(e.winnerId):"No buyer · funds rolled forward")),r.append(Fe("strong","",`${Je(e.winnerId?e.winnerPrize:e.rolloverAmount)} SOL`),Fe("span","",e.winnerId?`${e.totalKeys} keys · Pot paid`:"Carried to next round")),t.append(n,r),i.append(t)}}function an(){const i=$.round.status==="settled",e=i?$.round.winnerId:$.round.lastBuyerId,t=$.players[e],n=$.round.status==="active"&&!e;n&&!$.round.openingRollover&&$.round.grossEntries,(T("#jackpot-label")||T(".pot-block .quiet-label")).textContent=i?e?"Piggy paid out":"Pot carried forward":"Jackpot",T(".pot-caption").textContent=i?"Jackpot awarded.":"Last feeder at zero wins.",VS(i?$.round.settlement.winnerPrize:Ci($)),gf(),T("#winner-prize").innerHTML=`${Je($.round.grossEntries)} <small>SOL</small>`,T("#round-badge").textContent=`Round ${String($.round.id).padStart(2,"0")}${i?" · Finished":""}`,T("#leader-name").textContent=i&&!e?"No buyer this round":n?"No feeds yet":rr(e),T("#leader-avatar").textContent=t?.avatar||"—",T("#leader-avatar").style.color=t?.color||"#8999a7",T("#leader-avatar").style.background=t?`${t.color}17`:"#141c23",T("#leader-label").textContent=i?e?"Jackpot winner":"Unclaimed funds roll forward":e?"Last feeder":"First feed takes the lead",T("#timer-caption").textContent=i?"Round finished":n?"Next round in":"Cracks in",T("#core-state").textContent=i?e==="you"?"You won. Your jackpot is ready to claim.":e?"The jackpot has been awarded.":"Start the next round to play for the carried funds.":e==="you"?"You are in the lead. Your keys stay yours if passed.":"Feed Piggy to take the crown.",T("#action-title").textContent=i?"Start next round":"Feed Piggy",T("#action-subtitle").textContent=i?"Keys reset. Earned SOL stays yours.":"Buy keys. Share later feeds.",T("#position-state").textContent=i?e==="you"?"Round won":"Round ended":$.players.you.keys?e==="you"?"Currently leading":"Shares earning rewards":"Not in this round",T("#npc-toggle").setAttribute("aria-pressed",String(pn)),T("#app").classList.toggle("round-over",i),T("#app").classList.toggle("win",e==="you"),T("#app").classList.toggle("has-jackpot",i&&!!e),lc(),en(),xf(),qc(),Xc(),!dt&&!Ni&&(T("#leader-name").textContent="Waiting for Solana",T("#leader-avatar").textContent="—",T("#leader-label").textContent="Reading the current round",T("#round-badge").textContent="Connecting",T("#core-state").textContent="Waiting for confirmed game accounts.")}function lr(i){T("#key-quantity").value=String(i),en()}T("#decrease").addEventListener("click",()=>lr(Math.max(1,jr()-1)));T("#increase").addEventListener("click",()=>lr(Math.min(1e4,jr()+1)));T("#key-quantity").addEventListener("input",en);T("#key-quantity").addEventListener("keydown",i=>{i.key==="Enter"&&(i.preventDefault(),i.currentTarget.blur())});T("#reward-mode").addEventListener("change",en);T("#referral-wallet").addEventListener("input",en);document.querySelectorAll("[data-quantity]").forEach(i=>i.addEventListener("click",()=>lr(Number(i.dataset.quantity))));T("#max-keys").addEventListener("click",()=>{let i=0,e=1e4;for(;i<e;){const t=Math.ceil((i+e)/2),n=Qi($,t,"you",sr());n.ok&&n.cost<=$.players.you.balance?i=t:e=t-1}lr(Math.max(1,i))});T("#buy-button").addEventListener("click",async()=>{if(lt&&!ze?.connected){nr?nr():Di.open(T("#wallet-dialog"));return}if(!dt)return ls($.round.status==="settled"?"startRound":Vn($,Wt())===0?"endRound":"feed",{count:jr(),mode:sr(),referral:T("#referral-wallet")?.value.trim()||void 0,maxCostLamports:ac().ok?String(ac().cost):void 0,expectedRound:String($.round.id)});if($.round.status==="settled"){const r=Bf($,Wt());if(!r.ok)return Ot("Could not start the round",r.error,!0);ui(),qn.clear(),hi=null,fi="",as(),lr(1),Pi=Date.now()+16e3,an(),Di.wipe(),Ot(`Piggy round ${$.round.id} is open`,"Fresh position. Fresh crown. Your earned SOL stays yours.");return}const i=Ii($),e=$.round.lastBuyerId,t=Ci($),n=eh($,"you",jr(),Wt(),sr());if(!n.ok){Ot("Feed not completed",n.error,!0),an();return}ar(),pf(n,i,t,!0,e),!i.keys&&pn&&(Pi=Math.min(Pi,Date.now()+5500)),T("#time-extension").textContent=`+${$s(n.actualExtensionMs)}`,T("#time-extension").classList.add("visible"),clearTimeout(Bd),Bd=setTimeout(()=>T("#time-extension").classList.remove("visible"),2200)});T("#npc-toggle").addEventListener("click",()=>{dt&&(pn=!pn,Pi=Date.now()+6500,T("#npc-toggle").setAttribute("aria-pressed",String(pn)),Xc(),Ot(pn?"NPC simulation on":"NPC simulation paused",pn?"Labelled NPC feeders can buy keys in this demo.":"The countdown continues without computer purchases."))});T("#claim-button").addEventListener("click",()=>{if(!dt)return ls("claimGame");const i=Ff($,"you");i.ok?(ji={kind:"game",status:"success"},as(),fi=$.round.status==="active"?`${Je(i.amount)} SOL claimed. Your position keeps its cut.`:`${Je(i.amount)} SOL claimed. Piggy is ready for a fresh round.`,an(),ar("win"),Ot("Piggy loot claimed",`${Je(i.amount)} demo SOL added to your wallet. Your keys stay yours.`)):Ot("Nothing to claim",i.error,!0)});T("#claim-token-button").addEventListener("click",()=>{if(!dt)return ls("claimHolder");const i=kf($,"you");i.ok?(ji={kind:"holder",status:"success"},an(),ar("win"),Ot("Token-holder rewards claimed",`${Je(i.amount)} demo SOL added to your wallet. Your tokens stay in your wallet.`)):Ot("Nothing to claim",i.error,!0)});document.querySelectorAll("[data-dialog]").forEach(i=>i.addEventListener("click",()=>{if(lt&&i.dataset.dialog==="wallet-dialog"&&nr){nr();return}if(qc(),en(),i.dataset.dialog==="rewards-dialog"){os.open(i.hasAttribute("data-open-holder")?"holder":i.hasAttribute("data-open-game")||i.id==="loot-claim"?"game":void 0);return}Di.open(T(`#${i.dataset.dialog}`))}));document.addEventListener("click",i=>{const e=i.target.closest("[data-open-holder]");!e||e.hasAttribute("data-dialog")||(i.preventDefault(),en(),os.open("holder"))});document.querySelectorAll("dialog").forEach(i=>{i.querySelectorAll(".dialog-close,.dialog-done").forEach(e=>e.addEventListener("click",()=>i.close())),i.addEventListener("close",()=>{i.id==="wallet-dialog"&&!ze?.connected&&(ra=!1),i.contains(T("#toast"))&&document.body.append(T("#toast"))}),i.addEventListener("click",e=>{const t=i.getBoundingClientRect();(e.clientX<t.left||e.clientX>t.right||e.clientY<t.top||e.clientY>t.bottom)&&i.close()})});T("#fast-forward").addEventListener("click",()=>{dt&&(pn=!1,ss+=Math.max(0,Vn($,Wt())-5e3),T("#wallet-dialog").close(),an(),Ot("Final five seconds","NPC purchases are paused. The last buyer receives the displayed jackpot at zero."))});T("#reset-demo").addEventListener("click",()=>{dt&&(ui(),qn.clear(),ss=0,$=vc(Date.now()),as(),hi=null,fi="",pn=!0,Pi=Date.now()+28e3,lr(1),T("#wallet-dialog").close(),an(),Wc(),Ot("Piggy demo reset","500 demo SOL and 1,000 demo $PIGGY. Feed Piggy to get keys."))});T("#demo-feed-button").addEventListener("click",()=>{if(T("#wallet-dialog").close(),!dt)return ls("feedNpc",{count:5,mode:"snek"});mf()||Ot("No demo feed available","Start an active round or reset the demo wallets.",!0),Pi=Date.now()+5e4});T("#preview-payout").addEventListener("click",()=>{T("#wallet-dialog").close(),ir.previewPayout()?(sc=!0,T("#app").classList.add("payout-preview"),qn.preview(),ar("win"),ff=setTimeout(ui,4400)):Ot("Preview unavailable","Feed Piggy first, or wait for the current payout to finish.")});const li=Fe("button","sound-button");li.setAttribute("aria-label","Enable sound");li.setAttribute("aria-pressed","false");li.innerHTML='<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4Z"/><path d="m17 9 5 6m0-6-5 6"/></svg>';const Kc=Fe("div");Kc.style.cssText="display:flex;align-items:center;gap:9px";T("#round-badge").parentElement.before(Kc);Kc.append(li,T("#round-badge").parentElement);T(".topbar nav").prepend(li);li.addEventListener("click",()=>{qi=!qi,li.setAttribute("aria-pressed",String(qi)),li.setAttribute("aria-label",qi?"Mute sound":"Enable sound"),li.innerHTML=qi?'<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4Z"/><path d="M17 8c3 2 3 6 0 8m3-11c5 4 5 10 0 14"/></svg>':'<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4Z"/><path d="m17 9 5 6m0-6-5 6"/></svg>',qi&&ar()});setInterval(()=>{if(!dt){lc(),Pd!==$.round.id&&(Pd=$.round.id,il=0),!lt&&On&&!Qt&&$.round.status==="active"&&Vn($,Wt())===0&&il<3&&Date.now()>=Id&&(il++,Id=Date.now()+5e3,ls("endRound"));return}if($.round.status==="active"&&Vn($,Wt())===0){const i=Ii($),e=Of($,Wt());if(e.ok){ui();const t=xc(i,Ii($));fi="",an(),sa(t.keyDelta,"Closing key rewards"),Wc(),ar("win"),qn.settled({isYou:e.winnerId==="you",winnerName:e.winnerId?rr(e.winnerId):void 0,jackpot:e.winnerPrize})}return}pn&&$.round.status==="active"&&Date.now()>=Pi&&(mf(),Pi=Date.now()+5e4+Math.random()*6e4),lc()},250);setInterval(xf,5e3);window.addEventListener("pagehide",Xc);an();Di.wipe();async function $c(i,{feedbackEnabled:e=!0}={}){const t=Ii($),n=Ci($),r=$.round.lastBuyerId,s=$.round.id,o=$.round.status,a=$.round.totalKeys,l=PS(i);if($=l,ss=l.lastActionAt-Date.now(),On=!0,Ni=!0,jt="",s!==l.round.id&&(ui(),qn.clear()),e&&s===l.round.id){const u=xc(t,Ii($));if(o==="active"&&l.round.status==="settled")hi=null,ui(),an(),sa(u.keyDelta,"Closing key rewards"),ar("win"),qn.settled({isYou:l.round.winnerId==="you",winnerName:l.round.winnerId?rr(l.round.winnerId):void 0,jackpot:l.round.settlement.winnerPrize});else if(l.round.status==="active"&&l.round.totalKeys>a){ui();const d=l.round.lastBuyerId==="you";hi={roundId:l.round.id,isYou:d,keyDelta:u.keyDelta},an(),_f(l.round.totalKeys-a,n),sa(u.keyDelta),qn.purchase({isYou:d,playerName:rr(l.round.lastBuyerId),jackpot:Ci($),jackpotDelta:Ci($)-n,rewardDelta:u.keyDelta,tokenRewardDelta:u.tokenDelta,count:l.round.totalKeys-a,yourKeys:l.players.you.keys,shareAfter:u.shareAfter,hasKeys:l.players.you.keys>0,lostCrown:!d&&r==="you"})}}const c=$.chain.network==="mainnet-beta"?"Mainnet":$.chain.network==="localnet"?"Local":$.chain.network[0].toUpperCase()+$.chain.network.slice(1);T(".demo-badge").lastChild.textContent=lt?`${c}${$.chain.network==="mainnet-beta"?" · SOL":" · Test SOL"}`:"Local · Test SOL",T(".wallet-button > span").textContent=lt?ze?.connected?ze.walletName||"Your wallet":"Connect wallet":"Test wallet",T(".wallet-button").setAttribute("aria-label",lt?"Open Solana wallet":"Open test wallet"),T(".balance-line > span").textContent=lt&&$.chain.network==="mainnet-beta"?"Wallet balance":"Test balance",T("#chain-wallet").textContent=$.chain.wallet||"Connect your wallet",T("#chain-program").textContent=$.chain.programId,T("#chain-mint").textContent=$.chain.piggyMint,T("#chain-network").textContent=`${$.chain.network||"localnet"} · ${$.chain.network==="mainnet-beta"?"real SOL":"test funds"}`,lt&&$.chain.holder?.proofWarning&&(T("#holder-funding-note").textContent=`Holder rewards are temporarily unavailable: ${$.chain.holder.proofWarning}. Existing allocations remain on chain. Game entries and game claims are independent.`),an()}async function ls(i,e={}){try{Cf(rs,i)}catch(r){Ot("Test claims only",r.message,!0);return}if(!On||Qt)return;const t=i==="claimGame"||i==="claimHolder",n=lt?ze.wallet:$.chain?.wallet;Xs=i,t&&(qs={status:"preparing"},ji=null),Qt=!0,en();try{const r=await ze.action({action:i,...e});if(r.ok===!1)throw new Error(r.error||"Solana rejected this transaction.");if(lt&&r.wallet&&r.wallet!==ze.wallet){await zd(),Ot("Previous wallet transaction confirmed",`Check ${r.signature} in the wallet that signed it.`);return}t&&(ji={kind:i==="claimHolder"?"holder":"game",status:"success",wallet:n,warning:r.warning}),cc(r.signature||r.signatures?.at(-1));try{await $c(r.state||await ze.getState())}catch{On=!1,jt="Transaction confirmed. Balances are refreshing; check its signature in Wallet.",Ot("Transaction confirmed",jt);return}i==="startRound"&&(hi=null,fi="",as(),lr(1),Di.wipe()),Ot({feed:"Piggy fed",feedNpc:"Test feeder confirmed",claimGame:"Game SOL claimed",claimHolder:"$PIGGY holder SOL claimed",endRound:"Piggy paid out",startRound:"New Piggy round opened",publishHolderEpoch:"Holder rewards funded",withdrawCommunity:"Community fees claimed"}[i]||"Transaction confirmed",r.warning||`Confirmed on ${lt?$.chain.network:"your local Solana validator"}.`)}catch(r){t&&(ji={kind:i==="claimHolder"?"holder":"game",status:r.name==="PendingTransactionError"?"pending":"error",wallet:n,message:r.message}),r.signature&&cc(r.signature),Ot(r.name==="PendingTransactionError"?"Confirmation pending":"Transaction not completed",r.message,!0),await zd()}finally{Qt=!1,Xs=null,qs=null,an()}}function cc(i){const e=T("#last-transaction");if(!i){e.textContent="No transaction was needed.";return}if(!lt){e.textContent=i;return}const t=Fe("a","",i);t.href=`https://explorer.solana.com/tx/${encodeURIComponent(i)}${ze.config.cluster==="mainnet-beta"?"":`?cluster=${encodeURIComponent(ze.config.cluster)}`}`,t.target="_blank",t.rel="noopener noreferrer",t.setAttribute("aria-label","View this transaction on Solana Explorer"),e.replaceChildren(t)}async function zd(){try{await $c(await ze.getState(),{feedbackEnabled:!1})}catch{}}async function Ir(){if(!(nl||Qt||!ze)){nl=!0;try{await $c(await ze.getState(),{feedbackEnabled:On})}catch(i){On=!1,jt=lt||Li.mode==="unconfigured"?i.message:"Start the local Solana service to feed Piggy. No transaction has been sent.",T(".demo-badge").lastChild.textContent="Disconnected",en()}finally{nl=!1}}}function XS(i){if(i.wallet&&i.wallet!==ze?.wallet||(i.signature&&cc(i.signature),!Qt)||((Xs==="claimGame"||Xs==="claimHolder")&&(qs=i,df()),T("#buy-label").textContent=i.status==="awaiting-wallet"?"Approve in wallet…":"Confirming on Solana…",i.status!=="awaiting-wallet"))return;const e=Number(i.fee||0),t=Number(i.accountRent||0),n=Number(i.refundableRent||0),r=Number(i.claimAmount||0);if(r){const s=T(t?"#holder-claim-cost":"#game-claim-cost"),o=r-e-t;s&&(s.textContent=`This transaction: ${Je(r)} SOL reward, ${Je(e)} SOL network fee${t?`, ${Je(t)} SOL permanent receipt rent`:""}. Net ${o<0?"−":""}${Je(Math.abs(o))} SOL. Temporary ${Je(n)} SOL rent is returned.`)}else{const s=T("#buy-extra-cost");s.hidden=!1,T("#buy-button").classList.add("has-cost-review"),s.textContent=`${Je(e)} SOL fee${t?` + ${Je(t)} setup`:""}`}}dt||(pn=!1,T("#npc-toggle").hidden=!0,T("#local-chain-controls").hidden=!1,T("#wallet-dialog h2").textContent="Your local test wallet.",T("#wallet-dialog .kb-dialog-content > p").textContent="This wallet sends real transactions on your local Solana validator using test SOL and a test $PIGGY mint. No mainnet funds are used.",T("#wallet-mode-note").textContent="The local service signs only with isolated test keypairs. Original timing and prices are enforced by the program. The test mint stays in your wallet when you claim holder SOL.",T("#claim-network-note").textContent="Game loot is read from Solana accounts, including earlier rounds. Holder loot comes from funded wallet-balance snapshots; the local publisher assigns epochs and proofs. No staking.",T("#rules-dialog .dialog-note").textContent="Local Solana test deployment. SOL entries use wrapped SOL in the program; claims unwrap into your test wallet. Original fee splits and pricing apply. The $PIGGY snapshot and claim system extends the original GitHub source. Lottery draws use the fork’s explicit local test feature.",T("#history-dialog .kb-dialog-content > p").textContent="Completed rounds and jackpots are read from the local Solana program.",T("#demo-feed-button").textContent="Feed from another test wallet",T("#fast-forward").hidden=!0,T("#reset-demo").hidden=!0,T(".demo-badge").lastChild.textContent="Connecting…",document.querySelectorAll("[data-chain-action]").forEach(i=>i.addEventListener("click",()=>ls(i.dataset.chainAction))),lt?qS():Li.mode==="localnet"?hc(async()=>{const{createLocalGameClient:i}=await import("./solana-client-CxyLWlkE.js");return{createLocalGameClient:i}},[]).then(({createLocalGameClient:i})=>(ze=i({baseUrl:"/api/local"}),Ir())).catch(i=>{jt=i.message,en()}):(jt=Li.error,T("#wallet-dialog h2").textContent="Deployment not configured.",T("#wallet-dialog .kb-dialog-content > p").textContent=Li.error,T("#local-chain-controls").hidden=!0,T(".demo-badge").lastChild.textContent="Unavailable",en()),setInterval(Ir,lt?5e3:1500));async function qS(){T(".wallet-button > span").textContent="Connect wallet",T(".wallet-button").setAttribute("aria-label","Open Solana wallet");const i=Fe("small","buy-extra-cost");i.id="buy-extra-cost",i.hidden=!0,T("#buy-label").after(i);const e=T("#wallet-dialog");e.classList.add("public-wallet-dialog"),e.setAttribute("aria-labelledby","public-wallet-title"),e.setAttribute("aria-describedby","public-wallet-intro");const t=e.querySelector(".kb-dialog-content"),n=e.querySelector("h2");n.id="public-wallet-title";const r=t.querySelector(":scope > p");r.id="public-wallet-intro";const s=t.querySelector(".dialog-symbol");s.replaceChildren(T(".piggy-mark").cloneNode()),s.setAttribute("aria-hidden","true");const o=Fe("div","wallet-controls");o.id="public-wallet-controls";const a=Fe("div","wallet-provider-list");a.id="public-wallet-list",a.setAttribute("aria-label","Available Solana wallets");const l=Fe("select");l.id="public-wallet-choice",l.hidden=!0,l.setAttribute("aria-label","Solana wallet");const c=Fe("p","wallet-connection-status","Finding wallets in this browser…");c.id="public-wallet-status",c.setAttribute("role","status"),c.setAttribute("aria-live","polite"),c.setAttribute("aria-atomic","true");const u=Fe("button","secondary-button wallet-retry","Connect wallet");u.id="public-wallet-connect",u.type="button",u.disabled=!0,u.hidden=!0;const d=Fe("button","wallet-disconnect","Disconnect");d.id="public-wallet-disconnect",d.type="button",d.hidden=!0;const h=Fe("div","wallet-empty");h.hidden=!0,h.append(Fe("strong","","No supported wallet detected in this browser."),Fe("p","","On your phone, open PIGGY inside a wallet’s browser. On desktop, install its browser extension."));const f=Fe("div","wallet-open-links");for(const[K,ne,ce]of[["Solflare","https://solflare.com/ul/v1/browse/","https://www.solflare.com/download"]]){const ae=Fe("div","wallet-open-choice"),ye=Fe("a","secondary-button",`Open ${K}`);ye.href=`${ne}${encodeURIComponent(location.href)}?ref=${encodeURIComponent(location.origin)}`,ye.rel="noopener noreferrer",ye.target="_blank";const Ue=Fe("a","wallet-install-link",`Get ${K}`);Ue.href=ce,Ue.target="_blank",Ue.rel="noopener noreferrer",ae.append(ye,Ue),f.append(ae)}const g=Fe("p","wallet-browser-note","Connect and play in that wallet browser. Returning here does not connect this browser.");h.append(f,g);const _=Fe("details","wallet-browser-help");_.append(Fe("summary","","Using a different wallet or browser?"),Fe("p","","Only wallets available in this browser appear above. Open PIGGY in your preferred Solana wallet browser, or install its official extension, then reopen this chooser.")),o.append(l,a,c,u,h,_,d),r.after(o);const m=Fe("details","wallet-account-details");m.append(Fe("summary","","Balance & account details"));const p=Fe("div","wallet-account-body");for(const K of[...t.children])!["dialog-symbol"].includes(K.className)&&K!==n&&K!==r&&K!==o&&p.append(K);m.append(p),o.after(m),n.textContent="Choose your wallet",r.textContent="Connect to feed Piggy and claim your SOL.",T("#wallet-mode-note").textContent="Your first feed in each round also creates a permanent player account. Feed shows that setup cost separately from the entry price. Network fees apply, and temporary wrapped-SOL account rent is returned atomically. Claims show their estimated net reward after costs. Check the network and amounts before approving.",T("#claim-network-note").textContent="Game loot is read from confirmed Solana accounts. $PIGGY holder loot comes from published, funded wallet-balance snapshots. Claims verify the proof against the on-chain epoch. No staking.",T("#token-share").previousElementSibling.textContent="Share of token supply",T("#rewards-dialog .token-reward-card .reward-explainer").textContent="No staking. Each funded snapshot rewards eligible wallet holders. Pool/program wallets and disclosed excluded wallets do not earn; this supply percentage is separate from a snapshot reward allocation.";for(const[K,ne]of[["game-claim-cost","#claim-button"],["holder-claim-cost","#claim-token-button"]]){if(T(`#${K}`))continue;const ce=Fe("p","dialog-note");ce.id=K,ce.setAttribute("aria-live","polite"),T(ne).before(ce)}T("#rules-dialog .dialog-note").textContent="SOL entries use wrapped SOL atomically. Game claims unwrap to your connected wallet. Original fee splits, launch limits, timers and pricing apply. Keys cannot be sold back. Holder rewards require published funded snapshots. Lottery rewards are disabled; their reserve carries into later rounds.",T("#history-dialog .kb-dialog-content > p").textContent="Confirmed completed PIGGY rounds. Your earned SOL remains claimable after a new round starts.",T("#chain-mint").previousElementSibling.textContent="$PIGGY mint",T("#demo-feed-button").hidden=!0,document.querySelectorAll('[data-chain-action="publishHolderEpoch"],[data-chain-action="withdrawCommunity"]').forEach(K=>K.hidden=!0);const M=T('[data-chain-action="endRound"]');M.textContent="Settle Piggy after the clock reaches zero";let S=!1,x=!1,A="",C="",R=[],N="",w=0,y=!1,L=!1;const k=()=>`piggy.wallet-choice:${ze.config.genesisHash}:${ze.config.programId}`,W=()=>{try{return sessionStorage.getItem(k())}catch{return null}},X=K=>{try{K?sessionStorage.setItem(k(),K):sessionStorage.removeItem(k())}catch{}},q=()=>R.find(K=>K.id===l.value||K.name===l.value),z=()=>ze?.walletName||R.find(K=>K.id===ze?.walletId)?.name||"Your wallet";function oe(){const K=JSON.stringify(R.map(ne=>[ne.id,ne.name,ne.icon]));if(K!==N){const ne=document.activeElement?.closest("[data-wallet-id]")?.dataset.walletId;N=K,a.replaceChildren(...R.map(ce=>{const ae=Fe("button","wallet-provider");ae.type="button",ae.dataset.walletId=ce.id;const ye=Fe("span","wallet-provider-icon");if(ye.setAttribute("aria-hidden","true"),typeof ce.icon=="string"&&/^data:image\/(?:png|jpe?g|webp|gif|svg\+xml)[;,]/i.test(ce.icon)){const ee=Fe("img");ee.src=ce.icon,ee.alt="",ee.width=36,ee.height=36,ee.referrerPolicy="no-referrer",ee.addEventListener("error",()=>ye.replaceChildren(document.createTextNode(ce.name.slice(0,1))),{once:!0}),ye.append(ee)}else ye.textContent=ce.name.slice(0,1);const Ue=Fe("span","wallet-provider-copy");Ue.append(Fe("strong","",ce.name),Fe("span","wallet-provider-detail","Available in this browser"));const Z=Fe("span","wallet-provider-marker");return Z.setAttribute("aria-hidden","true"),ae.append(ye,Ue,Z),ae.addEventListener("click",()=>{l.value=ce.id,C="",ko(ce.id)}),ae})),ne&&a.querySelector(`[data-wallet-id="${CSS.escape(ne)}"]`)?.focus({preventScroll:!0})}for(const ne of a.children){const ce=!!ze?.connected&&ne.dataset.walletId===ze.walletId,ae=S&&ne.dataset.walletId===A;ne.disabled=S||x||Qt||ce,ne.classList.toggle("is-connected",ce),ne.classList.toggle("is-pending",ae),ne.querySelector(".wallet-provider-detail").textContent=ae?"Approve in your wallet…":ce?"Connected":"Available in this browser",ne.querySelector(".wallet-provider-marker").textContent=ce?"✓":ae?"…":"",ne.setAttribute("aria-label",ce?`${ne.querySelector("strong").textContent}, connected`:`Connect ${ne.querySelector("strong").textContent}`)}}Bn=()=>{const K=!!ze?.connected,ne=S||x||Qt;o.setAttribute("aria-busy",String(S||x)),e.classList.toggle("wallet-is-connected",K),n.textContent=K?`${z()} connected`:"Choose your wallet",r.textContent=K?"Approve every feed and claim in your wallet.":"Connect to feed Piggy and claim your SOL.",T(".wallet-button > span").textContent=K?z():"Connect wallet",T(".wallet-button").setAttribute("aria-label",K?`Open ${z()} wallet account`:"Choose a Solana wallet"),T(".wallet-total").hidden=!K,m.querySelector("summary").textContent=K?"Balance & account details":"Network, rewards & fees",d.hidden=!K,d.disabled=ne,d.textContent=x?"Disconnecting…":`Disconnect ${z()}`,l.disabled=ne,h.hidden=!ze||R.length>0,_.hidden=!R.length;const ce=q();u.hidden=!C||!ce||K&&ze.walletId===ce.id,u.disabled=ne||!ze||!ce,u.textContent=S?`Connecting ${ce?.name||"wallet"}…`:`Try ${ce?.name||"wallet"} again`,c.classList.toggle("is-error",!!C),c.textContent=C||(S?`Waiting for ${R.find(ae=>ae.id===A)?.name||"your wallet"}. Approve or cancel in its window.`:x?"Disconnecting your wallet…":ze?K?`${ze.wallet.slice(0,4)}…${ze.wallet.slice(-4)} · ${ze.config.cluster==="mainnet-beta"?"Solana mainnet":ze.config.cluster}`:R.length?"Choose a wallet to continue. No transaction is sent when you connect.":"Install a wallet or use its in-app browser to continue.":"Finding wallets in this browser…"),oe()};function V(){if(!ze){Bn();return}const K=ze.availableWallets(),ne=l.value;R=K.map(ae=>({...ae,id:ae.id||ae.name})),l.replaceChildren(Fe("option","","Choose a wallet"),...R.map(ae=>{const ye=Fe("option","",ae.name);return ye.value=ae.id,ye}));const ce=[ne,ze.walletId,W()].find(ae=>R.some(ye=>ye.id===ae||ye.name===ae));ce&&(l.value=R.find(ae=>ae.id===ce||ae.name===ce).id),Bn(),L&&queueMicrotask(pe)}async function pe(){if(y||S||x||ze?.connected)return;const K=W(),ne=R.find(ce=>ce.id===K||ce.name===K);ne&&(y=!0,await ko(ne.id,{silent:!0}))}nr=()=>{ze?.refreshWallets?.(),V(),qc(),en(),Di.open(e);const K=a.querySelector("button:not(:disabled)");K&&K.focus({preventScroll:!0})},ko=async(K=l.value,{silent:ne=!1}={})=>{if(!ze||S||x||Qt)return;const ce=R.find(ye=>ye.id===K||ye.name===K);if(!ce)return;ne||(y=!0);const ae=++w;S=!0,A=ce.id,C="",l.value=ce.id,Bn();try{const ye=await ze.connect(ce.id,{onlyIfTrusted:ne});if(ae!==w)return;X(ce.id),Ni=!1,Fr=null,await Ir(),ne||(e.close(),ra&&(ra=!1,os.open()),Ot(`${z()} connected`,`${ze.config.cluster} · ${ye.wallet}`))}catch(ye){if(ae!==w)return;if(!ne){const Ue=typeof ye?.message=="string"?ye.message:"Your wallet could not connect. Try again.";C=/reject|cancel|declin|denied/i.test(Ue)?"Connection cancelled. Choose a wallet when you’re ready.":Ue}}finally{ae===w&&(S=!1,A="",en(),Bn())}},u.addEventListener("click",()=>ko()),l.addEventListener("change",()=>{C="",Bn()}),d.addEventListener("click",async()=>{if(!(!ze||S||x||Qt)){x=!0,C="",X(null),Bn();try{await ze.disconnect(),await Ir()}catch(K){C=K.message||"Your wallet could not disconnect. Try again."}finally{x=!1,V(),en()}}}),window.addEventListener("focus",()=>{ze?.refreshWallets?.(),V()}),document.addEventListener("visibilitychange",()=>{document.hidden||(ze?.refreshWallets?.(),V())}),Bn();try{const K=await OS(Li.configUrl,{origin:location.origin});T("#streamflow-rewards-note").hidden=!K.streamflowLocks,T("#claim-panel-holder > .claim-panel-intro:not(#streamflow-rewards-note)").hidden=K.streamflowLocks;const{createPublicGameClient:ne}=await hc(async()=>{const{createPublicGameClient:ce}=await import("./solana-public-client-DO2kGNFr.js");return{createPublicGameClient:ce}},__vite__mapDeps([4,2,1,3]));ze=ne(K,{onWalletChange:()=>{Ni=!1,On=!1,ji=null,qs=null,hi=null,fi="",qn.clear(),as(),$=vc(Date.now(),{seeded:!1});for(const ce of Object.values($.players))ce.balance=0,ce.tokenBalance=0;$.round.status="connecting",$.round.id=0,Fr=null,T("#last-transaction").textContent="—",an(),Ir()},onTransaction:XS}),ze.subscribeWallets?.(()=>V()),V(),T("#chain-network").textContent=`${K.cluster} · ${K.cluster==="mainnet-beta"?"real SOL":"test funds"}`,T("#chain-program").textContent=K.programId,T("#chain-mint").textContent=K.piggyMint,await Ir(),L=!0,await pe()}catch(K){jt=K.message,C="Wallet connection is unavailable while the deployment is loading. Try reloading PIGGY.",T(".demo-badge").lastChild.textContent="Unavailable",T("#purchase-outcome").textContent=K.message,en(),Bn()}}const Lt=document.querySelector("#rules-dialog"),uc=[...Lt.querySelectorAll("[data-learn-step]")],KS=[...Lt.querySelectorAll("[data-learn-panel]")];let Gt=0;function or(i,{focus:e=!1}={}){Gt=Math.max(0,Math.min(3,i)),uc.forEach((r,s)=>{r.setAttribute("aria-selected",String(s===Gt)),r.tabIndex=s===Gt?0:-1}),KS.forEach((r,s)=>r.hidden=s!==Gt),Lt.querySelector("#learn-prev").disabled=Gt===0,Lt.querySelector("#learn-next").textContent=["Then someone else buys →","Run the clock to zero →","Why buy earlier? →","Got it — back to PIGGY"][Gt],Lt.querySelector("#learn-step-count").textContent=`${Gt+1} of 4`;const t=Gt>0,n=Gt===2;Lt.querySelector("#learn-round").hidden=Gt===3,Lt.querySelector("#learn-other-keys").textContent=t?"1":"0",Lt.querySelector("#learn-other-unit").textContent=t?"key":"keys",Lt.querySelector("#learn-current-leader").textContent=t?"Another buyer":"You",Lt.querySelector("#learn-leader-label").textContent=n?"Wins the jackpot":"Would win if nobody buys again",Lt.querySelector("#learn-practice-clock").textContent=n?"00:00":t?"1:05:30":"1:05:00",Lt.querySelector("#learn-key-share").textContent=t?"90.9%":"100%",Lt.querySelector("#learn-share-fill").style.width=t?"90.9%":"100%";for(const[r,s]of[["#learn-you",!t],["#learn-other",t]]){const o=Lt.querySelector(r);o.classList.toggle("is-leading",s),o.querySelector(".learn-crown").hidden=!s}e&&uc[Gt].focus()}uc.forEach((i,e)=>{i.addEventListener("click",()=>or(e)),i.addEventListener("keydown",t=>{const n={ArrowRight:(Gt+1)%4,ArrowLeft:(Gt+3)%4,Home:0,End:3};t.key in n&&(t.preventDefault(),or(n[t.key],{focus:!0}))})});Lt.querySelector("#learn-prev").addEventListener("click",()=>or(Gt-1));Lt.querySelector("#learn-next").addEventListener("click",()=>Gt===3?Lt.close():or(Gt+1));const dc=new Map([0,100,1e3,1e4].map(i=>[String(i),Cr(BigInt(i)*1000000000n,1000n).lamports])),$S=Number(dc.get("10000"));function Yc(i){const e=dc.get(String(i));e!==void 0&&(Lt.querySelector("#learn-curve-cost").textContent=lf(Number(e)),Lt.querySelectorAll("[data-curve-funding]").forEach(t=>t.setAttribute("aria-pressed",String(t.dataset.curveFunding===String(i)))),Lt.querySelectorAll("[data-curve-bar]").forEach(t=>{t.style.height=`${Number(dc.get(t.dataset.curveBar))/$S*100}%`,t.classList.toggle("is-selected",t.dataset.curveBar===String(i))}))}Lt.querySelectorAll("[data-curve-funding]").forEach(i=>i.addEventListener("click",()=>Yc(i.dataset.curveFunding)));Lt.addEventListener("close",()=>{or(0),Yc("0")});or(0);Yc("0");document.addEventListener("click",i=>{const e=i.target.closest("[data-learn-open]");if(!e)return;const t=Number(e.dataset.learnOpen);Number.isInteger(t)&&or(t)});export{Dn as E,Ei as M,Pn as Q,I as V,Cr as c,DS as v};
