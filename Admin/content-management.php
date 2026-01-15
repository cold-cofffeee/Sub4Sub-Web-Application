<?php
/**
 * Admin - Content Management
 * Central hub for managing all site content
 */

session_start();
require_once '../config/config.php';
require_once '../classes/Database.php';

if (!isset($_SESSION['admin_id'])) {
    header('Location: login.php');
    exit;
}

$pageTitle = 'Content Management - Admin';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= $pageTitle ?></title>
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
                    <a class="nav-link" href="settings.php">
                        <i class="fas fa-cog me-2"></i> Settings
                    </a>
                    <a class="nav-link active" href="content-management.php">
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
            <h2 class="mb-4">Content Management</h2>
            <p class="text-muted mb-4">Manage all static pages and content across your site</p>

            <div class="row g-4">
                <!-- About Page -->
                <div class="col-md-6">
                    <div class="card-modern h-100">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <div>
                                <h5><i class="fas fa-info-circle text-primary me-2"></i> About Page</h5>
                                <p class="text-muted small mb-0">Manage your about us content</p>
                            </div>
                            <span class="badge bg-success">Active</span>
                        </div>
                        <div class="d-flex gap-2">
                            <a href="content-about.php" class="btn btn-primary">
                                <i class="fas fa-edit"></i> Edit Content
                            </a>
                            <a href="../about.php" target="_blank" class="btn btn-outline-secondary">
                                <i class="fas fa-external-link-alt"></i> Preview
                            </a>
                        </div>
                    </div>
                </div>

                <!-- Contact Page -->
                <div class="col-md-6">
                    <div class="card-modern h-100">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <div>
                                <h5><i class="fas fa-envelope text-info me-2"></i> Contact Page</h5>
                                <p class="text-muted small mb-0">Manage contact information</p>
                            </div>
                            <span class="badge bg-success">Active</span>
                        </div>
                        <div class="d-flex gap-2">
                            <a href="content-contact.php" class="btn btn-primary">
                                <i class="fas fa-edit"></i> Edit Content
                            </a>
                            <a href="../contact.php" target="_blank" class="btn btn-outline-secondary">
                                <i class="fas fa-external-link-alt"></i> Preview
                            </a>
                        </div>
                    </div>
                </div>

                <!-- FAQ Page -->
                <div class="col-md-6">
                    <div class="card-modern h-100">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <div>
                                <h5><i class="fas fa-question-circle text-warning me-2"></i> FAQ Page</h5>
                                <p class="text-muted small mb-0">Frequently asked questions</p>
                            </div>
                            <span class="badge bg-success">Active</span>
                        </div>
                        <div class="d-flex gap-2">
                            <a href="content-faq.php" class="btn btn-primary">
                                <i class="fas fa-edit"></i> Edit Content
                            </a>
                            <a href="../faq.php" target="_blank" class="btn btn-outline-secondary">
                                <i class="fas fa-external-link-alt"></i> Preview
                            </a>
                        </div>
                    </div>
                </div>

                <!-- Privacy Policy -->
                <div class="col-md-6">
                    <div class="card-modern h-100">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <div>
                                <h5><i class="fas fa-shield-alt text-success me-2"></i> Privacy Policy</h5>
                                <p class="text-muted small mb-0">Privacy policy content</p>
                            </div>
                            <span class="badge bg-success">Active</span>
                        </div>
                        <div class="d-flex gap-2">
                            <a href="content-privacy.php" class="btn btn-primary">
                                <i class="fas fa-edit"></i> Edit Content
                            </a>
                            <a href="../privacy.php" target="_blank" class="btn btn-outline-secondary">
                                <i class="fas fa-external-link-alt"></i> Preview
                            </a>
                        </div>
                    </div>
                </div>

                <!-- Terms of Service -->
                <div class="col-md-6">
                    <div class="card-modern h-100">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <div>
                                <h5><i class="fas fa-file-contract text-danger me-2"></i> Terms of Service</h5>
                                <p class="text-muted small mb-0">Terms and conditions</p>
                            </div>
                            <span class="badge bg-success">Active</span>
                        </div>
                        <div class="d-flex gap-2">
                            <a href="content-tos.php" class="btn btn-primary">
                                <i class="fas fa-edit"></i> Edit Content
                            </a>
                            <a href="../tos.php" target="_blank" class="btn btn-outline-secondary">
                                <i class="fas fa-external-link-alt"></i> Preview
                            </a>
                        </div>
                    </div>
                </div>

                <!-- Home Page -->
                <div class="col-md-6">
                    <div class="card-modern h-100">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <div>
                                <h5><i class="fas fa-home text-primary me-2"></i> Home Page</h5>
                                <p class="text-muted small mb-0">Landing page content</p>
                            </div>
                            <span class="badge bg-success">Active</span>
                        </div>
                        <div class="d-flex gap-2">
                            <a href="../index.php" class="btn btn-outline-primary">
                                <i class="fas fa-code"></i> Edit Code
                            </a>
                            <a href="../index.php" target="_blank" class="btn btn-outline-secondary">
                                <i class="fas fa-external-link-alt"></i> Preview
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Additional Tools -->
            <div class="card-modern mt-4">
                <h5 class="mb-3">Additional Content Tools</h5>
                <div class="row g-3">
                    <div class="col-md-4">
                        <button class="btn btn-outline-info w-100" onclick="alert('Feature coming soon!')">
                            <i class="fas fa-blog me-2"></i> Manage Blog Posts
                        </button>
                    </div>
                    <div class="col-md-4">
                        <button class="btn btn-outline-success w-100" onclick="alert('Feature coming soon!')">
                            <i class="fas fa-bullhorn me-2"></i> Announcements
                        </button>
                    </div>
                    <div class="col-md-4">
                        <button class="btn btn-outline-warning w-100" onclick="alert('Feature coming soon!')">
                            <i class="fas fa-palette me-2"></i> Theme Settings
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
