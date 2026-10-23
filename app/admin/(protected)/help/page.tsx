import type { Metadata } from 'next';
import { getPublishedContentFresh } from '@/core/content/read';
import { resolveTransportWithStored } from '@/core/email/transport';
import { getStorageAdapter } from '@/core/storage/registry';
import { detectHost, summariseContent, type ServerDiagnostics } from '@/core/support/diagnostics';
import { APP_VERSION } from '@/core/version';
import { HelpClient } from './help-client';

export const metadata: Metadata = { title: 'Help' };

/**
 * Help and feedback, at its own address instead of inside the legacy
 * catch-all.
 *
 * The last legacy screen. The trunk server-renders everything that does not
 * need the network — the version, the storage backend, the host, the content
 * counts, and the forms themselves — by calling the same core helpers the
 * support endpoint calls, so the page and the endpoint cannot describe this
 * site differently. The island keeps the interactions: duplicate search,
 * filing through GitHub, the connection state, and the update check.
 *
 * The update check stays in the browser, deliberately, exactly as the legacy
 * screen had it. It is an unauthenticated call to GitHub that can take its
 * full eight-second timeout on a server with no route out, and the one page
 * somebody opens to report a problem should not itself hang on a request it
 * does not need to render.
 */
export default async function HelpPage() {
  const [adapter, content, transport] = await Promise.all([
    getStorageAdapter(),
    getPublishedContentFresh(),
    resolveTransportWithStored(),
  ]);

  const server: ServerDiagnostics = {
    version: APP_VERSION,
    adapter: adapter.id,
    host: detectHost(),
    nodeVersion: process.version,
    emailConfigured: transport.kind !== 'none',
  };

  return (
    <div className="grid gap-6" style={{ maxWidth: 'var(--measure)' }}>
      <div>
        <p className="m-0 font-mono text-xs uppercase tracking-widest text-text-muted">Help</p>
        <h1 className="font-display m-0 mt-1 text-3xl">Help and feedback</h1>
        <p className="m-0 mt-1 text-text-secondary">
          Report something broken, ask for something new, and see what changed in the latest
          version.
        </p>
      </div>

      <HelpClient server={server} content={summariseContent(content)} />
    </div>
  );
}
