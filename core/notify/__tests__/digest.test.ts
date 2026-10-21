import { beforeEach, describe, expect, it, vi } from 'vitest';
import { INITIAL_CMS_STATE } from '@/cms/data/initialData';

const kv = new Map<string, unknown>();
const sent: { to: string; subject: string; text: string }[] = [];
let mailConfigured = true;

vi.mock('@/core/storage/registry', () => ({
  getStorageAdapter: async () => ({
    kv: {
      get: async (_ns: string, key: string) => kv.get(key) ?? null,
      set: async (_ns: string, key: string, value: unknown) => void kv.set(key, value),
    },
    readOwner: async () => ({ email: 'owner@example.test' }),
    readSnapshotMeta: async () => ({
      revision: 1,
      state: { ...INITIAL_CMS_STATE, lastPublishedAt: '2026-09-01' },
    }),
    messages: {
      list: async () => [
        { id: 'm1', receivedAt: '2026-09-10T10:00:00Z', status: 'unread' },
        { id: 'm2', receivedAt: '2026-09-20T10:00:00Z', status: 'spam' },
        { id: 'm3', receivedAt: '2026-08-20T10:00:00Z', status: 'read' },
      ],
    },
  }),
}));
vi.mock('@/core/content/read', () => ({ getContentForChannel: async () => INITIAL_CMS_STATE }));
vi.mock('@/core/integrations/stats', () => ({
  audienceSummary: async () => ({
    provider: 'umami',
    visitors30d: 41,
    pageviews30d: 90,
    topPages: [{ path: '/work', views: 30 }],
  }),
}));
vi.mock('@/core/email/transport', () => ({
  resolveTransportWithStored: async () => (mailConfigured ? { kind: 'smtp' } : { kind: 'none' }),
}));
vi.mock('@/core/email/send', () => ({
  sendMail: async (mail: { to: string; subject: string; text: string }) => {
    sent.push(mail);
    return { ok: true };
  },
}));

const { runMonthlyDigest } = await import('../digest');

beforeEach(() => {
  kv.clear();
  sent.length = 0;
  mailConfigured = true;
  vi.unstubAllEnvs();
});

describe('monthly digest', () => {
  const october = new Date('2026-10-03T08:17:00Z');

  it('sends last month’s summary to the owner, once', async () => {
    expect(await runMonthlyDigest(october)).toEqual({ sent: true, month: 'September 2026' });
    expect(sent).toHaveLength(1);
    expect(sent[0].to).toBe('owner@example.test');
    expect(sent[0].subject).toContain('1 new enquiry in September 2026');
    expect(sent[0].text).toContain('41 visitors, 90 page views');
    expect(sent[0].text).toContain('Most read: /work (30)');
    // The spam one and August's are not counted.
    expect(sent[0].text).toContain('1 new enquiry this month, 1 still unread');
    expect(await runMonthlyDigest(new Date('2026-10-28T08:17:00Z'))).toMatchObject({
      sent: false,
      reason: 'already-sent',
    });
    expect(sent).toHaveLength(1);
  });

  it('lists what is still to do before launch', async () => {
    await runMonthlyDigest(october);
    expect(sent[0].text).toContain('Still to do before your site is fully launched');
    expect(sent[0].text).toContain('Put your own name and role on the site');
  });

  it('can be turned off, and waits for a mail server', async () => {
    vi.stubEnv('OPB_DIGEST', 'off');
    expect(await runMonthlyDigest(october)).toMatchObject({ sent: false, reason: 'turned-off' });
    vi.unstubAllEnvs();
    mailConfigured = false;
    expect(await runMonthlyDigest(october)).toMatchObject({ sent: false, reason: 'no-mail' });
    expect(sent).toHaveLength(0);
  });
});

describe('the cron route', () => {
  it('refuses everything until a secret is set, then only that secret', async () => {
    const { GET } = await import('../../../app/api/cron/digest/route');
    const call = (auth?: string) =>
      GET(
        new Request('http://x/api/cron/digest', { headers: auth ? { authorization: auth } : {} })
      );
    expect((await call('Bearer anything')).status).toBe(503);
    vi.stubEnv('CRON_SECRET', 'a-long-shared-secret');
    expect((await call()).status).toBe(401);
    expect((await call('Bearer wrong-secret-of-same-ln')).status).toBe(401);
    expect((await call('Bearer a-long-shared-secret')).status).toBe(200);
  });
});
