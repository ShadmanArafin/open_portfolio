import type { Metadata } from 'next';
import { getContentForChannel } from '@/core/content/read';
import { screenToken } from '@/core/content/screen-token';
import { CaseStudiesBuilder } from './case-studies-builder';

export const metadata: Metadata = { title: 'Case studies' };

/**
 * The design stories, at their own address instead of inside the legacy
 * catch-all. Same shape as Selected work: the trunk reads the draft, the
 * island edits it locally, and Save writes the whole list revision-checked.
 */
export default async function CaseStudiesPage() {
  const draft = await getContentForChannel('draft');
  const caseStudies = [...(draft.caseStudies ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="grid gap-6" style={{ maxWidth: 'var(--measure)' }}>
      <div>
        <p className="m-0 font-mono text-xs uppercase tracking-widest text-text-muted">
          Case studies
        </p>
        <h1 className="font-display m-0 mt-1 text-3xl">Case Studies &amp; Design Stories</h1>
        <p className="m-0 mt-1 text-text-secondary">
          Longer stories about your work — the research, the decisions you made, and what came of
          them. Save when you are done — nothing here is live until you publish.
        </p>
      </div>

      <CaseStudiesBuilder
        token={screenToken(draft, 'caseStudies')}
        initialCaseStudies={caseStudies}
      />
    </div>
  );
}
