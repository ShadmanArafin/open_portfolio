import { describe, expect, it } from 'vitest';
import { INITIAL_CMS_STATE } from '@/cms/data/initialData';
import { buildBackup, checkBackup } from '@/core/backup/bundle';

function stateWithEnquiry() {
  return {
    ...INITIAL_CMS_STATE,
    messages: [
      {
        id: 'm1',
        name: 'Stranger',
        email: 's@example.com',
        message: 'hello',
        createdAt: new Date().toISOString(),
        read: false,
      },
    ],
  };
}

describe('server backup bundle', () => {
  it('strips enquiries on build', () => {
    const b = buildBackup({
      adapterId: 'local',
      published: stateWithEnquiry() as never,
      draft: null,
      media: [],
    });
    expect(b.published?.messages).toEqual([]);
    expect(b.format).toBe('open-portfolio-builder');
    expect(b.bundleVersion).toBe(2);
  });

  it('skips empty collections in buildBackup', () => {
    const b = buildBackup({
      adapterId: 'local',
      published: INITIAL_CMS_STATE,
      draft: null,
      media: [],
      records: {
        'writing-draft': [],
        'writing-bodies': [],
      },
    });
    expect(b.records).toBeUndefined();
  });

  it('round-trips a valid bundle with records', () => {
    const b = buildBackup({
      adapterId: 'local',
      published: INITIAL_CMS_STATE,
      draft: INITIAL_CMS_STATE,
      media: [],
      records: {
        'writing-draft': [
          {
            id: 'w-1',
            revision: 1,
            data: { title: 'Draft Post' },
            updatedAt: new Date().toISOString(),
          },
        ],
      },
    });
    expect(b.records?.['writing-draft']).toHaveLength(1);
    const checked = checkBackup(JSON.parse(JSON.stringify(b)));
    expect(checked.ok).toBe(true);
    if (checked.ok) {
      expect(checked.backup.records?.['writing-draft']).toHaveLength(1);
      expect(checked.backup.records?.['writing-draft']?.[0].id).toBe('w-1');
    }
  });

  it('rejects published writing pointing at a missing bodyKey', () => {
    const publishedWithMissingBody = {
      ...INITIAL_CMS_STATE,
      writing: [
        {
          id: 'w-article',
          slug: 'article',
          title: 'Article',
          summary: 'Summary',
          blocks: [],
          status: 'published' as const,
          tags: [],
          featured: false,
          sortOrder: 0,
          seo: {},
          bodyKey: 'abc123nonexistent', // gitleaks:allow
          updatedAt: new Date().toISOString(),
          revision: 1,
        },
      ],
    };
    const b = buildBackup({
      adapterId: 'local',
      published: publishedWithMissingBody,
      draft: null,
      media: [],
    });
    const checked = checkBackup(JSON.parse(JSON.stringify(b)));
    expect(checked.ok).toBe(false);
    if (!checked.ok) {
      expect(checked.error).toContain('whose bodies are not in it');
    }
  });

  it('accepts published writing pointing at an included bodyKey', () => {
    const bodyKey = 'a'.repeat(32);
    const publishedWithValidBody = {
      ...INITIAL_CMS_STATE,
      writing: [
        {
          id: 'w-article',
          slug: 'article',
          title: 'Article',
          summary: 'Summary',
          blocks: [],
          status: 'published' as const,
          tags: [],
          featured: false,
          sortOrder: 0,
          seo: {},
          bodyKey,
          updatedAt: new Date().toISOString(),
          revision: 1,
        },
      ],
    };
    const b = buildBackup({
      adapterId: 'local',
      published: publishedWithValidBody,
      draft: null,
      media: [],
      records: {
        'writing-bodies': [
          {
            id: bodyKey,
            revision: 1,
            data: { blocks: [] },
            updatedAt: new Date().toISOString(),
          },
        ],
      },
    });
    const checked = checkBackup(JSON.parse(JSON.stringify(b)));
    expect(checked.ok).toBe(true);
  });

  it('ignores disallowed record collections', () => {
    const raw = {
      format: 'open-portfolio-builder',
      bundleVersion: 2,
      published: INITIAL_CMS_STATE,
      records: {
        secrets: [{ id: 'sec1', revision: 1, data: { foo: 'bar' }, updatedAt: '2026-01-01' }],
        'writing-draft': [
          { id: 'w-post', revision: 1, data: { title: 'Post' }, updatedAt: '2026-01-01' },
        ],
      },
    };
    const checked = checkBackup(raw);
    expect(checked.ok).toBe(true);
    if (checked.ok) {
      expect(checked.backup.records?.secrets).toBeUndefined();
      expect(checked.backup.records?.['writing-draft']).toHaveLength(1);
    }
  });

  it('rejects malformed records in allowed collections', () => {
    const base = {
      format: 'open-portfolio-builder',
      bundleVersion: 2,
      published: INITIAL_CMS_STATE,
    };
    expect(
      checkBackup({
        ...base,
        records: { 'writing-draft': [{ id: 'INVALID/ID', revision: 1, data: {} }] },
      }).ok
    ).toBe(false);
    expect(
      checkBackup({
        ...base,
        records: { 'writing-draft': [{ id: 'valid-id', revision: 0, data: {} }] },
      }).ok
    ).toBe(false);
  });

  it('round-trips a valid bundle', () => {
    const b = buildBackup({
      adapterId: 'local',
      published: INITIAL_CMS_STATE,
      draft: INITIAL_CMS_STATE,
      media: [{ key: 'a.png', url: '/api/media/a.png', mimeType: 'image/png', sizeBytes: 10 }],
    });
    const checked = checkBackup(JSON.parse(JSON.stringify(b)));
    expect(checked.ok).toBe(true);
  });

  it('rejects the wrong file, newer bundles, and empty bundles', () => {
    expect(checkBackup(null).ok).toBe(false);
    expect(checkBackup({ format: 'nope' }).ok).toBe(false);
    expect(
      checkBackup({
        format: 'open-portfolio-builder',
        bundleVersion: 99,
        published: INITIAL_CMS_STATE,
      }).ok
    ).toBe(false);
    expect(checkBackup({ format: 'open-portfolio-builder', bundleVersion: 1 }).ok).toBe(false);
  });

  it('accepts the legacy browser bundle version key', () => {
    const checked = checkBackup({
      format: 'open-portfolio-builder',
      version: 1,
      published: INITIAL_CMS_STATE,
      draft: INITIAL_CMS_STATE,
    });
    expect(checked.ok).toBe(true);
  });

  it('strips enquiries smuggled into an import', () => {
    const checked = checkBackup({
      format: 'open-portfolio-builder',
      bundleVersion: 1,
      published: stateWithEnquiry(),
      draft: null,
    });
    expect(checked.ok).toBe(true);
    if (checked.ok) expect(checked.backup.published?.messages).toEqual([]);
  });
});
