import 'server-only';
import { UPSTREAM, UPSTREAM_URL } from '@/core/version';
import { allReleases, releaseAfter } from '@/core/updates/check';
import { explainGitHubStatus, isNewerThan } from '@/core/version';

/**
 * "Has somebody already said this?"
 *
 * Asked before anything is filed, not after. A maintainer drowning in five
 * rewordings of the same request cannot review any of them properly, and the
 * person filing the fifth one gets no answer either — everybody loses, and
 * nobody did anything wrong.
 *
 * The three answers worth giving, in order of how much they save:
 *
 * 1. **Already fixed.** Closed, and shipped in a version newer than the one
 *    this site is running. The answer is not "we will look into it", it is
 *    "update and it goes away" — and this is the only place that can tell them,
 *    because only this site knows which version it is on.
 * 2. **Already reported.** Open. Point at it so they can add what they know
 *    rather than starting a parallel thread nobody joins.
 * 3. **New.** File it, with diagnostics attached.
 *
 * Searching is never a gate. If GitHub is unreachable or rate-limiting, the
 * screen says so and the report goes ahead — refusing to accept a bug report
 * because a search failed would be a worse bug than the one being reported.
 */

export interface Match {
  number: number;
  title: string;
  url: string;
  state: 'open' | 'closed';
  createdAt: string;
  closedAt?: string;
  comments: number;
  /** Reactions, as a rough measure of how many people want this. */
  reactions: number;
  labels: string[];
  /**
   * The release this appears to have shipped in, worked out from when it was
   * closed. Only set for closed matches.
   */
  fixedIn?: string;
  /** True when `fixedIn` is newer than the version this site is running. */
  fixedInNewerVersion?: boolean;
}

export interface SearchOutcome {
  matches: Match[];
  /** Set when the search could not be made. Never blocks filing. */
  problem?: string;
}

interface GitHubSearchItem {
  number: number;
  title: string;
  html_url: string;
  state: 'open' | 'closed';
  created_at: string;
  closed_at: string | null;
  comments: number;
  reactions?: { total_count?: number };
  labels: { name: string }[];
  pull_request?: unknown;
}

/**
 * Words worth searching on.
 *
 * GitHub's search treats terms as AND, so passing a whole sentence finds
 * nothing: "the contact form sends two emails every time" matches only an issue
 * containing all nine words. Stripping the filler leaves the words that carry
 * the meaning, which is what actually matches a differently-worded report of
 * the same problem — the entire point of doing this.
 */
const FILLER = new Set([
  'a',
  'an',
  'and',
  'are',
  'as',
  'at',
  'be',
  'been',
  'but',
  'by',
  'can',
  'cannot',
  'could',
  'did',
  'do',
  'does',
  'for',
  'from',
  'get',
  'gets',
  'had',
  'has',
  'have',
  'how',
  'i',
  'if',
  'in',
  'is',
  'it',
  'its',
  'me',
  'my',
  'not',
  'of',
  'on',
  'or',
  'that',
  'the',
  'their',
  'then',
  'there',
  'they',
  'this',
  'to',
  'too',
  'up',
  'want',
  'was',
  'we',
  'were',
  'what',
  'when',
  'where',
  'which',
  'why',
  'will',
  'with',
  'would',
  'you',
  'your',
]);

export function keywords(text: string): string[] {
  return [
    ...new Set(
      text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, ' ')
        .split(/\s+/)
        .filter((word) => word.length > 2 && !FILLER.has(word))
    ),
  ].slice(0, 6);
}

export async function findSimilar(
  text: string,
  kind: 'bug' | 'feature',
  currentVersion: string
): Promise<SearchOutcome> {
  const terms = keywords(text);
  if (terms.length === 0) return { matches: [] };

  // `is:issue` excludes pull requests, which otherwise dominate the results on
  // any project where the fix is discussed in the PR rather than the issue.
  const query = [
    `repo:${UPSTREAM.owner}/${UPSTREAM.repo}`,
    'is:issue',
    kind === 'bug' ? 'label:bug' : 'label:enhancement',
    ...terms,
  ].join(' ');

  try {
    const response = await fetch(
      `https://api.github.com/search/issues?q=${encodeURIComponent(query)}&per_page=5&sort=updated`,
      {
        headers: { Accept: 'application/vnd.github+json' },
        cache: 'no-store',
        signal: AbortSignal.timeout(6000),
      }
    );

    if (!response.ok) {
      // Never a reason to stop somebody filing: the report is still worth
      // having, and a duplicate is a cheaper problem than a lost bug.
      return { matches: [], problem: explainGitHubStatus(response.status, 'check for duplicates') };
    }

    const { items = [] } = (await response.json()) as { items?: GitHubSearchItem[] };
    const { releases } = await allReleases();

    const matches: Match[] = items
      .filter((item) => !item.pull_request)
      .map((item) => {
        const fixed = item.closed_at ? releaseAfter(item.closed_at, releases) : null;
        return {
          number: item.number,
          title: item.title,
          url: item.html_url,
          state: item.state,
          createdAt: item.created_at,
          closedAt: item.closed_at ?? undefined,
          comments: item.comments,
          reactions: item.reactions?.total_count ?? 0,
          labels: item.labels.map((label) => label.name),
          fixedIn: fixed?.version,
          fixedInNewerVersion: fixed ? isNewerThan(fixed.version, currentVersion) : undefined,
        };
      });

    // Fixed-and-you-can-have-it-now first, then still open, then the rest.
    // The order is the advice: the top result is the one worth reading.
    matches.sort((a, b) => {
      const rank = (m: Match) => (m.fixedInNewerVersion ? 0 : m.state === 'open' ? 1 : 2);
      return rank(a) - rank(b) || b.reactions - a.reactions;
    });

    return { matches };
  } catch {
    return {
      matches: [],
      problem: 'Could not reach GitHub to check for duplicates. You can still send your report.',
    };
  }
}

export const ISSUES_URL = `${UPSTREAM_URL}/issues`;
