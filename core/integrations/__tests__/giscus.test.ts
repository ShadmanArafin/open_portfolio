import { afterEach, describe, expect, it, vi } from 'vitest';
import { giscusSchema } from '../definitions/giscus';

/**
 * Discussion without a database.
 *
 * `fetch` is stubbed because the tests assert what this code decides given
 * GitHub's answers — a public repo exists or it does not — not that GitHub
 * answers. Whether Discussions are on and the app is installed cannot be seen
 * without credentials, and the Test message says exactly that.
 */

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('giscus settings', () => {
  it('accepts owner/name and nothing else shaped', async () => {
    expect(giscusSchema.safeParse({ repo: 'owner/name' }).success).toBe(true);
    expect(giscusSchema.safeParse({ repo: '' }).success).toBe(false);
    expect(giscusSchema.safeParse({ repo: 'just-a-name' }).success).toBe(false);
    expect(giscusSchema.safeParse({ repo: 'https://github.com/owner/name' }).success).toBe(false);
    expect(giscusSchema.safeParse({}).success).toBe(false);
  });
});

describe('the Test button', () => {
  async function test() {
    const { getIntegration } = await import('../registry');
    return getIntegration('giscus')!;
  }

  it('passes for a public repository', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: true, status: 200 }))
    );
    const result = await (await test()).test({ repo: 'owner/name' } as never);
    expect(result.ok).toBe(true);
    expect(result.message).toMatch(/Discussions/i);
  });

  it('fails plainly for a missing or private repository', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: false, status: 404 }))
    );
    const result = await (await test()).test({ repo: 'owner/nothing' } as never);
    expect(result.ok).toBe(false);
    expect(result.message).toMatch(/owner\/name|public/i);
  });

  it('fails plainly when GitHub cannot be reached', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('down');
      })
    );
    const result = await (await test()).test({ repo: 'owner/name' } as never);
    expect(result.ok).toBe(false);
  });

  it('is registered under comments', async () => {
    const { getIntegration } = await import('../registry');
    expect(getIntegration('giscus')?.category).toBe('comments');
  });
});
