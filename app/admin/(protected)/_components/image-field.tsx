'use client';

import { useRef, useState } from 'react';
import type { MediaItem } from '@/cms/types/cms';
import { uploadMediaAction } from '../_actions/media';
import { probeDimensions } from './probe-dimensions';

const secondary =
  'rounded-full border border-border px-3 text-sm text-text-secondary hover:text-text-primary disabled:opacity-50';

/**
 * An image slot for the collection editors.
 *
 * Direct upload, like the screens this replaces: the file lands in the media
 * library described and sized, and the slot keeps the app's own URL. The block
 * editor's picker is deliberately not duplicated here; when the collections
 * want to choose an existing picture, this becomes the picker's value slot
 * rather than a second picker.
 */
export function ImageField({
  label,
  src,
  alt,
  uploadAlt,
  hint,
  onUploaded,
  onRemove,
}: {
  label: string;
  src: string;
  /** Alt text for the preview only; a new upload is described via `uploadAlt`. */
  alt: string;
  /** The description recorded in the media library when a file is uploaded. */
  uploadAlt: string;
  hint?: string;
  onUploaded: (item: MediaItem) => void;
  onRemove?: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    setBusy(true);
    setError(null);
    try {
      const body = new FormData();
      body.append('file', file);
      const dimensions = await probeDimensions(file);
      if (dimensions) body.append('dimensions', dimensions);
      if (uploadAlt) body.append('altText', uploadAlt);
      const result = await uploadMediaAction(body);
      if (result.ok && result.item) {
        onUploaded(result.item);
      } else {
        setError(result.error ?? 'The upload did not go through.');
      }
    } catch {
      setError('The upload did not go through.');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="grid gap-2">
      <span className="text-sm font-semibold">{label}</span>
      <span className="flex flex-wrap items-center gap-3">
        {src ? (
          <img
            src={src}
            alt={alt}
            className="h-14 w-14 rounded-lg border border-border object-cover"
          />
        ) : (
          <span aria-hidden className="h-14 w-14 rounded-lg border border-dashed border-border" />
        )}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className={secondary}
          style={{ minHeight: 44 }}
        >
          {busy ? 'Uploading…' : src ? 'Replace' : 'Upload'}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,.svg"
          aria-label={label}
          className="sr-only"
          disabled={busy}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void upload(file);
          }}
        />
        {src && onRemove ? (
          <button
            type="button"
            onClick={onRemove}
            disabled={busy}
            className={secondary}
            style={{ minHeight: 44 }}
          >
            Remove image
          </button>
        ) : null}
      </span>
      {hint ? <span className="text-sm text-text-secondary">{hint}</span> : null}
      {error ? (
        <span role="alert" className="text-sm text-danger">
          {error}
        </span>
      ) : null}
    </div>
  );
}
