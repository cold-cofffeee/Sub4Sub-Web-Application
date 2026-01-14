# 🚀 SUB4SUB v2.0 - Quick Start Installation Guide

## Prerequisites Checklist
- [ ] PHP 8.0 or higher installed
- [ ] MySQL 5.7 or higher installed
- [ ] XAMPP/WAMP running (Apache + MySQL)
- [ ] Text editor (VSCode recommended)

## 5-Minute Installation

### Step 1: Setup Files (1 minute)
```bash
1. Download/Clone project to: C:\xampp\htdocs\Sub4Sub-Web-Application
2. Copy .env.example to .env
3. Edit .env with your database password (if any)
```

### Step 2: Database Setup (2 minutes)
```bash
1. Open phpMyAdmin: http://localhost/phpmyadmin
2. Create database: "sub4sub"
3. Run migration:
   - Open browser: http://localhost/Sub4Sub-Web-Application/install/migrate.php
   OR
   - Run command: php install/migrate.php
```

### Step 3: Access Application (1 minute)
```
1. Open: http://localhost/Sub4Sub-Web-Application
2. Login with admin:
   Email: admin@sub4sub.com
   Password: Admin@123
3. Change password immediately!
```

### Step 4: Test Features (1 minute)
```
✅ Create test user account
✅ Browse SUB4SUB page
✅ Check analytics dashboard
✅ Test admin panel
```

## Default URLs

| Feature | URL |
|---------|-----|
| Home | http://localhost/Sub4Sub-Web-Application/ |
| Login | http://localhost/Sub4Sub-Web-Application/account.php |
| Admin | http://localhost/Sub4Sub-Web-Application/Admin/ |
| API | http://localhost/Sub4Sub-Web-Application/api/ |
| Analytics | http://localhost/Sub4Sub-Web-Application/analytics.php |

## Default Credentials

**Admin Account:**
```
Email: admin@sub4sub.com
Password: Admin@123
```

⚠️ **IMPORTANT:** Change password after first login!

## Email Configuration (Optional)

For email notifications, edit `.env`:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_app_password
```

### Gmail Setup:
1. Enable 2-Factor Authentication
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use App Password in .env

## Troubleshooting

### Issue: White screen / No display
**Solution:** Check PHP error logs at `C:\xampp\apache\logs\error.log`

### Issue: Database connection failed
**Solution:** 
1. Ensure MySQL is running in XAMPP
2. Check database credentials in `.env`
3. Verify database "sub4sub" exists

### Issue: Permission denied errors
**Solution:**
```bash
chmod -R 755 /path/to/project
chmod -R 777 uploads/ logs/ cache/
```

### Issue: API returns 404
**Solution:**
1. Enable mod_rewrite in Apache
2. Ensure .htaccess exists
3. Restart Apache

### Issue: Emails not sending
**Solution:**
1. Use Gmail App Password (not regular password)
2. Check SMTP credentials
3. Verify port 587 is not blocked

## What's New in v2.0?

✅ **Modern UI** - Professional design with custom CSS framework  
✅ **Enhanced Security** - CSRF, rate limiting, encryption  
✅ **Analytics** - Real-time charts and statistics  
✅ **API** - RESTful endpoints for mobile apps  
✅ **Email System** - Beautiful email notifications  
✅ **OOP Code** - Clean, maintainable architecture  
✅ **Logging** - Comprehensive error tracking  
✅ **Database Migrations** - Automated setup  

## File Permissions (Linux/Mac)

```bash
cd /path/to/Sub4Sub-Web-Application
chmod -R 755 .
chmod -R 777 uploads/ logs/ cache/
```

## Apache Configuration

Make sure these modules are enabled in `httpd.conf`:
```apache
LoadModule rewrite_module modules/mod_rewrite.so
LoadModule headers_module modules/mod_headers.so
```

## Testing Checklist

- [ ] Homepage loads correctly
- [ ] Can register new user
- [ ] Can login with credentials
- [ ] SUB4SUB page shows channels
- [ ] Admin panel accessible
- [ ] Analytics dashboard displays
- [ ] Profile update works
- [ ] Email notifications send (if configured)
- [ ] API responds to requests

## Next Steps

1. **Change Admin Password** - Go to Account Settings
2. **Customize Branding** - Edit logo and colors in `assets/css/style.css`
3. **Configure Email** - Set up SMTP in `.env`
4. **Explore Admin Panel** - Manage users and settings
5. **Read Full Documentation** - Check README_V2.md

## Need Help?

- 📖 Full Documentation: README_V2.md
- 🐛 Report Issues: GitHub Issues
- 💬 Community: Discord/Forums
- 📧 Email: support@sub4sub.com

## Quick Commands

```bash
# Run migration
php install/migrate.php

# Clear logs
rm logs/*.log

# Check PHP version
php -v

# Test database connection
php -r "new PDO('mysql:host=localhost;dbname=sub4sub', 'root', '');"

# Start XAMPP (Linux)
sudo /opt/lampp/lampp start

# View error logs
tail -f C:\xampp\apache\logs\error.log  # Windows
tail -f /opt/lampp/logs/error_log       # Linux
```

## Production Deployment

When deploying to production:

1. Set `APP_ENV=production` in `.env`
2. Change `APP_URL` to your domain
3. Use strong `SITE_KEY` (32+ characters)
4. Configure SSL certificate
5. Set restrictive file permissions
6. Enable error logging (not display)
7. Backup database regularly
8. Set up cron jobs for maintenance

## Support

If you encounter any issues:

1. Check `logs/` directory for error logs
2. Enable debug mode in `.env`: `APP_DEBUG=true`
3. Check PHP and MySQL versions
4. Verify all file permissions
5. Contact support with error details

---

**🎉 Congratulations! You're ready to grow YouTube channels with SUB4SUB v2.0!**
