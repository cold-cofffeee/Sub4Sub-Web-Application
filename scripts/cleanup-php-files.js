/**
 * Cleanup Old PHP Files
 * Removes old PHP application files after Node.js migration
 */

const fs = require('fs');
const path = require('path');

console.log('🧹 Cleaning up old PHP files...\n');

// List of PHP files and old documentation to delete
const filesToDelete = [
  // PHP files
  'about.php',
  'account.php',
  'analytics.php',
  'contact.php',
  'exchange.php',
  'faq.php',
  'forget.php',
  'index.php',
  'install.php',
  'notification.php',
  'privacy.php',
  'purchase-success.php',
  'purchase.php',
  'tos.php',
  'verify.php',
  
  // Admin PHP files
  'Admin/content-about.php',
  'Admin/content-contact.php',
  'Admin/content-faq.php',
  'Admin/content-management.php',
  'Admin/content-privacy.php',
  'Admin/content-tos.php',
  'Admin/dashboard.php',
  'Admin/index.php',
  'Admin/login.php',
  'Admin/logout.php',
  'Admin/payments.php',
  'Admin/settings.php',
  'Admin/users.php',
  'Admin/verify-users.php',
  
  // API PHP files
  'api/index.php',
  
  // Classes
  'classes/Database.php',
  'classes/EmailService.php',
  'classes/Logger.php',
  'classes/Security.php',
  'classes/User.php',
  
  // Config
  'config/config.php',
  
  // Functions
  'functions/auth.php',
  'functions/db.php',
  'functions/footer.php',
  'functions/header.php',
  'functions/logout.php',
  
  // Includes
  'includes/footer.php',
  'includes/header.php',
  
  // Install
  'install/migrate.php',
  
  // Old Documentation
  'CHANGELOG.md',
  'DEPLOYMENT.md',
  'INSTALL.md',
  'INSTALLATION.md',
  'README.md',
  'UPGRADE_SUMMARY.md'
];

// Directories to remove
const dirsToRemove = [
  'Admin',
  'api',
  'classes',
  'functions',
  'includes',
  'install'
];

let deletedFiles = 0;
let deletedDirs = 0;

// Delete files
filesToDelete.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      console.log(`✓ Deleted: ${file}`);
      deletedFiles++;
    } catch (error) {
      console.log(`✗ Failed to delete: ${file} - ${error.message}`);
    }
  }
});

// Delete directories
dirsToRemove.forEach(dir => {
  const dirPath = path.join(__dirname, '..', dir);
  
  if (fs.existsSync(dirPath)) {
    try {
      fs.rmSync(dirPath, { recursive: true, force: true });
      console.log(`✓ Removed directory: ${dir}/`);
      deletedDirs++;
    } catch (error) {
      console.log(`✗ Failed to remove directory: ${dir}/ - ${error.message}`);
    }
  }
});

console.log(`\n📊 Cleanup Summary:`);
console.log(`   Files deleted: ${deletedFiles}`);
console.log(`   Directories removed: ${deletedDirs}`);
console.log(`\n✨ Cleanup complete!\n`);
console.log(`📝 New documentation files:`);
console.log(`   - SETUP_GUIDE.md (Quick start guide)`);
console.log(`   - See package.json for npm scripts\n`);
