import type { Metadata } from 'next';
import { buildMetadata } from '@/core/content/metadata';
import { getPublishedContent } from '@/core/content/read';
import { CaseStudiesPage } from '@/views/CaseStudiesPage';

export async function generateMetadata(): Promise<Metadata> {
  const content = await getPublishedContent();
  const header = content.sections.find((s) => s.id === 'case-studies-page');
  return buildMetadata({
    title: header?.label || 'Case studies',
    description: header?.description,
    path: '/case-studies',
  });
}

export default function Page() {
  return <CaseStudiesPage />;
}
