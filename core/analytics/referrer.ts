/**
 * Privacy-first Referrer & Recruiter Traffic Classifier.
 *
 * Inspired by Umami:
 * Categorizes referral traffic into intuitive categories (Job Boards & Recruiters,
 * Developer & Design hubs, Search, and Social) without storing IP addresses
 * or personal identifying information.
 */

export type ReferrerCategory = 'job-board' | 'developer-design' | 'search' | 'social' | 'direct';

export interface ClassifiedReferrer {
  raw: string;
  source: string;
  category: ReferrerCategory;
  categoryLabel: string;
  isRecruiterSource: boolean;
}

const REFERRER_RULES: { pattern: RegExp; source: string; category: ReferrerCategory }[] = [
  // Job boards & professional career platforms
  { pattern: /(?:^|\.)linkedin(?:\.com)?$/i, source: 'LinkedIn', category: 'job-board' },
  {
    pattern: /(?:^|\.)(?:wellfound\.com|wellfound|angel\.co|angellist)$/i,
    source: 'Wellfound (AngelList)',
    category: 'job-board',
  },
  { pattern: /(?:^|\.)(?:indeed\.com|indeed)$/i, source: 'Indeed', category: 'job-board' },
  {
    pattern: /(?:^|\.)(?:joinhandshake\.com|handshake)$/i,
    source: 'Handshake',
    category: 'job-board',
  },
  { pattern: /(?:^|\.)(?:glassdoor\.com|glassdoor)$/i, source: 'Glassdoor', category: 'job-board' },
  {
    pattern: /(?:^|\.)(?:greenhouse\.io|greenhouse)$/i,
    source: 'Greenhouse ATS',
    category: 'job-board',
  },
  { pattern: /(?:^|\.)(?:lever\.co|lever)$/i, source: 'Lever ATS', category: 'job-board' },

  // Developer & Design hubs
  { pattern: /(?:^|\.)(?:github\.com|github)$/i, source: 'GitHub', category: 'developer-design' },
  {
    pattern: /(?:^|\.)(?:behance\.net|behance)$/i,
    source: 'Behance',
    category: 'developer-design',
  },
  {
    pattern: /(?:^|\.)(?:dribbble\.com|dribbble)$/i,
    source: 'Dribbble',
    category: 'developer-design',
  },
  { pattern: /(?:^|\.)(?:figma\.com|figma)$/i, source: 'Figma', category: 'developer-design' },
  { pattern: /(?:^|\.)(?:codepen\.io|codepen)$/i, source: 'CodePen', category: 'developer-design' },
  {
    pattern: /(?:^|\.)(?:news\.ycombinator\.com|hacker news)$/i,
    source: 'Hacker News',
    category: 'developer-design',
  },

  // Search engines
  {
    pattern: /(?:^|\.)(?:google(?:\.[a-z.]+)?|google search)$/i,
    source: 'Google Search',
    category: 'search',
  },
  { pattern: /(?:^|\.)(?:bing\.com|bing)$/i, source: 'Bing', category: 'search' },
  {
    pattern: /(?:^|\.)(?:duckduckgo\.com|duckduckgo)$/i,
    source: 'DuckDuckGo',
    category: 'search',
  },
  { pattern: /(?:^|\.)(?:ecosia\.org|ecosia)$/i, source: 'Ecosia', category: 'search' },

  // Social & Content networks
  {
    pattern: /(?:^|\.)(?:twitter\.com|x\.com|t\.co|x|twitter)$/i,
    source: 'X / Twitter',
    category: 'social',
  },
  {
    pattern: /(?:^|\.)(?:instagram\.com|instagram)$/i,
    source: 'Instagram',
    category: 'social',
  },
  { pattern: /(?:^|\.)(?:threads\.net|threads)$/i, source: 'Threads', category: 'social' },
  { pattern: /(?:^|\.)(?:substack\.com|substack)$/i, source: 'Substack', category: 'social' },
  { pattern: /(?:^|\.)(?:medium\.com|medium)$/i, source: 'Medium', category: 'social' },
  { pattern: /(?:^|\.)(?:reddit\.com|reddit)$/i, source: 'Reddit', category: 'social' },
  { pattern: /(?:^|\.)(?:bsky\.app|bluesky)$/i, source: 'Bluesky', category: 'social' },
];

const CATEGORY_LABELS: Record<ReferrerCategory, string> = {
  'job-board': 'Job Board & Recruiter',
  'developer-design': 'Developer & Design Hub',
  search: 'Search Engine',
  social: 'Social & Writing',
  direct: 'Direct / Resume Link',
};

export function classifyReferrer(referrerUrl?: string | null): ClassifiedReferrer {
  if (!referrerUrl || !referrerUrl.trim()) {
    return {
      raw: '',
      source: 'Direct / Resume Link',
      category: 'direct',
      categoryLabel: CATEGORY_LABELS.direct,
      isRecruiterSource: false,
    };
  }

  let hostname = '';
  try {
    const candidate = referrerUrl.trim();
    const parsed = new URL(candidate.includes('://') ? candidate : `https://${candidate}`);
    hostname = parsed.hostname.toLowerCase();
  } catch {
    hostname = referrerUrl.trim().toLowerCase().split(/[/?#]/, 1)[0];
  }
  if (/^(?:direct|direct \/ none|direct \/ resume link|none|\(direct\))$/i.test(hostname)) {
    hostname = '';
  }

  for (const rule of REFERRER_RULES) {
    if (rule.pattern.test(hostname)) {
      return {
        raw: hostname,
        source: rule.source,
        category: rule.category,
        categoryLabel: CATEGORY_LABELS[rule.category],
        isRecruiterSource: rule.category === 'job-board',
      };
    }
  }

  return {
    raw: hostname.slice(0, 253),
    source: hostname.slice(0, 100) || 'Direct / Resume Link',
    category: 'direct',
    categoryLabel: CATEGORY_LABELS.direct,
    isRecruiterSource: false,
  };
}
