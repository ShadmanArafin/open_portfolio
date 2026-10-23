'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Unsaved edits, and not losing them.
 *
 * Every editing screen keeps its edits local until Save — one write per save
 * instead of one per keystroke. The cost of that design was paid silently:
 * a click on another section, a closed tab or a reload threw an afternoon's
 * edits away with no word said. This makes the state visible and the exits
 * ask first.
 *
 * Dirty means "differs from what was last loaded or saved", compared as JSON,
 * so typing a word and deleting it again is not a change worth a warning.
 */
export function useUnsavedChanges<T>(current: T): {
  dirty: boolean;
  markSaved: (saved: T) => void;
} {
  const [baseline, setBaseline] = useState(() => JSON.stringify(current));
  const dirty = JSON.stringify(current) !== baseline;
  useLeaveGuard(dirty);
  const markSaved = useCallback((saved: T) => setBaseline(JSON.stringify(saved)), []);
  return { dirty, markSaved };
}

const LEAVE_QUESTION = 'You have changes that are not saved. Leave this screen anyway?';

/**
 * Asks before leaving while `dirty`.
 *
 * Two exits, two mechanisms. Closing, reloading or typing an address is the
 * browser's own `beforeunload` prompt — the only thing a page may do there.
 * Following a link inside the admin never unloads the page (the App Router
 * swaps it in place), so those clicks are caught in the capture phase on the
 * document, ahead of the router's own handler, and confirmed first.
 */
export function useLeaveGuard(dirty: boolean): void {
  useEffect(() => {
    if (!dirty) return;

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      // Older browsers need a value set; the text itself is never shown.
      event.returnValue = '';
    };

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      // A new tab or window leaves this one, and its edits, where they are.
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as Element | null)?.closest?.('a[href]');
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.target && anchor.target !== '_self') return;
      if (anchor.hasAttribute('download')) return;

      const destination = new URL(anchor.href, window.location.href);
      if (destination.origin !== window.location.origin) return;
      // A jump within this same screen goes nowhere.
      if (
        destination.pathname === window.location.pathname &&
        destination.search === window.location.search
      ) {
        return;
      }

      if (!window.confirm(LEAVE_QUESTION)) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    window.addEventListener('beforeunload', onBeforeUnload);
    document.addEventListener('click', onClick, true);
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload);
      document.removeEventListener('click', onClick, true);
    };
  }, [dirty]);
}

/**
 * Cmd+S on a Mac, Ctrl+S elsewhere: saves this screen instead of offering to
 * save the web page as a file, which is never what anybody in an editor means.
 */
export function useSaveShortcut(save: () => void, enabled: boolean): void {
  // The latest `save` closes over the latest edits; a ref keeps the listener
  // from being re-registered on every keystroke.
  const latest = useRef(save);
  useEffect(() => {
    latest.current = save;
  });

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== 's' || !(event.metaKey || event.ctrlKey)) return;
      if (event.altKey || event.shiftKey) return;
      event.preventDefault();
      if (enabled) latest.current();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [enabled]);
}
