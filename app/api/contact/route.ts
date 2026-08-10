import { NextResponse } from 'next/server';
import { getStorageAdapter } from '@/core/storage/registry';
import { assertSameOrigin } from '@/core/auth/guard';
import { clientKey, rateLimit } from '@/core/auth/ratelimit';
import type { CMSState, ContactMessage } from '@/cms/types/cms';

export const dynamic = 'force-dynamic';

/**
 * Contact form submissions.
 *
 * This fixes a bug that made the form decorative: it used to write the message
 * into the *sender's* own browser storage and show them a success toast, so no
 * enquiry ever reached the site owner. Messages now land on the server, where
 * the owner's inbox can actually read them.
 *
 * Email notification comes with the integrations work. The ordering is
 * deliberate and not negotiable: the message is stored first and notified
 * second, so a misconfigured mail provider loses a notification rather than
 * losing somebody's enquiry.
 */

const MAX = { name: 200, email: 320, company: 200, projectType: 100, message: 5000 };

function clean(value: unknown, limit: number): string {
  if (typeof value !== 'string') return '';
  // Strip control characters: they serve no purpose in a form field and are a
  // classic way to smuggle headers into a notification email later.
  // eslint-disable-next-line no-control-regex
  return Array.from(value)
    .filter((ch) => {
      const code = ch.charCodeAt(0);
      return code >= 32 && code !== 127;
    })
    .join('')
    .trim()
    .slice(0, limit);
}

export async function POST(req: Request) {
  try {
    await assertSameOrigin();
  } catch {
    return NextResponse.json({ ok: false, error: 'Request rejected.' }, { status: 403 });
  }

  const limit = await rateLimit(`contact:${await clientKey()}`, 5, 60 * 60);
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, error: 'You have sent several messages already. Please try again later.' },
      { status: 429 }
    );
  }

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) {
    return NextResponse.json({ ok: false, error: 'Nothing to send.' }, { status: 400 });
  }

  // Honeypot: a field no human sees, so anything that fills it is automated.
  // Answer with success — telling a bot it was detected only helps it adapt.
  const trap = [body.honeypot, body.website].find((v) => typeof v === 'string' && v.trim() !== '');
  if (trap) {
    return NextResponse.json({ ok: true });
  }

  const name = clean(body.name, MAX.name);
  const email = clean(body.email, MAX.email);
  const message = clean(body.message, MAX.message);

  if (!name || !email || !message) {
    return NextResponse.json(
      { ok: false, error: 'Name, email and a message are all required.' },
      { status: 400 }
    );
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json(
      { ok: false, error: 'That email address looks wrong.' },
      { status: 400 }
    );
  }

  const entry: ContactMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    email,
    company: clean(body.company, MAX.company),
    projectType: clean(body.projectType, MAX.projectType),
    message,
    receivedAt: new Date().toISOString(),
    status: 'unread',
  };

  const adapter = getStorageAdapter();
  const published = await adapter.readSnapshot('published');
  if (!published) {
    // Nothing published yet means nowhere to file this. Better to say so than
    // to accept the message and drop it.
    return NextResponse.json(
      { ok: false, error: 'This site is not finished being set up yet.' },
      { status: 503 }
    );
  }

  const updated: CMSState = { ...published, messages: [entry, ...(published.messages ?? [])] };
  await adapter.writeSnapshot('published', updated);

  return NextResponse.json({ ok: true });
}
