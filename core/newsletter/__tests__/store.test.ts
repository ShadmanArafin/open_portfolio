import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Subscriber } from '../schema';

/**
 * Signing up, confirming, and leaving.
 *
 * Run against an in-memory stand-in for the storage adapter rather than a real
 * one: what is under test here is the *rules* — that the same answer comes back
 * whatever the truth is, that a token works once, that leaving is one click —
 * and those are the same on every backend. Whether each backend implements the
 * surface identically is the conformance suite's job, and it asserts the one
 * case where the backends genuinely diverge (emptying a token).
 */

const rows = new Map<string, Subscriber>();

vi.mock('@/core/storage/registry', () => ({
  getStorageAdapter: async () => ({
    subscribers: {
      append: async (subscriber: Subscriber) => {
        rows.set(subscriber.id, subscriber);
      },
      list: async () => [...rows.values()],
      update: async (id: string, patch: Partial<Subscriber>) => {
        const existing = rows.get(id);
        if (existing) rows.set(id, { ...existing, ...patch });
      },
      remove: async (id: string) => {
        rows.delete(id);
      },
    },
  }),
}));

const { confirm, requestSignup, sweepStalePending, unsubscribe } = await import('../store');

beforeEach(() => rows.clear());

const only = () => [...rows.values()][0];

describe('asking to join', () => {
  it('stores nobody as subscribed, only as pending', async () => {
    const result = await requestSignup('Reader@Example.com ');

    expect(result.ok).toBe(true);
    expect(only().status).toBe('pending');
    // Normalised, so `A@x.com` and `a@x.com` cannot both end up on the list.
    expect(only().email).toBe('reader@example.com');
  });

  it('never stores the token it emails out', async () => {
    const result = await requestSignup('reader@example.com');

    expect(result.confirmToken).toBeTruthy();
    expect(JSON.stringify(only())).not.toContain(result.confirmToken!);
  });

  it('refuses something that is not an address', async () => {
    expect((await requestSignup('not-an-address')).ok).toBe(false);
    expect(rows.size).toBe(0);
  });

  it('answers a known address exactly as it answers a new one', async () => {
    const first = await requestSignup('reader@example.com');
    await confirm(first.confirmToken!);

    const second = await requestSignup('reader@example.com');

    // The whole point. A form that says "you are already subscribed" is a way
    // to test, one query at a time, whether a given person is on somebody's
    // list — which is not information the list's owner chose to publish.
    expect(second.ok).toBe(true);
    expect(second.message).toBe(first.message);
    // ...and it sends nothing, so the form cannot be used to mail a stranger
    // repeatedly by typing their address into it.
    expect(second.confirmToken).toBeUndefined();
  });

  it('reissues a token for somebody who never confirmed, and retires the old one', async () => {
    const first = await requestSignup('reader@example.com');
    const second = await requestSignup('reader@example.com');

    expect(rows.size).toBe(1);
    expect(second.confirmToken).toBeTruthy();
    expect(second.confirmToken).not.toBe(first.confirmToken);

    expect((await confirm(first.confirmToken!)).ok).toBe(false);
    expect((await confirm(second.confirmToken!)).ok).toBe(true);
  });

  it('lets somebody who left come back', async () => {
    const first = await requestSignup('reader@example.com');
    await confirm(first.confirmToken!);
    await unsubscribe(first.unsubscribeToken!);

    // Leaving is recorded rather than deleted, so returning has to go through
    // the same confirmation as arriving for the first time.
    const again = await requestSignup('reader@example.com');
    expect(again.confirmToken).toBeTruthy();
    expect((await confirm(again.confirmToken!)).ok).toBe(true);
    expect(only().status).toBe('confirmed');
  });
});

describe('confirming', () => {
  it('puts somebody on the list', async () => {
    const { confirmToken } = await requestSignup('reader@example.com');
    const result = await confirm(confirmToken!);

    expect(result.ok).toBe(true);
    expect(only().status).toBe('confirmed');
    expect(only().confirmedAt).toBeTruthy();
  });

  it('works once', async () => {
    const { confirmToken } = await requestSignup('reader@example.com');
    await confirm(confirmToken!);

    // Not merely "already confirmed": the token itself is spent, so it cannot
    // resubscribe somebody who later leaves.
    rows.set(only().id, { ...only(), status: 'unsubscribed' });
    expect((await confirm(confirmToken!)).ok).toBe(false);
    expect(only().status).toBe('unsubscribed');
  });

  it('rejects a token nobody was given', async () => {
    await requestSignup('reader@example.com');
    expect((await confirm('made-up')).ok).toBe(false);
    expect((await confirm('')).ok).toBe(false);
    expect(only().status).toBe('pending');
  });
});

describe('leaving', () => {
  it('takes one request and no sign-in', async () => {
    const signup = await requestSignup('reader@example.com');
    await confirm(signup.confirmToken!);

    const result = await unsubscribe(signup.unsubscribeToken!);

    expect(result.ok).toBe(true);
    expect(only().status).toBe('unsubscribed');
    expect(only().unsubscribedAt).toBeTruthy();
  });

  it('keeps the record instead of deleting it', async () => {
    const signup = await requestSignup('reader@example.com');
    await confirm(signup.confirmToken!);
    await unsubscribe(signup.unsubscribeToken!);

    // Deleting would mean the next import of an old list quietly adds them
    // back, which is the thing they just asked not to happen.
    expect(rows.size).toBe(1);
  });

  it('is safe to do twice', async () => {
    const signup = await requestSignup('reader@example.com');
    await confirm(signup.confirmToken!);
    await unsubscribe(signup.unsubscribeToken!);

    // A mail client's one-click unsubscribe can fire more than once, and the
    // second press must not look like a failure to the person pressing it.
    expect((await unsubscribe(signup.unsubscribeToken!)).ok).toBe(true);
  });

  it('rejects a token nobody was given', async () => {
    const signup = await requestSignup('reader@example.com');
    await confirm(signup.confirmToken!);

    expect((await unsubscribe('made-up')).ok).toBe(false);
    expect(only().status).toBe('confirmed');
  });
});

describe('the sweep', () => {
  it('drops requests nobody ever confirmed, and keeps everyone else', async () => {
    await requestSignup('recent@example.com');
    const recent = only().id;

    rows.set('stale', {
      id: 'stale',
      email: 'stale@example.com',
      status: 'pending',
      requestedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    });
    rows.set('member', {
      id: 'member',
      email: 'member@example.com',
      status: 'confirmed',
      requestedAt: new Date(Date.now() - 900 * 24 * 60 * 60 * 1000).toISOString(),
    });

    expect(await sweepStalePending()).toBe(1);
    expect(rows.has('stale')).toBe(false);
    expect(rows.has('member')).toBe(true);
    expect(rows.has(recent)).toBe(true);
  });
});
