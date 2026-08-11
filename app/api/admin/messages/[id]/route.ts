import { NextResponse } from 'next/server';
import { getStorageAdapter } from '@/core/storage/registry';
import { assertSameOrigin, requireOwner, UnauthorizedError } from '@/core/auth/guard';
import type { ContactMessage } from '@/cms/types/cms';

export const dynamic = 'force-dynamic';

const STATUSES: ContactMessage['status'][] = ['unread', 'read', 'archived', 'spam'];

async function guard(): Promise<NextResponse | null> {
  try {
    await assertSameOrigin();
  } catch {
    return NextResponse.json({ ok: false, error: 'Request rejected.' }, { status: 403 });
  }
  try {
    await requireOwner();
  } catch (err) {
    const status = err instanceof UnauthorizedError ? 401 : 500;
    return NextResponse.json({ ok: false, error: 'Not signed in.' }, { status });
  }
  return null;
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const rejected = await guard();
  if (rejected) return rejected;

  const body = (await req.json().catch(() => null)) as { status?: string } | null;
  const status = body?.status as ContactMessage['status'] | undefined;
  if (!status || !STATUSES.includes(status)) {
    return NextResponse.json({ ok: false, error: 'Unknown status.' }, { status: 400 });
  }

  const { id } = await ctx.params;
  await getStorageAdapter().messages.update(id, { status });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const rejected = await guard();
  if (rejected) return rejected;

  const { id } = await ctx.params;
  await getStorageAdapter().messages.remove(id);
  return NextResponse.json({ ok: true });
}
