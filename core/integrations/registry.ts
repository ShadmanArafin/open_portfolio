import { z } from 'zod';

/**
 * One service, described once.
 *
 * The point of this shape is that adding the twenty-fifth integration is a data
 * file and no React at all. The admin has one screen; it reads these; every
 * service gets the same setup flow, the same test button and the same honest
 * account of what happens when it is switched off.
 *
 * Four of these fields exist specifically because the audience is somebody
 * deploying this without a developer:
 *
 * - **`freeTier`** carries a `verifiedOn` date. A free-tier claim with no date
 *   on it is a rumour, and the whole promise of this project is that a person
 *   can run it without a bill.
 * - **`setup`** is numbered plain-English steps, not a link to a docs site.
 * - **`test`** is mandatory. "Saved" is not the same as "works", and finding out
 *   which at the moment a stranger sends you a message is too late.
 * - **`degradation`** says what the site does without it, in words the owner
 *   can act on.
 */

export type IntegrationCategory = 'email' | 'analytics' | 'spam' | 'comments' | 'media';

export interface IntegrationField {
  name: string;
  label: string;
  help?: string;
  kind: 'text' | 'password' | 'number' | 'toggle';
  placeholder?: string;
  optional?: boolean;
}

export interface FreeTier {
  /** One sentence. "500 emails a month, then it stops rather than charges." */
  summary: string;
  /** ISO date. Re-checked by a scheduled issue; stale claims are worse than none. */
  verifiedOn: string;
}

export interface TestResult {
  ok: boolean;
  /**
   * Written for somebody who has never heard of SMTP.
   *
   * "ECONNREFUSED 587" tells the person who wrote the code what happened. It
   * tells the person who has to fix it nothing at all.
   */
  message: string;
}

export interface IntegrationDefinition<C = Record<string, unknown>> {
  id: string;
  name: string;
  category: IntegrationCategory;
  /** One line, in the list. What it does for the site, not what it is. */
  summary: string;

  freeTier: FreeTier;
  docsUrl?: string;
  /** Numbered steps a non-technical person can follow to the end. */
  setup: string[];

  fields: IntegrationField[];
  /** Which fields are encrypted at rest and never sent back to the browser. */
  secretFields: readonly string[];

  schema: z.ZodType<C>;

  /** What the site does without this. Shown whether or not it is configured. */
  degradation: string;

  /** Hosts this integration needs to reach, for the Content-Security-Policy. */
  cspConnect?: string[];
  cspScript?: string[];

  /**
   * Proves it works, from the server, now.
   *
   * Mandatory by type, not by convention: an integration that cannot be tested
   * is one whose failure the owner discovers from a stranger telling them their
   * contact form is broken.
   */
  test(config: C): Promise<TestResult>;

  /**
   * True when this instance is configured by environment variables instead.
   *
   * Env always wins — a value in the environment is a deliberate act by whoever
   * deployed the site, and an admin screen that silently overrode it would be a
   * setting that does nothing. The screen says so rather than pretending.
   */
  configuredByEnv?(env: NodeJS.ProcessEnv): boolean;
}

const definitions = new Map<string, IntegrationDefinition<never>>();

export function registerIntegration<C>(definition: IntegrationDefinition<C>): void {
  if (definitions.has(definition.id)) {
    throw new Error(`Duplicate integration registered: "${definition.id}"`);
  }
  definitions.set(definition.id, definition as unknown as IntegrationDefinition<never>);
}

export function getIntegration(id: string): IntegrationDefinition<never> | undefined {
  return definitions.get(id);
}

export function listIntegrations(): IntegrationDefinition<never>[] {
  return [...definitions.values()];
}
