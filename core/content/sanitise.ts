import 'server-only';
import type { CMSState } from '@/cms/types/cms';

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
 */
export function publicView(state: CMSState): CMSState {
  const isLiveWriting = (entry: { status?: string; scheduledFor?: string }): boolean => {
    if (entry.status === 'published') return true;
    if (entry.status !== 'scheduled' || !entry.scheduledFor) return false;
    const due = Date.parse(entry.scheduledFor);
    return Number.isFinite(due) && due <= Date.now();
  };

  return {
    ...state,
    pages: (state.pages ?? []).filter((page) => page.status === 'published'),
    writing: (state.writing ?? []).filter(isLiveWriting),
    projects: (state.projects ?? []).filter((p) => p.status === 'published'),
    caseStudies: (state.caseStudies ?? []).filter((c) => c.status === 'published'),
    messages: [],
    versions: [],
    activityLogs: [],
  };
}
