import 'server-only';
import type { ZipEntry } from '@/core/backup/zip';

/**
 * The published site as plain files, for any static host.
 *
 * The strongest version of "you own it": even if this project stopped
 * existing, or the database went, the site keeps working from a folder of
 * HTML on GitHub Pages, Netlify Drop, an S3 bucket or a USB stick. It is
 * built by visiting the site the way a stranger would — no session, so only
 * what is published — and saving each page as `path/index.html` beside every
 * same-origin script, stylesheet, font and image it references, at the same
 * paths, so the root-relative links inside keep working.
 *
 * What a folder of files cannot do, it says in the README it writes: the
 * contact form and newsletter need a server, and in-app navigation falls back
 * to ordinary page loads (which is all a static host serves).
 */

export interface StaticExportInput {
  /** Where the running site answers, e.g. `http://127.0.0.1:3000`. */
  origin: string;
  /** Root-relative page paths to save, e.g. `/`, `/work/harbour`. */
  pages: string[];
  /** Root-relative files to save as they are: feeds, sitemap, robots. */
  files?: string[];
  fetcher?: typeof fetch;
}

export interface StaticExportResult {
  entries: ZipEntry[];
  pages: number;
  assets: number;
  failed: string[];
}

const ATTRIBUTE = /\b(?:src|href|poster|content)="(\/[^"#]*)"/g;
const SRCSET = /\b(?:srcset|srcSet|imagesrcset)="([^"]+)"/g;
const CSS_URL = /url\(\s*['"]?([^'")\s]+)['"]?\s*\)/g;

/** Same-origin references worth saving: built assets and media, not routes. */
function isAsset(path: string): boolean {
  return (
    path.startsWith('/_next/static/') ||
    path.startsWith('/api/media/') ||
    /\.(?:css|js|mjs|woff2?|ttf|otf|png|jpe?g|webp|avif|gif|svg|ico|pdf|webmanifest|txt|xml)$/i.test(
      path.split('?')[0]
    )
  );
}

/**
 * Same-origin asset paths a page or stylesheet refers to. `base` is the
 * stylesheet's own path: the build writes its fonts as `url(../media/…)`,
 * relative to the stylesheet, so those resolve against it.
 */
export function referencedPaths(text: string, base = '/'): string[] {
  const found = new Set<string>();
  for (const match of text.matchAll(ATTRIBUTE)) found.add(match[1]);
  for (const match of text.matchAll(CSS_URL)) {
    const ref = match[1];
    if (ref.startsWith('/')) found.add(ref);
    else if (!/^[a-z][a-z0-9+.-]*:/i.test(ref) && !ref.startsWith('#')) {
      const resolved = new URL(ref, `http://site${base}`);
      found.add(resolved.pathname + resolved.search);
    }
  }
  for (const match of text.matchAll(SRCSET)) {
    for (const candidate of match[1].split(',')) {
      const url = candidate.trim().split(/\s+/)[0];
      if (url?.startsWith('/')) found.add(url);
    }
  }
  return [...found]
    .map((path) => path.replace(/&amp;/g, '&'))
    .filter((path) => !path.startsWith('//') && isAsset(path));
}

/** `/work/harbour` → `work/harbour/index.html`; `/` → `index.html`. */
export function pageFile(path: string): string {
  const clean = path.replace(/^\/+|\/+$/g, '');
  return clean ? `${clean}/index.html` : 'index.html';
}

/** An asset path as a file name in the archive, query string dropped. */
export function assetFile(path: string): string {
  return decodeURIComponent(path.split('?')[0].replace(/^\/+/, ''));
}

const README = `This folder is a static copy of a portfolio built with Open Portfolio.

Upload the whole folder to any static host (GitHub Pages, Netlify, Cloudflare
Pages, an S3 bucket, any web server) and point your domain at it. Every page is
folder/index.html, so addresses stay the same as on the live site.

What a static copy cannot do:
- the contact form and the newsletter sign-up need the running app;
- editing happens in the app — export again after you publish changes.
`;

export async function exportStaticSite(input: StaticExportInput): Promise<StaticExportResult> {
  const fetcher = input.fetcher ?? fetch;
  const entries: ZipEntry[] = [{ name: 'README.txt', data: new TextEncoder().encode(README) }];
  const failed: string[] = [];
  const queued = new Set<string>();
  const assets: string[] = [];
  const enqueue = (path: string) => {
    const key = path.split('#')[0];
    if (!queued.has(key)) {
      queued.add(key);
      assets.push(key);
    }
  };

  const get = async (path: string) => {
    try {
      const response = await fetcher(`${input.origin}${path}`, {
        redirect: 'follow',
        cache: 'no-store',
      });
      return response.ok ? response : null;
    } catch {
      return null;
    }
  };

  let pages = 0;
  for (const path of input.pages) {
    const response = await get(path);
    if (!response) {
      failed.push(path);
      continue;
    }
    const html = await response.text();
    entries.push({ name: pageFile(path), data: new TextEncoder().encode(html) });
    pages += 1;
    for (const ref of referencedPaths(html)) enqueue(ref);
  }

  // A 404 page for hosts that look for one.
  const missing = await fetcher(`${input.origin}/__static-export-not-found__`).catch(() => null);
  if (missing) {
    const html = await missing.text();
    entries.push({ name: '404.html', data: new TextEncoder().encode(html) });
    for (const ref of referencedPaths(html)) enqueue(ref);
  }

  for (const path of input.files ?? []) enqueue(path);

  // Stylesheets reference fonts and images of their own, so the list grows.
  for (let index = 0; index < assets.length; index++) {
    const path = assets[index];
    const response = await get(path);
    if (!response) {
      failed.push(path);
      continue;
    }
    const data = new Uint8Array(await response.arrayBuffer());
    entries.push({ name: assetFile(path), data });
    if (/\.css(\?|$)/i.test(path)) {
      for (const ref of referencedPaths(new TextDecoder().decode(data), path)) enqueue(ref);
    }
  }

  return { entries, pages, assets: assets.length, failed };
}
