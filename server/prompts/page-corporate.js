module.exports = function buildPrompt(url, context = {}) {
  const system = `You are a web page generator creating authentic mid-1990s corporate websites. Generate a COMPLETE, DETAILED HTML page that looks like it was made by a company's IT department in 1996-1997.

CRITICAL HTML RULES:
- Use ONLY period-appropriate HTML: <table> for layout, <font> tags, <center>, bgcolor attributes on <body>
- NO CSS (no <style>, no style=, no class=), NO <div>, NO <span>, NO modern HTML
- Professional color scheme: navy blue headers (#000066 or #003366), white or light gray body (#f0f0f0), dark text
- Use <font face="Arial, Helvetica" size="2"> for body text
- Use nested tables for navigation bars with bgcolor cells
- Do NOT use any {{GIF:...}} placeholders. Corporate sites do NOT use animated GIFs from GeoCities. Instead use plain text, <hr noshade>, colored table cells, and <font> tags for visual design. If you need a logo, just use styled text: <font size="+2" color="#000066"><b>Company Name</b></font>

THE COMPANY MUST FEEL REAL. Give it:
- A specific company name, industry, and founding year
- A real address with phone number, fax number, and email
- Specific products or services described in detail
- A company slogan or mission statement
- Employee count or company size hint

CONTENT MUST BE SUBSTANTIAL — at least 30-40 lines. Include:
- Company logo area (use <font size="+3" color="#000066"><b>Company Name</b></font> and a tagline)
- Navigation bar as a <table> row with bgcolor cells: Home | About Us | Products/Services | News | Careers | Contact
- A welcome message from the CEO or "Welcome to [Company] on the World Wide Web!"
- Company description — what they do, who they serve
- Featured product/service section with details
- Recent company news item (dated 1996-1997)
- "Contact Us" section with full address, phone, FAX number, and email
- Footer with copyright, "Best viewed at 800x600" notice, and a hit counter
- Internal subpage links (about.html, products.html, services.html, contact.html, careers.html)
- 2-3 external links to industry partners or associations

The tone should be FORMAL but slightly awkward — companies were still figuring out the web. They might mention their fax number is "the fastest way to reach us" alongside email.

Return ONLY the raw HTML.`;

  let user = `Generate a corporate website for: ${url}`;
  if (context.parentContext) {
    user += `\n\nIMPORTANT - THIS IS A SUBPAGE of ${context.parentContext.url}`;
    user += `\nParent page title: "${context.parentContext.identity?.title}"`;
    user += `\nParent page summary: "${context.parentContext.identity?.summary?.substring(0, 500)}"`;
    if (context.parentContext.identity?.subpages) {
      user += `\nOther pages on this site: ${context.parentContext.identity.subpages.map(s => `${s.label} (${s.path})`).join(', ')}`;
    }
    const subpageName = url.split('/').pop().replace('.html', '').replace('.htm', '');
    user += `\nThis subpage is about: "${subpageName}". Keep SAME company, SAME branding, SAME navigation, SAME style.`;
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
