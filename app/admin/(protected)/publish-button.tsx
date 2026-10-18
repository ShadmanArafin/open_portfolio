'use client';

import { useState } from 'react';
import { publishDraftAction } from './_actions/publish';
import { ConflictNotice } from './_components/conflict-notice';

/**
 * Publish now, as a button. The readiness math stays on the server; this only
 * carries the decision and its outcome — including the 422 contrast refusal,
 * which names the failing pair rather than failing silently.
 */
export function PublishButton({ expectedRevision }: { expectedRevision: number }) {
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [conflict, setConflict] = useState(false);

  const publish = async () => {
    if (busy) return;
    setBusy(true);
    setNote(null);
    setConflict(false);
    try {
      const result = await publishDraftAction(expectedRevision);
      if (result.ok) {
        setNote('Live. The cached pages were cleared with it.');
      } else {
        setConflict(Boolean(result.conflict));
        setNote(result.error ?? 'The publish did not go through.');
      }
    } catch {
      setNote('The publish did not go through. Reload and try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => void publish()}
        disabled={busy}
        className="rounded-full bg-text-primary px-4 text-sm font-semibold text-bg disabled:opacity-50"
        style={{ minHeight: 44 }}
      >
        {busy ? 'Publishing…' : 'Publish now'}
      </button>
      {note ? (
        conflict ? (
          <ConflictNotice message={note} />
        ) : (
          <span role="status" className="text-sm text-text-secondary">
            {note}
          </span>
        )
      ) : null}
    </span>
  );
}
