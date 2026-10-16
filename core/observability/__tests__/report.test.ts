import { describe, expect, it, vi } from 'vitest';
import { buildErrorReport, reportServerError } from '@/core/observability/report';

describe('error reporting', () => {
  it('truncates and defaults safely', () => {
    const r = buildErrorReport({ message: 'x'.repeat(900) });
    expect(r.message.length).toBe(500);
    expect(r.path).toBe('unknown');
    expect(r.requestId).toBe('none');
  });

  it('skips when no webhook is configured', async () => {
    delete process.env.OPB_ERROR_WEBHOOK_URL;
    expect(await reportServerError(buildErrorReport({ message: 'boom' }))).toBe('skipped');
  });

  it('sends when configured and fails silent otherwise', async () => {
    process.env.OPB_ERROR_WEBHOOK_URL = 'https://example.com/hook';
    const ok = vi.fn(async () => new Response('ok'));
    expect(await reportServerError(buildErrorReport({ message: 'boom' }), ok as never)).toBe(
      'sent'
    );
    const down = vi.fn(async () => {
      throw new Error('offline');
    });
    expect(await reportServerError(buildErrorReport({ message: 'boom' }), down as never)).toBe(
      'failed'
    );
    delete process.env.OPB_ERROR_WEBHOOK_URL;
  });
});
