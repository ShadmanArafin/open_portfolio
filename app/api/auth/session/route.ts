import { NextResponse } from 'next/server';
import { getInstanceState, getOwnerSession } from '@/core/auth/guard';

export const dynamic = 'force-dynamic';

/**
 * Lets the client-rendered admin ask who it is talking to.
 *
 * Returns the email and whether a session exists — never the token or anything
 * derived from it, which is what allows the cookie to stay httpOnly.
 */
export async function GET() {
  const [session, instance] = await Promise.all([getOwnerSession(), getInstanceState()]);
  return NextResponse.json({
    signedIn: Boolean(session),
    email: session?.email ?? null,
    claimed: instance === 'claimed',
  });
}
