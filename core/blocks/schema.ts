import { z } from 'zod';
import type React from 'react';
import type { BlockFrame } from '../primitives/frame';
import type { HeadingLevel } from '../primitives/heading-level';
import type { BlockField } from './fields';
import type { BlockContent } from './content';

/**
 * The block envelope, and the contract a block definition satisfies.
 *
 * Two decisions here carry most of the weight.
 *
 * **Versioning is per block type, not global.** A change to the hero's props
 * must not force every other block to bump. `v` travels with the block, and the
 * definition owns the migrations from one version to the next, so a document
 * written a year ago upgrades one block at a time on read.
 *
 * **An unknown or unreadable block is quarantined, never dropped.** Content
 * arrives from storage that a newer build may have written, and silently
 * discarding a block the current code does not recognise loses somebody's work
 * on the next save. It is round-tripped untouched instead, rendered as nothing
 * publicly and as an explanation in the editor.
 */

export const frameSchema = z.object({
  width: z.enum(['full-bleed', 'wide', 'default', 'narrow']),
  spacing: z.enum(['none', 'tight', 'default', 'loose']),
  surface: z.enum(['canvas', 'raised', 'sunken', 'accent', 'inverted']),
  divider: z.enum(['none', 'top', 'bottom', 'both']),
  align: z.enum(['start', 'center']),
  flip: z.boolean().optional(),
});

/** The envelope every block shares, whatever its type. */
export const blockEnvelopeSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  /** Schema version of *this block type*. */
  v: z.number().int().nonnegative(),
  props: z.unknown(),
  frame: frameSchema.partial().optional(),
  hidden: z.boolean().optional(),
  /** Stable in-page anchor. */
  anchor: z.string().optional(),
  /** Set by presets, used to match blocks when switching preset. */
  role: z.string().optional(),
  /** Author-only note. Never rendered. */
  note: z.string().optional(),
});

export type BlockEnvelope = z.infer<typeof blockEnvelopeSchema>;

export interface Block<P = unknown> extends Omit<BlockEnvelope, 'props'> {
  props: P;
}

/**
 * A block the current build cannot render.
 *
 * Either its `type` is unknown, or its `v` is newer than this build knows how
 * to read, or its props failed validation and no migration rescued them. The
 * original is kept verbatim so saving the document does not destroy it.
 */
export interface UnknownBlock {
  kind: 'unknown';
  id: string;
  type: string;
  reason: string;
  raw: unknown;
}

export type ParsedBlock = { kind: 'block'; block: Block } | UnknownBlock;

export type PaletteGroup = 'identity' | 'work' | 'credentials' | 'conversion' | 'utility';

export interface BlockRenderProps<P> {
  props: P;
  frame: Partial<BlockFrame> | undefined;
  block: Block<P>;
  /**
   * The level this block's own title should use, worked out by the renderer
   * from the block's position on the page. Item titles inside the block go one
   * deeper — `deeper(headingLevel)`.
   *
   * Passed rather than read from context: context needs a Client Component, and
   * making every block ship JavaScript to answer a question that is settled
   * before rendering begins is the wrong trade twice over.
   */
  headingLevel: HeadingLevel;

  /**
   * The site's own records, for blocks that place them rather than restate
   * them. Always present — a block that has to ask whether its content exists
   * will forget, and an empty array renders an empty state while `undefined`
   * renders a crash.
   */
  content: BlockContent;
}

/**
 * One warning about a block's content, shown to the author as they type.
 *
 * Not validation — the block is valid. These are the "this will wrap to four
 * lines on a phone" observations that catch the arrangements a schema cannot,
 * and they are the difference between a builder that lets people make a mess
 * and one that talks them out of it.
 */
export interface BlockCheck<P> {
  id: string;
  /**
   * `content` is here so a collection view can warn that it will render
   * nothing. A block pointed at an empty collection is valid, publishes, and
   * silently does not appear — the exact failure shape this project has shipped
   * three times, and the author is the one person who cannot see it, because
   * they know what they meant to put there.
   */
  run(props: P, content: BlockContent): string | null;
}

export interface BlockDefinition<P = unknown> {
  type: string;
  /** Current schema version. Bump whenever `schema` changes shape. */
  version: number;

  label: string;
  description: string;
  group: PaletteGroup;

  schema: z.ZodType<P>;
  /** A valid, empty-ish instance. What "Add block" inserts. */
  defaults(): P;

  /**
   * The editor for this block, described as data rather than built as a
   * component. One generic form renders every block from this, so adding a
   * block type stays one file and no admin screen has to learn about it.
   */
  fields: BlockField[];

  /**
   * Which frame controls are meaningful for this block. The settings panel
   * hides the rest rather than offering a control that does nothing.
   */
  frameCapabilities?: (keyof BlockFrame)[];
  /** Frame values this block prefers when inserted. */
  frameDefaults?: Partial<BlockFrame>;

  Render: React.ComponentType<BlockRenderProps<P>>;

  /**
   * `v(n-1) → v(n)`, applied in sequence on read.
   *
   * Keyed by the version being migrated *to*, so upgrading is a loop rather
   * than a chain of conditionals.
   */
  migrations?: Record<number, (previous: unknown) => unknown>;

  checks?: BlockCheck<P>[];

  /** Structured data for this block, when it has any worth emitting. */
  jsonLd?(props: P): object | null;
}
