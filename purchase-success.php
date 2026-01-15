<?php
/**
 * Purchase Success Page
 * Confirmation page after successful premium upgrade
 */

$pageTitle = 'Premium Activated! - SUB4SUB';
require_once 'includes/header.php';
require_once 'classes/Database.php';
require_once 'classes/User.php';

// Check if user is logged in
if (!isLoggedIn()) {
    header('Location: account.php');
    exit;
}

$user = User::find($_SESSION['user_id']);
$isDemo = isset($_GET['demo']) && $_GET['demo'] == '1';
?>

<div class="container-modern mt-5 pt-5">
    <div class="text-center animate-on-scroll">
        <!-- Success Icon -->
        <div class="mb-4">
            <i class="fas fa-check-circle fa-5x text-success"></i>
        </div>
        
        <!-- Success Message -->
        <h1 class="display-4 fw-bold mb-3">
            <i class="fas fa-crown text-warning"></i> Welcome to Premium!
        </h1>
        <p class="lead mb-4">Your premium subscription has been activated successfully!</p>
        
        <?php if ($isDemo): ?>
            <div class="alert-modern alert-info-modern mb-4 text-start">
                <i class="fas fa-info-circle me-2"></i>
                <strong>Demo Mode:</strong> This is a test transaction. In production, this would be a real payment. Configure STRIPE_SECRET_KEY or PAYPAL_CLIENT_ID in your .env file to enable real payments.
            </div>
        <?php endif; ?>
        
        <!-- Premium Benefits -->
        <div class="card-modern text-start mb-4">
            <h4 class="mb-3">Your Premium Benefits</h4>
            <div class="row">
                <div class="col-md-6">
                    <ul class="list-unstyled">
                        <li class="mb-2"><i class="fas fa-check text-success me-2"></i> <strong>Unlimited Subscriptions</strong></li>
                        <li class="mb-2"><i class="fas fa-check text-success me-2"></i> <strong>Priority Support</strong></li>
                        <li class="mb-2"><i class="fas fa-check text-success me-2"></i> <strong>Advanced Analytics</strong></li>
                    </ul>
                </div>
                <div class="col-md-6">
                    <ul class="list-unstyled">
                        <li class="mb-2"><i class="fas fa-check text-success me-2"></i> <strong>No Advertisements</strong></li>
                        <li class="mb-2"><i class="fas fa-check text-success me-2"></i> <strong>2x Faster Processing</strong></li>
                        <li class="mb-2"><i class="fas fa-check text-success me-2"></i> <strong>Beta Features Access</strong></li>
                    </ul>
                </div>
            </div>
        </div>
        
        <!-- Action Buttons -->
        <div class="mt-4">
            <a href="account.php" class="btn-modern btn-primary-modern btn-lg me-3">
                <i class="fas fa-tachometer-alt me-2"></i> Go to Dashboard
            </a>
            <a href="exchange.php" class="btn-modern btn-success-modern btn-lg">
                <i class="fas fa-exchange-alt me-2"></i> Start Exchanging
            </a>
        </div>
        
        <!-- Additional Info -->
        <div class="mt-5 text-muted">
            <p>Need help? Contact our support team at <a href="mailto:support@sub4sub.com">support@sub4sub.com</a></p>
        </div>
    </div>
</div>

<?php require_once 'includes/footer.php'; ?>
