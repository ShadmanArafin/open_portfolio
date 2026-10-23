import type { Metadata } from 'next';
import Link from 'next/link';
import { getStorageAdapter } from '@/core/storage/registry';
import { getContentForChannel } from '@/core/content/read';
import { analyseContent } from '@/cms/utils/contentHealth';
import { countMediaUsage, describeChanges, hasUnpublishedChanges } from '@/core/content/changes';
import { audienceSummary } from '@/core/integrations/stats';
import { resolveTransportWithStored } from '@/core/email/transport';
import type { CMSState } from '@/cms/types/cms';
import { PublishButton } from './publish-button';
import { launchSteps } from '@/core/content/launch';

export const metadata: Metadata = {
  title: 'Dashboard',
  robots: { index: false, follow: false },
};

/**
 * Overview: what is wrong right now, and the work queued to fix it.
 *
 * Server-rendered from the published snapshot — checks run against what
 * visitors get, not the draft. The inbox is merged in live (the published
 * document never carries enquiries), so the unread check stays honest.
 * Publish is one client island carrying the decision; everything else on
 * this screen is read and rendered on the server.
 */

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const TONES: Record<string, string> = {
  blocking: 'Fix first',
  warning: 'Worth doing',
  idea: 'Idea',
};

export default async function DashboardPage() {
  const adapter = await getStorageAdapter();
  const [draftMeta, publishedMeta, inbox, transport] = await Promise.all([
    adapter.readSnapshotMeta('draft'),
    adapter.readSnapshotMeta('published'),
    adapter.messages.list().catch(() => []),
    resolveTransportWithStored().catch(() => ({ kind: 'none' as const })),
  ]);

  // A brand-new site has nothing stored until the first save, and that is
  // exactly when this screen — the checklist above all — matters most. It
  // reads what the editors start from (`getContentForChannel` falls back to the
  // built-in content), instead of answering "nothing is stored yet".
  const draft = (draftMeta?.state as CMSState | undefined) ?? (await getContentForChannel('draft'));
  const published = publishedMeta?.state as CMSState | undefined;
  const baseline = published ?? draft;

  const analysed: CMSState = { ...baseline, messages: inbox };
  const report = analyseContent(analysed, (id) => countMediaUsage(analysed, id), {
    emailConfigured: transport.kind !== 'none',
  });

  const unpublished = draft ? hasUnpublishedChanges(draft, published ?? null) : false;
  const summary = draft && published ? describeChanges(published, draft) : 'First publish.';
  const scoreTone =
    report.score >= 90 ? 'All clear' : report.score >= 65 ? 'Getting there' : 'Needs work';
  const blocking = report.issues.filter((i) => i.severity === 'blocking').length;
  const views = await audienceSummary().catch(() => null);
  const steps = launchSteps(draft, {
    published: Boolean(published?.lastPublishedAt),
    emailConfigured: transport.kind !== 'none',
  });
  const stepsDone = steps.filter((step) => step.done).length;

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="m-0 font-mono text-xs uppercase tracking-widest text-text-muted">
            Overview
          </p>
          <h1 className="font-display m-0 mt-1 text-3xl">
            Welcome back, {baseline.settings?.fullName || 'there'}
          </h1>
          <p className="m-0 mt-1 text-text-secondary">
            What is wrong with the site right now, and what to do about it.
          </p>
        </div>
        <Link
          href="/admin/pages"
          className="rounded-full bg-text-primary px-5 font-semibold text-bg no-underline"
          style={{ minHeight: 44, display: 'inline-flex', alignItems: 'center' }}
        >
          Pages
        </Link>
      </div>

      {stepsDone < steps.length ? (
        <section
          aria-labelledby="launch-heading"
          className="grid gap-3 rounded-2xl border border-border p-4"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="launch-heading" className="m-0 text-xl">
              Launch checklist
            </h2>
            <p className="m-0 text-sm text-text-secondary">
              {stepsDone} of {steps.length} done
            </p>
          </div>
          <progress
            value={stepsDone}
            max={steps.length}
            aria-label={`Launch checklist: ${stepsDone} of ${steps.length} done`}
            className="h-2 w-full overflow-hidden rounded-full accent-[var(--accent-color)]"
          />
          <ol className="m-0 grid list-none gap-1 p-0">
            {steps.map((step) => (
              <li key={step.id} className="flex items-center gap-3 text-sm">
                <span
                  aria-hidden="true"
                  className={`inline-flex h-5 w-5 items-center justify-center rounded-full border text-xs ${
                    step.done ? 'border-text-primary bg-text-primary text-bg' : 'border-border'
                  }`}
                >
                  {step.done ? '✓' : ''}
                </span>
                {step.done ? (
                  <span className="text-text-muted">
                    {step.label}
                    <span className="sr-only"> (done)</span>
                  </span>
                ) : (
                  <Link
                    href={step.href}
                    className="flex items-center text-text-primary"
                    style={{ minHeight: 44 }}
                  >
                    {step.label} →
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}
      >
        <section aria-label="Site readiness" className="rounded-2xl border border-border p-4">
          <p className="m-0 text-sm text-text-secondary">Site readiness</p>
          <p className="m-0 mt-1 text-3xl font-semibold">
            {report.score}%{' '}
            <span className="text-sm font-normal text-text-secondary">
              {report.passed}/{report.total} checks
            </span>
          </p>
          <p className="m-0 mt-1 text-sm">
            <span className="rounded-full border border-border px-3 py-1 text-xs">
              {blocking > 0
                ? `${blocking} to fix first`
                : report.issues.length > 0
                  ? `${report.issues.length} to tidy`
                  : scoreTone}
            </span>
          </p>
        </section>
        <section aria-label="Live on the site" className="rounded-2xl border border-border p-4">
          <p className="m-0 text-sm text-text-secondary">Live on the site</p>
          <p className="m-0 mt-1 text-3xl font-semibold">
            {report.liveProjects + report.liveCaseStudies}
          </p>
          <p className="m-0 text-sm text-text-secondary">
            {report.liveProjects} projects · {report.liveCaseStudies} case studies
          </p>
        </section>
        <section aria-label="Last publish" className="rounded-2xl border border-border p-4">
          <p className="m-0 text-sm text-text-secondary">Last publish</p>
          <p className="m-0 mt-1 text-3xl font-semibold">
            {report.daysSincePublish === null
              ? 'Never'
              : report.daysSincePublish === 0
                ? 'Today'
                : `${report.daysSincePublish}d`}
          </p>
          <p className="m-0 text-sm text-text-secondary">
            {report.daysSincePublish === null
              ? 'Nothing has gone live yet'
              : report.daysSincePublish === 0
                ? 'Up to date'
                : 'ago'}
          </p>
        </section>
        <section aria-label="Unused files" className="rounded-2xl border border-border p-4">
          <p className="m-0 text-sm text-text-secondary">Unused files</p>
          <p className="m-0 mt-1 text-3xl font-semibold">{report.unusedMedia}</p>
          <p className="m-0 text-sm text-text-secondary">
            of {analysed.media.length} · {formatBytes(report.storageBytes)} stored
          </p>
        </section>
      </div>

      {views ? (
        <section aria-label="Visitors" className="rounded-2xl border border-border p-4">
          <p className="m-0 text-sm text-text-secondary">
            Visitors, last 30 days · {views.provider}
          </p>
          <p className="m-0 mt-1 text-3xl font-semibold">
            {views.visitors30d ?? '—'}{' '}
            <span className="text-sm font-normal text-text-secondary">
              visitors · {views.pageviews30d ?? '—'} views
            </span>
          </p>
          {views.topPages.length > 0 ? (
            <ul
              className="m-0 mt-2 grid gap-1 p-0 text-sm text-text-secondary"
              style={{ listStyle: 'none' }}
            >
              {views.topPages.slice(0, 5).map((page) => (
                <li key={page.path}>
                  <span className="font-mono">{page.path}</span> — {page.views} views
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      ) : null}

      {unpublished ? (
        <section
          aria-label="Unpublished changes"
          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border p-4"
        >
          <div>
            <p className="m-0 font-semibold">Unpublished changes</p>
            <p className="m-0 text-sm text-text-secondary">{summary}</p>
          </div>
          <span className="inline-flex items-center gap-2">
            <span className="rounded-full border border-border px-3 py-1 text-xs">Draft only</span>
            <PublishButton expectedRevision={publishedMeta?.revision ?? 0} />
          </span>
        </section>
      ) : null}

      <div
        className="grid items-start gap-6"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}
      >
        <section aria-label="Needs attention">
          <h2 className="m-0 text-xl">
            Needs attention{report.issues.length > 0 ? ` (${report.issues.length})` : ''}
          </h2>
          {report.issues.length === 0 ? (
            <p
              role="status"
              className="rounded-2xl border border-border p-4 text-center text-sm text-text-secondary"
            >
              Nothing to fix — every check passes.
            </p>
          ) : (
            <ul className="m-0 mt-2 grid list-none gap-2 p-0">
              {report.issues.map((issue) => (
                <li key={issue.id} className="rounded-2xl border border-border p-3">
                  <p className="m-0 font-semibold">
                    {issue.to ? <Link href={issue.to}>{issue.title}</Link> : issue.title}{' '}
                    <span className="ml-1 rounded-full border border-border px-2 py-0.5 text-xs font-normal text-text-secondary">
                      {TONES[issue.severity]}
                    </span>
                  </p>
                  <p className="m-0 mt-1 text-sm text-text-secondary">{issue.detail}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-label="Recent activity">
          <h2 className="m-0 text-xl">Recent activity</h2>
          {(baseline.activityLogs ?? []).length === 0 ? (
            <p
              role="status"
              className="rounded-2xl border border-border p-4 text-center text-sm text-text-secondary"
            >
              Publishing and restoring show up here.
            </p>
          ) : (
            <ul className="m-0 mt-2 grid list-none gap-2 p-0">
              {(baseline.activityLogs ?? []).slice(0, 8).map((log) => (
                <li key={log.id} className="rounded-2xl border border-border p-3">
                  <p className="m-0 font-semibold">{log.action}</p>
                  <p className="m-0 text-sm text-text-secondary">
                    {log.details} ·{' '}
                    {new Date(log.timestamp).toLocaleString([], {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </li>
              ))}
            </ul>
          )}
          <p className="m-0 mt-3 text-sm text-text-secondary">
            These are content checks, not visitor analytics. Traffic needs an analytics provider —
            connect one under Services.
          </p>
        </section>
      </div>
    </div>
  );
}
