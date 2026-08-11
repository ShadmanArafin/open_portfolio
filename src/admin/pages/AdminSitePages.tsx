'use client';

import React, { useMemo, useState } from 'react';
import { Badge } from '@astryxdesign/core/Badge';
import { Banner } from '@astryxdesign/core/Banner';
import { Button } from '@astryxdesign/core/Button';
import { Card } from '@astryxdesign/core/Card';
import { Divider } from '@astryxdesign/core/Divider';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { HStack, VStack } from '@astryxdesign/core/Layout';
import { Switch } from '@astryxdesign/core/Switch';
import { Text } from '@astryxdesign/core/Text';
import { useCMS } from '../../cms/context/CMSContext';
import { AdminRecord, AdminRecordList } from '../components/AdminRecord';
import { AstryxHeader, AstryxSection } from '../components/astryx/AstryxComponents';
import { BlockFields } from '../components/BlockFields';
import { Selector, TextArea, TextInput } from '../components/AdminFields';
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

/**
 * Building a page.
 *
 * Two lists, not a canvas. The plan called for drag-and-drop, and reordering
 * still happens in an outline rather than by dragging a preview: an outline is
 * keyboard-operable, works on a phone, and can be tested. Dragging a
 * pixel-perfect canvas is the demo that sells a builder and the interaction
 * that locks out anyone not using a mouse.
 *
 * Nothing here can produce an arrangement that looks broken. There is no
 * styling control, no spacing control and no colour: a block chooses what it
 * says, the theme chooses what it looks like. What the editor *does* offer is
 * advice — the content checks under each block, which catch the things a schema
 * cannot, like a headline that will wrap to four lines on a phone.
 */

const PALETTE_GROUPS: { id: string; label: string }[] = [
  { id: 'identity', label: 'Say who you are' },
  { id: 'work', label: 'Show your work' },
  { id: 'credentials', label: 'Back it up' },
  { id: 'conversion', label: 'Ask for something' },
  { id: 'utility', label: 'Everything else' },
];

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

export const AdminSitePages: React.FC = () => {
  const { draftData, updateDraft, uploadMedia } = useCMS();
  const [openPageId, setOpenPageId] = useState<string | null>(null);

  const stored = draftData.pages ?? [];
  // Home first, always. It is the page every visitor sees and the one somebody
  // opening this screen is most likely looking for.
  const pages = [...stored].sort((a, b) => Number(isHomePage(b)) - Number(isHomePage(a)));
  const hasHome = stored.some(isHomePage);
  const definitions = useMemo(() => listBlockDefinitions(), []);

  const mutatePage = (id: string, mutate: (page: PageRecord) => void) => {
    updateDraft((draft) => {
      const page = (draft.pages ?? []).find((p) => p.id === id);
      if (!page) return;
      mutate(page);
      page.updatedAt = new Date().toISOString();
      page.revision += 1;
    });
  };

  const buildHomeFromBlocks = () => {
    updateDraft((draft) => {
      draft.pages = [createHomePage(), ...(draft.pages ?? [])];
    });
    setOpenPageId('page_home');
  };

  const addPage = () => {
    const page = createPage({ title: 'Untitled page', id: newId('page') });
    // Every new page needs a slug nobody is using; "untitled-page" twice is a
    // page that saves and never opens.
    let slug = page.slug;
    for (let n = 2; pages.some((p) => p.slug === slug); n++) slug = `${page.slug}-${n}`;

    updateDraft((draft) => {
      draft.pages = [...(draft.pages ?? []), { ...page, slug }];
    });
    setOpenPageId(page.id);
  };

  const upload = async (file: File): Promise<string | null> => {
    const item = await uploadMedia(file);
    return item?.url ?? null;
  };

  return (
    <VStack gap={6}>
      <AstryxHeader
        title="Pages"
        subtitle="Pages you build from blocks, each at its own web address. Your home page and the Work, Case studies and Contact sections live under Homepage."
      >
        <HStack gap={2}>
          {!hasHome && (
            <Button variant="secondary" label="Build my home page" onClick={buildHomeFromBlocks} />
          )}
          <Button variant="primary" label="Add page" onClick={addPage} />
        </HStack>
      </AstryxHeader>

      {!hasHome && (
        <Banner
          status="info"
          title="Your home page is not built from blocks yet"
          description="It is still the layout under Homepage. Build it here and it takes over as soon as you publish — until then nothing about your site changes."
        />
      )}

      {pages.length === 0 ? (
        <EmptyState
          title="No pages yet"
          description="A page is a web address and a stack of blocks. Add one and start with a heading."
          actions={<Button variant="primary" label="Add page" onClick={addPage} />}
        />
      ) : (
        <AdminRecordList>
          {pages.map((page, index) => (
            <AdminRecord
              key={page.id}
              value={page.id}
              title={isHomePage(page) ? 'Home page' : page.title || 'Untitled page'}
              summary={
                isHomePage(page)
                  ? `/ · ${page.blocks.length} block${page.blocks.length === 1 ? '' : 's'}${page.blocks.length === 0 ? ' — still showing the old layout' : ''}`
                  : `/${page.slug} · ${page.blocks.length} block${page.blocks.length === 1 ? '' : 's'}`
              }
              badge={page.status === 'published' ? 'Live' : 'Draft'}
              badgeVariant={page.status === 'published' ? 'green' : 'amber'}
              defaultIsOpen={page.id === openPageId}
              onMoveUp={isHomePage(page) ? undefined : () => reorderPages(updateDraft, index, -1)}
              onMoveDown={isHomePage(page) ? undefined : () => reorderPages(updateDraft, index, 1)}
              canMoveUp={!isHomePage(page) && index > 1}
              canMoveDown={!isHomePage(page) && index < pages.length - 1}
              // No delete for the home page. Removing it would silently revert
              // the site to a layout the owner may not remember choosing.
              onRemove={
                isHomePage(page)
                  ? undefined
                  : () =>
                      updateDraft((draft) => {
                        draft.pages = (draft.pages ?? []).filter((p) => p.id !== page.id);
                      })
              }
              removeLabel="Delete page"
            >
              <PageEditor
                page={page}
                otherSlugs={pages.filter((p) => p.id !== page.id).map((p) => p.slug)}
                definitions={definitions}
                onChange={(mutate) => mutatePage(page.id, mutate)}
                onUpload={upload}
              />
            </AdminRecord>
          ))}
        </AdminRecordList>
      )}
    </VStack>
  );
};

function reorderPages(
  updateDraft: (fn: (draft: { pages?: PageRecord[] }) => void) => void,
  index: number,
  by: number
) {
  updateDraft((draft) => {
    const pages = draft.pages ?? [];
    const target = index + by;
    if (target < 0 || target >= pages.length) return;
    [pages[index], pages[target]] = [pages[target], pages[index]];
  });
}

const PageEditor: React.FC<{
  page: PageRecord;
  otherSlugs: string[];
  definitions: ReturnType<typeof listBlockDefinitions>;
  onChange: (mutate: (page: PageRecord) => void) => void;
  onUpload: (file: File) => Promise<string | null>;
}> = ({ page, otherSlugs, definitions, onChange, onUpload }) => {
  const slugProblem = checkSlug(page.slug, {
    existingSlugs: otherSlugs,
    isHome: isHomePage(page),
  });
  const parsed = useMemo(() => parsePage(page.blocks), [page.blocks]);

  const addBlock = (type: string) => {
    const definition = getBlockDefinition(type);
    if (!definition) return;
    onChange((draft) => {
      draft.blocks = [
        ...draft.blocks,
        {
          id: newId('block'),
          type: definition.type,
          v: definition.version,
          props: definition.defaults(),
        },
      ];
    });
  };

  return (
    <VStack gap={6}>
      <AstryxSection title="Where it lives">
        <VStack gap={4}>
          <TextInput
            label="Title"
            value={page.title}
            onChange={(value) => onChange((draft) => void (draft.title = value))}
            description="Used as the page's main heading in search results and browser tabs."
          />

          {isHomePage(page) ? (
            <Banner
              status="info"
              title="This is your home page"
              description="It lives at / and its address cannot be changed. Publish it and it replaces the layout under Homepage."
            />
          ) : (
            <>
              <TextInput
                label="Web address"
                value={page.slug}
                onChange={(value) => onChange((draft) => void (draft.slug = normaliseSlug(value)))}
                description={`This page will be at /${page.slug}`}
              />
              {slugProblem && <Banner status="warning" title={slugProblem.message} />}
            </>
          )}

          <Selector
            label="Visibility"
            value={page.status}
            options={[
              { value: 'draft', label: 'Draft — only you can see it' },
              { value: 'published', label: 'Published — anyone can see it' },
            ]}
            onChange={(value) =>
              onChange((draft) => void (draft.status = value as PageRecord['status']))
            }
          />

          {!isHomePage(page) && (
            <Switch
              label="Show in the site menu"
              value={page.nav.show}
              onChange={(checked) => onChange((draft) => void (draft.nav.show = checked))}
              description="Adds a link to this page in the navigation, alongside the ones in Settings."
            />
          )}
          {page.nav.show && (
            <TextInput
              label="Menu label"
              value={page.nav.label ?? ''}
              placeholder={page.title}
              onChange={(value) => onChange((draft) => void (draft.nav.label = value))}
              description="Leave blank to use the page title."
            />
          )}

          <HStack gap={2}>
            <Button
              variant="secondary"
              size="sm"
              label="Preview this page"
              onClick={() => {
                window.open(
                  `/api/preview?path=/${isHomePage(page) ? '' : page.slug}`,
                  '_blank',
                  'noopener'
                );
              }}
            />
          </HStack>
        </VStack>
      </AstryxSection>

      <Divider />

      <AstryxSection
        title="Blocks"
        description="Each block is a band across the page. Move them, hide them, or take them out."
      >
        <VStack gap={4}>
          {parsed.length === 0 ? (
            <Text type="supporting" display="block">
              Nothing on this page yet. Add a block below.
            </Text>
          ) : (
            <AdminRecordList>
              {parsed.map((entry, index) => {
                const id = entry.kind === 'block' ? entry.block.id : entry.id;
                const definition =
                  entry.kind === 'block' ? getBlockDefinition(entry.block.type) : undefined;
                const warnings = runBlockChecks(entry);

                return (
                  <AdminRecord
                    key={id}
                    value={id}
                    title={definition?.label ?? 'Not readable'}
                    summary={entry.kind === 'block' ? blockSummary(entry.block) : entry.reason}
                    badge={warnings.length ? `${warnings.length} to look at` : undefined}
                    badgeVariant="amber"
                    visible={entry.kind === 'block' ? !entry.block.hidden : undefined}
                    onToggleVisible={
                      entry.kind === 'block'
                        ? () =>
                            onChange((draft) => {
                              const block = draft.blocks[index] as { hidden?: boolean };
                              block.hidden = !block.hidden;
                            })
                        : undefined
                    }
                    onMoveUp={() => moveBlock(onChange, index, -1)}
                    onMoveDown={() => moveBlock(onChange, index, 1)}
                    canMoveUp={index > 0}
                    canMoveDown={index < parsed.length - 1}
                    onRemove={() =>
                      onChange((draft) => {
                        draft.blocks = draft.blocks.filter((_, i) => i !== index);
                      })
                    }
                    removeLabel="Remove block"
                  >
                    {entry.kind === 'unknown' ? (
                      /* Kept, never dropped — saving this page must not destroy
                         a block a newer version of the site wrote. */
                      <Banner
                        status="warning"
                        title="This block cannot be shown here"
                        description={`${entry.reason} It is kept exactly as it is, and will work again on a version that understands it.`}
                      />
                    ) : (
                      <VStack gap={4}>
                        {warnings.map((warning) => (
                          <Banner key={warning} status="info" title={warning} />
                        ))}
                        {definition && (
                          <BlockFields
                            fields={definition.fields}
                            props={entry.block.props}
                            onUpload={onUpload}
                            onChange={(next) =>
                              onChange((draft) => {
                                (draft.blocks[index] as { props: unknown }).props = next;
                              })
                            }
                          />
                        )}
                      </VStack>
                    )}
                  </AdminRecord>
                );
              })}
            </AdminRecordList>
          )}

          <Card>
            <VStack gap={3}>
              <Text type="label" display="block">
                Add a block
              </Text>
              {PALETTE_GROUPS.map((group) => {
                const inGroup = definitions.filter((d) => d.group === group.id);
                if (inGroup.length === 0) return null;
                return (
                  <VStack key={group.id} gap={2}>
                    <Text type="supporting" display="block">
                      {group.label}
                    </Text>
                    <HStack gap={2} wrap="wrap">
                      {inGroup.map((definition) => (
                        <Button
                          key={definition.type}
                          size="sm"
                          variant="secondary"
                          label={definition.label}
                          tooltip={definition.description}
                          onClick={() => addBlock(definition.type)}
                        />
                      ))}
                    </HStack>
                  </VStack>
                );
              })}
            </VStack>
          </Card>
        </VStack>
      </AstryxSection>

      <Divider />

      <AstryxSection title="Search and sharing">
        <VStack gap={4}>
          <TextInput
            label="Title for search results"
            value={page.seo.title ?? ''}
            placeholder={page.title}
            onChange={(value) => onChange((draft) => void (draft.seo.title = value))}
          />
          <TextArea
            label="Description"
            rows={3}
            value={page.seo.description ?? ''}
            onChange={(value) => onChange((draft) => void (draft.seo.description = value))}
            description="One or two sentences. This is what people read under the link."
          />
          <Switch
            label="Keep out of search engines"
            value={page.seo.noindex ?? false}
            onChange={(checked) => onChange((draft) => void (draft.seo.noindex = checked))}
            description="The page stays reachable by anyone with the link, but is left out of search results and the sitemap."
          />
        </VStack>
      </AstryxSection>

      <HStack gap={2} align="center">
        <Badge variant="neutral" label={`Version ${page.revision}`} />
        <Text type="supporting">Changes are saved to your draft. Publish when you are ready.</Text>
      </HStack>
    </VStack>
  );
};

function moveBlock(
  onChange: (mutate: (page: PageRecord) => void) => void,
  index: number,
  by: number
) {
  onChange((draft) => {
    const target = index + by;
    if (target < 0 || target >= draft.blocks.length) return;
    [draft.blocks[index], draft.blocks[target]] = [draft.blocks[target], draft.blocks[index]];
  });
}
