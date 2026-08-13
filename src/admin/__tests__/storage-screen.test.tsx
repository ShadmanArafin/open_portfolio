import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { AdminStorage } from '../pages/AdminStorage';
import { BACKEND_GUIDES } from '@/core/storage/guides';

/**
 * The storage screen, actually rendered.
 *
 * Typecheck proves the props exist; it does not prove the screen renders. An
 * Astryx component given a prop it accepts but cannot use still throws, and
 * this is the admin's only server-renderable screen, so it is the one place
 * that can be checked without a browser.
 *
 * `fetch` is stubbed to a promise that never settles, which is deliberately the
 * worst case: it renders the screen before the server has answered, which is
 * what every visitor sees for the first moment.
 */
describe('the storage screen', () => {
  it('renders every backend before the server has answered', () => {
    vi.stubGlobal('fetch', () => new Promise(() => {}));
    const html = renderToStaticMarkup(<AdminStorage />);

    for (const guide of BACKEND_GUIDES) {
      expect(html).toContain(guide.name);
    }
    // The one thing on the screen a user must not miss: this screen explains
    // the choice, it does not make it.
    expect(html).toContain('You choose this by deploying');
  });

  it('tells the reader when each free-tier claim was checked', () => {
    // An undated free-tier number is one nobody can audit later, and they drift.
    for (const guide of BACKEND_GUIDES) {
      expect(guide.verifiedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});
