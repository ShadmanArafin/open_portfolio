import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * What the admin is allowed to know about a service.
 *
 * The projection in `views.ts` is the boundary where secrets stop — both the
 * endpoint and the server-rendered screen read through it — and the property
 * that matters is negative: a stored password must not be in the returned
 * object, as a value or anywhere `JSON.stringify` can find it.
 */

const store = new Map<string, unknown>();
vi.mock('@/core/storage/registry', () => ({
  getStorageAdapter: async () => ({
    kv: {
      get: async (ns: string, key: string) => store.get(`${ns}:${key}`) ?? null,
      set: async (ns: string, key: string, value: unknown) => void store.set(`${ns}:${key}`, value),
      del: async (ns: string, key: string) => void store.delete(`${ns}:${key}`),
    },
  }),
}));

// Importing the index is what registers the definitions, and it re-exports
// the projection being tested.
const { listIntegrationViews, writeConfig } = await import('../index');

beforeEach(() => {
  store.clear();
  process.env.OPB_SECRET_KEY = 'a-server-secret-that-is-long-enough';
  delete process.env.OPB_SMTP_HOST;
});

describe('listIntegrationViews', () => {
  it('describes every registered service, configured or not', async () => {
    const views = await listIntegrationViews();

    // Sorted by id, not registration order: the registry's insertion order
    // depends on which definition file the running bundle imported first.
    expect(views.map((view) => view.id)).toEqual([
      'ai-assist',
      'giscus',
      'listmonk',
      'plausible',
      'smtp',
      'turnstile',
      'umami',
    ]);
    for (const view of views) {
      expect(view.isConfigured).toBe(false);
      expect(view.values).toEqual({});
      expect(view.secrets).toEqual({});
    }
  });

  it('keeps a stored secret out of the payload and leaves only its hint', async () => {
    await writeConfig(
      'smtp',
      {
        host: 'smtp.example.com',
        port: 587,
        secure: false,
        user: 'me@example.com',
        password: 'hunter2',
        from: 'me@example.com',
      },
      ['password']
    );

    const smtp = (await listIntegrationViews()).find((view) => view.id === 'smtp');

    expect(smtp?.isConfigured).toBe(true);
    expect(smtp?.values).toMatchObject({ host: 'smtp.example.com', port: 587 });
    expect(smtp?.values).not.toHaveProperty('password');
    expect(smtp?.secrets.password).toEqual({ isSet: true, hint: '••••ter2' });
    expect(JSON.stringify(smtp)).not.toContain('hunter2');
  });

  it('marks a service configured by environment, where env wins', async () => {
    process.env.OPB_SMTP_HOST = 'smtp.example.com';

    const smtp = (await listIntegrationViews()).find((view) => view.id === 'smtp');

    expect(smtp?.configuredByEnv).toBe(true);
    expect(smtp?.isConfigured).toBe(true);
  });
});
