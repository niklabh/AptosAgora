import React, { useState, useEffect } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { Types } from 'aptos';
import Layout from '../components/Layout';
import ContentCard from '../components/ContentCard';
import { client, aptosConfig } from '../utils/aptosClient';

// Use module address from environment variable
const MODULE_ADDRESS = aptosConfig.moduleAddress;

// Mock data (same as in index.tsx)
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
  },
  {
    id: 'nft-marketplace-review',
    title: 'Top NFT Marketplaces on Aptos: A Comparison',
    description: 'An in-depth review of the leading NFT marketplaces built on Aptos blockchain. Compare fees, features, user experience, and supported NFT standards.',
    contentType: 'article',
    creator: '0x6789012345abcdef6789012345abcdef6789012345abcdef6789012345abcdef',
    createdAt: '2023-09-07T13:22:45Z',
    tags: ['nft', 'marketplace', 'review', 'comparison'],
    engagementCount: 87
  },
  {
    id: 'move-language-tutorial',
    title: 'Move Programming Language: From Basics to Advanced',
    description: 'A comprehensive tutorial series on the Move programming language used in Aptos. Learn syntax, security features, and best practices for smart contract development.',
    contentType: 'video',
    creator: '0x7890123456abcdef7890123456abcdef7890123456abcdef7890123456abcdef',
    createdAt: '2023-09-05T10:15:33Z',
    tags: ['move', 'programming', 'tutorial', 'development'],
    engagementCount: 156
  },
  {
    id: 'dao-governance-models',
    title: 'DAO Governance Models for Web3 Communities',
    description: 'Explore different governance models for Decentralized Autonomous Organizations (DAOs) and how they can be implemented on Aptos blockchain.',
    contentType: 'article',
    creator: '0x8901234567abcdef8901234567abcdef8901234567abcdef8901234567abcdef',
    createdAt: '2023-09-03T16:40:12Z',
    tags: ['dao', 'governance', 'web3', 'community'],
    engagementCount: 68
  }
];

// All available tags from the mock data
const allTags = Array.from(
  new Set(mockContents.flatMap(content => content.tags))
).sort();

// Content types
const contentTypes = ['article', 'image', 'video', 'audio'];

const ExplorePage = () => {
  const { connected } = useWallet();
  const [contents, setContents] = useState(mockContents);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContentType, setSelectedContentType] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('recent'); // 'recent', 'popular'

  // Function to fetch and filter contents
  const fetchAndFilterContents = () => {
    setIsLoading(true);
    
    // In a real implementation, this would query the blockchain with filters
    setTimeout(() => {
      let filtered = [...mockContents];
      
      // Filter by search term
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(
          content => 
            content.title.toLowerCase().includes(term) || 
            content.description.toLowerCase().includes(term)
        );
      }
      
      // Filter by content type
      if (selectedContentType) {
        filtered = filtered.filter(
          content => content.contentType === selectedContentType
        );
      }
      
      // Filter by tags
      if (selectedTags.length > 0) {
        filtered = filtered.filter(
          content => selectedTags.some(tag => content.tags.includes(tag))
        );
      }
      
      // Sort results
      if (sortBy === 'recent') {
        filtered.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      } else if (sortBy === 'popular') {
        filtered.sort((a, b) => b.engagementCount - a.engagementCount);
      }
      
      setContents(filtered);
      setIsLoading(false);
    }, 500);
  };

  // Apply filters when search criteria change
  useEffect(() => {
    fetchAndFilterContents();
  }, [searchTerm, selectedContentType, selectedTags, sortBy]);

  // Toggle tag selection
  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
  };

  return (
    <Layout title="Explore Content">
      <div className="pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">Explore Content</h1>
            <p className="mt-2 text-lg text-gray-600">
              Discover and explore content from creators across the AptosAgora platform
            </p>
          </div>

          {/* Search and filters */}
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
              {/* Search input */}
              <div className="md:col-span-2">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                  Search
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    type="text"
                    name="search"
                    id="search"
                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-4 pr-12 sm:text-sm border-gray-300 rounded-md"
                    placeholder="Search by title or description"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Content type filter */}
              <div>
                <label htmlFor="content-type" className="block text-sm font-medium text-gray-700">
                  Content Type
                </label>
                <select
                  id="content-type"
                  name="content-type"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={selectedContentType}
                  onChange={(e) => setSelectedContentType(e.target.value)}
                >
                  <option value="">All Types</option>
                  {contentTypes.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort by filter */}
              <div>
                <label htmlFor="sort-by" className="block text-sm font-medium text-gray-700">
                  Sort By
                </label>
                <select
                  id="sort-by"
                  name="sort-by"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="recent">Most Recent</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>
            </div>

            {/* Tags filter */}
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-700">Tags</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      selectedTags.includes(tag)
                        ? 'bg-indigo-100 text-indigo-800'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {tag}
                    {selectedTags.includes(tag) && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="ml-1.5 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Content results */}
          <div>
            {isLoading ? (
              <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="bg-gray-200 rounded-lg h-64"></div>
                    <div className="mt-4 h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="mt-2 h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : contents.length > 0 ? (
              <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3">
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
            ) : (
              <div className="text-center py-12">
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No results found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Try adjusting your search or filter to find what you're looking for.
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedContentType('');
                      setSelectedTags([]);
                      setSortBy('recent');
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Clear all filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ExplorePage; 