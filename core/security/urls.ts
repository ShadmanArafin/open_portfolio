/**
 * Owner-controlled link targets.
 *
 * Block props, social links, CTAs and download buttons are stored in the
 * content document, which can arrive via import, restore, or a future editor
 * bug. Rendering a stored `javascript:` URL into an `href` is stored click-XSS:
 * the visitor clicks a real link on the owner's real domain and runs the
 * attacker's script. This module is the single allowlist every render path
 * must go through.
 *
 * Allowed: same-site paths (`/work`, `#anchor`, `?q=1`), `http:`/`https:`,
 * `mailto:` and `tel:`. Everything else (`javascript:`, `data:`, `vbscript:`,
 * `blob:`, `file:`, protocol-relative `//evil.example`) is rejected and the
 * caller renders a non-link instead of an anchor.
 */

const ALLOWED_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'tel:']);

function hasControlCharacter(value: string): boolean {
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    if (code <= 0x20 || code === 0x7f) return true;
  }
  return false;
}

export function sanitizeHref(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const candidate = raw.trim();
  if (!candidate) return null;
  if (hasControlCharacter(candidate)) return null;

  // Same-site references never leave the site. Reject `//host` (protocol
  // relative) and `/\host` (backslash normalisation) — both navigate away.
  if (candidate.startsWith('#') || candidate.startsWith('?') || candidate.startsWith('/')) {
    if (candidate.startsWith('//') || candidate.startsWith('/\\')) return null;
    return candidate;
  }

  // Absolute URLs: parse against a dummy base so relative edge cases above
  // are already handled, then check the protocol explicitly. `new URL`
  // lowercases the scheme, so `JaVaScRiPt:` is caught too.
  let parsed: URL;
  try {
    parsed = new URL(candidate, 'https://opb.invalid');
  } catch {
    return null;
  }
  if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) return null;

  // `mailto:`/`tel:` must not carry control characters or HTML-significant
  // content beyond the address itself; the scheme check above plus the
  // control-character check is sufficient — React escapes the attribute.
  return candidate;
}

/** Image/media sources. Stricter than links: no `mailto:`/`tel:`. */
export function sanitizeMediaSrc(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const candidate = raw.trim();
  if (!candidate) return null;
  if (hasControlCharacter(candidate)) return null;

  if (candidate.startsWith('/')) {
    if (candidate.startsWith('//') || candidate.startsWith('/\\')) return null;
    return candidate;
  }

  let parsed: URL;
  try {
    parsed = new URL(candidate, 'https://opb.invalid');
  } catch {
    return null;
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
  return candidate;
}
