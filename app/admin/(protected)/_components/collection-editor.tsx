'use client';

import { useState, type ReactNode } from 'react';
import { ConflictNotice } from './conflict-notice';
import { useSaveShortcut, useUnsavedChanges } from './unsaved-changes';
import { UnsavedNote } from './unsaved-note';
import { useRequestedRecord } from './requested-record';
import { UndoNotice } from './undo-remove';
import { useUndoableRemove } from './use-undoable-remove';
import { CsvImport } from './csv-import';
import type { CsvImporter } from '@/core/import/csv-templates';

const secondary =
  'rounded-full border border-border px-3 text-sm text-text-secondary hover:text-text-primary disabled:opacity-50';
const danger = 'rounded-full bg-danger px-3 text-sm font-semibold text-bg disabled:opacity-50';

export interface SaveOutcome<T> {
  ok: boolean;
  error?: string;
  conflict?: boolean;
  /** The stored list, so the editor can show what was actually saved. */
  items?: T[];
  /** The screen's token for its next save. See `core/content/screen-token`. */
  token?: string;
}

/**
 * The list-editor shell shared by the collection screens.
 *
 * Every one of these screens is the same thing: records in an order, each one
 * a small form, with add, duplicate, move, remove and one Save. The legacy
 * admin rebuilt that shell per screen, which is how ten collections ended up
 * with ten different sets of behaviours — some reordered, some did not, some
 * confirmed a delete, some did not. Edits are local until Save, and the save
 * is one revision-checked write of the whole list, so a reorder or an add can
 * never land half-applied.
 *
 * The save carries the screen's token, so a list somebody changed in another
 * tab since this one loaded is refused rather than overwritten; leaving with
 * unsaved edits asks first, and Cmd/Ctrl+S saves.
 */
export function CollectionEditor<T extends { id: string }>({
  initialItems,
  token: initialToken,
  addLabel,
  emptyTitle,
  emptyHint,
  deleteLabel,
  deleteWarning,
  title,
  summary,
  badge,
  create,
  duplicate,
  save,
  note = 'Nothing on this screen is live until you publish.',
  headerExtra,
  csv,
  customAdd,
  leading,
  renderFields,
}: {
  initialItems: T[];
  /** From the page: what this screen's part of the draft looked like on load. */
  token?: string;
  addLabel: string;
  emptyTitle: string;
  emptyHint?: string;
  deleteLabel: string;
  deleteWarning: string;
  title: (item: T) => string;
  summary?: (item: T) => string;
  badge?: (item: T) => { label: string; live: boolean } | null;
  create: (items: T[]) => T;
  duplicate: (item: T, items: T[]) => T;
  save: (items: T[], token?: string) => Promise<SaveOutcome<T>>;
  note?: string;
  headerExtra?: ReactNode;
  /** Rows from a spreadsheet, against this screen's fixed template. */
  csv?: CsvImporter<T>;
  /** Replaces the Add button — the artifact screen uploads before it has a record. */
  customAdd?: (add: (items: T[]) => void) => ReactNode;
  /** A preview before the title, for screens whose records are pictures. */
  leading?: (item: T) => ReactNode;
  renderFields: (item: T, mutate: (mutate: (item: T) => T) => void, items: T[]) => ReactNode;
}) {
  const [items, setItems] = useState<T[]>(initialItems);
  const [openId, setOpenId] = useState<string | null>(null);
  useRequestedRecord(setOpenId);
  const [deleteArmed, setDeleteArmed] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [noteText, setNoteText] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [conflict, setConflict] = useState(false);
  const [token, setToken] = useState(initialToken);
  const { dirty, markSaved } = useUnsavedChanges(items);

  const mutateItem = (id: string, mutate: (item: T) => T) =>
    setItems((list) => list.map((item) => (item.id === id ? mutate(item) : item)));

  /**
   * New records go to the top and open themselves, so what was just added is
   * what is in front of you. Only the artifact uploader adds a batch.
   */
  const addItems = (added: T[]) => {
    if (added.length === 0) return;
    setItems((list) => [...added, ...list]);
    setOpenId(added[0].id);
  };

  const makeCopy = (item: T) => {
    const copy = duplicate(item, items);
    setItems((list) => [copy, ...list]);
    setOpenId(copy.id);
  };

  const move = (index: number, by: number) =>
    setItems((list) => {
      const target = index + by;
      if (target < 0 || target >= list.length) return list;
      const next = [...list];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });

  const undoable = useUndoableRemove(items, setItems);
  const remove = (id: string) => {
    const item = items.find((candidate) => candidate.id === id);
    undoable.remove(id, item ? title(item) : '');
    if (openId === id) setOpenId(null);
    setDeleteArmed(null);
  };

  const saveAll = async () => {
    setBusy(true);
    setNoteText(null);
    setSaveError(null);
    setConflict(false);
    try {
      const result = await save(items, token);
      if (result.ok) {
        const saved = result.items ?? items;
        setItems(saved);
        markSaved(saved);
        if (result.token) setToken(result.token);
        setNoteText('Saved to your draft.');
      } else {
        setConflict(Boolean(result.conflict));
        setSaveError(result.error ?? 'The save did not go through.');
      }
    } catch {
      setSaveError('The save did not go through. Reload and try again.');
    } finally {
      setBusy(false);
    }
  };

  useSaveShortcut(() => void saveAll(), !busy);

  return (
    <div className="grid gap-6">
      {undoable.removed ? (
        <UndoNotice label={undoable.removed.label} onUndo={() => setOpenId(undoable.undo())} />
      ) : null}
      <div className="flex flex-wrap gap-3">
        {customAdd ? (
          customAdd(addItems)
        ) : (
          <button
            type="button"
            onClick={() => addItems([create(items)])}
            className="rounded-full bg-text-primary px-4 text-sm font-semibold text-bg"
            style={{ minHeight: 44 }}
          >
            {addLabel}
          </button>
        )}
        {csv ? (
          <CsvImport importer={csv} existing={items} create={create} onImport={addItems} />
        ) : null}
        {headerExtra}
      </div>

      {items.length === 0 ? (
        <p className="m-0 rounded-xl border border-border bg-surface-secondary p-3 text-sm text-text-secondary">
          <strong className="text-text-primary">{emptyTitle}</strong>
          {emptyHint ? ` ${emptyHint}` : null}
        </p>
      ) : (
        <ul className="m-0 grid list-none gap-3 p-0">
          {items.map((item, index) => {
            const open = openId === item.id;
            const itemBadge = badge?.(item) ?? null;
            return (
              <li
                key={item.id}
                id={`record-${item.id}`}
                className="grid scroll-mt-6 gap-3 rounded-2xl border border-border p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="flex flex-wrap items-center gap-3">
                    {leading ? leading(item) : null}
                    <button
                      type="button"
                      onClick={() => setOpenId(open ? null : item.id)}
                      aria-expanded={open}
                      className="grid gap-1 text-left"
                      style={{ minHeight: 44 }}
                    >
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold">{title(item) || 'Untitled'}</span>
                        {itemBadge ? (
                          <span
                            className={`rounded-full border px-2 py-0.5 text-xs ${
                              itemBadge.live
                                ? 'border-accent text-accent'
                                : 'border-border text-text-muted'
                            }`}
                          >
                            {itemBadge.label}
                          </span>
                        ) : null}
                      </span>
                      {summary ? (
                        <span className="text-sm text-text-secondary">{summary(item)}</span>
                      ) : null}
                    </button>
                  </span>

                  <span className="flex flex-wrap items-center gap-2">
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
                      disabled={index === items.length - 1}
                      className={secondary}
                      style={{ minHeight: 44 }}
                    >
                      Move down
                    </button>
                    <button
                      type="button"
                      onClick={() => makeCopy(item)}
                      className={secondary}
                      style={{ minHeight: 44 }}
                    >
                      Duplicate
                    </button>
                    {deleteArmed === item.id ? (
                      <>
                        <button
                          type="button"
                          onClick={() => remove(item.id)}
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
                        onClick={() => setDeleteArmed(item.id)}
                        className={secondary}
                        style={{ minHeight: 44 }}
                      >
                        {deleteLabel}
                      </button>
                    )}
                  </span>
                </div>

                {deleteArmed === item.id ? (
                  <p className="m-0 text-sm text-danger">{deleteWarning}</p>
                ) : null}

                {open ? (
                  <div className="grid gap-4 border-t border-border pt-4">
                    {renderFields(item, (mutate) => mutateItem(item.id, mutate), items)}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void saveAll()}
          disabled={busy}
          className="rounded-full bg-text-primary px-4 text-sm font-semibold text-bg disabled:opacity-50"
          style={{ minHeight: 44 }}
        >
          {busy ? 'Saving…' : 'Save'}
        </button>
        <UnsavedNote dirty={dirty} />
        <p className="m-0 text-sm text-text-secondary">{note}</p>
        {noteText ? (
          <p role="status" className="m-0 text-sm text-text-secondary">
            {noteText}
          </p>
        ) : null}
        {saveError ? (
          conflict ? (
            <ConflictNotice message={saveError} />
          ) : (
            <p role="alert" className="m-0 text-sm text-danger">
              {saveError}
            </p>
          )
        ) : null}
      </div>
    </div>
  );
}
