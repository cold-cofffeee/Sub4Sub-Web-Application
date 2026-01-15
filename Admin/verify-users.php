<?php
/**
 * Admin - Verify Users
 * User verification management interface
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

// Handle verification actions
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    $userId = $_POST['user_id'] ?? 0;
    
    try {
        if ($action === 'verify') {
            $db->update('users', ['is_verified' => 1], 'id = ?', [$userId]);
            $message = 'User verified successfully';
            $messageType = 'success';
        } elseif ($action === 'reject') {
            $db->update('users', ['is_verified' => 0], 'id = ?', [$userId]);
            $message = 'User verification rejected';
            $messageType = 'warning';
        }
    } catch (Exception $e) {
        $message = 'Error: ' . $e->getMessage();
        $messageType = 'danger';
    }
}

// Get unverified users
try {
    $unverifiedUsers = $db->query("
        SELECT * FROM users 
        WHERE is_verified = 0 
        ORDER BY created_at DESC
    ")->fetchAll();
} catch (Exception $e) {
    $unverifiedUsers = [];
    $message = 'Database not ready. Please run installation first.';
    $messageType = 'warning';
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Users - SUB4SUB Admin</title>
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
                    <a class="nav-link active" href="verify-users.php">
                        <i class="fas fa-user-check me-2"></i> Verify Users
                    </a>
                    <a class="nav-link" href="payments.php">
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
                <h2><i class="fas fa-user-check me-2"></i> Verify Users</h2>
            </div>

            <?php if ($message): ?>
                <div class="alert alert-<?= $messageType ?> alert-dismissible fade show">
                    <?= htmlspecialchars($message) ?>
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
            <?php endif; ?>

            <!-- Unverified Users Table -->
            <div class="card shadow-sm">
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Username</th>
                                    <th>Email</th>
                                    <th>Registered</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php if (!empty($unverifiedUsers)): ?>
                                    <?php foreach ($unverifiedUsers as $user): ?>
                                        <tr>
                                            <td>#<?= htmlspecialchars($user['id']) ?></td>
                                            <td><?= htmlspecialchars($user['username']) ?></td>
                                            <td><?= htmlspecialchars($user['email']) ?></td>
                                            <td><?= date('M d, Y', strtotime($user['created_at'])) ?></td>
                                            <td>
                                                <form method="POST" class="d-inline">
                                                    <input type="hidden" name="user_id" value="<?= $user['id'] ?>">
                                                    <input type="hidden" name="action" value="verify">
                                                    <button type="submit" class="btn btn-sm btn-success">
                                                        <i class="fas fa-check"></i> Verify
                                                    </button>
                                                </form>
                                                <form method="POST" class="d-inline">
                                                    <input type="hidden" name="user_id" value="<?= $user['id'] ?>">
                                                    <input type="hidden" name="action" value="reject">
                                                    <button type="submit" class="btn btn-sm btn-danger">
                                                        <i class="fas fa-times"></i> Reject
                                                    </button>
                                                </form>
                                            </td>
                                        </tr>
                                    <?php endforeach; ?>
                                <?php else: ?>
                                    <tr>
                                        <td colspan="5" class="text-center py-4">
                                            <i class="fas fa-check-circle fa-3x text-success mb-3"></i>
                                            <p class="text-muted">All users are verified</p>
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
                            $messageType = 'success';
                        }
                        break;

                    default:
                        $message = 'Invalid action.';
                        $messageType = 'error';
                        break;
                }
            } catch (Exception $e) {
                $message = $e->getMessage();
                $messageType = 'error';
            }
        }
    }
}

// Fetch user uploads
$stmt = $pdo->prepare("SELECT u.*, uu.id as upload_id, uu.youtube_channel_name, uu.youtube_channel_link, uu.image_path, uu.validated, uu.reverify FROM user_uploads uu JOIN users u ON uu.user_id = u.id");
$stmt->execute();
$uploads = $stmt->fetchAll();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin - Verify User Uploads</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
    <div class="container mt-5">
        <h1>Verify User Uploads</h1>
        <?php if ($message): ?>
            <div class="alert alert-<?php echo $messageType; ?>">
                <?php echo $message; ?>
            </div>
        <?php endif; ?>
        
        <h2>Pending Verifications</h2>
        <?php foreach ($uploads as $upload): ?>
            <?php if ($upload['validated'] == 0 && $upload['reverify'] == 0 && $upload['banned'] == 0): ?>
                <div class="card mb-3">
                    <div class="card-body">
                        <h5 class="card-title"><?php echo htmlspecialchars($upload['youtube_channel_name']); ?></h5>
                        <p class="card-text"><a href="<?php echo htmlspecialchars($upload['youtube_channel_link']); ?>" target="_blank">Channel Link</a></p>
                        <img src="<?php echo '../' . htmlspecialchars($upload['image_path']); ?>" alt="Uploaded Image" class="img-fluid mb-3">
                        <form action="adminVerify.php" method="post" class="d-inline">
                            <input type="hidden" name="csrf_token" value="<?php echo $_SESSION['csrf_token']; ?>">
                            <input type="hidden" name="upload_id" value="<?php echo $upload['upload_id']; ?>">
                            <input type="hidden" name="user_id" value="<?php echo $upload['id']; ?>">
                            <input type="hidden" name="action" value="validate">
                            <button type="submit" class="btn btn-success">Validate</button>
                        </form>
                        <form action="adminVerify.php" method="post" class="d-inline">
                            <input type="hidden" name="csrf_token" value="<?php echo $_SESSION['csrf_token']; ?>">
                            <input type="hidden" name="upload_id" value="<?php echo $upload['upload_id']; ?>">
                            <input type="hidden" name="user_id" value="<?php echo $upload['id']; ?>">
                            <input type="hidden" name="action" value="delete">
                            <button type="submit" class="btn btn-danger">Delete</button>
                        </form>
                        <form action="adminVerify.php" method="post" class="d-inline">
                            <input type="hidden" name="csrf_token" value="<?php echo $_SESSION['csrf_token']; ?>">
                            <input type="hidden" name="user_id" value="<?php echo $upload['id']; ?>">
                            <input type="hidden" name="action" value="ban">
                            <button type="submit" class="btn btn-warning">Ban</button>
                        </form>
                        <form action="adminVerify.php" method="post" class="d-inline">
                            <input type="hidden" name="csrf_token" value="<?php echo $_SESSION['csrf_token']; ?>">
                            <input type="hidden" name="upload_id" value="<?php echo $upload['upload_id']; ?>">
                            <input type="hidden" name="user_id" value="<?php echo $upload['id']; ?>">
                            <input type="hidden" name="action" value="review">
                            <button type="submit" class="btn btn-info">Review</button>
                        </form>
                    </div>
                </div>
            <?php endif; ?>
        <?php endforeach; ?>

        <h2>Validated Uploads</h2>
        <?php foreach ($uploads as $upload): ?>
            <?php if ($upload['validated'] == 1): ?>
                <div class="card mb-3">
                    <div class="card-body">
                        <h5 class="card-title"><?php echo htmlspecialchars($upload['youtube_channel_name']); ?></h5>
                        <p class="card-text"><a href="<?php echo htmlspecialchars($upload['youtube_channel_link']); ?>" target="_blank">Channel Link</a></p>
                        <img src="<?php echo '../' . htmlspecialchars($upload['image_path']); ?>" alt="Uploaded Image" class="img-fluid mb-3">
                    </div>
                </div>
            <?php endif; ?>
        <?php endforeach; ?>

        <h2>Banned Users</h2>
        <?php foreach ($uploads as $upload): ?>
            <?php if ($upload['banned'] == 1): ?>
                <div class="card mb-3">
                    <div class="card-body">
                        <h5 class="card-title"><?php echo htmlspecialchars($upload['full_name']); ?> (<?php echo htmlspecialchars($upload['email']); ?>)</h5>
                        <p class="card-text">YouTube Channel: <?php echo htmlspecialchars($upload['youtube_channel_name']); ?></p>
                    </div>
                </div>
            <?php endif; ?>
        <?php endforeach; ?>

        <h2>Reverify Records</h2>
        <?php foreach ($uploads as $upload): ?>
            <?php if ($upload['reverify'] == 1): ?>
                <div class="card mb-3">
                    <div class="card-body">
                        <h5 class="card-title"><?php echo htmlspecialchars($upload['youtube_channel_name']); ?></h5>
                        <p class="card-text"><a href="<?php echo htmlspecialchars($upload['youtube_channel_link']); ?>" target="_blank">Channel Link</a></p>
                        <img src="<?php echo '../' . htmlspecialchars($upload['image_path']); ?>" alt="Uploaded Image" class="img-fluid mb-3">
                    </div>
                </div>
            <?php endif; ?>
        <?php endforeach; ?>
    </div>
</body>
</html>
<?php include '../functions/footer.php'; ?>
