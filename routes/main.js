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

// Verify subscription page
router.get('/verify', isAuthenticated, (req, res) => {
  res.render('verify', {
    pageTitle: 'Verify Subscription - SUB4SUB'
  });
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
    const { name, email, message } = req.body;
    
    // Here you would typically send an email or save to database
    const emailService = require('../utils/emailService');
    await emailService.sendEmail(
      'admin@sub4sub.com',
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

module.exports = router;
