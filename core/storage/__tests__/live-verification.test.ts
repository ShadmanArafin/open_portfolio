/* eslint-disable no-console -- this file is the progress output of a human-run verifier */
import { describe, expect, it } from 'vitest';
import type { StorageAdapter } from '../contract';
import { makeTestContent } from '../conformance';
import { cloudflareRestAdapter } from '../adapters/cloudflare-rest';
import { convexAdapter } from '../adapters/convex';

/**
 * Live verification, run by `scripts/verify-*.mjs`, never by `npm test`.
 *
 * The mock conformance suites prove the adapters speak the contract. They
 * cannot prove that Cloudflare and Convex accept what the adapters send, that
 * the D1 schema the REST calls assume survives a second `provision()`, or that
 * R2 and Convex storage return the bytes that went in. That needs a real
 * account, so it is a separate opt-in run behind `OPB_LIVE_VERIFY=1` — the CI
 * and local test runs skip it and stay offline.
 *
 * Every check uses a unique key and removes it in a `finally`. The one that
 * cannot be removed is the draft snapshot: the contract has no delete. The
 * previous draft is restored when there was one, and when there was not, the
 * marker is left behind and reported. Point this at a scratch deployment, not
 * at a site somebody is editing.
 */

const LIVE = process.env.OPB_LIVE_VERIFY === '1';

const CLOUDFLARE_READY =
  LIVE &&
  Boolean(process.env.CLOUDFLARE_ACCOUNT_ID) &&
  Boolean(process.env.CLOUDFLARE_API_TOKEN) &&
  Boolean(process.env.D1_DATABASE_ID);

const CONVEX_READY =
  LIVE &&
  Boolean(
    process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL || process.env.CONVEX_DEPLOYMENT
  ) &&
  Boolean(process.env.CONVEX_ADMIN_KEY || process.env.CONVEX_TOKEN);

async function verifyAdapter(adapter: StorageAdapter): Promise<void> {
  const stamp = Date.now().toString(36);

  console.log('1. Provisioning (twice, because boot runs it on every start)…');
  await adapter.provision();
  await adapter.provision();
  const health = await adapter.health();
  expect(health.ok, health.detail).toBe(true);
  console.log(`   ok - health: ${health.detail} (${health.latencyMs}ms)`);

  console.log('2. Snapshot round-trip…');
  const previous = await adapter.readSnapshotMeta('draft');
  const marker = `opb-live-${stamp}`;
  try {
    const content = makeTestContent(marker);
    const revision = await adapter.writeSnapshot('draft', content);
    const read = await adapter.readSnapshot('draft');
    expect(read, 'draft snapshot came back empty').not.toBeNull();
    expect(read?.settings.fullName).toBe(marker);
    expect(read).toEqual(content);
    expect(revision).toBeGreaterThan(0);
    console.log(`   ok - wrote and read revision ${revision}`);
  } finally {
    if (previous) {
      await adapter.writeSnapshot('draft', previous.state);
      console.log('   ok - previous draft restored');
    } else {
      console.log(`   ! no previous draft; "${marker}" remains in the draft channel`);
    }
  }

  console.log('3. Media upload, fetch and delete…');
  const key = `opb-live-${stamp}.txt`;
  const bytes = new TextEncoder().encode('open portfolio live verification');
  try {
    const record = await adapter.media.put(key, bytes, 'text/plain');
    expect(record.key).toBe(key);
    expect(record.sizeBytes).toBe(bytes.byteLength);
    expect(await adapter.media.resolveUrl(key)).toBeTruthy();
    if (adapter.media.readBytes) {
      const stored = await adapter.media.readBytes(key);
      expect(stored, 'readBytes returned nothing').not.toBeNull();
      expect(Array.from(stored!.data)).toEqual(Array.from(bytes));
    }
    console.log('   ok - uploaded, resolved and read back');
  } finally {
    await adapter.media.remove(key);
    if (adapter.media.readBytes) {
      expect(await adapter.media.readBytes(key)).toBeNull();
    }
  }
  console.log('   ok - removed');

  console.log('4. Message append, list and delete…');
  const messageId = `opb-live-${stamp}`;
  try {
    await adapter.messages.append({
      id: messageId,
      name: 'Live Verifier',
      email: 'verify@example.com',
      projectType: 'Verification',
      message: 'Testing the live inbox round-trip.',
      status: 'unread',
      receivedAt: new Date().toISOString(),
    });
    const listed = await adapter.messages.list();
    expect(
      listed.some((message) => message.id === messageId),
      'appended message was not listed'
    ).toBe(true);
    console.log('   ok - appended and listed');
  } finally {
    await adapter.messages.remove(messageId);
  }
  console.log('   ok - removed');

  console.log('5. Record round-trip…');
  const collection = 'opb-live-check';
  const recordId = `opb-live-${stamp}`;
  try {
    const written = await adapter.records.put(collection, recordId, { ok: true });
    expect(written.id).toBe(recordId);
    expect(written.revision).toBe(1);
    expect(await adapter.records.get(collection, recordId)).toEqual(written);
    console.log('   ok - written and read back');
  } finally {
    await adapter.records.remove(collection, recordId);
  }
  console.log('   ok - removed');
}

describe.skipIf(!CLOUDFLARE_READY)('live storage: cloudflare-rest (D1 + R2)', () => {
  it('provisions, round-trips content, media, messages and records', async () => {
    await verifyAdapter(cloudflareRestAdapter);
  });
});

describe.skipIf(!CONVEX_READY)('live storage: convex', () => {
  it('provisions, round-trips content, media, messages and records', async () => {
    await verifyAdapter(convexAdapter);
  });
});
