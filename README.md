# SUB4SUB v2.0 - Node.js Edition

**YouTube Channel Growth Platform** - Fully rewritten in Node.js with MongoDB

[![Node.js](https://img.shields.io/badge/Node.js-16+-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-5.0+-green.svg)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Express-4.x-blue.svg)](https://expressjs.com/)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)]()

---

## 📖 Overview

SUB4SUB is a platform that helps YouTube creators grow their channels by exchanging subscriptions with other creators. This is a **complete rewrite** from PHP/MySQL to **Node.js/MongoDB** with modern architecture and best practices.

### What's New in v2.0?

✅ **Complete Node.js Migration** - Modern JavaScript (ES6+)  
✅ **MongoDB Database** - NoSQL flexibility and scalability  
✅ **Express.js Framework** - Fast, minimalist web framework  
✅ **EJS Templating** - Clean, organized views  
✅ **Enhanced Security** - Helmet.js, rate limiting, CSRF protection  
✅ **RESTful API** - JSON endpoints for future mobile apps  
✅ **Session Management** - MongoDB-backed sessions  
✅ **Email Service** - Nodemailer integration (optional)  
✅ **Payment Ready** - Stripe/PayPal integration support  
✅ **Modern UI** - Bootstrap 5 responsive design  

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up MongoDB

Make sure MongoDB is installed and running:

```bash
# Check MongoDB status
mongosh --eval "db.version()"

# If not running, start it:
# Windows: net start MongoDB
# Linux/Mac: sudo systemctl start mongod
```

**Don't have MongoDB?** Download [MongoDB Compass](https://www.mongodb.com/try/download/compass) (easiest option)

### 3. Configure Environment

```bash
# Copy example environment file
cp .env.example .env
```

Edit `.env` with your settings (minimal required):
```env
MONGODB_URI=mongodb://localhost:27017/sub4sub
SESSION_SECRET=your-random-secret-key-here
```

### 4. Initialize Database

```bash
npm run migrate
```

This creates:
- Admin user (admin@sub4sub.com / admin123)
- Database collections
- Default content pages

### 5. Generate View Templates

```bash
node scripts/generate-views.js
```

### 6. Start the Server

```bash
# Development mode (auto-reload)
npm run dev

# OR Production mode
npm start
```

Visit: **http://localhost:3000**

---

## 📋 Full Documentation

- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Detailed installation and configuration
- **[package.json](package.json)** - Dependencies and scripts

---

## 🎯 Features

### For Users
- ✅ Register and login securely
- ✅ Browse YouTube channels to subscribe to
- ✅ Verify subscriptions
- ✅ Track subscription history
- ✅ View analytics and statistics
- ✅ Upgrade to premium accounts
- ✅ Receive notifications

### For Admins
- ✅ Comprehensive dashboard
- ✅ User management (ban/unban, premium toggle)
- ✅ Subscription verification
- ✅ Payment history
- ✅ Content page management
- ✅ System settings

### Technical Features
- ✅ RESTful API with rate limiting
- ✅ MongoDB with Mongoose ODM
- ✅ Session-based authentication
- ✅ Password hashing with bcrypt
- ✅ Email notifications (optional)
- ✅ File upload support
- ✅ Input validation
- ✅ CSRF protection
- ✅ Secure headers (Helmet.js)
- ✅ Error handling
- ✅ Logging

---

## 🛠 Tech Stack

| Category | Technology |
|----------|-----------|
| **Runtime** | Node.js 16+ |
| **Framework** | Express.js 4.x |
| **Database** | MongoDB 5.0+ |
| **ODM** | Mongoose 8.x |
| **Templating** | EJS |
| **Authentication** | bcryptjs, express-session |
| **Email** | Nodemailer |
| **Security** | Helmet.js, express-rate-limit |
| **Validation** | express-validator |
| **File Upload** | Multer |
| **UI Framework** | Bootstrap 5 |
| **Icons** | Font Awesome 6 |

---

## 📁 Project Structure

```
Sub4Sub/
├── assets/              # Static files (CSS, JS)
├── config/              # Configuration
│   └── config.js
├── middleware/          # Express middleware
│   ├── auth.js          # Authentication
│   ├── errorHandler.js  # Error handling
│   ├── upload.js        # File uploads
│   └── validation.js    # Input validation
├── models/              # Mongoose models
│   ├── User.js
│   ├── Subscription.js
│   ├── Payment.js
│   ├── Notification.js
│   └── Content.js
├── routes/              # Express routes
│   ├── main.js          # Public pages
│   ├── auth.js          # Authentication
│   ├── admin.js         # Admin panel
│   └── api.js           # REST API
├── scripts/             # Utility scripts
│   ├── migrate.js       # Database setup
│   ├── generate-views.js
│   └── cleanup-php-files.js
├── utils/               # Helpers
│   ├── emailService.js
│   └── helpers.js
├── views/               # EJS templates
│   ├── partials/
│   ├── auth/
│   ├── admin/
│   ├── errors/
│   └── *.ejs
├── uploads/             # User uploads
├── .env                 # Environment variables
├── .env.example         # Environment template
├── .gitignore          # Git ignore rules
├── package.json         # Dependencies
├── server.js            # Entry point
├── README.md            # This file
└── SETUP_GUIDE.md       # Detailed setup
```

---

## 🌐 URLs

### Public Pages
- **Home**: `/`
- **Login**: `/auth/login`
- **Register**: `/auth/register`
- **About**: `/about`
- **FAQ**: `/faq`
- **Contact**: `/contact`
- **Privacy**: `/privacy`
- **Terms**: `/tos`

### User Pages (Requires Login)
- **Dashboard**: `/account`
- **Exchange**: `/exchange`
- **Analytics**: `/analytics`
- **Notifications**: `/notification`
- **Purchase Premium**: `/purchase`

### Admin Panel (Requires Admin)
- **Dashboard**: `/admin/dashboard`
- **Users**: `/admin/users`
- **Verify Subscriptions**: `/admin/verify-users`
- **Payments**: `/admin/payments`
- **Content Management**: `/admin/content-management`
- **Settings**: `/admin/settings`

### API Endpoints
- **API Info**: `/api/`
- **User Data**: `/api/user`
- **Users List**: `/api/users`
- **Subscriptions**: `/api/subscriptions`
- **Notifications**: `/api/notifications`
- **Statistics**: `/api/stats`

---

## 📦 NPM Scripts

```bash
# Install dependencies
npm install

# Run database migration
npm run migrate

# Start production server
npm start

# Start development server (auto-reload)
npm run dev

# Generate view templates
node scripts/generate-views.js

# Clean up old PHP files (already done)
node scripts/cleanup-php-files.js
```

---

## 🔐 Default Credentials

**Admin Account:**
- Email: `admin@sub4sub.com`
- Password: `admin123`

⚠️ **IMPORTANT**: Change the admin password immediately after first login!

---

## 🐛 Troubleshooting

### MongoDB Connection Error

```
✗ MongoDB connection error: connect ECONNREFUSED
```

**Solution:**
1. Make sure MongoDB is installed
2. Start MongoDB service:
   - Windows: `net start MongoDB` (as Administrator)
   - Linux/Mac: `sudo systemctl start mongod`
3. Verify: `mongosh --eval "db.version()"`

### Port Already in Use

```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution:**
1. Change port in `.env`: `PORT=3001`
2. Or kill process on port 3000

### Views Not Found

```
Error: Failed to lookup view
```

**Solution:**
```bash
node scripts/generate-views.js
```

### Admin Can't Login

**Solution:**
```bash
npm run migrate
```

This recreates the admin user.

---

## 🚀 Deployment

### Option 1: Railway.app (Recommended)

1. Sign up at [Railway.app](https://railway.app/)
2. Connect your GitHub repository
3. Add MongoDB plugin
4. Set environment variables
5. Deploy automatically!

### Option 2: Heroku

```bash
heroku create your-app-name
heroku addons:create mongolab:sandbox
heroku config:set NODE_ENV=production
git push heroku main
```

### Option 3: VPS (DigitalOcean, Linode, etc.)

```bash
# Install Node.js and MongoDB
# Clone repository
git clone your-repo-url
cd Sub4Sub

# Install dependencies
npm install

# Configure environment
cp .env.example .env
nano .env

# Run migration
npm run migrate

# Use PM2 for process management
npm install -g pm2
pm2 start server.js --name sub4sub
pm2 startup
pm2 save
```

---

## 📧 Email Configuration (Optional)

Email functionality is **optional**. The app works fine without it!

To enable emails (e.g., welcome emails, password resets):

1. For Gmail, create an [App Password](https://myaccount.google.com/apppasswords)
2. Add to `.env`:
   ```env
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-16-char-app-password
   ```

---

## 💳 Payment Configuration (Optional)

Payment gateways are **optional**. The app includes a demo mode for testing!

### Stripe
```env
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_key
```

### PayPal
```env
PAYPAL_CLIENT_ID=your_client_id
PAYPAL_CLIENT_SECRET=your_secret
PAYPAL_MODE=sandbox
```

---

## 🔒 Security Best Practices

1. ✅ Change `SESSION_SECRET` to a long random string
2. ✅ Change admin password after first login
3. ✅ Set `NODE_ENV=production` in production
4. ✅ Use HTTPS in production
5. ✅ Keep dependencies updated
6. ✅ Use strong passwords
7. ✅ Enable MongoDB authentication
8. ✅ Set up firewall rules

---

## 🆚 PHP vs Node.js Comparison

| Aspect | Old (PHP) | New (Node.js) |
|--------|-----------|---------------|
| **Language** | PHP 7+ | JavaScript (ES6+) |
| **Framework** | Plain PHP | Express.js |
| **Database** | MySQL | MongoDB |
| **ORM** | PDO | Mongoose |
| **Templating** | PHP includes | EJS |
| **Sessions** | File-based | MongoDB-backed |
| **Performance** | Good | Excellent |
| **Scalability** | Limited | High |
| **Real-time** | No | Ready for Socket.io |
| **API** | Basic | RESTful + Rate limiting |
| **Modern Features** | No | Yes |

---

## 📞 Support

For issues or questions:

1. Check [SETUP_GUIDE.md](SETUP_GUIDE.md)
2. Review error messages in console
3. Verify MongoDB is running
4. Check `.env` configuration
5. Ensure all dependencies are installed

---

## 📄 License

This project is proprietary and private.

---

## 🎉 What's Been Migrated

✅ **All Features** from PHP version  
✅ **User Authentication** (Login/Register)  
✅ **Subscription Exchange System**  
✅ **Admin Panel** (Complete)  
✅ **Payment Integration** (Stripe/PayPal ready)  
✅ **Email Service** (Optional)  
✅ **Content Pages** (About, FAQ, Privacy, TOS, Contact)  
✅ **Analytics & Statistics**  
✅ **Notifications System**  
✅ **RESTful API** (New!)  
✅ **Modern Security** (Improved!)  
✅ **Responsive Design** (Enhanced!)  

---

## 🚀 Next Steps

After installation:

1. ✅ Install dependencies: `npm install`
2. ✅ Configure `.env` file
3. ✅ Start MongoDB
4. ✅ Run migration: `npm run migrate`
5. ✅ Generate views: `node scripts/generate-views.js`
6. ✅ Start server: `npm run dev`
7. 🔄 Visit http://localhost:3000
8. 🔄 Login as admin
9. 🔄 Change admin password
10. 🔄 Customize content pages
11. 🔄 Test all features
12. 🔄 Deploy to production

---

**Built with ❤️ using Node.js, Express.js, MongoDB, and modern web technologies**

*Successfully migrated from PHP/MySQL to Node.js/MongoDB - January 2026*
