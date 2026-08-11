import { NextResponse } from 'next/server';
import { requireOwner, UnauthorizedError } from '@/core/auth/guard';
import { clientKey, rateLimit } from '@/core/auth/ratelimit';
import { submitIssue } from '@/core/support/github-auth';
import { buildBody, isReportReady, type Report } from '@/core/support/report';
import type { Diagnostics } from '@/core/support/diagnostics';

export const dynamic = 'force-dynamic';

/**
 * Sends the report, as the connected account, without leaving the admin.
 *
 * The body is composed here rather than trusted from the client, using the same
 * `buildBody` the preview on screen uses — so what somebody read before pressing
 * Send is what gets posted. A client that could supply arbitrary Markdown could
 * show one thing and file another under its owner's name.
 */
export async function POST(req: Request) {
  try {
    await requireOwner();
  } catch (err) {
    const status = err instanceof UnauthorizedError ? 401 : 500;
    return NextResponse.json({ ok: false, error: 'Not signed in.' }, { status });
  }

  // Low, and per hour. Filing is a deliberate act; nobody legitimately opens
  // twenty issues in an afternoon, and the account carrying them is the
  // owner's own reputation on someone else's issue tracker.
  const limit = await rateLimit(`issue-submit:${await clientKey()}`, 10, 60 * 60);
  if (!limit.allowed) {
    return NextResponse.json(
      {
        ok: false,
        error:
          'That is a lot of reports in one hour. Take a break — and if you have found that many things, one issue listing them is easier to act on.',
      },
      { status: 429 }
    );
  }

  const body = (await req.json().catch(() => null)) as {
    report?: Report;
    diagnostics?: Diagnostics;
  } | null;

  if (!body?.report || !isReportReady(body.report)) {
    return NextResponse.json(
      { ok: false, error: 'There is not enough here yet for somebody to act on.' },
      { status: 400 }
    );
  }

  const { report, diagnostics } = body;
  const labels = report.kind === 'bug' ? ['bug', 'from-admin'] : ['enhancement', 'from-admin'];

  const result = await submitIssue(
    report.title.trim() || (report.kind === 'bug' ? 'Bug report' : 'Feature request'),
    buildBody(report, diagnostics),
    labels
  );

  return NextResponse.json(result, { status: result.ok ? 200 : 502 });
}
