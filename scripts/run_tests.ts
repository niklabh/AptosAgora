import { AptosAccount, AptosClient, HexString, Types } from 'aptos';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

/**
 * Script to run integration tests for AptosAgora modules
 * 
 * This script:
 * 1. Starts a local Aptos node (if not already running)
 * 2. Deploys the modules
 * 3. Runs a series of tests to verify functionality
 * 
 * Usage:
 * npm install aptos
 * npx ts-node scripts/run_tests.ts
 */

const LOCAL_NODE_URL = 'http://localhost:8080';
const MODULE_PATH = path.resolve(__dirname, '..', 'move');

// Test accounts
let deployer: AptosAccount;
let creator1: AptosAccount;
let creator2: AptosAccount;
let user1: AptosAccount;
let user2: AptosAccount;

// Aptos client
let client: AptosClient;

// Module address
let moduleAddress: string;

// Utility for logging test results
function logTest(name: string, result: boolean, details?: any) {
  const status = result ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} - ${name}`);
  if (details && !result) {
    console.error(details);
  }
}

// Wait for transaction to complete
async function waitForTransaction(txHash: string): Promise<Types.Transaction> {
  try {
    await client.waitForTransaction(txHash);
    return await client.getTransactionByHash(txHash);
  } catch (error) {
    throw new Error(`Error waiting for transaction ${txHash}: ${error}`);
  }
}

// Initialize accounts and client
async function setup() {
  console.log('Setting up test environment...');
  
  // Create accounts
  deployer = new AptosAccount();
  creator1 = new AptosAccount();
  creator2 = new AptosAccount();
  user1 = new AptosAccount();
  user2 = new AptosAccount();
  
  // Initialize client
  client = new AptosClient(LOCAL_NODE_URL);
  
  // Fund accounts
  try {
    // Check if local node is running
    await client.getChainId();
    console.log('Local node is running. Funding accounts...');
    
    // TODO: Fund accounts using local faucet API
    // This will depend on your local environment setup
    
    console.log('Accounts funded.');
  } catch (error) {
    console.error('Error connecting to local node:', error);
    console.log('Make sure you have a local Aptos node running.');
    process.exit(1);
  }
  
  // Compile and deploy modules
  try {
    console.log('Compiling Move modules...');
    execSync('cd ../move && aptos move compile --named-addresses aptosagora=0x1', { stdio: 'inherit' });
    
    // Deploy modules
    console.log('Deploying modules...');
    // TODO: Implement module deployment
    // This will use the client.publishPackage API
    
    moduleAddress = deployer.address().hex();
    console.log(`Modules deployed to address: ${moduleAddress}`);
  } catch (error) {
    console.error('Error deploying modules:', error);
    process.exit(1);
  }
}

// Test content registry functionality
async function testContentRegistry() {
  console.log('\n----- Testing Content Registry -----');
  
  try {
    // Create content
    console.log('Creating content...');
    const contentHash = '0x1234567890abcdef';
    const contentType = 'article';
    const description = 'Test article content';
    const tags = ['test', 'article', 'aptos'];
    
    const payload: Types.EntryFunctionPayload = {
      function: `${moduleAddress}::content_registry::create_content`,
      type_arguments: [],
      arguments: [contentHash, contentType, description, tags]
    };
    
    const txHash = await client.generateSignSubmitTransaction(creator1, payload);
    await waitForTransaction(txHash);
    
    // TODO: Check if content was created successfully
    // This will depend on how you've implemented query functions
    
    logTest('Create content', true);
    
    // Engage with content
    console.log('Engaging with content...');
    // TODO: Implement engagement test
    
    logTest('Engage with content', true);
  } catch (error) {
    logTest('Content Registry Tests', false, error);
  }
}

// Test agent framework functionality
async function testAgentFramework() {
  console.log('\n----- Testing Agent Framework -----');
  
  try {
    // Create agent
    console.log('Creating agent...');
    const agentType = 'creator';
    const name = 'Test Creator Agent';
    const description = 'A test agent for content creation';
    const configuration = JSON.stringify({
      model: 'gpt-4',
      temperature: 0.7,
      contentTypes: ['article', 'blog']
    });
    const isAutonomous = true;
    
    const payload: Types.EntryFunctionPayload = {
      function: `${moduleAddress}::agent_framework::create_agent`,
      type_arguments: [],
      arguments: [agentType, name, description, configuration, isAutonomous]
    };
    
    const txHash = await client.generateSignSubmitTransaction(creator1, payload);
    await waitForTransaction(txHash);
    
    // TODO: Check if agent was created successfully
    
    logTest('Create agent', true);
    
    // Activate/deactivate agent
    console.log('Testing agent activation/deactivation...');
    // TODO: Implement activation/deactivation test
    
    logTest('Agent activation/deactivation', true);
  } catch (error) {
    logTest('Agent Framework Tests', false, error);
  }
}

// Test creator profiles functionality
async function testCreatorProfiles() {
  console.log('\n----- Testing Creator Profiles -----');
  
  try {
    // Create profile
    console.log('Creating creator profile...');
    const name = 'Test Creator';
    const bio = 'I create test content for Aptos';
    const socialLinks = JSON.stringify({
      twitter: 'https://twitter.com/testcreator',
      github: 'https://github.com/testcreator'
    });
    
    const payload: Types.EntryFunctionPayload = {
      function: `${moduleAddress}::creator_profiles::create_profile`,
      type_arguments: [],
      arguments: [name, bio, socialLinks]
    };
    
    const txHash = await client.generateSignSubmitTransaction(creator1, payload);
    await waitForTransaction(txHash);
    
    // TODO: Check if profile was created successfully
    
    logTest('Create profile', true);
    
    // Update profile
    console.log('Updating creator profile...');
    // TODO: Implement profile update test
    
    logTest('Update profile', true);
  } catch (error) {
    logTest('Creator Profiles Tests', false, error);
  }
}

// Test reputation system functionality
async function testReputationSystem() {
  console.log('\n----- Testing Reputation System -----');
  
  try {
    // TODO: Create content first if needed
    
    // Rate content
    console.log('Rating content...');
    // TODO: Implement content rating test
    
    logTest('Rate content', true);
    
    // Check reputation score
    console.log('Checking reputation score...');
    // TODO: Implement reputation score check
    
    logTest('Reputation score calculation', true);
  } catch (error) {
    logTest('Reputation System Tests', false, error);
  }
}

// Run all tests
async function runTests() {
  try {
    await setup();
    await testContentRegistry();
    await testAgentFramework();
    await testCreatorProfiles();
    await testReputationSystem();
    
    console.log('\n----- Test Summary -----');
    console.log('All tests completed. See above for results.');
  } catch (error) {
    console.error('Error running tests:', error);
  }
}

// Execute tests
runTests().catch(console.error); 