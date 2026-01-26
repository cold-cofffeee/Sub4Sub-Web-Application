/**
 * EngagementAction Model
 * MongoDB schema for all types of engagement exchanges (subs, likes, comments, watch-time, etc.)
 * This extends the existing Subscription model concept to support multiple action types
 */

const mongoose = require('mongoose');

const engagementActionSchema = new mongoose.Schema({
  // Who is performing the action
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Who is receiving the action
  targetUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Action details
  actionType: {
    type: String,
    enum: ['subscription', 'like', 'comment', 'watch-time', 'short-view', 'playlist-add'],
    required: true,
    index: true
  },
  
  // Target content
  targetContentUrl: {
    type: String,
    required: true
  },
  targetContentTitle: {
    type: String,
    default: ''
  },
  targetChannelUrl: {
    type: String,
    required: true
  },
  targetChannelName: {
    type: String,
    required: true
  },
  
  // Action-specific data
  actionData: {
    // For watch-time
    watchMinutes: { type: Number, default: 0 },
    watchSessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'WatchSession' },
    
    // For comments
    commentText: { type: String, default: '' },
    
    // For shorts
    shortDuration: { type: Number, default: 0 } // Seconds
  },
  
  // Verification
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'verified', 'rejected', 'disputed'],
    default: 'pending',
    index: true
  },
  verificationProof: {
    type: String,
    default: null // Screenshot URL or other proof
  },
  verifiedAt: {
    type: Date,
    default: null
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // Admin who verified
  },
  rejectionReason: {
    type: String,
    default: ''
  },
  
  // Credits
  creditsSpent: {
    type: Number,
    required: true
  },
  creditsEarned: {
    type: Number,
    default: 0
  },
  creditsPaid: {
    type: Boolean,
    default: false
  },
  
  // Quality & Trust
  qualityScore: {
    type: Number,
    default: 0 // Score of the user performing action at time of action
  },
  isLegitimate: {
    type: Boolean,
    default: true
  },
  
  // Timestamps
  startedAt: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  
  // Dispute handling
  isDisputed: {
    type: Boolean,
    default: false
  },
  disputeReason: {
    type: String,
    default: ''
  },
  disputeResolvedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
engagementActionSchema.index({ userId: 1, actionType: 1, status: 1 });
engagementActionSchema.index({ targetUserId: 1, actionType: 1, status: 1 });
engagementActionSchema.index({ status: 1, createdAt: -1 });
engagementActionSchema.index({ actionType: 1, status: 1 });

// Prevent duplicate actions (same user can't perform same action on same content twice)
engagementActionSchema.index(
  { userId: 1, targetUserId: 1, actionType: 1, targetContentUrl: 1 },
  { unique: true, sparse: true }
);

// Method to mark action as completed
engagementActionSchema.methods.markCompleted = async function() {
  this.status = 'completed';
  this.completedAt = new Date();
  await this.save();
};

// Method to verify action (admin or auto-verify)
engagementActionSchema.methods.verify = async function(verifiedBy = null) {
  this.status = 'verified';
  this.verifiedAt = new Date();
  this.verifiedBy = verifiedBy;
  await this.save();
};

// Method to reject action
engagementActionSchema.methods.reject = async function(reason = '') {
  this.status = 'rejected';
  this.rejectionReason = reason;
  await this.save();
};

// Method to calculate duration (for analytics)
engagementActionSchema.methods.getDuration = function() {
  if (!this.startedAt || !this.completedAt) return 0;
  return Math.floor((this.completedAt - this.startedAt) / 1000); // Seconds
};

module.exports = mongoose.model('EngagementAction', engagementActionSchema);
