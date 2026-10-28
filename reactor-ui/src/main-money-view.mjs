/** Short display values only. Transaction construction and reviews use exact lamports. */
const compactSol = new Intl.NumberFormat('en-US', { maximumSignificantDigits: 5, useGrouping: true });

export function formatCompactSol(lamports) {
  if (typeof lamports !== 'number' || !Number.isSafeInteger(lamports) || lamports < 0) {
    throw new RangeError('SOL display amounts must be nonnegative safe integer lamports.');
  }
  return compactSol.format(lamports / 1_000_000_000);
}

/** A quote is public; a balance belongs only to the wallet whose read produced it. */
export function moneyVisibility({ offlineDemo = false, publicChain = false, chainReady = false, chainHasState = false, connected = false, wallet = null, stateWallet = null, proofWarning = false } = {}) {
  const gameKnown = offlineDemo || chainReady && chainHasState;
  const walletKnown = gameKnown && (!publicChain || connected && !!wallet && stateWallet === wallet);
  return { gameKnown, walletKnown, holderKnown: walletKnown && !proofWarning };
}
