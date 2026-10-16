import 'server-only';
import { createPrivateKey, sign } from 'node:crypto';
import { getStorageAdapter } from '@/core/storage/registry';

/**
 * Push notifications for the one person who needs them: the owner.
 *
 * A portfolio site is low-frequency — the owner opens the admin when there is
 * something to see, and there is no reason to return otherwise. Email covers
 * that when mail is configured; push covers it when it is not, and on a phone,
 * where the installed admin (`manifest.ts`, `start_url: /admin`) is the
 * whole point. iOS 16.4+ delivers web push only to a Home-Screen-installed
 * site, and Chrome exempts installed sites from its low-engagement
 * revocation — so the "install this" copy is the precondition, not a nicety.
 *
 * Free and dependency-free by construction: VAPID + the platform push service
 * costs nothing, and the signing is thirty lines of Node `crypto` (ES256 over
 * P-256) rather than a vendored library. Payload-less "tickles": the server
 * wakes the service worker, and the worker fetches the unread count with the
 * owner's own session cookie — so there is no payload encryption to get wrong
 * and nothing sensitive crosses the push service at all.
 *
 * Permission timing matters more than the protocol. The toggle lives in the
 * inbox and only appears once a first message has arrived — asking on install,
 * before there is anything to notify about, is how permission gets denied
 * forever. One cap (`PUSH_MIN_INTERVAL_MS`) coalesces bursts: ten spam
 * enquiries in a minute produce one buzz, and the worker shows the count.
 */

export interface PushSubscriptionRecord {
  endpoint: string;
  keys: { p256dh: string; auth: string };
  createdAt: string;
  userAgent: string | null;
}

const SUBSCRIPTIONS_KEY = 'subscriptions';
const MAX_SUBSCRIPTIONS = 20;
/** Bursts coalesce: at most one buzz per kind per window. */
export const PUSH_MIN_INTERVAL_MS = 5 * 60 * 1000;

function lastSentKey(kind: string): string {
  return `last-sent:${kind}`;
}

function base64urlEncode(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString('base64url');
}

function base64urlDecode(input: string): Buffer {
  return Buffer.from(input, 'base64url');
}

/** VAPID configuration, or null when push is not set up. */
export function vapidConfig(): { publicKey: string; privateKey: string; subject: string } | null {
  const publicKey = process.env.OPB_VAPID_PUBLIC_KEY?.trim();
  const privateKey = process.env.OPB_VAPID_PRIVATE_KEY?.trim();
  const subject = process.env.OPB_VAPID_SUBJECT?.trim();
  if (!publicKey || !privateKey || !subject) return null;
  if (!/^(mailto:|https:\/\/)/.test(subject)) return null;
  try {
    if (base64urlDecode(publicKey).length !== 65) return null;
    if (base64urlDecode(privateKey).length !== 32) return null;
  } catch {
    return null;
  }
  return { publicKey, privateKey, subject };
}

export function isPushConfigured(): boolean {
  return vapidConfig() !== null;
}

function assertSubscriptionShape(sub: unknown): asserts sub is PushSubscriptionRecord {
  const s = sub as Partial<PushSubscriptionRecord>;
  if (
    typeof s?.endpoint !== 'string' ||
    !s.endpoint.startsWith('https://') ||
    typeof s?.keys?.p256dh !== 'string' ||
    typeof s?.keys?.auth !== 'string' ||
    !s.keys.p256dh ||
    !s.keys.auth
  ) {
    throw new Error('That subscription is not usable: it needs an https endpoint and both keys.');
  }
}

export async function listPushSubscriptions(): Promise<PushSubscriptionRecord[]> {
  const adapter = await getStorageAdapter();
  const stored = await adapter.kv.get<PushSubscriptionRecord[]>('push', SUBSCRIPTIONS_KEY);
  return Array.isArray(stored) ? stored : [];
}

export async function savePushSubscription(
  sub: Omit<PushSubscriptionRecord, 'createdAt'> & { createdAt?: string }
): Promise<{ saved: boolean; count: number }> {
  assertSubscriptionShape(sub);
  const adapter = await getStorageAdapter();
  const existing = await listPushSubscriptions();
  const without = existing.filter((s) => s.endpoint !== sub.endpoint);
  without.unshift({
    endpoint: sub.endpoint,
    keys: sub.keys,
    userAgent: sub.userAgent ?? null,
    createdAt: sub.createdAt ?? new Date().toISOString(),
  });
  await adapter.kv.set('push', SUBSCRIPTIONS_KEY, without.slice(0, MAX_SUBSCRIPTIONS));
  return { saved: true, count: Math.min(without.length, MAX_SUBSCRIPTIONS) };
}

export async function removePushSubscription(endpoint: string): Promise<void> {
  const adapter = await getStorageAdapter();
  const existing = await listPushSubscriptions();
  await adapter.kv.set(
    'push',
    SUBSCRIPTIONS_KEY,
    existing.filter((s) => s.endpoint !== endpoint)
  );
}

/** True when a push of this kind may go out now; records the send. */
export async function claimPushSlot(kind: string): Promise<boolean> {
  const adapter = await getStorageAdapter();
  const last = await adapter.kv.get<string>('push', lastSentKey(kind));
  if (last && Date.now() - Date.parse(last) < PUSH_MIN_INTERVAL_MS) return false;
  await adapter.kv.set('push', lastSentKey(kind), new Date().toISOString());
  return true;
}

/**
 * The VAPID authorization JWT (RFC 8292 §2.1).
 *
 * Header `{"typ":"JWT","alg":"ES256"}`, payload `{aud, exp, sub}`, signed
 * with the VAPID private key. Constructed as a JWK from the raw key bytes:
 * the public half is `04 || x || y`, the private half is `d`.
 */
export function buildVapidJwt(audience: string, nowMs = Date.now()): string {
  const config = vapidConfig();
  if (!config) throw new Error('Push is not configured: set OPB_VAPID_* first.');
  const pub = base64urlDecode(config.publicKey);
  const jwk = {
    kty: 'EC',
    crv: 'P-256',
    x: base64urlEncode(pub.subarray(1, 33)),
    y: base64urlEncode(pub.subarray(33, 65)),
    d: config.privateKey,
  };
  const header = base64urlEncode(Buffer.from(JSON.stringify({ typ: 'JWT', alg: 'ES256' })));
  const payload = base64urlEncode(
    Buffer.from(
      JSON.stringify({
        aud: audience,
        exp: Math.floor(nowMs / 1000) + 12 * 3600,
        sub: config.subject,
      })
    )
  );
  const key = createPrivateKey({ key: jwk, format: 'jwk' });
  const signature = sign(null, Buffer.from(`${header}.${payload}`), key);
  return `${header}.${payload}.${base64urlEncode(signature)}`;
}

export interface PushSendResult {
  attempted: number;
  delivered: number;
  skipped: 'not-configured' | 'cooldown' | 'no-subscriptions' | null;
}

async function sendTickle(sub: PushSubscriptionRecord): Promise<boolean> {
  const config = vapidConfig();
  if (!config) return false;
  const audience = new URL(sub.endpoint).origin;
  const jwt = buildVapidJwt(audience);
  const res = await fetch(sub.endpoint, {
    method: 'POST',
    headers: {
      Authorization: `vapid t=${jwt}, k=${config.publicKey}`,
      'Crypto-Key': `p256ecdsa=${config.publicKey}`,
      TTL: '86400',
      Urgency: 'normal',
    },
    signal: AbortSignal.timeout(10_000),
  });
  if (res.status === 404 || res.status === 410) {
    // The push service has forgotten this subscription; stop carrying it.
    await removePushSubscription(sub.endpoint);
    return false;
  }
  return res.ok;
}

/**
 * Tell the owner's devices a new enquiry arrived. Best-effort and fail-silent
 * by design: a push service having a bad day must never break the contact
 * form, and the inbox + email paths already carry the message.
 */
export async function notifyEnquiry(): Promise<PushSendResult> {
  if (!isPushConfigured()) return { attempted: 0, delivered: 0, skipped: 'not-configured' };
  const subs = await listPushSubscriptions();
  if (subs.length === 0) return { attempted: 0, delivered: 0, skipped: 'no-subscriptions' };
  if (!(await claimPushSlot('enquiry'))) return { attempted: 0, delivered: 0, skipped: 'cooldown' };
  let delivered = 0;
  for (const sub of subs) {
    try {
      if (await sendTickle(sub)) delivered += 1;
    } catch {
      /* One dead device is not a failed enquiry. */
    }
  }
  return { attempted: subs.length, delivered, skipped: null };
}

/** Explicit test from the inbox: bypasses the burst cap, still fail-safe. */
export async function sendTestPush(): Promise<PushSendResult> {
  if (!isPushConfigured()) return { attempted: 0, delivered: 0, skipped: 'not-configured' };
  const subs = await listPushSubscriptions();
  if (subs.length === 0) return { attempted: 0, delivered: 0, skipped: 'no-subscriptions' };
  let delivered = 0;
  for (const sub of subs) {
    try {
      if (await sendTickle(sub)) delivered += 1;
    } catch {
      /* A failed test is reported, not thrown. */
    }
  }
  return { attempted: subs.length, delivered, skipped: null };
}
