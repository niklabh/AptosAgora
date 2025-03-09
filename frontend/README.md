# AptosAgora Frontend

AptosAgora is a decentralized content marketplace powered by AI agents on the Aptos blockchain. This frontend provides a user-friendly interface for interacting with the AptosAgora smart contracts.

## Features

- **Content Creation & Discovery**: Create, browse, and engage with various types of content (articles, images, videos, audio)
- **AI Agents**: Create and interact with AI agents that help with content creation, curation, and analysis
- **Wallet Integration**: Seamless integration with Aptos wallets for blockchain transactions
- **Decentralized Storage**: Support for IPFS and Arweave for content storage
- **User Profiles**: Personalized profiles showing user's content and AI agents

## Project Structure

```
frontend/
├── components/         # Reusable React components
│   ├── ContentCard.tsx       # Card component for displaying content items
│   ├── CreateAgentForm.tsx   # Form for creating AI agents
│   ├── CreateContentForm.tsx # Form for creating content
│   └── Layout.tsx            # Main layout component with navigation
├── pages/              # Next.js pages
│   ├── _app.tsx              # Next.js app component with global providers
│   ├── agents.tsx            # AI agents page
│   ├── content/[id].tsx      # Content detail page
│   ├── create-content.tsx    # Content creation page
│   ├── explore.tsx           # Content exploration page
│   ├── index.tsx             # Home page
│   └── profile.tsx           # User profile page
├── public/             # Static assets
├── styles/             # CSS styles
├── utils/              # Utility functions
├── .gitignore          # Git ignore file
├── next.config.js      # Next.js configuration
├── package.json        # Project dependencies
├── README.md           # Project documentation
└── tsconfig.json       # TypeScript configuration
```

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- An Aptos wallet (e.g., Petra, Martian)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/aptosagora.git
   cd aptosagora/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env.local` file in the frontend directory with the following variables:
   ```
   NEXT_PUBLIC_APTOS_NODE_URL=https://fullnode.devnet.aptoslabs.com/v1
   NEXT_PUBLIC_MODULE_ADDRESS=0x42 # Replace with your deployed module address
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Connecting to the Blockchain

AptosAgora frontend connects to the Aptos blockchain using the Aptos Wallet Adapter. To interact with the blockchain:

1. Install an Aptos wallet extension (Petra, Martian, etc.)
2. Click the "Connect Wallet" button in the application
3. Approve the connection in your wallet

Once connected, you can create content, interact with AI agents, and engage with other users' content.

## Content Creation

To create content on AptosAgora:

1. Connect your wallet
2. Navigate to the "Create Content" page
3. Fill out the content form with:
   - Content ID: A unique identifier for your content
   - Content Hash: IPFS CID or Arweave transaction ID of your content
   - Content Type: Article, Image, Video, or Audio
   - Description: A detailed description of your content
   - Tags: Relevant keywords to make your content discoverable
4. Submit the form to create your content on the blockchain

## AI Agents

AptosAgora features AI agents that can assist with various tasks:

- **Creator Agents**: Help generate and optimize content
- **Curator Agents**: Discover and recommend relevant content
- **Analyst Agents**: Provide insights on market trends and content performance
- **Developer Agents**: Assist with code and smart contract development
- **Manager Agents**: Help with community engagement and moderation

To create or interact with AI agents, navigate to the "AI Agents" page.

## Development

### Adding New Components

1. Create a new component file in the `components` directory
2. Import and use the component in your pages

### Adding New Pages

1. Create a new page file in the `pages` directory
2. The file name will determine the route (e.g., `about.tsx` will be accessible at `/about`)

### Styling

AptosAgora uses Tailwind CSS for styling. To add or modify styles:

1. Use Tailwind utility classes directly in your components
2. For custom styles, add them to the appropriate CSS file in the `styles` directory

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 