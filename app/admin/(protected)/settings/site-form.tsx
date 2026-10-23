'use client';

import { useId, useState } from 'react';
import { updateSiteSettingsAction } from '../_actions/settings';
import { ConflictNotice } from '../_components/conflict-notice';
import { useSaveShortcut, useUnsavedChanges } from '../_components/unsaved-changes';
import { UnsavedNote } from '../_components/unsaved-note';

export interface SiteFormValues {
  fullName: string;
  role: string;
  location: string;
  email: string;
  whatsappNumber: string;
  whatsappFormatted: string;
  whatsappUrl: string;
  availabilityStatus: string;
  aboutHeading: string;
  aboutStory: string;
  language: string;
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  span = false,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  span?: boolean;
  hint?: string;
}) {
  const hintId = useId();
  return (
    <label className={`grid gap-1 text-sm ${span ? 'sm:col-span-2' : ''}`}>
      <span className="font-semibold">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-describedby={hint ? hintId : undefined}
        className="rounded-xl border border-border bg-surface-primary px-3 text-text-primary"
        style={{ minHeight: 44 }}
      />
      {hint ? (
        <span id={hintId} className="text-text-secondary">
          {hint}
        </span>
      ) : null}
    </label>
  );
}

/**
 * Identity, contact details and the About story — one save per card row of
 * fields, the newsletter form's pattern: local state, explicit Save, the
 * server action writes the draft revision-checked.
 */
export function SiteForm({
  initial,
  token: initialToken,
}: {
  initial: SiteFormValues;
  token?: string;
}) {
  const [form, setForm] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [conflict, setConflict] = useState(false);
  const [token, setToken] = useState(initialToken);
  const { dirty, markSaved } = useUnsavedChanges(form);

  const set = (field: keyof SiteFormValues, value: string) =>
    setForm((current) => ({ ...current, [field]: value }));

  const save = async () => {
    setBusy(true);
    setNote(null);
    setError(null);
    setConflict(false);
    try {
      const result = await updateSiteSettingsAction(
        {
          fullName: form.fullName,
          role: form.role,
          location: form.location,
          email: form.email,
          whatsappNumber: form.whatsappNumber,
          whatsappFormatted: form.whatsappFormatted,
          whatsappUrl: form.whatsappUrl,
          availabilityStatus: form.availabilityStatus,
          aboutHeading: form.aboutHeading,
          language: form.language,
          aboutStoryParagraphs: form.aboutStory
            .split(/\n\s*\n/)
            .filter((paragraph) => paragraph.trim() !== ''),
        },
        token
      );
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
    <div className="grid gap-6">
      <section
        aria-label="Identity & contact"
        className="grid gap-4 rounded-2xl border border-border p-4"
      >
        <h2 className="m-0 text-xl">Identity &amp; contact</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" value={form.fullName} onChange={(v) => set('fullName', v)} />
          <Field label="Role / title" value={form.role} onChange={(v) => set('role', v)} />
          <Field label="Location" value={form.location} onChange={(v) => set('location', v)} />
          <Field label="Email" type="email" value={form.email} onChange={(v) => set('email', v)} />
          <Field
            label="WhatsApp number"
            value={form.whatsappNumber}
            onChange={(v) => set('whatsappNumber', v)}
          />
          <Field
            label="WhatsApp display format"
            value={form.whatsappFormatted}
            onChange={(v) => set('whatsappFormatted', v)}
          />
          <Field
            label="WhatsApp link"
            span
            value={form.whatsappUrl}
            onChange={(v) => set('whatsappUrl', v)}
          />
          <Field
            label="Availability status"
            span
            value={form.availabilityStatus}
            onChange={(v) => set('availabilityStatus', v)}
          />
          <Field
            label="Site language"
            span
            value={form.language}
            onChange={(v) => set('language', v)}
            hint="The language your site is written in, as a short code: en, bn, es, pt-BR. Screen readers use it to pick a voice. Leave empty for English."
          />
        </div>
      </section>

      <section aria-label="About story" className="grid gap-4 rounded-2xl border border-border p-4">
        <h2 className="m-0 text-xl">About story</h2>
        <Field
          label="About headline"
          value={form.aboutHeading}
          onChange={(v) => set('aboutHeading', v)}
        />
        <label className="grid gap-1 text-sm">
          <span className="font-semibold">About paragraphs</span>
          <textarea
            rows={6}
            value={form.aboutStory}
            onChange={(event) => set('aboutStory', event.target.value)}
            className="rounded-xl border border-border bg-surface-primary px-3 py-2 text-text-primary"
          />
          <span className="text-text-secondary">Leave a blank line between paragraphs.</span>
        </label>
      </section>

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
    </div>
  );
}
