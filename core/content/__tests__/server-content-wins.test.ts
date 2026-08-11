import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

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

describe('the public site keeps what the server sent', () => {
  it('passes the server content into the provider', () => {
    const providers = read('app', '(site)', 'providers.tsx');
    expect(providers).toContain('initialData');
    expect(providers).toMatch(/<CMSProvider\s+initialData=\{initialData\}/);
  });

  it('reads that content on the server, not in the browser', () => {
    const layout = read('app', '(site)', 'layout.tsx');
    expect(layout).toContain('getContentForChannel');
    expect(layout).toContain('initialData={content}');
  });

  it('guards the local-store load on having been given server content', () => {
    const context = read('src', 'cms', 'context', 'CMSContext.tsx');
    expect(context).toContain('const serverProvided = initialData !== undefined');

    // Both effects, not one. The subscription is the same hazard: a stale local
    // write pushing itself into a page the server had already rendered.
    const guards = context.match(/if \(serverProvided\) return;/g) ?? [];
    expect(
      guards.length,
      'Both the init effect and the subscribe effect must bail out when the server supplied content'
    ).toBe(2);
  });

  it('leaves the admin alone', () => {
    // The admin passes no initialData on purpose: its local draft is the thing
    // being edited, and it must keep loading it.
    const adminApp = read('app', 'admin', '[[...slug]]', 'admin-app.tsx');
    expect(adminApp).toContain('<CMSProvider>');
    expect(adminApp).not.toContain('CMSProvider initialData');
  });
});
