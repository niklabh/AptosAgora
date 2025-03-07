import { AptosAccount, AptosClient, TxnBuilderTypes, Types, HexString } from 'aptos';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Script to deploy the AptosAgora modules
 * 
 * Usage:
 * npm install aptos
 * npx ts-node deploy.ts --network devnet --private-key <your-private-key>
 */

// Parse command line arguments
const args = process.argv.slice(2);
let network = 'local';
let privateKeyHex = '';

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--network' && i + 1 < args.length) {
    network = args[i + 1];
    i++;
  } else if (args[i] === '--private-key' && i + 1 < args.length) {
    privateKeyHex = args[i + 1];
    i++;
  }
}

// Network configuration
const NETWORK_CONFIG = {
  local: {
    nodeUrl: 'http://localhost:8080',
    faucetUrl: 'http://localhost:8081'
  },
  devnet: {
    nodeUrl: 'https://fullnode.devnet.aptoslabs.com/v1',
    faucetUrl: 'https://faucet.devnet.aptoslabs.com'
  },
  testnet: {
    nodeUrl: 'https://fullnode.testnet.aptoslabs.com/v1',
    faucetUrl: 'https://faucet.testnet.aptoslabs.com'
  },
  mainnet: {
    nodeUrl: 'https://fullnode.mainnet.aptoslabs.com/v1',
    faucetUrl: ''
  }
};

// Validate network
if (!Object.keys(NETWORK_CONFIG).includes(network)) {
  console.error(`Invalid network: ${network}. Valid options are: ${Object.keys(NETWORK_CONFIG).join(', ')}`);
  process.exit(1);
}

// Validate private key
if (!privateKeyHex && network !== 'local') {
  console.error('Private key is required for non-local networks');
  process.exit(1);
}

async function main() {
  console.log(`Deploying AptosAgora modules to ${network}...`);
  
  // Create Aptos client
  const client = new AptosClient(NETWORK_CONFIG[network].nodeUrl);
  
  // Create deployer account
  let deployer: AptosAccount;
  if (privateKeyHex) {
    // Use provided private key
    deployer = new AptosAccount(HexString.ensure(privateKeyHex).toUint8Array());
  } else {
    // Generate a new account for local testing
    deployer = new AptosAccount();
    
    // Fund the account for local testing
    if (network === 'local') {
      // Fund account using local faucet
      console.log('Funding local account...');
      // Implementation depends on local setup
    }
  }
  
  console.log(`Deployer address: ${deployer.address().hex()}`);
  
  // Check account balance
  try {
    const resources = await client.getAccountResources(deployer.address());
    const accountResource = resources.find(r => r.type === '0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>');
    
    if (accountResource) {
      const balance = parseInt((accountResource.data as any).coin.value);
      console.log(`Account balance: ${balance / 100000000} APT`);
      
      if (balance < 1000000) { // 0.01 APT
        console.warn('Warning: Account balance is low');
      }
    }
  } catch (error) {
    console.error('Error checking account balance:', error);
    if (network !== 'local') {
      console.error('Account may not exist or have insufficient funds');
      process.exit(1);
    }
  }
  
  // Read compiled modules
  const moveDir = path.resolve(__dirname, '..', 'move', 'build', 'AptosAgora', 'bytecode_modules');
  if (!fs.existsSync(moveDir)) {
    console.error('Compiled modules not found. Please compile the Move modules first with:');
    console.error('cd move && aptos move compile');
    process.exit(1);
  }
  
  const modules = fs.readdirSync(moveDir).filter(file => file.endsWith('.mv'));
  console.log(`Found ${modules.length} compiled modules: ${modules.join(', ')}`);
  
  // Deploy modules
  for (const moduleFile of modules) {
    const modulePath = path.join(moveDir, moduleFile);
    const moduleBytes = fs.readFileSync(modulePath);
    
    console.log(`Deploying module: ${moduleFile}...`);
    
    try {
      const txnHash = await client.publishPackage(
        deployer,
        new HexString(moduleBytes.toString('hex')).toUint8Array(),
        []
      );
      
      console.log(`Transaction submitted: ${txnHash}`);
      await client.waitForTransaction(txnHash);
      console.log(`Module ${moduleFile} deployed successfully!`);
    } catch (error) {
      console.error(`Error deploying module ${moduleFile}:`, error);
    }
  }
  
  console.log('Deployment complete!');
  console.log(`Module address: ${deployer.address().hex()}`);
  console.log('You can now interact with the AptosAgora platform using this address.');
}

main().catch(error => {
  console.error('Deployment failed:', error);
  process.exit(1);
}); 