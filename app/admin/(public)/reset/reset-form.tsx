'use client';

import { useState } from 'react';
import Link from 'next/link';

/**
 * Passphrase reset, in two states switched by one query param.
 *
 * No token — ask for an email and POST it to `/api/auth/reset/request`. That
 * endpoint answers `{ ok: true }` whether or not the address owns this site,
 * so the screen after submitting must say the same thing either way: showing
 * anything else would let this form be used to test who runs a site.
 *
 * Token present — ask for a new passphrase and POST both to
 * `/api/auth/reset/confirm`. That route sets the session cookie itself; this
 * only has to leave the page with a full navigation so the server sees it.
 */

const field =
  'w-full rounded-xl border border-border bg-surface-primary px-3 text-text-primary outline-none focus:border-accent';

function BackToSignIn() {
  return (
    <p className="m-0 text-center text-sm">
      <Link
        href="/admin/login"
        className="text-text-secondary underline-offset-4 hover:text-text-primary hover:underline"
      >
        Back to sign in
      </Link>
    </p>
  );
}

export function ResetForm({ token }: { token?: string }) {
  const [email, setEmail] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [requested, setRequested] = useState(false);

  const request = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!data.ok) {
        setError(data.error ?? 'That did not work.');
        return;
      }
      setRequested(true);
    } catch {
      setError('Could not reach the server.');
    } finally {
      setLoading(false);
    }
  };

  const confirm = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, passphrase }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!data.ok) {
        setError(data.error ?? 'That did not work.');
        return;
      }
      // The confirm route set the session cookie on its own response; a full
      // navigation makes sure the next server render sees it.
      window.location.assign('/admin');
    } catch {
      setError('Could not reach the server.');
    } finally {
      setLoading(false);
    }
  };

  if (token) {
    return (
      <form onSubmit={(event) => void confirm(event)} className="grid gap-5">
        <div>
          <h1 className="font-display text-2xl font-semibold">Choose a new passphrase</h1>
          <p className="m-0 mt-1 text-sm text-text-secondary">
            This link works once. Setting a passphrase signs you in here and signs out every other
            session.
          </p>
        </div>

        {error ? (
          <p role="alert" className="m-0 text-sm text-danger">
            {error}
          </p>
        ) : null}

        <label className="grid gap-1 text-sm">
          <span className="font-semibold">New passphrase</span>
          <input
            type="password"
            name="password"
            autoComplete="new-password"
            required
            value={passphrase}
            onChange={(event) => setPassphrase(event.target.value)}
            className={field}
            style={{ minHeight: 44 }}
          />
          <span className="text-text-secondary">
            At least 12 characters. A short sentence works well.
          </span>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-text-primary font-semibold text-bg disabled:opacity-50"
          style={{ minHeight: 48 }}
        >
          {loading ? 'Saving…' : 'Set passphrase and sign in'}
        </button>

        <BackToSignIn />
      </form>
    );
  }

  if (requested) {
    return (
      <div className="grid gap-5">
        <div>
          <h1 className="font-display text-2xl font-semibold">Check your email</h1>
          <p className="m-0 mt-1 text-sm text-text-secondary">
            If that address owns this site, a reset link is on its way. It works once, for 30
            minutes.
          </p>
        </div>
        <BackToSignIn />
      </div>
    );
  }

  return (
    <form onSubmit={(event) => void request(event)} className="grid gap-5">
      <div>
        <h1 className="font-display text-2xl font-semibold">Reset your passphrase</h1>
        <p className="m-0 mt-1 text-sm text-text-secondary">
          Enter the email you used to claim this site.
        </p>
      </div>

      {error ? (
        <p role="alert" className="m-0 text-sm text-danger">
          {error}
        </p>
      ) : null}

      <label className="grid gap-1 text-sm">
        <span className="font-semibold">Email</span>
        <input
          type="email"
          name="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={field}
          style={{ minHeight: 44 }}
        />
      </label>

      <button
        type="submit"
        disabled={loading}
        className="rounded-full bg-text-primary font-semibold text-bg disabled:opacity-50"
        style={{ minHeight: 48 }}
      >
        {loading ? 'Sending…' : 'Send reset link'}
      </button>

      <BackToSignIn />
    </form>
  );
}
