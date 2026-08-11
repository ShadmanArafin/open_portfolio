'use client';

import React, { useMemo, useState } from 'react';
import { Badge } from '@astryxdesign/core/Badge';
import { Banner } from '@astryxdesign/core/Banner';
import { Button } from '@astryxdesign/core/Button';
import { Divider } from '@astryxdesign/core/Divider';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { HStack, VStack } from '@astryxdesign/core/Layout';
import { Switch } from '@astryxdesign/core/Switch';
import { useCMS } from '../../cms/context/CMSContext';
import { AdminRecord, AdminRecordList } from '../components/AdminRecord';
import { AstryxHeader, AstryxSection } from '../components/astryx/AstryxComponents';
import { BlockFields } from '../components/BlockFields';
import { Selector, TextArea, TextInput } from '../components/AdminFields';
import {
  WRITING_DEFAULTS,
  arrange,
  createWritingEntry,
  type WritingEntry,
} from '@/core/writing/schema';
import {
  getBlockDefinition,
  listBlockDefinitions,
  parsePage,
  runBlockChecks,
} from '@/core/blocks/registry';

/**
 * Writing — essays, notes, posts, whatever this site calls them.
 *
 * The same block editor as pages, deliberately. A piece of writing that wants a
 * gallery or a pull quote should not need a parallel editor, a parallel
 * renderer and a parallel set of bugs, and every block added later works here
 * without anyone doing anything.
 *
 * The settings at the top are the part that makes this not a blog: what it is
 * called, whether dates show at all, and whether the newest or the best comes
 * first. See `docs/PLAN.md` for why those are the owner's choices rather than
 * ours.
 */

let idCounter = 0;
const newId = (prefix: string) => `${prefix}_${Date.now().toString(36)}_${++idCounter}`;

export const AdminWriting: React.FC = () => {
  const { draftData, updateDraft, uploadMedia } = useCMS();
  const [openId, setOpenId] = useState<string | null>(null);

  const settings = { ...WRITING_DEFAULTS, ...(draftData.writingSettings ?? {}) };
  const entries = useMemo(
    () => arrange(draftData.writing ?? [], settings.order),
    [draftData.writing, settings.order]
  );
  const definitions = useMemo(() => listBlockDefinitions(), []);

  const setSetting = (field: string, value: unknown) =>
    updateDraft((draft) => {
      draft.writingSettings = { ...WRITING_DEFAULTS, ...(draft.writingSettings ?? {}) };
      (draft.writingSettings as unknown as Record<string, unknown>)[field] = value;
    });

  const mutate = (id: string, apply: (entry: WritingEntry) => void) =>
    updateDraft((draft) => {
      const entry = (draft.writing ?? []).find((item) => item.id === id);
      if (!entry) return;
      apply(entry);
      entry.updatedAt = new Date().toISOString();
      entry.revision += 1;
    });

  const add = () => {
    const entry = { ...createWritingEntry('Untitled'), id: newId('writing') };
    entry.sortOrder = (draftData.writing?.length ?? 0) + 1;
    updateDraft((draft) => {
      draft.writing = [...(draft.writing ?? []), entry];
      draft.writingSettings = { ...WRITING_DEFAULTS, ...(draft.writingSettings ?? {}) };
    });
    setOpenId(entry.id);
  };

  const upload = async (file: File) => (await uploadMedia(file))?.url ?? null;

  return (
    <VStack gap={6}>
      <AstryxHeader
        title={settings.label}
        subtitle="Essays, notes, posts — whatever you want to call them. Built from the same blocks as your pages."
      >
        <Button variant="primary" label="Write something" onClick={add} />
      </AstryxHeader>

      <AstryxSection
        title="How this section works"
        description="These decide what visitors see. Nothing here is visible until you switch it on."
      >
        <VStack gap={4}>
          <Switch
            label="Show this section on my site"
            value={settings.enabled}
            onChange={(on) => setSetting('enabled', on)}
            description="Off by default. A section with nothing in it is worse for a portfolio than no section at all."
          />

          <TextInput
            label="What is it called?"
            value={settings.label}
            onChange={(value) => setSetting('label', value)}
            description="Writing, Blog, Journal, Essays, Notes — whatever fits what you do. It always lives at /writing."
          />

          <Selector
            label="What comes first?"
            value={settings.order}
            options={[
              { value: 'curated', label: 'The order I choose — best work first' },
              { value: 'newest', label: 'Newest first — like a blog' },
            ]}
            onChange={(value) => setSetting('order', value)}
            description="Pinned pieces come first either way."
          />

          <Switch
            label="Show dates"
            value={settings.showDates}
            onChange={(on) => setSetting('showDates', on)}
            description="Off by default. An essay that is still true does not look better with a date from three years ago on it."
          />
        </VStack>
      </AstryxSection>

      <Divider />

      {entries.length === 0 ? (
        <EmptyState
          title="Nothing written yet"
          description="A piece is a title and some blocks — the same ones your pages use."
          actions={<Button variant="primary" label="Write something" onClick={add} />}
        />
      ) : (
        <AdminRecordList>
          {entries.map((entry, index) => {
            const parsed = parsePage(entry.blocks);
            const warnings = parsed.flatMap(runBlockChecks);

            return (
              <AdminRecord
                key={entry.id}
                value={entry.id}
                title={entry.title || 'Untitled'}
                summary={`/writing/${entry.slug}${entry.summary ? ` · ${entry.summary}` : ''}`}
                badge={
                  entry.status === 'published'
                    ? 'Live'
                    : entry.status === 'scheduled'
                      ? 'Scheduled'
                      : 'Draft'
                }
                badgeVariant={
                  entry.status === 'published'
                    ? 'green'
                    : entry.status === 'scheduled'
                      ? 'cyan'
                      : 'amber'
                }
                defaultIsOpen={entry.id === openId}
                onMoveUp={() => reorder(updateDraft, entries, index, -1)}
                onMoveDown={() => reorder(updateDraft, entries, index, 1)}
                canMoveUp={settings.order === 'curated' && index > 0}
                canMoveDown={settings.order === 'curated' && index < entries.length - 1}
                onRemove={() =>
                  updateDraft((draft) => {
                    draft.writing = (draft.writing ?? []).filter((item) => item.id !== entry.id);
                  })
                }
                removeLabel="Delete"
              >
                <VStack gap={5}>
                  <TextInput
                    label="Title"
                    value={entry.title}
                    onChange={(value) => mutate(entry.id, (e) => void (e.title = value))}
                  />
                  <TextArea
                    label="Summary"
                    rows={2}
                    value={entry.summary}
                    onChange={(value) => mutate(entry.id, (e) => void (e.summary = value))}
                    description="One or two lines. Shown in the list, and used as the description in search results."
                  />

                  <Selector
                    label="Visibility"
                    value={entry.status}
                    options={[
                      { value: 'draft', label: 'Draft — only you can see it' },
                      { value: 'published', label: 'Published — anyone can see it' },
                      { value: 'scheduled', label: 'Scheduled — appears on a date' },
                    ]}
                    onChange={(value) =>
                      mutate(entry.id, (e) => void (e.status = value as WritingEntry['status']))
                    }
                  />

                  {entry.status === 'scheduled' && (
                    <TextInput
                      label="Appears on"
                      value={entry.scheduledFor ?? ''}
                      placeholder="2026-09-01T09:00"
                      onChange={(value) => mutate(entry.id, (e) => void (e.scheduledFor = value))}
                      description="It appears on its own, the first time anybody loads the site after that moment. Nothing needs to be running."
                    />
                  )}

                  <Switch
                    label="Pin to the top"
                    value={entry.featured}
                    onChange={(on) => mutate(entry.id, (e) => void (e.featured = on))}
                    description="Keeps your best piece first, however the rest is ordered."
                  />

                  <Divider />

                  {warnings.map((warning) => (
                    <Banner key={warning} status="info" title={warning} />
                  ))}

                  {parsed.length === 0 && (
                    <Banner
                      status="info"
                      title="Nothing written here yet"
                      description="Add a Text block below and start typing."
                    />
                  )}

                  {parsed.map((block, blockIndex) => {
                    if (block.kind !== 'block') return null;
                    const definition = getBlockDefinition(block.block.type);
                    if (!definition) return null;

                    return (
                      <VStack key={block.block.id} gap={3}>
                        <HStack justify="between" align="center">
                          <Badge variant="neutral" label={definition.label} />
                          <Button
                            size="sm"
                            variant="ghost"
                            label={`Remove ${definition.label}`}
                            onClick={() =>
                              mutate(
                                entry.id,
                                (e) => void (e.blocks = e.blocks.filter((_, i) => i !== blockIndex))
                              )
                            }
                          />
                        </HStack>
                        <BlockFields
                          fields={definition.fields}
                          props={block.block.props}
                          onUpload={upload}
                          onChange={(next) =>
                            mutate(entry.id, (e) => {
                              (e.blocks[blockIndex] as { props: unknown }).props = next;
                            })
                          }
                        />
                      </VStack>
                    );
                  })}

                  <HStack gap={2} wrap="wrap">
                    {definitions.map((definition) => (
                      <Button
                        key={definition.type}
                        size="sm"
                        variant="secondary"
                        label={`Add ${definition.label}`}
                        onClick={() =>
                          mutate(entry.id, (e) => {
                            e.blocks = [
                              ...e.blocks,
                              {
                                id: newId('block'),
                                type: definition.type,
                                v: definition.version,
                                props: definition.defaults(),
                              },
                            ];
                          })
                        }
                      />
                    ))}
                  </HStack>
                </VStack>
              </AdminRecord>
            );
          })}
        </AdminRecordList>
      )}
    </VStack>
  );
};

function reorder(
  updateDraft: (fn: (draft: { writing?: WritingEntry[] }) => void) => void,
  ordered: WritingEntry[],
  index: number,
  by: number
) {
  const target = index + by;
  if (target < 0 || target >= ordered.length) return;

  updateDraft((draft) => {
    // Renumbering the whole list rather than swapping two values: manual
    // positions drift apart as things are added and deleted, and a swap of two
    // stale numbers moves an item somewhere nobody asked for.
    const moved = [...ordered];
    [moved[index], moved[target]] = [moved[target], moved[index]];
    moved.forEach((item, position) => {
      const record = (draft.writing ?? []).find((w) => w.id === item.id);
      if (record) record.sortOrder = position + 1;
    });
  });
}
