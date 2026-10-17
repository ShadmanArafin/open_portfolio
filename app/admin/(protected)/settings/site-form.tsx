'use client';

import { useState } from 'react';
import { updateSiteSettingsAction } from '../_actions/settings';

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
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  span = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  span?: boolean;
}) {
  return (
    <label className={`grid gap-1 text-sm ${span ? 'sm:col-span-2' : ''}`}>
      <span className="font-semibold">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-xl border border-border bg-surface-primary px-3 text-text-primary"
        style={{ minHeight: 44 }}
      />
    </label>
  );
}

/**
 * Identity, contact details and the About story — one save per card row of
 * fields, the newsletter form's pattern: local state, explicit Save, the
 * server action writes the draft revision-checked.
 */
export function SiteForm({ initial }: { initial: SiteFormValues }) {
  const [form, setForm] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const set = (field: keyof SiteFormValues, value: string) =>
    setForm((current) => ({ ...current, [field]: value }));

  const save = async () => {
    setBusy(true);
    setNote(null);
    setError(null);
    try {
      const result = await updateSiteSettingsAction({
        fullName: form.fullName,
        role: form.role,
        location: form.location,
        email: form.email,
        whatsappNumber: form.whatsappNumber,
        whatsappFormatted: form.whatsappFormatted,
        whatsappUrl: form.whatsappUrl,
        availabilityStatus: form.availabilityStatus,
        aboutHeading: form.aboutHeading,
        aboutStoryParagraphs: form.aboutStory
          .split(/\n\s*\n/)
          .filter((paragraph) => paragraph.trim() !== ''),
      });
      if (result.ok) setNote('Saved to your draft.');
      else setError(result.error ?? 'The save did not go through.');
    } catch {
      setError('The save did not go through. Reload and try again.');
    } finally {
      setBusy(false);
    }
  };

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
    </div>
  );
}
