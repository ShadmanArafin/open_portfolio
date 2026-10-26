import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  authFail: false,
  listFail: false,
  rateLimitAllowed: true,
}));

vi.mock('@/core/auth/guard', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/core/auth/guard')>();
  return {
    ...actual,
    requireOwner: vi.fn(async () => {
      if (mocks.authFail) {
        throw new actual.UnauthorizedError('Not signed in.');
      }
      return { email: 'owner@example.com' };
    }),
  };
});

vi.mock('@/core/auth/ratelimit', () => ({
  clientKey: vi.fn(async () => 'test-client'),
  rateLimit: vi.fn(async () => ({
    allowed: mocks.rateLimitAllowed,
    remaining: mocks.rateLimitAllowed ? 100 : 0,
    resetAt: Date.now() + 60000,
    retryAfterSeconds: 60,
  })),
}));

vi.mock('@/core/storage/registry', () => ({
  getStorageAdapter: vi.fn(async () => ({
    messages: {
      list: vi.fn(async () => {
        if (mocks.listFail) {
          throw new Error('Database connection failed');
        }
        return [
          {
            id: 'm1',
            name: 'Alice',
            email: 'alice@example.com',
            message: 'Hello',
            status: 'unread',
            receivedAt: '2026-01-01T00:00:00Z',
          },
        ];
      }),
    },
  })),
}));

vi.mock('@/core/email/transport', () => ({
  resolveTransportWithStored: vi.fn(async () => ({ kind: 'none' })),
}));

describe('GET /api/admin/messages', () => {
  beforeEach(() => {
    mocks.authFail = false;
    mocks.listFail = false;
    mocks.rateLimitAllowed = true;
  });

  it('rejects unauthenticated requests with 401', async () => {
    mocks.authFail = true;
    const { GET } = await import('../route');
    const res = await GET();
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.ok).toBe(false);
  });

  it('handles database failure cleanly with status 500', async () => {
    mocks.listFail = true;
    const { GET } = await import('../route');
    const res = await GET();
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.ok).toBe(false);
  });

  it('enforces rate limiting and returns 429 when exceeded', async () => {
    mocks.rateLimitAllowed = false;
    const { GET } = await import('../route');
    const res = await GET();
    expect(res.status).toBe(429);
    expect(res.headers.get('Retry-After')).toBe('60');
    const json = await res.json();
    expect(json.ok).toBe(false);
  });

  it('returns messages and emailConfigured on success', async () => {
    const { GET } = await import('../route');
    const res = await GET();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.messages).toHaveLength(1);
    expect(json.emailConfigured).toBe(false);
  });
});
