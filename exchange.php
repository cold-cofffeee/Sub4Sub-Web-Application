<?php
/**
 * Exchange Page - SUB4SUB Platform
 * User subscription exchange interface
 */

$pageTitle = 'Exchange - SUB4SUB';
require_once 'includes/header.php';

if (!isLoggedIn()) {
    echo '
    <div class="container mt-5">
        <div class="alert alert-warning" role="alert">
            <i class="fas fa-exclamation-triangle me-2"></i> You must be logged in to access this page. Please <a href="account.php" class="alert-link">login</a> or <a href="account.php" class="alert-link">register</a>.
        </div>
    </div>';
    require_once 'includes/footer.php';
    exit;
}

require_once 'classes/Database.php';
$db = Database::getInstance();

// Exclude currently logged-in user's information
$current_user_id = $_SESSION['user_id'];
try {
    $users = $db->query("SELECT id, username, email, youtube_channel_name, youtube_channel FROM users WHERE id != ? LIMIT 20", [$current_user_id])->fetchAll();
} catch (Exception $e) {
    $users = [];
}
?>

<div class="container-modern mt-5">\n    <h2 class="mb-4"><i class="fas fa-exchange-alt me-2"></i> YouTube Channels to Subscribe</h2>
    <div class="alert alert-info mb-4">
        <i class="fas fa-info-circle me-2"></i> This is the list of all available YouTube channels. Subscribe to them and get subscribed back! <a href="faq.php" class="alert-link">Learn more</a>
    </div>
    <div class="card-modern">
        <div class="table-responsive">
            <table class="table table-hover">
                <thead>
                    <tr>
                        <th>Username</th>
                        <th>Channel Name</th>
                        <th>Channel URL</th>
                        <th>Verify</th>
                    </tr>
                </thead>
                <tbody>
                    <?php if (!empty($users)): ?>
                        <?php foreach ($users as $user): ?>
                            <?php
                            $username = $user['username'] ?? explode('@', $user['email'])[0];
                            $channelName = $user['youtube_channel_name'] ?? 'N/A';
                            $channelURL = $user['youtube_channel'] ?? '#';
                            ?>
                            <tr>
                                <td><?= htmlspecialchars($username) ?></td>
                                <td><?= htmlspecialchars($channelName) ?></td>
                                <td><a href="<?= htmlspecialchars($channelURL) ?>" target="_blank" class="btn btn-sm btn-primary"><i class="fas fa-external-link-alt"></i> Open</a></td>
                                <td><a href="verify.php" class="btn btn-sm btn-success"><i class="fas fa-check"></i> Verify</a></td>
                            </tr>
                        <?php endforeach; ?>
                    <?php else: ?>
                        <tr>
                            <td colspan="4" class="text-center py-4">
                                <i class="fas fa-inbox fa-3x text-muted mb-3 d-block"></i>
                                <p class="text-muted">No channels available at the moment</p>
                            </td>
                        </tr>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>
    </div>
</div>

<script>
function setRedirectFlag() {
    sessionStorage.setItem('redirected_from_exchange', 'true');
}
</script>

<?php require_once 'includes/footer.php'; ?>
