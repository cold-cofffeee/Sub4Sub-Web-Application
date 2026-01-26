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
      })
    };
    
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('username email createdAt isPremium');
    
    const recentPayments = await Payment.find()
      .populate('userId', 'username email')
      .sort({ createdAt: -1 })
      .limit(10);
    
    res.render('admin/dashboard', {
      pageTitle: 'Admin Dashboard - SUB4SUB',
      stats,
      recentUsers,
      recentPayments
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    req.session.message = 'Error loading dashboard';
    req.session.messageType = 'error';
    res.redirect('/');
  }
});

// Users management
router.get('/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;
    
    const totalUsers = await User.countDocuments();
    const users = await User.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const pagination = paginate(page, limit, totalUsers);
    
    res.render('admin/users', {
      pageTitle: 'Users Management - Admin',
      users,
      pagination
    });
  } catch (error) {
    console.error('Users management error:', error);
    res.render('admin/users', {
      pageTitle: 'Users Management - Admin',
      users: [],
      pagination: {}
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
    const pendingSubscriptions = await Subscription.find({ status: 'pending' })
      .populate('userId', 'username email')
      .populate('targetUserId', 'username youtubeChannelName')
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.render('admin/verify-users', {
      pageTitle: 'Verify Subscriptions - Admin',
      subscriptions: pendingSubscriptions
    });
  } catch (error) {
    console.error('Verify users error:', error);
    res.render('admin/verify-users', {
      pageTitle: 'Verify Subscriptions - Admin',
      subscriptions: []
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
    
    const totalPayments = await Payment.countDocuments();
    const payments = await Payment.find()
      .populate('userId', 'username email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const pagination = paginate(page, limit, totalPayments);
    
    res.render('admin/payments', {
      pageTitle: 'Payments Management - Admin',
      payments,
      pagination
    });
  } catch (error) {
    console.error('Payments management error:', error);
    res.render('admin/payments', {
      pageTitle: 'Payments Management - Admin',
      payments: [],
      pagination: {}
    });
  }
});

// Settings page
router.get('/settings', async (req, res) => {
  res.render('admin/settings', {
    pageTitle: 'Settings - Admin'
  });
});

// Content management
router.get('/content-management', async (req, res) => {
  try {
    const contents = await Content.find().sort({ type: 1 });
    
    res.render('admin/content-management', {
      pageTitle: 'Content Management - Admin',
      contents
    });
  } catch (error) {
    console.error('Content management error:', error);
    res.render('admin/content-management', {
      pageTitle: 'Content Management - Admin',
      contents: []
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
router.post('/content/:type', async (req, res) => {
  try {
    const { title, content } = req.body;
    
    let contentDoc = await Content.findOne({ type: req.params.type });
    
    if (contentDoc) {
      contentDoc.title = title;
      contentDoc.content = content;
      contentDoc.lastUpdatedBy = req.session.user._id;
      await contentDoc.save();
    } else {
      await Content.create({
        type: req.params.type,
        title,
        content,
        lastUpdatedBy: req.session.user._id
      });
    }
    
    req.session.message = 'Content updated successfully';
    req.session.messageType = 'success';
    res.redirect('/admin/content-management');
  } catch (error) {
    console.error('Update content error:', error);
    req.session.message = 'Error updating content';
    req.session.messageType = 'error';
    res.redirect('/admin/content-management');
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
