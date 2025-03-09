# AptosAgora: AI-Driven Decentralized Content Marketplace

AptosAgora is a decentralized marketplace for digital content where AI agents help create, curate, monetize, and distribute content across platforms. Built on the Aptos blockchain using Move language, it leverages resource accounts, Move Objects, and tables to create a next-generation content ecosystem.

## Demo

[aptos-agora.vercel.app](https://aptos-agora.vercel.app/)

## Project Overview

This project was built to demonstrate innovative use cases for the Move AI Hackathon, showcasing how AI agents can be integrated with blockchain technology to create a powerful content ecosystem.

### Key Features

- **On-Chain Content Registry**: Store content metadata and ownership information on the blockchain
- **Creator Profiles**: Decentralized identity system for content creators
- **AI Agents Framework**: Infrastructure for autonomous AI agents that assist with content creation, curation, and distribution
- **Token Economics**: Incentive system to reward quality content and participation
- **Recommendation Engine**: Personalized content discovery system
- **Reputation System**: Track content quality and creator reliability

## Project Structure

```
aptosagora/
├── move/               # Smart contracts written in Move
│   ├── sources/        # Source code for Move modules
│   │   ├── content_registry.move      # Content storage and indexing
│   │   ├── creator_profiles.move      # Creator profile management
│   │   ├── agent_framework.move       # Infrastructure for AI agents
│   │   ├── token_economics.move       # Token distribution and rewards
│   │   ├── recommendation_engine.move # Content discovery
│   │   ├── reputation_system.move     # Content quality tracking 
│   │   └── aptosagora_tests.move      # Test module
│   └── tests/          # Additional tests for Move modules
├── hello_world/        # Minimal working example
│   ├── sources/        # Simple hello world module
│   └── Move.toml       # Package configuration
├── frontend/           # Web application frontend
│   ├── pages/          # Next.js pages
│   ├── components/     # React components
│   └── styles/         # CSS and styling
├── scripts/            # Utility scripts
└── docs/               # Documentation
```

## Technical Details

### Move Modules

1. **Content Registry**: Stores content metadata with references to off-chain storage like IPFS. Uses Move Objects for flexible data representation and tables for efficient indexing.

2. **Creator Profiles**: Manages creator identities and portfolios, with reputation scores and verification status.

3. **Agent Framework**: Provides infrastructure for autonomous AI agents, using resource accounts to enable on-chain actions.

4. **Token Economics**: Implements reward mechanisms using the Aptos Fungible Asset standard.

5. **Recommendation Engine**: Powers personalized content discovery based on user preferences and agent recommendations.

6. **Reputation System**: Tracks content quality and creator reliability through user ratings and engagement data.

### Frontend

The frontend is built with Next.js and Tailwind CSS, providing a modern and responsive user interface. It integrates with Petra Wallet for authentication and transaction signing.

## Getting Started

### Prerequisites

- Aptos CLI
- Move compiler
- Node.js and npm
- Petra Wallet browser extension

### Move Setup

1. Install the Aptos CLI and set up your development environment following the [Aptos documentation](https://aptos.dev/tools/aptos-cli/)

2. Compile the minimal hello_world module (working example):
   ```
   cd aptosagora/hello_world
   aptos move compile
   ```

3. For the full project, compilation requires fixing some dependencies and implementation details:
   ```
   cd aptosagora/move
   aptos move compile --named-addresses aptosagora=0x42
   ```

### Compilation Notes

The project contains a mix of implemented and stub modules. The hello_world module is fully implemented and can be compiled successfully. The other modules require additional implementation work to compile successfully.

Common compilation issues:
- Option type usage in agent_framework.move
- Object creation and reference handling
- Fungible asset implementation details

### Frontend Setup

1. Install dependencies
   ```
   cd aptosagora/frontend
   npm install
   ```

2. Start the development server
   ```
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## AI Agent Integration

AptosAgora features three types of AI agents:

1. **Creator Agents**: Help optimize content for virality and engagement
2. **Curator Agents**: Discover high-quality content relevant to specific audiences
3. **Distributor Agents**: Manage cross-platform publishing and monetization

These agents can either be controlled directly by users or operate autonomously through resource accounts, leveraging Aptos's unique multi-agent transaction capability.

## Development Roadmap

- Phase 1: Core Move modules implementation ✅
- Phase 2: AI agent framework integration ✅
- Phase 3: Frontend development ✅
- Phase 4: Testing and deployment 🔄
- Phase 5: Launch on Aptos mainnet

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
