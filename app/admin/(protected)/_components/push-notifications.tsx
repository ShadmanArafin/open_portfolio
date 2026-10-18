'use client';

import React, { useCallback, useEffect, useState } from 'react';

function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const raw = atob(base64.replace(/-/g, '+').replace(/_/g, '/') + padding);
  const out = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

/** The buttons here and in `messages/message-actions.tsx` are the same button. */
const buttonClass =
  'rounded-full border border-border px-4 text-sm text-text-secondary hover:text-text-primary disabled:opacity-50';

/**
 * The owner's buzz, as a button.
 *
 * Rendered by the inbox, and only once a first message has arrived — asking
 * for notification permission on install, before there is anything to notify
 * about, is how it gets denied forever. iOS only delivers to a
 * Home-Screen-installed site (16.4+); Chrome exempts installed sites from its
 * low-engagement revocation. So the copy names the install step instead of
 * pretending the button alone is enough.
 *
 * Moved here from the legacy admin's `src/admin/components/PushNotifications.tsx`
 * when the old shell was deleted, and the last file in the product to still be
 * on the Astryx kit. Ported to this directory's plain Tailwind on 2026-10-18,
 * which is what let `app/layout.tsx` drop the kit's three stylesheets and
 * `package.json` drop the three `@astryxdesign` packages.
 *
 * The look is unchanged on purpose: it had rendered with the kit's built-in
 * defaults since the old shell went, because nothing sets `data-astryx-theme`
 * any more, and these are the same `rounded-full border border-border…`
 * buttons the neighbouring islands use. The one visible difference is the
 * Enable button saying "Enabling…" while it works, instead of a spinner.
 */
export const PushNotifications: React.FC = () => {
  const [state, setState] = useState<
    'checking' | 'unsupported' | 'denied' | 'off' | 'on' | 'unconfigured'
  >('checking');
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const supported =
    typeof navigator !== 'undefined' &&
    'serviceWorker' in navigator &&
    typeof window !== 'undefined' &&
    'PushManager' in window;

  const refresh = useCallback(async () => {
    if (!supported) {
      setState('unsupported');
      return;
    }
    if (Notification.permission === 'denied') {
      setState('denied');
      return;
    }
    try {
      const reg = await navigator.serviceWorker.register('/sw.js');
      const existing = await reg.pushManager.getSubscription();
      if (existing) {
        setState('on');
        return;
      }
      const keyRes = await fetch('/api/admin/push/public-key');
      if (keyRes.status === 503) {
        setState('unconfigured');
        return;
      }
      if (!keyRes.ok) {
        setState('off');
        return;
      }
      setState('off');
    } catch {
      setState('unsupported');
    }
  }, [supported]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const enable = async () => {
    setBusy(true);
    setNote(null);
    try {
      const keyRes = await fetch('/api/admin/push/public-key');
      const keyData = (await keyRes.json().catch(() => null)) as {
        ok?: boolean;
        publicKey?: string;
        error?: string;
      } | null;
      if (!keyRes.ok || !keyData?.publicKey) {
        setState('unconfigured');
        setNote(keyData?.error ?? 'Push is not set up on this server yet.');
        return;
      }
      const reg = await navigator.serviceWorker.register('/sw.js');
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(keyData.publicKey),
      });
      const res = await fetch('/api/admin/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: sub.toJSON(), userAgent: navigator.userAgent }),
      });
      if (!res.ok) {
        await sub.unsubscribe().catch(() => undefined);
        setNote('This device refused the subscription. Try again, or another browser.');
        return;
      }
      setState('on');
      setNote('This device will buzz when a new enquiry arrives.');
    } catch {
      setNote('The browser refused permission. Check the site settings for this page.');
    } finally {
      setBusy(false);
    }
  };

  const disable = async () => {
    setBusy(true);
    setNote(null);
    try {
      const reg = await navigator.serviceWorker.register('/sw.js');
      const existing = await reg.pushManager.getSubscription();
      const endpoint = existing?.endpoint;
      await existing?.unsubscribe().catch(() => undefined);
      if (endpoint) {
        await fetch(`/api/admin/push/subscribe?endpoint=${encodeURIComponent(endpoint)}`, {
          method: 'DELETE',
        }).catch(() => undefined);
      }
      setState('off');
    } finally {
      setBusy(false);
    }
  };

  const test = async () => {
    setBusy(true);
    setNote(null);
    try {
      const res = await fetch('/api/admin/push/test', { method: 'POST' });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      setNote(
        data?.ok
          ? 'Test sent — your devices should buzz within seconds.'
          : (data?.error ?? 'The test did not go through.')
      );
    } finally {
      setBusy(false);
    }
  };

  if (state === 'checking' || state === 'unsupported') return null;

  if (state === 'denied') {
    return (
      <p className="m-0 text-sm text-text-secondary">
        Notifications are blocked for this site in the browser settings — unblock them there if you
        want a buzz for new enquiries.
      </p>
    );
  }

  if (state === 'unconfigured') {
    return (
      <p className="m-0 text-sm text-text-secondary">
        Push is not set up on this server yet (OPB_VAPID_*). Email notifications still apply where
        mail is configured.
      </p>
    );
  }

  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap items-center gap-2">
        {state === 'on' ? (
          <>
            <button
              type="button"
              disabled={busy}
              onClick={() => void disable()}
              className={buttonClass}
              style={{ minHeight: 44 }}
            >
              Disable notifications
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void test()}
              className={buttonClass}
              style={{ minHeight: 44 }}
            >
              Send test
            </button>
          </>
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={() => void enable()}
            className={buttonClass}
            style={{ minHeight: 44 }}
          >
            {busy ? 'Enabling…' : 'Enable notifications'}
          </button>
        )}
      </div>
      <p className="m-0 text-sm text-text-secondary">
        {state === 'on'
          ? 'This device buzzes for new enquiries — bursts arrive as one. For the full effect, install the admin to your home screen first.'
          : 'One buzz per burst of enquiries. On iPhone, install the admin to the Home Screen first (iOS 16.4+ only delivers there).'}
      </p>
      {note ? <p className="m-0 text-sm text-text-secondary">{note}</p> : null}
    </div>
  );
};
