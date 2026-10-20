import type { Metadata } from 'next';
import { listIntegrationViews, vaultAvailable } from '@/core/integrations';
import { ServicesBuilder } from './services-builder';

export const metadata: Metadata = { title: 'Services' };

/**
 * Optional services, at their own address instead of inside the legacy
 * catch-all.
 *
 * The same screen the legacy admin had — a card per service, all of them
 * described by the definition registry — but server-rendered and read through
 * the one projection in `core/integrations/views`, so the page and the
 * endpoint that writes cannot describe a service differently. Saving still
 * goes through that endpoint: it is where secrets are handled, and it is
 * already rate-limited and switched off in the demo.
 */
export default async function ServicesPage() {
  const integrations = await listIntegrationViews();
  const vault = vaultAvailable();

  return (
    <div className="grid gap-6" style={{ maxWidth: 'var(--measure)' }}>
      <div>
        <p className="m-0 font-mono text-xs uppercase tracking-widest text-text-muted">Services</p>
        <h1 className="font-display m-0 mt-1 text-3xl">Connected Services</h1>
        <p className="m-0 mt-1 text-text-secondary">
          Optional things this site can connect to. Everything here has a free plan, and the site
          keeps working without any of them.
        </p>
      </div>

      <ServicesBuilder initialIntegrations={integrations} initialVaultAvailable={vault} />
    </div>
  );
}
