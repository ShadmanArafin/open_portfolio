import { describe, expect, it } from 'vitest';
import { readDraftForWrite } from '@/core/content/draft';
import { INITIAL_CMS_STATE } from '@/cms/data/initialData';
import type { CMSState } from '@/cms/types/cms';
import type { SnapshotRead, StorageAdapter } from '@/core/storage/contract';

function adapterWith(snapshots: Partial<Record<'draft' | 'published', SnapshotRead>>) {
  return {
    readSnapshotMeta: async (channel: 'draft' | 'published') => snapshots[channel] ?? null,
  } as unknown as StorageAdapter;
}

const named = (fullName: string): CMSState => {
  const state = structuredClone(INITIAL_CMS_STATE);
  state.settings.fullName = fullName;
  return state;
};

describe('readDraftForWrite', () => {
  it('returns the stored draft and its revision when there is one', async () => {
    const draft = { state: named('Draft'), revision: 7 };
    await expect(readDraftForWrite(adapterWith({ draft }))).resolves.toBe(draft);
  });

  it('starts a brand-new install from the built-in content, create-only', async () => {
    // The regression: a freshly claimed site has no draft row, and every
    // editing screen refused to save until something wrote one.
    const first = await readDraftForWrite(adapterWith({}));
    expect(first.revision).toBe(0);
    expect(first.state).toEqual(INITIAL_CMS_STATE);
    expect(first.state).not.toBe(INITIAL_CMS_STATE);
  });

  it('starts from the published site when that exists but the draft does not', async () => {
    const published = { state: named('Published'), revision: 3 };
    const first = await readDraftForWrite(adapterWith({ published }));
    expect(first.revision).toBe(0);
    expect(first.state.settings.fullName).toBe('Published');
    first.state.settings.fullName = 'edited';
    expect(published.state.settings.fullName).toBe('Published');
  });
});
