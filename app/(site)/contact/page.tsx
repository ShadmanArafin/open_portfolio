import type { Metadata } from 'next';
import { buildMetadata } from '@/core/content/metadata';
import { getPublishedContent } from '@/core/content/read';
import { ContactPage } from '@/views/ContactPage';

export async function generateMetadata(): Promise<Metadata> {
  const content = await getPublishedContent();
  const header = content.sections.find((s) => s.id === 'contact-page');
  return buildMetadata({
    title: header?.label || 'Contact',
    description: header?.description,
    path: '/contact',
  });
}

export default function Page() {
  return <ContactPage />;
}
