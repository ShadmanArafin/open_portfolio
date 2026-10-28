/**
 * Outbound webhook notification dispatcher.
 *
 * Inspired by Payload CMS & GitHub Webhooks:
 * Dispatches non-blocking notifications to Discord, Slack, Telegram, or any
 * custom webhook when someone submits an inquiry on the public contact form.
 *
 * Zero paid email subscriptions required: students can paste a free Discord
 * or Slack channel webhook and get instant alerts on their phone.
 */

export interface ContactNotificationPayload {
  id: string;
  name: string;
  email: string;
  company?: string;
  projectType: string;
  message: string;
  receivedAt: string;
  siteUrl?: string;
}

export interface WebhookResult {
  sent: boolean;
  status?: number;
  error?: string;
}

/** Formats payload specifically for Discord webhook rich embeds. */
function formatDiscordPayload(payload: ContactNotificationPayload) {
  return {
    username: 'Portfolio Notification',
    embeds: [
      {
        title: `New Inquiry from ${payload.name}`,
        color: 0x4f46e5, // Indigo accent
        fields: [
          { name: 'Email', value: payload.email, inline: true },
          { name: 'Company', value: payload.company || 'Not provided', inline: true },
          { name: 'Interest', value: payload.projectType, inline: true },
          { name: 'Message', value: payload.message.slice(0, 1000) },
        ],
        footer: {
          text: payload.siteUrl ? `Sent from ${payload.siteUrl}` : 'Open Portfolio Builder',
        },
        timestamp: payload.receivedAt,
      },
    ],
  };
}

/** Formats payload specifically for Slack incoming webhooks. */
function formatSlackPayload(payload: ContactNotificationPayload) {
  return {
    text: `New Portfolio Inquiry from *${payload.name}* (<${payload.email}>)`,
    blocks: [
      {
        type: 'header',
        text: { type: 'plain_text', text: '📬 New Portfolio Message', emoji: true },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*From:*\n${payload.name} (<mailto:${payload.email}|${payload.email}>)`,
          },
          { type: 'mrkdwn', text: `*Company:*\n${payload.company || 'Not specified'}` },
          { type: 'mrkdwn', text: `*Interest:*\n${payload.projectType}` },
          { type: 'mrkdwn', text: `*Date:*\n${new Date(payload.receivedAt).toLocaleString()}` },
        ],
      },
      {
        type: 'section',
        text: { type: 'mrkdwn', text: `*Message:*\n>${payload.message.replace(/\n/g, '\n>')}` },
      },
    ],
  };
}

/**
 * Dispatches the contact notification payload to the configured webhook URL.
 */
export async function dispatchWebhook(
  webhookUrl: string,
  payload: ContactNotificationPayload
): Promise<WebhookResult> {
  const url = webhookUrl.trim();
  if (!url || !/^https?:\/\//i.test(url)) {
    return { sent: false, error: 'Invalid webhook URL.' };
  }

  let body: unknown;
  if (/discord(?:app)?\.com\/api\/webhooks/i.test(url)) {
    body = formatDiscordPayload(payload);
  } else if (/hooks\.slack\.com/i.test(url)) {
    body = formatSlackPayload(payload);
  } else {
    // Generic JSON webhook
    body = {
      event: 'contact.message',
      data: payload,
    };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'OpenPortfolioBuilder/0.7.4 (Webhook-Dispatcher)',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (res.ok || res.status === 204) {
      return { sent: true, status: res.status };
    }

    const text = await res.text().catch(() => '');
    return {
      sent: false,
      status: res.status,
      error: `Webhook answered HTTP ${res.status}: ${text.slice(0, 150)}`,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { sent: false, error: message };
  }
}
