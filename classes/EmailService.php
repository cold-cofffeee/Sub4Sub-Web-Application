<?php
/**
 * Email Service Class
 * Professional email notifications using PHPMailer or SMTP
 */

class EmailService {
    private $config;
    
    public function __construct() {
        require_once __DIR__ . '/../config/config.php';
        $this->config = include __DIR__ . '/../config/config.php';
    }
    
    /**
     * Send email using PHP mail() or SMTP
     */
    public function send($to, $subject, $body, $isHTML = true) {
        $headers = [];
        
        if ($isHTML) {
            $headers[] = 'MIME-Version: 1.0';
            $headers[] = 'Content-type: text/html; charset=utf-8';
        }
        
        $headers[] = 'From: ' . $this->config['email']['from_name'] . ' <' . $this->config['email']['from_email'] . '>';
        $headers[] = 'Reply-To: ' . $this->config['email']['from_email'];
        $headers[] = 'X-Mailer: PHP/' . phpversion();
        
        return mail($to, $subject, $body, implode("\r\n", $headers));
    }
    
    /**
     * Send welcome email
     */
    public function sendWelcomeEmail($userEmail, $userName) {
        $subject = 'Welcome to SUB4SUB!';
        $body = $this->getEmailTemplate('welcome', [
            'name' => $userName,
            'login_url' => APP_URL . '/account.php'
        ]);
        
        return $this->send($userEmail, $subject, $body);
    }
    
    /**
     * Send email verification
     */
    public function sendVerificationEmail($userEmail, $userName, $verificationToken) {
        $subject = 'Verify Your Email Address';
        $verificationUrl = APP_URL . '/verify-email.php?token=' . $verificationToken;
        
        $body = $this->getEmailTemplate('verification', [
            'name' => $userName,
            'verification_url' => $verificationUrl
        ]);
        
        return $this->send($userEmail, $subject, $body);
    }
    
    /**
     * Send password reset email
     */
    public function sendPasswordResetEmail($userEmail, $userName, $resetToken) {
        $subject = 'Reset Your Password';
        $resetUrl = APP_URL . '/reset-password.php?token=' . $resetToken;
        
        $body = $this->getEmailTemplate('password-reset', [
            'name' => $userName,
            'reset_url' => $resetUrl,
            'expiry_time' => '1 hour'
        ]);
        
        return $this->send($userEmail, $subject, $body);
    }
    
    /**
     * Send subscription notification
     */
    public function sendSubscriptionNotification($userEmail, $userName, $subscriberName) {
        $subject = 'New Subscriber Alert!';
        $body = $this->getEmailTemplate('new-subscription', [
            'name' => $userName,
            'subscriber_name' => $subscriberName,
            'dashboard_url' => APP_URL . '/account.php'
        ]);
        
        return $this->send($userEmail, $subject, $body);
    }
    
    /**
     * Send premium upgrade confirmation
     */
    public function sendPremiumUpgradeEmail($userEmail, $userName) {
        $subject = 'Welcome to Premium!';
        $body = $this->getEmailTemplate('premium-upgrade', [
            'name' => $userName,
            'dashboard_url' => APP_URL . '/account.php'
        ]);
        
        return $this->send($userEmail, $subject, $body);
    }
    
    /**
     * Get email template
     */
    private function getEmailTemplate($templateName, $variables = []) {
        $template = $this->getBaseTemplate();
        
        $content = '';
        switch ($templateName) {
            case 'welcome':
                $content = "
                    <h2>Welcome to SUB4SUB, {$variables['name']}! 🎉</h2>
                    <p>Thank you for joining our community of YouTube creators!</p>
                    <p>You can now start growing your channel by exchanging subscriptions with other creators.</p>
                    <p style='margin: 30px 0;'>
                        <a href='{$variables['login_url']}' style='background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;'>
                            Get Started
                        </a>
                    </p>
                    <p>Need help? Check out our <a href='" . APP_URL . "/faq.php'>FAQ page</a> or <a href='" . APP_URL . "/contact.php'>contact support</a>.</p>
                ";
                break;
                
            case 'verification':
                $content = "
                    <h2>Verify Your Email Address</h2>
                    <p>Hi {$variables['name']},</p>
                    <p>Please verify your email address by clicking the button below:</p>
                    <p style='margin: 30px 0;'>
                        <a href='{$variables['verification_url']}' style='background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;'>
                            Verify Email
                        </a>
                    </p>
                    <p>Or copy and paste this link into your browser:</p>
                    <p style='background: #f3f4f6; padding: 10px; border-radius: 5px; word-break: break-all;'>{$variables['verification_url']}</p>
                    <p><small>This link will expire in 24 hours.</small></p>
                ";
                break;
                
            case 'password-reset':
                $content = "
                    <h2>Reset Your Password</h2>
                    <p>Hi {$variables['name']},</p>
                    <p>We received a request to reset your password. Click the button below to create a new password:</p>
                    <p style='margin: 30px 0;'>
                        <a href='{$variables['reset_url']}' style='background: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;'>
                            Reset Password
                        </a>
                    </p>
                    <p>Or copy and paste this link into your browser:</p>
                    <p style='background: #f3f4f6; padding: 10px; border-radius: 5px; word-break: break-all;'>{$variables['reset_url']}</p>
                    <p><small>This link will expire in {$variables['expiry_time']}.</small></p>
                    <p>If you didn't request this, please ignore this email.</p>
                ";
                break;
                
            case 'new-subscription':
                $content = "
                    <h2>New Subscriber! 🎉</h2>
                    <p>Hi {$variables['name']},</p>
                    <p>Great news! <strong>{$variables['subscriber_name']}</strong> just subscribed to your channel!</p>
                    <p style='margin: 30px 0;'>
                        <a href='{$variables['dashboard_url']}' style='background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;'>
                            View Dashboard
                        </a>
                    </p>
                ";
                break;
                
            case 'premium-upgrade':
                $content = "
                    <h2>Welcome to Premium! 👑</h2>
                    <p>Hi {$variables['name']},</p>
                    <p>Congratulations! Your account has been upgraded to Premium.</p>
                    <h3>Premium Benefits:</h3>
                    <ul>
                        <li>✅ Unlimited subscriptions per day</li>
                        <li>✅ Priority customer support</li>
                        <li>✅ Advanced analytics</li>
                        <li>✅ No ads</li>
                        <li>✅ Exclusive features</li>
                    </ul>
                    <p style='margin: 30px 0;'>
                        <a href='{$variables['dashboard_url']}' style='background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;'>
                            Explore Premium Features
                        </a>
                    </p>
                ";
                break;
                
            default:
                $content = "<p>No content available.</p>";
        }
        
        return str_replace('{{CONTENT}}', $content, $template);
    }
    
    /**
     * Base email template
     */
    private function getBaseTemplate() {
        return '
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
        }
        .content {
            padding: 30px;
        }
        .footer {
            background: #f9f9f9;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #666;
        }
        a {
            color: #2563eb;
        }
        .social-links a {
            display: inline-block;
            margin: 0 10px;
            color: #666;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 SUB4SUB</h1>
        </div>
        <div class="content">
            {{CONTENT}}
        </div>
        <div class="footer">
            <p>&copy; ' . date('Y') . ' SUB4SUB. All rights reserved.</p>
            <div class="social-links">
                <a href="#">Facebook</a>
                <a href="#">Twitter</a>
                <a href="#">Instagram</a>
                <a href="#">YouTube</a>
            </div>
            <p style="margin-top: 15px;">
                <a href="' . APP_URL . '/privacy.php">Privacy Policy</a> |
                <a href="' . APP_URL . '/tos.php">Terms of Service</a> |
                <a href="' . APP_URL . '/contact.php">Contact Us</a>
            </p>
        </div>
    </div>
</body>
</html>';
    }
}
