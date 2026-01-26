/**
 * WatchSession Model
 * MongoDB schema for individual user watch sessions in rooms
 */

const mongoose = require('mongoose');

const watchSessionSchema = new mongoose.Schema({
  // Relationships
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WatchRoom',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Watch tracking
  startedAt: {
    type: Date,
    default: Date.now
  },
  lastHeartbeat: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date,
    default: null
  },
  
  // Progress tracking
  minutesWatched: {
    type: Number,
    default: 0
  },
  requiredMinutes: {
    type: Number,
    required: true
  },
  progressPercentage: {
    type: Number,
    default: 0
  },
  
  // Verification checkpoints (timestamps when user confirmed they're watching)
  verificationCheckpoints: [{
    timestamp: Date,
    minutesMark: Number,
    verified: Boolean
  }],
  
  // Session status
  status: {
    type: String,
    enum: ['active', 'completed', 'abandoned', 'timeout', 'flagged'],
    default: 'active',
    index: true
  },
  
  // Credits
  creditsEarned: {
    type: Number,
    default: 0
  },
  creditsPaid: {
    type: Boolean,
    default: false
  },
  
  // Anti-abuse detection
  tabSwitchCount: {
    type: Number,
    default: 0
  },
  pauseCount: {
    type: Number,
    default: 0
  },
  isLegitimate: {
    type: Boolean,
    default: true
  },
  
  // User feedback
  rated: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  
  // Device info (for abuse detection)
  deviceInfo: {
    userAgent: String,
    ipAddress: String
  }
}, {
  timestamps: true
});

// Compound indexes
watchSessionSchema.index({ userId: 1, roomId: 1 }, { unique: true }); // One session per user per room
watchSessionSchema.index({ status: 1, lastHeartbeat: 1 });
watchSessionSchema.index({ creditsPaid: 1, status: 1 });

// Update progress
watchSessionSchema.methods.updateProgress = function(minutes) {
  this.minutesWatched = Math.min(minutes, this.requiredMinutes);
  this.progressPercentage = Math.round((this.minutesWatched / this.requiredMinutes) * 100);
  this.lastHeartbeat = new Date();
  
  // Check if completed
  if (this.minutesWatched >= this.requiredMinutes && this.status === 'active') {
    this.status = 'completed';
    this.completedAt = new Date();
  }
};

// Add verification checkpoint
watchSessionSchema.methods.addCheckpoint = function(minutesMark) {
  this.verificationCheckpoints.push({
    timestamp: new Date(),
    minutesMark: minutesMark,
    verified: true
  });
  this.lastHeartbeat = new Date();
};

// Check if session is stale (no heartbeat for 2 minutes)
watchSessionSchema.methods.isStale = function() {
  const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
  return this.lastHeartbeat < twoMinutesAgo;
};

// Calculate credits to award
watchSessionSchema.methods.calculateCredits = function(creditsPerMinute, premiumMultiplier = 1) {
  const baseCredits = Math.floor(this.minutesWatched * creditsPerMinute);
  return Math.floor(baseCredits * premiumMultiplier);
};

// Mark as abandoned if user leaves early
watchSessionSchema.methods.abandon = async function() {
  if (this.status === 'active') {
    this.status = 'abandoned';
    await this.save();
  }
};

module.exports = mongoose.model('WatchSession', watchSessionSchema);
