import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * The server actions behind the collection screens, against a real local
 * store: the owner check comes first, and a save from a screen that loaded
 * before somebody else's save is refused rather than written over it.
 */

const owner = vi.hoisted(() => ({ signedIn: true }));
vi.mock('@/core/auth/guard', () => ({
  requireOwner: async () => {
    if (!owner.signedIn) throw new Error('Not signed in.');
    return { email: 'owner@example.test' };
  },
}));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn(), revalidateTag: vi.fn() }));

const dir = mkdtempSync(path.join(tmpdir(), 'opb-actions-'));
process.env.OPB_DATA_DIR = dir;
delete process.env.DATABASE_URL;

const { updateExperienceAction } = await import('../collections');
const { resetStorageAdapter } = await import('@/core/storage/registry');

afterAll(() => rmSync(dir, { recursive: true, force: true }));
beforeEach(() => {
  owner.signedIn = true;
  resetStorageAdapter();
});

const role = (id: string, company: string) => ({
  id,
  period: '',
  startDate: '2022-03-01',
  type: 'Full-time',
  role: 'Designer',
  company,
  current: true,
  summary: '',
  highlights: [],
  sortOrder: 1,
  visible: true,
});

describe('collection actions', () => {
  it('refuse a caller who is not the owner, before touching storage', async () => {
    owner.signedIn = false;
    await expect(updateExperienceAction([role('exp-a', 'Harbour')])).rejects.toThrow(
      'Not signed in.'
    );
  });

  it('save, hand back the next token, and refuse a save from a stale screen', async () => {
    const first = await updateExperienceAction([role('exp-a', 'Harbour')]);
    expect(first.ok, first.error).toBe(true);
    expect(first.experience?.map((item) => item.company)).toEqual(['Harbour']);
    expect(first.token).toBeTruthy();

    // A second tab saves on top of that…
    const second = await updateExperienceAction([role('exp-b', 'Northwind')], first.token);
    expect(second.ok, second.error).toBe(true);

    // …and the first tab, still holding the old token, is told rather than
    // allowed to put Harbour back over Northwind.
    const stale = await updateExperienceAction([role('exp-a', 'Harbour again')], first.token);
    expect(stale.ok).toBe(false);
    expect(stale.conflict).toBe(true);

    const fresh = await updateExperienceAction([role('exp-c', 'Contoso')], second.token);
    expect(fresh.ok, fresh.error).toBe(true);
    expect(fresh.experience?.map((item) => item.company)).toEqual(['Contoso']);
  });

  it('refuse a list that is not one', async () => {
    const result = await updateExperienceAction('not a list');
    expect(result.ok).toBe(false);
    expect(result.conflict).toBeFalsy();
  });
});
