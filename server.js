/**
 * SUB4SUB v2.0 - Node.js Server
 * Main application entry point
 */

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');
const methodOverride = require('method-override');

// Import configurations and middleware
const config = require('./config/config');
const { notFound, errorHandler } = require('./middleware/errorHandler');

// Import routes
const mainRoutes = require('./routes/main');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const apiRoutes = require('./routes/api');

// Initialize Express app
const app = express();

// Connect to MongoDB
mongoose.connect(config.mongodb.uri)
  .then(() => console.log('✓ MongoDB connected successfully'))
  .catch(err => {
    console.error('✗ MongoDB connection error:', err);
    process.exit(1);
  });

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for now to allow inline scripts
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Method override for PUT/DELETE in forms
app.use(methodOverride('_method'));

// Static files
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Logging
if (config.env === 'development') {
  app.use(morgan('dev'));
}

// Session configuration
app.use(session({
  secret: config.session.secret,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: config.mongodb.uri,
    touchAfter: 24 * 3600 // Lazy session update
  }),
  cookie: {
    maxAge: config.session.maxAge,
    httpOnly: true,
    secure: config.env === 'production', // HTTPS only in production
    sameSite: 'strict'
  }
}));

// Make session data available to all views
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.isLoggedIn = !!req.session.user;
  res.locals.isAdmin = req.session.isAdmin || false;
  res.locals.message = req.session.message || null;
  res.locals.messageType = req.session.messageType || null;
  res.locals.appName = config.app.name;
  res.locals.appUrl = config.app.url;
  
  // Clear session message after displaying
  delete req.session.message;
  delete req.session.messageType;
  
  next();
});

// Routes
app.use('/', mainRoutes);
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/api', apiRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   SUB4SUB v${config.app.version} - Node.js Server      ║
╠════════════════════════════════════════╣
║   Environment: ${config.env.padEnd(22)} ║
║   Port: ${PORT.toString().padEnd(30)} ║
║   MongoDB: Connected                   ║
║   URL: ${config.app.url.padEnd(29)} ║
╚════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  mongoose.connection.close();
  process.exit(0);
});
