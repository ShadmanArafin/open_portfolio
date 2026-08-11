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
import { execFileSync } from 'node:child_process';
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

/**
 * Only consulted by the no-git fallback below. `.opb` and `.remember` hold the
 * running instance's own content and a local agent log — neither is part of the
 * repository, and both would otherwise be full of false positives.
 */
const SKIP_DIRS = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
  'coverage',
  '.vite',
  '.next',
  '.opb',
  '.remember',
]);

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

/**
 * The files that could actually end up in the repository.
 *
 * `--cached` is everything tracked; `--others --exclude-standard` adds files
 * that are untracked but not ignored — the résumé somebody dropped into
 * `public/` and has not committed yet, which is precisely the mistake worth
 * catching before it is made.
 *
 * Ignored files are deliberately excluded. `.env.local` holds the maintainer's
 * own address and `.opb/` holds their own content; neither can ever be
 * redistributed, and flagging them taught contributors to run this check and
 * ignore what it said.
 *
 * Falls back to walking the directory when git is unavailable — a tarball, or a
 * CI image without git — because a check that silently passes is worse than one
 * that is occasionally noisy.
 */
function listCandidateFiles() {
  try {
    const out = execFileSync(
      'git',
      ['ls-files', '-z', '--cached', '--others', '--exclude-standard'],
      {
        cwd: ROOT,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      }
    );
    const files = out.split('\0').filter(Boolean);
    if (files.length > 0) return { files, source: 'git' };
  } catch {
    // Not a git checkout, or git is not installed.
  }

  const files = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) {
        if (!SKIP_DIRS.has(entry)) walk(full);
        continue;
      }
      files.push(relative(ROOT, full).replace(/\\/g, '/'));
    }
  };
  walk(ROOT);
  return { files, source: 'filesystem' };
}

function inspect(rel) {
  if (ALLOWED.has(rel)) return;

  const full = join(ROOT, rel);
  const name = basename(rel);

  for (const pattern of FORBIDDEN_FILES) {
    if (pattern.test(name)) {
      violations.push(`${rel}: filename matches ${pattern}`);
    }
  }

  if (SKIP_TEXT_SCAN.has(extname(rel).toLowerCase())) return;

  let content;
  try {
    content = readFileSync(full, 'utf8');
  } catch {
    return; // unreadable, genuinely binary, or deleted since git listed it
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

const { files, source } = listCandidateFiles();
for (const rel of files) inspect(rel);

if (violations.length > 0) {
  console.error('\nPersonal or client-owned content found:\n');
  for (const v of [...new Set(violations)].sort()) console.error(`  ${v}`);
  console.error(
    '\nThis repository is redistributed under MIT to anyone who forks it.\n' +
      'Demo content must be fictional, yours, or CC0 — see public/demo/LICENSE.md.\n' +
      'If the file is only ever local, add it to .gitignore. If a match is a\n' +
      'genuine false positive, add an exception in scripts/check-no-personal-data.mjs.\n'
  );
  process.exit(1);
}

console.log(
  `No personal or client-owned content found (${files.length} files, listed by ${source}).`
);
