/**
 * Authentication Routes
 * Login, register, password reset, etc.
 */

const express = require('express');
const router = express.Router();
const { isGuest } = require('../middleware/auth');
const { 
  validateRegistration, 
  validateLogin, 
  validateProfileUpdate,
  validatePasswordChange,
  checkValidation 
} = require('../middleware/validation');
const User = require('../models/User');
const emailService = require('../utils/emailService');
const { generateToken } = require('../utils/helpers');
const referralController = require('../controllers/referralController');
const config = require('../config/config');

// Login page
router.get('/login', isGuest, (req, res) => {
  res.render('auth/login', {
    pageTitle: 'Login - SUB4SUB'
  });
});

// Login submission
router.post('/login', validateLogin, checkValidation, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      req.session.message = 'Invalid email or password';
      req.session.messageType = 'error';
      return res.redirect('/auth/login');
    }
    
    // Check if account is locked
    if (user.isLocked()) {
      req.session.message = 'Account temporarily locked due to too many failed login attempts. Please try again later.';
      req.session.messageType = 'error';
      return res.redirect('/auth/login');
    }
    
    // Check if account is banned
    if (user.isBanned) {
      req.session.message = 'Your account has been banned. Please contact support.';
      req.session.messageType = 'error';
      return res.redirect('/auth/login');
    }
    
    // Verify password
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      await user.incrementLoginAttempts();
      req.session.message = 'Invalid email or password';
      req.session.messageType = 'error';
      return res.redirect('/auth/login');
    }
    
    // Reset login attempts on successful login
    await user.resetLoginAttempts();
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    // Set session
    req.session.user = {
      _id: user._id,
      email: user.email,
      username: user.username,
      isPremium: user.isPremium
    };
    req.session.isAdmin = user.isAdmin;
    
    req.session.message = 'Login successful!';
    req.session.messageType = 'success';
    
    // Redirect to admin panel if admin
    if (user.isAdmin) {
      return res.redirect('/admin/dashboard');
    }
    
    res.redirect('/account');
  } catch (error) {
    console.error('Login error:', error);
    req.session.message = 'An error occurred. Please try again.';
    req.session.messageType = 'error';
    res.redirect('/auth/login');
  }
});

// Register page
router.get('/register', isGuest, (req, res) => {
  const referralCode = req.query.ref || '';
  
  res.render('auth/register', {
    pageTitle: 'Register - SUB4SUB',
    referralCode
  });
});

// Register submission
router.post('/register', validateRegistration, checkValidation, async (req, res) => {
  try {
    const { 
      email, 
      username, 
      password, 
      youtubeChannelName, 
      youtubeChannelUrl,
      locationAddress,
      referralCode
    } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [
        { email: email.toLowerCase() },
        { username: username }
      ]
    });
    
    if (existingUser) {
      req.session.message = 'Email or username already exists';
      req.session.messageType = 'error';
      return res.redirect('/auth/register');
    }
    
    // Create new user with starting credits
    const user = new User({
      email: email.toLowerCase(),
      username,
      password,
      youtubeChannelName: youtubeChannelName || '',
      youtubeChannel: youtubeChannelUrl || '',
      locationAddress: locationAddress || '',
      emailVerificationToken: generateToken(),
      credits: config.credits.signupBonus || 100 // Starting credits
    });
    
    await user.save();
    
    // Process referral if code provided
    if (referralCode) {
      await referralController.processReferralSignup(referralCode, user._id, req);
    }
    
    // Generate referral code for new user
    await user.generateReferralCode();
    
    // Send welcome email
    await emailService.sendWelcomeEmail(user);
    
    // Auto login after registration
    req.session.user = {
      _id: user._id,
      email: user.email,
      username: user.username,
      isPremium: user.isPremium
    };
    
    req.session.message = 'Registration successful! Welcome to SUB4SUB!';
    req.session.messageType = 'success';
    res.redirect('/account');
  } catch (error) {
    console.error('Registration error:', error);
    req.session.message = 'An error occurred during registration. Please try again.';
    req.session.messageType = 'error';
    res.redirect('/auth/register');
  }
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.redirect('/');
  });
});

router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.redirect('/');
  });
});

// Forgot password page
router.get('/forgot-password', isGuest, (req, res) => {
  res.render('auth/forgot-password', {
    pageTitle: 'Forgot Password - SUB4SUB'
  });
});

// Forgot password submission
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      req.session.message = 'If an account exists with that email, a reset link has been sent.';
      req.session.messageType = 'info';
      return res.redirect('/auth/forgot-password');
    }
    
    // Generate reset token
    user.passwordResetToken = generateToken();
    user.passwordResetExpires = new Date(Date.now() + 3600000); // 1 hour
    await user.save();
    
    // Send reset email
    await emailService.sendPasswordResetEmail(user, user.passwordResetToken);
    
    req.session.message = 'If an account exists with that email, a reset link has been sent.';
    req.session.messageType = 'info';
    res.redirect('/auth/login');
  } catch (error) {
    console.error('Forgot password error:', error);
    req.session.message = 'An error occurred. Please try again.';
    req.session.messageType = 'error';
    res.redirect('/auth/forgot-password');
  }
});

// Reset password page
router.get('/reset-password/:token', async (req, res) => {
  try {
    const user = await User.findOne({
      passwordResetToken: req.params.token,
      passwordResetExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      req.session.message = 'Password reset token is invalid or has expired.';
      req.session.messageType = 'error';
      return res.redirect('/auth/forgot-password');
    }
    
    res.render('auth/reset-password', {
      pageTitle: 'Reset Password - SUB4SUB',
      token: req.params.token
    });
  } catch (error) {
    console.error('Reset password page error:', error);
    res.redirect('/auth/forgot-password');
  }
});

// Reset password submission
router.post('/reset-password/:token', validatePasswordChange, checkValidation, async (req, res) => {
  try {
    const user = await User.findOne({
      passwordResetToken: req.params.token,
      passwordResetExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      req.session.message = 'Password reset token is invalid or has expired.';
      req.session.messageType = 'error';
      return res.redirect('/auth/forgot-password');
    }
    
    // Update password
    user.password = req.body.newPassword;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();
    
    req.session.message = 'Password has been reset successfully. Please login.';
    req.session.messageType = 'success';
    res.redirect('/auth/login');
  } catch (error) {
    console.error('Reset password error:', error);
    req.session.message = 'An error occurred. Please try again.';
    req.session.messageType = 'error';
    res.redirect('/auth/forgot-password');
  }
});

// Update profile
router.post('/update-profile', validateProfileUpdate, checkValidation, async (req, res) => {
  try {
    const { fullName, locationAddress, youtubeChannel, youtubeChannelName } = req.body;
    
    const user = await User.findById(req.session.user._id);
    
    if (!user) {
      req.session.message = 'User not found';
      req.session.messageType = 'error';
      return res.redirect('/account');
    }
    
    // Update fields
    if (fullName !== undefined) user.fullName = fullName;
    if (locationAddress !== undefined) user.locationAddress = locationAddress;
    if (youtubeChannel !== undefined) user.youtubeChannel = youtubeChannel;
    if (youtubeChannelName !== undefined) user.youtubeChannelName = youtubeChannelName;
    
    await user.save();
    
    // Update session
    req.session.user.username = user.username;
    
    req.session.message = 'Profile updated successfully!';
    req.session.messageType = 'success';
    res.redirect('/account');
  } catch (error) {
    console.error('Update profile error:', error);
    req.session.message = 'An error occurred. Please try again.';
    req.session.messageType = 'error';
    res.redirect('/account');
  }
});

// Change password
router.post('/change-password', validatePasswordChange, checkValidation, async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id);
    
    if (!user) {
      req.session.message = 'User not found';
      req.session.messageType = 'error';
      return res.redirect('/account');
    }
    
    user.password = req.body.newPassword;
    await user.save();
    
    req.session.message = 'Password changed successfully!';
    req.session.messageType = 'success';
    res.redirect('/account');
  } catch (error) {
    console.error('Change password error:', error);
    req.session.message = 'An error occurred. Please try again.';
    req.session.messageType = 'error';
    res.redirect('/account');
  }
});

module.exports = router;
