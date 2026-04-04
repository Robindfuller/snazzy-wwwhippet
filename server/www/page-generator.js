// Page generator — blueprint-based (primary) with raw HTML fallback
// The AI returns JSON blueprints, the backend renders them using templates

const { generateBlueprint, generateSubpageContent } = require('./blueprint-generator');
const { renderBlueprint, renderSubpage } = require('./templates/renderer');

async function generatePage(url, contentType, context = {}, onProgress = null) {
  const progress = (msg) => { if (onProgress) onProgress(msg); };

  // Subpage with stored blueprint — content-only mode
  const parentBlueprint = context.parentContext?.identity?.blueprint;
  if (parentBlueprint) {
    return await generateSubpageBlueprint(url, contentType, context, onProgress);
  }

  // Same-domain referrer with stored blueprint — also content-only
  if (context.referrerContext?.identity?.blueprint && isSameDomain(url, context.referrerContext.url)) {
    const refBp = context.referrerContext.identity.blueprint;
    return await generateSubpageFromReferrer(url, contentType, refBp, context, onProgress);
  }

  // Full page — generate blueprint
  try {
    progress('Requesting document...');
    const blueprint = await generateBlueprint(url, contentType, context, onProgress);

    progress('Rendering document...');
    let html = renderBlueprint(blueprint, contentType);
    html = rewriteLinks(html, url);

    return { html, blueprint };
  } catch (err) {
    console.warn('Blueprint generation failed, falling back to raw HTML:', err.message);
    progress('Retrying with alternate method...');
    return await generatePageRawHtml(url, contentType, context, onProgress);
  }
}

async function generateSubpageBlueprint(url, contentType, context, onProgress) {
  const progress = (msg) => { if (onProgress) onProgress(msg); };
  const parentBlueprint = context.parentContext.identity.blueprint;

  try {
    progress('Requesting document...');
    const subpage = await generateSubpageContent(url, parentBlueprint, contentType, context, onProgress);

    progress('Rendering document...');
    let html = renderSubpage(parentBlueprint, subpage.pageTitle, subpage.content, contentType);
    html = rewriteLinks(html, url);
    return { html, blueprint: parentBlueprint };
  } catch (err) {
    console.warn('Subpage blueprint failed:', err.message);
    return await generatePageRawHtml(url, contentType, context, onProgress);
  }
}

async function generateSubpageFromReferrer(url, contentType, refBlueprint, context, onProgress) {
  const progress = (msg) => { if (onProgress) onProgress(msg); };

  try {
    progress('Requesting document...');
    const subpage = await generateSubpageContent(url, refBlueprint, contentType, context, onProgress);

    progress('Rendering document...');
    let html = renderSubpage(refBlueprint, subpage.pageTitle, subpage.content, contentType);
    html = rewriteLinks(html, url);
    return { html, blueprint: refBlueprint };
  } catch (err) {
    console.warn('Referrer blueprint subpage failed:', err.message);
    return await generatePageRawHtml(url, contentType, context, onProgress);
  }
}

// --- Raw HTML fallback (old system) ---

const ai = require('../ai');

const FALLBACK_SYSTEM = `You are a web page generator for a simulated 1997 internet. The year is 1997. User is in Folkestone, Kent, UK. Generate a complete HTML page using ONLY 90s HTML: <table>, <font>, <center>, <hr noshade>, bgcolor attributes. NO CSS, NO divs. Return ONLY raw HTML.`;

async function generatePageRawHtml(url, contentType, context = {}, onProgress = null) {
  const progress = (msg) => { if (onProgress) onProgress(msg); };

  let prompt = `Generate a 1997-style website for: ${url}\nSite type: ${contentType}`;

  if (context.searchContext) {
    prompt += `\nSearch info: "${context.searchContext.title}" — ${context.searchContext.snippet}`;
  }
  if (context.referrerContext?.linkText) {
    prompt += `\nUser clicked: "${context.referrerContext.linkText}"`;
  }

  progress('Waiting for reply...');
  let html = await ai.generate(FALLBACK_SYSTEM, prompt);
  progress('Receiving data...');

  html = html.replace(/^```html?\n?/i, '').replace(/\n?```$/i, '').trim();
  if (!html.match(/^(<(!DOCTYPE|html|HTML))/i)) html = '<html>\n' + html;
  html = html.replace(/<a[^>]*href="[^"]*wwwhippet[^"]*"[^>]*>([^<]*)<\/a>/gi, '$1');
  html = rewriteLinks(html, url);

  progress('Rendering document...');
  return { html, blueprint: null };
}

// --- Shared utilities ---

function rewriteLinks(html, currentUrl) {
  const urlMatch = currentUrl.match(/^https?:\/\/(.+)/);
  const fullPath = urlMatch ? urlMatch[1] : '';
  const basePath = fullPath.endsWith('/') ? fullPath : fullPath.substring(0, fullPath.lastIndexOf('/') + 1);
  const domain = fullPath.split('/')[0];

  // Fix http://filename.html (protocol but no domain) — AI sometimes does this
  html = html.replace(
    /href\s*=\s*["']https?:\/\/([^/"']+\.html?)["']/gi,
    (match, filename) => {
      // If it looks like a bare filename (no dots except .html), treat as relative
      if (!filename.includes('.') || filename.match(/^[^.]+\.html?$/i)) {
        return `href="/www/${basePath}${filename}"`;
      }
      return `href="/www/${filename}"`;
    }
  );

  // Rewrite full absolute URLs: http://domain.com/path → /www/domain.com/path
  html = html.replace(
    /href\s*=\s*["']https?:\/\/([^"']+)["']/gi,
    (match, urlPath) => `href="/www/${urlPath}"`
  );

  // Rewrite relative URLs: about.html → /www/domain.com/about.html
  if (basePath) {
    html = html.replace(
      /href\s*=\s*["'](?!\/www\/)(?!https?:\/\/)(?!mailto:)(?!javascript:)(?!#)([^"']+)["']/gi,
      (match, relPath) => `href="/www/${basePath}${relPath}"`
    );
  }

  return html;
}

function isSameDomain(url1, url2) {
  try {
    return new URL(url1).hostname === new URL(url2).hostname;
  } catch {
    return false;
  }
}

module.exports = { generatePage };
