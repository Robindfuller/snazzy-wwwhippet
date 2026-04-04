// Content block renderers — each takes block data + blueprint context, returns HTML fragment

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Allow safe inline HTML: <b>, <i>, <a>, <br>, <u>, <font>, <em>, <strong>
function renderInlineHtml(text) {
  if (!text) return '';
  // The AI can include inline HTML in content text — pass it through
  // but escape anything that looks like a script tag
  return String(text)
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '');
}

function renderBlock(block, bp) {
  const font = bp.font || 'Arial';
  const accent = bp.colors?.accent || '#003366';
  const accentText = bp.colors?.accentText || '#ffffff';

  switch (block.type) {
    case 'heading':
      return `<font face="${font}" size="4" color="${accent}"><b>${renderInlineHtml(block.text)}</b></font><br><br>\n`;

    case 'subheading':
      return `<font face="${font}" size="3"><b>${renderInlineHtml(block.text)}</b></font><br>\n`;

    case 'paragraph':
      return `<font face="${font}" size="2">${renderInlineHtml(block.text)}</font><p>\n`;

    case 'bold-text':
      return `<font face="${font}" size="2"><b>${renderInlineHtml(block.text)}</b></font><br>\n`;

    case 'horizontal-rule':
      return `<hr noshade size="2" width="90%">\n`;

    case 'marquee':
      return `<marquee><font face="${font}" size="2"><b>${renderInlineHtml(block.text)}</b></font></marquee>\n`;

    case 'quote':
      return `<table width="90%" cellpadding="8" cellspacing="0" border="0"><tr><td bgcolor="${bp.colors?.contentBg || '#f0f0f0'}"><font face="${font}" size="2"><i>"${renderInlineHtml(block.text)}"</i>${block.attribution ? `<br><font size="1">-- ${escapeHtml(block.attribution)}</font>` : ''}</font></td></tr></table><br>\n`;

    case 'list': {
      const tag = block.ordered ? 'ol' : 'ul';
      const items = (block.items || []).map(item =>
        `<li><font face="${font}" size="2">${renderInlineHtml(item)}</font></li>`
      ).join('\n');
      return `<${tag}>\n${items}\n</${tag}><br>\n`;
    }

    case 'link-list': {
      let html = '';
      if (block.title) {
        html += `<font face="${font}" size="3"><b>${escapeHtml(block.title)}</b></font><br>\n`;
      }
      const links = (block.links || []).map(link => {
        let row = `<font face="${font}" size="2">&#9632; <a href="${link.href}">${escapeHtml(link.label)}</a>`;
        if (link.description) row += ` - ${renderInlineHtml(link.description)}`;
        row += `</font><br>`;
        return row;
      }).join('\n');
      html += links + '<br>\n';
      return html;
    }

    case 'table': {
      const headers = (block.headers || []).map(h =>
        `<td bgcolor="${accent}"><font face="${font}" size="2" color="${accentText}"><b>${escapeHtml(h)}</b></font></td>`
      ).join('');
      const rows = (block.rows || []).map(row =>
        '<tr>' + row.map(cell =>
          `<td><font face="${font}" size="2">${renderInlineHtml(cell)}</font></td>`
        ).join('') + '</tr>'
      ).join('\n');
      return `<table border="1" cellpadding="4" cellspacing="0" width="100%">\n<tr>${headers}</tr>\n${rows}\n</table><br>\n`;
    }

    default:
      // Unknown block type — render as paragraph
      if (block.text) {
        return `<font face="${font}" size="2">${renderInlineHtml(block.text)}</font><p>\n`;
      }
      return '';
  }
}

function renderBlocks(blocks, blueprint) {
  if (!blocks || !Array.isArray(blocks)) return '';
  return blocks.map(block => renderBlock(block, blueprint)).join('');
}

module.exports = { renderBlock, renderBlocks, escapeHtml, renderInlineHtml };
