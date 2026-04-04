// Top navigation layout — horizontal button-style nav below banner
// No sidebar, content fills full width below nav bar

const { escapeHtml } = require('../blocks');

module.exports = function render(bp, contentHtml, activePage) {
  const c = bp.colors || {};
  const font = bp.font || 'Verdana';
  const navHtml = (bp.nav || []).map(item => {
    const isActive = activePage && item.label.toLowerCase() === activePage.toLowerCase();
    if (isActive) {
      return `<td bgcolor="${c.link}" align="center"><font face="${font}" size="2" color="${c.bg}"><b>&nbsp;${escapeHtml(item.label)}&nbsp;</b></font></td>`;
    }
    return `<td bgcolor="${c.accent}" align="center"><font face="${font}" size="2"><a href="${item.href}">&nbsp;${escapeHtml(item.label)}&nbsp;</a></font></td>`;
  }).join('\n<td width="2"></td>\n');

  return `<html>
<head><title>${escapeHtml(bp.siteName)}${activePage ? ' - ' + escapeHtml(activePage) : ''}</title></head>
<body bgcolor="${c.bg}" text="${c.text}" link="${c.link}" vlink="${c.vlink}">
<table width="100%" border="0" cellpadding="0" cellspacing="0">
<tr><td bgcolor="${c.accent}" align="center">
<br>
<font face="${font}" size="5" color="${c.accentText}"><b>${escapeHtml(bp.siteName)}</b></font>
${bp.tagline ? `<br><font face="${font}" size="2" color="${c.accentText}"><i>${escapeHtml(bp.tagline)}</i></font>` : ''}
<br><br>
</td></tr>
<tr><td bgcolor="${c.bg}">
<table border="0" cellpadding="4" cellspacing="2" align="center"><tr>
${navHtml}
</tr></table>
</td></tr>
</table>
<br>
<table width="85%" align="center" border="0" cellpadding="8" cellspacing="0"><tr><td>
${contentHtml}
</td></tr></table>
<br>
<center>
<hr noshade size="1" width="85%">
<font face="${font}" size="1">${bp.footer ? escapeHtml(bp.footer) : ''}</font>
</center>
</body></html>`;
};
