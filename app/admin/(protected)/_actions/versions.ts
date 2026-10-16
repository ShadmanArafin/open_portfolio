'use server';

import { getStorageAdapter } from '@/core/storage/registry';
import { requireOwner } from '@/core/auth/guard';
import { RevisionConflictError } from '@/core/storage/contract';
import type { CMSState } from '@/cms/types/cms';

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

  const target = (meta.state.versions ?? []).find((v) => v.id === versionId);
  if (!target?.snapshot) return { ok: false, error: 'That snapshot is gone.' };

  const restored = structuredClone(target.snapshot) as CMSState;
  restored.versions = meta.state.versions;
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

  try {
    await adapter.writeSnapshot('draft', restored, expectedRevision);
    return { ok: true };
  } catch (err) {
    if (err instanceof RevisionConflictError) {
      return {
        ok: false,
        conflict: true,
        error: 'This changed somewhere else while you were looking. Reload and try again.',
      };
    }
    throw err;
  }
}
