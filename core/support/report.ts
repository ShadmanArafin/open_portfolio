import { UPSTREAM_URL } from '@/core/version';
import { formatDiagnostics, type Diagnostics } from './diagnostics';

/**
 * Turning something somebody typed into a GitHub issue.
 *
 * A pre-filled URL, not an API call. There is no token to ask for, no server of
 * ours to run, and nothing to be abused by whoever finds the endpoint — and the
 * issue is authored by *them*, which is what makes a thank-you in the release
 * notes accurate rather than guessed at.
 *
 * The trade is that they need a GitHub account and one extra click. For a
 * project whose whole audience is people deploying from GitHub, that is a
 * cheaper price than a hosted intake service, and an honest one: the report is
 * public from the moment they send it, and they can see exactly what it says
 * before they do.
 */

export type ReportKind = 'bug' | 'feature';

export interface BugReport {
  kind: 'bug';
  title: string;
  whatHappened: string;
  whatIExpected: string;
  steps: string;
}

export interface FeatureRequest {
  kind: 'feature';
  title: string;
  problem: string;
  idea: string;
  whoElse: string;
}

export type Report = BugReport | FeatureRequest;

/** GitHub rejects URLs beyond roughly 8kB, and truncates unhelpfully first. */
const MAX_BODY = 6000;

function truncate(body: string): string {
  if (body.length <= MAX_BODY) return body;
  return `${body.slice(0, MAX_BODY)}\n\n_(truncated — the rest was too long for a link)_`;
}

export function buildBody(report: Report, diagnostics?: Diagnostics): string {
  const sections =
    report.kind === 'bug'
      ? [
          '### What happened',
          report.whatHappened || '_not described_',
          '',
          '### What I expected',
          report.whatIExpected || '_not described_',
          '',
          '### Steps to make it happen again',
          report.steps || '_not described_',
        ]
      : [
          '### The problem',
          report.problem || '_not described_',
          '',
          '### What I would like',
          report.idea || '_not described_',
          '',
          '### Who else this would help',
          report.whoElse || '_not described_',
        ];

  if (diagnostics) sections.push('', formatDiagnostics(diagnostics));

  return truncate(sections.join('\n'));
}

/**
 * The URL that opens a pre-filled new issue.
 *
 * Labels are applied through the URL so triage starts sorted, and
 * `from-admin` marks reports that came through this screen — worth
 * distinguishing, because these ones arrive with diagnostics attached.
 */
export function buildIssueUrl(report: Report, diagnostics?: Diagnostics): string {
  const labels = report.kind === 'bug' ? ['bug', 'from-admin'] : ['enhancement', 'from-admin'];

  const params = new URLSearchParams({
    title: report.title.trim() || (report.kind === 'bug' ? 'Bug report' : 'Feature request'),
    body: buildBody(report, diagnostics),
    labels: labels.join(','),
  });

  return `${UPSTREAM_URL}/issues/new?${params.toString()}`;
}

/** Whether there is enough here to be worth somebody's time to read. */
export function isReportReady(report: Report): boolean {
  if (!report.title.trim()) return false;
  return report.kind === 'bug'
    ? Boolean(report.whatHappened.trim())
    : Boolean(report.problem.trim() || report.idea.trim());
}
