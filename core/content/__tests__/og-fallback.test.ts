import { describe, expect, it, vi } from 'vitest';
import { INITIAL_CMS_STATE } from '@/cms/data/initialData';
import type { CMSState } from '@/cms/types/cms';

/**
 * A link that unfurls even when nobody uploaded a picture.
 *
 * `opengraph-image.tsx` renders a card from the site's own settings, so every
 * page has something to show in a message, a post or a search result. The
 * fallback has to be path-aware: a writing entry points at its own card under
 * `/writing/<slug>/opengraph-image`, everything else at the site-wide one.
 *
 * These tests cover the wiring, because the failure mode is silent. A missing
 * or relative image is ignored by most crawlers rather than reported, so the
 * page just unfurls as a grey rectangle and nobody can tell why.
 */

// Hoisted, reading a holder the tests can change. `vi.mock` must run before
// `metadata.ts` closes over the real module.
const served = { current: INITIAL_CMS_STATE };
vi.mock('../read', () => ({ getPublishedContent: async () => served.current }));

const { buildMetadata } = await import('../metadata');

function withSite(over: Partial<CMSState['settings']> = {}): void {
  served.current = {
    ...INITIAL_CMS_STATE,
    settings: { ...INITIAL_CMS_STATE.settings, siteUrl: 'https://mira.example', ...over },
    seo: { ...INITIAL_CMS_STATE.seo, ogImage: '' },
  };
}

describe('the Open Graph image fallback', () => {
  it('gives a writing entry its own card', async () => {
    withSite();
    const meta = await buildMetadata({ path: '/writing/on-taste', title: 'On Taste' });
    expect(meta.openGraph?.images).toEqual([
      { url: 'https://mira.example/writing/on-taste/opengraph-image' },
    ]);
  });

  it('gives everything else the site-wide card', async () => {
    withSite();
    const meta = await buildMetadata({ path: '/work/thing', title: 'Thing' });
    expect(meta.openGraph?.images).toEqual([{ url: 'https://mira.example/opengraph-image' }]);
  });

  it('lets a page override it, and the SEO screen override that', async () => {
    withSite();

    const explicit = await buildMetadata({ path: '/work/thing', image: '/uploads/shot.png' });
    expect(explicit.openGraph?.images).toEqual([{ url: 'https://mira.example/uploads/shot.png' }]);

    served.current = {
      ...served.current,
      seo: { ...served.current.seo, ogImage: '/uploads/social.png' },
    };
    const fromSettings = await buildMetadata({ path: '/work/thing' });
    expect(fromSettings.openGraph?.images).toEqual([
      { url: 'https://mira.example/uploads/social.png' },
    ]);
    // A per-post card still wins over the global one, or every piece would
    // unfurl with the same picture.
    const perPost = await buildMetadata({
      path: '/writing/on-taste',
      image: '/writing/on-taste/opengraph-image',
    });
    expect(perPost.openGraph?.images).toEqual([
      { url: 'https://mira.example/writing/on-taste/opengraph-image' },
    ]);
  });

  it('leaves the path relative without a domain, and still sets metadataBase', async () => {
    // `metadataBase` is what turns a path into the absolute URL a crawler
    // needs. Leaving it unset when no domain is configured makes Next warn and
    // drops the image on the floor.
    withSite({ siteUrl: '' });
    const meta = await buildMetadata({ path: '/writing/on-taste' });
    expect(meta.metadataBase?.toString()).toBe('http://localhost:3000/');
    expect(meta.openGraph?.images).toEqual([{ url: '/writing/on-taste/opengraph-image' }]);
  });

  it('asks for a large card, since there is always an image now', async () => {
    withSite();
    const meta = await buildMetadata({ path: '/work/thing' });
    // `twitter` is a union; only the card-bearing members carry `card`.
    const card = meta.twitter && 'card' in meta.twitter ? meta.twitter.card : undefined;
    expect(card).toBe('summary_large_image');
    expect(meta.twitter?.images).toEqual(['https://mira.example/opengraph-image']);
  });
});
