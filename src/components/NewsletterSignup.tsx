'use client';

import React, { useState } from 'react';
import { Mail } from 'lucide-react';
import { useCMS } from '../cms/context/CMSContext';
import { NEWSLETTER_DEFAULTS } from '@/core/newsletter/schema';

/**
 * "Send me updates."
 *
 * Hidden entirely unless the owner switched it on, because an empty newsletter
 * box on a portfolio is a promise nobody kept.
 *
 * The reply is deliberately the same whether the address was new, already
 * pending or already confirmed — a form that distinguishes those cases is a way
 * to test, one query at a time, whether a given person is on somebody's list.
 * The endpoint enforces that; this only has to avoid undoing it.
 */
export const NewsletterSignup: React.FC = () => {
  const { data } = useCMS();
  const settings = { ...NEWSLETTER_DEFAULTS, ...(data.newsletter ?? {}) };

  const [email, setEmail] = useState('');
  const [trap, setTrap] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle');
  const [message, setMessage] = useState('');
  const [failed, setFailed] = useState(false);

  if (!settings.enabled) return null;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (state === 'sending') return;

    setState('sending');
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          honeypot: trap,
          source: typeof window === 'undefined' ? undefined : window.location.pathname,
        }),
      });
      const body = (await res.json()) as { ok?: boolean; message?: string; error?: string };
      setFailed(!body.ok);
      setMessage(body.message || body.error || 'Something went wrong.');
      if (body.ok) {
        setState('done');
        return;
      }
    } catch {
      setFailed(true);
      setMessage('Could not reach the site. Please try again.');
    }
    setState('idle');
  };

  if (state === 'done') {
    return (
      <div className="py-10" role="status">
        <p className="font-body text-sm text-text-secondary">{message}</p>
      </div>
    );
  }

  return (
    <div className="py-10">
      <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1 min-w-0">
          <label
            htmlFor="newsletter-email"
            className="flex items-center gap-2 font-body text-[11px] font-medium text-text-muted mb-2"
          >
            <Mail className="w-3.5 h-3.5" aria-hidden />
            <span>{settings.pitch || 'Occasional updates, straight to your inbox.'}</span>
          </label>
          <input
            id="newsletter-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            /* 44px tall. WCAG 2.5.8 sets the floor at 24; a single-field form
               at the bottom of a page on a phone deserves the comfortable
               size rather than the minimum one. */
            className="w-full h-[44px] px-4 rounded-full bg-surface-primary border border-border text-text-primary font-body text-sm placeholder:text-text-muted focus:outline-none focus:border-text-primary/40"
          />
          {/* Seen only by something filling in every field it finds. */}
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            value={trap}
            onChange={(e) => setTrap(e.target.value)}
            className="absolute -left-[9999px] w-px h-px opacity-0"
          />
        </div>

        <button
          type="submit"
          disabled={state === 'sending'}
          className="h-[44px] px-6 rounded-full bg-text-primary text-bg font-body text-xs font-medium uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-60 flex-shrink-0"
        >
          {state === 'sending' ? 'Sending…' : settings.buttonLabel}
        </button>
      </form>

      {failed && message && (
        <p className="mt-3 font-body text-xs text-text-muted" role="alert">
          {message}
        </p>
      )}
    </div>
  );
};
