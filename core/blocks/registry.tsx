import React from 'react';
import { getBlockDefinition } from './lookup';
import { clampLevel, type HeadingLevel } from '../primitives/heading-level';
import type { ParsedBlock } from './schema';
import { EMPTY_BLOCK_CONTENT, type BlockContent } from './content';

/**
 * The block registry and the page renderer.
 *
 * Adding a block type is one file plus one entry in `BLOCK_DEFINITIONS`. If it
 * ever requires touching this file, the abstraction has failed.
 */

/**
 * Renders one parsed block.
 *
 * A quarantined block renders nothing on the public site. Showing a visitor
 * "this block could not be read" tells them about our problem; the editor is
 * where that belongs, and `ParsedBlock` carries the reason for it.
 */
function RenderOne({
  entry,
  headingLevel,
  content,
}: {
  entry: ParsedBlock;
  headingLevel: HeadingLevel;
  content: BlockContent;
}) {
  if (entry.kind === 'unknown') return null;

  const { block } = entry;
  if (block.hidden) return null;

  const definition = getBlockDefinition(block.type);
  if (!definition) return null;

  const Component = definition.Render as React.ComponentType<{
    props: unknown;
    frame: typeof block.frame;
    block: typeof block;
    headingLevel: HeadingLevel;
    content: BlockContent;
  }>;

  const rendered = (
    <Component
      props={block.props}
      frame={{ ...definition.frameDefaults, ...block.frame }}
      block={block}
      headingLevel={headingLevel}
      content={content}
    />
  );
  // `anchor` was in the block schema and rendered nowhere, so an in-page link
  // to a block could never land. A wrapper only when there is one, so pages
  // without anchors keep exactly the markup they had.
  return block.anchor ? (
    <div id={block.anchor} style={{ scrollMarginBlockStart: 'var(--space-20)' }}>
      {rendered}
    </div>
  ) : (
    rendered
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
export function BlockList({
  blocks,
  content = EMPTY_BLOCK_CONTENT,
  firstLevel = 1,
}: {
  blocks: ParsedBlock[];
  /**
   * 2 when the page already has its `h1` above the blocks — a writing entry's
   * title — so the first block heading does not become a second one.
   */
  firstLevel?: 1 | 2;
  /**
   * Defaulted rather than required, so the routes and tests that predate
   * collection views keep working unchanged. A collection block with no content
   * renders its empty state, which is the honest outcome.
   */
  content?: BlockContent;
}) {
  const visible = blocks.filter((b) => b.kind === 'block' && !b.block.hidden);
  const firstRenderableId = visible[0]?.kind === 'block' ? visible[0].block.id : null;

  return (
    <>
      {blocks.map((entry) => {
        const id = entry.kind === 'block' ? entry.block.id : entry.id;
        return (
          <RenderOne
            key={id}
            entry={entry}
            headingLevel={clampLevel(id === firstRenderableId ? firstLevel : 2)}
            content={content}
          />
        );
      })}
    </>
  );
}
