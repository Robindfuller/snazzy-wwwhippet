const { gifOps } = require('../db');

// Wrap an external URL through our image proxy to avoid CORS issues
function proxyUrl(url) {
  return `/api/img?url=${encodeURIComponent(url)}`;
}

async function searchGifs(keyword) {
  // Check cache first
  const cached = gifOps.get(keyword);
  if (cached && cached.length > 0) return cached;

  // Search gifcities.org with the correct URL format
  try {
    const response = await fetch(
      `https://gifcities.org/search?q=${encodeURIComponent(keyword)}&offset=0&page_size=30`,
      {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; WWWhippet/1.0)' },
        signal: AbortSignal.timeout(10000),
      }
    );
    if (response.ok) {
      const html = await response.text();
      const urls = [];
      // Extract all GIF URLs from the page
      const regex = /https?:\/\/[^"' ><]*\.gif/gi;
      let match;
      while ((match = regex.exec(html)) !== null) {
        const url = match[0];
        // Only keep gifcities blob URLs and archive.org geocities GIFs
        if (url.includes('blob.gifcities.org') || url.includes('geocities.com')) {
          urls.push(url);
        }
      }
      if (urls.length > 0) {
        // Deduplicate
        const unique = [...new Set(urls)];
        gifOps.set(keyword, unique);
        return unique;
      }
    }
  } catch (err) {
    console.error(`GIF search failed for "${keyword}":`, err.message);
  }

  return [];
}

function getRandomGif(urls) {
  if (!urls || urls.length === 0) return null;
  return urls[Math.floor(Math.random() * urls.length)];
}

async function replaceGifPlaceholders(html) {
  const placeholders = [];
  const regex = /\{\{GIF:([^}]+)\}\}/g;
  let match;

  while ((match = regex.exec(html)) !== null) {
    placeholders.push({ full: match[0], keyword: match[1] });
  }

  // Fetch all GIF searches in parallel
  const searches = await Promise.all(
    [...new Set(placeholders.map(p => p.keyword))].map(async keyword => {
      const urls = await searchGifs(keyword);
      return { keyword, urls };
    })
  );

  const gifMap = {};
  for (const s of searches) {
    gifMap[s.keyword] = s.urls;
  }

  for (const ph of placeholders) {
    const gif = getRandomGif(gifMap[ph.keyword]);
    if (gif) {
      // Route through our image proxy
      html = html.replace(ph.full, proxyUrl(gif));
    } else {
      // Remove the placeholder entirely rather than showing a broken image
      html = html.replace(ph.full, '');
    }
  }

  return html;
}

module.exports = { searchGifs, replaceGifPlaceholders, proxyUrl };
