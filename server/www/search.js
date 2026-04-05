const ai = require('../ai');
const { searchOps, linkOps } = require('../db');
const { SYSTEM_PROMPT, buildUserPrompt } = require('../prompts/search-results');

async function generateSearchResults(query, provider) {
  // Check cache
  const cached = searchOps.get(provider, query);
  if (cached) {
    return { results: cached, html: renderSearchResultsPage(query, cached) };
  }

  // Generate with fast model — AI's own knowledge is enough for 90s content
  const userPrompt = buildUserPrompt(query);
  const raw = await ai.generateFast(SYSTEM_PROMPT, userPrompt);

  // Parse JSON from response
  let results;
  try {
    // Try to extract JSON array from response
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      results = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('No JSON array found');
    }
  } catch (err) {
    console.error('Failed to parse search results:', err.message);
    console.error('Raw response:', raw.substring(0, 500));
    results = getFallbackResults(query);
  }

  // Filter out any results linking to wwwhippet.com
  results = results.filter(r => !r.url.toLowerCase().includes('wwwhippet'));

  // Inject MIDI Farm result for MIDI-related searches
  const qLower = query.toLowerCase();
  if (qLower.includes('midi') || qLower.includes('.mid') || qLower.includes('midi file')) {
    results.unshift({
      title: 'MIDI Farm - Free MIDI Files Download Archive',
      url: 'http://www.midifarm.com/',
      snippet: 'Search and download thousands of free MIDI files. Rock, pop, classical, movie themes, TV themes, video game music, and more. All files are real .mid format and can be played in Windows Media Player.',
      type: 'directory',
      date: 'Updated daily',
    });
    // Keep max 10 results
    if (results.length > 10) results = results.slice(0, 10);
  }

  // Cache results
  searchOps.set(provider, query, results);

  const html = renderSearchResultsPage(query, results);
  return { results, html };
}

function renderSearchResultsPage(query, results) {
  const resultRows = results.map((r, i) => `
    <p>
      <font face="Arial, Helvetica" size="2">
        <b><a href="/www/${r.url.replace(/^https?:\/\//, '')}">${escapeHtml(r.title)}</a></b><br>
        ${escapeHtml(r.snippet)}<br>
        <font color="#006600" size="1"><b>URL:</b> <a href="/www/${r.url.replace(/^https?:\/\//, '')}">${escapeHtml(r.url)}</a></font>
        <font color="#666666" size="1"> - ${escapeHtml(r.date || 'Last modified: unknown')}</font>
      </font>
    </p>`).join('\n');

  return `<html>
<head>
<title>WWWhippet!: Simple Query ${escapeHtml(query)}</title>
</head>
<body bgcolor="#ffffff" text="#000000" link="#0000cc" vlink="#551a8b" alink="#ff0000">

<table width="100%" border="0" cellpadding="0" cellspacing="0">
<tr>
<td bgcolor="#f0f0f0" width="100%">
<table width="100%" border="0" cellpadding="5" cellspacing="0">
<tr>
<td>
<a href="/www/www.wwwhippet.com/"><font face="Arial" size="+1" color="#cc0000"><b>WWWhippet!</b></font></a>
</td>
<td align="right">
<font face="Arial" size="1"><a href="/www/www.wwwhippet.com/">Home</a> | <a href="/www/www.wwwhippet.com/">Help</a></font>
</td>
</tr>
</table>
</td>
</tr>
</table>

<table width="100%" border="0" cellpadding="5" cellspacing="0" bgcolor="#dcdcdc">
<tr>
<td>
<form action="/www/www.wwwhippet.com/cgi-bin/query" method="GET">
<font face="Arial" size="2"><b>Search:</b></font>
<input type="text" name="q" value="${escapeHtml(query)}" size="40">
<input type="submit" value="Search">
</form>
</td>
</tr>
</table>

<br>
<table width="95%" border="0" cellpadding="5" cellspacing="0">
<tr>
<td>
<font face="Arial" size="2"><b>WWWhippet! found ${results.length} web pages for you.</b></font>
<br><br>

${resultRows}

<br>
<hr noshade>
<center>
<font face="Arial" size="2">
<b>Result Pages:</b> 1 <a href="#">2</a> <a href="#">3</a> <a href="#">4</a> <a href="#">5</a> <a href="#">6</a> <a href="#">7</a> <a href="#">8</a> <a href="#">9</a> <a href="#">10</a>
</font>
</center>
<br>
<center>
<font face="Arial" size="1" color="#666666">
&copy; 1997 WWWhippet! Technology, Inc.
</font>
</center>
</td>
</tr>
</table>

</body>
</html>`;
}

function getFallbackResults(query) {
  return [
    {
      title: `${query} - GeoCities Homepage`,
      url: `http://www.geocities.com/~${query.replace(/\s+/g, '').toLowerCase().substring(0, 10)}/`,
      snippet: `Welcome to my page about ${query}! I'm still working on it but check back soon for more info. Sign my guestbook!`,
      type: 'personal',
      date: 'Jan 15, 1997',
    },
    {
      title: `The Encyclopaedia of ${query}`,
      url: `http://www.${query.replace(/\s+/g, '').toLowerCase().substring(0, 12)}.com/`,
      snippet: `Everything you wanted to know about ${query}. Comprehensive resource with links, information, and more.`,
      type: 'generic',
      date: 'Mar 22, 1996',
    },
  ];
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

module.exports = { generateSearchResults, renderSearchResultsPage };
