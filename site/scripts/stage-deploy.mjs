import { cp, copyFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

/**
 * Prepares `out/` to be uploaded as a finished site.
 *
 * `next build` with `output: 'export'` produces plain files and nothing that
 * tells a host how to serve them, so two things have to be carried in:
 *
 *   vercel.static.json → out/vercel.json
 *     Framework detection is off for a pre-built upload, and with it off
 *     `cleanUrls` is not implied. Without it every deep link — /docs/get-started,
 *     every /alternatives/* page — is a 404 while the homepage looks fine.
 *
 *   .vercel/
 *     The project link. Without it the CLI treats each upload as a new project
 *     and creates one, rather than deploying this site again.
 *
 * This existed only as two hand-typed commands, which is how a deploy ends up
 * with the right files and the wrong config. Run `npm run deploy` instead.
 */

const here = dirname(fileURLToPath(import.meta.url));
const site = join(here, '..');
const out = join(site, 'out');

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

if (!(await exists(out))) {
  console.error('site/out does not exist. Run `npm run build` first.');
  process.exit(1);
}

await copyFile(join(site, 'vercel.static.json'), join(out, 'vercel.json'));

if (await exists(join(site, '.vercel'))) {
  await cp(join(site, '.vercel'), join(out, '.vercel'), { recursive: true });
} else {
  // Not fatal: a first-time deploy has nothing to copy and the CLI will ask.
  console.warn('No site/.vercel link found — the CLI will ask which project this is.');
}

console.log('Staged site/out. Deploying from there.');
