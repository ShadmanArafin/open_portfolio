import { NextResponse } from 'next/server';
import { claimInstance, getClaimEligibility } from '@/core/auth/claim';
import { assertSameOrigin } from '@/core/auth/guard';
import { clientKey, rateLimit } from '@/core/auth/ratelimit';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(await getClaimEligibility());
}

export async function POST(req: Request) {
  try {
    await assertSameOrigin();
  } catch {
    return NextResponse.json({ ok: false, error: 'Request rejected.' }, { status: 403 });
  }

  const limit = await rateLimit(`claim:${await clientKey()}`, 10, 15 * 60);
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, error: 'Too many attempts. Try again in a few minutes.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } }
    );
  }

  const body = (await req.json().catch(() => null)) as Record<string, string> | null;
  if (!body?.email || !body?.passphrase) {
    return NextResponse.json(
      { ok: false, error: 'Email and passphrase are both required.' },
      { status: 400 }
    );
  }

  const result = await claimInstance({
    email: body.email,
    passphrase: body.passphrase,
    setupToken: body.setupToken,
  });

  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
