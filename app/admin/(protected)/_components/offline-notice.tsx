'use client';

import { useSyncExternalStore } from 'react';

/**
 * "You are offline" — said before the save fails, not after.
 *
 * The admin is used from a phone, where losing signal mid-edit is ordinary.
 * Every write on these screens is a server action, so with no connection the
 * button simply does nothing and the screen keeps its unsaved dot: the one
 * case where the admin's own rules ("say what happened") cannot be met on the
 * server side, because nothing reached it.
 *
 * `useSyncExternalStore` rather than an effect: the connection is external
 * state, and this way the first paint has an answer (online) instead of
 * flashing a chip on every load while an effect catches up. The server
 * snapshot is "online" deliberately — the server cannot know, and claiming
 * otherwise would show the chip to everyone for a moment.
 */
function subscribe(onChange: () => void) {
  window.addEventListener('online', onChange);
  window.addEventListener('offline', onChange);
  return () => {
    window.removeEventListener('online', onChange);
    window.removeEventListener('offline', onChange);
  };
}

const onlineNow = () => navigator.onLine;
const onlineOnTheServer = () => true;

export function OfflineNotice() {
  const online = useSyncExternalStore(subscribe, onlineNow, onlineOnTheServer);
  if (online) return null;
  return (
    // `role="status"` so it is announced when it appears; the element itself
    // is the message, so nothing has to be focused for it to be read.
    <p
      role="status"
      className="m-0 ml-auto rounded-full border border-border px-3 py-1 text-sm text-danger"
    >
      Offline — changes will not save until you reconnect.
    </p>
  );
}
