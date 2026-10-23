import { getPublishedContent, getPublishedProjects } from '@/core/content/read';
import { resolveSiteUrl } from '@/core/content/metadata';
import { getIndexablePages } from '@/core/pages/read';
import { getPublicWriting, getWritingSettings } from '@/core/writing/read';
import { buildLlmsTxt } from '@/core/content/llms-txt';

/**
 * `/llms.txt` — the site as a short Markdown map, for AI agents.
 *
 * A proposed convention (llmstxt.org), not a search ranking signal: it gives a
 * model that is asked about the owner one clean page to read instead of a
 * themed layout to scrape. Built from the same published, indexable content as
 * the sitemap, and absent (404) when the owner has asked search engines to stay
 * away — the robots setting is the owner's answer to "may machines read this".
 */

export async function GET() {
  const content = await getPublishedContent();
  if (/noindex/i.test(content.seo?.robots ?? '')) {
    return new Response('Not found', { status: 404 });
  }
  const [projects, pages, writingSettings, writing] = await Promise.all([
    getPublishedProjects(),
    getIndexablePages(),
    getWritingSettings('published'),
    getPublicWriting('published'),
  ]);
  const body = buildLlmsTxt({
    content,
    siteUrl: resolveSiteUrl(content),
    projects,
    pages,
    writing: writingSettings.enabled ? writing.filter((entry) => !entry.seo.noindex) : [],
    writingLabel: writingSettings.label,
  });
  return new Response(body, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
}
