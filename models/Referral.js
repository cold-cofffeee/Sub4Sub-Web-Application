/**
 * Referral Model
 * MongoDB schema for tracking referral relationships and rewards
 */

const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema({
  // Referrer (person who shared the link)
  referrerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Referee (person who signed up using the link)
  refereeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Referral code used
  referralCode: {
    type: String,
    required: true,
    index: true
  },
  
  // Status tracking
  status: {
    type: String,
    enum: ['pending', 'completed', 'rewarded'],
    default: 'pending',
    index: true
  },
  
  // Rewards
  signupReward: {
    type: Number,
    default: 0
  },
  signupRewardPaid: {
    type: Boolean,
    default: false
  },
  
  firstPurchaseReward: {
    type: Number,
    default: 0
  },
  firstPurchaseRewardPaid: {
    type: Boolean,
    default: false
  },
  
  // Milestones (for tiered rewards)
  milestones: {
    refereeVerified: { type: Boolean, default: false },
    refereeFirstAction: { type: Boolean, default: false },
    refereePurchased: { type: Boolean, default: false },
    refereeActive30Days: { type: Boolean, default: false }
  },
  
  // Metadata
  refereeIpAddress: {
    type: String,
    default: ''
  },
  refereeUserAgent: {
    type: String,
    default: ''
  },
  
  // Date tracking
  completedAt: {
    type: Date,
    default: null
  },
  rewardedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Indexes
referralSchema.index({ referrerId: 1, status: 1 });
referralSchema.index({ refereeId: 1 });
referralSchema.index({ referralCode: 1, createdAt: -1 });

// Prevent duplicate referrals
referralSchema.index({ referrerId: 1, refereeId: 1 }, { unique: true });

// Method to mark milestone as achieved
referralSchema.methods.achieveMilestone = async function(milestone) {
  if (this.milestones[milestone] !== undefined) {
    this.milestones[milestone] = true;
    await this.save();
  }
};

// Method to complete referral (referee signed up successfully)
referralSchema.methods.complete = async function() {
  this.status = 'completed';
  this.completedAt = new Date();
  await this.save();
};

// Method to mark as rewarded
referralSchema.methods.markRewarded = async function() {
  this.status = 'rewarded';
  this.rewardedAt = new Date();
  await this.save();
};

module.exports = mongoose.model('Referral', referralSchema);
