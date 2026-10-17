'use client';

import { useState } from 'react';
import type { MediaItem } from '@/cms/types/cms';
import {
  checkSlug,
  createHomePage,
  createPage,
  isHomePage,
  normaliseSlug,
  type PageRecord,
} from '@/core/pages/schema';
import {
  getBlockDefinition,
  listBlockDefinitions,
  parsePage,
  runBlockChecks,
} from '@/core/blocks/registry';
import type { Block } from '@/core/blocks/schema';
import { BlockFields } from './block-fields';
import { SharePanel } from './share-panel';
import { updatePagesAction } from '../_actions/pages';

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

const PALETTE_GROUPS: { id: string; label: string }[] = [
  { id: 'identity', label: 'Say who you are' },
  { id: 'work', label: 'Show your work' },
  { id: 'credentials', label: 'Back it up' },
  { id: 'conversion', label: 'Ask for something' },
  { id: 'utility', label: 'Everything else' },
];

const DEFINITIONS = listBlockDefinitions();

function blockSummary(block: Block): string {
  const props = block.props as Record<string, unknown>;
  for (const key of ['headline', 'heading', 'title', 'caption']) {
    const value = props?.[key];
    if (typeof value === 'string' && value.trim()) return value;
  }
  const paragraphs = props?.paragraphs;
  if (Array.isArray(paragraphs) && typeof paragraphs[0] === 'string') return paragraphs[0];
  return '';
}

let idCounter = 0;
const newId = (prefix: string) => `${prefix}_${Date.now().toString(36)}_${++idCounter}`;

/** Home first, always. It is the page every visitor sees. */
function sortHomeFirst(pages: PageRecord[]): PageRecord[] {
  return [...pages].sort((a, b) => Number(isHomePage(b)) - Number(isHomePage(a)));
}

function Field({
  label,
  value,
  onChange,
  hint,
  problem,
  rows,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  problem?: string | null;
  rows?: number;
}) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="font-semibold">{label}</span>
      {rows ? (
        <textarea
          rows={rows}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`${field} py-2`}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={field}
          style={{ minHeight: 44 }}
        />
      )}
      {problem ? <span className="text-danger">{problem}</span> : null}
      {hint && !problem ? <span className="text-text-secondary">{hint}</span> : null}
    </label>
  );
}

function CheckField({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex min-h-[44px] cursor-pointer items-center gap-3 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-5 w-5"
      />
      <span className="font-semibold">
        {label}
        {description ? (
          <span className="block font-normal text-text-secondary">{description}</span>
        ) : null}
      </span>
    </label>
  );
}

function PageEditor({
  page,
  otherSlugs,
  media,
  saved,
  onMutate,
}: {
  page: PageRecord;
  otherSlugs: string[];
  media: MediaItem[];
  saved: boolean;
  onMutate: (mutate: (page: PageRecord) => PageRecord) => void;
}) {
  const [removeBlockArmed, setRemoveBlockArmed] = useState<string | null>(null);
  const home = isHomePage(page);
  const parsed = parsePage(page.blocks);
  const slugProblem = checkSlug(page.slug, { existingSlugs: otherSlugs, isHome: home });

  const setBlocks = (mutate: (blocks: unknown[]) => unknown[]) =>
    onMutate((current) => ({ ...current, blocks: mutate([...current.blocks]) }));

  const addBlock = (type: string) => {
    const definition = getBlockDefinition(type);
    if (!definition) return;
    setBlocks((blocks) => [
      ...blocks,
      {
        id: newId('block'),
        type: definition.type,
        v: definition.version,
        props: definition.defaults(),
      },
    ]);
  };

  const moveBlock = (index: number, by: number) =>
    setBlocks((blocks) => {
      const target = index + by;
      if (target < 0 || target >= blocks.length) return blocks;
      [blocks[index], blocks[target]] = [blocks[target], blocks[index]];
      return blocks;
    });

  const toggleBlockHidden = (index: number) =>
    setBlocks((blocks) => {
      const block = blocks[index] as { hidden?: boolean };
      blocks[index] = { ...block, hidden: !block.hidden };
      return blocks;
    });

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
          </select>
        </label>

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

        <div>
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

        {parsed.length === 0 ? (
          <p className="m-0 text-sm text-text-secondary">
            Nothing on this page yet. Add a block below.
          </p>
        ) : (
          parsed.map((entry, index) => {
            const id = entry.kind === 'block' ? entry.block.id : entry.id;
            const definition =
              entry.kind === 'block' ? getBlockDefinition(entry.block.type) : undefined;
            const warnings = runBlockChecks(entry);

            return (
              <div key={id} className="grid gap-3 rounded-xl border border-border p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold">
                      {definition?.label ?? 'Not readable'}
                    </span>
                    {definition && entry.kind === 'block' ? (
                      <span className="max-w-[24ch] truncate text-xs text-text-muted">
                        {blockSummary(entry.block)}
                      </span>
                    ) : null}
                    {warnings.length > 0 ? (
                      <span className="rounded-full border border-border px-2 text-xs text-text-muted">
                        {warnings.length} to look at
                      </span>
                    ) : null}
                  </span>
                  <span className="flex flex-wrap items-center gap-2">
                    {entry.kind === 'block' ? (
                      <label className="flex min-h-[44px] cursor-pointer items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={!entry.block.hidden}
                          onChange={() => toggleBlockHidden(index)}
                          className="h-5 w-5"
                        />
                        <span className="text-text-secondary">
                          {entry.block.hidden ? 'Hidden' : 'Visible'}
                        </span>
                      </label>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => moveBlock(index, -1)}
                      disabled={index === 0}
                      className={secondary}
                      style={{ minHeight: 44 }}
                    >
                      Move up
                    </button>
                    <button
                      type="button"
                      onClick={() => moveBlock(index, 1)}
                      disabled={index === parsed.length - 1}
                      className={secondary}
                      style={{ minHeight: 44 }}
                    >
                      Move down
                    </button>
                    {removeBlockArmed === id ? (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setBlocks((blocks) => blocks.filter((_, i) => i !== index));
                            setRemoveBlockArmed(null);
                          }}
                          className={danger}
                          style={{ minHeight: 44 }}
                        >
                          Remove it
                        </button>
                        <button
                          type="button"
                          onClick={() => setRemoveBlockArmed(null)}
                          className={secondary}
                          style={{ minHeight: 44 }}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setRemoveBlockArmed(id)}
                        className={secondary}
                        style={{ minHeight: 44 }}
                      >
                        Remove block
                      </button>
                    )}
                  </span>
                </div>

                {entry.kind === 'unknown' ? (
                  <p className="m-0 rounded-xl border border-danger bg-danger-subtle p-3 text-sm">
                    This block cannot be shown here. {entry.reason} It is kept exactly as it is, and
                    will work again on a version that understands it.
                  </p>
                ) : (
                  <div className="grid gap-3">
                    {warnings.map((warning) => (
                      <p
                        key={warning}
                        className="m-0 rounded-xl border border-border bg-surface-secondary p-3 text-sm text-text-secondary"
                      >
                        {warning}
                      </p>
                    ))}
                    {definition ? (
                      <BlockFields
                        fields={definition.fields}
                        props={entry.block.props}
                        onChange={(next) =>
                          setBlocks((blocks) => {
                            blocks[index] = {
                              ...(blocks[index] as Record<string, unknown>),
                              props: next,
                            };
                            return blocks;
                          })
                        }
                        media={media}
                      />
                    ) : null}
                  </div>
                )}
              </div>
            );
          })
        )}

        <div className="grid gap-3 rounded-xl border border-border p-3">
          <span className="text-sm font-semibold">Add a block</span>
          {PALETTE_GROUPS.map((group) => {
            const inGroup = DEFINITIONS.filter((definition) => definition.group === group.id);
            if (inGroup.length === 0) return null;
            return (
              <div key={group.id} className="grid gap-2">
                <span className="text-sm text-text-secondary">{group.label}</span>
                <span className="flex flex-wrap gap-2">
                  {inGroup.map((definition) => (
                    <button
                      key={definition.type}
                      type="button"
                      title={definition.description}
                      onClick={() => addBlock(definition.type)}
                      className={secondary}
                      style={{ minHeight: 44 }}
                    >
                      {definition.label}
                    </button>
                  ))}
                </span>
              </div>
            );
          })}
        </div>
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
}: {
  initialPages: PageRecord[];
  media: MediaItem[];
}) {
  const [pages, setPages] = useState<PageRecord[]>(sortHomeFirst(initialPages));
  const [savedIds, setSavedIds] = useState<string[]>(initialPages.map((page) => page.id));
  const [openId, setOpenId] = useState<string | null>(null);
  const [deleteArmed, setDeleteArmed] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const hasHome = pages.some(isHomePage);

  const mutatePage = (id: string, mutate: (page: PageRecord) => PageRecord) =>
    setPages((list) => list.map((page) => (page.id === id ? mutate(page) : page)));

  const addPage = () => {
    const page = createPage({ title: 'Untitled page', id: newId('page') });
    // Every new page needs a slug nobody is using; "untitled-page" twice is a
    // page that saves and never opens.
    let slug = page.slug;
    for (let n = 2; pages.some((existing) => existing.slug === slug); n++) {
      slug = `${page.slug}-${n}`;
    }
    setPages((list) => [...list, { ...page, slug }]);
    setOpenId(page.id);
  };

  const buildHome = () => {
    setPages((list) => [createHomePage(), ...list]);
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

  const removePage = (id: string) => {
    setPages((list) => list.filter((page) => page.id !== id));
    if (openId === id) setOpenId(null);
    setDeleteArmed(null);
  };

  const save = async () => {
    setBusy(true);
    setNote(null);
    setError(null);
    try {
      const result = await updatePagesAction(pages);
      if (result.ok && result.pages) {
        setPages(sortHomeFirst(result.pages));
        setSavedIds(result.pages.map((page) => page.id));
        setNote('Saved to your draft.');
      } else {
        setError(result.error ?? 'The save did not go through.');
      }
    } catch {
      setError('The save did not go through. Reload and try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap gap-3">
        {!hasHome ? (
          <button type="button" onClick={buildHome} className={secondary} style={{ minHeight: 44 }}>
            Build my home page
          </button>
        ) : null}
        <button
          type="button"
          onClick={addPage}
          className="rounded-full bg-text-primary px-4 text-sm font-semibold text-bg"
          style={{ minHeight: 44 }}
        >
          Add page
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
              <li key={page.id} className="grid gap-3 rounded-2xl border border-border p-4">
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
                        {page.status === 'published' ? 'Live' : 'Draft'}
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
        <p className="m-0 text-sm text-text-secondary">
          Nothing on this screen is live until you publish.
        </p>
        {note ? (
          <p role="status" className="m-0 text-sm text-text-secondary">
            {note}
          </p>
        ) : null}
        {error ? (
          <p role="alert" className="m-0 text-sm text-danger">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
