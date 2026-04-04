const ai = require('../ai');
const { pageOps } = require('../db');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

const PAGES_DIR = path.join(__dirname, '..', '..', 'data', 'pages');
const HOMEPAGE_URL = 'http://www.wwwhippet.com/';
const HOMEPAGE_TTL = 3600; // 1 hour

const SYSTEM_PROMPT = `You are generating the homepage for WWWhippet!, a 1996-era search engine similar to AltaVista. Generate ONLY the dynamic content sections as a JSON object. Do NOT generate the full HTML page — just the content blocks.

Return ONLY valid JSON, no markdown, no code fences:

{
  "headline": "A short topical tagline for the day (like 'Spring into the Web!' or 'Explore the Information Superhighway!')",
  "directory": [
    { "category": "Category Name", "query": "search query for this category", "subtopics": "Topic1, Topic2, Topic3..." }
  ],
  "featured": [
    { "label": "Link Label", "query": "search query" }
  ],
  "babelfish_tip": "A fun translation tip or language fact",
  "ad_text": "A period-appropriate banner ad text (like 'Click here for FREE AOL trial!' or 'Build your own homepage - FREE at GeoCities!')"
}

Rules:
- Generate exactly 12 directory categories (mix of evergreen and timely/seasonal)
- Generate exactly 6 featured site links
- Everything should feel authentic to 1996-1997
- Mix in timely references: current movies, tech launches, cultural events of the era
- Vary the categories each time — don't always use the same ones
- Some categories should be fun/quirky: "UFO Sightings", "Tamagotchi Care Guides", "Y2K Preparation"
- Featured links should be specific and interesting, not generic
- The headline should feel fresh and topical to the era
- IMPORTANT: "WWWhippet!" is just the name of the search engine. Do NOT make categories about whippets, dogs, or pets unless it naturally fits. The categories should cover the full breadth of the 1990s internet — technology, entertainment, hobbies, science, culture, etc.`;

async function generateHomepage(provider) {
  // Check cache
  const cached = pageOps.get(provider, HOMEPAGE_URL);
  if (cached && !cached.expired) {
    const filePath = path.join(PAGES_DIR, cached.file_path);
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf-8');
    }
  }

  // Generate fresh content
  let content;
  try {
    const raw = await ai.generateFast(SYSTEM_PROMPT, 'Generate fresh homepage content for today.');
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    content = JSON.parse(jsonMatch[0]);
  } catch (err) {
    console.error('Homepage generation failed, using defaults:', err.message);
    content = getDefaultContent();
  }

  const html = renderHomepage(content);

  // Cache it
  const hash = crypto.createHash('md5').update(HOMEPAGE_URL + Date.now()).digest('hex');
  const relPath = `${provider}/${hash}.html`;
  const absPath = path.join(PAGES_DIR, relPath);
  fs.mkdirSync(path.dirname(absPath), { recursive: true });
  fs.writeFileSync(absPath, html);
  pageOps.set(provider, HOMEPAGE_URL, 'homepage', relPath, null, null, HOMEPAGE_TTL);

  return html;
}

function renderHomepage(content) {
  // Build directory columns (4 per column, 3 columns)
  const dirs = content.directory || [];
  const col1 = dirs.slice(0, 4);
  const col2 = dirs.slice(4, 8);
  const col3 = dirs.slice(8, 12);

  function renderDirColumn(items) {
    return items.map(d =>
      `<b><font color="#cc0000">&#9632;</font> <a href="/www/www.wwwhippet.com/cgi-bin/query?q=${encodeURIComponent(d.query)}">${escapeHtml(d.category)}</a></b><br>
<font size="1">${escapeHtml(d.subtopics)}</font><br><br>`
    ).join('\n');
  }

  // Build featured links
  const featured = (content.featured || []).map(f =>
    `<a href="/www/www.wwwhippet.com/cgi-bin/query?q=${encodeURIComponent(f.query)}">${escapeHtml(f.label)}</a>`
  ).join(' |\n');

  return `<html>
<head>
<title>WWWhippet! - The Most Powerful and Useful Guide to the Net</title>
</head>
<body bgcolor="#ffffff" text="#000000" link="#0033cc" vlink="#551a8b" alink="#cc0000" topmargin="0" leftmargin="0">

<table width="100%" border="0" cellpadding="0" cellspacing="0" bgcolor="#ffffff">
<tr>
<td align="right" valign="top">
<font face="Arial" size="1" color="#0033cc"><a href="/www/www.wwwhippet.com/">WWWhippet! Worldwide</a></font>&nbsp;&nbsp;
</td>
</tr>
</table>

<center>
<br>
<table border="0" cellpadding="0" cellspacing="0">
<tr>
<td align="center">
<font face="Arial, Helvetica" size="+2" color="#cc6600"><b>WWW</b></font><font face="Arial, Helvetica" size="+2" color="#333333"><b>hippet</b></font><font face="Arial, Helvetica" size="+2" color="#cc6600"><b>!</b></font>
<br><font face="Arial" size="2">&#128054; <i>Fetching the web for you!</i> &#128054;</font>
<br>
<font face="Arial" size="1" color="#666666"><i>${escapeHtml(content.headline || 'The AI-Powered Search Engine')}</i></font>
</td>
</tr>
</table>
<br>

<table border="0" cellpadding="0" cellspacing="0">
<tr>
<td bgcolor="#ffffff">
<table border="0" cellpadding="4" cellspacing="1">
<tr>
<td bgcolor="#cc0000"><font face="Arial" size="2" color="#ffffff"><b>&nbsp;Web&nbsp;</b></font></td>
<td bgcolor="#dcdcdc"><font face="Arial" size="2">&nbsp;<a href="/www/www.wwwhippet.com/cgi-bin/query?q=news+headlines+1997">News</a>&nbsp;</font></td>
<td bgcolor="#dcdcdc"><font face="Arial" size="2">&nbsp;<a href="/www/www.gifvault.com/">GIF Vault</a>&nbsp;</font></td>
</tr>
</table>
</td>
</tr>
</table>
<br>

<table border="0" cellpadding="8" cellspacing="0" bgcolor="#dcdcdc" width="80%">
<tr>
<td align="center">
<form action="/www/www.wwwhippet.com/cgi-bin/query" method="GET">
<table border="0" cellpadding="2" cellspacing="0">
<tr>
<td>
<input type="text" name="q" size="55" maxlength="200">
</td>
<td>
&nbsp;<input type="submit" value="   FIND   ">
</td>
<td>
&nbsp;&nbsp;<font face="Arial" size="1"><a href="/www/www.wwwhippet.com/settings">Settings</a></font>
</td>
</tr>
</table>
<table border="0" cellpadding="2" cellspacing="0">
<tr>
<td>
<font face="Arial" size="1">
<b>SEARCH:</b> <input type="radio" name="where" value="worldwide" checked> Worldwide or <a href="#">Select a country</a>
&nbsp;&nbsp;&nbsp;
<b>RESULTS IN:</b> <input type="radio" name="lang" value="all" checked> All languages <input type="radio" name="lang" value="en"> English
</font>
</td>
</tr>
</table>
</form>
</td>
</tr>
</table>

<br>

<table border="0" cellpadding="3" cellspacing="0">
<tr>
<td align="center">
<font face="Arial" size="2">
<b><a href="/www/www.gifvault.com/">GIF Vault</a></b>
&nbsp;&nbsp;|&nbsp;&nbsp;
<b><a href="/www/www.wwwhippet.com/settings">Settings</a></b>
</font>
</td>
</tr>
</table>

<br>

${content.ad_text ? `<table border="1" cellpadding="6" cellspacing="0" bgcolor="#ffffcc" width="70%"><tr><td align="center"><font face="Arial" size="2"><b>${escapeHtml(content.ad_text)}</b></font></td></tr></table><br>` : ''}

<hr noshade width="90%" size="1">
<br>

<table width="85%" border="0" cellpadding="5" cellspacing="0">
<tr>
<td valign="top" width="33%">
<font face="Arial" size="2">
${renderDirColumn(col1)}
</font>
</td>
<td valign="top" width="33%">
<font face="Arial" size="2">
${renderDirColumn(col2)}
</font>
</td>
<td valign="top" width="33%">
<font face="Arial" size="2">
${renderDirColumn(col3)}
</font>
</td>
</tr>
</table>

<br>
<hr noshade width="90%" size="1">
<br>

<table width="85%" border="0" cellpadding="5" cellspacing="0">
<tr>
<td align="center">
<font face="Arial" size="2" color="#666666">
<b>Featured Sites:</b>
${featured}
</font>
</td>
</tr>
</table>

<br>

<table width="100%" border="0" cellpadding="5" cellspacing="0">
<tr>
<td align="center">
<font face="Arial" size="1" color="#666666">
&copy; 1997 WWWhippet! Technology, Inc.
<br>
<i>The AI-Powered Search Engine</i>
</font>
</td>
</tr>
</table>

<br>
</center>

</body>
</html>`;
}

function getDefaultContent() {
  return {
    headline: 'The AI-Powered Search Engine',
    directory: [
      { category: 'Arts & Humanities', query: 'arts humanities literature', subtopics: 'Literature, Photography, Music...' },
      { category: 'Business & Finance', query: 'business finance companies', subtopics: 'Companies, Investing, Jobs...' },
      { category: 'Computers & Internet', query: 'computers internet web design', subtopics: 'Hardware, Software, Web Design...' },
      { category: 'Health & Fitness', query: 'health fitness medicine', subtopics: 'Medicine, Nutrition, Diseases...' },
      { category: 'Entertainment', query: 'entertainment movies music', subtopics: 'Movies, TV, Music, Humor...' },
      { category: 'Games', query: 'games video games rpg', subtopics: 'Video Games, Board Games, RPGs...' },
      { category: 'News & Media', query: 'news media newspapers', subtopics: 'Newspapers, Magazines, TV News...' },
      { category: 'Recreation & Hobbies', query: 'recreation hobbies outdoors', subtopics: 'Outdoors, Travel, Automobiles...' },
      { category: 'Science & Technology', query: 'science technology engineering', subtopics: 'Biology, Physics, Engineering...' },
      { category: 'Shopping', query: 'shopping online stores', subtopics: 'Auctions, Classifieds, Clothing...' },
      { category: 'Sports', query: 'sports scores teams', subtopics: 'Basketball, Football, Soccer...' },
      { category: 'MIDI Collection', query: 'cool MIDI files music download', subtopics: 'MIDI Files, Music, Downloads...' },
    ],
    featured: [
      { label: 'Cool Homepages', query: 'cool homepages personal websites' },
      { label: 'Free Email', query: 'free email hotmail webmail' },
      { label: 'Free Web Hosting', query: 'free web hosting geocities' },
      { label: 'Chat Rooms', query: 'chat rooms irc' },
      { label: 'Download Browsers', query: 'web browser download netscape' },
      { label: 'Web Rings', query: 'webrings cool links directory' },
    ],
    babelfish_tip: 'Translate web pages instantly!',
    ad_text: null,
  };
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

module.exports = { generateHomepage };
