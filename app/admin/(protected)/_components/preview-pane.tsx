'use client';

import { useState } from 'react';

const WIDTHS = [
  { id: 'phone', label: 'Phone', width: 390 },
  { id: 'tablet', label: 'Tablet', width: 768 },
  { id: 'full', label: 'Full', width: null },
] as const;

/**
 * The page, beside the editor that changes it.
 *
 * Preview used to be a new tab: edit, save, switch tabs, reload, look, switch
 * back — for every change, on the screen whose whole purpose is arranging what
 * a page looks like. Docked here, it sits next to the outline on a wide
 * screen and reloads itself after each Save (`version` is bumped by the
 * editor), so the loop is edit, save, look.
 *
 * It shows what is *saved*, because the preview is the real page rendering the
 * draft from storage (`/api/preview`, owner-only draft mode) — not a second
 * renderer in the browser that could disagree with the site. The note says so.
 * Wide screens only: on anything narrower there is no room beside the editor,
 * and the "Preview this page" tab still works.
 */
export function PreviewPane({
  path,
  version,
  onClose,
}: {
  path: string;
  version: number;
  onClose: () => void;
}) {
  const [width, setWidth] = useState<(typeof WIDTHS)[number]['id']>('full');
  const pixels = WIDTHS.find((option) => option.id === width)?.width;

  return (
    <aside
      aria-label="Preview"
      className="fixed inset-y-0 right-0 z-40 hidden w-[45vw] flex-col border-l border-border bg-bg xl:flex"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-2">
        <p className="m-0 text-sm text-text-secondary">
          Preview of <span className="font-mono text-text-primary">{path}</span> — what is saved. It
          reloads when you save.
        </p>
        <div className="flex items-center gap-2">
          <div role="group" aria-label="Preview width" className="flex gap-1">
            {WIDTHS.map((option) => (
              <button
                key={option.id}
                type="button"
                aria-pressed={width === option.id}
                onClick={() => setWidth(option.id)}
                className={`rounded-full border px-3 text-sm ${
                  width === option.id
                    ? 'border-text-primary text-text-primary'
                    : 'border-border text-text-secondary'
                }`}
                style={{ minHeight: 44 }}
              >
                {option.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-border px-3 text-sm text-text-secondary hover:text-text-primary"
            style={{ minHeight: 44 }}
          >
            Close preview
          </button>
        </div>
      </div>
      <div className="flex flex-1 justify-center overflow-auto bg-surface-secondary p-3">
        <iframe
          key={`${path}-${version}`}
          title={`Preview of ${path}`}
          src={`/api/preview?path=${encodeURIComponent(path)}`}
          className="h-full rounded-xl border border-border bg-bg"
          style={{ width: pixels ? `${pixels}px` : '100%', maxWidth: '100%' }}
        />
      </div>
    </aside>
  );
}
