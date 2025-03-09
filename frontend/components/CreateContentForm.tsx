import React, { useState } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { Types } from 'aptos';
import toast from 'react-hot-toast';
import { aptosConfig } from '../utils/aptosClient';

// Use module address from aptosConfig
const MODULE_ADDRESS = aptosConfig.moduleAddress;
const MODULE_NAME = 'content_registry';
const FUNCTION_NAME = 'create_content';

interface CreateContentFormProps {
  onSuccess?: () => void;
}

const CreateContentForm: React.FC<CreateContentFormProps> = ({ onSuccess }) => {
  const { connected, account, signAndSubmitTransaction } = useWallet();
  const [title, setTitle] = useState('');
  const [contentId, setContentId] = useState('');
  const [contentHash, setContentHash] = useState('');
  const [contentType, setContentType] = useState('article');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!connected || !account) {
      toast.error('Please connect your wallet');
      return;
    }
    
    if (!contentId || !contentHash || !contentType || !description) {
      toast.error('Please fill all required fields');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Convert tags to a vector
      const tagsVector = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      
      // Log transaction function path for debugging
      console.log('📝 Creating content with function path:', `${MODULE_ADDRESS}::${MODULE_NAME}::${FUNCTION_NAME}`);
      console.log('📝 Module Address:', MODULE_ADDRESS);
      console.log('📝 Content Data:', {
        contentId,
        contentHash,
        contentType,
        description,
        tagsVector
      });
      
      // Build transaction payload
      const payload = {
        type: "entry_function_payload",
        function: `${MODULE_ADDRESS}::${MODULE_NAME}::${FUNCTION_NAME}`,
        type_arguments: [],
        arguments: [
          contentId,
          contentHash,
          contentType,
          description,
          tagsVector
        ],
      };
      
      console.log('📝 Transaction Payload:', payload);
      
      // Submit transaction to the blockchain
      const response = await signAndSubmitTransaction(payload);
      
      // Wait for transaction confirmation
      toast.loading('Processing transaction...', { id: 'transaction' });
      
      // Transaction successful
      toast.success('Content created successfully!', { id: 'transaction' });
      
      // Reset form
      setTitle('');
      setContentId('');
      setContentHash('');
      setContentType('article');
      setDescription('');
      setTags('');
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating content:', error);
      toast.error('Failed to create content. Please try again.', { id: 'transaction' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Create New Content</h3>
        <div className="mt-2 max-w-xl text-sm text-gray-500">
          <p>Publish new content to the AptosAgora platform.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-gray-900"
              placeholder="Enter title"
              required
            />
          </div>
          
          <div>
            <label htmlFor="contentId" className="block text-sm font-medium text-gray-700">
              Content ID
            </label>
            <input
              type="text"
              id="contentId"
              value={contentId}
              onChange={(e) => setContentId(e.target.value)}
              className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-gray-900"
              placeholder="A unique identifier for your content"
              required
            />
          </div>
          
          <div>
            <label htmlFor="contentHash" className="block text-sm font-medium text-gray-700">
              Content Hash (IPFS CID or other storage reference)
            </label>
            <input
              type="text"
              id="contentHash"
              value={contentHash}
              onChange={(e) => setContentHash(e.target.value)}
              className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-gray-900"
              placeholder="e.g. ipfs://QmHash..."
              required
            />
          </div>
          
          <div>
            <label htmlFor="contentType" className="block text-sm font-medium text-gray-700">
              Content Type
            </label>
            <select
              id="contentType"
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md text-gray-900"
            >
              <option value="article">Article</option>
              <option value="image">Image</option>
              <option value="video">Video</option>
              <option value="audio">Audio</option>
              <option value="other">Other</option>
            </select>
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
              placeholder="Describe your content"
              required
            />
          </div>
          
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
              Tags (comma separated)
            </label>
            <input
              type="text"
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-gray-900"
              placeholder="e.g. art, tutorial, aptos"
            />
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
              {isSubmitting ? 'Creating...' : 'Create Content'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateContentForm; 