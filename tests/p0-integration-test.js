/**
 * P0 Fixes Integration Test
 * Tests all critical fixes together
 * 
 * Run with: node tests/p0-integration-test.js
 */

const mongoose = require('mongoose');
const User = require('../models/User');
const Payment = require('../models/Payment');
const WatchRoom = require('../models/WatchRoom');
const { processPremiumUpgrade } = require('../utils/premiumHelper');
const { checkExpiredPremium } = require('../utils/premiumExpiryScheduler');
const { validateYouTubeUrl } = require('../utils/youtubeValidator');
require('dotenv').config();

async function runIntegrationTests() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sub4sub');
    console.log('✓ Connected to MongoDB\n');
    
    console.log('=== P0 FIXES INTEGRATION TEST ===\n');
    
    // Create test user
    const testUser = new User({
      email: 'p0test@test.com',
      username: 'p0test' + Date.now(),
      password: 'password123',
      credits: 1000,
      premiumTier: 'free'
    });
    await testUser.save();
    console.log(`✓ Created test user: ${testUser.username}\n`);
    
    // TEST 1: Credit Race Condition Fix
    console.log('--- TEST 1: Credit Race Condition ---');
    const concurrentSpends = Array(5).fill().map(() => testUser.spendCredits(300));
    const spendResults = await Promise.all(concurrentSpends);
    const successfulSpends = spendResults.filter(r => r.success).length;
    
    const userAfterSpend = await User.findById(testUser._id);
    console.log(`Attempted: 5 spends of 300 credits`);
    console.log(`Successful: ${successfulSpends}`);
    console.log(`Final balance: ${userAfterSpend.credits}`);
    
    if (successfulSpends === 3 && userAfterSpend.credits === 100) {
      console.log('✓ PASSED: Race condition prevented\n');
    } else {
      console.log('✗ FAILED: Race condition not properly handled\n');
    }
    
    // TEST 2: Premium Purchase Flow
    console.log('--- TEST 2: Premium Purchase Flow ---');
    const payment = await Payment.create({
      userId: testUser._id,
      amount: 19.99,
      currency: 'USD',
      paymentMethod: 'demo',
      transactionId: 'P0-TEST-001',
      status: 'completed',
      premiumTier: 'pro',
      premiumDuration: 30
    });
    
    const upgradeResult = await processPremiumUpgrade(payment);
    const userAfterUpgrade = await User.findById(testUser._id);
    
    console.log(`Upgrade success: ${upgradeResult.success}`);
    console.log(`User tier: ${userAfterUpgrade.premiumTier}`);
    console.log(`Has expiry: ${!!userAfterUpgrade.premiumExpiry}`);
    
    if (upgradeResult.success && userAfterUpgrade.premiumTier === 'pro' && userAfterUpgrade.premiumExpiry) {
      console.log('✓ PASSED: Premium upgrade works\n');
    } else {
      console.log('✗ FAILED: Premium upgrade broken\n');
    }
    
    // TEST 3: Idempotency
    console.log('--- TEST 3: Payment Idempotency ---');
    const duplicateResult = await processPremiumUpgrade(payment);
    const userAfterDuplicate = await User.findById(testUser._id);
    
    console.log(`Duplicate process success: ${duplicateResult.success}`);
    console.log(`Message: ${duplicateResult.message}`);
    console.log(`Tier unchanged: ${userAfterDuplicate.premiumTier === 'pro'}`);
    
    if (!duplicateResult.success && duplicateResult.message === 'Payment already processed') {
      console.log('✓ PASSED: Idempotency works\n');
    } else {
      console.log('✗ FAILED: Duplicate processing allowed\n');
    }
    
    // TEST 4: Premium Expiry Enforcement
    console.log('--- TEST 4: Premium Expiry Enforcement ---');
    // Set expiry to past
    await User.findByIdAndUpdate(testUser._id, {
      premiumExpiry: new Date(Date.now() - 1000 * 60 * 60 * 24) // Yesterday
    });
    
    const expiryResult = await checkExpiredPremium();
    const userAfterExpiry = await User.findById(testUser._id);
    
    console.log(`Expired users found: ${expiryResult.checked}`);
    console.log(`Downgraded: ${expiryResult.downgraded}`);
    console.log(`User tier: ${userAfterExpiry.premiumTier}`);
    console.log(`User isPremium: ${userAfterExpiry.isPremium}`);
    
    if (userAfterExpiry.premiumTier === 'free' && !userAfterExpiry.isPremium) {
      console.log('✓ PASSED: Expiry enforcement works\n');
    } else {
      console.log('✗ FAILED: Expired user not downgraded\n');
    }
    
    // TEST 5: YouTube URL Validation
    console.log('--- TEST 5: YouTube URL Validation ---');
    const validUrl = validateYouTubeUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'video');
    const invalidUrl = validateYouTubeUrl('https://vimeo.com/123', 'video');
    const malformedUrl = validateYouTubeUrl('https://www.youtube.com/watch?v=abc', 'video');
    
    console.log(`Valid YouTube URL: ${validUrl.valid}`);
    console.log(`Invalid domain: ${!invalidUrl.valid}`);
    console.log(`Malformed video ID: ${!malformedUrl.valid}`);
    
    if (validUrl.valid && !invalidUrl.valid && !malformedUrl.valid) {
      console.log('✓ PASSED: YouTube validation works\n');
    } else {
      console.log('✗ FAILED: YouTube validation broken\n');
    }
    
    // TEST 6: URL Normalization
    console.log('--- TEST 6: URL Normalization ---');
    const shortUrl = validateYouTubeUrl('https://youtu.be/dQw4w9WgXcQ', 'video');
    const embedUrl = validateYouTubeUrl('https://www.youtube.com/embed/dQw4w9WgXcQ', 'video');
    
    console.log(`Short URL normalized: ${shortUrl.normalizedUrl}`);
    console.log(`Embed URL normalized: ${embedUrl.normalizedUrl}`);
    console.log(`Both have video ID: ${shortUrl.videoId === 'dQw4w9WgXcQ' && embedUrl.videoId === 'dQw4w9WgXcQ'}`);
    
    if (shortUrl.videoId === embedUrl.videoId && shortUrl.normalizedUrl && embedUrl.normalizedUrl) {
      console.log('✓ PASSED: URL normalization works\n');
    } else {
      console.log('✗ FAILED: URL normalization broken\n');
    }
    
    // Cleanup
    await User.findByIdAndDelete(testUser._id);
    await Payment.deleteMany({ userId: testUser._id });
    console.log('✓ Cleanup complete\n');
    
    console.log('=== ALL P0 INTEGRATION TESTS COMPLETED ===');
    
  } catch (error) {
    console.error('Integration test error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('✓ Database connection closed');
  }
}

runIntegrationTests();
