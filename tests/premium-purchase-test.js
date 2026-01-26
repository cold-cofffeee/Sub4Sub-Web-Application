/**
 * Premium Purchase Flow Test
 * Verifies premium upgrade with idempotency
 * 
 * Run with: node tests/premium-purchase-test.js
 */

const mongoose = require('mongoose');
const User = require('../models/User');
const Payment = require('../models/Payment');
const { processPremiumUpgrade } = require('../utils/premiumHelper');
require('dotenv').config();

async function testPremiumPurchase() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sub4sub');
    console.log('✓ Connected to MongoDB');
    
    // Create test user
    const testUser = new User({
      email: 'premiumtest@test.com',
      username: 'premiumtest' + Date.now(),
      password: 'password123',
      credits: 100,
      premiumTier: 'free'
    });
    await testUser.save();
    console.log(`✓ Created test user: ${testUser.username}`);
    
    // TEST 1: Basic Premium Upgrade
    console.log('\n--- TEST 1: Basic Premium Upgrade ---');
    const payment1 = await Payment.create({
      userId: testUser._id,
      amount: 9.99,
      currency: 'USD',
      paymentMethod: 'demo',
      transactionId: 'TEST-BASIC-001',
      status: 'completed',
      premiumTier: 'basic',
      premiumDuration: 30
    });
    
    const result1 = await processPremiumUpgrade(payment1);
    const user1 = await User.findById(testUser._id);
    
    console.log(`Upgrade result: ${result1.success ? 'SUCCESS' : 'FAILED'}`);
    console.log(`User tier: ${user1.premiumTier}`);
    console.log(`Expiry: ${user1.premiumExpiry}`);
    console.log(`Days until expiry: ${Math.ceil((user1.premiumExpiry - Date.now()) / (1000 * 60 * 60 * 24))}`);
    
    if (result1.success && user1.premiumTier === 'basic' && user1.premiumExpiry) {
      console.log('✓ TEST PASSED: Basic upgrade successful');
    } else {
      console.log('✗ TEST FAILED: Upgrade did not work');
    }
    
    // TEST 2: Idempotency - Process same payment twice
    console.log('\n--- TEST 2: Idempotency Test ---');
    const result2 = await processPremiumUpgrade(payment1);
    const user2 = await User.findById(testUser._id);
    
    console.log(`Second process result: ${result2.success ? 'SUCCESS' : 'FAILED'}`);
    console.log(`Message: ${result2.message}`);
    console.log(`User tier unchanged: ${user2.premiumTier === user1.premiumTier}`);
    console.log(`Expiry unchanged: ${user2.premiumExpiry.getTime() === user1.premiumExpiry.getTime()}`);
    
    if (!result2.success && result2.message === 'Payment already processed' && user2.premiumExpiry.getTime() === user1.premiumExpiry.getTime()) {
      console.log('✓ TEST PASSED: Idempotency works, no double upgrade');
    } else {
      console.log('✗ TEST FAILED: Payment processed twice');
    }
    
    // TEST 3: Upgrade Stacking (extend existing subscription)
    console.log('\n--- TEST 3: Subscription Extension ---');
    const payment3 = await Payment.create({
      userId: testUser._id,
      amount: 19.99,
      currency: 'USD',
      paymentMethod: 'demo',
      transactionId: 'TEST-PRO-001',
      status: 'completed',
      premiumTier: 'pro',
      premiumDuration: 30
    });
    
    const oldExpiry = user2.premiumExpiry;
    const result3 = await processPremiumUpgrade(payment3);
    const user3 = await User.findById(testUser._id);
    
    console.log(`Upgrade to PRO result: ${result3.success ? 'SUCCESS' : 'FAILED'}`);
    console.log(`Old tier: basic → New tier: ${user3.premiumTier}`);
    console.log(`Old expiry: ${oldExpiry.toLocaleDateString()}`);
    console.log(`New expiry: ${user3.premiumExpiry.toLocaleDateString()}`);
    
    const daysAdded = Math.ceil((user3.premiumExpiry - oldExpiry) / (1000 * 60 * 60 * 24));
    console.log(`Days added: ${daysAdded}`);
    
    if (result3.success && user3.premiumTier === 'pro' && daysAdded >= 29 && daysAdded <= 31) {
      console.log('✓ TEST PASSED: Subscription extended correctly');
    } else {
      console.log('✗ TEST FAILED: Extension calculation wrong');
    }
    
    // TEST 4: Failed payment should not upgrade
    console.log('\n--- TEST 4: Failed Payment Rejection ---');
    const payment4 = await Payment.create({
      userId: testUser._id,
      amount: 49.99,
      currency: 'USD',
      paymentMethod: 'demo',
      transactionId: 'TEST-FAILED-001',
      status: 'failed', // Failed status
      premiumTier: 'elite',
      premiumDuration: 30
    });
    
    const beforeTier = user3.premiumTier;
    const result4 = await processPremiumUpgrade(payment4);
    const user4 = await User.findById(testUser._id);
    
    console.log(`Failed payment process result: ${result4.success ? 'SUCCESS' : 'FAILED'}`);
    console.log(`Message: ${result4.message}`);
    console.log(`Tier unchanged: ${user4.premiumTier === beforeTier}`);
    
    if (!result4.success && user4.premiumTier === beforeTier) {
      console.log('✓ TEST PASSED: Failed payment rejected');
    } else {
      console.log('✗ TEST FAILED: Failed payment should not upgrade user');
    }
    
    // TEST 5: Check processed flag
    console.log('\n--- TEST 5: Processed Flag Check ---');
    const processedPayments = await Payment.find({ 
      userId: testUser._id, 
      processed: true 
    });
    
    console.log(`Total payments: ${await Payment.countDocuments({ userId: testUser._id })}`);
    console.log(`Processed payments: ${processedPayments.length}`);
    console.log(`Payment IDs processed: ${processedPayments.map(p => p.transactionId).join(', ')}`);
    
    if (processedPayments.length === 2) { // payment1 and payment3 should be processed
      console.log('✓ TEST PASSED: Correct payments marked as processed');
    } else {
      console.log('✗ TEST FAILED: Wrong number of processed payments');
    }
    
    // Cleanup
    await User.findByIdAndDelete(testUser._id);
    await Payment.deleteMany({ userId: testUser._id });
    console.log('\n✓ Test data cleaned up');
    
    console.log('\n=== ALL TESTS COMPLETED ===');
    
  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('✓ Database connection closed');
  }
}

// Run tests
testPremiumPurchase();
