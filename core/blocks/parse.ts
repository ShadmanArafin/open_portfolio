import { blockEnvelopeSchema, type Block, type BlockDefinition, type ParsedBlock } from './schema';

/**
 * Reading stored blocks, defensively.
 *
 * Nothing in here throws. A page is a list of blocks written by an older or
 * newer build, possibly hand-edited, possibly restored from a backup — and one
 * bad entry must cost that entry, not the page. The previous content system
 * validated the whole document at once, so a single malformed field blanked
 * everything; this is the correction.
 */

export interface ParseContext {
  /** Looks up a definition. Missing means the type is unknown to this build. */
  getDefinition(type: string): BlockDefinition<never> | undefined;
}

function unknown(id: string, type: string, reason: string, raw: unknown): ParsedBlock {
  return { kind: 'unknown', id, type, reason, raw };
}

/**
 * Runs a block's migration chain up to the definition's current version.
 *
 * Forward only. A block written by a *newer* build carries a version this code
 * has no migration for and no way to interpret, so it is quarantined rather
 * than guessed at — reading it optimistically is how a downgrade corrupts data.
 */
function migrate(
  definition: BlockDefinition<never>,
  fromVersion: number,
  props: unknown
): { ok: true; props: unknown } | { ok: false; reason: string } {
  if (fromVersion > definition.version) {
    return {
      ok: false,
      reason: `This block was made with a newer version of the site (v${fromVersion}, this build reads v${definition.version}).`,
    };
  }

  let current = props;
  for (let target = fromVersion + 1; target <= definition.version; target++) {
    const step = definition.migrations?.[target];
    if (!step) {
      return {
        ok: false,
        reason: `No migration from v${target - 1} to v${target} for "${definition.type}".`,
      };
    }
    try {
      current = step(current);
    } catch (err) {
      return {
        ok: false,
        reason: `Migration to v${target} failed: ${err instanceof Error ? err.message : 'unknown error'}`,
      };
    }
  }

  return { ok: true, props: current };
}

export function parseBlock(raw: unknown, ctx: ParseContext): ParsedBlock {
  const envelope = blockEnvelopeSchema.safeParse(raw);
  if (!envelope.success) {
    const id =
      typeof raw === 'object' && raw && 'id' in raw && typeof raw.id === 'string'
        ? raw.id
        : 'unknown';
    const type =
      typeof raw === 'object' && raw && 'type' in raw && typeof raw.type === 'string'
        ? raw.type
        : 'unknown';
    return unknown(id, type, 'This block is missing the fields every block needs.', raw);
  }

  const { id, type, v, props } = envelope.data;
  const definition = ctx.getDefinition(type);
  if (!definition) {
    return unknown(id, type, `This build does not know the block type "${type}".`, raw);
  }

  const migrated = migrate(definition, v, props);
  if (!migrated.ok) return unknown(id, type, migrated.reason, raw);

  const parsed = definition.schema.safeParse(migrated.props);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    const where = first?.path.length ? ` at "${first.path.join('.')}"` : '';
    return unknown(id, type, `This block's content is not valid${where}: ${first?.message}.`, raw);
  }

  return {
    kind: 'block',
    block: { ...envelope.data, v: definition.version, props: parsed.data } as Block,
  };
}

/** Parses a whole page. Order is preserved, including quarantined blocks. */
export function parseBlocks(raw: unknown, ctx: ParseContext): ParsedBlock[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((entry) => parseBlock(entry, ctx));
}

/**
 * Turns a parsed list back into something storable.
 *
 * Quarantined blocks are written back exactly as they arrived. That is the
 * whole point of keeping `raw`: a user who opens a page written by a newer
 * build and saves it must not silently strip the blocks their own build could
 * not read.
 */
export function serialiseBlocks(parsed: ParsedBlock[]): unknown[] {
  return parsed.map((entry) => (entry.kind === 'unknown' ? entry.raw : entry.block));
}
