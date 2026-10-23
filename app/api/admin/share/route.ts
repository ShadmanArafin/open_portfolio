import { NextResponse } from 'next/server';
import { requireOwner, UnauthorizedError } from '@/core/auth/guard';
import { createShareLink, revokeShareLink, shareLinkStatus } from '@/core/sharing/tokens';

/**
 * Expiring share links, one per page.
 *
 * Owner-only in every direction: the links themselves grant access to draft
 * content, so minting, listing and revoking them all require proving you are
 * the owner first. The public half lives at /share/[token] and needs no
 * session — the token is the authorization.
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

export async function GET(req: Request) {
  const denied = await guard();
  if (denied) return denied;
  const pageId = new URL(req.url).searchParams.get('pageId');
  if (!pageId)
    return NextResponse.json({ ok: false, error: 'A page id is required.' }, { status: 400 });
  return NextResponse.json({ ok: true, ...(await shareLinkStatus(pageId)) });
}

export async function POST(req: Request) {
  const denied = await guard();
  if (denied) return denied;
  const body = (await req.json().catch(() => null)) as { pageId?: unknown; days?: unknown } | null;
  if (typeof body?.pageId !== 'string' || !body.pageId) {
    return NextResponse.json({ ok: false, error: 'A page id is required.' }, { status: 400 });
  }
  const days = typeof body.days === 'number' ? body.days : 7;
  const link = await createShareLink(body.pageId, days);
  return NextResponse.json({ ok: true, token: link.token, expiresAt: link.expiresAt });
}

export async function DELETE(req: Request) {
  const denied = await guard();
  if (denied) return denied;
  const pageId = new URL(req.url).searchParams.get('pageId');
  if (!pageId)
    return NextResponse.json({ ok: false, error: 'A page id is required.' }, { status: 400 });
  await revokeShareLink(pageId);
  return NextResponse.json({ ok: true });
}
