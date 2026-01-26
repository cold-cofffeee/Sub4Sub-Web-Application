/**
 * Payment Model
 * MongoDB schema for payment transactions
 */

const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD',
    uppercase: true
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['stripe', 'paypal', 'demo']
  },
  transactionId: {
    type: String,
    unique: true,
    sparse: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending',
    index: true
  },
  description: {
    type: String,
    default: ''
  },
  // Premium subscription details
  premiumTier: {
    type: String,
    enum: ['free', 'basic', 'pro', 'elite'],
    default: null
  },
  premiumDuration: {
    type: Number, // Duration in days
    default: null
  },
  // Idempotency
  processed: {
    type: Boolean,
    default: false,
    index: true
  },
  processedAt: {
    type: Date,
    default: null
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Index for efficient queries
paymentSchema.index({ userId: 1, status: 1, createdAt: -1 });
paymentSchema.index({ transactionId: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
