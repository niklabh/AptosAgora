module aptosagora::content_registry {
    use std::string::{String};
    use std::vector;
    use std::signer;
    use std::error;
    use aptos_framework::account;
    use aptos_framework::timestamp;
    use aptos_framework::event::{Self, EventHandle};
    use aptos_framework::object::{Self, Object};
    use aptos_framework::table::{Self, Table};

    /// Error codes
    const ERROR_NOT_AUTHORIZED: u64 = 1;
    const ERROR_CONTENT_ALREADY_EXISTS: u64 = 2;
    const ERROR_CONTENT_DOES_NOT_EXIST: u64 = 3;
    const ERROR_INVALID_CONTENT_DATA: u64 = 4;

    /// Represents a content item in the registry
    struct Content has key, store {
        /// The unique identifier for this content
        id: String,
        /// Content creator address
        creator: address,
        /// Content metadata hash (IPFS CID or other identifier)
        content_hash: String,
        /// Content type (e.g., "article", "image", "video")
        content_type: String,
        /// A brief description of the content
        description: String,
        /// Tags for content discovery
        tags: vector<String>,
        /// Timestamp when content was created
        created_at: u64,
        /// Timestamp of last update
        updated_at: u64,
        /// Number of views or interactions
        engagement_count: u64,
        /// Whether content is active or has been removed
        is_active: bool,
    }

    /// Content creation event
    struct ContentCreatedEvent has drop, store {
        content_id: String,
        creator: address,
        content_type: String,
        timestamp: u64,
    }

    /// Content update event
    struct ContentUpdatedEvent has drop, store {
        content_id: String,
        updater: address,
        timestamp: u64,
    }

    /// Content engagement event
    struct ContentEngagementEvent has drop, store {
        content_id: String,
        user: address,
        engagement_type: String,
        timestamp: u64,
    }

    /// Registry state stored at the module account
    struct ContentRegistryState has key {
        /// Map of content IDs to content objects
        contents: Table<String, Object<Content>>,
        /// Events
        content_created_events: EventHandle<ContentCreatedEvent>,
        content_updated_events: EventHandle<ContentUpdatedEvent>,
        content_engagement_events: EventHandle<ContentEngagementEvent>,
    }

    /// Initialize the content registry
    fun init_module(account: &signer) {
        // Only the module account can initialize the registry
        let registry_state = ContentRegistryState {
            contents: table::new(),
            content_created_events: account::new_event_handle<ContentCreatedEvent>(account),
            content_updated_events: account::new_event_handle<ContentUpdatedEvent>(account),
            content_engagement_events: account::new_event_handle<ContentEngagementEvent>(account),
        };
        move_to(account, registry_state);
    }

    /// Create new content and add it to the registry
    public entry fun create_content(
        creator: &signer,
        id: String,
        content_hash: String,
        content_type: String,
        description: String,
        tags: vector<String>
    ) acquires ContentRegistryState {
        let creator_addr = signer::address_of(creator);
        
        // Get the registry state
        let registry_state = borrow_global_mut<ContentRegistryState>(@aptosagora);
        
        // Verify the content doesn't already exist
        assert!(!table::contains(&registry_state.contents, id), error::already_exists(ERROR_CONTENT_ALREADY_EXISTS));
        
        // Create the content object
        let content = Content {
            id,
            creator: creator_addr,
            content_hash,
            content_type,
            description,
            tags,
            created_at: timestamp::now_seconds(),
            updated_at: timestamp::now_seconds(),
            engagement_count: 0,
            is_active: true,
        };
        
        // Create the object and store a reference in the registry
        let content_obj = object::create_object_from_account(creator);
        let content_signer = object::generate_signer(&content_obj);
        move_to(&content_signer, content);
        
        // Add to registry
        table::add(&mut registry_state.contents, id, content_obj);
        
        // Emit event
        event::emit_event(
            &mut registry_state.content_created_events,
            ContentCreatedEvent {
                content_id: id,
                creator: creator_addr,
                content_type,
                timestamp: timestamp::now_seconds(),
            }
        );
    }

    /// Update existing content metadata
    public entry fun update_content(
        updater: &signer,
        content_id: String,
        content_hash: String,
        description: String,
        tags: vector<String>
    ) acquires ContentRegistryState {
        let updater_addr = signer::address_of(updater);
        
        // Get the registry state
        let registry_state = borrow_global_mut<ContentRegistryState>(@aptosagora);
        
        // Verify the content exists
        assert!(table::contains(&registry_state.contents, content_id), error::not_found(ERROR_CONTENT_DOES_NOT_EXIST));
        
        // Get the content object
        let content_obj = table::borrow(&registry_state.contents, content_id);
        let content = borrow_global_mut<Content>(object::object_address(content_obj));
        
        // Verify the updater is the creator
        assert!(content.creator == updater_addr, error::permission_denied(ERROR_NOT_AUTHORIZED));
        
        // Update content
        content.content_hash = content_hash;
        content.description = description;
        content.tags = tags;
        content.updated_at = timestamp::now_seconds();
        
        // Emit event
        event::emit_event(
            &mut registry_state.content_updated_events,
            ContentUpdatedEvent {
                content_id,
                updater: updater_addr,
                timestamp: timestamp::now_seconds(),
            }
        );
    }

    /// Record content engagement (view, like, share, etc.)
    public entry fun record_engagement(
        user: &signer,
        content_id: String, 
        engagement_type: String
    ) acquires ContentRegistryState {
        let user_addr = signer::address_of(user);
        
        // Get the registry state
        let registry_state = borrow_global_mut<ContentRegistryState>(@aptosagora);
        
        // Verify the content exists
        assert!(table::contains(&registry_state.contents, content_id), error::not_found(ERROR_CONTENT_DOES_NOT_EXIST));
        
        // Get the content object
        let content_obj = table::borrow(&registry_state.contents, content_id);
        let content = borrow_global_mut<Content>(object::object_address(content_obj));
        
        // Update engagement count
        content.engagement_count = content.engagement_count + 1;
        
        // Emit event
        event::emit_event(
            &mut registry_state.content_engagement_events,
            ContentEngagementEvent {
                content_id,
                user: user_addr,
                engagement_type,
                timestamp: timestamp::now_seconds(),
            }
        );
    }

    /// Deactivate content (soft deletion)
    public entry fun deactivate_content(
        creator: &signer,
        content_id: String
    ) acquires ContentRegistryState {
        let creator_addr = signer::address_of(creator);
        
        // Get the registry state
        let registry_state = borrow_global_mut<ContentRegistryState>(@aptosagora);
        
        // Verify the content exists
        assert!(table::contains(&registry_state.contents, content_id), error::not_found(ERROR_CONTENT_DOES_NOT_EXIST));
        
        // Get the content object
        let content_obj = table::borrow(&registry_state.contents, content_id);
        let content = borrow_global_mut<Content>(object::object_address(content_obj));
        
        // Verify the updater is the creator
        assert!(content.creator == creator_addr, error::permission_denied(ERROR_NOT_AUTHORIZED));
        
        // Deactivate content
        content.is_active = false;
        content.updated_at = timestamp::now_seconds();
        
        // Emit event
        event::emit_event(
            &mut registry_state.content_updated_events,
            ContentUpdatedEvent {
                content_id,
                updater: creator_addr,
                timestamp: timestamp::now_seconds(),
            }
        );
    }

    #[view]
    /// Get content by ID (view function)
    public fun get_content(content_id: String): (
        address, // creator
        String,  // content_hash
        String,  // content_type
        String,  // description
        vector<String>, // tags
        u64,     // created_at
        u64,     // updated_at
        u64,     // engagement_count
        bool     // is_active
    ) acquires ContentRegistryState {
        // Get the registry state
        let registry_state = borrow_global<ContentRegistryState>(@aptosagora);
        
        // Verify the content exists
        assert!(table::contains(&registry_state.contents, content_id), error::not_found(ERROR_CONTENT_DOES_NOT_EXIST));
        
        // Get the content object
        let content_obj = table::borrow(&registry_state.contents, content_id);
        let content = borrow_global<Content>(object::object_address(content_obj));
        
        (
            content.creator,
            content.content_hash,
            content.content_type,
            content.description,
            content.tags,
            content.created_at,
            content.updated_at,
            content.engagement_count,
            content.is_active
        )
    }
} 