import type { AdapterId } from './contract';

/**
 * How somebody decides where to keep their site.
 *
 * Deliberately not `import 'server-only'`, and deliberately separate from the
 * adapters themselves: an adapter is server code holding a service-role key,
 * and this is advice that has to render in the admin. Keeping them apart is
 * what lets the browser show a comparison without the browser ever loading a
 * file that can reach a database.
 *
 * **This screen cannot change the answer, and says so.** Which backend runs is
 * decided by which environment variables are present, because configuration is
 * what tells the app how to reach the database — a setting stored *in* the
 * database cannot be read before the database is reachable. So the honest job
 * here is to explain, not to offer a control that would have to lie.
 *
 * Every free-tier claim carries the date it was checked. They drift, and an
 * undated number in a table is one nobody can audit later.
 */

export type Host = 'vercel' | 'netlify' | 'own-server' | 'anywhere';

export interface BackendGuide {
  id: AdapterId;
  name: string;
  /** One line. What this is, for somebody who does not know the product. */
  summary: string;
  /** Who should pick it, phrased as a person rather than a feature. */
  bestFor: string;
  freeTier: string;
  /** When the free-tier claim was last checked against the provider. */
  verifiedOn: string;
  /** Survives a platform that throws the filesystem away between deploys. */
  worksOnServerless: boolean;
  /** The thing somebody would be annoyed to discover later. */
  caveat?: string;
  /** Set when the object-store half has not been run against the live service. */
  unverified?: string;
  env: { name: string; where: string }[];
  steps: string[];
}

const CHECKED = '2026-08-12';

export const BACKEND_GUIDES: BackendGuide[] = [
  {
    id: 'local',
    name: 'This machine',
    summary: 'Files on disk, under `.opb/`. No account, no database, nothing to configure.',
    bestFor:
      'Trying it out, and for running it yourself on a VPS, a Docker host or a Raspberry Pi.',
    freeTier: 'Free forever. There is no service involved.',
    verifiedOn: CHECKED,
    worksOnServerless: false,
    caveat:
      'Refuses to run on Vercel, Netlify and Cloudflare, where the disk is discarded between deploys. That refusal is deliberate: the alternative is your content quietly disappearing on your next deploy.',
    env: [],
    steps: [
      'Nothing to do. This is what runs when nothing else is configured.',
      'Everything lives under `.opb/` — back that folder up, or use `docker compose up`, which keeps it on a volume that survives replacing the container.',
    ],
  },
  {
    id: 'neon',
    name: 'Neon + Vercel Blob',
    summary: 'A Postgres database from Neon, and your uploads in Vercel Blob.',
    bestFor:
      'Deploying with the one-click button. Both are provisioned for you, and Neon wakes in milliseconds, so a portfolio nobody visited for a month still answers the first request.',
    freeTier: '0.5GB database, 1GB of uploads.',
    verifiedOn: CHECKED,
    worksOnServerless: true,
    caveat:
      'Two services rather than one, so two dashboards if something goes wrong. Vercel’s free plan is also non-commercial only — see the README before putting a portfolio that advertises paid work on it.',
    env: [
      { name: 'DATABASE_URL', where: 'Set for you by the Neon integration' },
      { name: 'BLOB_READ_WRITE_TOKEN', where: 'Set for you when you add a Blob store' },
    ],
    steps: [
      'Use the Deploy button in the README — it provisions both and sets both variables. You never see either value.',
      'If the button ever stops provisioning them: deploy anyway, then add **Neon** and **Blob** from your project’s Storage tab. The app uses whichever service’s variables are present, so nothing else changes.',
    ],
  },
  {
    id: 'supabase',
    name: 'Supabase',
    summary: 'One account for both the database and your uploads.',
    bestFor:
      'Anybody who would rather have a single dashboard, a single bill and a single thing to learn.',
    freeTier: '500MB database, 1GB of files.',
    verifiedOn: CHECKED,
    worksOnServerless: true,
    caveat:
      'A free project pauses after roughly a week with no database activity, and a paused project is a site that does not load until you wake it. Fine for a portfolio you link from a CV; think twice for one you are actively sending people to.',
    env: [
      { name: 'SUPABASE_URL', where: 'Project Settings → API' },
      { name: 'SUPABASE_SERVICE_ROLE_KEY', where: 'Project Settings → API' },
      {
        name: 'SUPABASE_DB_URL',
        where: 'Database → Connection pooling. Use the **pooled** string, not the direct one',
      },
    ],
    steps: [
      'Create a free project at supabase.com.',
      'Copy the three values above into your host’s environment variables.',
      'Redeploy. The bucket for your uploads is created on first run — there is no SQL to paste and no dashboard step.',
      'Use the pooled connection string. The direct one runs out of connections long before your traffic does.',
    ],
  },
  {
    id: 'postgres',
    name: 'Any Postgres',
    summary: 'A database you already have, or one from any host that sells them.',
    bestFor:
      'Railway, Render, Fly, Coolify, a database your employer runs, or one on your own server.',
    freeTier: 'Whatever your host offers.',
    verifiedOn: CHECKED,
    worksOnServerless: false,
    caveat:
      'The database is hosted but your uploads still go to local disk, so this needs a machine whose filesystem persists. On a platform that discards the disk, use Supabase or Neon instead.',
    env: [{ name: 'OPB_POSTGRES_URL', where: 'Your database provider’s connection string' }],
    steps: [
      'Point `OPB_POSTGRES_URL` at your database.',
      'Redeploy. Tables are created on first run; there is no migration to apply by hand.',
      'Make sure the disk persists — with Docker, that is the `/data` volume.',
    ],
  },
];

export function guideFor(id: AdapterId): BackendGuide | undefined {
  return BACKEND_GUIDES.find((guide) => guide.id === id);
}

/**
 * The order to show them in, given where somebody is deploying.
 *
 * A list that puts the impossible option first is a list that has to be read
 * twice. On a platform with no persistent disk, the filesystem backend is not a
 * lesser choice — it is not a choice at all.
 */
export function guidesForHost(host: Host): BackendGuide[] {
  if (host === 'own-server' || host === 'anywhere') return BACKEND_GUIDES;
  return [...BACKEND_GUIDES].sort(
    (a, b) => Number(b.worksOnServerless) - Number(a.worksOnServerless)
  );
}
