/**
 * Quality Score Updater
 * Scheduled task to recalculate quality scores for all users
 */

const User = require('../models/User');
const EngagementAction = require('../models/EngagementAction');
const WatchSession = require('../models/WatchSession');

/**
 * Update quality score for a single user
 */
async function updateUserQualityScore(userId) {
  try {
    const user = await User.findById(userId);
    if (!user) return null;
    
    // Calculate verified actions ratio
    const totalActions = await EngagementAction.countDocuments({ userId: user._id });
    const verifiedActions = await EngagementAction.countDocuments({
      userId: user._id,
      status: 'verified'
    });
    
    user.qualityMetrics.verifiedActionsRatio = totalActions > 0 
      ? verifiedActions / totalActions 
      : 0;
    
    // Calculate watch completion rate
    const totalSessions = await WatchSession.countDocuments({ userId: user._id });
    const completedSessions = await WatchSession.countDocuments({
      userId: user._id,
      status: 'completed'
    });
    
    user.qualityMetrics.watchCompletionRate = totalSessions > 0
      ? completedSessions / totalSessions
      : 0;
    
    // Update quality score
    await user.updateQualityScore();
    
    return user.qualityScore;
  } catch (error) {
    console.error(`Error updating quality score for user ${userId}:`, error);
    return null;
  }
}

/**
 * Update quality scores for all users
 */
async function updateAllQualityScores() {
  try {
    console.log('Starting quality score update...');
    
    const users = await User.find({ isBanned: false });
    let updated = 0;
    let failed = 0;
    
    for (const user of users) {
      const score = await updateUserQualityScore(user._id);
      if (score !== null) {
        updated++;
      } else {
        failed++;
      }
    }
    
    console.log(`Quality score update complete. Updated: ${updated}, Failed: ${failed}`);
    return { updated, failed };
  } catch (error) {
    console.error('Error updating all quality scores:', error);
    throw error;
  }
}

/**
 * Start scheduled quality score updates
 * Runs every 24 hours
 */
function startQualityScoreScheduler() {
  const config = require('../config/config');
  const interval = config.quality.updateInterval || 86400000; // 24 hours default
  
  console.log(`Starting quality score scheduler (interval: ${interval / 1000 / 60} minutes)`);
  
  // Run immediately on startup
  updateAllQualityScores().catch(console.error);
  
  // Then run on schedule
  setInterval(() => {
    updateAllQualityScores().catch(console.error);
  }, interval);
}

module.exports = {
  updateUserQualityScore,
  updateAllQualityScores,
  startQualityScoreScheduler
};
