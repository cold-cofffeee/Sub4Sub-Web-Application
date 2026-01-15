<?php
/**
 * Admin - Users Management
 * Professional user management interface
 */

session_start();
require_once '../config/config.php';
require_once '../classes/Database.php';
require_once '../classes/User.php';
require_once '../classes/Security.php';

if (!isset($_SESSION['admin_id'])) {
    header('Location: login.php');
    exit;
}

$db = Database::getInstance();
$message = '';
$messageType = '';

// Handle user actions
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    $userId = $_POST['user_id'] ?? 0;
    
    switch ($action) {
        case 'ban':
            $db->update('users', ['banned' => 1], 'id = ?', [$userId]);
            $message = 'User banned successfully';
            $messageType = 'success';
            Security::logActivity($userId, 'admin_ban', 'User banned by admin');
            break;
            
        case 'unban':
            $db->update('users', ['banned' => 0], 'id = ?', [$userId]);
            $message = 'User unbanned successfully';
            $messageType = 'success';
            Security::logActivity($userId, 'admin_unban', 'User unbanned by admin');
            break;
            
        case 'make_premium':
            $expiresAt = date('Y-m-d H:i:s', strtotime('+30 days'));
            $db->update('users', [
                'is_premium' => 1,
                'premium_expires_at' => $expiresAt
            ], 'id = ?', [$userId]);
            $message = 'User upgraded to premium';
            $messageType = 'success';
            Security::logActivity($userId, 'admin_premium_grant', 'Premium granted by admin');
            break;
            
        case 'remove_premium':
            $db->update('users', [
                'is_premium' => 0,
                'premium_expires_at' => null
            ], 'id = ?', [$userId]);
            $message = 'Premium status removed';
            $messageType = 'success';
            Security::logActivity($userId, 'admin_premium_revoke', 'Premium revoked by admin');
            break;
            
        case 'delete':
            $db->delete('users', 'id = ?', [$userId]);
            $message = 'User deleted successfully';
            $messageType = 'success';
            Security::logActivity($userId, 'admin_delete', 'User deleted by admin');
            break;
    }
}

// Get users with pagination
$page = $_GET['page'] ?? 1;
$perPage = 20;
$offset = ($page - 1) * $perPage;

$searchTerm = $_GET['search'] ?? '';
$filterStatus = $_GET['status'] ?? '';

$whereConditions = [];
$params = [];

if ($searchTerm) {
    $whereConditions[] = "(username LIKE ? OR email LIKE ?)";
    $params[] = "%$searchTerm%";
    $params[] = "%$searchTerm%";
}

if ($filterStatus === 'premium') {
    $whereConditions[] = "is_premium = 1";
} elseif ($filterStatus === 'banned') {
    $whereConditions[] = "banned = 1";
}

$whereClause = $whereConditions ? 'WHERE ' . implode(' AND ', $whereConditions) : '';

$totalUsers = $db->query("SELECT COUNT(*) as count FROM users $whereClause", $params)->fetch()['count'];
$users = $db->query("SELECT * FROM users $whereClause ORDER BY created_at DESC LIMIT $perPage OFFSET $offset", $params)->fetchAll();

$totalPages = ceil($totalUsers / $perPage);

$pageTitle = 'User Management - Admin';
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
                    <a class="nav-link active" href="users.php">
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
                    <a class="nav-link" href="logout.php">
                        <i class="fas fa-sign-out-alt me-2"></i> Logout
                    </a>
                </nav>
            </div>
        </div>

        <!-- Main Content -->
        <div class="col-md-10 p-4">
            <h2 class="mb-4">User Management</h2>

            <?php if ($message): ?>
                <div class="alert alert-<?= $messageType === 'error' ? 'danger' : 'success' ?> alert-dismissible fade show">
                    <?= htmlspecialchars($message) ?>
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
            <?php endif; ?>

            <!-- Filters -->
            <div class="card-modern mb-4">
                <form method="GET" class="row g-3">
                    <div class="col-md-5">
                        <input type="text" class="form-control" name="search" placeholder="Search by username or email..." value="<?= htmlspecialchars($searchTerm) ?>">
                    </div>
                    <div class="col-md-3">
                        <select class="form-select" name="status">
                            <option value="">All Users</option>
                            <option value="premium" <?= $filterStatus === 'premium' ? 'selected' : '' ?>>Premium Only</option>
                            <option value="banned" <?= $filterStatus === 'banned' ? 'selected' : '' ?>>Banned Only</option>
                        </select>
                    </div>
                    <div class="col-md-4">
                        <button type="submit" class="btn btn-primary me-2">
                            <i class="fas fa-search"></i> Search
                        </button>
                        <a href="users.php" class="btn btn-secondary">
                            <i class="fas fa-redo"></i> Reset
                        </a>
                    </div>
                </form>
            </div>

            <!-- Users Table -->
            <div class="card-modern">
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Username</th>
                                <th>Email</th>
                                <th>Status</th>
                                <th>Premium</th>
                                <th>Joined</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($users as $user): ?>
                            <tr>
                                <td><?= $user['id'] ?></td>
                                <td><?= htmlspecialchars($user['username']) ?></td>
                                <td><?= htmlspecialchars($user['email']) ?></td>
                                <td>
                                    <?php if ($user['banned']): ?>
                                        <span class="badge bg-danger">Banned</span>
                                    <?php else: ?>
                                        <span class="badge bg-success">Active</span>
                                    <?php endif; ?>
                                </td>
                                <td>
                                    <?php if ($user['is_premium']): ?>
                                        <span class="badge bg-warning"><i class="fas fa-crown"></i> Premium</span>
                                    <?php else: ?>
                                        <span class="badge bg-secondary">Free</span>
                                    <?php endif; ?>
                                </td>
                                <td><?= date('M d, Y', strtotime($user['created_at'])) ?></td>
                                <td>
                                    <div class="btn-group">
                                        <button type="button" class="btn btn-sm btn-primary dropdown-toggle" data-bs-toggle="dropdown">
                                            Actions
                                        </button>
                                        <ul class="dropdown-menu">
                                            <?php if (!$user['banned']): ?>
                                                <li>
                                                    <form method="POST" style="display:inline;">
                                                        <input type="hidden" name="action" value="ban">
                                                        <input type="hidden" name="user_id" value="<?= $user['id'] ?>">
                                                        <button type="submit" class="dropdown-item text-warning" onclick="return confirm('Ban this user?')">
                                                            <i class="fas fa-ban"></i> Ban User
                                                        </button>
                                                    </form>
                                                </li>
                                            <?php else: ?>
                                                <li>
                                                    <form method="POST" style="display:inline;">
                                                        <input type="hidden" name="action" value="unban">
                                                        <input type="hidden" name="user_id" value="<?= $user['id'] ?>">
                                                        <button type="submit" class="dropdown-item text-success">
                                                            <i class="fas fa-check"></i> Unban User
                                                        </button>
                                                    </form>
                                                </li>
                                            <?php endif; ?>
                                            
                                            <?php if (!$user['is_premium']): ?>
                                                <li>
                                                    <form method="POST" style="display:inline;">
                                                        <input type="hidden" name="action" value="make_premium">
                                                        <input type="hidden" name="user_id" value="<?= $user['id'] ?>">
                                                        <button type="submit" class="dropdown-item">
                                                            <i class="fas fa-crown"></i> Grant Premium
                                                        </button>
                                                    </form>
                                                </li>
                                            <?php else: ?>
                                                <li>
                                                    <form method="POST" style="display:inline;">
                                                        <input type="hidden" name="action" value="remove_premium">
                                                        <input type="hidden" name="user_id" value="<?= $user['id'] ?>">
                                                        <button type="submit" class="dropdown-item">
                                                            <i class="fas fa-times"></i> Remove Premium
                                                        </button>
                                                    </form>
                                                </li>
                                            <?php endif; ?>
                                            
                                            <li><hr class="dropdown-divider"></li>
                                            <li>
                                                <form method="POST" style="display:inline;">
                                                    <input type="hidden" name="action" value="delete">
                                                    <input type="hidden" name="user_id" value="<?= $user['id'] ?>">
                                                    <button type="submit" class="dropdown-item text-danger" onclick="return confirm('Delete this user permanently?')">
                                                        <i class="fas fa-trash"></i> Delete User
                                                    </button>
                                                </form>
                                            </li>
                                        </ul>
                                    </div>
                                </td>
                            </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>

                <!-- Pagination -->
                <?php if ($totalPages > 1): ?>
                <nav class="mt-3">
                    <ul class="pagination justify-content-center">
                        <?php for ($i = 1; $i <= $totalPages; $i++): ?>
                            <li class="page-item <?= $i == $page ? 'active' : '' ?>">
                                <a class="page-link" href="?page=<?= $i ?>&search=<?= urlencode($searchTerm) ?>&status=<?= urlencode($filterStatus) ?>">
                                    <?= $i ?>
                                </a>
                            </li>
                        <?php endfor; ?>
                    </ul>
                </nav>
                <?php endif; ?>
            </div>
        </div>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
