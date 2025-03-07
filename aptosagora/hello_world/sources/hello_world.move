module aptosagora::hello_world {
    use std::string;
    use std::signer;
    
    struct MessageHolder has key {
        message: string::String,
    }
    
    public entry fun set_message(account: &signer, message: string::String) acquires MessageHolder {
        let account_addr = signer::address_of(account);
        
        if (!exists<MessageHolder>(account_addr)) {
            move_to(account, MessageHolder { message });
        } else {
            let old_message_holder = borrow_global_mut<MessageHolder>(account_addr);
            old_message_holder.message = message;
        }
    }
    
    #[view]
    public fun get_message(addr: address): string::String acquires MessageHolder {
        if (!exists<MessageHolder>(addr)) {
            return string::utf8(b"No message set")
        } else {
            let message_holder = borrow_global<MessageHolder>(addr);
            return message_holder.message
        }
    }
} 