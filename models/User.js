/**
 * User Model
 * MongoDB schema for user data
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  password: {
    type: String,
    required: true
  },
  fullName: {
    type: String,
    default: ''
  },
  locationAddress: {
    type: String,
    default: ''
  },
  youtubeChannel: {
    type: String,
    default: ''
  },
  youtubeChannelName: {
    type: String,
    default: ''
  },
  youtubeChannelChanged: {
    type: Boolean,
    default: false
  },
  profilePicture: {
    type: String,
    default: null
  },
  isPremium: {
    type: Boolean,
    default: false,
    index: true
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  isBanned: {
    type: Boolean,
    default: false,
    index: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String,
    default: null
  },
  passwordResetToken: {
    type: String,
    default: null
  },
  passwordResetExpires: {
    type: Date,
    default: null
  },
  lastLogin: {
    type: Date,
    default: null
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockoutUntil: {
    type: Date,
    default: null
  },
  subscriptionUrls: {
    type: [String],
    default: []
  },
  // ===== ENGAGEMENT CREDITS SYSTEM =====
  credits: {
    type: Number,
    default: 100, // Starting credits for new users
    index: true
  },
  dailyCreditsEarned: {
    type: Number,
    default: 0
  },
  dailyCreditsReset: {
    type: Date,
    default: Date.now
  },
  lifetimeCreditsEarned: {
    type: Number,
    default: 0
  },
  lifetimeCreditsSpent: {
    type: Number,
    default: 0
  },
  // ===== CREATOR PROFILE =====
  channelCategory: {
    type: String,
    enum: ['Gaming', 'Education', 'Entertainment', 'Tech', 'Music', 'Vlog', 'Business', 'Fitness', 'Cooking', 'Other'],
    default: 'Other'
  },
  channelLanguage: {
    type: String,
    default: 'English'
  },
  subscriberRange: {
    type: String,
    enum: ['0-100', '100-1K', '1K-10K', '10K-100K', '100K-1M', '1M+'],
    default: '0-100'
  },
  contentType: {
    type: String,
    enum: ['Shorts', 'Long', 'Mixed'],
    default: 'Mixed'
  },
  // ===== QUALITY SCORE SYSTEM (Hidden from users) =====
  qualityScore: {
    type: Number,
    default: 50, // 0-100 scale
    index: true
  },
  qualityMetrics: {
    accountAge: { type: Number, default: 0 }, // Days since registration
    verifiedActionsRatio: { type: Number, default: 0 }, // % of verified actions
    watchCompletionRate: { type: Number, default: 0 }, // % of watch sessions completed
    reportCount: { type: Number, default: 0 },
    manualAdjustment: { type: Number, default: 0 } // Admin override
  },
  // ===== PREMIUM FEATURES =====
  premiumTier: {
    type: String,
    enum: ['free', 'basic', 'pro', 'elite'],
    default: 'free'
  },
  premiumExpiry: {
    type: Date,
    default: null
  },
  premiumAutoRenew: {
    type: Boolean,
    default: false
  },
  // ===== REFERRAL SYSTEM =====
  referralCode: {
    type: String,
    unique: true,
    sparse: true,
    index: true
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  referralCount: {
    type: Number,
    default: 0
  },
  referralCreditsEarned: {
    type: Number,
    default: 0
  },
  // ===== ENGAGEMENT STATS =====
  stats: {
    totalSubscriptionsGiven: { type: Number, default: 0 },
    totalSubscriptionsReceived: { type: Number, default: 0 },
    totalWatchTimeGiven: { type: Number, default: 0 }, // Minutes
    totalWatchTimeReceived: { type: Number, default: 0 },
    totalLikesGiven: { type: Number, default: 0 },
    totalCommentsGiven: { type: Number, default: 0 },
    lastActiveDate: { type: Date, default: Date.now }
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to check if account is locked
userSchema.methods.isLocked = function() {
  return !!(this.lockoutUntil && this.lockoutUntil > Date.now());
};

// Method to increment login attempts
userSchema.methods.incrementLoginAttempts = async function() {
  const maxAttempts = require('../config/config').security.maxLoginAttempts;
  const lockoutTime = require('../config/config').security.lockoutTime;
  
  // Reset attempts if lockout expired
  if (this.lockoutUntil && this.lockoutUntil < Date.now()) {
    this.loginAttempts = 1;
    this.lockoutUntil = null;
  } else {
    this.loginAttempts += 1;
    
    // Lock account if max attempts reached
    if (this.loginAttempts >= maxAttempts) {
      this.lockoutUntil = new Date(Date.now() + lockoutTime);
    }
  }
  
  return this.save();
};

// Method to reset login attempts
userSchema.methods.resetLoginAttempts = async function() {
  if (this.loginAttempts > 0 || this.lockoutUntil) {
    this.loginAttempts = 0;
    this.lockoutUntil = null;
    return this.save();
  }
};

// Virtual for user ID as string
userSchema.virtual('id').get(function() {
  return this._id.toString();
});

// ===== CREDIT MANAGEMENT METHODS =====

// Add credits (with daily limit check for earning)
userSchema.methods.addCredits = async function(amount, reason = 'earned', checkDaily = true) {
  const config = require('../config/config');
  
  if (checkDaily && reason === 'earned') {
    // Reset daily counter if new day
    const today = new Date().setHours(0, 0, 0, 0);
    const resetDay = new Date(this.dailyCreditsReset).setHours(0, 0, 0, 0);
    
    if (today > resetDay) {
      this.dailyCreditsEarned = 0;
      this.dailyCreditsReset = new Date();
    }
    
    // Check daily limit based on premium status
    const dailyLimit = this.isPremium || this.premiumTier !== 'free' 
      ? config.credits.dailyLimitPremium 
      : config.credits.dailyLimitFree;
    
    if (this.dailyCreditsEarned >= dailyLimit) {
      return { success: false, message: 'Daily credit limit reached' };
    }
    
    // Cap the amount to not exceed daily limit
    const availableToday = dailyLimit - this.dailyCreditsEarned;
    amount = Math.min(amount, availableToday);
  }
  
  this.credits += amount;
  
  if (reason === 'earned') {
    this.dailyCreditsEarned += amount;
    this.lifetimeCreditsEarned += amount;
  } else if (reason === 'referral') {
    this.referralCreditsEarned += amount;
    this.lifetimeCreditsEarned += amount;
  } else if (reason === 'purchase' || reason === 'bonus') {
    this.lifetimeCreditsEarned += amount;
  }
  
  await this.save();
  return { success: true, amount, newBalance: this.credits };
};

// Spend credits
userSchema.methods.spendCredits = async function(amount) {
  if (this.credits < amount) {
    return { success: false, message: 'Insufficient credits' };
  }
  
  this.credits -= amount;
  this.lifetimeCreditsSpent += amount;
  await this.save();
  
  return { success: true, newBalance: this.credits };
};

// ===== QUALITY SCORE METHODS =====

// Calculate and update quality score
userSchema.methods.updateQualityScore = async function() {
  const metrics = this.qualityMetrics;
  
  // Account age (0-25 points): 1 point per 4 days, max 100 days
  const accountAgeDays = Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
  metrics.accountAge = accountAgeDays;
  const accountAgeScore = Math.min(25, accountAgeDays / 4);
  
  // Verified actions ratio (0-30 points)
  const verifiedScore = metrics.verifiedActionsRatio * 30;
  
  // Watch completion rate (0-25 points)
  const watchScore = metrics.watchCompletionRate * 25;
  
  // Report penalty (-50 points max, -10 per report)
  const reportPenalty = Math.max(-50, metrics.reportCount * -10);
  
  // Premium bonus (10 points)
  const premiumBonus = (this.isPremium || this.premiumTier !== 'free') ? 10 : 0;
  
  // Calculate final score (0-100)
  let finalScore = accountAgeScore + verifiedScore + watchScore + reportPenalty + premiumBonus + metrics.manualAdjustment;
  finalScore = Math.max(0, Math.min(100, finalScore)); // Clamp between 0-100
  
  this.qualityScore = Math.round(finalScore);
  await this.save();
  
  return this.qualityScore;
};

// Get quality tier (for matching)
userSchema.methods.getQualityTier = function() {
  if (this.qualityScore >= 80) return 'excellent';
  if (this.qualityScore >= 60) return 'good';
  if (this.qualityScore >= 40) return 'average';
  if (this.qualityScore >= 20) return 'below-average';
  return 'poor';
};

// ===== REFERRAL METHODS =====

// Generate unique referral code
userSchema.methods.generateReferralCode = async function() {
  if (this.referralCode) return this.referralCode;
  
  const crypto = require('crypto');
  let code;
  let exists = true;
  
  // Generate unique code
  while (exists) {
    code = this.username.substring(0, 4).toUpperCase() + crypto.randomBytes(3).toString('hex').toUpperCase();
    exists = await mongoose.model('User').findOne({ referralCode: code });
  }
  
  this.referralCode = code;
  await this.save();
  return code;
};

// Virtual for user ID as string
userSchema.virtual('id').get(function() {
  return this._id.toString();
});

// Ensure virtuals are included in JSON
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('User', userSchema);
