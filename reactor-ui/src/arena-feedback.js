import './arena-feedback.css';
import { formatCompactSol } from './main-money-view.mjs';

const mounted = new WeakMap();

// Numeric event amounts are exact integer lamports (1,000,000,000 = 1 SOL).
// Strings may be preformatted SOL amounts. No state is changed by this module.
function amount(value) {
  if (typeof value === 'number' && Number.isSafeInteger(value) && value >= 0) {
    return { text: formatCompactSol(value), positive: value > 0 };
  }
  if (typeof value === 'string') {
    const text = value.trim().replace(/\s*(?:demo\s+)?SOL\s*$/i, '');
    const numeric = Number(text.replaceAll(',', ''));
    if (text && Number.isFinite(numeric) && numeric >= 0) return { text, positive: numeric > 0 };
  }
  return null;
}

function person(value, fallback) {
  return typeof value === 'string' && value.trim() ? value.trim().slice(0, 72) : fallback;
}

function node(tag, className) {
  const element = document.createElement(tag);
  element.className = className;
  return element;
}

/**
 * One event-driven, nonmodal banner for the arena. Call after a successful
 * purchase or settlement, never from a render/timer loop. Creating it again
 * for the same stage returns the existing controller.
 *
 * purchase({ isYou, playerName, jackpotDelta, rewardDelta, tokenRewardDelta, count, yourKeys, hasKeys, lostCrown })
 * settled({ isYou, winnerName, jackpot })
 * preview() shows an explicitly labelled visual-only jackpot preview.
 * clear() cancels active feedback without changing game state.
 * dispose() removes the banner, effects, timers and motion listener.
 */
export function createArenaFeedback() {
  const stage = document.querySelector('#reactor-stage');
  if (!stage) return { purchase() {}, settled() {}, preview() {}, clear() {}, dispose() {} };
  if (mounted.has(stage)) return mounted.get(stage);

  const banner = node('div', 'arena-feedback');
  banner.setAttribute('role', 'status');
  banner.setAttribute('aria-live', 'polite');
  banner.setAttribute('aria-atomic', 'true');
  const headline = node('div', 'arena-feedback__headline');
  const detail = node('div', 'arena-feedback__detail');
  const changes = node('div', 'arena-feedback__changes');
  banner.append(headline, detail, changes);
  stage.append(banner);

  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  let reduced = media.matches;
  let disposed = false;
  let hideTimer;
  let clearTimer;
  let effectTimer;
  let effect;

  function clearTimers() {
    window.clearTimeout(hideTimer);
    window.clearTimeout(clearTimer);
    window.clearTimeout(effectTimer);
  }

  function clear() {
    clearTimers();
    banner.classList.remove('is-visible');
    banner.removeAttribute('data-tone');
    stage.classList.remove('feedback-active');
    headline.textContent = '';
    detail.textContent = '';
    changes.replaceChildren();
    changes.hidden = true;
    effect?.classList.remove('is-playing');
    effect?.remove();
    effect = undefined;
  }

  function impact(tone, isYou) {
    if (reduced) return;
    const safe = document.querySelector('#safe-art');
    if (!safe) return;
    // The WebGL scene may replace its children during initialization. Remount
    // only our overlay if necessary; never transform or replace its canvas.
    if (!effect || effect.parentElement !== safe) {
      effect?.remove();
      effect = node('div', 'arena-feedback-impact');
      effect.setAttribute('aria-hidden', 'true');
      effect.append(node('i', 'arena-feedback-impact__ring'), node('i', 'arena-feedback-impact__shine'));
      safe.append(effect);
    }
    effect.dataset.tone = tone;
    effect.dataset.force = isYou ? 'strong' : 'soft';
    effect.classList.remove('is-playing');
    void effect.offsetWidth;
    effect.classList.add('is-playing');
    effectTimer = window.setTimeout(() => effect?.classList.remove('is-playing'), tone === 'win' ? 3_600 : 1_400);
  }

  function show({ title, description, deltas, tone, isYou, lifetime }) {
    if (disposed) return;
    clearTimers();
    banner.classList.remove('is-visible');
    headline.textContent = title;
    detail.textContent = description;
    changes.replaceChildren();
    for (const text of deltas) {
      const change = node('span', 'arena-feedback__change');
      change.textContent = text;
      changes.append(change);
    }
    changes.hidden = deltas.length === 0;
    banner.dataset.tone = tone;
    banner.dataset.reduced = String(reduced);
    stage.classList.add('feedback-active');
    void banner.offsetWidth;
    banner.classList.add('is-visible');
    impact(tone, isYou);
    hideTimer = window.setTimeout(() => {
      banner.classList.remove('is-visible');
      stage.classList.remove('feedback-active');
      clearTimer = window.setTimeout(() => {
        headline.textContent = '';
        detail.textContent = '';
        changes.replaceChildren();
      }, reduced ? 0 : 240);
    }, lifetime);
  }

  const onMotionChange = event => {
    reduced = event.matches;
    banner.dataset.reduced = String(reduced);
    if (reduced) effect?.classList.remove('is-playing');
  };
  media.addEventListener('change', onMotionChange);

  const controller = {
    purchase({ isYou = false, playerName, jackpot, jackpotDelta, rewardDelta, tokenRewardDelta, count, yourKeys = 0, shareAfter = 0, hasKeys = false, lostCrown = false } = {}) {
      const increase = amount(jackpotDelta);
      const reward = amount(rewardDelta);
      const tokenReward = amount(tokenRewardDelta);
      const deltas = [];
      if (increase?.positive) deltas.push('Jackpot +' + increase.text + ' SOL');
      if (tokenReward?.positive) deltas.push('Your $PIGGY holder rewards +' + tokenReward.text + ' SOL');
      if (!deltas.length && Number.isSafeInteger(count) && count > 0) deltas.push(count.toLocaleString('en-US') + (count === 1 ? ' key received' : ' keys received'));
      show({
        title: isYou ? 'You are the last buyer.' : 'Another buyer took the lead.',
        description: reward?.positive
          ? isYou ? `Key rewards +${reward.text} SOL. Own buys can return a share too.` : `You keep your keys. Key rewards +${reward.text} SOL.`
          : !hasKeys ? 'Buy round keys to share future key rewards.' : 'Your keys and earned SOL stay yours.',
        deltas,
        tone: 'blue',
        isYou,
        lifetime: isYou ? 5_800 : 4_200,
      });
    },

    settled({ isYou = false, winnerName, jackpot } = {}) {
      const prize = amount(jackpot);
      const hasWinner = isYou || (typeof winnerName === 'string' && winnerName.trim().length > 0);
      show({
        title: hasWinner ? (isYou ? 'Jackpot. You cracked Piggy!' : 'Jackpot for ' + person(winnerName, 'the last feeder') + '!') : 'Round complete',
        description: hasWinner
          ? (prize ? prize.text + (isYou ? ' SOL ready to claim.' : ' SOL awarded.') : 'The jackpot has been awarded.')
          : 'No buyer entered. The pool rolls forward.',
        deltas: [],
        tone: hasWinner ? 'win' : 'quiet',
        isYou,
        lifetime: isYou ? 8_500 : 6_000,
      });
    },

    preview() {
      show({
        title: 'Jackpot preview',
        description: 'Visual preview only. No funds moved.',
        deltas: [],
        tone: 'win',
        isYou: false,
        lifetime: 4_400,
      });
    },

    clear,

    dispose() {
      if (disposed) return;
      clear();
      disposed = true;
      media.removeEventListener('change', onMotionChange);
      banner.remove();
      mounted.delete(stage);
    },
  };
  mounted.set(stage, controller);
  return controller;
}
