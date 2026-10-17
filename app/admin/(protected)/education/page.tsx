import type { Metadata } from 'next';
import { getContentForChannel } from '@/core/content/read';
import { EducationBuilder } from './education-builder';

export const metadata: Metadata = { title: 'Education' };

/**
 * Degrees and academic chapters, at their own address instead of inside the
 * legacy catch-all. Entries number themselves from their position on save —
 * see the action.
 */
export default async function EducationPage() {
  const draft = await getContentForChannel('draft');
  const education = [...(draft.education ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="grid gap-6" style={{ maxWidth: 'var(--measure)' }}>
      <div>
        <p className="m-0 font-mono text-xs uppercase tracking-widest text-text-muted">Content</p>
        <h1 className="font-display m-0 mt-1 text-3xl">Education</h1>
        <p className="mt-1 text-text-secondary">
          Degrees and academic chapters, in the order your About page lists them. Entries number
          themselves from that order.
        </p>
      </div>

      <EducationBuilder initialEducation={education} />
    </div>
  );
}
