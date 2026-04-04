// Magazine/news layout — masthead banner, two-column content below
// Looks like a 90s online magazine or news site

const { escapeHtml } = require('../blocks');

module.exports = function render(bp, contentHtml, activePage) {
  const c = bp.colors || {};
  const font = bp.font || 'Georgia';
  const navHtml = (bp.nav || []).map(item => {
    const isActive = activePage && item.label.toLowerCase() === activePage.toLowerCase();
    return isActive
      ? `<b>${escapeHtml(item.label)}</b>`
      : `<a href="${item.href}">${escapeHtml(item.label)}</a>`;
  }).join(' &bull; ');

  return `<html>
<head><title>${escapeHtml(bp.siteName)}${activePage ? ' - ' + escapeHtml(activePage) : ''}</title></head>
<body bgcolor="${c.bg}" text="${c.text}" link="${c.link}" vlink="${c.vlink}">
<center>
<table width="600" border="0" cellpadding="0" cellspacing="0">
<tr><td align="center" bgcolor="${c.accent}">
<br>
<font face="Georgia, ${font}" size="6" color="${c.accentText}"><b>${escapeHtml(bp.siteName)}</b></font>
${bp.tagline ? `<br><font face="${font}" size="2" color="${c.accentText}">${escapeHtml(bp.tagline)}</font>` : ''}
<br><br>
</td></tr>
<tr><td bgcolor="${c.contentBg || c.bg}">
<table width="100%" border="0" cellpadding="3"><tr><td align="center">
<font face="${font}" size="2">${navHtml}</font>
</td></tr></table>
<hr noshade size="2">
</td></tr>
<tr><td bgcolor="${c.contentBg || c.bg}">
<table width="100%" border="0" cellpadding="10" cellspacing="0"><tr><td>
${contentHtml}
</td></tr></table>
</td></tr>
<tr><td bgcolor="${c.accent}" align="center">
<font face="${font}" size="1" color="${c.accentText}"><br>${navHtml}<br></font>
</td></tr>
<tr><td align="center">
<br><font face="${font}" size="1">${bp.footer ? escapeHtml(bp.footer) : ''}</font><br>
</td></tr>
</table>
</center>
</body></html>`;
};
