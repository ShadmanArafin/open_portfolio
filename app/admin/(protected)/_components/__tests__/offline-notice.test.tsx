// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { OfflineNotice } from '../offline-notice';

/**
 * The offline chip is the one admin message the server cannot render: it is
 * about the browser's own connection. What is worth testing is the wiring —
 * that it subscribes to the browser's two events, reads `navigator.onLine`
 * when they fire, and disappears again when the connection comes back.
 *
 * That needs a real client render (the hook answers from the server snapshot
 * during SSR, which is "online" by design), so this is one of the few tests in
 * the repo that mounts with `createRoot` instead of `renderToStaticMarkup`.
 */
declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let online = true;
Object.defineProperty(navigator, 'onLine', { configurable: true, get: () => online });

function mount(): HTMLElement {
  const container = document.createElement('div');
  document.body.append(container);
  act(() => {
    createRoot(container).render(<OfflineNotice />);
  });
  return container;
}

/** What a browser does on a real disconnect: flip the flag, then the event. */
function dropConnection(connected: boolean) {
  online = connected;
  act(() => {
    window.dispatchEvent(new Event(connected ? 'online' : 'offline'));
  });
}

describe('the offline notice', () => {
  it('renders nothing while there is a connection', () => {
    online = true;
    expect(mount().textContent).toBe('');
  });

  it('appears when the connection drops, and leaves when it returns', () => {
    online = true;
    const container = mount();

    dropConnection(false);
    const chip = container.querySelector('[role="status"]');
    expect(chip?.textContent).toContain('Offline');
    expect(chip?.textContent).toContain('changes will not save');

    dropConnection(true);
    expect(container.querySelector('[role="status"]')).toBeNull();
  });
});
