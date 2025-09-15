#!/usr/bin/env node

const fs = require('fs');

try {
  const readme = fs.readFileSync('README.md', 'utf8');
  
  // Read focus areas from JSON file
  const focusData = JSON.parse(fs.readFileSync('data/focus.json', 'utf8'));
  
  // Generate focus items in ps aux format
  const focusItems = focusData.slice(0, 3).map((focus, index) => {
    const pid = 1337 + (index * 711);
    const cpu = Math.max(50, 100 - (index * 15));
    const mem = Math.max(30, 80 - (index * 15));
    const date = new Date().toISOString().slice(0, 7); // YYYY-MM format
    
    return `jodosha  ${pid}  ${cpu.toFixed(1)}  ${mem.toFixed(1)}  ${date}  ${focus}`;
  });
  
  const newFocus = focusItems.join('\n');
  
  // Find and replace the current focus section
  const focusRegex = /(USER\s+PID\s+%CPU\s+%MEM\s+STARTED\s+COMMAND\n)([\s\S]*?)(\n<!-- Auto-updated via GitHub Actions -->\n```)/;
  
  const updatedReadme = readme.replace(focusRegex, (match, header, oldContent, footer) => {
    return header + newFocus + footer;
  });
  
  fs.writeFileSync('README.md', updatedReadme);
  console.log('Focus section updated successfully');
  
} catch (error) {
  console.error('Error updating focus section:', error);
  process.exit(1);
}