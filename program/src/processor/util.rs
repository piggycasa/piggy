use std::str::FromStr;

use solana_program::{
    account_info::AccountInfo, clock::Clock, msg, program_error::ProgramError, pubkey::Pubkey,
    sysvar::Sysvar,
};

#[cfg(feature = "local-test-lottery")]
use crate::processor::rng::pseudo_rng;

use crate::{
    error::GameError,
    instruction::GuardedPurchaseKeysParams,
    state::{GameState, RoundState},
};

/// Check the wallet-approved quote before any funds move. The second check is
/// made against the actual integer curve result after applying the launch cap.
pub fn validate_purchase_guard(
    quote: &GuardedPurchaseKeysParams,
    current_round: u64,
    current_slot: u64,
    received_keys: Option<u128>,
) -> Result<(), ProgramError> {
    if quote.sol_to_be_added == 0
        || quote.sol_to_be_added > u64::MAX as u128
        || quote.minimum_keys == 0
    {
        return Err(GameError::InvalidPurchaseGuard.into());
    }
    if quote.expected_round != current_round || current_slot > quote.expires_at_slot {
        return Err(GameError::StaleQuote.into());
    }
    if received_keys.map_or(false, |received| received < quote.minimum_keys) {
        return Err(GameError::MinimumKeysNotMet.into());
    }
    Ok(())
}

/// Predictable draws are intentionally absent from default builds. A production
/// lottery requires an asynchronous verifiable randomness request/fulfillment flow.
pub fn airdrop_winner(
    player_pk: &Pubkey,
    clock: &Clock,
    airdrop_tracker: u64,
) -> Result<bool, ProgramError> {
    #[cfg(feature = "local-test-lottery")]
    {
        return Ok(pseudo_rng(player_pk, clock)? < airdrop_tracker.min(1000) as u128);
    }
    #[cfg(not(feature = "local-test-lottery"))]
    {
        let _ = (player_pk, clock, airdrop_tracker);
        Ok(false)
    }
}

pub fn account_exists(acc: &AccountInfo) -> bool {
    let does_not_exist = **acc.lamports.borrow() == 0 || acc.data_is_empty();
    !does_not_exist
}

pub fn is_zero(buf: &[u8]) -> bool {
    buf.iter().all(|&x| x == 0)
}

pub trait Empty {
    fn is_empty(&self) -> bool;
}
impl Empty for Pubkey {
    fn is_empty(&self) -> bool {
        is_zero(&self.to_bytes()[..])
    }
}

pub fn time_is_out(round_state: &RoundState) -> Result<bool, ProgramError> {
    let clock = Clock::get()?;
    msg!(
        "round time left (s): {}",
        round_state.end_time.saturating_sub(clock.unix_timestamp)
    );
    Ok(clock.unix_timestamp >= round_state.end_time)
}

pub const MAX_ROUND_SECONDS: i64 = 86_400;
pub fn validate_timing(initial: i64, increment: i64, maximum: i64) -> Result<(), ProgramError> {
    if initial <= 0
        || increment <= 0
        || maximum <= 0
        || initial > maximum
        || maximum > MAX_ROUND_SECONDS
    {
        return Err(GameError::InvalidTiming.into());
    }
    Ok(())
}
/// Cap the remaining window, rather than capping each individual extension.
pub fn capped_round_end(
    now: i64,
    old_end: i64,
    new_keys: u128,
    game: &GameState,
) -> Result<i64, ProgramError> {
    validate_timing(
        game.round_init_time,
        game.round_inc_time_per_key,
        game.round_max_time,
    )?;
    let cap = now
        .checked_add(game.round_max_time)
        .ok_or(GameError::CalculationFailure)?;
    let room = cap.saturating_sub(old_end).max(0) as u128;
    let extension = new_keys
        .saturating_mul(game.round_inc_time_per_key as u128)
        .min(room);
    Ok(old_end
        .min(cap)
        .checked_add(extension as i64)
        .ok_or(GameError::CalculationFailure)?)
}

pub fn load_pk(addr: &str) -> Result<Pubkey, ProgramError> {
    Pubkey::from_str(addr).map_err(|_| GameError::WrongAccount.into())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::state::GAME_STATE_SIZE;
    use borsh::BorshDeserialize;
    #[test]
    fn timer_caps_the_remaining_window_instead_of_each_purchase() {
        let mut game = GameState::try_from_slice(&vec![0; GAME_STATE_SIZE]).unwrap();
        game.round_init_time = 3600;
        game.round_inc_time_per_key = 30;
        game.round_max_time = 86_400;
        assert_eq!(
            capped_round_end(100, 100 + 86_390, 10, &game).unwrap(),
            100 + 86_400
        );
        assert_eq!(capped_round_end(100, 3700, 2, &game).unwrap(), 3760);
        assert_eq!(
            capped_round_end(100, 3700, u128::MAX, &game).unwrap(),
            86500
        );
        assert!(capped_round_end(i64::MAX, i64::MAX, 1, &game).is_err());
    }
    #[test]
    fn malformed_or_unbounded_timing_is_rejected() {
        for (init, inc, max) in [
            (0, 30, 86400),
            (3600, 0, 86400),
            (-1, 1, 1),
            (2, 1, 1),
            (1, 1, 86401),
        ] {
            assert!(validate_timing(init, inc, max).is_err());
        }
        assert!(validate_timing(5, 1, 86400).is_ok());
    }
    #[test]
    fn signed_quote_rejects_curve_movement_instead_of_charging_for_fewer_keys() {
        use crate::math::curve::keys_received;
        let quote = GuardedPurchaseKeysParams {
            sol_to_be_added: 1_000_000_000,
            team: 0,
            minimum_keys: keys_received(0, 1_000_000_000).unwrap(),
            expected_round: 7,
            expires_at_slot: 200,
        };
        let original_keys = keys_received(0, quote.sol_to_be_added).unwrap();
        validate_purchase_guard(&quote, 7, 199, Some(original_keys)).unwrap();
        // Another player funds the curve after this quote was signed. The debit
        // stays the same, but the result no longer meets the wallet's minimum.
        let changed_keys = keys_received(100_000_000_000, quote.sol_to_be_added).unwrap();
        assert!(changed_keys < quote.minimum_keys);
        assert_eq!(
            validate_purchase_guard(&quote, 7, 199, Some(changed_keys)),
            Err(GameError::MinimumKeysNotMet.into())
        );
        // The early launch cap can also lower the effective payment. It must
        // not silently turn a large approved purchase into a smaller key order.
        let capped_keys = keys_received(0, 1_000_000).unwrap();
        assert_eq!(
            validate_purchase_guard(&quote, 7, 199, Some(capped_keys)),
            Err(GameError::MinimumKeysNotMet.into())
        );
    }
    #[test]
    fn signed_quote_has_an_inclusive_expiry_and_cannot_cross_rounds() {
        let mut quote = GuardedPurchaseKeysParams {
            sol_to_be_added: 75_001,
            team: 0,
            minimum_keys: 1,
            expected_round: 7,
            expires_at_slot: 200,
        };
        validate_purchase_guard(&quote, 7, 200, Some(1)).unwrap();
        assert_eq!(
            validate_purchase_guard(&quote, 7, 201, Some(1)),
            Err(GameError::StaleQuote.into())
        );
        assert_eq!(
            validate_purchase_guard(&quote, 8, 199, Some(1)),
            Err(GameError::StaleQuote.into())
        );
        for (payment, minimum) in [(0, 1), (75_001, 0), (u64::MAX as u128 + 1, 1)] {
            quote.sol_to_be_added = payment;
            quote.minimum_keys = minimum;
            assert_eq!(
                validate_purchase_guard(&quote, 7, 199, None),
                Err(GameError::InvalidPurchaseGuard.into())
            );
        }
    }
    #[cfg(not(feature = "local-test-lottery"))]
    #[test]
    fn default_build_never_uses_predictable_draws_even_at_guaranteed_tracker() {
        assert!(!airdrop_winner(&Pubkey::new_unique(), &Clock::default(), 1000).unwrap());
    }
    #[cfg(feature = "local-test-lottery")]
    #[test]
    fn explicit_local_mode_can_force_a_lottery_win() {
        assert!(airdrop_winner(&Pubkey::new_unique(), &Clock::default(), 1000).unwrap());
    }
}
