import type { Metadata } from 'next';
import { buildMetadata } from '@/core/content/metadata';
import { getPublishedContent } from '@/core/content/read';
import { AboutPage } from '@/views/AboutPage';
import { JsonLd } from '@/core/content/json-ld-script';
import { profilePageFor } from '@/core/content/structured-data';

export async function generateMetadata(): Promise<Metadata> {
  const content = await getPublishedContent();
  return buildMetadata({
    title: 'About',
    description: content.settings.aboutStoryParagraphs?.[0],
    path: '/about',
    image: content.settings.portraitPath,
  });
}

export default async function Page() {
  const content = await getPublishedContent();
  return (
    <>
      <JsonLd data={profilePageFor(content)} />
      <AboutPage />
    </>
  );
}
