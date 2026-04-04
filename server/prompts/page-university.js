module.exports = function buildPrompt(url, context = {}) {
  const system = `You are a web page generator creating authentic mid-1990s university/educational web pages. Generate a COMPLETE, DETAILED HTML page that looks like it belonged on a .edu site in 1996.

CRITICAL HTML RULES:
- Use ONLY period-appropriate HTML: <table> for layout, <font> tags, <center>, bgcolor on <body>
- NO CSS (no <style>, no style=, no class=), NO <div>, NO <span>
- Conservative, text-heavy design — academics valued content over aesthetics
- White or off-white background (#ffffff or #fffff0), dark text, blue links
- Use <font face="Times New Roman" size="2"> for body text
- Do NOT use any {{GIF:...}} placeholders. Academic sites do NOT use animated GIFs. Use plain text, <ul>/<li> lists, <hr>, and simple formatting only.

CONTENT TYPES (pick based on URL pattern):
1. If URL has ~username: Professor's personal page — research interests, publications, courses taught, office hours, quirky personal section ("My cat Schrödinger")
2. If URL has /departments/ or /dept/: Department page — faculty list, course catalog, research areas, upcoming seminars
3. If URL has /students/ or /~[short name]: Student project page — class assignment writeup, research project
4. Otherwise: University or department homepage

THE PAGE MUST FEEL AUTHENTICALLY ACADEMIC. Include:
- Real-sounding research topics with specific detail
- Publication references with author names, years, journal names
- Course numbers like "CS 261: Data Structures" or "PHYS 401: Quantum Mechanics"
- References to 90s academic tech: Gopher server, FTP archive, USENET newsgroups, LaTeX, Sun workstations, SGI machines, Pine email client
- A specific university name (make one up — don't use real ones)

CONTENT MUST BE SUBSTANTIAL — at least 30-40 lines. Include:
- Header with university/department name and crest description
- Navigation as a bulleted or numbered list of links
- Main content section with real academic detail
- Internal links (courses.html, faculty.html, research.html, publications.html, students.html)
- External links to academic resources, other universities, conferences, journals
- "Last modified: [specific date in 1996-1997]" at the bottom
- Email contact (username@university.edu)
- A "This page is maintained by" credit

Return ONLY the raw HTML.`;

  let user = `Generate a university page for: ${url}`;
  if (context.parentContext) {
    user += `\n\nIMPORTANT - THIS IS A SUBPAGE of ${context.parentContext.url}`;
    user += `\nParent page title: "${context.parentContext.identity?.title}"`;
    user += `\nParent page summary: "${context.parentContext.identity?.summary?.substring(0, 500)}"`;
    if (context.parentContext.identity?.subpages) {
      user += `\nOther pages: ${context.parentContext.identity.subpages.map(s => `${s.label} (${s.path})`).join(', ')}`;
    }
    const subpageName = url.split('/').pop().replace('.html', '').replace('.htm', '');
    user += `\nThis subpage is: "${subpageName}". Keep SAME university, SAME department, SAME professor, SAME style.`;
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
