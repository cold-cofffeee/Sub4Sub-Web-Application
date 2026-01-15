<?php
/**
 * Admin - Payments Management
 * Professional payment management interface
 */

session_start();
require_once '../config/config.php';
require_once '../classes/Database.php';

if (!isset($_SESSION['admin_id'])) {
    header('Location: login.php');
    exit;
}

$db = Database::getInstance();
$message = '';
$messageType = '';

// Get all payments
try {
    $payments = $db->query("
        SELECT p.*, u.username, u.email 
        FROM payments p 
        LEFT JOIN users u ON p.user_id = u.id 
        ORDER BY p.created_at DESC
    ")->fetchAll();
} catch (Exception $e) {
    $payments = [];
    $message = 'Database not ready. Please run installation first.';
    $messageType = 'warning';
}

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payments Management - SUB4SUB Admin</title>
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
                    <a class="nav-link" href="verify-users.php">
                        <i class="fas fa-user-check me-2"></i> Verify Users
                    </a>
                    <a class="nav-link active" href="payments.php">
                        <i class="fas fa-credit-card me-2"></i> Payments
                    </a>
                    <a class="nav-link" href="settings.php">
                        <i class="fas fa-cog me-2"></i> Settings
                    </a>
                    <a class="nav-link" href="content-management.php">
                        <i class="fas fa-edit me-2"></i> Content
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
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2><i class="fas fa-credit-card me-2"></i> Payments Management</h2>
            </div>

            <?php if ($message): ?>
                <div class="alert alert-<?= $messageType ?> alert-dismissible fade show">
                    <?= htmlspecialchars($message) ?>
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
            <?php endif; ?>

            <!-- Payments Table -->
            <div class="card shadow-sm">
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>User</th>
                                    <th>Amount</th>
                                    <th>Plan</th>
                                    <th>Status</th>
                                    <th>Payment Method</th>
                                    <th>Transaction ID</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php if (!empty($payments)): ?>
                                    <?php foreach ($payments as $payment): ?>
                                        <tr>
                                            <td>#<?= htmlspecialchars($payment['id']) ?></td>
                                            <td>
                                                <strong><?= htmlspecialchars($payment['username'] ?? 'N/A') ?></strong><br>
                                                <small class="text-muted"><?= htmlspecialchars($payment['email'] ?? '') ?></small>
                                            </td>
                                            <td><strong>$<?= number_format($payment['amount'], 2) ?></strong></td>
                                            <td><?= htmlspecialchars($payment['plan_name'] ?? 'N/A') ?></td>
                                            <td>
                                                <?php
                                                $statusClass = [
                                                    'completed' => 'success',
                                                    'pending' => 'warning',
                                                    'failed' => 'danger',
                                                    'refunded' => 'secondary'
                                                ];
                                                $status = $payment['status'] ?? 'pending';
                                                ?>
                                                <span class="badge bg-<?= $statusClass[$status] ?? 'secondary' ?>">
                                                    <?= ucfirst($status) ?>
                                                </span>
                                            </td>
                                            <td><?= htmlspecialchars($payment['payment_method'] ?? 'N/A') ?></td>
                                            <td><small><?= htmlspecialchars($payment['transaction_id'] ?? 'N/A') ?></small></td>
                                            <td><?= date('M d, Y', strtotime($payment['created_at'])) ?></td>
                                        </tr>
                                    <?php endforeach; ?>
                                <?php else: ?>
                                    <tr>
                                        <td colspan="8" class="text-center py-4">
                                            <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
                                            <p class="text-muted">No payments found</p>
                                        </td>
                                    </tr>
                                <?php endif; ?>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
                        <h5><?php echo htmlspecialchars($request['username']); ?></h5>
                        <p><?php echo htmlspecialchars($request['message']); ?></p>
                        <span class="text-muted">Requested on <?php echo $request['created_at']; ?></span>

                        <form action="adminPayment.php" method="post" class="mt-3">
                            <input type="hidden" name="csrf_token" value="<?php echo $_SESSION['csrf_token']; ?>">
                            <input type="hidden" name="user_id" value="<?php echo $request['user_id']; ?>">
                            <input type="hidden" name="original_message" value="<?php echo $request['message']; ?>">
                            <input type="hidden" name="package" value="<?php echo $request['package']; ?>">
                            <input type="hidden" name="request_id" value="<?php echo $request['id']; ?>">

                            <div class="mb-3">
                                <label for="reply_message_<?php echo $request['id']; ?>" class="form-label">Reply Message</label>
                                <textarea name="reply_message" id="reply_message_<?php echo $request['id']; ?>" class="form-control" rows="3" required></textarea>
                            </div>
                            <button type="submit" class="btn btn-primary">Send Reply</button>
                        </form>
                    </li>
                <?php endforeach; ?>
            </ul>
        <?php else: ?>
            <div class="alert alert-info">
                No unread requests found.
            </div>
        <?php endif; ?>

        <!-- Replied Messages Section -->
        <h2>Replied Requests</h2>
        <?php if (!empty($repliedRequests)): ?>
            <ul class="list-group">
                <?php foreach ($repliedRequests as $request): ?>
                    <li class="list-group-item">
                        <h5><?php echo htmlspecialchars($request['username']); ?></h5>
                        <p><?php echo htmlspecialchars($request['message']); ?></p>
                        <span class="text-muted">Requested on <?php echo $request['created_at']; ?></span>
                    </li>
                <?php endforeach; ?>
            </ul>
        <?php else: ?>
            <div class="alert alert-info">
                No replied requests found.
            </div>
        <?php endif; ?>
    </div>
</body>
</html>

<?php include '../functions/footer.php'; ?>
