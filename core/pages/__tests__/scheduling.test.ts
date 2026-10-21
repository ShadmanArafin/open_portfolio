import { describe, expect, it } from 'vitest';
import { isPageLive } from '../schema';
import { mergeNavLinks } from '../nav';

describe('scheduled pages', () => {
  const now = new Date('2026-10-21T12:00:00Z');
  it('go live at their moment, not before', () => {
    expect(isPageLive({ status: 'scheduled', scheduledFor: '2026-10-21T11:59:00Z' }, now)).toBe(
      true
    );
    expect(isPageLive({ status: 'scheduled', scheduledFor: '2026-10-21T12:01:00Z' }, now)).toBe(
      false
    );
  });
  it('never go live without a usable date, and drafts never do', () => {
    expect(isPageLive({ status: 'scheduled' }, now)).toBe(false);
    expect(isPageLive({ status: 'scheduled', scheduledFor: 'soon' }, now)).toBe(false);
    expect(isPageLive({ status: 'draft' }, now)).toBe(false);
    expect(isPageLive({ status: 'published' }, now)).toBe(true);
  });
  it('join the menu only once live', () => {
    const page = (status: string, scheduledFor?: string) =>
      ({
        id: status,
        slug: status,
        title: status,
        status,
        scheduledFor,
        blocks: [],
        seo: {},
        nav: { show: true, order: 1 },
        updatedAt: '',
        revision: 1,
      }) as never;
    const links = mergeNavLinks([], [page('published'), page('scheduled', '2999-01-01T00:00:00Z')]);
    expect(links.map((link) => link.path)).toEqual(['/published']);
  });
});
