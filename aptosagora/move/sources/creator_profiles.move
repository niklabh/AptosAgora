module aptosagora::creator_profiles {
    use std::string::{String};
    use std::signer;
    use std::error;
    use std::vector;
    use aptos_framework::account;
    use aptos_framework::event::{Self, EventHandle};
    use aptos_framework::timestamp;
    use aptos_framework::object::{Self, Object};
    
    /// Error codes
    const ERROR_PROFILE_ALREADY_EXISTS: u64 = 1;
    const ERROR_PROFILE_DOES_NOT_EXIST: u64 = 2;
    const ERROR_NOT_PROFILE_OWNER: u64 = 3;
    
    /// Creator profile struct
    struct CreatorProfile has key, store {
        /// Owner address
        owner: address,
        /// Display name
        name: String,
        /// Profile description/bio
        bio: String,
        /// Profile picture/avatar URL
        avatar_url: String,
        /// Social media links
        social_links: vector<String>,
        /// Content categories/niches
        content_categories: vector<String>,
        /// Creation timestamp
        created_at: u64,
        /// Last update timestamp
        updated_at: u64,
        /// Profile verified status (for future verification system)
        is_verified: bool,
        /// Profile reputation score
        reputation_score: u64,
    }
    
    /// Profile created event
    struct ProfileCreatedEvent has drop, store {
        owner: address,
        name: String,
        timestamp: u64,
    }
    
    /// Profile updated event
    struct ProfileUpdatedEvent has drop, store {
        owner: address,
        timestamp: u64,
    }
    
    /// Module state to keep track of all profiles
    struct CreatorProfileState has key {
        /// All creator profiles
        profiles: vector<Object<CreatorProfile>>,
        /// Events
        profile_created_events: EventHandle<ProfileCreatedEvent>,
        profile_updated_events: EventHandle<ProfileUpdatedEvent>,
    }
    
    /// Initialize the creator profiles module
    fun init_module(account: &signer) {
        let state = CreatorProfileState {
            profiles: vector::empty(),
            profile_created_events: account::new_event_handle<ProfileCreatedEvent>(account),
            profile_updated_events: account::new_event_handle<ProfileUpdatedEvent>(account),
        };
        move_to(account, state);
    }
    
    /// Check if a profile exists for an address
    public fun profile_exists(addr: address): bool acquires CreatorProfileState {
        let state = borrow_global<CreatorProfileState>(@aptosagora);
        let i = 0;
        let len = vector::length(&state.profiles);
        
        while (i < len) {
            let profile_obj = vector::borrow(&state.profiles, i);
            let profile = borrow_global<CreatorProfile>(object::object_address(profile_obj));
            if (profile.owner == addr) {
                return true
            };
            i = i + 1;
        };
        
        false
    }
    
    /// Create a new creator profile
    public entry fun create_profile(
        account: &signer,
        name: String,
        bio: String,
        avatar_url: String,
        social_links: vector<String>,
        content_categories: vector<String>
    ) acquires CreatorProfileState {
        let account_addr = signer::address_of(account);
        
        // Check if profile already exists
        assert!(!profile_exists(account_addr), error::already_exists(ERROR_PROFILE_ALREADY_EXISTS));
        
        // Create the profile as an object
        let profile = CreatorProfile {
            owner: account_addr,
            name,
            bio,
            avatar_url,
            social_links,
            content_categories,
            created_at: timestamp::now_seconds(),
            updated_at: timestamp::now_seconds(),
            is_verified: false,
            reputation_score: 0,
        };
        
        // Create a new object to host the profile
        let profile_obj = object::create_object_from_account(account);
        let profile_signer = object::generate_signer(&profile_obj);
        move_to(&profile_signer, profile);
        
        // Add to global registry
        let state = borrow_global_mut<CreatorProfileState>(@aptosagora);
        vector::push_back(&mut state.profiles, profile_obj);
        
        // Emit event
        event::emit_event(
            &mut state.profile_created_events,
            ProfileCreatedEvent {
                owner: account_addr,
                name,
                timestamp: timestamp::now_seconds(),
            }
        );
    }
    
    /// Update an existing creator profile
    public entry fun update_profile(
        account: &signer,
        name: String,
        bio: String,
        avatar_url: String,
        social_links: vector<String>,
        content_categories: vector<String>
    ) acquires CreatorProfileState {
        let account_addr = signer::address_of(account);
        
        // Check if profile exists
        assert!(profile_exists(account_addr), error::not_found(ERROR_PROFILE_DOES_NOT_EXIST));
        
        // Get the profile
        let profile_obj = get_profile_object(account_addr);
        let profile = borrow_global_mut<CreatorProfile>(object::object_address(&profile_obj));
        
        // Update profile
        profile.name = name;
        profile.bio = bio;
        profile.avatar_url = avatar_url;
        profile.social_links = social_links;
        profile.content_categories = content_categories;
        profile.updated_at = timestamp::now_seconds();
        
        // Emit event
        let state = borrow_global_mut<CreatorProfileState>(@aptosagora);
        event::emit_event(
            &mut state.profile_updated_events,
            ProfileUpdatedEvent {
                owner: account_addr,
                timestamp: timestamp::now_seconds(),
            }
        );
    }
    
    /// Update reputation score (only callable by privileged modules)
    public fun update_reputation(
        addr: address,
        reputation_delta: u64,
        increase: bool
    ) acquires CreatorProfileState {
        // Check if profile exists
        assert!(profile_exists(addr), error::not_found(ERROR_PROFILE_DOES_NOT_EXIST));
        
        // Get the profile
        let profile_obj = get_profile_object(addr);
        let profile = borrow_global_mut<CreatorProfile>(object::object_address(&profile_obj));
        
        // Update reputation score
        if (increase) {
            profile.reputation_score = profile.reputation_score + reputation_delta;
        } else {
            // Ensure we don't go below zero
            if (profile.reputation_score >= reputation_delta) {
                profile.reputation_score = profile.reputation_score - reputation_delta;
            } else {
                profile.reputation_score = 0;
            };
        };
        
        profile.updated_at = timestamp::now_seconds();
    }
    
    /// Set verification status (only callable by privileged modules)
    public fun set_verification_status(
        addr: address, 
        is_verified: bool
    ) acquires CreatorProfileState {
        // Check if profile exists
        assert!(profile_exists(addr), error::not_found(ERROR_PROFILE_DOES_NOT_EXIST));
        
        // Get the profile
        let profile_obj = get_profile_object(addr);
        let profile = borrow_global_mut<CreatorProfile>(object::object_address(&profile_obj));
        
        // Update verification status
        profile.is_verified = is_verified;
        profile.updated_at = timestamp::now_seconds();
    }
    
    #[view]
    /// Get profile information (view function)
    public fun get_profile(addr: address): (
        String, // name
        String, // bio
        String, // avatar_url
        vector<String>, // social_links
        vector<String>, // content_categories
        u64, // created_at
        u64, // updated_at
        bool, // is_verified
        u64 // reputation_score
    ) acquires CreatorProfileState {
        // Check if profile exists
        assert!(profile_exists(addr), error::not_found(ERROR_PROFILE_DOES_NOT_EXIST));
        
        // Get the profile
        let profile_obj = get_profile_object(addr);
        let profile = borrow_global<CreatorProfile>(object::object_address(&profile_obj));
        
        (
            profile.name,
            profile.bio,
            profile.avatar_url,
            profile.social_links,
            profile.content_categories,
            profile.created_at,
            profile.updated_at,
            profile.is_verified,
            profile.reputation_score
        )
    }
    
    /// Helper function to get profile object
    fun get_profile_object(addr: address): Object<CreatorProfile> acquires CreatorProfileState {
        let state = borrow_global<CreatorProfileState>(@aptosagora);
        let i = 0;
        let len = vector::length(&state.profiles);
        
        while (i < len) {
            let profile_obj = *vector::borrow(&state.profiles, i);
            let profile = borrow_global<CreatorProfile>(object::object_address(&profile_obj));
            if (profile.owner == addr) {
                return profile_obj
            };
            i = i + 1;
        };
        
        abort error::not_found(ERROR_PROFILE_DOES_NOT_EXIST)
    }
} 