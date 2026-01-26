/**
 * WatchRoom Model
 * MongoDB schema for watch-time exchange rooms
 */

const mongoose = require('mongoose');

const watchRoomSchema = new mongoose.Schema({
  // Room creator
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Video/Playlist details
  contentUrl: {
    type: String,
    required: true,
    trim: true
  },
  contentType: {
    type: String,
    enum: ['video', 'playlist', 'short'],
    default: 'video'
  },
  contentTitle: {
    type: String,
    required: true,
    trim: true
  },
  thumbnailUrl: {
    type: String,
    default: ''
  },
  
  // Watch requirements
  requiredWatchMinutes: {
    type: Number,
    required: true,
    min: 2,
    max: 60
  },
  creditsPerMinute: {
    type: Number,
    default: 1
  },
  totalCreditsOffered: {
    type: Number,
    required: true
  },
  
  // Room settings
  maxParticipants: {
    type: Number,
    default: 50,
    max: 100
  },
  currentParticipants: {
    type: Number,
    default: 0
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  requireQualityScore: {
    type: Number,
    default: 20, // Minimum quality score to join
    min: 0,
    max: 100
  },
  
  // Room status
  status: {
    type: String,
    enum: ['active', 'paused', 'completed', 'cancelled'],
    default: 'active',
    index: true
  },
  
  // Category for matching
  category: {
    type: String,
    enum: ['Gaming', 'Education', 'Entertainment', 'Tech', 'Music', 'Vlog', 'Business', 'Fitness', 'Cooking', 'Other'],
    default: 'Other'
  },
  language: {
    type: String,
    default: 'English'
  },
  
  // Statistics
  totalViews: {
    type: Number,
    default: 0
  },
  totalMinutesWatched: {
    type: Number,
    default: 0
  },
  totalCreditsSpent: {
    type: Number,
    default: 0
  },
  completionRate: {
    type: Number,
    default: 0 // Percentage of users who completed required watch time
  },
  
  // Auto-expiry
  expiresAt: {
    type: Date,
    required: true,
    index: true
  },
  
  // Admin moderation
  isFlagged: {
    type: Boolean,
    default: false
  },
  flagReason: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
watchRoomSchema.index({ status: 1, isPublic: 1, expiresAt: 1 });
watchRoomSchema.index({ creatorId: 1, status: 1 });
watchRoomSchema.index({ category: 1, status: 1 });
watchRoomSchema.index({ currentParticipants: 1, maxParticipants: 1 });

// Check if room has space
watchRoomSchema.methods.hasSpace = function() {
  return this.currentParticipants < this.maxParticipants && this.status === 'active';
};

// Check if room is expired
watchRoomSchema.methods.isExpired = function() {
  return this.expiresAt < new Date();
};

// Mark room as completed
watchRoomSchema.methods.markCompleted = async function() {
  this.status = 'completed';
  await this.save();
};

module.exports = mongoose.model('WatchRoom', watchRoomSchema);
