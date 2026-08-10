import type { Metadata } from 'next';
import { buildMetadata } from '@/core/content/metadata';
import { HomePage } from '@/views/HomePage';

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({ path: '/' });
}

export default function Page() {
  return <HomePage />;
}
