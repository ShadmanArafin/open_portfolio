import { NextResponse } from 'next/server';
import { requireOwner, UnauthorizedError } from '@/core/auth/guard';
import { clientKey, rateLimit } from '@/core/auth/ratelimit';
import {
  clientId,
  connection,
  disconnect,
  pollDeviceFlow,
  startDeviceFlow,
} from '@/core/support/github-auth';

export const dynamic = 'force-dynamic';

/**
 * Connecting and disconnecting a GitHub account.
 *
 * Owner-only, all of it. The device code this hands out can be exchanged for a
 * token in the owner's name, so an unauthenticated caller who could start a
 * flow could invite somebody to authorise an account they do not own.
 */

async function guard(): Promise<NextResponse | null> {
  try {
    await requireOwner();
    return null;
  } catch (err) {
    const status = err instanceof UnauthorizedError ? 401 : 500;
    return NextResponse.json({ ok: false, error: 'Not signed in.' }, { status });
  }
}

export async function GET() {
  const rejected = await guard();
  if (rejected) return rejected;

  return NextResponse.json({
    ok: true,
    // False when this build has no GitHub application configured, in which case
    // the admin keeps offering the open-a-tab route rather than a dead button.
    available: clientId() !== null,
    ...(await connection()),
  });
}

export async function POST(req: Request) {
  const rejected = await guard();
  if (rejected) return rejected;

  const body = (await req.json().catch(() => null)) as { deviceCode?: string } | null;

  // Polling is the normal case and happens every few seconds by design, so the
  // limit is generous; starting a flow is rare and cheap to abuse, so it is not.
  const limit = await rateLimit(
    `github-connect:${await clientKey()}`,
    body?.deviceCode ? 200 : 10,
    60 * 15
  );
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, error: 'Too many attempts. Wait a few minutes.' },
      {
        status: 429,
      }
    );
  }

  if (!body?.deviceCode) {
    const started = await startDeviceFlow();
    if ('error' in started) return NextResponse.json({ ok: false, error: started.error });
    return NextResponse.json({ ok: true, ...started });
  }

  return NextResponse.json({ ok: true, ...(await pollDeviceFlow(body.deviceCode)) });
}

export async function DELETE() {
  const rejected = await guard();
  if (rejected) return rejected;

  await disconnect();
  return NextResponse.json({ ok: true });
}
