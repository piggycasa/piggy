/** Reviewed timing profiles. Pricing and payout rules are independent of these settings. */
export const ORIGINAL_TIMING = Object.freeze({initialSeconds: 3600, incrementSeconds: 30, maxSeconds: 86400});
export const PIGGY_TIMING = Object.freeze({initialSeconds: 300, incrementSeconds: 30, maxSeconds: 600});

export function reviewedGameTiming(value = ORIGINAL_TIMING) {
  const fields = ['initialSeconds', 'incrementSeconds', 'maxSeconds'];
  if (!value || ![ORIGINAL_TIMING, PIGGY_TIMING].some(profile => fields.every(key => value[key] === profile[key]))) {
    throw new Error('Game timing must match an explicitly reviewed original or PIGGY profile.');
  }
  return Object.fromEntries(fields.map(key => [key, value[key]]));
}
