'use client';

import { useEffect, useState } from 'react';

const secondary =
  'rounded-full border border-border px-3 text-sm text-text-secondary hover:text-text-primary disabled:opacity-50';
const field = 'w-full rounded-xl border border-border bg-surface-primary px-3 text-text-primary';

/**
 * A private address for a draft, for eyes that must not have accounts.
 *
 * One link per page: creating a new one replaces the old, and revoking leaves
 * nothing behind. Anyone with the link sees the current draft — published or
 * not — and nothing else changes about the page: it stays out of the sitemap,
 * the navigation and search results.
 *
 * Tokens are shown once, from the response that minted them; the status line
 * says whether one is live, never what it is.
 */
export function SharePanel({ pageId, saved }: { pageId: string; saved: boolean }) {
  const [status, setStatus] = useState<{
    state: 'unknown' | 'none' | 'active';
    expiresAt?: string;
  }>({ state: 'unknown' });
  const [link, setLink] = useState<string | null>(null);
  const [days, setDays] = useState('7');
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!saved) return;
    let live = true;
    fetch(`/api/admin/share?pageId=${encodeURIComponent(pageId)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { ok?: boolean; active?: boolean; expiresAt?: string } | null) => {
        if (live && data?.ok) {
          setStatus(
            data.active && data.expiresAt
              ? { state: 'active', expiresAt: data.expiresAt }
              : { state: 'none' }
          );
        }
      })
      .catch(() => {
        if (live) setStatus({ state: 'none' });
      });
    return () => {
      live = false;
    };
  }, [pageId, saved]);

  if (!saved) {
    return (
      <p className="m-0 text-sm text-text-secondary">
        Save this page first — a share link points at a page the server knows.
      </p>
    );
  }

  const create = async () => {
    setBusy(true);
    try {
      const res = await fetch('/api/admin/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageId, days: Number(days) || 7 }),
      });
      const data = (await res.json().catch(() => null)) as {
        ok?: boolean;
        token?: string;
        expiresAt?: string;
      } | null;
      if (data?.ok && data.token) {
        // The origin belongs to the browser that just minted the link: built
        // here, in the click that caused it, rather than during a render the
        // server also performs.
        setLink(`${window.location.origin}/share/${data.token}`);
        setCopied(false);
        setStatus(
          data.expiresAt ? { state: 'active', expiresAt: data.expiresAt } : { state: 'none' }
        );
      }
    } finally {
      setBusy(false);
    }
  };

  const revoke = async () => {
    setBusy(true);
    try {
      await fetch(`/api/admin/share?pageId=${encodeURIComponent(pageId)}`, { method: 'DELETE' });
      setLink(null);
      setStatus({ state: 'none' });
    } finally {
      setBusy(false);
    }
  };

  const copy = async () => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* Clipboard needs a secure context; the link stays selectable below. */
    }
  };

  return (
    <div className="grid gap-3">
      <p className="m-0 text-sm text-text-secondary">
        A private address for this draft — for a client, a stakeholder, anyone who must not need an
        account. One link at a time: a new one replaces the old, and revoking leaves nothing behind.
        Search engines are told not to index it.
      </p>

      {status.state === 'active' && !link ? (
        <p className="m-0 text-sm text-text-secondary">
          Live until{' '}
          {status.expiresAt
            ? new Date(status.expiresAt).toLocaleDateString([], {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })
            : 'it expires'}
          .
        </p>
      ) : null}

      {link ? (
        <>
          <label className="grid gap-1 text-sm">
            <span className="font-semibold">Share link (shown once — copy it now)</span>
            <input
              type="text"
              readOnly
              value={link}
              onFocus={(event) => event.target.select()}
              className={field}
              style={{ minHeight: 44 }}
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void copy()}
              disabled={busy}
              className={secondary}
              style={{ minHeight: 44 }}
            >
              {copied ? 'Copied' : 'Copy link'}
            </button>
            <button
              type="button"
              onClick={() => void revoke()}
              disabled={busy}
              className={secondary}
              style={{ minHeight: 44 }}
            >
              Revoke
            </button>
          </div>
        </>
      ) : (
        <div className="flex flex-wrap items-end gap-2">
          <label className="grid gap-1 text-sm">
            <span className="font-semibold">Link lasts</span>
            <select
              value={days}
              onChange={(event) => setDays(event.target.value)}
              className={field}
              style={{ minHeight: 44 }}
            >
              <option value="7">7 days</option>
              <option value="30">30 days</option>
            </select>
          </label>
          <button
            type="button"
            onClick={() => void create()}
            disabled={busy}
            className={secondary}
            style={{ minHeight: 44 }}
          >
            {busy ? 'Working…' : status.state === 'active' ? 'Replace link' : 'Create share link'}
          </button>
        </div>
      )}
    </div>
  );
}
