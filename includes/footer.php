<?php
/**
 * Modern Footer Template
 * Professional footer with links and information
 */
?>
    </main>
    
    <!-- Footer -->
    <footer class="footer-modern">
        <div class="container-modern">
            <div class="footer-content">
                <!-- About Section -->
                <div class="footer-section">
                    <h3><i class="fas fa-rocket"></i> SUB4SUB</h3>
                    <p>The ultimate platform to grow your YouTube channel organically. Exchange subscriptions with real users and boost your channel's visibility.</p>
                    <div class="social-links mt-3">
                        <a href="#" class="me-3"><i class="fab fa-facebook fa-2x"></i></a>
                        <a href="#" class="me-3"><i class="fab fa-twitter fa-2x"></i></a>
                        <a href="#" class="me-3"><i class="fab fa-instagram fa-2x"></i></a>
                        <a href="#" class="me-3"><i class="fab fa-youtube fa-2x"></i></a>
                    </div>
                </div>
                
                <!-- Quick Links -->
                <div class="footer-section">
                    <h3>Quick Links</h3>
                    <ul class="footer-links">
                        <li><a href="index.php">Home</a></li>
                        <li><a href="about.php">About Us</a></li>
                        <li><a href="exchange.php">Exchange</a></li>
                        <li><a href="faq.php">FAQ</a></li>
                        <li><a href="contact.php">Contact</a></li>
                    </ul>
                </div>
                
                <!-- Legal -->
                <div class="footer-section">
                    <h3>Legal</h3>
                    <ul class="footer-links">
                        <li><a href="privacy.php">Privacy Policy</a></li>
                        <li><a href="tos.php">Terms of Service</a></li>
                        <li><a href="contact.php">Report Abuse</a></li>
                        <li><a href="faq.php">Help Center</a></li>
                    </ul>
                </div>
                
                <!-- Newsletter -->
                <div class="footer-section">
                    <h3>Stay Updated</h3>
                    <p>Subscribe to our newsletter for tips and updates.</p>
                    <form class="mt-3" id="newsletterForm">
                        <div class="input-group">
                            <input type="email" class="form-input-modern" placeholder="Your email" required>
                            <button type="submit" class="btn-modern btn-primary-modern">
                                <i class="fas fa-paper-plane"></i>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            
            <!-- Footer Bottom -->
            <div class="footer-bottom">
                <p>&copy; <?= date('Y') ?> SUB4SUB. All rights reserved. | Version <?= APP_VERSION ?></p>
                <p>Made with <i class="fas fa-heart text-danger"></i> by <a href="#" class="text-decoration-none">SUB4SUB Team</a></p>
            </div>
        </div>
    </footer>
    
    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    
    <!-- Custom JavaScript -->
    <script src="<?= APP_URL ?>/assets/js/app.js"></script>
    
    <!-- Additional page-specific scripts -->
    <?= $additionalScripts ?? '' ?>
    
    <!-- Initialize App -->
    <script>
        // Auto-dismiss alerts after 5 seconds
        setTimeout(() => {
            document.querySelectorAll('.alert-modern').forEach(alert => {
                alert.style.opacity = '0';
                setTimeout(() => alert.remove(), 300);
            });
        }, 5000);
        
        // Newsletter form submission
        document.getElementById('newsletterForm')?.addEventListener('submit', function(e) {
            e.preventDefault();
            App.showAlert('Thank you for subscribing!', 'success');
            this.reset();
        });
    </script>
</body>
</html>
