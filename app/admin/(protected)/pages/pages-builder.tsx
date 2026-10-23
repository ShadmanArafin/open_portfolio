'use client';

import { useState } from 'react';
import type { MediaItem } from '@/cms/types/cms';
import {
  checkSlug,
  createHomePage,
  createLinkInBioPage,
  createPage,
  isHomePage,
  normaliseSlug,
  type PageRecord,
} from '@/core/pages/schema';
import { BlocksEditor } from '../_components/blocks-editor';
import { CheckField, DateTimeField, Field } from '../_components/form-fields';
import { newId } from '../_components/ids';
import { SharePanel } from './share-panel';
import { updatePagesAction } from '../_actions/pages';
import { ConflictNotice } from '../_components/conflict-notice';
import { useSaveShortcut, useUnsavedChanges } from '../_components/unsaved-changes';
import { UnsavedNote } from '../_components/unsaved-note';
import { useRequestedRecord } from '../_components/requested-record';
import { UndoNotice } from '../_components/undo-remove';
import { useUndoableRemove } from '../_components/use-undoable-remove';
import { PreviewPane } from '../_components/preview-pane';
import { Suggest } from '../_components/assist';

/**
 * Building a page.
 *
 * Two lists, not a canvas. Reordering happens in an outline rather than by
 * dragging a preview: an outline is keyboard-operable, works on a phone, and
 * can be tested. Dragging a pixel-perfect canvas is the demo that sells a
 * builder and the interaction that locks out anyone not using a mouse.
 *
 * Nothing here can produce an arrangement that looks broken. There is no
 * styling control, no spacing control and no colour: a block chooses what it
 * says, the theme chooses what it looks like. What the editor *does* offer is
 * advice — the content checks under each block, which catch the things a
 * schema cannot, like a headline that will wrap to four lines on a phone.
 *
 * Every edit — fields, blocks, order, add, delete — is local until Save. The
 * save is one revision-checked write of the whole list, so a reorder can never
 * land half-applied, and "Add page" cannot collide with a slug somebody else
 * just took.
 */

const field = 'w-full rounded-xl border border-border bg-surface-primary px-3 text-text-primary';
const secondary =
  'rounded-full border border-border px-3 text-sm text-text-secondary hover:text-text-primary disabled:opacity-50';
const danger = 'rounded-full bg-danger px-3 text-sm font-semibold text-bg disabled:opacity-50';

/** Home first, always. It is the page every visitor sees. */
function sortHomeFirst(pages: PageRecord[]): PageRecord[] {
  return [...pages].sort((a, b) => Number(isHomePage(b)) - Number(isHomePage(a)));
}

function PageEditor({
  page,
  otherSlugs,
  media,
  saved,
  onMutate,
  onPreviewBeside,
}: {
  page: PageRecord;
  otherSlugs: string[];
  media: MediaItem[];
  saved: boolean;
  onMutate: (mutate: (page: PageRecord) => PageRecord) => void;
  onPreviewBeside: (path: string) => void;
}) {
  const home = isHomePage(page);
  const slugProblem = checkSlug(page.slug, { existingSlugs: otherSlugs, isHome: home });

  return (
    <div className="grid gap-6 border-t border-border pt-4">
      <section aria-label="Where it lives" className="grid gap-3">
        <h2 className="m-0 text-lg">Where it lives</h2>
        <Field
          label="Title"
          value={page.title}
          onChange={(value) => onMutate((current) => ({ ...current, title: value }))}
          hint="Used as the page's main heading in search results and browser tabs."
        />

        {home ? (
          <p className="m-0 rounded-xl border border-border bg-surface-secondary p-3 text-sm text-text-secondary">
            This is your home page. It lives at / and its address cannot be changed. Publish it and
            it replaces the layout under Homepage.
          </p>
        ) : (
          <Field
            label="Web address"
            value={page.slug}
            onChange={(value) =>
              onMutate((current) => ({ ...current, slug: normaliseSlug(value) }))
            }
            hint={`This page will be at /${page.slug}`}
            problem={slugProblem?.message ?? null}
          />
        )}

        <label className="grid gap-1 text-sm">
          <span className="font-semibold">Visibility</span>
          <select
            value={page.status}
            onChange={(event) =>
              onMutate((current) => ({
                ...current,
                status: event.target.value as PageRecord['status'],
              }))
            }
            className={field}
            style={{ minHeight: 44 }}
          >
            <option value="draft">Draft — only you can see it</option>
            <option value="published">Published — anyone can see it</option>
            <option value="scheduled">Scheduled — appears on a date</option>
          </select>
        </label>
        {page.status === 'scheduled' ? (
          <DateTimeField
            label="Appears on"
            value={page.scheduledFor}
            onChange={(value) => onMutate((current) => ({ ...current, scheduledFor: value }))}
            hint="In your own time zone. It appears on its own within a minute of that moment, once published. Nothing needs to be running."
          />
        ) : null}

        {!home ? (
          <>
            <CheckField
              label="Show in the site menu"
              description="Adds a link to this page in the navigation, alongside the ones in Settings."
              checked={page.nav.show}
              onChange={(checked) =>
                onMutate((current) => ({ ...current, nav: { ...current.nav, show: checked } }))
              }
            />
            {page.nav.show ? (
              <Field
                label="Menu label"
                value={page.nav.label ?? ''}
                onChange={(value) =>
                  onMutate((current) => ({ ...current, nav: { ...current.nav, label: value } }))
                }
                hint="Leave blank to use the page title."
              />
            ) : null}
          </>
        ) : null}

        <div className="flex flex-wrap gap-2">
          {/* Wide screens only, where the panel has room beside the editor. */}
          <button
            type="button"
            onClick={() => onPreviewBeside(`/${home ? '' : page.slug}`)}
            className={`${secondary} hidden xl:inline-flex xl:items-center`}
            style={{ minHeight: 44 }}
          >
            Preview beside
          </button>
          <button
            type="button"
            onClick={() =>
              window.open(`/api/preview?path=/${home ? '' : page.slug}`, '_blank', 'noopener')
            }
            className={secondary}
            style={{ minHeight: 44 }}
          >
            Preview this page
          </button>
        </div>
      </section>

      <section aria-label="Blocks" className="grid gap-3">
        <div>
          <h2 className="m-0 text-lg">Blocks</h2>
          <p className="m-0 mt-1 text-sm text-text-secondary">
            Each block is a band across the page. Move them, hide them, or take them out.
          </p>
        </div>

        <BlocksEditor
          blocks={page.blocks}
          onChange={(blocks) => onMutate((current) => ({ ...current, blocks }))}
          media={media}
        />
      </section>

      <section aria-label="Share preview" className="grid gap-3">
        <h2 className="m-0 text-lg">Share preview</h2>
        <SharePanel pageId={page.id} saved={saved} />
      </section>

      <section aria-label="Search and sharing" className="grid gap-3">
        <h2 className="m-0 text-lg">Search and sharing</h2>
        <Field
          label="Title for search results"
          value={page.seo.title ?? ''}
          onChange={(value) =>
            onMutate((current) => ({ ...current, seo: { ...current.seo, title: value } }))
          }
          hint={`Leave blank to use “${page.title || 'Untitled page'}”.`}
        />
        <Field
          label="Description"
          rows={3}
          value={page.seo.description ?? ''}
          onChange={(value) =>
            onMutate((current) => ({ ...current, seo: { ...current.seo, description: value } }))
          }
          hint="One or two sentences. This is what people read under the link."
        />
        <Suggest
          task="description"
          source={() => ({ title: page.title, blocks: page.blocks })}
          onUse={(value) =>
            onMutate((current) => ({ ...current, seo: { ...current.seo, description: value } }))
          }
        />
        <CheckField
          label="Keep out of search engines"
          description="The page stays reachable by anyone with the link, but is left out of search results and the sitemap."
          checked={page.seo.noindex ?? false}
          onChange={(checked) =>
            onMutate((current) => ({ ...current, seo: { ...current.seo, noindex: checked } }))
          }
        />
      </section>

      <p className="m-0 text-sm text-text-secondary">
        Version {page.revision}. Changes are saved to your draft. Publish when you are ready.
      </p>
    </div>
  );
}

export function PagesBuilder({
  initialPages,
  media,
  token: initialToken,
  homeStarter,
}: {
  initialPages: PageRecord[];
  media: MediaItem[];
  token?: string;
  /**
   * The theme's current home layout as blocks (`homePageFromSections`), so
   * building a home page starts from what the site shows now, not from blank.
   */
  homeStarter?: PageRecord;
}) {
  const [pages, setPages] = useState<PageRecord[]>(sortHomeFirst(initialPages));
  const [savedIds, setSavedIds] = useState<string[]>(initialPages.map((page) => page.id));
  const [openId, setOpenId] = useState<string | null>(null);
  useRequestedRecord(setOpenId);
  const [deleteArmed, setDeleteArmed] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [conflict, setConflict] = useState(false);
  const [token, setToken] = useState(initialToken);
  // The docked preview: which page, and a counter bumped on each save so it
  // reloads to show what was just written.
  const [previewPath, setPreviewPath] = useState<string | null>(null);
  const [previewVersion, setPreviewVersion] = useState(0);
  const { dirty, markSaved } = useUnsavedChanges(pages);

  const hasHome = pages.some(isHomePage);

  const mutatePage = (id: string, mutate: (page: PageRecord) => PageRecord) =>
    setPages((list) => list.map((page) => (page.id === id ? mutate(page) : page)));

  /**
   * A new page, and the slug nobody is using.
   *
   * "untitled-page" twice is a page that saves and never opens, so the second
   * one takes -2. The starting point is a parameter because a page can also
   * start from a preset: a link-in-bio page is this same act, from a different
   * first draft.
   */
  const addPage = (fresh = createPage({ title: 'Untitled page', id: newId('page') })) => {
    let slug = fresh.slug;
    for (let n = 2; pages.some((existing) => existing.slug === slug); n++) {
      slug = `${fresh.slug}-${n}`;
    }
    setPages((list) => [...list, { ...fresh, slug }]);
    setOpenId(fresh.id);
  };

  const buildHome = () => {
    setPages((list) => [homeStarter ?? createHomePage(), ...list]);
    setOpenId('page_home');
  };

  const movePage = (index: number, by: number) =>
    setPages((list) => {
      const target = index + by;
      // Home is pinned first: nothing moves above it, and it never moves.
      if (target < 1 || target >= list.length) return list;
      const next = [...list];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });

  const undoable = useUndoableRemove(pages, setPages);
  const removePage = (id: string) => {
    undoable.remove(id, pages.find((page) => page.id === id)?.title ?? '');
    if (openId === id) setOpenId(null);
    setDeleteArmed(null);
  };

  const save = async () => {
    setBusy(true);
    setNote(null);
    setError(null);
    setConflict(false);
    try {
      const result = await updatePagesAction(pages, token);
      if (result.ok && result.pages) {
        const saved = sortHomeFirst(result.pages);
        setPages(saved);
        markSaved(saved);
        if (result.token) setToken(result.token);
        setPreviewVersion((version) => version + 1);
        setSavedIds(result.pages.map((page) => page.id));
        setNote('Saved to your draft.');
      } else {
        setConflict(Boolean(result.conflict));
        setError(result.error ?? 'The save did not go through.');
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
      {previewPath ? (
        <PreviewPane
          path={previewPath}
          version={previewVersion}
          onClose={() => setPreviewPath(null)}
        />
      ) : null}
      {undoable.removed ? (
        <UndoNotice label={undoable.removed.label} onUndo={() => setOpenId(undoable.undo())} />
      ) : null}
      <div className="flex flex-wrap gap-3">
        {!hasHome ? (
          <button type="button" onClick={buildHome} className={secondary} style={{ minHeight: 44 }}>
            Build my home page from what it shows now
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => addPage()}
          className="rounded-full bg-text-primary px-4 text-sm font-semibold text-bg"
          style={{ minHeight: 44 }}
        >
          Add page
        </button>
        <button
          type="button"
          onClick={() => addPage(createLinkInBioPage(newId('page')))}
          className={secondary}
          style={{ minHeight: 44 }}
        >
          Add a links page
        </button>
      </div>

      {!hasHome ? (
        <p className="m-0 rounded-xl border border-border bg-surface-secondary p-3 text-sm text-text-secondary">
          <strong className="text-text-primary">
            Your home page is not built from blocks yet.
          </strong>{' '}
          It is still the layout under Homepage. Build it here and it takes over as soon as you
          publish — until then nothing about your site changes.
        </p>
      ) : null}

      {pages.length === 0 ? (
        <p className="m-0 text-sm text-text-secondary">
          No pages yet. A page is a web address and a stack of blocks. Add one and start with a
          heading.
        </p>
      ) : (
        <ul className="m-0 grid list-none gap-3 p-0">
          {pages.map((page, index) => {
            const home = isHomePage(page);
            const open = openId === page.id;
            return (
              <li
                key={page.id}
                id={`record-${page.id}`}
                className="grid scroll-mt-6 gap-3 rounded-2xl border border-border p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setOpenId(open ? null : page.id)}
                    aria-expanded={open}
                    className="grid gap-1 text-left"
                    style={{ minHeight: 44 }}
                  >
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">
                        {home ? 'Home page' : page.title || 'Untitled page'}
                      </span>
                      <span
                        className={`rounded-full border px-2 py-0.5 text-xs ${
                          page.status === 'published'
                            ? 'border-accent text-accent'
                            : 'border-border text-text-muted'
                        }`}
                      >
                        {page.status === 'published'
                          ? 'Live'
                          : page.status === 'scheduled'
                            ? 'Scheduled'
                            : 'Draft'}
                      </span>
                    </span>
                    <span className="text-sm text-text-secondary">
                      {home ? '/' : `/${page.slug}`} · {page.blocks.length} block
                      {page.blocks.length === 1 ? '' : 's'}
                      {home && page.blocks.length === 0 ? ' — still showing the old layout' : ''}
                    </span>
                  </button>

                  <span className="flex flex-wrap items-center gap-2">
                    {!home ? (
                      <>
                        <button
                          type="button"
                          onClick={() => movePage(index, -1)}
                          disabled={index <= 1}
                          className={secondary}
                          style={{ minHeight: 44 }}
                        >
                          Move up
                        </button>
                        <button
                          type="button"
                          onClick={() => movePage(index, 1)}
                          disabled={index >= pages.length - 1}
                          className={secondary}
                          style={{ minHeight: 44 }}
                        >
                          Move down
                        </button>
                        {deleteArmed === page.id ? (
                          <>
                            <button
                              type="button"
                              onClick={() => removePage(page.id)}
                              className={danger}
                              style={{ minHeight: 44 }}
                            >
                              Delete it
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteArmed(null)}
                              className={secondary}
                              style={{ minHeight: 44 }}
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setDeleteArmed(page.id)}
                            className={secondary}
                            style={{ minHeight: 44 }}
                          >
                            Delete page
                          </button>
                        )}
                      </>
                    ) : null}
                  </span>
                </div>

                {open ? (
                  <PageEditor
                    page={page}
                    media={media}
                    saved={savedIds.includes(page.id)}
                    otherSlugs={pages
                      .filter((other) => other.id !== page.id)
                      .map((other) => other.slug)}
                    onMutate={(mutate) => mutatePage(page.id, mutate)}
                    onPreviewBeside={setPreviewPath}
                  />
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

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
        <p className="m-0 text-sm text-text-secondary">
          Nothing on this screen is live until you publish.
        </p>
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
