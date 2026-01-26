/**
 * YouTube URL Validator
 * Validates and extracts video IDs from YouTube URLs
 */

/**
 * Extract YouTube video ID from various URL formats
 * Supports:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://m.youtube.com/watch?v=VIDEO_ID
 * - YouTube Shorts: https://www.youtube.com/shorts/VIDEO_ID
 * 
 * @param {string} url - YouTube URL
 * @returns {string|null} Video ID or null if invalid
 */
function extractVideoId(url) {
  if (!url || typeof url !== 'string') {
    return null;
  }
  
  // Remove whitespace
  url = url.trim();
  
  // Regex patterns for different YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/ // Just the video ID
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}

/**
 * Extract YouTube playlist ID from URL
 * 
 * @param {string} url - YouTube playlist URL
 * @returns {string|null} Playlist ID or null if invalid
 */
function extractPlaylistId(url) {
  if (!url || typeof url !== 'string') {
    return null;
  }
  
  url = url.trim();
  
  // Playlist URL pattern
  const pattern = /[?&]list=([a-zA-Z0-9_-]+)/;
  const match = url.match(pattern);
  
  return match ? match[1] : null;
}

/**
 * Validate YouTube URL and extract metadata
 * 
 * @param {string} url - YouTube URL
 * @param {string} contentType - 'video', 'playlist', or 'short'
 * @returns {Object} { valid: boolean, videoId: string|null, playlistId: string|null, error: string|null }
 */
function validateYouTubeUrl(url, contentType = 'video') {
  const result = {
    valid: false,
    videoId: null,
    playlistId: null,
    normalizedUrl: null,
    error: null
  };
  
  if (!url || typeof url !== 'string') {
    result.error = 'URL is required';
    return result;
  }
  
  // Check if it's a YouTube URL
  if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
    result.error = 'Must be a valid YouTube URL';
    return result;
  }
  
  // Extract IDs based on content type
  if (contentType === 'playlist') {
    const playlistId = extractPlaylistId(url);
    if (!playlistId) {
      result.error = 'Invalid YouTube playlist URL';
      return result;
    }
    result.playlistId = playlistId;
    result.normalizedUrl = `https://www.youtube.com/playlist?list=${playlistId}`;
    result.valid = true;
    
  } else {
    // Video or Short
    const videoId = extractVideoId(url);
    if (!videoId) {
      result.error = 'Invalid YouTube video URL';
      return result;
    }
    
    // Validate video ID format (11 characters, alphanumeric + - and _)
    if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
      result.error = 'Invalid video ID format';
      return result;
    }
    
    result.videoId = videoId;
    
    // Normalize URL based on content type
    if (contentType === 'short') {
      result.normalizedUrl = `https://www.youtube.com/shorts/${videoId}`;
    } else {
      result.normalizedUrl = `https://www.youtube.com/watch?v=${videoId}`;
    }
    
    result.valid = true;
  }
  
  return result;
}

/**
 * Extract channel ID/username from URL (basic extraction, not validation)
 * 
 * @param {string} url - YouTube channel URL
 * @returns {string|null} Channel identifier or null
 */
function extractChannelId(url) {
  if (!url || typeof url !== 'string') {
    return null;
  }
  
  url = url.trim();
  
  // Pattern for channel URLs
  const patterns = [
    /youtube\.com\/channel\/([a-zA-Z0-9_-]+)/,
    /youtube\.com\/c\/([a-zA-Z0-9_-]+)/,
    /youtube\.com\/@([a-zA-Z0-9_-]+)/,
    /youtube\.com\/user\/([a-zA-Z0-9_-]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}

/**
 * Validate if content URL belongs to user's channel (basic check)
 * 
 * @param {string} contentUrl - YouTube video/playlist URL
 * @param {string} userChannelUrl - User's channel URL
 * @returns {boolean} True if URLs share same channel identifier
 */
function belongsToChannel(contentUrl, userChannelUrl) {
  if (!contentUrl || !userChannelUrl) {
    return false;
  }
  
  const contentChannelId = extractChannelId(contentUrl);
  const userChannelId = extractChannelId(userChannelUrl);
  
  // If both have channel IDs and they match
  if (contentChannelId && userChannelId && contentChannelId === userChannelId) {
    return true;
  }
  
  // If URLs contain same @username
  const contentUsername = contentUrl.match(/@([a-zA-Z0-9_-]+)/);
  const userUsername = userChannelUrl.match(/@([a-zA-Z0-9_-]+)/);
  
  if (contentUsername && userUsername && contentUsername[1] === userUsername[1]) {
    return true;
  }
  
  return false;
}

module.exports = {
  extractVideoId,
  extractPlaylistId,
  validateYouTubeUrl,
  extractChannelId,
  belongsToChannel
};
