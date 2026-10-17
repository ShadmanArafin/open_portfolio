'use client';

import { useState } from 'react';
import type { MediaItem } from '@/cms/types/cms';
import { deleteMediaAction, uploadMediaAction, updateResumeAction } from '../_actions/media';
import { probeDimensions } from '../_components/probe-dimensions';

/**
 * The library grid, from the legacy screen with the same behaviours: one
 * upload control, cards that say how often an asset is used, a copy button for
 * the reference, a two-step delete that spells out the consequence first, and
 * the résumé question when a PDF arrives.
 *
 * What changed is where the files live. The legacy library put bytes in the
 * editor's own browser and only this screen could see them; uploads now go
 * through a server action, into the configured storage backend, and into the
 * draft's media list in the same call — which is also why block editors upload
 * through the same action, and why a file uploaded there shows up here.
 */

const secondary =
  'rounded-full border border-border px-3 text-sm text-text-secondary hover:text-text-primary disabled:opacity-50';
const primary =
  'rounded-full bg-text-primary px-4 text-sm font-semibold text-bg disabled:opacity-50';
const danger = 'rounded-full bg-danger px-3 text-sm font-semibold text-bg disabled:opacity-50';

function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

export function MediaLibrary({
  initialItems,
  initialUsage,
  initialResume,
}: {
  initialItems: MediaItem[];
  initialUsage: Record<string, number>;
  initialResume: { url: string; filename: string };
}) {
  const [items, setItems] = useState<MediaItem[]>(initialItems);
  const [usage] = useState<Record<string, number>>(initialUsage);
  const [resume, setResume] = useState(initialResume);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [armedDelete, setArmedDelete] = useState<string | null>(null);
  const [pdfChoice, setPdfChoice] = useState<{ url: string; name: string } | null>(null);

  const totalBytes = items.reduce((sum, item) => sum + (item.sizeBytes || 0), 0);

  const upload = async (files: File[]) => {
    if (files.length === 0) return;
    setBusy(true);
    setStatus(null);
    setError(null);
    try {
      const added: MediaItem[] = [];
      const pdfs: MediaItem[] = [];
      let firstError: string | null = null;

      for (const file of files) {
        const body = new FormData();
        body.append('file', file);
        const dimensions = await probeDimensions(file);
        if (dimensions) body.append('dimensions', dimensions);

        try {
          const result = await uploadMediaAction(body);
          if (result.ok && result.item) {
            added.push(result.item);
            if (result.item.type === 'pdf') pdfs.push(result.item);
          } else {
            firstError = firstError ?? result.error ?? 'The upload did not go through.';
          }
        } catch {
          firstError = firstError ?? 'The upload did not go through.';
        }
      }

      if (added.length > 0) {
        setItems((list) => [...added, ...list]);
        setStatus(`Added ${added.length} file${added.length === 1 ? '' : 's'} to the library.`);
      }
      if (firstError) setError(firstError);

      // One question for the batch, naming the newest: per-file interrogation
      // turns a five-PDF upload into five prompts. A case-study attachment
      // must never hijack the CV link silently, so the choice is asked here.
      if (pdfs.length > 0) {
        const newest = pdfs[pdfs.length - 1];
        setPdfChoice({ url: newest.url, name: newest.name });
      }
    } finally {
      setBusy(false);
    }
  };

  const setAsResume = async (choice: { url: string; name: string }) => {
    if (busy) return;
    setBusy(true);
    setStatus(null);
    setError(null);
    try {
      const result = await updateResumeAction(choice.url, choice.name);
      if (result.ok) {
        setResume({ url: choice.url, filename: choice.name });
        setPdfChoice(null);
        setStatus(`"${choice.name}" is now the downloadable résumé.`);
      } else {
        setError(result.error ?? 'The change did not go through.');
      }
    } catch {
      setError('The change did not go through. Reload and try again.');
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = async (item: MediaItem) => {
    if (busy) return;
    setBusy(true);
    setStatus(null);
    setError(null);
    try {
      const result = await deleteMediaAction(item.id);
      if (result.ok) {
        setItems((list) => list.filter((m) => m.id !== item.id));
        setArmedDelete(null);
        if (result.warning) setError(result.warning);
        else setStatus(`Deleted "${item.name}".`);
      } else {
        setError(result.error ?? 'The delete did not go through.');
      }
    } catch {
      setError('The delete did not go through. Reload and try again.');
    } finally {
      setBusy(false);
    }
  };

  const copyReference = (item: MediaItem) => {
    const showCopied = () => {
      setCopiedId(item.id);
      window.setTimeout(
        () => setCopiedId((current) => (current === item.id ? null : current)),
        2000
      );
    };
    const explain = () =>
      setError(`The browser would not let the page copy. The reference is ${item.url}`);
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(item.url).then(showCopied).catch(explain);
    } else {
      explain();
    }
  };

  const deleteWarning = (item: MediaItem, uses: number) =>
    uses > 0
      ? `"${item.name}" is used in ${uses} place${uses === 1 ? '' : 's'} on the site. Deleting it will leave those images blank.`
      : `Delete "${item.name}"? This cannot be undone.`;

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <label
          className={`${primary} flex w-fit cursor-pointer items-center ${
            busy ? 'opacity-60' : ''
          }`}
          style={{ minHeight: 44 }}
        >
          <span>{busy ? 'Uploading…' : 'Upload assets'}</span>
          <input
            type="file"
            multiple
            accept="image/*,.pdf"
            className="hidden"
            disabled={busy}
            onChange={(event) => {
              const files = Array.from(event.target.files ?? []);
              event.target.value = '';
              void upload(files);
            }}
          />
        </label>
        <span className="text-sm text-text-secondary">
          {items.length} file{items.length === 1 ? '' : 's'} • {formatSize(totalBytes)} stored
          {resume.filename ? ` • résumé: ${resume.filename}` : ''}
        </span>
      </div>

      {pdfChoice ? (
        <div className="grid gap-2 rounded-2xl border border-border p-4">
          <p className="m-0 text-sm font-semibold">
            Use &ldquo;{pdfChoice.name}&rdquo; as your downloadable résumé?
          </p>
          <p className="m-0 text-sm text-text-secondary">
            Keeping it in the library leaves the current link unchanged.
          </p>
          <span className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => void setAsResume(pdfChoice)}
              disabled={busy}
              className={primary}
              style={{ minHeight: 44 }}
            >
              Use as résumé
            </button>
            <button
              type="button"
              onClick={() => setPdfChoice(null)}
              className={secondary}
              style={{ minHeight: 44 }}
            >
              Keep in library
            </button>
          </span>
        </div>
      ) : null}

      {status ? (
        <p role="status" className="m-0 text-sm text-text-secondary">
          {status}
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="m-0 text-sm text-danger">
          {error}
        </p>
      ) : null}

      {items.length === 0 ? (
        <p className="m-0 rounded-2xl border border-border p-4 text-sm text-text-secondary">
          Nothing in the library yet. Upload images or PDFs — each one becomes pickable from any
          image field in the admin.
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {items.map((item) => {
          const uses = usage[item.id] ?? 0;
          const isPdf = item.type === 'pdf';
          const armed = armedDelete === item.id;

          return (
            <article key={item.id} className="grid content-start gap-3 rounded-2xl border p-3">
              {/* Fixed height, not an aspect ratio: an aspect box grows with
                  the grid column, so on a wide screen the thumbnail became
                  the page. */}
              <div className="relative flex h-28 items-center justify-center overflow-hidden rounded-xl border border-border bg-surface-secondary">
                {isPdf ? (
                  <div className="max-w-full p-4 text-center">
                    <span className="font-mono text-xs uppercase tracking-widest text-text-muted">
                      PDF
                    </span>
                    <span className="mt-1 block truncate text-xs font-medium">{item.name}</span>
                  </div>
                ) : (
                  // Contain, not cover: in a library the point is to recognise
                  // the asset, and a cropped portrait is harder to place.
                  <img
                    src={item.url}
                    alt={item.altText || item.name}
                    className="max-h-full max-w-full object-contain p-2"
                  />
                )}

                <span className="absolute right-2 top-2 flex items-center gap-1">
                  {uses === 0 ? (
                    <span className="rounded-full border border-border bg-surface-primary px-2 py-0.5 text-xs text-text-muted">
                      unused
                    </span>
                  ) : null}
                  <span className="rounded-full border border-border bg-surface-primary px-2 py-0.5 text-xs text-text-muted">
                    {item.type.toUpperCase()}
                  </span>
                </span>
              </div>

              <div className="grid gap-2">
                <div className="min-w-0">
                  <h3 className="m-0 truncate text-sm font-semibold">{item.name}</h3>
                  <span className="text-xs text-text-muted">
                    {formatSize(item.sizeBytes)}
                    {item.dimensions ? ` • ${item.dimensions}` : ''} • used {uses}×
                  </span>
                </div>

                <span className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => copyReference(item)}
                    className={secondary}
                    title="Copy the reference to paste into an image field"
                    style={{ minHeight: 44 }}
                  >
                    {copiedId === item.id ? 'Copied' : 'Copy reference'}
                  </button>

                  {isPdf && resume.url === item.url ? (
                    <span className="text-xs text-text-muted">Current résumé</span>
                  ) : null}
                  {isPdf && resume.url !== item.url ? (
                    <button
                      type="button"
                      onClick={() => void setAsResume({ url: item.url, name: item.name })}
                      disabled={busy}
                      className={secondary}
                      style={{ minHeight: 44 }}
                    >
                      Use as résumé
                    </button>
                  ) : null}

                  {armed ? (
                    <>
                      <button
                        type="button"
                        onClick={() => void confirmDelete(item)}
                        disabled={busy}
                        className={danger}
                        style={{ minHeight: 44 }}
                      >
                        Delete asset
                      </button>
                      <button
                        type="button"
                        onClick={() => setArmedDelete(null)}
                        className={secondary}
                        style={{ minHeight: 44 }}
                      >
                        Keep it
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setArmedDelete(item.id)}
                      className={secondary}
                      style={{ minHeight: 44 }}
                    >
                      Delete
                    </button>
                  )}
                </span>
              </div>

              {armed ? (
                <p className="m-0 rounded-xl border border-danger bg-danger-subtle p-3 text-sm">
                  {deleteWarning(item, uses)}
                </p>
              ) : null}

              {item.url.startsWith('data:') ? (
                <p className="m-0 text-xs text-danger">
                  Legacy inline copy — re-upload to move it into blob storage.
                </p>
              ) : null}
            </article>
          );
        })}
      </div>
    </div>
  );
}
