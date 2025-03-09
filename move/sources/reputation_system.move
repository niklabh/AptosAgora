module aptosagora::reputation_system {
    use std::string::{String};
    use std::signer;
    use std::error;
    use aptos_framework::account;
    use aptos_framework::event::{Self, EventHandle};
    use aptos_framework::timestamp;
    use aptos_framework::table::{Self, Table};
    
    use aptosagora::creator_profiles;
    
    /// Error codes
    const ERROR_NOT_AUTHORIZED: u64 = 1;
    const ERROR_CONTENT_NOT_FOUND: u64 = 2;
    const ERROR_ALREADY_RATED: u64 = 3;
    const ERROR_SELF_RATING: u64 = 4;
    
    /// Maximum rating value
    const MAX_RATING: u64 = 5;
    
    /// Content rating
    struct ContentRating has store, drop {
        /// Content ID
        content_id: String,
        /// Rater address
        rater: address,
        /// Rating value (1-5)
        rating: u64,
        /// Optional feedback
        feedback: String,
        /// Timestamp
        timestamp: u64,
    }
    
    /// Content reputation data
    struct ContentReputation has store {
        /// Content ID
        content_id: String,
        /// Creator address
        creator: address,
        /// Total rating sum
        rating_sum: u64,
        /// Number of ratings
        rating_count: u64,
        /// Whether the content has been flagged
        is_flagged: bool,
        /// Last update timestamp
        updated_at: u64,
    }
    
    /// Rating event
    struct RatingEvent has drop, store {
        content_id: String,
        creator: address,
        rater: address,
        rating: u64,
        timestamp: u64,
    }
    
    /// Flag event
    struct FlagEvent has drop, store {
        content_id: String,
        flagger: address,
        reason: String,
        timestamp: u64,
    }
    
    /// Module state
    struct ReputationSystemState has key {
        /// Content ratings by user
        user_ratings: Table<address, Table<String, ContentRating>>,
        /// Content reputation data
        content_reputations: Table<String, ContentReputation>,
        /// Events
        rating_events: EventHandle<RatingEvent>,
        flag_events: EventHandle<FlagEvent>,
    }
    
    /// Initialize the reputation system
    fun init_module(account: &signer) {
        let state = ReputationSystemState {
            user_ratings: table::new(),
            content_reputations: table::new(),
            rating_events: account::new_event_handle<RatingEvent>(account),
            flag_events: account::new_event_handle<FlagEvent>(account),
        };
        move_to(account, state);
    }
    
    /// Rate content (1-5 stars)
    public entry fun rate_content(
        rater: &signer,
        content_id: String,
        creator: address,
        rating: u64,
        feedback: String
    ) acquires ReputationSystemState {
        let rater_addr = signer::address_of(rater);
        
        // Prevent users from rating their own content
        assert!(rater_addr != creator, error::invalid_argument(ERROR_SELF_RATING));
        
        // Ensure rating is within valid range
        assert!(rating > 0 && rating <= MAX_RATING, error::invalid_argument(ERROR_NOT_AUTHORIZED));
        
        let state = borrow_global_mut<ReputationSystemState>(@aptosagora);
        
        // Initialize user rating table if needed
        if (!table::contains(&state.user_ratings, rater_addr)) {
            table::add(&mut state.user_ratings, rater_addr, table::new<String, ContentRating>());
        };
        
        let user_ratings = table::borrow_mut(&mut state.user_ratings, rater_addr);
        
        // Check if user has already rated this content
        assert!(!table::contains(user_ratings, content_id), error::already_exists(ERROR_ALREADY_RATED));
        
        // Create rating
        let content_rating = ContentRating {
            content_id: content_id,
            rater: rater_addr,
            rating,
            feedback,
            timestamp: timestamp::now_seconds(),
        };
        
        // Add rating to user's ratings
        table::add(user_ratings, content_id, content_rating);
        
        // Initialize or update content reputation
        if (!table::contains(&state.content_reputations, content_id)) {
            // Create new reputation entry
            let content_rep = ContentReputation {
                content_id: content_id,
                creator,
                rating_sum: rating,
                rating_count: 1,
                is_flagged: false,
                updated_at: timestamp::now_seconds(),
            };
            table::add(&mut state.content_reputations, content_id, content_rep);
        } else {
            // Update existing reputation
            let content_rep = table::borrow_mut(&mut state.content_reputations, content_id);
            content_rep.rating_sum = content_rep.rating_sum + rating;
            content_rep.rating_count = content_rep.rating_count + 1;
            content_rep.updated_at = timestamp::now_seconds();
        };
        
        // Emit event
        event::emit_event(
            &mut state.rating_events,
            RatingEvent {
                content_id,
                creator,
                rater: rater_addr,
                rating,
                timestamp: timestamp::now_seconds(),
            }
        );
        
        // Update creator reputation if profile exists
        if (creator_profiles::profile_exists(creator)) {
            // Calculate reputation points (1-5 scale to points)
            let rep_delta = if (rating >= 4) {
                // High ratings give more points
                5
            } else if (rating == 3) {
                // Neutral rating
                1
            } else {
                // Low ratings don't give points
                0
            };
            
            if (rep_delta > 0) {
                creator_profiles::update_reputation(creator, rep_delta, true);
            };
        };
    }
    
    /// Flag inappropriate content
    public entry fun flag_content(
        flagger: &signer,
        content_id: String,
        reason: String
    ) acquires ReputationSystemState {
        let flagger_addr = signer::address_of(flagger);
        let state = borrow_global_mut<ReputationSystemState>(@aptosagora);
        
        // Check if content exists in reputation system
        assert!(table::contains(&state.content_reputations, content_id), error::not_found(ERROR_CONTENT_NOT_FOUND));
        
        // Mark content as flagged
        let content_rep = table::borrow_mut(&mut state.content_reputations, content_id);
        content_rep.is_flagged = true;
        content_rep.updated_at = timestamp::now_seconds();
        
        // Emit flag event
        event::emit_event(
            &mut state.flag_events,
            FlagEvent {
                content_id,
                flagger: flagger_addr,
                reason,
                timestamp: timestamp::now_seconds(),
            }
        );
    }
    
    /// Remove flag from content (admin only)
    public entry fun remove_flag(
        admin: &signer,
        content_id: String
    ) acquires ReputationSystemState {
        // Only module account can remove flags
        assert!(signer::address_of(admin) == @aptosagora, error::permission_denied(ERROR_NOT_AUTHORIZED));
        
        let state = borrow_global_mut<ReputationSystemState>(@aptosagora);
        
        // Check if content exists in reputation system
        assert!(table::contains(&state.content_reputations, content_id), error::not_found(ERROR_CONTENT_NOT_FOUND));
        
        // Remove flag
        let content_rep = table::borrow_mut(&mut state.content_reputations, content_id);
        content_rep.is_flagged = false;
        content_rep.updated_at = timestamp::now_seconds();
    }
    
    #[view]
    /// Get content reputation data (view function)
    public fun get_content_reputation(content_id: String): (u64, u64, bool) acquires ReputationSystemState {
        let state = borrow_global<ReputationSystemState>(@aptosagora);
        
        if (!table::contains(&state.content_reputations, content_id)) {
            return (0, 0, false)
        };
        
        let content_rep = table::borrow(&state.content_reputations, content_id);
        
        (
            content_rep.rating_sum,
            content_rep.rating_count,
            content_rep.is_flagged
        )
    }
    
    #[view]
    /// Calculate average rating (view function)
    public fun get_average_rating(content_id: String): u64 acquires ReputationSystemState {
        let state = borrow_global<ReputationSystemState>(@aptosagora);
        
        if (!table::contains(&state.content_reputations, content_id)) {
            return 0
        };
        
        let content_rep = table::borrow(&state.content_reputations, content_id);
        
        if (content_rep.rating_count == 0) {
            0
        } else {
            // Return average * 100 for precision (e.g., 450 = 4.5 stars)
            (content_rep.rating_sum * 100) / content_rep.rating_count
        }
    }
    
    #[view]
    /// Check if user has rated content (view function)
    public fun has_user_rated(user: address, content_id: String): bool acquires ReputationSystemState {
        let state = borrow_global<ReputationSystemState>(@aptosagora);
        
        if (!table::contains(&state.user_ratings, user)) {
            return false
        };
        
        let user_ratings = table::borrow(&state.user_ratings, user);
        table::contains(user_ratings, content_id)
    }
} 