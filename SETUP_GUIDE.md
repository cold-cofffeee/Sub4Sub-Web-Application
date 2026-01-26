# SUB4SUB v2.0 - Node.js Setup Guide

## 🚀 Quick Start (5 Minutes)

### Step 1: Install Node.js Dependencies

```bash
npm install
```

### Step 2: Set Up MongoDB

**Option A: MongoDB Compass (Recommended for Beginners)**
1. Download and install [MongoDB Compass](https://www.mongodb.com/try/download/compass)
2. Open Compass and connect to: `mongodb://localhost:27017`
3. MongoDB will start automatically

**Option B: MongoDB Community Server**
1. Download [MongoDB Community](https://www.mongodb.com/try/download/community)
2. Install and start the service:
   ```bash
   # Windows (as Administrator)
   net start MongoDB
   
   # Check if running
   mongosh --eval "db.version()"
   ```

### Step 3: Configure Environment

```bash
# Create .env file from template
cp .env.example .env
```

**Minimal .env configuration:**
```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/sub4sub
SESSION_SECRET=change-this-to-a-random-string
ADMIN_PASSWORD=admin123
```

### Step 4: Initialize Database

```bash
npm run migrate
```

This creates:
- ✓ Admin user (admin/admin123)
- ✓ Database collections
- ✓ Default content pages
- ✓ Upload directories

### Step 5: Generate View Templates

```bash
node scripts/generate-views.js
```

### Step 6: Start the Server

```bash
# Development mode (auto-restart on changes)
npm run dev

# OR Production mode
npm start
```

### Step 7: Access Your Application

- **Website**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin/dashboard
- **Admin Login**: admin@sub4sub.com / admin123

---

## 📋 Complete Installation Steps

### Prerequisites

- Node.js 16+ ([Download](https://nodejs.org/))
- MongoDB 5.0+ ([Download](https://www.mongodb.com/try/download/community))
- npm 8+ (comes with Node.js)

### Detailed Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```
   
   Installs:
   - Express.js (web framework)
   - Mongoose (MongoDB ODM)
   - EJS (templating)
   - bcryptjs (password hashing)
   - And 15+ other packages

2. **Configure Environment**
   
   Copy `.env.example` to `.env` and customize:
   
   **Required:**
   ```env
   MONGODB_URI=mongodb://localhost:27017/sub4sub
   SESSION_SECRET=your-secret-key-here
   ```
   
   **Optional (Email):**
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   ```
   
   **Optional (Payments):**
   ```env
   STRIPE_SECRET_KEY=sk_test_xxx
   PAYPAL_CLIENT_ID=xxx
   ```

3. **Set Up MongoDB**
   
   Verify MongoDB is running:
   ```bash
   mongosh --eval "db.version()"
   ```
   
   If you see a version number, MongoDB is ready!

4. **Run Migration**
   ```bash
   npm run migrate
   ```
   
   Creates admin user and initial data.

5. **Generate Views**
   ```bash
   node scripts/generate-views.js
   ```
   
   Creates all EJS template files.

6. **Start Server**
   ```bash
   npm run dev
   ```

---

## 🔧 Available NPM Scripts

```bash
# Start production server
npm start

# Start development server (auto-reload)
npm run dev

# Run database migration
npm run migrate

# Generate view templates
node scripts/generate-views.js
```

---

## 📁 Project Structure

```
Sub4Sub/
├── config/              # Configuration files
├── middleware/          # Express middleware
├── models/              # MongoDB models (Mongoose)
├── routes/              # Express routes
├── scripts/             # Utility scripts
├── utils/               # Helper functions
├── views/               # EJS templates
├── assets/              # Static files (CSS/JS)
├── uploads/             # User uploads
├── server.js            # Main entry point
├── package.json         # Dependencies
└── .env                 # Environment variables
```

---

## 🌐 URLs and Endpoints

### Web Pages
- Home: http://localhost:3000/
- Login: http://localhost:3000/auth/login
- Register: http://localhost:3000/auth/register
- Exchange: http://localhost:3000/exchange
- Account: http://localhost:3000/account
- Admin: http://localhost:3000/admin/dashboard

### API Endpoints
- API Root: http://localhost:3000/api/
- Get Users: http://localhost:3000/api/users
- Subscriptions: http://localhost:3000/api/subscriptions
- Stats: http://localhost:3000/api/stats

---

## 🐛 Common Issues

### Issue: MongoDB Connection Failed

**Error**: `MongoServerError: connect ECONNREFUSED`

**Solution**:
```bash
# Start MongoDB service
# Windows (as Administrator):
net start MongoDB

# Linux/Mac:
sudo systemctl start mongod

# Verify it's running:
mongosh --eval "db.version()"
```

### Issue: Port 3000 Already in Use

**Solution 1**: Change port in `.env`
```env
PORT=3001
```

**Solution 2**: Kill process on port 3000
```bash
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac:
lsof -i :3000
kill -9 <PID>
```

### Issue: Admin Can't Login

**Solution**: Re-run migration
```bash
npm run migrate
```

Default admin credentials:
- Email: admin@sub4sub.com
- Password: admin123

### Issue: Views Not Found

**Solution**: Generate view templates
```bash
node scripts/generate-views.js
```

### Issue: Email Not Sending

**Note**: Email is optional! The app works without it.

To enable email:
1. Get Gmail App Password: https://myaccount.google.com/apppasswords
2. Add to `.env`:
   ```env
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-16-char-app-password
   ```

---

## 🔐 Security Notes

1. **Change Admin Password** immediately after first login
2. **Change SESSION_SECRET** in `.env` to a random string
3. **Use strong passwords** for production
4. **Enable HTTPS** in production
5. **Set NODE_ENV=production** in production

---

## 🚀 Deployment

### Deploy to Railway.app (Easiest)

1. Sign up at [Railway.app](https://railway.app/)
2. Click "New Project" → "Deploy from GitHub"
3. Select your repository
4. Add MongoDB database
5. Set environment variables
6. Deploy!

### Deploy to Heroku

```bash
# Install Heroku CLI
heroku login
heroku create your-app-name

# Add MongoDB
heroku addons:create mongolab:sandbox

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set SESSION_SECRET=your-secret

# Deploy
git push heroku main
```

### Deploy to VPS (DigitalOcean, Linode, etc.)

```bash
# SSH into your server
ssh root@your-server-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
# (Follow MongoDB installation guide for your OS)

# Clone your repository
git clone your-repo-url
cd Sub4Sub

# Install dependencies
npm install

# Set up environment
cp .env.example .env
nano .env  # Edit with your settings

# Run migration
npm run migrate

# Install PM2 (process manager)
npm install -g pm2

# Start application
pm2 start server.js --name sub4sub
pm2 startup
pm2 save

# Set up Nginx reverse proxy (optional but recommended)
```

---

## 📊 Monitoring

### Using PM2 (Process Manager)

```bash
# View logs
pm2 logs sub4sub

# View status
pm2 status

# Restart
pm2 restart sub4sub

# Stop
pm2 stop sub4sub

# Monitor in real-time
pm2 monit
```

---

## 🎯 Next Steps

1. ✅ Install dependencies
2. ✅ Configure MongoDB
3. ✅ Set up `.env` file
4. ✅ Run migration
5. ✅ Generate views
6. ✅ Start server
7. 🔄 Test login/register
8. 🔄 Test subscription exchange
9. 🔄 Access admin panel
10. 🔄 Customize content pages

---

## 📧 Configuration Examples

### Gmail SMTP
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Outlook SMTP
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

### SendGrid
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

---

## 📝 Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| NODE_ENV | No | development | Environment mode |
| PORT | No | 3000 | Server port |
| APP_NAME | No | SUB4SUB | Application name |
| APP_URL | No | http://localhost:3000 | Base URL |
| MONGODB_URI | Yes | mongodb://localhost:27017/sub4sub | MongoDB connection |
| SESSION_SECRET | Yes | - | Session encryption key |
| ADMIN_USERNAME | No | admin | Admin username |
| ADMIN_PASSWORD | No | admin123 | Admin password |
| ADMIN_EMAIL | No | admin@sub4sub.com | Admin email |
| SMTP_HOST | No | - | Email server host |
| SMTP_PORT | No | 587 | Email server port |
| SMTP_USER | No | - | Email username |
| SMTP_PASS | No | - | Email password |

---

**Good luck with your Node.js SUB4SUB application! 🎉**
