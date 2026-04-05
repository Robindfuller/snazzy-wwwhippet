const fs = require('fs');
const path = require('path');

const DOWNLOADS_FILE = path.join(__dirname, '..', 'data', 'downloads.json');

function load() {
  try {
    if (fs.existsSync(DOWNLOADS_FILE)) {
      return JSON.parse(fs.readFileSync(DOWNLOADS_FILE, 'utf-8'));
    }
  } catch (err) {
    console.error('Failed to load downloads:', err.message);
  }
  return [];
}

function save(downloads) {
  const dir = path.dirname(DOWNLOADS_FILE);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DOWNLOADS_FILE, JSON.stringify(downloads, null, 2));
}

module.exports = { load, save };
