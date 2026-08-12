import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DocShell } from '@/components/doc-shell';
import { getDoc, getDocs, getGroups } from '@/lib/content';

export function generateStaticParams() {
  return getDocs('help').map((doc) => ({ slug: doc.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const doc = getDoc('help', (await params).slug);
  if (!doc) return {};
  return {
    title: doc.title,
    description: doc.summary,
    alternates: { canonical: `/help/${doc.slug}` },
  };
}

export default async function HelpArticle({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = getDoc('help', slug);
  if (!doc) notFound();

  return (
    <DocShell groups={getGroups('help')} basePath="/help" current={slug}>
      {/* The markdown is ours, in this repository, compiled at build time.
          There is no user input anywhere near it — which is the only reason
          this is not a sanitisation problem. */}
      <article className="md" dangerouslySetInnerHTML={{ __html: doc.html }} />
    </DocShell>
  );
}
