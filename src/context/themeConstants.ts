/**
 * The theme's localStorage key.
 *
 * It lives alone in this file because two places need it — the React provider
 * and the blocking anti-flash script in the root layout — and previously they
 * held separate copies of the string. Drift between them meant the script
 * restored nothing and the page flashed the default theme on every load.
 */
export const THEME_STORAGE_KEY = 'opb.theme';
