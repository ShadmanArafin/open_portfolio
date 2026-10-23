import type { Metadata } from 'next';
import Link from 'next/link';
import { getStorageAdapter } from '@/core/storage/registry';
import { PushNotifications } from '../_components/push-notifications';
import { DeleteMessage, ReadToggle } from './message-actions';

export const metadata: Metadata = {
  title: 'Messages',
  robots: { index: false, follow: false },
};

/**
 * Inbox: enquiries beside a reading pane, server-rendered.
 *
 * Selection rides the URL (`?selected=`), so the back button and a shared
 * screen both work and no selection state can desync. Marking read is
 * explicit — a button in the pane — rather than a side effect of looking,
 * which the old screen did and which made "unread" mean "not yet clicked".
 */

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ selected?: string }>;
}) {
  const adapter = await getStorageAdapter();
  const messages = await adapter.messages.list();
  const selectedId = (await searchParams).selected;
  const selected = messages.find((m) => m.id === selectedId) ?? null;

  const replyHref = (msg: (typeof messages)[number]) =>
    `mailto:${msg.email}?subject=${encodeURIComponent(`Re: your enquiry (${msg.projectType})`)}&body=${encodeURIComponent(`Hi ${msg.name},\n\nThanks for reaching out.\n\nBest,\n`)}`;

  return (
    <div className="grid gap-5" style={{ maxWidth: 'var(--measure)' }}>
      <div>
        <p className="m-0 font-mono text-xs uppercase tracking-widest text-text-muted">Inbox</p>
        <h1 className="font-display m-0 mt-1 text-3xl">Messages ({messages.length})</h1>
        <p className="m-0 mt-1 text-text-secondary">
          Enquiries sent through the contact form. Reply opens your email client.
        </p>
      </div>

      {messages.length > 0 ? <PushNotifications /> : null}

      {messages.length === 0 ? (
        <p
          role="status"
          className="rounded-2xl border border-border p-6 text-center text-sm text-text-secondary"
        >
          No messages yet — enquiries from the contact form arrive here.
        </p>
      ) : (
        <div
          className="grid items-start gap-4"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}
        >
          <ul aria-label="Enquiries" className="m-0 grid list-none gap-2 p-0">
            {messages.map((msg) => {
              const isSelected = msg.id === selected?.id;
              return (
                <li key={msg.id}>
                  <Link
                    href={`/admin/messages?selected=${encodeURIComponent(msg.id)}`}
                    aria-current={isSelected ? 'true' : undefined}
                    className={`block rounded-2xl border p-3 no-underline ${isSelected ? 'border-text-primary' : 'border-border'}`}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <strong className="text-text-primary">{msg.name}</strong>
                      {msg.status === 'unread' ? (
                        <span className="rounded-full border border-border px-2 py-0.5 text-xs text-text-secondary">
                          New
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-1 block text-sm text-text-secondary">
                      {msg.projectType} · {new Date(msg.receivedAt).toLocaleDateString()}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>

          {selected ? (
            <article
              aria-label={`Enquiry from ${selected.name}`}
              className="rounded-2xl border border-border p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="m-0 text-xl">{selected.name}</h2>
                  <p className="m-0 text-sm text-text-secondary">{selected.email}</p>
                </div>
                <span className="inline-flex flex-wrap gap-2">
                  <a
                    href={replyHref(selected)}
                    className="rounded-full bg-text-primary px-4 text-sm font-semibold text-bg no-underline"
                    style={{ minHeight: 44, display: 'inline-flex', alignItems: 'center' }}
                  >
                    Reply
                  </a>
                  <ReadToggle id={selected.id} status={selected.status} />
                  <DeleteMessage id={selected.id} name={selected.name} />
                </span>
              </div>
              {selected.notifyError ? (
                <p
                  role="alert"
                  className="mt-3 rounded-2xl border border-danger bg-danger-subtle p-3 text-sm"
                >
                  This enquiry could not be emailed to you: {selected.notifyError}
                </p>
              ) : null}
              <dl className="mt-4 grid gap-2 text-sm">
                <div className="flex gap-2">
                  <dt className="text-text-secondary">Project type</dt>
                  <dd className="m-0 font-semibold">{selected.projectType || '—'}</dd>
                </div>
                {selected.company ? (
                  <div className="flex gap-2">
                    <dt className="text-text-secondary">Company</dt>
                    <dd className="m-0 font-semibold">{selected.company}</dd>
                  </div>
                ) : null}
              </dl>
              <p className="m-0 mt-3 whitespace-pre-wrap rounded-2xl bg-surface-secondary p-4">
                {selected.message}
              </p>
            </article>
          ) : (
            <p
              role="status"
              className="rounded-2xl border border-border p-6 text-center text-sm text-text-secondary"
            >
              Select a message to read it.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
