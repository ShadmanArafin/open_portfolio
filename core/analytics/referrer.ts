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
  { pattern: /(?:^|\.)linkedin\.com$/i, source: 'LinkedIn', category: 'job-board' },
  { pattern: /(?:^|\.)wellfound\.com$/i, source: 'Wellfound (AngelList)', category: 'job-board' },
  { pattern: /(?:^|\.)angel\.co$/i, source: 'Wellfound (AngelList)', category: 'job-board' },
  { pattern: /(?:^|\.)indeed\.com$/i, source: 'Indeed', category: 'job-board' },
  { pattern: /(?:^|\.)joinhandshake\.com$/i, source: 'Handshake', category: 'job-board' },
  { pattern: /(?:^|\.)glassdoor\.com$/i, source: 'Glassdoor', category: 'job-board' },
  { pattern: /(?:^|\.)greenhouse\.io$/i, source: 'Greenhouse ATS', category: 'job-board' },
  { pattern: /(?:^|\.)lever\.co$/i, source: 'Lever ATS', category: 'job-board' },

  // Developer & Design hubs
  { pattern: /(?:^|\.)github\.com$/i, source: 'GitHub', category: 'developer-design' },
  { pattern: /(?:^|\.)behance\.net$/i, source: 'Behance', category: 'developer-design' },
  { pattern: /(?:^|\.)dribbble\.com$/i, source: 'Dribbble', category: 'developer-design' },
  { pattern: /(?:^|\.)figma\.com$/i, source: 'Figma', category: 'developer-design' },
  { pattern: /(?:^|\.)codepen\.io$/i, source: 'CodePen', category: 'developer-design' },
  {
    pattern: /(?:^|\.)news\.ycombinator\.com$/i,
    source: 'Hacker News',
    category: 'developer-design',
  },

  // Search engines
  { pattern: /(?:^|\.)google\.[a-z.]+$/i, source: 'Google Search', category: 'search' },
  { pattern: /(?:^|\.)bing\.com$/i, source: 'Bing', category: 'search' },
  { pattern: /(?:^|\.)duckduckgo\.com$/i, source: 'DuckDuckGo', category: 'search' },
  { pattern: /(?:^|\.)ecosia\.org$/i, source: 'Ecosia', category: 'search' },

  // Social & Content networks
  { pattern: /(?:^|\.)(twitter\.com|x\.com|t\.co)$/i, source: 'X / Twitter', category: 'social' },
  { pattern: /(?:^|\.)instagram\.com$/i, source: 'Instagram', category: 'social' },
  { pattern: /(?:^|\.)threads\.net$/i, source: 'Threads', category: 'social' },
  { pattern: /(?:^|\.)substack\.com$/i, source: 'Substack', category: 'social' },
  { pattern: /(?:^|\.)medium\.com$/i, source: 'Medium', category: 'social' },
  { pattern: /(?:^|\.)reddit\.com$/i, source: 'Reddit', category: 'social' },
  { pattern: /(?:^|\.)bsky\.app$/i, source: 'Bluesky', category: 'social' },
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
    hostname = new URL(referrerUrl).hostname.toLowerCase();
  } catch {
    hostname = referrerUrl.toLowerCase().trim();
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
    raw: hostname,
    source: hostname || 'Direct / Resume Link',
    category: 'direct',
    categoryLabel: CATEGORY_LABELS.direct,
    isRecruiterSource: false,
  };
}
