<?php
/**
 * Admin Login
 * Professional admin authentication
 */

session_start();
require_once '../config/config.php';
require_once '../classes/Database.php';
require_once '../classes/Security.php';

// If already logged in, redirect to dashboard
if (isset($_SESSION['admin_id'])) {
    header('Location: dashboard.php');
    exit;
}

$message = '';
$messageType = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';
    
    // Simple admin authentication (in production, use database with hashed passwords)
    $adminUsername = getenv('ADMIN_USERNAME') ?: (defined('ADMIN_USERNAME') ? ADMIN_USERNAME : 'admin');
    $adminPassword = getenv('ADMIN_PASSWORD') ?: (defined('ADMIN_PASSWORD') ? ADMIN_PASSWORD : 'admin123');
    
    if ($username === $adminUsername && $password === $adminPassword) {
        $_SESSION['admin_id'] = 1;
        $_SESSION['admin_username'] = $username;
        
        Security::logActivity(null, 'admin_login', 'Admin logged in: ' . $username);
        
        header('Location: dashboard.php');
        exit;
    } else {
        $message = 'Invalid username or password';
        $messageType = 'error';
        
        Security::logActivity(null, 'admin_login_failed', 'Failed admin login attempt: ' . $username);
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Login - SUB4SUB</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <link href="../assets/css/style.css" rel="stylesheet">
    <style>
        body {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .login-card {
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            max-width: 450px;
            width: 100%;
        }
    </style>
</head>
<body>

<div class="login-card p-5">
    <div class="text-center mb-4">
        <i class="fas fa-crown fa-3x text-warning mb-3"></i>
        <h2 class="fw-bold">Admin Panel</h2>
        <p class="text-muted">Sign in to access the dashboard</p>
    </div>

    <?php if ($message): ?>
        <div class="alert alert-<?= $messageType === 'error' ? 'danger' : 'success' ?> alert-dismissible fade show" role="alert">
            <?= htmlspecialchars($message) ?>
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    <?php endif; ?>

    <form method="POST">
        <div class="mb-3">
            <label class="form-label">Username</label>
            <div class="input-group">
                <span class="input-group-text"><i class="fas fa-user"></i></span>
                <input type="text" class="form-control" name="username" required autofocus>
            </div>
        </div>

        <div class="mb-4">
            <label class="form-label">Password</label>
            <div class="input-group">
                <span class="input-group-text"><i class="fas fa-lock"></i></span>
                <input type="password" class="form-control" name="password" required>
            </div>
        </div>

        <button type="submit" class="btn btn-primary w-100 btn-lg">
            <i class="fas fa-sign-in-alt me-2"></i> Sign In
        </button>
    </form>

    <div class="text-center mt-4">
        <a href="../index.php" class="text-muted text-decoration-none">
            <i class="fas fa-arrow-left me-1"></i> Back to Website
        </a>
    </div>

    <div class="alert alert-info mt-4 small">
        <i class="fas fa-info-circle me-2"></i>
        <strong>Default Credentials:</strong> admin / admin123 (Change in .env file)
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
