'use server';

import { revalidatePath, updateTag } from 'next/cache';
import { PUBLISHED_TAG } from '@/core/content/read';
import { getStorageAdapter } from '@/core/storage/registry';
import { requireOwner } from '@/core/auth/guard';
import { withoutEnquiries } from '@/core/content/sanitise';
import { auditContrast, describeFailure } from '@/core/theme/audit';
import { flattenAppearance } from '@/core/theme/resolve';
import { looksLikeContent } from '@/core/content/validate';
import { RevisionConflictError } from '@/core/storage/contract';
import { conflictMessage, describeChanges } from '@/core/content/changes';
import type { CMSState, ContentVersion } from '@/cms/types/cms';
import type { WritingEntry } from '@/core/writing/schema';
import { readDraftForWrite } from '@/core/content/draft';
import { recordVersion } from '@/core/content/versions';
import {
  draftMetadata,
  ensureDraftWritingRecords,
  preparePublishedWriting,
  WritingPublishError,
} from '@/core/writing/records';

export interface PublishResult {
  ok: boolean;
  error?: string;
  conflict?: boolean;
}

/**
 * Publishing, as a server action.
 *
 * Same boundary as `POST /api/admin/publish`: contrast-gated (422 on an
 * unreadable palette — advice lives in the dashboard, enforcement lives
 * here), enquiries stripped before anything is written, one snapshot per
 * publish capped at 20, activity capped at 100, cached renders dropped so the
 * change is live immediately.
 *
 * Reads the draft on the server rather than trusting client-sent content —
 * the one thing the action shape improves over the route it mirrors.
 */
export async function publishDraftAction(expectedRevision?: number): Promise<PublishResult> {
  await requireOwner();

  const adapter = await getStorageAdapter();
  // A site nobody has edited yet publishes what it is already showing.
  const draftMeta = await readDraftForWrite(adapter);
  if (!looksLikeContent(draftMeta.state)) {
    return { ok: false, error: 'That does not look like site content.' };
  }

  const draft = draftMeta.state as CMSState;
  const publishedMeta = await adapter.readSnapshotMeta('published');

  const contrast = auditContrast(flattenAppearance(draft.appearance));
  if (!contrast.passes) {
    return { ok: false, error: describeFailure(contrast.failures[0]) };
  }

  const now = new Date().toISOString();
  const nextPublished = structuredClone(draft) as CMSState;
  nextPublished.status = 'published';
  nextPublished.lastPublishedAt = now;

  // Writing bodies go to their own records before the snapshot names them. A
  // snapshot written first would point at nothing for as long as the next write
  // takes, and a failure after it would leave the site with blank articles.
  // `ensureDraftWritingRecords` runs first so the draft follow below can be
  // metadata-only without dropping a legacy draft's body.
  let draftEntries: WritingEntry[];
  try {
    draftEntries = await ensureDraftWritingRecords(adapter.records, draft);
    nextPublished.writing = await preparePublishedWriting(adapter.records, draft);
  } catch (err) {
    if (err instanceof WritingPublishError) return { ok: false, error: err.message };
    if (err instanceof RevisionConflictError) {
      return {
        ok: false,
        conflict: true,
        error:
          'A draft post was updated in another session while publishing. Reload and try again.',
      };
    }
    console.error('[publish] Writing bodies could not be stored, so nothing was published.', err);
    return {
      ok: false,
      error:
        'The writing could not be stored, so nothing was published. Try again, and check the ' +
        "site's storage if this keeps happening.",
    };
  }

  // A snapshot holds content only. History, activity and the inbox stay out:
  // each version nesting the last roughly doubled stored size, and a version
  // holding the inbox would publish other people's names and addresses into
  // the HTML of every public page.
  const snapshot = structuredClone(nextPublished) as CMSState;
  snapshot.versions = [];
  snapshot.activityLogs = [];
  snapshot.messages = [];

  const summary = publishSummary(publishedMeta?.state as CMSState | undefined, nextPublished);
  const version: ContentVersion = {
    id: `v-${Date.now()}`,
    timestamp: now,
    editor: nextPublished.settings?.fullName || 'Admin',
    action: 'Published Site Changes',
    summary,
    snapshot,
  };

  // History is its own records now (`core/content/versions`), not nested in
  // the document every page render reads. Recorded once the publish lands.
  const legacyVersions = (publishedMeta?.state as CMSState | undefined)?.versions ?? [];
  nextPublished.versions = [];
  nextPublished.activityLogs = [
    {
      id: `act-${Date.now()}`,
      timestamp: now,
      user: nextPublished.settings?.fullName || 'Admin',
      action: 'Published Changes',
      details: summary,
    },
    ...((publishedMeta?.state as CMSState | undefined)?.activityLogs ?? []),
  ].slice(0, 100);

  const merged = withoutEnquiries(nextPublished);

  try {
    await adapter.writeSnapshot('published', merged, expectedRevision);
  } catch (err) {
    if (err instanceof RevisionConflictError) {
      // Another publish landed between this dashboard's load and this click.
      // Re-read the live snapshot for the diff: what is about to go out,
      // against what is out now.
      const fresh = await adapter.readSnapshotMeta('published');
      return {
        ok: false,
        conflict: true,
        error: conflictMessage(err, fresh?.state ?? null, merged, 'Publishing'),
      };
    }
    throw err;
  }

  // The draft follows the publish, so the next save is a change, not a copy.
  // Its writing list stays the *draft* list - including pieces that are not
  // published - because publishing must not quietly remove an unfinished piece
  // from the screen. Bodies stay in their records; the snapshot carries
  // metadata only.
  try {
    const draftFollow = structuredClone(merged) as CMSState;
    draftFollow.writing = draftEntries.map((entry) => draftMetadata(entry));
    await adapter.writeSnapshot('draft', draftFollow);
  } catch {
    /* The publish landed; a stale draft is a reload, not a failure. */
  }

  try {
    await recordVersion(adapter, version, legacyVersions);
  } catch (err) {
    console.error('[publish] Published, but the snapshot for History was not stored.', err);
  }

  // Read-your-writes: the owner's next look at the site waits for the new
  // content rather than being served the cached copy once more.
  updateTag(PUBLISHED_TAG);
  revalidatePath('/', 'layout');
  return { ok: true };
}

function publishSummary(from: CMSState | undefined, to: CMSState): string {
  if (!from) return 'First publish.';
  return describeChanges(from, to);
}
