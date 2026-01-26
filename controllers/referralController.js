/**
 * Referral Controller
 * Handles referral tracking, rewards, and stats
 */

const User = require('../models/User');
const Referral = require('../models/Referral');
const config = require('../config/config');

/**
 * Process a new referral signup
 */
exports.processReferralSignup = async (referralCode, newUserId, req) => {
  try {
    if (!referralCode) return;
    
    // Find referrer by code
    const referrer = await User.findOne({ referralCode });
    if (!referrer) return;
    
    // Don't allow self-referrals
    if (referrer._id.toString() === newUserId.toString()) return;
    
    // Check if this user was already referred
    const existingReferral = await Referral.findOne({ refereeId: newUserId });
    if (existingReferral) return;
    
    // Create referral record
    const referral = new Referral({
      referrerId: referrer._id,
      refereeId: newUserId,
      referralCode: referralCode,
      refereeIpAddress: req.ip || '',
      refereeUserAgent: req.headers['user-agent'] || ''
    });
    
    await referral.save();
    
    // Update referee's referredBy field
    await User.findByIdAndUpdate(newUserId, {
      referredBy: referrer._id
    });
    
    // Complete referral and award signup bonus
    await referral.complete();
    await this.awardSignupBonus(referral);
    
    console.log(`Referral processed: ${referrer.username} → ${newUserId}`);
    
  } catch (error) {
    console.error('Error processing referral:', error);
  }
};

/**
 * Award signup bonus to referrer
 */
exports.awardSignupBonus = async (referral) => {
  try {
    const referrer = await User.findById(referral.referrerId);
    if (!referrer) return;
    
    const bonus = config.credits.referral.signup || 50;
    
    // Add credits to referrer
    const result = await referrer.addCredits(bonus, 'referral', false);
    
    if (result.success) {
      // Update referral record
      referral.signupReward = bonus;
      referral.signupRewardPaid = true;
      await referral.save();
      
      // Update referrer stats
      referrer.referralCount += 1;
      await referrer.save();
      
      // Create notification
      const Notification = require('../models/Notification');
      await Notification.create({
        userId: referrer._id,
        title: 'Referral Bonus!',
        message: `You earned ${bonus} credits for referring a new user!`,
        type: 'success'
      });
      
      console.log(`Awarded ${bonus} credits to ${referrer.username} for referral`);
    }
    
  } catch (error) {
    console.error('Error awarding signup bonus:', error);
  }
};

/**
 * Award first purchase bonus when referee makes first payment
 */
exports.awardFirstPurchaseBonus = async (userId) => {
  try {
    const referral = await Referral.findOne({
      refereeId: userId,
      firstPurchaseRewardPaid: false
    });
    
    if (!referral) return;
    
    const referrer = await User.findById(referral.referrerId);
    if (!referrer) return;
    
    const bonus = config.credits.referral.firstPurchase || 200;
    
    // Add credits to referrer
    const result = await referrer.addCredits(bonus, 'referral', false);
    
    if (result.success) {
      // Update referral record
      referral.firstPurchaseReward = bonus;
      referral.firstPurchaseRewardPaid = true;
      referral.milestones.refereePurchased = true;
      await referral.save();
      
      // Create notification
      const Notification = require('../models/Notification');
      await Notification.create({
        userId: referrer._id,
        title: 'Referral Purchase Bonus!',
        message: `You earned ${bonus} credits! Your referral made their first purchase.`,
        type: 'success'
      });
      
      console.log(`Awarded ${bonus} credits to ${referrer.username} for referral purchase`);
    }
    
  } catch (error) {
    console.error('Error awarding first purchase bonus:', error);
  }
};

/**
 * Get referral stats for a user
 */
exports.getReferralStats = async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id);
    
    // Generate referral code if not exists
    if (!user.referralCode) {
      await user.generateReferralCode();
    }
    
    // Get referral stats
    const totalReferrals = await Referral.countDocuments({ referrerId: user._id });
    const completedReferrals = await Referral.countDocuments({
      referrerId: user._id,
      status: { $in: ['completed', 'rewarded'] }
    });
    
    const pendingReferrals = await Referral.countDocuments({
      referrerId: user._id,
      status: 'pending'
    });
    
    // Get total credits earned from referrals
    const referrals = await Referral.find({ referrerId: user._id });
    const totalCreditsEarned = referrals.reduce((sum, ref) => {
      return sum + (ref.signupReward || 0) + (ref.firstPurchaseReward || 0);
    }, 0);
    
    // Get recent referrals
    const recentReferrals = await Referral.find({ referrerId: user._id })
      .populate('refereeId', 'username createdAt isPremium')
      .sort({ createdAt: -1 })
      .limit(10);
    
    res.json({
      success: true,
      referralCode: user.referralCode,
      referralUrl: `${config.app.url}/auth/register?ref=${user.referralCode}`,
      stats: {
        total: totalReferrals,
        completed: completedReferrals,
        pending: pendingReferrals,
        totalCreditsEarned
      },
      recentReferrals
    });
    
  } catch (error) {
    console.error('Get referral stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching referral stats'
    });
  }
};

/**
 * Get referral leaderboard
 */
exports.getLeaderboard = async (req, res) => {
  try {
    const topReferrers = await User.find({ referralCount: { $gt: 0 } })
      .select('username referralCount referralCreditsEarned isPremium')
      .sort({ referralCount: -1 })
      .limit(50);
    
    res.json({
      success: true,
      leaderboard: topReferrers
    });
    
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching leaderboard'
    });
  }
};

module.exports = exports;
