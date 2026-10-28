import { parseMarkdownNote, type MarkdownResult, type ParsedNote } from './markdown';
import { createWritingEntry, type WritingEntry } from './schema';

/** The Writing screen's safe, preview-before-save Markdown import flow. */
export type ParsedMarkdownArticle = ParsedNote;

/** Keeps article import on the same limited, warning-producing parser as the UI. */
export function parseMarkdownArticle(fileName: string, rawMarkdown: string): MarkdownResult {
  return parseMarkdownNote(fileName, rawMarkdown);
}

/**
 * Turns a reviewed note into a local draft entry.
 *
 * The caller owns the ID and order so batch imports can settle collisions in
 * the preview before anything is persisted. Imported work is never published
 * as a side effect of parsing a file.
 */
export function createEntryFromMarkdown(
  note: ParsedNote,
  id: string,
  sortOrder: number
): WritingEntry {
  return {
    ...createWritingEntry(note.title),
    id,
    slug: note.slug,
    summary: note.summary,
    publishedAt: note.publishedAt,
    status: 'draft',
    sortOrder,
    tags: [...note.tags],
    featured: note.featured,
    blocks: note.blocks.map((block) => ({ ...block })),
    seo: {
      title: note.title,
      description: note.summary,
      noindex: false,
    },
  };
}

export type { MarkdownResult, ParsedNote };
