/**
 * Authentication Middleware
 * Protects routes and checks user permissions
 */

const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  
  req.session.message = 'You must be logged in to access this page';
  req.session.messageType = 'error';
  res.redirect('/auth/login');
};

const isAdmin = (req, res, next) => {
  if (req.session && req.session.isAdmin) {
    return next();
  }
  
  req.session.message = 'Access denied. Admin privileges required.';
  req.session.messageType = 'error';
  res.redirect('/');
};

const isGuest = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return next();
  }
  
  res.redirect('/account');
};

const checkBanned = async (req, res, next) => {
  if (req.session && req.session.user) {
    const User = require('../models/User');
    const user = await User.findById(req.session.user._id);
    
    if (user && user.isBanned) {
      req.session.destroy();
      return res.render('errors/banned', {
        pageTitle: 'Account Banned'
      });
    }
  }
  next();
};

module.exports = {
  isAuthenticated,
  isAdmin,
  isGuest,
  checkBanned
};
