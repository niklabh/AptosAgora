import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { Types } from 'aptos';
import toast from 'react-hot-toast';

interface ContentData {
  id: string;
  contentHash: string;
  contentType: string;
  description: string;
  creator: string;
  tags: string[];
  creationTimestamp: number;
  engagementCount: number;
}

interface AgentData {
  id: string;
  agentType: string;
  name: string;
  description: string;
  owner: string;
  configuration: Record<string, any>;
  isAutonomous: boolean;
  creationTimestamp: number;
}

interface CreatorProfile {
  address: string;
  name: string;
  bio: string;
  socialLinks: Record<string, string>;
  contentCount: number;
  reputationScore: number;
}

export const useAptosAgora = (moduleAddress: string) => {
  const { account, network, connected, signAndSubmitTransaction } = useWallet();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Function to generate transaction payload
  const generatePayload = useCallback((func: string, typeArgs: string[] = [], args: any[] = []) => {
    if (!moduleAddress) {
      throw new Error('Module address not provided');
    }
    
    return {
      type: 'entry_function_payload',
      function: `${moduleAddress}::${func}`,
      type_arguments: typeArgs,
      arguments: args
    } as Types.EntryFunctionPayload;
  }, [moduleAddress]);
  
  // Function to handle transactions
  const submitTransaction = useCallback(async (func: string, typeArgs: string[] = [], args: any[] = []) => {
    if (!connected || !account) {
      toast.error('Please connect your wallet first');
      return null;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const payload = generatePayload(func, typeArgs, args);
      const response = await signAndSubmitTransaction(payload);
      
      toast.success('Transaction submitted!');
      return response;
    } catch (err: any) {
      console.error('Transaction failed:', err);
      setError(err.message || 'Transaction failed');
      toast.error(`Transaction failed: ${err.message || 'Unknown error'}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, [account, connected, generatePayload, signAndSubmitTransaction]);
  
  // Content Registry functions
  const createContent = useCallback(async (contentHash: string, contentType: string, description: string, tags: string[]) => {
    return submitTransaction('content_registry::create_content', [], [contentHash, contentType, description, tags]);
  }, [submitTransaction]);
  
  const engageWithContent = useCallback(async (contentId: string, engagementType: string) => {
    return submitTransaction('content_registry::engage_with_content', [], [contentId, engagementType]);
  }, [submitTransaction]);
  
  // Agent Framework functions
  const createAgent = useCallback(async (
    agentType: string, 
    name: string, 
    description: string, 
    configuration: Record<string, any>,
    isAutonomous: boolean
  ) => {
    return submitTransaction(
      'agent_framework::create_agent', 
      [], 
      [agentType, name, description, JSON.stringify(configuration), isAutonomous]
    );
  }, [submitTransaction]);
  
  const activateAgent = useCallback(async (agentId: string) => {
    return submitTransaction('agent_framework::activate_agent', [], [agentId]);
  }, [submitTransaction]);
  
  const deactivateAgent = useCallback(async (agentId: string) => {
    return submitTransaction('agent_framework::deactivate_agent', [], [agentId]);
  }, [submitTransaction]);
  
  // Creator Profile functions
  const createProfile = useCallback(async (name: string, bio: string, socialLinks: Record<string, string>) => {
    return submitTransaction(
      'creator_profiles::create_profile', 
      [], 
      [name, bio, JSON.stringify(socialLinks)]
    );
  }, [submitTransaction]);
  
  const updateProfile = useCallback(async (name: string, bio: string, socialLinks: Record<string, string>) => {
    return submitTransaction(
      'creator_profiles::update_profile', 
      [], 
      [name, bio, JSON.stringify(socialLinks)]
    );
  }, [submitTransaction]);
  
  // Reputation System functions
  const rateContent = useCallback(async (contentId: string, rating: number, feedback: string) => {
    return submitTransaction(
      'reputation_system::rate_content', 
      [], 
      [contentId, rating, feedback]
    );
  }, [submitTransaction]);
  
  return {
    loading,
    error,
    // Content Registry
    createContent,
    engageWithContent,
    // Agent Framework
    createAgent,
    activateAgent,
    deactivateAgent,
    // Creator Profiles
    createProfile,
    updateProfile,
    // Reputation System
    rateContent
  };
}; 