#!/usr/bin/env node

const fs = require('fs');

const formatSocialItem = (item) => {
  // Generate filename based on platform and date
  const date = new Date(item.pubDate || item.date);
  const dateStr = date.toISOString().slice(0, 10); // YYYY-MM-DD
  
  let filename;
  let extension;
  
  // Determine file extension based on platform and content type
  switch (item.platform) {
    case 'blog':
      extension = '.md';
      break;
    case 'youtube':
      extension = '.mp4';
      break;
    case 'bluesky':
    case 'x':
    case 'linkedin':
      extension = '.post';
      break;
    case 'instagram':
      extension = '.jpg';
      break;
    default:
      extension = '.post';
  }
  
  // Create filename from title
  const titleSlug = item.title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-')         // Replace spaces with hyphens
    .substring(0, 50)             // Limit length
    .replace(/-+$/, '');          // Remove trailing hyphens
  
  filename = `${dateStr}-${titleSlug}${extension}`;
  
  return `/social/${item.platform}/${filename}
  └─ ${item.link}`;
};

try {
  const readme = fs.readFileSync('README.md', 'utf8');
  
  // Read feed data
  let feedData;
  try {
    feedData = JSON.parse(fs.readFileSync('data/feed.json', 'utf8'));
  } catch (error) {
    console.warn('⚠ Could not read data/feed.json, creating fallback content');
    // Create fallback data if feed.json doesn't exist yet
    feedData = {
      items: [
        {
          title: 'Latest blog post',
          link: 'https://lucaguidi.com',
          pubDate: new Date().toISOString(),
          platform: 'blog'
        },
        {
          title: 'Recent BlueSky activity',
          link: 'https://bsky.app/profile/jodosha.bsky.social',
          pubDate: new Date(Date.now() - 24*60*60*1000).toISOString(),
          platform: 'bluesky'
        },
        {
          title: 'Latest video content',
          link: 'https://youtube.com/@lucaguidi1982',
          pubDate: new Date(Date.now() - 2*24*60*60*1000).toISOString(),
          platform: 'youtube'
        },
        {
          title: 'Professional updates',
          link: 'https://linkedin.com/in/lucaguidi',
          pubDate: new Date(Date.now() - 3*24*60*60*1000).toISOString(),
          platform: 'linkedin'
        },
        {
          title: 'Tech thoughts and insights',
          link: 'https://x.com/jodosha',
          pubDate: new Date(Date.now() - 4*24*60*60*1000).toISOString(),
          platform: 'x'
        }
      ]
    };
  }
  
  // Take the 5 most recent items
  const recentItems = feedData.items.slice(0, 5);
  
  // Format items for terminal display
  const formattedItems = recentItems.map(formatSocialItem);
  const socialContent = formattedItems.join('\n');
  
  // Find and replace the social feeds section
  const socialRegex = /(```\n\/social\/[\s\S]*?)(\n<!-- Auto-updated via GitHub Actions -->\n```)/;
  
  const updatedReadme = readme.replace(socialRegex, (match, prefix, suffix) => {
    return '```\n' + socialContent + suffix;
  });
  
  // Check if the replacement actually happened
  if (updatedReadme === readme) {
    console.warn('⚠ Social feeds section not found in README.md - no changes made');
    console.log('Expected pattern: ```\\n/social/...<!-- Auto-updated via GitHub Actions -->\\n```');
  } else {
    fs.writeFileSync('README.md', updatedReadme);
    console.log('✅ Social feeds section updated successfully');
    console.log('📝 Updated with', recentItems.length, 'items from', new Set(recentItems.map(i => i.platform)).size, 'platforms');
    
    // Log summary of what was updated
    const platformCounts = recentItems.reduce((acc, item) => {
      acc[item.platform] = (acc[item.platform] || 0) + 1;
      return acc;
    }, {});
    
    console.log('📊 Platform distribution:');
    Object.entries(platformCounts).forEach(([platform, count]) => {
      console.log(`  • ${platform}: ${count} item${count > 1 ? 's' : ''}`);
    });
  }
  
} catch (error) {
  console.error('❌ Error updating social feeds section:', error.message);
  process.exit(1);
}