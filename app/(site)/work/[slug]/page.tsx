import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { buildMetadata } from '@/core/content/metadata';
import { getProjectBySlug, getPublishedProjects } from '@/core/content/read';
import { ProjectDetailPage } from '@/views/ProjectDetailPage';

/**
 * Pre-render the projects that exist at build time; anything added later is
 * rendered on demand and then cached. Wrapped so a storage failure produces a
 * fully dynamic site rather than a failed build — a paused free-tier database
 * must never be the reason a deploy goes red.
 */
export async function generateStaticParams() {
  try {
    const projects = await getPublishedProjects();
    return projects.map((p) => ({ slug: p.slug }));
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
  const project = await getProjectBySlug(slug);
  if (!project) return buildMetadata({ title: 'Not found' });

  return buildMetadata({
    title: project.seoTitle || project.title || project.name,
    description: project.seoDescription || project.shortDescription,
    path: `/work/${project.slug}`,
    image: project.images?.[0]?.url,
    type: 'article',
  });
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // Resolved on the server so a bad slug returns a real 404 status, which
  // matters for crawlers as much as for people.
  if (!(await getProjectBySlug(slug))) notFound();
  return <ProjectDetailPage />;
}
