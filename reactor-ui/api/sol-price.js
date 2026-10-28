import {createSolPriceService} from '../server/sol-price.mjs';
const service=createSolPriceService();
export default async function handler(req,res){try{const response=await service.fetch(new Request('https://'+req.headers.host+req.url,{method:req.method}));res.statusCode=response.status;for(const[k,v]of response.headers)res.setHeader(k,v);res.end(Buffer.from(await response.arrayBuffer()));}catch{res.statusCode=503;res.setHeader('cache-control','no-store');res.end(JSON.stringify({error:'SOL/USD price temporarily unavailable'}));}}
