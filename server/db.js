const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_PATH = path.join(DATA_DIR, 'wwwhippet.db');

// Ensure data directories exist
function ensureDataDirs() {
  const dirs = [
    DATA_DIR,
    path.join(DATA_DIR, 'pages'),
    path.join(DATA_DIR, 'pages', 'claude'),
    path.join(DATA_DIR, 'pages', 'openai'),
    path.join(DATA_DIR, 'pages', 'ollama'),
  ];
  for (const dir of dirs) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

let db;

function getDb() {
  if (db) return db;

  ensureDataDirs();
  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS pages (
      id INTEGER PRIMARY KEY,
      provider TEXT NOT NULL,
      url TEXT NOT NULL,
      content_type TEXT,
      file_path TEXT NOT NULL,
      identity_json TEXT,
      search_context TEXT,
      created_at INTEGER NOT NULL,
      ttl_seconds INTEGER NOT NULL,
      accessed_at INTEGER,
      UNIQUE(provider, url)
    );

    CREATE TABLE IF NOT EXISTS search_results (
      id INTEGER PRIMARY KEY,
      provider TEXT NOT NULL,
      query TEXT NOT NULL,
      results_json TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      UNIQUE(provider, query)
    );

    CREATE TABLE IF NOT EXISTS gif_cache (
      keyword TEXT PRIMARY KEY,
      urls_json TEXT NOT NULL,
      cached_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS links (
      id INTEGER PRIMARY KEY,
      provider TEXT NOT NULL,
      from_url TEXT NOT NULL,
      to_url TEXT NOT NULL,
      link_text TEXT,
      created_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_links_from ON links(provider, from_url);
    CREATE INDEX IF NOT EXISTS idx_links_to ON links(provider, to_url);
  `);

  return db;
}

// Page cache operations
const pageOps = {
  get(provider, url) {
    const db = getDb();
    const row = db.prepare('SELECT * FROM pages WHERE provider = ? AND url = ?').get(provider, url);
    if (!row) return null;

    const now = Math.floor(Date.now() / 1000);
    const expired = (now - row.created_at) > row.ttl_seconds;

    // Update accessed_at
    db.prepare('UPDATE pages SET accessed_at = ? WHERE id = ?').run(now, row.id);

    return {
      ...row,
      identity: row.identity_json ? JSON.parse(row.identity_json) : null,
      searchContext: row.search_context ? JSON.parse(row.search_context) : null,
      expired,
    };
  },

  set(provider, url, contentType, filePath, identity, searchContext, ttlSeconds) {
    const db = getDb();
    const now = Math.floor(Date.now() / 1000);
    db.prepare(`
      INSERT OR REPLACE INTO pages (provider, url, content_type, file_path, identity_json, search_context, created_at, ttl_seconds, accessed_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      provider, url, contentType, filePath,
      identity ? JSON.stringify(identity) : null,
      searchContext ? JSON.stringify(searchContext) : null,
      now, ttlSeconds, now
    );
  },

  getIdentity(provider, url) {
    const db = getDb();
    const row = db.prepare('SELECT identity_json FROM pages WHERE provider = ? AND url = ?').get(provider, url);
    return row?.identity_json ? JSON.parse(row.identity_json) : null;
  },
};

// Search results cache
const searchOps = {
  get(provider, query) {
    const db = getDb();
    const row = db.prepare('SELECT * FROM search_results WHERE provider = ? AND query = ?').get(provider, query.toLowerCase().trim());
    if (!row) return null;

    const now = Math.floor(Date.now() / 1000);
    const TTL = 3600; // 1 hour
    if ((now - row.created_at) > TTL) return null;

    return JSON.parse(row.results_json);
  },

  set(provider, query, results) {
    const db = getDb();
    const now = Math.floor(Date.now() / 1000);
    db.prepare(`
      INSERT OR REPLACE INTO search_results (provider, query, results_json, created_at)
      VALUES (?, ?, ?, ?)
    `).run(provider, query.toLowerCase().trim(), JSON.stringify(results), now);
  },
};

// Link map operations
const linkOps = {
  add(provider, fromUrl, toUrl, linkText) {
    const db = getDb();
    const now = Math.floor(Date.now() / 1000);
    db.prepare(`
      INSERT INTO links (provider, from_url, to_url, link_text, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(provider, fromUrl, toUrl, linkText || null, now);
  },

  addMany(provider, fromUrl, links) {
    const db = getDb();
    const now = Math.floor(Date.now() / 1000);
    const stmt = db.prepare(`
      INSERT INTO links (provider, from_url, to_url, link_text, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    const insertMany = db.transaction((links) => {
      for (const link of links) {
        stmt.run(provider, fromUrl, link.url, link.text || null, now);
      }
    });
    insertMany(links);
  },

  getMap(provider) {
    const db = getDb();
    return db.prepare('SELECT from_url, to_url, link_text FROM links WHERE provider = ?').all(provider);
  },

  getExistingDomains(provider) {
    const db = getDb();
    const rows = db.prepare('SELECT DISTINCT url FROM pages WHERE provider = ?').all(provider);
    const domains = new Set();
    for (const row of rows) {
      try {
        const match = row.url.match(/^https?:\/\/([^\/]+)/);
        if (match) domains.add(match[1]);
      } catch {}
    }
    return [...domains];
  },
};

// GIF cache
const gifOps = {
  get(keyword) {
    const db = getDb();
    const row = db.prepare('SELECT * FROM gif_cache WHERE keyword = ?').get(keyword);
    if (!row) return null;

    const now = Math.floor(Date.now() / 1000);
    const TTL = 86400; // 24 hours
    if ((now - row.cached_at) > TTL) return null;

    return JSON.parse(row.urls_json);
  },

  set(keyword, urls) {
    const db = getDb();
    const now = Math.floor(Date.now() / 1000);
    db.prepare(`
      INSERT OR REPLACE INTO gif_cache (keyword, urls_json, cached_at)
      VALUES (?, ?, ?)
    `).run(keyword, JSON.stringify(urls), now);
  },
};

module.exports = { getDb, pageOps, searchOps, linkOps, gifOps };
