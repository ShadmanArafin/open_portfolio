'use client';

import { useState } from 'react';
import type { MediaItem } from '@/cms/types/cms';
import { MAX_SLUG_LENGTH, normaliseSlug } from '@/core/pages/schema';
import {
  MAX_WRITING_ENTRIES,
  WRITING_DEFAULTS,
  arrange,
  createWritingEntry,
  type WritingEntry,
  type WritingSettings,
} from '@/core/writing/schema';
import { BlocksEditor } from '../_components/blocks-editor';
import { CheckField, DateTimeField, Field } from '../_components/form-fields';
import { newId } from '../_components/ids';
import { updateWritingAction } from '../_actions/writing';
import { MarkdownImport } from './markdown-import';
import { ConflictNotice } from '../_components/conflict-notice';
import { useSaveShortcut, useUnsavedChanges } from '../_components/unsaved-changes';
import { UnsavedNote } from '../_components/unsaved-note';
import { useRequestedRecord } from '../_components/requested-record';
import { UndoNotice } from '../_components/undo-remove';
import { useUndoableRemove } from '../_components/use-undoable-remove';
import { Suggest } from '../_components/assist';

/**
 * Writing — essays, notes, posts.
 *
 * The settings at the top are what make this not a blog: what it is called,
 * whether dates show, and whether the newest or the best comes first. The list
 * below shows pieces in the order visitors will read them — `arrange()` is the
 * same function the public site uses, so the editor cannot disagree with the
 * site about what comes first.
 *
 * Every piece is built from the same blocks as the pages, delivered by the
 * shared editor. Reordering only exists in curated mode: in newest-first order
 * a position is a number the date outranks anyway, and a control that silently
 * does nothing is worse than no control.
 *
 * Saving is the server's job — one write for the settings *and* the list, so a
 * save that half-landed cannot exist. Until Save, everything here is local.
 */

const field = 'w-full rounded-xl border border-border bg-surface-primary px-3 text-text-primary';
const secondary =
  'rounded-full border border-border px-3 text-sm text-text-secondary hover:text-text-primary disabled:opacity-50';
const danger = 'rounded-full bg-danger px-3 text-sm font-semibold text-bg disabled:opacity-50';

/**
 * The one thing `checkSlug` cannot say for a piece.
 *
 * Pages' `checkSlug` guards top-level addresses — reserved routes, locale
 * prefixes — and none of that applies one level under /writing. What does
 * apply: a piece needs an address, that address is a single segment (the
 * public route is `/writing/[slug]`, so a slash would build an address that
 * never opens), and two pieces cannot share one. Kept in step with
 * `updateWritingAction`, which refuses the same three things.
 */
function slugProblem(slug: string, otherSlugs: string[]): string | null {
  if (!slug) return 'This piece needs a web address.';
  if (slug.includes('/')) {
    return 'A piece lives at a single address. Keep it one word or phrase.';
  }
  if (slug.length > MAX_SLUG_LENGTH) {
    return `This web address is too long. Keep it under ${MAX_SLUG_LENGTH} characters.`;
  }
  if (otherSlugs.includes(slug)) return 'Another piece already uses this web address.';
  return null;
}

const STATUS_LABELS: Record<WritingEntry['status'], string> = {
  draft: 'Draft',
  published: 'Live',
  scheduled: 'Scheduled',
};

function statusBadge(status: WritingEntry['status']): string {
  const tone =
    status === 'published' ? 'border-accent text-accent' : 'border-border text-text-muted';
  return `rounded-full border px-2 py-0.5 text-xs ${tone}`;
}

export function WritingBuilder({
  initialSettings,
  initialEntries,
  media,
  token: initialToken,
}: {
  initialSettings: WritingSettings;
  initialEntries: WritingEntry[];
  media: MediaItem[];
  token?: string;
}) {
  const [settings, setSettings] = useState<WritingSettings>({
    ...WRITING_DEFAULTS,
    ...initialSettings,
  });
  const [entries, setEntries] = useState<WritingEntry[]>(initialEntries);
  const [openId, setOpenId] = useState<string | null>(null);
  useRequestedRecord(setOpenId);
  const [deleteArmed, setDeleteArmed] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [conflict, setConflict] = useState(false);
  const [token, setToken] = useState(initialToken);
  const { dirty, markSaved } = useUnsavedChanges({ settings, entries });

  const arranged = arrange(entries, settings.order);

  const setSetting = <K extends keyof WritingSettings>(key: K, value: WritingSettings[K]) =>
    setSettings((current) => ({ ...current, [key]: value }));

  const mutate = (id: string, apply: (entry: WritingEntry) => WritingEntry) =>
    setEntries((list) => list.map((entry) => (entry.id === id ? apply(entry) : entry)));

  const add = () => {
    const fresh = createWritingEntry('Untitled');
    let slug = fresh.slug;
    for (let n = 2; entries.some((existing) => existing.slug === slug); n += 1) {
      slug = `${fresh.slug}-${n}`;
    }
    const entry: WritingEntry = {
      ...fresh,
      id: newId('writing'),
      slug,
      sortOrder: entries.length + 1,
    };
    setEntries((list) => [...list, entry]);
    setOpenId(entry.id);
  };

  /**
   * Moving renumbers the whole visible list.
   *
   * The stored array is in creation order; the reading order is positions
   * (plus the pin). So a move swaps the two visible neighbours and then
   * numbers *every* visible piece by its place in that arrangement — the same
   * dance the legacy editor did, for the same reason: partial renumbering
   * leaves ties for the date fallback to break in ways nobody chose.
   */
  const moveArranged = (index: number, by: number) => {
    const target = index + by;
    if (target < 0 || target >= arranged.length) return;
    const moved = [...arranged];
    [moved[index], moved[target]] = [moved[target], moved[index]];
    setEntries((list) =>
      list.map((entry) => {
        const position = moved.findIndex((item) => item.id === entry.id);
        return position >= 0 ? { ...entry, sortOrder: position + 1 } : entry;
      })
    );
  };

  const undoable = useUndoableRemove(entries, setEntries);
  const remove = (id: string) => {
    undoable.remove(id, entries.find((entry) => entry.id === id)?.title ?? '');
    if (openId === id) setOpenId(null);
    setDeleteArmed(null);
  };

  const save = async () => {
    setBusy(true);
    setNote(null);
    setError(null);
    setConflict(false);
    try {
      const result = await updateWritingAction(settings, entries, token);
      if (result.ok && result.writing && result.settings) {
        const saved = {
          settings: { ...WRITING_DEFAULTS, ...result.settings },
          entries: result.writing,
        };
        setEntries(saved.entries);
        setSettings(saved.settings);
        markSaved(saved);
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
      {undoable.removed ? (
        <UndoNotice label={undoable.removed.label} onUndo={() => setOpenId(undoable.undo())} />
      ) : null}
      <section
        aria-label="How this section works"
        className="grid gap-3 rounded-2xl border border-border p-4"
      >
        <div>
          <h2 className="m-0 text-lg">How this section works</h2>
          <p className="m-0 mt-1 text-sm text-text-secondary">
            These decide what visitors see. Nothing here is visible until you switch it on.
          </p>
        </div>

        <CheckField
          label="Show this section on my site"
          description="Off by default. A section with nothing in it is worse for a portfolio than no section at all."
          checked={settings.enabled}
          onChange={(checked) => setSetting('enabled', checked)}
        />

        <Field
          label="What is it called?"
          value={settings.label}
          onChange={(value) => setSetting('label', value)}
          hint="Writing, Blog, Journal, Essays, Notes — whatever fits what you do. It always lives at /writing."
        />

        <label className="grid gap-1 text-sm">
          <span className="font-semibold">What comes first?</span>
          <select
            value={settings.order}
            onChange={(event) =>
              setSetting('order', event.target.value as WritingSettings['order'])
            }
            className={field}
            style={{ minHeight: 44 }}
          >
            <option value="curated">The order I choose — best work first</option>
            <option value="newest">Newest first — like a blog</option>
          </select>
          <span className="text-text-secondary">Pinned pieces come first either way.</span>
        </label>

        <CheckField
          label="Show dates"
          description="Off by default. An essay that is still true does not look better with a date from three years ago on it."
          checked={settings.showDates}
          onChange={(checked) => setSetting('showDates', checked)}
        />
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={add}
          className="rounded-full bg-text-primary px-4 text-sm font-semibold text-bg"
          style={{ minHeight: 44 }}
        >
          Write something
        </button>
        {settings.order === 'newest' && arranged.length > 0 ? (
          <p className="m-0 text-sm text-text-secondary">
            Shown newest first. Switch to “The order I choose” to set positions by hand.
          </p>
        ) : null}
      </div>

      <MarkdownImport
        existingSlugs={entries.map((entry) => entry.slug)}
        startOrder={entries.length + 1}
        room={MAX_WRITING_ENTRIES - entries.length}
        onAdd={(added, note) => {
          setEntries((list) => [...list, ...added]);
          setNote(note);
          setError(null);
        }}
      />

      {arranged.length === 0 ? (
        <p className="m-0 rounded-xl border border-border bg-surface-secondary p-3 text-sm text-text-secondary">
          Nothing written yet. A piece is a title and some blocks — the same ones your pages use.
        </p>
      ) : (
        <ul className="m-0 grid list-none gap-3 p-0">
          {arranged.map((entry, index) => {
            const open = openId === entry.id;
            return (
              <li
                key={entry.id}
                id={`record-${entry.id}`}
                className="grid scroll-mt-6 gap-3 rounded-2xl border border-border p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setOpenId(open ? null : entry.id)}
                    aria-expanded={open}
                    className="grid gap-1 text-left"
                    style={{ minHeight: 44 }}
                  >
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{entry.title || 'Untitled'}</span>
                      <span className={statusBadge(entry.status)}>
                        {STATUS_LABELS[entry.status]}
                      </span>
                    </span>
                    <span className="text-sm text-text-secondary">
                      /writing/{entry.slug}
                      {entry.summary ? ` · ${entry.summary}` : ''}
                    </span>
                  </button>

                  <span className="flex flex-wrap items-center gap-2">
                    {settings.order === 'curated' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => moveArranged(index, -1)}
                          disabled={index === 0}
                          className={secondary}
                          style={{ minHeight: 44 }}
                        >
                          Move up
                        </button>
                        <button
                          type="button"
                          onClick={() => moveArranged(index, 1)}
                          disabled={index === arranged.length - 1}
                          className={secondary}
                          style={{ minHeight: 44 }}
                        >
                          Move down
                        </button>
                      </>
                    ) : null}
                    {deleteArmed === entry.id ? (
                      <>
                        <button
                          type="button"
                          onClick={() => remove(entry.id)}
                          className={danger}
                          style={{ minHeight: 44 }}
                        >
                          Delete it
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteArmed(null)}
                          className={secondary}
                          style={{ minHeight: 44 }}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setDeleteArmed(entry.id)}
                        className={secondary}
                        style={{ minHeight: 44 }}
                      >
                        Delete piece
                      </button>
                    )}
                  </span>
                </div>

                {open ? (
                  <EntryEditor
                    entry={entry}
                    otherSlugs={entries
                      .filter((other) => other.id !== entry.id)
                      .map((other) => other.slug)}
                    media={media}
                    onMutate={(apply) => mutate(entry.id, apply)}
                  />
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

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
        <p className="m-0 text-sm text-text-secondary">
          Nothing on this screen is live until you publish.
        </p>
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

function EntryEditor({
  entry,
  otherSlugs,
  media,
  onMutate,
}: {
  entry: WritingEntry;
  otherSlugs: string[];
  media: MediaItem[];
  onMutate: (apply: (entry: WritingEntry) => WritingEntry) => void;
}) {
  const problem = slugProblem(entry.slug, otherSlugs);

  return (
    <div className="grid gap-6 border-t border-border pt-4">
      <Field
        label="Title"
        value={entry.title}
        onChange={(value) => onMutate((current) => ({ ...current, title: value }))}
      />

      <Field
        label="Summary"
        rows={2}
        value={entry.summary}
        onChange={(value) => onMutate((current) => ({ ...current, summary: value }))}
        hint="One or two lines. Shown in the list, and used as the description in search results."
      />
      <Suggest
        task="summary"
        source={() => ({ title: entry.title, blocks: entry.blocks })}
        onUse={(value) => onMutate((current) => ({ ...current, summary: value }))}
      />

      <Field
        label="Web address"
        value={entry.slug}
        onChange={(value) => onMutate((current) => ({ ...current, slug: normaliseSlug(value) }))}
        hint={`This piece will be at /writing/${entry.slug}`}
        problem={problem}
      />

      <label className="grid gap-1 text-sm">
        <span className="font-semibold">Visibility</span>
        <select
          value={entry.status}
          onChange={(event) =>
            onMutate((current) => ({
              ...current,
              status: event.target.value as WritingEntry['status'],
            }))
          }
          className={field}
          style={{ minHeight: 44 }}
        >
          <option value="draft">Draft — only you can see it</option>
          <option value="published">Published — anyone can see it</option>
          <option value="scheduled">Scheduled — appears on a date</option>
        </select>
      </label>

      {entry.status === 'scheduled' ? (
        <DateTimeField
          label="Appears on"
          value={entry.scheduledFor}
          onChange={(value) => onMutate((current) => ({ ...current, scheduledFor: value }))}
          hint="In your own time zone. It appears on its own within a minute of that moment, once published. Nothing needs to be running."
        />
      ) : null}

      <CheckField
        label="Pin to the top"
        description="Keeps your best piece first, however the rest is ordered."
        checked={entry.featured}
        onChange={(checked) => onMutate((current) => ({ ...current, featured: checked }))}
      />

      <section aria-label="Body" className="grid gap-3">
        <div>
          <h2 className="m-0 text-lg">Body</h2>
          <p className="m-0 mt-1 text-sm text-text-secondary">
            The same blocks your pages use — text, images, galleries, quotes.
          </p>
        </div>
        <BlocksEditor
          blocks={entry.blocks}
          onChange={(blocks) => onMutate((current) => ({ ...current, blocks }))}
          media={media}
        />
      </section>

      <p className="m-0 text-sm text-text-secondary">
        Version {entry.revision}. Changes are saved to your draft. Publish when you are ready.
      </p>
    </div>
  );
}
