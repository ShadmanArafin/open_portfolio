/**
 * Whether the owner has chosen to leave the first-run wizard.
 *
 * The wizard is shown by inferring "never set up" from the content itself —
 * `settings.fullName` still holding the seed's placeholder. That inference is
 * right for deciding whether to *offer* the wizard and wrong for deciding
 * whether to *force* it: someone who skipped has, by definition, not changed
 * their name yet, so the guard sent them straight back and the Skip button did
 * nothing at all.
 *
 * A dismissal is a UI preference belonging to this browser, not site content —
 * it must not travel in an export or reach a visitor — so localStorage is the
 * right home for it, alongside the theme.
 */
const KEY = 'opb.welcome.dismissed';

export function isWelcomeDismissed(): boolean {
  try {
    return localStorage.getItem(KEY) === '1';
  } catch {
    // Private-browsing modes can throw on access. Failing closed here would
    // trap the user in the wizard, so an unreadable preference means "not
    // dismissed" and the guard falls back to the content check.
    return false;
  }
}

export function dismissWelcome(): void {
  try {
    localStorage.setItem(KEY, '1');
  } catch {
    // Nothing to do. The worst case is being offered the wizard again.
  }
}
