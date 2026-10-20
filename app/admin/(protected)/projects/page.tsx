import type { Metadata } from 'next';
import { getContentForChannel } from '@/core/content/read';
import { screenToken } from '@/core/content/screen-token';
import { ProjectsBuilder } from './projects-builder';

export const metadata: Metadata = { title: 'Projects' };

/**
 * Selected work, at its own address instead of inside the legacy catch-all.
 *
 * The trunk reads the draft and hands the island the list in storage order;
 * from there every edit is local until Save, which writes the whole list in
 * one revision-checked call. Projects the owner adds here become pages at
 * /work/… (once published), and blocks that show work read the same list.
 */
export default async function ProjectsPage() {
  const draft = await getContentForChannel('draft');
  const projects = [...(draft.projects ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="grid gap-6" style={{ maxWidth: 'var(--measure)' }}>
      <div>
        <p className="m-0 font-mono text-xs uppercase tracking-widest text-text-muted">Work</p>
        <h1 className="font-display m-0 mt-1 text-3xl">Selected work</h1>
        <p className="m-0 mt-1 text-text-secondary">
          Your projects, the links they point at, and the images that go with them. Save when you
          are done — nothing here is live until you publish.
        </p>
      </div>

      <ProjectsBuilder
        token={screenToken(draft, 'projects')}
        initialProjects={projects}
        media={draft.media ?? []}
      />
    </div>
  );
}
