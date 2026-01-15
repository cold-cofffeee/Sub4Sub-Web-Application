# SUB4SUB v2.0 - Professional Production Setup Guide

## 🚀 Quick Start (5 Minutes)

### 1. Database Setup
```sql
CREATE DATABASE sub4sub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Then run the migration:
```bash
php install/migrate.php
```

### 2. Environment Configuration
```bash
cp .env.example .env
```

Edit `.env` with your settings:
```env
# Required - Database
DB_HOST=localhost
DB_NAME=sub4sub
DB_USER=root
DB_PASS=your_password

# Required - Admin Access
ADMIN_USERNAME=admin
ADMIN_PASSWORD=ChangeThisPassword123!

# Optional - Email (Leave empty to disable)
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Optional - Payments (Leave empty for demo mode)
STRIPE_SECRET_KEY=sk_live_your_stripe_key
PAYPAL_CLIENT_ID=your_paypal_client_id
```

### 3. Access Your Site
- **Website**: http://yourdomain.com
- **Admin Panel**: http://yourdomain.com/Admin/login.php
- **Default Admin**: admin / admin123 (Change in .env!)

---

## 📁 Professional File Structure

```
Sub4Sub-Web-Application/
├── Admin/                          # Admin Panel
│   ├── login.php                   # Admin authentication
│   ├── dashboard.php               # Statistics & overview
│   ├── users.php                   # User management
│   ├── payments.php                # Payment history
│   ├── settings.php                # Global settings
│   ├── content-management.php      # Content hub
│   └── ...
│
├── api/                            # RESTful API
├── assets/                         # CSS, JS, Images
├── classes/                        # OOP Architecture
│   ├── Database.php                # PDO singleton
│   ├── User.php                    # User model
│   ├── Security.php                # Security utilities
│   ├── EmailService.php            # Email (optional)
│   └── Logger.php                  # Logging system
│
├── config/                         # Configuration
├── includes/                       # Header/Footer templates
├── install/                        # Database migration
│
├── index.php                       # Landing page
├── account.php                     # User dashboard
├── exchange.php                    # Subscription exchange
├── purchase.php                    # Premium checkout
├── .env.example                    # Environment template
└── README.md                       # This file
```

---

## 💳 Payment Gateway Integration

### Demo Mode (Default - No Configuration Needed)
- Works immediately without any setup
- Creates test transactions
- Perfect for development

### Stripe Integration
1. Get API keys from https://dashboard.stripe.com/apikeys
2. Add to `.env`: `STRIPE_SECRET_KEY=sk_live_xxxxx`
3. Users can pay with credit cards

### PayPal Integration
1. Create app at https://developer.paypal.com
2. Add to `.env`: `PAYPAL_CLIENT_ID=xxxxx`
3. PayPal checkout enabled

---

## 📧 Email Configuration (100% Optional)

**The app works perfectly without email configuration.**

Leave SMTP settings empty in `.env` to disable:
```env
SMTP_HOST=
SMTP_USER=
SMTP_PASS=
```

To enable Gmail:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

---

## 🔒 Security Features

✅ CSRF Protection  
✅ Password Hashing (bcrypt)  
✅ SQL Injection Prevention  
✅ XSS Protection  
✅ Rate Limiting  
✅ Session Security  
✅ API Authentication  
✅ Activity Logging  
✅ AES-256 Encryption

---

## 🎨 Modern Features

### User Features
- Responsive Design
- Real-time Statistics
- AJAX Operations
- Premium Subscriptions
- Analytics Dashboard
- Notification System

### Admin Features
- Modern Dashboard
- User Management
- Payment Tracking
- Content Management
- Activity Logs
- Settings Panel

---

## 🎯 Pricing Plans

- **Free**: 10 subscriptions/day, basic features
- **Monthly ($9.99)**: Unlimited subscriptions, advanced analytics
- **Quarterly ($24.99)**: Save 17%, extended features
- **Yearly ($99.99)**: Save 17%, all features

---

## 🌐 Production Deployment

### Security Checklist
- [ ] Change `ADMIN_PASSWORD` in `.env`
- [ ] Set `APP_ENV=production`
- [ ] Set `APP_DEBUG=false`
- [ ] Configure payment gateways
- [ ] Set up HTTPS/SSL
- [ ] Configure backups

### Performance
```php
// Enable OPcache in php.ini
opcache.enable=1
opcache.memory_consumption=128
```

---

## 🆘 Troubleshooting

**Database Error**: Check `.env` DB credentials  
**Admin Can't Login**: Default is admin/admin123  
**Email Not Sending**: This is normal - email is optional  
**Payment Not Working**: Demo mode is automatic  
**Styling Broken**: Clear browser cache

---

## 🔌 API Endpoints

```
POST /api/auth/login
POST /api/auth/register
GET  /api/users/me
GET  /api/subscriptions
POST /api/subscriptions
GET  /api/notifications
```

Authentication: Bearer token in `Authorization` header

---

## 📊 Database Schema

**8 Tables**:
- users
- subscriptions
- payments
- notifications
- activity_logs
- settings
- points
- api_tokens

---

## 📝 Version 2.0.0 Features

✅ Complete codebase overhaul  
✅ Modern OOP architecture  
✅ Professional file naming  
✅ Working payment gateways  
✅ Optional email system  
✅ Modern admin panel  
✅ Responsive design  
✅ Comprehensive security  
✅ RESTful API  
✅ Production-ready

---

## ⭐ Pro Tips

1. Always backup before updates
2. Use strong passwords in production
3. Enable HTTPS for payments
4. Monitor logs regularly
5. Test payments in sandbox mode first
6. Keep PHP and MySQL updated

---

**Built with PHP 8.0+, MySQL 5.7+, Bootstrap 5**

**Ready to launch! 🚀**
