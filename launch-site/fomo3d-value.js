// ETH remains the historical denomination; USD is only a current-price estimate.
const value = document.querySelector('[data-historical-value]');
const details = document.querySelector('[data-price-details]');
const jackpotEth = 10469;
let loading = false;

async function refreshValue() {
  if (!value || loading || document.hidden) return;
  loading = true;
  try {
    const response = await fetch('https://api.coinbase.com/v2/prices/ETH-USD/spot', {
      cache: 'no-store', signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw new Error('Price unavailable');
    const { data } = await response.json();
    const price = Number(data?.amount);
    if (data?.base !== 'ETH' || data?.currency !== 'USD' || !Number.isFinite(price) || price <= 0) {
      throw new Error('Invalid ETH/USD quote');
    }
    const usd = new Intl.NumberFormat('en-US', {
      style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1,
    }).format(jackpotEth * price);
    const checked = new Date().toLocaleString('en-GB', { timeZone: 'UTC' });
    value.textContent = `≈ ${usd} at today’s ETH price`;
    value.title = `10,469 ETH × $${price.toLocaleString('en-US')} per ETH. Checked ${checked} UTC. Source: Coinbase.`;
    if (details) details.textContent = `USD estimate: 10,469 ETH × the current Coinbase ETH/USD spot price. Checked ${checked} UTC. This is a valuation, not evidence of a sale.`;
  } catch {
    value.textContent = 'Current USD estimate unavailable';
    value.removeAttribute('title');
    if (details) details.textContent = 'The current ETH/USD quote is unavailable. The historical jackpot remains 10,469 ETH.';
  } finally {
    loading = false;
  }
}

refreshValue();
setInterval(refreshValue, 60000);
document.addEventListener('visibilitychange', refreshValue);
