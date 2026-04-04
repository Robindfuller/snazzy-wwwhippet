// Three-column layout — news portals, CNN/ZDNet style
// Left nav + wide content + right sidebar

const { escapeHtml } = require('../blocks');
const { renderBlocks } = require('../blocks');

module.exports = function render(bp, contentHtml, activePage) {
  const c = bp.colors || {};
  const font = bp.font || 'Arial';
  const navHtml = renderSideNav(bp.nav, font, c, activePage);
  const footerHtml = bp.footer ? escapeHtml(bp.footer) : '';

  // Split content: last 3 blocks go in the right sidebar
  const sidebarHtml = extractSidebar(bp, contentHtml);

  return `<html>
<head><title>${escapeHtml(bp.siteName)}${activePage ? ' - ' + escapeHtml(activePage) : ''}</title></head>
<body bgcolor="${c.bg || '#ffffff'}" text="${c.text || '#000000'}" link="${c.link || '#0000cc'}" vlink="${c.vlink || '#551a8b'}">
<table width="100%" border="0" cellpadding="0" cellspacing="0">
<tr><td colspan="3" bgcolor="${c.accent || '#cc0000'}">
<table width="100%" border="0" cellpadding="6" cellspacing="0"><tr>
<td><font face="${font}" size="5" color="${c.accentText || '#ffffff'}"><b>${escapeHtml(bp.siteName)}</b></font></td>
<td align="right"><font face="${font}" size="1" color="${c.accentText || '#ffffff'}">${bp.tagline ? escapeHtml(bp.tagline) : ''}</font></td>
</tr></table>
</td></tr>
<tr>
<td width="130" valign="top" bgcolor="${c.accent || '#cc0000'}">
<table width="130" border="0" cellpadding="4" cellspacing="0">
${navHtml}
</table>
</td>
<td valign="top" bgcolor="${c.contentBg || c.bg || '#ffffff'}">
<table border="0" cellpadding="8" cellspacing="0" width="100%"><tr><td>
${contentHtml}
</td></tr></table>
</td>
<td width="150" valign="top" bgcolor="${c.bg || '#ffffff'}">
<table width="150" border="0" cellpadding="6" cellspacing="0"><tr><td>
<font face="${font}" size="2" color="${c.accent || '#cc0000'}"><b>Also:</b></font><br>
<hr noshade size="1">
${sidebarHtml}
</td></tr></table>
</td>
</tr>
<tr><td colspan="3" bgcolor="${c.accent || '#cc0000'}" align="center">
<font face="${font}" size="1" color="${c.accentText || '#ffffff'}">${footerHtml}</font>
</td></tr>
</table>
</body></html>`;
};

function renderSideNav(nav, font, colors, activePage) {
  if (!nav || nav.length === 0) return '';
  return nav.map(item => {
    const isActive = activePage && item.label.toLowerCase() === activePage.toLowerCase();
    const label = isActive
      ? `<font face="${font}" size="2" color="${colors.accentText || '#ffffff'}"><b>${escapeHtml(item.label)}</b></font>`
      : `<font face="${font}" size="2"><a href="${item.href}">${escapeHtml(item.label)}</a></font>`;
    return `<tr><td>${label}</td></tr>`;
  }).join('\n');
}

function extractSidebar(bp, contentHtml) {
  // Generate some sidebar content from the last few nav items
  const font = bp.font || 'Arial';
  const nav = bp.nav || [];
  const links = nav.slice(0, 5).map(item =>
    `<font face="${font}" size="1">&#9632; <a href="${item.href}">${escapeHtml(item.label)}</a></font><br>`
  ).join('\n');
  return links || `<font face="${font}" size="1"><i>More stories coming soon...</i></font>`;
}
