import type { PageBlock } from './types';
import type { PersonaId } from './personas';

/**
 * How the demo hands a page to a second tab.
 *
 * The real admin's "open in a new tab" points at the site's own URL, because
 * the site is served by a server that has the content. Here the content is
 * React state in one tab, so there is nothing at any address to open.
 *
 * Local storage rather than the URL. The blocks of a full page do not fit in a
 * query string any browser will accept — several personas exceed the ~2,000
 * characters that survives in practice — and a truncated one would open a tab
 * showing a half-page, which reads as the product being broken rather than the
 * link being too long.
 *
 * Written on every press rather than kept in sync, so the new tab shows what
 * was on screen when you asked for it. It is not live: the real one reloads on
 * a debounce because it is a document served by a server, and pretending to
 * that here would mean a message channel between two tabs to demonstrate a
 * feature that already works in the product.
 */

export const HANDOFF_KEY = 'opb-demo-preview';

export interface Handoff {
  personaId: PersonaId;
  themeId: string;
  mode: 'light' | 'dark';
  channel: 'draft' | 'live';
  blocks: PageBlock[];
}

export function stashPreview(handoff: Handoff): boolean {
  try {
    window.localStorage.setItem(HANDOFF_KEY, JSON.stringify(handoff));
    return true;
  } catch {
    // Private browsing, a full quota, or storage switched off. The caller opens
    // the tab anyway and it explains itself rather than opening blank.
    return false;
  }
}

export function readPreview(): Handoff | null {
  try {
    const raw = window.localStorage.getItem(HANDOFF_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Handoff;
    // Enough of a check to reject a stale or foreign value without pulling a
    // schema library into a demo.
    if (!parsed || !Array.isArray(parsed.blocks) || typeof parsed.themeId !== 'string') return null;
    return parsed;
  } catch {
    return null;
  }
}
