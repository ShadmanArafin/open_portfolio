import { BLOCK_DEFINITIONS } from './definitions';
import { parseBlocks, type ParseContext } from './parse';
import type { BlockDefinition, ParsedBlock } from './schema';
import { EMPTY_BLOCK_CONTENT, type BlockContent } from './content';

/**
 * Finding a block type, parsing a page and checking a block — the
 * non-rendering half of the registry, kept apart from the components in
 * `registry.tsx` so each module exports one kind of thing.
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

/** Content warnings for the editor. Never blocks rendering. */
export function runBlockChecks(
  entry: ParsedBlock,
  content: BlockContent = EMPTY_BLOCK_CONTENT
): string[] {
  if (entry.kind === 'unknown') return [entry.reason];

  const definition = getBlockDefinition(entry.block.type);
  if (!definition?.checks) return [];

  return definition.checks
    .map((check) => {
      try {
        return check.run(entry.block.props as never, content);
      } catch {
        // A broken check must not take the editor down with it.
        return null;
      }
    })
    .filter((message): message is string => Boolean(message));
}
