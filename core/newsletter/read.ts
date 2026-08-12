import 'server-only';
import { cache } from 'react';
import type { Channel } from '@/core/storage/contract';
import { getContentForChannel } from '@/core/content/read';
import { NEWSLETTER_DEFAULTS, newsletterSettingsSchema, type NewsletterSettings } from './schema';

/**
 * The newsletter's settings — not its subscribers.
 *
 * Settings are content: the owner edits them, they are drafted and published
 * with everything else, and they are safe in a public payload. The list of
 * people who signed up is neither of those things, and lives on its own adapter
 * surface where it is never serialised into a page. See
 * `core/newsletter/store.ts`.
 */
export const getNewsletterSettings = cache(
  async (channel: Channel): Promise<NewsletterSettings> => {
    const content = await getContentForChannel(channel);
    const parsed = newsletterSettingsSchema.safeParse(content.newsletter);
    return parsed.success ? parsed.data : NEWSLETTER_DEFAULTS;
  }
);
