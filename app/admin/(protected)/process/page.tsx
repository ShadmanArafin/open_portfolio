import type { Metadata } from 'next';
import { getContentForChannel } from '@/core/content/read';
import { screenToken } from '@/core/content/screen-token';
import { ProcessBuilder } from './process-builder';

export const metadata: Metadata = { title: 'Process' };

/**
 * The numbered steps of the design process, at their own address instead of
 * inside the legacy catch-all. Deliverable and detail chips are optional and
 * hide themselves on the site when empty.
 */
export default async function ProcessPage() {
  const draft = await getContentForChannel('draft');
  const steps = [...(draft.processSteps ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="grid gap-6" style={{ maxWidth: 'var(--measure)' }}>
      <div>
        <p className="m-0 font-mono text-xs uppercase tracking-widest text-text-muted">Content</p>
        <h1 className="font-display m-0 mt-1 text-3xl">Process steps</h1>
        <p className="m-0 mt-1 text-text-secondary">
          The steps in the “Design Process” section on the homepage. Deliverable and detail chips
          are optional — leave them empty to hide them.
        </p>
      </div>

      <ProcessBuilder token={screenToken(draft, 'processSteps')} initialSteps={steps} />
    </div>
  );
}
