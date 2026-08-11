/**
 * Values this project used to ship with somebody's name baked into them.
 *
 * The first-run wizard wrote the page-title template and the footer copyright
 * once, as literals. Anybody who skipped the wizard kept the shipped default,
 * which said "Your Name" — on every browser tab, every search result and the
 * bottom of every page, indefinitely.
 *
 * Both are derived from the site's own name now, but that only helps new
 * installs: an existing one has the old literal stored, and a stored value
 * looks like a deliberate choice. Recognising exactly the strings we shipped —
 * and nothing else — lets those installs pick up the fix without a migration
 * and without ever second-guessing text somebody actually wrote.
 *
 * Deletable once no install carries them, which is not a date anybody can know,
 * so it stays until the storage format changes for a better reason.
 */

const SHIPPED_TITLE_TEMPLATES = ['%s — Your Name', '%s - Your Name'];

/** Matches `© 2026 Your Name` for any year, and nothing a person would type. */
const SHIPPED_COPYRIGHT = /^©\s*\d{4}\s+Your Name$/;

export function isShippedTitleTemplate(value: string | undefined): boolean {
  return !!value && SHIPPED_TITLE_TEMPLATES.includes(value.trim());
}

export function isShippedCopyright(value: string | undefined): boolean {
  return !!value && SHIPPED_COPYRIGHT.test(value.trim());
}
