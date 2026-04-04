// Splash page layout — movie/entertainment promos, dramatic centered design
// Big title, dark background, minimal nav

const { escapeHtml } = require('../blocks');

module.exports = function render(bp, contentHtml, activePage) {
  const c = bp.colors || {};
  const font = bp.font || 'Impact';
  const navHtml = renderNav(bp.nav, font, c, activePage);
  const footerHtml = bp.footer ? escapeHtml(bp.footer) : '';

  return `<html>
<head><title>${escapeHtml(bp.siteName)}${activePage ? ' - ' + escapeHtml(activePage) : ''}</title></head>
<body bgcolor="${c.bg || '#000000'}" text="${c.text || '#cccccc'}" link="${c.link || '#ff6600'}" vlink="${c.vlink || '#cc3300'}">
<center>
<br><br>
<table width="580" border="0" cellpadding="0" cellspacing="0">
<tr><td align="center">
<font face="${font}" size="7" color="${c.accentText || '#ffffff'}"><b>${escapeHtml(bp.siteName)}</b></font>
${bp.tagline ? `<br><br><font face="${bp.font || 'Arial'}" size="3" color="${c.accent || '#ff6600'}"><i>${escapeHtml(bp.tagline)}</i></font>` : ''}
</td></tr>
<tr><td align="center"><br>
<hr noshade size="2" width="60%" color="${c.accent || '#ff6600'}">
${navHtml ? `<font face="Arial" size="2">${navHtml}</font><br>` : ''}
<hr noshade size="2" width="60%" color="${c.accent || '#ff6600'}">
<br></td></tr>
<tr><td align="center">
${contentHtml}
</td></tr>
<tr><td align="center">
<br><hr noshade size="1" width="50%">
<font face="Arial" size="1">${footerHtml}</font>
<br><br>
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
      return `<font color="${colors.accent || '#ff6600'}"><b>[ ${escapeHtml(item.label)} ]</b></font>`;
    }
    return `[ <a href="${item.href}">${escapeHtml(item.label)}</a> ]`;
  }).join(' &nbsp; ');
}
