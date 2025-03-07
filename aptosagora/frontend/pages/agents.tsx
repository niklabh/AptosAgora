import React, { useState, useEffect } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { AptosClient } from 'aptos';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import CreateAgentForm from '../components/CreateAgentForm';

// Initialize Aptos client
const client = new AptosClient('https://fullnode.devnet.aptoslabs.com/v1');

// Mock data for available AI agents
const mockAgents = [
  {
    id: 'content-creator-1',
    name: 'Content Creator Assistant',
    description: 'AI agent that helps generate article outlines, suggests topics, and provides writing assistance.',
    agentType: 'creator',
    creator: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    createdAt: '2023-09-12T10:25:33Z',
    usageCount: 156,
    status: 'active'
  },
  {
    id: 'content-curator-1',
    name: 'Personal Content Curator',
    description: 'Curates content based on user preferences and engagement history. Provides personalized recommendations.',
    agentType: 'curator',
    creator: '0x2345678901abcdef2345678901abcdef2345678901abcdef2345678901abcdef',
    createdAt: '2023-09-08T16:40:12Z',
    usageCount: 89,
    status: 'active'
  },
  {
    id: 'market-analyst-1',
    name: 'Crypto Market Analyst',
    description: 'Analyzes market trends, token performance, and provides insights on market conditions.',
    agentType: 'analyst',
    creator: '0x3456789012abcdef3456789012abcdef3456789012abcdef3456789012abcdef',
    createdAt: '2023-09-05T14:22:45Z',
    usageCount: 211,
    status: 'active'
  },
  {
    id: 'code-assistant-1',
    name: 'Move Code Assistant',
    description: 'Helps with writing, debugging, and optimizing Move smart contracts. Provides code examples and best practices.',
    agentType: 'developer',
    creator: '0x4567890123abcdef4567890123abcdef4567890123abcdef4567890123abcdef',
    createdAt: '2023-09-03T09:15:33Z',
    usageCount: 178,
    status: 'active'
  },
  {
    id: 'community-manager-1',
    name: 'Community Engagement Manager',
    description: 'Assists with community management, engagement strategies, and content moderation.',
    agentType: 'manager',
    creator: '0x5678901234abcdef5678901234abcdef5678901234abcdef5678901234abcdef',
    createdAt: '2023-08-28T11:40:12Z',
    usageCount: 67,
    status: 'active'
  }
];

// Agent types for filtering
const agentTypes = ['creator', 'curator', 'analyst', 'developer', 'manager'];

const AgentsPage = () => {
  const { connected, account } = useWallet();
  const [agents, setAgents] = useState(mockAgents);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAgentType, setSelectedAgentType] = useState('');
  const [sortBy, setSortBy] = useState('popular'); // 'popular', 'recent'
  const [isCreatingAgent, setIsCreatingAgent] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  // Function to fetch and filter agents
  const fetchAndFilterAgents = () => {
    setIsLoading(true);
    
    // In a real implementation, this would query the blockchain with filters
    setTimeout(() => {
      let filtered = [...mockAgents];
      
      // Filter by search term
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(
          agent => 
            agent.name.toLowerCase().includes(term) || 
            agent.description.toLowerCase().includes(term) ||
            agent.agentType.toLowerCase().includes(term)
        );
      }
      
      // Filter by agent type
      if (selectedAgentType) {
        filtered = filtered.filter(
          agent => agent.agentType === selectedAgentType
        );
      }
      
      // Sort results
      if (sortBy === 'recent') {
        filtered.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      } else if (sortBy === 'popular') {
        filtered.sort((a, b) => b.usageCount - a.usageCount);
      }
      
      setAgents(filtered);
      setIsLoading(false);
    }, 500);
  };

  // Apply filters when search criteria change
  useEffect(() => {
    fetchAndFilterAgents();
  }, [searchTerm, selectedAgentType, sortBy]);

  // Function to handle sending a message to an AI agent
  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedAgent) return;
    
    setIsSendingMessage(true);
    
    // Add user message to chat
    const userMessage = {
      id: Date.now(),
      sender: 'user',
      content: messageInput,
      timestamp: new Date().toISOString()
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setMessageInput('');
    
    // Simulate AI response after a delay
    setTimeout(() => {
      // Mock AI response based on agent type
      let responseContent = '';
      
      switch (selectedAgent.agentType) {
        case 'creator':
          responseContent = "I've analyzed your request and can help you create engaging content. Would you like me to suggest an outline or help refine your existing ideas?";
          break;
        case 'curator':
          responseContent = "Based on your interests, I recommend exploring content about blockchain governance and DeFi innovations. Would you like me to find specific articles on these topics?";
          break;
        case 'analyst':
          responseContent = "Looking at current market trends, there's significant activity in the DeFi sector. The total value locked has increased by 15% this month. Would you like a deeper analysis of any specific protocol?";
          break;
        case 'developer':
          responseContent = "I can help with your Move code. For resource management, consider using the `move_to` function instead of `move_from` in this context. Would you like me to provide a code example?";
          break;
        case 'manager':
          responseContent = "For community engagement, I suggest organizing a weekly AMA session and creating a dedicated channel for newcomers. Would you like me to draft an announcement for these initiatives?";
          break;
        default:
          responseContent = "I've received your message and I'm processing your request. How else can I assist you today?";
      }
      
      const aiMessage = {
        id: Date.now() + 1,
        sender: 'agent',
        content: responseContent,
        timestamp: new Date().toISOString()
      };
      
      setChatMessages(prev => [...prev, aiMessage]);
      setIsSendingMessage(false);
    }, 1500);
  };

  // Format timestamp for chat messages
  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Layout title="AI Agents">
      <div className="pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">AI Agents</h1>
            <p className="mt-2 text-lg text-gray-600">
              Discover and interact with AI agents to enhance your content creation and curation
            </p>
          </div>

          {/* Main content area with sidebar layout */}
          <div className="mt-6 grid grid-cols-1 gap-x-8 gap-y-8 lg:grid-cols-3">
            {/* Sidebar with filters and agent creation */}
            <div className="lg:col-span-1">
              <div className="bg-white shadow rounded-lg p-6 sticky top-6">
                <div className="mb-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Find Agents</h2>
                  
                  {/* Search input */}
                  <div className="mb-4">
                    <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                      Search
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <input
                        type="text"
                        name="search"
                        id="search"
                        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-4 pr-12 sm:text-sm border-gray-300 rounded-md"
                        placeholder="Search by name or description"
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

                  {/* Agent type filter */}
                  <div className="mb-4">
                    <label htmlFor="agent-type" className="block text-sm font-medium text-gray-700 mb-1">
                      Agent Type
                    </label>
                    <select
                      id="agent-type"
                      name="agent-type"
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                      value={selectedAgentType}
                      onChange={(e) => setSelectedAgentType(e.target.value)}
                    >
                      <option value="">All Types</option>
                      {agentTypes.map((type) => (
                        <option key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Sort by filter */}
                  <div>
                    <label htmlFor="sort-by" className="block text-sm font-medium text-gray-700 mb-1">
                      Sort By
                    </label>
                    <select
                      id="sort-by"
                      name="sort-by"
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="popular">Most Popular</option>
                      <option value="recent">Most Recent</option>
                    </select>
                  </div>
                </div>

                {/* Create agent section */}
                <div className="border-t border-gray-200 pt-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Create Your Own Agent</h2>
                  <p className="text-sm text-gray-500 mb-4">
                    Create a custom AI agent to help with your specific needs.
                  </p>
                  <button
                    onClick={() => setIsCreatingAgent(!isCreatingAgent)}
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                    disabled={!connected}
                  >
                    {isCreatingAgent ? 'Cancel' : 'Create New Agent'}
                  </button>
                  {!connected && (
                    <p className="mt-2 text-xs text-gray-500 text-center">
                      Connect your wallet to create an agent
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Main content area */}
            <div className="lg:col-span-2">
              {isCreatingAgent && connected ? (
                <div className="bg-white shadow rounded-lg p-6 mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Create AI Agent</h2>
                  <CreateAgentForm
                    onSuccess={() => {
                      setIsCreatingAgent(false);
                      fetchAndFilterAgents();
                      toast.success('Agent created successfully!');
                    }}
                  />
                </div>
              ) : selectedAgent ? (
                <div className="bg-white shadow rounded-lg overflow-hidden">
                  {/* Agent chat header */}
                  <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="bg-indigo-500 rounded-md p-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-lg font-medium text-gray-900">{selectedAgent.name}</h3>
                        <p className="text-sm text-gray-500">
                          Type: {selectedAgent.agentType.charAt(0).toUpperCase() + selectedAgent.agentType.slice(1)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedAgent(null);
                        setChatMessages([]);
                      }}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  {/* Chat messages area */}
                  <div className="px-6 py-4 h-96 overflow-y-auto">
                    {chatMessages.length === 0 ? (
                      <div className="text-center py-12">
                        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Start a conversation</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Send a message to begin chatting with this AI agent.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {chatMessages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-3/4 rounded-lg px-4 py-2 ${
                                message.sender === 'user'
                                  ? 'bg-indigo-100 text-indigo-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                              <p className="text-xs text-gray-500 mt-1 text-right">
                                {formatMessageTime(message.timestamp)}
                              </p>
                            </div>
                          </div>
                        ))}
                        {isSendingMessage && (
                          <div className="flex justify-start">
                            <div className="bg-gray-100 rounded-lg px-4 py-2">
                              <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Message input area */}
                  <div className="px-6 py-4 border-t border-gray-200">
                    <div className="flex space-x-3">
                      <input
                        type="text"
                        className="flex-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="Type your message..."
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleSendMessage();
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                        onClick={handleSendMessage}
                        disabled={isSendingMessage || !messageInput.trim()}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Agent listing */}
                  {isLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, index) => (
                        <div key={index} className="animate-pulse bg-white p-6 rounded-lg shadow">
                          <div className="flex items-center">
                            <div className="rounded-md bg-gray-200 h-12 w-12"></div>
                            <div className="ml-4 flex-1">
                              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            </div>
                          </div>
                          <div className="mt-4 h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="mt-2 h-4 bg-gray-200 rounded w-full"></div>
                        </div>
                      ))}
                    </div>
                  ) : agents.length > 0 ? (
                    <div className="space-y-4">
                      {agents.map((agent) => (
                        <div key={agent.id} className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
                          <div className="px-6 py-5">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                              </div>
                              <div className="ml-4 flex-1">
                                <h3 className="text-lg font-medium text-gray-900">{agent.name}</h3>
                                <div className="mt-1 flex items-center">
                                  <span className="text-sm text-gray-500">
                                    Type: {agent.agentType.charAt(0).toUpperCase() + agent.agentType.slice(1)}
                                  </span>
                                  <span className="mx-2 text-gray-300">•</span>
                                  <span className="text-sm text-gray-500">
                                    Used {agent.usageCount} times
                                  </span>
                                </div>
                              </div>
                              <button
                                onClick={() => setSelectedAgent(agent)}
                                className="ml-4 inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                              >
                                Chat
                              </button>
                            </div>
                            <p className="mt-3 text-sm text-gray-500">
                              {agent.description}
                            </p>
                            <div className="mt-4 flex justify-between items-center">
                              <div className="text-xs text-gray-500">
                                Created on {new Date(agent.createdAt).toLocaleDateString()}
                              </div>
                              <div className="flex items-center">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  agent.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-white rounded-lg shadow">
                      <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No agents found</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Try adjusting your search or filter to find what you're looking for.
                      </p>
                      <div className="mt-6">
                        <button
                          onClick={() => {
                            setSearchTerm('');
                            setSelectedAgentType('');
                            setSortBy('popular');
                          }}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Clear all filters
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AgentsPage; 