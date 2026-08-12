/**
 * Every claim this site makes about somebody else, with its source and the date
 * it was checked.
 *
 * The rule, and it has no exceptions: **a competitor fact does not appear on
 * this site unless it appears in this file with a URL and a date.** Marketing
 * pages routinely state a rival's pricing or limitations with no citation and
 * no date, which is how they end up describing a product that changed a year
 * ago. Ours states both, visibly, next to the claim.
 *
 * `status` is not decoration either:
 *
 * - `verified` — read on the vendor's own page on the date given.
 * - `third-party` — the vendor's page could not be read (JavaScript-rendered,
 *   region-locked, erroring) and this comes from a named third party instead.
 * - `unverified` — we could not establish it. It is published **as** unverified
 *   or not at all, and never rounded up into a fact.
 *
 * Rechecking is a real chore and the dates are what make it possible to know
 * what is stale. That is the trade.
 */

export type Provenance = 'verified' | 'third-party' | 'unverified';

export interface Fact {
  /** The claim, in a sentence, in our own words. */
  claim: string;
  source: string;
  sourceLabel: string;
  checked: string;
  status: Provenance;
  /** Anything the reader should know about how solid this is. */
  caveat?: string;
}

export const CLAIMS = {
  wixNoExport: {
    claim:
      'Wix’s own support article says: "Since Wix is a SaaS solution, your site must run on Wix’s servers."',
    source: 'https://support.wix.com/en/article/exporting-or-embedding-your-wix-site-elsewhere',
    sourceLabel: 'Wix support',
    checked: '12 August 2026',
    status: 'verified',
  },
  squarespacePartialExport: {
    claim:
      'Squarespace’s export leaves out portfolio pages, gallery pages, style settings and custom CSS — the one content type it markets hardest to creatives is the one it will not give back.',
    source: 'https://support.squarespace.com/hc/en-us/articles/206566687-Exporting-your-site',
    sourceLabel: 'Squarespace help',
    checked: '12 August 2026',
    status: 'verified',
  },
  adobeGracePeriod: {
    claim:
      'Adobe Portfolio has no export at all, and if your Creative Cloud subscription lapses the site "will remain live for 14 days. After this 14-day grace period, your site will come offline."',
    source:
      'https://community.adobe.com/questions-606/what-happens-to-my-portfolio-once-i-end-my-adobe-subscription-578410',
    sourceLabel: 'Adobe Product Community',
    checked: '12 August 2026',
    status: 'verified',
  },
  adobeCheapestRoute: {
    claim:
      'The cheapest verified way to publish an Adobe Portfolio site is Behance Pro at US$11.49/month, which includes up to 5 sites, hosting and custom domains.',
    source: 'https://www.behance.net/pro',
    sourceLabel: 'behance.net/pro',
    checked: '12 August 2026',
    status: 'verified',
    caveat:
      'Adobe’s own Creative Cloud pricing pages returned errors to us on that date, so any Creative Cloud figure would be third-party.',
  },
  squarespaceNoFree: {
    claim:
      'Squarespace has no free plan, and content on an expired trial is "marked for permanent deletion".',
    source: 'https://www.squarespace.com/pricing',
    sourceLabel: 'squarespace.com/pricing',
    checked: '12 August 2026',
    status: 'verified',
  },
  framerPricing: {
    claim: 'Framer is Free / Basic $10 / Pro $30 per month billed annually, at 30/30/150 pages.',
    source: 'https://www.framer.com/pricing/',
    sourceLabel: 'framer.com/pricing',
    checked: '12 August 2026',
    status: 'verified',
  },
  wixPricing: {
    claim:
      'Wix is roughly Light $17 / Core $29 / Business $39 / Elite $159 per month billed annually.',
    source: 'https://www.tooltester.com/en/reviews/wix-review/prices/',
    sourceLabel: 'Tooltester',
    checked: '12 August 2026',
    status: 'third-party',
    caveat:
      'Wix’s live pricing page is rendered in JavaScript and could not be read directly. Two independent third parties agree on these figures.',
  },
  wixFreeTier: {
    claim:
      'Wix’s free tier publishes on a Wix subdomain with an advertising banner that scrolls with the visitor, and no custom domain.',
    source: 'https://www.websitebuilderexpert.com/website-builders/wix-pricing/',
    sourceLabel: 'WebsiteBuilderExpert',
    checked: '3 February 2026',
    status: 'third-party',
  },
  vercelHobbyNonCommercial: {
    claim:
      'Vercel’s Hobby plan is "restricted to non-commercial personal use only", and their definition of commercial usage includes "advertising the sale of a product or service" and asking for donations.',
    source: 'https://vercel.com/docs/limits/fair-use-guidelines',
    sourceLabel: 'Vercel fair use guidelines',
    checked: '12 August 2026',
    status: 'verified',
  },
  netlifyCredits: {
    claim:
      'Netlify’s free plan runs on 300 credits, with custom domains, SSL, deploy previews, functions and a CDN, and no commercial-use restriction on the page.',
    source: 'https://www.netlify.com/pricing/',
    sourceLabel: 'netlify.com/pricing',
    checked: '12 August 2026',
    status: 'unverified',
    caveat:
      'What one credit actually buys is not stated on the pricing page and the credits documentation URL returns 404, so where the ceiling sits is unknown to us.',
  },
  supabasePausing: {
    claim:
      'Supabase pauses free projects after about a week of low activity, with a one-year window to restore.',
    source: 'https://supabase.com/docs/guides/platform/going-into-prod',
    sourceLabel: 'Supabase docs',
    checked: '12 August 2026',
    status: 'verified',
    caveat: 'A portfolio nobody visits for seven days is exactly that traffic profile.',
  },
  adobeStillDeveloped: {
    claim:
      'Adobe has published no deprecation notice for Portfolio. What exists is open threads on Adobe’s own community forum asking whether it has been abandoned.',
    source:
      'https://community.adobe.com/t5/creative-cloud-services-discussions/has-adobe-abandoned-portfolio-or-is-there-still-a-team-working-on-improving-it/td-p/15165849',
    sourceLabel: 'Adobe community',
    checked: '12 August 2026',
    status: 'verified',
    caveat:
      'We are not claiming a deprecation. Draw your own conclusion from the threads and from Adobe discontinuing Animate on 1 March 2026.',
  },
} as const satisfies Record<string, Fact>;

export type ClaimKey = keyof typeof CLAIMS;
