import pkg from '../package.json';

/**
 * What this build is, and where it came from.
 *
 * Until now nothing in the running application knew its own version, which
 * makes three things impossible: telling somebody whether an update exists,
 * telling *you* which version a bug report came from, and refusing content
 * written by a build newer than this one.
 *
 * Read from `package.json` rather than kept as a second literal that has to be
 * remembered. A version number in two places is a version number that is wrong
 * in one of them.
 */
export const APP_VERSION: string = pkg.version;

/**
 * The upstream project.
 *
 * Deliberately fixed rather than derived from the user's own git remote. These
 * are used to file bug reports and to look for updates, and both belong to the
 * project this was built from — not to whatever the person renamed their copy
 * to. Somebody who forks and diverges genuinely can change it here.
 */
export const UPSTREAM = {
  owner: 'ShadmanArafin',
  repo: 'open_portfolio_builder',
} as const;

export const UPSTREAM_URL = `https://github.com/${UPSTREAM.owner}/${UPSTREAM.repo}`;
export const RELEASES_API = `https://api.github.com/repos/${UPSTREAM.owner}/${UPSTREAM.repo}/releases`;

/** `1.2.3` -> `[1, 2, 3]`. Anything unparseable sorts lowest. */
function parts(version: string): [number, number, number] {
  const match = /^v?(\d+)\.(\d+)\.(\d+)/.exec(version.trim());
  if (!match) return [0, 0, 0];
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

/** Negative when `a` is older, positive when newer, zero when the same. */
export function compareVersions(a: string, b: string): number {
  const left = parts(a);
  const right = parts(b);
  for (let i = 0; i < 3; i++) {
    if (left[i] !== right[i]) return left[i] - right[i];
  }
  return 0;
}

export function isNewerThan(candidate: string, current: string): boolean {
  return compareVersions(candidate, current) > 0;
}

/**
 * Why GitHub said no, in terms somebody can act on.
 *
 * 404 and 422 both mean "that repository is not visible to an anonymous
 * request", which in practice means it is private or has been renamed. Reported
 * as "GitHub answered 422" this is unactionable noise; named properly it is the
 * one thing that needs fixing, and it is a setting rather than a bug.
 */
export function explainGitHubStatus(status: number, what: string): string {
  if (status === 404 || status === 422) {
    return `Cannot ${what}: this project's repository is not publicly visible. If you are the maintainer, the repository needs to be public for update checks and duplicate detection to work.`;
  }
  if (status === 403 || status === 429) {
    return `Cannot ${what} just now — GitHub is rate-limiting requests from this server. It will work again shortly.`;
  }
  return `Cannot ${what} — GitHub answered ${status}.`;
}
