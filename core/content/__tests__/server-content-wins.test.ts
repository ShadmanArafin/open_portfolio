import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

/**
 * The public site must render the server's content and keep it.
 *
 * This guards a bug that was live: `CMSProvider` loaded the *browser's* copy of
 * the content on mount and replaced what the server had sent. On the admin that
 * is the entire point — the editor's local draft is what they are editing. On
 * the public site it meant every visitor saw the owner's real site for a moment
 * and then watched it turn into the built-in demo content, because a first-time
 * visitor's local store is empty and seeds itself from `INITIAL_CMS_STATE`.
 *
 * It survived because anyone testing it had the right content in their own
 * browser already. It was found by taking a screenshot for the README and
 * noticing the name in the navigation was wrong while the page title was right.
 *
 * A behavioural test would need jsdom and a DOM testing library, neither of
 * which this project has, and adding both for one assertion is a worse trade
 * than this. So: a static check that the two halves of the guard are present.
 * It cannot prove the behaviour, and it will fail loudly if either half is
 * deleted — which is the actual regression to worry about.
 */

const ROOT = join(import.meta.dirname, '..', '..', '..');
const read = (...parts: string[]) => readFileSync(join(ROOT, ...parts), 'utf8');

const walk = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });

describe('the public site keeps what the server sent', () => {
  it('passes the server content into the provider', () => {
    const providers = read('app', '(site)', 'providers.tsx');
    expect(providers).toContain('initialData');
    expect(providers).toMatch(/<CMSProvider\s+initialData=\{initialData\}/);
  });

  it('reads that content on the server, not in the browser', () => {
    const layout = read('app', '(site)', 'layout.tsx');
    expect(layout).toContain('getContentForChannel');
    // Wrapped in `clientView` (which applies `publicView`), not passed raw. The
    // whole document used to be serialised into every public page, drafts
    // included, and then every page's blocks and every post in full.
    expect(layout).toContain('initialData={clientView(content, await siteNow())}');
  });

  it('has no browser-side store that could replace it', () => {
    // The bug was a local store loading after mount. That store is gone — the
    // provider is a plain read-only context now — and this keeps it gone: no
    // effect, no browser storage, and server content is a required prop.
    const context = read('src', 'cms', 'context', 'CMSContext.tsx');
    expect(context).not.toMatch(/useEffect|indexedDB|localStorage|sessionStorage/);
    expect(context).toMatch(/initialData: CMSState\b/);
    expect(context).not.toMatch(/initialData\?:/);
  });

  it('mounts the CMS provider in exactly one place, the public site', () => {
    // The legacy admin used to mount CMSProvider without initialData, on
    // purpose: its local draft was the thing being edited. That admin is gone
    // (docs/ADMIN-REWRITE.md) — every admin screen now reads and writes
    // through server actions, and nothing under app/admin touches the CMS
    // context. The provider has exactly one caller, the public site, and it
    // is always given server content. If a second mount appears, it owes this
    // test a reason.
    const hits: string[] = [];
    for (const top of ['app', 'src']) {
      for (const file of walk(join(ROOT, top))) {
        if (!/\.(ts|tsx)$/.test(file)) continue;
        // `<CMSProvider[\s>]` — not every mention: the type
        // `React.FC<CMSProviderProps>` contains the substring too.
        if (/<CMSProvider[\s>]/.test(readFileSync(file, 'utf8'))) {
          hits.push(relative(ROOT, file).split(sep).join('/'));
        }
      }
    }
    expect(hits).toEqual(['app/(site)/providers.tsx']);
  });
});
