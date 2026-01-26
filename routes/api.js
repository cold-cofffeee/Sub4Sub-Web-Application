/**
 * API Routes
 * RESTful API endpoints
 */

const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { isAuthenticated } = require('../middleware/auth');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const Notification = require('../models/Notification');
const Payment = require('../models/Payment');

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // limit each IP to 100 requests per windowMs
  message: { success: false, message: 'Too many requests, please try again later.' }
});

router.use(apiLimiter);

// API info
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'SUB4SUB API v2.0',
    version: '2.0.0',
    endpoints: {
      users: '/api/users',
      subscriptions: '/api/subscriptions',
      notifications: '/api/notifications',
      stats: '/api/stats'
    }
  });
});

// Get current user
router.get('/user', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id)
      .select('-password -passwordResetToken -emailVerificationToken');
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user data'
    });
  }
});

// Get users list (for exchange)
router.get('/users', isAuthenticated, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const users = await User.find({
      _id: { $ne: req.session.user._id },
      isBanned: false
    })
    .select('username youtubeChannelName youtubeChannel createdAt')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });
    
    const total = await User.countDocuments({
      _id: { $ne: req.session.user._id },
      isBanned: false
    });
    
    res.json({
      success: true,
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users'
    });
  }
});

// Get user's subscriptions
router.get('/subscriptions', isAuthenticated, async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ userId: req.session.user._id })
      .populate('targetUserId', 'username youtubeChannelName')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      subscriptions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching subscriptions'
    });
  }
});

// Create subscription
router.post('/subscriptions', isAuthenticated, async (req, res) => {
  try {
    const { targetUserId, targetChannelUrl, targetChannelName } = req.body;
    
    // Check if subscription already exists
    const existing = await Subscription.findOne({
      userId: req.session.user._id,
      targetUserId
    });
    
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You have already subscribed to this channel'
      });
    }
    
    const subscription = await Subscription.create({
      userId: req.session.user._id,
      targetUserId,
      targetChannelUrl,
      targetChannelName,
      status: 'pending'
    });
    
    // Create notification for target user
    await Notification.create({
      userId: targetUserId,
      title: 'New Subscription',
      message: 'Someone subscribed to your channel!',
      type: 'info'
    });
    
    res.json({
      success: true,
      message: 'Subscription created successfully',
      subscription
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating subscription'
    });
  }
});

// Get notifications
router.get('/notifications', isAuthenticated, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.session.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    
    const unreadCount = await Notification.countDocuments({
      userId: req.session.user._id,
      isRead: false
    });
    
    res.json({
      success: true,
      notifications,
      unreadCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications'
    });
  }
});

// Mark notification as read
router.put('/notifications/:id/read', isAuthenticated, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.session.user._id },
      { isRead: true },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    res.json({
      success: true,
      notification
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating notification'
    });
  }
});

// Get statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = {
      totalUsers: await User.countDocuments(),
      premiumUsers: await User.countDocuments({ isPremium: true }),
      totalSubscriptions: await Subscription.countDocuments(),
      verifiedSubscriptions: await Subscription.countDocuments({ status: 'verified' })
    };
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics'
    });
  }
});

// Process payment (demo mode)
router.post('/payments/demo', isAuthenticated, async (req, res) => {
  try {
    const { amount, description } = req.body;
    
    // Create demo payment
    const payment = await Payment.create({
      userId: req.session.user._id,
      amount: amount || 9.99,
      currency: 'USD',
      paymentMethod: 'demo',
      transactionId: `DEMO-${Date.now()}`,
      status: 'completed',
      description: description || 'Premium subscription',
      metadata: { mode: 'demo' }
    });
    
    // Upgrade user to premium
    await User.findByIdAndUpdate(req.session.user._id, { isPremium: true });
    req.session.user.isPremium = true;
    
    // Create notification
    await Notification.create({
      userId: req.session.user._id,
      title: 'Premium Activated!',
      message: 'Your premium subscription is now active!',
      type: 'success'
    });
    
    res.json({
      success: true,
      message: 'Payment processed successfully',
      payment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error processing payment'
    });
  }
});

module.exports = router;
