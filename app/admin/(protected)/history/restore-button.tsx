'use client';

import { useState } from 'react';
import { restoreVersionAction } from '../_actions/versions';
import { ConflictNotice } from '../_components/conflict-notice';

/**
 * Restore with the confirmation inline, not in a modal.
 *
 * Two buttons, one after the other: "Restore" arms ("Restore this snapshot?"
 * + confirm/cancel), and only the armed confirm calls the server action. No
 * dialog library, no focus trap to get wrong, no `window.confirm` (banned
 * repo-wide) — and the whole thing is server-action driven, so there is no
 * fetch boilerplate to drift from the action's contract.
 */
export function RestoreButton({
  versionId,
  expectedRevision,
}: {
  versionId: string;
  expectedRevision: number;
}) {
  const [armed, setArmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [conflict, setConflict] = useState(false);
  const [done, setDone] = useState(false);

  const confirm = async () => {
    setBusy(true);
    setNote(null);
    setConflict(false);
    try {
      const result = await restoreVersionAction(versionId, expectedRevision);
      if (result.ok) {
        setDone(true);
        setArmed(false);
        setNote('Restored into your draft — publish to make it live.');
      } else {
        setConflict(Boolean(result.conflict));
        setNote(result.error ?? 'The restore did not go through.');
      }
    } catch {
      setNote('The restore did not go through. Reload and try again.');
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <span role="status" className="text-sm font-semibold text-text-primary">
        Restored
      </span>
    );
  }

  if (!armed) {
    return (
      <button
        type="button"
        onClick={() => setArmed(true)}
        className="rounded-full border border-border px-4 text-sm text-text-secondary hover:text-text-primary"
        style={{ minHeight: 44 }}
      >
        Restore
      </button>
    );
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <span role="alert" className="text-sm text-text-secondary">
        Load this into your draft?
      </span>
      <button
        type="button"
        onClick={() => void confirm()}
        disabled={busy}
        className="rounded-full bg-text-primary px-4 text-sm text-bg disabled:opacity-50"
        style={{ minHeight: 44 }}
      >
        {busy ? 'Restoring…' : 'Restore snapshot'}
      </button>
      <button
        type="button"
        onClick={() => {
          setArmed(false);
          setNote(null);
        }}
        disabled={busy}
        className="rounded-full border border-border px-4 text-sm text-text-secondary"
        style={{ minHeight: 44 }}
      >
        Keep current
      </button>
      {note ? (
        conflict ? (
          <ConflictNotice message={note} />
        ) : (
          <span role="status" className="w-full text-sm text-text-secondary">
            {note}
          </span>
        )
      ) : null}
    </span>
  );
}
