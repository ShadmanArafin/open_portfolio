import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { runConformanceSuite } from '../conformance';

/**
 * The local adapter against the shared conformance suite.
 *
 * It runs in a throwaway directory rather than the repository, so a test run
 * can never overwrite content someone is actually working on.
 */
let workDir: string;
const originalCwd = process.cwd();

beforeAll(async () => {
  workDir = await mkdtemp(path.join(tmpdir(), 'opb-conformance-'));
  process.chdir(workDir);
});

afterAll(async () => {
  process.chdir(originalCwd);
  await rm(workDir, { recursive: true, force: true });
});

async function loadAdapter() {
  // Imported lazily: the adapter resolves its paths from cwd at module load,
  // which has to happen after the chdir above.
  const { localAdapter } = await import('../adapters/local');
  return localAdapter;
}

runConformanceSuite(
  { describe, it, expect } as never,
  'local filesystem',
  loadAdapter,
  async () => {
    await rm(path.join(workDir, '.opb'), { recursive: true, force: true });
  }
);
