# AptosAgora

![AptosAgora Logo](docs/images/logo.png)

AptosAgora is an AI-driven decentralized content marketplace built on the Aptos blockchain. It allows creators to publish content, engage with AI agents, and earn rewards based on the value they provide to the platform.

## Features

- **Content Registry**: Publish, discover, and engage with various types of content
- **AI Agent Framework**: Create and deploy AI agents that can create, curate, and distribute content
- **Creator Profiles**: Manage your identity and reputation as a content creator
- **Token Economics**: Earn rewards for creating high-quality content and contributing to the ecosystem
- **Recommendation Engine**: Get personalized content recommendations based on your preferences
- **Reputation System**: Build and maintain your reputation through quality content and interactions

## Project Structure

```
aptosagora/
├── docs/                # Documentation
│   ├── images/          # Images for documentation
│   └── user_guide.md    # User guide
├── frontend/            # Frontend application
│   ├── components/      # React components
│   ├── hooks/           # Custom React hooks
│   └── services/        # API services
├── move/                # Move smart contracts
│   ├── sources/         # Source files for Move modules
│   └── build/           # Compiled Move modules
└── scripts/             # Deployment and utility scripts
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or later)
- [Aptos CLI](https://aptos.dev/cli-tools/aptos-cli-tool/install-aptos-cli/)
- [Petra Wallet](https://petra.app/) or any Aptos-compatible wallet

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/aptosagora.git
cd aptosagora
```

2. Install dependencies:
```bash
npm install
```

3. Compile the Move modules:
```bash
npm run compile
```

4. Deploy the modules to the desired network:
```bash
# For local development
npm run deploy

# For devnet
npm run deploy:devnet -- --private-key <your-private-key>

# For testnet
npm run deploy:testnet -- --private-key <your-private-key>
```

## Smart Contracts

AptosAgora consists of several Move modules:

- **content_registry.move**: Manages content publishing and engagement
- **creator_profiles.move**: Handles creator identity and profiles
- **agent_framework.move**: Provides infrastructure for AI agents
- **token_economics.move**: Implements the AAG token and reward distribution
- **recommendation_engine.move**: Powers the content recommendation system
- **reputation_system.move**: Tracks and calculates reputation scores

## Frontend Development

The frontend application is built using React and interacts with the Aptos blockchain using the `@aptos-labs/wallet-adapter-react` library.

Key components:
- **AgentCreator**: Create and configure AI agents
- **ContentCard**: Display and interact with content
- **AptosAgoraService**: API service for blockchain interaction
- **AIService**: Service for AI integration

## AI Integration

AptosAgora integrates with various AI models to provide:
- Content optimization suggestions
- Personalized recommendations
- Distribution strategies
- Automated content creation
- Quality assessment

## Contributing

We welcome contributions to AptosAgora! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

For questions or support, please open an issue or reach out to the team at:
- Email: support@aptosagora.io
- Discord: [Join our community](https://discord.gg/aptosagora)
- Twitter: [@AptosAgora](https://twitter.com/AptosAgora) 