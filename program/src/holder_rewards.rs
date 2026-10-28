//! New PIGGY extension, not part of the original Solana Fomo3D implementation.
//!
//! A creator-authorized publisher reads real eligibility-mint balances off chain,
//! aggregates owners and publishes a Merkle entitlement root. The program trusts
//! that snapshot/allocation, but independently enforces funded reservations,
//! signed wallet ownership, domain-bound proofs and one receipt per wallet/epoch.
//! No staking, arbitrary vault withdrawal, epoch cancellation or expiry exists.

use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::AccountInfo,
    clock::Clock,
    entrypoint::ProgramResult,
    keccak,
    program::{invoke, invoke_signed},
    program_error::ProgramError,
    program_option::COption,
    program_pack::Pack,
    pubkey::Pubkey,
    rent::Rent,
    system_instruction, system_program,
    sysvar::{self, Sysvar},
};
use spl_token::state::{Account as TokenAccount, AccountState, Mint};
use spl_token_2022::{
    extension::{AccountType, BaseStateWithExtensions, StateWithExtensions},
    state::Mint as Token2022Mint,
};

use crate::{
    instruction::{
        HolderClaimParams, HolderInitializeParams, HolderPublishParams, HolderPublisherParams,
    },
    processor::pda::deserialize_game_state,
    state::GameState,
};

pub const CONFIG_SEED: &[u8] = b"holder-config";
pub const VAULT_SEED: &[u8] = b"holder-vault";
pub const EPOCH_SEED: &[u8] = b"holder-epoch";
pub const CLAIM_SEED: &[u8] = b"holder-claim";
pub const LEAF_DOMAIN: &[u8] = b"PIGGY_HOLDER_REWARDS_V1";
pub const NODE_DOMAIN: &[u8] = b"PIGGY_HOLDER_NODE_V1";
pub const CONFIG_TAG: [u8; 8] = *b"PHCFG001";
pub const EPOCH_TAG: [u8; 8] = *b"PHEPO001";
pub const CLAIM_TAG: [u8; 8] = *b"PHCLM001";
pub const CONFIG_SIZE: usize = 201;
pub const EPOCH_SIZE: usize = 137;
pub const CLAIM_SIZE: usize = 81;
pub const MAX_PROOF_DEPTH: usize = 32;

#[derive(BorshSerialize, BorshDeserialize, Clone, Debug, PartialEq)]
pub struct HolderConfig {
    pub tag: [u8; 8],
    pub game: Pubkey,
    pub publisher: Pubkey,
    pub eligibility_mint: Pubkey,
    pub payment_mint: Pubkey,
    pub vault: Pubkey,
    pub reserved_amount: u64,
    pub next_epoch: u64,
    pub total_published: u64,
    pub total_claimed: u64,
    pub bump: u8,
}

#[derive(BorshSerialize, BorshDeserialize, Clone, Debug, PartialEq)]
pub struct HolderEpoch {
    pub tag: [u8; 8],
    pub config: Pubkey,
    pub game: Pubkey,
    pub epoch: u64,
    pub snapshot_slot: u64,
    pub merkle_root: [u8; 32],
    pub total_amount: u64,
    pub claimed_amount: u64,
    pub bump: u8,
}

#[derive(BorshSerialize, BorshDeserialize, Clone, Debug, PartialEq)]
pub struct HolderClaimReceipt {
    pub tag: [u8; 8],
    pub epoch_account: Pubkey,
    pub wallet: Pubkey,
    pub amount: u64,
    pub bump: u8,
}

/// Extension error codes are separate from the unchanged original error order.
#[repr(u32)]
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum HolderError {
    InvalidAccount = 1000,
    MissingSignature = 1001,
    InvalidAuthority = 1002,
    InvalidMint = 1003,
    AlreadyInitialized = 1004,
    AlreadyClaimed = 1005,
    InvalidProof = 1006,
    InsufficientUnreservedFunds = 1007,
    EpochBudgetExceeded = 1008,
    ArithmeticOverflow = 1009,
    InvalidEpoch = 1010,
    InvalidSnapshotSlot = 1011,
    InvalidAmount = 1012,
    WrongOwner = 1013,
    InvalidAccountCount = 1014,
    InvalidState = 1015,
}

impl From<HolderError> for ProgramError {
    fn from(error: HolderError) -> Self {
        ProgramError::Custom(error as u32)
    }
}

pub fn config_address(program_id: &Pubkey, game: &Pubkey) -> (Pubkey, u8) {
    Pubkey::find_program_address(&[CONFIG_SEED, game.as_ref()], program_id)
}

pub fn vault_address(program_id: &Pubkey, game: &Pubkey) -> (Pubkey, u8) {
    Pubkey::find_program_address(&[VAULT_SEED, game.as_ref()], program_id)
}

pub fn epoch_address(program_id: &Pubkey, config: &Pubkey, epoch: u64) -> (Pubkey, u8) {
    Pubkey::find_program_address(
        &[EPOCH_SEED, config.as_ref(), &epoch.to_le_bytes()],
        program_id,
    )
}

pub fn claim_address(program_id: &Pubkey, epoch: &Pubkey, wallet: &Pubkey) -> (Pubkey, u8) {
    Pubkey::find_program_address(&[CLAIM_SEED, epoch.as_ref(), wallet.as_ref()], program_id)
}

pub fn holder_leaf(
    program_id: &Pubkey,
    game: &Pubkey,
    epoch: u64,
    wallet: &Pubkey,
    amount: u64,
) -> [u8; 32] {
    keccak::hashv(&[
        LEAF_DOMAIN,
        program_id.as_ref(),
        game.as_ref(),
        &epoch.to_le_bytes(),
        wallet.as_ref(),
        &amount.to_le_bytes(),
    ])
    .to_bytes()
}

pub fn holder_node(a: &[u8; 32], b: &[u8; 32]) -> [u8; 32] {
    let (left, right) = if a <= b { (a, b) } else { (b, a) };
    keccak::hashv(&[NODE_DOMAIN, left, right]).to_bytes()
}

pub fn verify_holder_proof(leaf: [u8; 32], proof: &[[u8; 32]], root: &[u8; 32]) -> bool {
    if proof.len() > MAX_PROOF_DEPTH {
        return false;
    }
    let computed = proof
        .iter()
        .fold(leaf, |hash, sibling| holder_node(&hash, sibling));
    &computed == root
}

fn count(accounts: &[AccountInfo], expected: usize) -> ProgramResult {
    if accounts.len() != expected {
        return Err(HolderError::InvalidAccountCount.into());
    }
    Ok(())
}

fn signer(account: &AccountInfo) -> ProgramResult {
    if !account.is_signer {
        return Err(HolderError::MissingSignature.into());
    }
    Ok(())
}

fn key(account: &AccountInfo, expected: &Pubkey) -> ProgramResult {
    if account.key != expected {
        return Err(HolderError::InvalidAccount.into());
    }
    Ok(())
}

fn owned(account: &AccountInfo, owner: &Pubkey) -> ProgramResult {
    if account.owner != owner {
        return Err(HolderError::WrongOwner.into());
    }
    Ok(())
}

fn game_state(program_id: &Pubkey, game_info: &AccountInfo) -> Result<GameState, ProgramError> {
    owned(game_info, program_id)?;
    Ok(deserialize_game_state(game_info, program_id)?.0)
}

fn config_state(
    program_id: &Pubkey,
    game_info: &AccountInfo,
    config_info: &AccountInfo,
) -> Result<HolderConfig, ProgramError> {
    owned(config_info, program_id)?;
    let (address, bump) = config_address(program_id, game_info.key);
    key(config_info, &address)?;
    let config = HolderConfig::try_from_slice(&config_info.try_borrow_data()?)
        .map_err(|_| HolderError::InvalidState)?;
    if config.tag != CONFIG_TAG || config.game != *game_info.key || config.bump != bump {
        return Err(HolderError::InvalidState.into());
    }
    Ok(config)
}

fn token_state(account: &AccountInfo) -> Result<TokenAccount, ProgramError> {
    owned(account, &spl_token::id())?;
    let token = TokenAccount::unpack(&account.try_borrow_data()?)?;
    if token.state != AccountState::Initialized {
        return Err(HolderError::InvalidState.into());
    }
    Ok(token)
}

/// Holder eligibility is read-only: both canonical SPL mint programs are
/// supported, while all payment custody and transfers stay on legacy Tokenkeg.
/// Use the official Token-2022 parser for initialized base state, account type,
/// and every TLV header/boundary instead of treating an extended mint as 82 bytes.
fn validate_eligibility_mint(account: &AccountInfo) -> ProgramResult {
    let data = account.try_borrow_data()?;
    if account.owner == &spl_token::id() {
        Mint::unpack(&data).map_err(|_| HolderError::InvalidMint)?;
    } else if account.owner == &spl_token_2022::id() {
        let mint = StateWithExtensions::<Token2022Mint>::unpack(&data)
            .map_err(|_| HolderError::InvalidMint)?;
        let extensions = mint
            .get_extension_types()
            .map_err(|_| HolderError::InvalidMint)?;
        for (index, extension) in extensions.iter().enumerate() {
            if extension.get_account_type() != AccountType::Mint
                || extensions[..index].contains(extension)
            {
                return Err(HolderError::InvalidMint.into());
            }
        }
    } else {
        return Err(HolderError::WrongOwner.into());
    }
    Ok(())
}

/// Used by the completed original WithdrawP3DRewards handler. Only this canonical
/// vault may receive the game's accumulated P3D payment-token fees.
pub fn validate_fee_vault(
    program_id: &Pubkey,
    game_info: &AccountInfo,
    config_info: &AccountInfo,
    vault_info: &AccountInfo,
) -> Result<HolderConfig, ProgramError> {
    let game = game_state(program_id, game_info)?;
    let config = config_state(program_id, game_info, config_info)?;
    let (vault_address, _) = vault_address(program_id, game_info.key);
    key(vault_info, &vault_address)?;
    if config.vault != *vault_info.key || game.p3d_wallet != config.vault {
        return Err(HolderError::InvalidAccount.into());
    }
    if config.payment_mint != game.mint {
        return Err(HolderError::InvalidMint.into());
    }
    let vault = token_state(vault_info)?;
    if vault.mint != config.payment_mint {
        return Err(HolderError::InvalidMint.into());
    }
    if vault.owner != *config_info.key
        || vault.delegate != COption::None
        || vault.close_authority != COption::None
    {
        return Err(HolderError::InvalidAuthority.into());
    }
    Ok(config)
}

/// Allocate/assign also handles a PDA pre-funded by another wallet. Rejecting
/// every nonzero-lamport address would let a one-lamport donation block claims.
fn create_pda<'a>(
    payer: &AccountInfo<'a>,
    account: &AccountInfo<'a>,
    system: &AccountInfo<'a>,
    owner: &Pubkey,
    size: usize,
    seeds: &[&[u8]],
) -> ProgramResult {
    key(system, &system_program::id())?;
    owned(account, &system_program::id())?;
    if !account.data_is_empty() {
        return Err(HolderError::AlreadyInitialized.into());
    }
    let required = Rent::get()?.minimum_balance(size).max(1);
    let current = account.lamports();
    if current < required {
        invoke(
            &system_instruction::transfer(payer.key, account.key, required - current),
            &[payer.clone(), account.clone(), system.clone()],
        )?;
    }
    invoke_signed(
        &system_instruction::allocate(account.key, size as u64),
        &[account.clone(), system.clone()],
        &[seeds],
    )?;
    invoke_signed(
        &system_instruction::assign(account.key, owner),
        &[account.clone(), system.clone()],
        &[seeds],
    )
}

pub fn process_initialize(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    params: HolderInitializeParams,
) -> ProgramResult {
    count(accounts, 9)?;
    let creator = &accounts[0];
    let game_info = &accounts[1];
    let config_info = &accounts[2];
    let vault_info = &accounts[3];
    let payment_mint = &accounts[4];
    let eligibility_mint = &accounts[5];
    let token_program = &accounts[6];
    let system = &accounts[7];
    let rent = &accounts[8];
    signer(creator)?;
    let mut game = game_state(program_id, game_info)?;
    if game.game_creator != *creator.key || params.publisher == Pubkey::default() {
        return Err(HolderError::InvalidAuthority.into());
    }
    key(token_program, &spl_token::id())?;
    key(system, &system_program::id())?;
    key(rent, &sysvar::rent::id())?;
    key(payment_mint, &game.mint)?;
    owned(payment_mint, &spl_token::id())?;
    Mint::unpack(&payment_mint.try_borrow_data()?)?;
    validate_eligibility_mint(eligibility_mint)?;
    let (config_key, config_bump) = config_address(program_id, game_info.key);
    let (vault_key, vault_bump) = vault_address(program_id, game_info.key);
    key(config_info, &config_key)?;
    key(vault_info, &vault_key)?;
    if !config_info.data_is_empty() || !vault_info.data_is_empty() {
        return Err(HolderError::AlreadyInitialized.into());
    }
    create_pda(
        creator,
        config_info,
        system,
        program_id,
        CONFIG_SIZE,
        &[CONFIG_SEED, game_info.key.as_ref(), &[config_bump]],
    )?;
    create_pda(
        creator,
        vault_info,
        system,
        &spl_token::id(),
        TokenAccount::LEN,
        &[VAULT_SEED, game_info.key.as_ref(), &[vault_bump]],
    )?;
    invoke(
        &spl_token::instruction::initialize_account(
            token_program.key,
            vault_info.key,
            payment_mint.key,
            config_info.key,
        )?,
        &[
            vault_info.clone(),
            payment_mint.clone(),
            config_info.clone(),
            rent.clone(),
            token_program.clone(),
        ],
    )?;
    HolderConfig {
        tag: CONFIG_TAG,
        game: *game_info.key,
        publisher: params.publisher,
        eligibility_mint: *eligibility_mint.key,
        payment_mint: *payment_mint.key,
        vault: vault_key,
        reserved_amount: 0,
        next_epoch: 1,
        total_published: 0,
        total_claimed: 0,
        bump: config_bump,
    }
    .serialize(&mut &mut config_info.try_borrow_mut_data()?[..])?;
    game.p3d_wallet = vault_key;
    game.serialize(&mut &mut game_info.try_borrow_mut_data()?[..])?;
    Ok(())
}

fn reserve_epoch(
    config: &HolderConfig,
    vault_amount: u64,
    total: u64,
) -> Result<HolderConfig, ProgramError> {
    if total == 0 {
        return Err(HolderError::InvalidAmount.into());
    }
    let reserved = config
        .reserved_amount
        .checked_add(total)
        .ok_or(HolderError::ArithmeticOverflow)?;
    if reserved > vault_amount {
        return Err(HolderError::InsufficientUnreservedFunds.into());
    }
    let mut next = config.clone();
    next.reserved_amount = reserved;
    next.total_published = next
        .total_published
        .checked_add(total)
        .ok_or(HolderError::ArithmeticOverflow)?;
    next.next_epoch = next
        .next_epoch
        .checked_add(1)
        .ok_or(HolderError::ArithmeticOverflow)?;
    Ok(next)
}

pub fn process_publish(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    params: HolderPublishParams,
) -> ProgramResult {
    count(accounts, 6)?;
    let publisher = &accounts[0];
    let game_info = &accounts[1];
    let config_info = &accounts[2];
    let epoch_info = &accounts[3];
    let vault_info = &accounts[4];
    let system = &accounts[5];
    signer(publisher)?;
    let config = validate_fee_vault(program_id, game_info, config_info, vault_info)?;
    if config.publisher != *publisher.key {
        return Err(HolderError::InvalidAuthority.into());
    }
    if params.epoch != config.next_epoch {
        return Err(HolderError::InvalidEpoch.into());
    }
    if params.root == [0; 32] {
        return Err(HolderError::InvalidProof.into());
    }
    if params.snapshot_slot > Clock::get()?.slot {
        return Err(HolderError::InvalidSnapshotSlot.into());
    }
    let (epoch_key, bump) = epoch_address(program_id, config_info.key, params.epoch);
    key(epoch_info, &epoch_key)?;
    if !epoch_info.data_is_empty() {
        return Err(HolderError::AlreadyInitialized.into());
    }
    let next_config = reserve_epoch(&config, token_state(vault_info)?.amount, params.total)?;
    create_pda(
        publisher,
        epoch_info,
        system,
        program_id,
        EPOCH_SIZE,
        &[
            EPOCH_SEED,
            config_info.key.as_ref(),
            &params.epoch.to_le_bytes(),
            &[bump],
        ],
    )?;
    HolderEpoch {
        tag: EPOCH_TAG,
        config: *config_info.key,
        game: *game_info.key,
        epoch: params.epoch,
        snapshot_slot: params.snapshot_slot,
        merkle_root: params.root,
        total_amount: params.total,
        claimed_amount: 0,
        bump,
    }
    .serialize(&mut &mut epoch_info.try_borrow_mut_data()?[..])?;
    next_config.serialize(&mut &mut config_info.try_borrow_mut_data()?[..])?;
    Ok(())
}

/// Pure preflight budget operation: failures never partially mutate a ledger.
fn claim_budget(
    config: &HolderConfig,
    epoch: &HolderEpoch,
    amount: u64,
    vault_amount: u64,
    already_claimed: bool,
) -> Result<(HolderConfig, HolderEpoch), ProgramError> {
    if already_claimed {
        return Err(HolderError::AlreadyClaimed.into());
    }
    if amount == 0 {
        return Err(HolderError::InvalidAmount.into());
    }
    let claimed = epoch
        .claimed_amount
        .checked_add(amount)
        .ok_or(HolderError::ArithmeticOverflow)?;
    if claimed > epoch.total_amount {
        return Err(HolderError::EpochBudgetExceeded.into());
    }
    if config.reserved_amount < amount || vault_amount < config.reserved_amount {
        return Err(HolderError::InsufficientUnreservedFunds.into());
    }
    let mut next_config = config.clone();
    let mut next_epoch = epoch.clone();
    next_config.reserved_amount -= amount;
    next_config.total_claimed = next_config
        .total_claimed
        .checked_add(amount)
        .ok_or(HolderError::ArithmeticOverflow)?;
    next_epoch.claimed_amount = claimed;
    Ok((next_config, next_epoch))
}

pub fn process_claim(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    params: HolderClaimParams,
) -> ProgramResult {
    count(accounts, 9)?;
    let wallet = &accounts[0];
    let game_info = &accounts[1];
    let config_info = &accounts[2];
    let epoch_info = &accounts[3];
    let vault_info = &accounts[4];
    let destination_info = &accounts[5];
    let receipt_info = &accounts[6];
    let token_program = &accounts[7];
    let system = &accounts[8];
    signer(wallet)?;
    key(token_program, &spl_token::id())?;
    key(system, &system_program::id())?;
    let config = validate_fee_vault(program_id, game_info, config_info, vault_info)?;
    owned(epoch_info, program_id)?;
    let (epoch_key, epoch_bump) = epoch_address(program_id, config_info.key, params.epoch);
    key(epoch_info, &epoch_key)?;
    let epoch = HolderEpoch::try_from_slice(&epoch_info.try_borrow_data()?)
        .map_err(|_| HolderError::InvalidState)?;
    if epoch.tag != EPOCH_TAG
        || epoch.config != *config_info.key
        || epoch.game != *game_info.key
        || epoch.epoch != params.epoch
        || epoch.bump != epoch_bump
    {
        return Err(HolderError::InvalidEpoch.into());
    }
    let (receipt_key, receipt_bump) = claim_address(program_id, epoch_info.key, wallet.key);
    key(receipt_info, &receipt_key)?;
    let (next_config, next_epoch) = claim_budget(
        &config,
        &epoch,
        params.amount,
        token_state(vault_info)?.amount,
        !receipt_info.data_is_empty(),
    )?;
    let destination = token_state(destination_info)?;
    if destination.owner != *wallet.key {
        return Err(HolderError::InvalidAuthority.into());
    }
    if destination.mint != config.payment_mint {
        return Err(HolderError::InvalidMint.into());
    }
    let leaf = holder_leaf(
        program_id,
        game_info.key,
        params.epoch,
        wallet.key,
        params.amount,
    );
    if !verify_holder_proof(leaf, &params.proof, &epoch.merkle_root) {
        return Err(HolderError::InvalidProof.into());
    }
    // Receipt creation, token transfer and both accounting writes are atomic in
    // this Solana transaction. A failed CPI cannot leave a consumed entitlement.
    create_pda(
        wallet,
        receipt_info,
        system,
        program_id,
        CLAIM_SIZE,
        &[
            CLAIM_SEED,
            epoch_info.key.as_ref(),
            wallet.key.as_ref(),
            &[receipt_bump],
        ],
    )?;
    invoke_signed(
        &spl_token::instruction::transfer(
            token_program.key,
            vault_info.key,
            destination_info.key,
            config_info.key,
            &[],
            params.amount,
        )?,
        &[
            vault_info.clone(),
            destination_info.clone(),
            config_info.clone(),
            token_program.clone(),
        ],
        &[&[CONFIG_SEED, game_info.key.as_ref(), &[config.bump]]],
    )?;
    HolderClaimReceipt {
        tag: CLAIM_TAG,
        epoch_account: *epoch_info.key,
        wallet: *wallet.key,
        amount: params.amount,
        bump: receipt_bump,
    }
    .serialize(&mut &mut receipt_info.try_borrow_mut_data()?[..])?;
    next_epoch.serialize(&mut &mut epoch_info.try_borrow_mut_data()?[..])?;
    next_config.serialize(&mut &mut config_info.try_borrow_mut_data()?[..])?;
    Ok(())
}

pub fn process_set_publisher(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    params: HolderPublisherParams,
) -> ProgramResult {
    count(accounts, 3)?;
    let creator = &accounts[0];
    let game_info = &accounts[1];
    let config_info = &accounts[2];
    signer(creator)?;
    let game = game_state(program_id, game_info)?;
    if game.game_creator != *creator.key || params.publisher == Pubkey::default() {
        return Err(HolderError::InvalidAuthority.into());
    }
    let mut config = config_state(program_id, game_info, config_info)?;
    config.publisher = params.publisher;
    config.serialize(&mut &mut config_info.try_borrow_mut_data()?[..])?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::state::{StateType, GAME_STATE_SIZE};
    use spl_token_2022::extension::{
        metadata_pointer::MetadataPointer, transfer_fee::TransferFeeConfig,
        BaseStateWithExtensionsMut, ExtensionType, StateWithExtensionsMut,
    };

    fn eligibility_data(extended: bool, initialized: bool) -> Vec<u8> {
        let mint = Token2022Mint {
            mint_authority: COption::Some(Pubkey::new_unique()),
            supply: 1_000_000_000,
            decimals: 6,
            is_initialized: initialized,
            freeze_authority: COption::None,
        };
        if !extended {
            let mut data = vec![0; Token2022Mint::LEN];
            Token2022Mint::pack(mint, &mut data).unwrap();
            return data;
        }
        let size = ExtensionType::try_calculate_account_len::<Token2022Mint>(&[
            ExtensionType::MetadataPointer,
            ExtensionType::TransferFeeConfig,
        ])
        .unwrap();
        let mut data = vec![0; size];
        let mut state =
            StateWithExtensionsMut::<Token2022Mint>::unpack_uninitialized(&mut data).unwrap();
        state.init_extension::<MetadataPointer>(false).unwrap();
        state.init_extension::<TransferFeeConfig>(false).unwrap();
        state.base = mint;
        state.pack_base();
        state.init_account_type().unwrap();
        data
    }

    #[test]
    fn holder_eligibility_accepts_legacy_and_token2022_mints_with_extensions() {
        for (owner, extended) in [
            (spl_token::id(), false),
            (spl_token_2022::id(), false),
            (spl_token_2022::id(), true),
        ] {
            let mut account = test_account(
                Pubkey::new_unique(),
                owner,
                eligibility_data(extended, true),
            );
            validate_eligibility_mint(&account.info()).unwrap();
        }
    }

    #[test]
    fn holder_eligibility_rejects_unknown_owners_and_uninitialized_mints() {
        let mut wrong_owner = test_account(
            Pubkey::new_unique(),
            system_program::id(),
            eligibility_data(true, true),
        );
        assert_eq!(
            validate_eligibility_mint(&wrong_owner.info()),
            Err(HolderError::WrongOwner.into())
        );
        for (owner, extended) in [
            (spl_token::id(), false),
            (spl_token_2022::id(), false),
            (spl_token_2022::id(), true),
        ] {
            let mut account = test_account(
                Pubkey::new_unique(),
                owner,
                eligibility_data(extended, false),
            );
            assert_eq!(
                validate_eligibility_mint(&account.info()),
                Err(HolderError::InvalidMint.into())
            );
        }
    }

    #[test]
    fn holder_eligibility_rejects_truncated_wrong_type_and_malformed_token2022_tlv() {
        let valid = eligibility_data(true, true);
        let mut wrong_type = valid.clone();
        wrong_type[165] = AccountType::Account as u8;
        let mut wrong_extension_type = valid.clone();
        wrong_extension_type[166..168]
            .copy_from_slice(&u16::from(ExtensionType::TransferFeeAmount).to_le_bytes());
        let mut unknown_extension = valid.clone();
        unknown_extension[166..168].copy_from_slice(&u16::MAX.to_le_bytes());
        let mut duplicate = valid.clone();
        // MetadataPointer is the first 64-byte value, plus its four-byte TLV header.
        duplicate.extend_from_slice(&valid[166..234]);
        for bytes in [
            valid[..81].to_vec(),
            valid[..165].to_vec(),
            valid[..180].to_vec(),
            wrong_type,
            wrong_extension_type,
            unknown_extension,
            duplicate,
        ] {
            let mut account = test_account(Pubkey::new_unique(), spl_token_2022::id(), bytes);
            assert_eq!(
                validate_eligibility_mint(&account.info()),
                Err(HolderError::InvalidMint.into())
            );
        }
    }

    struct TestAccount {
        key: Pubkey,
        owner: Pubkey,
        lamports: u64,
        data: Vec<u8>,
        is_signer: bool,
    }

    impl TestAccount {
        fn info(&mut self) -> AccountInfo<'_> {
            AccountInfo::new(
                &self.key,
                self.is_signer,
                true,
                &mut self.lamports,
                &mut self.data,
                &self.owner,
                false,
                0,
            )
        }
    }

    fn test_account(key: Pubkey, owner: Pubkey, data: Vec<u8>) -> TestAccount {
        TestAccount {
            key,
            owner,
            lamports: 10_000_000,
            data,
            is_signer: false,
        }
    }

    fn token_data(mint: Pubkey, owner: Pubkey, amount: u64) -> Vec<u8> {
        let mut data = vec![0; TokenAccount::LEN];
        TokenAccount::pack(
            TokenAccount {
                mint,
                owner,
                amount,
                delegate: COption::None,
                state: AccountState::Initialized,
                is_native: COption::None,
                delegated_amount: 0,
                close_authority: COption::None,
            },
            &mut data,
        )
        .unwrap();
        data
    }

    fn claim_accounts() -> (Pubkey, Vec<TestAccount>, HolderClaimParams) {
        let program = Pubkey::new_unique();
        let wallet = Pubkey::new_unique();
        let payment_mint = Pubkey::new_unique();
        let version = 42u64;
        let (game_key, _) =
            Pubkey::find_program_address(&[b"game-v2", &version.to_le_bytes()], &program);
        let (config_key, config_bump) = config_address(&program, &game_key);
        let (vault_key, _) = vault_address(&program, &game_key);
        let (epoch_key, epoch_bump) = epoch_address(&program, &config_key, 1);
        let (receipt_key, _) = claim_address(&program, &epoch_key, &wallet);
        let mut game = GameState::try_from_slice(&vec![0; GAME_STATE_SIZE]).unwrap();
        game.TYPE = StateType::GameStateTypeV2;
        game.version = version;
        game.mint = payment_mint;
        game.game_creator = Pubkey::new_unique();
        game.p3d_wallet = vault_key;
        let config = HolderConfig {
            tag: CONFIG_TAG,
            game: game_key,
            publisher: game.game_creator,
            eligibility_mint: Pubkey::new_unique(),
            payment_mint,
            vault: vault_key,
            reserved_amount: 100,
            next_epoch: 2,
            total_published: 100,
            total_claimed: 0,
            bump: config_bump,
        };
        let epoch = HolderEpoch {
            tag: EPOCH_TAG,
            config: config_key,
            game: game_key,
            epoch: 1,
            snapshot_slot: 0,
            merkle_root: holder_leaf(&program, &game_key, 1, &wallet, 100),
            total_amount: 100,
            claimed_amount: 0,
            bump: epoch_bump,
        };
        let mut wallet_account = test_account(wallet, system_program::id(), vec![]);
        wallet_account.is_signer = true;
        let accounts = vec![
            wallet_account,
            test_account(game_key, program, game.try_to_vec().unwrap()),
            test_account(config_key, program, config.try_to_vec().unwrap()),
            test_account(epoch_key, program, epoch.try_to_vec().unwrap()),
            test_account(
                vault_key,
                spl_token::id(),
                token_data(payment_mint, config_key, 100),
            ),
            test_account(
                Pubkey::new_unique(),
                spl_token::id(),
                token_data(payment_mint, wallet, 0),
            ),
            test_account(receipt_key, system_program::id(), vec![]),
            test_account(spl_token::id(), Pubkey::new_unique(), vec![]),
            test_account(system_program::id(), Pubkey::new_unique(), vec![]),
        ];
        (
            program,
            accounts,
            HolderClaimParams {
                epoch: 1,
                amount: 100,
                proof: vec![],
            },
        )
    }

    fn rejected_claim_unchanged(
        program: &Pubkey,
        accounts: &mut [TestAccount],
        params: HolderClaimParams,
        error: HolderError,
    ) {
        let before: Vec<_> = accounts
            .iter()
            .map(|a| (a.lamports, a.data.clone()))
            .collect();
        {
            let infos: Vec<_> = accounts.iter_mut().map(TestAccount::info).collect();
            assert_eq!(process_claim(program, &infos, params), Err(error.into()));
        }
        let after: Vec<_> = accounts
            .iter()
            .map(|a| (a.lamports, a.data.clone()))
            .collect();
        assert_eq!(before, after, "rejected processor call changed an account");
    }

    fn fixture() -> (HolderConfig, HolderEpoch) {
        let game = Pubkey::new_unique();
        let config = HolderConfig {
            tag: CONFIG_TAG,
            game,
            publisher: Pubkey::new_unique(),
            eligibility_mint: Pubkey::new_unique(),
            payment_mint: Pubkey::new_unique(),
            vault: Pubkey::new_unique(),
            reserved_amount: 100,
            next_epoch: 2,
            total_published: 100,
            total_claimed: 0,
            bump: 1,
        };
        let epoch = HolderEpoch {
            tag: EPOCH_TAG,
            config: Pubkey::new_unique(),
            game,
            epoch: 1,
            snapshot_slot: 50,
            merkle_root: [1; 32],
            total_amount: 100,
            claimed_amount: 0,
            bump: 1,
        };
        (config, epoch)
    }

    #[test]
    fn layouts_have_documented_exact_lengths() {
        let (config, epoch) = fixture();
        assert_eq!(config.try_to_vec().unwrap().len(), CONFIG_SIZE);
        assert_eq!(epoch.try_to_vec().unwrap().len(), EPOCH_SIZE);
        let receipt = HolderClaimReceipt {
            tag: CLAIM_TAG,
            epoch_account: Pubkey::new_unique(),
            wallet: Pubkey::new_unique(),
            amount: 10,
            bump: 1,
        };
        assert_eq!(receipt.try_to_vec().unwrap().len(), CLAIM_SIZE);
    }

    #[test]
    fn merkle_proofs_bind_program_game_epoch_wallet_and_amount() {
        let program = Pubkey::new_unique();
        let game = Pubkey::new_unique();
        let alice = Pubkey::new_unique();
        let bob = Pubkey::new_unique();
        let a = holder_leaf(&program, &game, 1, &alice, 60);
        let b = holder_leaf(&program, &game, 1, &bob, 40);
        let root = holder_node(&a, &b);
        assert!(verify_holder_proof(a, &[b], &root));
        assert!(verify_holder_proof(b, &[a], &root));
        assert_eq!(root, holder_node(&b, &a));
        for invalid in [
            holder_leaf(&Pubkey::new_unique(), &game, 1, &alice, 60),
            holder_leaf(&program, &Pubkey::new_unique(), 1, &alice, 60),
            holder_leaf(&program, &game, 2, &alice, 60),
            holder_leaf(&program, &game, 1, &bob, 60),
            holder_leaf(&program, &game, 1, &alice, 61),
        ]
        .iter()
        {
            assert!(!verify_holder_proof(*invalid, &[b], &root));
        }
        assert!(!verify_holder_proof(a, &[], &root));
        assert!(!verify_holder_proof(a, &[[0; 32]; 33], &root));
        assert!(verify_holder_proof(a, &[], &a));
    }

    #[test]
    fn publishing_cannot_double_reserve_existing_vault_funds() {
        let (config, _) = fixture();
        assert_eq!(
            reserve_epoch(&config, 120, 21),
            Err(HolderError::InsufficientUnreservedFunds.into())
        );
        assert_eq!(
            reserve_epoch(&config, 120, 0),
            Err(HolderError::InvalidAmount.into())
        );
        let next = reserve_epoch(&config, 120, 20).unwrap();
        assert_eq!(next.reserved_amount, 120);
        assert_eq!(next.total_published, 120);
        assert_eq!(next.next_epoch, 3);
        assert_eq!(config.reserved_amount, 100);
    }

    #[test]
    fn claim_is_budgeted_and_duplicate_failure_does_not_mutate_state() {
        let (config, epoch) = fixture();
        let (after_config, after_epoch) = claim_budget(&config, &epoch, 60, 100, false).unwrap();
        assert_eq!(after_config.reserved_amount, 40);
        assert_eq!(after_config.total_claimed, 60);
        assert_eq!(after_epoch.claimed_amount, 60);
        let before = (after_config.clone(), after_epoch.clone());
        assert_eq!(
            claim_budget(&after_config, &after_epoch, 60, 40, true),
            Err(HolderError::AlreadyClaimed.into())
        );
        assert_eq!((after_config, after_epoch), before);
        assert_eq!(config.reserved_amount, 100);
        assert_eq!(epoch.claimed_amount, 0);
    }

    #[test]
    fn claim_cannot_exceed_epoch_reservation_or_available_funds() {
        let (config, epoch) = fixture();
        assert_eq!(
            claim_budget(&config, &epoch, 101, 1000, false),
            Err(HolderError::EpochBudgetExceeded.into())
        );
        assert_eq!(
            claim_budget(&config, &epoch, 50, 99, false),
            Err(HolderError::InsufficientUnreservedFunds.into())
        );
        assert_eq!(
            claim_budget(&config, &epoch, 0, 100, false),
            Err(HolderError::InvalidAmount.into())
        );
        let (after_config, after_epoch) = claim_budget(&config, &epoch, 100, 100, false).unwrap();
        assert_eq!(after_config.reserved_amount, 0);
        assert_eq!(after_epoch.claimed_amount, 100);
    }

    #[test]
    fn actual_claim_processor_rejects_forged_amount_or_wallet_without_writes() {
        let (program, mut accounts, mut params) = claim_accounts();
        params.amount = 99;
        rejected_claim_unchanged(&program, &mut accounts, params, HolderError::InvalidProof);

        let (program, mut accounts, params) = claim_accounts();
        let forged_wallet = Pubkey::new_unique();
        accounts[0].key = forged_wallet;
        accounts[5].data = token_data(
            HolderConfig::try_from_slice(&accounts[2].data)
                .unwrap()
                .payment_mint,
            forged_wallet,
            0,
        );
        accounts[6].key = claim_address(&program, &accounts[3].key, &forged_wallet).0;
        rejected_claim_unchanged(&program, &mut accounts, params, HolderError::InvalidProof);
    }

    #[test]
    fn actual_claim_processor_rejects_missing_signature_and_wrong_destination() {
        let (program, mut accounts, params) = claim_accounts();
        accounts[0].is_signer = false;
        rejected_claim_unchanged(
            &program,
            &mut accounts,
            params,
            HolderError::MissingSignature,
        );

        let (program, mut accounts, params) = claim_accounts();
        accounts[5].data = token_data(Pubkey::new_unique(), accounts[0].key, 0);
        rejected_claim_unchanged(&program, &mut accounts, params, HolderError::InvalidMint);

        let (program, mut accounts, params) = claim_accounts();
        let mint = HolderConfig::try_from_slice(&accounts[2].data)
            .unwrap()
            .payment_mint;
        accounts[5].data = token_data(mint, Pubkey::new_unique(), 0);
        rejected_claim_unchanged(
            &program,
            &mut accounts,
            params,
            HolderError::InvalidAuthority,
        );
    }

    #[test]
    fn actual_claim_processor_rejects_substituted_vault_and_claim_receipt() {
        let (program, mut accounts, params) = claim_accounts();
        accounts[4].key = Pubkey::new_unique();
        rejected_claim_unchanged(&program, &mut accounts, params, HolderError::InvalidAccount);

        let (program, mut accounts, params) = claim_accounts();
        accounts[6].key = Pubkey::new_unique();
        rejected_claim_unchanged(&program, &mut accounts, params, HolderError::InvalidAccount);

        let (program, mut accounts, params) = claim_accounts();
        let mint = HolderConfig::try_from_slice(&accounts[2].data)
            .unwrap()
            .payment_mint;
        accounts[4].data = token_data(mint, Pubkey::new_unique(), 100);
        rejected_claim_unchanged(
            &program,
            &mut accounts,
            params,
            HolderError::InvalidAuthority,
        );
    }

    #[test]
    fn actual_claim_processor_rejects_replay_and_preserves_all_ledgers() {
        let (program, mut accounts, params) = claim_accounts();
        accounts[6].owner = program;
        accounts[6].data = HolderClaimReceipt {
            tag: CLAIM_TAG,
            epoch_account: accounts[3].key,
            wallet: accounts[0].key,
            amount: 100,
            bump: claim_address(&program, &accounts[3].key, &accounts[0].key).1,
        }
        .try_to_vec()
        .unwrap();
        rejected_claim_unchanged(&program, &mut accounts, params, HolderError::AlreadyClaimed);
    }

    #[test]
    fn actual_publisher_rotation_rejects_forged_creator_without_writes() {
        let (program, mut accounts, _) = claim_accounts();
        let before = accounts[2].data.clone();
        {
            let mut infos: Vec<_> = accounts.iter_mut().map(TestAccount::info).collect();
            assert_eq!(
                process_set_publisher(
                    &program,
                    &infos.drain(..3).collect::<Vec<_>>(),
                    HolderPublisherParams {
                        publisher: Pubkey::new_unique()
                    }
                ),
                Err(HolderError::InvalidAuthority.into()),
            );
        }
        assert_eq!(accounts[2].data, before);
    }
}
