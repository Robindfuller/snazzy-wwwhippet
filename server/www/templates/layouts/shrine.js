// Fan shrine layout — dramatic, obsessive, heavy decoration
// Marquee header, beveled tables, bold colors, fan site energy

const { escapeHtml } = require('../blocks');

module.exports = function render(bp, contentHtml, activePage) {
  const c = bp.colors || {};
  const font = bp.font || 'Arial';
  const navHtml = (bp.nav || []).map(item => {
    const isActive = activePage && item.label.toLowerCase() === activePage.toLowerCase();
    if (isActive) {
      return `<td bgcolor="${c.link}" align="center"><font face="${font}" size="2" color="${c.bg}"><b>${escapeHtml(item.label)}</b></font></td>`;
    }
    return `<td bgcolor="${c.accent}" align="center" border="1"><font face="${font}" size="2"><a href="${item.href}">${escapeHtml(item.label)}</a></font></td>`;
  }).join('');

  return `<html>
<head><title>**${escapeHtml(bp.siteName)}**${activePage ? ' - ' + escapeHtml(activePage) : ''}</title></head>
<body bgcolor="${c.bg}" text="${c.text}" link="${c.link}" vlink="${c.vlink}">
<center>
<br>
<table border="2" cellpadding="8" cellspacing="0" bgcolor="${c.accent}" width="90%">
<tr><td align="center">
<font face="Impact, ${font}" size="6" color="${c.accentText}"><b>${escapeHtml(bp.siteName)}</b></font>
</td></tr>
</table>
${bp.tagline ? `<marquee width="80%"><font face="${font}" size="2" color="${c.link}"><b>${escapeHtml(bp.tagline)}</b></font></marquee>` : ''}
<br>
<table border="2" cellpadding="2" cellspacing="1"><tr>
${navHtml}
</tr></table>
</center>
<hr noshade size="2" color="${c.accent}">
<table width="90%" align="center" border="0" cellpadding="8"><tr><td>
${contentHtml}
</td></tr></table>
<hr noshade size="2" color="${c.accent}">
<center>
<table border="2" cellpadding="2" cellspacing="1"><tr>
${navHtml}
</tr></table>
<br>
<font face="${font}" size="1">${bp.footer ? escapeHtml(bp.footer) : ''}</font>
<br><br>
</center>
</body></html>`;
};
