import 'server-only';
import type { CMSState } from '@/cms/types/cms';
import { mergeWork } from './work';
import { isPageLive } from '@/core/pages/schema';

/**
 * Takes the contact inbox out of a content document before it is published.
 *
 * The published snapshot is read by the site layout and handed to a client
 * component, so it is serialised into the HTML of every public page. Anything
 * an enquirer wrote — their name, their address, their message — is published
 * to strangers if it is still in there.
 *
 * Clearing the top-level `messages` is not enough, because each entry in
 * `versions` carries a whole content document of its own. The editor already
 * empties the inbox when it takes a version, but this runs on the server side
 * of an HTTP boundary and the shape arriving over it is the client's claim, not
 * a fact. Nested history goes with it: a version snapshot is content only, and
 * an accepted chain of snapshots-inside-snapshots is unbounded input.
 */
export function withoutEnquiries(state: CMSState): CMSState {
  return {
    ...state,
    messages: [],
    versions: (state.versions ?? []).map((version) => ({
      ...version,
      snapshot: { ...version.snapshot, messages: [], versions: [] },
    })),
  };
}

/**
 * What a visitor is allowed to receive.
 *
 * The site layout hands the whole content document to the client so the navbar,
 * footer and themed sections can render — and the whole document was being
 * serialised into the HTML of every public page. That included **drafts**:
 * unpublished pages and unfinished writing, with their titles, summaries and
 * full block content, readable by anyone who pressed view-source.
 *
 * Nothing rendered them, which is exactly why it went unnoticed. The page
 * looked correct.
 *
 * So the public view is cut down to what is already visible. Version history
 * and activity logs go too — they carry old copies of content that may since
 * have been deliberately removed, which is a subtler version of the same leak.
 *
 * The work merge happens here too. `projects` and `caseStudies` were two
 * collections for one idea, and the client that renders the work list read only
 * the first — so a case study whose page still worked was missing from the list
 * that was meant to show it. Folding them into one array here means every
 * client consumer sees the same records, and `caseStudies` is emptied so
 * nothing can read a stale second copy.
 */
export function publicView(state: CMSState, now: Date = new Date()): CMSState {
  const isLiveWriting = (entry: { status?: string; scheduledFor?: string }): boolean => {
    if (entry.status === 'published') return true;
    if (entry.status !== 'scheduled' || !entry.scheduledFor) return false;
    const due = Date.parse(entry.scheduledFor);
    return Number.isFinite(due) && due <= now.getTime();
  };

  const projects = mergeWork(
    (state.projects ?? []).filter((p) => p.status === 'published'),
    (state.caseStudies ?? []).filter((c) => c.status === 'published')
  ).sort((a, b) => a.sortOrder - b.sortOrder);

  return {
    ...state,
    pages: (state.pages ?? []).filter((page) => isPageLive(page, now)),
    writing: (state.writing ?? []).filter(isLiveWriting),
    projects,
    caseStudies: [],
    messages: [],
    versions: [],
    activityLogs: [],
  };
}

/**
 * What the client-side theme components need, and nothing more.
 *
 * `publicView` decides what a visitor is *allowed* to see; this decides what
 * is worth *sending*. The layout hands its result to a client provider, so it
 * is serialised into every public page — and before this, that meant every
 * published page's blocks, every piece of writing in full and every project's
 * story went out with every request, `/contact` included. A writer with two
 * hundred posts shipped all two hundred on each page view.
 *
 * Those three are rendered on the server (the block pages, the writing routes,
 * and project stories via `app/(site)/work/[slug]/page.tsx`), so the client
 * copy carries none of them. Pages keep their address, title and menu entry,
 * which is what the navbar builds the menu from. The media library is not
 * sent at all: image sizes are picked on the server (`CMSImage`), and a
 * client island gets its images' `srcset` as props. And every list the server components now render
 * (projects, brands, experience and the rest) is left out: what is still
 * read in the browser is settings, wording, the menu, the sections' headers
 * and the newsletter's wording.
 */
export function clientView(state: CMSState, now: Date = new Date()): CMSState {
  const visible = publicView(state, now);
  return {
    ...visible,
    pages: (visible.pages ?? []).map((page) => ({ ...page, blocks: [] })),
    writing: [],
    // Image sizes are chosen on the server (`CMSImage`, `srcSetsFor`), so the
    // browser needs none of the library.
    media: [],
    // Rendered by server components since the theme moved off the client
    // (2026-10-23): the home sections, the footer, About and Work. A client
    // island that needs a list (the Work filter, the About gallery) gets it
    // as props from its server parent, cut to what it shows.
    projects: [],
    brands: [],
    experience: [],
    education: [],
    processSteps: [],
    capabilityGroups: [],
    recommendations: [],
    artifacts: [],
    socialLinks: [],
  };
}
