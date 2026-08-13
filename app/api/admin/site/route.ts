import { NextResponse } from 'next/server';
import { requireOwner, UnauthorizedError } from '@/core/auth/guard';
import { getPublishedContent } from '@/core/content/read';
import { resolveSiteUrl } from '@/core/content/metadata';

export const dynamic = 'force-dynamic';

/**
 * Where this site actually is on the internet, and who is hosting it.
 *
 * The admin never told anybody. Somebody could design a whole portfolio, press
 * Publish, and still have no idea what address to send people to — the one
 * thing they came here to get. The URL was known to the server the entire
 * time; nothing asked for it.
 *
 * `platform` exists so the guidance can be specific. "Add a domain in your
 * hosting dashboard" helps nobody; "Vercel → your project → Settings →
 * Domains" is something a person can follow.
 */
export async function GET() {
  try {
    await requireOwner();
  } catch (err) {
    const status = err instanceof UnauthorizedError ? 401 : 500;
    return NextResponse.json({ ok: false, error: 'Not signed in.' }, { status });
  }

  const content = await getPublishedContent();
  const url = resolveSiteUrl(content) ?? null;

  const platform = process.env.VERCEL
    ? 'vercel'
    : process.env.NETLIFY
      ? 'netlify'
      : process.env.CF_PAGES
        ? 'cloudflare'
        : 'self-hosted';

  // A `.vercel.app` address is the free one every one-click deploy starts on.
  // Distinguishing it from a domain somebody bought is what lets the screen
  // stop nagging once they have one.
  const isPlatformSubdomain = Boolean(
    url && /\.(vercel\.app|netlify\.app|pages\.dev)$/i.test(new URL(url).hostname)
  );

  return NextResponse.json({
    ok: true,
    url,
    platform,
    isPlatformSubdomain,
    // Whether anything has been published. A live URL that shows the starter
    // content is not the same as a finished site, and saying "you are live"
    // to somebody who has not published yet would be a lie by omission.
    hasPublished: Boolean(content.lastPublishedAt),
  });
}
