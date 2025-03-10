#[test_only]
module aptosagora::aptosagora_tests {
    use std::signer;
    use std::string;
    use std::vector;
    use aptos_framework::account;
    use aptos_framework::timestamp;
    
    use aptosagora::content_registry;
    use aptosagora::creator_profiles;
    use aptosagora::agent_framework;
    
    /// Module address
    const APTOSAGORA_ADDR: address = @aptosagora;
    
    /// Test error codes
    const ERROR_TEST_FAILED: u64 = 1;
    
    /// Setup test environment and create test users
    fun setup_test(aptos_framework: &signer): (signer, signer, signer) {
        // Set up timestamp for testing
        timestamp::set_time_has_started_for_testing(aptos_framework);
        
        // Create test account for aptosagora
        let aptosagora_account = account::create_account_for_test(APTOSAGORA_ADDR);
        
        // Initialize modules
        content_registry::initialize_for_test(&aptosagora_account);
        creator_profiles::initialize_for_test(&aptosagora_account);
        agent_framework::initialize_for_test(&aptosagora_account);
        
        // Create test users
        let creator = create_test_user(1);
        let user1 = create_test_user(2);
        let user2 = create_test_user(3);
        
        // Return signers
        (creator, user1, user2)
    }
    
    /// Create a test user with the given index
    fun create_test_user(index: u64): signer {
        let addr = if (index == 1) @0x101 
                 else if (index == 2) @0x102
                 else if (index == 3) @0x103
                 else if (index == 4) @0x104
                 else @0x100;
        
        account::create_account_for_test(addr)
    }
    
    #[test(aptos_framework = @aptos_framework)]
    fun test_content_creation_and_update(aptos_framework: &signer) {
        // Set up test environment
        let (creator, user1, _) = setup_test(aptos_framework);
        
        // Create content
        let content_id = string::utf8(b"content1");
        let content_hash = string::utf8(b"ipfs://QmHash1");
        let content_type = string::utf8(b"article");
        let description = string::utf8(b"Test content description");
        let tags = vector[string::utf8(b"test"), string::utf8(b"article")];
        
        content_registry::create_content_for_test(
            &creator,
            content_id,
            content_hash,
            content_type,
            description,
            tags
        );
        
        // Get content
        let (
            creator_addr, 
            returned_hash, 
            returned_type, 
            returned_desc, 
            returned_tags, 
            _, 
            _, 
            engagement_count, 
            is_active
        ) = content_registry::get_content_for_test(content_id);
        
        // Verify content data
        assert!(creator_addr == signer::address_of(&creator), ERROR_TEST_FAILED);
        assert!(returned_hash == content_hash, ERROR_TEST_FAILED);
        assert!(returned_type == content_type, ERROR_TEST_FAILED);
        assert!(returned_desc == description, ERROR_TEST_FAILED);
        assert!(vector::length(&returned_tags) == 2, ERROR_TEST_FAILED);
        assert!(engagement_count == 0, ERROR_TEST_FAILED);
        assert!(is_active == true, ERROR_TEST_FAILED);
        
        // Update content
        let new_hash = string::utf8(b"ipfs://QmHash2");
        let new_desc = string::utf8(b"Updated description");
        let new_tags = vector[string::utf8(b"test"), string::utf8(b"article"), string::utf8(b"updated")];
        
        content_registry::update_content_for_test(
            &creator,
            content_id,
            new_hash,
            new_desc,
            new_tags
        );
        
        // Get updated content
        let (
            _, 
            returned_hash, 
            _, 
            returned_desc, 
            returned_tags, 
            _, 
            _, 
            _, 
            _
        ) = content_registry::get_updated_content_for_test(content_id);
        
        // Verify updated content
        assert!(returned_hash == new_hash, ERROR_TEST_FAILED);
        assert!(returned_desc == new_desc, ERROR_TEST_FAILED);
        assert!(vector::length(&returned_tags) == 3, ERROR_TEST_FAILED);
        
        // Record engagement
        content_registry::record_engagement_for_test(
            &user1,
            content_id,
            string::utf8(b"view")
        );
        
        // Verify engagement count
        let (
            _, 
            _, 
            _, 
            _, 
            _, 
            _, 
            _, 
            engagement_count, 
            _
        ) = content_registry::get_content_with_engagement_for_test(content_id);
        
        assert!(engagement_count == 1, ERROR_TEST_FAILED);
    }
    
    #[test(aptos_framework = @aptos_framework)]
    fun test_creator_profile(aptos_framework: &signer) {
        // Set up test environment
        let (creator, _, _) = setup_test(aptos_framework);
        
        // Create profile
        let name = string::utf8(b"Creator Name");
        let bio = string::utf8(b"Creator bio text");
        let avatar_url = string::utf8(b"https://example.com/avatar.jpg");
        let social_links = vector[
            string::utf8(b"https://twitter.com/creator"),
            string::utf8(b"https://instagram.com/creator")
        ];
        let content_categories = vector[
            string::utf8(b"art"),
            string::utf8(b"photography")
        ];
        
        creator_profiles::create_profile_for_test(
            &creator,
            name,
            bio,
            avatar_url,
            social_links,
            content_categories
        );
        
        // Verify profile exists
        assert!(creator_profiles::profile_exists_for_test(signer::address_of(&creator)), ERROR_TEST_FAILED);
        
        // Get profile
        let (
            returned_name,
            returned_bio,
            returned_avatar,
            returned_social,
            returned_categories,
            _,
            _,
            is_verified,
            reputation_score
        ) = creator_profiles::get_profile_for_test(signer::address_of(&creator));
        
        // Verify profile data
        assert!(returned_name == name, ERROR_TEST_FAILED);
        assert!(returned_bio == bio, ERROR_TEST_FAILED);
        assert!(returned_avatar == avatar_url, ERROR_TEST_FAILED);
        assert!(vector::length(&returned_social) == 2, ERROR_TEST_FAILED);
        assert!(vector::length(&returned_categories) == 2, ERROR_TEST_FAILED);
        assert!(!is_verified, ERROR_TEST_FAILED);
        assert!(reputation_score == 0, ERROR_TEST_FAILED);
        
        // Update profile
        let new_name = string::utf8(b"Updated Name");
        let new_bio = string::utf8(b"Updated bio text");
        let new_avatar = string::utf8(b"https://example.com/new_avatar.jpg");
        let new_social = vector[
            string::utf8(b"https://twitter.com/creator"),
            string::utf8(b"https://instagram.com/creator"),
            string::utf8(b"https://youtube.com/creator")
        ];
        let new_categories = vector[
            string::utf8(b"art"),
            string::utf8(b"photography"),
            string::utf8(b"design")
        ];
        
        creator_profiles::update_profile_for_test(
            &creator,
            new_name,
            new_bio,
            new_avatar,
            new_social,
            new_categories
        );
        
        // Get updated profile
        let (
            returned_name,
            returned_bio,
            returned_avatar,
            returned_social,
            returned_categories,
            _,
            _,
            _,
            _
        ) = creator_profiles::get_updated_profile_for_test(signer::address_of(&creator));
        
        // Verify updated data
        assert!(returned_name == new_name, ERROR_TEST_FAILED);
        assert!(returned_bio == new_bio, ERROR_TEST_FAILED);
        assert!(returned_avatar == new_avatar, ERROR_TEST_FAILED);
        assert!(vector::length(&returned_social) == 3, ERROR_TEST_FAILED);
        assert!(vector::length(&returned_categories) == 3, ERROR_TEST_FAILED);
    }
    
    #[test(aptos_framework = @aptos_framework)]
    fun test_agent_creation(aptos_framework: &signer) {
        // Set up test environment
        let (creator, _, _) = setup_test(aptos_framework);
        
        // Create agent
        let agent_id = string::utf8(b"agent1");
        let agent_type = 1; // Creator agent
        let name = string::utf8(b"AI Assistant");
        let description = string::utf8(b"Content creation assistant");
        let config = string::utf8(b"{\"model\":\"gpt-4\",\"temperature\":0.7}");
        
        agent_framework::create_agent_for_test(
            &creator,
            agent_id,
            agent_type,
            name,
            description,
            config
        );
        
        // Verify agent exists and check its data
        let (
            agent_owner,
            returned_type,
            returned_name,
            returned_desc,
            returned_config,
            status,
            _,
            _,
            operation_count,
            has_resource_account
        ) = agent_framework::get_agent_for_test(agent_id);
        
        assert!(agent_owner == signer::address_of(&creator), ERROR_TEST_FAILED);
        assert!(returned_type == agent_type, ERROR_TEST_FAILED);
        assert!(returned_name == agent_id, ERROR_TEST_FAILED);
        assert!(returned_desc == description, ERROR_TEST_FAILED);
        assert!(returned_config == config, ERROR_TEST_FAILED);
        assert!(status == 1, ERROR_TEST_FAILED); // ACTIVE status
        assert!(operation_count == 0, ERROR_TEST_FAILED);
        assert!(has_resource_account == true, ERROR_TEST_FAILED);
    }
} 