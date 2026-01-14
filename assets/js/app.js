// =============================================
// SUB4SUB - Professional JavaScript Framework
// Ultra-modern, interactive features
// =============================================

'use strict';

// Global App Configuration
const App = {
    config: {
        apiUrl: '/api',
        version: '2.0.0',
        debug: true
    },
    
    init() {
        this.initEventListeners();
        this.initAnimations();
        this.initForms();
        this.initNavbar();
        this.initTooltips();
    },
    
    // Initialize Event Listeners
    initEventListeners() {
        document.addEventListener('DOMContentLoaded', () => {
            console.log('SUB4SUB App Initialized v' + this.config.version);
            this.init();
        });
    },
    
    // Initialize Animations
    initAnimations() {
        // Fade-in on scroll
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);
        
        document.querySelectorAll('.animate-on-scroll').forEach(el => {
            observer.observe(el);
        });
    },
    
    // Initialize Forms
    initForms() {
        // Real-time form validation
        const forms = document.querySelectorAll('.form-validate');
        forms.forEach(form => {
            const inputs = form.querySelectorAll('input, textarea, select');
            inputs.forEach(input => {
                input.addEventListener('blur', () => this.validateField(input));
                input.addEventListener('input', () => this.clearError(input));
            });
            
            form.addEventListener('submit', (e) => this.handleFormSubmit(e, form));
        });
    },
    
    // Validate individual field
    validateField(field) {
        const value = field.value.trim();
        const type = field.type;
        const required = field.hasAttribute('required');
        let error = '';
        
        if (required && !value) {
            error = 'This field is required';
        } else if (type === 'email' && value && !this.isValidEmail(value)) {
            error = 'Please enter a valid email address';
        } else if (type === 'url' && value && !this.isValidUrl(value)) {
            error = 'Please enter a valid URL';
        } else if (field.hasAttribute('data-min-length')) {
            const minLength = parseInt(field.getAttribute('data-min-length'));
            if (value.length < minLength) {
                error = `Minimum length is ${minLength} characters`;
            }
        }
        
        if (error) {
            this.showError(field, error);
            return false;
        } else {
            this.clearError(field);
            return true;
        }
    },
    
    // Show error message
    showError(field, message) {
        this.clearError(field);
        field.classList.add('is-invalid');
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'form-error';
        errorDiv.textContent = message;
        field.parentNode.appendChild(errorDiv);
    },
    
    // Clear error message
    clearError(field) {
        field.classList.remove('is-invalid');
        const existingError = field.parentNode.querySelector('.form-error');
        if (existingError) {
            existingError.remove();
        }
    },
    
    // Handle form submission
    handleFormSubmit(e, form) {
        e.preventDefault();
        
        const inputs = form.querySelectorAll('input, textarea, select');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });
        
        if (isValid) {
            this.showLoading();
            // Submit form
            form.submit();
        }
    },
    
    // Initialize Navbar
    initNavbar() {
        const navbar = document.querySelector('.navbar-modern');
        if (!navbar) return;
        
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    },
    
    // Initialize Tooltips
    initTooltips() {
        const tooltips = document.querySelectorAll('[data-tooltip]');
        tooltips.forEach(el => {
            el.addEventListener('mouseenter', (e) => this.showTooltip(e));
            el.addEventListener('mouseleave', () => this.hideTooltip());
        });
    },
    
    // Show tooltip
    showTooltip(e) {
        const text = e.target.getAttribute('data-tooltip');
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip-modern';
        tooltip.textContent = text;
        tooltip.id = 'active-tooltip';
        
        document.body.appendChild(tooltip);
        
        const rect = e.target.getBoundingClientRect();
        tooltip.style.position = 'absolute';
        tooltip.style.top = (rect.top - tooltip.offsetHeight - 10) + 'px';
        tooltip.style.left = (rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2)) + 'px';
    },
    
    // Hide tooltip
    hideTooltip() {
        const tooltip = document.getElementById('active-tooltip');
        if (tooltip) {
            tooltip.remove();
        }
    },
    
    // Validation helpers
    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },
    
    isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    },
    
    // Show loading overlay
    showLoading() {
        if (document.getElementById('loading-overlay')) return;
        
        const overlay = document.createElement('div');
        overlay.id = 'loading-overlay';
        overlay.className = 'loading-overlay';
        overlay.innerHTML = '<div class="spinner-modern"></div>';
        document.body.appendChild(overlay);
    },
    
    // Hide loading overlay
    hideLoading() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.remove();
        }
    },
    
    // Show alert
    showAlert(message, type = 'info') {
        const alert = document.createElement('div');
        alert.className = `alert-modern alert-${type}-modern`;
        alert.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()" style="background:none;border:none;font-size:1.5rem;cursor:pointer;margin-left:auto;">&times;</button>
        `;
        alert.style.display = 'flex';
        alert.style.justifyContent = 'space-between';
        alert.style.alignItems = 'center';
        
        const container = document.querySelector('.container-modern') || document.body;
        container.insertBefore(alert, container.firstChild);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            alert.style.opacity = '0';
            setTimeout(() => alert.remove(), 300);
        }, 5000);
    },
    
    // Modal functions
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    },
    
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
};

// AJAX Helper Functions
const Ajax = {
    // Generic GET request
    get(url, successCallback, errorCallback) {
        fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(response => response.json())
        .then(data => successCallback(data))
        .catch(error => {
            if (errorCallback) errorCallback(error);
            else console.error('AJAX Error:', error);
        });
    },
    
    // Generic POST request
    post(url, data, successCallback, errorCallback) {
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => successCallback(data))
        .catch(error => {
            if (errorCallback) errorCallback(error);
            else console.error('AJAX Error:', error);
        });
    },
    
    // Form submission via AJAX
    submitForm(formElement, successCallback, errorCallback) {
        const formData = new FormData(formElement);
        
        fetch(formElement.action, {
            method: formElement.method || 'POST',
            body: formData,
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(response => response.json())
        .then(data => successCallback(data))
        .catch(error => {
            if (errorCallback) errorCallback(error);
            else console.error('Form Submission Error:', error);
        });
    }
};

// Statistics Dashboard
const Statistics = {
    // Animate counter
    animateCounter(element, target, duration = 2000) {
        const start = 0;
        const increment = target / (duration / 16);
        let current = start;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = Math.round(target);
                clearInterval(timer);
            } else {
                element.textContent = Math.round(current);
            }
        }, 16);
    },
    
    // Initialize dashboard counters
    initCounters() {
        const counters = document.querySelectorAll('[data-counter]');
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-counter'));
            this.animateCounter(counter, target);
        });
    }
};

// Real-time Notifications
const Notifications = {
    permission: false,
    
    // Request notification permission
    async requestPermission() {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            this.permission = permission === 'granted';
            return this.permission;
        }
        return false;
    },
    
    // Show browser notification
    show(title, options = {}) {
        if (this.permission && 'Notification' in window) {
            new Notification(title, {
                icon: '/assets/images/logo.png',
                badge: '/assets/images/badge.png',
                ...options
            });
        }
    },
    
    // Check for new notifications periodically
    startPolling(interval = 30000) {
        setInterval(() => {
            Ajax.get('/api/notifications/unread', (data) => {
                if (data.count > 0) {
                    this.show('New Notifications', {
                        body: `You have ${data.count} new notification(s)`,
                        tag: 'notifications'
                    });
                }
            });
        }, interval);
    }
};

// Table Enhancement
const DataTable = {
    // Add search functionality
    addSearch(tableElement) {
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = 'Search...';
        searchInput.className = 'form-input-modern mb-3';
        
        tableElement.parentNode.insertBefore(searchInput, tableElement);
        
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const rows = tableElement.querySelectorAll('tbody tr');
            
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        });
    },
    
    // Add sorting functionality
    addSorting(tableElement) {
        const headers = tableElement.querySelectorAll('thead th');
        
        headers.forEach((header, index) => {
            header.style.cursor = 'pointer';
            header.addEventListener('click', () => {
                this.sortTable(tableElement, index);
            });
        });
    },
    
    // Sort table by column
    sortTable(table, columnIndex) {
        const tbody = table.querySelector('tbody');
        const rows = Array.from(tbody.querySelectorAll('tr'));
        
        const sortedRows = rows.sort((a, b) => {
            const aValue = a.cells[columnIndex].textContent.trim();
            const bValue = b.cells[columnIndex].textContent.trim();
            
            return aValue.localeCompare(bValue, undefined, { numeric: true });
        });
        
        // Toggle sort direction
        if (table.dataset.sortDirection === 'asc') {
            sortedRows.reverse();
            table.dataset.sortDirection = 'desc';
        } else {
            table.dataset.sortDirection = 'asc';
        }
        
        tbody.innerHTML = '';
        sortedRows.forEach(row => tbody.appendChild(row));
    }
};

// Copy to clipboard functionality
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        App.showAlert('Copied to clipboard!', 'success');
    }).catch(err => {
        App.showAlert('Failed to copy', 'error');
    });
}

// Debounce helper
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Initialize App
App.initEventListeners();

// Export to global scope
window.App = App;
window.Ajax = Ajax;
window.Statistics = Statistics;
window.Notifications = Notifications;
window.DataTable = DataTable;
window.copyToClipboard = copyToClipboard;
window.debounce = debounce;
