import 'server-only';
import { APP_VERSION, RELEASES_API, explainGitHubStatus, isNewerThan } from '@/core/version';

/**
 * Is there a newer version, and what changed?
 *
 * Asked of GitHub's public API, from the owner's own server, with no key and no
 * call to anything of ours. Nothing about their site leaves the building: the
 * request carries no version, no domain and no identifier, so this cannot
 * become a census of who is running what.
 *
 * Every failure returns "no idea" rather than throwing. An admin page must not
 * break because GitHub is rate-limiting an unauthenticated request, and a site
 * that cannot reach the internet is a normal thing rather than a fault.
 */

export interface ReleaseNote {
  version: string;
  name: string;
  publishedAt: string;
  /** Markdown, as written in the release. Shown, never executed. */
  body: string;
  url: string;
}

export interface UpdateStatus {
  current: string;
  latest: string | null;
  updateAvailable: boolean;
  /** Newest first, and only the ones this install has not yet got. */
  newReleases: ReleaseNote[];
  /** Set when the check could not be made. The screen says so plainly. */
  problem?: string;
}

interface GitHubRelease {
  tag_name: string;
  name: string | null;
  published_at: string;
  body: string | null;
  html_url: string;
  draft: boolean;
  prerelease: boolean;
}

/**
 * Cached for an hour.
 *
 * Unauthenticated GitHub allows sixty requests an hour per IP. On a serverless
 * host that IP is shared with strangers, so a check on every admin page load
 * would spend the whole allowance and start reporting "no idea" to everybody.
 */
const CACHE_MS = 60 * 60 * 1000;
let cache: { at: number; releases: ReleaseNote[]; problem?: string } | null = null;

/**
 * Every published release, newest first.
 *
 * Cached and shared, because two features need it: "is there an update" wants
 * the newest, and "which version fixed this bug" wants all of them with their
 * dates. Fetching twice would double the cost of the thing most likely to be
 * rate-limited.
 */
export async function allReleases(force = false): Promise<{
  releases: ReleaseNote[];
  problem?: string;
}> {
  if (!force && cache && Date.now() - cache.at < CACHE_MS) {
    return { releases: cache.releases, problem: cache.problem };
  }

  try {
    const response = await fetch(`${RELEASES_API}?per_page=50`, {
      headers: { Accept: 'application/vnd.github+json' },
      // Next would otherwise cache this indefinitely at the fetch layer, which
      // would make the hourly cache above meaningless in both directions.
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      const problem = explainGitHubStatus(response.status, 'check for updates');
      cache = { at: Date.now(), releases: [], problem };
      return { releases: [], problem };
    }

    const releases = ((await response.json()) as GitHubRelease[])
      .filter((release) => !release.draft && !release.prerelease)
      .map((release): ReleaseNote => ({
        version: release.tag_name.replace(/^v/, ''),
        name: release.name || release.tag_name,
        publishedAt: release.published_at,
        body: release.body ?? '',
        url: release.html_url,
      }));

    cache = { at: Date.now(), releases };
    return { releases };
  } catch (err) {
    const problem =
      err instanceof Error && err.name === 'TimeoutError'
        ? 'GitHub did not answer in time.'
        : 'Could not reach GitHub.';
    return { releases: [], problem };
  }
}

export async function checkForUpdates(force = false): Promise<UpdateStatus> {
  const { releases, problem } = await allReleases(force);
  const latest = releases[0]?.version ?? null;

  return {
    current: APP_VERSION,
    latest,
    updateAvailable: latest ? isNewerThan(latest, APP_VERSION) : false,
    newReleases: releases.filter((release) => isNewerThan(release.version, APP_VERSION)),
    problem,
  };
}

/**
 * The first release published after a moment in time.
 *
 * How "this was fixed in v0.6.0" is worked out without asking the maintainer to
 * keep milestones tidy: an issue closed on the 3rd, with v0.6.0 released on the
 * 9th, shipped in v0.6.0. Not certain — a fix can be closed and then held back —
 * but right almost always, and the alternative is a process nobody follows and
 * therefore an answer nobody gets.
 */
export function releaseAfter(closedAt: string, releases: ReleaseNote[]): ReleaseNote | null {
  const closed = Date.parse(closedAt);
  if (Number.isNaN(closed)) return null;

  const after = releases
    .filter((release) => Date.parse(release.publishedAt) >= closed)
    .sort((a, b) => Date.parse(a.publishedAt) - Date.parse(b.publishedAt));

  return after[0] ?? null;
}
