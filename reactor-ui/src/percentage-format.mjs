/** Reward-pool ownership must never display a positive position as zero. */
export function formatSharePercent(fraction){
  if(typeof fraction!=='number'||!Number.isFinite(fraction)||fraction<0||fraction>1)throw new RangeError('Reward share must be a finite fraction between zero and one.');
  const percent=fraction*100;
  if(percent===0)return'0.0%';
  if(percent>=0.1)return`${percent.toFixed(1)}%`;
  if(percent<0.000001)return'<0.000001%';
  const decimals=Math.min(6,Math.max(2,Math.ceil(-Math.log10(percent))+1));
  return`${percent.toFixed(decimals).replace(/0+$/,'').replace(/\.$/,'')}%`;
}
