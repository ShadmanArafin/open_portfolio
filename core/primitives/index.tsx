import React from 'react';
import { resolveFrame, SPACING_STYLE, SURFACE_STYLE, WIDTH_STYLE, type BlockFrame } from './frame';
import { Deeper, useHeadingLevel } from './heading-level';

/**
 * The closed set of primitives every block composes from.
 *
 * Blocks own semantics; themes own tokens; these are the only thing that
 * touches both. A block may not emit its own colours, sizes or spacing — the
 * ESLint boundary rule enforces that — so if something cannot be expressed with
 * a primitive, the answer is a new primitive or a new variant, never a
 * one-off style in a block. Restyle a primitive and every block that uses it
 * changes at once, which is what makes "add a theme" cost a token file rather
 * than a reimplementation of thirty blocks.
 *
 * Everything here reads tokens through `var()` and inline styles rather than
 * utility classes, deliberately: it keeps the primitives independent of which
 * CSS framework the project is on, which matters with a Tailwind 4 migration
 * still outstanding.
 */

export * from './frame';
export * from './heading-level';

/* -------------------------------------------------------------------- Band */

/**
 * A full-width horizontal band. The only place `frame` is interpreted.
 *
 * Every top-level block renders exactly one. Centralising it means a change to
 * how `surface` or `spacing` works lands everywhere at once, and no block can
 * quietly disagree about what "loose" means.
 */
export function Band({
  frame,
  children,
  id,
}: {
  frame?: Partial<BlockFrame>;
  children: React.ReactNode;
  id?: string;
}) {
  const f = resolveFrame(frame);
  const surface = SURFACE_STYLE[f.surface];
  const borderStyle = '1px solid var(--border-color)';

  return (
    <section
      id={id}
      style={{
        background: surface.background,
        color: surface.color,
        paddingBlock: SPACING_STYLE[f.spacing],
        paddingInline: 'var(--gutter)',
        borderTop: f.divider === 'top' || f.divider === 'both' ? borderStyle : undefined,
        borderBottom: f.divider === 'bottom' || f.divider === 'both' ? borderStyle : undefined,
        // `scroll-margin` so an in-page anchor does not land under a sticky
        // header — a detail that is invisible until every anchor link is wrong.
        scrollMarginBlockStart: 'var(--space-20)',
      }}
    >
      <div
        style={{
          maxWidth: WIDTH_STYLE[f.width],
          marginInline: 'auto',
          textAlign: f.align === 'center' ? 'center' : undefined,
        }}
      >
        {children}
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------- Measure */

/** Clamps line length. Prose without this reaches 200 characters on a desktop. */
export function Measure({
  narrow,
  center,
  children,
}: {
  narrow?: boolean;
  center?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        maxWidth: narrow ? 'var(--measure-narrow)' : 'var(--measure)',
        marginInline: center ? 'auto' : undefined,
      }}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------- Stack */

type SpaceStep = 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16;

/** Vertical rhythm. The only way a block spaces its own children. */
export function Stack({ gap = 4, children }: { gap?: SpaceStep; children: React.ReactNode }) {
  return <div style={{ display: 'grid', gap: `var(--space-${gap})` }}>{children}</div>;
}

/* -------------------------------------------------------------------- Grid */

/**
 * An intrinsically responsive grid.
 *
 * `columns` is a *maximum*, not a promise. The track sizing is
 * `auto-fit minmax(min(card-min, 100%), 1fr)`, so the browser fits as many as
 * there is room for and no arrangement a user can produce overflows. The
 * `min(…, 100%)` is what stops a wide minimum from forcing a horizontal
 * scrollbar on a narrow phone — the single most common way a naive grid breaks.
 *
 * There are deliberately no breakpoint props. Media queries are how a
 * non-designer ends up with four columns of text at 390px.
 */
export function Grid({
  columns = 3,
  gap = 6,
  children,
}: {
  columns?: 2 | 3 | 4;
  gap?: SpaceStep;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: 'grid',
        gap: `var(--space-${gap})`,
        gridTemplateColumns: `repeat(auto-fit, minmax(min(var(--card-min-${columns}), 100%), 1fr))`,
      }}
    >
      <Deeper>{children}</Deeper>
    </div>
  );
}

/* ---------------------------------------------------------------- Heading */

const HEADING_SIZE = {
  display: 'var(--text-5xl)',
  xl: 'var(--text-4xl)',
  lg: 'var(--text-3xl)',
  md: 'var(--text-2xl)',
  sm: 'var(--text-xl)',
} as const;

/**
 * A heading whose *level* comes from context and whose *size* is chosen freely.
 *
 * Separating the two is the point. A block author picking "this should look
 * large" must not thereby decide the document outline, and a screen-reader user
 * navigating by heading must not be at the mercy of a visual choice.
 */
export function Heading({
  size = 'lg',
  children,
  id,
}: {
  size?: keyof typeof HEADING_SIZE;
  children: React.ReactNode;
  id?: string;
}) {
  const level = useHeadingLevel();
  const Tag = `h${level}` as 'h1';

  return (
    <Tag
      id={id}
      style={{
        fontFamily: 'var(--font-display)',
        fontSize: HEADING_SIZE[size],
        lineHeight: 'var(--leading-tight)',
        letterSpacing: 'var(--tracking-tight)',
        fontWeight: 500,
        color: 'inherit',
        margin: 0,
      }}
    >
      {children}
    </Tag>
  );
}

/* -------------------------------------------------------------------- Text */

export function Text({
  size = 'base',
  tone = 'secondary',
  children,
}: {
  size?: 'sm' | 'base' | 'lg';
  tone?: 'primary' | 'secondary' | 'muted';
  children: React.ReactNode;
}) {
  return (
    <p
      style={{
        fontFamily: 'var(--font-body)',
        fontSize: `var(--text-${size})`,
        lineHeight: 'var(--leading-normal)',
        color: `var(--text-${tone})`,
        margin: 0,
      }}
    >
      {children}
    </p>
  );
}

/** The small capitalised label above a heading. */
export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--text-xs)',
        letterSpacing: 'var(--tracking-wide)',
        textTransform: 'uppercase',
        color: 'var(--accent-color)',
      }}
    >
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------- Prose */

/**
 * Long-form content. Styled entirely through tokens rather than
 * `@tailwindcss/typography`, so a theme restyles prose by changing tokens
 * instead of overriding baked-in values.
 */
export function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        maxWidth: 'var(--measure)',
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-base)',
        lineHeight: 'var(--leading-relaxed)',
        color: 'var(--text-secondary)',
        display: 'grid',
        gap: 'var(--space-4)',
      }}
    >
      {children}
    </div>
  );
}

/* -------------------------------------------------------------------- Card */

export function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: 'var(--surface-primary)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-6)',
        display: 'grid',
        gap: 'var(--space-3)',
      }}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ Divider */

export function Divider() {
  return <hr style={{ border: 0, borderTop: '1px solid var(--border-color)', margin: 0 }} />;
}

/* ------------------------------------------------------------------- Media */

/**
 * An image with a required alt decision.
 *
 * `alt` is not optional, and a decorative image must say so explicitly rather
 * than omitting it. Making the author choose is the only reliable way to get
 * alt text: a field that can be skipped is skipped.
 */
export function Media({
  src,
  alt,
  decorative,
  ratio = '4 / 3',
  fit = 'cover',
  priority,
}: {
  src: string;
  alt: string;
  decorative?: boolean;
  ratio?: string;
  fit?: 'cover' | 'contain';
  priority?: boolean;
}) {
  // A plain <img> rather than next/image, for now. Media URLs come from
  // whichever storage adapter is configured — a same-origin /api/media path on
  // one, a Supabase or Blob host on another — and next/image needs every one of
  // those declared in remotePatterns ahead of time, which a user choosing their
  // backend at deploy time cannot do. Explicit aspect-ratio prevents the layout
  // shift that is the main thing next/image would have bought here; real
  // optimisation is its own task.
  return (
    <img
      src={src}
      alt={decorative ? '' : alt}
      role={decorative ? 'presentation' : undefined}
      // Lazy by default; `priority` opts the one above-the-fold image out.
      // Getting this backwards is a measurable hit to Largest Contentful Paint.
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      style={{
        display: 'block',
        width: '100%',
        aspectRatio: ratio,
        objectFit: fit,
        borderRadius: 'var(--radius-md)',
        background: 'var(--surface-secondary)',
      }}
    />
  );
}

/* ------------------------------------------------------------------ Button */

export function Button({
  href,
  variant = 'primary',
  children,
  onClick,
  type,
}: {
  href?: string;
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
}) {
  const style: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
    minHeight: '2.75rem',
    paddingInline: 'var(--space-6)',
    borderRadius: 'var(--radius-full)',
    fontFamily: 'var(--font-body)',
    fontSize: 'var(--text-sm)',
    fontWeight: 500,
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'opacity var(--motion-fast) var(--ease-standard)',
    background: variant === 'primary' ? 'var(--btn-primary-bg)' : 'transparent',
    color: variant === 'primary' ? 'var(--btn-primary-text)' : 'var(--btn-secondary-text)',
    border: variant === 'primary' ? 'none' : '1px solid var(--btn-secondary-border)',
  };

  // A real anchor when it navigates, a real button when it acts. Never a div:
  // that is how keyboard and screen-reader support is lost.
  if (href) {
    return (
      <a href={href} style={style}>
        {children}
      </a>
    );
  }
  return (
    <button type={type ?? 'button'} onClick={onClick} style={style}>
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------- Metric */

/** A large figure above a caption. */
export function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div style={{ display: 'grid', gap: 'var(--space-1)' }}>
      <span
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-3xl)',
          lineHeight: 'var(--leading-tight)',
          color: 'var(--text-primary)',
        }}
      >
        {value}
      </span>
      <span
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-sm)',
          color: 'var(--text-muted)',
        }}
      >
        {label}
      </span>
    </div>
  );
}

/* --------------------------------------------------------------------- Pill */

export function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        paddingInline: 'var(--space-3)',
        paddingBlock: 'var(--space-1)',
        borderRadius: 'var(--radius-full)',
        border: '1px solid var(--badge-border)',
        background: 'var(--badge-bg)',
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--text-2xs)',
        letterSpacing: 'var(--tracking-wide)',
        textTransform: 'uppercase',
        color: 'var(--text-secondary)',
      }}
    >
      {children}
    </span>
  );
}
