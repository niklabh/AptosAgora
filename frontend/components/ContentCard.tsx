import React from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { Types } from 'aptos';
import toast from 'react-hot-toast';

// Truncate address for display
const truncateAddress = (address: string) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

interface ContentCardProps {
  contentId: string;
  contentHash: string;
  contentType: string;
  description: string;
  creator: string;
  tags: string[];
  createdAt: number;
  engagementCount: number;
  isActive: boolean;
  onEngagementRecorded?: () => void;
}

const ContentCard: React.FC<ContentCardProps> = ({
  contentId,
  contentHash,
  contentType,
  description,
  creator,
  tags,
  createdAt,
  engagementCount,
  isActive,
  onEngagementRecorded
}) => {
  const { connected, account, signAndSubmitTransaction } = useWallet();
  const [isEngaging, setIsEngaging] = React.useState(false);

  const handleContentEngagement = async (engagementType: string) => {
    if (!connected || !account) {
      toast.error('Please connect your wallet');
      return;
    }
    
    try {
      setIsEngaging(true);
      
      // Create transaction payload
      const payload: Types.TransactionPayload = {
        type: 'entry_function_payload',
        function: 'aptosagora::content_registry::record_engagement',
        type_arguments: [],
        arguments: [
          contentId,
          engagementType
        ]
      };
      
      // Submit transaction
      const response = await signAndSubmitTransaction(payload);
      
      // Wait for transaction
      toast.success('Engagement recorded!');
      
      // Notify parent component
      if (onEngagementRecorded) {
        onEngagementRecorded();
      }
      
    } catch (error) {
      console.error('Error recording engagement:', error);
      toast.error('Failed to record engagement');
    } finally {
      setIsEngaging(false);
    }
  };

  // Generate a background pattern based on content type
  const getBackground = () => {
    switch (contentType) {
      case 'article':
        return 'bg-gradient-to-r from-blue-500 to-purple-500';
      case 'image':
        return 'bg-gradient-to-r from-pink-500 to-orange-500';
      case 'video':
        return 'bg-gradient-to-r from-red-500 to-yellow-500';
      case 'audio':
        return 'bg-gradient-to-r from-green-500 to-blue-500';
      default:
        return 'bg-gradient-to-r from-purple-500 to-pink-500';
    }
  };

  // Format date
  const formatDate = (timestamp: number) => {
    if (!timestamp) return '';
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  return (
    <div className={`bg-black/30 rounded-lg overflow-hidden ${!isActive ? 'opacity-50' : ''}`}>
      <div className={`h-40 ${getBackground()}`}>
        {contentType === 'image' && contentHash.startsWith('https://') && (
          <img src={contentHash} alt={contentId} className="w-full h-full object-cover" />
        )}
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold truncate">{contentId}</h3>
          <span className="text-xs bg-purple-700 px-2 py-0.5 rounded">{contentType}</span>
        </div>
        <p className="text-sm text-gray-300 mb-2 line-clamp-2">{description}</p>
        <p className="text-sm text-purple-300 mb-2">Creator: {truncateAddress(creator)}</p>
        <div className="flex flex-wrap gap-1 mb-2">
          {tags.map((tag, index) => (
            <span key={index} className="text-xs bg-purple-700/50 px-2 py-0.5 rounded">{tag}</span>
          ))}
        </div>
        <div className="flex justify-between items-center text-xs text-gray-400">
          <span>{formatDate(createdAt)}</span>
          <span>{engagementCount} engagement{engagementCount !== 1 ? 's' : ''}</span>
        </div>
        
        {isActive && (
          <div className="mt-3 flex space-x-2">
            <button
              onClick={() => handleContentEngagement('view')}
              disabled={isEngaging || !connected}
              className="flex-1 text-xs py-1 bg-purple-600/50 hover:bg-purple-600 rounded transition disabled:opacity-50"
            >
              View
            </button>
            <button
              onClick={() => handleContentEngagement('like')}
              disabled={isEngaging || !connected}
              className="flex-1 text-xs py-1 bg-pink-600/50 hover:bg-pink-600 rounded transition disabled:opacity-50"
            >
              Like
            </button>
            <button
              onClick={() => handleContentEngagement('share')}
              disabled={isEngaging || !connected}
              className="flex-1 text-xs py-1 bg-blue-600/50 hover:bg-blue-600 rounded transition disabled:opacity-50"
            >
              Share
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentCard; 