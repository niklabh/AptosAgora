script {
    use std::signer;
    use aptos_framework::account;
    use aptos_framework::resource_account;
    
    /// Initialize AptosAgora modules
    fun main(admin: &signer) {
        let admin_addr = signer::address_of(admin);
        
        // Create a resource account for AptosAgora
        let seed = b"aptosagora";
        let (resource_signer, resource_cap) = account::create_resource_account(admin, seed);
        
        // Initialize modules
        // Note: Module initialization happens automatically in Move via the init_module function
        // This script just ensures the resource account is created properly
        
        // Store the resource account signer capability somewhere accessible
        // (Not shown here as it depends on the module structure)
    }
} 