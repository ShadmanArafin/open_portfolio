'use client';

import { useState } from 'react';
import { removeSubscriberAction, updateNewsletterSettingsAction } from '../_actions/newsletter';
import { ConflictNotice } from '../_components/conflict-notice';
import { useSaveShortcut, useUnsavedChanges } from '../_components/unsaved-changes';
import { UnsavedNote } from '../_components/unsaved-note';

export interface NewsletterFormSettings {
  enabled: boolean;
  pitch: string;
  buttonLabel: string;
  pendingMessage: string;
}

/** The form copy. Local state + one save; the list below it never waits on it. */
export function NewsletterForm({
  initial,
  token: initialToken,
}: {
  initial: NewsletterFormSettings;
  token?: string;
}) {
  const [form, setForm] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [conflict, setConflict] = useState<string | null>(null);
  const [token, setToken] = useState(initialToken);
  const { dirty, markSaved } = useUnsavedChanges(form);

  const save = async () => {
    setBusy(true);
    setNote(null);
    setConflict(null);
    try {
      const result = await updateNewsletterSettingsAction(form, token);
      if (result.ok) {
        markSaved(form);
        if (result.token) setToken(result.token);
        setNote('Saved to your draft.');
      } else if (result.conflict) {
        setConflict(result.error ?? 'The save did not go through.');
      } else {
        setNote(result.error ?? 'The save did not go through.');
      }
    } catch {
      setNote('The save did not go through. Reload and try again.');
    } finally {
      setBusy(false);
    }
  };

  useSaveShortcut(() => void save(), !busy);

  return (
    <div className="grid gap-3">
      <label className="flex min-h-[44px] cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          checked={form.enabled}
          onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
          className="h-5 w-5"
        />
        <span className="font-semibold">
          Ask visitors for their email address
          <span className="block text-sm font-normal text-text-secondary">
            Off by default. An empty newsletter box is a promise nobody kept.
          </span>
        </span>
      </label>
      <label className="grid gap-1 text-sm">
        <span className="font-semibold">What are you offering?</span>
        <input
          type="text"
          value={form.pitch}
          onChange={(e) => setForm({ ...form, pitch: e.target.value })}
          className="rounded-xl border border-border bg-surface-primary px-3 text-text-primary"
          style={{ minHeight: 44 }}
        />
        <span className="text-text-secondary">
          One line, above the box. “Occasional notes about what I&apos;m making” beats “Subscribe to
          my newsletter”.
        </span>
      </label>
      <label className="grid gap-1 text-sm">
        <span className="font-semibold">Button</span>
        <input
          type="text"
          value={form.buttonLabel}
          onChange={(e) => setForm({ ...form, buttonLabel: e.target.value })}
          className="rounded-xl border border-border bg-surface-primary px-3 text-text-primary"
          style={{ minHeight: 44 }}
        />
      </label>
      <label className="grid gap-1 text-sm">
        <span className="font-semibold">What they see after signing up</span>
        <input
          type="text"
          value={form.pendingMessage}
          onChange={(e) => setForm({ ...form, pendingMessage: e.target.value })}
          className="rounded-xl border border-border bg-surface-primary px-3 text-text-primary"
          style={{ minHeight: 44 }}
        />
        <span className="text-text-secondary">
          They are not subscribed yet at this point — they have to click a link in an email first.
          Say so, or people think they are done.
        </span>
      </label>
      <span className="inline-flex items-center gap-2">
        <button
          type="button"
          onClick={() => void save()}
          disabled={busy}
          className="rounded-full bg-text-primary px-4 text-sm font-semibold text-bg disabled:opacity-50"
          style={{ minHeight: 44 }}
        >
          {busy ? 'Saving…' : 'Save form'}
        </button>
        <UnsavedNote dirty={dirty} />
        {note ? (
          <span role="status" className="text-sm text-text-secondary">
            {note}
          </span>
        ) : null}
      </span>
      {conflict ? (
        <span className="flex flex-wrap items-center gap-3">
          <ConflictNotice message={conflict} />
        </span>
      ) : null}
    </div>
  );
}

/** Remove with the confirmation inline: arm, then confirm. */
export function RemoveSubscriber({ id, email }: { id: string; email: string }) {
  const [armed, setArmed] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!armed) {
    return (
      <button
        type="button"
        onClick={() => setArmed(true)}
        className="rounded-full border border-border px-4 text-sm text-text-secondary"
        style={{ minHeight: 44 }}
      >
        Remove
      </button>
    );
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <span role="alert" className="text-sm text-text-secondary">
        Remove {email}?
      </span>
      <button
        type="button"
        disabled={busy}
        onClick={() => {
          setBusy(true);
          removeSubscriberAction(id).finally(() => setBusy(false));
        }}
        className="rounded-full bg-danger px-4 text-sm font-semibold text-bg disabled:opacity-50"
        style={{ minHeight: 44 }}
      >
        {busy ? 'Removing…' : 'Remove'}
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
