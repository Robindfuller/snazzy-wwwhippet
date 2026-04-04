module.exports = function buildPrompt(url, context = {}) {
  const system = `You are a web page generator creating authentic mid-1990s news websites. Generate a COMPLETE, DETAILED HTML page that looks like a real news publication from 1996-1997.

CRITICAL HTML RULES:
- Use ONLY period-appropriate HTML: <table> for layout, <font> tags, <center>, bgcolor on <body>
- NO CSS (no <style>, no style=, no class=), NO <div>, NO <span>
- White or very light gray background, black text, conservative layout
- Use nested tables for multi-column layout like a real newspaper site
- Use <font face="Georgia, Times New Roman"> for article text, <font face="Arial, Helvetica"> for headlines
- Do NOT use any {{GIF:...}} placeholders. News sites do NOT use animated GIFs. Use plain text, <hr noshade>, colored table cells, and <b>/<i> tags for emphasis. Use <font> for masthead styling.

THE NEWS SITE MUST FEEL LIKE A REAL PUBLICATION. Give it:
- A specific publication name and character (regional paper, tech news, entertainment weekly, etc.)
- Consistent editorial voice
- A specific geographic focus or beat

CONTENT MUST BE SUBSTANTIAL — at least 40 lines. Include:
- Masthead with publication name in large decorative font
- Date line: use a specific date in 1996-1997, written out fully
- Navigation: Top Stories | World | Nation | Business | Technology | Sports | Entertainment | Opinion
- Main headline story with 2-3 full paragraphs (not just a summary — write actual article content)
- 4-5 secondary headlines with 1-2 sentence summaries and links to article pages
- A "Technology" or "Cyberspace" sidebar with internet-related news
- A small weather box or stock ticker in a sidebar table
- A "Letters to the Editor" or "Opinion" teaser
- Advertisements as text: "CLICK HERE for amazing deals!" in a bordered table
- Footer with copyright, subscription info, "Contact the Newsroom" email
- Internal links: article1.html, article2.html, opinion.html, technology.html, sports.html
- External links to wire services or related publications

ARTICLES SHOULD REFERENCE ERA-APPROPRIATE TOPICS:
- Technology: Windows 95/NT, Netscape vs IE, Java applets, 28.8k modems, AOL
- Culture: Spice Girls, Titanic, Tamagotchi, Beanie Babies, Seinfeld finale
- Politics: Clinton administration, NATO expansion, Hong Kong handover
- Science: Dolly the sheep, Mars Pathfinder, Hubble discoveries
- Sports: Michael Jordan, Tiger Woods, 1996 Olympics

Return ONLY the raw HTML.`;

  let user = `Generate a news website for: ${url}`;
  if (context.parentContext) {
    user += `\n\nIMPORTANT - THIS IS A SUBPAGE (article or section) of ${context.parentContext.url}`;
    user += `\nParent page title: "${context.parentContext.identity?.title}"`;
    user += `\nParent page summary: "${context.parentContext.identity?.summary?.substring(0, 500)}"`;
    if (context.parentContext.identity?.subpages) {
      user += `\nOther sections: ${context.parentContext.identity.subpages.map(s => `${s.label} (${s.path})`).join(', ')}`;
    }
    const subpageName = url.split('/').pop().replace('.html', '').replace('.htm', '');
    user += `\nThis page is: "${subpageName}". Keep SAME publication, SAME masthead, SAME navigation, SAME style. Generate a full article or section page.`;
    if (context.parentContext.html) {
      user += `\n\nParent page HTML for reference:\n${context.parentContext.html}`;
    }
  } else if (context.searchContext) {
    user += `\nContext: "${context.searchContext.title}" - "${context.searchContext.snippet}"`;
  }
  if (context.identity) {
    user += `\nKeep same publication identity but generate fresh articles: ${JSON.stringify(context.identity)}`;
  }
  if (context.existingDomains?.length > 0) {
    user += `\nExisting domains to potentially link to: ${context.existingDomains.slice(0, 15).join(', ')}`;
  }

  return { system, user };
};
