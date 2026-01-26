/**
 * Watch Time Controller
 * Handles watch room creation, joining, and session management
 */

const WatchRoom = require('../models/WatchRoom');
const WatchSession = require('../models/WatchSession');
const User = require('../models/User');
const config = require('../config/config');
const { validateYouTubeUrl } = require('../utils/youtubeValidator');

/**
 * Create a new watch room
 */
exports.createRoom = async (req, res) => {
  try {
    const { contentUrl, contentTitle, contentType, requiredWatchMinutes, maxParticipants, isPublic, category, language } = req.body;
    
    const user = await User.findById(req.session.user._id);
    
    // Validate YouTube URL
    const urlValidation = validateYouTubeUrl(contentUrl, contentType);
    if (!urlValidation.valid) {
      return res.status(400).json({
        success: false,
        message: urlValidation.error || 'Invalid YouTube URL'
      });
    }
    
    // Use normalized URL
    const normalizedUrl = urlValidation.normalizedUrl;
    const videoId = urlValidation.videoId;
    
    // Calculate total credits needed
    const creditsPerMinute = config.credits.earnings.watchMinute;
    const totalCredits = requiredWatchMinutes * creditsPerMinute * (maxParticipants || 50);
    
    // Check if user has enough credits
    if (user.credits < totalCredits) {
      return res.status(400).json({
        success: false,
        message: `Insufficient credits. You need ${totalCredits} credits but have ${user.credits}.`
      });
    }
    
    // Deduct credits upfront
    const spendResult = await user.spendCredits(totalCredits);
    if (!spendResult.success) {
      return res.status(400).json({ success: false, message: spendResult.message });
    }
    
    // Calculate expiry (24 hours from now)
    const expiresAt = new Date(Date.now() + config.watchTime.roomExpiryHours * 60 * 60 * 1000);
    
    // Create room
    const room = new WatchRoom({
      creatorId: user._id,
      contentUrl: normalizedUrl,
      contentTitle,
      contentType: contentType || 'video',
      requiredWatchMinutes,
      creditsPerMinute,
      totalCreditsOffered: totalCredits,
      maxParticipants: maxParticipants || 50,
      isPublic: isPublic !== false,
      category: category || user.channelCategory || 'Other',
      language: language || user.channelLanguage || 'English',
      requireQualityScore: user.qualityScore - 20, // Allow users 20 points below creator
      expiresAt
    });
    
    await room.save();
    
    res.json({
      success: true,
      message: 'Watch room created successfully',
      room: room,
      creditsSpent: totalCredits,
      newBalance: user.credits
    });
    
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating watch room'
    });
  }
};

/**
 * Get available watch rooms (with smart matching)
 */
exports.getRooms = async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id);
    const { category, language, contentType } = req.query;
    
    // Build query
    const query = {
      status: 'active',
      isPublic: true,
      expiresAt: { $gt: new Date() },
      creatorId: { $ne: user._id }, // Don't show own rooms
      currentParticipants: { $lt: '$maxParticipants' },
      requireQualityScore: { $lte: user.qualityScore }
    };
    
    // Apply filters
    if (category) query.category = category;
    if (language) query.language = language;
    if (contentType) query.contentType = contentType;
    
    // Get rooms
    let rooms = await WatchRoom.find(query)
      .populate('creatorId', 'username youtubeChannelName channelCategory qualityScore premiumTier')
      .sort({ createdAt: -1 })
      .limit(50);
    
    // Apply smart matching score
    rooms = rooms.map(room => {
      let matchScore = 1;
      
      // Same category bonus
      if (room.category === user.channelCategory) {
        matchScore *= config.matching.similarCategoryBonus;
      }
      
      // Similar quality score
      const qualityDiff = Math.abs(room.creatorId.qualityScore - user.qualityScore);
      if (qualityDiff < 20) matchScore *= 1.2;
      
      // Premium boost
      if (room.creatorId.premiumTier !== 'free') {
        matchScore *= 1.1;
      }
      
      return {
        ...room.toObject(),
        matchScore: Math.round(matchScore * 100)
      };
    });
    
    // Sort by match score
    rooms.sort((a, b) => b.matchScore - a.matchScore);
    
    res.json({
      success: true,
      rooms: rooms.slice(0, config.matching.maxMatches)
    });
    
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching watch rooms'
    });
  }
};

/**
 * Join a watch room
 */
exports.joinRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const user = await User.findById(req.session.user._id);
    
    // Get room
    const room = await WatchRoom.findById(roomId);
    
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }
    
    // Validate room availability
    if (!room.hasSpace()) {
      return res.status(400).json({ success: false, message: 'Room is full or inactive' });
    }
    
    if (room.isExpired()) {
      return res.status(400).json({ success: false, message: 'Room has expired' });
    }
    
    // Check quality score
    if (user.qualityScore < room.requireQualityScore) {
      return res.status(403).json({
        success: false,
        message: 'Your account quality score is too low for this room'
      });
    }
    
    // Check if user already has an active session in this room
    const existingSession = await WatchSession.findOne({
      roomId: room._id,
      userId: user._id,
      status: { $in: ['active', 'completed'] }
    });
    
    if (existingSession) {
      return res.status(400).json({
        success: false,
        message: 'You already have a session in this room',
        session: existingSession
      });
    }
    
    // Create watch session
    const session = new WatchSession({
      roomId: room._id,
      userId: user._id,
      requiredMinutes: room.requiredWatchMinutes,
      deviceInfo: {
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip
      }
    });
    
    await session.save();
    
    // Increment room participant count
    room.currentParticipants += 1;
    room.totalViews += 1;
    await room.save();
    
    res.json({
      success: true,
      message: 'Joined watch room successfully',
      room: room,
      session: session
    });
    
  } catch (error) {
    console.error('Join room error:', error);
    res.status(500).json({
      success: false,
      message: 'Error joining watch room'
    });
  }
};

/**
 * Update watch session progress (heartbeat)
 */
exports.updateSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { minutesWatched, checkpoint } = req.body;
    
    const session = await WatchSession.findOne({
      _id: sessionId,
      userId: req.session.user._id
    });
    
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }
    
    if (session.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Session is not active' });
    }
    
    // Update progress
    session.updateProgress(minutesWatched);
    
    // Add checkpoint if provided
    if (checkpoint) {
      session.addCheckpoint(minutesWatched);
    }
    
    await session.save();
    
    // Check if session just completed
    if (session.status === 'completed' && !session.creditsPaid) {
      await this.completeSession(session);
    }
    
    res.json({
      success: true,
      session: {
        minutesWatched: session.minutesWatched,
        progressPercentage: session.progressPercentage,
        status: session.status,
        creditsEarned: session.creditsEarned
      }
    });
    
  } catch (error) {
    console.error('Update session error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating session'
    });
  }
};

/**
 * Complete watch session and award credits
 */
exports.completeSession = async (session) => {
  try {
    if (session.creditsPaid) return;
    
    const room = await WatchRoom.findById(session.roomId);
    const user = await User.findById(session.userId);
    
    if (!room || !user) return;
    
    // Calculate credits based on watch time
    const premiumMultiplier = user.premiumTier !== 'free' 
      ? config.credits.premiumMultipliers[user.premiumTier] 
      : 1;
      
    const creditsEarned = session.calculateCredits(room.creditsPerMinute, premiumMultiplier);
    
    // Award credits to user
    const result = await user.addCredits(creditsEarned, 'earned', true);
    
    if (result.success) {
      session.creditsEarned = creditsEarned;
      session.creditsPaid = true;
      await session.save();
      
      // Update room stats
      room.totalMinutesWatched += session.minutesWatched;
      room.totalCreditsSpent += creditsEarned;
      
      // Update completion rate
      const completedSessions = await WatchSession.countDocuments({
        roomId: room._id,
        status: 'completed'
      });
      const totalSessions = await WatchSession.countDocuments({ roomId: room._id });
      room.completionRate = Math.round((completedSessions / totalSessions) * 100);
      
      await room.save();
      
      // Update user stats
      user.stats.totalWatchTimeGiven += session.minutesWatched;
      await user.save();
    }
    
  } catch (error) {
    console.error('Complete session error:', error);
  }
};

/**
 * Get user's active sessions
 */
exports.getMySessions = async (req, res) => {
  try {
    const sessions = await WatchSession.find({
      userId: req.session.user._id,
      status: 'active'
    })
    .populate({
      path: 'roomId',
      select: 'contentTitle contentUrl requiredWatchMinutes creditsPerMinute creatorId',
      populate: {
        path: 'creatorId',
        select: 'username youtubeChannelName'
      }
    })
    .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      sessions
    });
    
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sessions'
    });
  }
};

/**
 * Get user's created rooms
 */
exports.getMyRooms = async (req, res) => {
  try {
    const rooms = await WatchRoom.find({
      creatorId: req.session.user._id
    })
    .sort({ createdAt: -1 })
    .limit(20);
    
    // Get session counts for each room
    const roomsWithStats = await Promise.all(rooms.map(async (room) => {
      const sessionCount = await WatchSession.countDocuments({ roomId: room._id });
      const completedCount = await WatchSession.countDocuments({ 
        roomId: room._id, 
        status: 'completed' 
      });
      
      return {
        ...room.toObject(),
        sessionCount,
        completedCount
      };
    }));
    
    res.json({
      success: true,
      rooms: roomsWithStats
    });
    
  } catch (error) {
    console.error('Get my rooms error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching your rooms'
    });
  }
};

/**
 * Cancel/Close a room
 */
exports.cancelRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    
    const room = await WatchRoom.findOne({
      _id: roomId,
      creatorId: req.session.user._id
    });
    
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }
    
    room.status = 'cancelled';
    await room.save();
    
    // Cancel all active sessions
    await WatchSession.updateMany(
      { roomId: room._id, status: 'active' },
      { $set: { status: 'abandoned' } }
    );
    
    res.json({
      success: true,
      message: 'Room cancelled successfully'
    });
    
  } catch (error) {
    console.error('Cancel room error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling room'
    });
  }
};

module.exports = exports;
