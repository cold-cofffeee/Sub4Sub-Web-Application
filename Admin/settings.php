<?php
/**
 * Admin - Settings
 * Global application settings management
 */

session_start();
require_once '../config/config.php';
require_once '../classes/Database.php';
require_once '../classes/Security.php';

if (!isset($_SESSION['admin_id'])) {
    header('Location: login.php');
    exit;
}

$db = Database::getInstance();
$message = '';
$messageType = '';

// Handle settings update
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $settings = $_POST['settings'] ?? [];
    
    foreach ($settings as $key => $value) {
        $db->query(
            "INSERT INTO settings (`key`, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = ?",
            [$key, $value, $value]
        );
    }
    
    $message = 'Settings updated successfully!';
    $messageType = 'success';
    
    Security::logActivity(null, 'admin_settings_update', 'Admin updated site settings');
}

// Get current settings
$settingsResult = $db->query("SELECT `key`, value FROM settings")->fetchAll();
$currentSettings = [];
foreach ($settingsResult as $setting) {
    $currentSettings[$setting['key']] = $setting['value'];
}

// Default values
$defaults = [
    'site_name' => 'SUB4SUB',
    'site_description' => 'Professional YouTube Subscription Exchange Platform',
    'contact_email' => 'support@sub4sub.com',
    'free_daily_limit' => '10',
    'maintenance_mode' => '0',
    'registration_enabled' => '1'
];

$settings = array_merge($defaults, $currentSettings);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Settings - Admin</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <link href="../assets/css/style.css" rel="stylesheet">
    <style>
        .admin-sidebar {
            min-height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .admin-sidebar .nav-link {
            color: rgba(255, 255, 255, 0.8);
            padding: 12px 20px;
            margin: 5px 10px;
            border-radius: 8px;
            transition: all 0.3s;
        }
        .admin-sidebar .nav-link:hover,
        .admin-sidebar .nav-link.active {
            background: rgba(255, 255, 255, 0.2);
            color: white;
        }
    </style>
</head>
<body>

<div class="container-fluid">
    <div class="row">
        <!-- Sidebar -->
        <div class="col-md-2 admin-sidebar p-0">
            <div class="p-4">
                <h4 class="mb-4"><i class="fas fa-crown me-2"></i> SUB4SUB Admin</h4>
                <nav class="nav flex-column">
                    <a class="nav-link" href="dashboard.php">
                        <i class="fas fa-tachometer-alt me-2"></i> Dashboard
                    </a>
                    <a class="nav-link" href="users.php">
                        <i class="fas fa-users me-2"></i> Users
                    </a>
                    <a class="nav-link" href="payments.php">
                        <i class="fas fa-credit-card me-2"></i> Payments
                    </a>
                    <a class="nav-link" href="subscriptions.php">
                        <i class="fas fa-exchange-alt me-2"></i> Subscriptions
                    </a>
                    <a class="nav-link active" href="settings.php">
                        <i class="fas fa-cog me-2"></i> Settings
                    </a>
                    <a class="nav-link" href="content-management.php">
                        <i class="fas fa-edit me-2"></i> Content
                    </a>
                    <a class="nav-link" href="logs.php">
                        <i class="fas fa-file-alt me-2"></i> Activity Logs
                    </a>
                    <hr class="bg-white">
                    <a class="nav-link" href="logout.php">
                        <i class="fas fa-sign-out-alt me-2"></i> Logout
                    </a>
                </nav>
            </div>
        </div>

        <!-- Main Content -->
        <div class="col-md-10 p-4">
            <h2 class="mb-4">Application Settings</h2>

            <?php if ($message): ?>
                <div class="alert alert-<?= $messageType === 'error' ? 'danger' : 'success' ?> alert-dismissible fade show">
                    <?= htmlspecialchars($message) ?>
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
            <?php endif; ?>

            <form method="POST">
                <div class="row g-4">
                    <!-- General Settings -->
                    <div class="col-md-12">
                        <div class="card-modern">
                            <h5 class="mb-4"><i class="fas fa-cog me-2"></i> General Settings</h5>
                            
                            <div class="mb-3">
                                <label class="form-label">Site Name</label>
                                <input type="text" class="form-control" name="settings[site_name]" value="<?= htmlspecialchars($settings['site_name']) ?>" required>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">Site Description</label>
                                <textarea class="form-control" name="settings[site_description]" rows="3"><?= htmlspecialchars($settings['site_description']) ?></textarea>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">Contact Email</label>
                                <input type="email" class="form-control" name="settings[contact_email]" value="<?= htmlspecialchars($settings['contact_email']) ?>" required>
                            </div>
                        </div>
                    </div>

                    <!-- User Settings -->
                    <div class="col-md-12">
                        <div class="card-modern">
                            <h5 class="mb-4"><i class="fas fa-users me-2"></i> User Settings</h5>
                            
                            <div class="mb-3">
                                <label class="form-label">Free User Daily Subscription Limit</label>
                                <input type="number" class="form-control" name="settings[free_daily_limit]" value="<?= htmlspecialchars($settings['free_daily_limit']) ?>" min="0">
                                <small class="text-muted">Set to 0 for unlimited (not recommended)</small>
                            </div>
                            
                            <div class="mb-3">
                                <div class="form-check form-switch">
                                    <input class="form-check-input" type="checkbox" name="settings[registration_enabled]" value="1" <?= $settings['registration_enabled'] ? 'checked' : '' ?>>
                                    <label class="form-check-label">Enable New User Registration</label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- System Settings -->
                    <div class="col-md-12">
                        <div class="card-modern">
                            <h5 class="mb-4"><i class="fas fa-server me-2"></i> System Settings</h5>
                            
                            <div class="mb-3">
                                <div class="form-check form-switch">
                                    <input class="form-check-input" type="checkbox" name="settings[maintenance_mode]" value="1" <?= $settings['maintenance_mode'] ? 'checked' : '' ?>>
                                    <label class="form-check-label">Maintenance Mode</label>
                                </div>
                                <small class="text-muted">When enabled, only admins can access the site</small>
                            </div>
                        </div>
                    </div>

                    <!-- Environment Configuration -->
                    <div class="col-md-12">
                        <div class="card-modern">
                            <h5 class="mb-4"><i class="fas fa-key me-2"></i> Environment Configuration</h5>
                            <p class="text-muted">Edit your <code>.env</code> file to configure these settings:</p>
                            
                            <div class="table-responsive">
                                <table class="table table-bordered">
                                    <thead>
                                        <tr>
                                            <th>Setting</th>
                                            <th>Status</th>
                                            <th>Description</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td><code>STRIPE_SECRET_KEY</code></td>
                                            <td>
                                                <?php if (getenv('STRIPE_SECRET_KEY')): ?>
                                                    <span class="badge bg-success"><i class="fas fa-check"></i> Configured</span>
                                                <?php else: ?>
                                                    <span class="badge bg-warning">Not Set</span>
                                                <?php endif; ?>
                                            </td>
                                            <td>Stripe payment gateway integration</td>
                                        </tr>
                                        <tr>
                                            <td><code>PAYPAL_CLIENT_ID</code></td>
                                            <td>
                                                <?php if (getenv('PAYPAL_CLIENT_ID')): ?>
                                                    <span class="badge bg-success"><i class="fas fa-check"></i> Configured</span>
                                                <?php else: ?>
                                                    <span class="badge bg-warning">Not Set</span>
                                                <?php endif; ?>
                                            </td>
                                            <td>PayPal payment gateway integration</td>
                                        </tr>
                                        <tr>
                                            <td><code>SMTP_HOST</code></td>
                                            <td>
                                                <?php if (getenv('SMTP_HOST')): ?>
                                                    <span class="badge bg-success"><i class="fas fa-check"></i> Configured</span>
                                                <?php else: ?>
                                                    <span class="badge bg-info">Optional</span>
                                                <?php endif; ?>
                                            </td>
                                            <td>Email service (optional - app works without it)</td>
                                        </tr>
                                        <tr>
                                            <td><code>ADMIN_USERNAME</code></td>
                                            <td>
                                                <?php if (getenv('ADMIN_USERNAME')): ?>
                                                    <span class="badge bg-success"><i class="fas fa-check"></i> Configured</span>
                                                <?php else: ?>
                                                    <span class="badge bg-danger">Using Default</span>
                                                <?php endif; ?>
                                            </td>
                                            <td>Admin panel login credentials</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            
                            <div class="alert alert-info">
                                <i class="fas fa-info-circle me-2"></i>
                                <strong>Note:</strong> Create a <code>.env</code> file based on <code>.env.example</code> to configure these settings securely.
                            </div>
                        </div>
                    </div>
                </div>

                <div class="mt-4">
                    <button type="submit" class="btn btn-primary btn-lg">
                        <i class="fas fa-save me-2"></i> Save Settings
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
