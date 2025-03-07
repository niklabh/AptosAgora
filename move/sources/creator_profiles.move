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

    /// Creator profile structure
    struct CreatorProfile has key, store {
        name: String,
        bio: String,
        social_links: String,
        reputation_score: u64,
        content_count: u64,
        created_at: u64,
        updated_at: u64,
    }

    /// Module state to track profiles and emit events
    struct ProfileState has key {
        profile_creation_events: EventHandle<ProfileCreationEvent>,
        profile_update_events: EventHandle<ProfileUpdateEvent>,
    }

    /// Event emitted when a profile is created
    struct ProfileCreationEvent has drop, store {
        creator_address: address,
        name: String,
        timestamp: u64,
    }

    /// Event emitted when a profile is updated
    struct ProfileUpdateEvent has drop, store {
        creator_address: address,
        name: String,
        timestamp: u64,
    }
    
    /// Initialize the module
    public fun init_module(admin: &signer) {
        let state = ProfileState {
            profile_creation_events: account::new_event_handle<ProfileCreationEvent>(admin),
            profile_update_events: account::new_event_handle<ProfileUpdateEvent>(admin),
        };
        move_to(admin, state);
    }
    
    /// Create profile
    public entry fun create_profile(
        creator: &signer,
        name: String,
        bio: String,
        social_links: String
    ) {
        let creator_addr = signer::address_of(creator);
        
        // Check if profile already exists
        assert!(!profile_exists(creator_addr), error::already_exists(ERROR_PROFILE_ALREADY_EXISTS));
        
        // Create profile
        let profile = CreatorProfile {
            name: name,
            bio: bio,
            social_links: social_links,
            reputation_score: 100, // Default starting reputation
            content_count: 0,
            created_at: timestamp::now_seconds(),
            updated_at: timestamp::now_seconds(),
        };
        
        // Create an object to hold the profile
        let constructor_ref = object::create_object(creator_addr);
        let object_signer = object::generate_signer(&constructor_ref);
        move_to(&object_signer, profile);
        
        // Emit event
        let state = borrow_global_mut<ProfileState>(@aptosagora);
        event::emit_event(
            &mut state.profile_creation_events,
            ProfileCreationEvent {
                creator_address: creator_addr,
                name: name,
                timestamp: timestamp::now_seconds(),
            }
        );
    }
    
    /// Update profile
    public entry fun update_profile(
        creator: &signer,
        name: String,
        bio: String,
        social_links: String
    ) acquires CreatorProfile {
        let creator_addr = signer::address_of(creator);
        
        // Check if profile exists
        assert!(profile_exists(creator_addr), error::not_found(ERROR_PROFILE_DOES_NOT_EXIST));
        
        // Get the profile object
        let object_addr = get_profile_object_address(creator_addr);
        let profile = borrow_global_mut<CreatorProfile>(object_addr);
        
        // Update profile
        profile.name = name;
        profile.bio = bio;
        profile.social_links = social_links;
        profile.updated_at = timestamp::now_seconds();
        
        // Emit event
        let state = borrow_global_mut<ProfileState>(@aptosagora);
        event::emit_event(
            &mut state.profile_update_events,
            ProfileUpdateEvent {
                creator_address: creator_addr,
                name: name,
                timestamp: timestamp::now_seconds(),
            }
        );
    }
    
    /// Check if profile exists
    public fun profile_exists(addr: address): bool {
        // We need to implement this helper function that finds the object containing the profile
        object::address_exists(addr)
    }
    
    /// Helper function to get the object address for a profile
    fun get_profile_object_address(creator_addr: address): address {
        // This is a simplified approach - in a full implementation we would need to
        // maintain a mapping of creator addresses to their profile object addresses
        creator_addr
    }
    
    /// Get bio
    public fun get_bio(addr: address): String acquires CreatorProfile {
        assert!(profile_exists(addr), error::not_found(ERROR_PROFILE_DOES_NOT_EXIST));
        
        let object_addr = get_profile_object_address(addr);
        let profile = borrow_global<CreatorProfile>(object_addr);
        profile.bio
    }
    
    /// Update reputation
    public fun update_reputation(addr: address, reputation_delta: u64, increase: bool) acquires CreatorProfile {
        assert!(profile_exists(addr), error::not_found(ERROR_PROFILE_DOES_NOT_EXIST));
        
        let object_addr = get_profile_object_address(addr);
        let profile = borrow_global_mut<CreatorProfile>(object_addr);
        
        if (increase) {
            profile.reputation_score = profile.reputation_score + reputation_delta;
        } else {
            // Ensure we don't underflow
            if (profile.reputation_score > reputation_delta) {
                profile.reputation_score = profile.reputation_score - reputation_delta;
            } else {
                profile.reputation_score = 0;
            }
        }
    }
    
    /// Increment content count
    public fun increment_content_count(addr: address) acquires CreatorProfile {
        assert!(profile_exists(addr), error::not_found(ERROR_PROFILE_DOES_NOT_EXIST));
        
        let object_addr = get_profile_object_address(addr);
        let profile = borrow_global_mut<CreatorProfile>(object_addr);
        profile.content_count = profile.content_count + 1;
    }
    
    /// Get profile details
    #[view]
    public fun get_profile(addr: address): (String, String, String, u64, u64, u64, u64) acquires CreatorProfile {
        assert!(profile_exists(addr), error::not_found(ERROR_PROFILE_DOES_NOT_EXIST));
        
        let object_addr = get_profile_object_address(addr);
        let profile = borrow_global<CreatorProfile>(object_addr);
        
        (
            profile.name,
            profile.bio,
            profile.social_links,
            profile.reputation_score,
            profile.content_count,
            profile.created_at,
            profile.updated_at
        )
    }
} 