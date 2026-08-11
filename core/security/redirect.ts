/**
 * Redirect targets that came from a URL.
 *
 * Any handler that redirects to a path a caller supplied is an open redirect
 * until proven otherwise, and an open redirect on a site people sign in to is a
 * phishing primitive: a link that really is on the owner's own domain, and
 * really does end up somewhere else.
 *
 * Allowed: a same-site path beginning with a single `/`.
 * Rejected: absolute URLs, protocol-relative `//evil.example`, backslash
 * variants that some browsers normalise to a slash, and control characters.
 */

/**
 * Spaces, tabs, newlines and DEL. Written as codepoint comparisons rather than
 * a regex character class because the class would contain invisible characters,
 * and an invisible character in a security check is one nobody can review.
 */
function hasControlCharacter(value: string): boolean {
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    if (code <= 0x20 || code === 0x7f) return true;
  }
  return false;
}

export function safeRedirectPath(candidate: string | null | undefined, fallback: string): string {
  if (!candidate) return fallback;

  // A newline in a redirect target used to be header injection; today it is
  // mostly a parser confusion trick. Neither is worth allowing.
  if (hasControlCharacter(candidate)) return fallback;

  if (!candidate.startsWith('/')) return fallback;

  // `//host` is protocol-relative and leaves the site entirely. `/\host` is the
  // same thing to browsers that normalise a backslash to a slash.
  if (candidate.startsWith('//') || candidate.startsWith('/\\')) return fallback;

  return candidate;
}
