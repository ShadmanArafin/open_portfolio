/**
 * Secrets that are not secret.
 *
 * `docker-compose.yml` and the docs ship example values for `OPB_SETUP_TOKEN`
 * and `OPB_SECRET_KEY` so `docker compose up` works on the first try. Anything
 * written in this repository is public, so an install still running on one of
 * them has a setup token any stranger can type and a vault key any stranger can
 * derive. "Change both of these" was a comment; this makes it a check.
 *
 * Deliberately a short list of exact shapes rather than a length or entropy
 * rule: a short phrase somebody invented is still theirs, and an update must
 * not lock a working site out over a judgement call.
 */

/** The example values printed in the README and the docs, verbatim. */
const PLACEHOLDERS = new Set(['a long phrase you invent', 'a different long phrase']);

export function isPlaceholderSecret(value: string | undefined): boolean {
  if (!value) return false;
  const normalised = value.trim().toLowerCase();
  return /^change-?me/.test(normalised) || PLACEHOLDERS.has(normalised);
}
