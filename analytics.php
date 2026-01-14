<?php
/**
 * Analytics Dashboard
 * Advanced statistics and insights
 */

$pageTitle = 'Analytics Dashboard - SUB4SUB';
require_once 'includes/header.php';
require_once 'classes/Database.php';
require_once 'classes/User.php';

// Check if user is logged in
if (!isLoggedIn()) {
    header('Location: account.php');
    exit;
}

$user = User::find($_SESSION['user_id']);
$db = Database::getInstance();

// Get user statistics
$userStats = $user->getStatistics();

// Get subscription history (last 30 days)
$sql = "SELECT 
            DATE(created_at) as date,
            COUNT(*) as count
        FROM subscriptions
        WHERE user_id = ? 
        AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY DATE(created_at)
        ORDER BY date ASC";
$subscriptionHistory = $db->fetchAll($sql, [$user->getId()]);

// Get top performing channels
$sql = "SELECT 
            u.youtube_channel_name,
            COUNT(s.id) as subscription_count
        FROM subscriptions s
        JOIN users u ON s.target_user_id = u.id
        WHERE s.user_id = ?
        GROUP BY s.target_user_id
        ORDER BY subscription_count DESC
        LIMIT 10";
$topChannels = $db->fetchAll($sql, [$user->getId()]);

// Get recent activity
$sql = "SELECT 
            al.action,
            al.description,
            al.created_at
        FROM activity_logs al
        WHERE al.user_id = ?
        ORDER BY al.created_at DESC
        LIMIT 20";
$recentActivity = $db->fetchAll($sql, [$user->getId()]);

// Calculate growth rate
$sql = "SELECT 
            COUNT(*) as this_week
        FROM subscriptions
        WHERE user_id = ? 
        AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
$thisWeek = $db->fetchOne($sql, [$user->getId()]);

$sql = "SELECT 
            COUNT(*) as last_week
        FROM subscriptions
        WHERE user_id = ? 
        AND created_at >= DATE_SUB(NOW(), INTERVAL 14 DAY)
        AND created_at < DATE_SUB(NOW(), INTERVAL 7 DAY)";
$lastWeek = $db->fetchOne($sql, [$user->getId()]);

$growthRate = 0;
if ($lastWeek['last_week'] > 0) {
    $growthRate = (($thisWeek['this_week'] - $lastWeek['last_week']) / $lastWeek['last_week']) * 100;
}
?>

<div class="container-modern py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <h1><i class="fas fa-chart-line"></i> Analytics Dashboard</h1>
        <div>
            <button class="btn-modern btn-outline-modern" onclick="window.print()">
                <i class="fas fa-print"></i> Print Report
            </button>
            <button class="btn-modern btn-primary-modern" onclick="exportData()">
                <i class="fas fa-download"></i> Export Data
            </button>
        </div>
    </div>
    
    <!-- Key Metrics -->
    <div class="stats-grid mb-4">
        <div class="stat-card">
            <div class="stat-value"><?= number_format($userStats['total_subscriptions']) ?></div>
            <div class="stat-label">Total Subscriptions</div>
            <div class="mt-2">
                <span class="badge-modern <?= $growthRate >= 0 ? 'badge-success-modern' : 'badge-danger-modern' ?>">
                    <i class="fas fa-arrow-<?= $growthRate >= 0 ? 'up' : 'down' ?>"></i>
                    <?= abs(round($growthRate, 1)) ?>% vs last week
                </span>
            </div>
        </div>
        
        <div class="stat-card">
            <div class="stat-value"><?= number_format($userStats['verified_subscriptions']) ?></div>
            <div class="stat-label">Verified Subscriptions</div>
            <div class="mt-2">
                <?php 
                $verificationRate = $userStats['total_subscriptions'] > 0 
                    ? ($userStats['verified_subscriptions'] / $userStats['total_subscriptions']) * 100 
                    : 0;
                ?>
                <span class="badge-modern badge-info-modern">
                    <?= round($verificationRate, 1) ?>% Verification Rate
                </span>
            </div>
        </div>
        
        <div class="stat-card">
            <div class="stat-value"><?= $thisWeek['this_week'] ?></div>
            <div class="stat-label">This Week</div>
            <div class="mt-2">
                <span class="badge-modern badge-primary-modern">
                    <i class="fas fa-calendar-week"></i> Active
                </span>
            </div>
        </div>
        
        <div class="stat-card">
            <div class="stat-value"><?= $user->isPremium() ? '∞' : '20' ?></div>
            <div class="stat-label">Daily Limit</div>
            <div class="mt-2">
                <?php if ($user->isPremium()): ?>
                    <span class="badge-modern badge-warning-modern">
                        <i class="fas fa-crown"></i> Premium
                    </span>
                <?php else: ?>
                    <a href="purchase.php" class="badge-modern badge-secondary-modern">
                        Upgrade
                    </a>
                <?php endif; ?>
            </div>
        </div>
    </div>
    
    <!-- Charts -->
    <div class="row g-4 mb-4">
        <div class="col-lg-8">
            <div class="card-modern">
                <div class="card-header-modern">
                    <h3 class="card-title-modern">Subscription Trend (Last 30 Days)</h3>
                </div>
                <canvas id="subscriptionChart" height="80"></canvas>
            </div>
        </div>
        
        <div class="col-lg-4">
            <div class="card-modern">
                <div class="card-header-modern">
                    <h3 class="card-title-modern">Top Channels</h3>
                </div>
                <div class="list-group list-group-flush">
                    <?php if (empty($topChannels)): ?>
                        <div class="list-group-item text-center text-muted">
                            No data available yet
                        </div>
                    <?php else: ?>
                        <?php foreach ($topChannels as $channel): ?>
                            <div class="list-group-item d-flex justify-content-between align-items-center">
                                <div>
                                    <i class="fab fa-youtube text-danger"></i>
                                    <?= htmlspecialchars($channel['youtube_channel_name']) ?>
                                </div>
                                <span class="badge-modern badge-primary-modern">
                                    <?= $channel['subscription_count'] ?>
                                </span>
                            </div>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Recent Activity -->
    <div class="card-modern">
        <div class="card-header-modern">
            <h3 class="card-title-modern">Recent Activity</h3>
        </div>
        <div class="table-responsive">
            <table class="table-modern">
                <thead>
                    <tr>
                        <th>Action</th>
                        <th>Description</th>
                        <th>Time</th>
                    </tr>
                </thead>
                <tbody>
                    <?php if (empty($recentActivity)): ?>
                        <tr>
                            <td colspan="3" class="text-center text-muted">No activity yet</td>
                        </tr>
                    <?php else: ?>
                        <?php foreach ($recentActivity as $activity): ?>
                            <tr>
                                <td>
                                    <span class="badge-modern badge-primary-modern">
                                        <?= htmlspecialchars($activity['action']) ?>
                                    </span>
                                </td>
                                <td><?= htmlspecialchars($activity['description'] ?? 'N/A') ?></td>
                                <td><?= date('M d, Y H:i', strtotime($activity['created_at'])) ?></td>
                            </tr>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>
    </div>
</div>

<!-- Chart.js -->
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>

<script>
// Prepare data for chart
const subscriptionData = <?= json_encode($subscriptionHistory) ?>;
const labels = subscriptionData.map(d => d.date);
const data = subscriptionData.map(d => parseInt(d.count));

// Create chart
const ctx = document.getElementById('subscriptionChart').getContext('2d');
new Chart(ctx, {
    type: 'line',
    data: {
        labels: labels,
        datasets: [{
            label: 'Subscriptions',
            data: data,
            borderColor: '#2563eb',
            backgroundColor: 'rgba(37, 99, 235, 0.1)',
            tension: 0.4,
            fill: true
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                display: true,
                position: 'top'
            },
            tooltip: {
                mode: 'index',
                intersect: false
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1
                }
            }
        }
    }
});

// Export data function
function exportData() {
    App.showAlert('Export functionality coming soon!', 'info');
}
</script>

<?php require_once 'includes/footer.php'; ?>
