const ai = require('../ai');

// Research a topic using the AI's own knowledge + optional web context
// Returns a concise factual brief that can be injected into generation prompts

const RESEARCH_CACHE = new Map(); // in-memory cache for session
const RESEARCH_TTL = 3600 * 1000; // 1 hour

async function researchTopic(query) {
  // Check cache
  const cached = RESEARCH_CACHE.get(query.toLowerCase().trim());
  if (cached && (Date.now() - cached.time) < RESEARCH_TTL) {
    return cached.data;
  }

  // Try a real web search first for factual grounding
  let webContext = '';
  try {
    webContext = await fetchWebContext(query);
  } catch (err) {
    console.error('Web search failed, using AI knowledge only:', err.message);
  }

  // Ask the AI to produce a factual research brief
  const system = `You are a research assistant. Given a topic (often a domain name or website reference), produce a concise factual brief that would help someone create an authentic 1990s-era website about this topic.

IMPORTANT: If the query looks like a domain name (e.g. "apple.com", "ford.com", "disney.com"), identify the REAL COMPANY or ORGANIZATION that owned that domain in the 1990s. For example:
- apple.com = Apple Computer, Inc. (Macintosh computers, not fruit)
- amazon.com = Amazon.com the online bookstore
- ford.com = Ford Motor Company

Return ONLY a JSON object, no markdown, no code fences:

{
  "topic": "What this is about in one line",
  "category": "cars|music|technology|sports|movies|tv|food|fashion|science|health|business|gaming|travel|education|other",
  "key_facts": ["Fact 1 relevant to the 1990s era", "Fact 2", "Fact 3", "Fact 4", "Fact 5"],
  "era_context": "What was happening with this topic specifically in the mid-1990s (1994-1998)",
  "related_products_or_names": ["Specific product names, model names, people, brands relevant in the 90s"],
  "typical_90s_website_style": "What kind of website would cover this in the 90s — e.g. 'car magazine review site', 'enthusiast forum', 'dealer page', 'manufacturer corporate site'"
}

Be SPECIFIC and FACTUAL. Use real names, real specs, real dates, real prices from the 1990s where possible.`;

  let userPrompt = `Research this topic for a 1990s web experience: "${query}"`;
  if (webContext) {
    userPrompt += `\n\nHere is some reference information from the web to help you be accurate:\n${webContext}`;
  }

  try {
    const raw = await ai.generateFast(system, userPrompt);
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const data = JSON.parse(jsonMatch[0]);

    // Cache it
    RESEARCH_CACHE.set(query.toLowerCase().trim(), { data, time: Date.now() });
    return data;
  } catch (err) {
    console.error('Research generation failed:', err.message);
    return null;
  }
}

async function fetchWebContext(query) {
  // Run DuckDuckGo and Wikipedia lookups in parallel, use whichever returns first/best
  const ddgPromise = fetch(
    `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`,
    { signal: AbortSignal.timeout(3000) }
  ).then(async r => {
    if (!r.ok) return '';
    const data = await r.json();
    const parts = [];
    if (data.Abstract) parts.push(data.Abstract);
    if (data.RelatedTopics) {
      for (const topic of data.RelatedTopics.slice(0, 5)) {
        if (topic.Text) parts.push(topic.Text);
      }
    }
    return parts.join('\n');
  }).catch(() => '');

  const wikiPromise = fetch(
    `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query.replace(/ /g, '_'))}`,
    { signal: AbortSignal.timeout(3000) }
  ).then(async r => {
    if (!r.ok) return '';
    const data = await r.json();
    return data.extract || '';
  }).catch(() => '');

  const [ddg, wiki] = await Promise.all([ddgPromise, wikiPromise]);

  // Combine both, preferring whichever has more content
  if (ddg && wiki) return ddg + '\n' + wiki;
  return ddg || wiki || '';
}

module.exports = { researchTopic };
