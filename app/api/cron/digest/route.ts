import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { runMonthlyDigest } from '@/core/notify/digest';

/**
 * Called by a scheduler, never by a person: Vercel Cron (which sends
 * `Authorization: Bearer $CRON_SECRET` when that variable is set), a crontab
 * line, or a scheduled workflow. Authorised by that shared secret — not a
 * session, since there is nobody signed in — so it refuses everything until
 * one is configured. At most one email a month however often it is called.
 */
function authorised(req: Request): boolean {
  const secret = process.env.CRON_SECRET || process.env.OPB_CRON_SECRET;
  if (!secret) return false;
  const given = (req.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '');
  const a = Buffer.from(given);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

async function handle(req: Request) {
  if (!process.env.CRON_SECRET && !process.env.OPB_CRON_SECRET) {
    return NextResponse.json(
      { ok: false, error: 'Set CRON_SECRET (or OPB_CRON_SECRET) to turn the monthly digest on.' },
      { status: 503 }
    );
  }
  if (!authorised(req)) return NextResponse.json({ ok: false }, { status: 401 });
  const outcome = await runMonthlyDigest();
  return NextResponse.json({ ok: true, ...outcome });
}

export const GET = handle;
export const POST = handle;
