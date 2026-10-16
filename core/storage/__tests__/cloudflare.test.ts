import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { runConformanceSuite } from '../conformance';
import type { StorageAdapter } from '../contract';

// The fifty-at-once tests need headroom: D1-local serialises writers through
// one SQLite connection at ~100ms+ per write through the isolate, so fifty
// sequential commits take the better part of ten seconds. That throughput
// rhymes with production D1 rather than contradicting it; what the tests pin
// is that nothing is lost and the order holds, not how fast it lands.
vi.setConfig({ testTimeout: 120_000 });

/**
 * The Cloudflare D1+R2 engines against the shared conformance suite.
 *
 * Nothing to install and nothing to sign up for: Miniflare embeds the real D1
 * SQLite engine and the real R2 object API in-process, persisted to a
 * throwaway folder per run (see `OPB_CLOUDFLARE_DIR` below). That makes this
 * the one backend suite that runs everywhere with no `if (ENV)` gate — the
 * same file other backends skip without credentials.
 *
 * The adapter resolves its directory at module load, so the temp folder is
 * chosen before the first import, the way the filesystem adapter's own suite
 * does it. Media additionally proves the `readBytes` proxy path the site
 * serves R2 objects through.
 */

const originalCwd = process.cwd();
const originalMemory = process.env.OPB_CLOUDFLARE_MEMORY;

beforeAll(async () => {
  // In-memory engines: same SQL, same R2 API, no files, no locks, and an
  // order of magnitude faster. Set before the first import — the adapter
  // resolves persistence at module load, the way the filesystem adapter's own
  // suite chooses its directory before importing.
  process.env.OPB_CLOUDFLARE_MEMORY = '1';
});

afterAll(async () => {
  // No __resetCloudflare() dispose here on purpose: disposing the Miniflare
  // runtime during teardown takes the vitest worker down with it
  // ("Worker exited unexpectedly", exit code 1 on a green suite). The OS
  // reclaims workerd when the worker exits by itself.
  if (originalMemory === undefined) delete process.env.OPB_CLOUDFLARE_MEMORY;
  else process.env.OPB_CLOUDFLARE_MEMORY = originalMemory;
  process.chdir(originalCwd);
});

async function load(): Promise<StorageAdapter> {
  return (await import('../adapters/cloudflare')).cloudflareAdapter;
}

async function wipe(): Promise<void> {
  const adapter = await load();
  await adapter.provision();
  const { __wipeCloudflare } = await import('../adapters/cloudflare');
  await __wipeCloudflare();
}

runConformanceSuite({ describe, it, expect } as never, 'cloudflare', load, wipe);

describe('cloudflare media proxy', () => {
  it('streams R2 bytes through readBytes for the same-origin route', async () => {
    await wipe();
    const adapter = await load();

    const bytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47]);
    const record = await adapter.media.put('proxied.png', bytes, 'image/png');
    expect(record.url).toBe('/api/media/proxied.png');

    const stored = await adapter.media.readBytes?.('proxied.png');
    expect(stored?.mimeType).toBe('image/png');
    expect(stored?.sizeBytes).toBe(4);
    expect(stored ? Array.from(stored.data) : []).toEqual([0x89, 0x50, 0x4e, 0x47]);

    expect(await adapter.media.readBytes?.('missing.png')).toBeNull();
    await adapter.media.remove('proxied.png');
  });
});
