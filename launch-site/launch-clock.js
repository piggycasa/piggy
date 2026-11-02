export function countdownParts(launchAt, now = Date.now()) {
  const target = Date.parse(launchAt);
  if (!Number.isFinite(target) || !Number.isFinite(now)) throw new Error('Invalid launch time');
  const total = Math.max(0, Math.ceil((target - now) / 1000));
  return {reached: now >= target, text: [Math.floor(total / 3600), Math.floor(total % 3600 / 60), total % 60].map(n => String(n).padStart(2, '0')).join(':')};
}

if (typeof document !== 'undefined') {
  const clock = document.querySelector('[data-launch-clock]');
  const label = document.querySelector('[data-launch-label]');
  const date = document.querySelector('[data-launch-date]');
  let config;
  function render() {
    if (!config || !clock) return;
    const result = countdownParts(config.launchAt);
    clock.textContent = result.text;
    label.textContent = result.reached ? 'Scheduled launch time reached' : 'Game launch countdown';
    date.textContent = result.reached ? 'Awaiting launch confirmation' : new Intl.DateTimeFormat('en-GB', {timeZone: config.timeZone, day:'numeric', month:'short', hour:'2-digit', minute:'2-digit', hour12:false}).format(new Date(config.launchAt)) + ' · London';
  }
  async function load() {
    if (!clock) return;
    try {
      const response = await fetch('/launch.json', {cache:'no-store', signal:AbortSignal.timeout(8000)});
      if (!response.ok) throw new Error('Launch schedule unavailable');
      const next = await response.json();
      countdownParts(next.launchAt);
      new Intl.DateTimeFormat('en-GB', {timeZone:next.timeZone});
      config = next;
      render();
    } catch {
      if (!config) {clock.textContent = '—'; label.textContent = 'Launch schedule unavailable'; date.textContent = 'Please refresh shortly';}
    }
  }
  load();
  setInterval(render, 1000);
  setInterval(load, 60000);
  document.addEventListener('visibilitychange', () => {if (!document.hidden) {render(); load();}});
}
