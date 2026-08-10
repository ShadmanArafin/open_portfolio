import type { Metadata } from 'next';
import { buildMetadata } from '@/core/content/metadata';
import { getPublishedContent } from '@/core/content/read';
import { AboutPage } from '@/views/AboutPage';

export async function generateMetadata(): Promise<Metadata> {
  const content = await getPublishedContent();
  return buildMetadata({
    title: 'About',
    description: content.settings.aboutStoryParagraphs?.[0],
    path: '/about',
    image: content.settings.portraitPath,
  });
}

export default function Page() {
  return <AboutPage />;
}
