import type { Metadata } from 'next';
import { getContentForChannel } from '@/core/content/read';
import { WelcomeWizard } from './welcome-wizard';

export const metadata: Metadata = { title: 'Welcome' };

/**
 * The first thing a new owner sees.
 *
 * Somebody who has just clicked a deploy button has a site full of a fictional
 * person's placeholder content and twenty admin screens they have never seen.
 * Dropping them straight into that is how a promising install becomes an
 * abandoned one. Four questions is enough to make the site recognisably theirs,
 * and every one of them is skippable — the screens are all still there
 * afterwards.
 *
 * The page is a server render; the wizard below it is a client leaf because
 * its steps, dismissal preference and in-flight state belong to this browser.
 * The answers themselves go through a server action, not a client-held draft.
 */
export default async function WelcomePage() {
  const draft = await getContentForChannel('draft');
  return <WelcomeWizard currentName={draft.settings.fullName} />;
}
