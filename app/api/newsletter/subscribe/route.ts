import { NextResponse } from 'next/server';
import { assertSameOrigin } from '@/core/auth/guard';
import { clientKey, rateLimit } from '@/core/auth/ratelimit';
import { MAX_EMAIL_LENGTH, sendMail } from '@/core/email/send';
import { confirmSubscription } from '@/core/email/templates';
import { getNewsletterSettings } from '@/core/newsletter/read';
import { PENDING_TTL_DAYS } from '@/core/newsletter/schema';
import { requestSignup, sweepStalePending } from '@/core/newsletter/store';
import { getPublishedContent } from '@/core/content/read';
import { siteOrigin } from '@/core/newsletter/urls';

export const dynamic = 'force-dynamic';

/**
 * "Send me updates."
 *
 * Nobody is added to a list here. This records a *request* and emails a link;
 * the list is what survives that link being clicked. Anyone can type anyone's
 * address into a form on the internet, so a form that subscribes directly
 * collects a mixture of real subscribers and people who never asked — which is
 * both what destroys a sending domain's reputation and what GDPR means by
 * consent.
 */
export async function POST(req: Request) {
  try {
    await assertSameOrigin();
  } catch {
    return NextResponse.json({ ok: false, error: 'Request rejected.' }, { status: 403 });
  }

  // Five an hour from one address. The cost of getting this wrong is not a
  // full database — it is somebody else's inbox, because every accepted
  // request sends them an email they did not ask for.
  const limit = await rateLimit(`newsletter:${await clientKey()}`, 5, 60 * 60);
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, error: 'Too many sign-up attempts. Please try again later.' },
      { status: 429 }
    );
  }

  const settings = await getNewsletterSettings('published');
  if (!settings.enabled) {
    // Off means off. The form is not rendered when it is off, so anything
    // reaching here is either stale HTML or somebody poking at the endpoint.
    return NextResponse.json({ ok: false, error: 'Not accepting sign-ups.' }, { status: 404 });
  }

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ ok: false, error: 'Nothing to send.' }, { status: 400 });

  // A field no human sees. Answering with success is deliberate — telling a bot
  // it was spotted is free information for whoever wrote it.
  const trap = [body.honeypot, body.website].find((v) => typeof v === 'string' && v.trim() !== '');
  if (trap) return NextResponse.json({ ok: true, message: settings.pendingMessage });

  const raw = typeof body.email === 'string' ? body.email.slice(0, MAX_EMAIL_LENGTH) : '';

  const result = await requestSignup(
    raw,
    typeof body.source === 'string' ? body.source : undefined
  );
  if (!result.ok) return NextResponse.json({ ok: false, error: result.message }, { status: 400 });

  // Nothing to send: the address is already confirmed. The reply is identical
  // to a fresh sign-up's, because "you are already subscribed" turns the form
  // into a way of testing whether an address is on somebody's list.
  if (!result.confirmToken) {
    return NextResponse.json({ ok: true, message: settings.pendingMessage });
  }

  const origin = await siteOrigin();
  if (!origin) {
    // A confirmation link needs an absolute address, and guessing one from the
    // request's own Host header is how a token ends up pointing at somebody
    // else's domain. Better to refuse and say why.
    return NextResponse.json(
      {
        ok: false,
        error:
          'Sign-ups are not working on this site yet — its owner has not set the site address.',
      },
      { status: 503 }
    );
  }

  const published = await getPublishedContent();
  const siteName = published.settings?.fullName || published.seo?.siteTitle || 'this site';

  const mail = confirmSubscription({
    siteName,
    confirmUrl: `${origin}/newsletter/confirm?token=${encodeURIComponent(result.confirmToken)}`,
    expiresDays: PENDING_TTL_DAYS,
  });

  const sent = await sendMail({
    to: result.subscriber?.email ?? raw,
    ...mail,
    // RFC 8058: with `List-Unsubscribe-Post` present, a mail client shows its
    // own unsubscribe button and calls the URL directly, so leaving costs one
    // tap and never involves finding the link in the body.
    //
    // Exactly one HTTP URI, and that is the specification rather than a
    // preference — a second one makes the header ambiguous about which to
    // POST to, and RFC 8058 §7.1 forbids it. Listing the human-facing page
    // here alongside the endpoint was rejected by a real mail server on the
    // first try.
    headers: {
      'List-Unsubscribe': `<${origin}/api/newsletter/unsubscribe?token=${encodeURIComponent(result.unsubscribeToken ?? '')}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    },
  });

  if (!sent.ok) {
    // Said plainly rather than swallowed. Unlike a contact message — which is
    // safely stored before anyone is notified — a confirmation link that never
    // arrives means the sign-up can never complete, so reporting success here
    // would be a lie to somebody waiting for an email.
    return NextResponse.json(
      {
        ok: false,
        error:
          sent.reason === 'not-configured'
            ? 'Sign-ups are not working on this site yet — its owner has not connected a mail server.'
            : 'The confirmation email could not be sent. Please try again later.',
      },
      { status: 503 }
    );
  }

  // Opportunistic, and after the reply is decided: there is no cron on a free
  // host, so the only reliable moment to drop week-old unconfirmed requests is
  // while something else is already happening.
  void sweepStalePending().catch(() => {});

  return NextResponse.json({ ok: true, message: settings.pendingMessage });
}
