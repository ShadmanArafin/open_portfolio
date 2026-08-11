/**
 * Heading level, decided by position rather than by the block author.
 *
 * Blocks never write `<h1>` or `<h2>`. The renderer works out the level from
 * where a block sits on the page and hands it down. This is the only way
 * heading order survives a drag-and-drop builder: the moment somebody reorders
 * sections, any hardcoded level is wrong, and a page that jumps h1 → h3 → h2 is
 * exactly what a screen-reader user has to navigate by.
 *
 * The first heading-bearing block on a page emits `h1`; each block's own title
 * is `h2` after that; anything nested inside a block — an item title in a grid
 * — is one level deeper again.
 *
 * **This used to be React context, and it could not work.** Context requires a
 * Client Component, which would have made every block — the entire content
 * surface of the site — ship as JavaScript, to solve a problem that is settled
 * before rendering starts. It also failed outright: `Heading` called a client
 * hook from a server component, so every page built from blocks returned a 500.
 * Passing the level down explicitly costs one prop and keeps blocks free of
 * client JavaScript entirely.
 */

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

/**
 * HTML has six levels. Going past them is not worth throwing over — deeply
 * nested content is legitimate — so it flattens at `h6`, which is what
 * assistive technology expects anyway.
 */
export function clampLevel(level: number): HeadingLevel {
  return Math.min(6, Math.max(1, Math.round(level))) as HeadingLevel;
}

/** One level down, for titles of items *inside* a block. */
export function deeper(level: number): HeadingLevel {
  return clampLevel(level + 1);
}
