import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { INITIAL_CMS_STATE } from '@/cms/data/initialData';
import type { CMSState } from '@/cms/types/cms';
import { createPage } from '@/core/pages/schema';

/**
 * Expiring share links.
 *
 * Lazy imports + a throwaway store (see otp.test.ts): creating tokens writes
 * to storage, and the suite must not touch this checkout's database.
 */

const tokens = () => import('../tokens');

const originalCwd = process.cwd();
let workDir: string;

beforeAll(async () => {
  workDir = await mkdtemp(path.join(tmpdir(), 'opb-share-'));
  process.chdir(workDir);

  // Resolution walks the draft page list, so the throwaway store needs pages
  // with the ids the tests mint links for.
  const { getStorageAdapter } = await import('@/core/storage/registry');
  const state: CMSState = {
    ...INITIAL_CMS_STATE,
    pages: [
      createPage({ title: 'One', id: 'page-1' }),
      createPage({ title: 'Two', id: 'page-2' }),
      createPage({ title: 'Three', id: 'page-3' }),
      createPage({ title: 'Four', id: 'page-4' }),
      createPage({ title: 'Five', id: 'page-5' }),
      createPage({ title: 'Six', id: 'page-6' }),
    ],
  };
  await (await getStorageAdapter()).writeSnapshot('draft', state);
});

afterAll(async () => {
  process.chdir(originalCwd);
  await rm(workDir, { recursive: true, force: true });
});

describe('share links', () => {
  it('creates a token that resolves to the page', async () => {
    const { createShareLink, resolveShareToken } = await tokens();
    const link = await createShareLink('page-1', 7);
    expect(typeof link.token).toBe('string');
    expect(link.token.length).toBeGreaterThan(16);
    expect(link.pageId).toBe('page-1');
    expect(Date.parse(link.expiresAt)).toBeGreaterThan(Date.now());
    await expect(resolveShareToken(link.token)).resolves.toEqual({ pageId: 'page-1' });
  });

  it('rejects garbage without touching storage semantics', async () => {
    const { resolveShareToken } = await tokens();
    await expect(resolveShareToken('')).resolves.toBeNull();
    await expect(resolveShareToken('short')).resolves.toBeNull();
    await expect(resolveShareToken('a'.repeat(40))).resolves.toBeNull();
  });

  it('a new link replaces the old one', async () => {
    const { createShareLink, resolveShareToken } = await tokens();
    const first = await createShareLink('page-2', 7);
    const second = await createShareLink('page-2', 7);
    expect(second.token).not.toBe(first.token);
    await expect(resolveShareToken(first.token)).resolves.toBeNull();
    await expect(resolveShareToken(second.token)).resolves.toEqual({ pageId: 'page-2' });
  });

  it('revoking kills the link', async () => {
    const { createShareLink, resolveShareToken, revokeShareLink } = await tokens();
    const link = await createShareLink('page-3', 7);
    await expect(resolveShareToken(link.token)).resolves.toEqual({ pageId: 'page-3' });
    await revokeShareLink('page-3');
    await expect(resolveShareToken(link.token)).resolves.toBeNull();
    // Idempotent: revoking nothing is also fine.
    await revokeShareLink('page-3');
  });

  it('reports status, and lapses without a sweeper', async () => {
    const { createShareLink, shareLinkStatus } = await tokens();
    await expect(shareLinkStatus('page-4')).resolves.toEqual({ active: false, expiresAt: null });
    const link = await createShareLink('page-4', 7);
    const status = await shareLinkStatus('page-4');
    expect(status.active).toBe(true);
    expect(status.expiresAt).toBe(link.expiresAt);
  });

  it('lapses without a sweeper', async () => {
    const { resolveShareToken } = await tokens();
    const { getStorageAdapter } = await import('@/core/storage/registry');
    const adapter = await getStorageAdapter();
    const { createHash } = await import('node:crypto');
    const token = 'an-old-token-that-once-worked-1234';
    await adapter.kv.set(
      'share',
      'page:lapsed',
      {
        tokenHash: createHash('sha256').update(token, 'utf8').digest('hex'),
        pageId: 'page-lapsed',
        createdAt: new Date(Date.now() - 10 * 86_400_000).toISOString(),
        expiresAt: new Date(Date.now() - 1000).toISOString(),
      },
      60
    );
    // An expired link resolves to nothing. The kv TTL removes the row itself;
    // the resolve path deletes it early only when it visits a page that still
    // exists.
    await expect(resolveShareToken(token)).resolves.toBeNull();
  });

  it('clamps the lifetime to a sane range', async () => {
    const { createShareLink, shareLinkStatus } = await tokens();
    const zero = await createShareLink('page-5', 0);
    expect(Date.parse(zero.expiresAt)).toBeGreaterThan(Date.now());
    const huge = await createShareLink('page-6', 10000);
    const days = (Date.parse(huge.expiresAt) - Date.now()) / 86_400_000;
    expect(days).toBeLessThanOrEqual(90);
    await expect(shareLinkStatus('page-5')).resolves.toMatchObject({ active: true });
  });
});
