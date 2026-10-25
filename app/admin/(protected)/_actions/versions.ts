'use server';

import { getStorageAdapter } from '@/core/storage/registry';
import { requireOwner } from '@/core/auth/guard';
import { RevisionConflictError } from '@/core/storage/contract';
import { conflictMessage } from '@/core/content/changes';
import type { CMSState } from '@/cms/types/cms';
import { findVersion } from '@/core/content/versions';
import { draftMetadata, replaceDraftWriting, WritingPublishError } from '@/core/writing/records';

/**
 * Version restore, as a server action.
 *
 * Same semantics as the legacy client's `restoreVersion`: the snapshot loads
 * into the working draft (publish afterwards to make it live), while history,
 * activity and the inbox carry forward rather than rolling back. The inbox
 * especially belongs to the server — rolling it back would resurrect deleted
 * enquiries.
 *
 * Every export calls `requireOwner()` itself. Layout guards do not protect
 * server actions (publicly callable HTTP endpoints), and the route-guard AST
 * test now walks `_actions` too, so forgetting the check fails the build.
 */

export interface RestoreResult {
  ok: boolean;
  error?: string;
  conflict?: boolean;
}

export async function restoreVersionAction(
  versionId: string,
  expectedRevision: number
): Promise<RestoreResult> {
  await requireOwner();
  if (typeof versionId !== 'string' || !versionId) {
    return { ok: false, error: 'A version is required.' };
  }

  const adapter = await getStorageAdapter();
  const meta = await adapter.readSnapshotMeta('draft');
  if (!meta) return { ok: false, error: 'There is no draft to restore into yet.' };

  const published = await adapter.readSnapshotMeta('published');
  const target = await findVersion(adapter, versionId, published?.state ?? meta.state);
  if (!target?.snapshot) return { ok: false, error: 'That snapshot is gone.' };

  const restored = structuredClone(target.snapshot) as CMSState;
  restored.versions = [];
  restored.messages = meta.state.messages;
  restored.activityLogs = [
    {
      id: `act-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user: restored.settings?.fullName || 'Admin',
      action: 'Restored Version',
      details: `Restored the snapshot from ${new Date(target.timestamp).toLocaleString()}.`,
    },
    ...(meta.state.activityLogs ?? []),
  ].slice(0, 100);
  restored.status = 'draft';
  restored.lastSavedAt = new Date().toISOString();

  // Writing belongs in records now: materialise the version's writing into draft
  // records before the snapshot write, keeping the snapshot metadata-only.
  try {
    const draftEntries = await replaceDraftWriting(adapter.records, restored.writing ?? []);
    restored.writing = draftEntries.map((entry) => draftMetadata(entry));
  } catch (err) {
    if (err instanceof WritingPublishError) {
      return { ok: false, error: err.message };
    }
    console.error('[restoreVersion] Failed to replace draft writing records.', err);
    return {
      ok: false,
      error: 'The writing in that version could not be restored. Try again.',
    };
  }

  try {
    await adapter.writeSnapshot('draft', restored, expectedRevision);
    return { ok: true };
  } catch (err) {
    if (err instanceof RevisionConflictError) {
      // The draft moved between this screen's load and this click. Re-read for
      // the diff: what matters is what is stored *now*, not the read the
      // restore was built on.
      const fresh = await adapter.readSnapshotMeta('draft');
      return {
        ok: false,
        conflict: true,
        error: conflictMessage(err, fresh?.state ?? null, restored, 'Restoring'),
      };
    }
    throw err;
  }
}
