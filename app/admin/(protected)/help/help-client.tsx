'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode, useSyncExternalStore } from 'react';
import {
  formatDiagnostics,
  type ContentDiagnostics,
  type Diagnostics,
  type RecentError,
  type ServerDiagnostics,
} from '@/core/support/diagnostics';
import { buildBody, buildIssueUrl, isReportReady, type Report } from '@/core/support/report';
import { UPSTREAM_URL } from '@/core/version';
import type { UpdateStatus } from '@/core/updates/check';
import { recentErrors } from '../_components/error-log';
import { CheckField, Field } from '../_components/form-fields';

/**
 * The help screen's island.
 *
 * Same screen the legacy admin had, with the same three answers: report
 * something broken, ask for something new, and see what changed. What the
 * server renders instead of a client fetch is everything that does not need
 * the network — which version this is, the storage backend, the host, the
 * content counts — so the page says what it is before any JavaScript runs.
 *
 * Two deliberate differences from the legacy screen:
 *
 * - The update check (a call to GitHub's public API, cached for an hour and
 *   failing to "no idea") still happens from the browser, as it did before.
 *   It can take up to eight seconds to give up on a server with no route to
 *   GitHub, and the screen somebody opens to report a problem is the last
 *   place that should hang on a request it does not need. The trunk renders
 *   everything else.
 * - The "recent errors" list is no longer guaranteed empty. The legacy
 *   collector was never started anywhere; `error-collector.tsx` in the
 *   protected layout starts it now, so the switch offers what it says it
 *   does.
 */

interface Match {
  number: number;
  title: string;
  url: string;
  state: 'open' | 'closed';
  comments: number;
  reactions: number;
  fixedIn?: string;
  fixedInNewerVersion?: boolean;
}

const EMPTY_BUG: Report = {
  kind: 'bug',
  title: '',
  whatHappened: '',
  whatIExpected: '',
  steps: '',
};

const EMPTY_FEATURE: Report = {
  kind: 'feature',
  title: '',
  problem: '',
  idea: '',
  whoElse: '',
};

const primary =
  'rounded-full bg-text-primary px-4 text-sm font-semibold text-bg disabled:opacity-50';
const secondary =
  'rounded-full border border-border px-3 text-sm text-text-secondary hover:text-text-primary disabled:opacity-50';
const ghost = 'text-sm text-text-secondary underline hover:text-text-primary disabled:opacity-50';

function Notice({
  kind,
  title,
  children,
}: {
  kind: 'info' | 'success' | 'warning';
  title: string;
  children?: ReactNode;
}) {
  const tone =
    kind === 'warning'
      ? 'border-danger bg-danger-subtle'
      : kind === 'success'
        ? 'border-accent'
        : 'border-border bg-surface-secondary';
  return (
    <div role="status" className={`rounded-2xl border p-4 ${tone}`}>
      <p className="m-0 font-semibold">{title}</p>
      {children ? <div className="mt-1 text-sm text-text-secondary">{children}</div> : null}
    </div>
  );
}

/**
 * What already exists that looks like this.
 *
 * The order matters more than the list does. Fixed-in-a-newer-version comes
 * first, because it is the only answer that solves the person's problem today
 * rather than adding them to a queue — and only this screen can give it, since
 * only this site knows which version it is running.
 *
 * Nothing here blocks the report. Everything below is advice, including when
 * the search itself failed: refusing a bug report because a search timed out
 * would be a worse bug than the one being reported.
 */
function Duplicates({
  matches,
  searching,
  problem,
  kind,
  currentVersion,
}: {
  matches: Match[];
  searching: boolean;
  problem?: string;
  kind: 'bug' | 'feature';
  currentVersion?: string;
}) {
  if (problem) return <Notice kind="info" title={problem} />;
  if (searching && matches.length === 0) {
    return (
      <p className="m-0 text-sm text-text-secondary">Checking whether this has come up before…</p>
    );
  }
  if (matches.length === 0) return null;

  const fixed = matches.filter((m) => m.fixedInNewerVersion);
  const open = matches.filter((m) => m.state === 'open');
  const done = matches.filter((m) => m.state === 'closed' && !m.fixedInNewerVersion);

  return (
    <div className="grid gap-3">
      {fixed.length > 0 ? (
        <Notice
          kind="success"
          title={`This looks like it was already fixed in ${fixed[0].fixedIn}`}
        >
          {`You are on ${currentVersion ?? 'an older version'}. Updating should make it go away — there is nothing to report. See "What's new" below for how.`}
        </Notice>
      ) : null}

      {fixed.length === 0 && open.length > 0 ? (
        <Notice
          kind="warning"
          title={
            kind === 'bug'
              ? 'Somebody may have reported this already'
              : 'Somebody may have asked for this already'
          }
        >
          {kind === 'bug'
            ? 'Adding what you know to the existing report is worth more than a second one — it is the extra detail that usually makes a bug reproducible.'
            : 'Reacting to the existing request counts. A request with twenty reactions gets built before twenty requests with one each.'}
        </Notice>
      ) : null}

      <ul className="m-0 grid list-none gap-3 rounded-2xl border border-border p-4">
        {matches.map((match) => (
          <li key={match.number} className="grid gap-1">
            <a href={match.url} target="_blank" rel="noreferrer noopener" className="underline">
              {`#${match.number} ${match.title}`}
            </a>
            <span className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full border px-2 py-0.5 text-xs ${
                  match.fixedInNewerVersion
                    ? 'border-accent text-accent'
                    : 'border-border text-text-muted'
                }`}
              >
                {match.fixedInNewerVersion
                  ? `Fixed in ${match.fixedIn}`
                  : match.state === 'open'
                    ? 'Still open'
                    : 'Closed'}
              </span>
              <span className="text-sm text-text-secondary">
                {`${match.comments} comment${match.comments === 1 ? '' : 's'}`}
                {match.reactions > 0
                  ? ` · ${match.reactions} reaction${match.reactions === 1 ? '' : 's'}`
                  : ''}
              </span>
            </span>
          </li>
        ))}
      </ul>

      {done.length > 0 && fixed.length === 0 ? (
        <p className="m-0 text-sm text-text-secondary">
          Some of these are closed. Worth a glance before sending — it may have been decided
          already, and the reason will be in the thread.
        </p>
      ) : null}
    </div>
  );
}

/**
 * Send, or connect first, or fall back to opening a tab.
 *
 * Three states rather than one, because the honest answer differs. Connected:
 * send it, never leave. Not connected but possible: offer the one-time sign-in,
 * and say what it is for. No GitHub application in this build: keep the old
 * open-a-tab route, which needs nothing and still works.
 *
 * The fallback is not dead weight — it is what a fork with its own repository
 * gets, and what everybody gets if GitHub is unreachable.
 */
function SendControls({
  report,
  github,
  pairing,
  sending,
  sent,
  error,
  onConnect,
  onSend,
  onOpenTab,
  onClear,
}: {
  report: Report;
  github: { available: boolean; connected: boolean; login?: string } | null;
  pairing: { userCode: string; verificationUri: string } | null;
  sending: boolean;
  sent?: { url: string; number: number };
  error?: string;
  onConnect: () => void;
  onSend: () => void;
  onOpenTab: () => void;
  onClear: () => void;
}) {
  const ready = isReportReady(report);

  if (sent) {
    return (
      <Notice kind="success" title={`Sent — that is issue #${sent.number}`}>
        <a href={sent.url} target="_blank" rel="noreferrer noopener" className="underline">
          Follow it here
        </a>
      </Notice>
    );
  }

  if (pairing) {
    return (
      <Notice kind="info" title={`Enter this code on GitHub: ${pairing.userCode}`}>
        A tab should have opened. If it did not, go to github.com/login/device and type the code in.
        This screen will notice on its own.
      </Notice>
    );
  }

  return (
    <div className="grid gap-3">
      {error ? <Notice kind="warning" title={error} /> : null}

      {github?.connected ? (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onSend}
            disabled={!ready || sending}
            className={primary}
            style={{ minHeight: 44 }}
          >
            {sending ? 'Sending…' : 'Send'}
          </button>
          <button type="button" onClick={onClear} className={ghost} style={{ minHeight: 44 }}>
            Clear
          </button>
          <span className="text-sm text-text-secondary">{`Sending as ${github.login}`}</span>
        </div>
      ) : github?.available ? (
        <div className="grid gap-2">
          <p className="m-0 text-sm text-text-secondary">
            Connect your GitHub account once and everything after this happens here. It goes out
            under your own name, so you get credited when it is fixed.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={onConnect} className={primary} style={{ minHeight: 44 }}>
              Connect GitHub
            </button>
            <button
              type="button"
              onClick={onOpenTab}
              disabled={!ready}
              className={secondary}
              style={{ minHeight: 44 }}
            >
              Open it in a tab instead
            </button>
            <button type="button" onClick={onClear} className={ghost} style={{ minHeight: 44 }}>
              Clear
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onOpenTab}
            disabled={!ready}
            className={primary}
            style={{ minHeight: 44 }}
          >
            Open it on GitHub
          </button>
          <button type="button" onClick={onClear} className={ghost} style={{ minHeight: 44 }}>
            Clear
          </button>
        </div>
      )}
    </div>
  );
}

const pre =
  'm-0 whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-text-secondary';

type ClientDiagnostics = {
  userAgent: string;
  screen: string;
  language: string;
};

let clientDiagnostics: ClientDiagnostics | undefined;
/** The same object every time: a store's snapshot must be stable. */
function readClient(): ClientDiagnostics {
  clientDiagnostics ??= {
    userAgent: navigator.userAgent,
    screen: `${window.screen.width}×${window.screen.height}`,
    language: navigator.language,
  };
  return clientDiagnostics;
}
const noSubscription = () => () => {};

export function HelpClient({
  server,
  content,
}: {
  server: ServerDiagnostics;
  content: ContentDiagnostics;
}) {
  const [updates, setUpdates] = useState<UpdateStatus | null>(null);
  const [includeDiagnostics, setIncludeDiagnostics] = useState(true);
  const [includeErrors, setIncludeErrors] = useState(true);
  const [bug, setBug] = useState<Report>(EMPTY_BUG);
  const [feature, setFeature] = useState<Report>(EMPTY_FEATURE);
  const [matches, setMatches] = useState<Record<'bug' | 'feature', Match[]>>({
    bug: [],
    feature: [],
  });
  const [searchProblem, setSearchProblem] = useState<string | undefined>();
  const [searching, setSearching] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [github, setGithub] = useState<{
    available: boolean;
    connected: boolean;
    login?: string;
  } | null>(null);
  const [pairing, setPairing] = useState<{ userCode: string; verificationUri: string } | null>(
    null
  );
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<Record<string, { url: string; number: number }>>({});
  const [sendError, setSendError] = useState<string | undefined>();

  /*
   * A snapshot, taken when the screen loads.
   *
   * State rather than a read during render, so the list shown in the preview
   * is exactly the list that gets sent, rather than whatever happened to be in
   * the buffer at the moment the button was pressed.
   */
  const [errors, setErrors] = useState<RecentError[]>([]);

  /*
   * The browser half of the diagnostics. Read as an external store: once, on
   * the client, with nothing on the server, so the server HTML and the first
   * client render agree and no effect has to copy it into state.
   */
  const client = useSyncExternalStore(noSubscription, readClient, () => undefined);

  useEffect(() => {
    void (async () => {
      const res = await fetch('/api/admin/support');
      const data = await res.json().catch(() => null);
      if (data?.ok) {
        setUpdates(data.updates);
      } else {
        setUpdates({
          current: server.version,
          latest: null,
          updateAvailable: false,
          newReleases: [],
          problem: 'Could not ask this site for the latest version.',
        });
      }
      setErrors(recentErrors());
    })();
  }, [server.version]);

  useEffect(() => {
    void (async () => {
      const res = await fetch('/api/admin/support/connect');
      const data = await res.json().catch(() => null);
      if (data?.ok) setGithub(data);
    })();
  }, []);

  const diagnostics = useMemo((): Diagnostics | undefined => {
    if (!includeDiagnostics) return undefined;
    return {
      server,
      content,
      client,
      errors: includeErrors && errors.length ? errors : undefined,
    };
  }, [includeDiagnostics, includeErrors, server, content, client, errors]);

  /*
   * Sign in once, then never leave the admin again.
   *
   * GitHub's device flow: it issues a short code, the person approves it
   * anywhere — including on a phone, which is half the point — and this polls
   * until it is done. No client secret is involved, so nothing here has to hold
   * a credential that could act as the project.
   */
  const connectGithub = async () => {
    setSendError(undefined);
    const res = await fetch('/api/admin/support/connect', { method: 'POST' });
    const started = await res.json().catch(() => null);
    if (!started?.ok) {
      setSendError(started?.error ?? 'Could not start the sign-in.');
      return;
    }

    setPairing({ userCode: started.userCode, verificationUri: started.verificationUri });
    window.open(started.verificationUri, '_blank', 'noopener,noreferrer');

    const deadline = Date.now() + started.expiresIn * 1000;
    let wait = started.interval * 1000;

    while (Date.now() < deadline) {
      await new Promise((resolve) => setTimeout(resolve, wait));
      const poll = await fetch('/api/admin/support/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceCode: started.deviceCode }),
      });
      const result = await poll.json().catch(() => null);

      if (result?.status === 'connected') {
        setPairing(null);
        setGithub({ available: true, connected: true, login: result.login });
        return;
      }
      // GitHub answers `slow_down` rather than failing when polled too fast,
      // and expects the longer interval to be honoured from then on.
      if (result?.status === 'slow_down') wait = result.interval * 1000;
      if (result?.status === 'failed') {
        setPairing(null);
        setSendError(result.error);
        return;
      }
    }

    setPairing(null);
    setSendError('That sign-in expired. Try again.');
  };

  const send = async (report: Report) => {
    setSending(true);
    setSendError(undefined);
    try {
      const res = await fetch('/api/admin/support/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ report, diagnostics }),
      });
      const result = await res.json().catch(() => null);

      if (result?.ok) {
        setSent((current) => ({ ...current, [report.kind]: result }));
        if (report.kind === 'bug') setBug(EMPTY_BUG);
        else setFeature(EMPTY_FEATURE);
        return;
      }
      if (result?.needsReconnect) setGithub({ available: true, connected: false });
      setSendError(result?.error ?? 'Could not send that.');
    } finally {
      setSending(false);
    }
  };

  /*
   * Look for duplicates while somebody types, not after they have finished.
   *
   * Half a second after the last keystroke: long enough not to search on every
   * letter, short enough that the answer is on screen before they have written
   * the description. Finding out afterwards that this was reported in March is
   * an answer that arrives too late to save anybody anything.
   */
  const search = (kind: 'bug' | 'feature', text: string) => {
    if (timer.current) clearTimeout(timer.current);
    if (text.trim().length < 4) {
      setMatches((current) => ({ ...current, [kind]: [] }));
      return;
    }

    timer.current = setTimeout(() => {
      setSearching(true);
      void (async () => {
        try {
          const res = await fetch('/api/admin/support/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, kind }),
          });
          const data = (await res.json().catch(() => null)) as {
            matches?: Match[];
            problem?: string;
          } | null;
          setMatches((current) => ({ ...current, [kind]: data?.matches ?? [] }));
          setSearchProblem(data?.problem);
        } finally {
          setSearching(false);
        }
      })();
    }, 500);
  };

  const open = (report: Report) => {
    window.open(buildIssueUrl(report, diagnostics), '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="grid gap-6">
      {updates?.updateAvailable ? (
        <Notice
          kind="info"
          title={`Version ${updates.latest} is available — you are on ${updates.current}`}
        >
          <p className="m-0">
            Updating replaces the code only. Everything you have written stays exactly where it is,
            because it lives in your database rather than in the code.
          </p>
          <span className="mt-1 flex flex-wrap gap-3">
            <a
              href={`${UPSTREAM_URL}/releases/tag/v${updates.latest}`}
              target="_blank"
              rel="noreferrer noopener"
              className="underline"
            >
              What changed
            </a>
            <a href="#whats-new" className="underline">
              Read it here
            </a>
          </span>
        </Notice>
      ) : null}

      <section className="grid gap-4">
        <div>
          <h2 className="font-display m-0 text-xl">Tell us about it</h2>
          <p className="m-0 mt-1 text-text-secondary">
            Both of these open a pre-filled page on GitHub. Nothing is sent until you press the
            button there, and you can edit anything first.
          </p>
        </div>

        <details className="rounded-2xl border border-border p-4">
          <summary
            className="cursor-pointer"
            style={{ minHeight: 44, display: 'flex', alignItems: 'center' }}
          >
            <span className="grid gap-1">
              <span className="font-semibold">Something is broken</span>
              <span className="text-sm text-text-secondary">
                Report a bug. The more of this you fill in, the faster it gets fixed.
              </span>
            </span>
          </summary>
          <div className="mt-3 grid gap-4 border-t border-border pt-4">
            <Field
              label="In one line, what is wrong?"
              value={bug.title}
              placeholder="The contact form sends two emails"
              onChange={(value) => {
                setBug({ ...bug, title: value });
                search('bug', value);
              }}
            />

            <Duplicates
              matches={matches.bug}
              searching={searching}
              problem={searchProblem}
              kind="bug"
              currentVersion={server.version}
            />
            <Field
              label="What happened?"
              rows={3}
              value={(bug as { whatHappened: string }).whatHappened}
              onChange={(value) => setBug({ ...bug, whatHappened: value } as Report)}
            />
            <Field
              label="What did you expect instead?"
              rows={2}
              value={(bug as { whatIExpected: string }).whatIExpected}
              onChange={(value) => setBug({ ...bug, whatIExpected: value } as Report)}
            />
            <Field
              label="How can somebody else make it happen?"
              rows={3}
              hint="Even roughly. 'Went to Pages, added a Gallery, pressed Publish' is enough."
              value={(bug as { steps: string }).steps}
              onChange={(value) => setBug({ ...bug, steps: value } as Report)}
            />
            <SendControls
              report={bug}
              github={github}
              pairing={pairing}
              sending={sending}
              sent={sent.bug}
              error={sendError}
              onConnect={connectGithub}
              onSend={() => void send(bug)}
              onOpenTab={() => open(bug)}
              onClear={() => setBug(EMPTY_BUG)}
            />
          </div>
        </details>

        <details className="rounded-2xl border border-border p-4">
          <summary
            className="cursor-pointer"
            style={{ minHeight: 44, display: 'flex', alignItems: 'center' }}
          >
            <span className="grid gap-1">
              <span className="font-semibold">Something is missing</span>
              <span className="text-sm text-text-secondary">
                Ask for a feature. Describing the problem matters more than describing the solution.
              </span>
            </span>
          </summary>
          <div className="mt-3 grid gap-4 border-t border-border pt-4">
            <Field
              label="In one line, what would you like?"
              value={feature.title}
              placeholder="A way to show client testimonials on a page"
              onChange={(value) => {
                setFeature({ ...feature, title: value });
                search('feature', value);
              }}
            />

            <Duplicates
              matches={matches.feature}
              searching={searching}
              problem={searchProblem}
              kind="feature"
              currentVersion={server.version}
            />
            <Field
              label="What are you trying to do that you cannot?"
              rows={3}
              hint="The problem, not the solution. It often turns out there is a better answer than the one anybody had in mind."
              value={(feature as { problem: string }).problem}
              onChange={(value) => setFeature({ ...feature, problem: value } as Report)}
            />
            <Field
              label="What did you have in mind?"
              rows={3}
              value={(feature as { idea: string }).idea}
              onChange={(value) => setFeature({ ...feature, idea: value } as Report)}
            />
            <Field
              label="Who else would this help?"
              placeholder="Photographers, anyone with more than one client"
              value={(feature as { whoElse: string }).whoElse}
              onChange={(value) => setFeature({ ...feature, whoElse: value } as Report)}
            />
            <SendControls
              report={feature}
              github={github}
              pairing={pairing}
              sending={sending}
              sent={sent.feature}
              error={sendError}
              onConnect={connectGithub}
              onSend={() => void send(feature)}
              onOpenTab={() => open(feature)}
              onClear={() => setFeature(EMPTY_FEATURE)}
            />
          </div>
        </details>
      </section>

      <div className="border-t border-border" />

      <section className="grid gap-4">
        <div>
          <h2 className="font-display m-0 text-xl">What gets attached</h2>
          <p className="m-0 mt-1 text-text-secondary">
            Added to the end of whatever you write, so somebody can work out what is going on
            without a conversation first. Nothing you have written is included — no page text, no
            addresses, no passwords.
          </p>
        </div>

        <CheckField
          label="Attach details about this site"
          description="Version, storage backend, host, browser, and how many pages and blocks you have."
          checked={includeDiagnostics}
          onChange={setIncludeDiagnostics}
        />
        <CheckField
          label="Attach recent errors"
          description={
            errors.length
              ? `${errors.length} error${errors.length === 1 ? '' : 's'} recorded in this session.`
              : 'Nothing has gone wrong in this session so far.'
          }
          checked={includeErrors}
          onChange={setIncludeErrors}
          disabled={!includeDiagnostics || errors.length === 0}
        />

        {/* Shown in full, always. Attaching something somebody has not read to
            a message they are about to publish under their own name is not
            something a "we collect anonymous diagnostics" sentence covers. */}
        {diagnostics ? (
          <div className="rounded-2xl border border-border bg-surface-primary p-4">
            <pre className={pre}>{formatDiagnostics(diagnostics)}</pre>
          </div>
        ) : null}
      </section>

      <div className="border-t border-border" />

      <section id="whats-new" className="grid gap-4">
        <div>
          <h2 className="font-display m-0 text-xl">What&apos;s new</h2>
          <p className="m-0 mt-1 text-text-secondary">
            Releases you have not got yet. Every one of them credits the people who reported or
            suggested what changed.
          </p>
        </div>

        <div className="grid gap-4">
          {updates === null ? (
            <p className="m-0 text-sm text-text-secondary">Checking for the latest version…</p>
          ) : null}

          {updates?.problem ? (
            <Notice kind="info" title="Could not check for updates">
              {updates.problem}
            </Notice>
          ) : null}

          {updates && !updates.problem && updates.newReleases.length === 0 ? (
            <p className="m-0 text-sm text-text-secondary">
              {`You are on the newest version (${updates.current}).`}
            </p>
          ) : null}

          {updates?.newReleases.map((release) => (
            <div key={release.version} className="grid gap-2 rounded-2xl border border-border p-4">
              <span className="flex flex-wrap items-center gap-2">
                <span className="font-semibold">{release.name}</span>
                <span className="rounded-full border border-border px-2 py-0.5 text-xs text-text-muted">
                  {release.publishedAt.slice(0, 10)}
                </span>
              </span>
              {/* Plain text, deliberately. This is Markdown fetched from the
                  internet; rendering it as HTML in the admin would be an
                  injection route through somebody else's release notes. */}
              <pre className={pre}>
                {release.body.slice(0, 2000) || 'No notes for this release.'}
              </pre>
              <a
                href={release.url}
                target="_blank"
                rel="noreferrer noopener"
                className="text-sm underline"
              >
                Read it on GitHub
              </a>
            </div>
          ))}

          {updates?.updateAvailable ? (
            <Notice kind="info" title="How to update">
              Open the Actions tab of your own copy on GitHub, choose &apos;Check for updates&apos;,
              and press &apos;Run workflow&apos;. It prepares the update and opens a pull request
              for you to merge. Your content is not touched.
            </Notice>
          ) : null}
        </div>
      </section>

      <div className="border-t border-border" />

      <section className="grid gap-4">
        <div>
          <h2 className="font-display m-0 text-xl">This site</h2>
          <p className="m-0 mt-1 text-text-secondary">Handy if you are asking for help anywhere.</p>
        </div>

        <div className="grid gap-2">
          <p className="m-0 text-sm text-text-secondary">
            {`Version ${server.version} · ${server.adapter} · ${server.host} · Node ${server.nodeVersion}`}
          </p>
          <span className="flex flex-wrap gap-3 text-sm">
            <a
              href={UPSTREAM_URL}
              target="_blank"
              rel="noreferrer noopener"
              className="py-1 underline"
            >
              The project on GitHub
            </a>
            <a
              href={`${UPSTREAM_URL}/issues`}
              target="_blank"
              rel="noreferrer noopener"
              className="py-1 underline"
            >
              Everything already reported
            </a>
          </span>
          <span>
            <button
              type="button"
              className={secondary}
              style={{ minHeight: 44 }}
              onClick={() => {
                void navigator.clipboard.writeText(
                  diagnostics ? formatDiagnostics(diagnostics) : buildBody(bug)
                );
              }}
            >
              Copy these details
            </button>
          </span>
        </div>
      </section>
    </div>
  );
}
