// Centered single-column layout — personal pages, fan sites, simple sites
// Classic <center><table width="600"> pattern

const { escapeHtml } = require('../blocks');

module.exports = function render(bp, contentHtml, activePage) {
  const c = bp.colors || {};
  const font = bp.font || 'Arial';
  const navHtml = renderNav(bp.nav, font, c, activePage);
  const footerHtml = bp.footer ? escapeHtml(bp.footer) : '';

  return `<html>
<head><title>${escapeHtml(bp.siteName)}${activePage ? ' - ' + escapeHtml(activePage) : ''}</title></head>
<body bgcolor="${c.bg || '#000033'}" text="${c.text || '#cccccc'}" link="${c.link || '#ffcc00'}" vlink="${c.vlink || '#cc9900'}">
<center>
<table width="600" border="0" cellpadding="0" cellspacing="0">
<tr><td bgcolor="${c.accent || '#000066'}" align="center" cellpadding="8">
<br><font face="${font}" size="5" color="${c.accentText || '#ffffff'}"><b>${escapeHtml(bp.siteName)}</b></font>
${bp.tagline ? `<br><font face="${font}" size="2" color="${c.accentText || '#ffffff'}"><i>${escapeHtml(bp.tagline)}</i></font>` : ''}
<br>&nbsp;</td></tr>
${navHtml ? `<tr><td bgcolor="${c.accent || '#000066'}" align="center"><font face="${font}" size="2">${navHtml}</font></td></tr>` : ''}
<tr><td bgcolor="${c.contentBg || c.bg || '#000033'}" cellpadding="10">
<br>
${contentHtml}
</td></tr>
<tr><td align="center">
<hr noshade size="1" width="90%">
<font face="${font}" size="1">${footerHtml}</font>
</td></tr>
</table>
</center>
</body></html>`;
};

function renderNav(nav, font, colors, activePage) {
  if (!nav || nav.length === 0) return '';
  return nav.map(item => {
    const isActive = activePage && item.label.toLowerCase() === activePage.toLowerCase();
    if (isActive) {
      return `<font color="${colors.accentText || '#ffffff'}"><b>${escapeHtml(item.label)}</b></font>`;
    }
    return `<a href="${item.href}">${escapeHtml(item.label)}</a>`;
  }).join(' | ');
}
