import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * What the public site's client components can reach, followed import by
 * import from every `'use client'` file under `src/` and `app/(site)/`.
 *
 * Measured on 2026-10-23: every public page loaded 295 KB of gzipped
 * JavaScript, and the largest chunk was zod plus the page schemas, pulled in
 * because the navbar imported one predicate from the schema module. Nothing
 * a visitor's browser runs validates a schema, so nothing it loads should
 * import one. Type-only imports are erased at build time and are not followed.
 */

const ROOT = path.resolve(__dirname, '../..');
const FORBIDDEN = ['zod', 'nodemailer', 'sharp', 'server-only', '@simplewebauthn/server'];

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (name === 'node_modules' || name === '__tests__') continue;
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.(ts|tsx)$/.test(name)) out.push(full);
  }
  return out;
}

function resolve(from: string, spec: string): string | null {
  const base = spec.startsWith('@/')
    ? existsSync(path.join(ROOT, 'src', spec.slice(2)) + '.ts') ||
      existsSync(path.join(ROOT, 'src', spec.slice(2)) + '.tsx') ||
      existsSync(path.join(ROOT, 'src', spec.slice(2)))
      ? path.join(ROOT, 'src', spec.slice(2))
      : path.join(ROOT, spec.slice(2))
    : path.resolve(path.dirname(from), spec);
  for (const candidate of [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    `${base}/index.ts`,
    `${base}/index.tsx`,
  ]) {
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  }
  return null;
}

/** Value imports and re-exports: `import type` and `export type` are skipped. */
function imports(file: string): string[] {
  const source = readFileSync(file, 'utf8');
  const found: string[] = [];
  const re = /^\s*(?:import|export)\s+(?!type\b)(?:[^'";]*?\sfrom\s+)?['"]([^'"]+)['"]/gm;
  for (const match of source.matchAll(re)) found.push(match[1]);
  for (const match of source.matchAll(/import\(\s*['"]([^'"]+)['"]\s*\)/g)) found.push(match[1]);
  return found;
}

function reachable(entry: string): Map<string, string[]> {
  const seen = new Map<string, string[]>();
  const queue: [string, string[]][] = [[entry, [entry]]];
  while (queue.length) {
    const [file, trail] = queue.shift()!;
    if (seen.has(file)) continue;
    seen.set(file, trail);
    for (const spec of imports(file)) {
      if (spec.startsWith('.') || spec.startsWith('@/')) {
        const target = resolve(file, spec);
        if (target) queue.push([target, [...trail, target]]);
      } else {
        seen.set(`pkg:${spec}`, trail);
      }
    }
  }
  return seen;
}

const entries = [...walk(path.join(ROOT, 'src')), ...walk(path.join(ROOT, 'app/(site)'))].filter(
  (file) => /^['"]use client['"]/m.test(readFileSync(file, 'utf8'))
);

describe('the public client bundle', () => {
  it('finds the client components to check', () => {
    expect(entries.length).toBeGreaterThan(10);
  });

  it.each(FORBIDDEN)('never reaches %s', (pkg) => {
    const offenders: string[] = [];
    for (const entry of entries) {
      for (const [key, trail] of reachable(entry)) {
        if (key === `pkg:${pkg}` || key.startsWith(`pkg:${pkg}/`)) {
          offenders.push(trail.map((file) => path.relative(ROOT, file)).join(' → '));
        }
      }
    }
    expect([...new Set(offenders)]).toEqual([]);
  });
});

describe('icons', () => {
  it('render on the server: no client component imports react-icons', () => {
    const offenders: string[] = [];
    for (const entry of entries) {
      for (const [key, trail] of reachable(entry)) {
        if (key.startsWith('pkg:react-icons')) {
          offenders.push(trail.map((file) => path.relative(ROOT, file)).join(' → '));
        }
      }
    }
    expect([...new Set(offenders)]).toEqual([]);
  });

  it('no client component imports an animation library', () => {
    const offenders: string[] = [];
    for (const entry of entries) {
      for (const [key, trail] of reachable(entry)) {
        if (key === 'pkg:motion/react' || key.startsWith('pkg:framer-motion')) {
          offenders.push(trail.map((file) => path.relative(ROOT, file)).join(' → '));
        }
      }
    }
    expect([...new Set(offenders)]).toEqual([]);
  });
});
