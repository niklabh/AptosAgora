import React, { useState, useEffect } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { Types } from 'aptos';
import toast from 'react-hot-toast';
import { useAptosAgora } from '../hooks/useAptosAgora';

// Dashboard tabs
enum DashboardTab {
  PROFILE = 'profile',
  CONTENT = 'content',
  AGENTS = 'agents',
  ANALYTICS = 'analytics',
  REWARDS = 'rewards',
}

// Content item type
interface ContentItem {
  id: string;
  contentHash: string;
  contentType: string;
  description: string;
  tags: string[];
  creationTimestamp: number;
  engagementCount: number;
}

// Agent item type
interface AgentItem {
  id: string;
  agentType: string;
  name: string;
  description: string;
  configuration: Record<string, any>;
  isAutonomous: boolean;
  isActive: boolean;
  creationTimestamp: number;
}

// User profile type
interface UserProfile {
  name: string;
  bio: string;
  socialLinks: Record<string, string>;
  contentCount: number;
  reputationScore: number;
}

// Analytics data type
interface AnalyticsData {
  totalViews: number;
  totalLikes: number;
  totalShares: number;
  contentPerformance: {
    contentId: string;
    description: string;
    views: number;
    likes: number;
    shares: number;
  }[];
}

// UserDashboard props
interface UserDashboardProps {
  moduleAddress: string;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ moduleAddress }) => {
  const { account, connected } = useWallet();
  const aptosAgora = useAptosAgora(moduleAddress);
  
  // State variables
  const [activeTab, setActiveTab] = useState<DashboardTab>(DashboardTab.PROFILE);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [content, setContent] = useState<ContentItem[]>([]);
  const [agents, setAgents] = useState<AgentItem[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [rewards, setRewards] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: '',
    bio: '',
    twitter: '',
    github: '',
    website: '',
  });
  
  // Formatting functions
  const formatDate = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };
  
  const truncateAddress = (address: string): string => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };
  
  // Load user data
  useEffect(() => {
    if (!connected || !account) return;
    
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch user profile
        // This would normally call a view function from the contract
        // For now we'll use mock data
        setProfile({
          name: 'Demo User',
          bio: 'Content creator on AptosAgora',
          socialLinks: {
            twitter: 'https://twitter.com/demouser',
            github: 'https://github.com/demouser',
          },
          contentCount: 5,
          reputationScore: 4.8,
        });
        
        // Fetch user content
        // This would normally call a view function from the contract
        setContent([
          {
            id: '1',
            contentHash: '0x1234567890abcdef',
            contentType: 'article',
            description: 'Introduction to Aptos Move',
            tags: ['aptos', 'move', 'blockchain'],
            creationTimestamp: Date.now() / 1000 - 86400 * 7, // 7 days ago
            engagementCount: 125,
          },
          {
            id: '2',
            contentHash: '0xabcdef1234567890',
            contentType: 'image',
            description: 'Aptos Ecosystem Diagram',
            tags: ['aptos', 'diagram', 'ecosystem'],
            creationTimestamp: Date.now() / 1000 - 86400 * 3, // 3 days ago
            engagementCount: 78,
          },
        ]);
        
        // Fetch user agents
        // This would normally call a view function from the contract
        setAgents([
          {
            id: '1',
            agentType: 'creator',
            name: 'Content Creator Agent',
            description: 'Generates blog posts about blockchain',
            configuration: {
              model: 'gpt-4',
              temperature: 0.7,
              contentTypes: ['article'],
            },
            isAutonomous: true,
            isActive: true,
            creationTimestamp: Date.now() / 1000 - 86400 * 14, // 14 days ago
          },
          {
            id: '2',
            agentType: 'curator',
            name: 'Content Curator Agent',
            description: 'Finds and recommends quality content',
            configuration: {
              model: 'gpt-4',
              temperature: 0.5,
              contentTypes: ['article', 'image', 'video'],
            },
            isAutonomous: false,
            isActive: false,
            creationTimestamp: Date.now() / 1000 - 86400 * 10, // 10 days ago
          },
        ]);
        
        // Fetch analytics
        // This would normally call a view function from the contract
        setAnalytics({
          totalViews: 203,
          totalLikes: 54,
          totalShares: 12,
          contentPerformance: [
            {
              contentId: '1',
              description: 'Introduction to Aptos Move',
              views: 125,
              likes: 42,
              shares: 8,
            },
            {
              contentId: '2',
              description: 'Aptos Ecosystem Diagram',
              views: 78,
              likes: 12,
              shares: 4,
            },
          ],
        });
        
        // Fetch rewards
        // This would normally call a view function from the contract
        setRewards(125.5);
        
        // Update profile form
        if (profile) {
          setProfileForm({
            name: profile.name,
            bio: profile.bio,
            twitter: profile.socialLinks.twitter || '',
            github: profile.socialLinks.github || '',
            website: profile.socialLinks.website || '',
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Failed to load user data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [account, connected]);
  
  // Handle profile update
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connected || !account) {
      toast.error('Please connect your wallet first');
      return;
    }
    
    try {
      const socialLinks = {
        twitter: profileForm.twitter,
        github: profileForm.github,
        website: profileForm.website,
      };
      
      await aptosAgora.updateProfile(profileForm.name, profileForm.bio, socialLinks);
      toast.success('Profile updated successfully');
      
      // Update local state
      setProfile({
        ...profile!,
        name: profileForm.name,
        bio: profileForm.bio,
        socialLinks,
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };
  
  // Handle agent activation/deactivation
  const handleAgentToggle = async (agentId: string, isActive: boolean) => {
    if (!connected || !account) {
      toast.error('Please connect your wallet first');
      return;
    }
    
    try {
      if (isActive) {
        await aptosAgora.deactivateAgent(agentId);
        toast.success('Agent deactivated');
      } else {
        await aptosAgora.activateAgent(agentId);
        toast.success('Agent activated');
      }
      
      // Update local state
      setAgents(agents.map(agent => 
        agent.id === agentId 
          ? { ...agent, isActive: !isActive } 
          : agent
      ));
    } catch (error) {
      console.error(`Error ${isActive ? 'deactivating' : 'activating'} agent:`, error);
      toast.error(`Failed to ${isActive ? 'deactivate' : 'activate'} agent`);
    }
  };
  
  // Render profile tab
  const renderProfileTab = () => (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-xl font-semibold mb-4">Profile Information</h3>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : profile ? (
        <form onSubmit={handleProfileUpdate}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Name
            </label>
            <input
              type="text"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={profileForm.name}
              onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Bio
            </label>
            <textarea
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-24"
              value={profileForm.bio}
              onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
              required
            ></textarea>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Twitter URL
            </label>
            <input
              type="url"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={profileForm.twitter}
              onChange={(e) => setProfileForm({ ...profileForm, twitter: e.target.value })}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              GitHub URL
            </label>
            <input
              type="url"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={profileForm.github}
              onChange={(e) => setProfileForm({ ...profileForm, github: e.target.value })}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Website URL
            </label>
            <input
              type="url"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={profileForm.website}
              onChange={(e) => setProfileForm({ ...profileForm, website: e.target.value })}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Wallet Address
            </label>
            <input
              type="text"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-100"
              value={account?.address || ''}
              disabled
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Reputation Score
            </label>
            <div className="flex items-center">
              <span className="text-2xl font-bold text-blue-600">{profile.reputationScore}</span>
              <span className="text-gray-600 ml-2">/ 5.0</span>
            </div>
          </div>
          
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={aptosAgora.loading}
          >
            {aptosAgora.loading ? 'Updating...' : 'Update Profile'}
          </button>
        </form>
      ) : (
        <div className="flex flex-col items-center justify-center h-40">
          <p className="text-gray-600 mb-4">You don't have a profile yet.</p>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            onClick={() => setActiveTab(DashboardTab.PROFILE)}
          >
            Create Profile
          </button>
        </div>
      )}
    </div>
  );
  
  // Render content tab
  const renderContentTab = () => (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Your Content</h3>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          onClick={() => {/* Navigate to create content page */}}
        >
          Create New Content
        </button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : content.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="px-6 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Date Created
                </th>
                <th className="px-6 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Engagements
                </th>
                <th className="px-6 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {content.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">
                    <div className="text-sm font-medium text-gray-900">{item.description}</div>
                    <div className="text-sm text-gray-500">
                      {item.tags.map(tag => `#${tag}`).join(' ')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {item.contentType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200 text-sm text-gray-500">
                    {formatDate(item.creationTimestamp)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200 text-sm text-gray-500">
                    {item.engagementCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200 text-sm font-medium">
                    <button className="text-indigo-600 hover:text-indigo-900 mr-4">View</button>
                    <button className="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-40">
          <p className="text-gray-600 mb-4">You haven't created any content yet.</p>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            onClick={() => {/* Navigate to create content page */}}
          >
            Create Your First Content
          </button>
        </div>
      )}
    </div>
  );
  
  // Render agents tab
  const renderAgentsTab = () => (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Your AI Agents</h3>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          onClick={() => {/* Navigate to create agent page */}}
        >
          Create New Agent
        </button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : agents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {agents.map((agent) => (
            <div key={agent.id} className="border rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-lg font-medium text-gray-900">{agent.name}</h4>
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    agent.agentType === 'creator' 
                      ? 'bg-purple-100 text-purple-800' 
                      : agent.agentType === 'curator' 
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                  }`}>
                    {agent.agentType.charAt(0).toUpperCase() + agent.agentType.slice(1)} Agent
                  </span>
                </div>
                <div className="flex items-center">
                  <span className={`inline-block w-3 h-3 rounded-full ${agent.isActive ? 'bg-green-500' : 'bg-red-500'} mr-2`}></span>
                  <span className="text-sm text-gray-600">{agent.isActive ? 'Active' : 'Inactive'}</span>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mt-2">{agent.description}</p>
              
              <div className="mt-4">
                <h5 className="text-sm font-medium text-gray-900 mb-2">Configuration</h5>
                <div className="bg-gray-50 p-2 rounded text-xs font-mono">
                  {JSON.stringify(agent.configuration, null, 2)}
                </div>
              </div>
              
              <div className="mt-4 flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  Created on {formatDate(agent.creationTimestamp)}
                </div>
                <div>
                  <button 
                    className="text-sm px-3 py-1 rounded focus:outline-none focus:shadow-outline mr-2 border border-gray-300 hover:bg-gray-100"
                    onClick={() => {/* Navigate to edit agent page */}}
                  >
                    Edit
                  </button>
                  <button 
                    className={`text-sm px-3 py-1 rounded text-white focus:outline-none focus:shadow-outline ${
                      agent.isActive 
                        ? 'bg-red-500 hover:bg-red-700' 
                        : 'bg-green-500 hover:bg-green-700'
                    }`}
                    onClick={() => handleAgentToggle(agent.id, agent.isActive)}
                  >
                    {agent.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-40">
          <p className="text-gray-600 mb-4">You haven't created any AI agents yet.</p>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            onClick={() => {/* Navigate to create agent page */}}
          >
            Create Your First Agent
          </button>
        </div>
      )}
    </div>
  );
  
  // Render analytics tab
  const renderAnalyticsTab = () => (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-xl font-semibold mb-6">Analytics Overview</h3>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : analytics ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-blue-800 mb-1">Total Views</h4>
              <div className="text-3xl font-bold text-blue-600">{analytics.totalViews}</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-green-800 mb-1">Total Likes</h4>
              <div className="text-3xl font-bold text-green-600">{analytics.totalLikes}</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-purple-800 mb-1">Total Shares</h4>
              <div className="text-3xl font-bold text-purple-600">{analytics.totalShares}</div>
            </div>
          </div>
          
          <h4 className="text-lg font-medium mb-4">Content Performance</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="px-6 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Content
                  </th>
                  <th className="px-6 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Views
                  </th>
                  <th className="px-6 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Likes
                  </th>
                  <th className="px-6 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Shares
                  </th>
                  <th className="px-6 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Engagement Rate
                  </th>
                </tr>
              </thead>
              <tbody>
                {analytics.contentPerformance.map((item) => (
                  <tr key={item.contentId}>
                    <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">
                      <div className="text-sm font-medium text-gray-900">{item.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200 text-sm text-gray-500">
                      {item.views}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200 text-sm text-gray-500">
                      {item.likes}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200 text-sm text-gray-500">
                      {item.shares}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">
                      <div className="text-sm text-gray-900">
                        {((item.likes + item.shares) / item.views * 100).toFixed(1)}%
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-40">
          <p className="text-gray-600 mb-4">No analytics data available yet.</p>
          <p className="text-sm text-gray-500">Create and publish content to see analytics.</p>
        </div>
      )}
    </div>
  );
  
  // Render rewards tab
  const renderRewardsTab = () => (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-xl font-semibold mb-6">Rewards & Earnings</h3>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <div className="bg-yellow-50 p-6 rounded-lg text-center mb-8">
            <h4 className="text-sm font-medium text-yellow-800 mb-1">Available AAG Tokens</h4>
            <div className="text-4xl font-bold text-yellow-600">{rewards.toFixed(2)}</div>
            <button className="mt-4 bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline">
              Claim Rewards
            </button>
          </div>
          
          <h4 className="text-lg font-medium mb-4">Earning Opportunities</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="border rounded-lg p-4">
              <h5 className="text-md font-medium mb-2">Content Creation</h5>
              <p className="text-sm text-gray-600 mb-2">
                Earn tokens by creating high-quality content that engages users
              </p>
              <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                Create Content →
              </button>
            </div>
            <div className="border rounded-lg p-4">
              <h5 className="text-md font-medium mb-2">Agent Deployment</h5>
              <p className="text-sm text-gray-600 mb-2">
                Deploy AI agents to earn passive income from their activities
              </p>
              <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                Deploy Agent →
              </button>
            </div>
            <div className="border rounded-lg p-4">
              <h5 className="text-md font-medium mb-2">Content Curation</h5>
              <p className="text-sm text-gray-600 mb-2">
                Earn by curating valuable content for other users
              </p>
              <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                Curate Content →
              </button>
            </div>
            <div className="border rounded-lg p-4">
              <h5 className="text-md font-medium mb-2">Staking</h5>
              <p className="text-sm text-gray-600 mb-2">
                Stake your AAG tokens to earn passive income
              </p>
              <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                Stake Tokens →
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
  
  // Main render function
  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Your Dashboard</h2>
      
      {!connected || !account ? (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <p className="text-gray-600 mb-4">Please connect your wallet to access the dashboard.</p>
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
            Connect Wallet
          </button>
        </div>
      ) : (
        <>
          <div className="bg-white shadow rounded-lg mb-6">
            <nav className="flex border-b">
              <button 
                className={`py-4 px-6 focus:outline-none ${activeTab === DashboardTab.PROFILE ? 'border-b-2 border-blue-500 font-medium text-blue-600' : 'text-gray-600 hover:text-blue-500'}`}
                onClick={() => setActiveTab(DashboardTab.PROFILE)}
              >
                Profile
              </button>
              <button 
                className={`py-4 px-6 focus:outline-none ${activeTab === DashboardTab.CONTENT ? 'border-b-2 border-blue-500 font-medium text-blue-600' : 'text-gray-600 hover:text-blue-500'}`}
                onClick={() => setActiveTab(DashboardTab.CONTENT)}
              >
                Content
              </button>
              <button 
                className={`py-4 px-6 focus:outline-none ${activeTab === DashboardTab.AGENTS ? 'border-b-2 border-blue-500 font-medium text-blue-600' : 'text-gray-600 hover:text-blue-500'}`}
                onClick={() => setActiveTab(DashboardTab.AGENTS)}
              >
                AI Agents
              </button>
              <button 
                className={`py-4 px-6 focus:outline-none ${activeTab === DashboardTab.ANALYTICS ? 'border-b-2 border-blue-500 font-medium text-blue-600' : 'text-gray-600 hover:text-blue-500'}`}
                onClick={() => setActiveTab(DashboardTab.ANALYTICS)}
              >
                Analytics
              </button>
              <button 
                className={`py-4 px-6 focus:outline-none ${activeTab === DashboardTab.REWARDS ? 'border-b-2 border-blue-500 font-medium text-blue-600' : 'text-gray-600 hover:text-blue-500'}`}
                onClick={() => setActiveTab(DashboardTab.REWARDS)}
              >
                Rewards
              </button>
            </nav>
          </div>
          
          {activeTab === DashboardTab.PROFILE && renderProfileTab()}
          {activeTab === DashboardTab.CONTENT && renderContentTab()}
          {activeTab === DashboardTab.AGENTS && renderAgentsTab()}
          {activeTab === DashboardTab.ANALYTICS && renderAnalyticsTab()}
          {activeTab === DashboardTab.REWARDS && renderRewardsTab()}
        </>
      )}
    </div>
  );
}; 