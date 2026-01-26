/**
 * Subscription Model
 * MongoDB schema for subscription exchanges
 */

const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  targetUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  targetChannelUrl: {
    type: String,
    required: true
  },
  targetChannelName: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending',
    index: true
  },
  verificationScreenshot: {
    type: String,
    default: null
  },
  pointsEarned: {
    type: Number,
    default: 0
  },
  verifiedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for efficient queries
subscriptionSchema.index({ userId: 1, targetUserId: 1 });
subscriptionSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Subscription', subscriptionSchema);
