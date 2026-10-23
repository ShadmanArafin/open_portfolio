import { describe, expect, it } from 'vitest';
import { runConformanceSuite } from '../conformance';
import type { StorageAdapter } from '../contract';

/**
 * PocketBase against the shared conformance suite.
 *
 * Needs a running PocketBase with a superuser. Locally:
 *
 *   pocketbase serve --http 127.0.0.1:8090 --dir ./pbdata
 *   pocketbase superuser upsert you@example.com <password> --dir ./pbdata
 *   POCKETBASE_TEST_URL=http://127.0.0.1:8090 \
 *   POCKETBASE_TEST_ADMIN_EMAIL=you@example.com \
 *   POCKETBASE_TEST_ADMIN_PASSWORD=<password> \
 *   npm run test -- core/storage/__tests__/pocketbase.test.ts
 *
 * CI does the same with the Linux binary (see `.github/workflows/ci.yml`), so
 * every push exercises it. The adapter reads its configuration per call, so
 * pointing the production variables at the test instance needs no test-only
 * seam — with the one exception below, where the memoised superuser token is
 * dropped between suites that use different credentials.
 */
const TEST_URL = process.env.POCKETBASE_TEST_URL;

if (TEST_URL) {
  const load = async (): Promise<StorageAdapter> => {
    process.env.POCKETBASE_URL = TEST_URL;
    process.env.POCKETBASE_ADMIN_EMAIL = process.env.POCKETBASE_TEST_ADMIN_EMAIL;
    process.env.POCKETBASE_ADMIN_PASSWORD = process.env.POCKETBASE_TEST_ADMIN_PASSWORD;
    const { __resetPocketBaseToken, pocketbaseAdapter } = await import('../adapters/pocketbase');
    __resetPocketBaseToken();
    return pocketbaseAdapter;
  };

  const wipe = async () => {
    const adapter = await load();
    await adapter.provision();
    await resetViaHttp(TEST_URL.replace(/\/$/, ''));
  };

  runConformanceSuite({ describe, it, expect } as never, 'pocketbase', load, wipe);

  describe('pocketbase media visibility', () => {
    it('serves uploaded files to strangers and hides everything else', async () => {
      await wipe();
      const adapter = await load();

      const bytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47]);
      await adapter.media.put('public.png', bytes, 'image/png');
      const url = (await adapter.media.resolveUrl('public.png')) as string;
      expect(typeof url).toBe('string');

      // No credentials of any kind: this is what a visitor's browser sends.
      const fetched = await fetch(url);
      expect(fetched.status).toBe(200);
      expect(new Uint8Array(await fetched.arrayBuffer())).toEqual(bytes);

      // ...while record enumeration stays superuser-only.
      const listed = await fetch(
        `${TEST_URL.replace(/\/$/, '')}/api/collections/opb_media/records?perPage=1`
      );
      // Older PocketBase answered 401; v0.23+ answers 403 ("Only superusers").
      expect([401, 403]).toContain(listed.status);
      expect(JSON.stringify(await listed.json())).not.toContain('public.png');

      await adapter.media.remove('public.png');
      expect(await adapter.media.resolveUrl('public.png')).toBeNull();
    });
  });
} else {
  describe('storage conformance: pocketbase', () => {
    it.skip('needs POCKETBASE_TEST_URL, POCKETBASE_TEST_ADMIN_EMAIL and POCKETBASE_TEST_ADMIN_PASSWORD', () => {});
  });
}

/**
 * Deletes every record in every opb_* collection through the HTTP API.
 *
 * Deliberately outside the adapter: the reset must not depend on the code it
 * is resetting, or a broken `remove` would make the suite look green by
 * testing leftover rows from the previous run.
 */
async function resetViaHttp(base: string): Promise<void> {
  const email = process.env.POCKETBASE_TEST_ADMIN_EMAIL ?? '';
  const password = process.env.POCKETBASE_TEST_ADMIN_PASSWORD ?? '';
  const auth = (await (
    await fetch(`${base}/api/collections/_superusers/auth-with-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity: email, password }),
    })
  ).json()) as { token: string };
  const headers = { Authorization: auth.token };
  const collections = [
    'opb_content',
    'opb_owner',
    'opb_kv',
    'opb_messages',
    'opb_subscribers',
    'opb_passkeys',
    'opb_records',
    'opb_singletons',
    'opb_media',
  ];
  for (const collection of collections) {
    const list = (await (
      await fetch(`${base}/api/collections/${collection}/records?perPage=500`, { headers })
    ).json()) as { items?: { id: string }[] };
    await Promise.all(
      (list.items ?? []).map((record) =>
        fetch(`${base}/api/collections/${collection}/records/${record.id}`, {
          method: 'DELETE',
          headers,
        })
      )
    );
  }
}
