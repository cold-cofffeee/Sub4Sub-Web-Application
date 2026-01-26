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
  },
  
  // ===== ENGAGEMENT CREDITS SYSTEM =====
  credits: {
    // Starting credits for new users
    signupBonus: parseInt(process.env.SIGNUP_BONUS_CREDITS) || 100,
    
    // Daily earning limits
    dailyLimitFree: parseInt(process.env.DAILY_LIMIT_FREE) || 50,
    dailyLimitPremium: parseInt(process.env.DAILY_LIMIT_PREMIUM) || 500,
    
    // Credit costs for actions
    costs: {
      subscription: parseInt(process.env.COST_SUBSCRIPTION) || 10,
      like: parseInt(process.env.COST_LIKE) || 2,
      comment: parseInt(process.env.COST_COMMENT) || 5,
      watchMinute: parseInt(process.env.COST_WATCH_MINUTE) || 1,
      shortView: parseInt(process.env.COST_SHORT_VIEW) || 3
    },
    
    // Credit earnings for providing actions
    earnings: {
      subscription: parseInt(process.env.EARN_SUBSCRIPTION) || 10,
      like: parseInt(process.env.EARN_LIKE) || 2,
      comment: parseInt(process.env.EARN_COMMENT) || 5,
      watchMinute: parseInt(process.env.EARN_WATCH_MINUTE) || 1,
      shortView: parseInt(process.env.EARN_SHORT_VIEW) || 3
    },
    
    // Premium multipliers
    premiumMultipliers: {
      basic: parseFloat(process.env.PREMIUM_MULT_BASIC) || 1.5,
      pro: parseFloat(process.env.PREMIUM_MULT_PRO) || 2.0,
      elite: parseFloat(process.env.PREMIUM_MULT_ELITE) || 3.0
    },
    
    // Referral rewards
    referral: {
      signup: parseInt(process.env.REFERRAL_SIGNUP) || 50,
      firstPurchase: parseInt(process.env.REFERRAL_FIRST_PURCHASE) || 200
    }
  },
  
  // ===== WATCH TIME SYSTEM =====
  watchTime: {
    minWatchMinutes: parseInt(process.env.MIN_WATCH_MINUTES) || 2,
    maxWatchMinutes: parseInt(process.env.MAX_WATCH_MINUTES) || 60,
    maxParticipantsPerRoom: parseInt(process.env.MAX_ROOM_PARTICIPANTS) || 50,
    verificationInterval: parseInt(process.env.WATCH_VERIFICATION_INTERVAL) || 30, // seconds
    roomExpiryHours: parseInt(process.env.ROOM_EXPIRY_HOURS) || 24
  },
  
  // ===== QUALITY SCORE =====
  quality: {
    minScoreForMatching: parseInt(process.env.MIN_QUALITY_SCORE) || 20,
    tierDifferenceLimit: parseInt(process.env.QUALITY_TIER_DIFF) || 2, // Max tier difference for matching
    updateInterval: parseInt(process.env.QUALITY_UPDATE_INTERVAL) || 86400000 // 24 hours
  },
  
  // ===== MATCHING SYSTEM =====
  matching: {
    maxMatches: parseInt(process.env.MAX_MATCHES) || 20,
    similarCategoryBonus: parseFloat(process.env.SIMILAR_CATEGORY_BONUS) || 1.2,
    sameSizeRangeBonus: parseFloat(process.env.SAME_SIZE_BONUS) || 1.1,
    premiumPriorityBoost: parseFloat(process.env.PREMIUM_PRIORITY) || 2.0
  }
};
