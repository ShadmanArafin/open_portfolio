import { describe, expect, it } from 'vitest';

describe('GET /api/health contract', () => {
  it('exposes version and adapter without error details', async () => {
    const { GET } = await import('../route');
    const res = await GET();
    expect([200, 503]).toContain(res.status);
    const body = (await res.json()) as Record<string, unknown>;
    expect(typeof body.ok).toBe('boolean');
    expect(typeof body.version).toBe('string');
    expect(typeof body.uptimeSeconds).toBe('number');
    // Never leak driver text publicly — the owner-only storage route exists for that.
    expect('detail' in body).toBe(false);
    expect('error' in body).toBe(false);
    expect(res.headers.get('Cache-Control')).toContain('no-store');
  });
});
