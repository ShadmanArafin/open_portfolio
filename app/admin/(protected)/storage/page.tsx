import { connection } from 'next/server';
import type { Metadata } from 'next';
import { getStorageAdapter } from '@/core/storage/registry';
import { BACKEND_GUIDES, type BackendGuide } from '@/core/storage/guides';

export const metadata: Metadata = {
  title: 'Storage',
  robots: { index: false, follow: false },
};

/**
 * Where your content lives — what is running now, and what else you could
 * use. First screen of the App Router admin: fully server-rendered, no
 * client JavaScript beyond Next's own. The old client version keeps working
 * at this same URL until this route ships; specific routes win over the
 * legacy catch-all, so landing this file migrates the screen with no link
 * changing anywhere.
 *
 * This screen explains and does not switch. Which backend runs is decided by
 * which environment variables are present, because configuration is what
 * tells the app how to reach the database: a setting kept *in* the database
 * cannot be read before the database is reachable.
 */

interface Status {
  active: {
    id: string;
    displayName: string;
    worksOnEphemeralHosts: boolean;
    maxUploadBytes: number;
  } | null;
  health: { ok: boolean; detail: string; latencyMs: number };
}

async function readStatus(): Promise<Status> {
  try {
    const adapter = await getStorageAdapter();
    const health = await adapter.health();
    return {
      active: {
        id: adapter.id,
        displayName: adapter.displayName,
        worksOnEphemeralHosts: adapter.capabilities.worksOnEphemeralHosts,
        maxUploadBytes: adapter.capabilities.maxUploadBytes,
      },
      health: { ok: health.ok, detail: health.detail, latencyMs: health.latencyMs },
    };
  } catch (err) {
    // A backend that cannot even be constructed is the case this screen
    // exists for, so it answers rather than throwing.
    return {
      active: null,
      health: {
        ok: false,
        detail: err instanceof Error ? err.message : 'No storage backend could be reached.',
        latencyMs: 0,
      },
    };
  }
}

function Notice({
  kind,
  title,
  children,
}: {
  kind: 'error' | 'success' | 'info';
  title: string;
  children: React.ReactNode;
}) {
  const kinds = {
    error: 'border-danger bg-danger-subtle',
    success: 'border-border bg-surface-secondary',
    info: 'border-border bg-surface-secondary',
  } as const;
  return (
    <div
      role={kind === 'error' ? 'alert' : 'status'}
      className={`rounded-2xl border p-4 ${kinds[kind]}`}
    >
      <p className="m-0 font-semibold">{title}</p>
      <div className="mt-1 text-sm text-text-secondary">{children}</div>
    </div>
  );
}

function GuideCard({ guide, active }: { guide: BackendGuide; active: boolean }) {
  return (
    <details open={active} className="rounded-2xl border border-border bg-surface-primary p-4">
      <summary
        className="cursor-pointer font-semibold"
        style={{ minHeight: 44, display: 'flex', alignItems: 'center' }}
      >
        {guide.name}
        <span className="ml-3 rounded-full border border-border px-3 py-1 text-xs font-normal text-text-secondary">
          {active ? 'In use now' : guide.worksOnServerless ? 'Works anywhere' : 'Needs a disk'}
        </span>
      </summary>
      <div className="mt-3 grid gap-3 text-sm text-text-secondary">
        <p className="m-0">
          <strong className="text-text-primary">Best for: </strong>
          {guide.bestFor}
        </p>
        <p className="m-0">
          <strong className="text-text-primary">Free tier: </strong>
          {guide.freeTier} (checked {guide.verifiedOn} — these change, so confirm before relying on
          it.)
        </p>
        {guide.caveat ? (
          <p className="m-0">
            <strong className="text-text-primary">Worth knowing first: </strong>
            {guide.caveat}
          </p>
        ) : null}
        {guide.env.length > 0 ? (
          <div>
            <p className="m-0 font-semibold text-text-primary">What to set</p>
            <ul className="m-0 mt-1 grid gap-1 pl-5">
              {guide.env.map((variable) => (
                <li key={variable.name}>
                  <code>{variable.name}</code> — {variable.where}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <div>
          <p className="m-0 font-semibold text-text-primary">Setting it up</p>
          <ol className="m-0 mt-1 grid gap-1 pl-5">
            {guide.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>
        <p className="m-0">
          Moving between these loses nothing: export from General &amp; backup, point the new
          backend at your site, and import.
        </p>
      </div>
    </details>
  );
}

export default async function StoragePage() {
  // Live figures, measured now: never prerendered.
  await connection();
  const status = await readStatus();

  return (
    <div className="grid max-w-[measure] gap-5" style={{ maxWidth: 'var(--measure)' }}>
      <div>
        <h1 className="font-display m-0 text-3xl">Where your content lives</h1>
        <p className="m-0 mt-1 text-text-secondary">
          Your pages, your pictures and the messages people send you are all kept in one place. This
          is which one, and what else you could move to.
        </p>
      </div>

      {!status.health.ok ? (
        <Notice kind="error" title="Your storage is not answering">
          {status.health.detail} Publishing and uploads will fail until this is fixed. Nothing
          already published is lost.
        </Notice>
      ) : status.active ? (
        <Notice kind="success" title={`Running on ${status.active.displayName}`}>
          {status.health.detail} — answered in {status.health.latencyMs}ms.
          {status.active.worksOnEphemeralHosts
            ? ''
            : ' This one needs a machine whose disk survives a restart, so it is not suitable for Vercel, Netlify or Cloudflare.'}
        </Notice>
      ) : null}

      <Notice kind="info" title="You choose this by deploying, not from this screen">
        Whichever service&apos;s settings are present is the one that gets used. That is deliberate:
        the setting that says how to reach your database cannot itself live in the database. Each
        option below lists exactly what to set and where to find it.
      </Notice>

      {BACKEND_GUIDES.map((guide) => (
        <GuideCard key={guide.id} guide={guide} active={guide.id === status.active?.id} />
      ))}
    </div>
  );
}
