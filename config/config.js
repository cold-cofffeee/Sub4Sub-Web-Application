/**
 * Application Configuration
 * Centralized configuration management
 */

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  
  app: {
    name: process.env.APP_NAME || 'SUB4SUB',
    version: '2.0.0',
    url: process.env.APP_URL || 'http://localhost:3000'
  },
  
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/sub4sub'
  },
  
  session: {
    secret: process.env.SESSION_SECRET || 'your-super-secret-key-change-in-production',
    maxAge: parseInt(process.env.SESSION_MAX_AGE) || 86400000 // 24 hours
  },
  
  admin: {
    username: process.env.ADMIN_USERNAME || 'admin',
    password: process.env.ADMIN_PASSWORD || 'admin123',
    email: process.env.ADMIN_EMAIL || 'admin@sub4sub.com'
  },
  
  email: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    fromEmail: process.env.SMTP_FROM_EMAIL || 'noreply@sub4sub.com',
    fromName: process.env.SMTP_FROM_NAME || 'SUB4SUB'
  },
  
  payment: {
    stripe: {
      secretKey: process.env.STRIPE_SECRET_KEY || '',
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || ''
    },
    paypal: {
      clientId: process.env.PAYPAL_CLIENT_ID || '',
      clientSecret: process.env.PAYPAL_CLIENT_SECRET || '',
      mode: process.env.PAYPAL_MODE || 'sandbox'
    }
  },
  
  security: {
    maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5,
    lockoutTime: parseInt(process.env.LOCKOUT_TIME) || 900000, // 15 minutes
    passwordMinLength: parseInt(process.env.PASSWORD_MIN_LENGTH) || 8,
    csrfTokenExpiry: parseInt(process.env.CSRF_TOKEN_EXPIRY) || 3600000 // 1 hour
  },
  
  upload: {
    maxSize: parseInt(process.env.MAX_UPLOAD_SIZE) || 5242880, // 5MB
    allowedExtensions: (process.env.ALLOWED_EXTENSIONS || 'jpg,jpeg,png,gif').split(','),
    path: process.env.UPLOAD_PATH || './uploads'
  },
  
  api: {
    rateLimit: parseInt(process.env.API_RATE_LIMIT) || 100
  }
};
