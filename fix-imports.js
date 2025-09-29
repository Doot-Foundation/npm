#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

// Find all .js files in dist directory
const jsFiles = glob.sync('dist/**/*.js');

jsFiles.forEach(file => {
  let content = readFileSync(file, 'utf8');

  // Fix relative imports to include .js extension
  content = content.replace(
    /from ["'](\.\/.+?)["']/g,
    (match, path) => {
      if (!path.endsWith('.js')) {
        return match.replace(path, path + '.js');
      }
      return match;
    }
  );

  writeFileSync(file, content);
  console.log(`Fixed imports in: ${file}`);
});

console.log('ES module imports fixed!');