import { MAX_SLUG_LENGTH, normaliseSlug } from '../pages/schema';

/**
 * Markdown, read into a piece of writing.
 *
 * The import path for somebody arriving with files rather than a database.
 * Static-site generators, and every blog export worth having, hand you `.md`
 * documents — front matter above a body — and without a reader for them this
 * product asks a person to retype their own work, which is where a switch
 * quietly stops happening.
 *
 * Dependency-free on purpose, and deliberately partial. A full Markdown
 * implementation is a build-time luxury and a runtime liability; what an
 * exported post actually contains is a small subset — headings, paragraphs,
 * lists, quotes, links, emphasis, code fences — so this reads that subset and
 * *reports* what it could not carry. A half-import a tool cannot see is how
 * somebody concludes the tool lies.
 *
 * It returns content, not records: ids, timestamps, positions and the order
 * number belong to the editor the piece is handed to, which also keeps these
 * functions deterministic and testable.
 */

/** Well under the server's `MAX_BLOCKS` of 120 — an import is not a backup. */
export const MAX_IMPORTED_BLOCKS = 60;

export interface ParsedBlock {
  type: 'richText' | 'quote';
  v: 1;
  props: Record<string, unknown>;
}

export interface ParsedNote {
  title: string;
  slug: string;
  summary: string;
  tags: string[];
  featured: boolean;
  publishedAt?: string;
  blocks: ParsedBlock[];
}

export type MarkdownResult =
  { ok: true; note: ParsedNote; warnings: string[] } | { ok: false; error: string };

/**
 * What the body contained that the blocks do not.
 *
 * Counted while reading rather than compared afterwards, because the
 * transformations are one-way: by the time the text is in `paragraphs` there is
 * no `![alt](url)` left to count.
 */
interface Tally {
  images: number;
  links: number;
  emphasis: number;
  html: number;
  lists: number;
  code: number;
  tables: number;
}

const emptyTally = (): Tally => ({
  images: 0,
  links: 0,
  emphasis: 0,
  html: 0,
  lists: 0,
  code: 0,
  tables: 0,
});

type Chunk =
  | { kind: 'heading'; text: string }
  | { kind: 'paragraph'; text: string }
  | { kind: 'list'; items: string[] }
  | { kind: 'quote'; text: string; attribution?: string }
  | { kind: 'code'; text: string };

/* ------------------------------------------------------------------- front */

function unquote(value: string): string {
  const trimmed = value.trim();
  if (trimmed.length >= 2) {
    const first = trimmed[0];
    const last = trimmed[trimmed.length - 1];
    if ((first === '"' || first === "'") && last === first) return trimmed.slice(1, -1);
  }
  return trimmed;
}

interface FrontMatter {
  present: boolean;
  fields: Map<string, string>;
  body: string;
}

/**
 * The `---` block at the top, as `key: value` pairs.
 *
 * Not YAML: a YAML parser is a dependency and a security surface, and the
 * fields a post actually declares — title, date, summary, tags, slug — are
 * scalars. One shape beyond scalars is supported because real files have it:
 * a key with its list underneath, as `tags:` followed by `- item` lines.
 * Nested maps and multi-line strings are dropped, not misread.
 */
function readFrontMatter(source: string): FrontMatter {
  const lines = source.split('\n');
  if ((lines[0] ?? '').trim() !== '---') return { present: false, fields: new Map(), body: source };

  const end = lines.findIndex((line, index) => index > 0 && line.trim() === '---');
  if (end === -1) return { present: false, fields: new Map(), body: source };

  const fields = new Map<string, string>();
  let key = '';
  const listItems: string[] = [];
  const flushList = () => {
    if (key && listItems.length > 0) fields.set(key, listItems.join(', '));
    listItems.length = 0;
  };

  for (const line of lines.slice(1, end)) {
    const pair = /^([A-Za-z0-9_-]+)\s*:\s*(.*)$/.exec(line);
    if (pair) {
      flushList();
      key = pair[1].toLowerCase();
      const value = pair[2].trim();
      if (value) fields.set(key, unquote(value));
      continue;
    }
    const item = /^\s*-\s+(.*)$/.exec(line);
    if (item && key) listItems.push(unquote(item[1]));
  }
  flushList();

  return { present: true, fields, body: lines.slice(end + 1).join('\n') };
}

/* ------------------------------------------------------------------- inline */

/**
 * One line of text, with the inline markers taken off.
 *
 * Everything here keeps the words and drops the markup, because a paragraph in
 * a block is plain text: a surviving `**` renders as literal asterisks, which
 * is worse than the emphasis being lost. Links are the exception — the address
 * is content, so it stays, in brackets after its text.
 */
function inline(source: string, tally: Tally): string {
  let text = source;

  text = text.replace(/!\[[^\]]*\]\([^)]*\)/g, () => {
    tally.images += 1;
    return '';
  });
  text = text.replace(/\[([^\]]+)\]\(([^)\s]+)[^)]*\)/g, (_match, label: string, url: string) => {
    tally.links += 1;
    return `${label} (${url})`;
  });
  text = text.replace(/`([^`]+)`/g, (_match, code: string) => {
    tally.code += 1;
    return code;
  });
  text = text.replace(/\*\*([^*]+)\*\*/g, (_match, inner: string) => {
    tally.emphasis += 1;
    return inner;
  });
  text = text.replace(/__([^_]+)__/g, (_match, inner: string) => {
    tally.emphasis += 1;
    return inner;
  });
  text = text.replace(
    /(^|[^\w])\*([^*\n]+)\*(?=[^\w]|$)/g,
    (_match, before: string, inner: string) => {
      tally.emphasis += 1;
      return `${before}${inner}`;
    }
  );
  text = text.replace(
    /(^|[^\w])_([^_\n]+)_(?=[^\w]|$)/g,
    (_match, before: string, inner: string) => {
      tally.emphasis += 1;
      return `${before}${inner}`;
    }
  );
  text = text.replace(/~~([^~]+)~~/g, (_match, inner: string) => {
    tally.emphasis += 1;
    return inner;
  });
  text = text.replace(/<[^>]+>/g, () => {
    tally.html += 1;
    return '';
  });

  return text.trim();
}

/* -------------------------------------------------------------------- body */

const headingLine = /^#{1,6}\s+(.*)$/;
const quoteLine = /^\s*>\s?(.*)$/;
const listItemLine = /^\s*(?:[-*+]|\d+[.)])\s+(.*)$/;
const thematicBreak = /^(?:[-*_]\s*){3,}$/;

/**
 * A quote's attribution, when it is set off by a dash.
 *
 * Only the em and en dash: `- Author` is indistinguishable from a list item
 * inside a quote, and guessing wrong moves a sentence out of the quote and
 * into a byline. The unambiguous form keeps the feature honest.
 */
function splitAttribution(lines: string[]): { text: string; attribution?: string } {
  if (lines.length > 1) {
    const last = lines[lines.length - 1].trim();
    const match = /^[—–]\s*(.+)$/.exec(last);
    if (match && match[1].length <= 80) {
      return { text: lines.slice(0, -1).join(' ').trim(), attribution: match[1].trim() };
    }
  }
  return { text: lines.join(' ').trim() };
}

function toChunks(body: string, tally: Tally): Chunk[] {
  const lines = body.split('\n');
  const chunks: Chunk[] = [];
  let paragraph: string[] = [];
  let i = 0;

  const flush = () => {
    if (paragraph.length === 0) return;
    const text = inline(paragraph.join(' '), tally);
    paragraph = [];
    // A paragraph that was only an image, or only HTML, cleans to nothing.
    // Dropping it here keeps empty strings out of `paragraphs`, where they
    // would render as blank space between two real paragraphs.
    if (text) chunks.push({ kind: 'paragraph', text });
  };

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed === '') {
      flush();
      i += 1;
      continue;
    }

    if (trimmed.startsWith('```') || trimmed.startsWith('~~~')) {
      const fence = trimmed.slice(0, 3);
      const code: string[] = [];
      i += 1;
      while (i < lines.length && !lines[i].trim().startsWith(fence)) {
        code.push(lines[i]);
        i += 1;
      }
      i += 1;
      flush();
      const text = code.join('\n').trim();
      if (text) {
        tally.code += 1;
        chunks.push({ kind: 'code', text });
      }
      continue;
    }

    const heading = headingLine.exec(trimmed);
    if (heading) {
      flush();
      const text = inline(heading[1].replace(/#+\s*$/, '').trim(), tally);
      if (text) chunks.push({ kind: 'heading', text });
      i += 1;
      continue;
    }

    if (thematicBreak.test(trimmed)) {
      flush();
      i += 1;
      continue;
    }

    if (quoteLine.test(line)) {
      flush();
      const quoteLines: string[] = [];
      while (i < lines.length) {
        const match = quoteLine.exec(lines[i]);
        if (!match) break;
        quoteLines.push(match[1]);
        i += 1;
      }
      const { text, attribution } = splitAttribution(quoteLines);
      const cleaned = inline(text, tally);
      if (cleaned) {
        chunks.push({
          kind: 'quote',
          text: cleaned,
          attribution: attribution ? inline(attribution, tally) : undefined,
        });
      }
      continue;
    }

    if (listItemLine.test(line)) {
      flush();
      const items: string[] = [];
      while (i < lines.length) {
        const match = listItemLine.exec(lines[i]);
        if (!match) break;
        const text = inline(match[1].trim(), tally);
        if (text) items.push(text);
        i += 1;
      }
      if (items.length > 0) {
        tally.lists += 1;
        chunks.push({ kind: 'list', items });
      }
      continue;
    }

    if (/^\s*\|.*\|\s*$/.test(line)) tally.tables += 1;
    paragraph.push(trimmed);
    i += 1;
  }

  flush();
  return chunks;
}

/**
 * Chunks, grouped into blocks.
 *
 * A heading opens a block and takes the paragraphs under it, which is how the
 * same document reads in the editor — one heading, its text, one outline row.
 * A quote is its own block because the block system has a real one: stripping
 * a quotation into a paragraph would lose the markup a screen reader announces.
 */
function toBlocks(chunks: Chunk[]): { blocks: ParsedBlock[]; truncated: boolean } {
  const blocks: ParsedBlock[] = [];
  let heading: string | null = null;
  let paragraphs: string[] = [];
  let truncated = false;

  const flush = () => {
    if (paragraphs.length === 0) return;
    if (blocks.length >= MAX_IMPORTED_BLOCKS) {
      truncated = true;
      heading = null;
      paragraphs = [];
      return;
    }
    blocks.push({
      type: 'richText',
      v: 1,
      props: heading ? { heading, paragraphs } : { paragraphs },
    });
    heading = null;
    paragraphs = [];
  };

  for (const chunk of chunks) {
    if (chunk.kind === 'heading') {
      flush();
      heading = chunk.text;
      continue;
    }
    if (chunk.kind === 'quote') {
      flush();
      if (blocks.length >= MAX_IMPORTED_BLOCKS) {
        truncated = true;
        break;
      }
      blocks.push({
        type: 'quote',
        v: 1,
        props: chunk.attribution
          ? { quote: chunk.text, attribution: chunk.attribution }
          : { quote: chunk.text },
      });
      continue;
    }
    if (chunk.kind === 'list') {
      // The block system has no list block yet: an item becomes its own
      // paragraph with a bullet, which reads like a list and can be edited
      // into whatever the owner actually wants.
      paragraphs.push(...chunk.items.map((item) => `• ${item}`));
      continue;
    }
    paragraphs.push(chunk.text);
  }

  flush();
  return { blocks, truncated };
}

/* ------------------------------------------------------------------- fields */

function parseTags(raw: string): string[] {
  const tags: string[] = [];
  for (const part of raw.replace(/[[\]]/g, ' ').split(/[,;]/)) {
    const tag = unquote(part).slice(0, 30).trim();
    if (tag && !tags.includes(tag)) tags.push(tag);
    if (tags.length >= 20) break;
  }
  return tags;
}

function toIsoDate(raw: string): string | null {
  if (!raw) return null;
  const time = Date.parse(raw);
  return Number.isFinite(time) ? new Date(time).toISOString() : null;
}

function slugFrom(input: string): string {
  const segments = normaliseSlug(input).split('/').filter(Boolean);
  return (segments[segments.length - 1] ?? '').slice(0, MAX_SLUG_LENGTH).replace(/-+$/, '');
}

/* -------------------------------------------------------------------- main */

/**
 * Notes, with addresses that do not collide.
 *
 * Two exports of the same blog routinely want the same slug — a post exported
 * twice, or two posts both called "Notes" — and the server refuses a save with
 * two pieces sharing an address, so a batch that collides would mean a save
 * that explains nothing. The clash is settled here, where the preview can show
 * it: the second one keeps its words and takes `-2`.
 */
export function uniqueSlugs(
  notes: ParsedNote[],
  taken: string[]
): { notes: ParsedNote[]; renamed: number } {
  const used = new Set(taken.map((slug) => slugFrom(slug)).filter(Boolean));
  const out: ParsedNote[] = [];
  let renamed = 0;

  for (const note of notes) {
    const base = note.slug || 'untitled';
    let slug = base;
    for (let n = 2; used.has(slug); n += 1) slug = `${base}-${n}`;
    if (slug !== base) renamed += 1;
    used.add(slug);
    out.push(slug === note.slug ? note : { ...note, slug });
  }

  return { notes: out, renamed };
}

export function parseMarkdownNote(fileName: string, raw: string): MarkdownResult {
  if (!raw.trim()) return { ok: false, error: 'That file is empty.' };

  const tally = emptyTally();
  const warnings: string[] = [];

  const source = raw.replace(/\r\n?/g, '\n');
  const { present, fields, body } = readFrontMatter(source);

  let bodyText = body;
  let title = unquote(fields.get('title') ?? '').trim();

  if (!title) {
    // A leading `# Heading` is a title by convention, in every exporter that
    // does not write front matter. Only the *first* line, so a heading further
    // down stays a heading.
    const lines = bodyText.split('\n');
    const first = lines.findIndex((line) => line.trim() !== '');
    const match = first >= 0 ? headingLine.exec(lines[first].trim()) : null;
    if (match) {
      title = inline(match[1].replace(/#+\s*$/, '').trim(), tally);
      lines.splice(first, 1);
      bodyText = lines.join('\n');
    } else {
      title = fileName
        .replace(/\.[^.]+$/, '')
        .replace(/[-_]+/g, ' ')
        .trim();
    }
  }

  const dateRaw =
    fields.get('date') ??
    fields.get('published') ??
    fields.get('publishedat') ??
    fields.get('published_at') ??
    fields.get('created') ??
    '';
  const publishedAt = dateRaw ? (toIsoDate(dateRaw) ?? undefined) : undefined;
  if (dateRaw && !publishedAt) {
    warnings.push(`The date “${dateRaw}” could not be read, so the piece carries no date.`);
  }

  const { blocks, truncated } = toBlocks(toChunks(bodyText, tally));

  if (!title && blocks.length === 0) {
    return { ok: false, error: 'That file has no title and no text to import.' };
  }

  if (!present) {
    warnings.push('No front matter — the title came from the first heading or the file name.');
  }
  if (tally.images > 0) {
    warnings.push(
      tally.images === 1
        ? 'One image was left out. Add it from your media library when you review the piece.'
        : `${tally.images} images were left out. Add them from your media library when you review the piece.`
    );
  }
  if (tally.lists > 0) {
    warnings.push('Lists became bullet paragraphs — there is no list block to map them onto yet.');
  }
  if (tally.emphasis > 0) {
    warnings.push('Bold and italic formatting is not carried over. The words are.');
  }
  if (tally.code > 0) warnings.push('Code became plain text.');
  if (tally.tables > 0) warnings.push('Tables became plain text.');
  if (tally.html > 0) warnings.push('HTML tags were removed.');
  if (tally.links > 0) {
    warnings.push('Links keep their address in brackets after the text, so it survives the move.');
  }
  if (truncated) {
    warnings.push(
      `Only the first ${MAX_IMPORTED_BLOCKS} blocks were read — the rest of the file is still yours to bring over by hand.`
    );
  }

  return {
    ok: true,
    note: {
      title: title.slice(0, 300),
      slug:
        slugFrom(fields.get('slug') ?? fields.get('permalink') ?? fields.get('url') ?? title) ||
        'untitled',
      summary: unquote(
        fields.get('summary') ?? fields.get('description') ?? fields.get('excerpt') ?? ''
      )
        .trim()
        .slice(0, 2000),
      tags: parseTags(
        fields.get('tags') ?? fields.get('categories') ?? fields.get('keywords') ?? ''
      ),
      featured: /^(true|yes|1|on)$/i.test(unquote(fields.get('featured') ?? '')),
      ...(publishedAt ? { publishedAt } : {}),
      blocks,
    },
    warnings,
  };
}
