'use client';

import { useRef, useState } from 'react';
import { parseMarkdownNote, uniqueSlugs, type ParsedNote } from '@/core/writing/markdown';
import { MAX_WRITING_ENTRIES, createWritingEntry, type WritingEntry } from '@/core/writing/schema';
import { newId } from '../_components/ids';

/**
 * Bringing posts over from somewhere else.
 *
 * The text half of the import: image bulk upload already exists, and this is
 * the `.md` files. Deliberately not a screen of its own — the Writing screen
 * already owns the list, the editor and the save, so pieces that land in that
 * list inherit all three, and there is no second write path to keep in step
 * with `updateWritingAction`.
 *
 * Nothing here writes. Files are read in the browser, parsed by the same
 * modules the tests run, shown with what the reader could not carry, and then
 * appended to the screen's own state — which is the contract spelled out
 * under the Save button: until Save, everything on this page is local. That
 * is also what makes an import safe to try: the way out is Delete piece.
 */

/** Enough to move a site in one go, few enough to keep the preview readable. */
const MAX_FILES = 20;
/** A post is text. A file bigger than this is a database export. */
const MAX_FILE_BYTES = 1_000_000;

const secondary =
  'rounded-full border border-border px-3 text-sm text-text-secondary hover:text-text-primary disabled:opacity-50';
const primary =
  'rounded-full bg-text-primary px-4 text-sm font-semibold text-bg disabled:opacity-50';

interface Ready {
  fileName: string;
  note: ParsedNote;
  warnings: string[];
}

interface Refused {
  fileName: string;
  error: string;
}

export function MarkdownImport({
  existingSlugs,
  startOrder,
  room,
  onAdd,
}: {
  existingSlugs: string[];
  /** The order number the first imported piece takes. */
  startOrder: number;
  /** How many more pieces the site will hold. */
  room: number;
  onAdd: (entries: WritingEntry[], note: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState<Ready[]>([]);
  const [refused, setRefused] = useState<Refused[]>([]);

  const space = Math.max(0, room);
  const fit = Math.min(ready.length, space);

  const choose = async (files: File[]) => {
    setBusy(true);
    setReady([]);
    setRefused([]);

    const accepted: Ready[] = [];
    const rejected: Refused[] = [];

    for (const file of files.slice(0, MAX_FILES)) {
      if (file.size > MAX_FILE_BYTES) {
        rejected.push({
          fileName: file.name,
          error: 'larger than 1 MB — that is an export, not a post.',
        });
        continue;
      }
      try {
        const result = parseMarkdownNote(file.name, await file.text());
        if (result.ok) {
          accepted.push({ fileName: file.name, note: result.note, warnings: result.warnings });
        } else {
          rejected.push({ fileName: file.name, error: result.error });
        }
      } catch {
        rejected.push({ fileName: file.name, error: 'could not be read.' });
      }
    }

    for (const file of files.slice(MAX_FILES)) {
      rejected.push({
        fileName: file.name,
        error: `past the ${MAX_FILES} files this reads at a time.`,
      });
    }

    setReady(accepted);
    setRefused(rejected);
    setBusy(false);
  };

  const add = () => {
    // Addresses are settled here rather than on the server because this is
    // where the clash can be shown before anything is added — the same
    // `-2` rule the Writing screen uses when it creates a piece by hand.
    const taken = uniqueSlugs(
      ready.slice(0, space).map((item) => item.note),
      existingSlugs
    );

    const entries: WritingEntry[] = taken.notes.map((note, index) => ({
      ...createWritingEntry(note.title),
      id: newId('writing'),
      slug: note.slug,
      summary: note.summary,
      tags: note.tags,
      featured: note.featured,
      ...(note.publishedAt ? { publishedAt: note.publishedAt } : {}),
      blocks: note.blocks.map((block) => ({ ...block, id: newId('block') })),
      sortOrder: startOrder + index,
    }));

    const parts = [
      entries.length === 1
        ? '1 piece is in the list below.'
        : `${entries.length} pieces are in the list below.`,
      'Nothing is saved until you press Save.',
    ];
    if (taken.renamed === 1) {
      parts.push('One file wanted an address that is already taken, so it ends in -2.');
    } else if (taken.renamed > 1) {
      parts.push(`${taken.renamed} files wanted addresses already taken; those end in -2.`);
    }
    const skipped = ready.length - entries.length;
    if (skipped > 0) {
      parts.push(`${skipped} more did not fit under the ${MAX_WRITING_ENTRIES}-piece limit.`);
    }

    onAdd(entries, parts.join(' '));
    setReady([]);
    setRefused([]);
    setOpen(false);
  };

  return (
    <section className="grid gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          className={secondary}
          style={{ minHeight: 44 }}
        >
          Import Markdown
        </button>
        <p className="m-0 text-sm text-text-secondary">
          Already have posts somewhere else? Bring the files over.
        </p>
      </div>

      {open ? (
        <div className="grid gap-3 rounded-2xl border border-border bg-surface-secondary p-4">
          <p className="m-0 text-sm text-text-secondary">
            Front matter is read — title, date, summary, tags and web address — and the body becomes
            the same text blocks a page is built from. Everything arrives as a draft, in the list
            below.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy || space === 0}
              className={secondary}
              style={{ minHeight: 44 }}
            >
              {busy ? 'Reading the files…' : 'Choose .md files'}
            </button>
            <input
              ref={inputRef}
              type="file"
              accept=".md,.markdown,.txt,text/markdown"
              multiple
              aria-label="Choose Markdown files to import"
              className="sr-only"
              disabled={busy || space === 0}
              onChange={(event) => {
                const files = [...(event.target.files ?? [])];
                // Clearing the input is what makes choosing the same file
                // twice fire again — after a fix, that is the normal way back.
                event.target.value = '';
                if (files.length > 0) void choose(files);
              }}
            />
            <span className="text-sm text-text-secondary">Up to {MAX_FILES} at a time.</span>
          </div>

          {space === 0 ? (
            <p role="alert" className="m-0 text-sm text-danger">
              The site holds {MAX_WRITING_ENTRIES} pieces and you have that many. Delete some before
              importing more.
            </p>
          ) : null}

          {refused.length > 0 ? (
            <ul role="alert" className="m-0 grid list-none gap-1 p-0 text-sm text-danger">
              {refused.map((item, index) => (
                <li key={`${index}-${item.fileName}`}>
                  {item.fileName}: {item.error}
                </li>
              ))}
            </ul>
          ) : null}

          {ready.length > 0 ? (
            <>
              <ul className="m-0 grid list-none gap-2 p-0">
                {ready.map((item, index) => (
                  <li
                    key={`${index}-${item.fileName}`}
                    className="grid gap-1 rounded-xl border border-border bg-surface-primary p-3"
                  >
                    <span className="text-sm font-semibold">{item.note.title || 'Untitled'}</span>
                    <span className="text-sm text-text-secondary">
                      {item.fileName} · /writing/{item.note.slug} ·{' '}
                      {item.note.blocks.length === 1
                        ? '1 block'
                        : `${item.note.blocks.length} blocks`}
                      {item.note.publishedAt
                        ? ` · dated ${item.note.publishedAt.slice(0, 10)}`
                        : ''}
                    </span>
                    {item.warnings.length > 0 ? (
                      <ul className="m-0 grid list-none gap-1 p-0 text-sm text-text-muted">
                        {item.warnings.map((warning) => (
                          <li key={warning}>{warning}</li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={add}
                  disabled={fit === 0}
                  className={primary}
                  style={{ minHeight: 44 }}
                >
                  {fit === 1 ? 'Add 1 piece' : `Add ${fit} pieces`}
                </button>
                {fit < ready.length ? (
                  <p className="m-0 text-sm text-text-secondary">
                    Only {fit} fit under the {MAX_WRITING_ENTRIES}-piece limit.
                  </p>
                ) : null}
              </div>
            </>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
