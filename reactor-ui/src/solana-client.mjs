/** Browser facade for the loopback-only signer bridge. No private keys enter this module. */
export function createLocalGameClient({ baseUrl = '/api/local', fetch: fetcher = globalThis.fetch } = {}) {
  if(globalThis.location && !['localhost','127.0.0.1','[::1]','::1'].includes(globalThis.location.hostname)) throw new Error('The fixture signer is restricted to loopback development.');
  const base=baseUrl.replace(/\/$/,''); let session;
  async function request(path, body) {
    if(body && !session) session=await request('/session');
    const response=await fetcher(base+path,{method:body?'POST':'GET',credentials:'same-origin',cache:'no-store',headers:body?{'Content-Type':'application/json','X-Piggy-CSRF':session.csrfToken}:{},...(body?{body:JSON.stringify(body)}:{})});
    const result=await response.json();
    if(!response.ok || result.ok===false){const error=new Error(result.error||`Local chain request failed (${response.status}).`);error.details=result;error.status=response.status;throw error;}
    return result;
  }
  const action=async parameters=>{try{return await request('/action',parameters);}catch(error){if(error.status!==403||error.message!=='Local session token required.')throw error;session=undefined;return request('/action',parameters);}};
  return {getState:()=>request('/state'),getViewState:()=>request('/state'),getStatus:()=>request('/health'),getSession:async()=>session||=(await request('/session')),getQuote:({count,mode='whale'})=>request(`/quote?count=${encodeURIComponent(count)}&mode=${encodeURIComponent(mode)}`),action,
    feed:parameters=>action({action:'feed',...parameters}),feedNpc:parameters=>action({action:'feedNpc',...parameters}),claimGame:parameters=>action({action:'claimGame',...parameters}),claimHolder:parameters=>action({action:'claimHolder',...parameters}),endRound:()=>action({action:'endRound'}),startRound:()=>action({action:'startRound'}),publishHolderEpoch:()=>action({action:'publishHolderEpoch'}),withdrawCommunity:parameters=>action({action:'withdrawCommunity',...parameters}),};
}
