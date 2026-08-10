/**
 * Auth constants with no dependencies.
 *
 * Kept in their own file because middleware runs on the Edge runtime, where
 * `process.cwd()` and the filesystem do not exist. Importing the session module
 * there would drag the whole storage layer in and fail the build — so the one
 * value middleware genuinely needs lives somewhere it can safely reach.
 */
export const SESSION_COOKIE = 'opb_session';
