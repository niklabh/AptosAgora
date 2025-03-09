import { AptosClient, Network, Types } from 'aptos';

// Get environment variables with fallbacks
const APTOS_NODE_URL = process.env.NEXT_PUBLIC_APTOS_NODE_URL || 'https://fullnode.devnet.aptoslabs.com/v1';
const APTOS_NETWORK = (process.env.NEXT_PUBLIC_APTOS_NETWORK || 'devnet') as Network;
const APTOS_MODULE_ADDRESS = process.env.NEXT_PUBLIC_APTOS_MODULE_ADDRESS || '0x1';
const APTOS_EXPLORER_URL = process.env.NEXT_PUBLIC_APTOS_EXPLORER_URL || 'https://explorer.aptoslabs.com';

// Log environment variable loading for debugging
console.log('🔄 Aptos Configuration Loading:');
console.log(`🔗 NODE URL: ${APTOS_NODE_URL}`);
console.log(`🌐 NETWORK: ${APTOS_NETWORK}`);
console.log(`📦 MODULE ADDRESS: ${APTOS_MODULE_ADDRESS}`);
console.log(`🔍 EXPLORER URL: ${APTOS_EXPLORER_URL}`);

// Create a singleton client
export const client = new AptosClient(APTOS_NODE_URL);

// Export configuration for use throughout the app
export const aptosConfig = {
  nodeUrl: APTOS_NODE_URL,
  network: APTOS_NETWORK,
  moduleAddress: APTOS_MODULE_ADDRESS,
  explorerUrl: APTOS_EXPLORER_URL
};

console.log('✅ Aptos Configuration Loaded:', aptosConfig);

// Helper to get transaction URL for explorer
export const getTransactionUrl = (txHash: string): string => {
  return `${APTOS_EXPLORER_URL}/txn/${txHash}?network=${APTOS_NETWORK}`;
};

// Helper to get account URL for explorer
export const getAccountUrl = (address: string): string => {
  return `${APTOS_EXPLORER_URL}/account/${address}?network=${APTOS_NETWORK}`;
}; 