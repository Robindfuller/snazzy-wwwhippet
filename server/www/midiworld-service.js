// MidiWorld.com scraper — search and download real MIDI files
// Scrapes search results from midiworld.com and proxies downloads

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const CACHE_DIR = path.join(__dirname, '..', '..', 'data', 'midi-cache');
fs.mkdirSync(CACHE_DIR, { recursive: true });

// In-memory search result cache (TTL: 1 hour)
const searchCache = new Map();
const SEARCH_TTL = 60 * 60 * 1000;

/**
 * Search midiworld.com for MIDI files
 * @param {string} query - Search term
 * @returns {Promise<Array<{title: string, artist: string, id: number, downloadUrl: string}>>}
 */
async function searchMidiWorld(query) {
  if (!query || !query.trim()) return [];

  const cacheKey = query.toLowerCase().trim();
  const cached = searchCache.get(cacheKey);
  if (cached && Date.now() - cached.time < SEARCH_TTL) {
    return cached.results;
  }

  try {
    const url = `https://www.midiworld.com/search/?q=${encodeURIComponent(query)}`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; WWWhippet!/1.0)' },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const html = await response.text();

    // Parse search results
    // Format: "<li>\nSong Title (Artist) - <a href="https://www.midiworld.com/download/ID">download</a>"
    const results = [];
    const regex = /(?:<li>\s*\n?\s*)([^<(]+?)\s*\(([^)]+)\)\s*-\s*<a href="https?:\/\/www\.midiworld\.com\/download\/(\d+)"/g;
    let match;

    while ((match = regex.exec(html)) !== null) {
      const title = match[1].trim().replace(/^\s*li>\s*/i, '');
      const artist = match[2].trim();
      const id = parseInt(match[3]);

      results.push({
        title,
        artist,
        fullTitle: `${title} - ${artist}`,
        id,
        filename: `${artist.replace(/[^a-zA-Z0-9]/g, '_')}_-_${title.replace(/[^a-zA-Z0-9]/g, '_')}.mid`,
        downloadUrl: `/api/midi/download/${id}`,
      });
    }

    searchCache.set(cacheKey, { results, time: Date.now() });
    console.log(`  [midiworld] Search "${query}" → ${results.length} results`);
    return results;
  } catch (err) {
    console.error(`  [midiworld] Search error: ${err.message}`);
    return [];
  }
}

/**
 * Download a MIDI file by midiworld ID, with disk caching
 * @param {number} id - MidiWorld file ID
 * @returns {Promise<{buffer: Buffer, filename: string}|null>}
 */
async function downloadMidi(id) {
  const cachePath = path.join(CACHE_DIR, `${id}.mid`);

  // Serve from disk cache
  if (fs.existsSync(cachePath)) {
    const buffer = fs.readFileSync(cachePath);
    // Read cached filename
    const metaPath = cachePath + '.json';
    let filename = `midi_${id}.mid`;
    if (fs.existsSync(metaPath)) {
      try {
        const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
        filename = meta.filename;
      } catch {}
    }
    return { buffer, filename };
  }

  // Fetch from midiworld
  try {
    const url = `https://www.midiworld.com/download/${id}`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; WWWhippet!/1.0)' },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    // Extract filename from Content-Disposition header
    const disposition = response.headers.get('content-disposition') || '';
    const filenameMatch = disposition.match(/filename=(.+?)(?:;|$)/);
    const filename = filenameMatch ? filenameMatch[1].trim() : `midi_${id}.mid`;

    const buffer = Buffer.from(await response.arrayBuffer());

    // Verify it's actually MIDI data (starts with MThd)
    if (buffer.length < 4 || buffer.toString('ascii', 0, 4) !== 'MThd') {
      console.error(`  [midiworld] Download ${id}: not valid MIDI data`);
      return null;
    }

    // Cache to disk
    fs.writeFileSync(cachePath, buffer);
    fs.writeFileSync(cachePath + '.json', JSON.stringify({ filename, id }));

    console.log(`  [midiworld] Downloaded ${id}: ${filename} (${buffer.length} bytes)`);
    return { buffer, filename };
  } catch (err) {
    console.error(`  [midiworld] Download error: ${err.message}`);
    return null;
  }
}

module.exports = { searchMidiWorld, downloadMidi };
