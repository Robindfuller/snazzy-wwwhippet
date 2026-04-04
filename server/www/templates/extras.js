// 90s web page extras — decorative elements for the footer area

function renderExtras(extras, blueprint) {
  if (!extras || !Array.isArray(extras)) return '';
  const font = blueprint.font || 'Arial';
  const parts = [];

  for (const extra of extras) {
    switch (extra) {
      case 'hit-counter': {
        const count = Math.floor(Math.random() * 50000) + 100;
        parts.push(`<font face="Courier New" size="1">Visitors: <b>${count.toLocaleString()}</b></font>`);
        break;
      }
      case 'best-viewed-in':
        parts.push(`<font face="${font}" size="1">Best viewed in Netscape Navigator 3.0 at 800x600</font>`);
        break;
      case 'guestbook-link':
        parts.push(`<font face="${font}" size="2"><a href="guestbook.html">Sign my Guestbook!</a> | <a href="guestbook.html">View Guestbook</a></font>`);
        break;
      case 'webring': {
        const ringName = blueprint.siteName ? blueprint.siteName.split(' ')[0] + ' Ring' : 'WebRing';
        parts.push(`<table border="1" cellpadding="4" cellspacing="0"><tr><td align="center" bgcolor="#eeeeee"><font face="${font}" size="1"><b>${ringName}</b><br>[<a href="#">Prev</a> | <a href="#">Random</a> | <a href="#">Next</a> | <a href="#">List</a>]</font></td></tr></table>`);
        break;
      }
      case 'under-construction':
        parts.push(`<font face="${font}" size="2" color="#ff0000"><b>** UNDER CONSTRUCTION **</b></font>`);
        break;
      case 'email-webmaster': {
        const domain = blueprint.siteName ? blueprint.siteName.toLowerCase().replace(/[^a-z0-9]/g, '') : 'mysite';
        parts.push(`<font face="${font}" size="1"><a href="mailto:webmaster@${domain}.com">Email the webmaster</a></font>`);
        break;
      }
      case 'last-updated': {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const m = months[Math.floor(Math.random() * 12)];
        const d = Math.floor(Math.random() * 28) + 1;
        parts.push(`<font face="${font}" size="1">Last updated ${m} ${d}, 1997</font>`);
        break;
      }
    }
  }

  return parts.join('<br>\n');
}

module.exports = { renderExtras };
