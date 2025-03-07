module aptosagora::content_registry {
    use std::string::{String};
    use std::signer;
    use std::error;
    use std::vector;
    use aptos_framework::account;
    use aptos_framework::timestamp;
    use aptos_framework::event::{Self, EventHandle};
    use aptos_framework::object::{Self, Object};
    use aptos_framework::table::{Self, Table};
    use aptosagora::creator_profiles;

    /// Error codes
    const ERROR_CONTENT_ALREADY_EXISTS: u64 = 1;
    const ERROR_CONTENT_DOES_NOT_EXIST: u64 = 2;
    const ERROR_NOT_CONTENT_OWNER: u64 = 3;
    const ERROR_CREATOR_PROFILE_REQUIRED: u64 = 4;

    /// Content structure
    struct Content has key, store {
        creator: address,
        content_hash: String,
        content_type: String,
        description: String,
        tags: vector<String>,
        engagement_count: u64,
        created_at: u64,
        updated_at: u64,
    }

    /// Engagement types
    struct Engagement has drop, store {
        user: address,
        engagement_type: String,
        timestamp: u64,
    }

    /// Registry state to track content and emit events
    struct ContentRegistryState has key {
        // Table mapping creator address to a nested table of content hashes to object references
        content_by_creator: Table<address, Table<String, address>>,
        content_creation_events: EventHandle<ContentCreationEvent>,
        content_engagement_events: EventHandle<ContentEngagementEvent>,
    }

    /// Event emitted when content is created
    struct ContentCreationEvent has drop, store {
        creator: address,
        content_hash: String,
        content_type: String,
        timestamp: u64,
    }

    /// Event emitted when content is engaged with
    struct ContentEngagementEvent has drop, store {
        user: address,
        creator: address,
        content_hash: String,
        engagement_type: String,
        timestamp: u64,
    }

    /// Initialize the module
    public fun init_module(admin: &signer) {
        let state = ContentRegistryState {
            content_by_creator: table::new(),
            content_creation_events: account::new_event_handle<ContentCreationEvent>(admin),
            content_engagement_events: account::new_event_handle<ContentEngagementEvent>(admin),
        };
        move_to(admin, state);
    }

    /// Create content
    public entry fun create_content(
        creator: &signer,
        content_hash: String,
        content_type: String,
        description: String,
        tags: vector<String>
    ) acquires ContentRegistryState {
        let creator_addr = signer::address_of(creator);
        
        // Verify creator has a profile
        assert!(creator_profiles::profile_exists(creator_addr), error::not_found(ERROR_CREATOR_PROFILE_REQUIRED));
        
        // Check if content already exists
        assert!(!content_exists(creator_addr, content_hash), error::already_exists(ERROR_CONTENT_ALREADY_EXISTS));
        
        // Create content
        let content = Content {
            creator: creator_addr,
            content_hash,
            content_type,
            description,
            tags,
            engagement_count: 0,
            created_at: timestamp::now_seconds(),
            updated_at: timestamp::now_seconds(),
        };
        
        // Create an object to hold the content
        let constructor_ref = object::create_object(creator_addr);
        let object_addr = object::address_from_constructor_ref(&constructor_ref);
        let object_signer = object::generate_signer(&constructor_ref);
        move_to(&object_signer, content);
        
        // Update registry state
        let state = borrow_global_mut<ContentRegistryState>(@aptosagora);
        
        // Initialize creator's content table if it doesn't exist
        if (!table::contains(&state.content_by_creator, creator_addr)) {
            table::add(&mut state.content_by_creator, creator_addr, table::new());
        };
        
        // Add content to creator's table
        let creator_table = table::borrow_mut(&mut state.content_by_creator, creator_addr);
        table::add(creator_table, content_hash, object_addr);
        
        // Update creator's content count
        creator_profiles::increment_content_count(creator_addr);
        
        // Emit event
        event::emit_event(
            &mut state.content_creation_events,
            ContentCreationEvent {
                creator: creator_addr,
                content_hash,
                content_type,
                timestamp: timestamp::now_seconds(),
            }
        );
    }

    /// Engage with content
    public entry fun engage_with_content(
        user: &signer,
        creator: address,
        content_hash: String,
        engagement_type: String
    ) acquires ContentRegistryState, Content {
        let user_addr = signer::address_of(user);
        
        // Check if content exists
        assert!(content_exists(creator, content_hash), error::not_found(ERROR_CONTENT_DOES_NOT_EXIST));
        
        // Get content object
        let content_obj_addr = get_content_object_address(creator, content_hash);
        let content = borrow_global_mut<Content>(content_obj_addr);
        
        // Update engagement count
        content.engagement_count = content.engagement_count + 1;
        content.updated_at = timestamp::now_seconds();
        
        // Emit engagement event
        let state = borrow_global_mut<ContentRegistryState>(@aptosagora);
        event::emit_event(
            &mut state.content_engagement_events,
            ContentEngagementEvent {
                user: user_addr,
                creator,
                content_hash,
                engagement_type,
                timestamp: timestamp::now_seconds(),
            }
        );
        
        // Update creator reputation based on engagement
        // Simple implementation - increase reputation by 1 for each engagement
        creator_profiles::update_reputation(creator, 1, true);
    }

    /// Check if content exists
    public fun content_exists(creator: address, content_hash: String): bool acquires ContentRegistryState {
        let state = borrow_global<ContentRegistryState>(@aptosagora);
        
        if (!table::contains(&state.content_by_creator, creator)) {
            return false
        };
        
        let creator_table = table::borrow(&state.content_by_creator, creator);
        table::contains(creator_table, content_hash)
    }

    /// Get engagement count
    public fun get_engagement_count(creator: address, content_hash: String): u64 acquires ContentRegistryState, Content {
        assert!(content_exists(creator, content_hash), error::not_found(ERROR_CONTENT_DOES_NOT_EXIST));
        
        let content_obj_addr = get_content_object_address(creator, content_hash);
        let content = borrow_global<Content>(content_obj_addr);
        content.engagement_count
    }
    
    /// Helper function to get content object address
    fun get_content_object_address(creator: address, content_hash: String): address acquires ContentRegistryState {
        let state = borrow_global<ContentRegistryState>(@aptosagora);
        let creator_table = table::borrow(&state.content_by_creator, creator);
        *table::borrow(creator_table, content_hash)
    }
    
    /// Get content details
    #[view]
    public fun get_content(creator: address, content_hash: String): (String, String, vector<String>, u64, u64, u64) 
        acquires ContentRegistryState, Content 
    {
        assert!(content_exists(creator, content_hash), error::not_found(ERROR_CONTENT_DOES_NOT_EXIST));
        
        let content_obj_addr = get_content_object_address(creator, content_hash);
        let content = borrow_global<Content>(content_obj_addr);
        
        (
            content.content_type,
            content.description,
            content.tags,
            content.engagement_count,
            content.created_at,
            content.updated_at
        )
    }
    
    /// Get all content hashes for a creator
    #[view]
    public fun get_creator_content_hashes(creator: address): vector<String> acquires ContentRegistryState {
        let state = borrow_global<ContentRegistryState>(@aptosagora);
        
        if (!table::contains(&state.content_by_creator, creator)) {
            return vector::empty<String>()
        };
        
        let creator_table = table::borrow(&state.content_by_creator, creator);
        table::keys(creator_table)
    }
} 