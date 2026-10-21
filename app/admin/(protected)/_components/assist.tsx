'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import type { AssistTask } from '@/core/ai/prompts';

const AssistContext = createContext<{ text: boolean; alt: boolean }>({ text: false, alt: false });

/** Set once by the admin layout from the server: is a model connected? */
export function AssistProvider({
  value,
  children,
}: {
  value: { text: boolean; alt: boolean };
  children: ReactNode;
}) {
  return <AssistContext.Provider value={value}>{children}</AssistContext.Provider>;
}

const LABELS: Record<AssistTask, string> = {
  description: 'Suggest a description',
  summary: 'Suggest a summary',
  alt: 'Suggest alt text',
};

const secondary =
  'rounded-full border border-border px-3 text-sm text-text-secondary hover:text-text-primary disabled:opacity-50';

/**
 * "Suggest" beside a field, when the owner has connected their own model.
 *
 * Renders nothing otherwise, so an install without the assistant has no trace
 * of it. The answer is shown, never applied: "Use it" puts it in the field,
 * where it is as editable as anything typed, and the screen's Save is still
 * the only thing that keeps it.
 */
export function Suggest({
  task,
  source,
  onUse,
}: {
  task: AssistTask;
  /** Read when pressed, so it is the field's latest words. */
  source: () => { title?: string; text?: string; blocks?: unknown[]; imageUrl?: string };
  onUse: (text: string) => void;
}) {
  const available = useContext(AssistContext);
  const [busy, setBusy] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!(task === 'alt' ? available.alt : available.text)) return null;

  const ask = async () => {
    setBusy(true);
    setError(null);
    setSuggestion(null);
    try {
      const response = await fetch('/api/admin/assist', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ task, ...source() }),
      });
      const result = (await response.json().catch(() => null)) as {
        ok?: boolean;
        suggestion?: string;
        error?: string;
      } | null;
      if (result?.ok && result.suggestion) setSuggestion(result.suggestion);
      else setError(result?.error ?? 'The suggestion did not work.');
    } catch {
      setError('The suggestion did not work. Check your connection.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-2">
      <span>
        <button
          type="button"
          onClick={() => void ask()}
          disabled={busy}
          className={secondary}
          style={{ minHeight: 44 }}
        >
          {busy ? 'Asking your model…' : LABELS[task]}
        </button>
      </span>
      <div role="status" className="grid gap-2">
        {suggestion ? (
          <div className="grid gap-2 rounded-xl border border-border bg-surface-secondary p-3">
            <p className="m-0 text-sm text-text-primary">{suggestion}</p>
            <span className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  onUse(suggestion);
                  setSuggestion(null);
                }}
                className="rounded-full bg-text-primary px-3 text-sm font-semibold text-bg"
                style={{ minHeight: 44 }}
              >
                Use it
              </button>
              <button
                type="button"
                onClick={() => setSuggestion(null)}
                className={secondary}
                style={{ minHeight: 44 }}
              >
                Dismiss
              </button>
            </span>
          </div>
        ) : null}
        {error ? <p className="m-0 text-sm text-text-secondary">{error}</p> : null}
      </div>
    </div>
  );
}
