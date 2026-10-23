import type { Metadata } from 'next';
import Link from 'next/link';
import { listIntegrationViews } from '@/core/integrations';
import { getStorageAdapter } from '@/core/storage/registry';
import { resolveTransportWithStored } from '@/core/email/transport';
import { NEWSLETTER_DEFAULTS, type Subscriber } from '@/core/newsletter/schema';
import { NewsletterForm, RemoveSubscriber } from './newsletter-client';
import { screenToken } from '@/core/content/screen-token';

export const metadata: Metadata = {
  title: 'Newsletter',
  robots: { index: false, follow: false },
};

/**
 * The mailing list.
 *
 * Two halves that look alike and are not. The form settings are content —
 * drafted, published and exported with everything else, edited through a
 * server action on the draft. The list is not content: it never enters the
 * published snapshot and is read here over the owner's session.
 *
 * What this deliberately does not do is send. Broadcasting has obligations —
 * deliverability, bounces, list hygiene — and half of that leaves somebody
 * holding a list they cannot practically mail. The CSV export takes the list
 * somewhere built for it; it is a plain link, authenticated by the session
 * cookie, which is what makes it work on a phone. The "Sending it out" section
 * at the bottom says where that somewhere is, and reads its state from the
 * same registry the Services screen renders.
 */

function describe(sub: Subscriber): string {
  if (sub.status === 'confirmed') {
    return `Confirmed ${new Date(sub.confirmedAt ?? sub.requestedAt).toLocaleDateString()}`;
  }
  if (sub.status === 'pending') {
    return `Asked ${new Date(sub.requestedAt).toLocaleDateString()} — has not confirmed yet`;
  }
  return `Unsubscribed ${new Date(sub.unsubscribedAt ?? sub.requestedAt).toLocaleDateString()}`;
}

export default async function NewsletterPage() {
  const adapter = await getStorageAdapter();
  const [draftMeta, subscribers, transport, integrations] = await Promise.all([
    adapter.readSnapshotMeta('draft'),
    adapter.subscribers.list().catch(() => [] as Subscriber[]),
    resolveTransportWithStored().catch(() => ({ kind: 'none' as const })),
    listIntegrationViews().catch(() => []),
  ]);
  const listmonk = integrations.find((view) => view.id === 'listmonk');

  const settings = {
    ...NEWSLETTER_DEFAULTS,
    ...((draftMeta?.state.newsletter ?? {}) as Partial<typeof NEWSLETTER_DEFAULTS>),
  };
  const confirmed = subscribers.filter((s) => s.status === 'confirmed');
  const pending = subscribers.filter((s) => s.status === 'pending');
  const emailConfigured = transport.kind !== 'none';

  return (
    <div className="grid gap-6" style={{ maxWidth: 'var(--measure)' }}>
      <div>
        <p className="m-0 font-mono text-xs uppercase tracking-widest text-text-muted">
          Newsletter
        </p>
        <h1 className="font-display m-0 mt-1 text-3xl">Sign-ups</h1>
        <p className="m-0 mt-1 text-text-secondary">
          Collect email addresses on your site and take them anywhere. This does not send email — it
          gives you the list.
        </p>
      </div>

      {settings.enabled && !emailConfigured ? (
        <div role="alert" className="rounded-2xl border border-border bg-surface-secondary p-4">
          <p className="m-0 font-semibold">Sign-ups cannot work yet</p>
          <p className="m-0 mt-1 text-sm text-text-secondary">
            Confirming a sign-up means sending somebody a link, and no mail server is connected.
            Until one is, the form will tell visitors it is not working. Connect one under Services.
          </p>
        </div>
      ) : null}

      <section
        aria-label="The form on your site"
        className="grid gap-3 rounded-2xl border border-border p-4"
      >
        <div>
          <h2 className="m-0 text-xl">The form on your site</h2>
          <p className="m-0 text-sm text-text-secondary">
            It appears at the bottom of every page. Nothing shows until you switch it on.
          </p>
        </div>
        <NewsletterForm
          token={draftMeta ? screenToken(draftMeta.state, 'newsletter') : undefined}
          initial={{
            enabled: settings.enabled,
            pitch: settings.pitch,
            buttonLabel: settings.buttonLabel,
            pendingMessage: settings.pendingMessage,
          }}
        />
      </section>

      <section aria-label="Your list" className="grid gap-3 rounded-2xl border border-border p-4">
        <div>
          <h2 className="m-0 text-xl">Your list</h2>
          <p className="m-0 text-sm text-text-secondary">
            Confirmed addresses only in the export — those are the ones you may lawfully mail.
          </p>
        </div>

        <p className="m-0 text-sm text-text-secondary">
          {confirmed.length} confirmed
          {pending.length > 0 ? ` · ${pending.length} waiting to confirm` : ''}{' '}
          {confirmed.length > 0 ? (
            <a
              href="/api/admin/subscribers?format=csv"
              className="ml-2 rounded-full border border-border px-4 py-2 text-sm text-text-secondary no-underline"
              style={{ display: 'inline-flex', minHeight: 44, alignItems: 'center' }}
            >
              Download CSV
            </a>
          ) : null}
        </p>

        {subscribers.length === 0 ? (
          <p
            role="status"
            className="rounded-2xl border border-border p-6 text-center text-sm text-text-secondary"
          >
            Nobody has signed up yet — addresses appear here as people confirm them.
          </p>
        ) : (
          <ul className="m-0 grid list-none gap-2 p-0">
            {subscribers.map((sub) => (
              <li
                key={sub.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border p-3"
              >
                <span>
                  <strong className="block">{sub.email}</strong>
                  <span className="text-sm text-text-secondary">
                    {sub.status !== 'confirmed' ? `${sub.status} · ` : ''}
                    {describe(sub)}
                  </span>
                </span>
                <RemoveSubscriber id={sub.id} email={sub.email} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section
        aria-label="Sending it out"
        className="grid gap-3 rounded-2xl border border-border p-4"
      >
        <div>
          <h2 className="m-0 text-xl">Sending it out</h2>
          <p className="m-0 text-sm text-text-secondary">
            This screen collects; it never sends. To write to everyone at once, the addresses above
            go to something built for it.
          </p>
        </div>

        <ul className="m-0 grid list-none gap-3 p-0 text-sm text-text-secondary">
          <li>
            <strong className="block text-text-primary">Listmonk</strong>
            Free, open source and self-hosted, so your subscribers stay on your own server, and it
            runs beside the database this site already uses.{' '}
            {listmonk?.isConfigured ? (
              <>
                Its address is connected —{' '}
                <Link href="/admin/services">check it under Services</Link>.
              </>
            ) : (
              <>
                <Link href="/admin/services">Set it up under Services</Link>.
              </>
            )}
          </li>
          <li>
            <strong className="block text-text-primary">A sending tool you already use</strong>
            The columns match what Buttondown, Mailchimp and the rest expect on import, so moving
            the list is a file upload rather than a project.
          </li>
        </ul>

        <p className="m-0 text-sm text-text-secondary">
          Whichever sends it: mail only the confirmed addresses above, keep the unsubscribe link
          every tool adds, and send the first one to yourself before it goes to anyone else.
        </p>
      </section>
    </div>
  );
}
