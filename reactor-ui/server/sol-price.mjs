/** Read-only SOL/USD display quote. No wallet, trading, API secret or user URL. */
const ENDPOINT='https://api.coinbase.com/v2/prices/SOL-USD/spot';
const MAX_AGE=300000,CACHE_FOR=60000;
const validPrice=value=>typeof value==='string'&&/^\d{1,6}(?:\.\d{1,8})?$/.test(value)&&Number(value)>0&&Number(value)<1000000;
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','x-content-type-options':'nosniff','cache-control':status===200?'public, max-age=30, s-maxage=60':'no-store'}});
export function createSolPriceService({fetch:fetcher=globalThis.fetch,now=Date.now}={}){
 let cached=null,pending=null;
 async function update(){
  const response=await fetcher(ENDPOINT,{headers:{accept:'application/json'},signal:AbortSignal.timeout(5000),redirect:'error'});
  if(!response.ok)throw new Error('Quote unavailable');
  const raw=await response.text();if(raw.length>4096)throw new Error('Invalid quote');
  const data=JSON.parse(raw)?.data;
  if(data?.base!=='SOL'||data.currency!=='USD'||!validPrice(data.amount))throw new Error('Invalid quote');
  cached={schemaVersion:1,base:'SOL',quote:'USD',price:data.amount,asOf:now(),source:'Coinbase',sourceUrl:ENDPOINT};return cached;
 }
 return{async fetch(request){
  if(!['GET','HEAD'].includes(request.method))return json({error:'Method not allowed'},405);
  if(new URL(request.url).search)return json({error:'Query parameters are not supported'},400);
  let value=cached;
  if(!value||now()-value.asOf>=CACHE_FOR){
   try{pending||=update().finally(()=>{pending=null;});value=await pending;}catch{value=cached&&now()-cached.asOf<=MAX_AGE?{...cached,stale:true}:null;}
  }
  const response=value?json(value):json({error:'SOL/USD price temporarily unavailable'},503);
  return request.method==='HEAD'?new Response(null,{status:response.status,headers:response.headers}):response;
 }};
}
