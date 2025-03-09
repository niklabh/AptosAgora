module aptosagora::token_economics {
    use std::string::{String};
    use std::signer;
    use std::error;
    use aptos_framework::account;
    use aptos_framework::coin::{Self, MintCapability, BurnCapability, FreezeCapability};
    use aptos_framework::event::{Self, EventHandle};
    use aptos_framework::timestamp;
    
    /// Error codes
    const ERROR_NOT_AUTHORIZED: u64 = 1;
    const ERROR_INVALID_REWARD_TYPE: u64 = 2;
    
    /// Reward types
    const REWARD_TYPE_CONTENT_CREATION: u64 = 1;
    const REWARD_TYPE_CURATION: u64 = 2;
    const REWARD_TYPE_ENGAGEMENT: u64 = 3;
    const REWARD_TYPE_STAKING: u64 = 4;
    
    /// Base reward amounts (in token units)
    const BASE_REWARD_CONTENT_CREATION: u64 = 100;
    const BASE_REWARD_CURATION: u64 = 50;
    const BASE_REWARD_ENGAGEMENT: u64 = 10;
    const BASE_REWARD_STAKING_RATE: u64 = 5; // 5% APY
    
    /// AptosAgora token
    struct AAGToken {}
    
    /// Token capabilities
    struct TokenCapabilities has key {
        mint_cap: MintCapability<AAGToken>,
        burn_cap: BurnCapability<AAGToken>,
        freeze_cap: FreezeCapability<AAGToken>,
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
        /// Total tokens minted
        total_supply: u64,
        /// Reward distribution events
        reward_events: EventHandle<RewardDistributionEvent>,
    }
    
    /// Initialize the module and create the AAG token
    fun init_module(admin: &signer) {
        // Ensure the admin is the module owner
        assert!(signer::address_of(admin) == @aptosagora, error::permission_denied(ERROR_NOT_AUTHORIZED));
        
        // Initialize AAG token
        let (burn_cap, freeze_cap, mint_cap) = coin::initialize<AAGToken>(
            admin,
            std::string::utf8(b"AptosAgora Token"),
            std::string::utf8(b"AAG"),
            8, // 8 decimals
            true, // monitor_supply
        );
        
        // Store token capabilities
        let token_caps = TokenCapabilities {
            mint_cap: mint_cap,
            burn_cap: burn_cap,
            freeze_cap: freeze_cap,
        };
        move_to(admin, token_caps);
        
        // Initialize token economics state
        let state = TokenEconomicsState {
            total_supply: 0,
            reward_events: account::new_event_handle<RewardDistributionEvent>(admin),
        };
        move_to(admin, state);
    }
    
    /// Distribute tokens as a reward to a user
    public fun distribute_reward(
        admin: &signer,
        recipient: address,
        reward_type: u64,
        amount_multiplier: u64
    ) acquires TokenCapabilities, TokenEconomicsState {
        let admin_addr = signer::address_of(admin);
        
        // Verify admin is the module owner
        assert!(admin_addr == @aptosagora, error::permission_denied(ERROR_NOT_AUTHORIZED));
        
        // Verify valid reward type
        assert!(
            reward_type == REWARD_TYPE_CONTENT_CREATION ||
            reward_type == REWARD_TYPE_CURATION ||
            reward_type == REWARD_TYPE_ENGAGEMENT ||
            reward_type == REWARD_TYPE_STAKING,
            error::invalid_argument(ERROR_INVALID_REWARD_TYPE)
        );
        
        // Calculate reward amount based on reward type and multiplier
        let amount = calculate_reward_amount(reward_type, amount_multiplier);
        
        // Mint tokens to recipient
        mint_tokens(admin, recipient, amount);
        
        // Record reward distribution
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
    
    /// Mint tokens to recipient
    fun mint_tokens(_admin: &signer, recipient: address, amount: u64) acquires TokenCapabilities {
        let token_data = borrow_global<TokenCapabilities>(@aptosagora);
        let coins = coin::mint<AAGToken>(amount, &token_data.mint_cap);
        coin::deposit(recipient, coins);
    }
    
    /// Calculate reward amount based on reward type and multiplier
    fun calculate_reward_amount(reward_type: u64, multiplier: u64): u64 {
        let base_amount = if (reward_type == REWARD_TYPE_CONTENT_CREATION) {
            BASE_REWARD_CONTENT_CREATION
        } else if (reward_type == REWARD_TYPE_CURATION) {
            BASE_REWARD_CURATION
        } else if (reward_type == REWARD_TYPE_ENGAGEMENT) {
            BASE_REWARD_ENGAGEMENT
        } else if (reward_type == REWARD_TYPE_STAKING) {
            BASE_REWARD_STAKING_RATE
        } else {
            0
        };
        
        base_amount * multiplier
    }
    
    #[view]
    /// Get total token supply
    public fun get_total_supply(): u64 acquires TokenEconomicsState {
        let state = borrow_global<TokenEconomicsState>(@aptosagora);
        state.total_supply
    }
    
    #[view]
    /// Get token info
    public fun get_token_info(): (String, String, u8) {
        (
            std::string::utf8(b"AptosAgora Token"),
            std::string::utf8(b"AAG"),
            8  // decimals
        )
    }
} 