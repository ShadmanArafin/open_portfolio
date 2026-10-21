import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { buildMetadata } from '@/core/content/metadata';
import { getContentForChannel, getProjectBySlug, getPublishedProjects } from '@/core/content/read';
import { publicView } from '@/core/content/sanitise';
import { currentChannel } from '@/core/pages/read';
import { BlockList, parsePage } from '@/core/blocks/registry';
import { blockContentFrom } from '@/core/blocks/content';
import { ProjectDetailPage } from '@/views/ProjectDetailPage';
import { JsonLd } from '@/core/content/json-ld-script';
import { breadcrumbsFor } from '@/core/content/structured-data';

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

  // The case-study story renders here, on the server, with the whole document
  // to draw on — a story block can list writing or work, which the client copy
  // of the content (`clientView`) no longer carries.
  const content = publicView(await getContentForChannel(await currentChannel()));
  const project = content.projects.find((candidate) => candidate.slug === slug);
  const blocks = project?.story?.blocks;
  const story =
    Array.isArray(blocks) && blocks.length > 0 ? (
      <BlockList blocks={parsePage(blocks)} content={blockContentFrom(content)} />
    ) : undefined;

  return (
    <>
      <JsonLd
        data={breadcrumbsFor(content, [
          { name: 'Work', path: '/work' },
          { name: project?.title || project?.name || slug, path: `/work/${slug}` },
        ])}
      />
      <ProjectDetailPage story={story} />
    </>
  );
}
