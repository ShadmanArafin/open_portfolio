import type { MetadataRoute } from 'next';
import { getPublishedContent } from '@/core/content/read';
import { resolveAppearance } from '@/core/theme/resolve';

/**
 * The web app manifest, built from the site's own settings.
 *
 * Installing matters more than it looks. Chrome began automatically revoking
 * notification permission from low-engagement sites in October 2025 and
 * explicitly exempts installed web apps; iOS 16.4 onwards only delivers web
 * push to a site added to the Home Screen at all. So "install this" is not a
 * nicety — it is the precondition for ever telling somebody a message arrived.
 *
 * `start_url` is `/admin` rather than the public site, deliberately. Nobody
 * installs their own portfolio to look at it; they install it to edit it from a
 * phone, and opening the marketing side of their own site would be a small
 * daily annoyance for the one person guaranteed to have it installed.
 */
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const content = await getPublishedContent();
  const appearance = resolveAppearance(content.appearance);

  const name = content.settings.fullName?.trim() || 'Portfolio';

  return {
    name: `${name} — editor`,
    short_name: name.split(/\s+/)[0].slice(0, 12) || 'Portfolio',
    description: 'Edit your site, read enquiries and publish, from your phone.',
    start_url: '/admin',
    scope: '/',
    display: 'standalone',
    // No `orientation`. Locking it takes a decision away from somebody holding
    // a phone in one hand, and there is nothing here that needs a shape.
    background_color: appearance.light.background,
    theme_color: appearance.light.background,
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      // Maskable is a separate asset, not the same file relabelled: Android
      // crops it to whatever shape the launcher uses, and an icon drawn to the
      // edges loses its edges.
      { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
