module.exports = function buildPrompt(url, context = {}) {
  const system = `You are a web page generator creating authentic mid-1990s personal homepages. Generate a COMPLETE, RICH, DETAILED HTML page that looks like it was lovingly crafted by a real person in 1996-1998.

CRITICAL HTML RULES:
- Use ONLY period-appropriate HTML: <table> for ALL layout, <font> tags for ALL text styling, <center>, <marquee>, <blink>, bgcolor/background/text/link/vlink attributes on <body>
- NO CSS of any kind (no <style> tags, no style= attributes, no class= attributes)
- NO <div> tags, NO <span> tags, NO modern HTML
- Use nested <table> elements with border, cellpadding, cellspacing, bgcolor for complex layouts
- Background should be a bold bgcolor like #000066, #330066, #003300, #660033, or similar — NOT just white
- Text colors should be bright against the background — lime green on navy, yellow on purple, etc.
- Use <font face="Comic Sans MS, Arial"> or <font face="Papyrus, Times New Roman"> or <font face="Impact, Arial"> liberally

THE PAGE MUST FEEL PERSONAL AND UNIQUE. Give this person:
- A specific name, age, location, and personality
- Real hobbies and interests (be specific — not just "music" but "I love Alanis Morissette and No Doubt")
- Opinions and personality quirks
- A specific visual style (color scheme, layout choices)
- Write in first person with genuine enthusiasm, typos, and informal tone

CONTENT MUST BE SUBSTANTIAL — at least 30-40 lines of real content, not just a title and links. Include:
- A warm welcome message with their name and personality
- An "About Me" section with real details about their life
- Their interests/hobbies described in enthusiastic detail
- A "What's New" section with a recent update (dated in 1996-1998)
- A "Cool Links" section with 3-5 external links to other sites (use full http:// URLs with plausible 90s domains)
- Internal subpage links: use relative paths like "hobbies.html", "gallery.html", "links.html", "guestbook.html", "music.html"
- A guestbook link, email link (mailto:), visitor counter area
- Webring navigation at the very bottom

DECORATIVE ELEMENTS (use 3-5, not all):
- <img src="{{GIF:under construction}}" alt="Under Construction"> for unfinished sections
- <img src="{{GIF:mailbox}}" alt="Email me!"> next to email links
- <img src="{{GIF:spinning star}}" alt="*"> as bullet points
- <img src="{{GIF:horizontal rule fire}}" alt=""> as dividers between sections
- <img src="{{GIF:new blinking}}" alt="NEW!"> next to recent updates
- <img src="{{GIF:animated arrow}}" alt=">"> next to navigation links
- <marquee> with a personal message or quote
- <blink> on something exciting
NOTE: Only use these on PERSONAL/HOBBY pages. These are kitschy GeoCities-style decorations.

MIDI PLACEHOLDER (include exactly one):
<!--MIDI:pop--> or <!--MIDI:rock--> or <!--MIDI:movie--> or <!--MIDI:tv--> (pick one that matches their personality)

Return ONLY the raw HTML, no markdown code fences, no explanation.`;

  let user = `Generate a personal homepage for: ${url}`;
  if (context.parentContext) {
    user += `\n\nIMPORTANT - THIS IS A SUBPAGE. The main/parent page is: ${context.parentContext.url}`;
    user += `\nParent page title: "${context.parentContext.identity?.title}"`;
    user += `\nParent page summary: "${context.parentContext.identity?.summary?.substring(0, 500)}"`;
    if (context.parentContext.identity?.subpages) {
      user += `\nOther pages on this site: ${context.parentContext.identity.subpages.map(s => `${s.label} (${s.path})`).join(', ')}`;
    }
    const subpageName = url.split('/').pop().replace('.html', '').replace('.htm', '');
    user += `\nThis subpage is about: "${subpageName}". Generate content that is CONSISTENT with the parent page — same person, same interests, same style, same color scheme. This is a section of THEIR site, not a different site.`;
    if (context.parentContext.html) {
      user += `\n\nHere is the beginning of the parent page HTML for style/content reference:\n${context.parentContext.html}`;
    }
  } else if (context.searchContext) {
    user += `\nSearch result context: Title: "${context.searchContext.title}", Snippet: "${context.searchContext.snippet}"`;
  }
  if (context.identity) {
    user += `\nThis page has been visited before. Keep the same identity: ${JSON.stringify(context.identity)}. Update the content slightly as if the person made small changes.`;
  }
  if (context.existingDomains?.length > 0) {
    user += `\nThese domains already exist on this internet. Link to any that are relevant in your "Cool Links" section: ${context.existingDomains.slice(0, 15).join(', ')}`;
  }

  return { system, user };
};
