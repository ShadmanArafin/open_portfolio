import 'server-only';
import { getStorageAdapter } from '@/core/storage/registry';
import { getContentForChannel } from '@/core/content/read';
import { resolveSiteUrl } from '@/core/content/metadata';
import { launchSteps } from '@/core/content/launch';
import { hasUnpublishedChanges } from '@/core/content/changes';
import { audienceSummary } from '@/core/integrations/stats';
import { resolveTransportWithStored } from '@/core/email/transport';
import { sendMail } from '@/core/email/send';
import { monthlyDigest } from '@/core/email/templates';
import type { CMSState } from '@/cms/types/cms';

/**
 * Once a month, a short email to the owner: who looked, who wrote, what is
 * unfinished. The retention loop a low-frequency product otherwise lacks.
 *
 * Nothing in the app runs on a timer, so something outside calls
 * `/api/cron/digest` — Vercel Cron on Vercel (`vercel.json`), a crontab line or
 * a scheduled workflow anywhere else — as often as it likes. This sends at most
 * once per calendar month, remembered in storage, so a daily call is fine and
 * a missed day only delays it. It covers the month before the first call of
 * the new one.
 */

export type DigestOutcome =
  | { sent: true; month: string }
  | {
      sent: false;
      reason: 'already-sent' | 'turned-off' | 'no-owner' | 'no-mail' | 'failed';
      detail?: string;
    };

const KEY = 'digest-last-month';

export async function runMonthlyDigest(now: Date = new Date()): Promise<DigestOutcome> {
  if (process.env.OPB_DIGEST === 'off') return { sent: false, reason: 'turned-off' };

  const adapter = await getStorageAdapter();
  const thisMonth = now.toISOString().slice(0, 7);
  const last = await adapter.kv.get<string>('config', KEY);
  if (last === thisMonth) return { sent: false, reason: 'already-sent' };

  const owner = await adapter.readOwner();
  if (!owner?.email) return { sent: false, reason: 'no-owner' };
  const transport = await resolveTransportWithStored().catch(() => ({ kind: 'none' as const }));
  if (transport.kind === 'none') return { sent: false, reason: 'no-mail' };

  const previous = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  const monthStart = previous.getTime();
  const monthEnd = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1);
  const monthName = previous.toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });

  const [draft, publishedMeta, messages, views] = await Promise.all([
    getContentForChannel('draft'),
    adapter.readSnapshotMeta('published'),
    adapter.messages.list().catch(() => []),
    audienceSummary().catch(() => null),
  ]);
  const published = (publishedMeta?.state as CMSState | undefined) ?? null;
  const siteUrl = resolveSiteUrl(published ?? draft) ?? '';
  const inMonth = messages.filter((message) => {
    const at = Date.parse(message.receivedAt);
    return at >= monthStart && at < monthEnd && message.status !== 'spam';
  });

  const mail = monthlyDigest({
    siteName: draft.settings?.fullName || 'your site',
    month: monthName,
    views: views
      ? { visitors: views.visitors30d, pageviews: views.pageviews30d, topPages: views.topPages }
      : null,
    newMessages: inMonth.length,
    unread: messages.filter((message) => message.status === 'unread').length,
    unpublished: published ? hasUnpublishedChanges(draft, published) : false,
    todo: launchSteps(draft, {
      published: Boolean(published?.lastPublishedAt),
      emailConfigured: true,
    })
      .filter((step) => !step.done)
      .map((step) => ({ label: step.label, url: `${siteUrl}${step.href}` })),
    adminUrl: `${siteUrl}/admin`,
  });

  const sent = await sendMail({ to: owner.email, ...mail });
  if (!sent.ok) return { sent: false, reason: 'failed', detail: sent.detail };
  await adapter.kv.set('config', KEY, thisMonth);
  return { sent: true, month: monthName };
}
