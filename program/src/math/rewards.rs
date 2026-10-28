//! V2 scalable key dividends. Checkpoint before changing a player's key balance;
//! new keys then share only allocations made after their purchase.
use crate::{
    error::GameError,
    math::precise::U256,
    state::{PlayerRoundState, RoundState},
};
use solana_program::program_error::ProgramError;

pub const REWARD_SCALE: u128 = 1_000_000_000_000_000_000;
fn narrow(value: U256) -> Result<u128, ProgramError> {
    if value > U256::from(u128::MAX) {
        return Err(GameError::CalculationFailure.into());
    }
    Ok(value.as_u128())
}
pub fn allocate_key_rewards(round: &mut RoundState, amount: u128) -> Result<(), ProgramError> {
    if amount == 0 {
        return Ok(());
    }
    if round.accum_keys == 0 {
        return Err(GameError::AccountingInvariant.into());
    }
    let numerator = U256::from(amount)
        .checked_mul(U256::from(REWARD_SCALE))
        .and_then(|x| x.checked_add(U256::from(round.reward_remainder)))
        .ok_or(GameError::CalculationFailure)?;
    let keys = U256::from(round.accum_keys);
    let increment = narrow(numerator / keys)?;
    round.reward_per_key = round
        .reward_per_key
        .checked_add(increment)
        .ok_or(GameError::CalculationFailure)?;
    round.reward_remainder = narrow(numerator % keys)?;
    Ok(())
}
pub fn checkpoint_key_rewards(
    player: &mut PlayerRoundState,
    round: &RoundState,
) -> Result<(), ProgramError> {
    let delta = round
        .reward_per_key
        .checked_sub(player.reward_index)
        .ok_or(GameError::AccountingInvariant)?;
    let numerator = U256::from(player.accum_keys)
        .checked_mul(U256::from(delta))
        .and_then(|x| x.checked_add(U256::from(player.reward_remainder)))
        .ok_or(GameError::CalculationFailure)?;
    let scale = U256::from(REWARD_SCALE);
    player.accum_f3d = player
        .accum_f3d
        .checked_add(narrow(numerator / scale)?)
        .ok_or(GameError::CalculationFailure)?;
    player.reward_remainder = narrow(numerator % scale)?;
    player.reward_index = round.reward_per_key;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::state::{PLAYER_ROUND_STATE_SIZE, ROUND_STATE_SIZE};
    use borsh::BorshDeserialize;
    use proptest::prelude::*;
    fn round() -> RoundState {
        RoundState::try_from_slice(&vec![0; ROUND_STATE_SIZE]).unwrap()
    }
    fn player() -> PlayerRoundState {
        PlayerRoundState::try_from_slice(&vec![0; PLAYER_ROUND_STATE_SIZE]).unwrap()
    }
    #[test]
    fn later_keys_do_not_steal_earlier_dividends_and_claims_do_not_erase_history() {
        let mut r = round();
        let mut a = player();
        let mut b = player();
        a.accum_keys = 1;
        r.accum_keys = 1;
        allocate_key_rewards(&mut r, 100).unwrap();
        checkpoint_key_rewards(&mut b, &r).unwrap();
        b.accum_keys = 9;
        r.accum_keys = 10;
        allocate_key_rewards(&mut r, 100).unwrap();
        checkpoint_key_rewards(&mut a, &r).unwrap();
        checkpoint_key_rewards(&mut b, &r).unwrap();
        assert_eq!((a.accum_f3d, b.accum_f3d), (110, 90));
        a.withdrawn_f3d = 110;
        checkpoint_key_rewards(&mut a, &r).unwrap();
        assert_eq!(a.accum_f3d, 110);
        assert_eq!(a.accum_f3d - a.withdrawn_f3d, 0);
        // The same holder buying more preserves old earnings; their new keys only share the next allocation.
        checkpoint_key_rewards(&mut a, &r).unwrap();
        a.accum_keys += 10;
        r.accum_keys += 10;
        allocate_key_rewards(&mut r, 100).unwrap();
        checkpoint_key_rewards(&mut a, &r).unwrap();
        assert_eq!(a.accum_f3d, 165);
    }
    #[test]
    fn repeated_small_allocations_carry_dust_and_never_overpay() {
        let mut r = round();
        let mut a = player();
        let mut b = player();
        r.accum_keys = 3;
        a.accum_keys = 1;
        b.accum_keys = 2;
        for _ in 0..300 {
            allocate_key_rewards(&mut r, 1).unwrap();
            checkpoint_key_rewards(&mut a, &r).unwrap();
        }
        checkpoint_key_rewards(&mut b, &r).unwrap();
        assert_eq!((a.accum_f3d, b.accum_f3d), (100, 200));
        assert_eq!(
            a.reward_remainder + b.reward_remainder + r.reward_remainder,
            0
        );
    }
    #[test]
    fn no_divide_by_zero_or_wrapping_at_large_values() {
        let mut r = round();
        assert!(allocate_key_rewards(&mut r, 1).is_err());
        r.accum_keys = 11_313_228_509;
        let mut p = player();
        p.accum_keys = r.accum_keys;
        allocate_key_rewards(&mut r, 10_000_000_000_000_000_000).unwrap();
        checkpoint_key_rewards(&mut p, &r).unwrap();
        assert!(p.accum_f3d <= 10_000_000_000_000_000_000);
        assert!(10_000_000_000_000_000_000 - p.accum_f3d <= 1);
    }
    proptest! {
        #[test]
        fn changing_key_supply_and_interleaved_claims_never_overdraw_dividends(
            steps in prop::collection::vec((0usize..4, 1u128..100_000, 0u128..1_000_000), 1..100)
        ) {
            let mut r = round();
            let mut players = vec![player(); 4];
            let mut funded = 0u128;
            let mut withdrawn = 0u128;
            for (step, (buyer, added_keys, allocation)) in steps.into_iter().enumerate() {
                checkpoint_key_rewards(&mut players[buyer], &r).unwrap();
                players[buyer].accum_keys += added_keys;
                r.accum_keys += added_keys;
                allocate_key_rewards(&mut r, allocation).unwrap();
                funded += allocation;
                let claimant = (buyer + step) % players.len();
                checkpoint_key_rewards(&mut players[claimant], &r).unwrap();
                let claim = players[claimant].accum_f3d - players[claimant].withdrawn_f3d;
                withdrawn += claim;
                players[claimant].withdrawn_f3d += claim;
                prop_assert!(withdrawn <= funded);
            }
            let mut earned = 0u128;
            for p in &mut players {
                checkpoint_key_rewards(p, &r).unwrap();
                prop_assert!(p.withdrawn_f3d <= p.accum_f3d);
                earned += p.accum_f3d;
            }
            prop_assert!(earned <= funded);
            // Only terminal sub-lamport amounts may remain unclaimable.
            prop_assert!(funded - earned <= players.len() as u128);
        }
    }
}
