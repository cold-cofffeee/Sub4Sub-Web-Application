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

// Ensure virtuals are included in JSON
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('User', userSchema);
