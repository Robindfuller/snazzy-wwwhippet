// Frameset-style layout — mimics the look of frames using nested tables
// Top banner, left nav with beveled buttons, right content area with inset border

const { escapeHtml } = require('../blocks');

module.exports = function render(bp, contentHtml, activePage) {
  const c = bp.colors || {};
  const font = bp.font || 'Arial';
  const navHtml = (bp.nav || []).map(item => {
    const isActive = activePage && item.label.toLowerCase() === activePage.toLowerCase();
    if (isActive) {
      return `<tr><td bgcolor="${c.link}" align="center"><font face="${font}" size="2" color="${c.bg}"><b>${escapeHtml(item.label)}</b></font></td></tr>`;
    }
    return `<tr><td bgcolor="${c.accent}" align="center" onmouseover="this.bgcolor='${c.link}'" onmouseout="this.bgcolor='${c.accent}'"><font face="${font}" size="2"><a href="${item.href}">${escapeHtml(item.label)}</a></font></td></tr>`;
  }).join('\n<tr><td height="2"></td></tr>\n');

  return `<html>
<head><title>${escapeHtml(bp.siteName)}${activePage ? ' - ' + escapeHtml(activePage) : ''}</title></head>
<body bgcolor="${c.bg}" text="${c.text}" link="${c.link}" vlink="${c.vlink}" topmargin="0" leftmargin="0" marginwidth="0" marginheight="0">
<table width="100%" border="0" cellpadding="0" cellspacing="0">
<tr><td colspan="2" bgcolor="${c.accent}">
<table width="100%" border="0" cellpadding="4" cellspacing="0"><tr>
<td><font face="${font}" size="4" color="${c.accentText}"><b>${escapeHtml(bp.siteName)}</b></font></td>
<td align="right"><font face="${font}" size="1" color="${c.accentText}">${bp.tagline ? escapeHtml(bp.tagline) : ''}</font></td>
</tr></table>
<hr noshade size="1">
</td></tr>
<tr>
<td width="120" valign="top" bgcolor="${c.accent}">
<table width="120" border="0" cellpadding="4" cellspacing="2">
<tr><td height="4"></td></tr>
${navHtml}
<tr><td height="20"></td></tr>
</table>
</td>
<td valign="top">
<table width="100%" border="0" cellpadding="0" cellspacing="0"><tr>
<td width="1" bgcolor="${c.accentText}"></td>
<td>
<table border="0" cellpadding="12" cellspacing="0" width="100%"><tr><td bgcolor="${c.contentBg || c.bg}">
${contentHtml}
<hr noshade size="1">
<font face="${font}" size="1">${bp.footer ? escapeHtml(bp.footer) : ''}</font>
</td></tr></table>
</td>
</tr></table>
</td>
</tr>
</table>
</body></html>`;
};
