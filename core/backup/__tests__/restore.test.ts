import { describe, expect, it, beforeAll, afterAll } from 'vitest';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { INITIAL_CMS_STATE } from '@/cms/data/initialData';
import { buildBackup, checkBackup } from '@/core/backup/bundle';

const originalCwd = process.cwd();
let workDir: string;

beforeAll(async () => {
  workDir = await mkdtemp(path.join(tmpdir(), 'opb-restore-'));
  process.chdir(workDir);
});

afterAll(async () => {
  process.chdir(originalCwd);
  await rm(workDir, { recursive: true, force: true });
});

describe('backup restore proof', () => {
  it('exports, wipes, and restores both channels with no secrets', async () => {
    const { localAdapter } = await import('@/core/storage/adapters/local');
    const adapter = localAdapter;

    await adapter.writeSnapshot('published', INITIAL_CMS_STATE);
    await adapter.writeSnapshot('draft', { ...INITIAL_CMS_STATE, projects: [] });
    // Secrets and inbox live outside snapshots; prove they never enter the bundle.
    await adapter.kv.set('config', 'smtp', { pass: 'secret' });
    await adapter.messages.append({
      id: 'm1',
      name: 'Stranger',
      email: 's@example.com',
      message: 'hello',
      createdAt: new Date().toISOString(),
      read: false,
    } as never);

    const bundle = buildBackup({
      adapterId: adapter.id,
      published: await adapter.readSnapshot('published'),
      draft: await adapter.readSnapshot('draft'),
      media: [],
    });
    const wire = JSON.parse(JSON.stringify(bundle)) as unknown;
    expect(JSON.stringify(wire)).not.toContain('secret');

    // Wipe content channels only — kv/messages stay, as they would on a real box.
    await adapter.writeSnapshot('published', { ...INITIAL_CMS_STATE, projects: [] });
    expect((await adapter.readSnapshot('published'))?.projects).toEqual([]);

    const checked = checkBackup(wire);
    expect(checked.ok).toBe(true);
    if (!checked.ok) return;
    if (checked.backup.published)
      await adapter.writeSnapshot('published', checked.backup.published);
    if (checked.backup.draft) await adapter.writeSnapshot('draft', checked.backup.draft);

    const restored = await adapter.readSnapshot('published');
    expect(restored?.projects).toEqual(INITIAL_CMS_STATE.projects);
    expect(restored?.messages ?? []).toEqual([]);
    // Auth-adjacent state was never in the bundle and is untouched by restore.
    expect(await adapter.kv.get('config', 'smtp')).toEqual({ pass: 'secret' });
  });
});
