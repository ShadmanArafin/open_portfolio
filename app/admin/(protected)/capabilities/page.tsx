import type { Metadata } from 'next';
import { getContentForChannel } from '@/core/content/read';
import { screenToken } from '@/core/content/screen-token';
import { CapabilitiesBuilder } from './capabilities-builder';

export const metadata: Metadata = { title: 'Capabilities' };

/**
 * Skill categories and their capabilities, at their own address instead of
 * inside the legacy catch-all. The homepage section reads these groups in
 * `sortOrder`, filtered by `visible`.
 */
export default async function CapabilitiesPage() {
  const draft = await getContentForChannel('draft');
  const groups = [...(draft.capabilityGroups ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="grid gap-6" style={{ maxWidth: 'var(--measure)' }}>
      <div>
        <p className="m-0 font-mono text-xs uppercase tracking-widest text-text-muted">Content</p>
        <h1 className="font-display m-0 mt-1 text-3xl">Capability groups</h1>
        <p className="m-0 mt-1 text-text-secondary">
          Skill categories in the “What I bring to the table” section, each with its own list of
          capabilities.
        </p>
      </div>

      <CapabilitiesBuilder token={screenToken(draft, 'capabilityGroups')} initialGroups={groups} />
    </div>
  );
}
