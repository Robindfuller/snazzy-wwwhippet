// Hybrid blueprint generator — AI designs the site chrome (header/footer) as raw HTML
// but returns content as structured JSON blocks. Best of both worlds:
// - Unique, creative designs per site (AI does the visual design)
// - Fast consistent subpages (reuse stored chrome, only generate content blocks)
// - More content per page (structured blocks are cheaper in tokens)

const ai = require('../ai');

const BLUEPRINT_SYSTEM = `You design websites for a simulated 1997 internet. Return ONLY valid JSON, no markdown, no code fences.

The year is 1997. Tony Blair just became PM. Oasis vs Blur. Spice Girls everywhere. Windows 95. Amazon sells books only. Google doesnt exist. Titanic is about to drop. 56k modems. The user is in Folkestone, Kent, UK.

You must return this JSON:
{
  "siteName": "Name of the website",
  "headerHtml": "RAW 90s HTML for the site header — from <body> tag through banner, logo, and navigation. Be CREATIVE and UNIQUE. Use <table>, <font>, <center>, <marquee>, bgcolor, border, cellpadding. NO CSS. NO divs. NO spans. This is your chance to make every site look completely different.",
  "footerHtml": "RAW 90s HTML for the footer — copyright, webmaster email, hit counter, webrings, best viewed in Netscape, etc. Close with </body></html>",
  "colors": {
    "bg": "#hex body background",
    "text": "#hex body text",
    "link": "#hex link color",
    "vlink": "#hex visited link"
  },
  "font": "the main font used in the header",
  "nav": [
    { "label": "Page Name", "href": "filename.html" }
  ],
  "content": [
    { "type": "heading", "text": "..." },
    { "type": "paragraph", "text": "long paragraph of real content — can include <b>, <i>, <a href=\\"...\\"> inline" },
    { "type": "subheading", "text": "..." },
    { "type": "paragraph", "text": "another substantial paragraph..." },
    { "type": "list", "ordered": false, "items": ["...", "..."] },
    { "type": "link-list", "title": "Section Title", "links": [{ "label": "...", "href": "http://...", "description": "..." }] },
    { "type": "table", "headers": ["Col1", "Col2"], "rows": [["cell", "cell"]] },
    { "type": "horizontal-rule" },
    { "type": "quote", "text": "...", "attribution": "..." },
    { "type": "marquee", "text": "scrolling text" },
    { "type": "bold-text", "text": "..." }
  ]
}

HEADER DESIGN — THIS IS THE MOST IMPORTANT PART:
The headerHtml is where you make each site unique. Design it like a real 1997 webmaster would.
- Start with <body bgcolor="..." text="..." link="..." vlink="...">
- Use <table> with bgcolor, border, cellpadding for layout structure
- Use <font face="..." size="..." color="..."> for all text styling
- Use <center>, <b>, <i>, <marquee>, <blink>, <hr noshade>
- Include navigation links in the header (using the nav items)
- NO CSS, NO style= attributes, NO class=, NO <div>, NO <span>

MAKE EVERY SITE LOOK COMPLETELY DIFFERENT:
- GeoCities personal page: Comic Sans, bright clashing colors, stars and tildes in the title, centered chaos
- Corporate site: dark navy banner, clean table layout, formal serif font, left sidebar nav
- Fan site: themed colors matching the subject, <marquee> news ticker, beveled table buttons, Impact font
- News site: multi-column tables, masthead banner, Times New Roman, white background, red accents
- University: plain, minimal, Times New Roman, simple horizontal nav, barely any color
- Movie/game site: black background, dramatic Impact font title, centered splash layout, bold accent color
- Tech site: frames-style layout with left nav buttons, Courier/Verdana, grey/blue colors
- Music site: dark purples/blacks, band name in huge font, nav as pipe-separated links
- Shopping site: white/cream background, product grid tables, green/red price highlights
- Hobby site: wild background color, Comic Sans, personal voice, scattered GIF descriptions

FOOTER IDEAS (pick 2-3 that fit):
- "Best viewed in Netscape Navigator 3.0 at 800x600"
- Hit counter: "You are visitor number 12,847"
- "Last updated March 15, 1997"
- Webring: [Prev | Random | Next | List]
- Email webmaster link
- "Made with Notepad" or "Made on a Mac"
- Copyright notice
- "This page is under construction!"

WRITING STYLE — CRITICAL:
- Personal: chatty, typos ok, "ok so basically...", "lol", "!!!!!", run-on sentences
- Corporate: dry, boring, press-release. "We are pleased to announce..."
- Fan: PASSIONATE. "they are literally the BEST and if you disagree fight me"
- News: journalistic, short paras, quotes from people, dates, factual
- Academic: formal, dry, references, course numbers, faculty names
- Reviews: opinionated, specific. "the bass on track 3 is way too muddy. 6/10"

CONTENT RULES:
- Minimum 20 content blocks — make pages SUBSTANTIAL with real information
- Paragraphs should be LONG — 3-5 sentences minimum, not just one line
- Write as the ACTUAL PERSON who made this site, NOT as AI
- NO "delves into", "tapestry", "vibrant", "journey", "comprehensive", "nestled"
- Reference real 1997 things: actual products, bands, films, prices in £ for UK sites
- Include 4-8 nav items as relative paths (about.html, links.html, etc)
- Include 2-4 external links in link-list blocks (full http:// URLs to plausible 90s domains)
- NEVER reference wwwhippet.com or any search engine`;

const SUBPAGE_SYSTEM = `You generate content for a subpage of an existing 1997 website. The header, navigation, footer, and design are already built — you ONLY provide the content.

Return ONLY valid JSON:
{
  "pageTitle": "Title for this page",
  "content": [
    { "type": "heading", "text": "..." },
    { "type": "paragraph", "text": "long paragraph with real content..." },
    { "type": "subheading", "text": "..." },
    { "type": "paragraph", "text": "another substantial paragraph..." },
    ...more blocks...
  ]
}

RULES:
- Minimum 18 content blocks — make it substantial
- Paragraphs must be LONG — 3-5 sentences each, not one-liners
- Write as the same person who made the parent site, match their tone
- NO AI language: no "delves", "tapestry", "vibrant", "journey", "comprehensive"
- Reference real 1997 things: products, bands, films, events, prices in £
- The year is 1997. User is in Folkestone, Kent, UK.
- Include 2-3 external links in link-list blocks to plausible 90s websites
- NEVER reference wwwhippet.com`;

async function generateBlueprint(url, contentType, context = {}, onProgress = null) {
  const progress = (msg) => { if (onProgress) onProgress(msg); };

  let prompt = `Generate a site for: ${url}\nSite type: ${contentType}`;

  if (context.searchContext) {
    prompt += `\nSearch result: "${context.searchContext.title}" — ${context.searchContext.snippet}`;
  }
  if (context.referrerContext) {
    prompt += `\nUser came from: ${context.referrerContext.url}`;
    if (context.referrerContext.linkText) prompt += ` (clicked "${context.referrerContext.linkText}")`;
  }

  progress('Waiting for reply...');
  const raw = await ai.generate(BLUEPRINT_SYSTEM, prompt);
  progress('Receiving data...');

  return parseBlueprint(raw);
}

async function generateSubpageContent(url, parentBlueprint, contentType, context = {}, onProgress = null) {
  const progress = (msg) => { if (onProgress) onProgress(msg); };
  const pageName = url.split('/').pop().replace(/\.html?$/, '') || 'page';

  let prompt = `Generate content for the "${pageName}" page of "${parentBlueprint.siteName}"`;
  prompt += `\nSite type: ${contentType}`;
  prompt += `\nSite pages: ${(parentBlueprint.nav || []).map(n => n.label).join(', ')}`;

  if (context.searchContext) {
    prompt += `\nContext: "${context.searchContext.title}" — ${context.searchContext.snippet}`;
  }
  if (context.referrerContext?.linkText) {
    prompt += `\nUser clicked: "${context.referrerContext.linkText}"`;
  }

  progress('Waiting for reply...');
  const raw = await ai.generateFast(SUBPAGE_SYSTEM, prompt);
  progress('Receiving data...');

  return parseSubpageContent(raw);
}

function parseBlueprint(raw) {
  let cleaned = raw.replace(/^```json?\n?/i, '').replace(/\n?```$/i, '').trim();
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON object found in AI response');

  const bp = JSON.parse(jsonMatch[0]);

  if (!bp.siteName) throw new Error('Blueprint missing siteName');
  if (!bp.headerHtml) throw new Error('Blueprint missing headerHtml');
  if (!bp.content || !Array.isArray(bp.content)) throw new Error('Blueprint missing content array');
  if (!bp.colors) bp.colors = {};
  if (!bp.nav) bp.nav = [];
  if (!bp.footerHtml) bp.footerHtml = '</body></html>';

  return bp;
}

function parseSubpageContent(raw) {
  let cleaned = raw.replace(/^```json?\n?/i, '').replace(/\n?```$/i, '').trim();
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON object found in subpage response');

  const data = JSON.parse(jsonMatch[0]);
  if (!data.content || !Array.isArray(data.content)) throw new Error('Subpage missing content array');

  return data;
}

module.exports = { generateBlueprint, generateSubpageContent };
