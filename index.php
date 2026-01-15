<?php
/**
 * Home Page - Modern Landing Page
 * SUB4SUB v2.0
 */

$pageTitle = 'SUB4SUB - Boost Your YouTube Channel Growth';
require_once 'includes/header.php';
?>

<!-- Hero Section -->
<section class="hero-modern text-center">
    <div class="hero-content">
        <div class="container-modern">
            <h1 class="hero-title animate-on-scroll">
                Accelerate Your YouTube Growth 🚀
            </h1>
            <p class="hero-subtitle animate-on-scroll">
                Join thousands of creators exchanging subscriptions and building their channels organically
            </p>
            <div class="mt-4 animate-on-scroll">
                <?php if (!isLoggedIn()): ?>
                    <a href="account.php" class="btn-modern btn-primary-modern btn-lg me-3">
                        <i class="fas fa-rocket"></i> Get Started Free
                    </a>
                    <a href="#features" class="btn-modern btn-outline-modern btn-lg">
                        <i class="fas fa-info-circle"></i> Learn More
                    </a>
                <?php else: ?>
                    <a href="exchange.php" class="btn-modern btn-primary-modern btn-lg me-3">
                        <i class="fas fa-users"></i> Start Exchanging
                    </a>
                    <a href="account.php" class="btn-modern btn-secondary-modern btn-lg">
                        <i class="fas fa-chart-line"></i> View Dashboard
                    </a>
                <?php endif; ?>
            </div>
            
            <!-- Stats -->
            <div class="stats-grid mt-5 animate-on-scroll">
                <div class="stat-card">
                    <div class="stat-value" data-counter="10000">0</div>
                    <div class="stat-label">Active Users</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" data-counter="50000">0</div>
                    <div class="stat-label">Subscriptions Exchanged</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" data-counter="95">0</div>
                    <div class="stat-label">Satisfaction Rate %</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" data-counter="24">0</div>
                    <div class="stat-label">Support Available</div>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- Features Section -->
<section id="features" class="py-5 bg-light">
    <div class="container-modern">
        <div class="text-center mb-5 animate-on-scroll">
            <h2 class="display-5 fw-bold">Why Choose SUB4SUB?</h2>
            <p class="lead text-muted">Powerful features to help you grow</p>
        </div>
        
        <div class="row g-4">
            <div class="col-md-4 animate-on-scroll">
                <div class="card-modern text-center h-100">
                    <div class="mb-3">
                        <i class="fas fa-shield-alt fa-4x text-primary"></i>
                    </div>
                    <h3 class="card-title-modern">100% Safe & Secure</h3>
                    <p>Your account safety is our priority. We use industry-standard security measures to protect your data.</p>
                </div>
            </div>
            
            <div class="col-md-4 animate-on-scroll">
                <div class="card-modern text-center h-100">
                    <div class="mb-3">
                        <i class="fas fa-users fa-4x text-primary"></i>
                    </div>
                    <h3 class="card-title-modern">Real Users Only</h3>
                    <p>Connect with genuine YouTube creators. No bots, no fake accounts - just real people growing together.</p>
                </div>
            </div>
            
            <div class="col-md-4 animate-on-scroll">
                <div class="card-modern text-center h-100">
                    <div class="mb-3">
                        <i class="fas fa-bolt fa-4x text-warning"></i>
                    </div>
                    <h3 class="card-title-modern">Lightning Fast</h3>
                    <p>See results immediately. Start exchanging subscriptions and watch your channel grow in real-time.</p>
                </div>
            </div>
            
            <div class="col-md-4 animate-on-scroll">
                <div class="card-modern text-center h-100">
                    <div class="mb-3">
                        <i class="fas fa-chart-line fa-4x text-success"></i>
                    </div>
                    <h3 class="card-title-modern">Track Your Growth</h3>
                    <p>Advanced analytics dashboard to monitor your progress and optimize your strategy.</p>
                </div>
            </div>
            
            <div class="col-md-4 animate-on-scroll">
                <div class="card-modern text-center h-100">
                    <div class="mb-3">
                        <i class="fas fa-crown fa-4x text-warning"></i>
                    </div>
                    <h3 class="card-title-modern">Premium Features</h3>
                    <p>Upgrade to premium for unlimited subscriptions, priority support, and exclusive features.</p>
                </div>
            </div>
            
            <div class="col-md-4 animate-on-scroll">
                <div class="card-modern text-center h-100">
                    <div class="mb-3">
                        <i class="fas fa-headset fa-4x text-info"></i>
                    </div>
                    <h3 class="card-title-modern">24/7 Support</h3>
                    <p>Our dedicated support team is always here to help you succeed on your YouTube journey.</p>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- How It Works Section -->
<section class="py-5">
    <div class="container-modern">
        <div class="text-center mb-5 animate-on-scroll">
            <h2 class="display-5 fw-bold">How It Works</h2>
            <p class="lead text-muted">Get started in 3 simple steps</p>
        </div>
        
        <div class="row g-4">
            <div class="col-md-4 animate-on-scroll">
                <div class="card-modern text-center">
                    <div class="mb-3">
                        <div class="badge-modern badge-primary-modern" style="font-size: 2rem; width: 60px; height: 60px; line-height: 60px;">1</div>
                    </div>
                    <h3>Create Account</h3>
                    <p>Sign up for free and add your YouTube channel details. It only takes 2 minutes!</p>
                </div>
            </div>
            
            <div class="col-md-4 animate-on-scroll">
                <div class="card-modern text-center">
                    <div class="mb-3">
                        <div class="badge-modern badge-primary-modern" style="font-size: 2rem; width: 60px; height: 60px; line-height: 60px;">2</div>
                    </div>
                    <h3>Subscribe to Others</h3>
                    <p>Browse channels and subscribe to ones you find interesting. Help others grow!</p>
                </div>
            </div>
            
            <div class="col-md-4 animate-on-scroll">
                <div class="card-modern text-center">
                    <div class="mb-3">
                        <div class="badge-modern badge-success-modern" style="font-size: 2rem; width: 60px; height: 60px; line-height: 60px;">3</div>
                    </div>
                    <h3>Get Subscribers</h3>
                    <p>Receive subscriptions from other creators automatically. Watch your channel grow!</p>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- Testimonials Section -->
<section class="py-5 bg-light">
    <div class="container-modern">
        <div class="text-center mb-5 animate-on-scroll">
            <h2 class="display-5 fw-bold">What Our Users Say</h2>
            <p class="lead text-muted">Join thousands of satisfied creators</p>
        </div>
        
        <div class="row g-4">
            <div class="col-md-4 animate-on-scroll">
                <div class="card-modern">
                    <div class="d-flex align-items-center mb-3">
                        <i class="fas fa-user-circle fa-3x text-primary me-3"></i>
                        <div>
                            <h5 class="mb-0">Alex Johnson</h5>
                            <div class="text-warning">
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                            </div>
                        </div>
                    </div>
                    <p>"Amazing platform! I gained 500+ subscribers in just one month. Highly recommended for small creators!"</p>
                </div>
            </div>
            
            <div class="col-md-4 animate-on-scroll">
                <div class="card-modern">
                    <div class="d-flex align-items-center mb-3">
                        <i class="fas fa-user-circle fa-3x text-primary me-3"></i>
                        <div>
                            <h5 class="mb-0">Sarah Martinez</h5>
                            <div class="text-warning">
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                            </div>
                        </div>
                    </div>
                    <p>"The best SUB4SUB platform I've used. Real subscribers, great community, and excellent support team!"</p>
                </div>
            </div>
            
            <div class="col-md-4 animate-on-scroll">
                <div class="card-modern">
                    <div class="d-flex align-items-center mb-3">
                        <i class="fas fa-user-circle fa-3x text-primary me-3"></i>
                        <div>
                            <h5 class="mb-0">Michael Chen</h5>
                            <div class="text-warning">
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                            </div>
                        </div>
                    </div>
                    <p>"Premium features are worth every penny. The analytics dashboard helps me track my growth effectively!"</p>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- CTA Section -->
<section class="py-5" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
    <div class="container-modern text-center animate-on-scroll">
        <h2 class="display-4 fw-bold mb-4">Ready to Grow Your Channel?</h2>
        <p class="lead mb-4">Join thousands of successful creators today!</p>
        <a href="account.php" class="btn-modern btn-lg" style="background: white; color: #667eea;">
            <i class="fas fa-rocket"></i> Get Started Now - It's Free!
        </a>
    </div>
</section>

<script>
// Initialize counter animations when in viewport
document.addEventListener('DOMContentLoaded', function() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                Statistics.initCounters();
                observer.unobserve(entry.target);
            }
        });
    });
    
    const statsSection = document.querySelector('.stats-grid');
    if (statsSection) {
        observer.observe(statsSection);
    }
});
</script>

<?php require_once 'includes/footer.php'; ?>
