import type { CMSState, ProjectItem } from '@/cms/types/cms';
import type { PageRecord } from '@/core/pages/schema';
import type { WritingEntry } from '@/core/writing/schema';

/**
 * The llms.txt body: an H1 with the site's name, a one-line summary as a
 * blockquote, then H2 sections of links with short notes (llmstxt.org).
 * Links are absolute when the site knows its address, relative otherwise.
 */
export function buildLlmsTxt(input: {
  content: CMSState;
  siteUrl: string | undefined;
  projects: ProjectItem[];
  pages: PageRecord[];
  writing: WritingEntry[];
  writingLabel: string;
}): string {
  const { content, siteUrl, projects, pages, writing, writingLabel } = input;
  const href = (path: string) => `${siteUrl ?? ''}${path}`;
  const line = (text: string | undefined) => (text ?? '').replace(/\s+/g, ' ').trim();
  const item = (label: string, path: string, note?: string) =>
    `- [${line(label) || path}](${href(path)})${line(note) ? `: ${line(note)}` : ''}`;

  const name = line(content.settings?.fullName) || line(content.seo?.siteTitle) || 'Portfolio';
  const out: string[] = [`# ${name}`, ''];
  const summary = line(content.seo?.metaDescription) || line(content.settings?.role);
  if (summary) out.push(`> ${summary}`, '');
  const about = line(content.settings?.aboutStoryParagraphs?.[0]);
  if (about) out.push(about, '');

  out.push('## Pages', '');
  out.push(item('About', '/about', content.settings?.role));
  out.push(item('Work', '/work', 'Selected projects'));
  out.push(item('Contact', '/contact', 'How to get in touch'));
  for (const page of pages) out.push(item(page.title, `/${page.slug}`, page.seo?.description));
  out.push('');

  if (projects.length) {
    out.push('## Work', '');
    for (const project of projects) {
      out.push(
        item(project.title || project.name, `/work/${project.slug}`, project.shortDescription)
      );
    }
    out.push('');
  }

  if (writing.length) {
    out.push(`## ${line(writingLabel) || 'Writing'}`, '');
    for (const entry of writing)
      out.push(item(entry.title, `/writing/${entry.slug}`, entry.summary));
    out.push('');
  }

  return out.join('\n');
}
