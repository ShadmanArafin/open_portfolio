import { NextResponse } from 'next/server';
import { assertSameOrigin } from '@/core/auth/guard';
import { clientKey, rateLimit } from '@/core/auth/ratelimit';
import { issueEmailCode, OTP_TTL_MINUTES } from '@/core/auth/otp';
import { getPublishedContent } from '@/core/content/read';
import { MAX_EMAIL_LENGTH, sendMail } from '@/core/email/send';
import { resolveTransportWithStored } from '@/core/email/transport';
import { signInCode } from '@/core/email/templates';

/**
 * Sends the owner a one-time sign-in code.
 *
 * Always answers `{ok: true}` — for the owner, for a stranger's address, for
 * a rate-limited client — so the endpoint cannot be used to ask which address
 * runs this site. The two limits mirror the passphrase-reset request for the
 * same reason: one stops a machine grinding through addresses, the other stops
 * many machines flooding one mailbox.
 */
export async function POST(req: Request) {
  try {
    await assertSameOrigin();
  } catch {
    return NextResponse.json({ ok: false, error: 'Request rejected.' }, { status: 403 });
  }

  const body = (await req.json().catch(() => null)) as { email?: string } | null;
  const email = (body?.email ?? '').trim().toLowerCase();
  if (!email || email.length > MAX_EMAIL_LENGTH) {
    return NextResponse.json({ ok: true });
  }

  const byClient = await rateLimit(`otp:${await clientKey()}`, 5, 60 * 60);
  if (!byClient.allowed) {
    return NextResponse.json({ ok: true });
  }

  const byEmail = await rateLimit(`otp-email:${email}`, 3, 60 * 60);
  if (!byEmail.allowed) {
    return NextResponse.json({ ok: true });
  }

  if ((await resolveTransportWithStored()).kind === 'none') {
    return NextResponse.json(
      {
        ok: false,
        error:
          'Email is not configured on this site, so no code can arrive. Sign in with your ' +
          'passphrase instead, then connect a mail server from the admin.',
      },
      { status: 503 }
    );
  }

  const code = await issueEmailCode(email);
  if (code) {
    const content = await getPublishedContent();
    const mail = signInCode({
      siteName: content.settings?.fullName || content.seo?.siteTitle || 'your site',
      code,
      expiresMinutes: OTP_TTL_MINUTES,
    });
    await sendMail({ to: email, ...mail });
  }

  return NextResponse.json({ ok: true });
}
