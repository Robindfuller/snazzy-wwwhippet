// Minimal layout — very plain, text-focused, early web feel
// No banners, no colored tables, just text and horizontal rules
// Like a Gopher page that got converted to HTML

const { escapeHtml } = require('../blocks');

module.exports = function render(bp, contentHtml, activePage) {
  const c = bp.colors || {};
  const font = bp.font || 'Courier New';
  const navHtml = (bp.nav || []).map(item => {
    const isActive = activePage && item.label.toLowerCase() === activePage.toLowerCase();
    return isActive
      ? `&gt; <b>${escapeHtml(item.label)}</b>`
      : `&gt; <a href="${item.href}">${escapeHtml(item.label)}</a>`;
  }).join('<br>\n');

  return `<html>
<head><title>${escapeHtml(bp.siteName)}${activePage ? ' / ' + escapeHtml(activePage) : ''}</title></head>
<body bgcolor="${c.bg}" text="${c.text}" link="${c.link}" vlink="${c.vlink}">
<pre><font face="${font}" size="3"><b>${escapeHtml(bp.siteName)}</b></font></pre>
${bp.tagline ? `<font face="${font}" size="2">${escapeHtml(bp.tagline)}</font><br>` : ''}
<hr noshade>
<font face="${font}" size="2">
${navHtml}
</font>
<hr noshade>
<font face="${font}" size="2">
${contentHtml}
</font>
<hr noshade>
<font face="${font}" size="1">${bp.footer ? escapeHtml(bp.footer) : ''}</font>
</body></html>`;
};
