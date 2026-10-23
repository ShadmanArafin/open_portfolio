import type { ProjectItem } from '@/cms/types/cms';
import type { PageRecord } from '@/core/pages/schema';
import type { WritingEntry } from '@/core/writing/schema';
import { textOfBlocks } from '@/core/blocks/text';

/**
 * Search across the site, on the server.
 *
 * A portfolio is tens of documents, not thousands, and they are already in
 * memory as one published snapshot — so an index service, a WASM search
 * library or a third-party widget would all be more machinery than the job.
 * Every word typed must appear somewhere in a result (title, summary or body);
 * a word in the title counts most. Accents and case are ignored, so "cafe"
 * finds "Café".
 */

export interface SearchDocument {
  kind: 'Page' | 'Project' | 'Writing';
  title: string;
  href: string;
  summary: string;
  body: string;
}

export interface SearchResult {
  kind: SearchDocument['kind'];
  title: string;
  href: string;
  /** The summary, or the passage around the first match in the body. */
  snippet: string;
}

/** The longest query read, and the most results shown. */
export const MAX_QUERY = 100;
export const MAX_RESULTS = 30;

const BODY_CHARS = 20_000;

export function fold(text: string): string {
  return text
    .normalize('NFKD')
    .replace(/\p{M}+/gu, '')
    .toLowerCase();
}

export function buildSearchIndex(input: {
  projects: ProjectItem[];
  pages: PageRecord[];
  writing: WritingEntry[];
}): SearchDocument[] {
  const join = (...parts: (string | string[] | undefined)[]) =>
    parts
      .flat()
      .filter((part): part is string => Boolean(part && part.trim()))
      .join('\n');

  return [
    ...input.pages.map((page) => ({
      kind: 'Page' as const,
      title: page.title || (page.slug ? `/${page.slug}` : 'Home'),
      href: page.slug ? `/${page.slug}` : '/',
      summary: page.seo.description ?? '',
      body: textOfBlocks(page.blocks, BODY_CHARS),
    })),
    ...input.projects.map((project) => ({
      kind: 'Project' as const,
      title: project.title,
      href: `/work/${project.slug}`,
      summary: project.shortDescription,
      body: join(
        project.company,
        project.category,
        project.role,
        project.deliverables,
        project.description,
        project.overview,
        project.challenge,
        textOfBlocks(project.story?.blocks ?? [], BODY_CHARS)
      ),
    })),
    ...input.writing.map((entry) => ({
      kind: 'Writing' as const,
      title: entry.title,
      href: `/writing/${entry.slug}`,
      summary: entry.summary ?? '',
      body: join(entry.tags, textOfBlocks(entry.blocks, BODY_CHARS)),
    })),
  ];
}

function snippetAround(body: string, word: string): string {
  const flat = body.replace(/\s+/g, ' ').trim();
  // Folding keeps lengths for Latin text (each letter loses its mark), so a
  // position found in the folded copy points at the same place in the original.
  const at = fold(flat).indexOf(word);
  if (at < 0) return flat.slice(0, 160);
  const start = Math.max(0, at - 60);
  const end = Math.min(flat.length, at + 100);
  return `${start > 0 ? '…' : ''}${flat.slice(start, end).trim()}${end < flat.length ? '…' : ''}`;
}

export function searchIndex(documents: SearchDocument[], query: string): SearchResult[] {
  const words = [...new Set(fold(query.slice(0, MAX_QUERY)).split(/[^\p{L}\p{N}]+/u))].filter(
    Boolean
  );
  if (words.length === 0) return [];

  const scored: { result: SearchResult; score: number; order: number }[] = [];
  documents.forEach((document, order) => {
    const title = fold(document.title);
    const summary = fold(document.summary);
    const body = fold(document.body);
    let score = 0;
    for (const word of words) {
      const inTitle = title.includes(word);
      const inSummary = summary.includes(word);
      const inBody = body.includes(word);
      if (!inTitle && !inSummary && !inBody) return;
      score += (inTitle ? 5 : 0) + (inSummary ? 2 : 0) + (inBody ? 1 : 0);
    }
    const firstInBody = words.find((word) => body.includes(word));
    const snippet =
      document.summary && words.some((word) => summary.includes(word))
        ? document.summary
        : firstInBody
          ? snippetAround(document.body, firstInBody)
          : document.summary || document.body.slice(0, 160);
    scored.push({
      result: { kind: document.kind, title: document.title, href: document.href, snippet },
      score,
      order,
    });
  });

  return scored
    .sort((a, b) => b.score - a.score || a.order - b.order)
    .slice(0, MAX_RESULTS)
    .map(({ result }) => result);
}
