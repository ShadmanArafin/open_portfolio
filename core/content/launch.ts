import type { CMSState } from '@/cms/types/cms';
import { INITIAL_CMS_STATE } from '@/cms/data/initialData';
import { isWelcomePlaceholder } from './welcome';

/** The demo projects a new site starts with — examples, not the owner's work. */
const SEED_PROJECT_IDS = new Set(INITIAL_CMS_STATE.projects.map((project) => project.id));

/**
 * The handful of things that make a site launched, as a checklist.
 *
 * The readiness report on the dashboard lists problems — twenty-odd checks,
 * worded as what is wrong. That is the right tool once a site is live and the
 * wrong one on day one, when everything is "wrong" and nothing says where to
 * start. This is the other shape: seven milestones, in the order worth doing
 * them, each one either done or a link to the screen that does it, with a
 * count of how far along you are. An unfinished list pulls people back to
 * finish it; a wall of warnings pushes them away.
 *
 * Pure, so the dashboard can render it on the server and a test can pin it.
 */

export interface LaunchStep {
  id: string;
  label: string;
  done: boolean;
  /** Where to go to do it. */
  href: string;
}

const PLACEHOLDER_EMAIL = 'hello@example.com';
const isPlaceholderText = (text: string | undefined) =>
  !text?.trim() || /^placeholder\b/i.test(text.trim());

export function launchSteps(
  draft: CMSState,
  context: { published: boolean; emailConfigured: boolean }
): LaunchStep[] {
  const ownWork = (draft.projects ?? []).filter(
    (project) => project.status === 'published' && !SEED_PROJECT_IDS.has(project.id)
  );
  return [
    {
      id: 'name',
      label: 'Put your own name and role on the site',
      done: !isWelcomePlaceholder(draft.settings?.fullName) && Boolean(draft.settings?.role),
      href: '/admin/settings',
    },
    {
      id: 'work',
      label: 'Show at least three pieces of your own work',
      done: ownWork.length >= 3,
      href: '/admin/projects',
    },
    {
      id: 'email',
      label: 'Use your own email address for enquiries',
      done: Boolean(draft.settings?.email) && draft.settings.email !== PLACEHOLDER_EMAIL,
      href: '/admin/settings',
    },
    {
      id: 'notify',
      label: 'Connect a mail server, so enquiries reach you',
      done: context.emailConfigured,
      href: '/admin/services',
    },
    {
      id: 'description',
      label: 'Write the sentence search engines show',
      done: !isPlaceholderText(draft.seo?.metaDescription),
      href: '/admin/seo',
    },
    {
      id: 'address',
      label: 'Tell the site its own address',
      done: Boolean(draft.settings?.siteUrl?.trim() || draft.seo?.canonicalUrl?.trim()),
      href: '/admin/your-site',
    },
    {
      id: 'publish',
      label: 'Publish',
      done: context.published,
      href: '/admin',
    },
  ];
}
