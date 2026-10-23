'use client';

import { useState } from 'react';
import { updateSeoAction } from '../_actions/settings';
import { ConflictNotice } from '../_components/conflict-notice';
import { useSaveShortcut, useUnsavedChanges } from '../_components/unsaved-changes';
import { UnsavedNote } from '../_components/unsaved-note';

export interface SeoFormValues {
  siteTitle: string;
  titleTemplate: string;
  metaDescription: string;
  canonicalUrl: string;
  ogImage: string;
  author: string;
  robots: string;
}

const field = 'w-full rounded-xl border border-border bg-surface-primary px-3 text-text-primary';

function Field({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
}) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="font-semibold">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={field}
        style={{ minHeight: 44 }}
      />
      {hint ? <span className="text-text-secondary">{hint}</span> : null}
    </label>
  );
}

export function SeoForm({
  initial,
  token: initialToken,
}: {
  initial: SeoFormValues;
  token?: string;
}) {
  const [form, setForm] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [conflict, setConflict] = useState(false);
  const [token, setToken] = useState(initialToken);
  const { dirty, markSaved } = useUnsavedChanges(form);

  const set = (key: keyof SeoFormValues, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const save = async () => {
    setBusy(true);
    setNote(null);
    setError(null);
    setConflict(false);
    try {
      const result = await updateSeoAction({ ...form }, token);
      if (result.ok) {
        markSaved(form);
        if (result.token) setToken(result.token);
        setNote('Saved to your draft.');
      } else {
        setConflict(Boolean(result.conflict));
        setError(result.error ?? 'The save did not go through.');
      }
    } catch {
      setError('The save did not go through. Reload and try again.');
    } finally {
      setBusy(false);
    }
  };

  useSaveShortcut(() => void save(), !busy);
  return (
    <section
      aria-label="Search engine listing"
      className="grid gap-4 rounded-2xl border border-border p-4"
    >
      <h2 className="m-0 text-xl">Search engine listing</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Site title" value={form.siteTitle} onChange={(v) => set('siteTitle', v)} />
        <Field
          label="Title template"
          value={form.titleTemplate}
          onChange={(v) => set('titleTemplate', v)}
          hint="%s is replaced by the page name."
        />
      </div>

      <label className="grid gap-1 text-sm">
        <span className="font-semibold">Meta description</span>
        <textarea
          rows={3}
          value={form.metaDescription}
          onChange={(event) => set('metaDescription', event.target.value)}
          className={`${field} py-2`}
        />
        <span className="text-text-secondary">
          {form.metaDescription.length} characters. Search engines usually show around 155.
        </span>
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Canonical URL"
          value={form.canonicalUrl}
          onChange={(v) => set('canonicalUrl', v)}
        />
        <Field
          label="Share image"
          value={form.ogImage}
          onChange={(v) => set('ogImage', v)}
          hint="Shown when a link to your site is posted."
        />
        <Field label="Author" value={form.author} onChange={(v) => set('author', v)} />
        <Field
          label="Robots"
          value={form.robots}
          onChange={(v) => set('robots', v)}
          hint="Use “noindex, nofollow” to hide the site from search engines."
        />
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
        <UnsavedNote dirty={dirty} />
        {note ? (
          <p role="status" className="m-0 text-sm text-text-secondary">
            {note}
          </p>
        ) : null}
        {error ? (
          conflict ? (
            <ConflictNotice message={error} />
          ) : (
            <p role="alert" className="m-0 text-sm text-danger">
              {error}
            </p>
          )
        ) : null}
      </div>
    </section>
  );
}
