import { connection } from 'next/server';
import type { Metadata } from 'next';
import { getStorageAdapter } from '@/core/storage/registry';
import { resolveAnalytics } from '@/core/integrations/analytics';
import { audienceSummary } from '@/core/integrations/stats';
import { TRACKED_EVENTS } from '@/utils/analytics';

export const metadata: Metadata = {
  title: 'Analytics',
  robots: { index: false, follow: false },
};

/**
 * Audience and enquiries, kept visibly separate because they are trustworthy
 * in different ways. Enquiries are first-party — in this database because
 * someone submitted the form, so those numbers are exact. Audience numbers
 * come from the provider once one is connected; the view-count cards appear
 * only when there is data, never as an error state.
 *
 * Fully server-rendered: the inbox, the published projects and case studies,
 * the resolved provider config and the audience summary are all read here.
 * The share-URL iframe is the only client piece, and it is a plain embed.
 */

interface MessageLike {
  receivedAt: string;
  status: string;
}

function enquiryStats(messages: MessageLike[]) {
  const now = Date.now();
  const days = (n: number) =>
    messages.filter((m) => {
      const t = new Date(m.receivedAt).getTime();
      return !Number.isNaN(t) && now - t <= n * 86_400_000;
    }).length;

  const byMonth = new Map<string, number>();
  for (const m of messages) {
    const d = new Date(m.receivedAt);
    if (Number.isNaN(d.getTime())) continue;
    const key = d.toLocaleDateString([], { month: 'short', year: '2-digit' });
    byMonth.set(key, (byMonth.get(key) ?? 0) + 1);
  }

  const latest = messages
    .map((m) => new Date(m.receivedAt).getTime())
    .filter((t) => !Number.isNaN(t))
    .sort((a, b) => b - a)[0];

  return {
    total: messages.length,
    unread: messages.filter((m) => m.status === 'unread').length,
    last30: days(30),
    byMonth: [...byMonth.entries()].slice(-6),
    daysSinceLast: latest ? Math.floor((now - latest) / 86_400_000) : null,
  };
}

function Card({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <section aria-label={label} className="rounded-2xl border border-border p-4">
      <p className="m-0 text-sm text-text-secondary">{label}</p>
      <p className="m-0 mt-1 text-3xl font-semibold">{value}</p>
      <p className="m-0 text-sm text-text-secondary">{unit}</p>
    </section>
  );
}

export default async function AnalyticsPage() {
  // Live figures, measured now: never prerendered.
  await connection();
  const adapter = await getStorageAdapter();
  const [inbox, draftMeta, publishedMeta, analytics, audience] = await Promise.all([
    adapter.messages.list().catch(() => []),
    adapter.readSnapshotMeta('draft'),
    adapter.readSnapshotMeta('published'),
    resolveAnalytics(),
    audienceSummary().catch(() => null),
  ]);

  const stats = enquiryStats(inbox);
  const published = publishedMeta?.state as
    { projects?: { status?: string }[]; caseStudies?: { status?: string }[] } | undefined;
  const liveProjects = (published?.projects ?? []).filter((p) => p.status === 'published').length;
  const liveStudies = (published?.caseStudies ?? []).filter((c) => c.status === 'published').length;
  void draftMeta;

  const connected =
    (analytics.provider === 'plausible' && Boolean(analytics.domain)) ||
    (analytics.provider === 'umami' && Boolean(analytics.websiteId));

  return (
    <div className="grid gap-6">
      <div>
        <p className="m-0 font-mono text-xs uppercase tracking-widest text-text-muted">Analytics</p>
        <h1 className="font-display m-0 mt-1 text-3xl">Audience &amp; Enquiries</h1>
        <p className="m-0 mt-1 text-text-secondary">
          What the site can measure about the people using it, and what it needs to measure more.
        </p>
      </div>

      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}
      >
        <Card
          label="Enquiries received"
          value={String(stats.total)}
          unit={`${stats.last30} in the last 30 days`}
        />
        <Card
          label="Awaiting a reply"
          value={String(stats.unread)}
          unit={stats.unread > 0 ? 'Someone is waiting' : 'Inbox clear'}
        />
        <Card
          label="Last enquiry"
          value={
            stats.daysSinceLast === null
              ? '—'
              : stats.daysSinceLast === 0
                ? 'Today'
                : `${stats.daysSinceLast}d`
          }
          unit={stats.daysSinceLast === null ? 'None yet' : 'since the last one'}
        />
        <Card
          label="Pages that can be found"
          value={String(liveProjects + liveStudies + 5)}
          unit={`${liveProjects} projects · ${liveStudies} case studies · 5 fixed pages`}
        />
        {audience ? (
          <>
            <Card
              label="Visitors · last 30 days"
              value={audience.visitors30d === null ? '—' : String(audience.visitors30d)}
              unit={`from ${audience.provider}`}
            />
            <Card
              label="Page views · last 30 days"
              value={audience.pageviews30d === null ? '—' : String(audience.pageviews30d)}
              unit={
                audience.topPages.length > 0
                  ? `${audience.topPages.length} busiest pages below`
                  : 'No page breakdown available'
              }
            />
          </>
        ) : null}
      </div>

      <div
        className="grid items-start gap-6"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}
      >
        <section aria-label="Enquiries by month">
          <h2 className="m-0 text-xl">Enquiries by month</h2>
          {stats.byMonth.length === 0 ? (
            <p
              role="status"
              className="rounded-2xl border border-border p-4 text-center text-sm text-text-secondary"
            >
              No enquiries yet — submissions from the contact form are counted here.
            </p>
          ) : (
            <ul className="m-0 mt-2 grid list-none gap-2 p-0">
              {stats.byMonth.map(([month, count]) => (
                <li
                  key={month}
                  className="flex items-center justify-between rounded-2xl border border-border p-3"
                >
                  <strong>{month}</strong>
                  <span className="rounded-full border border-border px-2 py-0.5 text-xs text-text-secondary">
                    {count}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <p className="m-0 mt-2 text-sm text-text-secondary">
            Counted from the contact form, so these are exact — every one is a message in your
            inbox.
          </p>
          {audience && audience.topPages.length > 0 ? (
            <>
              <h3 className="mt-4 text-lg">Busiest pages · last 30 days</h3>
              <ul className="m-0 mt-2 grid list-none gap-2 p-0">
                {audience.topPages.map((page) => (
                  <li
                    key={page.path}
                    className="flex items-center justify-between rounded-2xl border border-border p-3"
                  >
                    <strong className="font-mono text-sm">{page.path}</strong>
                    <span className="rounded-full border border-border px-2 py-0.5 text-xs text-text-secondary">
                      {page.views}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </section>

        <section aria-label="Audience">
          <h2 className="m-0 text-xl">Audience</h2>
          {connected ? (
            <div className="mt-2 grid gap-3">
              <div
                role="status"
                className="rounded-2xl border border-border bg-surface-secondary p-4"
              >
                <p className="m-0 font-semibold">Connected to {analytics.provider}</p>
                <p className="m-0 mt-1 text-sm text-text-secondary">
                  Page views and the events below are being recorded on the live site.
                </p>
              </div>
              {analytics.shareUrl ? (
                <iframe
                  title="Analytics dashboard"
                  src={analytics.shareUrl}
                  loading="lazy"
                  style={{
                    width: '100%',
                    height: 620,
                    border: 0,
                    borderRadius: 'var(--radius-element)',
                  }}
                />
              ) : (
                <p className="m-0 text-sm text-text-secondary">
                  Add a read-only share link in the provider&apos;s Services settings to see the
                  charts here instead of on the provider&apos;s site.
                </p>
              )}
            </div>
          ) : (
            <div className="mt-2 grid gap-3">
              <div
                role="status"
                className="rounded-2xl border border-border bg-surface-secondary p-4"
              >
                <p className="m-0 font-semibold">No analytics provider connected</p>
                <p className="m-0 mt-1 text-sm text-text-secondary">
                  Visitor counts, per-project views and click-throughs are not being recorded yet.
                </p>
              </div>
              <p className="m-0 text-sm">
                A static site cannot count its own visitors — nothing runs on a server, so a page
                view has nowhere to be stored that you could read later. The site is already
                instrumented, so the numbers start the moment a provider is connected under
                Services: Umami self-hosted is the default suggestion, Plausible self-hosted the
                alternative. Both are cookieless, so no consent banner is needed in the UK or EU.
              </p>
            </div>
          )}

          <h3 className="mt-4 text-lg">Events already wired up</h3>
          <ul className="m-0 mt-2 grid list-none gap-2 p-0">
            {TRACKED_EVENTS.map((event) => (
              <li key={event.name} className="rounded-2xl border border-border p-3">
                <p className="m-0 font-semibold">
                  {event.name}{' '}
                  <span className="rounded-full border border-border px-2 py-0.5 text-xs font-normal text-text-secondary">
                    {connected ? 'Recording' : 'Ready'}
                  </span>
                </p>
                <p className="m-0 mt-1 text-sm text-text-secondary">
                  {event.when} — {event.tells}
                </p>
              </li>
            ))}
          </ul>
          <p className="m-0 mt-2 text-sm text-text-secondary">
            Your own visits to /admin are never counted, and neither is the draft preview.
          </p>
        </section>
      </div>
    </div>
  );
}
