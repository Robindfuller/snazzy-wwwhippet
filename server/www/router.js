const express = require('express');
const path = require('path');
const fs = require('fs');
const { pageOps, linkOps } = require('../db');
const ai = require('../ai');
const { classifyContent, getTTL } = require('./content-classifier');
const { generatePage } = require('./page-generator');
const { generateSearchResults, renderSearchResultsPage } = require('./search');
const { generateHomepage } = require('./homepage');
const crypto = require('crypto');

const router = express.Router();

const STATIC_DIR = path.join(__dirname, '..', '..', 'static');
const PAGES_DIR = path.join(__dirname, '..', '..', 'data', 'pages');

// All requests come in as /www/{domain}/{path}
router.get('*', async (req, res) => {
  try {
    // Extract the fake URL from the request path
    // /www/www.wwwhippet.com/cgi-bin/query?q=test → http://www.wwwhippet.com/cgi-bin/query?q=test
    const fakePath = req.path.replace(/^\//, '');
    if (!fakePath) {
      return res.redirect('/www/www.wwwhippet.com/');
    }

    const fakeUrl = `http://${fakePath}`;
    const domain = fakePath.split('/')[0];
    const provider = ai.getProvider();

    // 0. Check for invalid domains (bare filenames like "contact.html", no dots)
    if (!domain.includes('.') || domain.match(/^\w+\.html?$/i)) {
      return res.type('html').send(generateDnsError(domain));
    }

    // 1. Check for WWWhippet! search query
    if (domain === 'www.wwwhippet.com' && req.path.includes('/cgi-bin/query')) {
      const query = req.query.q || '';
      return await handleSearch(req, res, query, provider);
    }

    // 2. WWWhippet! homepage (dynamically generated, refreshes every ~2 days)
    if (domain === 'www.wwwhippet.com' && (req.path === '/www.wwwhippet.com/' || req.path === '/www.wwwhippet.com')) {
      const html = await generateHomepage(provider);
      return res.type('html').send(html);
    }

    // 2b. Settings page
    if (domain === 'www.wwwhippet.com' && req.path.includes('/settings')) {
      return res.sendFile(path.join(__dirname, '..', '..', 'public', 'settings.html'));
    }

    // 2c. GIF Vault — serve the local GIF browser page
    if (domain === 'www.gifvault.com') {
      return res.sendFile(path.join(__dirname, '..', '..', 'public', 'gifs.html'));
    }

    // 2d. MIDI Farm — serve the local MIDI archive page
    if (domain === 'www.midifarm.com') {
      return res.sendFile(path.join(__dirname, '..', '..', 'public', 'midi.html'));
    }

    // 3. Check cache for this URL
    const cached = pageOps.get(provider, fakeUrl);
    if (cached && !cached.expired) {
      const filePath = path.join(PAGES_DIR, cached.file_path);
      if (fs.existsSync(filePath)) {
        console.log(`  [router] CACHE HIT: ${fakeUrl} (${cached.content_type}, ${Math.round((Date.now()/1000 - cached.created_at))}s old)`);
        res.set('X-WWWhippet-Cached', 'true');
        res.set('X-WWWhippet-ContentType', cached.content_type);
        return res.sendFile(filePath);
      }
      console.log(`  [router] CACHE MISS — file gone: ${cached.file_path}`);
    } else if (cached) {
      console.log(`  [router] CACHE EXPIRED: ${fakeUrl} (${Math.round((Date.now()/1000 - cached.created_at))}s old, ttl=${cached.ttl_seconds}s)`);
    } else {
      console.log(`  [router] CACHE MISS: ${fakeUrl}`);
    }

    // 4. Generate the page
    const referrerUrl = req.query._ref || null;
    const linkText = req.query._linktext || null;

    const { html, contentType } = await generateAndCache(fakeUrl, provider, referrerUrl, linkText);

    res.set('X-WWWhippet-Cached', 'false');
    res.set('X-WWWhippet-ContentType', contentType);
    res.type('html').send(html);

  } catch (err) {
    console.error('WWW router error:', err);
    res.type('html').send(generateErrorPage(err.message));
  }
});

async function handleSearch(req, res, query, provider) {
  if (!query.trim()) {
    return res.redirect('/www/www.wwwhippet.com/');
  }

  const { results, html } = await generateSearchResults(query, provider);
  res.type('html').send(html);
}

// Shared generation logic — used by both /www/ and /api/progress
async function generateAndCache(fakeUrl, provider, referrerUrl, linkText, onProgress = null) {
  const progress = (msg) => { if (onProgress) onProgress(msg); };

  let referrerContext = null;
  if (referrerUrl) {
    const refPage = pageOps.get(provider, referrerUrl);
    if (refPage?.identity) {
      referrerContext = { url: referrerUrl, identity: refPage.identity, linkText };
    }
  }

  const searchContext = findSearchContext(provider, fakeUrl);
  const contentType = classifyContent(fakeUrl, searchContext);
  const ttl = getTTL(contentType);
  const existingIdentity = pageOps.getIdentity(provider, fakeUrl);
  const existingDomains = linkOps.getExistingDomains(provider);
  const parentContext = findParentContext(provider, fakeUrl);

  progress('Requesting document...');

  const result = await generatePage(fakeUrl, contentType, {
    identity: existingIdentity,
    searchContext,
    existingDomains,
    parentContext,
    referrerContext,
    provider,
  }, onProgress);

  const html = result.html;
  const identity = extractIdentity(html, fakeUrl, contentType);

  // Store blueprint if the generator produced one
  if (result.blueprint) {
    identity.blueprint = result.blueprint;
  }

  const hash = crypto.createHash('md5').update(fakeUrl).digest('hex');
  const relPath = `${provider}/${hash}.html`;
  const absPath = path.join(PAGES_DIR, relPath);
  fs.mkdirSync(path.dirname(absPath), { recursive: true });
  fs.writeFileSync(absPath, html);

  pageOps.set(provider, fakeUrl, contentType, relPath, identity, searchContext, ttl);

  const extractedLinks = extractLinks(html, fakeUrl);
  if (extractedLinks.length > 0) {
    linkOps.addMany(provider, fakeUrl, extractedLinks);
  }

  return { html, contentType };
}

function extractIdentity(html, url, contentType) {
  const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1] : url;

  // Extract a content summary — grab visible text from the first ~500 chars
  const textOnly = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 500);

  // Extract internal link labels to understand the site structure
  const linkLabels = [];
  const linkRegex = /href\s*=\s*["'](?!http|mailto|javascript|#)([^"']+)["'][^>]*>([^<]+)/gi;
  let m;
  while ((m = linkRegex.exec(html)) !== null) {
    linkLabels.push({ path: m[1], label: m[2].trim() });
  }

  // Extract visual style — colors, fonts, body attributes
  const style = extractVisualStyle(html);

  // Extract site chrome (header/footer) from comment markers
  const chrome = extractSiteChrome(html);

  // Extract the <head> section for reuse
  const headMatch = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  const headTemplate = headMatch ? headMatch[1].replace(/<title[^>]*>.*?<\/title>/i, '<title>{{TITLE}}</title>') : null;

  return { title, url, contentType, summary: textOnly, subpages: linkLabels.slice(0, 10), style, chrome, headTemplate };
}

// Extract site chrome from AI-generated comment markers
function extractSiteChrome(html) {
  const chrome = {};

  const headerMatch = html.match(/<!--SITE-HEADER-->([\s\S]*?)<!--\/SITE-HEADER-->/i);
  if (headerMatch) chrome.header = headerMatch[1].trim();

  const contentMatch = html.match(/<!--SITE-CONTENT-->([\s\S]*?)<!--\/SITE-CONTENT-->/i);
  if (contentMatch) chrome.content = contentMatch[1].trim();

  const footerMatch = html.match(/<!--SITE-FOOTER-->([\s\S]*?)<!--\/SITE-FOOTER-->/i);
  if (footerMatch) chrome.footer = footerMatch[1].trim();

  // Extract nav items with their hrefs from the header
  if (chrome.header) {
    const navItems = [];
    const navRegex = /<a[^>]*href\s*=\s*["']([^"']+)["'][^>]*>([^<]+)<\/a>/gi;
    let nm;
    while ((nm = navRegex.exec(chrome.header)) !== null) {
      navItems.push({ href: nm[1], label: nm[2].trim() });
    }
    if (navItems.length >= 2) chrome.navItems = navItems;
  }

  return (chrome.header || chrome.footer) ? chrome : null;
}

function extractVisualStyle(html) {
  const style = {};

  // Extract body attributes
  const bodyMatch = html.match(/<body([^>]*)>/i);
  if (bodyMatch) {
    const attrs = bodyMatch[1];
    const bgcolorMatch = attrs.match(/bgcolor\s*=\s*["']([^"']+)["']/i);
    const textMatch = attrs.match(/\btext\s*=\s*["']([^"']+)["']/i);
    const linkMatch = attrs.match(/\blink\s*=\s*["']([^"']+)["']/i);
    const vlinkMatch = attrs.match(/\bvlink\s*=\s*["']([^"']+)["']/i);
    const bgMatch = attrs.match(/background\s*=\s*["']([^"']+)["']/i);
    if (bgcolorMatch) style.bgcolor = bgcolorMatch[1];
    if (textMatch) style.textColor = textMatch[1];
    if (linkMatch) style.linkColor = linkMatch[1];
    if (vlinkMatch) style.vlinkColor = vlinkMatch[1];
    if (bgMatch) style.backgroundImage = bgMatch[1];
  }

  // Extract dominant font faces used
  const fontFaces = [];
  const fontRegex = /face\s*=\s*["']([^"']+)["']/gi;
  let fm;
  while ((fm = fontRegex.exec(html)) !== null) {
    fontFaces.push(fm[1]);
  }
  // Get the most common font
  if (fontFaces.length > 0) {
    const freq = {};
    fontFaces.forEach(f => freq[f] = (freq[f] || 0) + 1);
    style.primaryFont = Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0];
  }

  // Extract table bgcolor colors used for navigation/headers
  const tableBgColors = [];
  const tbgRegex = /<t[dhr][^>]*bgcolor\s*=\s*["']([^"']+)["']/gi;
  let tbg;
  while ((tbg = tbgRegex.exec(html)) !== null) {
    tableBgColors.push(tbg[1]);
  }
  if (tableBgColors.length > 0) {
    style.accentColors = [...new Set(tableBgColors)].slice(0, 5);
  }

  // Extract the navigation structure (the first table row with multiple links is likely nav)
  const navMatch = html.match(/<table[^>]*>[\s\S]*?<tr[^>]*>([\s\S]*?)<\/tr>/i);
  if (navMatch) {
    const navLinks = [];
    const navLinkRegex = />([^<]{2,30})<\/a>/gi;
    let nl;
    while ((nl = navLinkRegex.exec(navMatch[1])) !== null) {
      navLinks.push(nl[1].trim());
    }
    if (navLinks.length >= 3) {
      style.navItems = navLinks.slice(0, 8);
    }
  }

  return style;
}

function findSearchContext(provider, url) {
  // Look through cached search results to find context for this URL
  const { searchOps } = require('../db');
  const db = require('../db').getDb();
  const rows = db.prepare('SELECT results_json FROM search_results WHERE provider = ?').all(provider);
  for (const row of rows) {
    try {
      const results = JSON.parse(row.results_json);
      for (const r of results) {
        const resultUrl = r.url.replace(/^https?:\/\//, '');
        const checkUrl = url.replace(/^https?:\/\//, '');
        if (resultUrl === checkUrl || checkUrl.startsWith(resultUrl)) {
          return { title: r.title, snippet: r.snippet, type: r.type };
        }
      }
    } catch {}
  }
  return null;
}

function findParentContext(provider, url) {
  // Try to find the parent/root page of this URL
  // e.g. http://www.geocities.com/~nailqueen99/gallery.html → http://www.geocities.com/~nailqueen99/
  const urlObj = new URL(url);
  const pathParts = urlObj.pathname.split('/').filter(Boolean);

  // Try progressively shorter paths to find a cached parent
  for (let i = pathParts.length - 1; i >= 0; i--) {
    const parentPath = '/' + pathParts.slice(0, i).join('/') + '/';
    const parentUrl = `${urlObj.protocol}//${urlObj.host}${parentPath}`;

    if (parentUrl === url) continue;

    const parent = pageOps.get(provider, parentUrl);
    if (parent && parent.identity) {
      // Also read the actual HTML for richer context
      let parentHtml = '';
      try {
        const filePath = path.join(PAGES_DIR, parent.file_path);
        if (fs.existsSync(filePath)) {
          parentHtml = fs.readFileSync(filePath, 'utf-8');
        }
      } catch {}

      return {
        url: parentUrl,
        identity: parent.identity,
        contentType: parent.content_type,
        html: parentHtml, // Full HTML for header/footer extraction
      };
    }
  }

  // Also try the domain root
  const rootUrl = `${urlObj.protocol}//${urlObj.host}/`;
  if (rootUrl !== url) {
    const root = pageOps.get(provider, rootUrl);
    if (root && root.identity) {
      return {
        url: rootUrl,
        identity: root.identity,
        contentType: root.content_type,
      };
    }
  }

  return null;
}

function extractLinks(html, sourceUrl) {
  const links = [];
  const hrefRegex = /href\s*=\s*["']([^"']+)["'][^>]*>([^<]*)/gi;
  let match;

  while ((match = hrefRegex.exec(html)) !== null) {
    let href = match[1];
    const text = match[2].trim();

    // Skip anchors, mailto, javascript
    if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('javascript:')) continue;

    // Resolve relative URLs
    if (!href.startsWith('http://') && !href.startsWith('https://')) {
      try {
        const base = sourceUrl.endsWith('/') ? sourceUrl : sourceUrl.substring(0, sourceUrl.lastIndexOf('/') + 1);
        href = new URL(href, base).href;
      } catch {
        continue;
      }
    }

    links.push({ url: href, text });
  }

  return links;
}

function generateDnsError(domain) {
  return `<html>
<head><title>Netscape is unable to locate the server</title></head>
<body bgcolor="#cccccc">
<center>
<table width="80%" border="0" cellpadding="10" cellspacing="0">
<tr><td>
<h2><font face="Arial">Netscape is unable to locate the server:</font></h2>
<blockquote>
<font face="Courier New" size="3"><b>${domain}</b></font>
</blockquote>
<font face="Arial" size="2">
<p>The server does not have a DNS entry.</p>
<p>Check the server name in the Location (URL) and try again.</p>
</font>
<hr noshade size="1">
<font face="Arial" size="1">
<p><b>What you can try:</b></p>
<ul>
<li>If you typed the address, check the spelling and try again.</li>
<li>If you followed a link, the webmaster may have made an error. Use the Back button to return to the previous page.</li>
<li>Try searching for the page using <a href="http://www.wwwhippet.com/">WWWhippet!</a></li>
</ul>
</font>
</td></tr>
</table>
</center>
</body>
</html>`;
}

function generateErrorPage(message) {
  return `<html>
<head><title>Error - WWWhippet!</title></head>
<body bgcolor="#ffffff">
<center>
<h1><font face="Arial" color="#cc0000">Error</font></h1>
<hr noshade width="80%">
<p><font face="Arial">The server encountered an error while processing your request.</font></p>
<p><font face="Courier New" size="2" color="#666666">${message}</font></p>
<hr noshade width="80%">
<p><font face="Arial" size="2"><a href="http://www.wwwhippet.com/">Return to WWWhippet!</a></font></p>
</center>
</body>
</html>`;
}

module.exports = router;
module.exports.generateAndCache = generateAndCache;
