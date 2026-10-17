import { notFound } from 'next/navigation';
import { getCaseStudyBySlug } from '@/core/content/read';

/**
 * The existence gate for a case study. Above the skeleton on purpose: a
 * `loading.tsx` boundary streams a `200` before the page runs, so a missing
 * slug has to be refused here or the 404 status is already spent. See
 * `[...slug]/layout.tsx` for the full reasoning.
 */
export default async function CaseStudyGate({
  params,
  children,
}: {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}) {
  const { slug } = await params;
  if (!(await getCaseStudyBySlug(slug))) notFound();
  return children;
}
