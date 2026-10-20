'use client';

import { useState, type ReactNode } from 'react';
import type { IntegrationView } from '@/core/integrations/views';
import { CheckField, Field } from '../_components/form-fields';

/**
 * The services screen's island.
 *
 * Same interaction as the legacy screen — expand a card, edit its fields,
 * Save or Test, Disconnect — with the writes still going through
 * `/api/admin/integrations`, the one place secrets are handled, rate-limited
 * and switched off in the demo. What changed besides the markup:
 *
 * - Disconnect asks once instead of wiping stored credentials on a single
 *   click, the same shape as every other destructive button in this admin.
 * - Passwords are typed into plain inputs that carry `autoComplete`
 *   themselves, so the legacy MutationObserver that kept password managers
 *   out of these fields is no longer needed to say the same thing.
 */

const primary =
  'rounded-full bg-text-primary px-4 text-sm font-semibold text-bg disabled:opacity-50';
const secondary =
  'rounded-full border border-border px-3 text-sm text-text-secondary hover:text-text-primary disabled:opacity-50';
const danger = 'rounded-full bg-danger px-3 text-sm font-semibold text-bg disabled:opacity-50';

interface Outcome {
  ok: boolean;
  message: string;
}

export function ServicesBuilder({
  initialIntegrations,
  initialVaultAvailable,
}: {
  initialIntegrations: IntegrationView[];
  initialVaultAvailable: boolean;
}) {
  const [integrations, setIntegrations] = useState(initialIntegrations);
  const [vaultAvailable, setVaultAvailable] = useState(initialVaultAvailable);
  const [openId, setOpenId] = useState<string | null>(null);
  const [edits, setEdits] = useState<Record<string, Record<string, unknown>>>({});
  const [results, setResults] = useState<Record<string, Outcome>>({});
  const [disconnectArmed, setDisconnectArmed] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  /** Re-reads what is stored, so badges and hints show what actually landed. */
  const load = async () => {
    const res = await fetch('/api/admin/integrations');
    const data = (await res.json().catch(() => null)) as {
      ok?: boolean;
      vaultAvailable?: boolean;
      integrations?: IntegrationView[];
    } | null;
    if (data?.ok && data.integrations) {
      setIntegrations(data.integrations);
      setVaultAvailable(Boolean(data.vaultAvailable));
    }
  };

  const valueOf = (item: IntegrationView, name: string): unknown =>
    edits[item.id]?.[name] ?? item.values[name] ?? '';

  const edit = (id: string, name: string, value: unknown) =>
    setEdits((current) => ({ ...current, [id]: { ...current[id], [name]: value } }));

  /**
   * Every field, in the shape the integration declared — not only the ones
   * somebody touched. A toggle nobody moved sends nothing, and a schema that
   * requires a boolean rejects the lot.
   */
  const payloadFor = (item: IntegrationView): Record<string, unknown> => {
    const out: Record<string, unknown> = {};
    for (const field of item.fields) {
      const value = valueOf(item, field.name);
      if (field.kind === 'toggle') out[field.name] = Boolean(value);
      else if (field.kind === 'number') out[field.name] = Number(value) || undefined;
      else out[field.name] = String(value ?? '');
    }
    return out;
  };

  const send = async (item: IntegrationView, method: 'PUT' | 'POST') => {
    setBusy(item.id);
    try {
      const res = await fetch('/api/admin/integrations', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, values: payloadFor(item) }),
      });
      const data = (await res.json().catch(() => null)) as {
        ok?: boolean;
        error?: string;
        result?: Outcome;
      } | null;

      if (method === 'POST') {
        setResults((r) => ({
          ...r,
          [item.id]: data?.result ?? { ok: false, message: data?.error ?? 'The test did not run.' },
        }));
        return;
      }

      if (!data?.ok) {
        setResults((r) => ({
          ...r,
          [item.id]: { ok: false, message: data?.error ?? 'Could not save those settings.' },
        }));
        return;
      }

      setResults((r) => ({ ...r, [item.id]: { ok: true, message: 'Saved.' } }));
      setEdits((current) => ({ ...current, [item.id]: {} }));
      await load();
    } finally {
      setBusy(null);
    }
  };

  const disconnect = async (item: IntegrationView) => {
    setBusy(item.id);
    try {
      await fetch(`/api/admin/integrations?id=${encodeURIComponent(item.id)}`, {
        method: 'DELETE',
      });
      setEdits((current) => ({ ...current, [item.id]: {} }));
      setDisconnectArmed(null);
      setResults((r) => ({ ...r, [item.id]: { ok: true, message: 'Disconnected.' } }));
      await load();
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="grid gap-6">
      {!vaultAvailable ? (
        <Notice kind="warning" title="This site cannot store passwords safely yet">
          Set OPB_SECRET_KEY to a long phrase of your own (not the example from the documentation)
          in your hosting provider&apos;s environment variables and restart. Until then, anything
          with a password has to be configured through environment variables instead.
        </Notice>
      ) : null}

      {/* A real <form>, so `autocomplete="off"` has something to sit on and a
          stray Enter key does not reload the page. Submitting is done by the
          buttons; each one means something different. */}
      <form autoComplete="off" onSubmit={(event) => event.preventDefault()}>
        <ul className="m-0 grid list-none gap-3 p-0">
          {integrations.map((item) => {
            const open = openId === item.id;
            const result = results[item.id];
            const itemBadge = item.configuredByEnv
              ? { label: 'Set by environment', live: false }
              : item.isConfigured
                ? { label: 'On', live: true }
                : { label: 'Not set', live: false };

            return (
              <li key={item.id} className="grid gap-3 rounded-2xl border border-border p-4">
                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : item.id)}
                  aria-expanded={open}
                  className="grid gap-1 text-left"
                  style={{ minHeight: 44 }}
                >
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{item.name}</span>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-xs ${
                        itemBadge.live
                          ? 'border-accent text-accent'
                          : 'border-border text-text-muted'
                      }`}
                    >
                      {itemBadge.label}
                    </span>
                  </span>
                  <span className="text-sm text-text-secondary">{item.summary}</span>
                </button>

                {open ? (
                  <div className="grid gap-4 border-t border-border pt-4">
                    <Notice kind="info" title={item.freeTier.summary}>
                      Checked on {item.freeTier.verifiedOn}. Free plans change — if this looks
                      wrong, please open an issue.
                    </Notice>

                    <div className="grid gap-1">
                      <p className="m-0 text-sm font-semibold">Without this</p>
                      <p className="m-0 text-sm text-text-secondary">{item.degradation}</p>
                    </div>

                    {item.setup.length > 0 ? (
                      <div className="grid gap-2">
                        <p className="m-0 text-sm font-semibold">How to set it up</p>
                        {/* Numbered on purpose: these are steps to follow in
                            order, and a bulleted list of four things does not
                            say that. */}
                        <ol className="m-0 grid gap-1 pl-5 text-sm text-text-secondary">
                          {item.setup.map((step) => (
                            <li key={step}>{step}</li>
                          ))}
                        </ol>
                        {item.docsUrl ? (
                          <a
                            href={item.docsUrl}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="text-sm underline"
                          >
                            Open the provider&apos;s page
                          </a>
                        ) : null}
                      </div>
                    ) : null}

                    <div className="border-t border-border" />

                    {item.configuredByEnv ? (
                      <Notice kind="info" title="Configured by environment variables">
                        Whoever deployed this site set these on the host, and those win. Change them
                        there, or remove them to manage this here instead.
                      </Notice>
                    ) : (
                      <div className="grid gap-4">
                        {item.fields.map((field) => {
                          const secret = item.secrets[field.name];
                          if (field.kind === 'toggle') {
                            return (
                              <CheckField
                                key={field.name}
                                label={field.label}
                                description={field.help}
                                checked={Boolean(valueOf(item, field.name))}
                                onChange={(checked) => edit(item.id, field.name, checked)}
                              />
                            );
                          }
                          return (
                            <Field
                              key={field.name}
                              label={field.label}
                              value={String(valueOf(item, field.name) ?? '')}
                              onChange={(value) =>
                                edit(
                                  item.id,
                                  field.name,
                                  field.kind === 'number' ? Number(value) || '' : value
                                )
                              }
                              hint={field.help}
                              // A password is never sent back, so the field
                              // starts empty and its placeholder says what is
                              // already stored. Leaving it alone keeps it.
                              placeholder={
                                secret?.isSet
                                  ? `${secret.hint} — leave blank to keep`
                                  : field.placeholder
                              }
                              type={
                                field.kind === 'password'
                                  ? 'password'
                                  : field.kind === 'number'
                                    ? 'number'
                                    : 'text'
                              }
                              autoComplete={field.kind === 'password' ? 'new-password' : 'off'}
                            />
                          );
                        })}

                        {result ? (
                          <Notice kind={result.ok ? 'success' : 'warning'} title={result.message} />
                        ) : null}

                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => void send(item, 'PUT')}
                            disabled={busy === item.id}
                            className={primary}
                            style={{ minHeight: 44 }}
                          >
                            {busy === item.id ? 'Working…' : 'Save'}
                          </button>
                          <button
                            type="button"
                            onClick={() => void send(item, 'POST')}
                            disabled={busy === item.id}
                            className={secondary}
                            style={{ minHeight: 44 }}
                          >
                            Test
                          </button>
                          {item.isConfigured ? (
                            disconnectArmed === item.id ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => void disconnect(item)}
                                  disabled={busy === item.id}
                                  className={danger}
                                  style={{ minHeight: 44 }}
                                >
                                  Disconnect it
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDisconnectArmed(null)}
                                  className={secondary}
                                  style={{ minHeight: 44 }}
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setDisconnectArmed(item.id)}
                                className={secondary}
                                style={{ minHeight: 44 }}
                              >
                                Disconnect
                              </button>
                            )
                          ) : null}
                        </div>

                        {disconnectArmed === item.id ? (
                          <p className="m-0 text-sm text-danger">
                            This clears the saved settings and any stored password. You can set it
                            up again at any time.
                          </p>
                        ) : null}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-border px-2 py-0.5 text-xs text-text-muted">
                        {item.category}
                      </span>
                    </div>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      </form>
    </div>
  );
}

function Notice({
  kind,
  title,
  children,
}: {
  kind: 'info' | 'success' | 'warning';
  title: string;
  children?: ReactNode;
}) {
  const tone =
    kind === 'warning'
      ? 'border-danger bg-danger-subtle'
      : kind === 'success'
        ? 'border-accent'
        : 'border-border bg-surface-secondary';
  return (
    <div role="status" className={`rounded-2xl border p-4 ${tone}`}>
      <p className="m-0 font-semibold">{title}</p>
      {children ? <p className="m-0 mt-1 text-sm text-text-secondary">{children}</p> : null}
    </div>
  );
}
