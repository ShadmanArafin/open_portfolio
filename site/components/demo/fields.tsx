'use client';

import React from 'react';
import type { BlockField } from '@/core/blocks/fields';
import { getPath, setPath } from '../../../core/blocks/fields';

/**
 * The editor for one block, generated from the block's own field metadata.
 *
 * This is the same `BlockField[]` the real admin renders — the product
 * describes each block's editor as data precisely so that one form can render
 * all of them, and the payoff is visible here: the demo did not have to learn
 * anything about any particular block, and a block added to the product becomes
 * editable in this demo without a line changing.
 *
 * The controls themselves are the demo's own, because the admin's are built on
 * a design system this site does not carry. What is faithful is the *shape* —
 * which fields exist, what they are called, what help sits under them, and what
 * happens to the props when you type.
 */

const label: React.CSSProperties = {
  display: 'grid',
  gap: '0.35rem',
  fontSize: '0.8rem',
  fontWeight: 600,
  color: 'var(--ink)',
};

const control: React.CSSProperties = {
  width: '100%',
  minHeight: '2.5rem',
  padding: '0.5rem 0.7rem',
  border: '1px solid var(--rule-strong)',
  borderRadius: '2px',
  background: 'var(--card)',
  color: 'var(--ink)',
  font: 'inherit',
  fontSize: '0.85rem',
};

const help: React.CSSProperties = {
  fontSize: '0.75rem',
  fontWeight: 400,
  color: 'var(--ink-3)',
  lineHeight: 1.45,
};

export function FieldList({
  fields,
  props,
  onChange,
  depth = 0,
}: {
  fields: BlockField[];
  props: Record<string, unknown>;
  onChange: (next: Record<string, unknown>) => void;
  depth?: number;
}) {
  const write = (path: string, value: unknown) =>
    onChange(setPath(props, path, value) as Record<string, unknown>);

  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      {fields.map((field) => {
        const value = getPath(props, field.path);

        switch (field.kind) {
          case 'toggle':
            return (
              <label
                key={field.path}
                style={{ ...label, gridTemplateColumns: 'auto 1fr', alignItems: 'center' }}
              >
                <input
                  type="checkbox"
                  checked={Boolean(value)}
                  onChange={(e) => write(field.path, e.target.checked)}
                />
                <span>
                  {field.label}
                  {field.help && <span style={help}> — {field.help}</span>}
                </span>
              </label>
            );

          case 'choice':
            return (
              <label key={field.path} style={label}>
                {field.label}
                <select
                  style={control}
                  value={String(value ?? '')}
                  onChange={(e) =>
                    write(
                      field.path,
                      field.options.find((o) => String(o.value) === e.target.value)?.value
                    )
                  }
                >
                  {field.options.map((option) => (
                    <option key={String(option.value)} value={String(option.value)}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {field.help && <span style={help}>{field.help}</span>}
              </label>
            );

          case 'paragraphs':
          case 'lines':
            return (
              <label key={field.path} style={label}>
                {field.label}
                <textarea
                  style={{ ...control, minHeight: '5rem', resize: 'vertical' }}
                  value={
                    Array.isArray(value)
                      ? (value as string[]).join(field.kind === 'lines' ? '\n' : '\n\n')
                      : ''
                  }
                  onChange={(e) =>
                    write(
                      field.path,
                      e.target.value
                        .split(field.kind === 'lines' ? '\n' : /\n\s*\n/)
                        .map((line) => line.trim())
                        .filter(Boolean)
                    )
                  }
                />
                <span style={help}>
                  {field.help ??
                    (field.kind === 'lines' ? 'One per line.' : 'A blank line between paragraphs.')}
                </span>
              </label>
            );

          case 'textarea':
            return (
              <label key={field.path} style={label}>
                {field.label}
                <textarea
                  style={{ ...control, minHeight: '4rem', resize: 'vertical' }}
                  rows={field.rows}
                  value={typeof value === 'string' ? value : ''}
                  onChange={(e) => write(field.path, e.target.value)}
                />
                {field.help && <span style={help}>{field.help}</span>}
              </label>
            );

          case 'media':
            return (
              <div key={field.path} style={label}>
                {field.label}
                {/* The real thing opens the media library. Uploading is one of
                    the three things switched off in a demo — a public editor
                    with file upload is a free file host — so this says what it
                    would do instead of pretending. */}
                <div
                  style={{
                    ...control,
                    display: 'grid',
                    placeItems: 'center',
                    minHeight: '4rem',
                    borderStyle: 'dashed',
                    color: 'var(--ink-3)',
                    fontSize: '0.78rem',
                    textAlign: 'center',
                  }}
                >
                  Opens your media library. Uploading is switched off in the demo.
                </div>
              </div>
            );

          case 'list': {
            const items = Array.isArray(value) ? (value as Record<string, unknown>[]) : [];
            return (
              <div key={field.path} style={{ display: 'grid', gap: '0.6rem' }}>
                <span style={{ ...label, fontSize: '0.8rem' }}>{field.label}</span>
                {items.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      border: '1px solid var(--rule)',
                      borderRadius: '2px',
                      padding: '0.75rem',
                      display: 'grid',
                      gap: '0.75rem',
                      background: 'var(--paper)',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.7rem',
                        color: 'var(--ink-3)',
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                      }}
                    >
                      {field.itemNoun} {index + 1}
                    </span>
                    <FieldList
                      fields={field.fields}
                      props={item}
                      depth={depth + 1}
                      onChange={(next) => {
                        const copy = [...items];
                        copy[index] = next;
                        write(field.path, copy);
                      }}
                    />
                  </div>
                ))}
                {items.length === 0 && <span style={help}>None yet.</span>}
              </div>
            );
          }

          default:
            return (
              <label key={field.path} style={label}>
                {field.label}
                <input
                  style={control}
                  value={typeof value === 'string' ? value : ''}
                  placeholder={'placeholder' in field ? field.placeholder : undefined}
                  onChange={(e) => write(field.path, e.target.value)}
                />
                {field.help && <span style={help}>{field.help}</span>}
              </label>
            );
        }
      })}
    </div>
  );
}
