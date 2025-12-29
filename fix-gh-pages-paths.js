#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, 'dist');
const indexPath = path.join(distDir, 'index.html');

console.log('Fixing paths for GitHub Pages deployment...');

// Read the index.html file
let html = fs.readFileSync(indexPath, 'utf8');

// Replace absolute paths with relative paths
// Fix script tags: src="/_expo/... -> src="./_expo/...
html = html.replace(/src="\/_expo\//g, 'src="./_expo/');

// Fix link tags: href="/favicon.ico" -> href="./favicon.ico"
html = html.replace(/href="\/favicon\.ico"/g, 'href="./favicon.ico"');

// Fix any other absolute paths that start with /
html = html.replace(/href="\//g, 'href="./');
html = html.replace(/src="\//g, 'src="./');

// Write the fixed HTML back
fs.writeFileSync(indexPath, html, 'utf8');

console.log('✅ Fixed paths in index.html');

// Also fix paths in any static HTML files in subdirectories
const fixHtmlFilesInDir = (dir) => {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      fixHtmlFilesInDir(filePath);
    } else if (file.endsWith('.html')) {
      let html = fs.readFileSync(filePath, 'utf8');
      
      // For subdirectory HTML files, we need to go up one level
      const depth = filePath.split(path.sep).length - distDir.split(path.sep).length - 1;
      const prefix = depth > 0 ? '../'.repeat(depth) : './';
      
      html = html.replace(/src="\/_expo\//g, `src="${prefix}_expo/`);
      html = html.replace(/href="\/favicon\.ico"/g, `href="${prefix}favicon.ico"`);
      
      fs.writeFileSync(filePath, html, 'utf8');
      console.log(`✅ Fixed paths in ${file}`);
    }
  });
};

// Check if there are subdirectories with HTML files
try {
  fixHtmlFilesInDir(distDir);
} catch (err) {
  // It's okay if this fails, just continue
}

console.log('All done!');
