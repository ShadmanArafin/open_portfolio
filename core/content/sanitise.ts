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
