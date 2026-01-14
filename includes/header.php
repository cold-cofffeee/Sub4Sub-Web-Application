<?php
/**
 * Modern Header Template
 * Professional and responsive header with enhanced UI
 */

// Load configuration
require_once __DIR__ . '/../config/config.php';

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Helper function to check if user is logged in
function isLoggedIn() {
    return isset($_SESSION['user_id']);
}

// Helper function to check if user is admin
function isAdmin() {
    return isset($_SESSION['is_admin']) && $_SESSION['is_admin'] === true;
}

// Get current page
$currentPage = basename($_SERVER['PHP_SELF'], '.php');

// Get user data if logged in
$userData = null;
if (isLoggedIn()) {
    require_once __DIR__ . '/../classes/Database.php';
    require_once __DIR__ . '/../classes/User.php';
    $userData = User::find($_SESSION['user_id']);
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    
    <!-- Primary Meta Tags -->
    <title><?= $pageTitle ?? 'SUB4SUB - Boost Your YouTube Channel' ?></title>
    <meta name="title" content="SUB4SUB - Get Unlimited Subscribers to Your YouTube Channel">
    <meta name="description" content="Grow your YouTube channel organically with SUB4SUB. Exchange subscriptions with real users and boost your channel's growth instantly.">
    <meta name="keywords" content="youtube subscribers, sub4sub, youtube growth, free subscribers, youtube marketing, channel promotion">
    <meta name="robots" content="index, follow">
    <meta name="language" content="English">
    <meta name="author" content="SUB4SUB Team">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="<?= APP_URL ?>">
    <meta property="og:title" content="SUB4SUB - Boost Your YouTube Channel">
    <meta property="og:description" content="Grow your YouTube channel organically with SUB4SUB.">
    <meta property="og:image" content="<?= APP_URL ?>/assets/images/og-image.jpg">
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="<?= APP_URL ?>">
    <meta property="twitter:title" content="SUB4SUB - Boost Your YouTube Channel">
    <meta property="twitter:description" content="Grow your YouTube channel organically with SUB4SUB.">
    <meta property="twitter:image" content="<?= APP_URL ?>/assets/images/og-image.jpg">
    
    <!-- Favicon -->
    <link rel="icon" type="image/png" sizes="32x32" href="<?= APP_URL ?>/assets/images/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="<?= APP_URL ?>/assets/images/favicon-16x16.png">
    <link rel="apple-touch-icon" href="<?= APP_URL ?>/assets/images/apple-touch-icon.png">
    
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Poppins:wght@600;700;800&display=swap" rel="stylesheet">
    
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <!-- Bootstrap 5 -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    
    <!-- Custom Styles -->
    <link rel="stylesheet" href="<?= APP_URL ?>/assets/css/style.css">
    
    <!-- Additional page-specific styles -->
    <?= $additionalStyles ?? '' ?>
</head>
<body>
    <!-- Navigation Bar -->
    <nav class="navbar-modern">
        <div class="container-modern">
            <div class="d-flex justify-content-between align-items-center">
                <!-- Brand Logo -->
                <a href="index.php" class="navbar-brand-modern">
                    <i class="fas fa-rocket"></i> SUB4SUB
                </a>
                
                <!-- Mobile Menu Toggle -->
                <button class="btn d-lg-none" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent">
                    <i class="fas fa-bars"></i>
                </button>
                
                <!-- Navigation Links -->
                <div class="collapse navbar-collapse" id="navbarContent">
                    <ul class="navbar-nav ms-auto mb-2 mb-lg-0 d-flex align-items-center gap-2">
                        <li class="nav-item">
                            <a class="nav-link-modern <?= $currentPage === 'index' ? 'active' : '' ?>" href="index.php">
                                <i class="fas fa-home"></i> Home
                            </a>
                        </li>
                        
                        <?php if (isLoggedIn()): ?>
                            <li class="nav-item">
                                <a class="nav-link-modern <?= $currentPage === 'sub4sub' ? 'active' : '' ?>" href="sub4sub.php">
                                    <i class="fas fa-users"></i> SUB4SUB
                                </a>
                            </li>
                            
                            <li class="nav-item">
                                <a class="nav-link-modern <?= $currentPage === 'account' ? 'active' : '' ?>" href="account.php">
                                    <i class="fas fa-user-circle"></i> Dashboard
                                </a>
                            </li>
                            
                            <?php if (isAdmin()): ?>
                                <li class="nav-item">
                                    <a class="nav-link-modern" href="Admin/adminDashboard.php">
                                        <i class="fas fa-cog"></i> Admin
                                    </a>
                                </li>
                            <?php endif; ?>
                            
                            <li class="nav-item">
                                <a class="nav-link-modern" href="notification.php">
                                    <i class="fas fa-bell"></i>
                                    <?php 
                                    // Show notification badge if there are unread notifications
                                    if (isset($_SESSION['unread_notifications']) && $_SESSION['unread_notifications'] > 0): 
                                    ?>
                                        <span class="badge-modern badge-danger-modern"><?= $_SESSION['unread_notifications'] ?></span>
                                    <?php endif; ?>
                                </a>
                            </li>
                        <?php else: ?>
                            <li class="nav-item">
                                <a class="nav-link-modern <?= $currentPage === 'about' ? 'active' : '' ?>" href="about.php">
                                    <i class="fas fa-info-circle"></i> About
                                </a>
                            </li>
                            
                            <li class="nav-item">
                                <a class="nav-link-modern <?= $currentPage === 'contact' ? 'active' : '' ?>" href="contact.php">
                                    <i class="fas fa-envelope"></i> Contact
                                </a>
                            </li>
                        <?php endif; ?>
                        
                        <li class="nav-item">
                            <a class="nav-link-modern <?= $currentPage === 'faq' ? 'active' : '' ?>" href="faq.php">
                                <i class="fas fa-question-circle"></i> FAQ
                            </a>
                        </li>
                        
                        <?php if (isLoggedIn()): ?>
                            <!-- User Dropdown -->
                            <li class="nav-item dropdown">
                                <a class="nav-link-modern dropdown-toggle" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown">
                                    <?php if ($userData && $userData->getProfilePicture()): ?>
                                        <img src="<?= htmlspecialchars($userData->getProfilePicture()) ?>" alt="Profile" class="rounded-circle" width="30" height="30">
                                    <?php else: ?>
                                        <i class="fas fa-user-circle"></i>
                                    <?php endif; ?>
                                    <?= htmlspecialchars($userData ? $userData->getUsername() : 'User') ?>
                                </a>
                                <ul class="dropdown-menu dropdown-menu-end">
                                    <li><a class="dropdown-item" href="account.php"><i class="fas fa-user"></i> Profile</a></li>
                                    <li><a class="dropdown-item" href="account.php?tab=settings"><i class="fas fa-cog"></i> Settings</a></li>
                                    <?php if ($userData && $userData->isPremium()): ?>
                                        <li><span class="dropdown-item"><i class="fas fa-crown text-warning"></i> Premium Member</span></li>
                                    <?php else: ?>
                                        <li><a class="dropdown-item" href="purchase.php"><i class="fas fa-crown"></i> Upgrade to Premium</a></li>
                                    <?php endif; ?>
                                    <li><hr class="dropdown-divider"></li>
                                    <li>
                                        <form action="functions/logout.php" method="post" class="d-inline">
                                            <button type="submit" class="dropdown-item text-danger">
                                                <i class="fas fa-sign-out-alt"></i> Logout
                                            </button>
                                        </form>
                                    </li>
                                </ul>
                            </li>
                        <?php else: ?>
                            <li class="nav-item">
                                <a href="account.php" class="btn-modern btn-primary-modern">
                                    <i class="fas fa-sign-in-alt"></i> Login
                                </a>
                            </li>
                        <?php endif; ?>
                    </ul>
                </div>
            </div>
        </div>
    </nav>
    
    <!-- Main Content Container -->
    <main class="container-modern mt-4">
