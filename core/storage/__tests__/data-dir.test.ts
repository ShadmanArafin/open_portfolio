import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mkdtemp, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

/**
 * Every adapter writes to the directory this install was given.
 *
 * This exists because two of them answered the question separately and drifted.
 * The Postgres adapter and the media route each carried their own
 * `path.join(process.cwd(), '.opb', 'media')`, ignoring `OPB_DATA_DIR`
 * entirely — so the documented `docker compose up`, which is the whole
 * one-command install, died on its first write with
 * `EACCES: mkdir '/app/.opb'`, and would have served 404 for every uploaded
 * image if the directory had happened to be writable.
 *
 * Nothing failed. 584 tests passed while the primary supported way to run this
 * project could not get past setup, because every one of them ran with
 * `OPB_DATA_DIR` unset, where the wrong expression and the right one give the
 * same answer.
 */

let workDir: string;
const original = process.env.OPB_DATA_DIR;

beforeEach(async () => {
  workDir = await mkdtemp(path.join(tmpdir(), 'opb-datadir-'));
  process.env.OPB_DATA_DIR = workDir;
});

afterEach(async () => {
  if (original === undefined) delete process.env.OPB_DATA_DIR;
  else process.env.OPB_DATA_DIR = original;
  await rm(workDir, { recursive: true, force: true });
});

describe('the data directory', () => {
  it('is the one the environment names', async () => {
    const { dataRoot, mediaRoot } = await import('../adapters/_shared/data-dir');
    expect(dataRoot()).toBe(path.resolve(workDir));
    expect(mediaRoot()).toBe(path.join(path.resolve(workDir), 'media'));
  });

  it('falls back to a folder beside the project when nothing is set', async () => {
    delete process.env.OPB_DATA_DIR;
    const { dataRoot } = await import('../adapters/_shared/data-dir');
    expect(dataRoot()).toBe(path.join(process.cwd(), '.opb'));
  });

  it('is where the Postgres adapter puts an upload', async () => {
    // The adapter keeps content in Postgres and bytes on disk, so this half of
    // it needs no database — which is precisely why the bug survived: the
    // conformance suite exercises it, but always with the variable unset.
    const { postgresAdapter } = await import('../adapters/postgres');

    await postgresAdapter.media.put('proof.png', new Uint8Array([1, 2, 3]), 'image/png');

    expect(await readdir(path.join(workDir, 'media'))).toContain('proof.png');
    expect(await postgresAdapter.media.resolveUrl('proof.png')).toBe('/api/media/proof.png');

    await postgresAdapter.media.remove('proof.png');
    expect(await postgresAdapter.media.resolveUrl('proof.png')).toBeNull();
  });

  it('still refuses a key that climbs out of it', async () => {
    const { postgresAdapter } = await import('../adapters/postgres');
    await expect(
      postgresAdapter.media.put('../escape.txt', new Uint8Array([1]), 'text/plain')
    ).rejects.toThrow(/outside the store/);
  });
});
