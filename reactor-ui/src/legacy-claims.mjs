/** Fixed pre-launch claim route. This never authorizes entries or operator actions. */
export const TEST_CLAIMS_PATH = '/test-claims/';
export const TEST_CONFIG_PATH = '/piggy-test-config.json';
export function isTestClaimsPath(pathname) { return pathname === '/test-claims' || pathname === TEST_CLAIMS_PATH; }
export function assertRouteActionAllowed(claimOnly, action) {
  if (claimOnly && action !== 'claimGame' && action !== 'claimHolder') {
    throw new Error('The test instance is closed to new entries here. Existing game and token-holder rewards can still be claimed.');
  }
}
export function inactivePrizeScene() {
  return { setCoins() {}, deposit() {}, setEnded() {}, cancelPreview() {}, previewPayout() { return false; }, dispose() {} };
}
