import { NextResponse } from 'next/server';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { getStorageAdapter } from '@/core/storage/registry';
import { mediaRoot } from '@/core/storage/adapters/_shared/data-dir';

export const dynamic = 'force-dynamic';

/**
 * Serves uploaded media for backends that store bytes locally rather than
 * behind their own CDN.
 *
 * Deliberately conservative about what it will hand back:
 * - The key is resolved against the media directory and rejected if it escapes
 *   it, so `../../.env` is not a valid asset.
 * - Everything is served with `nosniff` and a non-executable content type, and
 *   SVG is sent as an attachment. An SVG rendered inline from your own origin
 *   can run script, which would be stored XSS against the site owner.
 */
/**
 * The same directory the adapters write to, from the same helper. It was its
 * own copy of the path expression, which meant an install with `OPB_DATA_DIR`
 * set — every Docker install — would have served 404 for an image it had
 * successfully stored.
 */
const mediaDir = () => mediaRoot();

const CONTENT_TYPES: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.pdf': 'application/pdf',
};

export async function GET(_req: Request, ctx: { params: Promise<{ key: string[] }> }) {
  const { key } = await ctx.params;
  const relative = key.join('/');

  const root = mediaDir();
  const resolved = path.resolve(root, relative);
  if (resolved !== root && !resolved.startsWith(root + path.sep)) {
    return new NextResponse('Not found', { status: 404 });
  }

  // Ask the adapter first: a hosted backend answers with its own URL and the
  // browser never comes back here.
  const remote = await (await getStorageAdapter()).media.resolveUrl(relative);
  if (remote && /^https?:\/\//i.test(remote)) {
    return NextResponse.redirect(remote);
  }

  let bytes: Buffer;
  try {
    bytes = await readFile(resolved);
  } catch {
    return new NextResponse('Not found', { status: 404 });
  }

  const ext = path.extname(resolved).toLowerCase();
  const contentType = CONTENT_TYPES[ext] ?? 'application/octet-stream';
  const isSvg = ext === '.svg';

  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      'Content-Type': isSvg ? 'image/svg+xml' : contentType,
      'X-Content-Type-Options': 'nosniff',
      'Content-Disposition': isSvg || ext === '.pdf' ? 'attachment' : 'inline',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
