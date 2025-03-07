module aptosagora::token_economics {
    use std::signer;
    use std::error;
    use std::vector;
    use std::string::{String};
    use aptos_framework::account;
    use aptos_framework::event::{Self, EventHandle};
    use aptos_framework::timestamp;
    
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
    
    /// User balance and rewards
    struct UserTokens has key, store {
        balance: u64,
        total_earned: u64,
        last_reward: u64,
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
        /// Total rewards distributed
        total_rewards: u64,
        /// Reward distribution events
        reward_events: EventHandle<RewardDistributionEvent>,
    }
    
    /// Initialize the module
    fun init_module(admin: &signer) {
        // Create module state
        let state = TokenEconomicsState {
            total_supply: 1000000 * 100000000, // 1M initial supply
            total_rewards: 0,
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
    ) acquires TokenEconomicsState, UserTokens {
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
        
        // Initialize user tokens if not exists
        if (!exists<UserTokens>(recipient)) {
            move_to(
                &account::create_signer_with_capability(
                    &account::create_test_signer_cap(recipient)
                ), 
                UserTokens {
                    balance: 0,
                    total_earned: 0,
                    last_reward: 0,
                }
            );
        };
        
        // Update user balance
        let user_tokens = borrow_global_mut<UserTokens>(recipient);
        user_tokens.balance = user_tokens.balance + amount;
        user_tokens.total_earned = user_tokens.total_earned + amount;
        user_tokens.last_reward = timestamp::now_seconds();
        
        // Update state
        let state = borrow_global_mut<TokenEconomicsState>(@aptosagora);
        state.total_rewards = state.total_rewards + amount;
        
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
    /// Get total supply
    public fun get_total_supply(): u64 acquires TokenEconomicsState {
        let state = borrow_global<TokenEconomicsState>(@aptosagora);
        state.total_supply
    }
    
    #[view]
    /// Get token metadata
    public fun get_token_metadata(): (String, String, u8) {
        (
            string::utf8(b"AptosAgora Token"),
            string::utf8(b"AAG"),
            8
        )
    }

    /// Check if token exists
    public fun token_exists(): bool {
        exists<TokenEconomicsState>(@aptosagora)
    }
} 