require('dotenv').config();
const express = require('express');
const path = require('path');
const ai = require('./server/ai');
const { linkOps } = require('./server/db');
const settings = require('./server/settings');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  const orig = res.end;
  res.end = function (...args) {
    const ms = Date.now() - start;
    const cached = res.getHeader('x-wwwhippet-cached') || '-';
    console.log(`  ${req.method} ${req.url} → ${res.statusCode} (${ms}ms) [cache:${cached}]`);
    orig.apply(this, args);
  };
  next();
});

// Load saved settings on startup
const saved = settings.load();
if (saved) {
  try {
    ai.applySettings(saved);
    console.log('  Loaded saved settings from data/settings.json');
  } catch (err) {
    console.error('  Failed to apply saved settings:', err.message);
  }
}

// --- API routes ---

// Get/set AI provider
app.get('/api/provider', (req, res) => {
  res.json({
    current: ai.getProvider(),
    available: ai.getAvailableProviders(),
  });
});

app.put('/api/provider', (req, res) => {
  try {
    ai.setProvider(req.body.provider);
    res.json({ current: ai.getProvider() });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Settings - get/save provider configuration
app.get('/api/settings', (req, res) => {
  res.json(ai.getSettings());
});

app.put('/api/settings', (req, res) => {
  try {
    ai.applySettings(req.body);
    // Persist to disk with real (unmasked) keys
    settings.save(ai.getRawSettings());
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

// Test a provider connection
app.post('/api/test-provider', async (req, res) => {
  try {
    const result = await ai.testProvider(req.body.provider);
    res.json({ ok: true, message: result });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
});

// Link map export
app.get('/api/link-map', (req, res) => {
  const provider = req.query.provider || ai.getProvider();
  const links = linkOps.getMap(provider);
  res.json({
    provider,
    nodes: [...new Set(links.flatMap(l => [l.from_url, l.to_url]))],
    edges: links.map(l => ({
      from: l.from_url,
      to: l.to_url,
      text: l.link_text,
    })),
  });
});

// mIRC AI chat endpoint
const mircChat = require('./server/mirc-chat');

app.post('/api/mirc/chat', async (req, res) => {
  const { channel, message, history } = req.body;
  if (!channel || !message) return res.status(400).json({ error: 'Missing channel or message' });
  try {
    const responses = await mircChat.generateChatResponse(channel, message, history || []);
    res.json({ responses });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Image proxy - serves external images through our origin to avoid CORS/mixed content
const imageProxyCache = path.join(__dirname, 'data', 'img-cache');
const fs = require('fs');
fs.mkdirSync(imageProxyCache, { recursive: true });
const crypto = require('crypto');

app.get('/api/img', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send('Missing url param');

  // Hash the URL for a cache filename
  const hash = crypto.createHash('md5').update(url).digest('hex');
  const ext = path.extname(new URL(url).pathname).toLowerCase() || '.gif';
  const cachePath = path.join(imageProxyCache, hash + ext);

  // Serve from disk cache if available
  if (fs.existsSync(cachePath)) {
    const mimeTypes = { '.gif': 'image/gif', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.bmp': 'image/bmp' };
    res.set('Content-Type', mimeTypes[ext] || 'image/gif');
    res.set('Cache-Control', 'public, max-age=31536000');
    return res.sendFile(cachePath);
  }

  // Fetch and cache
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; WWWhippet!/1.0)' },
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const buffer = Buffer.from(await response.arrayBuffer());
    fs.writeFileSync(cachePath, buffer);

    const contentType = response.headers.get('content-type') || 'image/gif';
    res.set('Content-Type', contentType);
    res.set('Cache-Control', 'public, max-age=31536000');
    res.send(buffer);
  } catch (err) {
    res.status(502).send('Failed to fetch image');
  }
});

// GIF browser search API
const { searchGifs, proxyUrl } = require('./server/www/gif-service');

app.get('/api/gifs', async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) return res.json({ results: [] });

  try {
    const urls = await searchGifs(q);
    res.json({
      query: q,
      results: urls.map(url => ({
        original: url,
        proxy: proxyUrl(url),
        filename: url.split('/').pop(),
      })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Ollama model loading (dial-up connect/disconnect) ---
app.post('/api/connect', async (req, res) => {
  const settings = ai.getSettings();
  const ollamaConfig = settings.ollama || {};
  const baseUrl = ollamaConfig.baseUrl || 'http://localhost:11434';
  const model = ollamaConfig.model || 'mistral';

  try {
    // Send a tiny request with keep_alive=-1 to load and pin the model in memory
    const response = await fetch(`${baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt: 'hi',
        keep_alive: -1,
        options: { num_predict: 1 },
      }),
      signal: AbortSignal.timeout(120000),
    });
    if (!response.ok) throw new Error(`Ollama: ${response.status}`);
    // Drain the response
    await response.text();
    res.json({ ok: true, model });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
});

app.post('/api/disconnect', async (req, res) => {
  const settings = ai.getSettings();
  const ollamaConfig = settings.ollama || {};
  const baseUrl = ollamaConfig.baseUrl || 'http://localhost:11434';
  const model = ollamaConfig.model || 'mistral';

  try {
    // Send keep_alive=0 to unload model from memory
    const response = await fetch(`${baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt: '',
        keep_alive: 0,
        options: { num_predict: 1 },
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error(`Ollama: ${response.status}`);
    await response.text();
    res.json({ ok: true });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
});

// --- SSE progress endpoint for page generation ---
const { generateAndCache } = require('./server/www/router');
const { pageOps } = require('./server/db');

app.get('/api/progress', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).end();

  const provider = ai.getProvider();
  const fakeUrl = url.startsWith('http') ? url : `http://${url}`;
  const domain = fakeUrl.replace(/^https?:\/\//, '').split('/')[0];

  // Set up SSE
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  const send = (event, data) => {
    res.write(`event: ${event}\ndata: ${data}\n\n`);
  };

  // Check for special pages that don't need generation
  const specialDomains = ['www.wwwhippet.com', 'www.gifvault.com'];
  if (specialDomains.includes(domain)) {
    send('status', `Contacting ${domain}...`);
    send('done', 'ok');
    return res.end();
  }

  // Check cache
  const cached = pageOps.get(provider, fakeUrl);
  if (cached && !cached.expired) {
    send('status', `Reading from cache...`);
    send('done', 'ok');
    return res.end();
  }

  // Not cached — generate with progress
  send('status', `DNS lookup: ${domain}...`);

  try {
    await generateAndCache(fakeUrl, provider, req.query._ref || null, req.query._linktext || null, (msg) => {
      send('status', msg);
    });
    send('status', `Transferring data from ${domain}...`);
    send('done', 'ok');
  } catch (err) {
    send('error-msg', err.message);
  }

  res.end();
});

// --- WWW Layer (the fake internet) ---
const wwwRouter = require('./server/www/router');
app.use('/www', wwwRouter);

// --- Shell Layer (modern UI) ---
app.use(express.static(path.join(__dirname, 'public')));

// Fallback to index.html for shell SPA
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n  ╔══════════════════════════════════════╗`);
  console.log(`  ║         WWWhippet! is running!         ║`);
  console.log(`  ║                                       ║`);
  console.log(`  ║  Shell:  http://localhost:${PORT}/        ║`);
  console.log(`  ║  WWW:    http://localhost:${PORT}/www/    ║`);
  console.log(`  ║  Provider: ${ai.getProvider().padEnd(25)}║`);
  console.log(`  ╚══════════════════════════════════════╝\n`);
});
