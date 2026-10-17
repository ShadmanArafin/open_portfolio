'use client';

import { useState } from 'react';
import { updateMicrocopyAction } from '../_actions/settings';

/** Turn a camelCase key into a readable label. */
function humanise(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}

/**
 * The searchable list of small strings.
 *
 * Edits are local until Save: several strings usually get reworded together,
 * and one draft write per keystroke would turn every letter into a revision.
 * The server action only writes keys the content already has, so a stale tab
 * cannot add fields.
 */
export function MicrocopyForm({ initial }: { initial: Record<string, string> }) {
  const [values, setValues] = useState(initial);
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const q = query.trim().toLowerCase();
  const all = Object.entries(values);
  const entries = q
    ? all.filter(([key, value]) => key.toLowerCase().includes(q) || value.toLowerCase().includes(q))
    : all;

  const save = async () => {
    setBusy(true);
    setNote(null);
    setError(null);
    try {
      const result = await updateMicrocopyAction(values);
      if (result.ok) setNote('Saved to your draft.');
      else setError(result.error ?? 'The save did not go through.');
    } catch {
      setError('The save did not go through. Reload and try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section aria-label="Microcopy" className="grid gap-4 rounded-2xl border border-border p-4">
      <label className="grid gap-1 text-sm">
        <span className="font-semibold">Search labels and text</span>
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search labels and text…"
          className="rounded-xl border border-border bg-surface-primary px-3 text-text-primary"
          style={{ minHeight: 44 }}
        />
      </label>

      <p className="m-0 text-xs text-text-muted">
        {entries.length} of {all.length} strings
      </p>

      <div className="grid gap-3">
        {entries.map(([key, value]) => (
          <div
            key={key}
            className="grid grid-cols-1 gap-2 sm:grid-cols-[220px_1fr] sm:items-center sm:gap-4"
          >
            <label htmlFor={`mc-${key}`} className="text-xs text-text-muted">
              {humanise(key)}
            </label>
            <input
              id={`mc-${key}`}
              type="text"
              value={value}
              onChange={(event) =>
                setValues((current) => ({ ...current, [key]: event.target.value }))
              }
              className="rounded-xl border border-border bg-surface-primary px-3 text-text-primary"
              style={{ minHeight: 44 }}
            />
          </div>
        ))}

        {entries.length === 0 ? (
          <p className="m-0 text-sm text-text-secondary">No strings match “{query}”.</p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void save()}
          disabled={busy}
          className="rounded-full bg-text-primary px-4 text-sm font-semibold text-bg disabled:opacity-50"
          style={{ minHeight: 44 }}
        >
          {busy ? 'Saving…' : 'Save'}
        </button>
        {note ? (
          <p role="status" className="m-0 text-sm text-text-secondary">
            {note}
          </p>
        ) : null}
        {error ? (
          <p role="alert" className="m-0 text-sm text-danger">
            {error}
          </p>
        ) : null}
      </div>
    </section>
  );
}
