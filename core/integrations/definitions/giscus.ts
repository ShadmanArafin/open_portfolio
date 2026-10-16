import 'server-only';
import { z } from 'zod';
import { registerIntegration, type TestResult } from '../registry';

/**
 * Comments, powered by GitHub Discussions.
 *
 * No database, no tracking, no ads: visitors comment with their GitHub
 * account and every word lives in a discussion on a repository the owner
 * controls, where moderation already happens. The trade is stated plainly in
 * setup — only GitHub users can comment, and the repository must be public.
 */

export const giscusSchema = z.object({
  repo: z
    .string()
    .min(1)
    .regex(/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/, 'A repository looks like owner/name.'),
});

export type GiscusSettings = z.infer<typeof giscusSchema>;

registerIntegration<GiscusSettings>({
  id: 'giscus',
  name: 'Comments (Giscus)',
  category: 'comments',
  summary:
    'Lets visitors discuss your writing, stored as GitHub Discussions on your own repository.',

  freeTier: {
    summary: 'Free. Giscus itself costs nothing; the repository lives on a free GitHub account.',
    verifiedOn: '2026-10-18',
  },
  docsUrl: 'https://giscus.app/',
  setup: [
    'Pick a public repository for the discussions, and turn on its Discussions feature.',
    'Install the giscus app on that repository so visitors can comment.',
    'Create a discussion category for comments — the Announcements type keeps new discussions tidy.',
    'Paste the repository below as owner/name, then press Test.',
    'Add a Comments block to a page or a writing entry to show the thread. Nothing loads from GitHub until a visitor asks to see it.',
  ],

  fields: [
    {
      name: 'repo',
      label: 'Repository',
      kind: 'text',
      placeholder: 'owner/name',
      help: 'Public, with Discussions on and the giscus app installed. The comments block reads this when it has no repository of its own.',
    },
  ],
  secretFields: [],

  schema: giscusSchema,

  degradation:
    'Without this, pages simply have no discussion section. Nothing else changes, and nothing phones GitHub.',

  configuredByEnv: (env) => Boolean(env.OPB_GISCUS_REPO?.trim()),

  async test(config): Promise<TestResult> {
    // What this can prove without credentials: the repository exists and is
    // public, which is the precondition everything else stands on. Whether
    // Discussions are on and the app is installed cannot be seen from here,
    // so the message says exactly that instead of pretending.
    try {
      const res = await fetch(`https://api.github.com/repos/${config.repo}`, {
        headers: { Accept: 'application/vnd.github+json' },
      });
      if (res.status === 404) {
        return {
          ok: false,
          message:
            'GitHub has no public repository at that name. Check the spelling — it is owner/name, and private repositories will not do.',
        };
      }
      if (!res.ok) {
        return { ok: false, message: `GitHub answered with ${res.status}. Try again in a moment.` };
      }
      return {
        ok: true,
        message:
          'The repository exists and is public. Finish by enabling Discussions on it and installing the giscus app — those two cannot be checked from here.',
      };
    } catch {
      return {
        ok: false,
        message: 'Could not reach GitHub. Check the server can reach the internet.',
      };
    }
  },
});
