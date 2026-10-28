/** Presentation only: existing account reads and claim handlers own all amounts and transactions. */
export function createClaimGuide({ dialog, openDialog, onConnect, formatSol }) {
  const find = selector => dialog.querySelector(selector);
  const tabs = { game: find('#claim-tab-game'), holder: find('#claim-tab-holder') };
  const panels = { game: find('#claim-panel-game'), holder: find('#claim-panel-holder') };
  let selected = 'game';
  let lastInput;
  const text = (selector, value) => { const node = find(selector); if (node.textContent !== value) node.textContent = value; };
  function select(kind, focus = false) {
    if (!tabs[kind]) return;
    selected = kind;
    for (const key of Object.keys(tabs)) {
      tabs[key].setAttribute('aria-selected', String(key === kind));
      tabs[key].tabIndex = key === kind ? 0 : -1;
      panels[key].hidden = key !== kind;
    }
    if (focus) tabs[kind].focus();
    if (lastInput) render(lastInput);
  }
  Object.entries(tabs).forEach(([kind, tab]) => {
    tab.addEventListener('click', () => select(kind, true));
    tab.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      select(event.key === 'Home' ? 'game' : event.key === 'End' ? 'holder' : selected === 'game' ? 'holder' : 'game', true);
    });
  });
  find('#claim-connect-wallet').addEventListener('click', onConnect);
  function render(input) {
    lastInput = input;
    const { state, offlineDemo, publicChain, connected, ready, chainPending, pendingSignature, walletName, wallet, action, progress, result, readError } = input;
    const player = state.players.you;
    const known = offlineDemo || connected && ready;
    const costs = state.chain?.holder?.claimCosts;
    const proofWarning = state.chain?.holder?.proofWarning;
    const isClaim = action === 'claimGame' || action === 'claimHolder';
    const pendingKind = action === 'claimHolder' ? 'holder' : 'game';
    const busy = chainPending || !!pendingSignature;
    const walletLabel = offlineDemo ? 'Demo wallet · simulated SOL' : connected ? `${walletName || 'Connected wallet'}${wallet ? ` · ${wallet.slice(0, 4)}…${wallet.slice(-4)}` : ''}` : publicChain ? 'Use the wallet that earned these rewards.' : 'Waiting for your local test wallet.';
    text('#claim-wallet-identity', walletLabel);
    find('#claim-connect-wallet').hidden = !publicChain || connected;
    find('#claim-connect-wallet').disabled = busy;
    const received = result?.status === 'success' && (result.wallet === wallet || offlineDemo) && result.kind === selected;
    const stage = !connected && !offlineDemo ? 'connect' : busy && isClaim ? 'approve' : received ? 'received' : 'choose';
    for (const node of dialog.querySelectorAll('[data-claim-step]')) {
      node.classList.toggle('is-current', node.dataset.claimStep === stage);
      node.classList.toggle('is-complete', node.dataset.claimStep === 'connect' && (connected || offlineDemo) || received);
      if (node.dataset.claimStep === stage) node.setAttribute('aria-current', 'step'); else node.removeAttribute('aria-current');
    }
    const available = { game: player.claimable || 0, holder: player.tokenClaimable || 0 };
    if (!known) for (const selector of ['#game-claimable', '#token-claimable', '#key-earned', '#token-earned', '#token-balance', '#game-share', '#token-share']) text(selector, '—');
    text('#claim-key-available', known && player.keyRewardsAvailable !== undefined ? formatSol(player.keyRewardsAvailable) : '—');
    text('#claim-jackpot-available', known && player.jackpotRewardsAvailable !== undefined ? formatSol(player.jackpotRewardsAvailable) : '—');
    text('#claim-referral-available', known && player.referralRewardsAvailable !== undefined ? formatSol(player.referralRewardsAvailable) : '—');
    text('#claim-game-claimed', known ? formatSol(player.totalClaimed || 0) : '—');
    text('#claim-paid-this-round', known ? formatSol(player.roundContribution || 0) : '—');
    for (const [selector, field] of [['#claim-key-available', 'keyRewardsAvailable'], ['#claim-jackpot-available', 'jackpotRewardsAvailable'], ['#claim-referral-available', 'referralRewardsAvailable']]) find(selector).closest('div').hidden = player[field] === undefined;
    find('#claim-holder-status').classList.toggle('is-unavailable', !!proofWarning && known);
    for (const kind of ['game', 'holder']) {
      const amount = available[kind], cost = costs?.[kind];
      const netRow = find(`#claim-${kind}-net-row`);
      netRow.hidden = !known || !cost || amount <= 0;
      if (!netRow.hidden) {
        const net = BigInt(cost.netAmount);
        text(`#claim-${kind}-net`, `${net < 0n ? '−' : ''}${formatSol(Number(net < 0n ? -net : net))} SOL`);
      }
      const costDetails = find(`#claim-${kind}-cost-details`);
      const note = find(kind === 'game' ? '#game-claim-cost' : '#holder-claim-cost');
      costDetails.hidden = !note.textContent.trim();
      let message;
      if (!connected && !offlineDemo) message = publicChain ? 'Connect the same wallet to see what you can claim.' : 'Waiting for confirmed test-wallet balances.';
      else if (!ready && !offlineDemo) message = readError ? 'Rewards could not refresh. Retrying automatically; your existing rewards stay on chain.' : 'Reading your confirmed rewards from Solana…';
      else if (kind === 'holder' && proofWarning) message = 'Holder reward data is temporarily unavailable. Existing allocations stay on chain; try again when the data is available.';
      else if (cost && BigInt(cost.netAmount) <= 0n && amount > 0) message = 'This balance is below the estimated withdrawal cost. Your rewards stay available to claim later.';
      else if (publicChain && amount > 0 && !cost) message = costs?.error || 'Checking withdrawal fees and account costs before enabling your claim.';
      else if (amount > 0) message = kind === 'game' ? 'Available now. Claiming withdraws earned rewards, not a refund of everything you paid. Claiming does not end a round or remove your current keys.' : 'Published and funded for this wallet. Claiming SOL does not sell or stake your $PIGGY.';
      else if (kind === 'game') message = player.keys > 0 ? 'No unclaimed SOL yet. Your keys can earn a cut when another feed arrives.' : player.totalClaimed > 0 ? 'All game rewards earned so far have been claimed. New earned rewards will appear here.' : 'No game rewards for this wallet yet. Feed Piggy to receive keys.';
      else message = player.tokenBalance > 0 ? 'No published, unclaimed holder reward for this wallet. Keep your tokens in your wallet; no staking is needed.' : 'No unclaimed holder reward for this wallet. Only eligible balances included in funded snapshots receive an allocation.';
      text(`#claim-${kind}-status`, message);
      panels[kind].setAttribute('aria-busy', String(busy && isClaim && pendingKind === kind));
      const button = find(kind === 'game' ? '#claim-button' : '#claim-token-button');
      if (!connected && !offlineDemo) { button.disabled = true; button.textContent = 'Connect wallet first'; }
      else if (!ready && !offlineDemo) { button.disabled = true; button.textContent = readError ? 'Rewards unavailable' : 'Reading rewards…'; }
      else if (busy) { button.disabled = true; button.textContent = isClaim && kind === pendingKind ? progress?.status === 'awaiting-wallet' ? 'Approve in your wallet…' : 'Confirming withdrawal…' : 'Wallet transaction in progress…'; }
    }
    let flowMessage = '';
    let tone = '';
    if (busy && isClaim) {
      tone = 'pending';
      flowMessage = progress?.status === 'awaiting-wallet' ? 'Review and approve in your wallet. Multiple rounds or snapshots can require more than one approval.' : progress?.status === 'confirmed' ? 'A transaction confirmed. Checking for any remaining approvals…' : 'Checking confirmation on Solana. Your rewards are not claimed again while this is pending.';
    } else if (pendingSignature) {
      tone = 'pending'; flowMessage = 'A signed transaction is still being checked. Wait for confirmation before trying another claim.';
    } else if (result && (result.wallet === wallet || offlineDemo) && result.kind === selected) {
      tone = result.status;
      flowMessage = result.status === 'success' ? result.warning || 'Withdrawal confirmed. SOL was sent to the wallet that approved it.' : result.status === 'pending' ? 'Confirmation is still pending. Check the transaction in your wallet before trying again.' : /reject|cancel|declin|denied/i.test(result.message || '') ? 'You cancelled the approval. Unclaimed rewards remain available.' : result.message || 'The withdrawal did not complete. Review the message and try again.';
    }
    text('#claim-flow-status', flowMessage);
    find('#claim-flow-status').hidden = !flowMessage;
    find('#claim-flow-status').dataset.tone = tone;
  }
  return { render, select, open(kind = selected) { select(kind); openDialog(dialog); } };
}
