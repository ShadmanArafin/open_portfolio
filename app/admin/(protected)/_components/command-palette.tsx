'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import type { AdminSection } from './sections';

export interface PaletteRecord {
  label: string;
  /** What it is, shown beside it: "Page", "Writing", "Project". */
  kind: string;
  href: string;
}

interface Entry {
  label: string;
  hint: string;
  href: string;
}

/**
 * Cmd+K (Ctrl+K elsewhere): go anywhere in the admin by typing.
 *
 * Twenty-odd sections and every page, piece and project the owner has made,
 * one keystroke and a few letters away instead of a scan of the menu and then
 * of a list (Hick's law; Fitts' law for the pointer that no longer has to
 * travel). It was built once before, on the Astryx kit, and went with it in
 * the rewrite; this is the plain-Tailwind island.
 *
 * A native `<dialog>` opened with `showModal()`: the browser supplies the
 * focus trap, Escape, the inert page behind and the backdrop. Inside it is the
 * ARIA combobox pattern — the input owns the list and names the highlighted
 * option with `aria-activedescendant`, so focus never leaves the text box.
 */
export function CommandPalette({
  sections,
  records,
}: {
  sections: AdminSection[];
  records: PaletteRecord[];
}) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const listId = useId();
  const optionId = (index: number) => `${listId}-option-${index}`;

  const entries: Entry[] = useMemo(
    () => [
      ...sections.map((section) => ({
        label: section.label,
        hint: section.group ?? 'Overview',
        href: section.href,
      })),
      ...records.map((record) => ({ label: record.label, hint: record.kind, href: record.href })),
    ],
    [sections, records]
  );

  const results = useMemo(() => {
    const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (words.length === 0) return entries.slice(0, 30);
    return entries
      .filter((entry) => {
        const haystack = `${entry.label} ${entry.hint}`.toLowerCase();
        return words.every((word) => haystack.includes(word));
      })
      .slice(0, 30);
  }, [entries, query]);

  const open = () => {
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) return;
    setQuery('');
    setActive(0);
    dialog.showModal();
    inputRef.current?.focus();
  };

  const close = () => dialogRef.current?.close();

  const go = (entry: Entry | undefined) => {
    if (!entry) return;
    close();
    router.push(entry.href);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        open();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const onInputKey = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActive((index) => Math.min(index + 1, results.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((index) => Math.max(index - 1, 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      go(results[active]);
    }
  };

  useEffect(() => {
    document.getElementById(optionId(active))?.scrollIntoView({ block: 'nearest' });
  });

  return (
    <>
      <button
        type="button"
        onClick={open}
        className="flex items-center gap-2 rounded-full border border-border px-3 text-sm text-text-secondary hover:text-text-primary"
        style={{ minHeight: 44 }}
        aria-keyshortcuts="Control+K Meta+K"
      >
        Search
        <kbd className="rounded border border-border px-1.5 font-mono text-xs text-text-muted">
          ⌘K
        </kbd>
      </button>

      <dialog
        ref={dialogRef}
        aria-label="Go to"
        className="m-0 mx-auto mt-[12vh] w-[min(36rem,calc(100vw-2rem))] rounded-2xl border border-border bg-bg p-0 text-text-primary backdrop:bg-black/50"
      >
        <div className="grid gap-2 p-3">
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-activedescendant={results.length > 0 ? optionId(active) : undefined}
            aria-autocomplete="list"
            aria-label="Go to a section, page, piece of writing or project"
            placeholder="Go to…"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
            }}
            onKeyDown={onInputKey}
            className="rounded-xl border border-border bg-surface-primary px-3 text-text-primary"
            style={{ minHeight: 44 }}
          />
          <ul
            id={listId}
            role="listbox"
            aria-label="Results"
            className="m-0 grid max-h-[50vh] list-none gap-1 overflow-y-auto p-0"
          >
            {results.map((entry, index) => (
              // The combobox pattern: keys are handled on the input, which keeps
              // focus and names this option with aria-activedescendant, so an
              // option takes a pointer click but needs no key handler of its own.
              // eslint-disable-next-line jsx-a11y/click-events-have-key-events
              <li
                key={`${entry.href}-${index}`}
                id={optionId(index)}
                role="option"
                aria-selected={index === active}
                onMouseEnter={() => setActive(index)}
                onClick={() => go(entry)}
                className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl px-3 text-sm ${
                  index === active
                    ? 'bg-surface-secondary text-text-primary'
                    : 'text-text-secondary'
                }`}
                style={{ minHeight: 44 }}
              >
                <span>{entry.label}</span>
                <span className="font-mono text-xs uppercase tracking-widest text-text-muted">
                  {entry.hint}
                </span>
              </li>
            ))}
          </ul>
          {results.length === 0 ? (
            <p role="status" className="m-0 px-3 py-2 text-sm text-text-secondary">
              Nothing matches “{query}”.
            </p>
          ) : null}
          <div className="flex items-center justify-between gap-3 px-3">
            <p className="m-0 text-xs text-text-muted">
              ↑ ↓ to choose · Enter to go · Esc to close
            </p>
            <button
              type="button"
              onClick={close}
              className="rounded-full border border-border px-3 text-sm text-text-secondary hover:text-text-primary"
              style={{ minHeight: 44 }}
            >
              Close
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
