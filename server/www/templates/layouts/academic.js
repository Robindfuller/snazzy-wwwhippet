// Academic/plain layout — minimal design, Times New Roman, text-heavy
// Looks like a university department page or research paper site

const { escapeHtml } = require('../blocks');

module.exports = function render(bp, contentHtml, activePage) {
  const c = bp.colors || {};
  const font = bp.font || 'Times New Roman';
  const navHtml = (bp.nav || []).map(item => {
    const isActive = activePage && item.label.toLowerCase() === activePage.toLowerCase();
    return isActive
      ? `<b>[${escapeHtml(item.label)}]</b>`
      : `[<a href="${item.href}">${escapeHtml(item.label)}</a>]`;
  }).join(' ');

  return `<html>
<head><title>${escapeHtml(bp.siteName)}${activePage ? ' - ' + escapeHtml(activePage) : ''}</title></head>
<body bgcolor="${c.bg}" text="${c.text}" link="${c.link}" vlink="${c.vlink}">
<table width="600" align="center" border="0" cellpadding="0" cellspacing="0"><tr><td>
<h2><font face="${font}">${escapeHtml(bp.siteName)}</font></h2>
${bp.tagline ? `<font face="${font}" size="2"><i>${escapeHtml(bp.tagline)}</i></font><br>` : ''}
<hr noshade size="1">
<font face="${font}" size="2">${navHtml}</font>
<hr noshade size="1">
<br>
<font face="${font}" size="2">
${contentHtml}
</font>
<br>
<hr noshade size="1">
<font face="${font}" size="1">${bp.footer ? escapeHtml(bp.footer) : ''}</font>
<br><br>
</td></tr></table>
</body></html>`;
};
