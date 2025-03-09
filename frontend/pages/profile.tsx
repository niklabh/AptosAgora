import React, { useState, useEffect } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { Types } from 'aptos';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import ContentCard from '../components/ContentCard';
import CreateAgentForm from '../components/CreateAgentForm';
import { client, aptosConfig } from '../utils/aptosClient';

// Use module address from environment variable
const MODULE_ADDRESS = aptosConfig.moduleAddress;

// Mock data for user's content
const mockUserContents = [
  {
    id: 'my-aptos-guide',
    title: 'My Journey with Aptos Blockchain',
    description: 'A personal account of building on Aptos blockchain and the lessons learned along the way. Includes tips for new developers and insights into the ecosystem.',
    contentType: 'article',
    creator: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    createdAt: '2023-09-14T15:32:21Z',
    tags: ['personal', 'development', 'aptos', 'blockchain'],
    engagementCount: 42
  },
  {
    id: 'aptos-nft-collection',
    title: 'Aptos Pioneers: NFT Collection',
    description: "A limited edition NFT collection celebrating the early pioneers of the Aptos ecosystem. Each piece represents a milestone in the blockchain's development.",
    contentType: 'image',
    creator: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    createdAt: '2023-09-10T09:18:43Z',
    tags: ['nft', 'collection', 'art', 'pioneers'],
    engagementCount: 87
  },
  {
    id: 'move-tutorial-video',
    title: 'Getting Started with Move Programming',
    description: 'A beginner-friendly tutorial on Move programming language. Learn the basics of Move and how to write your first smart contract on Aptos.',
    contentType: 'video',
    creator: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    createdAt: '2023-09-05T14:45:09Z',
    tags: ['tutorial', 'move', 'programming', 'beginner'],
    engagementCount: 124
  }
];

// Mock data for user's AI agents
const mockUserAgents = [
  {
    id: 'content-creator-1',
    name: 'Content Creator Assistant',
    description: 'AI agent that helps generate article outlines, suggests topics, and provides writing assistance.',
    agentType: 'creator',
    createdAt: '2023-09-12T10:25:33Z',
    status: 'active'
  },
  {
    id: 'content-curator-1',
    name: 'Personal Content Curator',
    description: 'Curates content based on user preferences and engagement history. Provides personalized recommendations.',
    agentType: 'curator',
    createdAt: '2023-09-08T16:40:12Z',
    status: 'active'
  }
];

const ProfilePage = () => {
  const { connected, account } = useWallet();
  const [activeTab, setActiveTab] = useState('content'); // 'content', 'agents'
  const [userContents, setUserContents] = useState(mockUserContents);
  const [userAgents, setUserAgents] = useState(mockUserAgents);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingAgent, setIsCreatingAgent] = useState(false);

  // Function to fetch user's content from blockchain
  const fetchUserContent = async () => {
    if (!connected || !account) return;
    
    setIsLoading(true);
    try {
      // In a real implementation, this would query the blockchain
      // For now, use mock data
      setTimeout(() => {
        setUserContents(mockUserContents);
        setIsLoading(false);
      }, 800);
    } catch (error) {
      console.error('Error fetching user content:', error);
      toast.error('Failed to load your content');
      setIsLoading(false);
    }
  };

  // Function to fetch user's AI agents from blockchain
  const fetchUserAgents = async () => {
    if (!connected || !account) return;
    
    setIsLoading(true);
    try {
      // In a real implementation, this would query the blockchain
      // For now, use mock data
      setTimeout(() => {
        setUserAgents(mockUserAgents);
        setIsLoading(false);
      }, 800);
    } catch (error) {
      console.error('Error fetching user agents:', error);
      toast.error('Failed to load your AI agents');
      setIsLoading(false);
    }
  };

  // Fetch data when tab changes or wallet connects
  useEffect(() => {
    if (connected && account) {
      if (activeTab === 'content') {
        fetchUserContent();
      } else if (activeTab === 'agents') {
        fetchUserAgents();
      }
    }
  }, [connected, account, activeTab]);

  // Format wallet address for display
  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <Layout title="My Profile">
      <div className="pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {!connected ? (
            <div className="text-center py-16">
              <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">Connect your wallet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Please connect your wallet to view your profile.
              </p>
            </div>
          ) : (
            <>
              {/* Profile header */}
              <div className="bg-white shadow overflow-hidden sm:rounded-lg mt-8">
                <div className="px-4 py-5 sm:px-6">
                  <div className="flex items-center">
                    <div className="bg-indigo-600 rounded-full p-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        My Profile
                      </h3>
                      <p className="mt-1 max-w-2xl text-sm text-gray-500">
                        {account && formatAddress(account.address)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="border-t border-gray-200">
                  <dl>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">
                        Wallet Address
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-mono">
                        {account?.address}
                      </dd>
                    </div>
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">
                        Content Count
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {userContents.length} items
                      </dd>
                    </div>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">
                        AI Agents
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {userAgents.length} agents
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              {/* Tabs */}
              <div className="mt-8">
                <div className="sm:hidden">
                  <label htmlFor="tabs" className="sr-only">Select a tab</label>
                  <select
                    id="tabs"
                    name="tabs"
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    value={activeTab}
                    onChange={(e) => setActiveTab(e.target.value)}
                  >
                    <option value="content">My Content</option>
                    <option value="agents">My AI Agents</option>
                  </select>
                </div>
                <div className="hidden sm:block">
                  <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                      <button
                        onClick={() => setActiveTab('content')}
                        className={`${
                          activeTab === 'content'
                            ? 'border-indigo-500 text-indigo-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                      >
                        My Content
                      </button>
                      <button
                        onClick={() => setActiveTab('agents')}
                        className={`${
                          activeTab === 'agents'
                            ? 'border-indigo-500 text-indigo-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                      >
                        My AI Agents
                      </button>
                    </nav>
                  </div>
                </div>
              </div>

              {/* Tab content */}
              <div className="mt-6">
                {activeTab === 'content' && (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold text-gray-900">My Content</h2>
                      <a href="/create-content" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
                        Create New Content
                      </a>
                    </div>
                    
                    {isLoading ? (
                      <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3">
                        {[...Array(3)].map((_, index) => (
                          <div key={index} className="animate-pulse">
                            <div className="bg-gray-200 rounded-lg h-64"></div>
                            <div className="mt-4 h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="mt-2 h-4 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        ))}
                      </div>
                    ) : userContents.length > 0 ? (
                      <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3">
                        {userContents.map((content) => (
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
                      <div className="text-center py-12 bg-white rounded-lg shadow">
                        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No content yet</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Get started by creating your first content piece.
                        </p>
                        <div className="mt-6">
                          <a href="/create-content" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
                            Create Content
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'agents' && (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold text-gray-900">My AI Agents</h2>
                      <button
                        onClick={() => setIsCreatingAgent(!isCreatingAgent)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                      >
                        {isCreatingAgent ? 'Cancel' : 'Create New Agent'}
                      </button>
                    </div>

                    {isCreatingAgent && (
                      <div className="mb-8 bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Create AI Agent</h3>
                        <CreateAgentForm
                          onSuccess={() => {
                            setIsCreatingAgent(false);
                            fetchUserAgents();
                          }}
                        />
                      </div>
                    )}
                    
                    {isLoading ? (
                      <div className="space-y-4">
                        {[...Array(2)].map((_, index) => (
                          <div key={index} className="animate-pulse bg-white p-6 rounded-lg shadow">
                            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        ))}
                      </div>
                    ) : userAgents.length > 0 ? (
                      <div className="space-y-4">
                        {userAgents.map((agent) => (
                          <div key={agent.id} className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="px-4 py-5 sm:p-6">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                  </svg>
                                </div>
                                <div className="ml-4">
                                  <h3 className="text-lg font-medium text-gray-900">{agent.name}</h3>
                                  <p className="text-sm text-gray-500">{agent.description}</p>
                                  <div className="mt-2 flex items-center">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                      agent.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                      {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
                                    </span>
                                    <span className="ml-2 text-xs text-gray-500">
                                      Created on {new Date(agent.createdAt).toLocaleDateString()}
                                    </span>
                                    <span className="ml-2 text-xs text-gray-500">
                                      Type: {agent.agentType.charAt(0).toUpperCase() + agent.agentType.slice(1)}
                                    </span>
                                  </div>
                                </div>
                                <div className="ml-auto flex space-x-2">
                                  <button className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200">
                                    Configure
                                  </button>
                                  <button className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200">
                                    Deactivate
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-white rounded-lg shadow">
                        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No AI agents yet</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Get started by creating your first AI agent.
                        </p>
                        <div className="mt-6">
                          <button
                            onClick={() => setIsCreatingAgent(true)}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                          >
                            Create Agent
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage; 