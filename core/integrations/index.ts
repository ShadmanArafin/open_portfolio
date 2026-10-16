import 'server-only';

/**
 * Loading the integration definitions.
 *
 * Importing this module is what registers them. One import in one place, so a
 * new integration is a file plus a line here, and no screen has to learn about
 * it — which is the whole point of describing services as data.
 */

import './definitions/smtp';
import './definitions/turnstile';
import './definitions/umami';
import './definitions/plausible';
import './definitions/giscus';

export * from './registry';
export {
  clearConfig,
  hintFor,
  readConfig,
  vaultAvailable,
  writeConfig,
  VaultUnavailableError,
  type SecretHint,
} from './vault';
