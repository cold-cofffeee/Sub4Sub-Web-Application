/**
 * Migration Script for SUB4SUB v2.0 Evolution
 * Updates existing users with new engagement credit system, quality scores, and referral codes
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const config = require('../config/config');

async function migrate() {
  try {
    console.log('🚀 Starting SUB4SUB v2.0 migration...\n');
    
    // Connect to MongoDB
    await mongoose.connect(config.mongodb.uri);
    console.log('✓ Connected to MongoDB\n');
    
    // Get all users
    const users = await User.find({});
    console.log(`Found ${users.length} users to migrate\n`);
    
    let updated = 0;
    let skipped = 0;
    
    for (const user of users) {
      let needsUpdate = false;
      
      // Initialize credits if not set
      if (user.credits === undefined || user.credits === null) {
        user.credits = config.credits.signupBonus || 100;
        needsUpdate = true;
      }
      
      // Initialize credit tracking fields
      if (user.dailyCreditsEarned === undefined) {
        user.dailyCreditsEarned = 0;
        user.dailyCreditsReset = new Date();
        user.lifetimeCreditsEarned = 0;
        user.lifetimeCreditsSpent = 0;
        needsUpdate = true;
      }
      
      // Initialize creator profile fields
      if (!user.channelCategory) {
        user.channelCategory = 'Other';
        user.channelLanguage = 'English';
        user.subscriberRange = '0-100';
        user.contentType = 'Mixed';
        needsUpdate = true;
      }
      
      // Initialize quality score
      if (user.qualityScore === undefined) {
        user.qualityScore = 50; // Default middle score
        user.qualityMetrics = {
          accountAge: Math.floor((Date.now() - user.createdAt) / (1000 * 60 * 60 * 24)),
          verifiedActionsRatio: 0,
          watchCompletionRate: 0,
          reportCount: 0,
          manualAdjustment: 0
        };
        needsUpdate = true;
      }
      
      // Initialize premium tier
      if (!user.premiumTier) {
        user.premiumTier = user.isPremium ? 'basic' : 'free';
        needsUpdate = true;
      }
      
      // Generate referral code if not exists
      if (!user.referralCode) {
        await user.generateReferralCode();
        needsUpdate = true;
      }
      
      // Initialize referral fields
      if (user.referralCount === undefined) {
        user.referralCount = 0;
        user.referralCreditsEarned = 0;
        needsUpdate = true;
      }
      
      // Initialize stats
      if (!user.stats) {
        user.stats = {
          totalSubscriptionsGiven: 0,
          totalSubscriptionsReceived: 0,
          totalWatchTimeGiven: 0,
          totalWatchTimeReceived: 0,
          totalLikesGiven: 0,
          totalCommentsGiven: 0,
          lastActiveDate: new Date()
        };
        needsUpdate = true;
      }
      
      // Save if needed
      if (needsUpdate) {
        await user.save();
        updated++;
        console.log(`✓ Updated user: ${user.username}`);
      } else {
        skipped++;
      }
    }
    
    console.log(`\n📊 Migration Summary:`);
    console.log(`   Updated: ${updated} users`);
    console.log(`   Skipped: ${skipped} users (already up-to-date)`);
    console.log(`   Total: ${users.length} users\n`);
    
    // Update quality scores for all users
    console.log('🔍 Updating quality scores...');
    const qualityUpdater = require('../utils/qualityScoreUpdater');
    await qualityUpdater.updateAllQualityScores();
    
    console.log('\n✅ Migration completed successfully!');
    console.log('\nNew Features Activated:');
    console.log('  • Engagement Credit System');
    console.log('  • Watch-Time Exchange Rooms');
    console.log('  • Creator Quality Score');
    console.log('  • Referral Program');
    console.log('  • Multi-Action Support');
    console.log('  • Enhanced Premium Tiers\n');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrate();
