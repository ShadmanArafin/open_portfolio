'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const inputClass =
  'w-full rounded-2xl border border-border bg-surface-primary px-4 py-3 font-body text-base text-text-primary outline-none transition-colors focus:border-accent';

export function ClaimForm({
  requiresToken,
  blockedReason,
}: {
  requiresToken: boolean;
  blockedReason: string | null;
}) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [setupToken, setSetupToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (blockedReason) {
    return (
      <div
        role="alert"
        className="mt-8 rounded-2xl border border-border bg-surface-primary p-5 font-body text-sm text-text-secondary"
      >
        {blockedReason}
      </div>
    );
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    try {
      const res = await fetch('/api/setup/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, passphrase, setupToken: setupToken || undefined }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };

      if (!data.ok) {
        setError(data.error ?? 'That did not work.');
        return;
      }
      // Server Components have already cached the unclaimed state; refresh so
      // the admin does not bounce straight back here.
      router.refresh();
      router.replace('/admin');
    } catch {
      setError('Could not reach the server. Check that it is still running.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
      {requiresToken && (
        <div>
          <label
            htmlFor="setup-token"
            className="mb-2 block font-body text-xs font-medium uppercase tracking-wider text-text-muted"
          >
            Setup token
          </label>
          <input
            id="setup-token"
            type="password"
            required
            autoComplete="off"
            value={setupToken}
            onChange={(e) => setSetupToken(e.target.value)}
            className={inputClass}
          />
          <p className="mt-2 font-body text-xs text-text-muted">
            The value of <code>OPB_SETUP_TOKEN</code> from your hosting dashboard. It proves this
            deployment is yours.
          </p>
        </div>
      )}

      <div>
        <label
          htmlFor="setup-email"
          className="mb-2 block font-body text-xs font-medium uppercase tracking-wider text-text-muted"
        >
          Your email
        </label>
        <input
          id="setup-email"
          type="email"
          required
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
        <p className="mt-2 font-body text-xs text-text-muted">This is how you sign in.</p>
      </div>

      <div>
        <label
          htmlFor="setup-passphrase"
          className="mb-2 block font-body text-xs font-medium uppercase tracking-wider text-text-muted"
        >
          Passphrase
        </label>
        <input
          id="setup-passphrase"
          type="password"
          required
          minLength={12}
          autoComplete="new-password"
          value={passphrase}
          onChange={(e) => setPassphrase(e.target.value)}
          className={inputClass}
        />
        <p className="mt-2 font-body text-xs text-text-muted">
          At least 12 characters. A short sentence you will remember beats a short scramble you will
          not.
        </p>
      </div>

      {error && (
        <p role="alert" className="font-body text-sm text-red-400">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="inline-flex h-[42px] w-full items-center justify-center rounded-full bg-text-primary px-6 font-body text-xs font-medium uppercase tracking-wider text-bg transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {busy ? 'Setting up...' : 'Claim this site'}
      </button>
    </form>
  );
}
