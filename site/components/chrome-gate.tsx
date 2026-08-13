'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

/**
 * Hides the marketing header and footer on the pages that are applications.
 *
 * The demo is the product's admin. Sitting it under a site nav and above a
 * four-column footer makes it read as a screenshot embedded in a page — and the
 * question a visitor is actually answering there is "could I work this", which
 * a demo framed as marketing material cannot answer. These routes get the whole
 * window instead, and carry their own bar.
 *
 * A client component only so it can read the path. Its children are still
 * rendered on the server; this decides whether they are output, so the exported
 * HTML for these routes contains no nav rather than hiding one with CSS.
 *
 * One thing to know before concluding this is broken: the children are rendered
 * on the server *whether or not* they are returned, so the nav's markup is still
 * in the route's flight payload — `\"nav__brand\"`, escaped, inside a
 * `self.__next_f.push`. A plain grep for the class name finds it and looks like
 * a failure. Grep the rendered form instead, `class="nav__brand"`, which is 0 on
 * these two routes and 1 everywhere else. The payload cost is a nav and a footer
 * on two pages; avoiding it would mean making the nav a client component on
 * every page, which is a worse trade.
 */

const FULL_WINDOW = new Set(['/demo/try', '/demo/site']);

export function ChromeGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (FULL_WINDOW.has(pathname)) return null;
  return <>{children}</>;
}

/** The same test, for anything that has to size itself against the bar. */
export function useIsFullWindow(): boolean {
  return FULL_WINDOW.has(usePathname());
}
