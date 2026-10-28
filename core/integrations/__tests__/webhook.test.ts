import { describe, expect, it, vi } from 'vitest';
import { dispatchWebhook, type ContactNotificationPayload } from '../webhook';

const samplePayload: ContactNotificationPayload = {
  id: 'msg_test_123',
  name: 'Sarah Connor',
  email: 'sarah@skynet.test',
  company: 'Cyberdyne Systems',
  projectType: 'Full-time Opportunity',
  message: 'We loved your thesis project and want to arrange an interview.',
  receivedAt: '2026-10-27T14:30:00Z',
  siteUrl: 'https://student.test',
};

describe('Outbound Notification Webhooks', () => {
  it('rejects invalid or empty webhook URLs', async () => {
    const res = await dispatchWebhook('', samplePayload);
    expect(res.sent).toBe(false);
    expect(res.error).toBe('Invalid webhook URL.');
  });

  it('formats Discord payload with rich embed and dispatches POST', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 204,
      text: () => Promise.resolve(''),
    });
    vi.stubGlobal('fetch', fetchMock);

    const res = await dispatchWebhook(
      'https://discord.com/api/webhooks/12345/abcdef',
      samplePayload
    );

    expect(res.sent).toBe(true);
    expect(res.status).toBe(204);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const call = fetchMock.mock.calls[0];
    const body = JSON.parse(call[1].body);
    expect(body.username).toBe('Portfolio Notification');
    expect(body.embeds[0].title).toContain('Sarah Connor');
    expect(body.embeds[0].fields[0].value).toBe('sarah@skynet.test');

    vi.unstubAllGlobals();
  });

  it('formats Slack incoming webhook payload with mrkdwn blocks', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: () => Promise.resolve('ok'),
    });
    vi.stubGlobal('fetch', fetchMock);

    const res = await dispatchWebhook(
      'https://hooks.slack.com/services/T00/B00/X00',
      samplePayload
    );

    expect(res.sent).toBe(true);
    expect(res.status).toBe(200);

    const call = fetchMock.mock.calls[0];
    const body = JSON.parse(call[1].body);
    expect(body.text).toContain('Sarah Connor');
    expect(body.blocks[0].text.text).toContain('New Portfolio Message');

    vi.unstubAllGlobals();
  });

  it('handles remote HTTP failure responses without throwing', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      text: () => Promise.resolve('Webhook not found'),
    });
    vi.stubGlobal('fetch', fetchMock);

    const res = await dispatchWebhook('https://example.com/custom-webhook', samplePayload);
    expect(res.sent).toBe(false);
    expect(res.status).toBe(404);
    expect(res.error).toContain('HTTP 404');

    vi.unstubAllGlobals();
  });
});
