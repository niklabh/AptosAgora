import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { Types } from 'aptos';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import CreateContentForm from '../components/CreateContentForm';
import { client, aptosConfig } from '../utils/aptosClient';

// Use module address from environment variable
const MODULE_ADDRESS = aptosConfig.moduleAddress;

const CreateContentPage = () => {
  const router = useRouter();
  const { connected } = useWallet();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle successful content creation
  const handleSuccess = () => {
    toast.success('Content created successfully!');
    // Redirect to profile page after successful creation
    setTimeout(() => {
      router.push('/profile');
    }, 1500);
  };

  return (
    <Layout title="Create Content">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold text-gray-900">Create Content</h1>
            <p className="mt-2 text-lg text-gray-600">
              Share your knowledge, art, or ideas with the AptosAgora community
            </p>
          </div>
        </div>

        {!connected ? (
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">Connect your wallet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Please connect your wallet to create content on AptosAgora.
            </p>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6">
              <CreateContentForm onSuccess={handleSuccess} />
            </div>
          </div>
        )}

        {/* Content creation guidelines */}
        <div className="mt-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Content Creation Guidelines</h2>
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-5 sm:p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Content Types</h3>
                  <div className="mt-2 text-sm text-gray-500">
                    <p>AptosAgora supports various content types:</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li><strong>Articles:</strong> Educational content, tutorials, analysis, and opinion pieces</li>
                      <li><strong>Images:</strong> Artwork, infographics, and visual content</li>
                      <li><strong>Videos:</strong> Tutorials, demonstrations, and visual explanations</li>
                      <li><strong>Audio:</strong> Podcasts, interviews, and audio content</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900">Best Practices</h3>
                  <div className="mt-2 text-sm text-gray-500">
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Use a clear, descriptive title that accurately represents your content</li>
                      <li>Provide a comprehensive description to help users understand what your content offers</li>
                      <li>Add relevant tags to make your content discoverable</li>
                      <li>For articles, use proper formatting with headings, paragraphs, and lists</li>
                      <li>For images and videos, ensure you have the rights to publish the content</li>
                      <li>Consider using AI agents to help optimize your content</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900">Content Storage</h3>
                  <div className="mt-2 text-sm text-gray-500">
                    <p>
                      AptosAgora uses decentralized storage for content. When you provide a content hash, 
                      it should be a valid IPFS CID (Content Identifier) or Arweave transaction ID.
                    </p>
                    <p className="mt-2">
                      For help with uploading to IPFS or Arweave, check out our 
                      <a href="#" className="text-indigo-600 hover:text-indigo-500"> storage guide</a>.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900">Community Guidelines</h3>
                  <div className="mt-2 text-sm text-gray-500">
                    <p>All content must comply with our community guidelines:</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li>No plagiarism or copyright infringement</li>
                      <li>No harmful, offensive, or illegal content</li>
                      <li>No spam, scams, or misleading information</li>
                      <li>Respect intellectual property rights</li>
                      <li>Provide value to the community</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CreateContentPage; 