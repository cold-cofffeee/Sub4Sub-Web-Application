<?php
/**
 * Automated Installation Wizard
 * SUB4SUB v2.0 - Professional Setup
 */

// Check if already installed
if (file_exists('config/installed.lock')) {
    header('Location: index.php');
    exit;
}

session_start();

$step = $_GET['step'] ?? 1;
$errors = [];
$success = '';

// Handle installation steps
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['step1'])) {
        // Step 1: Database Configuration
        $dbHost = $_POST['db_host'] ?? '';
        $dbName = $_POST['db_name'] ?? '';
        $dbUser = $_POST['db_user'] ?? '';
        $dbPass = $_POST['db_pass'] ?? '';
        
        // Test database connection
        try {
            $dsn = "mysql:host=$dbHost;charset=utf8mb4";
            $pdo = new PDO($dsn, $dbUser, $dbPass, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
            ]);
            
            // Create database if doesn't exist
            $pdo->exec("CREATE DATABASE IF NOT EXISTS `$dbName` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
            
            // Store in session
            $_SESSION['install'] = [
                'db_host' => $dbHost,
                'db_name' => $dbName,
                'db_user' => $dbUser,
                'db_pass' => $dbPass
            ];
            
            header('Location: install.php?step=2');
            exit;
        } catch (PDOException $e) {
            $errors[] = "Database connection failed: " . $e->getMessage();
        }
    } elseif (isset($_POST['step2'])) {
        // Step 2: Create Tables
        $install = $_SESSION['install'];
        
        try {
            $dsn = "mysql:host={$install['db_host']};dbname={$install['db_name']};charset=utf8mb4";
            $pdo = new PDO($dsn, $install['db_user'], $install['db_pass'], [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
            ]);
            
            // Create tables
            $sql = file_get_contents('install/schema.sql');
            $pdo->exec($sql);
            
            header('Location: install.php?step=3');
            exit;
        } catch (PDOException $e) {
            $errors[] = "Table creation failed: " . $e->getMessage();
        }
    } elseif (isset($_POST['step3'])) {
        // Step 3: Admin Account & Settings
        $install = $_SESSION['install'];
        $adminUsername = $_POST['admin_username'] ?? 'admin';
        $adminPassword = $_POST['admin_password'] ?? '';
        $adminEmail = $_POST['admin_email'] ?? '';
        $siteName = $_POST['site_name'] ?? 'SUB4SUB';
        $siteUrl = $_POST['site_url'] ?? '';
        
        if (strlen($adminPassword) < 8) {
            $errors[] = "Admin password must be at least 8 characters";
        } else {
            try {
                $dsn = "mysql:host={$install['db_host']};dbname={$install['db_name']};charset=utf8mb4";
                $pdo = new PDO($dsn, $install['db_user'], $install['db_pass'], [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
                ]);
                
                // Create admin user
                $hashedPassword = password_hash($adminPassword, PASSWORD_DEFAULT);
                $stmt = $pdo->prepare("INSERT INTO users (username, email, password, is_admin, is_premium, created_at) VALUES (?, ?, ?, 1, 1, NOW())");
                $stmt->execute([$adminUsername, $adminEmail, $hashedPassword]);
                
                // Insert default settings
                $settings = [
                    ['site_name', $siteName],
                    ['site_url', $siteUrl],
                    ['contact_email', $adminEmail],
                    ['free_daily_limit', '10'],
                    ['registration_enabled', '1'],
                    ['maintenance_mode', '0']
                ];
                
                $stmt = $pdo->prepare("INSERT INTO settings (`key`, value) VALUES (?, ?)");
                foreach ($settings as $setting) {
                    $stmt->execute($setting);
                }
                
                // Store credentials for .env
                $_SESSION['install']['admin_username'] = $adminUsername;
                $_SESSION['install']['admin_password'] = $adminPassword;
                $_SESSION['install']['site_url'] = $siteUrl;
                
                header('Location: install.php?step=4');
                exit;
            } catch (PDOException $e) {
                $errors[] = "Setup failed: " . $e->getMessage();
            }
        }
    } elseif (isset($_POST['step4'])) {
        // Step 4: Create .env file
        $install = $_SESSION['install'];
        
        $envContent = "# SUB4SUB v2.0 - Environment Configuration
# Auto-generated on " . date('Y-m-d H:i:s') . "

# Database
DB_HOST={$install['db_host']}
DB_NAME={$install['db_name']}
DB_USER={$install['db_user']}
DB_PASS={$install['db_pass']}

# Application
APP_NAME=\"SUB4SUB\"
APP_ENV=production
APP_DEBUG=false
APP_URL={$install['site_url']}

# Admin Access
ADMIN_USERNAME={$install['admin_username']}
ADMIN_PASSWORD={$install['admin_password']}

# Email (Optional - Leave empty to disable)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM_EMAIL=noreply@sub4sub.com
SMTP_FROM_NAME=\"SUB4SUB\"

# Payment Gateways (Optional - Leave empty for demo mode)
STRIPE_SECRET_KEY=
STRIPE_PUBLIC_KEY=
PAYPAL_CLIENT_ID=
PAYPAL_SECRET=

# Security
JWT_SECRET=" . bin2hex(random_bytes(32)) . "
ENCRYPTION_KEY=" . bin2hex(random_bytes(32)) . "

# Features
ENABLE_REGISTRATION=true
MAINTENANCE_MODE=false
FREE_DAILY_LIMIT=10
";
        
        // Write .env file
        if (file_put_contents('.env', $envContent)) {
            // Create lock file
            file_put_contents('config/installed.lock', date('Y-m-d H:i:s'));
            
            // Clear session
            unset($_SESSION['install']);
            
            header('Location: install.php?step=5');
            exit;
        } else {
            $errors[] = "Failed to create .env file. Please check write permissions.";
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Install SUB4SUB v2.0</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <style>
        body {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .install-container {
            max-width: 700px;
            margin: 50px auto;
        }
        .install-card {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            padding: 40px;
        }
        .step-indicator {
            display: flex;
            justify-content: space-between;
            margin-bottom: 40px;
            position: relative;
        }
        .step-indicator::before {
            content: '';
            position: absolute;
            top: 20px;
            left: 0;
            right: 0;
            height: 2px;
            background: #e0e0e0;
            z-index: 0;
        }
        .step {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: #e0e0e0;
            color: #999;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            position: relative;
            z-index: 1;
        }
        .step.active {
            background: #667eea;
            color: white;
        }
        .step.completed {
            background: #28a745;
            color: white;
        }
        .logo {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo i {
            font-size: 60px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .form-control:focus {
            border-color: #667eea;
            box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
        }
        .btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            padding: 12px 30px;
            font-weight: 600;
        }
        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
        }
        .success-icon {
            font-size: 80px;
            color: #28a745;
            text-align: center;
            margin: 30px 0;
        }
        .requirement-check {
            padding: 15px;
            background: #f8f9fa;
            border-radius: 10px;
            margin-bottom: 15px;
        }
        .requirement-check i {
            margin-right: 10px;
        }
        .requirement-check.success {
            background: #d4edda;
            color: #155724;
        }
        .requirement-check.warning {
            background: #fff3cd;
            color: #856404;
        }
    </style>
</head>
<body>

<div class="install-container">
    <div class="install-card">
        <div class="logo">
            <i class="fas fa-crown"></i>
            <h1 class="mt-2">SUB4SUB v2.0</h1>
            <p class="text-muted">Professional Installation Wizard</p>
        </div>

        <?php if ($errors): ?>
            <div class="alert alert-danger alert-dismissible fade show">
                <i class="fas fa-exclamation-triangle me-2"></i>
                <?php foreach ($errors as $error): ?>
                    <div><?= htmlspecialchars($error) ?></div>
                <?php endforeach; ?>
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        <?php endif; ?>

        <?php if ($success): ?>
            <div class="alert alert-success alert-dismissible fade show">
                <i class="fas fa-check-circle me-2"></i>
                <?= htmlspecialchars($success) ?>
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        <?php endif; ?>

        <!-- Step Indicator -->
        <div class="step-indicator">
            <div class="step <?= $step >= 1 ? 'active' : '' ?> <?= $step > 1 ? 'completed' : '' ?>">1</div>
            <div class="step <?= $step >= 2 ? 'active' : '' ?> <?= $step > 2 ? 'completed' : '' ?>">2</div>
            <div class="step <?= $step >= 3 ? 'active' : '' ?> <?= $step > 3 ? 'completed' : '' ?>">3</div>
            <div class="step <?= $step >= 4 ? 'active' : '' ?> <?= $step > 4 ? 'completed' : '' ?>">4</div>
            <div class="step <?= $step >= 5 ? 'active' : '' ?>">5</div>
        </div>

        <?php if ($step == 1): ?>
            <!-- Step 1: Database Configuration -->
            <h3 class="mb-4"><i class="fas fa-database me-2"></i> Database Configuration</h3>
            
            <div class="requirement-check success">
                <i class="fas fa-check-circle"></i>
                <strong>PHP Version:</strong> <?= phpversion() ?> ✓
            </div>
            
            <?php if (extension_loaded('pdo_mysql')): ?>
                <div class="requirement-check success">
                    <i class="fas fa-check-circle"></i>
                    <strong>MySQL PDO:</strong> Enabled ✓
                </div>
            <?php else: ?>
                <div class="requirement-check warning">
                    <i class="fas fa-exclamation-triangle"></i>
                    <strong>MySQL PDO:</strong> Not enabled!
                </div>
            <?php endif; ?>

            <form method="POST" class="mt-4">
                <div class="mb-3">
                    <label class="form-label">Database Host</label>
                    <input type="text" class="form-control" name="db_host" value="localhost" required>
                    <small class="text-muted">Usually "localhost"</small>
                </div>

                <div class="mb-3">
                    <label class="form-label">Database Name</label>
                    <input type="text" class="form-control" name="db_name" value="sub4sub" required>
                    <small class="text-muted">Will be created if doesn't exist</small>
                </div>

                <div class="mb-3">
                    <label class="form-label">Database Username</label>
                    <input type="text" class="form-control" name="db_user" value="root" required>
                </div>

                <div class="mb-3">
                    <label class="form-label">Database Password</label>
                    <input type="password" class="form-control" name="db_pass" placeholder="Leave empty if no password">
                </div>

                <button type="submit" name="step1" class="btn btn-primary w-100">
                    <i class="fas fa-arrow-right me-2"></i> Test Connection & Continue
                </button>
            </form>

        <?php elseif ($step == 2): ?>
            <!-- Step 2: Create Tables -->
            <h3 class="mb-4"><i class="fas fa-table me-2"></i> Create Database Tables</h3>
            
            <p class="text-muted">The installer will now create all necessary database tables for SUB4SUB.</p>
            
            <div class="alert alert-info">
                <i class="fas fa-info-circle me-2"></i>
                <strong>Tables to be created:</strong>
                <ul class="mb-0 mt-2">
                    <li>users</li>
                    <li>subscriptions</li>
                    <li>payments</li>
                    <li>notifications</li>
                    <li>activity_logs</li>
                    <li>settings</li>
                    <li>points</li>
                    <li>api_tokens</li>
                </ul>
            </div>

            <form method="POST">
                <button type="submit" name="step2" class="btn btn-primary w-100">
                    <i class="fas fa-magic me-2"></i> Create Tables
                </button>
            </form>

        <?php elseif ($step == 3): ?>
            <!-- Step 3: Admin Account & Settings -->
            <h3 class="mb-4"><i class="fas fa-user-shield me-2"></i> Admin Account & Settings</h3>

            <form method="POST">
                <h5 class="mb-3">Site Settings</h5>
                
                <div class="mb-3">
                    <label class="form-label">Site Name</label>
                    <input type="text" class="form-control" name="site_name" value="SUB4SUB" required>
                </div>

                <div class="mb-3">
                    <label class="form-label">Site URL</label>
                    <input type="url" class="form-control" name="site_url" value="<?= (isset($_SERVER['HTTPS']) ? 'https' : 'http') . '://' . $_SERVER['HTTP_HOST'] . dirname($_SERVER['PHP_SELF']) ?>" required>
                    <small class="text-muted">No trailing slash</small>
                </div>

                <hr class="my-4">
                <h5 class="mb-3">Admin Account</h5>

                <div class="mb-3">
                    <label class="form-label">Admin Username</label>
                    <input type="text" class="form-control" name="admin_username" value="admin" required>
                </div>

                <div class="mb-3">
                    <label class="form-label">Admin Email</label>
                    <input type="email" class="form-control" name="admin_email" required>
                </div>

                <div class="mb-3">
                    <label class="form-label">Admin Password</label>
                    <input type="password" class="form-control" name="admin_password" required minlength="8">
                    <small class="text-muted">Minimum 8 characters</small>
                </div>

                <div class="alert alert-warning">
                    <i class="fas fa-lock me-2"></i>
                    <strong>Important:</strong> Remember these credentials! You'll need them to access the admin panel.
                </div>

                <button type="submit" name="step3" class="btn btn-primary w-100">
                    <i class="fas fa-arrow-right me-2"></i> Create Admin & Continue
                </button>
            </form>

        <?php elseif ($step == 4): ?>
            <!-- Step 4: Finalize -->
            <h3 class="mb-4"><i class="fas fa-cog me-2"></i> Finalize Installation</h3>

            <p class="text-muted">Almost done! Click below to create your configuration file and complete the installation.</p>

            <div class="alert alert-info">
                <i class="fas fa-info-circle me-2"></i>
                <strong>What happens next:</strong>
                <ul class="mb-0 mt-2">
                    <li>Create .env configuration file</li>
                    <li>Generate security keys</li>
                    <li>Lock installation wizard</li>
                    <li>Prepare your site for launch</li>
                </ul>
            </div>

            <form method="POST">
                <button type="submit" name="step4" class="btn btn-primary w-100 btn-lg">
                    <i class="fas fa-check-circle me-2"></i> Complete Installation
                </button>
            </form>

        <?php elseif ($step == 5): ?>
            <!-- Step 5: Success -->
            <div class="success-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            
            <h3 class="text-center mb-4">Installation Complete! 🎉</h3>
            
            <p class="text-center text-muted mb-4">
                SUB4SUB v2.0 has been successfully installed and configured.
            </p>

            <div class="alert alert-success">
                <i class="fas fa-check-circle me-2"></i>
                <strong>Installation Summary:</strong>
                <ul class="mb-0 mt-2">
                    <li>Database created and configured</li>
                    <li>All tables created successfully</li>
                    <li>Admin account created</li>
                    <li>Environment configured</li>
                    <li>Security keys generated</li>
                </ul>
            </div>

            <div class="alert alert-warning">
                <i class="fas fa-exclamation-triangle me-2"></i>
                <strong>Optional Configuration:</strong>
                <p class="mb-2">To enable additional features, edit your <code>.env</code> file:</p>
                <ul class="mb-0">
                    <li><strong>Email:</strong> Configure SMTP settings</li>
                    <li><strong>Payments:</strong> Add Stripe or PayPal API keys</li>
                </ul>
                <p class="mb-0 mt-2"><small>The app works perfectly without these - they're completely optional!</small></p>
            </div>

            <div class="text-center mt-4">
                <a href="index.php" class="btn btn-success btn-lg me-2">
                    <i class="fas fa-home me-2"></i> Visit Website
                </a>
                <a href="Admin/login.php" class="btn btn-primary btn-lg">
                    <i class="fas fa-user-shield me-2"></i> Admin Panel
                </a>
            </div>

            <div class="text-center mt-4">
                <p class="text-muted small">
                    <i class="fas fa-info-circle me-1"></i>
                    For security, the install.php file should be deleted or renamed.
                </p>
            </div>
        <?php endif; ?>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
