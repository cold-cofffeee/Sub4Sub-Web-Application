# SUB4SUB v2.0 - Complete Setup Guide

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js 16+ (JavaScript ES6+)
- **Framework**: Express.js 4.x (Fast, minimalist web framework)
- **Database**: MongoDB 5.0+ (NoSQL document database)
- **ODM**: Mongoose 8.x (MongoDB object modeling)
- **Session Store**: connect-mongo (MongoDB-backed sessions)

### Frontend
- **Templating**: EJS (Embedded JavaScript templates)
- **UI Framework**: Bootstrap 5.3.0 (Responsive design)
- **Icons**: Font Awesome 6.4.0
- **Rich Text Editor**: Quill.js 1.3.6 (Free, no API key)
- **Fonts**: Google Fonts (Inter, Poppins)

### Security & Validation
- **Authentication**: bcryptjs (Password hashing)
- **Security**: Helmet.js (HTTP headers)
- **Rate Limiting**: express-rate-limit
- **Validation**: express-validator
- **CSRF**: csurf (Cross-site request forgery protection)

### Utilities
- **Email**: Nodemailer (SMTP email service)
- **File Upload**: Multer (Multipart/form-data)
- **Environment**: dotenv (Environment variables)
- **Logging**: Morgan (HTTP request logger)

---

## 📋 System Requirements

### Minimum Requirements
- **OS**: Windows 10, macOS 10.15+, Linux (Ubuntu 20.04+)
- **Node.js**: 16.x or higher
- **MongoDB**: 5.0 or higher
- **RAM**: 2GB minimum, 4GB recommended
- **Disk**: 500MB free space

### Recommended Development Setup
- **Code Editor**: VS Code with Node.js extensions
- **MongoDB Tool**: MongoDB Compass (GUI)
- **Terminal**: PowerShell (Windows), Terminal (macOS/Linux)
- **Browser**: Chrome/Firefox (latest version)

---

## 🚀 Installation Steps

### Step 1: Install Node.js

**Windows:**
1. Download from [nodejs.org](https://nodejs.org/)
2. Run installer (LTS version recommended)
3. Verify installation:
```powershell
node --version
npm --version
```

**macOS:**
```bash
# Using Homebrew
brew install node

# Verify
node --version
npm --version
```

**Linux (Ubuntu/Debian):**
```bash
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version
npm --version
```

### Step 2: Install MongoDB

**Option A: MongoDB Compass (Easiest)**
1. Download [MongoDB Compass](https://www.mongodb.com/try/download/compass)
2. Install and launch
3. Connect to: `mongodb://localhost:27017`
4. MongoDB server starts automatically with Compass

**Option B: MongoDB Community Server**

**Windows:**
1. Download [MongoDB Community](https://www.mongodb.com/try/download/community)
2. Run installer, choose "Complete" installation
3. Install as Windows Service (check the box)
4. Start MongoDB:
```powershell
# As Administrator
net start MongoDB

# Verify
mongosh --eval "db.version()"
```

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community@5.0
brew services start mongodb-community@5.0

# Verify
mongosh --eval "db.version()"
```

**Linux:**
```bash
# Import MongoDB public GPG Key
wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add -

# Create list file
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list

# Install
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start service
sudo systemctl start mongod
sudo systemctl enable mongod

# Verify
mongosh --eval "db.version()"
```

### Step 3: Clone/Download Project

```bash
# If using Git
git clone <your-repo-url>
cd Sub4Sub

# OR download ZIP and extract
cd Sub4Sub
```

### Step 4: Install Dependencies

```bash
npm install
```

**What gets installed:**
- Express.js and middleware
- MongoDB drivers and Mongoose
- Security packages (Helmet, bcrypt, etc.)
- Email service (Nodemailer)
- View engine (EJS)
- ~50 packages total

### Step 5: Environment Configuration

```bash
# Create environment file
cp .env.example .env

# Windows (if cp doesn't work)
copy .env.example .env
```

**Edit `.env` file:**

**Minimal Configuration (Required):**
```env
# Server
NODE_ENV=development
PORT=3000

# Database
MONGODB_URI=mongodb://localhost:27017/sub4sub

# Security
SESSION_SECRET=your-super-secret-random-string-change-this-in-production

# Admin Account
ADMIN_EMAIL=admin@sub4sub.com
ADMIN_PASSWORD=admin123
```

**Full Configuration (Optional):**
```env
# Server
NODE_ENV=development
PORT=3000
APP_NAME=SUB4SUB
APP_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/sub4sub

# Security
SESSION_SECRET=your-super-secret-random-string-change-this-in-production

# Admin Account
ADMIN_EMAIL=admin@sub4sub.com
ADMIN_PASSWORD=admin123

# Email (Optional - app works without it)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Payment Gateways (Optional - demo mode available)
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_key
PAYPAL_CLIENT_ID=your_client_id
PAYPAL_CLIENT_SECRET=your_secret
PAYPAL_MODE=sandbox

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_DIR=uploads
```

### Step 6: Initialize Database

```bash
npm run migrate
```

**What this does:**
- Creates MongoDB collections
- Creates admin user (admin@sub4sub.com / admin123)
- Seeds default content pages (About, FAQ, Privacy, TOS)
- Sets up indexes for performance

**Expected Output:**
```
✓ Connected to MongoDB
✓ Admin user created
✓ Content pages seeded
✓ Migration completed successfully
```

### Step 7: Generate Views (If Missing)

```bash
node scripts/generate-views.js
```

**What this creates:**
- 25 EJS view templates
- Partial templates (header, footer)
- Auth views (login, register)
- Admin panel views (7 pages)
- Error pages (404, 500)

### Step 8: Start the Server

**Development Mode (Auto-reload):**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

**Using Quick Start Scripts:**
```bash
# Windows
start.bat

# Linux/Mac
chmod +x start.sh
./start.sh
```

**Expected Output:**
```
✓ Connected to MongoDB: mongodb://localhost:27017/sub4sub
✓ Server running on http://localhost:3000
✓ Press Ctrl+C to stop
```

### Step 9: Access the Application

Open your browser and visit:

**Public Site:**
- Homepage: http://localhost:3000
- Login: http://localhost:3000/auth/login
- Register: http://localhost:3000/auth/register

**Admin Panel:**
- Login: http://localhost:3000/admin/dashboard
- Email: admin@sub4sub.com
- Password: admin123

---

## 📦 NPM Scripts Reference

```bash
# Development
npm run dev              # Start with nodemon (auto-reload)
npm run migrate          # Initialize/reset database
npm start                # Production mode

# Utilities
node scripts/generate-views.js     # Generate EJS templates
node scripts/cleanup-php-files.js  # Remove old PHP files (if any)

# Package Management
npm install              # Install dependencies
npm update               # Update packages
npm audit fix            # Fix security vulnerabilities
```

---

## 🔧 Configuration Details

### MongoDB Configuration

**Connection String Format:**
```
mongodb://[username:password@]host[:port]/database[?options]
```

**Examples:**
```env
# Local without auth
MONGODB_URI=mongodb://localhost:27017/sub4sub

# Local with auth
MONGODB_URI=mongodb://admin:password@localhost:27017/sub4sub

# MongoDB Atlas (Cloud)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sub4sub

# Replica Set
MONGODB_URI=mongodb://host1:27017,host2:27017/sub4sub?replicaSet=rs0
```

### Session Configuration

Sessions are stored in MongoDB for scalability:

```javascript
// In server.js
session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    ttl: 14 * 24 * 60 * 60 // 14 days
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 14, // 14 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  }
})
```

### Email Configuration

**Gmail Setup:**
1. Enable 2-Factor Authentication on your Google account
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Add to `.env`:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password
```

**Other SMTP Providers:**
```env
# SendGrid
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key

# Mailgun
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@your-domain.com
SMTP_PASS=your-mailgun-password

# Amazon SES
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password
```

---

## 🐛 Troubleshooting

### MongoDB Connection Failed

**Error:**
```
MongoNetworkError: connect ECONNREFUSED 127.0.0.1:27017
```

**Solutions:**

**Windows:**
```powershell
# Start MongoDB service (as Administrator)
net start MongoDB

# Check status
sc query MongoDB

# If not installed as service, start manually
"C:\Program Files\MongoDB\Server\5.0\bin\mongod.exe" --dbpath="C:\data\db"
```

**macOS:**
```bash
# Start MongoDB
brew services start mongodb-community

# Check if running
brew services list

# Check logs
tail -f /usr/local/var/log/mongodb/mongo.log
```

**Linux:**
```bash
# Start MongoDB
sudo systemctl start mongod

# Check status
sudo systemctl status mongod

# Enable auto-start
sudo systemctl enable mongod

# Check logs
sudo tail -f /var/log/mongodb/mongod.log
```

### Port Already in Use

**Error:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solutions:**

**Option 1: Change Port**
```env
# In .env file
PORT=3001
```

**Option 2: Kill Process**

**Windows:**
```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill process (replace PID with actual number)
taskkill /PID <PID> /F
```

**macOS/Linux:**
```bash
# Find and kill process
lsof -ti:3000 | xargs kill -9

# OR
sudo kill -9 $(sudo lsof -t -i:3000)
```

### Views Not Found

**Error:**
```
Error: Failed to lookup view "index" in views directory
```

**Solution:**
```bash
# Generate all view templates
node scripts/generate-views.js

# Verify views directory exists
ls -la views/
```

### Module Not Found

**Error:**
```
Error: Cannot find module 'express'
```

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# OR on Windows
rmdir /s node_modules
del package-lock.json
npm install
```

### Admin Can't Login

**Solution:**
```bash
# Reset admin user
npm run migrate

# Default credentials will be recreated:
# Email: admin@sub4sub.com
# Password: admin123
```

### Session Issues

**Error:**
```
Session store unavailable
```

**Solution:**
1. Ensure MongoDB is running
2. Check `MONGODB_URI` in `.env`
3. Restart the server
4. Clear browser cookies

---

## 🚀 Deployment

### Production Checklist

**Before Deployment:**
- [ ] Change `SESSION_SECRET` to strong random string
- [ ] Change admin password
- [ ] Set `NODE_ENV=production`
- [ ] Use production MongoDB (MongoDB Atlas)
- [ ] Enable MongoDB authentication
- [ ] Set up HTTPS/SSL
- [ ] Configure CORS properly
- [ ] Set up error logging service
- [ ] Configure backup strategy
- [ ] Test all features
- [ ] Optimize images and assets

### MongoDB Atlas Setup (Recommended for Production)

1. Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster
3. Whitelist IP addresses (0.0.0.0/0 for all, or specific IPs)
4. Create database user
5. Get connection string
6. Update `.env`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sub4sub?retryWrites=true&w=majority
```

### Heroku Deployment

```bash
# Login to Heroku
heroku login

# Create app
heroku create your-app-name

# Add MongoDB
heroku addons:create mongolab:sandbox

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set SESSION_SECRET=your-secret-here

# Deploy
git push heroku main

# Open app
heroku open
```

### Railway.app Deployment (Easiest)

1. Sign up at [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub"
3. Connect your repository
4. Add MongoDB plugin
5. Set environment variables
6. Deploy automatically

### VPS Deployment (DigitalOcean, Linode, AWS)

```bash
# SSH into server
ssh user@your-server-ip

# Install Node.js and MongoDB
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs mongodb

# Clone project
git clone your-repo-url
cd Sub4Sub

# Install dependencies
npm install --production

# Configure environment
nano .env

# Install PM2 (process manager)
npm install -g pm2

# Start application
pm2 start server.js --name sub4sub

# Set up PM2 to start on boot
pm2 startup
pm2 save

# Set up Nginx reverse proxy
sudo apt-get install nginx
sudo nano /etc/nginx/sites-available/sub4sub

# Nginx config:
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/sub4sub /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Set up SSL with Let's Encrypt
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## 🔒 Security Best Practices

### 1. Environment Variables
- Never commit `.env` to version control
- Use different secrets for dev/prod
- Rotate secrets periodically

### 2. MongoDB Security
```bash
# Enable authentication
mongosh admin
db.createUser({
  user: "admin",
  pwd: "strong-password",
  roles: ["root"]
})

# Update connection string
MONGODB_URI=mongodb://admin:strong-password@localhost:27017/sub4sub?authSource=admin
```

### 3. HTTPS in Production
- Always use SSL/TLS
- Set secure cookies:
```javascript
cookie: {
  secure: true,  // Only over HTTPS
  httpOnly: true, // No JavaScript access
  sameSite: 'strict'
}
```

### 4. Rate Limiting
Already configured in `server.js`:
```javascript
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // 100 requests per window
});
app.use('/api/', limiter);
```

### 5. Input Validation
All user inputs validated with `express-validator`:
```javascript
const { body, validationResult } = require('express-validator');
// See middleware/validation.js
```

---

## 📊 Performance Optimization

### 1. Database Indexing
```javascript
// Indexes created during migration
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ username: 1 }, { unique: true });
subscriptionSchema.index({ userId: 1, targetUserId: 1 });
```

### 2. Caching (Optional)
```bash
# Install Redis
npm install redis connect-redis

# Add to server.js
const redis = require('redis');
const redisClient = redis.createClient();
```

### 3. Compression
Already enabled in `server.js`:
```javascript
const compression = require('compression');
app.use(compression());
```

### 4. Static File Caching
```javascript
// In production
app.use(express.static('assets', {
  maxAge: '1y',
  etag: true
}));
```

---

## 📚 Additional Resources

### Documentation
- **Node.js**: https://nodejs.org/docs
- **Express.js**: https://expressjs.com
- **MongoDB**: https://docs.mongodb.com
- **Mongoose**: https://mongoosejs.com/docs
- **EJS**: https://ejs.co/#docs
- **Bootstrap 5**: https://getbootstrap.com/docs/5.3

### Tools
- **MongoDB Compass**: https://www.mongodb.com/products/compass
- **Postman** (API testing): https://www.postman.com
- **VS Code**: https://code.visualstudio.com

### Extensions (VS Code)
- Node.js Extension Pack
- MongoDB for VS Code
- EJS language support
- GitLens
- Prettier - Code formatter

---

**Setup Guide Version**: 2.0  
**Last Updated**: January 2026  
**Support**: Check README.md for troubleshooting  
**License**: Proprietary
