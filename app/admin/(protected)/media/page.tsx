import type { Metadata } from 'next';
import { getContentForChannel } from '@/core/content/read';
import { countMediaUsage } from '@/core/content/changes';
import { MediaLibrary } from './media-library';

export const metadata: Metadata = { title: 'Media' };

/**
 * The media library.
 *
 * The draft's media list is the library; usage is computed from the content
 * itself with the same helper the publish summary trusts, so "used 2×" here
 * and "deleting it leaves those images blank" are answering from the same
 * count. Uploads, deletes and the résumé link are server actions; the files
 * themselves live in whichever storage backend is configured.
 */
export default async function MediaPage() {
  const draft = await getContentForChannel('draft');
  const media = draft.media ?? [];

  const usage: Record<string, number> = {};
  for (const item of media) usage[item.id] = countMediaUsage(draft, item.id);

  return (
    <div className="grid gap-6" style={{ maxWidth: 'var(--measure)' }}>
      <div>
        <p className="m-0 font-mono text-xs uppercase tracking-widest text-text-muted">Media</p>
        <h1 className="font-display m-0 mt-1 text-3xl">Media Library</h1>
        <p className="m-0 mt-1 text-text-secondary">
          Images and PDFs used across the site. Files live in your storage backend and can be picked
          from any image field in the admin. Uploaded PDFs can be set as the downloadable résumé.
        </p>
      </div>

      <MediaLibrary
        initialItems={media}
        initialUsage={usage}
        initialResume={{ url: draft.settings.resumeUrl, filename: draft.settings.resumeFilename }}
      />
    </div>
  );
}
