import { NextResponse } from 'next/server';
import { destroySession } from '@/core/auth/session';
import { assertSameOrigin } from '@/core/auth/guard';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    await assertSameOrigin();
  } catch {
    return NextResponse.json({ ok: false }, { status: 403 });
  }
  await destroySession();
  return NextResponse.json({ ok: true });
}
