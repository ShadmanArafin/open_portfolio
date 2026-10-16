import type { Metadata } from 'next';
import { getStorageAdapter } from '@/core/storage/registry';
import { RestoreButton } from './restore-button';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Version history',
  robots: { index: false, follow: false },
};

/**
 * Every publish is snapshotted; restoring loads one back into the draft.
 *
 * Server-rendered list (newest first, reverse-`#N` numbering kept so existing
 * references still make sense), with one client island per row for the
 * two-step restore. The restore itself is a server action, guarded like every
 * other mutation.
 */

export default async function HistoryPage() {
  const meta = await (await getStorageAdapter()).readSnapshotMeta('draft');
  const versions = meta?.state.versions ?? [];
  const revision = meta?.revision ?? 0;

  return (
    <div className="grid gap-5" style={{ maxWidth: 'var(--measure)' }}>
      <div>
        <h1 className="font-display m-0 text-3xl">Version history ({versions.length})</h1>
        <p className="mt-1 text-text-secondary">
          Every publish is snapshotted. Restoring loads one back into your draft — publish again to
          make it live.
        </p>
      </div>

      {versions.length === 0 ? (
        <div role="status" className="rounded-2xl border border-border p-6 text-center">
          <p className="m-0 font-semibold">No snapshots yet</p>
          <p className="mt-1 text-sm text-text-secondary">
            A snapshot is taken each time you publish. The last 20 are kept.
          </p>
        </div>
      ) : (
        <ol className="m-0 grid list-none gap-3 p-0">
          {versions.map((ver, idx) => (
            <li
              key={ver.id}
              className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border border-border p-4"
            >
              <span
                aria-hidden
                className="rounded-full border border-border px-3 py-1 font-mono text-xs text-text-secondary"
              >
                #{versions.length - idx}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold">{ver.summary || ver.action}</span>
                <span className="block text-sm text-text-secondary">
                  {new Date(ver.timestamp).toLocaleString()} · {ver.editor}
                </span>
              </span>
              <RestoreButton versionId={ver.id} expectedRevision={revision} />
            </li>
          ))}
        </ol>
      )}

      <p className="text-sm text-text-secondary">
        History is capped at 20 snapshots so stored content cannot grow without bound.
      </p>
    </div>
  );
}
