module aptosagora::recommendation_engine {
    use std::string::{String};
    use std::signer;
    use std::error;
    use std::vector;
    use aptos_framework::account;
    use aptos_framework::event::{Self, EventHandle};
    use aptos_framework::timestamp;
    use aptos_framework::table::{Self, Table};
    use aptos_framework::object::{Self, Object};
    
    /// Error codes
    const ERROR_NOT_AUTHORIZED: u64 = 1;
    const ERROR_RECOMMENDATION_NOT_FOUND: u64 = 2;
    const ERROR_MAX_RECOMMENDATIONS_REACHED: u64 = 3;
    
    /// Maximum recommendations per user
    const MAX_RECOMMENDATIONS_PER_USER: u64 = 100;
    
    /// Recommendation source
    const RECOMMENDATION_SOURCE_AGENT: u64 = 1;
    const RECOMMENDATION_SOURCE_USER_ACTIVITY: u64 = 2;
    const RECOMMENDATION_SOURCE_CONTENT_SIMILARITY: u64 = 3;
    
    /// Recommendation struct representing a single content recommendation
    struct Recommendation has store, drop {
        /// Content ID being recommended
        content_id: String,
        /// Recommendation score (higher = more relevant)
        score: u64,
        /// Source of recommendation
        source: u64,
        /// Timestamp of recommendation
        timestamp: u64,
        /// Whether the recommendation has been viewed
        is_viewed: bool,
        /// Whether the recommendation has been engaged with
        is_engaged: bool,
    }
    
    /// User recommendation list
    struct UserRecommendations has key, store {
        /// The user address
        user: address,
        /// List of content recommendations for this user
        recommendations: vector<Recommendation>,
        /// Last update timestamp
        last_updated: u64,
    }
    
    /// Recommendation event
    struct RecommendationEvent has drop, store {
        user: address,
        content_id: String,
        score: u64,
        source: u64,
        timestamp: u64,
    }
    
    /// Engagement event
    struct RecommendationEngagementEvent has drop, store {
        user: address,
        content_id: String,
        timestamp: u64,
    }
    
    /// Module state
    struct RecommendationEngineState has key {
        /// Map of user addresses to recommendation objects
        user_recommendations: Table<address, Object<UserRecommendations>>,
        /// Events
        recommendation_events: EventHandle<RecommendationEvent>,
        engagement_events: EventHandle<RecommendationEngagementEvent>,
    }
    
    /// Initialize the recommendation engine
    fun init_module(account: &signer) {
        let state = RecommendationEngineState {
            user_recommendations: table::new(),
            recommendation_events: account::new_event_handle<RecommendationEvent>(account),
            engagement_events: account::new_event_handle<RecommendationEngagementEvent>(account),
        };
        move_to(account, state);
    }
    
    /// Add recommendations for a user (only authorized agents or modules)
    public fun add_recommendations(
        authorized_account: &signer,
        user: address,
        content_ids: vector<String>,
        scores: vector<u64>,
        source: u64
    ) acquires RecommendationEngineState {
        // Only module account can add recommendations directly
        assert!(signer::address_of(authorized_account) == @aptosagora, error::permission_denied(ERROR_NOT_AUTHORIZED));
        
        let state = borrow_global_mut<RecommendationEngineState>(@aptosagora);
        let now = timestamp::now_seconds();
        
        // Ensure both vectors have the same length
        assert!(vector::length(&content_ids) == vector::length(&scores), error::invalid_argument(ERROR_NOT_AUTHORIZED));
        
        // Initialize user recommendations if needed
        if (!table::contains(&state.user_recommendations, user)) {
            initialize_user_recommendations(authorized_account, user);
        };
        
        // Get user recommendations
        let user_recs_obj = table::borrow_mut(&mut state.user_recommendations, user);
        let user_recs = borrow_global_mut<UserRecommendations>(object::object_address(user_recs_obj));
        
        // Add recommendations
        let i = 0;
        let len = vector::length(&content_ids);
        
        while (i < len) {
            let content_id = *vector::borrow(&content_ids, i);
            let score = *vector::borrow(&scores, i);
            
            // Create recommendation
            let recommendation = Recommendation {
                content_id,
                score,
                source,
                timestamp: now,
                is_viewed: false,
                is_engaged: false,
            };
            
            // Add to user's recommendations, maintaining maximum limit
            if (vector::length(&user_recs.recommendations) >= MAX_RECOMMENDATIONS_PER_USER) {
                // Remove oldest recommendation
                vector::remove(&mut user_recs.recommendations, 0);
            };
            
            vector::push_back(&mut user_recs.recommendations, recommendation);
            
            // Emit event
            event::emit_event(
                &mut state.recommendation_events,
                RecommendationEvent {
                    user,
                    content_id,
                    score,
                    source,
                    timestamp: now,
                }
            );
            
            i = i + 1;
        };
        
        // Update last updated timestamp
        user_recs.last_updated = now;
    }
    
    /// Mark recommendation as viewed
    public entry fun mark_recommendation_viewed(
        user: &signer,
        content_id: String
    ) acquires RecommendationEngineState {
        let user_addr = signer::address_of(user);
        let state = borrow_global_mut<RecommendationEngineState>(@aptosagora);
        
        // Check if user has recommendations
        assert!(table::contains(&state.user_recommendations, user_addr), error::not_found(ERROR_RECOMMENDATION_NOT_FOUND));
        
        // Get user recommendations
        let user_recs_obj = table::borrow_mut(&mut state.user_recommendations, user_addr);
        let user_recs = borrow_global_mut<UserRecommendations>(object::object_address(user_recs_obj));
        
        // Find and mark recommendation as viewed
        let i = 0;
        let len = vector::length(&user_recs.recommendations);
        let found = false;
        
        while (i < len && !found) {
            let rec = vector::borrow_mut(&mut user_recs.recommendations, i);
            if (rec.content_id == content_id) {
                rec.is_viewed = true;
                found = true;
            };
            i = i + 1;
        };
        
        assert!(found, error::not_found(ERROR_RECOMMENDATION_NOT_FOUND));
    }
    
    /// Mark recommendation as engaged with
    public entry fun mark_recommendation_engaged(
        user: &signer,
        content_id: String
    ) acquires RecommendationEngineState {
        let user_addr = signer::address_of(user);
        let state = borrow_global_mut<RecommendationEngineState>(@aptosagora);
        
        // Check if user has recommendations
        assert!(table::contains(&state.user_recommendations, user_addr), error::not_found(ERROR_RECOMMENDATION_NOT_FOUND));
        
        // Get user recommendations
        let user_recs_obj = table::borrow_mut(&mut state.user_recommendations, user_addr);
        let user_recs = borrow_global_mut<UserRecommendations>(object::object_address(user_recs_obj));
        
        // Find and mark recommendation as engaged
        let i = 0;
        let len = vector::length(&user_recs.recommendations);
        let found = false;
        
        while (i < len && !found) {
            let rec = vector::borrow_mut(&mut user_recs.recommendations, i);
            if (rec.content_id == content_id) {
                rec.is_viewed = true;
                rec.is_engaged = true;
                found = true;
            };
            i = i + 1;
        };
        
        assert!(found, error::not_found(ERROR_RECOMMENDATION_NOT_FOUND));
        
        // Emit engagement event
        event::emit_event(
            &mut state.engagement_events,
            RecommendationEngagementEvent {
                user: user_addr,
                content_id,
                timestamp: timestamp::now_seconds(),
            }
        );
    }
    
    /// Initialize recommendations for a new user
    fun initialize_user_recommendations(
        admin: &signer,
        user: address
    ) acquires RecommendationEngineState {
        let state = borrow_global_mut<RecommendationEngineState>(@aptosagora);
        
        // Create empty recommendations list
        let user_recs = UserRecommendations {
            user,
            recommendations: vector::empty(),
            last_updated: timestamp::now_seconds(),
        };
        
        // Create a new object to host the recommendations
        let recs_obj = object::create_object_from_account(admin);
        let recs_signer = object::generate_signer(&recs_obj);
        move_to(&recs_signer, user_recs);
        
        // Store in table
        table::add(&mut state.user_recommendations, user, recs_obj);
    }
    
    #[view]
    /// Get recommendations for a user (view function)
    public fun get_recommendations(user: address): (
        vector<String>, // content_ids
        vector<u64>,    // scores
        vector<u64>,    // sources
        vector<u64>,    // timestamps
        vector<bool>,   // is_viewed
        vector<bool>,   // is_engaged
        u64             // last_updated
    ) acquires RecommendationEngineState {
        let state = borrow_global<RecommendationEngineState>(@aptosagora);
        
        // If user doesn't have recommendations yet, return empty vectors
        if (!table::contains(&state.user_recommendations, user)) {
            return (
                vector::empty<String>(),
                vector::empty<u64>(),
                vector::empty<u64>(),
                vector::empty<u64>(),
                vector::empty<bool>(),
                vector::empty<bool>(),
                0
            )
        };
        
        // Get user recommendations
        let user_recs_obj = table::borrow(&state.user_recommendations, user);
        let user_recs = borrow_global<UserRecommendations>(object::object_address(user_recs_obj));
        
        // Prepare result vectors
        let content_ids = vector::empty<String>();
        let scores = vector::empty<u64>();
        let sources = vector::empty<u64>();
        let timestamps = vector::empty<u64>();
        let viewed_statuses = vector::empty<bool>();
        let engaged_statuses = vector::empty<bool>();
        
        // Fill result vectors
        let i = 0;
        let len = vector::length(&user_recs.recommendations);
        
        while (i < len) {
            let rec = vector::borrow(&user_recs.recommendations, i);
            vector::push_back(&mut content_ids, rec.content_id);
            vector::push_back(&mut scores, rec.score);
            vector::push_back(&mut sources, rec.source);
            vector::push_back(&mut timestamps, rec.timestamp);
            vector::push_back(&mut viewed_statuses, rec.is_viewed);
            vector::push_back(&mut engaged_statuses, rec.is_engaged);
            i = i + 1;
        };
        
        (
            content_ids,
            scores,
            sources,
            timestamps,
            viewed_statuses,
            engaged_statuses,
            user_recs.last_updated
        )
    }
} 