import '@fontsource/jost/400.css';
import '@fontsource/jost/500.css';
import '@fontsource/archivo-black/400.css';
import './verify-page.css';
import { checkLiveProgram } from './program-verification.mjs';

const tabs = [...document.querySelectorAll('[data-tab]')];
for (const button of tabs) button.addEventListener('click', () => {
  for (const tab of tabs) {
    if (tab === button) tab.setAttribute('aria-current', 'page');
    else tab.removeAttribute('aria-current');
  }
  for (const panel of document.querySelectorAll('[data-panel]')) panel.hidden = panel.dataset.panel !== button.dataset.tab;
});
const button = document.querySelector('#check-program');
const status = document.querySelector('#check-status');
const detail = document.querySelector('#check-detail');
button.addEventListener('click', async () => {
  button.disabled = true;
  status.textContent = 'Reading finalized mainnet accounts…';
  status.dataset.state = 'pending';
  detail.textContent = 'Comparing the executable and reading its upgrade authority.';
  document.querySelector('#live-authority').textContent = 'Reading from Solana…';
  document.querySelector('#authority-state').textContent = '— checking';
  try {
    const response = await fetch('/verification/release.json', { cache: 'no-store', signal: AbortSignal.timeout(10_000) });
    if (!response.ok) throw new Error('The published release manifest is unavailable.');
    const result = await checkLiveProgram({ release: await response.json() });
    status.textContent = 'Deployed code matches the published release.';
    status.dataset.state = 'match';
    detail.textContent = `${result.bytes.toLocaleString()} executable bytes checked at finalized slot ${result.checkedSlot.toLocaleString()}. Checked ${new Date(result.checkedAt).toLocaleString()}. This is not an audit or independent source-build verification.`;
    document.querySelector('#live-authority').textContent = result.upgradeAuthority ?? 'None. The loader reports this program as immutable.';
    document.querySelector('#authority-state').textContent = result.upgradeAuthority ? result.authorityMatchesObservation ? '— upgrade key retained' : '— changed since the recorded release' : '— no upgrade key';
  } catch (error) {
    status.textContent = 'Verification could not be completed.';
    status.dataset.state = 'error';
    detail.textContent = error instanceof Error ? error.message : 'The live check failed. Try again later.';
    document.querySelector('#live-authority').textContent = 'Not verified in this check.';
    document.querySelector('#authority-state').textContent = '— unknown';
  } finally { button.disabled = false; }
});
