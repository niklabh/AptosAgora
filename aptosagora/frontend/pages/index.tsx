import React, { useState } from 'react';
import Head from 'next/head';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { Types, AptosClient } from 'aptos';
import toast from 'react-hot-toast';

const HomePage = () => {
  const { connected, account, signAndSubmitTransaction } = useWallet();
  const [contentId, setContentId] = useState('');
  const [contentHash, setContentHash] = useState('');
  const [contentType, setContentType] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateContent = async (e: React.FormEvent) => {
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
      
      // Convert tags to array
      const tagsArray = tags.split(',').map(tag => tag.trim());
      
      // Create transaction payload
      const payload: Types.TransactionPayload = {
        type: 'entry_function_payload',
        function: 'aptosagora::content_registry::create_content',
        type_arguments: [],
        arguments: [
          contentId,
          contentHash,
          contentType,
          description,
          tagsArray
        ]
      };
      
      // Submit transaction
      const response = await signAndSubmitTransaction(payload);
      
      // Wait for transaction
      const client = new AptosClient('https://fullnode.devnet.aptoslabs.com/v1');
      await client.waitForTransaction(response.hash);
      
      toast.success('Content created successfully!');
      
      // Reset form
      setContentId('');
      setContentHash('');
      setContentType('');
      setDescription('');
      setTags('');
      
    } catch (error) {
      console.error(error);
      toast.error('Error creating content');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <Head>
        <title>AptosAgora - AI-Driven Content Marketplace</title>
        <meta name="description" content="Decentralized marketplace for digital content with AI agents" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900 text-white">
        <div className="container mx-auto px-4 py-8">
          <header className="flex justify-between items-center mb-12">
            <div>
              <h1 className="text-4xl font-bold">AptosAgora</h1>
              <p className="text-purple-300">AI-Driven Decentralized Content Marketplace</p>
            </div>
            <div>
              {!connected ? (
                <button 
                  className="bg-white text-purple-900 px-4 py-2 rounded-lg font-medium hover:bg-purple-100 transition"
                  onClick={() => toast.error('Please install and connect wallet using the wallet adapter')}
                >
                  Connect Wallet
                </button>
              ) : (
                <div className="text-right">
                  <p className="text-sm text-purple-300">Connected Wallet</p>
                  <p className="font-mono text-xs truncate w-36">{account?.address}</p>
                </div>
              )}
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-black/20 p-6 rounded-xl backdrop-blur-sm">
              <h2 className="text-2xl font-semibold mb-4">Create Content</h2>
              
              <form onSubmit={handleCreateContent}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Content ID</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-white/10 rounded-lg text-white"
                    placeholder="Unique identifier"
                    value={contentId}
                    onChange={(e) => setContentId(e.target.value)}
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Content Hash (IPFS)</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-white/10 rounded-lg text-white"
                    placeholder="IPFS CID or URL"
                    value={contentHash}
                    onChange={(e) => setContentHash(e.target.value)}
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Content Type</label>
                  <select
                    className="w-full px-3 py-2 bg-white/10 rounded-lg text-white"
                    value={contentType}
                    onChange={(e) => setContentType(e.target.value)}
                    required
                  >
                    <option value="">Select a type</option>
                    <option value="article">Article</option>
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                    <option value="audio">Audio</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    className="w-full px-3 py-2 bg-white/10 rounded-lg text-white"
                    placeholder="Content description"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-1">Tags (comma-separated)</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-white/10 rounded-lg text-white"
                    placeholder="art, design, photography"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={!connected || isSubmitting}
                  className="w-full bg-purple-600 hover:bg-purple-700 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Creating...' : 'Create Content'}
                </button>
              </form>
            </div>
            
            <div className="bg-black/20 p-6 rounded-xl backdrop-blur-sm">
              <h2 className="text-2xl font-semibold mb-4">AI Agents</h2>
              
              <div className="space-y-4">
                <div className="border border-purple-500/30 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-purple-600 p-3 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold">Creator Agent</h3>
                        <p className="text-sm text-purple-300">Helps optimize your content</p>
                      </div>
                    </div>
                    <button className="bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded text-sm">Create</button>
                  </div>
                </div>
                
                <div className="border border-purple-500/30 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-purple-600 p-3 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold">Curator Agent</h3>
                        <p className="text-sm text-purple-300">Discovers relevant content</p>
                      </div>
                    </div>
                    <button className="bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded text-sm">Create</button>
                  </div>
                </div>
                
                <div className="border border-purple-500/30 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-purple-600 p-3 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold">Distributor Agent</h3>
                        <p className="text-sm text-purple-300">Manages cross-platform publishing</p>
                      </div>
                    </div>
                    <button className="bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded text-sm">Create</button>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 text-center">
                <p className="text-purple-300 text-sm">
                  AI agents help you create, curate, and distribute content more effectively
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <h2 className="text-2xl font-semibold mb-4">Featured Content</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div className="bg-black/30 rounded-lg overflow-hidden">
                <div className="h-40 bg-gradient-to-r from-purple-500 to-pink-500"></div>
                <div className="p-4">
                  <h3 className="font-semibold truncate">Example Content Title</h3>
                  <p className="text-sm text-purple-300 mt-1">Creator: 0x1234...5678</p>
                  <div className="flex mt-2">
                    <span className="text-xs bg-purple-700 px-2 py-0.5 rounded mr-1">art</span>
                    <span className="text-xs bg-purple-700 px-2 py-0.5 rounded">design</span>
                  </div>
                </div>
              </div>
              
              {/* Additional content cards would be here */}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage; 