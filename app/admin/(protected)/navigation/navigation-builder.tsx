'use client';

import type { NavLinkItem } from '@/cms/types/cms';
import { updateNavLinksAction } from '../_actions/collections';
import { CollectionEditor } from '../_components/collection-editor';
import { CheckField, Field } from '../_components/form-fields';
import { newId } from '../_components/ids';

/**
 * The header menu.
 *
 * One card per link: what it reads as, where it points, and whether it is in
 * the bar. The legacy screen showed the same three and warned about
 * addresses that did not exist — but against five hardcoded routes, so every
 * link to a built page or a project read as a mistake. The warning here
 * checks the addresses the draft can actually serve, and an address left
 * empty says so instead of passing for the homepage.
 */
export function NavigationBuilder({
  initialLinks,
  known,
  token,
}: {
  initialLinks: NavLinkItem[];
  known: string[];
  token?: string;
}) {
  return (
    <CollectionEditor<NavLinkItem>
      token={token}
      initialItems={initialLinks}
      addLabel="Add link"
      emptyTitle="No links yet."
      emptyHint="Add one and it joins the top navigation bar."
      deleteLabel="Remove link"
      deleteWarning="The link leaves your draft and the menu. This cannot be undone without restoring a version."
      title={(link) => link.label}
      summary={(link) => link.path}
      badge={(link) => (link.visible ? null : { label: 'Hidden', live: false })}
      create={(links) => ({
        id: newId('nav'),
        label: 'New link',
        path: '/',
        visible: true,
        sortOrder: links.length + 1,
      })}
      duplicate={(link) => ({ ...structuredClone(link), id: newId('nav') })}
      save={async (links, token) => {
        const result = await updateNavLinksAction(links, token);
        return {
          ok: result.ok,
          error: result.error,
          conflict: result.conflict,
          token: result.token,
          items: result.links,
        };
      }}
      renderFields={(link, mutate) => {
        const problem = addressProblem(link.path, known);
        return (
          <>
            <Field
              label="Label"
              value={link.label}
              onChange={(value) => mutate((current) => ({ ...current, label: value }))}
              hint="What visitors read in the menu."
            />
            <Field
              label="Path"
              value={link.path}
              onChange={(value) => mutate((current) => ({ ...current, path: value }))}
              hint="An address on this site, like /about, or a full address anywhere on the web."
            />
            {problem ? (
              <p className="m-0 rounded-xl border border-danger bg-danger-subtle p-3 text-sm">
                {problem}
              </p>
            ) : null}
            <CheckField
              label="Visible"
              description="Hidden links stay in the draft but leave the menu."
              checked={link.visible}
              onChange={(checked) => mutate((current) => ({ ...current, visible: checked }))}
            />
          </>
        );
      }}
    />
  );
}

/**
 * What is wrong with an address, if anything.
 *
 * Anchors and full web addresses go wherever they say — not this site's
 * problem. On-site paths are checked against what the draft can serve, with
 * any query string or fragment set aside first.
 */
function addressProblem(path: string, known: string[]): string | null {
  if (path === '') {
    return 'This link has no address yet. Type one, like /about or /contact.';
  }
  if (!path.startsWith('/')) return null;

  const bare = path.split(/[?#]/)[0].replace(/\/$/, '') || '/';
  if (known.includes(bare)) return null;

  return `This site has no ${bare} page — visitors who open it land on the not-found screen. Known addresses: ${known.join(', ')}.`;
}
