import { describe, expect, it } from 'vitest';
import {
  isStalePending,
  normaliseEmail,
  subscriberSchema,
  toCsv,
  type Subscriber,
} from '../schema';

/**
 * The list, and what may be done with it.
 *
 * The rules here are not stylistic. Anyone can type anyone's address into a
 * form on the internet, so a list without confirmation is a mix of subscribers
 * and people who never asked — and mailing it is how a domain's reputation
 * ends. Everything below encodes that.
 */

const sub = (over: Partial<Subscriber> = {}): Subscriber => ({
  id: 's1',
  email: 'reader@example.com',
  status: 'confirmed',
  requestedAt: '2026-08-01T00:00:00Z',
  confirmedAt: '2026-08-01T00:10:00Z',
  ...over,
});

describe('the export', () => {
  it('contains only people who confirmed', () => {
    const csv = toCsv([
      sub({ id: 'a', email: 'yes@example.com' }),
      sub({ id: 'b', email: 'never-confirmed@example.com', status: 'pending' }),
      sub({ id: 'c', email: 'left@example.com', status: 'unsubscribed' }),
    ]);

    expect(csv).toContain('yes@example.com');
    expect(csv).not.toContain('never-confirmed@example.com');
    expect(csv).not.toContain('left@example.com');
  });

  it('quotes and escapes so one address cannot break the file', () => {
    const csv = toCsv([sub({ email: 'odd"name@example.com', source: 'a,b' })]);
    expect(csv).toContain('"odd""name@example.com"');
    expect(csv).toContain('"a,b"');
  });

  it('carries the columns other tools import', () => {
    // Leaving should be a file download, not a project.
    expect(toCsv([]).split('\n')[0]).toBe('"email","confirmed_at","source"');
  });

  it('never exports a token, hashed or otherwise', () => {
    const csv = toCsv([sub({ confirmTokenHash: 'HASHVALUE', unsubscribeTokenHash: 'OTHERHASH' })]);
    expect(csv).not.toContain('HASHVALUE');
    expect(csv).not.toContain('OTHERHASH');
  });
});

describe('unconfirmed addresses', () => {
  const now = new Date('2026-08-20T00:00:00Z');

  it('are dropped after a week', () => {
    // An unbounded list of unconfirmed addresses is a list of people who did
    // not consent, sitting in a database indefinitely.
    expect(
      isStalePending(sub({ status: 'pending', requestedAt: '2026-08-01T00:00:00Z' }), now)
    ).toBe(true);
  });

  it('are kept long enough to be useful', () => {
    // Somebody who finds the email on Friday should still be able to use it.
    expect(
      isStalePending(sub({ status: 'pending', requestedAt: '2026-08-18T00:00:00Z' }), now)
    ).toBe(false);
  });

  it('leaves confirmed and unsubscribed records alone', () => {
    expect(isStalePending(sub({ status: 'confirmed', requestedAt: '2020-01-01' }), now)).toBe(
      false
    );
    expect(isStalePending(sub({ status: 'unsubscribed', requestedAt: '2020-01-01' }), now)).toBe(
      false
    );
  });

  it('drops one with an unreadable date rather than keeping it forever', () => {
    expect(isStalePending(sub({ status: 'pending', requestedAt: 'whenever' }), now)).toBe(true);
  });
});

describe('addresses', () => {
  it('normalises so the same person cannot be on the list twice', () => {
    expect(normaliseEmail('  Reader@Example.COM ')).toBe('reader@example.com');
  });

  it('refuses something that is not an address', () => {
    expect(subscriberSchema.safeParse(sub({ email: 'not-an-address' })).success).toBe(false);
  });
});
