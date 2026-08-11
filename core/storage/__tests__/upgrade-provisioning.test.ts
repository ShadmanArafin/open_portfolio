import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import type { ContactMessage } from '@/cms/types/cms';
import { makeTestContent } from '../conformance';

/**
 * What an upgrade actually looks like.
 *
 * The conformance suite calls `provision()` itself before every case, so it
 * proves the adapters provision correctly and nothing at all about whether
 * anybody calls them. On a running instance the only caller was the claim
 * flow, which is gated on there being no owner yet — so on every site that was
 * claimed before this upgrade, provisioning never happened again: no messages
 * table on the SQL backends, and legacy enquiries left in the snapshot to be
 * deleted by the first publish.
 *
 * Everything below is therefore built on disk by hand, the way the previous
 * version left it, and `provision()` is never called.
 */

let workDir: string;
const originalCwd = process.cwd();

beforeAll(async () => {
  workDir = await mkdtemp(path.join(tmpdir(), 'opb-upgrade-'));
  process.chdir(workDir);
});

afterAll(async () => {
  process.chdir(originalCwd);
  await rm(workDir, { recursive: true, force: true });
});

const legacy: ContactMessage = {
  id: 'legacy-1',
  name: 'Dana Okafor',
  email: 'dana@example.com',
  company: 'Northwind',
  projectType: 'Website',
  message: 'Are you free in March?',
  receivedAt: '2026-01-01T00:00:00.000Z',
  status: 'unread',
};

/** Writes the on-disk state of a site claimed by a previous version. */
async function seedClaimedInstance(): Promise<void> {
  await rm(path.join(workDir, '.opb'), { recursive: true, force: true });
  await mkdir(path.join(workDir, '.opb', 'content'), { recursive: true });
  await mkdir(path.join(workDir, '.opb', 'state'), { recursive: true });

  const content = makeTestContent('already claimed');
  content.messages = [legacy];
  await writeFile(
    path.join(workDir, '.opb', 'content', 'published.json'),
    JSON.stringify(content),
    'utf8'
  );
  await writeFile(
    path.join(workDir, '.opb', 'state', 'owner.json'),
    JSON.stringify({
      email: 'owner@example.com',
      passphraseHash: 'scrypt$1$2$3$abc$def',
      createdAt: '2026-01-01T00:00:00.000Z',
      sessionEpoch: 1,
    }),
    'utf8'
  );
}

/** Imported lazily: the local adapter resolves its paths at module load. */
async function coldStart() {
  const registry = await import('../registry');
  registry.resetStorageAdapter();
  return registry;
}

describe('an instance claimed before the upgrade', () => {
  it('migrates legacy enquiries out of the snapshot on first use', async () => {
    await seedClaimedInstance();
    const { getStorageAdapter } = await coldStart();

    // Exactly what a request does: ask the registry for the adapter and use
    // it. Nothing here knows provisioning is a thing.
    const adapter = await getStorageAdapter();
    const listed = await adapter.messages.list();

    expect(listed.length).toBe(1);
    expect(listed[0].email).toBe('dana@example.com');
    expect((await adapter.readSnapshot('published'))?.messages.length).toBe(0);
  });

  it('stores a new enquiry that arrives on a cold start', async () => {
    await seedClaimedInstance();
    const { getStorageAdapter } = await coldStart();

    // `/api/contact`, in miniature. On the SQL backends this is the call that
    // threw and lost the enquiry, because `opb_messages` did not exist.
    const adapter = await getStorageAdapter();
    await adapter.messages.append({
      ...legacy,
      id: 'fresh-1',
      receivedAt: '2026-02-01T00:00:00.000Z',
    });

    const ids = (await adapter.messages.list()).map((m) => m.id).sort();
    expect(ids).toEqual(['fresh-1', 'legacy-1']);
  });

  it('provisions once per process, however many requests arrive together', async () => {
    await seedClaimedInstance();
    const { getStorageAdapter, resetStorageAdapter } = await import('../registry');
    const { localAdapter } = await import('../adapters/local');

    const real = localAdapter.provision.bind(localAdapter);
    let calls = 0;
    localAdapter.provision = async () => {
      calls += 1;
      await real();
    };

    try {
      resetStorageAdapter();
      // Concurrent, then sequential. A per-request provision would migrate on
      // every call; a fire-and-forget one would let the first caller past
      // before the table existed.
      await Promise.all([getStorageAdapter(), getStorageAdapter(), getStorageAdapter()]);
      await getStorageAdapter();
      expect(calls).toBe(1);
    } finally {
      localAdapter.provision = real;
    }
  });
});
