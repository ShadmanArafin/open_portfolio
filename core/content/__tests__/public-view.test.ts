import { describe, expect, it } from 'vitest';
import { INITIAL_CMS_STATE } from '@/cms/data/initialData';
import { publicView } from '../sanitise';
import type { CMSState } from '@/cms/types/cms';

/**
 * What ends up in the HTML of a public page.
 *
 * The whole content document was being serialised into every page so the
 * client could render the navbar and footer — drafts included. Unpublished
 * pages and unfinished writing, with their titles, summaries and full block
 * content, readable by anyone who pressed view-source.
 *
 * Nothing rendered them, which is precisely why nobody noticed: the page looked
 * right. Found by counting occurrences of a draft title in the served HTML.
 */

const secret = 'UNPUBLISHED-AND-PRIVATE';

const state: CMSState = {
  ...INITIAL_CMS_STATE,
  pages: [
    {
      ...(INITIAL_CMS_STATE.pages?.[0] ?? ({} as never)),
      id: 'p1',
      slug: 'live',
      title: 'Live',
      status: 'published',
      blocks: [],
      seo: {},
      nav: { show: false, order: 0 },
      updatedAt: '',
      revision: 1,
    },
    {
      id: 'p2',
      slug: 'hidden',
      title: secret,
      status: 'draft',
      blocks: [{ id: 'b', type: 'richText', v: 1, props: { paragraphs: [secret] } }],
      seo: {},
      nav: { show: false, order: 0 },
      updatedAt: '',
      revision: 1,
    },
  ],
  writing: [
    {
      id: 'w1',
      slug: 'out',
      title: 'Out',
      summary: '',
      blocks: [],
      status: 'published',
      tags: [],
      featured: false,
      sortOrder: 0,
      seo: {},
      updatedAt: '',
      revision: 1,
    },
    {
      id: 'w2',
      slug: 'wip',
      title: secret,
      summary: secret,
      blocks: [],
      status: 'draft',
      tags: [],
      featured: false,
      sortOrder: 1,
      seo: {},
      updatedAt: '',
      revision: 1,
    },
    {
      id: 'w3',
      slug: 'later',
      title: secret,
      summary: '',
      blocks: [],
      status: 'scheduled',
      scheduledFor: '2099-01-01T00:00:00Z',
      tags: [],
      featured: false,
      sortOrder: 2,
      seo: {},
      updatedAt: '',
      revision: 1,
    },
  ],
  messages: [
    {
      id: 'm1',
      name: secret,
      email: secret,
      message: secret,
      status: 'unread',
      receivedAt: '',
    } as never,
  ],
  versions: [
    { id: 'v1', timestamp: '', editor: '', action: '', summary: '', snapshot: { secret } } as never,
  ],
};

describe('publicView', () => {
  it('carries nothing unpublished, anywhere', () => {
    // The strongest form of the check: one marker in every private field, and
    // an assertion that it survives nowhere in the serialised result.
    expect(JSON.stringify(publicView(state))).not.toContain(secret);
  });

  it('keeps what is already visible', () => {
    const view = publicView(state);
    expect(view.pages?.map((p) => p.slug)).toEqual(['live']);
    expect(view.writing?.map((w) => w.slug)).toEqual(['out']);
  });

  it('drops the inbox, version history and activity log', () => {
    // Versions carry old copies of content that may since have been removed on
    // purpose — a quieter version of the same leak.
    const view = publicView(state);
    expect(view.messages).toEqual([]);
    expect(view.versions).toEqual([]);
    expect(view.activityLogs).toEqual([]);
  });

  it('publishes a scheduled piece once it is due', () => {
    const due = {
      ...state,
      writing: [{ ...state.writing![2], title: 'Due now', scheduledFor: '2020-01-01T00:00:00Z' }],
    };
    expect(publicView(due).writing?.map((w) => w.title)).toEqual(['Due now']);
  });

  it('survives content that predates pages and writing', () => {
    const old = { ...INITIAL_CMS_STATE, pages: undefined, writing: undefined };
    expect(() => publicView(old)).not.toThrow();
    expect(publicView(old).pages).toEqual([]);
  });
});
