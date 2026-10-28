import test from 'node:test';
import assert from 'node:assert/strict';
import { formatCompactSol, moneyVisibility } from '../src/main-money-view.mjs';

test('compact SOL retains small nonzero costs and limits significant digits', () => {
  assert.equal(formatCompactSol(0), '0');
  assert.equal(formatCompactSol(1), '0.000000001');
  assert.equal(formatCompactSol(75_157), '0.000075157');
  assert.equal(formatCompactSol(22_990_381), '0.02299');
  assert.equal(formatCompactSol(1_234_567_890_000), '1,234.6');
  for (const invalid of [-1, 1.5, Infinity, Number.MAX_SAFE_INTEGER + 1, '100']) assert.throws(() => formatCompactSol(invalid));
});

test('public game quote remains known without presenting a disconnected wallet balance', () => {
  assert.deepEqual(moneyVisibility({ publicChain: true, chainReady: true, chainHasState: true }), { gameKnown: true, walletKnown: false, holderKnown: false });
});

test('a wallet switch cannot reuse another wallet balance or holder dollar amount', () => {
  const current = { publicChain: true, chainReady: true, chainHasState: true, connected: true, wallet: 'new-wallet', stateWallet: 'old-wallet' };
  assert.equal(moneyVisibility(current).walletKnown, false);
  assert.equal(moneyVisibility({ ...current, stateWallet: 'new-wallet' }).holderKnown, true);
  assert.equal(moneyVisibility({ ...current, stateWallet: 'new-wallet', proofWarning: true }).holderKnown, false);
  assert.equal(moneyVisibility({ ...current, stateWallet: 'new-wallet', chainReady: false }).gameKnown, false);
});
