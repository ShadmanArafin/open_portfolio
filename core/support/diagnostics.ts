import type { CMSState } from '@/cms/types/cms';

/**
 * What a useful bug report contains.
 *
 * Most reports are unusable not because the person writing them was careless
 * but because nothing told them what mattered. Version, backend and host answer
 * three of the first four questions anyone triaging would ask, and the person
 * reporting cannot be expected to know that.
 *
 * Everything here is derived, shown to the person in full before it is sent,
 * and contains nothing they wrote: no page text, no addresses, no settings, no
 * secrets. Counts and names of features, never their contents.
 *
 * Pure so it can be tested, and so the rule about what it may contain is
 * checkable rather than a promise.
 */

export interface ServerDiagnostics {
  version: string;
  /** Storage backend id, e.g. `neon`. Never a connection string. */
  adapter: string;
  /** Where this is running: Vercel, Netlify, Cloudflare, or self-hosted. */
  host: string;
  nodeVersion: string;
  /** True when a mail server is reachable. Never which one, never credentials. */
  emailConfigured: boolean;
}

export interface ContentDiagnostics {
  pages: number;
  blocks: number;
  /** Which block types are in use, so a bug can be placed. Types only. */
  blockTypes: string[];
  projects: number;
  caseStudies: number;
  mediaItems: number;
  theme: { appearanceCustomised: boolean };
}

export interface ClientDiagnostics {
  userAgent: string;
  screen: string;
  language: string;
}

export interface RecentError {
  message: string;
  /** First line of the stack only. Enough to place it, short enough to read. */
  where?: string;
  at: string;
}

export interface Diagnostics {
  server: ServerDiagnostics;
  content: ContentDiagnostics;
  client?: ClientDiagnostics;
  errors?: RecentError[];
}

/** Which platform this is deployed on, from the variables each one sets. */
export function detectHost(env: NodeJS.ProcessEnv = process.env): string {
  if (env.VERCEL) return 'Vercel';
  if (env.NETLIFY) return 'Netlify';
  if (env.CF_PAGES) return 'Cloudflare Pages';
  if (env.RENDER) return 'Render';
  if (env.FLY_APP_NAME) return 'Fly.io';
  if (env.RAILWAY_ENVIRONMENT) return 'Railway';
  return 'Self-hosted';
}

/**
 * A summary of what is on the site, in counts.
 *
 * The list of block types is the useful part: it turns "the page looks wrong"
 * into "the page looks wrong and it uses gallery and stats", which is often the
 * whole diagnosis.
 */
export function summariseContent(content: CMSState): ContentDiagnostics {
  const pages = content.pages ?? [];
  const types = new Set<string>();
  let blocks = 0;

  for (const page of pages) {
    for (const block of page.blocks ?? []) {
      blocks++;
      const type = (block as { type?: unknown })?.type;
      if (typeof type === 'string') types.add(type);
    }
  }

  return {
    pages: pages.length,
    blocks,
    blockTypes: [...types].sort(),
    projects: content.projects?.length ?? 0,
    caseStudies: content.caseStudies?.length ?? 0,
    mediaItems: content.media?.length ?? 0,
    theme: {
      // Whether they changed the palette at all, not what they changed it to.
      appearanceCustomised: Boolean(
        content.appearance?.accentDark || content.appearance?.accentLight
      ),
    },
  };
}

/** The report body, as Markdown, ready for a GitHub issue. */
export function formatDiagnostics(diagnostics: Diagnostics): string {
  const { server, content, client, errors } = diagnostics;

  const lines = [
    '<details>',
    '<summary>Diagnostics (added automatically)</summary>',
    '',
    '| | |',
    '|---|---|',
    `| Version | ${server.version} |`,
    `| Storage | ${server.adapter} |`,
    `| Host | ${server.host} |`,
    `| Node | ${server.nodeVersion} |`,
    `| Email set up | ${server.emailConfigured ? 'yes' : 'no'} |`,
  ];

  if (client) {
    lines.push(
      `| Browser | ${client.userAgent} |`,
      `| Screen | ${client.screen} |`,
      `| Language | ${client.language} |`
    );
  }

  lines.push(
    '',
    `Pages: ${content.pages} · Blocks: ${content.blocks} · Projects: ${content.projects} · ` +
      `Case studies: ${content.caseStudies} · Media: ${content.mediaItems}`,
    '',
    content.blockTypes.length
      ? `Block types in use: ${content.blockTypes.join(', ')}`
      : 'No blocks in use yet.'
  );

  if (errors?.length) {
    lines.push('', '**Recent errors in the admin**', '', '```');
    for (const error of errors) {
      lines.push(`${error.at}  ${error.message}${error.where ? `\n    ${error.where}` : ''}`);
    }
    lines.push('```');
  }

  lines.push('', '</details>');
  return lines.join('\n');
}
