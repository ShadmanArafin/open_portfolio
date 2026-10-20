import type { Metadata } from 'next';
import { getContentForChannel } from '@/core/content/read';
import { screenToken } from '@/core/content/screen-token';
import { AppearanceForm } from './appearance-form';

export const metadata: Metadata = { title: 'Appearance' };

/**
 * Colours & typography.
 *
 * The whole appearance object goes to the island: theme choice, the six
 * colour overrides and the three font choices are one draft write, and the
 * "switching clears your overrides" rule needs to see all of them at once.
 */
export default async function AppearancePage() {
  const draft = await getContentForChannel('draft');

  return (
    <div className="grid gap-6" style={{ maxWidth: 'var(--measure)' }}>
      <div>
        <p className="m-0 font-mono text-xs uppercase tracking-widest text-text-muted">
          Appearance
        </p>
        <h1 className="font-display m-0 mt-1 text-3xl">Colours &amp; Typography</h1>
        <p className="m-0 mt-1 text-text-secondary">
          Accent colours per theme, background tones, and the Google Fonts used for headings and
          body text.
        </p>
      </div>

      <AppearanceForm token={screenToken(draft, 'appearance')} initial={draft.appearance} />
    </div>
  );
}
