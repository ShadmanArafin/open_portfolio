'use client';

import { useState } from 'react';
import type { MediaItem } from '@/cms/types/cms';
import {
  getBlockDefinition,
  listBlockDefinitions,
  parsePage,
  runBlockChecks,
} from '@/core/blocks/lookup';
import type { Block } from '@/core/blocks/schema';
import { BlockFields } from './block-fields';
import { newId } from './ids';

/**
 * The block editor, shared by pages and writing.
 *
 * Writing uses the same editor as pages deliberately: a piece that wants a
 * gallery or a pull quote should not need a parallel editor, a parallel
 * renderer and a parallel set of bugs. Labels, fields, defaults and the
 * content checks all come from the registry the public site renders from, so
 * a new block type appears here the day it renders.
 *
 * A list, not a canvas: an outline is keyboard-operable, works on a phone and
 * can be tested, and nothing here can produce an arrangement that looks
 * broken — a block chooses what it says, the theme chooses what it looks like.
 */

const secondary =
  'rounded-full border border-border px-3 text-sm text-text-secondary hover:text-text-primary disabled:opacity-50';
const danger = 'rounded-full bg-danger px-3 text-sm font-semibold text-bg disabled:opacity-50';

const PALETTE_GROUPS: { id: string; label: string }[] = [
  { id: 'identity', label: 'Say who you are' },
  { id: 'work', label: 'Show your work' },
  { id: 'credentials', label: 'Back it up' },
  { id: 'conversion', label: 'Ask for something' },
  { id: 'utility', label: 'Everything else' },
];

const DEFINITIONS = listBlockDefinitions();

function blockSummary(block: Block): string {
  const props = block.props as Record<string, unknown>;
  for (const key of ['headline', 'heading', 'title', 'caption']) {
    const value = props?.[key];
    if (typeof value === 'string' && value.trim()) return value;
  }
  const paragraphs = props?.paragraphs;
  if (Array.isArray(paragraphs) && typeof paragraphs[0] === 'string') return paragraphs[0];
  return '';
}

export function BlocksEditor({
  blocks,
  onChange,
  media,
}: {
  blocks: unknown[];
  onChange: (blocks: unknown[]) => void;
  media: MediaItem[];
}) {
  const [removeBlockArmed, setRemoveBlockArmed] = useState<string | null>(null);
  const parsed = parsePage(blocks);

  const setBlocks = (mutate: (blocks: unknown[]) => unknown[]) => onChange(mutate([...blocks]));

  const addBlock = (type: string) => {
    const definition = getBlockDefinition(type);
    if (!definition) return;
    setBlocks((list) => [
      ...list,
      {
        id: newId('block'),
        type: definition.type,
        v: definition.version,
        props: definition.defaults(),
      },
    ]);
  };

  const moveBlock = (index: number, by: number) =>
    setBlocks((list) => {
      const target = index + by;
      if (target < 0 || target >= list.length) return list;
      [list[index], list[target]] = [list[target], list[index]];
      return list;
    });

  const toggleBlockHidden = (index: number) =>
    setBlocks((list) => {
      const block = list[index] as { hidden?: boolean };
      list[index] = { ...block, hidden: !block.hidden };
      return list;
    });

  return (
    <div className="grid gap-3">
      {parsed.length === 0 ? (
        <p className="m-0 text-sm text-text-secondary">Nothing here yet. Add a block below.</p>
      ) : (
        parsed.map((entry, index) => {
          const id = entry.kind === 'block' ? entry.block.id : entry.id;
          const definition =
            entry.kind === 'block' ? getBlockDefinition(entry.block.type) : undefined;
          const warnings = runBlockChecks(entry);

          return (
            <div key={id} className="grid gap-3 rounded-xl border border-border p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold">
                    {definition?.label ?? 'Not readable'}
                  </span>
                  {definition && entry.kind === 'block' ? (
                    <span className="max-w-[24ch] truncate text-xs text-text-muted">
                      {blockSummary(entry.block)}
                    </span>
                  ) : null}
                  {warnings.length > 0 ? (
                    <span className="rounded-full border border-border px-2 text-xs text-text-muted">
                      {warnings.length} to look at
                    </span>
                  ) : null}
                </span>
                <span className="flex flex-wrap items-center gap-2">
                  {entry.kind === 'block' ? (
                    <label className="flex min-h-[44px] cursor-pointer items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={!entry.block.hidden}
                        onChange={() => toggleBlockHidden(index)}
                        className="h-5 w-5"
                      />
                      <span className="text-text-secondary">
                        {entry.block.hidden ? 'Hidden' : 'Visible'}
                      </span>
                    </label>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => moveBlock(index, -1)}
                    disabled={index === 0}
                    className={secondary}
                    style={{ minHeight: 44 }}
                  >
                    Move up
                  </button>
                  <button
                    type="button"
                    onClick={() => moveBlock(index, 1)}
                    disabled={index === parsed.length - 1}
                    className={secondary}
                    style={{ minHeight: 44 }}
                  >
                    Move down
                  </button>
                  {removeBlockArmed === id ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setBlocks((list) => list.filter((_, i) => i !== index));
                          setRemoveBlockArmed(null);
                        }}
                        className={danger}
                        style={{ minHeight: 44 }}
                      >
                        Remove it
                      </button>
                      <button
                        type="button"
                        onClick={() => setRemoveBlockArmed(null)}
                        className={secondary}
                        style={{ minHeight: 44 }}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setRemoveBlockArmed(id)}
                      className={secondary}
                      style={{ minHeight: 44 }}
                    >
                      Remove block
                    </button>
                  )}
                </span>
              </div>

              {entry.kind === 'unknown' ? (
                <p className="m-0 rounded-xl border border-danger bg-danger-subtle p-3 text-sm">
                  This block cannot be shown here. {entry.reason} It is kept exactly as it is, and
                  will work again on a version that understands it.
                </p>
              ) : (
                <div className="grid gap-3">
                  {warnings.map((warning) => (
                    <p
                      key={warning}
                      className="m-0 rounded-xl border border-border bg-surface-secondary p-3 text-sm text-text-secondary"
                    >
                      {warning}
                    </p>
                  ))}
                  {definition ? (
                    <BlockFields
                      fields={definition.fields}
                      props={entry.block.props}
                      onChange={(next) =>
                        setBlocks((list) => {
                          list[index] = {
                            ...(list[index] as Record<string, unknown>),
                            props: next,
                          };
                          return list;
                        })
                      }
                      media={media}
                    />
                  ) : null}
                </div>
              )}
            </div>
          );
        })
      )}

      <div className="grid gap-3 rounded-xl border border-border p-3">
        <span className="text-sm font-semibold">Add a block</span>
        {PALETTE_GROUPS.map((group) => {
          const inGroup = DEFINITIONS.filter((definition) => definition.group === group.id);
          if (inGroup.length === 0) return null;
          return (
            <div key={group.id} className="grid gap-2">
              <span className="text-sm text-text-secondary">{group.label}</span>
              <span className="flex flex-wrap gap-2">
                {inGroup.map((definition) => (
                  <button
                    key={definition.type}
                    type="button"
                    title={definition.description}
                    onClick={() => addBlock(definition.type)}
                    className={secondary}
                    style={{ minHeight: 44 }}
                  >
                    {definition.label}
                  </button>
                ))}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
