import React, { useState } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { Types } from 'aptos';
import toast from 'react-hot-toast';

// Agent types as defined in the agent_framework module
const AGENT_TYPES = {
  CREATOR: 1,
  CURATOR: 2,
  DISTRIBUTOR: 3
};

const AgentTypeLabels = {
  [AGENT_TYPES.CREATOR]: 'Creator Agent',
  [AGENT_TYPES.CURATOR]: 'Curator Agent',
  [AGENT_TYPES.DISTRIBUTOR]: 'Distributor Agent'
};

const AgentTypeDescriptions = {
  [AGENT_TYPES.CREATOR]: 'Helps optimize your content for better engagement',
  [AGENT_TYPES.CURATOR]: 'Discovers and recommends content based on user preferences',
  [AGENT_TYPES.DISTRIBUTOR]: 'Manages cross-platform publishing and monetization'
};

interface AgentCreatorProps {
  onAgentCreated?: () => void;
}

const AgentCreator: React.FC<AgentCreatorProps> = ({ onAgentCreated }) => {
  const { connected, account, signAndSubmitTransaction } = useWallet();
  const [agentId, setAgentId] = useState('');
  const [agentType, setAgentType] = useState(AGENT_TYPES.CREATOR);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [config, setConfig] = useState('');
  const [withResourceAccount, setWithResourceAccount] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!connected || !account) {
      toast.error('Please connect your wallet');
      return;
    }
    
    if (!agentId || !name) {
      toast.error('Agent ID and name are required');
      return;
    }
    
    try {
      setIsCreating(true);
      
      // Prepare default configuration if empty
      const configJSON = config || JSON.stringify({
        model: 'gpt-4',
        temperature: 0.7,
        max_tokens: 1000
      });
      
      // Create transaction payload
      const payload: Types.TransactionPayload = {
        type: 'entry_function_payload',
        function: 'aptosagora::agent_framework::create_agent',
        type_arguments: [],
        arguments: [
          agentId,
          agentType,
          name,
          description,
          configJSON,
          withResourceAccount
        ]
      };
      
      // Submit transaction
      const response = await signAndSubmitTransaction(payload);
      
      // Wait for transaction
      toast.success('Agent creation transaction submitted!');
      
      // Reset form
      setAgentId('');
      setName('');
      setDescription('');
      setConfig('');
      setWithResourceAccount(false);
      
      // Notify parent component
      if (onAgentCreated) {
        onAgentCreated();
      }
      
    } catch (error) {
      console.error('Error creating agent:', error);
      toast.error('Failed to create agent');
    } finally {
      setIsCreating(false);
    }
  };
  
  return (
    <div className="bg-black/20 p-6 rounded-xl backdrop-blur-sm">
      <h2 className="text-2xl font-semibold mb-4">Create AI Agent</h2>
      
      <form onSubmit={handleCreateAgent}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Agent Type</label>
          <select
            className="w-full px-3 py-2 bg-white/10 rounded-lg text-white"
            value={agentType}
            onChange={(e) => setAgentType(Number(e.target.value))}
            required
          >
            <option value={AGENT_TYPES.CREATOR}>Creator Agent</option>
            <option value={AGENT_TYPES.CURATOR}>Curator Agent</option>
            <option value={AGENT_TYPES.DISTRIBUTOR}>Distributor Agent</option>
          </select>
          <p className="mt-1 text-sm text-purple-300">
            {AgentTypeDescriptions[agentType]}
          </p>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Agent ID</label>
          <input
            type="text"
            className="w-full px-3 py-2 bg-white/10 rounded-lg text-white"
            placeholder="A unique identifier (e.g., 'my-first-agent')"
            value={agentId}
            onChange={(e) => setAgentId(e.target.value)}
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            className="w-full px-3 py-2 bg-white/10 rounded-lg text-white"
            placeholder="Agent display name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            className="w-full px-3 py-2 bg-white/10 rounded-lg text-white"
            placeholder="What your agent does"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Config (JSON)</label>
          <textarea
            className="w-full px-3 py-2 bg-white/10 rounded-lg text-white font-mono text-sm"
            placeholder='{"model": "gpt-4", "temperature": 0.7, "max_tokens": 1000}'
            rows={5}
            value={config}
            onChange={(e) => setConfig(e.target.value)}
          />
        </div>
        
        <div className="mb-6">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              className="rounded bg-white/10 text-purple-500 focus:ring-purple-500"
              checked={withResourceAccount}
              onChange={(e) => setWithResourceAccount(e.target.checked)}
            />
            <span className="text-sm">Enable autonomous operations (creates resource account)</span>
          </label>
          <p className="mt-1 text-xs text-purple-300 ml-6">
            This allows the agent to perform operations on your behalf after your approval
          </p>
        </div>
        
        <button
          type="submit"
          disabled={!connected || isCreating}
          className="w-full bg-purple-600 hover:bg-purple-700 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCreating ? 'Creating Agent...' : 'Create Agent'}
        </button>
      </form>
    </div>
  );
};

export default AgentCreator; 