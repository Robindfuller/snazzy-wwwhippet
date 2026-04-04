// Classify a URL into a content type
// Prefers the type from search results if available, falls back to URL heuristics

function classifyContent(url, searchContext = null) {
  // If we have search context with a type, trust it — the AI already decided
  if (searchContext?.type) {
    const typeMap = {
      personal: 'personal',
      corporate: 'corporate',
      fansite: 'fansite',
      fan: 'fansite',
      university: 'university',
      edu: 'university',
      news: 'news',
      directory: 'directory',
      magazine: 'news',
      publication: 'news',
      store: 'corporate',
      shop: 'corporate',
      community: 'fansite',
      reference: 'generic',
      other: 'generic',
    };
    const mapped = typeMap[searchContext.type.toLowerCase()];
    if (mapped) return mapped;
  }

  // Fall back to URL heuristics
  const lowerUrl = url.toLowerCase();

  // Personal homepage hosts
  if (lowerUrl.includes('geocities.com') ||
      lowerUrl.includes('angelfire.com') ||
      lowerUrl.includes('tripod.com') ||
      lowerUrl.includes('members.aol.com') ||
      lowerUrl.includes('hometown.aol.com') ||
      lowerUrl.includes('xoom.com') ||
      lowerUrl.includes('fortunecity.com')) {
    return 'personal';
  }

  // Tilde paths are personal pages
  if (lowerUrl.match(/\/~\w+/)) {
    // Unless it's on a .edu domain
    if (lowerUrl.includes('.edu')) return 'university';
    return 'personal';
  }

  // University/education
  if (lowerUrl.includes('.edu')) return 'university';

  // News sites
  if (lowerUrl.includes('news') || lowerUrl.includes('daily') || lowerUrl.includes('times') ||
      lowerUrl.includes('herald') || lowerUrl.includes('gazette') || lowerUrl.includes('tribune') ||
      lowerUrl.includes('post') || lowerUrl.includes('journal') || lowerUrl.includes('magazine') ||
      lowerUrl.includes('cnn') || lowerUrl.includes('bbc') || lowerUrl.includes('reuters') ||
      lowerUrl.includes('review') || lowerUrl.includes('weekly') || lowerUrl.includes('press')) {
    return 'news';
  }

  // Fan sites — only if very obviously a fan site
  if (lowerUrl.includes('shrine') || lowerUrl.includes('fanclub') || lowerUrl.includes('fanpage') ||
      lowerUrl.includes('unofficial')) {
    return 'fansite';
  }

  // Directory/portal
  if (lowerUrl.includes('directory') || lowerUrl.includes('webring') || lowerUrl.includes('portal') ||
      lowerUrl.includes('yahoo')) {
    return 'directory';
  }

  // Corporate — standalone domain with simple path
  if (lowerUrl.match(/^https?:\/\/www\.[a-z0-9-]+\.(com|net|biz|org)\/?(index\.html?)?$/)) {
    return 'corporate';
  }

  // Default to generic — let the AI figure it out from the domain name
  return 'generic';
}

// TTL in seconds, with some randomness
function getTTL(contentType) {
  const ranges = {
    news:       [43200, 43200],         // 12 hours
    personal:   [1209600, 2419200],     // 14-28 days
    corporate:  [2592000, 5184000],     // 30-60 days
    university: [2592000, 7776000],     // 30-90 days
    fansite:    [604800, 1814400],      // 7-21 days
    directory:  [604800, 604800],       // 7 days
    generic:    [1209600, 2419200],     // 14-28 days
  };

  const [min, max] = ranges[contentType] || ranges.generic;
  return Math.floor(min + Math.random() * (max - min));
}

module.exports = { classifyContent, getTTL };
