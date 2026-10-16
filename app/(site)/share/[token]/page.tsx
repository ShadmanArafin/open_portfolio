import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { buildMetadata } from '@/core/content/metadata';
import { BlockList } from '@/core/blocks/registry';
import { blockContentFrom } from '@/core/blocks/content';
import { getContentForChannel } from '@/core/content/read';
import { getPages, resolveHomePage } from '@/core/pages/read';
import { isHomePage } from '@/core/pages/schema';
import { resolveShareToken } from '@/core/sharing/tokens';

/**
 * A page through somebody else's keyhole.
 *
 * Share links show the page's *draft* — that is the proofing use case: a
 * photographer walking a client through an unpublished gallery, a designer
 * past a stakeholder past a draft. Published content needs no key; it has an
 * address already. Every render carries noindex, the address never joins the
 * sitemap or the navigation, and the banner says plainly what this is, so a
 * forwarded link cannot be mistaken for the live site.
 */

export const dynamic = 'force-dynamic';

async function resolveSharedPage(token: string) {
  const match = await resolveShareToken(token);
  if (!match) return null;
  const pages = await getPages('draft');
  const page = pages.find((p) => p.id === match.pageId);
  if (!page) return null;
  const content = await getContentForChannel('draft');
  if (isHomePage(page)) {
    const home = await resolveHomePage('draft');
    if (!home) return null;
    return { page, blocks: home.blocks, content };
  }
  const { resolvePage } = await import('@/core/pages/read');
  const resolved = await resolvePage(page.slug, 'draft');
  if (!resolved) return null;
  return { page, blocks: resolved.blocks, content };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;
  const shared = await resolveSharedPage(token);
  if (!shared) return buildMetadata({ title: 'Not found' });
  return {
    ...(await buildMetadata({ title: shared.page.title || 'Shared preview' })),
    robots: 'noindex, nofollow',
  };
}

export default async function SharedPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const shared = await resolveSharedPage(token);
  if (!shared) notFound();

  return (
    <>
      <div
        role="status"
        className="sticky top-0 z-50 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 border-b border-border bg-surface-secondary px-4 py-2 text-center font-body text-sm text-text-secondary"
      >
        <span>
          <strong className="font-medium text-text-primary">Shared preview.</strong> Visible to
          anyone with this link, showing the current draft — not the live site.
        </span>
      </div>
      <BlockList blocks={shared.blocks} content={blockContentFrom(shared.content)} />
    </>
  );
}
