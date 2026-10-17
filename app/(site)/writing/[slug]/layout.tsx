import { notFound } from 'next/navigation';
import { currentChannel } from '@/core/pages/read';
import { getWritingSettings, resolveWriting } from '@/core/writing/read';

/**
 * The existence gate for a writing entry. Above the skeleton on purpose: a
 * `loading.tsx` boundary streams a `200` before the page runs, so a missing
 * slug — or a section that is switched off — has to be refused here or the
 * 404 status is already spent. See `[...slug]/layout.tsx` for the full
 * reasoning.
 */
export default async function WritingGate({
  params,
  children,
}: {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}) {
  const { slug } = await params;
  const channel = await currentChannel();
  const [settings, resolved] = await Promise.all([
    getWritingSettings(channel),
    resolveWriting(slug, channel),
  ]);
  if (!settings.enabled || !resolved) notFound();
  return children;
}
