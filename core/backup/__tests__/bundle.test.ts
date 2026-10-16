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
    expect(b.bundleVersion).toBe(1);
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
