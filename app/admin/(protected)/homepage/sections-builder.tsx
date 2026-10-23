'use client';

import { useState } from 'react';
import type { SectionConfig } from '@/cms/types/cms';
import { anchorProblem, moveBand, splitSections, withBandOrders } from '@/core/content/sections';
import { updateHomepageAction } from '../_actions/homepage';
import { ConflictNotice } from '../_components/conflict-notice';
import { useSaveShortcut, useUnsavedChanges } from '../_components/unsaved-changes';
import { UnsavedNote } from '../_components/unsaved-note';

const field = 'w-full rounded-xl border border-border bg-surface-primary px-3 text-text-primary';
const secondary =
  'rounded-full border border-border px-3 text-sm text-text-secondary hover:text-text-primary disabled:opacity-50';

function Field({
  label,
  value,
  onChange,
  hint,
  problem,
  rows,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  problem?: string | null;
  rows?: number;
}) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="font-semibold">{label}</span>
      {rows ? (
        <textarea
          rows={rows}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`${field} py-2`}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={field}
          style={{ minHeight: 44 }}
        />
      )}
      {problem ? <span className="text-danger">{problem}</span> : null}
      {hint && !problem ? <span className="text-text-secondary">{hint}</span> : null}
    </label>
  );
}

function VisibleToggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <label className="flex min-h-[44px] cursor-pointer items-center gap-2 text-sm">
      <input type="checkbox" checked={checked} onChange={onChange} className="h-5 w-5" />
      <span className="text-text-secondary">{checked ? 'Visible' : 'Hidden'}</span>
    </label>
  );
}

export function SectionsBuilder({
  initial,
  token: initialToken,
}: {
  initial: SectionConfig[];
  token?: string;
}) {
  const [sections, setSections] = useState<SectionConfig[]>(initial);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [conflict, setConflict] = useState(false);
  const [token, setToken] = useState(initialToken);
  const { dirty, markSaved } = useUnsavedChanges(sections);

  const { bands, headers } = splitSections(sections);

  const setField = (id: string, key: keyof SectionConfig, value: string) =>
    setSections((list) => list.map((s) => (s.id === id ? { ...s, [key]: value } : s)));

  const toggleVisible = (id: string) =>
    setSections((list) => list.map((s) => (s.id === id ? { ...s, visible: !s.visible } : s)));

  const move = (index: number, by: number) =>
    setSections((list) => {
      const moved = withBandOrders(moveBand(splitSections(list).bands, index, by));
      const orders = new Map(moved.map((s) => [s.id, s.order]));
      return list.map((s) => (orders.has(s.id) ? { ...s, order: orders.get(s.id)! } : s));
    });

  const save = async () => {
    setBusy(true);
    setNote(null);
    setError(null);
    setConflict(false);
    try {
      const result = await updateHomepageAction(sections, token);
      if (result.ok) {
        markSaved(sections);
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
      <section aria-label="Homepage bands" className="grid gap-3">
        {bands.map((section, index) => {
          const problem = anchorProblem(sections, section.anchorId);
          return (
            <div key={section.id} className="grid gap-3 rounded-2xl border border-border p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="flex items-center gap-2">
                  <span className="font-semibold">{section.name}</span>
                  <span className="font-mono text-xs text-text-muted">#{section.anchorId}</span>
                </span>
                <span className="flex flex-wrap items-center gap-2">
                  <VisibleToggle
                    checked={section.visible}
                    onChange={() => toggleVisible(section.id)}
                  />
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                    className={secondary}
                    style={{ minHeight: 44 }}
                  >
                    Move up
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={index === bands.length - 1}
                    className={secondary}
                    style={{ minHeight: 44 }}
                  >
                    Move down
                  </button>
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Field
                  label="Section label"
                  value={section.label}
                  onChange={(v) => setField(section.id, 'label', v)}
                />
                <Field
                  label="Anchor ID (#)"
                  value={section.anchorId}
                  onChange={(v) => setField(section.id, 'anchorId', v)}
                  problem={problem}
                />
              </div>

              <Field
                label="Main headline"
                value={section.heading ?? ''}
                onChange={(v) => setField(section.id, 'heading', v)}
              />
              <Field
                label="Supporting description / story"
                rows={4}
                value={section.description ?? ''}
                onChange={(v) => setField(section.id, 'description', v)}
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <Field
                  label="Primary CTA label"
                  value={section.primaryCtaLabel ?? ''}
                  onChange={(v) => setField(section.id, 'primaryCtaLabel', v)}
                />
                <Field
                  label="Primary CTA destination"
                  value={section.primaryCtaUrl ?? ''}
                  onChange={(v) => setField(section.id, 'primaryCtaUrl', v)}
                />
              </div>
            </div>
          );
        })}
      </section>

      {headers.length > 0 ? (
        <section aria-label="Page headers" className="grid gap-3">
          <div className="border-t border-border pt-4">
            <h2 className="m-0 text-lg">Page headers</h2>
            <p className="m-0 mt-1 text-sm text-text-secondary">
              The intro block at the top of each standalone page.
            </p>
          </div>
          {headers.map((section) => (
            <div key={section.id} className="grid gap-3 rounded-2xl border border-border p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="flex items-center gap-2">
                  <span className="font-semibold">{section.name}</span>
                  <span className="text-xs text-text-muted">{section.label}</span>
                </span>
                <VisibleToggle
                  checked={section.visible}
                  onChange={() => toggleVisible(section.id)}
                />
              </div>
              <Field
                label="Eyebrow label"
                value={section.label}
                onChange={(v) => setField(section.id, 'label', v)}
              />
              <Field
                label="Headline"
                value={section.heading ?? ''}
                onChange={(v) => setField(section.id, 'heading', v)}
              />
              <Field
                label="Intro paragraph"
                rows={2}
                value={section.description ?? ''}
                onChange={(v) => setField(section.id, 'description', v)}
              />
            </div>
          ))}
        </section>
      ) : null}

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
