<?php
/**
 * Database Migration Script
 * Run this to create/update database tables
 */

require_once __DIR__ . '/../classes/Database.php';

$db = Database::getInstance();
$pdo = $db->getPdo();

echo "Starting database migration...\n\n";

// Users table
echo "Creating/updating users table...\n";
$sql = "CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    location_address VARCHAR(255),
    youtube_channel VARCHAR(255),
    youtube_channel_name VARCHAR(255),
    youtube_channel_changed BOOLEAN DEFAULT FALSE,
    profile_picture VARCHAR(255) DEFAULT NULL,
    is_premium BOOLEAN DEFAULT FALSE,
    is_admin BOOLEAN DEFAULT FALSE,
    is_banned BOOLEAN DEFAULT FALSE,
    email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(255) DEFAULT NULL,
    password_reset_token VARCHAR(255) DEFAULT NULL,
    password_reset_expires DATETIME DEFAULT NULL,
    last_login DATETIME DEFAULT NULL,
    login_attempts INT DEFAULT 0,
    lockout_until DATETIME DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_username (username),
    INDEX idx_is_banned (is_banned)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";
$pdo->exec($sql);
echo "✓ Users table ready\n";

// Subscriptions table
echo "Creating subscriptions table...\n";
$sql = "CREATE TABLE IF NOT EXISTS subscriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    target_user_id INT NOT NULL,
    target_channel_url VARCHAR(255) NOT NULL,
    target_channel_name VARCHAR(255) NOT NULL,
    status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
    verification_screenshot VARCHAR(255) DEFAULT NULL,
    points_earned INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified_at DATETIME DEFAULT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (target_user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_target_user_id (target_user_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";
$pdo->exec($sql);
echo "✓ Subscriptions table ready\n";

// Notifications table
echo "Creating notifications table...\n";
$sql = "CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('info', 'success', 'warning', 'error') DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    action_url VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_is_read (is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";
$pdo->exec($sql);
echo "✓ Notifications table ready\n";

// Payments table
echo "Creating payments table...\n";
$sql = "CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    payment_method VARCHAR(50) NOT NULL,
    transaction_id VARCHAR(255) UNIQUE,
    status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    description TEXT,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_transaction_id (transaction_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";
$pdo->exec($sql);
echo "✓ Payments table ready\n";

// Activity logs table
echo "Creating activity_logs table...\n";
$sql = "CREATE TABLE IF NOT EXISTS activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT DEFAULT NULL,
    action VARCHAR(100) NOT NULL,
    description TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";
$pdo->exec($sql);
echo "✓ Activity logs table ready\n";

// Settings table
echo "Creating settings table...\n";
$sql = "CREATE TABLE IF NOT EXISTS settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    setting_type VARCHAR(50) DEFAULT 'string',
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_setting_key (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";
$pdo->exec($sql);
echo "✓ Settings table ready\n";

// Points system table
echo "Creating points table...\n";
$sql = "CREATE TABLE IF NOT EXISTS points (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    points INT NOT NULL DEFAULT 0,
    points_type ENUM('earned', 'spent', 'bonus') DEFAULT 'earned',
    description VARCHAR(255),
    reference_id INT DEFAULT NULL,
    reference_type VARCHAR(50) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_points_type (points_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";
$pdo->exec($sql);
echo "✓ Points table ready\n";

// API tokens table
echo "Creating api_tokens table...\n";
$sql = "CREATE TABLE IF NOT EXISTS api_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(100),
    scopes JSON,
    last_used_at DATETIME DEFAULT NULL,
    expires_at DATETIME DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";
$pdo->exec($sql);
echo "✓ API tokens table ready\n";

// Insert default admin user if not exists
echo "\nChecking for admin user...\n";
$stmt = $pdo->query("SELECT COUNT(*) as count FROM users WHERE is_admin = 1");
$result = $stmt->fetch();

if ($result['count'] == 0) {
    echo "Creating default admin user...\n";
    $adminPassword = password_hash('Admin@123', PASSWORD_DEFAULT);
    $sql = "INSERT INTO users (email, username, password, full_name, is_admin, email_verified, youtube_channel, youtube_channel_name) 
            VALUES ('admin@sub4sub.com', 'admin', ?, 'System Administrator', 1, 1, 'https://youtube.com', 'Admin Channel')";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$adminPassword]);
    echo "✓ Admin user created\n";
    echo "  Email: admin@sub4sub.com\n";
    echo "  Password: Admin@123\n";
    echo "  ⚠️  Please change the password after first login!\n";
} else {
    echo "✓ Admin user already exists\n";
}

// Insert default settings
echo "\nInserting default settings...\n";
$defaultSettings = [
    ['site_name', 'SUB4SUB', 'string', 'Website name', 1],
    ['site_tagline', 'Boost Your YouTube Channel', 'string', 'Website tagline', 1],
    ['maintenance_mode', '0', 'boolean', 'Enable maintenance mode', 0],
    ['registration_enabled', '1', 'boolean', 'Allow new registrations', 0],
    ['points_per_subscription', '10', 'integer', 'Points earned per subscription', 0],
    ['min_withdrawal_points', '100', 'integer', 'Minimum points for withdrawal', 0],
    ['max_subscriptions_per_day', '20', 'integer', 'Maximum subscriptions per day', 0],
    ['premium_price', '9.99', 'decimal', 'Premium membership price', 0],
];

foreach ($defaultSettings as $setting) {
    $stmt = $pdo->prepare("INSERT IGNORE INTO settings (setting_key, setting_value, setting_type, description, is_public) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute($setting);
}
echo "✓ Default settings inserted\n";

echo "\n✅ Migration completed successfully!\n";
echo "\nDatabase is ready to use.\n";
