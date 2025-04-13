// scripts/copy-amplify-outputs.js

const fs = require('fs');
const path = require('path');

const sourcePath = path.resolve(__dirname, '../amplify_outputs.json');
const destPath = path.resolve(__dirname, '../src/amplify_outputs.json');

if (!fs.existsSync(sourcePath)) {
  console.error('❌ amplify_outputs.json not found at project root!');
  process.exit(1);
}

fs.copyFileSync(sourcePath, destPath);
console.log('✅ Copied amplify_outputs.json to src/');
