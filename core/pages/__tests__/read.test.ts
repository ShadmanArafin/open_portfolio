import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CMSState } from '@/cms/types/cms';
import { INITIAL_CMS_STATE } from '@/cms/data/initialData';
import { createPage, type PageRecord } from '../schema';

/**
 * Reading pages, and the two rules that matter most:
 *
 *   a draft is visible in preview and nowhere else, and
 *   a malformed record costs itself, not the site.
 */

const draftMode = vi.fn(async () => ({ isEnabled: false }));
vi.mock('next/headers', () => ({ draftMode: () => draftMode() }));

const snapshots = new Map<string, CMSState | null>();
vi.mock('@/core/storage/registry', () => ({
  getStorageAdapter: async () => ({
    readSnapshot: async (channel: string) => snapshots.get(channel) ?? null,
  }),
}));

const { currentChannel, getIndexablePages, getPages, getRoutablePages, resolvePage } =
  await import('../read');

function withPages(pages: unknown[]): CMSState {
  return { ...INITIAL_CMS_STATE, pages: pages as PageRecord[] };
}

function page(overrides: Partial<PageRecord> & { slug: string }): PageRecord {
  return { ...createPage({ title: overrides.slug, slug: overrides.slug }), ...overrides };
}

beforeEach(() => {
  snapshots.clear();
  draftMode.mockResolvedValue({ isEnabled: false });
});

describe('currentChannel', () => {
  it('is published by default', async () => {
    await expect(currentChannel()).resolves.toBe('published');
  });

  it('is draft when preview is on', async () => {
    draftMode.mockResolvedValue({ isEnabled: true });
    await expect(currentChannel()).resolves.toBe('draft');
  });

  it('is published when there is no request in scope', async () => {
    // `generateStaticParams`, the sitemap and the test runner all land here.
    // Throwing would turn a build into a red deploy over a cookie.
    draftMode.mockRejectedValue(new Error('outside a request'));
    await expect(currentChannel()).resolves.toBe('published');
  });
});

describe('getPages', () => {
  it('drops records that are not pages, and keeps the rest', async () => {
    snapshots.set(
      'published',
      withPages([page({ slug: 'good' }), { nonsense: true }, null, page({ slug: 'also-good' })])
    );

    const pages = await getPages('published');
    expect(pages.map((p) => p.slug)).toEqual(['good', 'also-good']);
  });

  it('treats content written before pages existed as having none', async () => {
    snapshots.set('published', { ...INITIAL_CMS_STATE, pages: undefined });
    await expect(getPages('published')).resolves.toEqual([]);
  });
});

describe('channels', () => {
  it('hides drafts from the public site and shows them in preview', async () => {
    const content = withPages([
      page({ slug: 'live', status: 'published' }),
      page({ slug: 'wip', status: 'draft' }),
    ]);
    snapshots.set('published', content);
    snapshots.set('draft', content);

    expect((await getRoutablePages('published')).map((p) => p.slug)).toEqual(['live']);
    expect((await getRoutablePages('draft')).map((p) => p.slug)).toEqual(['live', 'wip']);
  });

  it('previews the live site when nothing has been drafted', async () => {
    // A site with no unsaved changes has no draft snapshot. Showing an empty
    // site would read as preview being broken.
    snapshots.set('published', withPages([page({ slug: 'live', status: 'published' })]));
    snapshots.set('draft', null);

    expect((await getRoutablePages('draft')).map((p) => p.slug)).toEqual(['live']);
  });
});

describe('resolvePage', () => {
  it('parses the blocks and quarantines the ones it cannot read', async () => {
    snapshots.set(
      'published',
      withPages([
        page({
          slug: 'about',
          status: 'published',
          blocks: [
            { id: 'a', type: 'richText', v: 1, props: { paragraphs: ['Hello.'] } },
            { id: 'b', type: 'fromTheFuture', v: 9, props: {} },
          ],
        }),
      ])
    );

    const resolved = await resolvePage('about', 'published');
    expect(resolved?.blocks).toHaveLength(2);
    expect(resolved?.blocks[0].kind).toBe('block');
    // Kept, not dropped: saving this page must not destroy the second block.
    expect(resolved?.blocks[1].kind).toBe('unknown');
  });

  it('returns null for an address nobody made', async () => {
    snapshots.set('published', withPages([]));
    await expect(resolvePage('nope', 'published')).resolves.toBeNull();
  });

  it('will not serve a draft page on the public site', async () => {
    snapshots.set('published', withPages([page({ slug: 'secret', status: 'draft' })]));
    await expect(resolvePage('secret', 'published')).resolves.toBeNull();
    await expect(resolvePage('secret', 'draft')).resolves.not.toBeNull();
  });
});

describe('getIndexablePages', () => {
  it('leaves out anything the owner asked to keep out of search', async () => {
    snapshots.set(
      'published',
      withPages([
        page({ slug: 'listed', status: 'published' }),
        page({ slug: 'hidden', status: 'published', seo: { noindex: true } }),
        page({ slug: 'unfinished', status: 'draft' }),
      ])
    );

    expect((await getIndexablePages()).map((p) => p.slug)).toEqual(['listed']);
  });
});
