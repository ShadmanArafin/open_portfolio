import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { AdminYourSite } from '../pages/AdminYourSite';

/**
 * The "Your site" screen, actually rendered.
 *
 * The state that matters is the first one: before the server answers, this
 * screen must not claim anything. Congratulating somebody on being live when
 * we do not yet know whether they are is the failure mode of a screen like
 * this, and it is the state every visitor sees for a moment.
 */
describe('the your-site screen', () => {
  it('claims nothing before the server has answered', () => {
    vi.stubGlobal('fetch', () => new Promise(() => {}));
    const html = renderToStaticMarkup(<AdminYourSite />);

    expect(html).toContain('Your site');
    expect(html).not.toContain('Your site is live');
    expect(html).toContain('cannot tell what address');
  });

  it('is honest that a domain costs money and is not sold here', () => {
    vi.stubGlobal('fetch', () => new Promise(() => {}));
    const html = renderToStaticMarkup(<AdminYourSite />);
    expect(html).toContain('not free');
    expect(html).toContain('do not sell it');
  });
});
