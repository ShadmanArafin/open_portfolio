import type { Metadata } from 'next';
import type { CMSState, SEOSettings } from '@/cms/types/cms';
import { getPublishedContent } from './read';
import { isShippedTitleTemplate } from './identity';

/**
 * Turn the SEO settings the admin already edits into real document metadata.
 *
 * Until now `/admin/seo` wrote to fields nothing read: every route served one
 * hardcoded `<title>` from index.html and there were no Open Graph tags at all,
 * so links never unfurled anywhere. This module is what makes that screen
 * actually do something.
 */

/**
 * Applies the `%s` template, unless the page *is* the site's front door.
 *
 * With no template set, the title becomes "Page — Site title" rather than the
 * page title alone: dropping the site's name from every tab and every search
 * result is a real loss, and it is what the previous fallback of `'%s'` did.
 *
 * Deriving it also means it cannot go stale. The template used to be written
 * once by the first-run wizard as `%s — <name>`, so anybody who later changed
 * their name in Settings kept the old one in every page title, on every search
 * result, indefinitely.
 */
function applyTitleTemplate(seo: SEOSettings, pageTitle?: string): string {
  const siteTitle = seo.siteTitle?.trim();
  if (!pageTitle) return siteTitle || 'Portfolio';

  // A template we shipped with a placeholder name in it counts as unset, so
  // existing installs pick up the derived title rather than keeping "Your Name"
  // in every tab. See `identity.ts`.
  const template = isShippedTitleTemplate(seo.titleTemplate) ? '' : seo.titleTemplate;
  if (template?.includes('%s')) return template.replace('%s', pageTitle);
  return siteTitle ? `${pageTitle} — ${siteTitle}` : pageTitle;
}

/**
 * The canonical URL a user set, or whatever the host tells us at runtime.
 * Absolute URLs matter: Open Graph images given as a relative path are simply
 * ignored by most crawlers.
 */
export function resolveSiteUrl(content: CMSState): string | undefined {
  const configured = content.seo.canonicalUrl || content.settings.siteUrl;
  if (configured) return configured.replace(/\/$/, '');
  if (process.env.OPB_SITE_URL) return process.env.OPB_SITE_URL.replace(/\/$/, '');
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  return undefined;
}

export interface PageMetaInput {
  /** Slotted into the title template. Omit for the homepage. */
  title?: string;
  description?: string;
  /** Path only, e.g. `/work/example`. Combined with the site URL. */
  path?: string;
  image?: string;
  type?: 'website' | 'article';
}

export async function buildMetadata(input: PageMetaInput = {}): Promise<Metadata> {
  const content = await getPublishedContent();
  const { seo, settings } = content;

  const siteUrl = resolveSiteUrl(content);
  const title = applyTitleTemplate(seo, input.title);
  const description = input.description || seo.metaDescription || '';
  const image = input.image || seo.ogImage;
  const url = siteUrl && input.path ? `${siteUrl}${input.path}` : siteUrl;

  // An OG image only works as an absolute URL.
  const absoluteImage =
    image && siteUrl && image.startsWith('/') ? `${siteUrl}${image}` : image || undefined;

  const meta: Metadata = {
    title,
    description,
    applicationName: seo.siteTitle || undefined,
    authors: seo.author ? [{ name: seo.author }] : undefined,
    // `robots` is a free-text field in the admin; pass it straight through so a
    // user can write "noindex, nofollow" while the site is still a draft.
    robots: seo.robots || undefined,
    openGraph: {
      type: input.type ?? 'website',
      title,
      description,
      siteName: seo.siteTitle || settings.fullName || undefined,
      url: url || undefined,
      images: absoluteImage ? [{ url: absoluteImage }] : undefined,
    },
    twitter: {
      card: absoluteImage ? 'summary_large_image' : 'summary',
      title,
      description,
      images: absoluteImage ? [absoluteImage] : undefined,
    },
  };

  if (siteUrl) {
    meta.metadataBase = new URL(siteUrl);
    meta.alternates = { canonical: url || siteUrl };
  }

  return meta;
}
