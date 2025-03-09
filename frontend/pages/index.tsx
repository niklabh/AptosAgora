import React, { useState, useEffect } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { Types } from 'aptos';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import ContentCard from '../components/ContentCard';
import CreateContentForm from '../components/CreateContentForm';
import { client, aptosConfig } from '../utils/aptosClient';

// Use module address from environment variable
const MODULE_ADDRESS = aptosConfig.moduleAddress;

// Mock data for demonstration (until blockchain integration is complete)
const mockContents = [
  {
    id: 'guide-to-aptos',
    title: 'The Ultimate Guide to Aptos Blockchain',
    description: 'Learn everything about Aptos blockchain, from Move language to building decentralized applications. This comprehensive guide covers all aspects of the Aptos ecosystem.',
    contentType: 'article',
    creator: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    createdAt: '2023-09-15T14:32:21Z',
    tags: ['guide', 'tutorial', 'aptos', 'blockchain'],
    engagementCount: 128
  },
  {
    id: 'ai-nft-artwork',
    title: 'AI-Generated NFT Collection: Digital Dreamscapes',
    description: 'Explore this unique collection of AI-generated NFT artwork that blends surrealism with digital landscapes. Each piece is one-of-a-kind and generated using cutting-edge algorithms.',
    contentType: 'image',
    creator: '0x2345678901abcdef2345678901abcdef2345678901abcdef2345678901abcdef',
    createdAt: '2023-09-14T09:18:43Z',
    tags: ['art', 'nft', 'ai', 'digital'],
    engagementCount: 74
  },
  {
    id: 'defi-protocol-overview',
    title: 'DeFi on Aptos: Protocol Analysis and Comparison',
    description: 'A detailed analysis of the top DeFi protocols building on Aptos blockchain. Compare features, tokenomics, security measures, and growth potential in this in-depth report.',
    contentType: 'article',
    creator: '0x3456789012abcdef3456789012abcdef3456789012abcdef3456789012abcdef',
    createdAt: '2023-09-12T16:45:09Z',
    tags: ['defi', 'finance', 'analysis', 'aptos'],
    engagementCount: 92
  },
  {
    id: 'metaverse-tutorial',
    title: 'Building a Metaverse Experience on Aptos',
    description: 'Step-by-step tutorial on creating immersive metaverse experiences using Aptos blockchain for digital ownership and transactions. Includes code examples and design principles.',
    contentType: 'video',
    creator: '0x4567890123abcdef4567890123abcdef4567890123abcdef4567890123abcdef',
    createdAt: '2023-09-10T11:27:35Z',
    tags: ['metaverse', 'tutorial', 'development', 'web3'],
    engagementCount: 63
  },
  {
    id: 'crypto-podcast',
    title: 'The Future of Finance: Blockchain Revolution',
    description: 'A podcast series exploring how blockchain technology is transforming traditional finance. Features interviews with leading experts and visionaries in the crypto space.',
    contentType: 'audio',
    creator: '0x5678901234abcdef5678901234abcdef5678901234abcdef5678901234abcdef',
    createdAt: '2023-09-08T08:53:17Z',
    tags: ['podcast', 'finance', 'future', 'interviews'],
    engagementCount: 41
  }
];

const HomePage = () => {
  const { connected, account } = useWallet();
  const [isCreatingContent, setIsCreatingContent] = useState(false);
  const [contents, setContents] = useState(mockContents);
  const [isLoading, setIsLoading] = useState(false);

  // Function to fetch contents from blockchain (to be implemented)
  const fetchContents = async () => {
    // In a real implementation, this would query the blockchain
    setIsLoading(true);
    try {
      // Placeholder for blockchain query
      // For now, use mock data
      setTimeout(() => {
        setContents(mockContents);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching contents:', error);
      toast.error('Failed to load content');
      setIsLoading(false);
    }
  };

  // Fetch contents on initial load
  useEffect(() => {
    fetchContents();
  }, []);

  return (
    <Layout title="Home">
      <div className="pb-12">
        {/* Hero section */}
        <div className="bg-indigo-700 rounded-lg shadow-xl overflow-hidden">
          <div className="pt-10 pb-12 px-6 sm:pt-16 sm:px-16 lg:py-16 lg:pr-0 xl:py-20 xl:px-20">
            <div className="lg:self-center">
              <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                <span className="block">Welcome to AptosAgora</span>
                <span className="block">AI-Powered Content Marketplace</span>
              </h2>
              <p className="mt-4 text-lg leading-6 text-indigo-200">
                Discover, create, and monetize content with the power of AI and blockchain technology.
                AptosAgora connects creators with audiences through a decentralized platform.
              </p>
              <div className="mt-8">
                {connected ? (
                  <button
                    onClick={() => setIsCreatingContent(!isCreatingContent)}
                    className="bg-white border border-transparent rounded-md shadow px-5 py-3 inline-flex items-center text-base font-medium text-indigo-600 hover:bg-indigo-50"
                  >
                    {isCreatingContent ? 'Cancel' : 'Create New Content'}
                  </button>
                ) : (
                  <div className="text-indigo-200 text-lg">
                    Connect your wallet to start creating content
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content creation form */}
        {isCreatingContent && connected && (
          <div className="mt-8">
            <CreateContentForm
              onSuccess={() => {
                setIsCreatingContent(false);
                fetchContents();
              }}
            />
          </div>
        )}

        {/* Content listing */}
        <div className="mt-12">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Featured Content</h2>
            <div className="text-sm">
              <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                View all<span aria-hidden="true"> &rarr;</span>
              </a>
            </div>
          </div>

          {isLoading ? (
            <div className="mt-6 grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-gray-200 rounded-lg h-64"></div>
                  <div className="mt-4 h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="mt-2 h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3">
              {contents.map((content) => (
                <ContentCard
                  key={content.id}
                  id={content.id}
                  title={content.title}
                  description={content.description}
                  contentType={content.contentType}
                  creator={content.creator}
                  createdAt={content.createdAt}
                  tags={content.tags}
                  engagementCount={content.engagementCount}
                />
              ))}
            </div>
          )}
        </div>

        {/* Feature highlights */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900">Platform Features</h2>
          <div className="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">AI-Powered Creation</h3>
                    <p className="mt-2 text-base text-gray-500">
                      Leverage AI agents to assist in content creation, curation, and optimization.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Token Economy</h3>
                    <p className="mt-2 text-base text-gray-500">
                      Earn rewards through engagement, content creation, and curation activities.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Decentralized Ownership</h3>
                    <p className="mt-2 text-base text-gray-500">
                      Full ownership and control of your content with transparent on-chain provenance.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HomePage; 