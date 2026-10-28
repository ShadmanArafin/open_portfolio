import type { Block } from '@/core/blocks/schema';
import type { WritingEntry } from '@/core/writing/schema';

function makeId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Markdown & Substack / Medium Article Importer.
 *
 * Inspired by Ghost:
 * Parses frontmatter and markdown body into structured blocks,
 * allowing students to import their existing articles, dev logs,
 * or senior thesis write-ups directly into Open Portfolio.
 */

export interface ParsedMarkdownArticle {
  title: string;
  slug?: string;
  summary?: string;
  publishedAt?: string;
  tags?: string[];
  coverImage?: string;
  blocks: Block[];
}

/**
 * Parses YAML-style frontmatter between `---` boundaries.
 */
function parseFrontmatter(raw: string): { meta: Record<string, string>; content: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { meta: {}, content: raw };

  const yaml = match[1];
  const content = match[2];
  const meta: Record<string, string> = {};

  for (const line of yaml.split(/\r?\n/)) {
    const colonIdx = line.indexOf(':');
    if (colonIdx > 0) {
      const key = line.slice(0, colonIdx).trim();
      let value = line.slice(colonIdx + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      meta[key] = value;
    }
  }

  return { meta, content };
}

/**
 * Converts a raw markdown string into an array of structured BlockInstance items.
 */
export function markdownToBlocks(markdown: string): Block[] {
  const blocks: Block[] = [];
  const lines = markdown.split(/\r?\n/);
  let textBuffer: string[] = [];

  const flushText = () => {
    if (textBuffer.length > 0) {
      const joined = textBuffer.join('\n').trim();
      if (joined) {
        blocks.push({
          id: makeId('blk'),
          type: 'text',
          v: 1,
          props: { body: joined },
        });
      }
      textBuffer = [];
    }
  };

  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let codeLang = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code blocks ```
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        blocks.push({
          id: makeId('blk'),
          type: 'code',
          v: 1,
          props: {
            code: codeBuffer.join('\n'),
            language: codeLang || 'text',
          },
        });
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        flushText();
        inCodeBlock = true;
        codeLang = line.slice(3).trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    // Headings
    if (line.startsWith('### ')) {
      flushText();
      blocks.push({
        id: makeId('blk'),
        type: 'heading',
        v: 1,
        props: { heading: line.slice(4).trim(), level: 'h3' },
      });
      continue;
    }
    if (line.startsWith('## ')) {
      flushText();
      blocks.push({
        id: makeId('blk'),
        type: 'heading',
        v: 1,
        props: { heading: line.slice(3).trim(), level: 'h2' },
      });
      continue;
    }
    if (line.startsWith('# ')) {
      flushText();
      blocks.push({
        id: makeId('blk'),
        type: 'heading',
        v: 1,
        props: { heading: line.slice(2).trim(), level: 'h1' },
      });
      continue;
    }

    // Blockquotes
    if (line.startsWith('> ')) {
      flushText();
      blocks.push({
        id: makeId('blk'),
        type: 'quote',
        v: 1,
        props: { quote: line.slice(2).trim() },
      });
      continue;
    }

    // Standalone images ![alt](url)
    const imgMatch = line.match(/^!\[(.*?)\]\((.*?)\)$/);
    if (imgMatch) {
      flushText();
      blocks.push({
        id: makeId('blk'),
        type: 'image',
        v: 1,
        props: {
          url: imgMatch[2],
          alt: imgMatch[1] || 'Imported photo',
        },
      });
      continue;
    }

    // Regular paragraph lines
    textBuffer.push(line);
  }

  flushText();
  return blocks;
}

/**
 * Parses full markdown file content with frontmatter into a writing entry.
 */
export function parseMarkdownArticle(fileContent: string): ParsedMarkdownArticle {
  const { meta, content } = parseFrontmatter(fileContent);

  // Derive title from frontmatter or first # Heading
  let title = meta.title || meta.headline;
  let cleanContent = content;

  if (!title) {
    const firstHeading = content.match(/^#\s+(.+)$/m);
    if (firstHeading) {
      title = firstHeading[1].trim();
      cleanContent = content.replace(/^#\s+(.+)$/m, '');
    }
  }

  title = title || 'Untitled Article';

  const tags = meta.tags
    ? meta.tags
        .split(',')
        .map((t) => t.trim().replace(/^#/, ''))
        .filter(Boolean)
    : [];

  const blocks = markdownToBlocks(cleanContent);

  return {
    title,
    slug: meta.slug,
    summary: meta.summary || meta.description,
    publishedAt: meta.date || meta.publishedAt,
    tags,
    coverImage: meta.image || meta.cover || meta.coverImage,
    blocks,
  };
}

/**
 * Creates a WritingEntry from an imported markdown article.
 */
export function createEntryFromMarkdown(
  rawMarkdown: string,
  existingEntriesCount: number = 0
): WritingEntry {
  const parsed = parseMarkdownArticle(rawMarkdown);
  const now = new Date().toISOString();

  const slug =
    parsed.slug ||
    parsed.title
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, '-')
      .replace(/^-+|-+$/g, '') ||
    `article-${Date.now()}`;

  return {
    id: makeId('wri'),
    slug,
    title: parsed.title,
    summary: parsed.summary || '',
    publishedAt: parsed.publishedAt || now,
    status: 'published',
    sortOrder: existingEntriesCount + 1,
    tags: parsed.tags || [],
    featured: false,
    blocks: parsed.blocks,
    seo: {
      title: parsed.title,
      description: parsed.summary || '',
      image: parsed.coverImage || '',
      noindex: false,
    },
    updatedAt: now,
    revision: 0,
  };
}
