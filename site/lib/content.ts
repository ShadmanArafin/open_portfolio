import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { marked } from 'marked';

/**
 * The help centre and the developer docs, from Markdown files on disk.
 *
 * **Why not Fumadocs**, which the research recommended and which was installed
 * and then removed. Two reasons, and the first is the load-bearing one:
 *
 * 1. The research is explicit that the help centre must look like the marketing
 *    site, because it needs pictures more than it needs code blocks. Running a
 *    second design system inside the same deployment to get MDX authoring means
 *    two sets of tokens, two dark-mode implementations and a seam a reader can
 *    see. The docs and the help centre share this one.
 * 2. It brings its own Tailwind build, an MDX pipeline and a generated source
 *    directory, to render files that are — deliberately — plain Markdown with
 *    no components in them.
 *
 * What that costs: no MDX, so no interactive examples inside a page. When one
 * is genuinely needed it can be a real component in the route rather than a
 * shortcode, and that is a better place for it anyway.
 *
 * Contributors write ordinary Markdown with three-line frontmatter. Nothing to
 * install, nothing to learn, and a missing page is a build error rather than a
 * 404 somebody finds later.
 */

export type Section = 'help' | 'docs';

export interface Doc {
  slug: string;
  title: string;
  /** One line, shown in listings and as the meta description. */
  summary: string;
  /** Which sidebar group it belongs to. */
  group: string;
  /** Sort order within the group. Lower first. */
  order: number;
  html: string;
  /** For the client-side filter. Plain text, lower-cased. */
  searchText: string;
}

const ROOT = path.join(process.cwd(), 'content');

/**
 * Raw HTML in a Markdown file is escaped rather than passed through.
 *
 * The rendered output goes into `dangerouslySetInnerHTML`, which is safe here
 * for the ordinary reason — the content is files in this repository, compiled
 * at build time, with no user input anywhere near it. But "in this repository"
 * is a weaker guarantee for a project that wants documentation pull requests
 * than it sounds: a `<script>` inside a helpful-looking help page is a very
 * easy thing to miss in a diff full of prose.
 *
 * So the door is shut at the renderer. Nothing in a `.md` file can emit markup;
 * a page that genuinely needs a component gets a real route instead.
 */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

marked.use({
  renderer: {
    html({ text }) {
      return escapeHtml(text);
    },
  },
  // Markdown's own escaping still applies to inline code and links; this only
  // removes the HTML passthrough.
  breaks: false,
  gfm: true,
});

/**
 * Frontmatter, parsed by hand.
 *
 * Four keys, all strings or numbers, no nesting, no arrays. A YAML parser for
 * that is a dependency that can only be a liability — and a malformed header
 * should fail the build loudly rather than be silently coerced.
 */
function parseFrontmatter(
  raw: string,
  file: string
): { meta: Record<string, string>; body: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) throw new Error(`${file} has no frontmatter block.`);

  const meta: Record<string, string> = {};
  for (const line of match[1].split(/\r?\n/)) {
    if (!line.trim()) continue;
    const at = line.indexOf(':');
    if (at === -1) throw new Error(`${file}: cannot read frontmatter line "${line}".`);
    meta[line.slice(0, at).trim()] = line
      .slice(at + 1)
      .trim()
      .replace(/^["']|["']$/g, '');
  }
  return { meta, body: match[2] };
}

function loadSection(section: Section): Doc[] {
  const dir = path.join(ROOT, section);
  const docs = readdirSync(dir)
    .filter((name) => name.endsWith('.md'))
    .map((name): Doc => {
      const file = path.join(dir, name);
      const { meta, body } = parseFrontmatter(readFileSync(file, 'utf8'), `${section}/${name}`);

      for (const key of ['title', 'summary', 'group', 'order']) {
        if (!meta[key])
          throw new Error(`${section}/${name} is missing "${key}" in its frontmatter.`);
      }

      return {
        slug: name.replace(/\.md$/, ''),
        title: meta.title,
        summary: meta.summary,
        group: meta.group,
        order: Number(meta.order),
        html: marked.parse(body, { async: false }) as string,
        searchText: `${meta.title} ${meta.summary} ${body}`.toLowerCase().replace(/\s+/g, ' '),
      };
    });

  // Group order comes from the order of first appearance once sorted, so a
  // group's position is set by its lowest-numbered page. One number per file,
  // and no second file listing the groups that can fall out of step with it.
  return docs.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
}

export function getDocs(section: Section): Doc[] {
  return loadSection(section);
}

export function getDoc(section: Section, slug: string): Doc | undefined {
  return loadSection(section).find((doc) => doc.slug === slug);
}

export interface Group {
  title: string;
  docs: Doc[];
}

export function getGroups(section: Section): Group[] {
  const groups: Group[] = [];
  for (const doc of getDocs(section)) {
    const existing = groups.find((group) => group.title === doc.group);
    if (existing) existing.docs.push(doc);
    else groups.push({ title: doc.group, docs: [doc] });
  }
  return groups;
}
