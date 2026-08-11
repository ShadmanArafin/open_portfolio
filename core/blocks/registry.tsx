import React from 'react';
import { HeadingLevel } from '../primitives';
import { BLOCK_DEFINITIONS } from './definitions';
import { parseBlocks, type ParseContext } from './parse';
import type { BlockDefinition, ParsedBlock } from './schema';

/**
 * The block registry and the page renderer.
 *
 * Adding a block type is one file plus one entry in `BLOCK_DEFINITIONS`. If it
 * ever requires touching this file, the abstraction has failed.
 */

const byType = new Map<string, BlockDefinition<never>>();
for (const definition of BLOCK_DEFINITIONS) {
  if (byType.has(definition.type)) {
    // Two definitions claiming one type is a programming error that would
    // otherwise show up as blocks silently rendering as the wrong thing.
    throw new Error(`Duplicate block type registered: "${definition.type}"`);
  }
  byType.set(definition.type, definition);
}

export function getBlockDefinition(type: string): BlockDefinition<never> | undefined {
  return byType.get(type);
}

export function listBlockDefinitions(): BlockDefinition<never>[] {
  return [...byType.values()];
}

export const parseContext: ParseContext = { getDefinition: getBlockDefinition };

export function parsePage(raw: unknown): ParsedBlock[] {
  return parseBlocks(raw, parseContext);
}

/**
 * Renders one parsed block.
 *
 * A quarantined block renders nothing on the public site. Showing a visitor
 * "this block could not be read" tells them about our problem; the editor is
 * where that belongs, and `ParsedBlock` carries the reason for it.
 */
function RenderOne({ entry }: { entry: ParsedBlock }) {
  if (entry.kind === 'unknown') return null;

  const { block } = entry;
  if (block.hidden) return null;

  const definition = getBlockDefinition(block.type);
  if (!definition) return null;

  const Component = definition.Render as React.ComponentType<{
    props: unknown;
    frame: typeof block.frame;
    block: typeof block;
  }>;

  return (
    <Component
      props={block.props}
      frame={{ ...definition.frameDefaults, ...block.frame }}
      block={block}
    />
  );
}

/**
 * Renders a page of blocks.
 *
 * The first block that can render a heading gets `h1`; everything after it
 * starts at `h2`. Deciding this from position rather than from the block is
 * what keeps the document outline correct when someone reorders the page — the
 * whole reason `Heading` takes its level from context.
 */
export function BlockList({ blocks }: { blocks: ParsedBlock[] }) {
  const visible = blocks.filter((b) => b.kind === 'block' && !b.block.hidden);
  const firstRenderableId = visible[0]?.kind === 'block' ? visible[0].block.id : null;

  return (
    <>
      {blocks.map((entry) => {
        const id = entry.kind === 'block' ? entry.block.id : entry.id;
        const level = id === firstRenderableId ? 1 : 2;
        return (
          <HeadingLevel key={id} level={level}>
            <RenderOne entry={entry} />
          </HeadingLevel>
        );
      })}
    </>
  );
}

/** Content warnings for the editor. Never blocks rendering. */
export function runBlockChecks(entry: ParsedBlock): string[] {
  if (entry.kind === 'unknown') return [entry.reason];

  const definition = getBlockDefinition(entry.block.type);
  if (!definition?.checks) return [];

  return definition.checks
    .map((check) => {
      try {
        return check.run(entry.block.props as never);
      } catch {
        // A broken check must not take the editor down with it.
        return null;
      }
    })
    .filter((message): message is string => Boolean(message));
}
