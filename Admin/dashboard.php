<?php
/**
 * Admin Panel - Dashboard
 * Professional administrative interface
 */

session_start();
require_once '../config/config.php';
require_once '../classes/Database.php';
require_once '../classes/User.php';
require_once '../classes/Security.php';

// Check if admin is logged in
if (!isset($_SESSION['admin_id'])) {
    header('Location: login.php');
    exit;
}

$db = Database::getInstance();
$pageTitle = 'Admin Dashboard - SUB4SUB';

// Get statistics
$stats = [
    'total_users' => $db->query("SELECT COUNT(*) as count FROM users")->fetch()['count'],
    'premium_users' => $db->query("SELECT COUNT(*) as count FROM users WHERE is_premium = 1")->fetch()['count'],
    'total_subscriptions' => $db->query("SELECT COUNT(*) as count FROM subscriptions")->fetch()['count'],
    'total_revenue' => $db->query("SELECT SUM(amount) as total FROM payments WHERE status = 'completed'")->fetch()['total'] ?? 0,
    'new_users_today' => $db->query("SELECT COUNT(*) as count FROM users WHERE DATE(created_at) = CURDATE()")->fetch()['count'],
    'active_users' => $db->query("SELECT COUNT(*) as count FROM users WHERE last_login >= DATE_SUB(NOW(), INTERVAL 7 DAY)")->fetch()['count']
];

// Get recent users
$recentUsers = $db->query("SELECT id, username, email, created_at, is_premium FROM users ORDER BY created_at DESC LIMIT 10")->fetchAll();

// Get recent payments
$recentPayments = $db->query("SELECT p.*, u.username, u.email FROM payments p JOIN users u ON p.user_id = u.id ORDER BY p.created_at DESC LIMIT 10")->fetchAll();

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
        .stat-card {
            border-left: 4px solid;
            transition: transform 0.3s;
        }
        .stat-card:hover {
            transform: translateY(-5px);
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
                    <a class="nav-link active" href="dashboard.php">
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
                    <a class="nav-link" href="content-management.php">
                        <i class="fas fa-edit me-2"></i> Content
                    </a>
                    <a class="nav-link" href="logs.php">
                        <i class="fas fa-file-alt me-2"></i> Activity Logs
                    </a>
                    <hr class="bg-white">
                    <a class="nav-link" href="../index.php" target="_blank">
                        <i class="fas fa-external-link-alt me-2"></i> View Site
                    </a>
                    <a class="nav-link" href="logout.php">
                        <i class="fas fa-sign-out-alt me-2"></i> Logout
                    </a>
                </nav>
            </div>
        </div>

        <!-- Main Content -->
        <div class="col-md-10 p-4">
            <!-- Header -->
            <div class="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2>Dashboard</h2>
                    <p class="text-muted">Welcome back, Admin! Here's what's happening today.</p>
                </div>
                <div>
                    <span class="badge bg-success me-2"><i class="fas fa-circle me-1"></i> Online</span>
                    <span class="text-muted"><?= date('F d, Y') ?></span>
                </div>
            </div>

            <!-- Statistics Cards -->
            <div class="row g-4 mb-4">
                <div class="col-md-3">
                    <div class="card-modern stat-card" style="border-left-color: #667eea;">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <p class="text-muted mb-1">Total Users</p>
                                <h3 class="fw-bold"><?= number_format($stats['total_users']) ?></h3>
                                <small class="text-success">
                                    <i class="fas fa-arrow-up"></i> <?= $stats['new_users_today'] ?> today
                                </small>
                            </div>
                            <i class="fas fa-users fa-2x text-primary"></i>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-3">
                    <div class="card-modern stat-card" style="border-left-color: #ffc107;">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <p class="text-muted mb-1">Premium Users</p>
                                <h3 class="fw-bold"><?= number_format($stats['premium_users']) ?></h3>
                                <small class="text-muted">
                                    <?= round(($stats['premium_users'] / max($stats['total_users'], 1)) * 100, 1) ?>% of total
                                </small>
                            </div>
                            <i class="fas fa-crown fa-2x text-warning"></i>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-3">
                    <div class="card-modern stat-card" style="border-left-color: #28a745;">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <p class="text-muted mb-1">Total Revenue</p>
                                <h3 class="fw-bold">$<?= number_format($stats['total_revenue'], 2) ?></h3>
                                <small class="text-muted">All-time earnings</small>
                            </div>
                            <i class="fas fa-dollar-sign fa-2x text-success"></i>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-3">
                    <div class="card-modern stat-card" style="border-left-color: #17a2b8;">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <p class="text-muted mb-1">Subscriptions</p>
                                <h3 class="fw-bold"><?= number_format($stats['total_subscriptions']) ?></h3>
                                <small class="text-muted">Total exchanges</small>
                            </div>
                            <i class="fas fa-exchange-alt fa-2x text-info"></i>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Recent Activity -->
            <div class="row g-4">
                <!-- Recent Users -->
                <div class="col-md-6">
                    <div class="card-modern">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h5 class="mb-0">Recent Users</h5>
                            <a href="users.php" class="btn btn-sm btn-outline-primary">View All</a>
                        </div>
                        <div class="table-responsive">
                            <table class="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Username</th>
                                        <th>Email</th>
                                        <th>Status</th>
                                        <th>Joined</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php foreach ($recentUsers as $user): ?>
                                    <tr>
                                        <td><?= htmlspecialchars($user['username']) ?></td>
                                        <td><?= htmlspecialchars($user['email']) ?></td>
                                        <td>
                                            <?php if ($user['is_premium']): ?>
                                                <span class="badge bg-warning"><i class="fas fa-crown"></i> Premium</span>
                                            <?php else: ?>
                                                <span class="badge bg-secondary">Free</span>
                                            <?php endif; ?>
                                        </td>
                                        <td><?= date('M d, Y', strtotime($user['created_at'])) ?></td>
                                    </tr>
                                    <?php endforeach; ?>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- Recent Payments -->
                <div class="col-md-6">
                    <div class="card-modern">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h5 class="mb-0">Recent Payments</h5>
                            <a href="payments.php" class="btn btn-sm btn-outline-success">View All</a>
                        </div>
                        <div class="table-responsive">
                            <table class="table table-hover">
                                <thead>
                                    <tr>
                                        <th>User</th>
                                        <th>Amount</th>
                                        <th>Method</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php foreach ($recentPayments as $payment): ?>
                                    <tr>
                                        <td><?= htmlspecialchars($payment['username']) ?></td>
                                        <td class="fw-bold text-success">$<?= number_format($payment['amount'], 2) ?></td>
                                        <td>
                                            <span class="badge bg-info"><?= strtoupper($payment['payment_method']) ?></span>
                                        </td>
                                        <td><?= date('M d, Y', strtotime($payment['created_at'])) ?></td>
                                    </tr>
                                    <?php endforeach; ?>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="row g-4 mt-4">
                <div class="col-md-12">
                    <div class="card-modern">
                        <h5 class="mb-3">Quick Actions</h5>
                        <div class="row g-3">
                            <div class="col-md-3">
                                <a href="users.php?action=add" class="btn btn-primary w-100">
                                    <i class="fas fa-user-plus me-2"></i> Add New User
                                </a>
                            </div>
                            <div class="col-md-3">
                                <a href="settings.php" class="btn btn-secondary w-100">
                                    <i class="fas fa-cog me-2"></i> Site Settings
                                </a>
                            </div>
                            <div class="col-md-3">
                                <a href="content-management.php" class="btn btn-info w-100">
                                    <i class="fas fa-edit me-2"></i> Edit Content
                                </a>
                            </div>
                            <div class="col-md-3">
                                <a href="logs.php" class="btn btn-warning w-100">
                                    <i class="fas fa-file-alt me-2"></i> View Logs
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
<script src="../assets/js/app.js"></script>
</body>
</html>
