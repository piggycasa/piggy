use solana_program::{
    account_info::AccountInfo, entrypoint::ProgramResult, msg, pubkey::Pubkey, rent::Rent,
    sysvar::Sysvar,
};

use crate::{
    error::GameError,
    math::common::TryAdd,
    processor::util::load_pk,
    state::{
        GameState, PlayerRoundState, RoundState,
        StateType::{GameStateTypeV2, PlayerRoundStateTypeV2, RoundStateTypeV2},
    },
};

// --------------------------------------- state

/// Checks whether actual funds in the pot equate to total of all the parties' shares.
/// NOTE: considered comparing vs actual money in pot but problems arise:
///  - what if someone randommly sends money to pot
///  - what if one of the players withdraws their affiliate share
///    (we would have to scape every user account's state to adjust expectations)
pub fn verify_round_state(round_state: &RoundState) -> ProgramResult {
    let actual_money_in_pot = round_state.accum_sol_pot;
    let supposed_money_in_pot = round_state
        .accum_community_share
        .try_add(round_state.accum_airdrop_share)?
        .try_add(round_state.accum_next_round_share)?
        .try_add(round_state.accum_aff_share)?
        .try_add(round_state.accum_p3d_share)?
        .try_add(round_state.accum_f3d_share)?
        .try_add(round_state.still_in_play)?
        .try_add(round_state.final_prize_share)?
        .try_add(round_state.airdrop_awarded)?
        .try_add(round_state.accum_airdrop_carried)?;
    if actual_money_in_pot != supposed_money_in_pot {
        return Err(GameError::AccountingInvariant.into());
    }
    Ok(())
}

pub trait VerifyType {
    fn verify_type(&self) -> ProgramResult;
}
impl VerifyType for GameState {
    fn verify_type(&self) -> ProgramResult {
        if self.TYPE != GameStateTypeV2 {
            return Err(GameError::InvalidStateType.into());
        }
        Ok(())
    }
}
impl VerifyType for RoundState {
    fn verify_type(&self) -> ProgramResult {
        if self.TYPE != RoundStateTypeV2 {
            return Err(GameError::InvalidStateType.into());
        }
        Ok(())
    }
}
impl VerifyType for PlayerRoundState {
    fn verify_type(&self) -> ProgramResult {
        if self.TYPE != PlayerRoundStateTypeV2 {
            return Err(GameError::InvalidStateType.into());
        }
        Ok(())
    }
}

// --------------------------------------- accounts

pub enum Owner {
    SystemProgram,
    TokenProgram,
    NativeLoader,
    ExecutableTokenProgram,
    Sysvar,
    Other(Pubkey),
    None,
}

pub fn verify_account_ownership(
    accounts: &[AccountInfo],
    expected_owners: &[Owner],
) -> ProgramResult {
    if accounts.len() != expected_owners.len() {
        return Err(GameError::InvalidAccountCount.into());
    }
    for (i, account) in accounts.iter().enumerate() {
        let expected_owner = match &expected_owners[i] {
            Owner::SystemProgram => solana_program::system_program::id(),
            Owner::TokenProgram => spl_token::id(),
            Owner::NativeLoader => load_pk("NativeLoader1111111111111111111111111111111")?,
            Owner::ExecutableTokenProgram => {
                // Tokenkeg is deployed under different supported loaders across
                // validator versions. Its canonical ID and executability are
                // the CPI trust boundary, not one historical loader owner.
                verify_token_program(account)?;
                continue;
            }
            Owner::Sysvar => load_pk("Sysvar1111111111111111111111111111111111111")?,
            Owner::Other(pk) => *pk,
            Owner::None => {
                //no need to check owner for this account
                continue;
            }
        };

        if *account.owner != expected_owner {
            msg!(
                "Account {} is expected to be owned by {}, but is actually owned by {}",
                account.key,
                expected_owner,
                account.owner,
            );
            return Err(GameError::InvalidOwner.into());
        }
    }
    Ok(())
}

pub fn verify_is_signer(account: &AccountInfo) -> ProgramResult {
    if !account.is_signer {
        return Err(GameError::MissingSignature.into());
    }
    Ok(())
}

pub fn verify_account_count(accounts: &[AccountInfo], min: usize, max: usize) -> ProgramResult {
    if accounts.len() < min || accounts.len() > max {
        return Err(GameError::InvalidAccountCount.into());
    }
    Ok(())
}

pub fn verify_rent_exempt(accounts: &[&AccountInfo]) -> ProgramResult {
    let rent = Rent::get()?;
    for account_info in accounts {
        if !rent.is_exempt(account_info.lamports(), account_info.data_len()) {
            return Err(GameError::NotRentExempt.into());
        }
    }
    Ok(())
}

// --------------------------------------- CPI

pub fn verify_token_program(token_program: &AccountInfo) -> ProgramResult {
    if token_program.key != &spl_token::id() || !token_program.executable {
        return Err(GameError::InvalidTokenProgram.into());
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::state::{GAME_STATE_SIZE, PLAYER_ROUND_STATE_SIZE, ROUND_STATE_SIZE};
    use borsh::{BorshDeserialize, BorshSerialize};
    #[test]
    fn canonical_executable_token_program_accepts_current_and_legacy_loaders() {
        let key = spl_token::id();
        let mut lamports = 1;
        let mut data = [];
        for owner in [
            solana_program::bpf_loader::id(),
            solana_program::bpf_loader_upgradeable::id(),
        ] {
            let info = AccountInfo::new(
                &key,
                false,
                false,
                &mut lamports,
                &mut data,
                &owner,
                true,
                0,
            );
            verify_account_ownership(&[info.clone()], &[Owner::ExecutableTokenProgram]).unwrap();
            verify_token_program(&info).unwrap();
        }
        let owner = solana_program::bpf_loader_upgradeable::id();
        let info = AccountInfo::new(
            &key,
            false,
            false,
            &mut lamports,
            &mut data,
            &owner,
            false,
            0,
        );
        assert_eq!(
            verify_token_program(&info),
            Err(GameError::InvalidTokenProgram.into())
        );
        let wrong = Pubkey::new_unique();
        let info = AccountInfo::new(
            &wrong,
            false,
            false,
            &mut lamports,
            &mut data,
            &owner,
            true,
            0,
        );
        assert_eq!(
            verify_account_ownership(&[info], &[Owner::ExecutableTokenProgram]),
            Err(GameError::InvalidTokenProgram.into())
        );
    }
    #[test]
    fn layouts_are_exact_and_legacy_tags_are_rejected() {
        let mut g = GameState::try_from_slice(&vec![0; GAME_STATE_SIZE]).unwrap();
        let mut r = RoundState::try_from_slice(&vec![0; ROUND_STATE_SIZE]).unwrap();
        let mut p = PlayerRoundState::try_from_slice(&vec![0; PLAYER_ROUND_STATE_SIZE]).unwrap();
        assert!(g.verify_type().is_err());
        assert!(r.verify_type().is_err());
        assert!(p.verify_type().is_err());
        g.TYPE = GameStateTypeV2;
        r.TYPE = RoundStateTypeV2;
        p.TYPE = PlayerRoundStateTypeV2;
        assert_eq!(
            (
                g.try_to_vec().unwrap().len(),
                r.try_to_vec().unwrap().len(),
                p.try_to_vec().unwrap().len()
            ),
            (169, 403, 233)
        );
        assert!(g.verify_type().is_ok() && r.verify_type().is_ok() && p.verify_type().is_ok());
    }
    #[test]
    fn lottery_awards_and_rollover_remain_in_conservation_equation() {
        let mut r = RoundState::try_from_slice(&vec![0; ROUND_STATE_SIZE]).unwrap();
        r.accum_sol_pot = 1000;
        r.accum_airdrop_share = 1000;
        assert!(verify_round_state(&r).is_ok());
        r.accum_airdrop_share -= 250;
        r.airdrop_awarded += 250;
        assert!(verify_round_state(&r).is_ok());
        r.airdrop_awarded = 0;
        assert!(verify_round_state(&r).is_err());
        r.accum_airdrop_share = 0;
        r.accum_sol_pot = 1000;
        r.still_in_play = 1000;
        assert!(verify_round_state(&r).is_ok());
        r.still_in_play = 0;
        r.accum_next_round_share = 1000;
        r.ended = true;
        assert!(verify_round_state(&r).is_ok());
    }
    #[test]
    fn unexpected_account_count_returns_error_without_index_panic() {
        let key = Pubkey::new_unique();
        let owner = Pubkey::new_unique();
        let mut lamports = 1;
        let mut data = [];
        let info = AccountInfo::new(
            &key,
            false,
            false,
            &mut lamports,
            &mut data,
            &owner,
            false,
            0,
        );
        assert_eq!(
            verify_account_ownership(&[info], &[]),
            Err(GameError::InvalidAccountCount.into())
        );
    }
}
