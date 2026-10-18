import type { CMSState } from '@/cms/types/cms';

/**
 * Pure content comparisons, shared by the App Router admin.
 *
 * These lived as methods on the legacy client's `CMSService`; the new admin
 * reads state on the server and needs them without instantiating that class.
 * The legacy copies stay until the old shell is deleted (see
 * `docs/ADMIN-REWRITE.md`) — this module is the one that survives.
 */

/** Serialised content, minus everything that isn't editorial content. */
export function contentFingerprint(state: CMSState): string {
  const {
    status: _status,
    lastSavedAt: _lastSavedAt,
    lastPublishedAt: _lastPublishedAt,
    messages: _messages,
    versions: _versions,
    activityLogs: _activityLogs,
    ...content
  } = state;
  return JSON.stringify(content);
}

/** True when the draft's *content* differs from what's published. */
export function hasUnpublishedChanges(draft: CMSState, published: CMSState | null): boolean {
  if (!published) return true;
  return contentFingerprint(draft) !== contentFingerprint(published);
}

/**
 * The collections that differ between two states, in the admin's own words.
 *
 * `describeChanges` wraps this in a sentence for the publish button; the
 * History screen wants the parts on their own ("Restoring would change: pages
 * (+2), writing"), and the two should read the same way.
 */
export function changedParts(from: CMSState, to: CMSState): string[] {
  const parts: string[] = [];

  const countDiff = (key: keyof CMSState, label: string) => {
    // Missing counts as empty. Collections added later are optional on
    // `CMSState`, so the first page is a change from `undefined` — and
    // bailing out on that reported "no content changes" for the one publish
    // where something new appeared.
    const a = (from[key] ?? []) as unknown[];
    const b = (to[key] ?? []) as unknown[];
    if (!Array.isArray(a) || !Array.isArray(b)) return;
    if (JSON.stringify(a) !== JSON.stringify(b)) {
      const delta = b.length - a.length;
      const suffix = delta > 0 ? ` (+${delta})` : delta < 0 ? ` (${delta})` : '';
      parts.push(`${label}${suffix}`);
    }
  };

  const objDiff = (key: keyof CMSState, label: string) => {
    if (JSON.stringify(from[key]) !== JSON.stringify(to[key])) parts.push(label);
  };

  objDiff('settings', 'site settings');
  objDiff('microcopy', 'microcopy');
  objDiff('appearance', 'appearance');
  objDiff('seo', 'SEO');
  objDiff('newsletter', 'newsletter');
  objDiff('writingSettings', 'writing settings');
  countDiff('sections', 'sections');
  countDiff('pages', 'pages');
  countDiff('writing', 'writing');
  countDiff('projects', 'projects');
  countDiff('caseStudies', 'case studies');
  countDiff('brands', 'brands');
  countDiff('experience', 'experience');
  countDiff('education', 'education');
  countDiff('processSteps', 'process steps');
  countDiff('capabilityGroups', 'capabilities');
  countDiff('recommendations', 'recommendations');
  countDiff('artifacts', 'visual explorations');
  countDiff('socialLinks', 'social links');
  countDiff('navLinks', 'navigation');
  countDiff('media', 'media');

  return parts;
}

/** Plain-language summary of what changed, shown before publishing. */
export function describeChanges(from: CMSState, to: CMSState): string {
  const parts = changedParts(from, to);
  if (parts.length === 0) return 'No content changes.';
  return `Changed: ${parts.join(', ')}.`;
}

/**
 * What a refused conditional write says, including the diff there is to show.
 *
 * A conflict means the stored revision moved between the read that built a
 * write and the write itself, so nothing was written — say that first, because
 * it is the answer to the only urgent question ("did I lose my change?").
 * Then the revisions, then the one comparison actually available: what was
 * about to be written against what is stored now. The state *between* the two
 * revisions is not kept anywhere, so this is as precise as the answer gets —
 * and it is the same sentence `describeChanges` gives publishing.
 *
 * `fresh` may be null (the snapshot vanished under a conflict); the message
 * still explains itself without a diff.
 */
export function conflictMessage(
  err: { expected: number; current: number },
  fresh: CMSState | null,
  attempted: CMSState,
  verb: string
): string {
  const head =
    `Someone else saved first, so nothing was written. ` +
    `You had version ${err.expected}; the site is on ${err.current}.`;
  if (!fresh) return `${head} Reload to see the current version first.`;

  const parts = changedParts(fresh, attempted);
  if (parts.length === 0) {
    return `${head} What you were saving matches the site anyway, so reloading is enough.`;
  }
  return `${head} ${verb} would change: ${parts.join(', ')}. Reload to see the current version first.`;
}

function makeIdbUrl(mediaId: string): string {
  return `idb:${mediaId}`;
}

/** How many places in the content tree reference a given media item. */
export function countMediaUsage(state: CMSState, mediaId: string): number {
  // Match on the URL actually written into content. Uploads now carry
  // `/api/media/<key>`; anything from before still carries `idb:<id>`.
  const item = state.media.find((m) => m.id === mediaId);
  const needle = item?.url ?? makeIdbUrl(mediaId);
  const haystack = JSON.stringify({ ...state, media: [], versions: [] });
  return haystack.split(`"${needle}"`).length - 1;
}
