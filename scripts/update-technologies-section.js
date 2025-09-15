#!/usr/bin/env node

const fs = require('fs');

const generateTreeStructure = (technologies) => {
  const categories = Object.keys(technologies);
  const totalFiles = Object.values(technologies).flat().length;
  const totalDirs = categories.length;
  
  let treeOutput = '/usr/local/technologies/\n';
  
  categories.forEach((category, index) => {
    const isLast = index === categories.length - 1;
    const prefix = isLast ? '└── ' : '├── ';
    
    treeOutput += `${prefix}${category}/\n`;
    
    const items = technologies[category];
    items.forEach((item, itemIndex) => {
      const isLastItem = itemIndex === items.length - 1;
      const itemPrefix = isLast ? 
        (isLastItem ? '    └── ' : '    ├── ') : 
        (isLastItem ? '│   └── ' : '│   ├── ');
      
      treeOutput += `${itemPrefix}${item}\n`;
    });
  });
  
  treeOutput += `\n${totalDirs} directories, ${totalFiles} files`;
  
  return treeOutput;
};

try {
  const readme = fs.readFileSync('README.md', 'utf8');
  
  // Read technologies from JSON file
  const technologies = JSON.parse(fs.readFileSync('data/technologies.json', 'utf8'));
  
  // Generate tree structure
  const treeStructure = generateTreeStructure(technologies);
  
  // Find and replace the technologies section
  const techRegex = /(```\n\/usr\/local\/technologies\/[\s\S]*?)(\n```)/;
  
  const updatedReadme = readme.replace(techRegex, (match, prefix, suffix) => {
    return '```\n' + treeStructure + suffix;
  });
  
  fs.writeFileSync('README.md', updatedReadme);
  console.log('Technologies section updated successfully');
  
} catch (error) {
  console.error('Error updating technologies section:', error);
  process.exit(1);
}