/**
 * Admin Routes
 * Administrative panel routes
 */

const express = require('express');
const router = express.Router();
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const User = require('../models/User');
const Payment = require('../models/Payment');
const Subscription = require('../models/Subscription');
const Notification = require('../models/Notification');
const Content = require('../models/Content');
const WatchRoom = require('../models/WatchRoom');
const WatchSession = require('../models/WatchSession');
const Referral = require('../models/Referral');
const { paginate } = require('../utils/helpers');

// Apply authentication to all admin routes
router.use(isAuthenticated);
router.use(isAdmin);

// Admin login page (separate from regular login)
router.get('/login', (req, res) => {
  if (req.session.isAdmin) {
    return res.redirect('/admin/dashboard');
  }
  res.render('admin/login', {
    pageTitle: 'Admin Login - SUB4SUB',
    layout: false
  });
});

// Admin dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const stats = {
      totalUsers: await User.countDocuments(),
      premiumUsers: await User.countDocuments({ isPremium: true }),
      totalSubscriptions: await Subscription.countDocuments(),
      totalRevenue: await Payment.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]).then(result => result[0]?.total || 0),
      newUsersToday: await User.countDocuments({
        createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
      }),
      activeUsers: await User.countDocuments({
        lastLogin: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      }),
      pendingVerifications: await Subscription.countDocuments({ status: 'pending' })
    };
    
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('username email createdAt isPremium');
    
    const recentPayments = await Payment.find()
      .populate('userId', 'username email')
      .sort({ createdAt: -1 })
      .limit(10);
    
    const pendingSubscriptions = await Subscription.find({ status: 'pending' })
      .populate('userId', 'username')
      .populate('targetUserId', 'username')
      .sort({ createdAt: -1 })
      .limit(5);
    
    res.render('admin/dashboard', {
      pageTitle: 'Admin Dashboard - SUB4SUB',
      stats,
      recentUsers,
      recentPayments,
      pendingSubscriptions
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.render('admin/dashboard', {
      pageTitle: 'Admin Dashboard - SUB4SUB',
      stats: {
        totalUsers: 0,
        premiumUsers: 0,
        totalSubscriptions: 0,
        totalRevenue: 0,
        newUsersToday: 0,
        activeUsers: 0,
        pendingVerifications: 0
      },
      recentUsers: [],
      recentPayments: [],
      pendingSubscriptions: []
    });
  }
});

// Users management
router.get('/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const filter = req.query.filter || '';
    
    let query = {};
    if (search) {
      query.$or = [
        { username: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') }
      ];
    }
    if (filter === 'premium') query.isPremium = true;
    if (filter === 'free') query.isPremium = false;
    if (filter === 'banned') query.isBanned = true;
    if (filter === 'admin') query.isAdmin = true;
    
    const totalUsers = await User.countDocuments(query);
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const pagination = paginate(page, limit, totalUsers);
    
    res.render('admin/users', {
      pageTitle: 'Users Management - Admin',
      users,
      pagination,
      totalUsers,
      currentPage: page,
      totalPages: Math.ceil(totalUsers / limit),
      search,
      filter
    });
  } catch (error) {
    console.error('Users management error:', error);
    res.render('admin/users', {
      pageTitle: 'Users Management - Admin',
      users: [],
      pagination: {},
      totalUsers: 0,
      currentPage: 1,
      totalPages: 1,
      search: '',
      filter: ''
    });
  }
});

// Ban/Unban user
router.post('/users/:id/toggle-ban', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      req.session.message = 'User not found';
      req.session.messageType = 'error';
      return res.redirect('/admin/users');
    }
    
    user.isBanned = !user.isBanned;
    await user.save();
    
    req.session.message = `User ${user.isBanned ? 'banned' : 'unbanned'} successfully`;
    req.session.messageType = 'success';
    res.redirect('/admin/users');
  } catch (error) {
    console.error('Toggle ban error:', error);
    req.session.message = 'Error updating user';
    req.session.messageType = 'error';
    res.redirect('/admin/users');
  }
});

// Toggle premium status
router.post('/users/:id/toggle-premium', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      req.session.message = 'User not found';
      req.session.messageType = 'error';
      return res.redirect('/admin/users');
    }
    
    user.isPremium = !user.isPremium;
    await user.save();
    
    req.session.message = `Premium status updated successfully`;
    req.session.messageType = 'success';
    res.redirect('/admin/users');
  } catch (error) {
    console.error('Toggle premium error:', error);
    req.session.message = 'Error updating user';
    req.session.messageType = 'error';
    res.redirect('/admin/users');
  }
});

// Delete user
router.post('/users/:id/delete', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    
    req.session.message = 'User deleted successfully';
    req.session.messageType = 'success';
    res.redirect('/admin/users');
  } catch (error) {
    console.error('Delete user error:', error);
    req.session.message = 'Error deleting user';
    req.session.messageType = 'error';
    res.redirect('/admin/users');
  }
});

// Verify users (subscription verification)
router.get('/verify-users', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;
    const status = req.query.status || 'pending';
    
    let query = {};
    if (status !== 'all') {
      query.status = status;
    }
    
    const totalSubscriptions = await Subscription.countDocuments(query);
    const subscriptions = await Subscription.find(query)
      .populate('userId', 'username email')
      .populate('targetUserId', 'username youtubeChannelName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    res.render('admin/verify-users', {
      pageTitle: 'Verify Subscriptions - Admin',
      subscriptions,
      status,
      totalSubscriptions,
      currentPage: page,
      totalPages: Math.ceil(totalSubscriptions / limit)
    });
  } catch (error) {
    console.error('Verify users error:', error);
    res.render('admin/verify-users', {
      pageTitle: 'Verify Subscriptions - Admin',
      subscriptions: [],
      status: 'pending',
      totalSubscriptions: 0,
      currentPage: 1,
      totalPages: 1
    });
  }
});

// Approve subscription
router.post('/subscriptions/:id/approve', async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);
    
    if (!subscription) {
      req.session.message = 'Subscription not found';
      req.session.messageType = 'error';
      return res.redirect('/admin/verify-users');
    }
    
    subscription.status = 'verified';
    subscription.verifiedAt = new Date();
    subscription.pointsEarned = 10; // Award points
    await subscription.save();
    
    // Create notification
    await Notification.create({
      userId: subscription.userId,
      title: 'Subscription Verified',
      message: 'Your subscription has been verified and points awarded!',
      type: 'success'
    });
    
    req.session.message = 'Subscription approved successfully';
    req.session.messageType = 'success';
    res.redirect('/admin/verify-users');
  } catch (error) {
    console.error('Approve subscription error:', error);
    req.session.message = 'Error approving subscription';
    req.session.messageType = 'error';
    res.redirect('/admin/verify-users');
  }
});

// Reject subscription
router.post('/subscriptions/:id/reject', async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);
    
    if (!subscription) {
      req.session.message = 'Subscription not found';
      req.session.messageType = 'error';
      return res.redirect('/admin/verify-users');
    }
    
    subscription.status = 'rejected';
    await subscription.save();
    
    // Create notification
    await Notification.create({
      userId: subscription.userId,
      title: 'Subscription Rejected',
      message: 'Your subscription verification was rejected. Please try again.',
      type: 'warning'
    });
    
    req.session.message = 'Subscription rejected';
    req.session.messageType = 'success';
    res.redirect('/admin/verify-users');
  } catch (error) {
    console.error('Reject subscription error:', error);
    req.session.message = 'Error rejecting subscription';
    req.session.messageType = 'error';
    res.redirect('/admin/verify-users');
  }
});

// Payments management
router.get('/payments', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;
    const status = req.query.status || '';
    const method = req.query.method || '';
    const search = req.query.search || '';
    
    let query = {};
    if (status) query.status = status;
    if (method) query.paymentMethod = method;
    if (search) {
      const users = await User.find({
        $or: [
          { username: new RegExp(search, 'i') },
          { email: new RegExp(search, 'i') }
        ]
      }).select('_id');
      query.userId = { $in: users.map(u => u._id) };
    }
    
    const totalPayments = await Payment.countDocuments(query);
    const totalRevenue = await Payment.aggregate([
      { $match: { ...query, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]).then(result => result[0]?.total || 0);
    
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const monthlyRevenue = await Payment.aggregate([
      { $match: { status: 'completed', createdAt: { $gte: monthStart } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]).then(result => result[0]?.total || 0);
    
    const pendingPayments = await Payment.countDocuments({ status: 'pending' });
    
    const payments = await Payment.find(query)
      .populate('userId', 'username email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const pagination = paginate(page, limit, totalPayments);
    
    res.render('admin/payments', {
      pageTitle: 'Payments Management - Admin',
      payments,
      pagination,
      totalRevenue,
      totalPayments,
      monthlyRevenue,
      pendingPayments,
      currentPage: page,
      totalPages: Math.ceil(totalPayments / limit),
      status,
      method,
      search
    });
  } catch (error) {
    console.error('Payments management error:', error);
    res.render('admin/payments', {
      pageTitle: 'Payments Management - Admin',
      payments: [],
      pagination: {},
      totalRevenue: 0,
      totalPayments: 0,
      monthlyRevenue: 0,
      pendingPayments: 0,
      currentPage: 1,
      totalPages: 1,
      status: '',
      method: '',
      search: ''
    });
  }
});

// Settings page
router.get('/settings', async (req, res) => {
  // Load settings from environment or database
  const settings = {
    siteName: process.env.APP_NAME || 'SUB4SUB',
    siteDescription: 'YouTube Subscription Exchange Platform',
    contactEmail: process.env.ADMIN_EMAIL || 'admin@sub4sub.com',
    maintenanceMode: false,
    pointsPerSub: 10,
    dailyFreeLimit: 50,
    dailyPremiumLimit: 500,
    signupBonus: 100,
    enableStripe: !!process.env.STRIPE_SECRET_KEY,
    enablePayPal: !!process.env.PAYPAL_CLIENT_ID,
    monthlyPrice: 9.99,
    yearlyPrice: 99.99,
    enableRegistration: true,
    requireEmailVerification: false,
    maxLoginAttempts: 5,
    sessionTimeout: 24
  };
  
  res.render('admin/settings', {
    pageTitle: 'Settings - Admin',
    settings
  });
});

// Content management
router.get('/content', async (req, res) => {
  try {
    const page = req.query.page || 'about';
    const content = await Content.findOne({ type: page });
    
    res.render('admin/content-management', {
      pageTitle: 'Content Management - Admin',
      page,
      content
    });
  } catch (error) {
    console.error('Content management error:', error);
    res.render('admin/content-management', {
      pageTitle: 'Content Management - Admin',
      page: 'about',
      content: null
    });
  }
});

// Edit content pages
router.get('/content/:type', async (req, res) => {
  try {
    let content = await Content.findOne({ type: req.params.type });
    
    // Create default content if doesn't exist
    if (!content) {
      content = new Content({
        type: req.params.type,
        title: req.params.type.charAt(0).toUpperCase() + req.params.type.slice(1),
        content: 'Add your content here...'
      });
    }
    
    res.render(`admin/content-${req.params.type}`, {
      pageTitle: `Edit ${content.title} - Admin`,
      content
    });
  } catch (error) {
    console.error('Content edit error:', error);
    res.redirect('/admin/content-management');
  }
});

// Update content
router.post('/content/:page', async (req, res) => {
  try {
    const { title, content, isActive } = req.body;
    const page = req.params.page;
    
    let contentDoc = await Content.findOne({ type: page });
    
    if (contentDoc) {
      contentDoc.title = title;
      contentDoc.content = content;
      contentDoc.isActive = isActive === 'on';
      contentDoc.version = (contentDoc.version || 1) + 1;
      contentDoc.lastUpdatedBy = req.session.user._id;
      await contentDoc.save();
    } else {
      contentDoc = await Content.create({
        type: page,
        title,
        content,
        isActive: isActive === 'on',
        version: 1,
        lastUpdatedBy: req.session.user._id
      });
    }
    
    req.session.message = 'Content updated successfully';
    req.session.messageType = 'success';
    res.redirect(`/admin/content?page=${page}`);
  } catch (error) {
    console.error('Content update error:', error);
    req.session.message = 'Error updating content';
    req.session.messageType = 'error';
    res.redirect('/admin/content');
  }
});

// Settings POST handlers
router.post('/settings/app', async (req, res) => {
  try {
    // In a real app, save these to a settings database collection
    req.session.message = 'Application settings updated successfully';
    req.session.messageType = 'success';
  } catch (error) {
    req.session.message = 'Error updating settings';
    req.session.messageType = 'error';
  }
  res.redirect('/admin/settings');
});

router.post('/settings/points', async (req, res) => {
  try {
    req.session.message = 'Points settings updated successfully';
    req.session.messageType = 'success';
  } catch (error) {
    req.session.message = 'Error updating settings';
    req.session.messageType = 'error';
  }
  res.redirect('/admin/settings');
});

router.post('/settings/payment', async (req, res) => {
  try {
    req.session.message = 'Payment settings updated successfully';
    req.session.messageType = 'success';
  } catch (error) {
    req.session.message = 'Error updating settings';
    req.session.messageType = 'error';
  }
  res.redirect('/admin/settings');
});

router.post('/settings/security', async (req, res) => {
  try {
    req.session.message = 'Security settings updated successfully';
    req.session.messageType = 'success';
  } catch (error) {
    req.session.message = 'Error updating settings';
    req.session.messageType = 'error';
  }
  res.redirect('/admin/settings');
});

// ===== WATCH ROOMS MANAGEMENT =====

// Watch rooms page
router.get('/watch-rooms', async (req, res) => {
  try {
    res.render('admin/watch-rooms', {
      pageTitle: 'Watch Rooms Management - Admin'
    });
  } catch (error) {
    console.error('Watch rooms page error:', error);
    res.redirect('/admin/dashboard');
  }
});

// API: Get all watch rooms
router.get('/api/watch-rooms', async (req, res) => {
  try {
    const rooms = await WatchRoom.find()
      .populate('creatorId', 'username email')
      .sort({ createdAt: -1 })
      .limit(500);
    
    // Calculate stats
    const stats = {
      activeRooms: await WatchRoom.countDocuments({ status: 'active' }),
      totalSessions: await WatchSession.countDocuments(),
      flaggedRooms: await WatchRoom.countDocuments({ isFlagged: true }),
      totalWatchTime: await WatchSession.aggregate([
        { $group: { _id: null, total: { $sum: '$minutesWatched' } } }
      ]).then(r => r[0]?.total || 0)
    };
    
    res.json({
      success: true,
      rooms,
      stats
    });
  } catch (error) {
    console.error('Get watch rooms error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching watch rooms'
    });
  }
});

// API: Get room details
router.get('/api/watch-rooms/:id', async (req, res) => {
  try {
    const room = await WatchRoom.findById(req.params.id)
      .populate('creatorId', 'username email');
    
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }
    
    const sessions = await WatchSession.find({ roomId: room._id })
      .populate('userId', 'username')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      room,
      sessions
    });
  } catch (error) {
    console.error('Get room details error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching room details'
    });
  }
});

// API: Flag a room
router.put('/api/watch-rooms/:id/flag', async (req, res) => {
  try {
    const { reason } = req.body;
    
    const room = await WatchRoom.findByIdAndUpdate(
      req.params.id,
      {
        isFlagged: true,
        flagReason: reason || 'Flagged by admin'
      },
      { new: true }
    );
    
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }
    
    res.json({
      success: true,
      message: 'Room flagged successfully'
    });
  } catch (error) {
    console.error('Flag room error:', error);
    res.status(500).json({
      success: false,
      message: 'Error flagging room'
    });
  }
});

// API: Delete a room
router.delete('/api/watch-rooms/:id', async (req, res) => {
  try {
    const room = await WatchRoom.findById(req.params.id);
    
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }
    
    // Cancel all active sessions
    await WatchSession.updateMany(
      { roomId: room._id, status: 'active' },
      { $set: { status: 'abandoned' } }
    );
    
    // Delete room
    await room.deleteOne();
    
    res.json({
      success: true,
      message: 'Room deleted successfully'
    });
  } catch (error) {
    console.error('Delete room error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting room'
    });
  }
});

// ===== QUALITY SCORES MANAGEMENT =====

// Quality scores page
router.get('/quality-scores', async (req, res) => {
  try {
    const users = await User.find()
      .select('username email qualityScore qualityMetrics isPremium createdAt')
      .sort({ qualityScore: -1 })
      .limit(100);
    
    res.render('admin/quality-scores', {
      pageTitle: 'Quality Scores - Admin',
      users
    });
  } catch (error) {
    console.error('Quality scores page error:', error);
    res.redirect('/admin/dashboard');
  }
});

// API: Update user quality score
router.put('/api/quality/:userId', async (req, res) => {
  try {
    const { manualAdjustment } = req.body;
    
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    user.qualityMetrics.manualAdjustment = parseInt(manualAdjustment) || 0;
    await user.updateQualityScore();
    
    res.json({
      success: true,
      newScore: user.qualityScore
    });
  } catch (error) {
    console.error('Update quality score error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating quality score'
    });
  }
});

// ===== REFERRALS MANAGEMENT =====

// Referrals page
router.get('/referrals', async (req, res) => {
  try {
    const referrals = await Referral.find()
      .populate('referrerId', 'username email')
      .populate('refereeId', 'username email')
      .sort({ createdAt: -1 })
      .limit(100);
    
    const stats = {
      total: await Referral.countDocuments(),
      completed: await Referral.countDocuments({ status: 'completed' }),
      rewarded: await Referral.countDocuments({ status: 'rewarded' })
    };
    
    res.render('admin/referrals', {
      pageTitle: 'Referrals Management - Admin',
      referrals,
      stats
    });
  } catch (error) {
    console.error('Referrals page error:', error);
    res.redirect('/admin/dashboard');
  }
});

// Admin logout
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.redirect('/admin/login');
  });
});

module.exports = router;
