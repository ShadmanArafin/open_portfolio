import { describe, expect, it } from 'vitest';
import type { NavLinkItem } from '@/cms/types/cms';
import { mergeNavLinks, navEntriesFromPages } from '../nav';
import { createPage, type PageRecord } from '../schema';

function page(slug: string, overrides: Partial<PageRecord> = {}): PageRecord {
  return { ...createPage({ title: slug, slug }), ...overrides };
}

const link = (path: string, label: string, sortOrder: number): NavLinkItem => ({
  id: path,
  label,
  path,
  visible: true,
  sortOrder,
});

describe('navEntriesFromPages', () => {
  it('includes only pages the owner asked to show', () => {
    const entries = navEntriesFromPages([
      page('shown', { status: 'published', nav: { show: true, order: 1 } }),
      page('hidden', { status: 'published', nav: { show: false, order: 2 } }),
    ]);
    expect(entries.map((e) => e.path)).toEqual(['/shown']);
  });

  it('keeps drafts out of the public menu but shows them in preview', () => {
    const pages = [page('wip', { status: 'draft', nav: { show: true, order: 1 } })];
    expect(navEntriesFromPages(pages)).toHaveLength(0);
    expect(navEntriesFromPages(pages, { includeDrafts: true })).toHaveLength(1);
  });

  it('prefers the navigation label over the page title', () => {
    const entries = navEntriesFromPages([
      page('services', {
        title: 'What I Can Do For You',
        status: 'published',
        nav: { show: true, label: 'Services', order: 1 },
      }),
    ]);
    expect(entries[0].label).toBe('Services');
  });

  it('survives content that predates pages entirely', () => {
    expect(navEntriesFromPages(undefined)).toEqual([]);
  });
});

describe('mergeNavLinks', () => {
  it('interleaves pages with hand-written links by order', () => {
    const merged = mergeNavLinks(
      [link('/work', 'Work', 1), link('/contact', 'Contact', 4)],
      [page('studio', { status: 'published', nav: { show: true, order: 2 } })]
    );
    expect(merged.map((l) => l.path)).toEqual(['/work', '/studio', '/contact']);
  });

  it('lets a hand-written link win over the page it points at', () => {
    // Somebody typed that label deliberately. Replacing it with the page title
    // would look like the site ignoring them.
    const merged = mergeNavLinks(
      [link('/studio', 'The Studio', 1)],
      [page('studio', { title: 'Studio', status: 'published', nav: { show: true, order: 1 } })]
    );
    expect(merged).toHaveLength(1);
    expect(merged[0].label).toBe('The Studio');
  });

  it('drops links the owner switched off', () => {
    const hidden = { ...link('/gone', 'Gone', 1), visible: false };
    expect(mergeNavLinks([hidden], [])).toHaveLength(0);
  });

  it('breaks ties by label so the order never wobbles between renders', () => {
    const merged = mergeNavLinks(
      [],
      [
        page('beta', { status: 'published', nav: { show: true, order: 1 } }),
        page('alpha', { status: 'published', nav: { show: true, order: 1 } }),
      ]
    );
    expect(merged.map((l) => l.label)).toEqual(['alpha', 'beta']);
  });
});
