import type { Metadata } from 'next';
import { getContentForChannel } from '@/core/content/read';
import { screenToken } from '@/core/content/screen-token';
import { NavigationBuilder } from './navigation-builder';

export const metadata: Metadata = { title: 'Navigation' };

/** Routes every install serves, whatever the draft contains. */
const FIXED_ROUTES = ['/', '/work', '/about', '/contact'];

/**
 * The header menu, at its own address instead of inside the legacy
 * catch-all.
 *
 * The island owns every edit locally and one Save writes the whole list
 * revision-checked, the same shape as the collection screens. The known
 * addresses handed to it are read from the draft — a built page, a project,
 * a case study, the writing section while it is on — so the "no such page"
 * warning speaks about this site rather than a list frozen when the legacy
 * screen was written.
 */
export default async function NavigationPage() {
  const draft = await getContentForChannel('draft');
  const links = [...(draft.navLinks ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);

  const known = new Set(FIXED_ROUTES);
  const writingOn = draft.writingSettings?.enabled === true;
  if (writingOn) known.add('/writing');
  for (const page of draft.pages ?? []) {
    if (page.slug.length > 0) known.add(`/${page.slug}`);
  }
  for (const project of draft.projects ?? []) known.add(`/work/${project.slug}`);
  // The old case-study addresses still answer — `/case-studies/<slug>` is a
  // permanent redirect to `/work/<slug>` — so a link written before the merge
  // is not reported as broken.
  for (const study of draft.caseStudies ?? []) known.add(`/case-studies/${study.slug}`);
  if (writingOn) {
    for (const entry of draft.writing ?? []) known.add(`/writing/${entry.slug}`);
  }

  return (
    <div className="grid gap-6" style={{ maxWidth: 'var(--measure)' }}>
      <div>
        <p className="m-0 font-mono text-xs uppercase tracking-widest text-text-muted">
          Navigation
        </p>
        <h1 className="font-display m-0 mt-1 text-3xl">Header Navigation</h1>
        <p className="m-0 mt-1 text-text-secondary">
          Links in the top navigation bar, in order. The logo always links to the homepage.
        </p>
      </div>

      <NavigationBuilder
        token={screenToken(draft, 'navLinks')}
        initialLinks={links}
        known={[...known].sort()}
      />
    </div>
  );
}
