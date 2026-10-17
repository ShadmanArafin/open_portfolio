'use client';

import { useState } from 'react';

export interface PasskeySummary {
  id: string;
  deviceName: string;
  createdAt: string;
  lastUsedAt: string | null;
}

const secondary =
  'rounded-full border border-border px-4 text-sm text-text-secondary hover:text-text-primary disabled:opacity-50';

/**
 * Enroll, list and remove passkeys.
 *
 * Enrollment lives here rather than on the sign-in page because creating a
 * credential that signs in as the owner requires already being the owner. The
 * sign-in page only *uses* them; this is the only place that makes them.
 *
 * The initial list is server-rendered; after an enroll or a removal the list
 * refreshes from the endpoint.
 */
export function PasskeyPanel({ initial }: { initial: PasskeySummary[] }) {
  const [credentials, setCredentials] = useState(initial);
  const [deviceName, setDeviceName] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [removeArmed, setRemoveArmed] = useState<string | null>(null);

  const refresh = async () => {
    const body = await (await fetch('/api/auth/passkey/list').catch(() => null))?.json?.();
    if (body?.ok) setCredentials(body.credentials);
  };

  const supported = typeof window !== 'undefined' && !!window.PublicKeyCredential;

  const handleRegister = async () => {
    setStatus(null);
    if (!supported) {
      setStatus(
        'This browser cannot use passkeys. Try a current phone, laptop or password manager.'
      );
      return;
    }
    setBusy(true);
    try {
      const { startRegistration } = await import('@simplewebauthn/browser');
      const start = await (
        await fetch('/api/auth/passkey/register/start', { method: 'POST' })
      ).json();
      if (!start.ok) {
        setStatus(start.error ?? 'Could not start enrollment.');
        return;
      }
      const attestation = await startRegistration({ optionsJSON: start.options });
      const finish = await (
        await fetch('/api/auth/passkey/register/finish', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            challengeId: start.challengeId,
            response: attestation,
            deviceName: deviceName.trim() || undefined,
          }),
        })
      ).json();
      setStatus(
        finish.ok
          ? 'Passkey enrolled. It works on the sign-in page from now on.'
          : (finish.error ?? 'Enrollment failed.')
      );
      setDeviceName('');
      await refresh();
    } catch (err) {
      setStatus(
        err instanceof Error && err.name === 'NotAllowedError'
          ? 'Cancelled — nothing was enrolled.'
          : 'Enrollment failed. Try again.'
      );
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async (id: string) => {
    setBusy(true);
    try {
      await fetch(`/api/auth/passkey/${encodeURIComponent(id)}`, { method: 'DELETE' });
      await refresh();
      setStatus('Passkey removed. Your passphrase still signs in.');
    } finally {
      setBusy(false);
      setRemoveArmed(null);
    }
  };

  return (
    <section aria-label="Passkeys" className="grid gap-4 rounded-2xl border border-border p-4">
      <div>
        <h2 className="m-0 text-xl">Passkeys</h2>
        <p className="m-0 mt-1 text-sm text-text-secondary">
          A fingerprint, face or hardware key instead of a typed passphrase. Enroll this device
          here; use it on the sign-in page. Removing every passkey is safe — your passphrase still
          works.
        </p>
      </div>

      {credentials.length > 0 ? (
        <ul className="m-0 grid list-none gap-2 p-0">
          {credentials.map((credential) => (
            <li
              key={credential.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border p-3"
            >
              <div>
                <p className="m-0 text-sm text-text-primary">{credential.deviceName}</p>
                <p className="m-0 text-xs text-text-secondary">
                  Added {new Date(credential.createdAt).toLocaleDateString()}
                  {credential.lastUsedAt
                    ? ` · used ${new Date(credential.lastUsedAt).toLocaleDateString()}`
                    : ' · never used'}
                </p>
              </div>
              {removeArmed === credential.id ? (
                <span className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void handleRemove(credential.id)}
                    disabled={busy}
                    className="rounded-full bg-danger px-4 text-sm font-semibold text-bg disabled:opacity-50"
                    style={{ minHeight: 44 }}
                  >
                    Remove it
                  </button>
                  <button
                    type="button"
                    onClick={() => setRemoveArmed(null)}
                    className={secondary}
                    style={{ minHeight: 44 }}
                  >
                    Cancel
                  </button>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setRemoveArmed(credential.id)}
                  disabled={busy}
                  className={secondary}
                  style={{ minHeight: 44 }}
                >
                  Remove
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="m-0 text-sm text-text-secondary">
          No passkeys yet. Your passphrase is the only way in.
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <label className="grid gap-1 text-sm">
          <span className="font-semibold">Name this device (optional)</span>
          <input
            type="text"
            value={deviceName}
            onChange={(event) => setDeviceName(event.target.value)}
            className="rounded-xl border border-border bg-surface-primary px-3 text-text-primary"
            style={{ minHeight: 44 }}
          />
        </label>
        <button
          type="button"
          onClick={() => void handleRegister()}
          disabled={busy}
          className="rounded-full bg-text-primary px-4 text-sm font-semibold text-bg disabled:opacity-50"
          style={{ minHeight: 44 }}
        >
          {busy ? 'Waiting…' : 'Enroll this device'}
        </button>
      </div>

      {status ? (
        <p role="status" className="m-0 text-sm text-text-secondary">
          {status}
        </p>
      ) : null}
    </section>
  );
}
