const LAMPORTS_PER_SOL = 1_000_000_000;
const wholeFormat = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });

/**
 * Display an exact, nonnegative integer lamport amount as SOL.
 * Keeps every lamport, with at least two decimal places and no exponent notation.
 */
export function formatSol(lamports) {
  if (typeof lamports !== 'number') throw new TypeError('SOL amounts must be numeric integer lamports.');
  if (!Number.isSafeInteger(lamports) || lamports < 0) {
    throw new RangeError('SOL amounts must be nonnegative safe integer lamports.');
  }

  const whole = Math.floor(lamports / LAMPORTS_PER_SOL);
  const remainder = lamports % LAMPORTS_PER_SOL;
  const fraction = String(remainder).padStart(9, '0').replace(/0+$/, '').padEnd(2, '0');
  return `${wholeFormat.format(whole)}.${fraction}`;
}
