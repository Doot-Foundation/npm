#!/usr/bin/env node

/**
 * Test script for Doot Oracle NPM package fallback logic
 *
 * This script tests:
 * 1. API endpoint with valid API key
 * 2. API endpoint with invalid API key (should fail to L2)
 * 3. L2 direct call
 * 4. L1 direct call
 * 5. Full fallback chain (API -> L2 -> L1)
 */

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

import { Client } from '../dist/index.js';

// Test configuration
const VALID_API_KEY = process.env.DOOT_API_KEY;
const INVALID_API_KEY = 'invalid-key-12345';
const TEST_TOKEN = 'bitcoin'; // Use Bitcoin for testing

// Validate required environment variables
console.log('🔍 Environment Check:');
console.log(`   DOOT_API_KEY loaded: ${VALID_API_KEY ? 'YES' : 'NO'}`);
console.log(`   API Key value: ${VALID_API_KEY || 'undefined'}`);
console.log(`   API Key length: ${VALID_API_KEY ? VALID_API_KEY.length : 0} characters`);

if (!VALID_API_KEY) {
  console.error('❌ Error: DOOT_API_KEY environment variable is required');
  console.error('Please create a .env file with: DOOT_API_KEY=your-api-key-here');
  process.exit(1);
}

console.log('\n🚀 Testing Doot Oracle NPM Package Fallback Logic\n');
console.log('='.repeat(60));

async function testWithDelay(testName, testFn, delay = 1000) {
  console.log(`\n📊 ${testName}`);
  console.log('-'.repeat(40));

  try {
    const startTime = Date.now();
    const result = await testFn();
    const endTime = Date.now();

    console.log(`✅ Success! (${endTime - startTime}ms)`);
    console.log(`   Token: ${result.price_data.token}`);
    console.log(`   Price: $${parseFloat(result.price_data.price).toFixed(2)}`);
    console.log(`   Source: ${result.source}`);
    console.log(`   Oracle: ${result.price_data.oracle}`);

    // Add delay between tests to avoid overwhelming the services
    if (delay > 0) {
      console.log(`⏳ Waiting ${delay}ms before next test...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    return result;
  } catch (error) {
    console.log(`❌ Failed: ${error.message}`);

    // Add delay even for failed tests
    if (delay > 0) {
      console.log(`⏳ Waiting ${delay}ms before next test...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    return null;
  }
}

async function runTests() {
  console.log(`Test Token: ${TEST_TOKEN}`);
  console.log(`Contract Address: B62qqDChniw14RWMJ8Dd8K36w3DJxYp1ngGyqVvR9gqSR7C1AbG97Mo`);

  // Test 1: Valid API key (should use API) - using new method
  await testWithDelay(
    'Test 1: API with valid key (new getFromAPI method)',
    async () => {
      const client = new Client(VALID_API_KEY);
      return await client.getFromAPI(TEST_TOKEN);
    }
  );

  // Test 2: Invalid API key (should fail)
  await testWithDelay(
    'Test 2: API with invalid key (should fail)',
    async () => {
      const client = new Client(INVALID_API_KEY);
      return await client.getFromAPI(TEST_TOKEN);
    }
  );

  // Test 3: Direct L2 call
  await testWithDelay(
    'Test 3: Direct Zeko L2 call (getFromL2 method)',
    async () => {
      const client = new Client(INVALID_API_KEY); // API key doesn't matter for direct L2
      return await client.getFromL2(TEST_TOKEN);
    },
    2000 // Longer delay for blockchain calls
  );

  // Test 4: Direct L1 call
  await testWithDelay(
    'Test 4: Direct Mina L1 call (getFromL1 method)',
    async () => {
      const client = new Client(INVALID_API_KEY); // API key doesn't matter for direct L1
      return await client.getFromL1(TEST_TOKEN);
    },
    3000 // Longer delay for L1 calls
  );

  // Test 5: Full fallback chain with invalid API key
  await testWithDelay(
    'Test 5: Full fallback (API -> L2 -> L1) with invalid key',
    async () => {
      const client = new Client(INVALID_API_KEY);
      return await client.getData(TEST_TOKEN); // This should fallback through all layers
    },
    5000 // Longest delay for full fallback test
  );

  // Test 6: Full fallback chain with valid API key (should use API)
  await testWithDelay(
    'Test 6: Full fallback with valid key (should use API)',
    async () => {
      const client = new Client(VALID_API_KEY);
      return await client.getData(TEST_TOKEN);
    }
  );


  console.log('\n' + '='.repeat(60));
  console.log('🎉 All tests completed!');
  console.log('\nNOTE: Some tests may fail if:');
  console.log('- API key is not valid');
  console.log('- Blockchain nodes are unreachable');
  console.log('- Contract is not deployed or settled');
  console.log('- Network connectivity issues');
  console.log('\nFor production use, ensure you have a valid API key from:');
  console.log('https://doot.foundation/dashboard');
}

// Run the tests
runTests().catch(console.error);