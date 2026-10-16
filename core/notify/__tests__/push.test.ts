import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { generateKeyPairSync } from 'node:crypto';

/**
 * Push notifications.
 *
 * Lazy imports + a throwaway store: subscriptions write to storage, and the
 * suite must not touch this checkout's database.
 */

const push = () => import('../push');

const originalCwd = process.cwd();
let workDir: string;

const savedEnv = { ...process.env };

function makeVapidKeys() {
  const { publicKey, privateKey } = generateKeyPairSync('ec', { namedCurve: 'P-256' });
  const pubJwk = publicKey.export({ format: 'jwk' });
  const privJwk = privateKey.export({ format: 'jwk' });
  const x = Buffer.from(pubJwk.x!, 'base64url');
  const y = Buffer.from(pubJwk.y!, 'base64url');
  const rawPublic = Buffer.concat([Buffer.from([0x04]), x, y]).toString('base64url');
  return { publicKey: rawPublic, privateKey: privJwk.d! };
}

beforeAll(async () => {
  workDir = await mkdtemp(path.join(tmpdir(), 'opb-push-'));
  process.chdir(workDir);
});

afterAll(async () => {
  process.chdir(originalCwd);
  process.env = savedEnv;
  await rm(workDir, { recursive: true, force: true });
});

beforeEach(() => {
  delete process.env.OPB_VAPID_PUBLIC_KEY;
  delete process.env.OPB_VAPID_PRIVATE_KEY;
  delete process.env.OPB_VAPID_SUBJECT;
});

const sub = (endpoint: string) => ({
  endpoint,
  keys: { p256dh: 'p256dh-key', auth: 'auth-key' },
  userAgent: null as string | null,
});

describe('push subscriptions', () => {
  it('is unconfigured without all three env vars', async () => {
    const { isPushConfigured, notifyEnquiry } = await push();
    expect(isPushConfigured()).toBe(false);
    await expect(notifyEnquiry()).resolves.toMatchObject({ skipped: 'not-configured' });
  });

  it('rejects a malformed subject and bad key lengths', async () => {
    const { publicKey, privateKey } = makeVapidKeys();
    const { isPushConfigured } = await push();
    process.env.OPB_VAPID_PUBLIC_KEY = publicKey;
    process.env.OPB_VAPID_PRIVATE_KEY = privateKey;
    process.env.OPB_VAPID_SUBJECT = 'not-a-subject';
    expect(isPushConfigured()).toBe(false);
    process.env.OPB_VAPID_SUBJECT = 'mailto:owner@example.com';
    expect(isPushConfigured()).toBe(true);
  });

  it('saves, lists and removes subscriptions', async () => {
    const { savePushSubscription, listPushSubscriptions, removePushSubscription } = await push();
    await savePushSubscription(sub('https://push.example.com/device-1'));
    await savePushSubscription(sub('https://push.example.com/device-2'));
    expect((await listPushSubscriptions()).map((s) => s.endpoint)).toEqual([
      'https://push.example.com/device-2',
      'https://push.example.com/device-1',
    ]);
    // Re-saving moves to the front rather than duplicating.
    await savePushSubscription(sub('https://push.example.com/device-1'));
    expect((await listPushSubscriptions()).map((s) => s.endpoint)).toEqual([
      'https://push.example.com/device-1',
      'https://push.example.com/device-2',
    ]);
    await removePushSubscription('https://push.example.com/device-1');
    expect((await listPushSubscriptions()).map((s) => s.endpoint)).toEqual([
      'https://push.example.com/device-2',
    ]);
  });

  it('refuses subscriptions without an https endpoint or keys', async () => {
    const { savePushSubscription } = await push();
    await expect(
      savePushSubscription({
        endpoint: 'http://insecure/device',
        keys: { p256dh: 'a', auth: 'b' },
        userAgent: null,
      })
    ).rejects.toThrow();
    await expect(
      savePushSubscription({
        endpoint: 'https://push.example.com/x',
        keys: { p256dh: '', auth: '' },
        userAgent: null,
      })
    ).rejects.toThrow();
  });

  it('caps the device list so one owner cannot grow it forever', async () => {
    const { savePushSubscription, listPushSubscriptions } = await push();
    for (let i = 0; i < 25; i++) {
      await savePushSubscription(sub(`https://push.example.com/d-${i}`));
    }
    expect((await listPushSubscriptions()).length).toBeLessThanOrEqual(20);
  });
});

describe('vapid jwt', () => {
  it('builds a verifiable ES256 JWT for the push service origin', async () => {
    const { publicKey, privateKey } = makeVapidKeys();
    process.env.OPB_VAPID_PUBLIC_KEY = publicKey;
    process.env.OPB_VAPID_PRIVATE_KEY = privateKey;
    process.env.OPB_VAPID_SUBJECT = 'mailto:owner@example.com';
    const { buildVapidJwt } = await push();
    const jwt = buildVapidJwt('https://push.example.com');
    const [header, payload, signature] = jwt.split('.');
    expect(JSON.parse(Buffer.from(header, 'base64url').toString())).toMatchObject({
      typ: 'JWT',
      alg: 'ES256',
    });
    const claims = JSON.parse(Buffer.from(payload, 'base64url').toString());
    expect(claims.aud).toBe('https://push.example.com');
    expect(claims.sub).toBe('mailto:owner@example.com');
    expect(claims.exp).toBeGreaterThan(Date.now() / 1000);
    expect(signature.length).toBeGreaterThan(32);
  });
});

describe('burst cap', () => {
  it('coalesces bursts: the second claim within the window loses', async () => {
    const { claimPushSlot } = await push();
    expect(await claimPushSlot('test-kind')).toBe(true);
    expect(await claimPushSlot('test-kind')).toBe(false);
    expect(await claimPushSlot('other-kind')).toBe(true);
  });
});
