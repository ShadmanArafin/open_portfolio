import 'server-only';
import type { CMSState, ContactMessage } from '@/cms/types/cms';

/**
 * Moves enquiries out of the content snapshot and into the messages surface.
 *
 * Runs from `provision()`, which the registry performs once per process in
 * front of the first use of the backend — so an instance that was claimed
 * before this upgrade migrates on its next cold start rather than never.
 * Guarded on the destination being empty, and every backend's `append` ignores
 * a duplicate id, so several instances starting at once cannot produce
 * duplicates between them.
 */
export interface MigrationDeps {
  readSnapshot: (channel: 'published' | 'draft') => Promise<CMSState | null>;
  writeSnapshot: (channel: 'published' | 'draft', state: CMSState) => Promise<void>;
  listMessages: () => Promise<ContactMessage[]>;
  appendMessage: (message: ContactMessage) => Promise<void>;
}

export async function migrateSnapshotMessages(deps: MigrationDeps): Promise<number> {
  const existing = await deps.listMessages();
  if (existing.length > 0) return 0;

  let moved = 0;
  for (const channel of ['published', 'draft'] as const) {
    const snapshot = await deps.readSnapshot(channel);
    const carried = snapshot?.messages ?? [];
    if (!snapshot || carried.length === 0) continue;

    for (const message of carried) {
      await deps.appendMessage(message);
      moved += 1;
    }
    await deps.writeSnapshot(channel, { ...snapshot, messages: [] });
  }

  return moved;
}
