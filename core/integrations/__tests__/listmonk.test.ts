import { afterEach, describe, expect, it, vi } from 'vitest';
import { listmonkApiUrl, listmonkSchema } from '../definitions/listmonk';

/**
 * The handoff to a list you own.
 *
 * This is the one definition the site never calls — it collects addresses and
 * hands them over as a file — so what has to be right is the Test button
 * telling the truth. The answers stubbed below are the ones a real Listmonk
 * gave on 2026-10-18: `{ data: … }` when it works, `{ message: … }` when it
 * refuses, and a refusal arrives as **403**, not 401.
 */

afterEach(() => {
  vi.unstubAllGlobals();
});

function stubReply(status: number, body: unknown) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({ ok: status >= 200 && status < 300, status, json: async () => body }))
  );
}

async function definition() {
  const { getIntegration } = await import('../registry');
  return getIntegration('listmonk')!;
}

describe('listmonk settings', () => {
  it('needs an address, and keeps no secret', async () => {
    expect(listmonkSchema.safeParse({ url: 'https://listmonk.example.com' }).success).toBe(true);
    expect(listmonkSchema.safeParse({ url: '' }).success).toBe(false);
    expect(listmonkSchema.safeParse({}).success).toBe(false);

    // Nothing here calls the API, so there is nothing a key would be for.
    expect((await definition()).secretFields).toEqual([]);
  });

  it('adds the API path whatever the pasted address ends with', () => {
    expect(listmonkApiUrl('https://listmonk.example.com', '/api/health')).toBe(
      'https://listmonk.example.com/api/health'
    );
    expect(listmonkApiUrl('https://listmonk.example.com/', '/api/health')).toBe(
      'https://listmonk.example.com/api/health'
    );
    expect(listmonkApiUrl('https://listmonk.example.com///', '/api/health')).toBe(
      'https://listmonk.example.com/api/health'
    );
  });
});

describe('the Test button', () => {
  it('passes when Listmonk answers and its database is up', async () => {
    stubReply(200, { data: { db: true } });
    const result = await (
      await definition()
    ).test({ url: 'https://listmonk.example.com' } as never);
    expect(result.ok).toBe(true);
    expect(result.message).toMatch(/running/i);
  });

  it('passes when it answers and asks for a login', async () => {
    stubReply(403, { message: 'invalid session' });
    const result = await (
      await definition()
    ).test({ url: 'https://listmonk.example.com' } as never);
    expect(result.ok).toBe(true);
    expect(result.message).toMatch(/login/i);
  });

  it('fails when nothing answers at all', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('ECONNREFUSED');
      })
    );
    const result = await (
      await definition()
    ).test({ url: 'https://listmonk.example.com' } as never);
    expect(result.ok).toBe(false);
    expect(result.message).toMatch(/nothing answered/i);
  });

  it('fails when the address is not Listmonk', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        status: 200,
        json: async () => {
          throw new Error('not JSON');
        },
      }))
    );
    const result = await (await definition()).test({ url: 'https://example.com' } as never);
    expect(result.ok).toBe(false);
    expect(result.message).toMatch(/not like Listmonk/i);
  });

  it('fails when its database is missing', async () => {
    stubReply(200, { data: { db: false } });
    const result = await (
      await definition()
    ).test({ url: 'https://listmonk.example.com' } as never);
    expect(result.ok).toBe(false);
    expect(result.message).toMatch(/database/i);
  });

  it('reports a server error instead of calling it a success', async () => {
    stubReply(500, { message: 'boom' });
    const result = await (
      await definition()
    ).test({ url: 'https://listmonk.example.com' } as never);
    expect(result.ok).toBe(false);
    expect(result.message).toMatch(/500/);
  });

  it('is registered under email, and says where the list goes', async () => {
    const found = await definition();
    expect(found.category).toBe('email');
    expect(found.degradation).toMatch(/list stays here/i);
  });
});
