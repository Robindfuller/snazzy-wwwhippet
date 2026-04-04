// Full-width stacked layout — basic personal pages, simple sites
// No constraining table, sections separated by <hr>

const { escapeHtml } = require('../blocks');

module.exports = function render(bp, contentHtml, activePage) {
  const c = bp.colors || {};
  const font = bp.font || 'Comic Sans MS';
  const navHtml = renderNav(bp.nav, font, c, activePage);
  const footerHtml = bp.footer ? escapeHtml(bp.footer) : '';

  return `<html>
<head><title>${escapeHtml(bp.siteName)}${activePage ? ' - ' + escapeHtml(activePage) : ''}</title></head>
<body bgcolor="${c.bg || '#ffff99'}" text="${c.text || '#000000'}" link="${c.link || '#0000cc'}" vlink="${c.vlink || '#551a8b'}">
<center>
<font face="${font}" size="5" color="${c.accent || '#cc0000'}"><b>${escapeHtml(bp.siteName)}</b></font>
${bp.tagline ? `<br><font face="${font}" size="2"><i>${escapeHtml(bp.tagline)}</i></font>` : ''}
</center>
<hr noshade size="2">
${navHtml ? `<center><font face="${font}" size="2">${navHtml}</font></center>\n<hr noshade size="2">\n` : ''}
<table width="90%" align="center" border="0" cellpadding="4"><tr><td>
${contentHtml}
</td></tr></table>
<hr noshade size="2">
<center>
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
  }).join(' * ');
}
