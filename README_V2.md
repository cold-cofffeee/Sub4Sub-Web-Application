# SUB4SUB Web Application v2.0 🚀

<div align="center">

![SUB4SUB Logo](https://i.ibb.co/mRjQ4qc/growth.png)

**The Ultimate YouTube Growth Platform**

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![PHP](https://img.shields.io/badge/PHP-8.0%2B-purple.svg)](https://php.net)
[![MySQL](https://img.shields.io/badge/MySQL-5.7%2B-orange.svg)](https://mysql.com)

</div>

## 🌟 Overview

SUB4SUB is a professional-grade web application that enables YouTube creators to exchange subscriptions organically. Built with modern PHP practices, it features a sleek UI, advanced security, real-time analytics, and comprehensive API support.

## ✨ Features

### Core Features
- ✅ **User Authentication** - Secure login/registration with email verification
- ✅ **Subscription Exchange** - Real-time subscription management
- ✅ **User Profiles** - Customizable profiles with profile pictures
- ✅ **Premium Membership** - Unlimited features for premium users
- ✅ **Admin Panel** - Comprehensive administrative controls

### Advanced Features (v2.0)
- 🎨 **Modern UI/UX** - Professional, responsive design with custom CSS framework
- 🔒 **Enhanced Security** - CSRF protection, rate limiting, password reset tokens, encryption
- 📊 **Analytics Dashboard** - Real-time statistics and growth tracking with Chart.js
- 📧 **Email Notifications** - Professional email templates for all user actions
- 🔌 **RESTful API** - Complete API for mobile app integration
- 🛡️ **Advanced Logging** - Comprehensive error tracking and activity logs
- 💾 **OOP Architecture** - Clean, maintainable code with design patterns
- ⚙️ **Environment Configuration** - Flexible configuration system
- 🗄️ **Database Migrations** - Automated database setup and updates
- 🚀 **Performance Optimized** - Caching, connection pooling, and query optimization

## 🚀 Installation

### Prerequisites

- **PHP** 8.0 or higher
- **MySQL** 5.7 or higher
- **Apache** or **Nginx** web server
- **XAMPP** or **WAMP** (for local development)
- **Composer** (optional, for future dependency management)

### Step 1: Clone Repository

```bash
git clone https://github.com/yourusername/Sub4Sub-Web-Application.git
cd Sub4Sub-Web-Application
```

### Step 2: Environment Configuration

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` file with your configuration:
```env
# Application
APP_ENV=development
APP_URL=http://localhost

# Database
DB_HOST=localhost
DB_NAME=sub4sub
DB_USER=root
DB_PASS=

# Security
SITE_KEY=your_32_character_secret_key_here

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM_EMAIL=noreply@sub4sub.com
SMTP_FROM_NAME=SUB4SUB
```

### Step 3: Database Setup

1. Create a MySQL database named `sub4sub`

2. Run the migration script:
```bash
php install/migrate.php
```

This will:
- Create all necessary tables
- Set up indexes and foreign keys
- Insert default settings
- Create an admin account

**Default Admin Credentials:**
- Email: `admin@sub4sub.com`
- Password: `Admin@123`
- ⚠️ **Change these immediately after first login!**

### Step 4: Configure Web Server

#### Apache (XAMPP/WAMP)

1. Copy the project to your web root:
```bash
# Windows
copy to C:\xampp\htdocs\Sub4Sub-Web-Application

# Linux/Mac
copy to /opt/lampp/htdocs/Sub4Sub-Web-Application
```

2. Access via browser:
```
http://localhost/Sub4Sub-Web-Application
```

#### Nginx

Add this to your Nginx configuration:
```nginx
server {
    listen 80;
    server_name sub4sub.local;
    root /path/to/Sub4Sub-Web-Application;
    
    index index.php;
    
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }
    
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.0-fpm.sock;
        fastcgi_index index.php;
        include fastcgi_params;
    }
}
```

### Step 5: Set Permissions

```bash
chmod -R 755 /path/to/Sub4Sub-Web-Application
chmod -R 777 uploads/ logs/ cache/
```

### Step 6: Access Application

1. Navigate to `http://localhost/Sub4Sub-Web-Application`
2. Login with admin credentials
3. Change default password in account settings
4. Configure site settings in admin panel

## 📁 Project Structure

```
Sub4Sub-Web-Application/
├── api/                      # RESTful API endpoints
│   └── index.php            # API router
├── assets/                   # Static assets
│   ├── css/
│   │   └── style.css        # Modern CSS framework
│   ├── js/
│   │   └── app.js           # JavaScript utilities
│   └── images/              # Image assets
├── classes/                  # PHP Classes (OOP)
│   ├── Database.php         # Database wrapper
│   ├── User.php             # User model
│   ├── Security.php         # Security utilities
│   ├── EmailService.php     # Email handler
│   └── Logger.php           # Logging system
├── config/                   # Configuration files
│   └── config.php           # Main configuration
├── includes/                 # Reusable components
│   ├── header.php           # Modern header
│   └── footer.php           # Modern footer
├── install/                  # Installation scripts
│   └── migrate.php          # Database migration
├── logs/                     # Application logs
├── uploads/                  # User uploads
├── Admin/                    # Admin panel
├── functions/                # Legacy functions
├── index.php                 # Home page
├── account.php               # User dashboard
├── sub4sub.php               # Subscription exchange
├── analytics.php             # Analytics dashboard
├── .env.example              # Example environment file
├── .gitignore               # Git ignore rules
└── README.md                # This file
```

## 🔧 Configuration

### Email Setup

For Gmail SMTP:
1. Enable 2-factor authentication
2. Generate an App Password
3. Use the App Password in `.env` file

### Security Settings

Edit `config/config.php` to customize:
- Session lifetime
- Max login attempts
- Lockout duration
- Password requirements
- File upload limits

### API Configuration

Generate API tokens in user dashboard:
```php
$token = Security::generateApiToken($userId, 'Mobile App');
```

Use token in API requests:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost/Sub4Sub-Web-Application/api/users
```

## 📚 API Documentation

### Authentication

**Login**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Register**
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "username",
  "password": "password123",
  "youtube_channel": "https://youtube.com/channel/...",
  "youtube_channel_name": "My Channel"
}
```

### User Endpoints

**Get User Profile**
```http
GET /api/users
Authorization: Bearer YOUR_TOKEN
```

**Update Profile**
```http
PUT /api/users
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "full_name": "John Doe",
  "location_address": "New York, USA"
}
```

### Subscriptions

**Get Available Channels**
```http
GET /api/subscriptions
Authorization: Bearer YOUR_TOKEN
```

**Subscribe to Channel**
```http
POST /api/subscriptions
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "target_user_id": 123,
  "target_channel_url": "https://youtube.com/...",
  "target_channel_name": "Channel Name"
}
```

## 🎨 Customization

### Styling

Edit `assets/css/style.css` to customize:
- Color scheme (CSS variables)
- Typography
- Spacing
- Animations

### Branding

1. Replace logo images in `assets/images/`
2. Update brand colors in CSS variables
3. Modify email templates in `classes/EmailService.php`

## 🛡️ Security Features

- **CSRF Protection** - Tokens for all forms
- **Password Hashing** - Bcrypt with salt
- **SQL Injection Prevention** - Prepared statements
- **XSS Protection** - Input sanitization
- **Rate Limiting** - API and login attempts
- **Session Security** - HTTP-only cookies
- **Encryption** - AES-256 for sensitive data
- **Login Lockout** - After failed attempts
- **Email Verification** - Optional for new accounts

## 📊 Analytics Features

- Real-time subscription tracking
- Growth rate calculations
- Top performing channels
- Activity logs
- Visual charts with Chart.js
- Export capabilities (CSV/PDF)

## 🐛 Troubleshooting

### Database Connection Issues
```php
// Check config/config.php
define('DB_HOST', 'localhost');
define('DB_NAME', 'sub4sub');
define('DB_USER', 'root');
define('DB_PASS', '');
```

### Permission Denied
```bash
chmod -R 755 /path/to/project
chmod -R 777 uploads/ logs/ cache/
```

### Email Not Sending
1. Check SMTP credentials in `.env`
2. Enable "Less Secure App Access" (Gmail)
3. Use App Password instead of regular password
4. Check firewall settings

### API Not Working
1. Ensure mod_rewrite is enabled (Apache)
2. Check .htaccess file exists
3. Verify API token is valid

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

This project is open source and available under the MIT License.

## 👥 Credits

**Developed by:**
- Hiranmay Roy
- Sameer Pathak

**Enhanced to v2.0 by:**
- AI-Powered Development Team

## 📞 Support

- **Documentation:** [Wiki](https://github.com/yourusername/Sub4Sub-Web-Application/wiki)
- **Issues:** [GitHub Issues](https://github.com/yourusername/Sub4Sub-Web-Application/issues)
- **Email:** support@sub4sub.com

## 🗺️ Roadmap

### Upcoming Features
- [ ] Mobile app (React Native)
- [ ] Payment gateway integration (Stripe/PayPal)
- [ ] Multi-language support
- [ ] Social media integration
- [ ] Advanced analytics with ML
- [ ] Live chat support
- [ ] Referral program
- [ ] Gamification system

## 📈 Version History

### v2.0.0 (2026-01-15)
- Complete UI/UX redesign
- OOP architecture implementation
- RESTful API development
- Advanced security features
- Email notification system
- Analytics dashboard
- Comprehensive logging
- Environment configuration

### v1.0.0 (Initial Release)
- Basic subscription exchange
- User authentication
- Admin panel
- Simple UI

---

<div align="center">

**Made with ❤️ by the SUB4SUB Team**

[Website](https://sub4sub.com) • [Documentation](https://docs.sub4sub.com) • [Demo](https://demo.sub4sub.com)

</div>
