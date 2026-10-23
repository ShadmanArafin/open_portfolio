import type { Metadata } from 'next';
import { buildMetadata } from '@/core/content/metadata';
import { getPublishedContent } from '@/core/content/read';
import { FaWhatsapp } from 'react-icons/fa6';
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
  return (
    <ContactPage
      whatsappIcon={
        <FaWhatsapp className="w-4 h-4 transition-transform duration-200 group-hover:scale-105" />
      }
    />
  );
}
