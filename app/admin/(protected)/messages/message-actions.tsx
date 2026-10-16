'use client';

import { useState } from 'react';
import { deleteMessageAction, markMessageAction } from '../_actions/messages';

/** Read/unread toggle. One button, one server action, no fetch boilerplate. */
export function ReadToggle({ id, status }: { id: string; status: string }) {
  const [busy, setBusy] = useState(false);
  const next = status === 'unread' ? 'read' : 'unread';
  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => {
        setBusy(true);
        markMessageAction(id, next).finally(() => setBusy(false));
      }}
      className="rounded-full border border-border px-4 text-sm text-text-secondary hover:text-text-primary disabled:opacity-50"
      style={{ minHeight: 44 }}
    >
      {status === 'unread' ? 'Mark as read' : 'Mark as unread'}
    </button>
  );
}

/** Delete with the confirmation inline: arm, then confirm. No modal, no `confirm()`. */
export function DeleteMessage({ id, name }: { id: string; name: string }) {
  const [armed, setArmed] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!armed) {
    return (
      <button
        type="button"
        onClick={() => setArmed(true)}
        className="rounded-full border border-border px-4 text-sm text-text-secondary hover:text-text-primary"
        style={{ minHeight: 44 }}
      >
        Delete
      </button>
    );
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <span role="alert" className="text-sm text-text-secondary">
        Delete the message from {name}?
      </span>
      <button
        type="button"
        disabled={busy}
        onClick={() => {
          setBusy(true);
          deleteMessageAction(id).finally(() => setBusy(false));
        }}
        className="rounded-full bg-danger px-4 text-sm font-semibold text-bg disabled:opacity-50"
        style={{ minHeight: 44 }}
      >
        {busy ? 'Deleting…' : 'Delete message'}
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={() => setArmed(false)}
        className="rounded-full border border-border px-4 text-sm text-text-secondary"
        style={{ minHeight: 44 }}
      >
        Keep
      </button>
    </span>
  );
}
