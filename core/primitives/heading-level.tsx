'use client';

import React, { createContext, useContext } from 'react';

/**
 * Heading level, decided by position rather than by the block author.
 *
 * Blocks never write `<h1>` or `<h2>`. They render `<Heading>` and the level
 * comes from where they sit on the page. This is the only way heading order can
 * survive a drag-and-drop builder: the moment a user reorders sections, any
 * hardcoded level is wrong, and a page that jumps h1 → h3 → h2 is exactly what
 * a screen-reader user has to navigate by.
 *
 * The first heading-bearing block on a page emits `h1`; each block's own title
 * is `h2` after that; anything nested inside a block — an item title in a grid
 * — is one level deeper again.
 */
const HeadingLevelContext = createContext<number>(1);

export function useHeadingLevel(): number {
  return useContext(HeadingLevelContext);
}

/** Sets the level for a subtree. Blocks use `Deeper` rather than this. */
export function HeadingLevel({ level, children }: { level: number; children: React.ReactNode }) {
  return (
    <HeadingLevelContext.Provider value={clamp(level)}>{children}</HeadingLevelContext.Provider>
  );
}

/** Steps one level down. Wrap the items inside a block in this. */
export function Deeper({ children }: { children: React.ReactNode }) {
  const level = useHeadingLevel();
  return (
    <HeadingLevelContext.Provider value={clamp(level + 1)}>{children}</HeadingLevelContext.Provider>
  );
}

/**
 * HTML has six levels. Going past them is not an error worth throwing over —
 * deeply nested content is legitimate — so it flattens at `h6`, which is what
 * assistive technology expects anyway.
 */
function clamp(level: number): number {
  return Math.min(6, Math.max(1, level));
}
