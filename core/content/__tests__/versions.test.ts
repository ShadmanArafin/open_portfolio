import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import type { CMSState, ContentVersion } from '@/cms/types/cms';
import type { StorageAdapter } from '@/core/storage/contract';
import { findVersion, listVersions, MAX_VERSIONS, recordVersion } from '../versions';

/** Against the real local adapter, in a throwaway directory. */
let workDir: string;
let adapter: StorageAdapter;
const previous = process.env.OPB_DATA_DIR;

beforeAll(async () => {
  workDir = await mkdtemp(path.join(tmpdir(), 'opb-versions-'));
  process.env.OPB_DATA_DIR = workDir;
  adapter = (await import('@/core/storage/adapters/local')).localAdapter as StorageAdapter;
  await adapter.provision();
});

afterAll(async () => {
  if (previous === undefined) delete process.env.OPB_DATA_DIR;
  else process.env.OPB_DATA_DIR = previous;
  await rm(workDir, { recursive: true, force: true });
});

const version = (n: number): ContentVersion => ({
  id: `v-${1000 + n}`,
  timestamp: new Date(Date.UTC(2026, 0, 1, 0, n)).toISOString(),
  editor: 'Owner',
  action: 'Published Site Changes',
  summary: `publish ${n}`,
  snapshot: { settings: { fullName: `snapshot ${n}` } } as unknown as CMSState,
});

describe('version history as records', () => {
  it('keeps the newest twenty, newest first', async () => {
    for (let n = 1; n <= MAX_VERSIONS + 3; n++) await recordVersion(adapter, version(n));
    const listed = await listVersions(adapter);
    expect(listed).toHaveLength(MAX_VERSIONS);
    expect(listed[0].id).toBe(version(MAX_VERSIONS + 3).id);
    expect(listed.at(-1)!.id).toBe(version(4).id);
    // Pruned for real, not just hidden.
    expect(await findVersion(adapter, version(1).id)).toBeNull();
  });

  it('moves history nested in an old document across on the next publish', async () => {
    const legacy = [version(100), version(101)];
    const old = { versions: legacy } as unknown as CMSState;
    // Readable before the move, straight from the document...
    expect((await findVersion(adapter, 'v-1100', old))?.summary).toBe('publish 100');
    // ...and from records after it, with no document needed.
    await recordVersion(adapter, version(102), legacy);
    expect((await findVersion(adapter, 'v-1100'))?.summary).toBe('publish 100');
    const ids = (await listVersions(adapter)).slice(0, 3).map((v) => v.id);
    expect(ids).toEqual(['v-1102', 'v-1101', 'v-1100']);
  });
});
