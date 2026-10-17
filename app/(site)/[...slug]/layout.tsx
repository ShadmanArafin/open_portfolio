import { notFound } from 'next/navigation';
import { currentChannel, resolvePage } from '@/core/pages/read';
import { segmentsToSlug } from '@/core/pages/schema';

/**
 * The existence gate for built pages.
 *
 * A real `404` status needs the decision before anything streams. A
 * `loading.tsx` boundary flushes a `200` shell the moment its segment is
 * entered, so the check cannot live inside the page below the skeleton — it
 * sits here, above `[...slug]/loading.tsx`, and throws before any fallback is
 * flushed.
 *
 * The page below resolves again for its own guard; that is deliberate
 * belt-and-braces, and free, because every storage read is request-cached.
 */
export default async function PageGate({
  params,
  children,
}: {
  params: Promise<{ slug: string[] }>;
  children: React.ReactNode;
}) {
  const slug = segmentsToSlug((await params).slug);
  const resolved = await resolvePage(slug, await currentChannel());
  if (!resolved) notFound();
  return children;
}
