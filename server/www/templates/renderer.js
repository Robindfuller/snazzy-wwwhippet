// Hybrid renderer — AI-designed header/footer HTML + structured content blocks
// Each site gets a unique look (AI designs the chrome) but subpages stay consistent

const { renderBlocks } = require('./blocks');

function renderBlueprint(blueprint, contentType, activePage) {
  // Enforce color contrast
  if (blueprint.colors) {
    blueprint.colors = enforceContrast(blueprint.colors);
  }

  // Render content blocks to HTML
  const font = blueprint.font || 'Arial';
  const contentHtml = renderBlocks(blueprint.content, blueprint);

  // Wrap content in a table for consistent formatting
  const wrappedContent = `<table width="95%" align="center" border="0" cellpadding="8" cellspacing="0"><tr><td>\n<font face="${font}" size="2">\n${contentHtml}\n</font>\n</td></tr></table>`;

  // Highlight active nav in header if this is a subpage
  let header = blueprint.headerHtml || '';
  if (activePage && blueprint.nav) {
    for (const item of blueprint.nav) {
      if (item.label.toLowerCase() === activePage.toLowerCase()) {
        // Try to bold the matching nav link
        const escaped = item.label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const linkRe = new RegExp(`<a[^>]*>[^<]*${escaped}[^<]*<\\/a>`, 'i');
        header = header.replace(linkRe, `<b>${item.label}</b>`);
        break;
      }
    }
  }

  // Build the page title
  const title = activePage
    ? `${blueprint.siteName} - ${activePage}`
    : blueprint.siteName;

  // Assemble: head + AI header + content blocks + AI footer
  return `<html>
<head><title>${escapeHtml(title)}</title></head>
${header}
${wrappedContent}
${blueprint.footerHtml || '</body></html>'}`;
}

function renderSubpage(parentBlueprint, pageTitle, contentBlocks, contentType) {
  const bp = { ...parentBlueprint, content: contentBlocks };
  return renderBlueprint(bp, contentType, pageTitle);
}

// --- Utils ---

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// --- Color contrast enforcement ---

function parseColor(color) {
  if (!color) return null;
  color = color.trim().toLowerCase();
  const named = {
    black:[0,0,0], white:[255,255,255], red:[255,0,0], green:[0,128,0], blue:[0,0,255],
    yellow:[255,255,0], cyan:[0,255,255], magenta:[255,0,255], silver:[192,192,192],
    gray:[128,128,128], maroon:[128,0,0], olive:[128,128,0], lime:[0,255,0],
    aqua:[0,255,255], teal:[0,128,128], navy:[0,0,128], purple:[128,0,128],
    orange:[255,165,0], gold:[255,215,0],
  };
  if (named[color]) return named[color];
  const short = color.match(/^#([0-9a-f])([0-9a-f])([0-9a-f])$/i);
  if (short) return [parseInt(short[1]+short[1],16), parseInt(short[2]+short[2],16), parseInt(short[3]+short[3],16)];
  const long = color.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  if (long) return [parseInt(long[1],16), parseInt(long[2],16), parseInt(long[3],16)];
  return null;
}

function luminance(rgb) {
  const [r, g, b] = rgb.map(c => { c = c/255; return c <= 0.03928 ? c/12.92 : Math.pow((c+0.055)/1.055, 2.4); });
  return 0.2126*r + 0.7152*g + 0.0722*b;
}

function contrast(a, b) {
  const l1 = luminance(a), l2 = luminance(b);
  return (Math.max(l1,l2) + 0.05) / (Math.min(l1,l2) + 0.05);
}

function readableFallback(bgRgb) {
  return contrast(bgRgb, [255,255,255]) >= contrast(bgRgb, [0,0,0]) ? '#ffffff' : '#000000';
}

function readableLinkFallback(bgRgb) {
  const candidates = [[0,0,204],[255,255,0],[0,255,255],[255,204,0],[255,102,102],[102,255,102],[255,153,0]];
  let best = null, bestR = 0;
  for (const c of candidates) { const r = contrast(bgRgb, c); if (r > bestR) { bestR = r; best = c; } }
  if (bestR >= 3) return '#' + best.map(c => c.toString(16).padStart(2,'0')).join('');
  return readableFallback(bgRgb);
}

const MIN_CONTRAST = 3;

function enforceContrast(colors) {
  const fixed = { ...colors };
  if (!fixed.bg) fixed.bg = '#000033';
  if (!fixed.text) fixed.text = '#cccccc';
  if (!fixed.link) fixed.link = '#ffcc00';
  if (!fixed.vlink) fixed.vlink = '#cc9900';

  const bg = parseColor(fixed.bg);
  if (!bg) return fixed;

  const text = parseColor(fixed.text);
  if (!text || contrast(bg, text) < MIN_CONTRAST) fixed.text = readableFallback(bg);

  const link = parseColor(fixed.link);
  if (!link || contrast(bg, link) < MIN_CONTRAST) fixed.link = readableLinkFallback(bg);

  const vlink = parseColor(fixed.vlink);
  if (!vlink || contrast(bg, vlink) < MIN_CONTRAST) fixed.vlink = readableLinkFallback(bg);

  return fixed;
}

module.exports = { renderBlueprint, renderSubpage };
