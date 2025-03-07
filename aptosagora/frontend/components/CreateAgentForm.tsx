import React, { useState } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { Types } from 'aptos';
import toast from 'react-hot-toast';

// AptosAgora module address (defined in Move.toml)
const MODULE_ADDRESS = '0x42';
const MODULE_NAME = 'agent_framework';
const FUNCTION_NAME = 'create_agent';

interface CreateAgentFormProps {
  onSuccess?: () => void;
}

const CreateAgentForm: React.FC<CreateAgentFormProps> = ({ onSuccess }) => {
  const { connected, account, signAndSubmitTransaction } = useWallet();
  const [agentId, setAgentId] = useState('');
  const [agentType, setAgentType] = useState('1'); // Creator agent by default
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [config, setConfig] = useState(JSON.stringify({
    model: "gpt-4",
    temperature: 0.7,
    max_tokens: 2000,
    tools: ["content_creation", "market_analysis"]
  }, null, 2));
  const [withResourceAccount, setWithResourceAccount] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!connected || !account) {
      toast.error('Please connect your wallet');
      return;
    }
    
    if (!agentId || !name || !description) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      toast.loading('Preparing transaction...', { id: 'transaction' });
      
      const config = '{}'; // JSON configuration for the agent
      const withResourceAccount = false; // Whether to create a resource account
      
      // Create a proper transaction payload with the required type property
      const payload = {
        type: "entry_function_payload",
        function: `${MODULE_ADDRESS}::${MODULE_NAME}::${FUNCTION_NAME}`,
        type_arguments: [],
        arguments: [
          agentId,
          parseInt(agentType),
          name,
          description,
          config,
          withResourceAccount
        ],
      };
      
      // Submit transaction to the blockchain
      const response = await signAndSubmitTransaction(payload);
      
      // Wait for transaction confirmation
      toast.loading('Processing transaction...', { id: 'transaction' });
      
      // Transaction successful
      toast.success('Agent created successfully!', { id: 'transaction' });
      
      // Reset form
      setAgentId('');
      setAgentType('1');
      setName('');
      setDescription('');
      setConfig(JSON.stringify({
        model: "gpt-4",
        temperature: 0.7,
        max_tokens: 2000,
        tools: ["content_creation", "market_analysis"]
      }, null, 2));
      setWithResourceAccount(true);
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating agent:', error);
      toast.error('Failed to create agent. Please try again.', { id: 'transaction' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Create AI Agent</h3>
        <div className="mt-2 max-w-xl text-sm text-gray-500">
          <p>Create a new AI agent to help with content creation or curation.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label htmlFor="agentId" className="block text-sm font-medium text-gray-700">
              Agent ID
            </label>
            <input
              type="text"
              id="agentId"
              value={agentId}
              onChange={(e) => setAgentId(e.target.value)}
              className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-gray-900"
              placeholder="A unique identifier for your agent"
              required
            />
          </div>
          
          <div>
            <label htmlFor="agentType" className="block text-sm font-medium text-gray-700">
              Agent Type
            </label>
            <select
              id="agentType"
              value={agentType}
              onChange={(e) => setAgentType(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md text-gray-900"
            >
              <option value="1">Creator Agent</option>
              <option value="2">Curator Agent</option>
              <option value="3">Distributor Agent</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Agent Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-gray-900"
              placeholder="Give your agent a name"
              required
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-gray-900"
              placeholder="Describe what your agent does"
              required
            />
          </div>
          
          <div>
            <label htmlFor="config" className="block text-sm font-medium text-gray-700">
              Configuration (JSON)
            </label>
            <textarea
              id="config"
              value={config}
              onChange={(e) => setConfig(e.target.value)}
              rows={10}
              className="mt-1 block w-full shadow-sm sm:text-sm font-mono border-gray-300 rounded-md text-gray-900"
              placeholder="Agent configuration in JSON format"
              required
            />
          </div>
          
          <div className="relative flex items-start">
            <div className="flex items-center h-5">
              <input
                id="withResourceAccount"
                type="checkbox"
                checked={withResourceAccount}
                onChange={(e) => setWithResourceAccount(e.target.checked)}
                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="withResourceAccount" className="font-medium text-gray-700">
                Create Resource Account
              </label>
              <p className="text-gray-500">A resource account allows the agent to operate autonomously on-chain.</p>
            </div>
          </div>
          
          <div className="pt-3">
            <button
              type="submit"
              disabled={!connected || isSubmitting}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                !connected || isSubmitting
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
              }`}
            >
              {isSubmitting ? 'Creating...' : 'Create Agent'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAgentForm; 