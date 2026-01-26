/**
 * Generate View Templates Script
 * Creates all necessary EJS view files
 */

const fs = require('fs');
const path = require('path');

// Ensure directories exist
const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✓ Created directory: ${dirPath}`);
  }
};

// View directories
const viewDirs = [
  'views',
  'views/partials',
  'views/auth',
  'views/admin',
  'views/errors'
];

viewDirs.forEach(ensureDir);

// Create view templates
const views = {
  // Auth views
  'views/auth/login.ejs': `<%- include('../partials/header') %>

<div class="container mt-5">
    <div class="row justify-content-center">
        <div class="col-md-6">
            <div class="card">
                <div class="card-body">
                    <h2 class="card-title text-center mb-4">Login to SUB4SUB</h2>
                    <form action="/auth/login" method="POST">
                        <div class="mb-3">
                            <label class="form-label">Email</label>
                            <input type="email" name="email" class="form-control" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Password</label>
                            <input type="password" name="password" class="form-control" required>
                        </div>
                        <button type="submit" class="btn btn-primary w-100">
                            <i class="fas fa-sign-in-alt"></i> Login
                        </button>
                    </form>
                    <div class="text-center mt-3">
                        <a href="/auth/forgot-password">Forgot Password?</a>
                        <p class="mt-2">Don't have an account? <a href="/auth/register">Register here</a></p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<%- include('../partials/footer') %>`,

  'views/auth/register.ejs': `<%- include('../partials/header') %>

<div class="container mt-5">
    <div class="row justify-content-center">
        <div class="col-md-8">
            <div class="card">
                <div class="card-body">
                    <h2 class="card-title text-center mb-4">Create Your Account</h2>
                    <form action="/auth/register" method="POST">
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Email *</label>
                                <input type="email" name="email" class="form-control" required>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Username *</label>
                                <input type="text" name="username" class="form-control" required>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Password *</label>
                                <input type="password" name="password" class="form-control" required>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Confirm Password *</label>
                                <input type="password" name="confirmPassword" class="form-control" required>
                            </div>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">YouTube Channel Name</label>
                            <input type="text" name="youtubeChannelName" class="form-control">
                        </div>
                        <div class="mb-3">
                            <label class="form-label">YouTube Channel URL</label>
                            <input type="url" name="youtubeChannelUrl" class="form-control" placeholder="https://youtube.com/@yourchannel">
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Location</label>
                            <input type="text" name="locationAddress" class="form-control">
                        </div>
                        <button type="submit" class="btn btn-primary w-100">
                            <i class="fas fa-user-plus"></i> Register
                        </button>
                    </form>
                    <div class="text-center mt-3">
                        <p>Already have an account? <a href="/auth/login">Login here</a></p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<%- include('../partials/footer') %>`,

  'views/exchange.ejs': `<%- include('partials/header') %>

<div class="container mt-5">
    <h2 class="mb-4"><i class="fas fa-exchange-alt me-2"></i>YouTube Channels to Subscribe</h2>
    <div class="alert alert-info mb-4">
        <i class="fas fa-info-circle me-2"></i>Subscribe to these channels and get subscribed back!
    </div>
    <div class="card">
        <div class="card-body">
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Channel Name</th>
                            <th>Channel URL</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <% if (users && users.length > 0) { %>
                            <% users.forEach(user => { %>
                                <tr>
                                    <td><%= user.username %></td>
                                    <td><%= user.youtubeChannelName || 'N/A' %></td>
                                    <td>
                                        <% if (user.youtubeChannel) { %>
                                            <a href="<%= user.youtubeChannel %>" target="_blank" class="btn btn-sm btn-primary">
                                                <i class="fas fa-external-link-alt"></i> Open
                                            </a>
                                        <% } else { %>
                                            N/A
                                        <% } %>
                                    </td>
                                    <td>
                                        <a href="/verify" class="btn btn-sm btn-success">
                                            <i class="fas fa-check"></i> Verify
                                        </a>
                                    </td>
                                </tr>
                            <% }); %>
                        <% } else { %>
                            <tr>
                                <td colspan="4" class="text-center py-4">
                                    <i class="fas fa-inbox fa-3x text-muted mb-3 d-block"></i>
                                    <p class="text-muted">No channels available at the moment</p>
                                </td>
                            </tr>
                        <% } %>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>

<%- include('partials/footer') %>`,

  'views/account.ejs': `<%- include('partials/header') %>

<div class="container mt-5">
    <h2 class="mb-4"><i class="fas fa-user me-2"></i>My Dashboard</h2>
    
    <div class="row">
        <div class="col-md-4">
            <div class="card mb-4">
                <div class="card-header bg-primary text-white">
                    <i class="fas fa-user-circle"></i> Profile Information
                </div>
                <div class="card-body">
                    <p><strong>Username:</strong> <%= userProfile.username %></p>
                    <p><strong>Email:</strong> <%= userProfile.email %></p>
                    <p><strong>Status:</strong> 
                        <% if (userProfile.isPremium) { %>
                            <span class="badge bg-warning text-dark">Premium</span>
                        <% } else { %>
                            <span class="badge bg-secondary">Free</span>
                        <% } %>
                    </p>
                    <p><strong>Member since:</strong> <%= new Date(userProfile.createdAt).toLocaleDateString() %></p>
                </div>
            </div>
        </div>
        
        <div class="col-md-8">
            <div class="card mb-4">
                <div class="card-header bg-success text-white">
                    <i class="fas fa-edit"></i> Update Profile
                </div>
                <div class="card-body">
                    <form action="/auth/update-profile" method="POST">
                        <div class="mb-3">
                            <label class="form-label">Full Name</label>
                            <input type="text" name="fullName" class="form-control" value="<%= userProfile.fullName || '' %>">
                        </div>
                        <div class="mb-3">
                            <label class="form-label">YouTube Channel Name</label>
                            <input type="text" name="youtubeChannelName" class="form-control" value="<%= userProfile.youtubeChannelName || '' %>">
                        </div>
                        <div class="mb-3">
                            <label class="form-label">YouTube Channel URL</label>
                            <input type="url" name="youtubeChannel" class="form-control" value="<%= userProfile.youtubeChannel || '' %>">
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Location</label>
                            <input type="text" name="locationAddress" class="form-control" value="<%= userProfile.locationAddress || '' %>">
                        </div>
                        <button type="submit" class="btn btn-success">
                            <i class="fas fa-save"></i> Update Profile
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>
    
    <div class="card mb-4">
        <div class="card-header bg-info text-white">
            <i class="fas fa-history"></i> Recent Activity
        </div>
        <div class="card-body">
            <% if (subscriptions && subscriptions.length > 0) { %>
                <div class="table-responsive">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Channel</th>
                                <th>Status</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            <% subscriptions.forEach(sub => { %>
                                <tr>
                                    <td><%= sub.targetChannelName %></td>
                                    <td>
                                        <% if (sub.status === 'verified') { %>
                                            <span class="badge bg-success">Verified</span>
                                        <% } else if (sub.status === 'pending') { %>
                                            <span class="badge bg-warning">Pending</span>
                                        <% } else { %>
                                            <span class="badge bg-danger">Rejected</span>
                                        <% } %>
                                    </td>
                                    <td><%= new Date(sub.createdAt).toLocaleDateString() %></td>
                                </tr>
                            <% }); %>
                        </tbody>
                    </table>
                </div>
            <% } else { %>
                <p class="text-muted text-center">No activity yet</p>
            <% } %>
        </div>
    </div>
</div>

<%- include('partials/footer') %>`,

  'views/content.ejs': `<%- include('partials/header') %>

<div class="container mt-5">
    <div class="card">
        <div class="card-body">
            <h1 class="card-title"><%= content.title %></h1>
            <hr>
            <div class="content-body">
                <%- content.content %>
            </div>
        </div>
    </div>
</div>

<%- include('partials/footer') %>`,

  'views/errors/error.ejs': `<%- include('../partials/header') %>

<div class="container mt-5 text-center">
    <div class="card">
        <div class="card-body py-5">
            <h1 class="display-1 text-danger"><%= statusCode %></h1>
            <h2 class="mb-4">Oops! Something went wrong</h2>
            <p class="lead"><%= message %></p>
            <% if (typeof stack !== 'undefined') { %>
                <details class="mt-4 text-start">
                    <summary>Stack Trace</summary>
                    <pre class="bg-light p-3 mt-2"><%= stack %></pre>
                </details>
            <% } %>
            <a href="/" class="btn btn-primary mt-4">
                <i class="fas fa-home"></i> Go Home
            </a>
        </div>
    </div>
</div>

<%- include('../partials/footer') %>`
};

// Write all view files
Object.keys(views).forEach(filePath => {
  const fullPath = path.join(__dirname, '..', filePath);
  fs.writeFileSync(fullPath, views[filePath]);
  console.log(`✓ Created: ${filePath}`);
});

console.log('\n✓ All view templates created successfully!\n');
