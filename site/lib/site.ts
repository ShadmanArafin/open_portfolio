/**
 * Everything about this site that is a fact rather than a design decision.
 *
 * One place, because these strings appear in the nav, the footer, the sitemap,
 * the OG tags and half the pages, and a version number that is right in four of
 * those five is worse than one that is wrong everywhere — at least the second
 * is noticed.
 */

export const REPO = 'https://github.com/ShadmanArafin/open_portfolio';

/**
 * The public address, overridable at build time.
 *
 * No domain has been bought yet, so this defaults to where the site actually
 * lives. That matters more than it looks: canonical links, the sitemap and the
 * social cards all derive from it, so a default pointing at a domain nobody
 * owns tells search engines the real version of every page is somewhere that
 * does not resolve.
 *
 * Set `SITE_URL` in the deployment's environment when a domain is bought, and
 * every one of those follows — there is nothing else to change. Note that the
 * site is currently deployed as a prebuilt static export, so it has to be set
 * at build time, not only in the Vercel project.
 */
export const SITE_URL = (process.env.SITE_URL ?? 'https://getopenportfolio.vercel.app').replace(
  /\/$/,
  ''
);

export const PRODUCT = 'Open Portfolio Builder';

/** Version of the product this site describes. Bump with a release. */
export const VERSION = '0.5.0';

/**
 * The one canonical description.
 *
 * Written once and used everywhere: the meta description, the GitHub About
 * field (which *is* the Google snippet for a repository page), directory
 * submissions. It carries "open source", "self-hosted" and "portfolio website"
 * verbatim because those are the words the two audiences each search with.
 */
export const DESCRIPTION =
  'Open source, self-hosted portfolio website builder. Build and edit your site from an admin panel — no code — and keep the content in your own database.';

/**
 * Who made it, and where.
 *
 * Every one of the five archived zero-proof homepages recovered in the research
 * named a real person and a real place, without exception. A project with no
 * users has nothing else to offer as evidence that somebody is behind it.
 *
 * `city` is deliberately left blank rather than guessed. An invented location
 * on the page that argues for verifiability would be the one unverifiable
 * claim on it.
 */
export const MAINTAINER = {
  name: 'Shadman Arafin',
  github: 'https://github.com/ShadmanArafin',
  city: '',
};

export const NAV = [
  { href: '/demo', label: 'Live demo' },
  { href: '/compare', label: 'Compare' },
  { href: '/what-it-costs', label: 'What it costs' },
  { href: '/help', label: 'Help' },
  { href: '/docs', label: 'Docs' },
  { href: REPO, label: 'GitHub', external: true },
];

/** Today, for the provenance stamps. Set at build time, not at render time. */
export const CHECKED_ON = '13 August 2026';
