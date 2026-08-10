import type { Metadata } from 'next';
import { buildMetadata } from '@/core/content/metadata';
import { getPublishedContent } from '@/core/content/read';
import { WorkPage } from '@/views/WorkPage';

export async function generateMetadata(): Promise<Metadata> {
  const content = await getPublishedContent();
  const header = content.sections.find((s) => s.id === 'work-page');
  return buildMetadata({
    title: header?.label || 'Work',
    description: header?.description,
    path: '/work',
  });
}

export default function Page() {
  return <WorkPage />;
}
