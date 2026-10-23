import { NextResponse } from 'next/server';
import { requireOwner, UnauthorizedError } from '@/core/auth/guard';
import {
  listPushSubscriptions,
  removePushSubscription,
  savePushSubscription,
} from '@/core/notify/push';

/**
 * The owner's devices, for push. Owner-only in every direction: the endpoint
 * URLs are capabilities, and listing them is listing where the owner can be
 * reached.
 */

async function guard() {
  try {
    await requireOwner();
  } catch (err) {
    const status = err instanceof UnauthorizedError ? 401 : 500;
    return NextResponse.json({ ok: false, error: 'Not signed in.' }, { status });
  }
  return null;
}

export async function GET() {
  const denied = await guard();
  if (denied) return denied;
  return NextResponse.json({ ok: true, subscriptions: await listPushSubscriptions() });
}

export async function POST(req: Request) {
  const denied = await guard();
  if (denied) return denied;
  const body = (await req.json().catch(() => null)) as {
    subscription?: { endpoint?: unknown; keys?: { p256dh?: unknown; auth?: unknown } };
    userAgent?: unknown;
  } | null;
  const endpoint = body?.subscription?.endpoint;
  const keys = body?.subscription?.keys;
  if (
    typeof endpoint !== 'string' ||
    typeof keys?.p256dh !== 'string' ||
    typeof keys?.auth !== 'string'
  ) {
    return NextResponse.json(
      { ok: false, error: 'That subscription is incomplete.' },
      { status: 400 }
    );
  }
  try {
    const saved = await savePushSubscription({
      endpoint,
      keys: { p256dh: keys.p256dh, auth: keys.auth },
      userAgent: typeof body?.userAgent === 'string' ? body.userAgent.slice(0, 200) : null,
    });
    return NextResponse.json({ ok: true, ...saved });
  } catch {
    return NextResponse.json(
      { ok: false, error: 'That subscription is not usable.' },
      { status: 400 }
    );
  }
}

export async function DELETE(req: Request) {
  const denied = await guard();
  if (denied) return denied;
  const endpoint = new URL(req.url).searchParams.get('endpoint');
  if (!endpoint)
    return NextResponse.json({ ok: false, error: 'An endpoint is required.' }, { status: 400 });
  await removePushSubscription(endpoint);
  return NextResponse.json({ ok: true });
}
