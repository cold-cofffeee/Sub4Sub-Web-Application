<?php
/**
 * Security Class
 * Advanced security features for the application
 */

class Security {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance();
    }
    
    /**
     * Generate CSRF Token
     */
    public static function generateCsrfToken() {
        if (empty($_SESSION['csrf_token'])) {
            $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
            $_SESSION['csrf_token_time'] = time();
        }
        return $_SESSION['csrf_token'];
    }
    
    /**
     * Validate CSRF Token
     */
    public static function validateCsrfToken($token) {
        if (empty($_SESSION['csrf_token']) || empty($_SESSION['csrf_token_time'])) {
            return false;
        }
        
        // Check if token has expired
        if (time() - $_SESSION['csrf_token_time'] > CSRF_TOKEN_EXPIRY) {
            unset($_SESSION['csrf_token'], $_SESSION['csrf_token_time']);
            return false;
        }
        
        return hash_equals($_SESSION['csrf_token'], $token);
    }
    
    /**
     * Generate password reset token
     */
    public static function generatePasswordResetToken($email) {
        $db = Database::getInstance();
        $token = bin2hex(random_bytes(32));
        $expires = date('Y-m-d H:i:s', strtotime('+1 hour'));
        
        $db->update('users', [
            'password_reset_token' => $token,
            'password_reset_expires' => $expires
        ], 'email = ?', [$email]);
        
        return $token;
    }
    
    /**
     * Validate password reset token
     */
    public static function validatePasswordResetToken($token) {
        $db = Database::getInstance();
        $sql = "SELECT id, email, password_reset_expires 
                FROM users 
                WHERE password_reset_token = ? 
                AND password_reset_expires > NOW()";
        
        return $db->fetchOne($sql, [$token]);
    }
    
    /**
     * Reset password using token
     */
    public static function resetPassword($token, $newPassword) {
        $user = self::validatePasswordResetToken($token);
        
        if (!$user) {
            return [false, 'Invalid or expired reset token'];
        }
        
        $db = Database::getInstance();
        $hash = password_hash($newPassword, PASSWORD_DEFAULT);
        
        $db->update('users', [
            'password' => $hash,
            'password_reset_token' => null,
            'password_reset_expires' => null
        ], 'id = ?', [$user['id']]);
        
        return [true, 'Password reset successful'];
    }
    
    /**
     * Check login attempts and lockout
     */
    public static function checkLoginAttempts($email) {
        $db = Database::getInstance();
        $sql = "SELECT login_attempts, lockout_until FROM users WHERE email = ?";
        $user = $db->fetchOne($sql, [$email]);
        
        if (!$user) {
            return [true, null]; // User doesn't exist, allow attempt
        }
        
        // Check if account is locked
        if ($user['lockout_until'] && strtotime($user['lockout_until']) > time()) {
            $minutes = ceil((strtotime($user['lockout_until']) - time()) / 60);
            return [false, "Account is locked. Try again in {$minutes} minutes."];
        }
        
        // Reset lockout if time has passed
        if ($user['lockout_until'] && strtotime($user['lockout_until']) <= time()) {
            $db->update('users', [
                'login_attempts' => 0,
                'lockout_until' => null
            ], 'email = ?', [$email]);
        }
        
        return [true, null];
    }
    
    /**
     * Record failed login attempt
     */
    public static function recordFailedLogin($email) {
        $db = Database::getInstance();
        $sql = "UPDATE users 
                SET login_attempts = login_attempts + 1 
                WHERE email = ?";
        $db->query($sql, [$email]);
        
        // Check if we need to lock the account
        $sql = "SELECT login_attempts FROM users WHERE email = ?";
        $result = $db->fetchOne($sql, [$email]);
        
        if ($result && $result['login_attempts'] >= MAX_LOGIN_ATTEMPTS) {
            $lockoutUntil = date('Y-m-d H:i:s', time() + LOCKOUT_TIME);
            $db->update('users', [
                'lockout_until' => $lockoutUntil
            ], 'email = ?', [$email]);
            
            return [false, 'Too many failed attempts. Account locked for 15 minutes.'];
        }
        
        $remaining = MAX_LOGIN_ATTEMPTS - $result['login_attempts'];
        return [true, "Invalid credentials. {$remaining} attempts remaining."];
    }
    
    /**
     * Record successful login
     */
    public static function recordSuccessfulLogin($userId) {
        $db = Database::getInstance();
        $db->update('users', [
            'login_attempts' => 0,
            'lockout_until' => null,
            'last_login' => date('Y-m-d H:i:s')
        ], 'id = ?', [$userId]);
    }
    
    /**
     * Sanitize input
     */
    public static function sanitizeInput($data) {
        if (is_array($data)) {
            return array_map([self::class, 'sanitizeInput'], $data);
        }
        
        return htmlspecialchars(strip_tags(trim($data)), ENT_QUOTES, 'UTF-8');
    }
    
    /**
     * Validate password strength
     */
    public static function validatePassword($password) {
        $errors = [];
        
        if (strlen($password) < PASSWORD_MIN_LENGTH) {
            $errors[] = "Password must be at least " . PASSWORD_MIN_LENGTH . " characters";
        }
        
        if (!preg_match('/[A-Z]/', $password)) {
            $errors[] = "Password must contain at least one uppercase letter";
        }
        
        if (!preg_match('/[a-z]/', $password)) {
            $errors[] = "Password must contain at least one lowercase letter";
        }
        
        if (!preg_match('/[0-9]/', $password)) {
            $errors[] = "Password must contain at least one number";
        }
        
        if (!preg_match('/[^A-Za-z0-9]/', $password)) {
            $errors[] = "Password must contain at least one special character";
        }
        
        return [empty($errors), $errors];
    }
    
    /**
     * Rate limiting
     */
    public static function checkRateLimit($identifier, $maxAttempts = 10, $timeWindow = 3600) {
        $key = 'rate_limit_' . md5($identifier);
        
        if (!isset($_SESSION[$key])) {
            $_SESSION[$key] = [
                'attempts' => 1,
                'first_attempt' => time()
            ];
            return [true, $maxAttempts - 1];
        }
        
        $data = $_SESSION[$key];
        
        // Reset if time window has passed
        if (time() - $data['first_attempt'] > $timeWindow) {
            $_SESSION[$key] = [
                'attempts' => 1,
                'first_attempt' => time()
            ];
            return [true, $maxAttempts - 1];
        }
        
        // Check if limit exceeded
        if ($data['attempts'] >= $maxAttempts) {
            $timeLeft = $timeWindow - (time() - $data['first_attempt']);
            return [false, "Rate limit exceeded. Try again in " . ceil($timeLeft / 60) . " minutes."];
        }
        
        // Increment attempts
        $_SESSION[$key]['attempts']++;
        return [true, $maxAttempts - $_SESSION[$key]['attempts']];
    }
    
    /**
     * Log activity
     */
    public static function logActivity($userId, $action, $description = null, $metadata = null) {
        $db = Database::getInstance();
        
        $data = [
            'user_id' => $userId,
            'action' => $action,
            'description' => $description,
            'ip_address' => $_SERVER['REMOTE_ADDR'] ?? null,
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? null,
            'metadata' => $metadata ? json_encode($metadata) : null
        ];
        
        $db->insert('activity_logs', $data);
    }
    
    /**
     * Generate email verification token
     */
    public static function generateEmailVerificationToken($userId) {
        $db = Database::getInstance();
        $token = bin2hex(random_bytes(32));
        
        $db->update('users', [
            'email_verification_token' => $token
        ], 'id = ?', [$userId]);
        
        return $token;
    }
    
    /**
     * Verify email token
     */
    public static function verifyEmail($token) {
        $db = Database::getInstance();
        $sql = "SELECT id FROM users WHERE email_verification_token = ?";
        $user = $db->fetchOne($sql, [$token]);
        
        if (!$user) {
            return [false, 'Invalid verification token'];
        }
        
        $db->update('users', [
            'email_verified' => 1,
            'email_verification_token' => null
        ], 'id = ?', [$user['id']]);
        
        return [true, 'Email verified successfully'];
    }
    
    /**
     * Encrypt sensitive data
     */
    public static function encrypt($data) {
        $key = SITE_KEY;
        $iv = openssl_random_pseudo_bytes(openssl_cipher_iv_length('aes-256-cbc'));
        $encrypted = openssl_encrypt($data, 'aes-256-cbc', $key, 0, $iv);
        return base64_encode($encrypted . '::' . $iv);
    }
    
    /**
     * Decrypt sensitive data
     */
    public static function decrypt($data) {
        $key = SITE_KEY;
        list($encrypted, $iv) = explode('::', base64_decode($data), 2);
        return openssl_decrypt($encrypted, 'aes-256-cbc', $key, 0, $iv);
    }
    
    /**
     * Generate API token
     */
    public static function generateApiToken($userId, $name = null, $scopes = []) {
        $db = Database::getInstance();
        $token = bin2hex(random_bytes(32));
        
        $data = [
            'user_id' => $userId,
            'token' => hash('sha256', $token),
            'name' => $name,
            'scopes' => json_encode($scopes)
        ];
        
        $db->insert('api_tokens', $data);
        
        return $token; // Return unhashed token (only shown once)
    }
    
    /**
     * Validate API token
     */
    public static function validateApiToken($token) {
        $db = Database::getInstance();
        $hashedToken = hash('sha256', $token);
        
        $sql = "SELECT t.*, u.* 
                FROM api_tokens t
                JOIN users u ON t.user_id = u.id
                WHERE t.token = ? 
                AND (t.expires_at IS NULL OR t.expires_at > NOW())
                AND u.is_banned = 0";
        
        $result = $db->fetchOne($sql, [$hashedToken]);
        
        if ($result) {
            // Update last used timestamp
            $db->update('api_tokens', [
                'last_used_at' => date('Y-m-d H:i:s')
            ], 'token = ?', [$hashedToken]);
        }
        
        return $result;
    }
}
