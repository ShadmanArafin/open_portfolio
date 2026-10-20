import type { Metadata } from 'next';
import { getContentForChannel } from '@/core/content/read';
import { screenToken } from '@/core/content/screen-token';
import { SectionsBuilder } from './sections-builder';

export const metadata: Metadata = { title: 'Homepage' };

/**
 * The homepage bands.
 *
 * One island for the whole list: reordering, visibility and the text fields
 * are local edits until Save, and the save is one revision-checked write
 * (merge-by-id on the server). The old screen wrote the draft on every
 * keystroke; a single Save is the deliberate change — a mis-tap of "move down"
 * is no longer immediately live, and the draft gets one revision instead of
 * hundreds.
 */
export default async function HomepagePage() {
  const draft = await getContentForChannel('draft');

  return (
    <div className="grid gap-6" style={{ maxWidth: 'var(--measure)' }}>
      <div>
        <p className="m-0 font-mono text-xs uppercase tracking-widest text-text-muted">Homepage</p>
        <h1 className="font-display m-0 mt-1 text-3xl">Homepage Section Builder</h1>
        <p className="m-0 mt-1 text-text-secondary">
          Reorder the bands on your homepage, show or hide them, and edit their headings and
          buttons. Save when you are done — nothing here is live until you publish.
        </p>
      </div>

      <SectionsBuilder token={screenToken(draft, 'sections')} initial={draft.sections ?? []} />
    </div>
  );
}
