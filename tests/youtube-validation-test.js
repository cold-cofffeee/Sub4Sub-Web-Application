/**
 * YouTube URL Validation Test
 * 
 * Run with: node tests/youtube-validation-test.js
 */

const { validateYouTubeUrl, extractVideoId, extractPlaylistId, belongsToChannel } = require('../utils/youtubeValidator');

function testYouTubeValidation() {
  console.log('=== YouTube URL Validation Tests ===\n');
  
  const tests = [
    // Valid video URLs
    { url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', type: 'video', expected: true, desc: 'Standard watch URL' },
    { url: 'https://youtu.be/dQw4w9WgXcQ', type: 'video', expected: true, desc: 'Short youtu.be URL' },
    { url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', type: 'video', expected: true, desc: 'Embed URL' },
    { url: 'https://m.youtube.com/watch?v=dQw4w9WgXcQ', type: 'video', expected: true, desc: 'Mobile URL' },
    { url: 'dQw4w9WgXcQ', type: 'video', expected: true, desc: 'Just video ID' },
    
    // Valid shorts
    { url: 'https://www.youtube.com/shorts/AbCdEfGhIjK', type: 'short', expected: true, desc: 'Shorts URL' },
    
    // Valid playlists
    { url: 'https://www.youtube.com/playlist?list=PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf', type: 'playlist', expected: true, desc: 'Playlist URL' },
    
    // Invalid URLs
    { url: '', type: 'video', expected: false, desc: 'Empty URL' },
    { url: 'https://vimeo.com/123456', type: 'video', expected: false, desc: 'Non-YouTube URL' },
    { url: 'https://www.youtube.com/watch?v=invalid', type: 'video', expected: false, desc: 'Invalid video ID length' },
    { url: 'https://www.youtube.com/watch', type: 'video', expected: false, desc: 'Missing video ID' },
    { url: null, type: 'video', expected: false, desc: 'Null URL' },
    
    // Edge cases
    { url: '  https://youtu.be/dQw4w9WgXcQ  ', type: 'video', expected: true, desc: 'URL with whitespace' },
    { url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=30s', type: 'video', expected: true, desc: 'URL with timestamp' }
  ];
  
  let passed = 0;
  let failed = 0;
  
  tests.forEach((test, index) => {
    const result = validateYouTubeUrl(test.url, test.type);
    const success = result.valid === test.expected;
    
    console.log(`Test ${index + 1}: ${test.desc}`);
    console.log(`  URL: ${test.url}`);
    console.log(`  Type: ${test.type}`);
    console.log(`  Expected: ${test.expected ? 'VALID' : 'INVALID'}`);
    console.log(`  Result: ${result.valid ? 'VALID' : 'INVALID'}`);
    
    if (result.valid) {
      console.log(`  Video ID: ${result.videoId || 'N/A'}`);
      console.log(`  Playlist ID: ${result.playlistId || 'N/A'}`);
      console.log(`  Normalized: ${result.normalizedUrl}`);
    } else {
      console.log(`  Error: ${result.error}`);
    }
    
    if (success) {
      console.log('  ✓ PASSED\n');
      passed++;
    } else {
      console.log('  ✗ FAILED\n');
      failed++;
    }
  });
  
  console.log('=== Test Summary ===');
  console.log(`Passed: ${passed}/${tests.length}`);
  console.log(`Failed: ${failed}/${tests.length}`);
  console.log(`Success Rate: ${((passed / tests.length) * 100).toFixed(1)}%`);
  
  // Test channel matching
  console.log('\n=== Channel Matching Tests ===\n');
  
  const channelTests = [
    {
      content: 'https://www.youtube.com/watch?v=abc123',
      channel: 'https://www.youtube.com/c/MyChannel',
      expected: false,
      desc: 'Different channels'
    },
    {
      content: 'https://www.youtube.com/@username/videos',
      channel: 'https://www.youtube.com/@username',
      expected: true,
      desc: 'Same @username'
    }
  ];
  
  channelTests.forEach((test, index) => {
    const result = belongsToChannel(test.content, test.channel);
    const success = result === test.expected;
    
    console.log(`Channel Test ${index + 1}: ${test.desc}`);
    console.log(`  Content: ${test.content}`);
    console.log(`  Channel: ${test.channel}`);
    console.log(`  Expected: ${test.expected}`);
    console.log(`  Result: ${result}`);
    console.log(success ? '  ✓ PASSED\n' : '  ✗ FAILED\n');
  });
}

// Run tests
testYouTubeValidation();
