// GeoCities personal homepage — wild, chaotic, Comic Sans, everything centered
// No structured nav bar, just links scattered in the content

const { escapeHtml } = require('../blocks');

module.exports = function render(bp, contentHtml, activePage) {
  const c = bp.colors || {};
  const font = bp.font || 'Comic Sans MS';
  const navHtml = (bp.nav || []).map(item => {
    const isActive = activePage && item.label.toLowerCase() === activePage.toLowerCase();
    return isActive
      ? `<font face="${font}" size="2" color="${c.accent || '#ff00ff'}"><b>~*~ ${escapeHtml(item.label)} ~*~</b></font>`
      : `<font face="${font}" size="2"><a href="${item.href}">${escapeHtml(item.label)}</a></font>`;
  }).join(' &#9733; ');

  return `<html>
<head><title>${escapeHtml(bp.siteName)}${activePage ? ' - ' + escapeHtml(activePage) : ''}</title></head>
<body bgcolor="${c.bg}" text="${c.text}" link="${c.link}" vlink="${c.vlink}">
<center>
<br>
<font face="${font}" size="6" color="${c.accent}"><b>~*~${escapeHtml(bp.siteName)}~*~</b></font>
${bp.tagline ? `<br><font face="${font}" size="3" color="${c.link}"><i>${escapeHtml(bp.tagline)}</i></font>` : ''}
<br><br>
${navHtml}
<br>
<hr noshade size="3" width="70%" color="${c.accent}">
</center>
<table width="85%" align="center" border="0" cellpadding="8"><tr><td>
${contentHtml}
</td></tr></table>
<center>
<hr noshade size="3" width="70%" color="${c.accent}">
<br>
${navHtml}
<br><br>
<font face="${font}" size="1">${bp.footer ? escapeHtml(bp.footer) : ''}</font>
<br><br>
</center>
</body></html>`;
};
