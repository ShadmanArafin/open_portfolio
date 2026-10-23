/** The most text taken by default: a page's opening says what it is about. */
export const MAX_SOURCE_CHARS = 6000;

const isUrlish = (text: string) => /^(https?:|\/|#|mailto:|data:)/i.test(text.trim());

/**
 * The readable words in raw block envelopes: headings, paragraphs, captions,
 * button labels. Links, ids and layout names are not words anyone reads.
 * Hidden blocks are skipped. Capped at `max` characters.
 */
export function textOfBlocks(blocks: unknown[], max = MAX_SOURCE_CHARS): string {
  const out: string[] = [];
  const walk = (value: unknown, key = '') => {
    if (typeof value === 'string') {
      // Ids, links, colours and layout names are not prose.
      if (
        value.trim() &&
        !isUrlish(value) &&
        !/^(id|type|href|src|url|variant|tone|layout|anchor)$/i.test(key)
      ) {
        out.push(value.trim());
      }
    } else if (Array.isArray(value)) {
      for (const item of value) walk(item, key);
    } else if (value && typeof value === 'object') {
      for (const [name, item] of Object.entries(value)) walk(item, name);
    }
  };
  for (const block of blocks) {
    if (block && typeof block === 'object' && !(block as { hidden?: boolean }).hidden) {
      walk((block as { props?: unknown }).props);
    }
  }
  return out.join('\n').slice(0, max);
}
