import test from 'node:test';
import assert from 'node:assert/strict';
import {formatUsdHeadline,formatUsdEstimate,parseSolUsdQuote} from '../src/usd-values.mjs';
const rate=parseSolUsdQuote({schemaVersion:1,base:'SOL',quote:'USD',price:'200',asOf:Date.now()});
test('large visual USD uses compact units while full USD stays available',()=>{
 assert.equal(formatUsdHeadline(48001340550000n,rate),'≈ $9.6M');
 assert.equal(formatUsdEstimate(48001340550000n,rate),'≈ $9,600,268.11');
 assert.equal(formatUsdHeadline(61725000000n,rate),'≈ $12.35K');
 assert.equal(formatUsdHeadline(null,rate),null);
});
test('small values retain their meaningful precision',()=>{
 assert.equal(formatUsdHeadline(37500n,rate),'≈ $0.0075');
 assert.equal(formatUsdHeadline(0n,rate),'≈ $0.00');
});
