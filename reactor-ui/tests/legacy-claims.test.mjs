import test from 'node:test';
import assert from 'node:assert/strict';
import {isTestClaimsPath, assertRouteActionAllowed} from '../src/legacy-claims.mjs';
import {selectClientMode} from '../src/solana-config.mjs';
test('only the fixed test-claims path selects a claim-only deployment', () => {
 const env={VITE_PIGGY_CONFIG_URL:'/piggy-config.json'},base={hostname:'piggy.casa',origin:'https://piggy.casa',search:''};
 for(const pathname of ['/test-claims','/test-claims/']){
  assert(isTestClaimsPath(pathname));
  const result=selectClientMode({...base,pathname,search:'?demo=1&config=https://attacker.example/config'},env);
  assert.equal(result.mode,'public');assert.equal(result.claimOnly,true);assert.equal(result.configUrl,'https://piggy.casa/piggy-test-config.json');
 }
 for(const pathname of ['/','/test-claims/other','/test-claims-evil','/Test-claims/']){
  assert.equal(isTestClaimsPath(pathname),false);assert.equal(selectClientMode({...base,pathname},env).claimOnly,undefined);
 }
 assert.equal(selectClientMode({...base,pathname:'/test-claims/'}).mode,'unconfigured');
});
test('the legacy route allows only the two existing reward claims', () => {
 for(const action of ['claimGame','claimHolder'])assert.doesNotThrow(()=>assertRouteActionAllowed(true,action));
 for(const action of ['feed','feedNpc','startRound','endRound','publishHolderEpoch','withdrawCommunity','unknown','',undefined])assert.throws(()=>assertRouteActionAllowed(true,action),/closed to new entries/);
 for(const action of ['feed','startRound','endRound','claimGame','claimHolder'])assert.doesNotThrow(()=>assertRouteActionAllowed(false,action));
});
