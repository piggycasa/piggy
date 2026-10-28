use std::convert::TryInto;

use solana_program::{clock::Clock, program_error::ProgramError, pubkey::Pubkey};

use crate::math::common::{TryAdd, TryRem};

/// Generates a pseudo-random number in the [0,1000) range.
/// (!) NOT A REAL RANDOM NUMBER GENERATOR
///     Production use requires a verifiable randomness oracle and asynchronous settlement.
///     This rng is predictable and is purely used for demonstration purposes.
///     In fact the original Fomo3D protocol has a security vulnerability due to using an on-chain rng -
///     https://www.reddit.com/r/ethereum/comments/916xni/how_to_pwn_fomo3d_a_beginners_guide/
pub fn pseudo_rng(player_pk: &Pubkey, clock: &Clock) -> Result<u128, ProgramError> {
    let mut data = vec![];

    let local = player_pk.to_bytes();
    let temporal = (clock.unix_timestamp as u64)
        .try_add(clock.epoch)?
        .try_add(clock.slot)?
        .try_add(clock.epoch_start_timestamp as u64)?
        .try_add(clock.leader_schedule_epoch)?;

    data.extend_from_slice(&local);
    data.extend_from_slice(&temporal.to_le_bytes());

    let hash = solana_program::keccak::hash(&data).to_bytes();
    let short_hash = &hash[..16];
    let hash_int = u128::from_le_bytes(short_hash.try_into().unwrap());
    hash_int.try_rem(1000)
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn local_rng_is_bounded_and_explicitly_predictable() {
        let clock = Clock {
            slot: 1,
            epoch_start_timestamp: 1,
            epoch: 1,
            leader_schedule_epoch: 1,
            unix_timestamp: 1,
        };
        let pk = Pubkey::new_unique();
        let result = pseudo_rng(&pk, &clock).unwrap();
        assert!(result < 1000);
        assert_eq!(result, pseudo_rng(&pk, &clock).unwrap());
    }
}
