import type { Metadata } from 'next';
import { getContentForChannel } from '@/core/content/read';
import { screenToken } from '@/core/content/screen-token';
import { ArtifactsBuilder } from './artifacts-builder';

export const metadata: Metadata = { title: 'Artifacts' };

/**
 * The visual explorations gallery, at its own address instead of inside the
 * legacy catch-all. Upload-first: the island's add control takes one or more
 * images and each becomes a record.
 */
export default async function ArtifactsPage() {
  const draft = await getContentForChannel('draft');
  const artifacts = [...(draft.artifacts ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="grid gap-6" style={{ maxWidth: 'var(--measure)' }}>
      <div>
        <p className="m-0 font-mono text-xs uppercase tracking-widest text-text-muted">Content</p>
        <h1 className="font-display m-0 mt-1 text-3xl">Visual explorations</h1>
        <p className="m-0 mt-1 text-text-secondary">
          Interface shots shown in the visual explorations gallery on the About page. Upload several
          at once.
        </p>
      </div>

      <ArtifactsBuilder token={screenToken(draft, 'artifacts')} initialArtifacts={artifacts} />
    </div>
  );
}
