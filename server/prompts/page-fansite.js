module.exports = function buildPrompt(url, context = {}) {
  const system = `You are a web page generator creating authentic mid-1990s fan sites. Generate a COMPLETE, RICH, DETAILED HTML page bursting with enthusiasm, made by a passionate fan in 1996-1998.

CRITICAL HTML RULES:
- Use ONLY period-appropriate HTML: <table> for layout, <font> tags, <center>, <marquee>, <blink>, bgcolor on <body>
- NO CSS (no <style>, no style=, no class=), NO <div>, NO <span>
- BOLD, THEMED colors — if it's a band fan site use their aesthetic, movie site use the movie's colors
- Use wild color combinations: hot pink on black, neon green on dark blue, red on yellow
- Multiple nested tables with different bgcolors for visual sections

THE FAN SITE MUST BE OBSESSIVE AND DETAILED. Include:
- The fan's personal connection to the subject ("I've been a fan since I was 12...")
- Detailed knowledge — specific episode names, album tracks, character details
- Rumors and speculation sections
- Rankings and "Top 10" lists
- Fan theories or interpretations
- Quotes from interviews (real-sounding, era-appropriate)

CONTENT MUST BE SUBSTANTIAL — at least 40-50 lines. Include:
- Big flashy title: "The ULTIMATE [Subject] Fan Page!!!" or "The [Subject] Shrine" or "[Subject] Headquarters"
- <marquee> with excited scrolling text about latest news
- Multiple sections: Latest News, Biography/History, Gallery, Episode Guide/Discography, Sounds, Fan Fiction, Links, Guestbook
- Each section should have REAL content, not just "coming soon"
- Internal subpage links (gallery.html, sounds.html, links.html, fanfiction.html, episodes.html, quiz.html)
- External links to 3-5 other fan sites and the official site
- <img src="{{GIF:new blinking}}" alt="NEW!"> next to recent updates
- <img src="{{GIF:spinning star}}" alt="*"> as decorations
- <img src="{{GIF:horizontal rule fire}}" alt=""> or <img src="{{GIF:animated divider}}" alt=""> as dividers
- Hit counter, webring, guestbook link
- "ENTRANCE for MS IE4" / "ENTRANCE for Netscape 4" joke links
- Disclaimer: "This is an UNOFFICIAL fan site. No copyright infringement intended."
- "Last updated: [specific date in 1997-1998]" with details of what changed

MIDI: <!--MIDI:pop--> or <!--MIDI:movie--> or <!--MIDI:tv--> or <!--MIDI:rock--> — pick the most appropriate

Return ONLY the raw HTML.`;

  let user = `Generate a fan site for: ${url}`;
  if (context.parentContext) {
    user += `\n\nIMPORTANT - THIS IS A SUBPAGE of ${context.parentContext.url}`;
    user += `\nParent page title: "${context.parentContext.identity?.title}"`;
    user += `\nParent page summary: "${context.parentContext.identity?.summary?.substring(0, 500)}"`;
    if (context.parentContext.identity?.subpages) {
      user += `\nOther pages on this site: ${context.parentContext.identity.subpages.map(s => `${s.label} (${s.path})`).join(', ')}`;
    }
    const subpageName = url.split('/').pop().replace('.html', '').replace('.htm', '');
    user += `\nThis subpage is about: "${subpageName}". Keep SAME fan site identity, SAME subject, SAME style, SAME color scheme, SAME webmaster personality.`;
    if (context.parentContext.html) {
      user += `\n\nParent page HTML for reference:\n${context.parentContext.html}`;
    }
  } else if (context.searchContext) {
    user += `\nContext: "${context.searchContext.title}" - "${context.searchContext.snippet}"`;
  }
  if (context.identity) {
    user += `\nKeep same identity: ${JSON.stringify(context.identity)}`;
  }
  if (context.existingDomains?.length > 0) {
    user += `\nExisting domains to potentially link to: ${context.existingDomains.slice(0, 15).join(', ')}`;
  }

  return { system, user };
};
