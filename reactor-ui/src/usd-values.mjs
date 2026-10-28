/** Approximate display conversions only; never used to price or sign a transaction. */
const MAX_AGE=300000;
const dollarCents=cents=>{const whole=cents/100n,fraction=String(cents%100n).padStart(2,'0');return `$${whole.toLocaleString('en-US')}.${fraction}`;};
// Keep two significant digits below a cent, so a real small entry is never $0.00.
const subcentDollars=(numerator,denominator)=>{
 let places=2,scale=100n;
 while(numerator*scale<denominator){places++;scale*=10n;}
 places++;scale*=10n;
 const rounded=(numerator*scale+denominator/2n)/denominator;
 return `$${rounded/scale}.${String(rounded%scale).padStart(places,'0')}`;
};
export function parseSolUsdQuote(value,now=Date.now()){
 if(value?.schemaVersion!==1||value.base!=='SOL'||value.quote!=='USD'||typeof value.price!=='string'||!/^\d{1,6}(?:\.\d{1,8})?$/.test(value.price)||!Number.isSafeInteger(value.asOf)||value.asOf>now+10000||now-value.asOf>MAX_AGE)return null;
 const [whole,fraction='']=value.price.split('.');const priceUnits=BigInt(whole)*100000000n+BigInt(fraction.padEnd(8,'0'));
 if(priceUnits<=0n||priceUnits>=1000000n*100000000n)return null;
 return{priceUnits,asOf:value.asOf,source:'Coinbase'};
}
export function formatUsdEstimate(lamports,rate){
 if(lamports===null||lamports===undefined||!rate)return null;
 if(typeof lamports==='number'&&(!Number.isSafeInteger(lamports)||lamports<0)||typeof lamports!=='number'&&typeof lamports!=='bigint')return null;
 const value=BigInt(lamports);if(value<0n)return null;
 const numerator=value*rate.priceUnits,denominator=1000000000n*100000000n;
 if(numerator>0n&&numerator*100n<denominator)return `≈ ${subcentDollars(numerator,denominator)}`;
 const cents=(numerator*100n+denominator/2n)/denominator;
 return `≈ ${dollarCents(cents)}`;
}
export function formatUsdHeadline(lamports,rate){
 const full=formatUsdEstimate(lamports,rate);if(!full)return null;
 const numerator=BigInt(lamports)*rate.priceUnits,denominator=1000000000n*100000000n;
 for(const[scale,suffix]of[[1000000000000n,'T'],[1000000000n,'B'],[1000000n,'M'],[1000n,'K']]){
  if(numerator<denominator*scale)continue;
  const hundredths=(numerator*100n+denominator*scale/2n)/(denominator*scale);
  const fraction=String(hundredths%100n).padStart(2,'0').replace(/0+$/,'');
  return `≈ $${hundredths/100n}${fraction?'.'+fraction:''}${suffix}`;
 }
 return full;
}
export function createUsdDisplay({enabled=true,elements={},fetch:fetcher=globalThis.fetch,now=Date.now,setInterval:interval=globalThis.setInterval,clearInterval:clear=globalThis.clearInterval}={}){
 let rate=null,amounts={},pending=false,disposed=false;
 function render(){
  const current=rate&&now()-rate.asOf<=MAX_AGE?rate:null;
  for(const[key,node]of Object.entries(elements)){
   if(!node)continue;
   const fullValue=formatUsdEstimate(amounts[key],current);
   const value=node.dataset?.usdCompact==='true'?formatUsdHeadline(amounts[key],current):fullValue;
   node.hidden=!value;node.textContent=value||'';
   node.title=value?`${fullValue}. Approximate USD from a Coinbase SOL/USD quote at ${new Date(current.asOf).toLocaleTimeString()}. All payments and rewards use SOL.`:'';
   if(node.dataset)node.dataset.moneyState=value?'available':amounts[key]===null||amounts[key]===undefined?'unknown':'unavailable';
   const pair=node.closest?.('.money-pair');
   if(pair?.dataset)pair.dataset.usdAvailable=String(!!value);
  }
 }
 async function refresh(){if(disposed)return;render();if(!enabled||pending)return;pending=true;try{const response=await fetcher('/api/sol-price',{credentials:'omit',cache:'no-store',redirect:'error',signal:globalThis.AbortSignal?.timeout?.(5000)});if(!response.ok)throw new Error('Price unavailable');rate=parseSolUsdQuote(await response.json(),now());}catch{/* Keep a recent quote only; never convert unavailable data to zero. */}finally{pending=false;if(!disposed)render();}}
 render();if(enabled)refresh();const timer=enabled?interval(()=>{if(!globalThis.document?.hidden)refresh();else render();},60000):null;timer?.unref?.();
 return{setAmounts(value){amounts={...value};render();},refresh,dispose(){disposed=true;if(timer!==null)clear(timer);}};
}
