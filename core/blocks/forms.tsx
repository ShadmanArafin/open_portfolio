'use client';

import React, { useState } from 'react';

/**
 * The interactive parts of three blocks, in one Client Component file.
 *
 * Almost every block in this project renders on the server and ships no
 * JavaScript. These three cannot: a form has state, and a video facade exists
 * precisely to *not* load a third party until somebody asks for it. Keeping
 * them together and importing them from the definitions means the client
 * boundary is one file somebody can read, rather than a `'use client'` sprinkled
 * through a 900-line block file where it is easy to add a fourth by accident.
 *
 * They take plain props and never read context. A block's Render is a Server
 * Component and cannot provide one, and these have to work identically inside
 * the page, inside a preview and inside a test.
 */

/* ---------------------------------------------------------------- controls */

const fieldStyle: React.CSSProperties = {
  width: '100%',
  minHeight: 'var(--control-height)',
  paddingInline: 'var(--space-4)',
  paddingBlock: 'var(--space-3)',
  borderRadius: 'var(--radius-md)',
  border: 'var(--hairline) solid var(--border-color)',
  background: 'var(--surface-primary)',
  color: 'var(--text-primary)',
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--text-base)',
};

const labelStyle: React.CSSProperties = {
  display: 'grid',
  gap: 'var(--space-2)',
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--text-sm)',
  color: 'var(--text-secondary)',
};

const buttonStyle: React.CSSProperties = {
  minHeight: 'var(--control-height)',
  paddingInline: 'var(--space-6)',
  borderRadius: 'var(--radius-full)',
  border: 'none',
  background: 'var(--btn-primary-bg)',
  color: 'var(--btn-primary-text)',
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--text-sm)',
  fontWeight: 500,
  cursor: 'pointer',
  justifySelf: 'start',
};

/**
 * The field no human sees.
 *
 * Present and fillable rather than `display: none`, because some bots skip
 * inputs that are removed from layout and the whole point is that they fill it
 * in. `tabIndex={-1}` and `aria-hidden` keep it away from keyboard and
 * screen-reader users, who would otherwise land on a mystery box.
 *
 * Collapsed with `scale(0)` rather than parked off-screen at some negative
 * offset, because the off-screen trick needs a length and a block may not name
 * one — a rule with a real point here, since a stray `-9999px` is exactly the
 * kind of value that survives a theme change and then does not.
 */
function Honeypot({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      type="text"
      name="website"
      tabIndex={-1}
      autoComplete="off"
      aria-hidden="true"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ position: 'absolute', opacity: 0, transform: 'scale(0)', pointerEvents: 'none' }}
    />
  );
}

function Note({ children, tone }: { children: React.ReactNode; tone: 'ok' | 'bad' }) {
  return (
    <p
      role={tone === 'bad' ? 'alert' : 'status'}
      style={{
        margin: 0,
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-sm)',
        color: tone === 'bad' ? 'var(--text-primary)' : 'var(--text-secondary)',
      }}
    >
      {children}
    </p>
  );
}

/* ----------------------------------------------------------- contact form */

export interface ContactFormProps {
  submitLabel: string;
  successMessage: string;
  askCompany?: boolean;
  askProjectType?: boolean;
  projectTypes?: string[];
}

/**
 * The same endpoint the contact page posts to, deliberately.
 *
 * `/api/contact` already stores the message, emails the owner, checks the
 * origin, rate-limits by client and answers a honeypot with success. A second
 * endpoint for the block version would have re-earned every one of those, and
 * would have got one of them wrong.
 */
export function ContactForm({
  submitLabel,
  successMessage,
  askCompany,
  askProjectType,
  projectTypes,
}: ContactFormProps) {
  const [values, setValues] = useState({
    name: '',
    email: '',
    company: '',
    projectType: '',
    message: '',
  });
  const [trap, setTrap] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState('');

  const set = (key: keyof typeof values) => (event: { target: { value: string } }) =>
    setValues((current) => ({ ...current, [key]: event.target.value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (state === 'sending') return;

    setState('sending');
    setError('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, honeypot: trap }),
      });
      const body = (await res.json()) as { ok?: boolean; error?: string };
      if (body.ok) {
        setState('sent');
        return;
      }
      setError(body.error || 'That did not send. Please try again.');
    } catch {
      setError('Could not reach the site. Please try again.');
    }
    setState('idle');
  };

  if (state === 'sent') return <Note tone="ok">{successMessage}</Note>;

  return (
    <form
      onSubmit={submit}
      style={{ display: 'grid', gap: 'var(--space-4)', position: 'relative' }}
    >
      <label style={labelStyle}>
        Your name
        <input required value={values.name} onChange={set('name')} style={fieldStyle} />
      </label>

      <label style={labelStyle}>
        Your email
        <input
          type="email"
          required
          autoComplete="email"
          value={values.email}
          onChange={set('email')}
          style={fieldStyle}
        />
      </label>

      {askCompany && (
        <label style={labelStyle}>
          Company <span style={{ color: 'var(--text-muted)' }}>(optional)</span>
          <input value={values.company} onChange={set('company')} style={fieldStyle} />
        </label>
      )}

      {askProjectType && projectTypes && projectTypes.length > 0 && (
        <label style={labelStyle}>
          What is it about?
          <select value={values.projectType} onChange={set('projectType')} style={fieldStyle}>
            <option value="">Choose one</option>
            {projectTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
      )}

      <label style={labelStyle}>
        Message
        <textarea
          required
          rows={5}
          value={values.message}
          onChange={set('message')}
          style={{ ...fieldStyle, resize: 'vertical' }}
        />
      </label>

      <Honeypot value={trap} onChange={setTrap} />

      <button type="submit" disabled={state === 'sending'} style={buttonStyle}>
        {state === 'sending' ? 'Sending…' : submitLabel}
      </button>

      {error && <Note tone="bad">{error}</Note>}
    </form>
  );
}

/* ------------------------------------------------------- newsletter form */

export interface NewsletterFormProps {
  buttonLabel: string;
  placeholder?: string;
}

/**
 * The sign-up box, placeable on a page rather than only in the footer.
 *
 * Posts to the same `/api/newsletter/subscribe` the footer form does, so double
 * opt-in, the identical-answer rule and the rate limit all hold here without
 * this component knowing about any of them.
 */
export function NewsletterForm({ buttonLabel, placeholder }: NewsletterFormProps) {
  const [email, setEmail] = useState('');
  const [trap, setTrap] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle');
  const [message, setMessage] = useState('');
  const [failed, setFailed] = useState(false);

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

  if (state === 'done') return <Note tone="ok">{message}</Note>;

  return (
    <form
      onSubmit={submit}
      style={{ display: 'grid', gap: 'var(--space-3)', position: 'relative' }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 'var(--space-3)',
          alignItems: 'center',
        }}
      >
        <input
          type="email"
          required
          autoComplete="email"
          aria-label="Your email address"
          placeholder={placeholder || 'you@example.com'}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          // Wraps onto its own line below a comfortable short line-length,
          // which is a token rather than a breakpoint somebody has to maintain.
          style={{ ...fieldStyle, flex: '1 1 var(--measure-narrow)', width: 'auto' }}
        />
        <Honeypot value={trap} onChange={setTrap} />
        <button type="submit" disabled={state === 'sending'} style={buttonStyle}>
          {state === 'sending' ? 'Sending…' : buttonLabel}
        </button>
      </div>
      {failed && message && <Note tone="bad">{message}</Note>}
    </form>
  );
}

/* -------------------------------------------------------------- video */

export interface VideoFacadeProps {
  embedUrl: string;
  title: string;
  poster?: string;
  ratio: string;
}

/**
 * A poster with a play button that becomes the real player only when pressed.
 *
 * Not a nicety. An `<iframe>` rendered at page load contacts YouTube for every
 * visitor who never watches anything, which on a portfolio is most of them —
 * it costs about half a megabyte, sets third-party state, and makes the owner
 * responsible for a disclosure they did not know they needed. `youtube-nocookie`
 * reduces that; not loading it at all removes it.
 *
 * It also happens to be much faster, which is the version people notice.
 */
export function VideoFacade({ embedUrl, title, poster, ratio }: VideoFacadeProps) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <iframe
        src={`${embedUrl}${embedUrl.includes('?') ? '&' : '?'}autoplay=1`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        style={{
          display: 'block',
          width: '100%',
          aspectRatio: ratio,
          border: 0,
          borderRadius: 'var(--radius-md)',
          background: 'var(--surface-secondary)',
        }}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      aria-label={`Play: ${title}`}
      style={{
        position: 'relative',
        display: 'block',
        width: '100%',
        aspectRatio: ratio,
        padding: 0,
        border: 'var(--hairline) solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        background: poster
          ? `center / cover no-repeat url("${poster}")`
          : 'var(--surface-secondary)',
        cursor: 'pointer',
      }}
    >
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <span
          style={{
            display: 'grid',
            placeItems: 'center',
            // Generous, because it is the only target on the element and it is
            // pressed on a phone. WCAG 2.5.8 floors this at 24px.
            width: 'var(--space-16)',
            height: 'var(--space-16)',
            borderRadius: 'var(--radius-full)',
            background: 'var(--btn-primary-bg)',
            color: 'var(--btn-primary-text)',
            fontSize: 'var(--text-xl)',
          }}
        >
          ▶
        </span>
      </span>
    </button>
  );
}
