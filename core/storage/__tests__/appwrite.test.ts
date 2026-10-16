import { describe, expect, it, vi } from 'vitest';
import { runConformanceSuite } from '../conformance';
import type { StorageAdapter } from '../contract';

// Provision bakes attributes server-side and the fifty-at-once tests stream
// fifty requests through it: the 5-second default would time out honest work.
vi.setConfig({ testTimeout: 120_000 });

/**
 * Appwrite against the shared conformance suite.
 *
 * Needs a running Appwrite with a project and an API key. Locally (see
 * `docker-compose.appwrite.yml` for the one-command version, or the Appwrite
 * docs for the installer):
 *
 *   APPWRITE_TEST_ENDPOINT=http://localhost:8081/v1 \
 *   APPWRITE_TEST_PROJECT_ID=<project id> \
 *   APPWRITE_TEST_API_KEY=<key with databases/collections/documents/files/buckets scopes> \
 *   npm run test -- core/storage/__tests__/appwrite.test.ts
 *
 * CI runs the same against the official compose stack (see
 * `.github/workflows/ci.yml`), so every push exercises it. The adapter reads
 * its configuration per call, so pointing the production variables at the test
 * instance needs no test-only seam.
 */
const TEST_ENDPOINT = process.env.APPWRITE_TEST_ENDPOINT;

if (TEST_ENDPOINT) {
  const load = async (): Promise<StorageAdapter> => {
    process.env.APPWRITE_ENDPOINT = TEST_ENDPOINT;
    process.env.APPWRITE_PROJECT_ID = process.env.APPWRITE_TEST_PROJECT_ID;
    process.env.APPWRITE_API_KEY = process.env.APPWRITE_TEST_API_KEY;
    return (await import('../adapters/appwrite')).appwriteAdapter;
  };

  const wipe = async () => {
    const adapter = await load();
    await adapter.provision();
    await resetViaApi();
  };

  runConformanceSuite({ describe, it, expect } as never, 'appwrite', load, wipe);

  describe('appwrite media visibility', () => {
    it('serves uploaded files to strangers', async () => {
      await wipe();
      const adapter = await load();

      const bytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47]);
      await adapter.media.put('public.png', bytes, 'image/png');
      const url = (await adapter.media.resolveUrl('public.png')) as string;
      expect(typeof url).toBe('string');

      // No credentials of any kind: this is what a visitor's browser sends.
      // The bucket's read("any") permission is what allows it.
      const fetched = await fetch(url);
      expect(fetched.status).toBe(200);
      expect(new Uint8Array(await fetched.arrayBuffer())).toEqual(bytes);

      await adapter.media.remove('public.png');
      expect(await adapter.media.resolveUrl('public.png')).toBeNull();
    });
  });
} else {
  describe('storage conformance: appwrite', () => {
    it.skip('needs APPWRITE_TEST_ENDPOINT, APPWRITE_TEST_PROJECT_ID and APPWRITE_TEST_API_KEY', () => {});
  });
}

/**
 * Deletes every document in every opb_* collection, plus every file.
 *
 * Through the raw API rather than the adapter: the reset must not depend on
 * the code it is resetting, or a broken `remove` would leave rows behind and
 * the suite would test the previous run's leftovers looking green.
 */
async function resetViaApi(): Promise<void> {
  const base = (process.env.APPWRITE_TEST_ENDPOINT as string).replace(/\/$/, '');
  const headers = {
    'X-Appwrite-Project': process.env.APPWRITE_TEST_PROJECT_ID as string,
    'X-Appwrite-Key': process.env.APPWRITE_TEST_API_KEY as string,
    'Content-Type': 'application/json',
  };
  // Paged explicitly: bare `limit`/`offset` URL parameters are ignored and the
  // default page is 25 rows, so a single list-and-delete pass leaves leftovers
  // that the next test mistakes for its own rows.
  async function wipeCollection(collection: string): Promise<void> {
    for (;;) {
      const params = new URLSearchParams();
      for (const query of [
        JSON.stringify({ method: 'limit', values: [500] }),
        JSON.stringify({ method: 'offset', values: [0] }),
      ]) {
        params.append('queries[]', query);
      }
      const list = (await (
        await fetch(`${base}/databases/opb/collections/${collection}/documents?${params}`, {
          headers,
        })
      ).json()) as { documents?: { $id: string }[]; total?: number };
      const docs = list.documents ?? [];
      await Promise.all(
        docs.map((doc) =>
          fetch(`${base}/databases/opb/collections/${collection}/documents/${doc.$id}`, {
            method: 'DELETE',
            headers,
          })
        )
      );
      if (docs.length === 0) break;
    }
  }
  for (const collection of [
    'content',
    'chunks',
    'owner',
    'kv',
    'messages',
    'subscribers',
    'passkeys',
    'records',
    'singletons',
  ]) {
    await wipeCollection(collection);
  }
  const fileParams = new URLSearchParams();
  fileParams.append('queries[]', JSON.stringify({ method: 'limit', values: [500] }));
  const files = (await (
    await fetch(`${base}/storage/buckets/opb-media/files?${fileParams}`, { headers })
  ).json()) as { files?: { $id: string }[] };
  await Promise.all(
    (files.files ?? []).map((file) =>
      fetch(`${base}/storage/buckets/opb-media/files/${file.$id}`, {
        method: 'DELETE',
        headers,
      })
    )
  );
}
