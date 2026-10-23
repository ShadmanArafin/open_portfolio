import 'server-only';
import { cache } from 'react';
import { getContentForChannel } from '@/core/content/read';
import { publicView } from '@/core/content/sanitise';
import { currentChannel } from '@/core/pages/read';
import { siteNow } from '@/core/content/now';
import type { CMSState } from './types/cms';

/**
 * The theme's content, read on the server: what `useCMS()` gives a client
 * component, for the server components that replaced most of them.
 *
 * Draft or published by the same channel rule as the layout, cut to what a
 * visitor may see by the same `publicView`, and read once per request
 * however many sections ask (React `cache`). Unlike the client copy it keeps
 * page blocks and stories: nothing here is serialised to the browser.
 */
export const siteContent = cache(async (): Promise<CMSState> => {
  return publicView(await getContentForChannel(await currentChannel()), await siteNow());
});
