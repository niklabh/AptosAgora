# AptosAgora Architecture

This document outlines the architecture of the AptosAgora platform, a decentralized content marketplace with AI agent integration built on the Aptos blockchain.

## System Overview

AptosAgora consists of several interconnected components:

1. **Move Smart Contracts**: Core blockchain logic implemented in Move language
2. **Frontend Application**: User interface built with Next.js and React
3. **AI Agent System**: Integration with AI services for content optimization
4. **IPFS Integration**: Off-chain storage for content data

## Smart Contract Architecture

The Move modules are designed with a modular architecture to separate concerns:

```
┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│  Content Registry   │     │   Creator Profiles  │     │   Agent Framework   │
└─────────────────────┘     └─────────────────────┘     └─────────────────────┘
          │                           │                           │
          │                           │                           │
          ▼                           ▼                           ▼
┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│  Token Economics    │     │ Recommendation Engine│     │  Reputation System  │
└─────────────────────┘     └─────────────────────┘     └─────────────────────┘
```

### Module Responsibilities

1. **Content Registry**
   - Manages content metadata storage
   - Handles content ownership and access control
   - Tracks content engagement metrics

2. **Creator Profiles**
   - Manages creator identity information
   - Stores creator reputation and verification status
   - Links creators to their content

3. **Agent Framework**
   - Provides infrastructure for AI agent operations
   - Manages agent lifecycle and permissions
   - Enables autonomous agent actions via resource accounts

4. **Token Economics**
   - Implements token distribution mechanisms
   - Manages rewards for content creation and curation
   - Handles token minting and burning

5. **Recommendation Engine**
   - Stores user preferences and content interactions
   - Manages content recommendation algorithms
   - Tracks recommendation effectiveness

6. **Reputation System**
   - Tracks content quality through ratings
   - Manages content flagging and moderation
   - Updates creator reputation based on content performance

## Data Model

### Content

Content is represented as a Move Object with the following structure:

```
struct Content {
    id: String,
    creator: address,
    content_hash: String,
    content_type: String,
    description: String,
    tags: vector<String>,
    created_at: u64,
    updated_at: u64,
    engagement_count: u64,
    is_active: bool,
}
```

### Creator Profile

Creator profiles are stored as Move Objects:

```
struct CreatorProfile {
    owner: address,
    name: String,
    bio: String,
    avatar_url: String,
    social_links: vector<String>,
    content_categories: vector<String>,
    created_at: u64,
    updated_at: u64,
    is_verified: bool,
    reputation_score: u64,
}
```

### AI Agent

AI agents are represented as:

```
struct Agent {
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
    signer_cap: Option<SignerCapability>,
}
```

## Transaction Flow

1. **Content Creation**
   - User creates content metadata on-chain
   - Content files are stored on IPFS
   - Content hash is recorded on-chain
   - Creator receives tokens as reward

2. **AI Agent Creation**
   - User configures AI agent parameters
   - Agent is registered on-chain
   - Resource account is created for autonomous operations (optional)

3. **Content Engagement**
   - Users interact with content (view, like, share)
   - Engagement is recorded on-chain
   - Reputation scores are updated
   - Tokens are distributed as rewards

## Security Considerations

1. **Access Control**
   - Only content creators can update their content
   - Only agent owners can modify their agents
   - Module functions have appropriate permission checks

2. **Resource Accounts**
   - Agent resource accounts have limited capabilities
   - Operations are restricted to specific functions
   - Resource account creation requires owner authorization

3. **Content Moderation**
   - Content can be flagged by users
   - Flagged content undergoes review
   - Malicious content can be deactivated

## Future Enhancements

1. **Enhanced AI Integration**
   - Integration with more advanced AI models
   - On-chain AI model registry
   - Decentralized AI computation

2. **Cross-Chain Functionality**
   - Bridge to other blockchains
   - Multi-chain content distribution
   - Cross-chain token economics

3. **Governance System**
   - Community-driven platform governance
   - Proposal and voting mechanisms
   - Treasury management 