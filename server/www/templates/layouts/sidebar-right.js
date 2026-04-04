// Right sidebar layout — content on left, nav/extras on right
// Common for tech sites, review sites, some corporate pages

const { escapeHtml } = require('../blocks');

module.exports = function render(bp, contentHtml, activePage) {
  const c = bp.colors || {};
  const font = bp.font || 'Verdana';
  const navHtml = (bp.nav || []).map(item => {
    const isActive = activePage && item.label.toLowerCase() === activePage.toLowerCase();
    return isActive
      ? `<font face="${font}" size="2"><b>&#9658; ${escapeHtml(item.label)}</b></font><br>`
      : `<font face="${font}" size="2"><a href="${item.href}">${escapeHtml(item.label)}</a></font><br>`;
  }).join('\n');

  return `<html>
<head><title>${escapeHtml(bp.siteName)}${activePage ? ' - ' + escapeHtml(activePage) : ''}</title></head>
<body bgcolor="${c.bg}" text="${c.text}" link="${c.link}" vlink="${c.vlink}">
<table width="100%" border="0" cellpadding="8" cellspacing="0" bgcolor="${c.accent}">
<tr><td>
<font face="${font}" size="4" color="${c.accentText}"><b>${escapeHtml(bp.siteName)}</b></font>
${bp.tagline ? ` - <font face="${font}" size="2" color="${c.accentText}"><i>${escapeHtml(bp.tagline)}</i></font>` : ''}
</td></tr>
</table>
<table width="100%" border="0" cellpadding="0" cellspacing="0">
<tr>
<td valign="top">
<table border="0" cellpadding="10" cellspacing="0" width="100%"><tr><td>
${contentHtml}
</td></tr></table>
</td>
<td width="160" valign="top" bgcolor="${c.contentBg || c.bg}">
<table width="160" border="0" cellpadding="8" cellspacing="0">
<tr><td>
<font face="${font}" size="2" color="${c.accent}"><b>Navigate</b></font>
<hr noshade size="1">
${navHtml}
<br>
</td></tr>
</table>
</td>
</tr>
</table>
<table width="100%" border="0" cellpadding="4" cellspacing="0" bgcolor="${c.accent}">
<tr><td align="center"><font face="${font}" size="1" color="${c.accentText}">${bp.footer ? escapeHtml(bp.footer) : ''}</font></td></tr>
</table>
</body></html>`;
};
