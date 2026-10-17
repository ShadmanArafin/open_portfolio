'use client';

import { useState, type ReactNode } from 'react';

const field = 'w-full rounded-xl border border-border bg-surface-primary px-3 text-text-primary';
const secondary =
  'rounded-full border border-border px-3 text-sm text-text-secondary hover:text-text-primary disabled:opacity-50';
const danger = 'rounded-full bg-danger px-3 text-sm font-semibold text-bg disabled:opacity-50';

export function Field({
  label,
  value,
  onChange,
  hint,
  problem,
  rows,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  problem?: string | null;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="font-semibold">{label}</span>
      {rows ? (
        <textarea
          rows={rows}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className={`${field} py-2`}
        />
      ) : (
        <input
          type="text"
          value={value}
          placeholder={placeholder}
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

export function SelectField({
  label,
  value,
  onChange,
  options,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  hint?: string;
}) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="font-semibold">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={field}
        style={{ minHeight: 44 }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {hint ? <span className="text-text-secondary">{hint}</span> : null}
    </label>
  );
}

export function CheckField({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex min-h-[44px] cursor-pointer items-center gap-3 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-5 w-5"
      />
      <span className="font-semibold">
        {label}
        {description ? (
          <span className="block font-normal text-text-secondary">{description}</span>
        ) : null}
      </span>
    </label>
  );
}

export interface SaveOutcome<T> {
  ok: boolean;
  error?: string;
  conflict?: boolean;
  /** The stored list, so the editor can show what was actually saved. */
  items?: T[];
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
 */
export function CollectionEditor<T extends { id: string }>({
  initialItems,
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
  customAdd,
  leading,
  renderFields,
}: {
  initialItems: T[];
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
  save: (items: T[]) => Promise<SaveOutcome<T>>;
  note?: string;
  headerExtra?: ReactNode;
  /** Replaces the Add button — the artifact screen uploads before it has a record. */
  customAdd?: (add: (items: T[]) => void) => ReactNode;
  /** A preview before the title, for screens whose records are pictures. */
  leading?: (item: T) => ReactNode;
  renderFields: (item: T, mutate: (mutate: (item: T) => T) => void, items: T[]) => ReactNode;
}) {
  const [items, setItems] = useState<T[]>(initialItems);
  const [openId, setOpenId] = useState<string | null>(null);
  const [deleteArmed, setDeleteArmed] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [noteText, setNoteText] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

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

  const remove = (id: string) => {
    setItems((list) => list.filter((item) => item.id !== id));
    if (openId === id) setOpenId(null);
    setDeleteArmed(null);
  };

  const saveAll = async () => {
    setBusy(true);
    setNoteText(null);
    setSaveError(null);
    try {
      const result = await save(items);
      if (result.ok) {
        if (result.items) setItems(result.items);
        setNoteText('Saved to your draft.');
      } else {
        setSaveError(result.error ?? 'The save did not go through.');
      }
    } catch {
      setSaveError('The save did not go through. Reload and try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-6">
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
              <li key={item.id} className="grid gap-3 rounded-2xl border border-border p-4">
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
        <p className="m-0 text-sm text-text-secondary">{note}</p>
        {noteText ? (
          <p role="status" className="m-0 text-sm text-text-secondary">
            {noteText}
          </p>
        ) : null}
        {saveError ? (
          <p role="alert" className="m-0 text-sm text-danger">
            {saveError}
          </p>
        ) : null}
      </div>
    </div>
  );
}
