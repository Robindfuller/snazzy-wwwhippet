// Portal layout — Yahoo-style directory, multi-section grid
// Full-width banner + 3-column grid of categories/links

const { escapeHtml } = require('../blocks');

module.exports = function render(bp, contentHtml, activePage) {
  const c = bp.colors || {};
  const font = bp.font || 'Arial';
  const navHtml = renderNav(bp.nav, font, c, activePage);
  const footerHtml = bp.footer ? escapeHtml(bp.footer) : '';

  return `<html>
<head><title>${escapeHtml(bp.siteName)}${activePage ? ' - ' + escapeHtml(activePage) : ''}</title></head>
<body bgcolor="${c.bg || '#ffffff'}" text="${c.text || '#000000'}" link="${c.link || '#0000cc'}" vlink="${c.vlink || '#551a8b'}">
<center>
<table width="100%" border="0" cellpadding="6" cellspacing="0" bgcolor="${c.accent || '#6633cc'}">
<tr><td align="center">
<font face="${font}" size="5" color="${c.accentText || '#ffffff'}"><b>${escapeHtml(bp.siteName)}</b></font>
${bp.tagline ? `<br><font face="${font}" size="2" color="${c.accentText || '#ffffff'}"><i>${escapeHtml(bp.tagline)}</i></font>` : ''}
</td></tr>
</table>
${navHtml ? `<table width="100%" border="0" cellpadding="3" cellspacing="0" bgcolor="${c.contentBg || '#eeeeee'}"><tr><td align="center"><font face="${font}" size="2">${navHtml}</font></td></tr></table>` : ''}
</center>
<br>
<table width="90%" align="center" border="0" cellpadding="8" cellspacing="4">
<tr><td valign="top">
${contentHtml}
</td></tr>
</table>
<br>
<center>
<hr noshade size="1" width="80%">
<font face="${font}" size="1">${footerHtml}</font>
</center>
</body></html>`;
};

function renderNav(nav, font, colors, activePage) {
  if (!nav || nav.length === 0) return '';
  return nav.map(item => {
    const isActive = activePage && item.label.toLowerCase() === activePage.toLowerCase();
    if (isActive) {
      return `<b>${escapeHtml(item.label)}</b>`;
    }
    return `<a href="${item.href}">${escapeHtml(item.label)}</a>`;
  }).join(' | ');
}
