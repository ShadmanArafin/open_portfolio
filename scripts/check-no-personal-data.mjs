#!/usr/bin/env node
/**
 * Fails if personal or client-owned content has crept back into the repository.
 *
 * This project began as one person's portfolio. Every trace of that had to be
 * removed before the repo could be public, and this check is what keeps it
 * removed — an accidental `git add` of a résumé or a client logo is exactly the
 * kind of mistake nobody notices in review.
 *
 * Run: node scripts/check-no-personal-data.mjs
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, extname, basename } from 'node:path';

const ROOT = process.cwd();

/** Case-insensitive substrings that must not appear in tracked files. */
const FORBIDDEN_TEXT = [
  'arshansayed',
  'arshan_sayed',
  'arshan-portfolio',
  'arshan_portfolio',
  'arshansayed.as@gmail.com',
  '01720065881',
  '8801720065881',
  'bankasia-bd',
  'apexfootwear',
  'switcchnest',
  'northernhandicraft',
  'mumuso.com.bd',
  'zaagshop.com',
  'nub.ac.bd',
];

/**
 * Bare given/family names, matched only as whole words. Kept separate because
 * "sayed" is a common word fragment and a substring match would be noisy.
 */
const FORBIDDEN_WORDS = ['arshan', 'sayed'];

/** Filenames that must never exist, whatever they contain. */
const FORBIDDEN_FILES = [
  /arshan/i,
  /^apex[_-]/i,
  /bank[_-]?asia/i,
  /mumuso/i,
  /zaagshop/i,
  /dr[_-]?wash/i,
];

const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'build', 'coverage', '.vite', '.next']);

/** Binary and lockfile types we do not scan for text. */
const SKIP_TEXT_SCAN = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.webp',
  '.avif',
  '.ico',
  '.pdf',
  '.woff',
  '.woff2',
  '.ttf',
  '.otf',
  '.eot',
  '.mp4',
  '.webm',
  '.zip',
  '.gz',
]);

/**
 * Files allowed to mention the old identifiers, and why.
 *
 * Every entry is a deliberate backward-compatibility shim. When the legacy
 * support is dropped at 1.0, delete the entry and the code together.
 */
const ALLOWED = new Map([
  ['scripts/check-no-personal-data.mjs', 'this file defines the denylist'],
  [
    'src/cms/services/cmsService.ts',
    'accepts the pre-rename export bundle format so old backups still import',
  ],
  [
    'src/cms/services/storage/localStore.ts',
    'reads the pre-rename database and localStorage keys once, so existing content survives the upgrade',
  ],
]);

const violations = [];

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const rel = relative(ROOT, full).replace(/\\/g, '/');

    if (statSync(full).isDirectory()) {
      if (!SKIP_DIRS.has(entry)) walk(full);
      continue;
    }

    if (ALLOWED.has(rel)) continue;

    const name = basename(full);
    for (const pattern of FORBIDDEN_FILES) {
      if (pattern.test(name)) {
        violations.push(`${rel}: filename matches ${pattern}`);
      }
    }

    if (SKIP_TEXT_SCAN.has(extname(full).toLowerCase())) continue;

    let content;
    try {
      content = readFileSync(full, 'utf8');
    } catch {
      continue; // unreadable or genuinely binary
    }

    const lower = content.toLowerCase();

    for (const needle of FORBIDDEN_TEXT) {
      if (lower.includes(needle)) {
        violations.push(`${rel}: contains "${needle}"`);
      }
    }

    for (const word of FORBIDDEN_WORDS) {
      const re = new RegExp(`\\b${word}\\b`, 'i');
      if (re.test(content)) {
        violations.push(`${rel}: contains the name "${word}"`);
      }
    }
  }
}

walk(ROOT);

if (violations.length > 0) {
  console.error('\nPersonal or client-owned content found:\n');
  for (const v of [...new Set(violations)].sort()) console.error(`  ${v}`);
  console.error(
    '\nThis repository is redistributed under MIT to anyone who forks it.\n' +
      'Demo content must be fictional, yours, or CC0 — see public/demo/LICENSE.md.\n' +
      'If a match is a false positive, add an exception in scripts/check-no-personal-data.mjs.\n'
  );
  process.exit(1);
}

console.log('No personal or client-owned content found.');
