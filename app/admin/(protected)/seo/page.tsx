import type { Metadata } from 'next';
import { getContentForChannel } from '@/core/content/read';
import { screenToken } from '@/core/content/screen-token';
import { SeoForm } from './seo-form';

export const metadata: Metadata = { title: 'SEO' };

/**
 * Search and social previews. Plain draft fields; the description's length
 * counter is the only live behaviour, and it is local to the island.
 */
export default async function SeoPage() {
  const draft = await getContentForChannel('draft');

  return (
    <div className="grid gap-6" style={{ maxWidth: 'var(--measure)' }}>
      <div>
        <p className="m-0 font-mono text-xs uppercase tracking-widest text-text-muted">SEO</p>
        <h1 className="font-display m-0 mt-1 text-3xl">Search &amp; Social Previews</h1>
        <p className="m-0 mt-1 text-text-secondary">
          Page title, meta description, and the image used when a link to your site is shared.
        </p>
      </div>

      <SeoForm
        token={screenToken(draft, 'seo')}
        initial={{
          siteTitle: draft.seo.siteTitle ?? '',
          titleTemplate: draft.seo.titleTemplate ?? '',
          metaDescription: draft.seo.metaDescription ?? '',
          canonicalUrl: draft.seo.canonicalUrl ?? '',
          ogImage: draft.seo.ogImage ?? '',
          author: draft.seo.author ?? '',
          robots: draft.seo.robots ?? '',
        }}
      />
    </div>
  );
}
