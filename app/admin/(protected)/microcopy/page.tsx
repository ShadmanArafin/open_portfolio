import type { Metadata } from 'next';
import { getContentForChannel } from '@/core/content/read';
import { screenToken } from '@/core/content/screen-token';
import { MicrocopyForm } from './microcopy-form';

export const metadata: Metadata = { title: 'Microcopy' };

/**
 * Every short string on the site that is not a heading or body paragraph.
 * The whole closed set is handed to the island; the search box is local.
 */
export default async function MicrocopyPage() {
  const draft = await getContentForChannel('draft');

  return (
    <div className="grid gap-6" style={{ maxWidth: 'var(--measure)' }}>
      <div>
        <p className="m-0 font-mono text-xs uppercase tracking-widest text-text-muted">Microcopy</p>
        <h1 className="font-display m-0 mt-1 text-3xl">Buttons, Labels &amp; Small Text</h1>
        <p className="m-0 mt-1 text-text-secondary">
          Every short string on the site that is not a heading or body paragraph. Search to jump to
          one.
        </p>
      </div>

      <MicrocopyForm
        token={screenToken(draft, 'microcopy')}
        initial={(draft.microcopy ?? {}) as unknown as Record<string, string>}
      />
    </div>
  );
}
