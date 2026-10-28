import './solana-browser-polyfill.mjs';
import './konterball-fonts.css';
import './konterball-ui.css';
import './claim-ui.css';
import './intuitive-arena.css';
import './earning-lanes.css';
import './legacy-claims.css';
import { assertRouteActionAllowed, inactivePrizeScene } from './legacy-claims.mjs';
import { createPurchasePreview, previewDisplayNumber } from './purchase-preview.mjs';
import { createUsdDisplay } from './usd-values.mjs';
import { createClaimGuide } from './claim-guide.mjs';
import { createVault } from './vault-scene.js';
import { createArenaFeedback } from './arena-feedback.js';
import { createScreenTransitions } from './vendor/konterball/screen-transition.js';
import { captureRewardPosition, getPurchaseRewardChange, previewKeyShare } from './key-reward-view.mjs';
import { createGame, quotePurchase, buyKeys, settleRound, claimPayout, claimTokenRewards, startNextRound, timeRemaining, previewJackpot } from './holder-engine.mjs';
import { formatSol } from './sol-format.mjs';
import { formatCompactSol, moneyVisibility } from './main-money-view.mjs';
import { formatSharePercent } from './percentage-format.mjs';
import { chainView } from './chain-view.mjs';
import { selectClientMode, loadPublicConfig } from './solana-config.mjs';

const $ = selector => document.querySelector(selector);
const money = formatSol;
const compactMoney = formatCompactSol;
function moneyState() {
  return moneyVisibility({ offlineDemo, publicChain, chainReady, chainHasState, connected: !!chainClient?.connected, wallet: chainClient?.wallet, stateWallet: state.chain?.wallet, proofWarning: !!state.chain?.holder?.proofWarning });
}
function arenaAmount(selector, amount, { unit = false, unknown = '—' } = {}) {
  const node = $(selector); if (!node) return;
  const known = Number.isSafeInteger(amount) && amount >= 0;
  node.textContent = known ? `${compactMoney(amount)}${unit ? ' SOL' : ''}` : unknown;
  node.title = known ? `${money(amount)} SOL${offlineDemo ? ' · simulated' : ''}` : unknown;
  node.dataset.moneyState = known ? 'known' : 'unknown';
  if (known) node.dataset.lamports = String(amount); else delete node.dataset.lamports;
}
const tokens = value => {
  const decimals = state.config?.tokenDecimals ?? 0;
  const text = BigInt(value).toString().padStart(decimals + 1, '0');
  const whole = (decimals ? text.slice(0, -decimals) : text).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const fraction = decimals ? text.slice(-decimals).replace(/0+$/, '') : '';
  return whole + (fraction ? `.${fraction}` : '');
};
const percentage = formatSharePercent;
const STORAGE = 'piggy.holder-demo.v4';
const clientMode = selectClientMode(location, import.meta.env);
const offlineDemo = clientMode.mode === 'demo';
const publicChain = clientMode.mode === 'public';
const claimOnly = clientMode.claimOnly === true;
if (claimOnly) document.documentElement.classList.add('test-claims-mode');
let chainClient, chainReady = false, chainHasState = false, chainPending = false, chainFailure = '', chainPollBusy = false;
let settlementRound, settlementAttempts = 0, nextSettlementAttempt = 0;
let activeChainAction = null, claimProgress = null, claimResult = null, returnToClaims = false;
let cachedPurchaseQuote = null, previewSecond = -1;
let jackpotUsdAnimating = false, lootUsdAnimating = false;
let displayedJackpot = null, displayedLoot = null;
let connectPublicWallet, openPublicWallet;
let renderPublicWallet = () => {};
let offset = 0;
let state;
let npcEnabled = true;
let soundEnabled = false;
let audioContext;
try {
  const stored = JSON.parse(sessionStorage.getItem(STORAGE));
  if (offlineDemo && stored?.state?.version === 4 && stored.state.players?.you && Number.isSafeInteger(stored.state.round?.endsAt)) {
    state = stored.state;
    offset = Number.isSafeInteger(stored.offset) ? stored.offset : 0;
    npcEnabled = !!stored.npcEnabled;
  }
} catch { /* A fresh demo is safe when session storage is unavailable. */ }
if (!state) state = createGame(Date.now(), { seeded: offlineDemo });
if (!offlineDemo) {
  for (const player of Object.values(state.players)) { player.balance = 0; player.tokenBalance = 0; }
  state.round.status = 'connecting'; state.round.id = 0;
}
const now = () => Date.now() + offset;
let vault = claimOnly ? inactivePrizeScene() : createVault($('#safe-art'));
const feedback = createArenaFeedback();
// Keep transient purchase feedback over the pig, clear of the always-readable rules.
$('.safe-stage').append($('#reactor-stage .arena-feedback'));
const screens = createScreenTransitions();
const usdDisplay = createUsdDisplay({ enabled: publicChain, elements: { jackpot: $('#jackpot-usd'), rewards: $('#rewards-usd'), purchase: $('#purchase-usd'), gameClaim: $('#game-claim-usd'), holderClaim: $('#holder-claim-usd'), holderEarn: $('#holder-earn-usd'), keyEarn: $('#your-key-earn-usd') } });
const claimGuide = createClaimGuide({
  dialog: $('#rewards-dialog'), openDialog: dialog => screens.open(dialog), formatSol: money,
  onConnect: () => { returnToClaims = true; if (openPublicWallet) openPublicWallet(); else screens.open($('#wallet-dialog')); },
});
function renderClaimGuide() {
  claimGuide.render({ state, offlineDemo, publicChain, connected: offlineDemo || (publicChain ? !!chainClient?.connected : chainReady), ready: moneyState().walletKnown,
    chainPending, pendingSignature: publicChain ? chainClient?.pendingSignature : null, walletName: publicChain ? chainClient?.walletName : 'Local test wallet',
    wallet: publicChain ? chainClient?.wallet : state.chain?.wallet, readError: chainFailure, action: activeChainAction, progress: claimProgress, result: claimResult });
}
const initialClaimTab = new URLSearchParams(location.search).get('claim');
if (['game', 'holder'].includes(initialClaimTab) || claimOnly) queueMicrotask(() => claimGuide.open(['game','holder'].includes(initialClaimTab) ? initialClaimTab : 'game'));
if (claimOnly) {
  const landing=element('main','test-claims-landing');
  landing.innerHTML='<h1>Test-round claims.</h1><p>The launch has a fresh game. Your pre-launch SOL rewards stay available here.</p><button id="open-test-claims" type="button">View my test rewards</button><a href="/">Back to the live game</a>';
  $('#arena').before(landing);
  $('#open-test-claims').addEventListener('click',()=>claimGuide.open('game'));
  $('.brand').href='/';
  $('#claim-dialog-title').textContent='Claim test rewards.';
  $('.claim-heading p').textContent='Pre-launch game and token-holder rewards. Connect the same wallet to claim.';
}
let flashTimeout;
let counterFrame;
let lastDisplayedPot = null;
let potIncreaseTimeout;
let previousSecond;
let tickTimeout;
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
let reducedMotion = motionPreference.matches;
let payoutPreviewTimer, payoutPreview = false;
function clearPayoutPreview() {
  clearTimeout(payoutPreviewTimer);
  if (!payoutPreview) return;
  payoutPreview = false; $('#app').classList.remove('payout-preview');
  vault.cancelPreview(); feedback.clear();
}
motionPreference.addEventListener('change', event => {
  reducedMotion = event.matches; clearPayoutPreview();
  vault.dispose(); vault = createVault($('#safe-art'));
  renderCoinPile();
});
let nextNpcAt = Date.now() + 28_000;
let toastTimeout;
let extensionTimeout;
let lootCounterFrame, lootPulseTimeout;
let lastDisplayedLoot = null, lastFeedEvent = null, lootMessageOverride = '';

function animateLoot(value) {
  $('.loot-amount').style.setProperty('--amount-chars', compactMoney(value).length);
  $('.loot-amount').classList.toggle('is-long', compactMoney(value).length > 14);
  $('.loot-amount').classList.toggle('is-precise', compactMoney(value).length > 8);
  if (value === lastDisplayedLoot) { displayedLoot=value;arenaAmount('#key-loot-value', value);return; }
  const from = lastDisplayedLoot;
  lastDisplayedLoot = value;
  cancelAnimationFrame(lootCounterFrame);
  lootUsdAnimating = from !== null && value > from && !reducedMotion;
  if (!lootUsdAnimating) { displayedLoot=value;arenaAmount('#key-loot-value', value);return; }
  const start = performance.now();
  const draw = time => {
    const progress = Math.max(0, Math.min(1, (time - start) / 650));
    displayedLoot=Math.round(from + (value - from) * (1 - (1 - progress) ** 3));
    arenaAmount('#key-loot-value', displayedLoot);renderUsdAmounts();
    if (progress < 1) lootCounterFrame = requestAnimationFrame(draw);
    else { lootUsdAnimating = false; renderUsdAmounts(); }
  };
  lootCounterFrame = requestAnimationFrame(draw);
}
function renderLoot() {
  const you = state.players.you;
  const visibility=moneyState(),connected=offlineDemo||(!publicChain?chainReady:!!chainClient?.connected);
  const unknown=connected?'Updating…':'Connect wallet';
  $('.key-loot').dataset.walletKnown = String(visibility.walletKnown);
  const share = state.round.totalKeys ? you.keys / state.round.totalKeys : 0;
  if(visibility.walletKnown)animateLoot(you.claimable);
  else{cancelAnimationFrame(lootCounterFrame);lastDisplayedLoot=null;displayedLoot=null;lootUsdAnimating=false;arenaAmount('#key-loot-value',null,{unknown});}
  arenaAmount('#round-entry-spent',visibility.walletKnown?(you.roundContribution||0):null);
  $('#loot-keys').textContent = 'Your share';
  $('#loot-share').textContent = visibility.walletKnown?`${percentage(share)} of key rewards`:'Connect to see your share';
  $('#loot-claim').textContent = !connected?'Connect wallet':you.claimable?'Claim':'View';
  $('#loot-claim').setAttribute('aria-label', visibility.walletKnown?`View and claim ${money(you.claimable)} game SOL`:'Connect your wallet to see game rewards');
  const holderStatus=$('#holder-short-status');
  const holderMoney=$('.holder-money');if(holderMoney)holderMoney.dataset.empty=String(visibility.holderKnown&&you.tokenClaimable===0);
  if(holderStatus)holderStatus.textContent=!connected?'Connect to see your rewards':!visibility.walletKnown?'Reading rewards…':!visibility.holderKnown?'Rewards unavailable':you.tokenClaimable>0?'Ready to claim':you.tokenBalance>0||chainClient?.config?.streamflowLocks?'No new rewards yet':'Hold $PIGGY to earn';
  arenaAmount('#holder-earn-amount',visibility.holderKnown?you.tokenClaimable:null,{unit:true,unknown:!connected?'Connect wallet':visibility.walletKnown?'Unavailable':'Updating…'});
  const holderClaim=$('.holder-claim');if(holderClaim){const label=visibility.holderKnown&&you.tokenClaimable>0?'Claim SOL':'View rewards';const text=[...holderClaim.childNodes].find(node=>node.nodeType===Node.TEXT_NODE);if(text)text.textContent=label;holderClaim.setAttribute('aria-label',label+' from holding $PIGGY');}
  let reason;
  if (lootMessageOverride) reason = lootMessageOverride;
  else if (state.round.status === 'settled') reason = state.round.winnerId === 'you'
    ? 'Your jackpot is ready to claim.' : 'Round over; earned SOL stays yours.';
  else if (lastFeedEvent?.roundId === state.round.id) {
    const feed = lastFeedEvent;
    const source = feed.isYou ? 'Your buy' : offlineDemo ? 'NPC buy' : 'Another buy';
    reason = feed.keyDelta > 0 ? `Key rewards +${compactMoney(feed.keyDelta)} SOL, including any own-feed share.`
      : you.keys ? `${source}: no additional key reward this time.` : 'Buy keys for a share of future feeds.';
  } else reason = you.keys ? 'Your keys earn a share of new feeds.' : 'Buy keys to earn a share of later feeds.';
  $('#key-loot-reason').textContent = !connected?'Connect your wallet to see rewards from your keys.':reason;
}
function showLootPayment(amount, label = 'Key rewards') {
  if (!amount) return;
  const panel = $('.key-loot');
  $('#key-loot-pop').textContent = `+${compactMoney(amount)} SOL`;
  panel.classList.remove('is-paid');
  void panel.offsetWidth;
  panel.classList.add('is-paid');
  $('#key-loot-pop').classList.add('is-visible');
  clearTimeout(lootPulseTimeout);
  lootPulseTimeout = setTimeout(() => { panel.classList.remove('is-paid'); $('#key-loot-pop').classList.remove('is-visible'); }, 4_000);
  if (reducedMotion) return;
  const bank = $('#safe-art').getBoundingClientRect(), lootDestination = $('.loot-amount').getBoundingClientRect();
  const destination = lootDestination.width && lootDestination.height ? lootDestination : $('.rewards-button').getBoundingClientRect();
  const flight = element('span', 'loot-flight', `+${compactMoney(amount)} SOL`);
  flight.setAttribute('aria-hidden', 'true'); flight.title = label;
  const x = bank.left + bank.width * .5, y = bank.top + bank.height * .62;
  const dx = destination.left + destination.width * .5 - x, dy = destination.top + destination.height * .5 - y;
  flight.style.left = `${x}px`; flight.style.top = `${y}px`;
  document.body.append(flight);
  const animation = flight.animate([
    { transform: 'translate(-50%,-50%) scale(.85)', opacity: 0 },
    { transform: `translate(calc(-50% + ${dx * .35}px),calc(-50% + ${dy * .35 - 24}px)) scale(1)`, opacity: 1, offset: .35 },
    { transform: `translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px)) scale(.85)`, opacity: 0 },
  ], { duration: 950, easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'forwards' });
  animation.finished.then(() => flight.remove(), () => flight.remove());
}
function clearLootPayment() {
  clearTimeout(lootPulseTimeout);
  $('.key-loot').classList.remove('is-paid');
  $('#key-loot-pop').classList.remove('is-visible');
}
function presentFeed(result, before, oldPot, isYou, previousLeader) {
  clearPayoutPreview();
  const change = getPurchaseRewardChange(before, captureRewardPosition(state));
  const buyer = state.players[result.playerId];
  lastFeedEvent = { roundId: state.round.id, isYou, name: buyer.name, keyDelta: change.keyDelta };
  lootMessageOverride = '';
  clearLootPayment(); renderAll(); animatePurchase(result.count, oldPot); showLootPayment(change.keyDelta);
  feedback.purchase({ isYou, playerName: isYou ? 'You' : nameOf(result.playerId), jackpot: previewJackpot(state), jackpotDelta: previewJackpot(state) - oldPot,
    rewardDelta: change.keyDelta, tokenRewardDelta: change.tokenDelta, count: result.count, yourKeys: state.players.you.keys, shareAfter: change.shareAfter, hasKeys: state.players.you.keys > 0, lostCrown: !isYou && previousLeader === 'you' });
}
function simulateFeed() {
  if (state.round.status !== 'active' || timeRemaining(state, now()) === 0) return false;
  const modes = ['whale', 'bear', 'snek', 'bull'];
  const mode = modes[Math.floor(Math.random() * modes.length)];
  const ids = ['npc_fox', 'npc_orbit', 'npc_void', 'npc_koi'].filter(id => {
    const quote = quotePurchase(state, 1, id, mode);
    return quote.ok && quote.cost <= state.players[id].balance;
  });
  if (!ids.length) return false;
  const id = ids[Math.floor(Math.random() * ids.length)];
  let count = 1 + Math.floor(Math.random() * 2);
  if (quotePurchase(state, count, id, mode).cost > state.players[id].balance) count = 1;
  const before = captureRewardPosition(state), previousLeader = state.round.lastBuyerId, oldPot = previewJackpot(state);
  const result = buyKeys(state, id, count, now(), mode);
  if (!result.ok) return false;
  presentFeed(result, before, oldPot, false, previousLeader);
  return true;
}

function flashPurchase() {
  $('#app').classList.remove('purchase-flash');
  void $('#app').offsetWidth;
  $('#app').classList.add('purchase-flash');
  clearTimeout(flashTimeout);
  flashTimeout = setTimeout(() => $('#app').classList.remove('purchase-flash'), 1700);
}
function animateJackpot(value) {
  $('.pot-amount').style.setProperty('--amount-chars', compactMoney(value).length);
  $('.pot-amount').classList.toggle('is-long', compactMoney(value).length > 14);
  $('.pot-amount').classList.toggle('is-precise', compactMoney(value).length > 8);
  const from = lastDisplayedPot;
  lastDisplayedPot = value;
  cancelAnimationFrame(counterFrame);
  jackpotUsdAnimating = from !== null && value > from && !reducedMotion;
  if (!jackpotUsdAnimating) { displayedJackpot=value;arenaAmount('#pot-value',value);return; }
  const start = performance.now();
  const frame = time => {
    const progress = Math.max(0, Math.min(1, (time - start) / 650));
    displayedJackpot=Math.round(from + (value - from) * (1 - Math.pow(1 - progress, 3)));
    arenaAmount('#pot-value',displayedJackpot);renderUsdAmounts();
    if (progress < 1) counterFrame = requestAnimationFrame(frame);
    else { jackpotUsdAnimating = false; renderUsdAmounts(); }
  };
  counterFrame = requestAnimationFrame(frame);
}
function renderCoinPile() {
  const baseline = !offlineDemo ? (state.round.openingRollover > 0 ? 12 : 0) : state.round.id === 1 ? 147 : state.round.openingRollover > 0 ? 12 : 0;
  const additional = offlineDemo && state.round.id === 1 ? Math.max(0, state.round.totalKeys - 147) : state.round.totalKeys;
  vault.setCoins(baseline + additional);
  vault.setEnded(state.round.status === 'settled' && Boolean(state.round.winnerId));
}
function animatePurchase(count, oldPot) {
  $('#toast').classList.remove('visible');
  flashPurchase();
  const amount = lastDisplayedPot - (oldPot ?? lastDisplayedPot);
  if (amount > 0) {
    $('#pot-increase').textContent = `+${money(amount)} SOL`;
    $('#pot-increase').classList.add('visible');
    clearTimeout(potIncreaseTimeout);
    potIncreaseTimeout = setTimeout(() => $('#pot-increase').classList.remove('visible'), 2300);
  }
  vault.deposit(count);
}
function save() {
  if (!offlineDemo) return;
  try { sessionStorage.setItem(STORAGE, JSON.stringify({ state, offset, npcEnabled })); } catch { /* Browsing remains usable without persistence. */ }
}
function sound(type = 'buy') {
  if (!soundEnabled) return;
  try {
    audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
    audioContext.resume();
    const start = audioContext.currentTime;
    const notes = type === 'win' ? [523.25, 659.25, 783.99] : [988, 1483, 2471];
    const noteDelay = type === 'win' ? .085 : .025;
    notes.forEach((frequency, index) => {
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, start + index * noteDelay);
      gain.gain.setValueAtTime(0, start + index * noteDelay);
      gain.gain.linearRampToValueAtTime(.022, start + index * noteDelay + .015);
      gain.gain.exponentialRampToValueAtTime(.001, start + index * noteDelay + .18);
      oscillator.connect(gain); gain.connect(audioContext.destination);
      oscillator.start(start + index * noteDelay); oscillator.stop(start + index * noteDelay + .2);
    });
  } catch { /* Sound is optional. */ }
}
function toast(title, detail = '', error = false) {
  (document.querySelector('dialog[open]') || document.body).append($('#toast'));
  $('#toast-title').textContent = title;
  $('#toast-detail').textContent = detail;
  $('#toast').classList.toggle('error', error);
  $('#toast').classList.add('visible');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => $('#toast').classList.remove('visible'), 5_000);
}
$('#toast-dismiss').addEventListener('click', () => $('#toast').classList.remove('visible'));
const nameOf = id => !id ? 'Nobody yet' : id === 'you' ? 'You' : `${offlineDemo || id.startsWith('npc_') ? 'NPC · ' : ''}${state.players[id]?.name || 'Player'}`;
const duration = ms => {
  const seconds = Math.round(ms / 1000);
  return seconds >= 60 ? `${Math.floor(seconds / 60)}m${seconds % 60 ? ` ${seconds % 60}s` : ''}` : `${seconds} seconds`;
};
function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
const getQuantity = () => $('#key-quantity').value === '' ? NaN : Number($('#key-quantity').value);
const getMode = () => $('#reward-mode').value;
const getQuote = () => quotePurchase(state, getQuantity(), 'you', getMode(), !offlineDemo ? $('#referral-wallet')?.value.trim() : undefined);

function renderPurchasePreview() {
  const quote = cachedPurchaseQuote?.roundId === state.round.id ? cachedPurchaseQuote.quote : null;
  const count = cachedPurchaseQuote?.count;
  const preview = createPurchasePreview({ state, count, mode: getMode(), quote, costs: state.chain?.holder?.claimCosts, now: now() });
  const visibility=moneyState();
  const ready = preview.ok && visibility.gameKnown;
  const knownWallet = visibility.walletKnown;
  $('#preview-keys-after').textContent = ready && knownWallet ? String(preview.ownedKeysAfter) : '—';
  $('#preview-share-after').textContent = ready && knownWallet ? percentage(preview.keyShareAfter) : '—';
  if (!knownWallet) { $('#your-keys').textContent = '—'; $('#your-share').textContent = '—'; }
  arenaAmount('#next-key-price',ready?previewDisplayNumber(preview.nextKeyPriceBeforeLamports):null);
  arenaAmount('#next-key-price-after',ready?previewDisplayNumber(preview.nextKeyPriceAfterLamports):null);
  const compactShare=$('#compact-share');if(compactShare)compactShare.textContent=ready&&knownWallet?`${percentage(preview.keyShareAfter)} of key rewards`:'Connect to see your share';
  const seconds = ready ? Math.ceil(preview.resultingRemainingMs / 1000) : null;
  $('#preview-countdown').textContent = seconds === null ? '—' : [Math.floor(seconds / 3600), Math.floor(seconds % 3600 / 60), seconds % 60].map(value => String(value).padStart(2, '0')).join(':');
  $('#preview-countdown').dataset.seconds = seconds === null ? '' : String(seconds);
  $('#purchase-time').textContent = ready ? duration(preview.timeAddedMs) : '—';
  if($('#entry-review-time'))$('#entry-review-time').textContent=$('#purchase-time').textContent;
  if($('#entry-review-clock'))$('#entry-review-clock').textContent=$('#preview-countdown').textContent;
  $('#preview-lead-result').textContent = state.round.status === 'settled' ? 'Open a fresh round to buy keys' : !ready ? 'Waiting for a valid live quote' : state.round.lastBuyerId === 'you' ? 'This buy keeps you as the last buyer' : 'This buy makes you the last buyer';
  return preview;
}

function renderQuoteReview(quote,count,preview) {
  let review=$('#entry-quote-review');
  if(!review){review=element('dl','feed-cost-review');review.id='entry-quote-review';review.setAttribute('aria-label','Exact entry and wallet cost');$('#entry-breakdown').before(review);}
  review.replaceChildren();
  const visibility=moneyState();
  const row=(label,value,id)=>{const line=element('div'),amount=element('dd','',value);if(id)amount.id=id;line.append(element('dt','',label),amount);review.append(line);};
  if(!visibility.gameKnown||!quote.ok){row('Selected entry',quote.ok?'Reading the current round…':quote.error||'Choose a valid number of keys.');return;}
  row('Keys to receive',count.toLocaleString(),'entry-review-keys');
  row('Entry price',`${money(quote.cost)} SOL`,'entry-review-cost');
  const entry=visibility.walletKnown?state.chain?.holder?.claimCosts?.entry:null;
  if(entry){
    const fee=BigInt(entry.networkFees),setup=BigInt(entry.accountRent),returned=BigInt(entry.refundableRent);
    row('Estimated network fee',`${money(Number(fee))} SOL`,'entry-review-fee');
    row('Account setup for this feed',`${money(Number(setup))} SOL`,'entry-review-setup');
    row('Estimated total spent',`${money(Number(BigInt(quote.cost)+fee+setup))} SOL`,'entry-review-total');
    row('Temporary rent, returned',`${money(Number(returned))} SOL`,'entry-review-returned-rent');
    row('Estimated wallet balance needed',`${money(Number(BigInt(quote.cost)+fee+setup+returned))} SOL`,'entry-review-balance-needed');
  }else review.append(element('small','',offlineDemo?'Simulated SOL; no wallet fee is charged.':'Connect your wallet for its fee and account-setup estimate.'));
  row('Time added',duration(preview.timeAddedMs),'entry-review-time');
  row('Clock after this feed',$('#preview-countdown').textContent,'entry-review-clock');
  if(visibility.walletKnown)row('Your key-reward share after',percentage(preview.keyShareAfter),'entry-review-share');
  review.append(element('small','','USD is an estimate. Your wallet pays SOL; temporary rent is returned in the same transaction.'));
}

function renderPurchase() {
  const count = getQuantity();
  const quote = getQuote();
  const quoteError = quote.code === 'LAUNCH_LIMIT' ? '1 SOL wallet limit until 100 SOL enters this round.' : quote.error;
  const settled = state.round.status === 'settled';
  const you = state.players.you;
  const visibility=moneyState();
  const entryCurrency = offlineDemo ? 'demo SOL' : 'SOL';
  arenaAmount('#balance-value',visibility.walletKnown?you.balance:null,{unit:true,unknown:publicChain&&!chainClient?.connected?'Connect wallet':'Updating…'});
  $('#wallet-balance').innerHTML = visibility.walletKnown?`${money(you.balance)} <small>SOL</small>`:publicChain&&!chainClient?.connected?'Connect wallet':'Updating…';
  $('#your-keys').textContent = you.keys.toLocaleString();
  const share = state.round.totalKeys ? you.keys / state.round.totalKeys : 0;
  $('#your-share').replaceChildren(document.createTextNode(percentage(share).slice(0,-1)),element('small','','%'));
  const label = settled ? 'Start next round' : quote.ok ? 'Feed Piggy' : 'Choose keys';
  $('#buy-label').textContent = label;
  $('#buy-button').disabled = !settled && (!quote.ok || quote.cost > you.balance || timeRemaining(state, now()) === 0);
  $('#buy-button').setAttribute('aria-label', settled ? label : quote.ok ? `Buy ${count} round ${count === 1 ? 'key' : 'keys'} for ${money(quote.cost)} ${offlineDemo ? 'demo SOL' : 'SOL'}` : label);
  arenaAmount('#purchase-cost',quote.ok&&visibility.gameKnown?quote.cost:null,{unit:true});
  $('#purchase-time').textContent = quote.ok ? duration(Math.min(quote.extensionMs, Math.max(0, (state.config?.maxRemainingMs ?? 86_400_000) - timeRemaining(state, now())))) : '—';
  $('#purchase-footnote').textContent = settled ? 'Earned SOL stays yours. A new round resets keys.' : !quote.ok ? quoteError : quote.cost > you.balance ? `Not enough ${entryCurrency}. Try a smaller feed.` : 'Not last? Your keys still earn from new buys.';
  const preview = previewKeyShare(state, count);
  $('#purchase-outcome').title = quote.ok ? '' : quote.error;
  $('#purchase-outcome').textContent = settled ? 'New round = a fresh position. Earned SOL stays yours.' : !quote.ok ? quoteError : quote.cost > you.balance ? `Not enough ${entryCurrency}. Choose a smaller feed.`
    : `Your share of key rewards: ${percentage(preview.currentShare)} → ${percentage(preview.afterShare)}`;
  $('#purchase-outcome').hidden = quote.ok && !settled;
  cachedPurchaseQuote = { quote, count, roundId: state.round.id };
  const purchasePreview=renderPurchasePreview();
  renderQuoteReview(quote,count,purchasePreview);
  $('#key-share-current').style.width = `${preview.currentShare*100}%`;
  $('#key-share-preview').style.width = `${preview.afterShare*100}%`;
  $('.key-share-track').setAttribute('aria-label', `Your cut of the key reward pool: ${percentage(preview.currentShare)} now, ${percentage(preview.afterShare)} after this feed`);
  $('#decrease').disabled = !Number.isSafeInteger(count) || count <= 1 || settled;
  $('#increase').disabled = !Number.isSafeInteger(count) || count >= 10_000 || settled;
  $('#key-quantity').disabled = settled;
  $('#reward-mode').disabled = settled;
  document.querySelectorAll('[data-quantity]').forEach(button => { button.classList.toggle('selected', Number(button.dataset.quantity) === count); button.disabled = settled; });
  $('#max-keys').disabled = settled;
  $('#fast-forward').disabled = settled;
  $('#demo-feed-button').disabled = settled;
  const descriptions = {
    whale: 'Whale puts the largest share of your purchase into the round pool.',
    bear: 'Bear balances the round pool with immediate player rewards.',
    snek: 'Snek puts the largest share into immediate player rewards.',
    bull: 'Bull balances player rewards, the round pool and token-holder rewards.',
  };
  $('#mode-explanation').textContent = `${descriptions[getMode()]} The last buyer’s mode also sets the round-closing distribution.`;
  const breakdown = $('#entry-breakdown');
  breakdown.replaceChildren();
  if (quote.ok) {
    const values = [
      ['Round pool', quote.breakdown.pot],
      ['Key rewards now', quote.breakdown.keyHolders],
      ['Token-holder rewards now', quote.breakdown.tokenHolders],
      ['Community + future reserves', quote.breakdown.community + quote.breakdown.rollover + quote.breakdown.airdrop],
    ];
    if (quote.breakdown.affiliate) values.push(['Referrer reward', quote.breakdown.affiliate]);
    for (const [name, amount] of values) {
      const row = element('div'); row.append(element('span', '', name), element('strong', '', `${money(amount)} SOL`)); breakdown.append(row);
    }
  }
  const totalRewards=you.claimable+you.tokenClaimable;
  const disconnected=publicChain&&!chainClient?.connected;
  const unknownBalance=disconnected?'Connect wallet':'Updating…';
  arenaAmount('#hud-rewards',visibility.holderKnown?totalRewards:null,{unit:true,unknown:visibility.walletKnown?'View rewards':unknownBalance});
  arenaAmount('#dock-rewards',visibility.holderKnown?totalRewards:null,{unknown:visibility.walletKnown?'View rewards':unknownBalance});
  $('.rewards-button').setAttribute('aria-label', visibility.holderKnown?`View game and $PIGGY rewards, ${money(totalRewards)} SOL available to claim`:disconnected?'Connect your wallet to see claimable rewards':'View your reward balances');
  $('.reward-dot').hidden = !visibility.walletKnown || !(you.claimable + (visibility.holderKnown?you.tokenClaimable:0));
  $('.mode-button').setAttribute('aria-label', 'Review exact feed costs and payout split');
  $('#mode-name').textContent = { whale: 'Jackpot focus', bear: 'Balanced', snek: 'Key rewards', bull: 'Mixed rewards' }[getMode()];
  $('#game-claimable').textContent = money(you.claimable);
  $('#key-earned').textContent = money(you.keyRewardsEarned || 0);
  $('#game-share').textContent = percentage(share);
  $('#claim-button').disabled = !you.claimable;
  $('#claim-button').textContent = you.claimable ? `Claim ${money(you.claimable)} SOL` : 'No game rewards to claim yet';
  const allTokens = state.totalTokenSupply ?? Object.values(state.players).reduce((sum, player) => sum + player.tokenBalance, 0);
  $('#token-balance').textContent = tokens(you.tokenBalance);
  $('#token-share').textContent = percentage(allTokens ? you.tokenBalance / allTokens : 0);
  $('#token-claimable').textContent = money(you.tokenClaimable);
  $('#token-earned').textContent = money(you.tokenRewardsEarned || 0);
  $('#claim-token-button').disabled = !you.tokenClaimable;
  $('#claim-token-button').textContent = you.tokenClaimable ? `Claim ${money(you.tokenClaimable)} SOL` : 'No token rewards to claim yet';
  if(publicChain){
    const costs=state.chain?.holder?.claimCosts;
    const extra=$('#buy-extra-cost'),entry=costs?.entry,showEntryCost=entry&&visibility.walletKnown&&!chainPending&&!chainClient?.pendingSignature&&state.round.status==='active'&&timeRemaining(state,now())>0&&quote.ok;
    if(extra){extra.hidden=!showEntryCost;$('#buy-button').classList.toggle('has-cost-review',!!showEntryCost);if(showEntryCost){const setup=Number(entry.accountRent);$('#buy-label').textContent='Feed Piggy';extra.textContent=setup?`+${compactMoney(setup)} setup +${compactMoney(Number(entry.networkFees))} fee`:`+${compactMoney(Number(entry.networkFees))} SOL fee`;extra.title=`${money(setup)} SOL permanent setup + ${money(Number(entry.networkFees))} SOL network fee; ${money(Number(entry.refundableRent))} SOL temporary rent is returned.`;$('#buy-button').setAttribute('aria-label',`Buy ${count} round keys for ${money(quote.cost)} SOL, plus ${money(setup)} SOL permanent first-feed account setup and approximately ${money(Number(entry.networkFees))} SOL network fees. Temporary ${money(Number(entry.refundableRent))} SOL account rent is returned.`);}}
    for(const[kind,noteId,buttonId,available]of[['game','game-claim-cost','claim-button',you.claimable],['holder','holder-claim-cost','claim-token-button',you.tokenClaimable]]){
      const note=$(`#${noteId}`);if(!note)continue;const cost=costs?.[kind];
      if(cost){const net=BigInt(cost.netAmount),signedNet=net<0n?`−${money(Number(-net))}`:money(Number(net));note.textContent=`Estimated net: ${signedNet} SOL after ${money(Number(cost.networkFees))} SOL network fees${BigInt(cost.accountRent)>0n?` + ${money(Number(cost.accountRent))} SOL in permanent claim-account rent`:''}. Temporary ${money(Number(cost.refundableRent))} SOL wrapped-account rent is returned. ${cost.transactions} wallet approval${cost.transactions===1?'':'s'}.`;
        if(net<=0n){$(`#${buttonId}`).disabled=true;$(`#${buttonId}`).textContent='Reward is below claim cost';note.textContent+=' This reward stays on chain; the default claim avoids spending more than it receives.';}
      }else{note.textContent=costs?.error||(available?'Claim costs are refreshing. Review the fee and account-rent estimate before claiming.':'');if(available)$(`#${buttonId}`).disabled=true;}
    }
  }
  if (!offlineDemo) {
    const signaturePending=publicChain && !!chainClient?.pendingSignature;
    const unavailable = !chainReady || chainPending || signaturePending || publicChain && chainClient?.connected && !visibility.walletKnown;
    $('#buy-button').disabled ||= unavailable;
    $('#claim-button').disabled ||= unavailable;
    $('#claim-token-button').disabled ||= unavailable;
    $('#demo-feed-button').disabled ||= unavailable;
    $('#fast-forward').disabled = true;
    $('#reset-demo').disabled = true;
    if (unavailable) $('#buy-label').textContent = signaturePending ? 'Confirmation pending…' : chainPending ? 'Confirm in wallet…' : chainFailure ? 'Solana unavailable' : 'Connecting…';
    else if (!settled && timeRemaining(state, now()) === 0) { $('#buy-label').textContent = 'Crack Piggy · Settle round'; $('#buy-button').disabled = false; }
    if (chainFailure) $('#purchase-footnote').textContent = chainFailure;
    for (const button of document.querySelectorAll('[data-chain-action]')) button.disabled = unavailable || publicChain && !chainClient?.connected;
    const span = document.querySelector('.quantity-label > span');
    if(span)span.textContent = `+${duration(state.config?.extensionPerKeyMs ?? 30_000)} per key`;
    if (publicChain && !chainClient?.connected && !chainPending) {
      $('#buy-label').textContent = 'Connect wallet'; $('#buy-button').disabled = !chainClient;
      $('#claim-button').disabled = true; $('#claim-token-button').disabled = true;
      if (chainHasState && !chainFailure) {
        $('#purchase-footnote').textContent = 'Buy round keys with SOL.';
        $('#purchase-outcome').textContent = 'New key buys fund rewards. More keys mean a larger share.';
      }
    }
    if (publicChain) renderPublicWallet();
  }
  renderLoot();
  renderClaimGuide();
  if (!offlineDemo && !chainHasState) {
    for (const id of ['pot-value', 'winner-prize', 'game-claimable', 'key-earned', 'token-claimable', 'token-earned', 'token-balance', 'purchase-cost']) {const node=$(`#${id}`);node.textContent='—';node.removeAttribute('title');delete node.dataset.lamports;node.dataset.moneyState='unknown';}
    displayedJackpot=null;lastDisplayedPot=null;cancelAnimationFrame(counterFrame);jackpotUsdAnimating=false;
    $('#purchase-footnote').textContent = chainFailure || 'Reading confirmed balances and game state from Solana.';
    $('#key-loot-reason').textContent = 'Waiting for confirmed account data.';
    $('#purchase-outcome').textContent = chainFailure ? publicChain ? chainFailure : 'Solana is unavailable. Open Wallet for details.' : 'Connecting…';
  }
  renderUsdAmounts(quote);
  if (claimOnly) {
    $('#buy-button').disabled=true; $('#buy-label').textContent='Test claims only';
    $('.demo-badge').lastChild.textContent='Test claims · SOL';
    $('#claim-network-note').textContent='Pre-launch mainnet instance. New entries are disabled on this page; existing game and funded token-holder SOL rewards remain claimable.';
  }
}
function renderUsdAmounts(quote = cachedPurchaseQuote?.quote) {
  const you = state.players.you;
  const visibility=moneyState();
  usdDisplay.setAmounts({ jackpot: visibility.gameKnown?displayedJackpot:null, rewards: visibility.walletKnown?displayedLoot:null, keyEarn:visibility.walletKnown?displayedLoot:null, gameClaim:visibility.walletKnown?you.claimable:null, holderClaim:visibility.holderKnown?you.tokenClaimable:null, holderEarn:visibility.holderKnown?you.tokenClaimable:null, purchase:visibility.gameKnown&&quote?.ok?quote.cost:null });
}

function renderClock() {
  if (!offlineDemo && !chainHasState) { for (const id of ['hours', 'minutes', 'seconds']) $(`#${id}`).textContent = '—'; return; }
  const seconds = Math.ceil(timeRemaining(state, now()) / 1000);
  if (seconds !== previewSecond) { previewSecond = seconds; renderPurchasePreview(); }
  $('#hours').textContent = String(Math.floor(seconds / 3600)).padStart(2, '0');
  $('#minutes').textContent = String(Math.floor(seconds % 3600 / 60)).padStart(2, '0');
  $('#seconds').textContent = String(seconds % 60).padStart(2, '0');
  $('#app').classList.toggle('urgent', seconds > 0 && seconds <= 20 && state.round.status === 'active');
  $('#app').classList.toggle('final-minute', seconds > 0 && seconds <= 60 && state.round.status === 'active');
  $('.countdown-meter').style.setProperty('--clock-ratio', `${Math.min(100, seconds / 60 * 100)}%`);
  if (seconds > 0 && seconds <= 10 && seconds !== previousSecond && !reducedMotion) {
    $('#app').classList.remove('clock-tick'); void $('#app').offsetWidth; $('#app').classList.add('clock-tick');
    clearTimeout(tickTimeout); tickTimeout = setTimeout(() => $('#app').classList.remove('clock-tick'), 350);
  }
  previousSecond = seconds;
}
function relativeTime(timestamp) {
  const seconds = Math.max(0, Math.floor((now() - timestamp) / 1000));
  return seconds < 5 ? 'Just now' : seconds < 60 ? `${seconds}s ago` : seconds < 3600 ? `${Math.floor(seconds / 60)}m ago` : `${Math.floor(seconds / 3600)}h ago`;
}
function renderActivity() {
  const list = $('#activity-list'); list.replaceChildren();
  for (const item of state.activity.slice(0, 3)) {
    const row = element('div', 'activity-row');
    const id = item.playerId || item.winnerId;
    const player = state.players[id];
    const user = element('div', 'activity-user');
    const avatar = element('span', 'activity-avatar', player?.avatar || '↻');
    avatar.style.background = player ? `${player.color}12` : '#1c2931'; avatar.style.color = player?.color || '#8aa0af';
    user.append(avatar, element('span', '', nameOf(id))); row.append(user);
    const labels = { settlement: 'Won the jackpot', claim: 'Claimed game SOL', 'token-claim': 'Claimed token SOL', 'claim-token': 'Claimed token SOL', 'new-round': 'New round' };
    const action = item.type === 'settlement' && !id ? 'Unclaimed pool rolled forward' : item.type === 'purchase' ? `Bought ${item.count} ${item.count === 1 ? 'key' : 'keys'}` : labels[item.type] || 'Received rewards';
    const amount = item.cost ?? item.amount ?? item.winnerPrize;
    row.append(element('span', '', action), element('span', '', amount === undefined ? '—' : `${money(amount)} SOL`), element('time', '', relativeTime(item.timestamp)));
    list.append(row);
  }
}
function renderHistory() {
  const list = $('#history-list'); list.replaceChildren();
  if (!state.history.length) {
    const empty = element('div', 'empty-history');
    empty.append(element('strong', '', 'No completed rounds yet.'), element('span', '', 'The jackpot winner and actual payout will appear here.'));
    list.append(empty); return;
  }
  for (const item of state.history) {
    const row = element('div', 'history-item'); const left = element('div'); const right = element('div');
    left.append(element('strong', '', `Round ${String(item.roundId).padStart(2, '0')}`), element('span', '', item.winnerId ? nameOf(item.winnerId) : 'No buyer · funds rolled forward'));
    right.append(element('strong', '', `${money(item.winnerId ? item.winnerPrize : item.rolloverAmount)} SOL`), element('span', '', item.winnerId ? `${item.totalKeys} keys · Pot paid` : 'Carried to next round'));
    row.append(left, right); list.append(row);
  }
}
function renderAll() {
  const settled = state.round.status === 'settled';
  const id = settled ? state.round.winnerId : state.round.lastBuyerId;
  const player = state.players[id];
  const emptyRound = state.round.status === 'active' && !id;
  const emptyPot = emptyRound && !state.round.openingRollover && !state.round.grossEntries;
  ($('#jackpot-label')||$('.pot-block .quiet-label')).textContent = settled ? (id ? 'Piggy paid out' : 'Pot carried forward') : 'Jackpot';
  $('.pot-caption').textContent = settled ? 'Jackpot awarded.' : 'Last feeder at zero wins.';
  animateJackpot(settled ? state.round.settlement.winnerPrize : previewJackpot(state));
  renderCoinPile();
  $('#winner-prize').innerHTML = `${money(state.round.grossEntries)} <small>SOL</small>`;
  $('#round-badge').textContent = `Round ${String(state.round.id).padStart(2, '0')}${settled ? ' · Finished' : ''}`;
  $('#leader-name').textContent = settled && !id ? 'No buyer this round' : emptyRound ? 'No feeds yet' : nameOf(id);
  $('#leader-avatar').textContent = player?.avatar || '—';
  $('#leader-avatar').style.color = player?.color || '#8999a7';
  $('#leader-avatar').style.background = player ? `${player.color}17` : '#141c23';
  $('#leader-label').textContent = settled ? (id ? 'Jackpot winner' : 'Unclaimed funds roll forward') : (id ? 'Last feeder' : 'First feed takes the lead');
  $('#timer-caption').textContent = settled ? 'Round finished' : emptyRound ? 'Next round in' : 'Cracks in';
  $('#core-state').textContent = settled ? (id === 'you' ? 'You won. Your jackpot is ready to claim.' : id ? 'The jackpot has been awarded.' : 'Start the next round to play for the carried funds.') : id === 'you' ? 'You are in the lead. Your keys stay yours if passed.' : 'Feed Piggy to take the crown.';
  $('#action-title').textContent = settled ? 'Start next round' : 'Feed Piggy';
  $('#action-subtitle').textContent = settled ? 'Keys reset. Earned SOL stays yours.' : 'Buy keys. Share later feeds.';
  $('#position-state').textContent = settled ? (id === 'you' ? 'Round won' : 'Round ended') : state.players.you.keys ? (id === 'you' ? 'Currently leading' : 'Shares earning rewards') : 'Not in this round';
  $('#npc-toggle').setAttribute('aria-pressed', String(npcEnabled));
  $('#app').classList.toggle('round-over', settled); $('#app').classList.toggle('win', id === 'you');
  $('#app').classList.toggle('has-jackpot', settled && Boolean(id));
  renderClock(); renderPurchase(); renderActivity(); renderHistory(); save();
  if (!offlineDemo && !chainHasState) {
    $('#leader-name').textContent = 'Waiting for Solana'; $('#leader-avatar').textContent = '—';
    $('#leader-label').textContent = 'Reading the current round'; $('#round-badge').textContent = 'Connecting';
    $('#core-state').textContent = 'Waiting for confirmed game accounts.';
  }
}
function changeQuantity(value) { $('#key-quantity').value = String(value); renderPurchase(); }
$('#decrease').addEventListener('click', () => changeQuantity(Math.max(1, getQuantity() - 1)));
$('#increase').addEventListener('click', () => changeQuantity(Math.min(10_000, getQuantity() + 1)));
$('#key-quantity').addEventListener('input', renderPurchase);
$('#key-quantity').addEventListener('keydown', event => { if (event.key === 'Enter') { event.preventDefault(); event.currentTarget.blur(); } });
$('#reward-mode').addEventListener('change', renderPurchase);
$('#referral-wallet').addEventListener('input', renderPurchase);
document.querySelectorAll('[data-quantity]').forEach(button => button.addEventListener('click', () => changeQuantity(Number(button.dataset.quantity))));
$('#max-keys').addEventListener('click', () => {
  let low = 0; let high = 10_000;
  while (low < high) { const middle = Math.ceil((low + high) / 2); const quote = quotePurchase(state, middle, 'you', getMode()); if (quote.ok && quote.cost <= state.players.you.balance) low = middle; else high = middle - 1; }
  changeQuantity(Math.max(1, low));
});
$('#buy-button').addEventListener('click', async () => {
  if (publicChain && !chainClient?.connected) { if (openPublicWallet) openPublicWallet(); else screens.open($('#wallet-dialog')); return; }
  if (!offlineDemo) return runChainAction(state.round.status === 'settled' ? 'startRound' : timeRemaining(state, now()) === 0 ? 'endRound' : 'feed', { count: getQuantity(), mode: getMode(), referral: $('#referral-wallet')?.value.trim() || undefined, maxCostLamports: getQuote().ok ? String(getQuote().cost) : undefined, expectedRound: String(state.round.id) });
  if (state.round.status === 'settled') {
    const result = startNextRound(state, now());
    if (!result.ok) return toast('Could not start the round', result.error, true);
    clearPayoutPreview(); feedback.clear();
    lastFeedEvent = null; lootMessageOverride = ''; clearLootPayment();
    changeQuantity(1); nextNpcAt = Date.now() + 16_000; renderAll(); screens.wipe(); toast(`Piggy round ${state.round.id} is open`, 'Fresh position. Fresh crown. Your earned SOL stays yours.'); return;
  }
  const before = captureRewardPosition(state), previousLeader = state.round.lastBuyerId, oldPot = previewJackpot(state);
  const result = buyKeys(state, 'you', getQuantity(), now(), getMode());
  if (!result.ok) { toast('Feed not completed', result.error, true); renderAll(); return; }
  sound(); presentFeed(result, before, oldPot, true, previousLeader);
  // One clearly labelled NPC feed demonstrates how the newly bought keys earn.
  if (!before.keys && npcEnabled) nextNpcAt = Math.min(nextNpcAt, Date.now() + 5_500);
  $('#time-extension').textContent = `+${duration(result.actualExtensionMs)}`; $('#time-extension').classList.add('visible');
  clearTimeout(extensionTimeout); extensionTimeout = setTimeout(() => $('#time-extension').classList.remove('visible'), 2_200);
});
$('#npc-toggle').addEventListener('click', () => {
  if (!offlineDemo) return;
  npcEnabled = !npcEnabled; nextNpcAt = Date.now() + 6_500; $('#npc-toggle').setAttribute('aria-pressed', String(npcEnabled)); save();
  toast(npcEnabled ? 'NPC simulation on' : 'NPC simulation paused', npcEnabled ? 'Labelled NPC feeders can buy keys in this demo.' : 'The countdown continues without computer purchases.');
});
$('#claim-button').addEventListener('click', () => {
  if (!offlineDemo) return runChainAction('claimGame');
  const result = claimPayout(state, 'you');
  if (result.ok) { claimResult = { kind: 'game', status: 'success' }; clearLootPayment(); lootMessageOverride = state.round.status === 'active' ? `${money(result.amount)} SOL claimed. Your position keeps its cut.` : `${money(result.amount)} SOL claimed. Piggy is ready for a fresh round.`; renderAll(); sound('win'); toast('Piggy loot claimed', `${money(result.amount)} demo SOL added to your wallet. Your keys stay yours.`); }
  else toast('Nothing to claim', result.error, true);
});
$('#claim-token-button').addEventListener('click', () => {
  if (!offlineDemo) return runChainAction('claimHolder');
  const result = claimTokenRewards(state, 'you');
  if (result.ok) { claimResult = { kind: 'holder', status: 'success' }; renderAll(); sound('win'); toast('Token-holder rewards claimed', `${money(result.amount)} demo SOL added to your wallet. Your tokens stay in your wallet.`); }
  else toast('Nothing to claim', result.error, true);
});
document.querySelectorAll('[data-dialog]').forEach(button => button.addEventListener('click', () => { if (publicChain && button.dataset.dialog === 'wallet-dialog' && openPublicWallet) { openPublicWallet(); return; } renderHistory(); renderPurchase(); if (button.dataset.dialog === 'rewards-dialog') { claimGuide.open(button.hasAttribute('data-open-holder')?'holder':button.hasAttribute('data-open-game') || button.id === 'loot-claim' ? 'game' : undefined); return; } screens.open($(`#${button.dataset.dialog}`)); }));
document.addEventListener('click',event=>{const button=event.target.closest('[data-open-holder]');if(!button||button.hasAttribute('data-dialog'))return;event.preventDefault();renderPurchase();claimGuide.open('holder');});
document.querySelectorAll('dialog').forEach(dialog => {
  dialog.querySelectorAll('.dialog-close,.dialog-done').forEach(button => button.addEventListener('click', () => dialog.close()));
  dialog.addEventListener('close', () => { if (dialog.id === 'wallet-dialog' && !chainClient?.connected) returnToClaims = false; if (dialog.contains($('#toast'))) document.body.append($('#toast')); });
  dialog.addEventListener('click', event => { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); });
});
$('#fast-forward').addEventListener('click', () => { if (!offlineDemo) return; npcEnabled = false; offset += Math.max(0, timeRemaining(state, now()) - 5_000); $('#wallet-dialog').close(); renderAll(); toast('Final five seconds', 'NPC purchases are paused. The last buyer receives the displayed jackpot at zero.'); });
$('#reset-demo').addEventListener('click', () => { if (!offlineDemo) return; clearPayoutPreview(); feedback.clear(); offset = 0; state = createGame(Date.now()); clearLootPayment(); lastFeedEvent = null; lootMessageOverride = ''; npcEnabled = true; nextNpcAt = Date.now() + 28_000; changeQuantity(1); $('#wallet-dialog').close(); renderAll(); flashPurchase(); toast('Piggy demo reset', '500 demo SOL and 1,000 demo $PIGGY. Feed Piggy to get keys.'); });
$('#demo-feed-button').addEventListener('click', () => { $('#wallet-dialog').close(); if (!offlineDemo) return runChainAction('feedNpc', { count: 5, mode: 'snek' }); if (!simulateFeed()) toast('No demo feed available', 'Start an active round or reset the demo wallets.', true); nextNpcAt = Date.now() + 50_000; });
$('#preview-payout').addEventListener('click', () => {
  $('#wallet-dialog').close();
  if (vault.previewPayout()) {
    payoutPreview = true; $('#app').classList.add('payout-preview');
    feedback.preview(); sound('win');
    payoutPreviewTimer = setTimeout(clearPayoutPreview, 4_400);
  }
  else toast('Preview unavailable', 'Feed Piggy first, or wait for the current payout to finish.');
});
const soundButton = element('button', 'sound-button');
soundButton.setAttribute('aria-label', 'Enable sound'); soundButton.setAttribute('aria-pressed', 'false');
soundButton.innerHTML = '<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4Z"/><path d="m17 9 5 6m0-6-5 6"/></svg>';
const soundHolder = element('div'); soundHolder.style.cssText = 'display:flex;align-items:center;gap:9px';
$('#round-badge').parentElement.before(soundHolder); soundHolder.append(soundButton, $('#round-badge').parentElement);
$('.topbar nav').prepend(soundButton);
soundButton.addEventListener('click', () => {
  soundEnabled = !soundEnabled; soundButton.setAttribute('aria-pressed', String(soundEnabled)); soundButton.setAttribute('aria-label', soundEnabled ? 'Mute sound' : 'Enable sound');
  soundButton.innerHTML = soundEnabled ? '<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4Z"/><path d="M17 8c3 2 3 6 0 8m3-11c5 4 5 10 0 14"/></svg>' : '<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4Z"/><path d="m17 9 5 6m0-6-5 6"/></svg>';
  if (soundEnabled) sound();
});
setInterval(() => {
  if (!offlineDemo) {
    renderClock();
    if (settlementRound !== state.round.id) { settlementRound = state.round.id; settlementAttempts = 0; }
    if (!publicChain && chainReady && !chainPending && state.round.status === 'active' && timeRemaining(state, now()) === 0 && settlementAttempts < 3 && Date.now() >= nextSettlementAttempt) {
      settlementAttempts++; nextSettlementAttempt = Date.now() + 5_000;
      runChainAction('endRound');
    }
    return;
  }
  if (state.round.status === 'active' && timeRemaining(state, now()) === 0) {
    const before = captureRewardPosition(state);
    const result = settleRound(state, now());
    if (result.ok) { clearPayoutPreview(); const change = getPurchaseRewardChange(before, captureRewardPosition(state)); lootMessageOverride = ''; renderAll(); showLootPayment(change.keyDelta, 'Closing key rewards'); flashPurchase(); sound('win'); feedback.settled({isYou:result.winnerId === 'you',winnerName:result.winnerId ? nameOf(result.winnerId) : undefined,jackpot:result.winnerPrize}); }
    return;
  }
  if (npcEnabled && state.round.status === 'active' && Date.now() >= nextNpcAt) {
    simulateFeed();
    nextNpcAt = Date.now() + 50_000 + Math.random() * 60_000;
  }
  renderClock();
}, 250);
setInterval(renderActivity, 5_000);
window.addEventListener('pagehide', save);
renderAll();
screens.wipe();

async function adoptChain(raw, { feedbackEnabled = true } = {}) {
  const before = captureRewardPosition(state), oldPot = previewJackpot(state), previousLeader = state.round.lastBuyerId;
  const previousRound = state.round.id, previousStatus = state.round.status, previousKeys = state.round.totalKeys;
  const next = chainView(raw);
  state = next; offset = next.lastActionAt - Date.now(); chainReady = true; chainHasState = true; chainFailure = '';
  if (previousRound !== next.round.id) { clearPayoutPreview(); feedback.clear(); }
  if (feedbackEnabled && previousRound === next.round.id) {
    const change = getPurchaseRewardChange(before, captureRewardPosition(state));
    if (previousStatus === 'active' && next.round.status === 'settled') {
      lastFeedEvent = null;
      clearPayoutPreview(); renderAll(); showLootPayment(change.keyDelta, 'Closing key rewards'); sound('win'); feedback.settled({isYou:next.round.winnerId === 'you',winnerName:next.round.winnerId ? nameOf(next.round.winnerId) : undefined,jackpot:next.round.settlement.winnerPrize});
    } else if (next.round.status === 'active' && next.round.totalKeys > previousKeys) {
      clearPayoutPreview();
      const isYou = next.round.lastBuyerId === 'you';
      lastFeedEvent = { roundId: next.round.id, isYou, keyDelta: change.keyDelta };
      renderAll(); animatePurchase(next.round.totalKeys - previousKeys, oldPot); showLootPayment(change.keyDelta);
      feedback.purchase({ isYou, playerName: nameOf(next.round.lastBuyerId), jackpot: previewJackpot(state), jackpotDelta: previewJackpot(state) - oldPot, rewardDelta: change.keyDelta, tokenRewardDelta: change.tokenDelta, count: next.round.totalKeys - previousKeys, yourKeys: next.players.you.keys, shareAfter: change.shareAfter, hasKeys: next.players.you.keys > 0, lostCrown: !isYou && previousLeader === 'you' });

    }
  }
  const clusterName = state.chain.network === 'mainnet-beta' ? 'Mainnet' : state.chain.network === 'localnet' ? 'Local' : state.chain.network[0].toUpperCase() + state.chain.network.slice(1);
  $('.demo-badge').lastChild.textContent = publicChain ? `${clusterName}${state.chain.network === 'mainnet-beta' ? ' · SOL' : ' · Test SOL'}` : 'Local · Test SOL';
  $('.wallet-button > span').textContent = publicChain ? chainClient?.connected ? chainClient.walletName || 'Your wallet' : 'Connect wallet' : 'Test wallet';
  $('.wallet-button').setAttribute('aria-label', publicChain ? 'Open Solana wallet' : 'Open test wallet');
  $('.balance-line > span').textContent = publicChain && state.chain.network === 'mainnet-beta' ? 'Wallet balance' : 'Test balance';
  $('#chain-wallet').textContent = state.chain.wallet || 'Connect your wallet';
  $('#chain-program').textContent = state.chain.programId;
  $('#chain-mint').textContent = state.chain.piggyMint;
  $('#chain-network').textContent = `${state.chain.network || 'localnet'} · ${state.chain.network === 'mainnet-beta' ? 'real SOL' : 'test funds'}`;
  if(publicChain && state.chain.holder?.proofWarning) $('#holder-funding-note').textContent = `Holder rewards are temporarily unavailable: ${state.chain.holder.proofWarning}. Existing allocations remain on chain. Game entries and game claims are independent.`;
  renderAll();
}

async function runChainAction(action, parameters = {}) {
  try { assertRouteActionAllowed(claimOnly, action); } catch(error) { toast('Test claims only',error.message,true); return; }
  if (!chainReady || chainPending) return;
  const isClaimAction = action === 'claimGame' || action === 'claimHolder';
  const actionWallet = publicChain ? chainClient.wallet : state.chain?.wallet;
  activeChainAction = action;
  if (isClaimAction) { claimProgress = { status: 'preparing' }; claimResult = null; }
  chainPending = true; renderPurchase();
  try {
    const response = await chainClient.action({ action, ...parameters });
    if (response.ok === false) throw new Error(response.error || 'Solana rejected this transaction.');
    if(publicChain&&response.wallet&&response.wallet!==chainClient.wallet){await refreshChainAfterAction();toast('Previous wallet transaction confirmed',`Check ${response.signature} in the wallet that signed it.`);return;}
    if (isClaimAction) claimResult = { kind: action === 'claimHolder' ? 'holder' : 'game', status: 'success', wallet: actionWallet, warning: response.warning };
    presentTransactionSignature(response.signature || response.signatures?.at(-1));
    try { await adoptChain(response.state || await chainClient.getState()); }
    catch(error) { chainReady=false; chainFailure='Transaction confirmed. Balances are refreshing; check its signature in Wallet.'; toast('Transaction confirmed',chainFailure); return; }
    if (action === 'startRound') { lastFeedEvent = null; lootMessageOverride = ''; clearLootPayment(); changeQuantity(1); screens.wipe(); }
    const titles = { feed: 'Piggy fed', feedNpc: 'Test feeder confirmed', claimGame: 'Game SOL claimed', claimHolder: '$PIGGY holder SOL claimed', endRound: 'Piggy paid out', startRound: 'New Piggy round opened', publishHolderEpoch: 'Holder rewards funded', withdrawCommunity: 'Community fees claimed' };
    toast(titles[action] || 'Transaction confirmed', response.warning || `Confirmed on ${publicChain ? state.chain.network : 'your local Solana validator'}.`);
  } catch (error) { if (isClaimAction) claimResult = { kind: action === 'claimHolder' ? 'holder' : 'game', status: error.name === 'PendingTransactionError' ? 'pending' : 'error', wallet: actionWallet, message: error.message }; if(error.signature) presentTransactionSignature(error.signature); toast(error.name === 'PendingTransactionError' ? 'Confirmation pending' : 'Transaction not completed', error.message, true); await refreshChainAfterAction(); }
  finally { chainPending = false; activeChainAction = null; claimProgress = null; renderAll(); }
}
function presentTransactionSignature(signature){
  const target=$('#last-transaction');if(!signature){target.textContent='No transaction was needed.';return;}
  if(!publicChain){target.textContent=signature;return;}
  const link=element('a','',signature);link.href=`https://explorer.solana.com/tx/${encodeURIComponent(signature)}${chainClient.config.cluster==='mainnet-beta'?'':`?cluster=${encodeURIComponent(chainClient.config.cluster)}`}`;link.target='_blank';link.rel='noopener noreferrer';link.setAttribute('aria-label','View this transaction on Solana Explorer');target.replaceChildren(link);
}
async function refreshChainAfterAction(){try{await adoptChain(await chainClient.getState(),{feedbackEnabled:false});}catch{/* Preserve the last confirmed view; the next poll reports the RPC state. */}}

async function refreshChain() {
  if (chainPollBusy || chainPending || !chainClient) return;
  chainPollBusy = true;
  try { await adoptChain(await chainClient.getState(), { feedbackEnabled: chainReady }); }
  catch (error) { chainReady = false; chainFailure = publicChain || clientMode.mode === 'unconfigured' ? error.message : 'Start the local Solana service to feed Piggy. No transaction has been sent.'; $('.demo-badge').lastChild.textContent = 'Disconnected'; renderPurchase(); }
  finally { chainPollBusy = false; }
}
function presentPublicTransaction(progress){
  if(progress.wallet&&progress.wallet!==chainClient?.wallet)return;
  if(progress.signature)presentTransactionSignature(progress.signature);
  if(!chainPending)return;
  if (activeChainAction === 'claimGame' || activeChainAction === 'claimHolder') { claimProgress = progress; renderClaimGuide(); }
  $('#buy-label').textContent=progress.status==='awaiting-wallet'?'Approve in wallet…':'Confirming on Solana…';
  if(progress.status!=='awaiting-wallet')return;
  const fee=Number(progress.fee||0),setup=Number(progress.accountRent||0),temporary=Number(progress.refundableRent||0),claim=Number(progress.claimAmount||0);
  if(claim){const note=$(setup?'#holder-claim-cost':'#game-claim-cost'),net=claim-fee-setup;if(note)note.textContent=`This transaction: ${money(claim)} SOL reward, ${money(fee)} SOL network fee${setup?`, ${money(setup)} SOL permanent receipt rent`:''}. Net ${net<0?'−':''}${money(Math.abs(net))} SOL. Temporary ${money(temporary)} SOL rent is returned.`;}
  else{const extra=$('#buy-extra-cost');extra.hidden=false;$('#buy-button').classList.add('has-cost-review');extra.textContent=`${money(fee)} SOL fee${setup?` + ${money(setup)} setup`:''}`;}
}

if (!offlineDemo) {
  npcEnabled = false; $('#npc-toggle').hidden = true;
  $('#local-chain-controls').hidden = false;
  $('#wallet-dialog h2').textContent = 'Your local test wallet.';
  $('#wallet-dialog .kb-dialog-content > p').textContent = 'This wallet sends real transactions on your local Solana validator using test SOL and a test $PIGGY mint. No mainnet funds are used.';
  $('#wallet-mode-note').textContent = 'The local service signs only with isolated test keypairs. Original timing and prices are enforced by the program. The test mint stays in your wallet when you claim holder SOL.';
  $('#claim-network-note').textContent = 'Game loot is read from Solana accounts, including earlier rounds. Holder loot comes from funded wallet-balance snapshots; the local publisher assigns epochs and proofs. No staking.';
  $('#rules-dialog .dialog-note').textContent = 'Local Solana test deployment. SOL entries use wrapped SOL in the program; claims unwrap into your test wallet. Original fee splits and pricing apply. The $PIGGY snapshot and claim system extends the original GitHub source. Lottery draws use the fork’s explicit local test feature.';
  $('#history-dialog .kb-dialog-content > p').textContent = 'Completed rounds and jackpots are read from the local Solana program.';
  $('#demo-feed-button').textContent = 'Feed from another test wallet';
  $('#fast-forward').hidden = true; $('#reset-demo').hidden = true;
  $('.demo-badge').lastChild.textContent = 'Connecting…';
  document.querySelectorAll('[data-chain-action]').forEach(button => button.addEventListener('click', () => runChainAction(button.dataset.chainAction)));
  if (publicChain) initializePublicWallet();
  else if (clientMode.mode === 'localnet') import('./solana-client.mjs').then(({ createLocalGameClient }) => { chainClient = createLocalGameClient({ baseUrl: '/api/local' }); return refreshChain(); }).catch(error => { chainFailure = error.message; renderPurchase(); });
  else { chainFailure = clientMode.error; $('#wallet-dialog h2').textContent = 'Deployment not configured.'; $('#wallet-dialog .kb-dialog-content > p').textContent = clientMode.error; $('#local-chain-controls').hidden = true; $('.demo-badge').lastChild.textContent = 'Unavailable'; renderPurchase(); }
  setInterval(refreshChain, publicChain ? 5_000 : 1_500);
}

async function initializePublicWallet() {
  $('.wallet-button > span').textContent='Connect wallet';$('.wallet-button').setAttribute('aria-label','Open Solana wallet');
  const extraCost=element('small','buy-extra-cost');extraCost.id='buy-extra-cost';extraCost.hidden=true;$('#buy-label').after(extraCost);
  const dialog = $('#wallet-dialog');
  dialog.classList.add('public-wallet-dialog');
  dialog.setAttribute('aria-labelledby', 'public-wallet-title');
  dialog.setAttribute('aria-describedby', 'public-wallet-intro');
  const content = dialog.querySelector('.kb-dialog-content');
  const title = dialog.querySelector('h2'); title.id = 'public-wallet-title';
  const intro = content.querySelector(':scope > p'); intro.id = 'public-wallet-intro';
  const symbol = content.querySelector('.dialog-symbol');
  symbol.replaceChildren($('.piggy-mark').cloneNode()); symbol.setAttribute('aria-hidden', 'true');
  const controls = element('div', 'wallet-controls'); controls.id = 'public-wallet-controls';
  const list = element('div', 'wallet-provider-list'); list.id = 'public-wallet-list'; list.setAttribute('aria-label', 'Available Solana wallets');
  const select = element('select'); select.id = 'public-wallet-choice'; select.hidden = true; select.setAttribute('aria-label', 'Solana wallet');
  const status = element('p', 'wallet-connection-status', 'Finding wallets in this browser…');
  status.id = 'public-wallet-status'; status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite'); status.setAttribute('aria-atomic', 'true');
  const connect = element('button', 'secondary-button wallet-retry', 'Connect wallet'); connect.id = 'public-wallet-connect'; connect.type = 'button'; connect.disabled = true; connect.hidden = true;
  const disconnect = element('button', 'wallet-disconnect', 'Disconnect'); disconnect.id = 'public-wallet-disconnect'; disconnect.type = 'button'; disconnect.hidden = true;
  const empty = element('div', 'wallet-empty'); empty.hidden = true;
  empty.append(element('strong', '', 'No wallet detected in this browser.'), element('p', '', 'On your phone, open PIGGY inside a wallet’s browser. On desktop, install its browser extension.'));
  const links = element('div', 'wallet-open-links');
  for (const [name, base, install] of [
    ['Phantom', 'https://phantom.app/ul/browse/', 'https://phantom.com/download'],
    ['Solflare', 'https://solflare.com/ul/v1/browse/', 'https://www.solflare.com/download'],
  ]) {
    const choice = element('div', 'wallet-open-choice');
    const link = element('a', 'secondary-button', `Open ${name}`); link.href = `${base}${encodeURIComponent(location.href)}?ref=${encodeURIComponent(location.origin)}`; link.rel = 'noopener noreferrer'; link.target = '_blank';
    const extension = element('a', 'wallet-install-link', `Get ${name}`); extension.href = install; extension.target = '_blank'; extension.rel = 'noopener noreferrer';
    choice.append(link, extension); links.append(choice);
  }
  const mobileNote = element('p', 'wallet-browser-note', 'Connect and play in that wallet browser. Returning here does not connect this browser.');
  empty.append(links, mobileNote);
  const help = element('details', 'wallet-browser-help');
  help.append(element('summary', '', 'Using a different wallet or browser?'), element('p', '', 'Only wallets available in this browser appear above. Open PIGGY in your preferred Solana wallet browser, or install its official extension, then reopen this chooser.'));
  controls.append(select, list, status, connect, empty, help, disconnect);
  intro.after(controls);
  const accountDetails = element('details', 'wallet-account-details');
  accountDetails.append(element('summary', '', 'Balance & account details'));
  const accountBody = element('div', 'wallet-account-body');
  for (const child of [...content.children]) if (!['dialog-symbol'].includes(child.className) && child !== title && child !== intro && child !== controls) accountBody.append(child);
  accountDetails.append(accountBody); controls.after(accountDetails);
  title.textContent = 'Choose your wallet';
  intro.textContent = 'Connect to feed Piggy and claim your SOL.';
  $('#wallet-mode-note').textContent = 'Your first feed in each round also creates a permanent player account. Feed shows that setup cost separately from the entry price. Network fees apply, and temporary wrapped-SOL account rent is returned atomically. Claims show their estimated net reward after costs. Check the network and amounts before approving.';
  $('#claim-network-note').textContent = 'Game loot is read from confirmed Solana accounts. $PIGGY holder loot comes from published, funded wallet-balance snapshots. Claims verify the proof against the on-chain epoch. No staking.';
  $('#token-share').previousElementSibling.textContent='Share of token supply';
  $('#rewards-dialog .token-reward-card .reward-explainer').textContent='No staking. Each funded snapshot rewards eligible wallet holders. Pool/program wallets and disclosed excluded wallets do not earn; this supply percentage is separate from a snapshot reward allocation.';
  for(const[id,button]of[['game-claim-cost','#claim-button'],['holder-claim-cost','#claim-token-button']]){if ($(`#${id}`)) continue;const note=element('p','dialog-note');note.id=id;note.setAttribute('aria-live','polite');$(button).before(note);}
  $('#rules-dialog .dialog-note').textContent = 'SOL entries use wrapped SOL atomically. Game claims unwrap to your connected wallet. Original fee splits, launch limits, timers and pricing apply. Keys cannot be sold back. Holder rewards require published funded snapshots. Lottery rewards are disabled; their reserve carries into later rounds.';
  $('#history-dialog .kb-dialog-content > p').textContent = 'Confirmed completed PIGGY rounds. Your earned SOL remains claimable after a new round starts.';
  $('#chain-mint').previousElementSibling.textContent='$PIGGY mint';
  $('#demo-feed-button').hidden=true;
  document.querySelectorAll('[data-chain-action="publishHolderEpoch"],[data-chain-action="withdrawCommunity"]').forEach(button=>button.hidden=true);
  const settle=$('[data-chain-action="endRound"]');settle.textContent='Settle Piggy after the clock reaches zero';
  let connecting = false, disconnecting = false, pendingWalletId = '', walletError = '', available = [], listFingerprint = '';
  let connectionGeneration = 0, reconnectAttempted = false, reconnectReady = false;
  const rememberedWalletKey = () => `piggy.wallet-choice:${chainClient.config.genesisHash}:${chainClient.config.programId}`;
  const readRemembered = () => { try { return sessionStorage.getItem(rememberedWalletKey()); } catch { return null; } };
  const remember = value => { try { value ? sessionStorage.setItem(rememberedWalletKey(), value) : sessionStorage.removeItem(rememberedWalletKey()); } catch { /* Wallet choice is optional when storage is blocked. */ } };
  const currentChoice = () => available.find(choice => choice.id === select.value || choice.name === select.value);
  const displayName = () => chainClient?.walletName || available.find(choice => choice.id === chainClient?.walletId)?.name || 'Your wallet';
  function renderProviderRows() {
    const fingerprint = JSON.stringify(available.map(choice => [choice.id, choice.name, choice.icon]));
    if (fingerprint !== listFingerprint) {
      const focusedId = document.activeElement?.closest('[data-wallet-id]')?.dataset.walletId;
      listFingerprint = fingerprint;
      list.replaceChildren(...available.map(choice => {
        const row = element('button', 'wallet-provider'); row.type = 'button'; row.dataset.walletId = choice.id;
        const icon = element('span', 'wallet-provider-icon'); icon.setAttribute('aria-hidden', 'true');
        if (typeof choice.icon === 'string' && /^data:image\/(?:png|jpe?g|webp|gif|svg\+xml)[;,]/i.test(choice.icon)) {
          const image = element('img'); image.src = choice.icon; image.alt = ''; image.width = 36; image.height = 36; image.referrerPolicy = 'no-referrer';
          image.addEventListener('error', () => icon.replaceChildren(document.createTextNode(choice.name.slice(0, 1))), { once: true }); icon.append(image);
        } else icon.textContent = choice.name.slice(0, 1);
        const copy = element('span', 'wallet-provider-copy'); copy.append(element('strong', '', choice.name), element('span', 'wallet-provider-detail', 'Available in this browser'));
        const marker = element('span', 'wallet-provider-marker'); marker.setAttribute('aria-hidden', 'true');
        row.append(icon, copy, marker); row.addEventListener('click', () => { select.value = choice.id; walletError = ''; connectPublicWallet(choice.id); }); return row;
      }));
      if (focusedId) list.querySelector(`[data-wallet-id="${CSS.escape(focusedId)}"]`)?.focus({ preventScroll: true });
    }
    for (const row of list.children) {
      const isCurrent = !!chainClient?.connected && row.dataset.walletId === chainClient.walletId;
      const isPending = connecting && row.dataset.walletId === pendingWalletId;
      row.disabled = connecting || disconnecting || chainPending || isCurrent;
      row.classList.toggle('is-connected', isCurrent); row.classList.toggle('is-pending', isPending);
      row.querySelector('.wallet-provider-detail').textContent = isPending ? 'Approve in your wallet…' : isCurrent ? 'Connected' : 'Available in this browser';
      row.querySelector('.wallet-provider-marker').textContent = isCurrent ? '✓' : isPending ? '…' : '';
      row.setAttribute('aria-label', isCurrent ? `${row.querySelector('strong').textContent}, connected` : `Connect ${row.querySelector('strong').textContent}`);
    }
  }
  renderPublicWallet = () => {
    const connected = !!chainClient?.connected, busy = connecting || disconnecting || chainPending;
    controls.setAttribute('aria-busy', String(connecting || disconnecting));
    dialog.classList.toggle('wallet-is-connected', connected);
    title.textContent = connected ? `${displayName()} connected` : 'Choose your wallet';
    intro.textContent = connected ? 'Approve every feed and claim in your wallet.' : 'Connect to feed Piggy and claim your SOL.';
    $('.wallet-button > span').textContent = connected ? displayName() : 'Connect wallet';
    $('.wallet-button').setAttribute('aria-label', connected ? `Open ${displayName()} wallet account` : 'Choose a Solana wallet');
    $('.wallet-total').hidden = !connected;
    accountDetails.querySelector('summary').textContent = connected ? 'Balance & account details' : 'Network, rewards & fees';
    disconnect.hidden = !connected; disconnect.disabled = busy; disconnect.textContent = disconnecting ? 'Disconnecting…' : `Disconnect ${displayName()}`;
    select.disabled = busy;
    empty.hidden = !chainClient || available.length > 0;
    help.hidden = !available.length;
    const choice = currentChoice();
    connect.hidden = !walletError || !choice || connected && chainClient.walletId === choice.id;
    connect.disabled = busy || !chainClient || !choice;
    connect.textContent = connecting ? `Connecting ${choice?.name || 'wallet'}…` : `Try ${choice?.name || 'wallet'} again`;
    status.classList.toggle('is-error', !!walletError);
    status.textContent = walletError || (connecting ? `Waiting for ${available.find(choice => choice.id === pendingWalletId)?.name || 'your wallet'}. Approve or cancel in its window.` : disconnecting ? 'Disconnecting your wallet…' : !chainClient ? 'Finding wallets in this browser…' : connected ? `${chainClient.wallet.slice(0, 4)}…${chainClient.wallet.slice(-4)} · ${chainClient.config.cluster === 'mainnet-beta' ? 'Solana mainnet' : chainClient.config.cluster}` : available.length ? 'Choose a wallet to continue. No transaction is sent when you connect.' : 'Install a wallet or use its in-app browser to continue.');
    renderProviderRows();
  };
  function refreshWalletChoices() {
    if (!chainClient) { renderPublicWallet(); return; }
    const choices = chainClient.availableWallets();
    const previous = select.value;
    available = choices.map(choice => ({ ...choice, id: choice.id || choice.name }));
    select.replaceChildren(element('option', '', 'Choose a wallet'), ...available.map(choice => { const option = element('option', '', choice.name); option.value = choice.id; return option; }));
    const preferred = [previous, chainClient.walletId, readRemembered()].find(value => available.some(choice => choice.id === value || choice.name === value));
    if (preferred) select.value = available.find(choice => choice.id === preferred || choice.name === preferred).id;
    renderPublicWallet();
    if (reconnectReady) queueMicrotask(reconnectRememberedWallet);
  }
  async function reconnectRememberedWallet() {
    if (reconnectAttempted || connecting || disconnecting || chainClient?.connected) return;
    const remembered = readRemembered();
    const choice = available.find(item => item.id === remembered || item.name === remembered);
    if (!choice) return;
    reconnectAttempted = true;
    await connectPublicWallet(choice.id, { silent: true });
  }
  openPublicWallet = () => {
    chainClient?.refreshWallets?.(); refreshWalletChoices(); renderHistory(); renderPurchase(); screens.open(dialog);
    const firstChoice = list.querySelector('button:not(:disabled)');
    if (firstChoice) firstChoice.focus({ preventScroll: true });
  };
  connectPublicWallet = async (id = select.value, { silent = false } = {}) => {
    if (!chainClient || connecting || disconnecting || chainPending) return;
    const choice = available.find(item => item.id === id || item.name === id); if (!choice) return;
    if (!silent) reconnectAttempted = true;
    const generation = ++connectionGeneration; connecting = true; pendingWalletId = choice.id; walletError = ''; select.value = choice.id; renderPublicWallet();
    try {
      const result = await chainClient.connect(choice.id, { onlyIfTrusted: silent });
      if (generation !== connectionGeneration) return;
      remember(choice.id); chainHasState = false; lastDisplayedLoot = null; await refreshChain();
      if (!silent) { dialog.close(); if (returnToClaims) { returnToClaims = false; claimGuide.open(); } toast(`${displayName()} connected`, `${chainClient.config.cluster} · ${result.wallet}`); }
    } catch (error) {
      if (generation !== connectionGeneration) return;
      if (!silent) {
        const message = typeof error?.message === 'string' ? error.message : 'Your wallet could not connect. Try again.';
        walletError = /reject|cancel|declin|denied/i.test(message) ? 'Connection cancelled. Choose a wallet when you’re ready.' : message;
      }
    } finally {
      if (generation === connectionGeneration) { connecting = false; pendingWalletId = ''; renderPurchase(); renderPublicWallet(); }
    }
  };
  connect.addEventListener('click', () => connectPublicWallet());
  select.addEventListener('change', () => { walletError = ''; renderPublicWallet(); });
  disconnect.addEventListener('click', async () => {
    if (!chainClient || connecting || disconnecting || chainPending) return;
    disconnecting = true; walletError = ''; remember(null); renderPublicWallet();
    try { await chainClient.disconnect(); await refreshChain(); }
    catch (error) { walletError = error.message || 'Your wallet could not disconnect. Try again.'; }
    finally { disconnecting = false; refreshWalletChoices(); renderPurchase(); }
  });
  window.addEventListener('focus', () => { chainClient?.refreshWallets?.(); refreshWalletChoices(); });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { chainClient?.refreshWallets?.(); refreshWalletChoices(); } });
  renderPublicWallet();
  try {
    const config=await loadPublicConfig(clientMode.configUrl,{origin:location.origin});
    $('#streamflow-rewards-note').hidden=!config.streamflowLocks;
    $('#claim-panel-holder > .claim-panel-intro:not(#streamflow-rewards-note)').hidden=config.streamflowLocks;
    const{createPublicGameClient}=await import('./solana-public-client.mjs');
    chainClient=createPublicGameClient(config,{onWalletChange:()=>{chainHasState=false;chainReady=false;claimResult=null;claimProgress=null;lastFeedEvent=null;lootMessageOverride='';feedback.clear();clearLootPayment();state=createGame(Date.now(),{seeded:false});for(const player of Object.values(state.players)){player.balance=0;player.tokenBalance=0;}state.round.status='connecting';state.round.id=0;lastDisplayedLoot=null;$('#last-transaction').textContent='—';renderAll();refreshChain();},onTransaction:presentPublicTransaction});
    chainClient.subscribeWallets?.(() => refreshWalletChoices());
    refreshWalletChoices();
    $('#chain-network').textContent = `${config.cluster} · ${config.cluster === 'mainnet-beta' ? 'real SOL' : 'test funds'}`; $('#chain-program').textContent = config.programId; $('#chain-mint').textContent = config.piggyMint;
    await refreshChain();
    reconnectReady = true;
    await reconnectRememberedWallet();

  }catch(error){chainFailure=error.message;walletError='Wallet connection is unavailable while the deployment is loading. Try reloading PIGGY.';$('.demo-badge').lastChild.textContent='Unavailable';$('#purchase-outcome').textContent=error.message;renderPurchase();renderPublicWallet();}
}
