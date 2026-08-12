import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DocShell } from '@/components/doc-shell';
import { getDoc, getDocs, getGroups } from '@/lib/content';

export function generateStaticParams() {
  return getDocs('docs').map((doc) => ({ slug: doc.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const doc = getDoc('docs', (await params).slug);
  if (!doc) return {};
  return {
    title: doc.title,
    description: doc.summary,
    alternates: { canonical: `/docs/${doc.slug}` },
  };
}

export default async function DocsArticle({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = getDoc('docs', slug);
  if (!doc) notFound();

  return (
    <DocShell groups={getGroups('docs')} basePath="/docs" current={slug}>
      {/* Markdown from this repository, compiled at build time, with raw HTML
          escaped by the renderer — see `lib/content.ts`. No user input reaches
          this, and a documentation pull request cannot introduce markup. */}
      <article className="md" dangerouslySetInnerHTML={{ __html: doc.html }} />
    </DocShell>
  );
}
