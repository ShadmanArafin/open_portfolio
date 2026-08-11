import { NextResponse } from 'next/server';
import { assertSameOrigin } from '@/core/auth/guard';
import { clientKey, rateLimit } from '@/core/auth/ratelimit';
import { issueResetToken, resetUrlBase, RESET_TTL_MINUTES } from '@/core/auth/reset';
import { getPublishedContent } from '@/core/content/read';
import { sendMail } from '@/core/email/send';
import { passphraseReset } from '@/core/email/templates';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    await assertSameOrigin();
  } catch {
    return NextResponse.json({ ok: false, error: 'Request rejected.' }, { status: 403 });
  }

  const body = (await req.json().catch(() => null)) as { email?: string } | null;
  const email = (body?.email ?? '').trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ ok: false, error: 'Enter your email.' }, { status: 400 });
  }

  // Two limits. The client key stops one machine grinding through addresses;
  // the address stops many machines flooding one mailbox.
  const byClient = await rateLimit(`reset:${await clientKey()}`, 5, 60 * 60);
  const byEmail = await rateLimit(`reset-email:${email}`, 3, 60 * 60);
  if (!byClient.allowed || !byEmail.allowed) {
    return NextResponse.json({ ok: true });
  }

  const base = resetUrlBase();
  if (!base) {
    return NextResponse.json(
      {
        ok: false,
        error:
          'Reset is unavailable because this site has no OPB_SITE_URL set. Add it in your ' +
          'hosting dashboard and redeploy.',
      },
      { status: 503 }
    );
  }

  const token = await issueResetToken(email);
  if (token) {
    const content = await getPublishedContent();
    const mail = passphraseReset({
      siteName: content.settings?.fullName || content.seo?.siteTitle || 'your site',
      resetUrl: `${base}/admin/reset?token=${encodeURIComponent(token)}`,
      expiresMinutes: RESET_TTL_MINUTES,
    });
    await sendMail({ to: email, ...mail });
  }

  // The same answer whether or not that address owns this site. Anything else
  // turns this endpoint into a way to ask "does this person run this site?".
  return NextResponse.json({ ok: true });
}
