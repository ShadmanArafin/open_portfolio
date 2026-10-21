'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

/**
 * `?open=<id>`: the record a link (the command palette's, usually) asked for.
 *
 * Calls `open` with it, and again whenever it changes — following a second
 * palette result on the same screen does not remount the editor, so a one-off
 * initial state would miss it — then scrolls the record's row into view. Rows
 * carry `id="record-<id>"` for this.
 */
export function useRequestedRecord(open: (id: string) => void): void {
  const requested = useSearchParams().get('open');
  useEffect(() => {
    if (!requested) return;
    open(requested);
    // After the row has rendered open.
    requestAnimationFrame(() =>
      document.getElementById(`record-${requested}`)?.scrollIntoView({ block: 'start' })
    );
    // `open` is a state setter's caller; keying on the id is the point.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requested]);
}
