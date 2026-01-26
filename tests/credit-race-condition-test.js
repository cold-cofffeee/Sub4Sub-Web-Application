/**
 * Credit Race Condition Test
 * Verifies atomic operations prevent double-spending
 * 
 * Run with: node tests/credit-race-condition-test.js
 */

const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function testRaceCondition() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sub4sub');
    console.log('✓ Connected to MongoDB');
    
    // Create test user with 100 credits
    const testUser = new User({
      email: 'racetest@test.com',
      username: 'racetest' + Date.now(),
      password: 'password123',
      credits: 100
    });
    await testUser.save();
    console.log(`✓ Created test user with ${testUser.credits} credits`);
    
    // TEST 1: Concurrent spending (should prevent overspending)
    console.log('\n--- TEST 1: Concurrent Spending ---');
    const spendPromises = [];
    for (let i = 0; i < 10; i++) {
      // Try to spend 50 credits 10 times simultaneously
      spendPromises.push(testUser.spendCredits(50));
    }
    
    const spendResults = await Promise.all(spendPromises);
    const successfulSpends = spendResults.filter(r => r.success).length;
    const failedSpends = spendResults.filter(r => !r.success).length;
    
    // Reload user to get latest balance
    const userAfterSpend = await User.findById(testUser._id);
    
    console.log(`Successful spends: ${successfulSpends}`);
    console.log(`Failed spends: ${failedSpends}`);
    console.log(`Final balance: ${userAfterSpend.credits}`);
    
    if (successfulSpends === 2 && userAfterSpend.credits === 0) {
      console.log('✓ TEST PASSED: Only 2 spends succeeded (100/50=2), balance is 0');
    } else {
      console.log('✗ TEST FAILED: Expected 2 successful spends and 0 balance');
    }
    
    // TEST 2: Prevent negative credits
    console.log('\n--- TEST 2: Prevent Negative Credits ---');
    const negativeResult = await userAfterSpend.spendCredits(10);
    
    if (!negativeResult.success && negativeResult.message === 'Insufficient credits') {
      console.log('✓ TEST PASSED: Cannot spend when balance is 0');
    } else {
      console.log('✗ TEST FAILED: Should not allow negative balance');
    }
    
    // TEST 3: Concurrent adding (daily limit enforcement)
    console.log('\n--- TEST 3: Concurrent Adding with Daily Limit ---');
    const addPromises = [];
    for (let i = 0; i < 10; i++) {
      // Try to add 10 credits 10 times simultaneously (total 100, but limit is 50 for free)
      addPromises.push(userAfterSpend.addCredits(10, 'earned', true));
    }
    
    const addResults = await Promise.all(addPromises);
    const successfulAdds = addResults.filter(r => r.success).length;
    const totalAdded = addResults.filter(r => r.success).reduce((sum, r) => sum + r.amount, 0);
    
    // Reload user
    const userAfterAdd = await User.findById(testUser._id);
    
    console.log(`Successful adds: ${successfulAdds}`);
    console.log(`Total credits added: ${totalAdded}`);
    console.log(`Final balance: ${userAfterAdd.credits}`);
    console.log(`Daily earned: ${userAfterAdd.dailyCreditsEarned}`);
    
    if (userAfterAdd.dailyCreditsEarned <= 50 && userAfterAdd.credits === totalAdded) {
      console.log('✓ TEST PASSED: Daily limit enforced, no overage');
    } else {
      console.log('✗ TEST FAILED: Daily limit not properly enforced');
    }
    
    // TEST 4: Invalid amounts
    console.log('\n--- TEST 4: Invalid Amounts ---');
    const negativeAddResult = await userAfterAdd.addCredits(-10, 'earned', false);
    const zeroSpendResult = await userAfterAdd.spendCredits(0);
    
    if (!negativeAddResult.success && !zeroSpendResult.success) {
      console.log('✓ TEST PASSED: Negative and zero amounts rejected');
    } else {
      console.log('✗ TEST FAILED: Should reject invalid amounts');
    }
    
    // Cleanup
    await User.findByIdAndDelete(testUser._id);
    console.log('\n✓ Test user deleted');
    
    console.log('\n=== ALL TESTS COMPLETED ===');
    
  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('✓ Database connection closed');
  }
}

// Run tests
testRaceCondition();
