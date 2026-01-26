/**
 * Content Model
 * MongoDB schema for dynamic content (About, FAQ, Privacy, TOS, Contact)
 */

const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    unique: true,
    enum: ['about', 'faq', 'privacy', 'tos', 'contact']
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Content', contentSchema);
