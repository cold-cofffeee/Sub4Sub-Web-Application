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
 * OPTIMIZED: Uses aggregation pipeline + bulk updates instead of sequential loops
 */
async function updateAllQualityScores() {
  try {
    console.log('[Quality Score Update] Starting...');
    const startTime = Date.now();
    
    // Get all non-banned users with basic stats via aggregation
    const users = await User.aggregate([
      {
        $match: { isBanned: false }
      },
      {
        $project: {
          _id: 1,
          createdAt: 1,
          isPremium: 1,
          premiumTier: 1,
          qualityMetrics: 1
        }
      }
    ]);
    
    console.log(`[Quality Score Update] Found ${users.length} users to update`);
    
    // Get engagement stats in batches using aggregation
    const userIds = users.map(u => u._id);
    
    const [actionStats, sessionStats] = await Promise.all([
      // Aggregate engagement action stats
      EngagementAction.aggregate([
        {
          $match: { userId: { $in: userIds } }
        },
        {
          $group: {
            _id: '$userId',
            total: { $sum: 1 },
            verified: {
              $sum: { $cond: [{ $eq: ['$status', 'verified'] }, 1, 0] }
            }
          }
        }
      ]),
      
      // Aggregate watch session stats
      WatchSession.aggregate([
        {
          $match: { userId: { $in: userIds } }
        },
        {
          $group: {
            _id: '$userId',
            total: { $sum: 1 },
            completed: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
            }
          }
        }
      ])
    ]);
    
    // Build lookup maps for O(1) access
    const actionStatsMap = new Map();
    actionStats.forEach(stat => {
      actionStatsMap.set(stat._id.toString(), stat);
    });
    
    const sessionStatsMap = new Map();
    sessionStats.forEach(stat => {
      sessionStatsMap.set(stat._id.toString(), stat);
    });
    
    // Calculate quality scores for all users
    const bulkOps = [];
    
    for (const user of users) {
      const userId = user._id.toString();
      
      // Get stats from maps
      const actions = actionStatsMap.get(userId) || { total: 0, verified: 0 };
      const sessions = sessionStatsMap.get(userId) || { total: 0, completed: 0 };
      
      // Calculate metrics
      const verifiedActionsRatio = actions.total > 0 ? actions.verified / actions.total : 0;
      const watchCompletionRate = sessions.total > 0 ? sessions.completed / sessions.total : 0;
      const accountAgeDays = Math.floor((Date.now() - user.createdAt) / (1000 * 60 * 60 * 24));
      
      // Calculate quality score components
      const accountAgeScore = Math.min(25, accountAgeDays / 4);
      const verifiedScore = verifiedActionsRatio * 30;
      const watchScore = watchCompletionRate * 25;
      const reportPenalty = Math.max(-50, (user.qualityMetrics?.reportCount || 0) * -10);
      const premiumBonus = (user.isPremium || user.premiumTier !== 'free') ? 10 : 0;
      const manualAdjustment = user.qualityMetrics?.manualAdjustment || 0;
      
      // Final score (0-100)
      let finalScore = accountAgeScore + verifiedScore + watchScore + reportPenalty + premiumBonus + manualAdjustment;
      finalScore = Math.max(0, Math.min(100, Math.round(finalScore)));
      
      // Add to bulk operations
      bulkOps.push({
        updateOne: {
          filter: { _id: user._id },
          update: {
            $set: {
              qualityScore: finalScore,
              'qualityMetrics.accountAge': accountAgeDays,
              'qualityMetrics.verifiedActionsRatio': verifiedActionsRatio,
              'qualityMetrics.watchCompletionRate': watchCompletionRate
            }
          }
        }
      });
    }
    
    // Execute bulk update
    let updated = 0;
    if (bulkOps.length > 0) {
      const result = await User.bulkWrite(bulkOps, { ordered: false });
      updated = result.modifiedCount || 0;
    }
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`[Quality Score Update] Complete. Updated ${updated}/${users.length} users in ${duration}s`);
    
    return { updated, failed: users.length - updated, duration };
    
  } catch (error) {
    console.error('[Quality Score Update] Error:', error);
    throw error;
  }
}

/**
 * Start scheduled quality score updates
 * Runs every 24 hours (non-overlapping)
 */
function startQualityScoreScheduler() {
  const config = require('../config/config');
  const interval = config.quality.updateInterval || 86400000; // 24 hours default
  
  console.log(`[Quality Score Scheduler] Starting (interval: ${interval / 1000 / 60} minutes)`);
  
  // Recursive scheduling to prevent overlap
  async function scheduleNext() {
    try {
      await updateAllQualityScores();
    } catch (error) {
      console.error('[Quality Score Scheduler] Error:', error);
    }
    
    // Schedule next run after current completes
    setTimeout(scheduleNext, interval);
  }
  
  // Start first run
  scheduleNext();
}

module.exports = {
  updateUserQualityScore,
  updateAllQualityScores,
  startQualityScoreScheduler
};
