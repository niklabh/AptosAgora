module aptosagora::agent_framework {
    use std::string::{String};
    use std::signer;
    use std::error;
    use std::vector;
    use std::option;
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
    const AGENT_STATUS_INACTIVE: u64 = 0;
    const AGENT_STATUS_ACTIVE: u64 = 1;

    /// Agent structure
    struct Agent has key, store {
        id: String,
        owner: address,
        agent_type: u64,
        name: String,
        description: String,
        config: String,
        status: u64,
        created_at: u64,
        updated_at: u64,
        operation_count: u64,
        signer_cap: option::Option<SignerCapability>,
    }

    /// Agent state
    struct AgentFrameworkState has key {
        agents: vector<Object<Agent>>,
        agent_events: EventHandle<AgentCreatedEvent>,
        agent_activation_events: EventHandle<AgentStatusEvent>,
    }

    /// Agent created event
    struct AgentCreatedEvent has drop, store {
        id: String,
        owner: address,
        agent_type: u64,
        timestamp: u64,
    }
    
    /// Agent status event
    struct AgentStatusEvent has drop, store {
        id: String,
        owner: address,
        status: u64,
        timestamp: u64,
    }
    
    /// Agent operation event
    struct AgentOperationEvent has drop, store {
        agent_id: String,
        operation_type: String,
        timestamp: u64,
    }

    // View function to get agent information
    #[view]
    public fun get_agent(owner: address, agent_id: String): (String, String, String, bool, u64) acquires Agent, AgentFrameworkState {
        // Check if agent exists
        assert!(agent_exists(owner, agent_id), error::not_found(ERROR_AGENT_DOES_NOT_EXIST));
        
        // Get agent object
        let agent_obj_addr = get_agent_object_address(owner, agent_id);
        let agent = borrow_global<Agent>(agent_obj_addr);
        
        // Return agent information
        (
            agent.name,
            agent.description,
            agent.config,
            agent.status == AGENT_STATUS_ACTIVE,
            agent.operation_count
        )
    }

    /// Check if agent exists 
    public fun agent_exists(owner: address, agent_id: String): bool acquires AgentFrameworkState {
        let state = borrow_global<AgentFrameworkState>(@aptosagora);
        
        // Linear search through agents to find the one with matching owner and id
        // In a production implementation, this would use a more efficient data structure
        let i = 0;
        let len = vector::length(&state.agents);
        while (i < len) {
            let agent_obj = vector::borrow(&state.agents, i);
            let agent_addr = object::object_address(agent_obj);
            
            if (is_agent_match(agent_addr, owner, agent_id)) {
                return true
            };
            
            i = i + 1;
        };
        
        false
    }
    
    /// Helper function to check if an agent at the given address matches owner and id
    fun is_agent_match(agent_addr: address, owner: address, agent_id: String): bool acquires Agent {
        if (!exists<Agent>(agent_addr)) {
            return false
        };
        
        let agent = borrow_global<Agent>(agent_addr);
        agent.owner == owner && agent.id == agent_id
    }
    
    /// Helper function to get agent object address
    fun get_agent_object_address(owner: address, agent_id: String): address acquires AgentFrameworkState {
        let state = borrow_global<AgentFrameworkState>(@aptosagora);
        
        // Linear search to find the agent
        let i = 0;
        let len = vector::length(&state.agents);
        while (i < len) {
            let agent_obj = vector::borrow(&state.agents, i);
            let agent_addr = object::object_address(agent_obj);
            
            if (is_agent_match(agent_addr, owner, agent_id)) {
                return agent_addr
            };
            
            i = i + 1;
        };
        
        abort error::not_found(ERROR_AGENT_DOES_NOT_EXIST)
    }

    /// Check if agent is active
    public fun is_agent_active(owner: address, agent_id: String): bool acquires Agent, AgentFrameworkState {
        assert!(agent_exists(owner, agent_id), error::not_found(ERROR_AGENT_DOES_NOT_EXIST));
        
        let agent_obj_addr = get_agent_object_address(owner, agent_id);
        let agent = borrow_global<Agent>(agent_obj_addr);
        
        agent.status == AGENT_STATUS_ACTIVE
    }

    /// Activate an agent
    public entry fun activate_agent(owner: &signer, agent_id: String) acquires Agent, AgentFrameworkState {
        let owner_addr = signer::address_of(owner);
        
        // Check if agent exists
        assert!(agent_exists(owner_addr, agent_id), error::not_found(ERROR_AGENT_DOES_NOT_EXIST));
        
        // Get agent
        let agent_obj_addr = get_agent_object_address(owner_addr, agent_id);
        let agent = borrow_global_mut<Agent>(agent_obj_addr);
        
        // Check authorization
        assert!(agent.owner == owner_addr, error::permission_denied(ERROR_NOT_AUTHORIZED));
        
        // Update status
        agent.status = AGENT_STATUS_ACTIVE;
        agent.updated_at = timestamp::now_seconds();
        
        // Emit event
        let state = borrow_global_mut<AgentFrameworkState>(@aptosagora);
        event::emit_event(
            &mut state.agent_activation_events,
            AgentStatusEvent {
                id: agent_id,
                owner: owner_addr,
                status: AGENT_STATUS_ACTIVE,
                timestamp: timestamp::now_seconds(),
            }
        );
    }

    /// Deactivate an agent
    public entry fun deactivate_agent(owner: &signer, agent_id: String) acquires Agent, AgentFrameworkState {
        let owner_addr = signer::address_of(owner);
        
        // Check if agent exists
        assert!(agent_exists(owner_addr, agent_id), error::not_found(ERROR_AGENT_DOES_NOT_EXIST));
        
        // Get agent
        let agent_obj_addr = get_agent_object_address(owner_addr, agent_id);
        let agent = borrow_global_mut<Agent>(agent_obj_addr);
        
        // Check authorization
        assert!(agent.owner == owner_addr, error::permission_denied(ERROR_NOT_AUTHORIZED));
        
        // Update status
        agent.status = AGENT_STATUS_INACTIVE;
        agent.updated_at = timestamp::now_seconds();
        
        // Emit event
        let state = borrow_global_mut<AgentFrameworkState>(@aptosagora);
        event::emit_event(
            &mut state.agent_activation_events,
            AgentStatusEvent {
                id: agent_id,
                owner: owner_addr,
                status: AGENT_STATUS_INACTIVE,
                timestamp: timestamp::now_seconds(),
            }
        );
    }

    /// Create an AI agent
    public entry fun create_agent(
        owner: &signer, 
        agent_type: String, 
        name: String, 
        description: String, 
        configuration: String, 
        is_autonomous: bool
    ) acquires AgentFrameworkState {
        let owner_addr = signer::address_of(owner);
        let agent_id = generate_agent_id(owner_addr, name);
        
        // Check if agent already exists
        assert!(!agent_exists(owner_addr, agent_id), error::already_exists(ERROR_AGENT_ALREADY_EXISTS));
        
        // Determine agent type
        let agent_type_val = if (agent_type == string::utf8(b"creator")) {
            AGENT_TYPE_CREATOR
        } else if (agent_type == string::utf8(b"curator")) {
            AGENT_TYPE_CURATOR
        } else if (agent_type == string::utf8(b"distributor")) {
            AGENT_TYPE_DISTRIBUTOR
        } else {
            abort error::invalid_argument(ERROR_INVALID_AGENT_TYPE)
        };
        
        // Create signer capability if autonomous
        let signer_cap_option = if (is_autonomous) {
            // Create a resource account for the agent
            let seed = vector::empty<u8>();
            vector::append(&mut seed, *string::bytes(&agent_id));
            
            let (_, signer_cap) = resource_account::create_resource_account(owner, seed);
            option::some(signer_cap)
        } else {
            option::none()
        };
        
        // Create agent
        let agent = Agent {
            id: agent_id,
            owner: owner_addr,
            agent_type: agent_type_val,
            name,
            description,
            config: configuration,
            status: AGENT_STATUS_INACTIVE, // Agents start as inactive
            created_at: timestamp::now_seconds(),
            updated_at: timestamp::now_seconds(),
            operation_count: 0,
            signer_cap: signer_cap_option,
        };
        
        // Create object to hold agent
        let constructor_ref = object::create_object(owner_addr);
        let object_signer = object::generate_signer(&constructor_ref);
        let obj = object::object_from_constructor_ref<Agent>(&constructor_ref);
        move_to(&object_signer, agent);
        
        // Update state
        let state = borrow_global_mut<AgentFrameworkState>(@aptosagora);
        vector::push_back(&mut state.agents, obj);
        
        // Emit event
        event::emit_event(
            &mut state.agent_events,
            AgentCreatedEvent {
                id: agent_id,
                owner: owner_addr,
                agent_type: agent_type_val,
                timestamp: timestamp::now_seconds(),
            }
        );
    }
    
    /// Generate a unique agent ID based on owner and name
    fun generate_agent_id(owner: address, name: String): String {
        // In a production environment, this would use a more sophisticated algorithm
        let timestamp_str = timestamp::now_seconds();
        let agent_id = string::utf8(b"agent_");
        string::append(&mut agent_id, name);
        string::append(&mut agent_id, string::utf8(b"_"));
        
        // Convert timestamp to string and append
        // This is a simplified implementation
        string::append_utf8(&mut agent_id, b"timestamp");
        
        agent_id
    }

    /// Initialize the module
    fun init_module(admin: &signer) {
        // Create module state
        let state = AgentFrameworkState {
            agents: vector::empty<Object<Agent>>(),
            agent_events: account::new_event_handle<AgentCreatedEvent>(admin),
            agent_activation_events: account::new_event_handle<AgentStatusEvent>(admin),
        };
        move_to(admin, state);
    }
    
    /// Get all agents for an owner
    #[view]
    public fun get_owner_agents(owner: address): vector<String> acquires AgentFrameworkState, Agent {
        let state = borrow_global<AgentFrameworkState>(@aptosagora);
        let result = vector::empty<String>();
        
        let i = 0;
        let len = vector::length(&state.agents);
        while (i < len) {
            let agent_obj = vector::borrow(&state.agents, i);
            let agent_addr = object::object_address(agent_obj);
            
            if (exists<Agent>(agent_addr)) {
                let agent = borrow_global<Agent>(agent_addr);
                if (agent.owner == owner) {
                    vector::push_back(&mut result, agent.id);
                };
            };
            
            i = i + 1;
        };
        
        result
    }
} 