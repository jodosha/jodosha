#!/usr/bin/env node

const fs = require('fs');

const formatEvent = (event) => {
  const date = new Date(event.created_at).toISOString().slice(0, 19).replace('T', ' ');
  const repo = event.repo.name;
  
  switch(event.type) {
    case 'PushEvent':
      const commits = event.payload.commits || [];
      const lastCommit = commits[commits.length - 1];
      if (lastCommit) {
        return `[${date}] COMMIT: ${repo} - ${lastCommit.message.split('\n')[0]}
  └─ https://github.com/${repo}/commit/${lastCommit.sha}`;
      }
      break;
      
    case 'PullRequestEvent':
      const pr = event.payload.pull_request;
      const action = event.payload.action.toUpperCase();
      return `[${date}] PR-${action}: ${repo} - ${pr.title}
  └─ ${pr.html_url}`;
      
    case 'IssuesEvent':
      const issue = event.payload.issue;
      const issueAction = event.payload.action.toUpperCase();
      return `[${date}] ISSUE-${issueAction}: ${repo} - ${issue.title}
  └─ ${issue.html_url}`;
      
    case 'ReleaseEvent':
      const release = event.payload.release;
      return `[${date}] RELEASE: ${repo} - ${release.name || release.tag_name}
  └─ ${release.html_url}`;
      
    case 'CreateEvent':
      if (event.payload.ref_type === 'tag') {
        return `[${date}] TAG: ${repo} - Created ${event.payload.ref}
  └─ https://github.com/${repo}/tags`;
      }
      break;
  }
  
  return null;
};

const formatActivity = (events) => {
  return events
    .map(formatEvent)
    .filter(Boolean)
    .slice(0, 5)
    .join('\n');
};

const updateReadmeSection = (formattedActivity) => {
  try {
    const readme = fs.readFileSync('README.md', 'utf8');
    
    // Find and replace the system pulse section
    const pulseRegex = /(```\n\[[\s\S]*?)(\n<!-- Auto-updated via GitHub Actions -->\n```)/;
    
    const updatedReadme = readme.replace(pulseRegex, (match, prefix, suffix) => {
      return '```\n' + formattedActivity + suffix;
    });
    
    fs.writeFileSync('README.md', updatedReadme);
    console.log('System pulse section updated successfully');
    return true;
  } catch (error) {
    console.error('Error updating README section:', error);
    return false;
  }
};

// Main execution
try {
  const events = JSON.parse(fs.readFileSync('data/activity.json', 'utf8'));
  const formattedActivity = formatActivity(events);
  
  // Always update README section
  const success = updateReadmeSection(formattedActivity);
  if (!success) {
    process.exit(1);
  }
  
} catch (error) {
  console.error('Error formatting activity:', error);
  process.exit(1);
}
