use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::pubkey::Pubkey;

#[derive(BorshSerialize, BorshDeserialize)]
pub enum GameInstruction {
    /// Ix0 - Initializes a new version of Fomo3D.
    /// Accounts expected:
    /// 0 `[s]` Game creator's personal account.  
    /// 1 `[w]` Game state PDA. Uninitialized.
    /// 2 `[]` Token account for community share. Initialized.    
    /// 3 `[]` Token account for p3d share. Initialized.    
    /// 4 `[]` Token mint account. Initialized.    
    /// 5 `[]` SystemProgram account.    
    InitializeGame(InitGameParams),
    /// Ix1 - Initializes a new round of Fomo3D.
    /// Accounts expected:
    /// 0 `[s]` Funder account to pay any associated fees.
    /// 1 `[w]` Game state PDA. Initialized.
    /// 2 `[w]` Current round state PDA. Uninitialized.
    /// 3 `[w]` Token account for the current round's money pot. Uninitialized.
    /// 4 `[]` Token mint account. Initialized.
    /// 5 `[]` Rent account.
    /// 6 `[]` SystemProgram account.
    /// 7 `[]` TokenProgram account.
    /// The next two are passed if the round is not the 1st round for current program version:
    /// 8 `[w]` (optional) Previous round state PDA. Initialized.
    /// 9 `[w]` (optional) Token account for the previous round's money pot. Initialized.
    InitializeRound,
    /// Ix2 - Purchase a number of keys to participate in the game.
    /// Accounts expected:
    /// 0 `[s]` Player's personal account.
    /// 1 `[]` Game state PDA. Initialized.
    /// 2 `[w]` Round state PDA. Initialized.
    /// 3 `[w]` Player-round state PDA. Un/Initialized.
    /// 4 `[w]` Token account for the round's money pot. Initialized.
    /// 5 `[w]` Player's token account. Initialized.
    /// 6 `[]` SystemProgram account.
    /// 7 `[]` TokenProgram account.
    /// The next two are passed if the user wants to credit an existing/new affiliate.
    /// 8 `[w]` Affiliate-round state PDA. Un/Initialized.
    /// 9 `[]` Affiliate owner's account.
    PurchaseKeys(PurchaseKeysParams),
    /// Ix3 - Withdraw any accumulated Tokens in player's name.
    /// 0 `[s]` Player's personal account.
    /// 1 `[]` Game state PDA. Initialized.
    /// 2 `[]` Round state PDA. Initialized.
    /// 3 `[w]` Player-round state PDA. Initialized.
    /// 4 `[w]` Token account for the round's money pot. Initialized.
    /// 5 `[w]` Player's token account. Initialized.
    /// 6 `[]` SystemProgram account.
    /// 7 `[]` TokenProgram account.
    WithdrawSol(WithdrawParams),
    /// Ix4 - End the current game's round. Can be run by anyone, not just the creator.
    /// 0 `[]` Game state PDA. Initialized.
    /// 1 `[w]` Round state PDA. Initialized.
    /// 2 `[w]` Winner-round state PDA. Initialized.
    EndRound,
    /// Ix5 - Withdraw community rewards. Can be run by whoever controls the community token wallet.
    /// 0 `[]` Game state PDA. Initialized.
    /// 1 `[w]` Round state PDA. Initialized.
    /// 2 `[w]` Token account for the round's money pot. Initialized.
    /// 3 `[w]` Community's token account. Initialized.
    /// 4 `[s]` Community wallet owner.
    /// 5 `[]` TokenProgram account.
    WithdrawCommunityRewards(WithdrawParams),
    /// Ix6 - Route accumulated P3D fees into the configured holder-reward vault.
    /// New completion of the original unimplemented P3D withdrawal handler.
    /// Accounts: game[], round[w], round pot[w], holder vault[w], holder config[],
    /// SPL Token Program[]. Anyone may fund the validated vault; no arbitrary payee.
    WithdrawP3DRewards(WithdrawParams),
    /// Ix7 - Creator configures the new wallet-held-token reward extension.
    /// Accounts: creator[s,w], game[w], config[w], vault[w], payment mint[],
    /// eligibility mint[], SPL Token Program[], System Program[], Rent[].
    InitializeHolderRewards(HolderInitializeParams),
    /// Ix8 - Authorized snapshot publisher reserves funded vault tokens for an epoch.
    /// Accounts: publisher[s,w], game[], config[w], epoch[w], vault[], System Program[].
    PublishHolderEpoch(HolderPublishParams),
    /// Ix9 - Signed wallet claims its Merkle entitlement once per epoch.
    /// Accounts: wallet[s,w], game[], config[w], epoch[w], vault[w], destination[w],
    /// claim receipt[w], SPL Token Program[], System Program[].
    ClaimHolderRewards(HolderClaimParams),
    /// Ix10 - Original game creator changes only the authorized snapshot publisher.
    /// Accounts: creator[s], game[], config[w].
    SetHolderPublisher(HolderPublisherParams),
    /// Ix11 - Purchase using a wallet-approved minimum key count and quote expiry.
    /// The accounts are identical to PurchaseKeys. The SOL input is a maximum
    /// debit; the original launch cap may reduce it but never increase it.
    PurchaseKeysGuarded(GuardedPurchaseKeysParams),
}

#[derive(BorshSerialize, BorshDeserialize, PartialEq, Debug, Clone)]
pub struct InitGameParams {
    pub version: u64,
    //time (in seconds) for the initial window when a new round starts
    //in original Fomo3D: 1h
    pub round_init_time: i64,
    //time (in seconds) by which each key purchase bumps round end time
    //in original Fomo3D: 30s
    pub round_inc_time_per_key: i64,
    //time (in seconds) for max possible window
    //in original Fomo3D: 24h
    pub round_max_time: i64,
}

#[derive(BorshSerialize, BorshDeserialize, PartialEq, Debug, Clone)]
pub struct PurchaseKeysParams {
    pub sol_to_be_added: u128,
    pub team: u8,
}

#[derive(BorshSerialize, BorshDeserialize, PartialEq, Debug, Clone)]
pub struct GuardedPurchaseKeysParams {
    pub sol_to_be_added: u128,
    pub team: u8,
    pub minimum_keys: u128,
    pub expected_round: u64,
    pub expires_at_slot: u64,
}

#[derive(BorshSerialize, BorshDeserialize, PartialEq, Debug, Clone)]
pub struct WithdrawParams {
    //user should be able to specify which round they want to withdraw for
    pub withdraw_for_round: u64,
}

#[derive(BorshSerialize, BorshDeserialize, PartialEq, Debug, Clone)]
pub struct HolderInitializeParams {
    pub publisher: Pubkey,
}

#[derive(BorshSerialize, BorshDeserialize, PartialEq, Debug, Clone)]
pub struct HolderPublishParams {
    pub epoch: u64,
    pub root: [u8; 32],
    pub total: u64,
    pub snapshot_slot: u64,
}

#[derive(BorshSerialize, BorshDeserialize, PartialEq, Debug, Clone)]
pub struct HolderClaimParams {
    pub epoch: u64,
    pub amount: u64,
    pub proof: Vec<[u8; 32]>,
}

#[derive(BorshSerialize, BorshDeserialize, PartialEq, Debug, Clone)]
pub struct HolderPublisherParams {
    pub publisher: Pubkey,
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn guarded_purchase_appends_tag_without_changing_legacy_payment_encoding() {
        let legacy = GameInstruction::PurchaseKeys(PurchaseKeysParams {
            sol_to_be_added: 75_001,
            team: 3,
        })
        .try_to_vec()
        .unwrap();
        let guarded = GameInstruction::PurchaseKeysGuarded(GuardedPurchaseKeysParams {
            sol_to_be_added: 75_001,
            team: 3,
            minimum_keys: 1,
            expected_round: 7,
            expires_at_slot: 200,
        })
        .try_to_vec()
        .unwrap();
        assert_eq!((legacy[0], legacy.len()), (2, 18));
        assert_eq!((guarded[0], guarded.len()), (11, 50));
        assert_eq!(&guarded[1..18], &legacy[1..18]);
        assert_eq!(&guarded[18..34], &1u128.to_le_bytes());
        assert_eq!(&guarded[34..42], &7u64.to_le_bytes());
        assert_eq!(&guarded[42..50], &200u64.to_le_bytes());
        assert!(GameInstruction::try_from_slice(&guarded[..49]).is_err());
    }
}
