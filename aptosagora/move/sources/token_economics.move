module aptosagora::token_economics {
    use std::signer;
    use std::error;
    use std::string::{String};
    use aptos_framework::account;
    use aptos_framework::event::{Self, EventHandle};
    use aptos_framework::object;
    use aptos_framework::timestamp;
    use aptos_framework::coin::{Self, MintCapability, BurnCapability, FreezeCapability};
    use aptos_framework::fungible_asset::{Self, MintRef, TransferRef, BurnRef, Metadata};
    
    /// Error codes
    const ERROR_NOT_AUTHORIZED: u64 = 1;
    const ERROR_INSUFFICIENT_BALANCE: u64 = 2;
    const ERROR_INVALID_REWARD_TYPE: u64 = 3;
    
    /// Reward types
    const REWARD_TYPE_CONTENT_CREATION: u64 = 1;
    const REWARD_TYPE_CONTENT_CURATION: u64 = 2;
    const REWARD_TYPE_ENGAGEMENT: u64 = 3;
    const REWARD_TYPE_AGENT_OPERATION: u64 = 4;
    
    /// Reward rates (in tokens * 10^8)
    const REWARD_RATE_CONTENT_CREATION: u64 = 100 * 100000000; // 100 tokens
    const REWARD_RATE_CONTENT_CURATION: u64 = 25 * 100000000;  // 25 tokens
    const REWARD_RATE_ENGAGEMENT: u64 = 1 * 100000000;         // 1 token
    const REWARD_RATE_AGENT_OPERATION: u64 = 10 * 100000000;   // 10 tokens
    
    /// AptosAgora token info
    struct AAGToken has key {
        /// Mint capability
        mint_cap: MintCapability<AAGToken>,
        /// Burn capability
        burn_cap: BurnCapability<AAGToken>,
        /// Freeze capability
        freeze_cap: FreezeCapability<AAGToken>,
    }
    
    /// Modern Fungible Asset implementation
    struct AAGAsset has key {
        /// Mint reference
        mint_ref: MintRef,
        /// Transfer reference
        transfer_ref: TransferRef,
        /// Burn reference
        burn_ref: BurnRef,
    }
    
    /// Reward distribution event
    struct RewardDistributionEvent has drop, store {
        recipient: address,
        reward_type: u64,
        amount: u64,
        timestamp: u64,
    }
    
    /// Module state
    struct TokenEconomicsState has key {
        /// Fungible asset metadata
        metadata: Metadata,
        /// Total tokens minted
        total_supply: u64,
        /// Reward distribution events
        reward_events: EventHandle<RewardDistributionEvent>,
    }
    
    /// Initialize the module and create the AAG token
    fun init_module(admin: &signer) {
        // Initialize AAG token
        let (mint_cap, burn_cap, freeze_cap) = coin::initialize<AAGToken>(
            admin,
            b"AptosAgora Token",
            b"AAG",
            8, // 8 decimals
            true, // monitor_supply
        );
        
        // Store token capabilities
        move_to(admin, AAGToken {
            mint_cap,
            burn_cap,
            freeze_cap,
        });
        
        // Initialize modern fungible asset
        let constructor_ref = &object::create_named_object(
            admin,
            b"AptosAgora_Asset",
        );
        
        // Create the fungible asset
        let fa_metadata = fungible_asset::create_metadata(
            constructor_ref,
            b"AptosAgora Asset",
            b"AAG",
            8, // 8 decimals
            b"https://aptosagora.io/favicon.png", // icon URL
            b"https://aptosagora.io", // project URL
            vector[], // additional fields
        );
        
        // Create mint/transfer/burn refs
        let mint_ref = fungible_asset::create_mint_ref(constructor_ref);
        let transfer_ref = fungible_asset::create_transfer_ref(constructor_ref);
        let burn_ref = fungible_asset::create_burn_ref(constructor_ref);
        
        // Store asset capabilities
        move_to(admin, AAGAsset {
            mint_ref,
            transfer_ref,
            burn_ref,
        });
        
        // Create module state
        let state = TokenEconomicsState {
            metadata: fa_metadata,
            total_supply: 0,
            reward_events: account::new_event_handle<RewardDistributionEvent>(admin),
        };
        move_to(admin, state);
    }
    
    /// Distribute rewards based on activity type
    public entry fun distribute_reward(
        admin: &signer,
        recipient: address,
        reward_type: u64,
        custom_amount: u64
    ) acquires AAGToken, TokenEconomicsState {
        // Only module account can distribute rewards
        assert!(signer::address_of(admin) == @aptosagora, error::permission_denied(ERROR_NOT_AUTHORIZED));
        
        // Validate reward type
        assert!(
            reward_type == REWARD_TYPE_CONTENT_CREATION ||
            reward_type == REWARD_TYPE_CONTENT_CURATION ||
            reward_type == REWARD_TYPE_ENGAGEMENT ||
            reward_type == REWARD_TYPE_AGENT_OPERATION,
            error::invalid_argument(ERROR_INVALID_REWARD_TYPE)
        );
        
        // Determine reward amount
        let amount = if (custom_amount > 0) {
            custom_amount
        } else {
            get_reward_rate(reward_type)
        };
        
        // Mint tokens to recipient
        let token_data = borrow_global<AAGToken>(@aptosagora);
        coin::mint_and_deposit(recipient, amount, &token_data.mint_cap);
        
        // Update state
        let state = borrow_global_mut<TokenEconomicsState>(@aptosagora);
        state.total_supply = state.total_supply + amount;
        
        // Emit event
        event::emit_event(
            &mut state.reward_events,
            RewardDistributionEvent {
                recipient,
                reward_type,
                amount,
                timestamp: timestamp::now_seconds(),
            }
        );
    }
    
    /// Distribute rewards using modern fungible asset
    public entry fun distribute_reward_fa(
        admin: &signer,
        recipient: address,
        reward_type: u64,
        custom_amount: u64
    ) acquires AAGAsset, TokenEconomicsState {
        // Only module account can distribute rewards
        assert!(signer::address_of(admin) == @aptosagora, error::permission_denied(ERROR_NOT_AUTHORIZED));
        
        // Validate reward type
        assert!(
            reward_type == REWARD_TYPE_CONTENT_CREATION ||
            reward_type == REWARD_TYPE_CONTENT_CURATION ||
            reward_type == REWARD_TYPE_ENGAGEMENT ||
            reward_type == REWARD_TYPE_AGENT_OPERATION,
            error::invalid_argument(ERROR_INVALID_REWARD_TYPE)
        );
        
        // Determine reward amount
        let amount = if (custom_amount > 0) {
            custom_amount
        } else {
            get_reward_rate(reward_type)
        };
        
        // Get state and asset data
        let state = borrow_global_mut<TokenEconomicsState>(@aptosagora);
        let asset_data = borrow_global<AAGAsset>(@aptosagora);
        
        // Mint tokens to recipient
        let fa = fungible_asset::mint(&asset_data.mint_ref, amount);
        fungible_asset::deposit(recipient, fa);
        
        // Update state
        state.total_supply = state.total_supply + amount;
        
        // Emit event
        event::emit_event(
            &mut state.reward_events,
            RewardDistributionEvent {
                recipient,
                reward_type,
                amount,
                timestamp: timestamp::now_seconds(),
            }
        );
    }
    
    /// Helper to get reward rate based on type
    fun get_reward_rate(reward_type: u64): u64 {
        if (reward_type == REWARD_TYPE_CONTENT_CREATION) {
            REWARD_RATE_CONTENT_CREATION
        } else if (reward_type == REWARD_TYPE_CONTENT_CURATION) {
            REWARD_RATE_CONTENT_CURATION
        } else if (reward_type == REWARD_TYPE_ENGAGEMENT) {
            REWARD_RATE_ENGAGEMENT
        } else if (reward_type == REWARD_TYPE_AGENT_OPERATION) {
            REWARD_RATE_AGENT_OPERATION
        } else {
            0
        }
    }
    
    #[view]
    /// Get total supply (view function)
    public fun get_total_supply(): u64 acquires TokenEconomicsState {
        let state = borrow_global<TokenEconomicsState>(@aptosagora);
        state.total_supply
    }
    
    #[view]
    /// Get token metadata (view function)
    public fun get_token_metadata(): (String, String, u8) acquires TokenEconomicsState {
        let state = borrow_global<TokenEconomicsState>(@aptosagora);
        
        (
            fungible_asset::name(&state.metadata),
            fungible_asset::symbol(&state.metadata),
            fungible_asset::decimals(&state.metadata)
        )
    }
} 