const expectedProgram = 'BVqivL3X8JvuaNgiVAZb9WitRnT2LYGPLvdm3tD8a6Ph';
const expectedMint = 'ohDvYwXKGneAyUGDpjB7NgGPbL27Zf9NPAZtftAepig';
let polling = false;
async function checkLaunch() {
  if (polling || document.hidden) return;
  polling = true;
  try {
    const response = await fetch('/launch-status', {cache:'no-store',signal:AbortSignal.timeout(8000)});
    if (!response.ok) return;
    const state = await response.json();
    if (state.programId !== expectedProgram || state.piggyMint !== expectedMint) return;
    const status = document.querySelector('#mint-status');
    if (status && ['waiting-for-time','starting-operators','live'].includes(state.status)) status.textContent = 'Token verified';
    if (state.ready === true && state.status === 'live') {
      const info = document.querySelector('[data-game-launch-status]');
      if (info) info.textContent = 'The game is live. The first round and its operators have been confirmed.';
      if (document.body.dataset.autoLaunch === 'landing') location.replace('/play/');
    }
  } catch {
    // An unavailable status service cannot announce or open a game.
  } finally { polling = false; }
}
checkLaunch();
setInterval(checkLaunch, 3000);
document.addEventListener('visibilitychange', checkLaunch);
