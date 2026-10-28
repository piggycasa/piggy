use borsh::BorshDeserialize;
use solana_program::{
    account_info::AccountInfo,
    msg,
    program::{invoke, invoke_signed},
    program_error::ProgramError,
    program_pack::Pack,
    pubkey::Pubkey,
    system_instruction,
    sysvar::{rent::Rent, Sysvar},
};
use spl_token::state::Account;

use crate::{
    error::GameError,
    processor::{
        security::VerifyType,
        spl_token::{spl_token_init_account, TokenInitializeAccountParams},
        util::account_exists,
    },
    state::{
        GameState, PlayerRoundState, RoundState, StateType, GAME_STATE_SIZE,
        PLAYER_ROUND_STATE_SIZE, ROUND_STATE_SIZE,
    },
};

// --------------------------------------- public

/// Builds seed + verifies + deserializes pda
pub fn deserialize_game_state<'a>(
    game_state_info: &AccountInfo<'a>,
    program_id: &Pubkey,
) -> Result<(GameState, [u8; 8], u8), ProgramError> {
    require_owner(game_state_info, program_id)?;
    let game_state: GameState = GameState::try_from_slice(&game_state_info.data.borrow_mut())?;
    game_state.verify_type()?;
    let game_state_seed = game_state.version.to_le_bytes();
    let game_state_bump = verify_pda_matches(
        &[GAME_STATE_SEED, &game_state_seed],
        program_id,
        game_state_info,
    )?;
    Ok((game_state, game_state_seed, game_state_bump))
}

/// Builds seed + verifies + creates pda
pub fn create_game_state<'a>(
    game_state_info: &AccountInfo<'a>,
    funder_info: &AccountInfo<'a>,
    system_program_info: &AccountInfo<'a>,
    version: u64,
    program_id: &Pubkey,
) -> Result<GameState, ProgramError> {
    let game_state_seed = version.to_le_bytes();
    create_pda_with_space(
        &[GAME_STATE_SEED, &game_state_seed],
        game_state_info,
        GAME_STATE_SIZE,
        program_id,
        funder_info,
        system_program_info,
        program_id,
    )?;
    GameState::try_from_slice(&game_state_info.data.borrow_mut())
        .map_err(|_| GameError::UnpackingFailure.into())
}

/// Builds seed + verifies + deserializes pda
pub fn deserialize_round_state<'a>(
    round_state_info: &AccountInfo<'a>,
    round_id: u64,
    version: u64,
    program_id: &Pubkey,
) -> Result<RoundState, ProgramError> {
    require_owner(round_state_info, program_id)?;
    let round_state: RoundState = RoundState::try_from_slice(&round_state_info.data.borrow_mut())?;
    round_state.verify_type()?;
    let round_bytes = round_id.to_le_bytes();
    let version_bytes = version.to_le_bytes();
    let round_state_seed = &[ROUND_STATE_SEED, &round_bytes, &version_bytes];
    verify_pda_matches(round_state_seed, program_id, round_state_info)?;
    if round_state.round_id != round_id {
        return Err(GameError::WrongAccount.into());
    }
    Ok(round_state)
}

/// Builds seed + verifies + creates pda
pub fn create_round_state<'a>(
    round_state_info: &AccountInfo<'a>,
    funder_info: &AccountInfo<'a>,
    system_program_info: &AccountInfo<'a>,
    round_id: u64,
    version: u64,
    program_id: &Pubkey,
) -> Result<RoundState, ProgramError> {
    let round_bytes = round_id.to_le_bytes();
    let version_bytes = version.to_le_bytes();
    let round_state_seed = &[ROUND_STATE_SEED, &round_bytes, &version_bytes];
    create_pda_with_space(
        round_state_seed,
        round_state_info,
        ROUND_STATE_SIZE,
        program_id,
        funder_info,
        system_program_info,
        program_id,
    )?;
    RoundState::try_from_slice(&round_state_info.data.borrow_mut())
        .map_err(|_| GameError::UnpackingFailure.into())
}

/// Builds seed + verifies + deserializes pda
pub fn deserialize_player_round_state<'a>(
    player_round_state_info: &AccountInfo<'a>,
    player_pk: &Pubkey,
    round_id: u64,
    version: u64,
    program_id: &Pubkey,
) -> Result<PlayerRoundState, ProgramError> {
    require_owner(player_round_state_info, program_id)?;
    let player_round_state: PlayerRoundState =
        PlayerRoundState::try_from_slice(&player_round_state_info.data.borrow_mut())?;
    player_round_state.verify_type()?;
    let round_bytes = round_id.to_le_bytes();
    let version_bytes = version.to_le_bytes();
    let seeds = &[
        PLAYER_ROUND_STATE_SEED,
        player_pk.as_ref(),
        &round_bytes,
        &version_bytes,
    ];
    verify_pda_matches(seeds, program_id, player_round_state_info)?;
    if player_round_state.player_pk != *player_pk || player_round_state.round_id != round_id {
        return Err(GameError::WrongAccount.into());
    }
    Ok(player_round_state)
}

/// Builds seed + verifies + deserializes/creates pda if missing
pub fn deserialize_or_create_player_round_state<'a>(
    player_round_state_info: &AccountInfo<'a>,
    funder_info: &AccountInfo<'a>,
    system_program_info: &AccountInfo<'a>,
    player_pk: &Pubkey,
    round_id: u64,
    version: u64,
    program_id: &Pubkey,
) -> Result<PlayerRoundState, ProgramError> {
    if account_exists(player_round_state_info) {
        deserialize_player_round_state(
            player_round_state_info,
            player_pk,
            round_id,
            version,
            program_id,
        )
    } else {
        let round_bytes = round_id.to_le_bytes();
        let version_bytes = version.to_le_bytes();
        let player_round_state_seed = &[
            PLAYER_ROUND_STATE_SEED,
            player_pk.as_ref(),
            &round_bytes,
            &version_bytes,
        ];
        create_pda_with_space(
            player_round_state_seed,
            player_round_state_info,
            PLAYER_ROUND_STATE_SIZE,
            program_id,
            funder_info,
            system_program_info,
            program_id,
        )?;
        let mut player_round_state: PlayerRoundState =
            PlayerRoundState::try_from_slice(&player_round_state_info.data.borrow_mut())?;
        //initially set the player's public key and round id
        player_round_state.player_pk = *player_pk;
        player_round_state.round_id = round_id;
        player_round_state.TYPE = StateType::PlayerRoundStateTypeV2;
        Ok(player_round_state)
    }
}

/// Builds seed + verifies + deserializes pda
pub fn deserialize_pot<'a>(
    pot_info: &AccountInfo<'a>,
    game_state_info: &AccountInfo<'a>,
    round_id: u64,
    version: u64,
    program_id: &Pubkey,
) -> Result<Account, ProgramError> {
    require_owner(pot_info, &spl_token::id())?;
    let pot = Account::unpack(&pot_info.data.borrow_mut())?;
    if pot.owner != *game_state_info.key {
        return Err(GameError::InvalidOwner.into());
    }
    let round_bytes = round_id.to_le_bytes();
    let version_bytes = version.to_le_bytes();
    let pot_seed = &[POT_SEED, &round_bytes, &version_bytes];
    verify_pda_matches(pot_seed, program_id, pot_info)?;
    let (game, _, _) = deserialize_game_state(game_state_info, program_id)?;
    if pot.mint != game.mint {
        return Err(GameError::MintMatchFailure.into());
    }
    Ok(pot)
}

/// Builds seed + verifies + creates pda
pub fn create_pot<'a>(
    pot_info: &AccountInfo<'a>,
    game_state_info: &AccountInfo<'a>,
    funder_info: &AccountInfo<'a>,
    mint_info: &AccountInfo<'a>,
    rent_info: &AccountInfo<'a>,
    system_program_info: &AccountInfo<'a>,
    token_program_info: &AccountInfo<'a>,
    round_id: u64,
    version: u64,
    program_id: &Pubkey,
) -> Result<Account, ProgramError> {
    let round_bytes = round_id.to_le_bytes();
    let version_bytes = version.to_le_bytes();
    let pot_seed = &[POT_SEED, &round_bytes, &version_bytes];
    create_pda_with_space(
        pot_seed,
        pot_info,
        spl_token::state::Account::get_packed_len(),
        &spl_token::id(),
        funder_info,
        system_program_info,
        program_id,
    )?;
    // initialize + give game_state pda "ownership" over it
    spl_token_init_account(TokenInitializeAccountParams {
        account: pot_info.clone(),
        mint: mint_info.clone(),
        owner: game_state_info.clone(),
        rent: rent_info.clone(),
        token_program: token_program_info.clone(),
    })?;
    Account::unpack(&pot_info.data.borrow_mut()).map_err(|_| GameError::UnpackingFailure.into())
}

// --------------------------------------- private

pub const POT_SEED: &[u8] = b"pot-v2";
pub const GAME_STATE_SEED: &[u8] = b"game-v2";
pub const ROUND_STATE_SEED: &[u8] = b"round-v2";
pub const PLAYER_ROUND_STATE_SEED: &[u8] = b"player-v2";

fn create_pda_with_space<'a>(
    pda_seeds: &[&[u8]],
    pda_info: &AccountInfo<'a>,
    space: usize,
    owner: &Pubkey,
    funder_info: &AccountInfo<'a>,
    system_program_info: &AccountInfo<'a>,
    program_id: &Pubkey,
) -> Result<u8, ProgramError> {
    if !funder_info.is_signer || *system_program_info.key != solana_program::system_program::id() {
        return Err(GameError::MissingSignature.into());
    }
    let bump_seed = verify_pda_matches(pda_seeds, program_id, pda_info)?;
    let bump = [bump_seed];
    let mut full_seeds = pda_seeds.to_vec();
    full_seeds.push(&bump);

    // A predictable PDA can be prefunded by anyone. Top up its rent and allocate
    // the empty system account instead of create_account, which rejects prefunds.
    require_owner(pda_info, &solana_program::system_program::id())?;
    if !pda_info.data_is_empty() {
        return Err(GameError::AlreadyInitialized.into());
    }
    let required = Rent::get()?.minimum_balance(space).max(1);
    let current = pda_info.lamports();
    if current < required {
        invoke(
            &system_instruction::transfer(funder_info.key, pda_info.key, required - current),
            &[
                funder_info.clone(),
                pda_info.clone(),
                system_program_info.clone(),
            ],
        )?;
    }
    invoke_signed(
        &system_instruction::allocate(pda_info.key, space as u64),
        &[pda_info.clone(), system_program_info.clone()],
        &[&full_seeds],
    )?;
    invoke_signed(
        &system_instruction::assign(pda_info.key, owner),
        &[pda_info.clone(), system_program_info.clone()],
        &[&full_seeds],
    )?;

    msg!("pda created");
    Ok(bump_seed)
}

fn verify_pda_matches(
    pda_seeds: &[&[u8]],
    program_id: &Pubkey,
    pda_info: &AccountInfo,
) -> Result<u8, ProgramError> {
    let (pda, bump_seed) = Pubkey::find_program_address(pda_seeds, program_id);
    if pda != *pda_info.key {
        msg!("pda doesnt match: {}, {}", pda, *pda_info.key);
        return Err(GameError::PDAMatchFailure.into());
    }
    Ok(bump_seed)
}

fn require_owner(info: &AccountInfo, owner: &Pubkey) -> Result<(), ProgramError> {
    if info.owner != owner {
        return Err(GameError::InvalidOwner.into());
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use borsh::BorshSerialize;
    #[test]
    fn binary_seeds_separate_decimal_ambiguities_and_full_wallets() {
        let program = Pubkey::new_unique();
        let a = Pubkey::find_program_address(
            &[ROUND_STATE_SEED, &1u64.to_le_bytes(), &23u64.to_le_bytes()],
            &program,
        )
        .0;
        let b = Pubkey::find_program_address(
            &[ROUND_STATE_SEED, &12u64.to_le_bytes(), &3u64.to_le_bytes()],
            &program,
        )
        .0;
        assert_ne!(a, b);
        let first = Pubkey::new_from_array([1; 32]);
        let mut other = [1; 32];
        other[31] = 2;
        let second = Pubkey::new_from_array(other);
        let derive = |pk: &Pubkey| {
            Pubkey::find_program_address(
                &[
                    PLAYER_ROUND_STATE_SEED,
                    pk.as_ref(),
                    &u64::MAX.to_le_bytes(),
                    &u64::MAX.to_le_bytes(),
                ],
                &program,
            )
            .0
        };
        assert_ne!(derive(&first), derive(&second));
    }
    #[test]
    fn player_data_must_match_pda_wallet_and_round() {
        let program = Pubkey::new_unique();
        let player = Pubkey::new_unique();
        let key = Pubkey::find_program_address(
            &[
                PLAYER_ROUND_STATE_SEED,
                player.as_ref(),
                &7u64.to_le_bytes(),
                &1u64.to_le_bytes(),
            ],
            &program,
        )
        .0;
        let mut state =
            PlayerRoundState::try_from_slice(&vec![0; PLAYER_ROUND_STATE_SIZE]).unwrap();
        state.TYPE = StateType::PlayerRoundStateTypeV2;
        state.round_id = 7;
        state.player_pk = Pubkey::new_unique();
        let mut bytes = state.try_to_vec().unwrap();
        let mut lamports = 1;
        let info = AccountInfo::new(
            &key,
            false,
            false,
            &mut lamports,
            &mut bytes,
            &program,
            false,
            0,
        );
        assert_eq!(
            deserialize_player_round_state(&info, &player, 7, 1, &program),
            Err(GameError::WrongAccount.into())
        );
    }
}
