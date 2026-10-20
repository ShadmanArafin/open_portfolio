import type { Metadata } from 'next';
import { getContentForChannel } from '@/core/content/read';
import { screenToken } from '@/core/content/screen-token';
import { ExperienceBuilder } from './experience-builder';

export const metadata: Metadata = { title: 'Experience' };

/**
 * The roles behind the timeline on the About page, at their own address
 * instead of inside the legacy catch-all. The label the site shows is
 * written from the picked dates on save — see the action.
 */
export default async function ExperiencePage() {
  const draft = await getContentForChannel('draft');
  const experience = [...(draft.experience ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="grid gap-6" style={{ maxWidth: 'var(--measure)' }}>
      <div>
        <p className="m-0 font-mono text-xs uppercase tracking-widest text-text-muted">Content</p>
        <h1 className="font-display m-0 mt-1 text-3xl">Experience</h1>
        <p className="m-0 mt-1 text-text-secondary">
          Roles, dates and highlights for the timeline on your About page. The label the site shows
          is written from the dates you pick, every time you save.
        </p>
      </div>

      <ExperienceBuilder token={screenToken(draft, 'experience')} initialExperience={experience} />
    </div>
  );
}
