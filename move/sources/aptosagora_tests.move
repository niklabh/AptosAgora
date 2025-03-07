module aptosagora::aptosagora_tests {
    use std::signer;
    use std::string::{Self, String};
    use std::vector;
    use std::option;
    
    use aptos_framework::coin;
    use aptos_framework::account;
    use aptos_framework::timestamp;
    use aptos_std::table::{Self, Table};
    
    use aptosagora::content_registry;
    use aptosagora::creator_profiles;
    use aptosagora::agent_framework;
    use aptosagora::token_economics;
    use aptosagora::reputation_system;
    use aptosagora::recommendation_engine;
    
    // Test Cases

    #[test(admin = @aptosagora, user1 = @0x123, user2 = @0x456)]
    fun test_create_content(admin: &signer, user1: &signer, user2: &signer) {
        // Initialize the module
        timestamp::set_time_has_started_for_testing(admin);
        
        let admin_addr = signer::address_of(admin);
        let user1_addr = signer::address_of(user1);
        let user2_addr = signer::address_of(user2);
        
        // Setup accounts
        account::create_account_for_test(admin_addr);
        account::create_account_for_test(user1_addr);
        account::create_account_for_test(user2_addr);
        
        // Initialize modules
        content_registry::init_module(admin);
        creator_profiles::init_module(admin);
        
        // Create content
        let content_hash = string::utf8(b"0x1234567890abcdef");
        let content_type = string::utf8(b"article");
        let description = string::utf8(b"Test article content");
        let mut tags = vector::empty<String>();
        vector::push_back(&mut tags, string::utf8(b"test"));
        vector::push_back(&mut tags, string::utf8(b"article"));
        
        content_registry::create_content(user1, content_hash, content_type, description, tags);
        
        // Verify content creation
        let content_exists = content_registry::content_exists(user1_addr, content_hash);
        assert!(content_exists, 1);
        
        // Test content engagement
        content_registry::engage_with_content(user2, user1_addr, content_hash, string::utf8(b"view"));
        
        // Verify engagement
        let engagement_count = content_registry::get_engagement_count(user1_addr, content_hash);
        assert!(engagement_count == 1, 2);
    }
    
    #[test(admin = @aptosagora, creator = @0x123)]
    fun test_creator_profile(admin: &signer, creator: &signer) {
        // Initialize the module
        timestamp::set_time_has_started_for_testing(admin);
        
        let admin_addr = signer::address_of(admin);
        let creator_addr = signer::address_of(creator);
        
        // Setup accounts
        account::create_account_for_test(admin_addr);
        account::create_account_for_test(creator_addr);
        
        // Initialize modules
        creator_profiles::init_module(admin);
        
        // Create profile
        let name = string::utf8(b"Test Creator");
        let bio = string::utf8(b"I create test content for Aptos");
        let social_links = string::utf8(b"{\"twitter\":\"@testcreator\",\"github\":\"testcreator\"}");
        
        creator_profiles::create_profile(creator, name, bio, social_links);
        
        // Verify profile creation
        let profile_exists = creator_profiles::profile_exists(creator_addr);
        assert!(profile_exists, 1);
        
        // Update profile
        let new_bio = string::utf8(b"Updated bio for test creator");
        creator_profiles::update_profile(creator, name, new_bio, social_links);
        
        // Verify profile update
        let updated_bio = creator_profiles::get_bio(creator_addr);
        assert!(updated_bio == new_bio, 2);
    }
    
    #[test(admin = @aptosagora, agent_owner = @0x123)]
    fun test_agent_framework(admin: &signer, agent_owner: &signer) {
        // Initialize the module
        timestamp::set_time_has_started_for_testing(admin);
        
        let admin_addr = signer::address_of(admin);
        let owner_addr = signer::address_of(agent_owner);
        
        // Setup accounts
        account::create_account_for_test(admin_addr);
        account::create_account_for_test(owner_addr);
        
        // Initialize modules
        agent_framework::init_module(admin);
        
        // Create agent
        let agent_type = string::utf8(b"creator");
        let name = string::utf8(b"Test Agent");
        let description = string::utf8(b"A test agent for content creation");
        let configuration = string::utf8(b"{\"model\":\"gpt-4\",\"temperature\":0.7}");
        let is_autonomous = true;
        
        agent_framework::create_agent(agent_owner, agent_type, name, description, configuration, is_autonomous);
        
        // Verify agent creation
        let agent_exists = agent_framework::agent_exists(owner_addr, name);
        assert!(agent_exists, 1);
        
        // Test agent activation/deactivation
        agent_framework::deactivate_agent(agent_owner, name);
        let is_active = agent_framework::is_agent_active(owner_addr, name);
        assert!(!is_active, 2);
        
        agent_framework::activate_agent(agent_owner, name);
        let is_active = agent_framework::is_agent_active(owner_addr, name);
        assert!(is_active, 3);
    }
    
    #[test(admin = @aptosagora, user1 = @0x123, user2 = @0x456)]
    fun test_reputation_system(admin: &signer, user1: &signer, user2: &signer) {
        // Initialize the module
        timestamp::set_time_has_started_for_testing(admin);
        
        let admin_addr = signer::address_of(admin);
        let user1_addr = signer::address_of(user1);
        let user2_addr = signer::address_of(user2);
        
        // Setup accounts
        account::create_account_for_test(admin_addr);
        account::create_account_for_test(user1_addr);
        account::create_account_for_test(user2_addr);
        
        // Initialize modules
        content_registry::init_module(admin);
        reputation_system::init_module(admin);
        
        // Create content first
        let content_hash = string::utf8(b"0x1234567890abcdef");
        let content_type = string::utf8(b"article");
        let description = string::utf8(b"Test article content");
        let mut tags = vector::empty<String>();
        vector::push_back(&mut tags, string::utf8(b"test"));
        
        content_registry::create_content(user1, content_hash, content_type, description, tags);
        
        // Rate content
        let rating = 4; // Rating from 1-5
        let feedback = string::utf8(b"Good content, very informative");
        
        reputation_system::rate_content(user2, user1_addr, content_hash, rating, feedback);
        
        // Verify rating
        let has_rated = reputation_system::has_user_rated(user2_addr, user1_addr, content_hash);
        assert!(has_rated, 1);
        
        // Check average rating
        let avg_rating = reputation_system::get_content_rating(user1_addr, content_hash);
        assert!(avg_rating == 4, 2);
    }
    
    #[test(admin = @aptosagora)]
    fun test_token_economics(admin: &signer) {
        // Initialize the module
        timestamp::set_time_has_started_for_testing(admin);
        
        let admin_addr = signer::address_of(admin);
        
        // Setup accounts
        account::create_account_for_test(admin_addr);
        
        // Initialize modules
        token_economics::init_module(admin);
        
        // Verify token initialization
        let token_exists = token_economics::token_exists();
        assert!(token_exists, 1);
        
        // Check total supply
        let total_supply = token_economics::get_total_supply();
        assert!(total_supply > 0, 2);
    }
    
    #[test(admin = @aptosagora, user = @0x123)]
    fun test_recommendation_engine(admin: &signer, user: &signer) {
        // Initialize the module
        timestamp::set_time_has_started_for_testing(admin);
        
        let admin_addr = signer::address_of(admin);
        let user_addr = signer::address_of(user);
        
        // Setup accounts
        account::create_account_for_test(admin_addr);
        account::create_account_for_test(user_addr);
        
        // Initialize modules
        recommendation_engine::init_module(admin);
        
        // Set user preferences
        let mut preferences = vector::empty<String>();
        vector::push_back(&mut preferences, string::utf8(b"technology"));
        vector::push_back(&mut preferences, string::utf8(b"blockchain"));
        
        recommendation_engine::set_user_preferences(user, preferences);
        
        // Verify preferences
        let has_preferences = recommendation_engine::has_preferences(user_addr);
        assert!(has_preferences, 1);
    }
} 