/**
 * Premium Upgrade Helper
 * Centralized logic for processing premium upgrades with idempotency
 */

const User = require('../models/User');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const referralController = require('../controllers/referralController');

/**
 * Process premium upgrade from payment
 * Ensures idempotency - multiple calls with same payment won't double-upgrade
 * 
 * @param {Object} payment - Payment document
 * @returns {Object} { success: boolean, message: string }
 */
async function processPremiumUpgrade(payment) {
  try {
    // Check if payment was already processed (idempotency)
    if (payment.processed) {
      return {
        success: false,
        message: 'Payment already processed'
      };
    }
    
    // Validate payment status
    if (payment.status !== 'completed') {
      return {
        success: false,
        message: 'Payment not completed'
      };
    }
    
    // Get user
    const user = await User.findById(payment.userId);
    if (!user) {
      return {
        success: false,
        message: 'User not found'
      };
    }
    
    // Calculate expiry date
    const now = new Date();
    const currentExpiry = user.premiumExpiry && user.premiumExpiry > now 
      ? new Date(user.premiumExpiry) 
      : now;
    
    const duration = payment.premiumDuration || 30; // Default 30 days
    const newExpiry = new Date(currentExpiry.getTime() + (duration * 24 * 60 * 60 * 1000));
    
    // Update user atomically
    const updatedUser = await User.findByIdAndUpdate(
      payment.userId,
      {
        $set: {
          isPremium: true,
          premiumTier: payment.premiumTier || 'basic',
          premiumExpiry: newExpiry
        }
      },
      { new: true }
    );
    
    if (!updatedUser) {
      return {
        success: false,
        message: 'Failed to update user'
      };
    }
    
    // Mark payment as processed (idempotency flag)
    await Payment.findByIdAndUpdate(
      payment._id,
      {
        $set: {
          processed: true,
          processedAt: new Date()
        }
      }
    );
    
    // Award referral first purchase bonus (if applicable)
    if (payment.amount > 0) {
      await referralController.awardFirstPurchaseBonus(user._id);
    }
    
    // Create notification
    await Notification.create({
      userId: user._id,
      title: 'Premium Activated!',
      message: `Your ${payment.premiumTier.toUpperCase()} premium subscription is now active until ${newExpiry.toLocaleDateString()}!`,
      type: 'success'
    });
    
    console.log(`Premium upgraded: User ${user._id} → ${payment.premiumTier} until ${newExpiry}`);
    
    return {
      success: true,
      message: 'Premium upgrade successful',
      premiumExpiry: newExpiry,
      premiumTier: payment.premiumTier
    };
    
  } catch (error) {
    console.error('Premium upgrade error:', error);
    return {
      success: false,
      message: 'Error processing premium upgrade'
    };
  }
}

module.exports = {
  processPremiumUpgrade
};
