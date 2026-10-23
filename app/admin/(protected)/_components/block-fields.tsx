'use client';

import { useState } from 'react';
import type { MediaItem } from '@/cms/types/cms';
import { getPath, setPath, type BlockField } from '@/core/blocks/fields';
import { uploadMediaAction } from '../_actions/media';
import { probeDimensions } from './probe-dimensions';
import { Suggest } from './assist';

/**
 * One form for every block type.
 *
 * Blocks describe their editor as data (see `core/blocks/fields.ts`); this
 * renders it. The alternative — an editor component per block — means the
 * thirtieth block type is a React file as well as a definition, and thirty
 * chances for two blocks to disagree about what a text field looks like.
 *
 * Everything writes through `setPath` onto a copy, so a block's props are
 * replaced rather than mutated. The media field lists the draft's media —
 * passed down from the page rather than fetched — and uploads go through the
 * media library's own action, so a file added here enters the library as well
 * as the picker.
 */

const field = 'w-full rounded-xl border border-border bg-surface-primary px-3 text-text-primary';
const secondary =
  'rounded-full border border-border px-3 text-sm text-text-secondary hover:text-text-primary disabled:opacity-50';

export function BlockFields({
  fields,
  props,
  onChange,
  media,
  prefix = '',
}: {
  fields: BlockField[];
  props: unknown;
  onChange: (next: unknown) => void;
  media: MediaItem[];
  prefix?: string;
}) {
  const render = (definition: BlockField) => (
    <OneField
      key={definition.path}
      definition={definition}
      props={props}
      onChange={onChange}
      media={media}
      prefix={prefix}
    />
  );
  const essential = fields.filter((definition) => !definition.advanced);
  const advanced = fields.filter((definition) => definition.advanced);
  // Nothing to fold away when a block is all options (a spacer) or has one.
  if (essential.length === 0 || advanced.length === 0) {
    return <div className="grid gap-3">{fields.map(render)}</div>;
  }
  return (
    <div className="grid gap-3">
      {essential.map(render)}
      <details className="group rounded-xl border border-border">
        <summary
          className="flex cursor-pointer list-none items-center gap-2 px-3 text-sm text-text-secondary hover:text-text-primary"
          style={{ minHeight: 44 }}
        >
          <span aria-hidden className="transition-transform group-open:rotate-90">
            ›
          </span>
          More options
          <span className="text-text-muted">({advanced.length})</span>
        </summary>
        <div className="grid gap-3 px-3 pb-3">{advanced.map(render)}</div>
      </details>
    </div>
  );
}

function TextField({
  label,
  help,
  value,
  onChange,
  rows,
  placeholder,
}: {
  label: string;
  help?: string;
  value: string;
  onChange: (value: string) => void;
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
      {help ? <span className="text-text-secondary">{help}</span> : null}
    </label>
  );
}

function ToggleField({
  label,
  help,
  checked,
  onChange,
}: {
  label: string;
  help?: string;
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
        {help ? <span className="block font-normal text-text-secondary">{help}</span> : null}
      </span>
    </label>
  );
}

function altFullPath(prefix: string, altPath: string): string {
  return prefix ? `${prefix}.${altPath}` : altPath;
}

function OneField({
  definition,
  props,
  onChange,
  media,
  prefix,
}: {
  definition: BlockField;
  props: unknown;
  onChange: (next: unknown) => void;
  media: MediaItem[];
  prefix: string;
}) {
  const path = prefix ? `${prefix}.${definition.path}` : definition.path;
  const value = getPath(props, path);
  const write = (next: unknown) => onChange(setPath(props, path, next));

  switch (definition.kind) {
    case 'list':
      return (
        <ListField
          definition={definition}
          props={props}
          onChange={onChange}
          media={media}
          path={path}
        />
      );

    case 'toggle':
      return (
        <ToggleField
          label={definition.label}
          help={definition.help}
          checked={Boolean(value)}
          onChange={(checked) => write(checked)}
        />
      );

    case 'media':
      return (
        <MediaField
          definition={definition}
          value={String(value ?? '')}
          altValue={
            definition.altPath
              ? String(getPath(props, altFullPath(prefix, definition.altPath)) ?? '')
              : ''
          }
          media={media}
          onPick={(choice) => {
            let next = setPath(props, path, choice.url);
            // Both halves at once. The description was written about this
            // picture, a moment ago, with it on screen — carrying it back to a
            // separate field the person has to find is how alt text goes unwritten.
            if (definition.altPath) {
              next = setPath(next, altFullPath(prefix, definition.altPath), choice.altText);
            }
            onChange(next);
          }}
        />
      );

    case 'choice':
      return (
        <label className="grid gap-1 text-sm">
          <span className="font-semibold">{definition.label}</span>
          <select
            value={value === undefined ? '' : String(value)}
            onChange={(event) =>
              // Options carry their real type; a select only speaks strings, and
              // handing "3" to a schema that expects 3 quarantines the block.
              write(
                definition.options.find((option) => String(option.value) === event.target.value)
                  ?.value
              )
            }
            className={field}
            style={{ minHeight: 44 }}
          >
            {definition.options.map((option) => (
              <option key={String(option.value)} value={String(option.value)}>
                {option.label}
              </option>
            ))}
          </select>
          {definition.help ? <span className="text-text-secondary">{definition.help}</span> : null}
        </label>
      );

    case 'paragraphs':
      return (
        <TextField
          label={definition.label}
          help={definition.help ?? 'Leave a blank line between paragraphs.'}
          rows={8}
          value={Array.isArray(value) ? (value as string[]).join('\n\n') : ''}
          onChange={(next) =>
            write(
              next
                .split(/\n\s*\n/)
                .map((paragraph) => paragraph.trim())
                .filter(Boolean)
            )
          }
        />
      );

    case 'lines':
      return (
        <TextField
          label={definition.label}
          help={definition.help ?? 'One per line.'}
          rows={5}
          value={Array.isArray(value) ? (value as string[]).join('\n') : ''}
          onChange={(next) =>
            write(
              next
                .split('\n')
                .map((line) => line.trim())
                .filter(Boolean)
            )
          }
        />
      );

    case 'textarea':
      return (
        <TextField
          label={definition.label}
          help={definition.help}
          rows={definition.rows ?? 3}
          value={String(value ?? '')}
          onChange={(next) => write(next)}
        />
      );

    default:
      return (
        <TextField
          label={definition.label}
          help={definition.help}
          placeholder={definition.placeholder}
          value={String(value ?? '')}
          onChange={(next) => write(next)}
        />
      );
  }
}

/**
 * An image slot: what is there now, and a way to change it.
 *
 * Opening a picker rather than a file dialog is the whole point. A file dialog
 * can only ever add another copy of a picture that is already in the library.
 */
function MediaField({
  definition,
  value,
  altValue,
  onPick,
  media,
}: {
  definition: Extract<BlockField, { kind: 'media' }>;
  value: string;
  altValue: string;
  onPick: (choice: { url: string; altText: string }) => void;
  media: MediaItem[];
}) {
  const [open, setOpen] = useState(false);
  const [uploaded, setUploaded] = useState<MediaItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [altDraft, setAltDraft] = useState(altValue);

  const items = [...uploaded, ...media].filter(
    (item) => item.type === 'image' || item.type === 'svg'
  );

  const upload = async (file: File) => {
    setBusy(true);
    setStatus(null);
    try {
      const body = new FormData();
      body.append('file', file);
      const dimensions = await probeDimensions(file);
      if (dimensions) body.append('dimensions', dimensions);
      // The description typed above travels with the file, so the library
      // entry is described from its first moment too.
      if (altDraft) body.append('altText', altDraft);
      const result = await uploadMediaAction(body);
      if (result.ok && result.item) {
        const item = result.item;
        setUploaded((list) => [item, ...list]);
        onPick({ url: item.url, altText: altDraft || item.altText || item.name });
        setStatus('Uploaded and chosen.');
      } else {
        setStatus(result.error ?? 'The upload did not go through.');
      }
    } catch {
      setStatus('The upload did not go through.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-2">
      <span className="text-sm font-semibold">{definition.label}</span>
      <span className="flex items-center gap-3">
        {value ? (
          <img
            src={value}
            alt={altValue}
            className="h-14 w-14 rounded-lg border border-border object-cover"
          />
        ) : (
          <span aria-hidden className="h-14 w-14 rounded-lg border border-dashed border-border" />
        )}
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className={secondary}
          style={{ minHeight: 44 }}
        >
          {value ? 'Change image' : 'Choose an image'}
        </button>
      </span>
      {definition.help ? (
        <span className="text-sm text-text-secondary">{definition.help}</span>
      ) : null}

      {open ? (
        <div className="grid gap-3 rounded-xl border border-border p-3">
          <label className="grid gap-1 text-sm">
            <span className="font-semibold">Image description (alt text)</span>
            <input
              type="text"
              value={altDraft}
              onChange={(event) => setAltDraft(event.target.value)}
              className={field}
              style={{ minHeight: 44 }}
            />
            <span className="text-text-secondary">
              Read aloud to people who cannot see the picture.
            </span>
          </label>
          {value ? (
            <Suggest
              task="alt"
              source={() => ({ imageUrl: value })}
              onUse={(text) => {
                setAltDraft(text);
                onPick({ url: value, altText: text });
              }}
            />
          ) : null}

          {items.length > 0 ? (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onPick({ url: item.url, altText: item.altText || altDraft || item.name });
                    setOpen(false);
                  }}
                  className="grid gap-1 rounded-lg border border-border p-1 text-left"
                >
                  <img
                    src={item.url}
                    alt={item.altText || item.name}
                    className="h-16 w-full rounded object-cover"
                  />
                  <span className="truncate text-xs text-text-secondary">{item.name}</span>
                </button>
              ))}
            </div>
          ) : (
            <p className="m-0 text-sm text-text-secondary">
              No images in the library yet. Upload one below.
            </p>
          )}

          <label className="flex min-h-[44px] w-fit cursor-pointer items-center">
            <span className="rounded-full border border-border px-3 py-2 text-sm text-text-secondary">
              {busy ? 'Uploading…' : 'Upload an image'}
            </span>
            <input
              type="file"
              accept="image/*,.svg"
              className="hidden"
              disabled={busy}
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = '';
                if (file) void upload(file);
              }}
            />
          </label>

          {status ? (
            <p role="status" className="m-0 text-sm text-text-secondary">
              {status}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

/**
 * A repeating group — gallery images, buttons, cards.
 *
 * `min` and `max` are enforced by not offering the control rather than by
 * refusing afterwards. A delete button that removes nothing and then explains
 * why is worse than no delete button.
 */
function ListField({
  definition,
  props,
  onChange,
  media,
  path,
}: {
  definition: Extract<BlockField, { kind: 'list' }>;
  props: unknown;
  onChange: (next: unknown) => void;
  media: MediaItem[];
  path: string;
}) {
  const items = (getPath(props, path) as unknown[] | undefined) ?? [];

  const replace = (next: unknown[]) => onChange(setPath(props, path, next));
  const move = (index: number, by: number) => {
    const target = index + by;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    replace(next);
  };

  const atMax = definition.max !== undefined && items.length >= definition.max;
  const atMin = items.length <= (definition.min ?? 0);

  return (
    <div className="grid gap-3 rounded-xl border border-border p-3">
      <span className="font-semibold text-sm">{definition.label}</span>
      {definition.help ? (
        <span className="text-sm text-text-secondary">{definition.help}</span>
      ) : null}

      {items.map((_, index) => {
        const title = getPath(props, `${path}.${index}.${definition.titlePath}`);
        return (
          <div key={index} className="grid gap-3 rounded-xl border border-border p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="truncate text-sm text-text-muted">
                {definition.itemNoun} {index + 1}
                {typeof title === 'string' && title ? ` — ${title}` : ''}
              </span>
              <span className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  className={secondary}
                  style={{ minHeight: 44 }}
                >
                  Up
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === items.length - 1}
                  className={secondary}
                  style={{ minHeight: 44 }}
                >
                  Down
                </button>
                {!atMin ? (
                  <button
                    type="button"
                    onClick={() => replace(items.filter((_, i) => i !== index))}
                    className={secondary}
                    style={{ minHeight: 44 }}
                  >
                    Remove
                  </button>
                ) : null}
              </span>
            </div>

            <BlockFields
              fields={definition.fields}
              props={props}
              onChange={onChange}
              media={media}
              prefix={`${path}.${index}`}
            />
          </div>
        );
      })}

      {!atMax ? (
        <button
          type="button"
          onClick={() => replace([...items, definition.newItem()])}
          className={secondary}
          style={{ minHeight: 44 }}
        >
          Add {definition.itemNoun}
        </button>
      ) : null}
    </div>
  );
}
