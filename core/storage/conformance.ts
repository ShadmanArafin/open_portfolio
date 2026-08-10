import type { CMSState } from '@/cms/types/cms';
import type { StorageAdapter } from './contract';

/**
 * The shared specification every storage backend must satisfy.
 *
 * This is the single thing that makes supporting many backends survivable.
 * Without it, each adapter is 80% finished in a slightly different way, and the
 * bugs only appear on someone else's deployment where they cannot be
 * reproduced. With it, "does this adapter work?" has one answer that anybody
 * can run.
 *
 * Written framework-agnostically — it takes `describe`/`it`/`expect` as
 * arguments — so the same file can be run by whatever the project happens to
 * use, and so a contributor adding an adapter has nothing to wire up.
 */

export interface TestApi {
  describe: (name: string, fn: () => void) => void;
  it: (name: string, fn: () => Promise<void> | void) => void;
  expect: (value: unknown) => {
    toBe: (expected: unknown) => void;
    toEqual: (expected: unknown) => void;
    toBeNull: () => void;
    toBeTruthy: () => void;
    toBeGreaterThan: (n: number) => void;
  };
}

/** Enough of a content document to be structurally valid. */
export function makeTestContent(marker: string): CMSState {
  return {
    status: 'published',
    lastSavedAt: '2026-01-01T00:00:00.000Z',
    lastPublishedAt: '2026-01-01T00:00:00.000Z',
    settings: { fullName: marker } as CMSState['settings'],
    microcopy: {} as CMSState['microcopy'],
    appearance: {} as CMSState['appearance'],
    seo: { siteTitle: marker } as CMSState['seo'],
    sections: [],
    projects: [],
    caseStudies: [],
    brands: [],
    experience: [],
    education: [],
    processSteps: [],
    capabilityGroups: [],
    recommendations: [],
    artifacts: [],
    socialLinks: [],
    navLinks: [],
    media: [],
    messages: [],
    versions: [],
    activityLogs: [],
  };
}

/**
 * Runs the full suite against one adapter.
 *
 * `reset` must return the backend to an empty state. An adapter that cannot do
 * that cannot be tested in isolation, and an untestable adapter should not
 * ship.
 */
export interface ConformanceOptions {
  /**
   * Skips the media tests.
   *
   * For running the shared SQL engine against a bare Postgres, where the
   * database half is real but there is no object store attached. Better to
   * verify most of an adapter honestly than to mock the rest and verify
   * nothing.
   */
  skipMedia?: boolean;
}

export function runConformanceSuite(
  api: TestApi,
  adapterName: string,
  getAdapter: () => Promise<StorageAdapter> | StorageAdapter,
  reset: () => Promise<void>,
  options: ConformanceOptions = {}
): void {
  const { describe, it, expect } = api;

  /** Registers nothing, so a skipped group simply does not exist. */
  const skip = (_name: string, _fn: () => void) => {};

  describe(`storage conformance: ${adapterName}`, () => {
    it('reports its own identity and capabilities', async () => {
      const adapter = await getAdapter();
      expect(typeof adapter.id).toBe('string');
      expect(typeof adapter.displayName).toBe('string');
      expect(typeof adapter.capabilities.durable).toBe('boolean');
      expect(typeof adapter.capabilities.maxUploadBytes).toBe('number');
    });

    it('provisions without error, and again without error', async () => {
      await reset();
      const adapter = await getAdapter();
      await adapter.provision();
      // Idempotence matters: provisioning runs on boot, so a second call must
      // not fail and must not wipe anything.
      await adapter.provision();
      const health = await adapter.health();
      expect(health.ok).toBe(true);
    });

    it('returns null for content that was never written', async () => {
      await reset();
      const adapter = await getAdapter();
      await adapter.provision();
      expect(await adapter.readSnapshot('published')).toBeNull();
      expect(await adapter.readSnapshot('draft')).toBeNull();
    });

    it('round-trips a snapshot without altering it', async () => {
      await reset();
      const adapter = await getAdapter();
      await adapter.provision();

      const content = makeTestContent('round-trip');
      await adapter.writeSnapshot('published', content);

      const read = await adapter.readSnapshot('published');
      expect(read?.settings.fullName).toBe('round-trip');
      // Deep equality, not a spot check: a backend that silently drops empty
      // arrays or reorders keys will corrupt content over time.
      expect(read).toEqual(content);
    });

    it('keeps published and draft separate', async () => {
      await reset();
      const adapter = await getAdapter();
      await adapter.provision();

      await adapter.writeSnapshot('published', makeTestContent('live'));
      await adapter.writeSnapshot('draft', makeTestContent('work in progress'));

      expect((await adapter.readSnapshot('published'))?.settings.fullName).toBe('live');
      expect((await adapter.readSnapshot('draft'))?.settings.fullName).toBe('work in progress');
    });

    it('overwrites rather than appends on a second write', async () => {
      await reset();
      const adapter = await getAdapter();
      await adapter.provision();

      await adapter.writeSnapshot('published', makeTestContent('first'));
      await adapter.writeSnapshot('published', makeTestContent('second'));
      expect((await adapter.readSnapshot('published'))?.settings.fullName).toBe('second');
    });

    it('survives concurrent writes with one of them winning intact', async () => {
      await reset();
      const adapter = await getAdapter();
      await adapter.provision();

      // The requirement is not "last writer wins" — it is that every write
      // succeeds and the stored document is one of them, never a torn mixture
      // and never an error. Six writers rather than two, because a two-way race
      // is easy to win by luck on a fast filesystem and this check exists to
      // catch the case that only shows up under real contention.
      const writers = ['a', 'b', 'c', 'd', 'e', 'f'];
      await Promise.all(
        writers.map((id) => adapter.writeSnapshot('published', makeTestContent(`writer-${id}`)))
      );

      const read = await adapter.readSnapshot('published');
      expect(read !== null).toBe(true);
      expect(writers.some((id) => read?.settings.fullName === `writer-${id}`)).toBe(true);
    });

    // Skipped when there is no object store attached — see ConformanceOptions.
    const describeMedia = options.skipMedia ? skip : describe;

    describeMedia('media', () => {
      it('stores, resolves and removes an asset', async () => {
        await reset();
        const adapter = await getAdapter();
        await adapter.provision();

        const bytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47]);
        const record = await adapter.media.put('conformance.png', bytes, 'image/png');

        expect(record.key).toBe('conformance.png');
        expect(record.sizeBytes).toBe(4);
        // A URL, never a Blob. Downloading every asset to build an object URL
        // is what the previous design forced and this one exists to avoid.
        expect(typeof record.url).toBe('string');

        expect(typeof (await adapter.media.resolveUrl('conformance.png'))).toBe('string');

        await adapter.media.remove('conformance.png');
        expect(await adapter.media.resolveUrl('conformance.png')).toBeNull();
      });

      it('returns null for an asset that does not exist', async () => {
        await reset();
        const adapter = await getAdapter();
        await adapter.provision();
        expect(await adapter.media.resolveUrl('never-uploaded.png')).toBeNull();
      });

      it('removing something already gone is not an error', async () => {
        await reset();
        const adapter = await getAdapter();
        await adapter.provision();
        // Delete is expected to be idempotent: the caller wants it absent, and
        // it is absent.
        await adapter.media.remove('never-uploaded.png');
      });

      it('lists what has been stored', async () => {
        await reset();
        const adapter = await getAdapter();
        await adapter.provision();

        await adapter.media.put('one.png', new Uint8Array([1]), 'image/png');
        await adapter.media.put('two.png', new Uint8Array([2, 3]), 'image/png');

        const listed = await adapter.media.list();
        const keys = listed.map((m) => m.key).sort();
        expect(keys.includes('one.png')).toBe(true);
        expect(keys.includes('two.png')).toBe(true);
      });
    });

    describe('owner', () => {
      it('is null before the site is claimed', async () => {
        await reset();
        const adapter = await getAdapter();
        await adapter.provision();
        expect(await adapter.readOwner()).toBeNull();
      });

      it('round-trips the owner record', async () => {
        await reset();
        const adapter = await getAdapter();
        await adapter.provision();

        const owner = {
          email: 'owner@example.com',
          passphraseHash: 'scrypt$1$2$3$abc$def',
          createdAt: '2026-01-01T00:00:00.000Z',
          sessionEpoch: 1,
        };
        await adapter.writeOwner(owner);
        expect(await adapter.readOwner()).toEqual(owner);
      });
    });

    describe('kv', () => {
      it('stores and reads a value back', async () => {
        await reset();
        const adapter = await getAdapter();
        await adapter.provision();

        await adapter.kv.set('session', 'abc', { email: 'a@example.com' }, 60);
        expect(await adapter.kv.get('session', 'abc')).toEqual({ email: 'a@example.com' });
      });

      it('returns null for a key that was never set', async () => {
        await reset();
        const adapter = await getAdapter();
        await adapter.provision();
        expect(await adapter.kv.get('session', 'missing')).toBeNull();
      });

      it('treats an expired value as absent', async () => {
        await reset();
        const adapter = await getAdapter();
        await adapter.provision();

        // A zero TTL is already in the past by the time it is read. Sessions
        // outliving their expiry is the failure this guards against.
        await adapter.kv.set('session', 'expired', 'value', 0);
        expect(await adapter.kv.get('session', 'expired')).toBeNull();
      });

      it('deletes a value', async () => {
        await reset();
        const adapter = await getAdapter();
        await adapter.provision();

        await adapter.kv.set('session', 'doomed', 'value', 60);
        await adapter.kv.del('session', 'doomed');
        expect(await adapter.kv.get('session', 'doomed')).toBeNull();
      });

      it('counts upwards on incr', async () => {
        await reset();
        const adapter = await getAdapter();
        await adapter.provision();

        expect(await adapter.kv.incr('ratelimit', 'hits', 60)).toBe(1);
        expect(await adapter.kv.incr('ratelimit', 'hits', 60)).toBe(2);
        expect(await adapter.kv.incr('ratelimit', 'hits', 60)).toBe(3);
      });

      it('keeps namespaces apart', async () => {
        await reset();
        const adapter = await getAdapter();
        await adapter.provision();

        await adapter.kv.set('session', 'same-key', 'session value', 60);
        await adapter.kv.set('otp', 'same-key', 'otp value', 60);

        expect(await adapter.kv.get('session', 'same-key')).toBe('session value');
        expect(await adapter.kv.get('otp', 'same-key')).toBe('otp value');
      });

      it('clears one namespace without touching another', async () => {
        await reset();
        const adapter = await getAdapter();
        await adapter.provision();

        await adapter.kv.set('session', 'a', 1, 60);
        await adapter.kv.set('otp', 'b', 2, 60);

        // "Sign out everywhere" must not also reset rate limits or pending
        // one-time codes.
        await adapter.kv.clear('session');
        expect(await adapter.kv.get('session', 'a')).toBeNull();
        expect(await adapter.kv.get('otp', 'b')).toBe(2);
      });
    });

    describe('isolation between content and auth state', () => {
      it('does not put sessions or the owner inside the content snapshot', async () => {
        await reset();
        const adapter = await getAdapter();
        await adapter.provision();

        await adapter.writeOwner({
          email: 'owner@example.com',
          passphraseHash: 'scrypt$secret',
          createdAt: '2026-01-01T00:00:00.000Z',
          sessionEpoch: 1,
        });
        await adapter.kv.set('session', 'token-hash', { email: 'owner@example.com' }, 60);
        await adapter.writeSnapshot('published', makeTestContent('exported'));

        // A content export is something users hand around. A passphrase hash
        // or a live session travelling with it would be a serious leak.
        const snapshot = JSON.stringify(await adapter.readSnapshot('published'));
        expect(snapshot.includes('scrypt$secret')).toBe(false);
        expect(snapshot.includes('token-hash')).toBe(false);
      });
    });
  });
}
