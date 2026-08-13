'use client';

import React, { useMemo, useState } from 'react';
import type { CMSState } from '@/cms/types/cms';
import { analyseContent } from '@/cms/utils/contentHealth';
import { auditContrast, describeFailure } from '../../../core/theme/audit';
import { getThemePreset } from '../../../core/theme/presets';
import { toCsv } from '../../../core/newsletter/schema';
import { DEMO_SUBSCRIBERS } from '@/lib/demo/state';
import { THEMES } from '@/lib/demo/render';
import type { Persona } from '@/lib/demo/personas';

/**
 * The rest of the admin.
 *
 * The demo shipped with the page builder and nothing else, on the reasoning
 * that it is the screen which decides whether the tool is for you. That was
 * true and it was also an excuse: almost every other screen in this product is
 * a list and a form over content the demo already has, and leaving them out
 * made the tool look thinner than it is.
 *
 * Two of these are not simulations at all. The dashboard runs
 * `analyseContent` — the product's own checks — against the demo's
 * state, so the issues it lists are the issues a real install would list.
 * Appearance runs `auditContrast` and refuses an unreadable palette exactly as
 * publishing does. Both are imported, not reimplemented.
 *
 * What is still absent is named on the screen rather than hidden: uploading,
 * saving service credentials and the GitHub device flow cannot happen without a
 * server, and saying so is better than a screen that pretends.
 */

/* ------------------------------------------------------------------ shared */

export function Screen({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="screen">
      <h2 className="screen__title">{title}</h2>
      {hint && <p className="studio__hint">{hint}</p>}
      {children}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  help,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  help?: string;
  type?: string;
}) {
  return (
    <label className="screen__field">
      <span>{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} />
      {help && <em>{help}</em>}
    </label>
  );
}

function Rows({ children }: { children: React.ReactNode }) {
  return <ul className="screen__rows">{children}</ul>;
}

/* --------------------------------------------------------------- dashboard */

export function Dashboard({ state, onGo }: { state: CMSState; onGo: (screen: string) => void }) {
  // The product's own checks, on the demo's own content. `emailConfigured` is
  // false because there is no mail server here — which is exactly the state a
  // fresh install is in, and the check that catches it is a real one.
  const report = useMemo(() => analyseContent(state, () => 1, { emailConfigured: false }), [state]);

  const route: Record<string, string> = {
    '/appearance': 'appearance',
    '/seo': 'seo',
    '/projects': 'work',
    '/messages': 'messages',
    '/media': 'media',
    '/writing': 'writing',
    '/settings': 'settings',
    '/pages': 'pages',
    '/homepage': 'pages',
  };

  return (
    <Screen
      title="Dashboard"
      hint={`${report.total} checks over your published site. Every one links to the screen that fixes it.`}
    >
      <div className="screen__metrics">
        <div>
          <strong>{report.score}%</strong>
          <span>
            {report.passed} of {report.total} checks passing
          </span>
        </div>
        <div>
          <strong>{report.liveProjects}</strong>
          <span>Live pieces of work</span>
        </div>
        <div>
          <strong>{report.unreadMessages}</strong>
          <span>Unread enquiries</span>
        </div>
        <div>
          <strong>{report.daysSincePublish ?? '—'}</strong>
          <span>Days since publishing</span>
        </div>
      </div>

      {report.issues.length === 0 ? (
        <p className="studio__hint">Nothing outstanding.</p>
      ) : (
        <Rows>
          {report.issues.map((issue) => (
            <li key={issue.id}>
              <span className={`screen__sev screen__sev--${issue.severity}`}>{issue.severity}</span>
              <span className="screen__rowmain">
                <strong>{issue.title}</strong>
                <em>{issue.detail}</em>
              </span>
              <button type="button" onClick={() => onGo(route[issue.to] ?? 'pages')}>
                {issue.action}
              </button>
            </li>
          ))}
        </Rows>
      )}
    </Screen>
  );
}

/* -------------------------------------------------------------- appearance */

export function Appearance({
  themeId,
  onTheme,
  accent,
  background,
  onAccent,
  onBackground,
}: {
  themeId: string;
  onTheme: (id: string) => void;
  accent: string;
  background: string;
  onAccent: (v: string) => void;
  onBackground: (v: string) => void;
}) {
  const preset = getThemePreset(themeId);

  // The real gate. `auditContrast` is what the publish endpoint calls, so a
  // palette refused here is refused there — including the specific failure this
  // catches, a pale accent on a pale background that looks fine to whoever
  // picked it on a good monitor.
  const audit = useMemo(
    () =>
      auditContrast({
        accentLight: accent || preset.colours.accentLight,
        backgroundLight: background || preset.colours.backgroundLight,
        strokeLight: preset.colours.strokeLight,
        accentDark: preset.colours.accentDark,
        backgroundDark: preset.colours.backgroundDark,
        strokeDark: preset.colours.strokeDark,
      }),
    [accent, background, preset]
  );

  return (
    <Screen
      title="Appearance"
      hint="Six complete looks. Change anything on top of one and your change wins; anything you leave alone follows the theme."
    >
      <div className="screen__themes">
        {THEMES.map((theme) => (
          <button
            key={theme.id}
            type="button"
            aria-pressed={theme.id === themeId}
            onClick={() => onTheme(theme.id)}
          >
            <strong>{theme.name}</strong>
            <span>{theme.description}</span>
          </button>
        ))}
      </div>

      <div className="screen__pair">
        <Field
          label="Accent"
          type="color"
          value={accent || preset.colours.accentLight}
          onChange={onAccent}
          help="One colour. Everything else is worked out from it."
        />
        <Field
          label="Background"
          type="color"
          value={background || preset.colours.backgroundLight}
          onChange={onBackground}
          help="Light mode. Dark follows the theme."
        />
      </div>

      {audit.failures.length > 0 ? (
        <div className="screen__refusal">
          <strong>Publishing would be refused.</strong>
          <ul>
            {audit.failures.map((failure, i) => (
              <li key={i}>{describeFailure(failure)}</li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="screen__pass">Contrast passes. This palette would publish.</p>
      )}

      {/*
        Worth being exact, because the obvious demonstration does not work and
        it would be easy to promise it. Picking a pale accent on a pale
        background here does *not* produce a refusal — the token layer derives
        every text, border and link colour from the background and clamps each
        one to a readable ratio before anything is drawn, so most unreadable
        palettes are prevented rather than rejected. The audit above is the
        backstop for what clamping cannot rescue, and it runs at publish time
        on every install.
      */}
      <p className="studio__hint">
        Trying to make this unreadable is harder than it looks, and deliberately so. Every text,
        border and link colour is derived from your background and clamped to a readable ratio
        before it is drawn — so a bad choice is usually corrected rather than refused. The check
        above is the backstop for what clamping cannot fix, and it runs every time you publish.
      </p>
    </Screen>
  );
}

/* ------------------------------------------------------------------ lists */

export function WorkList({ state, label }: { state: CMSState; label: string }) {
  return (
    <Screen
      title={label}
      hint="Your stuff lives in collections; your pages arrange it. Edit a piece here and every page showing it updates."
    >
      <Rows>
        {state.projects.map((project) => (
          <li key={project.id}>
            <span className="screen__num">{project.number}</span>
            <span className="screen__rowmain">
              <strong>{project.title}</strong>
              <em>{project.shortDescription}</em>
            </span>
            <span className="studio__flag">{project.featured ? 'Featured' : project.year}</span>
          </li>
        ))}
      </Rows>
    </Screen>
  );
}

export function WritingList({ state }: { state: CMSState }) {
  const settings = state.writingSettings;
  return (
    <Screen
      title={settings?.label ?? 'Writing'}
      hint="Built from the same blocks as your pages. You choose what the section is called, whether dates appear at all, and what comes first."
    >
      <Rows>
        {(state.writing ?? []).map((entry) => (
          <li key={entry.id}>
            <span className="screen__rowmain">
              <strong>{entry.title}</strong>
              <em>{entry.summary}</em>
            </span>
            <span className="studio__flag">
              {entry.publishedAt
                ? new Date(entry.publishedAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                  })
                : 'Draft'}
            </span>
          </li>
        ))}
      </Rows>
      <p className="studio__hint">
        Ordered {settings?.order === 'newest' ? 'newest first, like a blog' : 'the way you choose'};
        dates {settings?.showDates ? 'shown' : 'hidden'}. RSS either way.
      </p>
    </Screen>
  );
}

/* ---------------------------------------------------------------- messages */

export function Messages({ state }: { state: CMSState }) {
  const [openId, setOpenId] = useState<string | null>(state.messages[0]?.id ?? null);
  const open = state.messages.find((m) => m.id === openId);

  return (
    <Screen
      title="Messages"
      hint="Enquiries from the contact form. They are stored on the server first and emailed second, so a misconfigured mail server loses a notification rather than somebody's message."
    >
      <div className="screen__split">
        <Rows>
          {state.messages.map((message) => (
            <li key={message.id} data-selected={message.id === openId ? 'true' : 'false'}>
              <button type="button" onClick={() => setOpenId(message.id)}>
                <span className="screen__rowmain">
                  <strong>{message.name}</strong>
                  <em>
                    {message.projectType} ·{' '}
                    {new Date(message.receivedAt).toLocaleDateString(undefined, {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </em>
                </span>
                {message.status === 'unread' && <span className="studio__flag">New</span>}
              </button>
            </li>
          ))}
        </Rows>

        {open && (
          <div className="screen__reading">
            <strong>{open.name}</strong>
            <em>
              {open.email} · {open.company}
            </em>
            <p>{open.message}</p>
          </div>
        )}
      </div>
    </Screen>
  );
}

/* -------------------------------------------------------------- newsletter */

export function Newsletter() {
  const confirmed = DEMO_SUBSCRIBERS.filter((s) => s.status === 'confirmed');

  const csv = useMemo(
    () =>
      toCsv(
        DEMO_SUBSCRIBERS.map((s, i) => ({
          id: String(i),
          email: s.email,
          status: s.status as 'confirmed' | 'pending',
          requestedAt: s.when,
          confirmedAt: s.status === 'confirmed' ? s.when : undefined,
          source: s.source,
        }))
      ),
    []
  );

  return (
    <Screen
      title="Newsletter"
      hint="Collects addresses and hands you the list. It does not send — broadcasting is a different product with different obligations."
    >
      <Rows>
        {DEMO_SUBSCRIBERS.map((subscriber) => (
          <li key={subscriber.email}>
            <span className="screen__rowmain">
              <strong>{subscriber.email}</strong>
              <em>
                {subscriber.status === 'confirmed'
                  ? `Confirmed ${subscriber.when}`
                  : `Asked ${subscriber.when} — has not confirmed yet`}
              </em>
            </span>
            {subscriber.status !== 'confirmed' && <span className="studio__flag">Pending</span>}
          </li>
        ))}
      </Rows>

      <p className="studio__hint">
        {confirmed.length} confirmed. The export contains only those — they are the only ones you
        may lawfully mail. Here is exactly what the button would hand you:
      </p>
      {/* The real `toCsv`, so the columns shown are the columns you would get. */}
      <pre className="screen__csv">{csv}</pre>
    </Screen>
  );
}

/* --------------------------------------------------------------------- seo */

export function Seo({
  title,
  description,
  onTitle,
  onDescription,
  persona,
}: {
  title: string;
  description: string;
  onTitle: (v: string) => void;
  onDescription: (v: string) => void;
  persona: Persona;
}) {
  const tooLong = description.length > 160;

  return (
    <Screen
      title="Search and sharing"
      hint="What a search engine shows, and what appears when somebody pastes your address into a message."
    >
      <Field label="Title" value={title} onChange={onTitle} help="Under about 60 characters." />
      <Field
        label="Search description"
        value={description}
        onChange={onDescription}
        help={`${description.length} characters. Around 150 is right.`}
      />

      {tooLong && (
        <p className="screen__warn">
          This will be cut off mid-sentence. The dashboard flags it too.
        </p>
      )}

      <p className="studio__hint">Roughly how it will look:</p>
      <div className="screen__serp">
        <span>{persona.name.toLowerCase().replace(/\s+/g, '')}.example</span>
        <strong>{title || `${persona.name} — ${persona.role}`}</strong>
        <em>{(description || 'Guessed from your page.').slice(0, 160)}</em>
      </div>
    </Screen>
  );
}

/* ------------------------------------------------------------------- media */

export function Media() {
  return (
    <Screen
      title="Media library"
      hint="Everything you upload lives here, so the same picture never needs uploading twice. Every image asks what it shows — read aloud to anyone using a screen reader, and shown if the image fails."
    >
      <div className="screen__gallery">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} />
        ))}
      </div>
      <p className="screen__off">
        Uploading is switched off in the demo, and in the hosted one too. A public editor that
        accepts files is a free file host within a day of being noticed.
      </p>
    </Screen>
  );
}

/* ----------------------------------------------------------------- history */

export function History({ state }: { state: CMSState }) {
  return (
    <Screen
      title="Version history"
      hint="Every publish snapshots the whole site. The last twenty are kept and any of them can be restored into your draft."
    >
      <Rows>
        {state.versions.map((version) => (
          <li key={version.id}>
            <span className="screen__rowmain">
              <strong>{version.summary}</strong>
              <em>
                {new Date(version.timestamp).toLocaleString()} · {version.editor}
              </em>
            </span>
            <span className="studio__flag">Restore</span>
          </li>
        ))}
      </Rows>
    </Screen>
  );
}

/* -------------------------------------------------------------- honest gaps */

export function NotHere({ title, what, why }: { title: string; what: string; why: string }) {
  return (
    <Screen title={title} hint={what}>
      <p className="screen__off">{why}</p>
    </Screen>
  );
}
