'use client';

import { useRef, useState } from 'react';
import type { VisualArtifactItem } from '@/cms/types/cms';
import { updateArtifactsAction } from '../_actions/collections';
import { uploadMediaAction } from '../_actions/media';
import { CollectionEditor } from '../_components/collection-editor';
import { artifactsCsv } from '@/core/import/csv-templates';
import { CheckField, Field, SelectField } from '../_components/form-fields';
import { newId } from '../_components/ids';
import { ImageField } from '../_components/image-field';
import { probeDimensions } from '../_components/probe-dimensions';

const CATEGORIES = [
  { value: 'ui', label: 'UI' },
  { value: 'systems', label: 'Systems' },
  { value: 'mobile', label: 'Mobile' },
];

/**
 * Upload-first, like the legacy screen: it had no "add" button at all — you
 * picked one or more files and each became an artifact, `alt` taken from the
 * media library's caption. The shell's add control is replaced with the same
 * thing, and a batch keeps the order the files were chosen. Uploads reach
 * the media library right away; they join the draft when Save runs.
 */
function UploadImages({ add }: { add: (items: VisualArtifactItem[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const uploadAll = async (files: File[]) => {
    setBusy(true);
    setNote(null);
    setError(null);
    const added: VisualArtifactItem[] = [];
    let failed = 0;
    for (const [index, file] of files.entries()) {
      if (files.length > 1) setNote(`Uploading ${index + 1} of ${files.length}…`);
      try {
        const body = new FormData();
        body.append('file', file);
        const dimensions = await probeDimensions(file);
        if (dimensions) body.append('dimensions', dimensions);
        const result = await uploadMediaAction(body);
        if (result.ok && result.item) {
          added.push({
            id: newId('art'),
            category: 'ui',
            src: result.item.url,
            alt: result.item.altText,
            sortOrder: added.length + 1,
            visible: true,
          });
        } else {
          failed += 1;
        }
      } catch {
        failed += 1;
      }
    }
    if (added.length > 0) add(added);
    setBusy(false);
    setNote(
      added.length > 0 ? `Added ${added.length} image${added.length === 1 ? '' : 's'}.` : null
    );
    if (failed > 0) {
      setError(`${failed} upload${failed === 1 ? '' : 's'} did not go through.`);
    }
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="rounded-full bg-text-primary px-4 text-sm font-semibold text-bg disabled:opacity-50"
        style={{ minHeight: 44 }}
      >
        {busy ? 'Uploading…' : 'Upload images'}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        aria-label="Upload images"
        className="sr-only"
        disabled={busy}
        onChange={(event) => {
          const files = [...(event.target.files ?? [])];
          if (files.length > 0) void uploadAll(files);
        }}
      />
      {error ? (
        <span role="alert" className="text-sm text-danger">
          {error}
        </span>
      ) : note ? (
        <span role="status" className="text-sm text-text-secondary">
          {note}
        </span>
      ) : null}
    </>
  );
}

/**
 * Interface shots for the visual explorations gallery.
 *
 * The gallery is not fed by a block yet — only the About page reads this
 * list, filtered by `visible` and sorted by hand here — so the screen keeps
 * the legacy semantics rather than inventing new ones.
 */
export function ArtifactsBuilder({
  initialArtifacts,
  token,
}: {
  initialArtifacts: VisualArtifactItem[];
  token?: string;
}) {
  return (
    <CollectionEditor<VisualArtifactItem>
      token={token}
      initialItems={initialArtifacts}
      addLabel="Upload images"
      emptyTitle="No visual explorations yet."
      emptyHint="Upload one or more images to fill the gallery on your About page."
      deleteLabel="Delete artifact"
      deleteWarning="The artifact leaves your draft, wherever it was shown. This cannot be undone without restoring a version."
      title={(item) => item.alt}
      badge={(item) => ({ label: item.category.toUpperCase(), live: false })}
      leading={(item) =>
        item.src ? (
          <img
            src={item.src}
            alt=""
            className="h-12 w-12 rounded-lg border border-border object-cover"
          />
        ) : (
          <span aria-hidden className="h-12 w-12 rounded-lg border border-dashed border-border" />
        )
      }
      csv={artifactsCsv}
      create={(items) => ({
        id: newId('art'),
        category: 'ui',
        src: '',
        alt: '',
        sortOrder: items.length + 1,
        visible: true,
      })}
      duplicate={(item) => ({ ...structuredClone(item), id: newId('art') })}
      customAdd={(add) => <UploadImages add={add} />}
      save={async (artifacts, token) => {
        const result = await updateArtifactsAction(artifacts, token);
        return {
          ok: result.ok,
          error: result.error,
          conflict: result.conflict,
          token: result.token,
          items: result.artifacts,
        };
      }}
      renderFields={(item, mutate) => (
        <>
          <ImageField
            label="Image"
            src={item.src}
            alt={item.alt}
            uploadAlt={item.alt || 'Visual artifact'}
            onUploaded={(media) => mutate((current) => ({ ...current, src: media.url }))}
          />
          <Field
            label="Alt text"
            value={item.alt}
            onChange={(value) => mutate((current) => ({ ...current, alt: value }))}
            hint="Describes the image for screen readers and search engines."
          />
          <SelectField
            label="Category"
            value={item.category}
            options={CATEGORIES}
            onChange={(value) =>
              mutate((current) => ({
                ...current,
                category: value as VisualArtifactItem['category'],
              }))
            }
          />
          <CheckField
            label="Visible"
            description="Hidden artifacts stay in the draft but leave the gallery."
            checked={item.visible}
            onChange={(checked) => mutate((current) => ({ ...current, visible: checked }))}
          />
        </>
      )}
    />
  );
}
