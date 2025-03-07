module aptosagora::agent_framework {
    use std::string::{String};
    use std::signer;
    use std::error;
    use std::vector;
    use aptos_framework::account::{Self, SignerCapability};
    use aptos_framework::resource_account;
    use aptos_framework::timestamp;
    use aptos_framework::event::{Self, EventHandle};
    use aptos_framework::object::{Self, Object};
    
    /// Error codes
    const ERROR_NOT_AUTHORIZED: u64 = 1;
    const ERROR_AGENT_ALREADY_EXISTS: u64 = 2;
    const ERROR_AGENT_DOES_NOT_EXIST: u64 = 3;
    const ERROR_INVALID_AGENT_TYPE: u64 = 4;
    
    /// Agent types
    const AGENT_TYPE_CREATOR: u64 = 1;
    const AGENT_TYPE_CURATOR: u64 = 2;
    const AGENT_TYPE_DISTRIBUTOR: u64 = 3;
    
    /// Agent status
    const AGENT_STATUS_ACTIVE: u64 = 1;
    const AGENT_STATUS_PAUSED: u64 = 2;
    const AGENT_STATUS_RETIRED: u64 = 3;
    
    /// Agent struct representing an AI agent
    struct Agent has key, store {
        /// Agent ID
        id: String,
        /// Owner of the agent
        owner: address,
        /// Agent type (creator, curator, distributor)
        agent_type: u64,
        /// Agent name
        name: String,
        /// Agent description
        description: String,
        /// Agent configuration metadata
        config: String,
        /// Agent status
        status: u64,
        /// Creation timestamp
        created_at: u64,
        /// Last update timestamp
        updated_at: u64,
        /// Total successful operations count
        operation_count: u64,
        /// Agent resource account capability for autonomous operations
        signer_cap: Option<SignerCapability>,
    }
    
    /// Agent created event
    struct AgentCreatedEvent has drop, store {
        id: String,
        owner: address,
        agent_type: u64,
        name: String,
        timestamp: u64,
    }
    
    /// Agent updated event
    struct AgentUpdatedEvent has drop, store {
        id: String,
        owner: address,
        timestamp: u64,
    }
    
    /// Agent operation event
    struct AgentOperationEvent has drop, store {
        id: String,
        operation_type: String,
        timestamp: u64,
    }
    
    /// Module state for agent framework
    struct AgentFrameworkState has key {
        /// All registered agents
        agents: vector<Object<Agent>>,
        /// Events
        agent_created_events: EventHandle<AgentCreatedEvent>,
        agent_updated_events: EventHandle<AgentUpdatedEvent>,
        agent_operation_events: EventHandle<AgentOperationEvent>,
    }
    
    /// Initialize the agent framework module
    fun init_module(account: &signer) {
        let state = AgentFrameworkState {
            agents: vector::empty(),
            agent_created_events: account::new_event_handle<AgentCreatedEvent>(account),
            agent_updated_events: account::new_event_handle<AgentUpdatedEvent>(account),
            agent_operation_events: account::new_event_handle<AgentOperationEvent>(account),
        };
        move_to(account, state);
    }
    
    /// Create a new AI agent
    public entry fun create_agent(
        owner: &signer,
        id: String,
        agent_type: u64,
        name: String,
        description: String,
        config: String,
        with_resource_account: bool
    ) acquires AgentFrameworkState {
        let owner_addr = signer::address_of(owner);
        
        // Validate agent type
        assert!(
            agent_type == AGENT_TYPE_CREATOR || 
            agent_type == AGENT_TYPE_CURATOR || 
            agent_type == AGENT_TYPE_DISTRIBUTOR,
            error::invalid_argument(ERROR_INVALID_AGENT_TYPE)
        );
        
        // Check if agent with this ID already exists
        assert!(!agent_exists(id), error::already_exists(ERROR_AGENT_ALREADY_EXISTS));
        
        // Create resource account if needed
        let signer_cap_opt = if (with_resource_account) {
            // Create a resource account with a unique seed based on owner and agent ID
            let seed = vector::empty<u8>();
            vector::append(&mut seed, owner_addr);
            vector::append(&mut seed, b"agent_");
            vector::append(&mut seed, *std::string::bytes(&id));
            
            // Create resource account and get signer capability
            let (_, signer_cap) = resource_account::create_resource_account(owner, seed);
            std::option::some(signer_cap)
        } else {
            std::option::none()
        };
        
        // Create the agent object
        let agent = Agent {
            id,
            owner: owner_addr,
            agent_type,
            name,
            description,
            config,
            status: AGENT_STATUS_ACTIVE,
            created_at: timestamp::now_seconds(),
            updated_at: timestamp::now_seconds(),
            operation_count: 0,
            signer_cap: signer_cap_opt,
        };
        
        // Create object and store agent data
        let agent_obj = object::create_object_from_account(owner);
        let agent_signer = object::generate_signer(&agent_obj);
        move_to(&agent_signer, agent);
        
        // Add to registry
        let state = borrow_global_mut<AgentFrameworkState>(@aptosagora);
        vector::push_back(&mut state.agents, agent_obj);
        
        // Emit event
        event::emit_event(
            &mut state.agent_created_events,
            AgentCreatedEvent {
                id,
                owner: owner_addr,
                agent_type,
                name,
                timestamp: timestamp::now_seconds(),
            }
        );
    }
    
    /// Update agent configuration
    public entry fun update_agent(
        owner: &signer,
        id: String,
        name: String,
        description: String,
        config: String
    ) acquires AgentFrameworkState {
        let owner_addr = signer::address_of(owner);
        
        // Check if agent exists
        assert!(agent_exists(id), error::not_found(ERROR_AGENT_DOES_NOT_EXIST));
        
        // Get the agent
        let agent_obj = get_agent_object(id);
        let agent = borrow_global_mut<Agent>(object::object_address(&agent_obj));
        
        // Verify ownership
        assert!(agent.owner == owner_addr, error::permission_denied(ERROR_NOT_AUTHORIZED));
        
        // Update agent
        agent.name = name;
        agent.description = description;
        agent.config = config;
        agent.updated_at = timestamp::now_seconds();
        
        // Emit event
        let state = borrow_global_mut<AgentFrameworkState>(@aptosagora);
        event::emit_event(
            &mut state.agent_updated_events,
            AgentUpdatedEvent {
                id,
                owner: owner_addr,
                timestamp: timestamp::now_seconds(),
            }
        );
    }
    
    /// Update agent status (active, paused, retired)
    public entry fun update_agent_status(
        owner: &signer,
        id: String,
        status: u64
    ) acquires AgentFrameworkState {
        let owner_addr = signer::address_of(owner);
        
        // Validate status
        assert!(
            status == AGENT_STATUS_ACTIVE || 
            status == AGENT_STATUS_PAUSED || 
            status == AGENT_STATUS_RETIRED,
            error::invalid_argument(ERROR_INVALID_AGENT_TYPE)
        );
        
        // Check if agent exists
        assert!(agent_exists(id), error::not_found(ERROR_AGENT_DOES_NOT_EXIST));
        
        // Get the agent
        let agent_obj = get_agent_object(id);
        let agent = borrow_global_mut<Agent>(object::object_address(&agent_obj));
        
        // Verify ownership
        assert!(agent.owner == owner_addr, error::permission_denied(ERROR_NOT_AUTHORIZED));
        
        // Update status
        agent.status = status;
        agent.updated_at = timestamp::now_seconds();
        
        // Emit event
        let state = borrow_global_mut<AgentFrameworkState>(@aptosagora);
        event::emit_event(
            &mut state.agent_updated_events,
            AgentUpdatedEvent {
                id,
                owner: owner_addr,
                timestamp: timestamp::now_seconds(),
            }
        );
    }
    
    /// Record an agent operation
    public fun record_operation(
        id: String,
        operation_type: String
    ) acquires AgentFrameworkState {
        // Check if agent exists
        assert!(agent_exists(id), error::not_found(ERROR_AGENT_DOES_NOT_EXIST));
        
        // Get the agent
        let agent_obj = get_agent_object(id);
        let agent = borrow_global_mut<Agent>(object::object_address(&agent_obj));
        
        // Update operation count
        agent.operation_count = agent.operation_count + 1;
        agent.updated_at = timestamp::now_seconds();
        
        // Emit event
        let state = borrow_global_mut<AgentFrameworkState>(@aptosagora);
        event::emit_event(
            &mut state.agent_operation_events,
            AgentOperationEvent {
                id,
                operation_type,
                timestamp: timestamp::now_seconds(),
            }
        );
    }
    
    /// Get agent resource account signer (for privileged operations)
    public fun get_agent_signer(id: String): signer acquires Agent {
        // Check if agent exists and get object address
        assert!(agent_exists(id), error::not_found(ERROR_AGENT_DOES_NOT_EXIST));
        let agent_obj = get_agent_object(id);
        let agent_addr = object::object_address(&agent_obj);
        
        // Get the agent
        let agent = borrow_global<Agent>(agent_addr);
        
        // Verify agent has resource account capability
        assert!(std::option::is_some(&agent.signer_cap), error::invalid_state(ERROR_NOT_AUTHORIZED));
        
        // Get signer from capability
        account::create_signer_with_capability(std::option::borrow(&agent.signer_cap))
    }
    
    /// Check if an agent exists by ID
    public fun agent_exists(id: String): bool acquires AgentFrameworkState {
        let state = borrow_global<AgentFrameworkState>(@aptosagora);
        let i = 0;
        let len = vector::length(&state.agents);
        
        while (i < len) {
            let agent_obj = vector::borrow(&state.agents, i);
            let agent = borrow_global<Agent>(object::object_address(agent_obj));
            if (agent.id == id) {
                return true
            };
            i = i + 1;
        };
        
        false
    }
    
    #[view]
    /// Get agent information (view function)
    public fun get_agent(id: String): (
        address, // owner
        u64, // agent_type
        String, // name
        String, // description
        String, // config
        u64, // status
        u64, // created_at
        u64, // updated_at
        u64, // operation_count
        bool // has_resource_account
    ) acquires AgentFrameworkState {
        // Check if agent exists
        assert!(agent_exists(id), error::not_found(ERROR_AGENT_DOES_NOT_EXIST));
        
        // Get the agent
        let agent_obj = get_agent_object(id);
        let agent = borrow_global<Agent>(object::object_address(&agent_obj));
        
        (
            agent.owner,
            agent.agent_type,
            agent.name,
            agent.description,
            agent.config,
            agent.status,
            agent.created_at,
            agent.updated_at,
            agent.operation_count,
            std::option::is_some(&agent.signer_cap)
        )
    }
    
    /// Helper function to get agent object
    fun get_agent_object(id: String): Object<Agent> acquires AgentFrameworkState {
        let state = borrow_global<AgentFrameworkState>(@aptosagora);
        let i = 0;
        let len = vector::length(&state.agents);
        
        while (i < len) {
            let agent_obj = *vector::borrow(&state.agents, i);
            let agent = borrow_global<Agent>(object::object_address(&agent_obj));
            if (agent.id == id) {
                return agent_obj
            };
            i = i + 1;
        };
        
        abort error::not_found(ERROR_AGENT_DOES_NOT_EXIST)
    }
} 