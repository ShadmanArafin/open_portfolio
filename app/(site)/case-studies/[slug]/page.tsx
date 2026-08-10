import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { buildMetadata } from '@/core/content/metadata';
import { getCaseStudyBySlug, getPublishedCaseStudies } from '@/core/content/read';
import { CaseStudyDetailPage } from '@/views/CaseStudyDetailPage';

export async function generateStaticParams() {
  try {
    const studies = await getPublishedCaseStudies();
    return studies.map((c) => ({ slug: c.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const study = await getCaseStudyBySlug(slug);
  if (!study) return buildMetadata({ title: 'Not found' });

  return buildMetadata({
    title: study.seoTitle || study.title,
    description: study.seoDescription || study.shortChallenge,
    path: `/case-studies/${study.slug}`,
    image: study.coverImage,
    type: 'article',
  });
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!(await getCaseStudyBySlug(slug))) notFound();
  return <CaseStudyDetailPage />;
}
