//! Carries the jackpot rollover and unawarded lottery reserve without changing
//! either bucket's purpose. Lifetime allocation counters remain conserved.
use crate::{
    error::GameError,
    math::common::{TryAdd, TrySub},
    state::RoundState,
};
use solana_program::program_error::ProgramError;

pub fn carry_round_funds(
    previous: &mut RoundState,
    next: &mut RoundState,
) -> Result<u128, ProgramError> {
    if !previous.ended {
        return Err(GameError::NotYetEnded.into());
    }
    let jackpot = previous
        .accum_next_round_share
        .try_sub(previous.withdrawn_next_round)?;
    let lottery = previous.accum_airdrop_share;
    let total = jackpot.try_add(lottery)?;
    // Calculate all fallible values before changing either account's state.
    let next_gross = next.accum_sol_pot.try_add(total)?;
    let next_playable = next.still_in_play.try_add(jackpot)?;
    let next_lottery = next.accum_airdrop_share.try_add(lottery)?;
    let withdrawn = previous.withdrawn_next_round.try_add(jackpot)?;
    let carried = previous.accum_airdrop_carried.try_add(lottery)?;
    next.accum_sol_pot = next_gross;
    next.still_in_play = next_playable;
    next.accum_airdrop_share = next_lottery;
    previous.withdrawn_next_round = withdrawn;
    previous.accum_airdrop_carried = carried;
    previous.accum_airdrop_share = 0;
    Ok(total)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::{processor::security::verify_round_state, state::ROUND_STATE_SIZE};
    use borsh::BorshDeserialize;
    fn round() -> RoundState {
        RoundState::try_from_slice(&vec![0; ROUND_STATE_SIZE]).unwrap()
    }
    #[test]
    fn carry_preserves_separate_reserves_and_cannot_sweep_twice() {
        let mut prev = round();
        let mut next = round();
        prev.ended = true;
        prev.accum_sol_pot = 1000;
        prev.accum_next_round_share = 400;
        prev.accum_airdrop_share = 100;
        prev.accum_community_share = 500;
        assert_eq!(carry_round_funds(&mut prev, &mut next).unwrap(), 500);
        assert_eq!(
            (
                next.accum_sol_pot,
                next.still_in_play,
                next.accum_airdrop_share
            ),
            (500, 400, 100)
        );
        assert_eq!(
            (
                prev.withdrawn_next_round,
                prev.accum_airdrop_carried,
                prev.accum_airdrop_share
            ),
            (400, 100, 0)
        );
        verify_round_state(&prev).unwrap();
        verify_round_state(&next).unwrap();
        let before = next.clone();
        assert_eq!(carry_round_funds(&mut prev, &mut next).unwrap(), 0);
        assert_eq!(next, before);
        verify_round_state(&prev).unwrap();
        verify_round_state(&next).unwrap();
    }
    #[test]
    fn open_round_and_invalid_withdrawal_history_cannot_roll_over() {
        let mut prev = round();
        let mut next = round();
        assert_eq!(
            carry_round_funds(&mut prev, &mut next),
            Err(GameError::NotYetEnded.into())
        );
        prev.ended = true;
        prev.withdrawn_next_round = 1;
        let before = (prev.clone(), next.clone());
        assert!(carry_round_funds(&mut prev, &mut next).is_err());
        assert_eq!((prev, next), before);
    }
}
