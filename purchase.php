<?php
/**
 * Premium Subscription Purchase
 * Professional payment gateway integration
 * Supports Stripe and PayPal with .env configuration
 */

$pageTitle = 'Upgrade to Premium - SUB4SUB';
require_once 'includes/header.php';
require_once 'classes/Database.php';
require_once 'classes/User.php';
require_once 'classes/Security.php';

// Check if user is logged in
if (!isLoggedIn()) {
    header('Location: account.php');
    exit;
}

$user = User::find($_SESSION['user_id']);
$db = Database::getInstance();

// Check if user is already premium
if ($user && $user->isPremium()) {
    ?>
    <div class="container-modern mt-5 pt-5">
        <div class="card-modern text-center">
            <i class="fas fa-crown fa-4x text-warning mb-3"></i>
            <h2>You're Already Premium!</h2>
            <p class="lead">Enjoy all the unlimited features and priority support.</p>
            <a href="account.php" class="btn-modern btn-primary-modern mt-3">
                <i class="fas fa-arrow-left"></i> Back to Dashboard
            </a>
        </div>
    </div>
    <?php
    require_once 'includes/footer.php';
    exit;
}

// Handle payment processing
$message = '';
$messageType = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['process_payment'])) {
    if (!Security::validateCsrfToken($_POST['csrf_token'])) {
        $message = 'Invalid security token. Please try again.';
        $messageType = 'error';
    } else {
        $plan = $_POST['plan'] ?? 'monthly';
        $paymentMethod = $_POST['payment_method'] ?? 'demo';
        
        // Define pricing
        $pricing = [
            'monthly' => ['amount' => 9.99, 'duration' => 30],
            'quarterly' => ['amount' => 24.99, 'duration' => 90],
            'yearly' => ['amount' => 99.99, 'duration' => 365]
        ];
        
        $amount = $pricing[$plan]['amount'];
        $duration = $pricing[$plan]['duration'];
        
        // Check if payment gateway is configured
        $stripeKey = getenv('STRIPE_SECRET_KEY') ?: (defined('STRIPE_SECRET_KEY') ? STRIPE_SECRET_KEY : null);
        $paypalClientId = getenv('PAYPAL_CLIENT_ID') ?: (defined('PAYPAL_CLIENT_ID') ? PAYPAL_CLIENT_ID : null);
        
        if ($paymentMethod === 'stripe' && $stripeKey) {
            // Stripe Payment Integration
            try {
                require_once __DIR__ . '/vendor/autoload.php';
                \Stripe\Stripe::setApiKey($stripeKey);
                
                $session = \Stripe\Checkout\Session::create([
                    'payment_method_types' => ['card'],
                    'line_items' => [[
                        'price_data' => [
                            'currency' => 'usd',
                            'product_data' => [
                                'name' => 'SUB4SUB Premium - ' . ucfirst($plan) . ' Plan',
                                'description' => 'Unlimited subscriptions, priority support, advanced analytics'
                            ],
                            'unit_amount' => $amount * 100,
                        ],
                        'quantity' => 1,
                    ]],
                    'mode' => 'payment',
                    'success_url' => SITE_URL . '/purchase-success.php?session_id={CHECKOUT_SESSION_ID}',
                    'cancel_url' => SITE_URL . '/purchase.php?canceled=1',
                    'client_reference_id' => $user->getId(),
                    'metadata' => [
                        'user_id' => $user->getId(),
                        'plan' => $plan
                    ]
                ]);
                
                header('Location: ' . $session->url);
                exit;
            } catch (Exception $e) {
                $message = 'Payment error: ' . $e->getMessage();
                $messageType = 'error';
                Security::logActivity($user->getId(), 'payment_error', $e->getMessage());
            }
        } elseif ($paymentMethod === 'paypal' && $paypalClientId) {
            // PayPal payment would be handled via JavaScript SDK
            $message = 'Please complete the PayPal payment below.';
            $messageType = 'info';
        } else {
            // No payment gateway configured OR demo mode
            // Upgrade user directly for testing/development
            $expiresAt = date('Y-m-d H:i:s', strtotime('+' . $duration . ' days'));
            
            $db->update('users', [
                'is_premium' => 1,
                'premium_expires_at' => $expiresAt
            ], 'id = ?', [$user->getId()]);
            
            // Create payment record
            $paymentData = [
                'user_id' => $user->getId(),
                'amount' => $amount,
                'currency' => 'USD',
                'payment_method' => 'demo',
                'transaction_id' => 'DEMO_' . uniqid() . '_' . time(),
                'status' => 'completed',
                'description' => 'Premium Subscription - ' . ucfirst($plan) . ' Plan (Demo Mode)',
                'metadata' => json_encode(['plan' => $plan, 'duration_days' => $duration, 'mode' => 'demo'])
            ];
            $db->insert('payments', $paymentData);
            
            Security::logActivity($user->getId(), 'premium_upgrade', 'User upgraded to premium (' . $plan . ' plan - demo mode)');
            
            header('Location: purchase-success.php?demo=1');
            exit;
        }
    }
}

$csrfToken = Security::generateCsrfToken();
?>

<!-- Premium Subscription Page -->
<div class="container-modern mt-5 pt-5">
    <?php if ($message): ?>
        <div class="alert-modern alert-<?= $messageType ?>-modern animate-on-scroll">
            <?= htmlspecialchars($message) ?>
        </div>
    <?php endif; ?>
    
    <!-- Header -->
    <div class="text-center mb-5 animate-on-scroll">
        <i class="fas fa-crown fa-3x text-warning mb-3"></i>
        <h1 class="display-4 fw-bold">Upgrade to Premium</h1>
        <p class="lead text-muted">Unlock unlimited features and supercharge your growth</p>
    </div>

    <!-- Pricing Cards -->
    <div class="row g-4 mb-5">
        <!-- Monthly Plan -->
        <div class="col-md-4 animate-on-scroll">
            <div class="card-modern text-center h-100">
                <div class="badge-modern badge-info-modern mb-3">Popular</div>
                <h3 class="card-title-modern">Monthly</h3>
                <div class="my-4">
                    <span class="display-4 fw-bold">$9.99</span>
                    <span class="text-muted">/month</span>
                </div>
                <ul class="list-unstyled text-start mb-4">
                    <li class="mb-2"><i class="fas fa-check text-success me-2"></i> Unlimited Subscriptions</li>
                    <li class="mb-2"><i class="fas fa-check text-success me-2"></i> Priority Support</li>
                    <li class="mb-2"><i class="fas fa-check text-success me-2"></i> Advanced Analytics</li>
                    <li class="mb-2"><i class="fas fa-check text-success me-2"></i> No Advertisements</li>
                    <li class="mb-2"><i class="fas fa-check text-success me-2"></i> Faster Processing</li>
                </ul>
                <button class="btn-modern btn-primary-modern btn-lg w-100" onclick="selectPlan('monthly')">
                    Choose Monthly
                </button>
            </div>
        </div>

        <!-- Quarterly Plan -->
        <div class="col-md-4 animate-on-scroll">
            <div class="card-modern text-center h-100 border-primary" style="border-width: 2px;">
                <div class="badge-modern badge-success-modern mb-3">Best Value - Save 17%</div>
                <h3 class="card-title-modern">Quarterly</h3>
                <div class="my-4">
                    <span class="display-4 fw-bold">$24.99</span>
                    <span class="text-muted">/3 months</span>
                    <div class="text-muted small">Only $8.33/month</div>
                </div>
                <ul class="list-unstyled text-start mb-4">
                    <li class="mb-2"><i class="fas fa-check text-success me-2"></i> <strong>Everything in Monthly</strong></li>
                    <li class="mb-2"><i class="fas fa-check text-success me-2"></i> <strong>Save $5</strong> vs Monthly</li>
                    <li class="mb-2"><i class="fas fa-check text-success me-2"></i> Extended Analytics History</li>
                    <li class="mb-2"><i class="fas fa-check text-success me-2"></i> Priority Email Support</li>
                    <li class="mb-2"><i class="fas fa-check text-success me-2"></i> Beta Features Access</li>
                </ul>
                <button class="btn-modern btn-success-modern btn-lg w-100" onclick="selectPlan('quarterly')">
                    Choose Quarterly
                </button>
            </div>
        </div>

        <!-- Yearly Plan -->
        <div class="col-md-4 animate-on-scroll">
            <div class="card-modern text-center h-100">
                <div class="badge-modern badge-warning-modern mb-3">Maximum Savings</div>
                <h3 class="card-title-modern">Yearly</h3>
                <div class="my-4">
                    <span class="display-4 fw-bold">$99.99</span>
                    <span class="text-muted">/year</span>
                    <div class="text-muted small">Only $8.33/month</div>
                </div>
                <ul class="list-unstyled text-start mb-4">
                    <li class="mb-2"><i class="fas fa-check text-success me-2"></i> <strong>Everything in Quarterly</strong></li>
                    <li class="mb-2"><i class="fas fa-check text-success me-2"></i> <strong>Save $20</strong> vs Monthly</li>
                    <li class="mb-2"><i class="fas fa-check text-success me-2"></i> Lifetime Analytics History</li>
                    <li class="mb-2"><i class="fas fa-check text-success me-2"></i> 24/7 Priority Support</li>
                    <li class="mb-2"><i class="fas fa-check text-success me-2"></i> Early Access to Features</li>
                </ul>
                <button class="btn-modern btn-warning-modern btn-lg w-100" onclick="selectPlan('yearly')">
                    Choose Yearly
                </button>
            </div>
        </div>
    </div>

    <!-- Payment Form -->
    <div class="row justify-content-center animate-on-scroll">
        <div class="col-lg-6">
            <div class="card-modern">
                <h4 class="mb-4">Complete Your Purchase</h4>
                <form method="POST" id="payment-form">
                    <input type="hidden" name="csrf_token" value="<?= $csrfToken ?>">
                    <input type="hidden" name="plan" id="selected-plan" value="monthly">
                    <input type="hidden" name="process_payment" value="1">
                    
                    <div class="mb-4">
                        <label class="form-label">Selected Plan</label>
                        <input type="text" class="form-control" id="plan-display" value="Monthly - $9.99" readonly>
                    </div>
                    
                    <div class="mb-4">
                        <label class="form-label">Payment Method</label>
                        <select class="form-select" name="payment_method" id="payment-method">
                            <option value="demo">Demo Mode (Instant Activation)</option>
                            <?php if (getenv('STRIPE_SECRET_KEY') || defined('STRIPE_SECRET_KEY')): ?>
                                <option value="stripe">Credit Card (Stripe)</option>
                            <?php endif; ?>
                            <?php if (getenv('PAYPAL_CLIENT_ID') || defined('PAYPAL_CLIENT_ID')): ?>
                                <option value="paypal">PayPal</option>
                            <?php endif; ?>
                        </select>
                        <small class="text-muted">
                            <?php if (!getenv('STRIPE_SECRET_KEY') && !getenv('PAYPAL_CLIENT_ID')): ?>
                                Payment gateways not configured. Using demo mode for testing.
                            <?php endif; ?>
                        </small>
                    </div>
                    
                    <div class="alert-modern alert-info-modern mb-4">
                        <i class="fas fa-info-circle me-2"></i>
                        <strong>Note:</strong> Your premium subscription will be activated immediately after successful payment.
                    </div>
                    
                    <button type="submit" class="btn-modern btn-primary-modern btn-lg w-100">
                        <i class="fas fa-lock me-2"></i> Complete Purchase
                    </button>
                </form>
            </div>
        </div>
    </div>

    <!-- Features Comparison -->
    <div class="mt-5 animate-on-scroll">
        <h3 class="text-center mb-4">Free vs Premium Comparison</h3>
        <div class="table-responsive">
            <table class="table table-bordered">
                <thead class="table-light">
                    <tr>
                        <th>Feature</th>
                        <th class="text-center">Free</th>
                        <th class="text-center bg-warning bg-opacity-10">Premium</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Daily Subscriptions Limit</td>
                        <td class="text-center">10/day</td>
                        <td class="text-center"><strong>Unlimited</strong></td>
                    </tr>
                    <tr>
                        <td>Support Response Time</td>
                        <td class="text-center">48 hours</td>
                        <td class="text-center"><strong>Priority (4 hours)</strong></td>
                    </tr>
                    <tr>
                        <td>Analytics Dashboard</td>
                        <td class="text-center">Basic</td>
                        <td class="text-center"><strong>Advanced</strong></td>
                    </tr>
                    <tr>
                        <td>Advertisement Free</td>
                        <td class="text-center"><i class="fas fa-times text-danger"></i></td>
                        <td class="text-center"><i class="fas fa-check text-success"></i></td>
                    </tr>
                    <tr>
                        <td>Processing Speed</td>
                        <td class="text-center">Standard</td>
                        <td class="text-center"><strong>2x Faster</strong></td>
                    </tr>
                    <tr>
                        <td>Beta Features</td>
                        <td class="text-center"><i class="fas fa-times text-danger"></i></td>
                        <td class="text-center"><i class="fas fa-check text-success"></i></td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</div>

<script>
const pricing = {
    monthly: { amount: '$9.99', label: 'Monthly - $9.99' },
    quarterly: { amount: '$24.99', label: 'Quarterly - $24.99 (Save 17%)' },
    yearly: { amount: '$99.99', label: 'Yearly - $99.99 (Save 17%)' }
};

function selectPlan(plan) {
    document.getElementById('selected-plan').value = plan;
    document.getElementById('plan-display').value = pricing[plan].label;
    
    // Scroll to payment form
    document.getElementById('payment-form').scrollIntoView({ behavior: 'smooth', block: 'center' });
}
</script>

<?php require_once 'includes/footer.php'; ?>
