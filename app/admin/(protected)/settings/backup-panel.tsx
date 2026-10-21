'use client';

import { useRef, useState } from 'react';
import { resetContentAction } from '../_actions/settings';

interface RestoreOutcome {
  ok?: boolean;
  error?: string;
  restored?: {
    published: boolean;
    draft: boolean;
    manifestEntries: number;
    filesPresent: number;
    filesMissing: number;
    filesRestored?: number;
    filesRefused?: number;
  };
  note?: string;
}

const secondary =
  'rounded-full border border-border px-4 text-sm text-text-secondary hover:text-text-primary disabled:opacity-50';
const danger = 'rounded-full bg-danger px-4 text-sm font-semibold text-bg disabled:opacity-50';

/**
 * Backup & restore, on the server bundle.
 *
 * The legacy General panel backed up the browser's draft store. This one uses
 * `/api/admin/backup`, which covers the published snapshot as well — the file
 * is the whole site — and reports which media files the bytes need to
 * accompany. Export is a plain link: authenticated by the session cookie,
 * which is what makes it work from a phone. Restore and reset both arm
 * inline before doing anything: typed gate for the reset, the file's own name
 * for the import.
 */
export function BackupPanel() {
  const fileInput = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingImport, setPendingImport] = useState<{ name: string; file: File } | null>(null);
  const [resetArmed, setResetArmed] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const runImport = async () => {
    if (!pendingImport) return;
    setBusy(true);
    setNote(null);
    setError(null);
    try {
      const res = await fetch('/api/admin/backup', {
        method: 'POST',
        headers: {
          'Content-Type': pendingImport.name.toLowerCase().endsWith('.zip')
            ? 'application/zip'
            : 'application/json',
        },
        body: pendingImport.file,
      });
      const body = (await res.json().catch(() => ({}))) as RestoreOutcome;
      if (res.ok && body.ok && body.restored) {
        const r = body.restored;
        setNote(
          `Restored: ${[r.published ? 'published site' : null, r.draft ? 'draft' : null]
            .filter(Boolean)
            .join(' and ')}. Media manifest: ${r.filesPresent} of ${
            r.manifestEntries
          } file${r.manifestEntries === 1 ? '' : 's'} present in storage${
            r.filesMissing > 0 ? `, ${r.filesMissing} missing` : ''
          }${r.filesRestored ? `; ${r.filesRestored} put back from the archive` : ''}${
            r.filesRefused ? `; ${r.filesRefused} refused as not a usable file` : ''
          }.`
        );
      } else {
        setError(body.error ?? 'The restore did not go through.');
      }
    } catch {
      setError('The restore did not go through. Reload and try again.');
    } finally {
      setBusy(false);
      setPendingImport(null);
    }
  };

  const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setNote(null);
    setError(null);
    setPendingImport({ name: file.name, file });
  };

  const handleReset = async () => {
    setBusy(true);
    setNote(null);
    setError(null);
    try {
      const result = await resetContentAction();
      if (result.ok) {
        setNote('Content restored to the built-in defaults. Reloading…');
        // The published site just changed under every cached render.
        window.setTimeout(() => window.location.reload(), 600);
      } else {
        setError(result.error ?? 'The reset did not go through.');
      }
    } catch {
      setError('The reset did not go through. Reload and try again.');
    } finally {
      setBusy(false);
      setResetArmed(false);
      setConfirmText('');
    }
  };

  return (
    <section
      aria-label="Backup & restore"
      className="grid gap-4 rounded-2xl border border-border p-4"
    >
      <div>
        <h2 className="m-0 text-xl">Backup &amp; restore</h2>
        <p className="m-0 mt-1 text-sm text-text-secondary">
          <strong className="text-text-primary">Download everything</strong> is your whole site in
          one .zip — content, publish history and every picture — and restores onto this install or
          any other, whatever storage it uses. The content-only JSON is smaller and leaves your
          pictures where they are. A static copy is the published site as plain HTML for any static
          host, in case you ever leave this app. Restoring replaces your published site and draft.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <a
          href="/api/admin/backup?format=zip"
          className="inline-flex rounded-full bg-text-primary px-4 text-sm font-semibold text-bg no-underline"
          style={{ minHeight: 44, alignItems: 'center' }}
        >
          Download everything (.zip)
        </a>
        <a
          href="/api/admin/backup"
          className={`${secondary} inline-flex no-underline`}
          style={{ minHeight: 44, alignItems: 'center' }}
        >
          Content only (.json)
        </a>
        <a
          href="/api/admin/export-static"
          className={`${secondary} inline-flex no-underline`}
          style={{ minHeight: 44, alignItems: 'center' }}
        >
          Static copy (.zip)
        </a>

        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          disabled={busy}
          className={secondary}
          style={{ minHeight: 44 }}
        >
          Restore from file
        </button>
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json,application/zip,.zip"
          className="hidden"
          onChange={(e) => void handleFile(e)}
        />

        <button
          type="button"
          onClick={() => setResetArmed(true)}
          disabled={busy}
          className={danger}
          style={{ minHeight: 44 }}
        >
          Reset to defaults
        </button>
      </div>

      {pendingImport ? (
        <div className="grid gap-3 rounded-2xl border border-border bg-surface-secondary p-3">
          <p className="m-0 text-sm">
            Restore <strong>{pendingImport.name}</strong>? This replaces your published site and
            your draft with the file&apos;s content — the whole site, in one move.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void runImport()}
              disabled={busy}
              className={danger}
              style={{ minHeight: 44 }}
            >
              {busy ? 'Restoring…' : 'Restore this file'}
            </button>
            <button
              type="button"
              onClick={() => setPendingImport(null)}
              className={secondary}
              style={{ minHeight: 44 }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {resetArmed ? (
        <div className="grid gap-3 rounded-2xl border border-border bg-surface-secondary p-3">
          <p className="m-0 text-sm">
            This restores the original built-in demo content to both your draft and your published
            site, deleting your edits. Uploaded media files are not deleted, but stop being
            referenced. It cannot be undone — export first if you are unsure.
          </p>
          <label className="grid max-w-[240px] gap-1 text-sm">
            <span className="font-semibold">Type RESET to confirm</span>
            <input
              type="text"
              value={confirmText}
              onChange={(event) => setConfirmText(event.target.value)}
              className="rounded-xl border border-border bg-surface-primary px-3 text-text-primary"
              style={{ minHeight: 44 }}
            />
          </label>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void handleReset()}
              disabled={busy || confirmText !== 'RESET'}
              className={danger}
              style={{ minHeight: 44 }}
            >
              {busy ? 'Resetting…' : 'Reset everything'}
            </button>
            <button
              type="button"
              onClick={() => {
                setResetArmed(false);
                setConfirmText('');
              }}
              className={secondary}
              style={{ minHeight: 44 }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

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
    </section>
  );
}
