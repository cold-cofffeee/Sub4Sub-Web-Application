/**
 * Main Routes
 * Public pages and user dashboard
 */

const express = require('express');
const router = express.Router();
const { isAuthenticated, checkBanned } = require('../middleware/auth');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const Payment = require('../models/Payment');
const Content = require('../models/Content');
const Notification = require('../models/Notification');
const WatchRoom = require('../models/WatchRoom');
const WatchSession = require('../models/WatchSession');

// Apply banned check to all routes
router.use(checkBanned);

// Home page
router.get('/', async (req, res) => {
  try {
    const stats = {
      totalUsers: await User.countDocuments(),
      totalSubscriptions: await Subscription.countDocuments(),
      premiumUsers: await User.countDocuments({ isPremium: true })
    };
    
    res.render('index', {
      pageTitle: 'SUB4SUB - Boost Your YouTube Channel Growth',
      stats
    });
  } catch (error) {
    console.error('Home page error:', error);
    res.render('index', {
      pageTitle: 'SUB4SUB - Boost Your YouTube Channel Growth',
      stats: { totalUsers: 0, totalSubscriptions: 0, premiumUsers: 0 }
    });
  }
});

// Exchange page (requires login)
router.get('/exchange', isAuthenticated, async (req, res) => {
  try {
    const users = await User.find({
      _id: { $ne: req.session.user._id },
      isBanned: false
    })
    .select('username email youtubeChannelName youtubeChannel')
    .limit(20);
    
    res.render('exchange', {
      pageTitle: 'Exchange - SUB4SUB',
      users
    });
  } catch (error) {
    console.error('Exchange page error:', error);
    res.render('exchange', {
      pageTitle: 'Exchange - SUB4SUB',
      users: []
    });
  }
});

// Account/Dashboard page
router.get('/account', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id);
    
    if (!user) {
      req.session.destroy();
      return res.redirect('/auth/login');
    }
    
    const subscriptions = await Subscription.find({ userId: user._id })
      .populate('targetUserId', 'username youtubeChannelName')
      .sort({ createdAt: -1 })
      .limit(10);
    
    const payments = await Payment.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(10);
    
    res.render('account', {
      pageTitle: 'My Account - SUB4SUB',
      userProfile: user,
      subscriptions,
      payments
    });
  } catch (error) {
    console.error('Account page error:', error);
    req.session.message = 'Error loading account data';
    req.session.messageType = 'error';
    res.redirect('/');
  }
});

// Verify page without token
router.get('/verify', (req, res) => {
  res.render('verify', {
    pageTitle: 'Email Verification - SUB4SUB',
    success: false,
    message: 'Please use the verification link sent to your email.'
  });
});

// Email verification page with token
router.get('/verify/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    // Find user with this verification token
    const user = await User.findOne({
      emailVerificationToken: token
    });
    
    if (!user) {
      return res.render('verify', {
        pageTitle: 'Email Verification - SUB4SUB',
        success: false,
        message: 'Invalid or expired verification link.'
      });
    }
    
    // Mark user as verified
    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();
    
    res.render('verify', {
      pageTitle: 'Email Verification - SUB4SUB',
      success: true,
      message: ''
    });
  } catch (error) {
    console.error('Verification error:', error);
    res.render('verify', {
      pageTitle: 'Email Verification - SUB4SUB',
      success: false,
      message: 'An error occurred during verification.'
    });
  }
});

// Analytics page
router.get('/analytics', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id);
    
    const subscriptionsCount = await Subscription.countDocuments({ userId: user._id });
    const verifiedCount = await Subscription.countDocuments({ 
      userId: user._id, 
      status: 'verified' 
    });
    const pendingCount = await Subscription.countDocuments({ 
      userId: user._id, 
      status: 'pending' 
    });
    
    const recentActivity = await Subscription.find({ userId: user._id })
      .populate('targetUserId', 'username youtubeChannelName')
      .sort({ createdAt: -1 })
      .limit(20);
    
    res.render('analytics', {
      pageTitle: 'Analytics - SUB4SUB',
      user,
      stats: {
        total: subscriptionsCount,
        verified: verifiedCount,
        pending: pendingCount
      },
      recentActivity
    });
  } catch (error) {
    console.error('Analytics page error:', error);
    res.render('analytics', {
      pageTitle: 'Analytics - SUB4SUB',
      user: req.session.user,
      stats: { total: 0, verified: 0, pending: 0 },
      recentActivity: []
    });
  }
});

// Notifications page
router.get('/notification', isAuthenticated, async (req, res) => {
  try {
    const Notification = require('../models/Notification');
    const notifications = await Notification.find({ userId: req.session.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.render('notification', {
      pageTitle: 'Notifications - SUB4SUB',
      notifications
    });
  } catch (error) {
    console.error('Notifications page error:', error);
    res.render('notification', {
      pageTitle: 'Notifications - SUB4SUB',
      notifications: []
    });
  }
});

// Purchase/Premium page
router.get('/purchase', isAuthenticated, (req, res) => {
  res.render('purchase', {
    pageTitle: 'Go Premium - SUB4SUB'
  });
});

// Process purchase
router.post('/purchase/process', isAuthenticated, async (req, res) => {
  try {
    const { plan, amount } = req.body;
    
    // For demo purposes, create a demo payment
    // In production, this would integrate with Stripe/PayPal
    const payment = await Payment.create({
      userId: req.session.user._id,
      amount: parseFloat(amount),
      currency: 'USD',
      paymentMethod: 'demo',
      transactionId: `DEMO-${Date.now()}`,
      status: 'completed',
      metadata: { plan }
    });
    
    // Update user to premium
    await User.findByIdAndUpdate(req.session.user._id, { isPremium: true });
    req.session.user.isPremium = true;
    
    // Create notification
    await Notification.create({
      userId: req.session.user._id,
      title: 'Premium Activated!',
      message: `Your ${plan} premium subscription is now active. Enjoy all premium features!`,
      type: 'success'
    });
    
    res.render('purchase-success', {
      pageTitle: 'Payment Successful - SUB4SUB',
      transaction: payment
    });
  } catch (error) {
    console.error('Purchase error:', error);
    req.session.message = 'Error processing payment. Please try again.';
    req.session.messageType = 'error';
    res.redirect('/purchase');
  }
});

// Purchase success page
router.get('/purchase-success', isAuthenticated, (req, res) => {
  res.render('purchase-success', {
    pageTitle: 'Purchase Successful - SUB4SUB'
  });
});

// Content pages (About, FAQ, Privacy, TOS, Contact)
router.get('/about', async (req, res) => {
  try {
    const content = await Content.findOne({ type: 'about', isActive: true });
    res.render('content', {
      pageTitle: 'About Us - SUB4SUB',
      contentType: 'about',
      content: content || { title: 'About Us', content: 'Content coming soon...' }
    });
  } catch (error) {
    res.render('content', {
      pageTitle: 'About Us - SUB4SUB',
      contentType: 'about',
      content: { title: 'About Us', content: 'Content coming soon...' }
    });
  }
});

router.get('/faq', async (req, res) => {
  try {
    const content = await Content.findOne({ type: 'faq', isActive: true });
    res.render('content', {
      pageTitle: 'FAQ - SUB4SUB',
      contentType: 'faq',
      content: content || { title: 'Frequently Asked Questions', content: 'Content coming soon...' }
    });
  } catch (error) {
    res.render('content', {
      pageTitle: 'FAQ - SUB4SUB',
      contentType: 'faq',
      content: { title: 'Frequently Asked Questions', content: 'Content coming soon...' }
    });
  }
});

router.get('/privacy', async (req, res) => {
  try {
    const content = await Content.findOne({ type: 'privacy', isActive: true });
    res.render('content', {
      pageTitle: 'Privacy Policy - SUB4SUB',
      contentType: 'privacy',
      content: content || { title: 'Privacy Policy', content: 'Content coming soon...' }
    });
  } catch (error) {
    res.render('content', {
      pageTitle: 'Privacy Policy - SUB4SUB',
      contentType: 'privacy',
      content: { title: 'Privacy Policy', content: 'Content coming soon...' }
    });
  }
});

router.get('/tos', async (req, res) => {
  try {
    const content = await Content.findOne({ type: 'tos', isActive: true });
    res.render('content', {
      pageTitle: 'Terms of Service - SUB4SUB',
      contentType: 'tos',
      content: content || { title: 'Terms of Service', content: 'Content coming soon...' }
    });
  } catch (error) {
    res.render('content', {
      pageTitle: 'Terms of Service - SUB4SUB',
      contentType: 'tos',
      content: { title: 'Terms of Service', content: 'Content coming soon...' }
    });
  }
});

router.get('/contact', async (req, res) => {
  try {
    const content = await Content.findOne({ type: 'contact', isActive: true });
    res.render('contact', {
      pageTitle: 'Contact Us - SUB4SUB',
      content: content || { title: 'Contact Us', content: '' }
    });
  } catch (error) {
    res.render('contact', {
      pageTitle: 'Contact Us - SUB4SUB',
      content: { title: 'Contact Us', content: '' }
    });
  }
});

// Contact form submission
router.post('/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    
    // Here you would typically send an email or save to database
    const emailService = require('../utils/emailService');
    await emailService.sendEmail(
      process.env.ADMIN_EMAIL || 'admin@sub4sub.com',
      `Contact Form: ${name}`,
      `<p><strong>From:</strong> ${name} (${email})</p><p><strong>Message:</strong></p><p>${message}</p>`
    );
    
    req.session.message = 'Thank you for contacting us! We will get back to you soon.';
    req.session.messageType = 'success';
  } catch (error) {
    req.session.message = 'Error sending message. Please try again.';
    req.session.messageType = 'error';
  }
  
  res.redirect('/contact');
});

// Notification actions
router.post('/notification/mark-read/:id', isAuthenticated, async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.session.user._id },
      { isRead: true }
    );
    req.session.message = 'Notification marked as read';
    req.session.messageType = 'success';
  } catch (error) {
    console.error('Mark read error:', error);
    req.session.message = 'Error updating notification';
    req.session.messageType = 'error';
  }
  res.redirect('/notification');
});

router.post('/notification/delete/:id', isAuthenticated, async (req, res) => {
  try {
    await Notification.findOneAndDelete({
      _id: req.params.id,
      userId: req.session.user._id
    });
    req.session.message = 'Notification deleted';
    req.session.messageType = 'success';
  } catch (error) {
    console.error('Delete notification error:', error);
    req.session.message = 'Error deleting notification';
    req.session.messageType = 'error';
  }
  res.redirect('/notification');
});

router.post('/notification/mark-all-read', isAuthenticated, async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.session.user._id, isRead: false },
      { isRead: true }
    );
    req.session.message = 'All notifications marked as read';
    req.session.messageType = 'success';
  } catch (error) {
    console.error('Mark all read error:', error);
    req.session.message = 'Error updating notifications';
    req.session.messageType = 'error';
  }
  res.redirect('/notification');
});

router.post('/notification/clear-all', isAuthenticated, async (req, res) => {
  try {
    await Notification.deleteMany({ userId: req.session.user._id });
    req.session.message = 'All notifications cleared';
    req.session.messageType = 'success';
  } catch (error) {
    console.error('Clear all error:', error);
    req.session.message = 'Error clearing notifications';
    req.session.messageType = 'error';
  }
  res.redirect('/notification');
});

// ===== WATCH TIME EXCHANGE ROUTES =====

// Watch rooms listing page
router.get('/watch-rooms', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id);
    
    res.render('watch-rooms', {
      pageTitle: 'Watch Time Exchange - SUB4SUB',
      user
    });
  } catch (error) {
    console.error('Watch rooms page error:', error);
    req.session.message = 'Error loading watch rooms';
    req.session.messageType = 'error';
    res.redirect('/');
  }
});

// Watch session page
router.get('/watch/session/:sessionId', isAuthenticated, async (req, res) => {
  try {
    const session = await WatchSession.findOne({
      _id: req.params.sessionId,
      userId: req.session.user._id
    });
    
    if (!session) {
      req.session.message = 'Session not found';
      req.session.messageType = 'error';
      return res.redirect('/watch-rooms');
    }
    
    if (session.status === 'completed') {
      req.session.message = 'This session is already completed';
      req.session.messageType = 'info';
      return res.redirect('/watch-rooms');
    }
    
    res.render('watch-session', {
      pageTitle: 'Watch Session - SUB4SUB',
      sessionId: session._id.toString()
    });
  } catch (error) {
    console.error('Watch session page error:', error);
    req.session.message = 'Error loading watch session';
    req.session.messageType = 'error';
    res.redirect('/watch-rooms');
  }
});

// Referrals page
router.get('/referrals', isAuthenticated, async (req, res) => {
  try {
    res.render('referrals', {
      pageTitle: 'Referral Program - SUB4SUB'
    });
  } catch (error) {
    console.error('Referrals page error:', error);
    req.session.message = 'Error loading referrals';
    req.session.messageType = 'error';
    res.redirect('/');
  }
});

// API endpoint to get session details (for watch-session page)
router.get('/api/watch/sessions/:sessionId/details', isAuthenticated, async (req, res) => {
  try {
    const session = await WatchSession.findOne({
      _id: req.params.sessionId,
      userId: req.session.user._id
    });
    
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }
    
    const room = await WatchRoom.findById(session.roomId)
      .populate('creatorId', 'username youtubeChannelName');
    
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }
    
    res.json({
      success: true,
      session: session,
      room: room
    });
  } catch (error) {
    console.error('Get session details error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching session details'
    });
  }
});

module.exports = router;
