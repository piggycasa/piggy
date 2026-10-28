import test from 'node:test';
import assert from 'node:assert/strict';
import { formatSharePercent } from '../src/percentage-format.mjs';
test('an existing key and the next key show a real nonzero increase after a large feed',()=>{
  assert.equal(formatSharePercent(1/5001),'0.02%');assert.equal(formatSharePercent(2/5002),'0.04%');
  assert.equal(formatSharePercent(1/10003),'0.01%');assert.equal(formatSharePercent(2/10004),'0.02%');
});
test('tiny positive cuts retain a positive value or an explicit lower display bound',()=>{
  assert.equal(formatSharePercent(0.00000001),'0.000001%');assert.equal(formatSharePercent(1/Number.MAX_SAFE_INTEGER),'<0.000001%');
  for(const ratio of[1e-14,1e-10,1e-8,1e-6,0.0001,0.001])assert.notEqual(formatSharePercent(ratio),'0.0%');
});
test('zero, ordinary percentages and complete ownership stay familiar; invalid shares fail closed',()=>{
  assert.equal(formatSharePercent(0),'0.0%');assert.equal(formatSharePercent(0.2),'20.0%');assert.equal(formatSharePercent(1),'100.0%');
  for(const ratio of[-1,1.01,Infinity,NaN,'0.1',undefined])assert.throws(()=>formatSharePercent(ratio));
});
