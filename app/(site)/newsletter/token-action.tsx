'use client';

import React, { useState } from 'react';

/**
 * A link in an email, turned into a question.
 *
 * The token arrives in the URL, but the action is a POST from this button
 * rather than the page load itself. That is not ceremony: corporate mail
 * gateways, link-safety scanners and inbox previews open every URL in a message
 * before its recipient does, so an action performed on `GET` is performed by
 * software on behalf of someone who has not read the email yet. For a
 * confirmation that silently turns double opt-in back into single opt-in; for
 * an unsubscribe it removes people who never asked to leave.
 *
 * Mail clients that support RFC 8058 do call the unsubscribe endpoint directly
 * — but that is an explicit tap on a button their user pressed, which is the
 * same intent this page collects.
 */
export const TokenAction: React.FC<{
  endpoint: string;
  token: string;
  prompt: string;
  action: string;
}> = ({ endpoint, token, prompt, action }) => {
  const [state, setState] = useState<'idle' | 'working' | 'done'>('idle');
  const [message, setMessage] = useState('');
  const [failed, setFailed] = useState(false);

  const go = async () => {
    setState('working');
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = (await res.json()) as { ok?: boolean; message?: string; error?: string };
      setFailed(!data.ok);
      setMessage(data.message || data.error || 'Something went wrong.');
    } catch {
      setFailed(true);
      setMessage('Could not reach the site. Please try again.');
    }
    setState('done');
  };

  if (!token) {
    return (
      <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
        That link is missing something. Try opening it again from the email.
      </p>
    );
  }

  if (state === 'done') {
    return (
      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-lg)',
          color: failed ? 'var(--text-muted)' : 'var(--text-primary)',
        }}
        role="status"
      >
        {message}
      </p>
    );
  }

  return (
    <>
      <p
        style={{
          fontFamily: 'var(--font-body)',
          color: 'var(--text-secondary)',
          marginBottom: 'var(--space-6)',
        }}
      >
        {prompt}
      </p>
      <button
        type="button"
        onClick={go}
        disabled={state === 'working'}
        style={{
          // 44px, not because a design asked for it — WCAG 2.5.8 puts the floor
          // at 24px and every platform guideline puts the comfortable size at
          // 44, and this button is pressed once, on a phone, by somebody who
          // will not try twice.
          minHeight: 44,
          paddingInline: 'var(--space-6)',
          borderRadius: 'var(--radius-full)',
          border: 'none',
          background: 'var(--text-primary)',
          color: 'var(--bg)',
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-sm)',
          fontWeight: 500,
          cursor: state === 'working' ? 'progress' : 'pointer',
        }}
      >
        {state === 'working' ? 'One moment…' : action}
      </button>
    </>
  );
};
