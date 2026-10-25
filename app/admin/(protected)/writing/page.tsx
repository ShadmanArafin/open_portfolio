import type { Metadata } from 'next';
import { getContentForChannel } from '@/core/content/read';
import { getWritingAdminState } from '@/core/writing/read';
import { WritingBuilder } from './writing-builder';

export const metadata: Metadata = { title: 'Writing' };

/**
 * Writing — essays, notes, posts, whatever this site calls them.
 *
 * The settings at the top are the part that makes this not a blog: what it is
 * called, whether dates show at all, and whether the newest or the best comes
 * first. Each piece is built from the same blocks as the pages, deliberately —
 * see `core/writing/schema.ts` for why the collection exists at all.
 *
 * The pieces come from their records, not the draft snapshot. The snapshot
 * still supplies the media library and the settings, and the loader falls back
 * to it until a piece's record exists, so a site that predates the split opens
 * with everything it had.
 */
export default async function WritingPage() {
  const [draft, state] = await Promise.all([getContentForChannel('draft'), getWritingAdminState()]);

  return (
    <div className="grid gap-6" style={{ maxWidth: 'var(--measure)' }}>
      <div>
        <p className="m-0 font-mono text-xs uppercase tracking-widest text-text-muted">Writing</p>
        <h1 className="font-display m-0 mt-1 text-3xl">Writing</h1>
        <p className="m-0 mt-1 text-text-secondary">
          Essays, notes, posts — whatever you want to call them. Built from the same blocks as your
          pages. Save when you are done — nothing here is live until you publish.
        </p>
      </div>

      <WritingBuilder
        token={state.token}
        initialSettings={state.settings}
        initialEntries={state.entries}
        media={draft.media ?? []}
      />
    </div>
  );
}
