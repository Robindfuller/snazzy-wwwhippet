// Left sidebar layout — corporate, directory, university sites
// 2-column: dark left nav (150px) + content area

const { escapeHtml } = require('../blocks');

module.exports = function render(bp, contentHtml, activePage) {
  const c = bp.colors || {};
  const font = bp.font || 'Arial';
  const navHtml = renderSideNav(bp.nav, font, c, activePage);
  const footerHtml = bp.footer ? escapeHtml(bp.footer) : '';

  return `<html>
<head><title>${escapeHtml(bp.siteName)}${activePage ? ' - ' + escapeHtml(activePage) : ''}</title></head>
<body bgcolor="${c.bg || '#ffffff'}" text="${c.text || '#000000'}" link="${c.link || '#000099'}" vlink="${c.vlink || '#551a8b'}">
<table width="100%" border="0" cellpadding="0" cellspacing="0">
<tr><td colspan="2" bgcolor="${c.accent || '#003366'}">
<table width="100%" border="0" cellpadding="8" cellspacing="0"><tr>
<td><font face="${font}" size="4" color="${c.accentText || '#ffffff'}"><b>${escapeHtml(bp.siteName)}</b></font>
${bp.tagline ? `<br><font face="${font}" size="1" color="${c.accentText || '#ffffff'}"><i>${escapeHtml(bp.tagline)}</i></font>` : ''}
</td>
</tr></table>
</td></tr>
<tr>
<td width="150" valign="top" bgcolor="${c.accent || '#003366'}">
<table width="150" border="0" cellpadding="6" cellspacing="0">
${navHtml}
</table>
</td>
<td valign="top" bgcolor="${c.contentBg || c.bg || '#ffffff'}">
<table border="0" cellpadding="10" cellspacing="0" width="100%"><tr><td>
${contentHtml}
</td></tr></table>
</td>
</tr>
<tr><td colspan="2" bgcolor="${c.accent || '#003366'}" align="center">
<font face="${font}" size="1" color="${c.accentText || '#ffffff'}">${footerHtml}</font>
</td></tr>
</table>
</body></html>`;
};

function renderSideNav(nav, font, colors, activePage) {
  if (!nav || nav.length === 0) return '';
  return nav.map(item => {
    const isActive = activePage && item.label.toLowerCase() === activePage.toLowerCase();
    const label = isActive
      ? `<font face="${font}" size="2" color="${colors.accentText || '#ffffff'}"><b>&#9658; ${escapeHtml(item.label)}</b></font>`
      : `<font face="${font}" size="2"><a href="${item.href}">${escapeHtml(item.label)}</a></font>`;
    return `<tr><td>${label}</td></tr>`;
  }).join('\n');
}
