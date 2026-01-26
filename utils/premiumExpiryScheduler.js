/**
 * Premium Expiry Scheduler
 * Daily job to downgrade expired premium users
 */

const User = require('../models/User');
const Notification = require('../models/Notification');

/**
 * Check and downgrade expired premium users
 */
async function checkExpiredPremium() {
  try {
    const now = new Date();
    
    console.log('[Premium Expiry Check] Starting...');
    
    // Find users with expired premium
    const expiredUsers = await User.find({
      isPremium: true,
      premiumExpiry: { $lte: now }
    });
    
    console.log(`[Premium Expiry Check] Found ${expiredUsers.length} expired users`);
    
    let downgraded = 0;
    
    for (const user of expiredUsers) {
      try {
        // Downgrade user atomically
        await User.findByIdAndUpdate(user._id, {
          $set: {
            isPremium: false,
            premiumTier: 'free',
            premiumAutoRenew: false
          }
        });
        
        // Create notification
        await Notification.create({
          userId: user._id,
          title: 'Premium Expired',
          message: 'Your premium subscription has expired. Upgrade again to restore premium benefits!',
          type: 'warning'
        });
        
        downgraded++;
        console.log(`[Premium Expiry Check] Downgraded user: ${user.username} (${user._id})`);
        
      } catch (error) {
        console.error(`[Premium Expiry Check] Error downgrading user ${user._id}:`, error);
      }
    }
    
    console.log(`[Premium Expiry Check] Complete. Downgraded ${downgraded} users.`);
    
    return { checked: expiredUsers.length, downgraded };
    
  } catch (error) {
    console.error('[Premium Expiry Check] Error:', error);
    throw error;
  }
}

/**
 * Start daily premium expiry checker
 * Runs every 24 hours at midnight
 */
function startPremiumExpiryScheduler() {
  console.log('[Premium Expiry Scheduler] Starting...');
  
  // Calculate time until next midnight
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const msUntilMidnight = tomorrow - now;
  
  // Run at midnight, then every 24 hours
  setTimeout(() => {
    checkExpiredPremium().catch(console.error);
    
    // Then run every 24 hours
    setInterval(() => {
      checkExpiredPremium().catch(console.error);
    }, 24 * 60 * 60 * 1000);
    
  }, msUntilMidnight);
  
  console.log(`[Premium Expiry Scheduler] Will run at midnight (in ${Math.round(msUntilMidnight / 1000 / 60)} minutes)`);
}

module.exports = {
  checkExpiredPremium,
  startPremiumExpiryScheduler
};
