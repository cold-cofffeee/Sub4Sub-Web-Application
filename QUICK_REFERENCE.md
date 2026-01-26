# 🚀 SUB4SUB v2.0 - Quick Reference

## Installation (First Time Only)

```bash
# 1. Install dependencies
npm install

# 2. Create environment file
cp .env.example .env

# 3. Initialize database
npm run migrate

# 4. Generate view templates
node scripts/generate-views.js

# 5. Start server
npm run dev
```

**OR use quick start script:**
```bash
# Windows
start.bat

# Linux/Mac
./start.sh
```

---

## Daily Commands

```bash
# Start development server (auto-reload)
npm run dev

# Start production server
npm start

# Run database migration (if needed)
npm run migrate
```

---

## Default Credentials

**Admin Account:**
- Email: `admin@sub4sub.com`
- Password: `admin123`

⚠️ Change after first login!

---

## URLs

- **Home**: http://localhost:3000
- **Login**: http://localhost:3000/auth/login
- **Admin**: http://localhost:3000/admin/dashboard
- **API**: http://localhost:3000/api/

---

## MongoDB Commands

```bash
# Check if MongoDB is running
mongosh --eval "db.version()"

# Start MongoDB (Windows)
net start MongoDB

# Start MongoDB (Linux/Mac)
sudo systemctl start mongod

# Open MongoDB Compass
# Connect to: mongodb://localhost:27017
```

---

## Common Issues

### MongoDB Not Running
```bash
net start MongoDB  # Windows
sudo systemctl start mongod  # Linux/Mac
```

### Port In Use
Edit `.env` and change:
```env
PORT=3001
```

### Views Not Found
```bash
node scripts/generate-views.js
```

### Admin Can't Login
```bash
npm run migrate
```

---

## Project Structure

```
Sub4Sub/
├── server.js        # Main entry point
├── package.json     # Dependencies
├── .env            # Configuration
├── config/         # App config
├── middleware/     # Auth, validation
├── models/         # MongoDB models
├── routes/         # Express routes
├── views/          # EJS templates
├── scripts/        # Utility scripts
└── assets/         # CSS, JS, images
```

---

## Environment Variables

**Minimal .env:**
```env
MONGODB_URI=mongodb://localhost:27017/sub4sub
SESSION_SECRET=your-random-secret-here
PORT=3000
```

**Optional (Email):**
```env
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

**Optional (Payments):**
```env
STRIPE_SECRET_KEY=sk_test_xxx
PAYPAL_CLIENT_ID=xxx
```

---

## API Endpoints

```http
GET  /api/                    # API info
GET  /api/user                # Current user (auth required)
GET  /api/users               # Users list (auth required)
GET  /api/subscriptions       # User subscriptions (auth required)
POST /api/subscriptions       # Create subscription (auth required)
GET  /api/notifications       # User notifications (auth required)
GET  /api/stats               # Platform statistics
```

---

## Useful Tips

✅ **Use development mode** during development:
```bash
npm run dev
```

✅ **Email is optional** - app works without it

✅ **Payments are optional** - demo mode included

✅ **Check console** for error messages

✅ **MongoDB Compass** is easier than command line

---

## File Locations

| What | Where |
|------|-------|
| **Environment config** | `.env` |
| **Server entry** | `server.js` |
| **Routes** | `routes/*.js` |
| **Models** | `models/*.js` |
| **Views** | `views/*.ejs` |
| **Static files** | `assets/` |
| **Uploads** | `uploads/` |
| **Logs** | Console |

---

## Getting Help

1. Check [SETUP_GUIDE.md](SETUP_GUIDE.md)
2. Check [README.md](README.md)
3. Check [MIGRATION_COMPLETE.md](MIGRATION_COMPLETE.md)
4. Check console error messages
5. Verify MongoDB is running
6. Verify `.env` is configured

---

## Deployment Checklist

Before deploying to production:

- [ ] Set `NODE_ENV=production` in `.env`
- [ ] Change `SESSION_SECRET` to random string
- [ ] Change admin password
- [ ] Set up MongoDB Atlas or production database
- [ ] Configure email (optional)
- [ ] Configure payments (optional)
- [ ] Enable HTTPS
- [ ] Set up process manager (PM2)
- [ ] Configure firewall
- [ ] Set up monitoring

---

**That's it! Keep this for quick reference. 📋**
