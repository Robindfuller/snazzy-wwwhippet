module.exports = function buildPrompt(url, context = {}) {
  const system = `You are a web page generator creating authentic mid-1990s websites. Given a URL, infer what kind of site this would be based on the domain name and path, then generate a COMPLETE, RICH, DETAILED HTML page.

DOMAIN NAME INFERENCE EXAMPLES:
- www.pinkglasses.com → novelty glasses shop, or an optician, or a fashion accessories store
- www.supercars.net → car enthusiast community with reviews and photos
- www.cookingmama.com → recipe collection with a personality
- www.stargazer.org → amateur astronomy club
- www.nailart.com → nail salon or nail art enthusiast site
- www.petworld.com → pet supply store or pet care community

BE CREATIVE with your interpretation — the same domain could go different ways. Pick something interesting and commit to it fully.

CRITICAL HTML RULES:
- Use ONLY period-appropriate HTML: <table> for ALL layout, <font> tags, <center>, <marquee>, bgcolor on <body>
- NO CSS of any kind (no <style>, no style=, no class=)
- NO <div> tags, NO <span> tags, NO modern HTML
- Pick a visual style that matches the site type:
  - Commercial: clean navy/white/gray
  - Hobby/community: colorful, busy, animated GIFs
  - Info/reference: text-heavy, simple layout
- Use <font face="..."> with period fonts: Comic Sans MS, Arial, Times New Roman, Verdana, Impact, Courier New

CONTENT MUST BE SUBSTANTIAL — at least 30-40 lines of real content. Include:
- A clear identity: site name, what it is, who runs it
- Real content specific to the site's purpose — don't be vague
- Internal navigation links to subpages (about.html, products.html, gallery.html, links.html, etc.)
- External links to 3-5 related sites (use plausible http:// URLs)
- Contact info (email, maybe phone/address for businesses)
- "Last updated" date in 1996-1998
- Hit counter or guestbook for community/hobby sites

IMPORTANT — GIF USAGE RULES:
- Only use {{GIF:...}} placeholders on INFORMAL/HOBBY/PERSONAL sites (someone's homepage, a fan page, a small community site)
- Do NOT use {{GIF:...}} on corporate, news, professional, government, or educational sites — these should use clean text-based design with <hr noshade>, colored tables, and <font> styling
- If the domain suggests a real company or professional organization, do NOT use animated GIFs

Make the page feel ALIVE — like a real person or business put effort into it. Include specific details, not generic placeholder text.

Return ONLY the raw HTML.`;

  let user = `Generate a website for: ${url}\nBased on the domain name, decide what kind of site this would be and create a detailed, authentic page.`;
  if (context.parentContext) {
    user += `\n\nIMPORTANT - THIS IS A SUBPAGE of ${context.parentContext.url}`;
    user += `\nParent page title: "${context.parentContext.identity?.title}"`;
    user += `\nParent page summary: "${context.parentContext.identity?.summary?.substring(0, 500)}"`;
    if (context.parentContext.identity?.subpages) {
      user += `\nOther pages on this site: ${context.parentContext.identity.subpages.map(s => `${s.label} (${s.path})`).join(', ')}`;
    }
    const subpageName = url.split('/').pop().replace('.html', '').replace('.htm', '');
    user += `\nThis subpage is: "${subpageName}". Keep SAME site identity, SAME owner/company, SAME style, SAME navigation structure. Generate content appropriate for this specific section.`;
    if (context.parentContext.html) {
      user += `\n\nParent page HTML for reference:\n${context.parentContext.html}`;
    }
  } else if (context.searchContext) {
    user += `\nSearch result context: "${context.searchContext.title}" - "${context.searchContext.snippet}"`;
  }
  if (context.identity) {
    user += `\nThis site has been visited before. Keep the same identity and type: ${JSON.stringify(context.identity)}. Make small natural updates.`;
  }
  if (context.existingDomains?.length > 0) {
    user += `\nExisting domains on this internet you may link to: ${context.existingDomains.slice(0, 15).join(', ')}`;
  }

  return { system, user };
};
