'use client';

import { useState } from 'react';
import {
  SOCIAL_PLATFORMS,
  buildSocialUrl,
  extractSocialHandle,
  getSocialPlatform,
} from '@/cms/data/socialPlatforms';
import type { SocialLinkItem, SocialPlatformId } from '@/cms/types/cms';
import { updateFooterAction, updateSocialLinksAction } from '../_actions/settings';
import { ConflictNotice } from '../_components/conflict-notice';
import { useSaveShortcut, useUnsavedChanges } from '../_components/unsaved-changes';
import { UnsavedNote } from '../_components/unsaved-note';

const secondary =
  'rounded-full border border-border px-4 text-sm text-text-secondary hover:text-text-primary disabled:opacity-50';
const field = 'rounded-xl border border-border bg-surface-primary px-3 text-text-primary';

/**
 * One social card.
 *
 * Asking for a platform *name* as free text meant the icon could never be
 * looked up — the footer fell back to the LinkedIn glyph for everything. The
 * platform is a fixed set, so it is a picker, and the only thing left to type
 * is the part that is actually personal: the handle. A pasted profile URL
 * works just as well, since that is what most people reach for.
 */
function SocialCard({
  link,
  onPatch,
  onSetPlatform,
  onSetHandle,
  onArm,
  onRemove,
  onDisarm,
  armed,
  busy,
}: {
  link: SocialLinkItem;
  onPatch: (patch: Partial<SocialLinkItem>) => void;
  onSetPlatform: (id: string) => void;
  onSetHandle: (value: string) => void;
  onArm: () => void;
  onRemove: () => void;
  onDisarm: () => void;
  armed: boolean;
  busy: boolean;
}) {
  const platform = getSocialPlatform(link.iconType);
  const Icon = platform.icon;
  const handle = extractSocialHandle(link.iconType, link.url);

  return (
    <li className="grid gap-3 rounded-2xl border border-border p-3">
      <div className="flex flex-wrap items-center gap-3">
        <span aria-hidden className="text-text-secondary">
          <Icon size={18} />
        </span>
        <label className="grid min-w-[180px] flex-1 gap-1 text-sm">
          <span className="font-semibold">Platform</span>
          <select
            value={link.iconType}
            onChange={(event) => onSetPlatform(event.target.value)}
            className={field}
            style={{ minHeight: 44 }}
          >
            {SOCIAL_PLATFORMS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </label>
        {armed ? (
          <span className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onRemove}
              disabled={busy}
              className="rounded-full bg-danger px-4 text-sm font-semibold text-bg disabled:opacity-50"
              style={{ minHeight: 44 }}
            >
              Remove it
            </button>
            <button
              type="button"
              onClick={onDisarm}
              className={secondary}
              style={{ minHeight: 44 }}
            >
              Cancel
            </button>
          </span>
        ) : (
          <button type="button" onClick={onArm} className={secondary} style={{ minHeight: 44 }}>
            Remove link
          </button>
        )}
      </div>

      <label className="grid gap-1 text-sm">
        <span className="font-semibold">Username or profile link</span>
        <input
          type="text"
          value={handle}
          onChange={(event) => onSetHandle(event.target.value)}
          placeholder={platform.placeholder}
          className={field}
          style={{ minHeight: 44 }}
        />
        <span className="text-text-secondary">
          Saved as {link.url || `${platform.baseUrl ?? 'the link you paste'}…`}
        </span>
      </label>

      <label className="grid gap-1 text-sm">
        <span className="font-semibold">Card caption</span>
        <input
          type="text"
          value={link.name}
          onChange={(event) => onPatch({ name: event.target.value })}
          className={field}
          style={{ minHeight: 44 }}
        />
        <span className="text-text-secondary">
          The name shown under the icon on the footer card.
        </span>
      </label>
    </li>
  );
}

export function FooterForm({
  initial,
  tokens: initialTokens,
}: {
  initial: { copyrightText: string; giantFooterText: string; links: SocialLinkItem[] };
  /** Two writes, two parts of the draft: the footer text and the social links. */
  tokens?: { footer: string; socialLinks: string };
}) {
  const [copyrightText, setCopyrightText] = useState(initial.copyrightText);
  const [giantFooterText, setGiantFooterText] = useState(initial.giantFooterText);
  const [links, setLinks] = useState<SocialLinkItem[]>(initial.links);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [removeArmed, setRemoveArmed] = useState<string | null>(null);
  const [conflict, setConflict] = useState(false);
  const [tokens, setTokens] = useState(initialTokens);
  const { dirty, markSaved } = useUnsavedChanges({ copyrightText, giantFooterText, links });

  const patchLink = (index: number, patch: Partial<SocialLinkItem>) =>
    setLinks((current) => current.map((link, i) => (i === index ? { ...link, ...patch } : link)));

  const setPlatform = (index: number, id: string) =>
    setLinks((current) =>
      current.map((link, i) => {
        if (i !== index) return link;
        const handle = extractSocialHandle(link.iconType, link.url);
        return {
          ...link,
          iconType: id as SocialPlatformId,
          label: getSocialPlatform(id).name.toUpperCase(),
          url: buildSocialUrl(id, handle),
        };
      })
    );

  const setHandle = (index: number, value: string) =>
    setLinks((current) =>
      current.map((link, i) => {
        if (i !== index) return link;
        return {
          ...link,
          url: buildSocialUrl(link.iconType, value),
          name: link.name || value.replace(/^@/, ''),
        };
      })
    );

  const save = async () => {
    setBusy(true);
    setNote(null);
    setError(null);
    setConflict(false);
    try {
      // Sequential on purpose: both writes are revision-checked, and a
      // concurrent pair would make one of them lose the race with itself.
      const texts = await updateFooterAction({ copyrightText, giantFooterText }, tokens?.footer);
      if (!texts.ok) {
        setConflict(Boolean(texts.conflict));
        setError(texts.error ?? 'The save did not go through.');
        return;
      }
      const socials = await updateSocialLinksAction(links, tokens?.socialLinks);
      setTokens((current) =>
        current
          ? {
              footer: texts.token ?? current.footer,
              socialLinks: socials.token ?? current.socialLinks,
            }
          : current
      );
      if (socials.ok) {
        markSaved({ copyrightText, giantFooterText, links });
        setNote('Saved to your draft.');
      } else {
        setConflict(Boolean(socials.conflict));
        setError(socials.error ?? 'The save did not go through.');
      }
    } catch {
      setError('The save did not go through. Reload and try again.');
    } finally {
      setBusy(false);
    }
  };

  useSaveShortcut(() => void save(), !busy);
  return (
    <div className="grid gap-6">
      <section aria-label="Footer" className="grid gap-4 rounded-2xl border border-border p-4">
        <h2 className="m-0 text-xl">Footer</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1 text-sm">
            <span className="font-semibold">Copyright text</span>
            <input
              type="text"
              value={copyrightText}
              onChange={(event) => setCopyrightText(event.target.value)}
              className={field}
              style={{ minHeight: 44 }}
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-semibold">Oversized footer word</span>
            <input
              type="text"
              value={giantFooterText}
              onChange={(event) => setGiantFooterText(event.target.value)}
              className={field}
              style={{ minHeight: 44 }}
            />
          </label>
        </div>
      </section>

      <section
        aria-label="Social cards"
        className="grid gap-4 rounded-2xl border border-border p-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="m-0 text-xl">Social cards ({links.length})</h2>
          <button
            type="button"
            onClick={() =>
              setLinks((current) => [
                ...current,
                {
                  id: `social-${Date.now()}`,
                  label: 'LINKEDIN',
                  name: '',
                  url: '',
                  iconType: 'linkedin',
                  visible: true,
                  sortOrder: current.length + 1,
                },
              ])
            }
            className={secondary}
            style={{ minHeight: 44 }}
          >
            Add social
          </button>
        </div>

        {links.length === 0 ? (
          <p className="m-0 text-sm text-text-secondary">
            No social cards yet. Add one and it appears at the bottom of every page.
          </p>
        ) : (
          <ul className="m-0 grid list-none gap-3 p-0">
            {links.map((link, index) => (
              <SocialCard
                key={link.id}
                link={link}
                busy={busy}
                armed={removeArmed === link.id}
                onPatch={(patch) => patchLink(index, patch)}
                onSetPlatform={(id) => setPlatform(index, id)}
                onSetHandle={(value) => setHandle(index, value)}
                onArm={() => setRemoveArmed(link.id)}
                onRemove={() => {
                  setLinks((current) => current.filter((_, i) => i !== index));
                  setRemoveArmed(null);
                }}
                onDisarm={() => setRemoveArmed(null)}
              />
            ))}
          </ul>
        )}
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void save()}
          disabled={busy}
          className="rounded-full bg-text-primary px-4 text-sm font-semibold text-bg disabled:opacity-50"
          style={{ minHeight: 44 }}
        >
          {busy ? 'Saving…' : 'Save'}
        </button>
        <UnsavedNote dirty={dirty} />
        {note ? (
          <p role="status" className="m-0 text-sm text-text-secondary">
            {note}
          </p>
        ) : null}
        {error ? (
          conflict ? (
            <ConflictNotice message={error} />
          ) : (
            <p role="alert" className="m-0 text-sm text-danger">
              {error}
            </p>
          )
        ) : null}
      </div>
    </div>
  );
}
