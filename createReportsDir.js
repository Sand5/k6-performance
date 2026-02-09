// createReportsDir.js
const fs = require('fs');

const dir = 'k6-tests/reports';

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
  console.log('Created reports folder');
} else {
  console.log('Reports folder already exists');
}
