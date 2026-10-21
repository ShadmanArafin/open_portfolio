import type { Metadata } from 'next';
import { getContentForChannel } from '@/core/content/read';
import { screenToken } from '@/core/content/screen-token';
import { homePageFromSections } from '@/core/pages/home-from-sections';
import { PagesBuilder } from './pages-builder';

export const metadata: Metadata = { title: 'Pages' };

/**
 * The block builder.
 *
 * A list, not a canvas: pages are web addresses, and each one is a stack of
 * blocks. Everything the editor needs about blocks — labels, fields, defaults,
 * the checks under each one — comes from the same registry the public site
 * renders from, so a new block type appears here the day it renders, with
 * nothing to keep in step by hand.
 */
export default async function PagesPage() {
  const draft = await getContentForChannel('draft');

  return (
    <div className="grid gap-6" style={{ maxWidth: 'var(--measure)' }}>
      <div>
        <p className="m-0 font-mono text-xs uppercase tracking-widest text-text-muted">Pages</p>
        <h1 className="font-display m-0 mt-1 text-3xl">Pages Builder</h1>
        <p className="m-0 mt-1 text-text-secondary">
          Build pages out of blocks. Reorder them, hide sections you are not ready to show, and give
          each page its own web address. Save when you are done — nothing here is live until you
          publish.
        </p>
      </div>

      <PagesBuilder
        token={screenToken(draft, 'pages')}
        initialPages={draft.pages ?? []}
        media={draft.media ?? []}
        homeStarter={homePageFromSections(draft.sections, draft.settings)}
      />
    </div>
  );
}
