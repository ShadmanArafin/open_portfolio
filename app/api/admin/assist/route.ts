import { NextResponse } from 'next/server';
import { requireOwner, UnauthorizedError } from '@/core/auth/guard';
import { clientKey, rateLimit } from '@/core/auth/ratelimit';
import { AssistError, suggest } from '@/core/ai/assist';
import { MAX_SOURCE_CHARS, textOfBlocks, type AssistTask } from '@/core/ai/prompts';

/**
 * One suggestion from the owner's own model. Owner-only: it spends their
 * machine's time and reads their media library.
 */

const TASKS: AssistTask[] = ['description', 'summary', 'alt'];

export async function POST(req: Request) {
  try {
    await requireOwner();
  } catch (err) {
    const status = err instanceof UnauthorizedError ? 401 : 500;
    return NextResponse.json({ ok: false, error: 'Not signed in.' }, { status });
  }

  const limit = await rateLimit(`assist:${await clientKey()}`, 60, 60 * 60);
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, error: 'That is a lot of suggestions in an hour. Wait a while.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } }
    );
  }

  const body = (await req.json().catch(() => null)) as {
    task?: unknown;
    title?: unknown;
    text?: unknown;
    blocks?: unknown;
    imageUrl?: unknown;
  } | null;
  const task = TASKS.find((candidate) => candidate === body?.task);
  if (!body || !task) {
    return NextResponse.json({ ok: false, error: 'Unknown request.' }, { status: 400 });
  }

  const asString = (value: unknown) =>
    typeof value === 'string' ? value.slice(0, MAX_SOURCE_CHARS) : undefined;
  const text = [asString(body.text), Array.isArray(body.blocks) ? textOfBlocks(body.blocks) : '']
    .filter(Boolean)
    .join('\n\n');

  try {
    const suggestion = await suggest(task, {
      title: asString(body.title),
      text,
      imageUrl: asString(body.imageUrl),
    });
    return NextResponse.json({ ok: true, suggestion });
  } catch (err) {
    if (err instanceof AssistError) {
      return NextResponse.json({ ok: false, error: err.message }, { status: 422 });
    }
    console.error('[assist] A suggestion failed.', err);
    return NextResponse.json({ ok: false, error: 'The suggestion did not work.' }, { status: 500 });
  }
}
