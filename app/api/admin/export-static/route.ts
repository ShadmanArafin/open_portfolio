import { NextResponse } from 'next/server';
import { requireOwner, UnauthorizedError } from '@/core/auth/guard';
import { clientKey, rateLimit } from '@/core/auth/ratelimit';
import { getPublishedProjects } from '@/core/content/read';
import { getRoutablePages } from '@/core/pages/read';
import { getPublicWriting, getWritingSettings } from '@/core/writing/read';
import { tagHref } from '@/core/writing/reading';
import { writeZip } from '@/core/backup/zip';
import { exportStaticSite } from '@/core/export/static-site';

export const maxDuration = 300;

/**
 * The published site as a folder of HTML, zipped. Owner-only.
 *
 * The pages are fetched from the running app without a session, so the copy
 * holds what a visitor sees and nothing from the draft. Where the app answers
 * comes from configuration, never from the request's Host header: a header is
 * the visitor's to set, and this route fetches whatever origin it is given.
 */

function internalOrigin(): string {
  const configured = process.env.OPB_INTERNAL_URL?.trim();
  if (configured) return configured.replace(/\/+$/, '');
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://127.0.0.1:${process.env.PORT || 3000}`;
}

export async function GET() {
  try {
    await requireOwner();
  } catch (err) {
    const status = err instanceof UnauthorizedError ? 401 : 500;
    return NextResponse.json({ ok: false, error: 'Not signed in.' }, { status });
  }

  const limit = await rateLimit(`export-static:${await clientKey()}`, 6, 60 * 60);
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, error: 'Too many exports in a row. Wait a while.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } }
    );
  }

  const [projects, pages, writingSettings, writing] = await Promise.all([
    getPublishedProjects(),
    getRoutablePages('published'),
    getWritingSettings('published'),
    getPublicWriting('published'),
  ]);

  const paths = new Set(['/', '/work', '/about', '/contact', '/cv']);
  for (const project of projects) paths.add(`/work/${project.slug}`);
  for (const page of pages) if (page.slug) paths.add(`/${page.slug}`);
  if (writingSettings.enabled) {
    paths.add('/writing');
    for (const entry of writing) {
      paths.add(`/writing/${entry.slug}`);
      for (const tag of entry.tags ?? []) paths.add(tagHref(tag));
    }
  }

  const result = await exportStaticSite({
    origin: internalOrigin(),
    pages: [...paths],
    files: [
      '/robots.txt',
      '/sitemap.xml',
      '/llms.txt',
      ...(writingSettings.enabled ? ['/writing/feed.xml'] : []),
    ],
  });

  if (result.pages === 0) {
    return NextResponse.json(
      {
        ok: false,
        error:
          'The site did not answer its own requests. Set OPB_INTERNAL_URL to the address the app listens on and try again.',
      },
      { status: 502 }
    );
  }

  if (result.failed.length > 0) {
    result.entries.push({
      name: 'MISSING.txt',
      data: new TextEncoder().encode(
        `These addresses could not be saved and are not in this folder:\n\n${result.failed.join('\n')}\n`
      ),
    });
  }

  const day = new Date().toISOString().slice(0, 10);
  return new NextResponse(Buffer.from(writeZip(result.entries)), {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="portfolio-static-${day}.zip"`,
      'Cache-Control': 'no-store',
    },
  });
}
