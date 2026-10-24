import { describe, expect, it } from 'vitest';
import { INITIAL_CMS_STATE } from '@/cms/data/initialData';
import { clientView } from '../sanitise';
import type { CMSState } from '@/cms/types/cms';
import type { WritingEntry } from '@/core/writing/schema';

/**
 * What the site layout serialises into every public page.
 *
 * The measure is the writer's case: two hundred published posts used to go
 * out in full with every request, `/contact` included, because the layout
 * handed the client everything a visitor was *allowed* to see rather than what
 * the client components *render*.
 */

const BODY = 'A paragraph only the post page should carry.';

function writer(posts: number): CMSState {
  const entry = (n: number): WritingEntry =>
    ({
      id: `w${n}`,
      slug: `post-${n}`,
      title: `Post ${n}`,
      summary: '',
      status: 'published',
      blocks: [{ type: 'richText', props: { paragraphs: [BODY] } }],
      tags: [],
      sortOrder: n,
      seo: {},
      publishedAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      revision: 1,
    }) as unknown as WritingEntry;
  return {
    ...structuredClone(INITIAL_CMS_STATE),
    writing: Array.from({ length: posts }, (_, n) => entry(n)),
    pages: [
      {
        id: 'p1',
        slug: 'services',
        title: 'Services',
        status: 'published',
        blocks: [{ type: 'richText', props: { paragraphs: [BODY] } }],
        seo: {},
        nav: { show: true, label: 'Services', order: 1 },
        updatedAt: '2026-01-01T00:00:00.000Z',
        revision: 1,
      },
    ],
  };
}

describe('clientView', () => {
  it('ships no writing, page blocks or project stories', () => {
    const view = clientView(writer(200));
    const wire = JSON.stringify(view);
    expect(wire).not.toContain(BODY);
    expect(view.writing).toEqual([]);
    expect(view.projects).toEqual([]);
    expect(view.media).toEqual([]);
  });

  it('ships none of the media library, even photos with smaller copies', () => {
    const state = writer(0);
    state.media = Array.from({ length: 50 }, (_, i) => ({
      id: `m${i}`,
      name: `photo-${i}.jpg`,
      url: `/api/media/photo-${i}.jpg`,
      type: 'image' as const,
      sizeBytes: 1000,
      dimensions: '2400x1600',
      variants: [640, 1280],
      uploadedAt: '2026-01-01T00:00:00.000Z',
      altText: `Photo ${i}`,
      usageCount: 1,
    }));
    const view = clientView(state);
    expect(view.media).toEqual([]);
    expect(JSON.stringify(view)).not.toContain('photo-7.jpg');
  });

  it('keeps what the navbar builds the menu from', () => {
    const [page] = clientView(writer(0)).pages ?? [];
    expect(page).toMatchObject({ slug: 'services', title: 'Services', nav: { show: true } });
    expect(page.blocks).toEqual([]);
  });

  it('does not grow with the amount of writing', () => {
    const few = JSON.stringify(clientView(writer(2))).length;
    const many = JSON.stringify(clientView(writer(200))).length;
    expect(many).toBe(few);
  });

  it('still hides what publicView hides', () => {
    const state = writer(0);
    state.pages = [{ ...state.pages![0], status: 'draft' }];
    expect(clientView(state).pages).toEqual([]);
  });

  it('ships none of the lists the server components render', () => {
    const view = clientView(writer(0));
    for (const key of [
      'projects',
      'brands',
      'experience',
      'education',
      'processSteps',
      'capabilityGroups',
      'recommendations',
      'artifacts',
      'socialLinks',
    ] as const) {
      expect(view[key], key).toEqual([]);
    }
  });
});
