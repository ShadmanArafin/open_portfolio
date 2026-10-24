import { describe, expect, it, vi } from 'vitest';
import { runConformanceSuite } from '../conformance';
import type { StorageAdapter } from '../contract';

/**
 * Firebase against the shared conformance suite.
 *
 * Needs the emulator suite (Firestore + Storage). From the repo root:
 *
 *   npx firebase emulators:start --only firestore,storage --project opb-test
 *   FIREBASE_TEST_PROJECT=opb-test \
 *   FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 \
 *   STORAGE_EMULATOR_HOST=http://127.0.0.1:9199 \
 *   npm run test -- core/storage/__tests__/firebase.test.ts
 *
 * CI does the same on ubuntu-latest (see `.github/workflows/ci.yml`), so every
 * push exercises it. The adapter reads its configuration per call, so pointing
 * the production variables at the emulators needs no test-only seam — with the
 * one exception below, where the memoised Admin app is dropped between suites
 * that use different projects.
 */
const TEST_PROJECT = process.env.FIREBASE_TEST_PROJECT;

if (TEST_PROJECT) {
  // The emulator locks a document per transaction, and the Admin SDK retries
  // a transaction that loses the lock after 1 s, then ×1.5 with full jitter,
  // up to 5 attempts. Six writers racing one document (the concurrency case)
  // take a steady ~3.5 s on an idle machine for that reason alone; on a busy
  // CI runner it passed 5 s, and the timed-out test's writers went on to bump
  // the revision under the next test. The assertions are unchanged — every
  // write must still succeed — only the budget fits the backoff.
  vi.setConfig({ testTimeout: 30_000, hookTimeout: 30_000 });

  const load = async (): Promise<StorageAdapter> => {
    process.env.FIREBASE_PROJECT_ID = TEST_PROJECT;
    const { __resetFirebaseApp, firebaseAdapter } = await import('../adapters/firebase');
    await __resetFirebaseApp();
    return firebaseAdapter;
  };

  const wipe = async () => {
    const adapter = await load();
    await adapter.provision();
    await resetViaSdk();
  };

  runConformanceSuite({ describe, it, expect } as never, 'firebase', load, wipe);

  describe('firebase media visibility', () => {
    it('serves uploaded files to strangers', async () => {
      await wipe();
      const adapter = await load();

      const bytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47]);
      await adapter.media.put('public.png', bytes, 'image/png');
      const url = (await adapter.media.resolveUrl('public.png')) as string;
      expect(typeof url).toBe('string');

      // No credentials of any kind: this is what a visitor's browser sends.
      // The storage rules in emulators/storage.rules are what allow it.
      const fetched = await fetch(url);
      expect(fetched.status).toBe(200);
      expect(new Uint8Array(await fetched.arrayBuffer())).toEqual(bytes);

      await adapter.media.remove('public.png');
      expect(await adapter.media.resolveUrl('public.png')).toBeNull();
    });
  });
} else {
  describe('storage conformance: firebase', () => {
    it.skip('needs FIREBASE_TEST_PROJECT, FIRESTORE_EMULATOR_HOST and STORAGE_EMULATOR_HOST', () => {});
  });
}

/**
 * Deletes every document in every opb_* collection, plus every file.
 *
 * Through the adapter's own record layer would do, but the reset must not
 * depend on the code it is resetting: a broken `remove` would leave rows
 * behind and the suite would test the previous run's leftovers looking green.
 */
async function resetViaSdk(): Promise<void> {
  const { getFirestore } = await import('firebase-admin/firestore');
  const { getStorage } = await import('firebase-admin/storage');
  const { getApps } = await import('firebase-admin/app');
  const attributed = getApps()[0];
  const db = getFirestore(attributed);
  for (const collection of [
    'opb_content',
    'opb_owner',
    'opb_kv',
    'opb_messages',
    'opb_subscribers',
    'opb_passkeys',
    'opb_records',
    'opb_singletons',
  ]) {
    const snap = await db.collection(collection).get();
    await Promise.all(snap.docs.map((d) => d.ref.delete()));
  }
  const [files] = await getStorage(attributed)
    .bucket(process.env.FIREBASE_STORAGE_BUCKET || `${process.env.FIREBASE_PROJECT_ID}.appspot.com`)
    .getFiles();
  await Promise.all(files.map((f) => f.delete({ ignoreNotFound: true })));
}
