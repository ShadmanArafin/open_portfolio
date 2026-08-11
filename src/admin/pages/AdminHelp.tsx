'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Badge } from '@astryxdesign/core/Badge';
import { Banner } from '@astryxdesign/core/Banner';
import { Button } from '@astryxdesign/core/Button';
import { Card } from '@astryxdesign/core/Card';
import { Divider } from '@astryxdesign/core/Divider';
import { HStack, VStack } from '@astryxdesign/core/Layout';
import { Link } from '@astryxdesign/core/Link';
import { Switch } from '@astryxdesign/core/Switch';
import { Text } from '@astryxdesign/core/Text';
import { AdminRecord, AdminRecordList } from '../components/AdminRecord';
import { AstryxHeader, AstryxSection } from '../components/astryx/AstryxComponents';
import { TextArea, TextInput } from '../components/AdminFields';
import { recentErrors } from '../utils/errorLog';
import { buildBody, buildIssueUrl, isReportReady, type Report } from '@/core/support/report';
import { formatDiagnostics, type Diagnostics } from '@/core/support/diagnostics';
import { UPSTREAM_URL } from '@/core/version';

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

/**
 * Reporting a bug, asking for a feature, and finding out what changed.
 *
 * The report goes to GitHub as a pre-filled new issue, opened in a tab. No
 * token, no intake server, nothing of ours in the middle — and the issue is
 * authored by them, which is what makes a thank-you in the release notes
 * accurate rather than guessed at.
 *
 * The whole value this screen adds is the diagnostics. A person reporting "the
 * contact form is broken" cannot be expected to know that the version, the
 * storage backend and the host answer most of the first questions anybody would
 * ask. So it collects them, **shows them in full before anything is sent**, and
 * lets them be switched off. Attaching information somebody has not seen to a
 * message they are about to publish under their own name is not acceptable, no
 * matter how ordinary the information is.
 */

interface SupportInfo {
  server: {
    version: string;
    adapter: string;
    host: string;
    nodeVersion: string;
    emailConfigured: boolean;
  };
  content: Diagnostics['content'];
  updates: {
    current: string;
    latest: string | null;
    updateAvailable: boolean;
    newReleases: {
      version: string;
      name: string;
      publishedAt: string;
      body: string;
      url: string;
    }[];
    problem?: string;
  };
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
const Duplicates: React.FC<{
  matches: Match[];
  searching: boolean;
  problem?: string;
  kind: 'bug' | 'feature';
  currentVersion?: string;
}> = ({ matches, searching, problem, kind, currentVersion }) => {
  if (problem) return <Banner status="info" title={problem} />;
  if (searching && matches.length === 0) {
    return (
      <Text type="supporting" display="block">
        Checking whether this has come up before…
      </Text>
    );
  }
  if (matches.length === 0) return null;

  const fixed = matches.filter((m) => m.fixedInNewerVersion);
  const open = matches.filter((m) => m.state === 'open');
  const done = matches.filter((m) => m.state === 'closed' && !m.fixedInNewerVersion);

  return (
    <VStack gap={3}>
      {fixed.length > 0 && (
        <Banner
          status="success"
          title={`This looks like it was already fixed in ${fixed[0].fixedIn}`}
          description={`You are on ${currentVersion ?? 'an older version'}. Updating should make it go away — there is nothing to report. See "What's new" below for how.`}
        />
      )}

      {fixed.length === 0 && open.length > 0 && (
        <Banner
          status="warning"
          title={
            kind === 'bug'
              ? 'Somebody may have reported this already'
              : 'Somebody may have asked for this already'
          }
          description={
            kind === 'bug'
              ? 'Adding what you know to the existing report is worth more than a second one — it is the extra detail that usually makes a bug reproducible.'
              : 'Reacting to the existing request counts. A request with twenty reactions gets built before twenty requests with one each.'
          }
        />
      )}

      <Card>
        <VStack gap={3}>
          {matches.map((match) => (
            <HStack key={match.number} gap={2} align="center" justify="between">
              <VStack gap={1}>
                <Link href={match.url} target="_blank" rel="noreferrer noopener">
                  {`#${match.number} ${match.title}`}
                </Link>
                <HStack gap={2} align="center">
                  <Badge
                    variant={
                      match.fixedInNewerVersion
                        ? 'green'
                        : match.state === 'open'
                          ? 'yellow'
                          : 'neutral'
                    }
                    label={
                      match.fixedInNewerVersion
                        ? `Fixed in ${match.fixedIn}`
                        : match.state === 'open'
                          ? 'Still open'
                          : 'Closed'
                    }
                  />
                  <Text type="supporting">
                    {`${match.comments} comment${match.comments === 1 ? '' : 's'}`}
                    {match.reactions > 0
                      ? ` · ${match.reactions} reaction${match.reactions === 1 ? '' : 's'}`
                      : ''}
                  </Text>
                </HStack>
              </VStack>
            </HStack>
          ))}
        </VStack>
      </Card>

      {done.length > 0 && fixed.length === 0 && (
        <Text type="supporting" display="block">
          Some of these are closed. Worth a glance before sending — it may have been decided
          already, and the reason will be in the thread.
        </Text>
      )}
    </VStack>
  );
};

export const AdminHelp: React.FC = () => {
  const [info, setInfo] = useState<SupportInfo | null>(null);
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

  useEffect(() => {
    void (async () => {
      const res = await fetch('/api/admin/support');
      const data = await res.json().catch(() => null);
      if (data?.ok) setInfo(data);
    })();
  }, []);

  const errors = useMemo(() => recentErrors(), [info]);

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

  const diagnostics = useMemo((): Diagnostics | undefined => {
    if (!includeDiagnostics || !info) return undefined;
    return {
      server: info.server,
      content: info.content,
      client: {
        userAgent: navigator.userAgent,
        screen: `${window.screen.width}×${window.screen.height}`,
        language: navigator.language,
      },
      errors: includeErrors && errors.length ? errors : undefined,
    };
  }, [includeDiagnostics, includeErrors, info, errors]);

  const open = (report: Report) => {
    window.open(buildIssueUrl(report, diagnostics), '_blank', 'noopener,noreferrer');
  };

  return (
    <VStack gap={6}>
      <AstryxHeader
        title="Help and feedback"
        subtitle="Report something broken, ask for something new, and see what changed in the latest version."
      />

      {info?.updates.updateAvailable && (
        <Banner
          status="info"
          title={`Version ${info.updates.latest} is available — you are on ${info.updates.current}`}
          description="Updating replaces the code only. Everything you have written stays exactly where it is, because it lives in your database rather than in the code."
        >
          <HStack gap={2}>
            <Link
              href={`${UPSTREAM_URL}/releases/tag/v${info.updates.latest}`}
              target="_blank"
              rel="noreferrer noopener"
            >
              What changed
            </Link>
            <Link href="#whats-new">Read it here</Link>
          </HStack>
        </Banner>
      )}

      <AstryxSection
        title="Tell us about it"
        description="Both of these open a pre-filled page on GitHub. Nothing is sent until you press the button there, and you can edit anything first."
      >
        <AdminRecordList>
          <AdminRecord
            value="bug"
            title="Something is broken"
            summary="Report a bug. The more of this you fill in, the faster it gets fixed."
          >
            <VStack gap={4}>
              <TextInput
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
                currentVersion={info?.server.version}
              />
              <TextArea
                label="What happened?"
                rows={3}
                value={(bug as { whatHappened: string }).whatHappened}
                onChange={(value) => setBug({ ...bug, whatHappened: value } as Report)}
              />
              <TextArea
                label="What did you expect instead?"
                rows={2}
                value={(bug as { whatIExpected: string }).whatIExpected}
                onChange={(value) => setBug({ ...bug, whatIExpected: value } as Report)}
              />
              <TextArea
                label="How can somebody else make it happen?"
                rows={3}
                description="Even roughly. 'Went to Pages, added a Gallery, pressed Publish' is enough."
                value={(bug as { steps: string }).steps}
                onChange={(value) => setBug({ ...bug, steps: value } as Report)}
              />
              <HStack gap={2}>
                <Button
                  variant="primary"
                  label="Open it on GitHub"
                  isDisabled={!isReportReady(bug)}
                  onClick={() => open(bug)}
                />
                <Button variant="ghost" label="Clear" onClick={() => setBug(EMPTY_BUG)} />
              </HStack>
            </VStack>
          </AdminRecord>

          <AdminRecord
            value="feature"
            title="Something is missing"
            summary="Ask for a feature. Describing the problem matters more than describing the solution."
          >
            <VStack gap={4}>
              <TextInput
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
                currentVersion={info?.server.version}
              />
              <TextArea
                label="What are you trying to do that you cannot?"
                rows={3}
                description="The problem, not the solution. It often turns out there is a better answer than the one anybody had in mind."
                value={(feature as { problem: string }).problem}
                onChange={(value) => setFeature({ ...feature, problem: value } as Report)}
              />
              <TextArea
                label="What did you have in mind?"
                rows={3}
                value={(feature as { idea: string }).idea}
                onChange={(value) => setFeature({ ...feature, idea: value } as Report)}
              />
              <TextInput
                label="Who else would this help?"
                placeholder="Photographers, anyone with more than one client"
                value={(feature as { whoElse: string }).whoElse}
                onChange={(value) => setFeature({ ...feature, whoElse: value } as Report)}
              />
              <HStack gap={2}>
                <Button
                  variant="primary"
                  label="Open it on GitHub"
                  isDisabled={!isReportReady(feature)}
                  onClick={() => open(feature)}
                />
                <Button variant="ghost" label="Clear" onClick={() => setFeature(EMPTY_FEATURE)} />
              </HStack>
            </VStack>
          </AdminRecord>
        </AdminRecordList>
      </AstryxSection>

      <Divider />

      <AstryxSection
        title="What gets attached"
        description="Added to the end of whatever you write, so somebody can work out what is going on without a conversation first. Nothing you have written is included — no page text, no addresses, no passwords."
      >
        <VStack gap={4}>
          <Switch
            label="Attach details about this site"
            description="Version, storage backend, host, browser, and how many pages and blocks you have."
            value={includeDiagnostics}
            onChange={setIncludeDiagnostics}
          />
          <Switch
            label="Attach recent errors"
            description={
              errors.length
                ? `${errors.length} error${errors.length === 1 ? '' : 's'} recorded in this session.`
                : 'Nothing has gone wrong in this session so far.'
            }
            value={includeErrors}
            onChange={setIncludeErrors}
            isDisabled={!includeDiagnostics || errors.length === 0}
          />

          {/* Shown in full, always. Attaching something somebody has not read to
              a message they are about to publish under their own name is not
              something a "we collect anonymous diagnostics" sentence covers. */}
          {diagnostics && (
            <Card>
              <Text type="supporting" display="block">
                <pre
                  style={{
                    margin: 0,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: '0.8rem',
                  }}
                >
                  {formatDiagnostics(diagnostics)}
                </pre>
              </Text>
            </Card>
          )}
        </VStack>
      </AstryxSection>

      <Divider />

      <AstryxSection
        title="What's new"
        description="Releases you have not got yet. Every one of them credits the people who reported or suggested what changed."
      >
        <VStack gap={4} id="whats-new">
          {info?.updates.problem && (
            <Banner
              status="info"
              title="Could not check for updates"
              description={info.updates.problem}
            />
          )}

          {info && !info.updates.problem && info.updates.newReleases.length === 0 && (
            <Text type="supporting" display="block">
              You are on the newest version ({info.updates.current}).
            </Text>
          )}

          {info?.updates.newReleases.map((release) => (
            <Card key={release.version}>
              <VStack gap={2}>
                <HStack gap={2} align="center">
                  <Text type="label">{release.name}</Text>
                  <Badge variant="neutral" label={release.publishedAt.slice(0, 10)} />
                </HStack>
                {/* Plain text, deliberately. This is Markdown fetched from the
                    internet; rendering it as HTML in the admin would be an
                    injection route through somebody else's release notes. */}
                <Text type="supporting" display="block">
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {release.body.slice(0, 2000) || 'No notes for this release.'}
                  </pre>
                </Text>
                <Link href={release.url} target="_blank" rel="noreferrer noopener">
                  Read it on GitHub
                </Link>
              </VStack>
            </Card>
          ))}

          {info?.updates.updateAvailable && (
            <Banner
              status="info"
              title="How to update"
              description="Open the Actions tab of your own copy on GitHub, choose 'Check for updates', and press 'Run workflow'. It prepares the update and opens a pull request for you to merge. Your content is not touched."
            />
          )}
        </VStack>
      </AstryxSection>

      <Divider />

      <AstryxSection title="This site" description="Handy if you are asking for help anywhere.">
        {info ? (
          <VStack gap={2}>
            <Text type="supporting" display="block">
              Version {info.server.version} · {info.server.adapter} · {info.server.host} · Node{' '}
              {info.server.nodeVersion}
            </Text>
            <HStack gap={2}>
              <Link href={UPSTREAM_URL} target="_blank" rel="noreferrer noopener">
                The project on GitHub
              </Link>
              <Link href={`${UPSTREAM_URL}/issues`} target="_blank" rel="noreferrer noopener">
                Everything already reported
              </Link>
            </HStack>
            <Button
              variant="secondary"
              size="sm"
              label="Copy these details"
              onClick={() => {
                void navigator.clipboard.writeText(
                  diagnostics ? formatDiagnostics(diagnostics) : buildBody(bug)
                );
              }}
            />
          </VStack>
        ) : (
          <Text type="supporting" display="block">
            Loading…
          </Text>
        )}
      </AstryxSection>
    </VStack>
  );
};
