import 'server-only';

import { listIntegrations, type IntegrationField } from './registry';
import { hintFor, readConfig, type SecretHint } from './vault';

/**
 * The one shape the services screen and its endpoint both speak.
 *
 * The projection is where secrets stop: a stored password is decrypted to
 * find its hint and then dropped, so the object that leaves here can be
 * rendered and JSON-encoded and the password is not in it. Both the endpoint
 * and the server-rendered screen read through this function, so the two
 * cannot describe the same service differently.
 */

export interface IntegrationView {
  id: string;
  name: string;
  category: string;
  summary: string;
  freeTier: { summary: string; verifiedOn: string };
  docsUrl?: string;
  setup: string[];
  fields: readonly IntegrationField[];
  secretFields: readonly string[];
  degradation: string;
  configuredByEnv: boolean;
  isConfigured: boolean;
  values: Record<string, unknown>;
  secrets: Record<string, SecretHint>;
}

/** Everything the admin screen needs, and nothing it does not. */
export async function listIntegrationViews(): Promise<IntegrationView[]> {
  const views = await Promise.all(
    listIntegrations().map(async (definition) => {
      const stored = await readConfig(definition.id, definition.secretFields);
      const byEnv = definition.configuredByEnv?.(process.env) ?? false;

      const values: Record<string, unknown> = {};
      const secrets: Record<string, SecretHint> = {};
      for (const [name, value] of Object.entries(stored ?? {})) {
        if (definition.secretFields.includes(name)) {
          secrets[name] = hintFor(typeof value === 'string' ? value : '');
        } else {
          values[name] = value;
        }
      }

      return {
        id: definition.id,
        name: definition.name,
        category: definition.category,
        summary: definition.summary,
        freeTier: definition.freeTier,
        docsUrl: definition.docsUrl,
        setup: definition.setup,
        fields: definition.fields,
        secretFields: definition.secretFields,
        degradation: definition.degradation,
        // Env wins, and the screen says so rather than offering fields that
        // would be silently ignored.
        configuredByEnv: byEnv,
        isConfigured: byEnv || stored !== null,
        values,
        secrets,
      };
    })
  );

  // Sorted by id. The registry remembers registration order, and a definition
  // registers the first time its module is evaluated — which depends on the
  // module graph that happens to load first, so the Map's order differs
  // between bundles. A list that reshuffles by route is not a list.
  return views.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}
