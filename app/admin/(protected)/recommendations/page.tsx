import type { Metadata } from 'next';
import { getContentForChannel } from '@/core/content/read';
import { screenToken } from '@/core/content/screen-token';
import { RecommendationsBuilder } from './recommendations-builder';

export const metadata: Metadata = { title: 'Recommendations' };

/**
 * The quotes shown on the homepage, at their own address instead of inside
 * the legacy catch-all. The card adds its own quote marks — the field hint
 * says so on the screen that writes the text.
 */
export default async function RecommendationsPage() {
  const draft = await getContentForChannel('draft');
  const recommendations = [...(draft.recommendations ?? [])].sort(
    (a, b) => a.sortOrder - b.sortOrder
  );

  return (
    <div className="grid gap-6" style={{ maxWidth: 'var(--measure)' }}>
      <div>
        <p className="m-0 font-mono text-xs uppercase tracking-widest text-text-muted">Content</p>
        <h1 className="font-display m-0 mt-1 text-3xl">Recommendations</h1>
        <p className="m-0 mt-1 text-text-secondary">
          Quotes shown on the homepage. The card adds its own quote marks — type the quote without
          them.
        </p>
      </div>

      <RecommendationsBuilder
        token={screenToken(draft, 'recommendations')}
        initialRecommendations={recommendations}
      />
    </div>
  );
}
