import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { AptosClient, Types } from 'aptos';
import toast from 'react-hot-toast';
import Layout from '../../components/Layout';
import { client, aptosConfig } from '../../utils/aptosClient';

// AptosAgora module address (defined in Move.toml)
const MODULE_ADDRESS = aptosConfig.moduleAddress;

// Define content interface
interface Comment {
  id: string;
  author: string;
  authorName: string;
  content: string;
  timestamp: string;
  likes: number;
}

interface Content {
  id: string;
  title: string;
  description: string;
  contentType: string;
  creator: string;
  creatorName: string;
  createdAt: string;
  tags: string[];
  engagementCount: number;
  content?: string;
  comments: Comment[];
  imageUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
}

// Mock data for content items (in a real app, this would come from the blockchain)
const mockContents: Record<string, Content> = {
  'guide-to-aptos': {
    id: 'guide-to-aptos',
    title: 'The Ultimate Guide to Aptos Blockchain',
    description: 'Learn everything about Aptos blockchain, from Move language to building decentralized applications. This comprehensive guide covers all aspects of the Aptos ecosystem.',
    contentType: 'article',
    creator: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    creatorName: 'AptosDeveloper',
    createdAt: '2023-09-15T14:32:21Z',
    tags: ['guide', 'tutorial', 'aptos', 'blockchain'],
    engagementCount: 128,
    content: `
# The Ultimate Guide to Aptos Blockchain

## Introduction
Aptos is a Layer 1 blockchain that offers a secure, scalable, and upgradable foundation for web3 applications. Built with Move, a safe and reliable programming language, Aptos provides developers with the tools to create user-friendly applications.

## Key Features

### Parallel Execution Engine
Aptos utilizes a parallel execution engine that processes transactions concurrently, significantly increasing throughput and efficiency compared to sequential execution models.

### Move Programming Language
Move is a safe and flexible programming language for implementing smart contracts. It was originally developed at Facebook for the Diem blockchain and has been adopted by Aptos.

Key benefits of Move include:
- First-class resources that cannot be copied or implicitly discarded
- Flexible modules that can be used to define custom resource types
- Safety features that help prevent common smart contract vulnerabilities

### Consensus Mechanism
Aptos uses a Byzantine Fault Tolerance (BFT) consensus protocol that ensures high throughput and low latency while maintaining security.

## Getting Started with Development

To start building on Aptos, you'll need to:

1. Set up your development environment
2. Learn the basics of Move programming
3. Understand the Aptos account model
4. Explore the Aptos framework modules

## Conclusion
Aptos offers a promising foundation for the next generation of decentralized applications with its focus on security, scalability, and developer experience.
    `,
    comments: [
      {
        id: 'comment-1',
        author: '0x2345678901abcdef2345678901abcdef2345678901abcdef2345678901abcdef',
        authorName: 'MoveEnthusiast',
        content: 'Great overview! I especially appreciate the explanation of the parallel execution engine.',
        timestamp: '2023-09-16T09:12:33Z',
        likes: 5
      },
      {
        id: 'comment-2',
        author: '0x3456789012abcdef3456789012abcdef3456789012abcdef3456789012abcdef',
        authorName: 'BlockchainNewbie',
        content: 'This helped me understand Aptos much better. Could you add more examples of Move code in a future update?',
        timestamp: '2023-09-16T14:45:21Z',
        likes: 3
      }
    ]
  },
  'ai-nft-artwork': {
    id: 'ai-nft-artwork',
    title: 'AI-Generated NFT Collection: Digital Dreamscapes',
    description: 'Explore this unique collection of AI-generated NFT artwork that blends surrealism with digital landscapes. Each piece is one-of-a-kind and generated using cutting-edge algorithms.',
    contentType: 'image',
    creator: '0x2345678901abcdef2345678901abcdef2345678901abcdef2345678901abcdef',
    creatorName: 'AIArtistCollective',
    createdAt: '2023-09-14T09:18:43Z',
    tags: ['art', 'nft', 'ai', 'digital'],
    engagementCount: 74,
    imageUrl: 'https://images.unsplash.com/photo-1639762681057-408e52192e55?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2232&q=80',
    comments: [
      {
        id: 'comment-1',
        author: '0x4567890123abcdef4567890123abcdef4567890123abcdef4567890123abcdef',
        authorName: 'DigitalArtFan',
        content: 'The colors in this piece are absolutely mesmerizing. I love how the AI has blended the surreal elements with the landscape.',
        timestamp: '2023-09-15T11:23:45Z',
        likes: 8
      }
    ]
  },
  'defi-protocol-overview': {
    id: 'defi-protocol-overview',
    title: 'DeFi on Aptos: Protocol Analysis and Comparison',
    description: 'A detailed analysis of the top DeFi protocols building on Aptos blockchain. Compare features, tokenomics, security measures, and growth potential in this in-depth report.',
    contentType: 'article',
    creator: '0x3456789012abcdef3456789012abcdef3456789012abcdef3456789012abcdef',
    creatorName: 'DeFiAnalyst',
    createdAt: '2023-09-12T16:45:09Z',
    tags: ['defi', 'finance', 'analysis', 'aptos'],
    engagementCount: 92,
    content: `
# DeFi on Aptos: Protocol Analysis and Comparison

## Introduction
The Aptos blockchain has seen rapid growth in its DeFi ecosystem since mainnet launch. This report analyzes the top protocols currently building on Aptos, comparing their features, tokenomics, security measures, and growth potential.

## Top DeFi Protocols on Aptos

### 1. Liquidswap
- **Type**: Automated Market Maker (AMM)
- **Features**: Concentrated liquidity, multiple fee tiers
- **Tokenomics**: Native token with governance rights and fee sharing
- **Security**: Audited by three independent firms
- **Growth Potential**: High, with increasing volume and TVL

### 2. Ditto Finance
- **Type**: Stablecoin protocol
- **Features**: Over-collateralized stablecoin backed by multiple assets
- **Tokenomics**: Dual token system with stability and governance tokens
- **Security**: Formal verification of core contracts
- **Growth Potential**: Medium-high, dependent on stablecoin adoption

### 3. Aries Markets
- **Type**: Lending protocol
- **Features**: Variable and fixed rate lending, flash loans
- **Tokenomics**: Revenue sharing with token holders
- **Security**: Audited, with bug bounty program
- **Growth Potential**: High, addressing key DeFi primitive

## Comparison Metrics

| Protocol | TVL (USD) | Daily Volume | Users | Audit Status |
|----------|-----------|--------------|-------|--------------|
| Liquidswap | $45M | $12M | 15,000 | ✅ |
| Ditto Finance | $28M | $5M | 8,500 | ✅ |
| Aries Markets | $32M | $7M | 10,200 | ✅ |

## Conclusion
The Aptos DeFi ecosystem is still in its early stages but shows promising growth. The parallel execution capabilities of the blockchain make it particularly well-suited for DeFi applications requiring high throughput.

Key factors to watch include:
- Integration between protocols to create more complex DeFi primitives
- Cross-chain bridges to bring liquidity from other ecosystems
- Regulatory developments that may impact certain protocol designs
    `,
    comments: [
      {
        id: 'comment-1',
        author: '0x5678901234abcdef5678901234abcdef5678901234abcdef5678901234abcdef',
        authorName: 'CryptoResearcher',
        content: 'Excellent analysis. I would add that the composability between these protocols is also a key factor to consider for the ecosystem growth.',
        timestamp: '2023-09-13T10:34:21Z',
        likes: 12
      },
      {
        id: 'comment-2',
        author: '0x6789012345abcdef6789012345abcdef6789012345abcdef6789012345abcdef',
        authorName: 'DeFiDeveloper',
        content: 'Great overview. One thing to note is that Aries Markets has recently upgraded their risk management system, which might improve their growth potential.',
        timestamp: '2023-09-14T08:15:43Z',
        likes: 7
      }
    ]
  }
};

const ContentDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { connected, account, signAndSubmitTransaction } = useWallet();
  const [content, setContent] = useState<Content | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  // Fetch content data
  useEffect(() => {
    if (!id) return;
    
    setIsLoading(true);
    
    // In a real implementation, this would query the blockchain
    // For now, use mock data
    setTimeout(() => {
      // Use string type assertion for id since it could be string or string[]
      const contentId = typeof id === 'string' ? id : Array.isArray(id) ? id[0] : '';
      const contentData = mockContents[contentId];
      if (contentData) {
        setContent(contentData);
      } else {
        toast.error('Content not found');
        router.push('/');
      }
      setIsLoading(false);
    }, 800);
  }, [id, router]);

  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Handle comment submission
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!connected || !account) {
      toast.error('Please connect your wallet');
      return;
    }
    
    if (!commentText.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }
    
    if (!content) {
      toast.error('Content not found');
      return;
    }
    
    setIsSubmittingComment(true);
    
    try {
      // In a real implementation, this would submit a transaction to the blockchain
      // For demonstration, we'll just simulate it
      
      // Create transaction payload
      const payload = {
        type: 'entry_function_payload',
        function: `${MODULE_ADDRESS}::content_engagement::add_comment`,
        type_arguments: [],
        arguments: [content.id, commentText]
      };
      
      // Simulate transaction success
      setTimeout(() => {
        // Add the new comment to the content
        const newComment: Comment = {
          id: `comment-${Date.now()}`,
          author: account.address,
          authorName: account.address.substring(0, 6) + '...',
          content: commentText,
          timestamp: new Date().toISOString(),
          likes: 0
        };
        
        setContent(prevContent => {
          if (!prevContent) return prevContent;
          return {
            ...prevContent,
            comments: [newComment, ...prevContent.comments],
            engagementCount: prevContent.engagementCount + 1
          };
        });
        
        setCommentText('');
        toast.success('Comment added successfully');
        setIsSubmittingComment(false);
      }, 1000);
      
      // In a real implementation, you would do:
      // const response = await signAndSubmitTransaction(payload);
      // await client.waitForTransaction(response.hash);
      
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast.error('Failed to submit comment');
      setIsSubmittingComment(false);
    }
  };

  // Handle like/engagement
  const handleLike = async () => {
    if (!connected || !account) {
      toast.error('Please connect your wallet');
      return;
    }
    
    if (!content) {
      toast.error('Content not found');
      return;
    }
    
    setIsLiking(true);
    
    try {
      // In a real implementation, this would submit a transaction to the blockchain
      // For demonstration, we'll just simulate it
      
      // Create transaction payload
      const payload = {
        type: 'entry_function_payload',
        function: `${MODULE_ADDRESS}::content_engagement::like_content`,
        type_arguments: [],
        arguments: [content.id]
      };
      
      // Simulate transaction success
      setTimeout(() => {
        setContent(prevContent => {
          if (!prevContent) return prevContent;
          return {
            ...prevContent,
            engagementCount: prevContent.engagementCount + 1
          };
        });
        
        toast.success('Content liked successfully');
        setIsLiking(false);
      }, 1000);
      
      // In a real implementation, you would do:
      // const response = await signAndSubmitTransaction(payload);
      // await client.waitForTransaction(response.hash);
      
    } catch (error) {
      console.error('Error liking content:', error);
      toast.error('Failed to like content');
      setIsLiking(false);
    }
  };

  // Render content based on type
  const renderContentBody = () => {
    if (!content) return null;
    
    switch (content.contentType) {
      case 'article':
        return (
          <div className="prose prose-indigo max-w-none text-gray-900">
            <div dangerouslySetInnerHTML={{ 
              __html: content.content ? content.content
                .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold mt-6 mb-4 text-gray-900">$1</h1>')
                .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold mt-5 mb-3 text-gray-900">$1</h2>')
                .replace(/^### (.*$)/gm, '<h3 class="text-xl font-bold mt-4 mb-2 text-gray-900">$1</h3>')
                .replace(/\*\*(.*?)\*\*/g, '<strong class="text-gray-900">$1</strong>')
                .replace(/\n\n/g, '<br/><br/>')
                .replace(/^- (.*$)/gm, '<li class="text-gray-900">$1</li>')
                .replace(/<li.*<\/li>/g, '<ul class="list-disc pl-5 my-2 text-gray-900">$&</ul>')
                .replace(/\| (.*) \|/g, '<tr><td class="text-gray-900">$1</td></tr>')
                .replace(/<tr><td>(.*)\|.*<\/td><\/tr>/g, function(match) {
                  return match.replace(/\|/g, '</td><td class="text-gray-900">');
                })
                .replace(/<tr>.*<\/tr>/, '<table class="min-w-full divide-y divide-gray-300 my-4 text-gray-900"><thead>$&</thead><tbody>')
                .replace(/<\/tr>(?![\s\S]*<\/tr>)/, '</tbody></table>')
                : content.description
            }} />
          </div>
        );
      case 'image':
        return (
          <div className="mt-6">
            <img 
              src={content.imageUrl} 
              alt={content.title} 
              className="w-full h-auto rounded-lg shadow-lg max-h-[600px] object-contain"
            />
          </div>
        );
      case 'video':
        return (
          <div className="mt-6 aspect-w-16 aspect-h-9">
            <iframe 
              src={content.videoUrl || "https://www.youtube.com/embed/dQw4w9WgXcQ"} 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
              className="w-full h-[500px] rounded-lg shadow-lg"
            ></iframe>
          </div>
        );
      case 'audio':
        return (
          <div className="mt-6">
            <audio 
              controls 
              className="w-full"
              src={content.audioUrl || "https://example.com/audio.mp3"}
            >
              Your browser does not support the audio element.
            </audio>
          </div>
        );
      default:
        return (
          <div className="mt-6 text-gray-700">
            {content.description}
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <Layout title="Loading...">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
            <div className="h-64 bg-gray-200 rounded mb-6"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!content) {
    return (
      <Layout title="Content Not Found">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Content Not Found</h1>
          <p className="mt-2 text-lg text-gray-600">
            The content you're looking for doesn't exist or has been removed.
          </p>
          <div className="mt-6">
            <button
              onClick={() => router.push('/')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Return to Home
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={content.title}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Content header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{content.title}</h1>
          <div className="mt-2 flex items-center text-sm text-gray-500">
            <span>By {content.creatorName}</span>
            <span className="mx-2">•</span>
            <span>{formatDate(content.createdAt)}</span>
            <span className="mx-2">•</span>
            <span>{content.contentType.charAt(0).toUpperCase() + content.contentType.slice(1)}</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {content.tags.map(tag => (
              <span 
                key={tag} 
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Content body */}
        <div className="mt-8">
          {renderContentBody()}
        </div>

        {/* Engagement section */}
        <div className="mt-10 pt-10 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Engagement</h2>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                </svg>
                <span className="text-gray-600">{content.engagementCount}</span>
              </div>
              <button
                onClick={handleLike}
                disabled={isLiking || !connected}
                className={`inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md ${
                  connected 
                    ? 'text-white bg-indigo-600 hover:bg-indigo-700' 
                    : 'text-gray-500 bg-gray-200 cursor-not-allowed'
                }`}
              >
                {isLiking ? 'Liking...' : 'Like'}
              </button>
            </div>
          </div>

          {/* Comment form */}
          <div className="mt-6">
            <form onSubmit={handleSubmitComment}>
              <div>
                <label htmlFor="comment" className="sr-only">Add a comment</label>
                <textarea
                  id="comment"
                  name="comment"
                  rows={3}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md text-gray-900"
                  placeholder="Add a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  disabled={!connected}
                ></textarea>
              </div>
              <div className="mt-3 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmittingComment || !connected || !commentText.trim()}
                  className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm ${
                    connected && commentText.trim()
                      ? 'text-white bg-indigo-600 hover:bg-indigo-700' 
                      : 'text-gray-500 bg-gray-200 cursor-not-allowed'
                  }`}
                >
                  {isSubmittingComment ? 'Submitting...' : 'Submit'}
                </button>
              </div>
              {!connected && (
                <p className="mt-2 text-sm text-gray-500">
                  Connect your wallet to comment on this content.
                </p>
              )}
            </form>
          </div>

          {/* Comments list */}
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900">Comments ({content.comments.length})</h3>
            <div className="mt-4 space-y-6">
              {content.comments.length > 0 ? (
                content.comments.map((comment) => (
                  <div key={comment.id} className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <div className="bg-indigo-100 rounded-full p-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{comment.authorName}</p>
                          <p className="text-xs text-gray-500">{formatDate(comment.timestamp)}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                        </svg>
                        <span className="text-xs text-gray-500">{comment.likes}</span>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-700">
                      {comment.content}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No comments yet. Be the first to comment!</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ContentDetailPage; 