'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

/**
 * Sign-in, as a client leaf on a server-rendered page.
 *
 * Four ways in, all against endpoints that already existed and are unchanged:
 * passphrase, passkey, an emailed one-time code, and the reset flow. The page
 * around this is server-rendered, so a mistimed auth check can no longer flash
 * the wrong screen — and the `?next=` a turned-away deep link carries finally
 * lands somewhere, because this navigates with it.
 */

const field =
  'w-full rounded-xl border border-border bg-surface-primary px-3 text-text-primary outline-none focus:border-accent';

export function LoginForm({ next, demoHint }: { next?: string; demoHint: string | null }) {
  const [email, setEmail] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [passkeyBusy, setPasskeyBusy] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpBusy, setOtpBusy] = useState(false);
  const [otpStatus, setOtpStatus] = useState<string | null>(null);

  /**
   * A full navigation, not a soft one: the session cookie was just set by the
   * response, and a client-side transition can be answered from the router's
   * cache — which still holds the signed-out render of the page we are asking
   * for.
   */
  const go = () => window.location.assign(next ?? '/admin');

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, passphrase }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (res.ok && data.ok) {
        await offerPasskey();
        go();
        return;
      }
      setError(data.error ?? 'That email or passphrase is not right.');
    } catch {
      setError('Could not reach the server.');
    } finally {
      setLoading(false);
    }
  };

  /** Hands a browser assertion to the server; true when it signed in. */
  const finishPasskey = async (challengeId: string, assertion: unknown) => {
    const finish = await (
      await fetch('/api/auth/passkey/login/finish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeId, response: assertion }),
      })
    ).json();
    if (!finish.ok) setError(finish.error ?? 'Passkey sign-in failed.');
    return Boolean(finish.ok);
  };

  /**
   * Passkeys in the email field's autofill (conditional mediation): the
   * browser lists this site's passkeys under the field, and picking one signs
   * in, with no button and no modal. Started once, quietly; a browser without
   * it, or a site without passkeys, simply shows the form as before.
   */
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const { browserSupportsWebAuthnAutofill, startAuthentication } =
          await import('@simplewebauthn/browser');
        if (!(await browserSupportsWebAuthnAutofill()) || cancelled) return;
        const start = await (
          await fetch('/api/auth/passkey/login/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ autofill: true }),
          })
        ).json();
        if (!start.ok || cancelled) return;
        const assertion = await startAuthentication({
          optionsJSON: start.options,
          useBrowserAutofill: true,
        });
        if (await finishPasskey(start.challengeId, assertion)) go();
      } catch {
        // Aborted by the passkey button, dismissed, or unsupported: the form
        // is still there.
      }
    })();
    return () => {
      cancelled = true;
    };
    // Once per visit to the page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * After a passphrase sign-in, ask the password manager that just filled it
   * to save a passkey too (conditional create). The browser does it without a
   * prompt, or not at all; either way this is capped at a few seconds so it
   * never holds up the way in. Only while the site has no passkey, so it does
   * not add one per sign-in.
   */
  const offerPasskey = async () => {
    try {
      const capabilities = await (
        PublicKeyCredential as unknown as {
          getClientCapabilities?: () => Promise<Record<string, boolean>>;
        }
      ).getClientCapabilities?.();
      if (!capabilities?.conditionalCreate) return;
      const list = await (await fetch('/api/auth/passkey/list')).json();
      if (!list.ok || list.credentials.length > 0) return;
      const { startRegistration } = await import('@simplewebauthn/browser');
      const start = await (
        await fetch('/api/auth/passkey/register/start', { method: 'POST' })
      ).json();
      if (!start.ok) return;
      const attempt = (async () => {
        const response = await startRegistration({
          optionsJSON: start.options,
          useAutoRegister: true,
        });
        await fetch('/api/auth/passkey/register/finish', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            challengeId: start.challengeId,
            response,
            deviceName: 'Saved by your password manager',
          }),
        });
      })();
      await Promise.race([attempt, new Promise((resolve) => setTimeout(resolve, 4000))]);
    } catch {
      // Declined, unsupported or already saved: the passphrase still worked.
    }
  };

  const passkey = async () => {
    setError(null);
    if (typeof window === 'undefined' || !window.PublicKeyCredential) {
      setError('This browser cannot use passkeys.');
      return;
    }
    setPasskeyBusy(true);
    try {
      const { startAuthentication } = await import('@simplewebauthn/browser');
      const start = await (await fetch('/api/auth/passkey/login/start', { method: 'POST' })).json();
      if (!start.ok) {
        setError(start.error ?? 'Passkey sign-in failed.');
        return;
      }
      const assertion = await startAuthentication({ optionsJSON: start.options });
      if (await finishPasskey(start.challengeId, assertion)) go();
    } catch (err) {
      // The person cancelling the browser's own prompt is not an error.
      if (!(err instanceof Error && err.name === 'NotAllowedError')) {
        setError('Passkey sign-in failed.');
      }
    } finally {
      setPasskeyBusy(false);
    }
  };

  const sendOtp = async () => {
    setOtpStatus(null);
    setError(null);
    if (!email.trim()) {
      setOtpStatus('Enter your email above first.');
      return;
    }
    setOtpBusy(true);
    try {
      await fetch('/api/auth/otp/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      // Always "sent": the endpoint answers identically whether or not the
      // address owns this site, so this screen cannot leak that either.
      setOtpSent(true);
      setOtpStatus(
        'If email is connected, a code is on its way. It works once, within 10 minutes.'
      );
    } catch {
      setOtpStatus('Could not reach the server. Try again.');
    } finally {
      setOtpBusy(false);
    }
  };

  const verifyOtp = async () => {
    setOtpBusy(true);
    try {
      const res = await (
        await fetch('/api/auth/otp/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim(), code: otpCode }),
        })
      ).json();
      if (res.ok) {
        go();
      } else {
        setOtpStatus(res.error ?? 'That code is not right.');
      }
    } catch {
      setOtpStatus('Could not reach the server. Try again.');
    } finally {
      setOtpBusy(false);
    }
  };

  return (
    <form onSubmit={(event) => void submit(event)} className="grid gap-5">
      <div>
        <h1 className="font-display text-2xl font-semibold">Sign in</h1>
        <p className="m-0 mt-1 text-sm text-text-secondary">
          {demoHint ?? 'Use the email and passphrase you chose when you set this site up.'}
        </p>
      </div>

      {error ? (
        <p role="alert" className="m-0 text-sm text-danger">
          {error}
        </p>
      ) : null}

      <div className="grid gap-4">
        <label className="grid gap-1 text-sm">
          <span className="font-semibold">Email</span>
          <input
            type="email"
            name="email"
            autoComplete="email webauthn"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={field}
            style={{ minHeight: 44 }}
          />
        </label>

        <label className="grid gap-1 text-sm">
          <span className="font-semibold">Passphrase</span>
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            required
            value={passphrase}
            onChange={(event) => setPassphrase(event.target.value)}
            className={field}
            style={{ minHeight: 44 }}
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="rounded-full bg-text-primary font-semibold text-bg disabled:opacity-50"
        style={{ minHeight: 48 }}
      >
        {loading ? 'Signing in…' : 'Sign in'}
      </button>

      <button
        type="button"
        onClick={() => void passkey()}
        disabled={passkeyBusy}
        className="rounded-full border border-border text-sm text-text-secondary hover:text-text-primary disabled:opacity-50"
        style={{ minHeight: 44 }}
      >
        {passkeyBusy ? 'Waiting for your key…' : 'Sign in with a passkey'}
      </button>

      {otpSent ? (
        <div className="grid gap-3">
          <label className="grid gap-1 text-sm">
            <span className="font-semibold">6-digit code</span>
            <input
              inputMode="numeric"
              autoComplete="one-time-code"
              value={otpCode}
              onChange={(event) => setOtpCode(event.target.value)}
              className={field}
              style={{ minHeight: 44 }}
            />
          </label>
          <button
            type="button"
            onClick={() => void verifyOtp()}
            disabled={otpBusy}
            className="rounded-full border border-border text-sm text-text-secondary hover:text-text-primary disabled:opacity-50"
            style={{ minHeight: 44 }}
          >
            {otpBusy ? 'Checking…' : 'Use this code'}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => void sendOtp()}
          disabled={otpBusy}
          className="text-sm text-text-secondary underline underline-offset-4 hover:text-text-primary disabled:opacity-50"
        >
          {otpBusy ? 'Sending…' : 'Email me a sign-in code instead'}
        </button>
      )}

      {otpStatus ? (
        <p role="status" className="m-0 text-sm text-text-secondary">
          {otpStatus}
        </p>
      ) : null}

      <div className="grid gap-2 text-center text-sm">
        <Link
          href="/admin/reset"
          className="text-text-secondary underline-offset-4 hover:text-text-primary hover:underline"
        >
          Forgot your passphrase?
        </Link>
        <Link
          href="/"
          className="text-text-secondary underline-offset-4 hover:text-text-primary hover:underline"
        >
          Back to the site
        </Link>
      </div>
    </form>
  );
}
