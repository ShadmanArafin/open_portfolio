'use client';

import React from 'react';
import { Button } from '@astryxdesign/core/Button';
import { Switch } from '@astryxdesign/core/Switch';
import { Text } from '@astryxdesign/core/Text';
import { HStack, VStack } from '@astryxdesign/core/Layout';
import { getPath, setPath, type BlockField } from '@/core/blocks/fields';
import { AdminImageField } from './AdminImageField';
import { Selector, TextArea, TextInput } from './AdminFields';

/**
 * One form for every block type.
 *
 * Blocks describe their editor as data; this renders it. The alternative — an
 * editor component per block — means the thirtieth block type is a React file
 * as well as a definition, and thirty chances for two blocks to disagree about
 * what a text field looks like.
 *
 * Everything writes through `setPath` onto a copy, so a block's props are
 * replaced rather than mutated and the editor around it can compare, autosave
 * and undo without every field having to cooperate.
 */

interface BlockFieldsProps {
  fields: BlockField[];
  /** The whole props object. Paths are resolved against it, not against a slice. */
  props: unknown;
  onChange: (next: unknown) => void;
  /** Uploads a file and returns the URL to store. */
  onUpload?: (file: File) => Promise<string | null>;
  /** Prefix applied to every path, used when rendering a list's children. */
  prefix?: string;
}

export const BlockFields: React.FC<BlockFieldsProps> = ({
  fields,
  props,
  onChange,
  onUpload,
  prefix = '',
}) => (
  <VStack gap={4}>
    {fields.map((field) => (
      <OneField
        key={field.path}
        field={field}
        props={props}
        onChange={onChange}
        onUpload={onUpload}
        prefix={prefix}
      />
    ))}
  </VStack>
);

const OneField: React.FC<{
  field: BlockField;
  props: unknown;
  onChange: (next: unknown) => void;
  onUpload?: (file: File) => Promise<string | null>;
  prefix: string;
}> = ({ field, props, onChange, onUpload, prefix }) => {
  const path = prefix ? `${prefix}.${field.path}` : field.path;
  const value = getPath(props, path);
  const write = (next: unknown) => onChange(setPath(props, path, next));

  switch (field.kind) {
    case 'list':
      return (
        <ListField
          field={field}
          props={props}
          onChange={onChange}
          onUpload={onUpload}
          path={path}
        />
      );

    case 'toggle':
      return (
        <Switch
          label={field.label}
          description={field.help}
          value={Boolean(value)}
          onChange={(checked) => write(checked)}
        />
      );

    case 'media':
      return (
        <VStack gap={1}>
          <Text type="label" as="label" display="block">
            {field.label}
          </Text>
          <AdminImageField
            src={String(value ?? '')}
            alt=""
            size="thumb"
            fit="cover"
            buttonLabel={value ? 'Replace' : 'Choose an image'}
            onFile={
              onUpload
                ? async (file) => {
                    const url = await onUpload(file);
                    if (url) write(url);
                  }
                : undefined
            }
          />
          {field.help && (
            <Text type="supporting" display="block">
              {field.help}
            </Text>
          )}
        </VStack>
      );

    case 'choice':
      return (
        <Selector
          label={field.label}
          description={field.help}
          value={value === undefined ? '' : String(value)}
          options={field.options.map((o) => ({ value: String(o.value), label: o.label }))}
          onChange={(next) => {
            // Options carry their real type; a select only speaks strings, and
            // handing `"3"` to a schema that expects `3` quarantines the block.
            write(field.options.find((o) => String(o.value) === next)?.value);
          }}
        />
      );

    case 'paragraphs':
      return (
        <TextArea
          label={field.label}
          description={field.help}
          rows={8}
          value={Array.isArray(value) ? (value as string[]).join('\n\n') : ''}
          onChange={(next) =>
            write(
              next
                .split(/\n\s*\n/)
                .map((paragraph) => paragraph.trim())
                .filter(Boolean)
            )
          }
        />
      );

    case 'textarea':
      return (
        <TextArea
          label={field.label}
          description={field.help}
          rows={field.rows ?? 3}
          value={String(value ?? '')}
          onChange={(next) => write(next)}
        />
      );

    default:
      return (
        <TextInput
          label={field.label}
          description={field.help}
          placeholder={field.placeholder}
          value={String(value ?? '')}
          onChange={(next) => write(next)}
        />
      );
  }
};

/**
 * A repeating group — gallery images, buttons, cards.
 *
 * `min` and `max` are enforced by not offering the control rather than by
 * refusing afterwards. A delete button that removes nothing and then explains
 * why is worse than no delete button.
 */
const ListField: React.FC<{
  field: Extract<BlockField, { kind: 'list' }>;
  props: unknown;
  onChange: (next: unknown) => void;
  onUpload?: (file: File) => Promise<string | null>;
  path: string;
}> = ({ field, props, onChange, onUpload, path }) => {
  const items = (getPath(props, path) as unknown[] | undefined) ?? [];

  const replace = (next: unknown[]) => onChange(setPath(props, path, next));
  const move = (index: number, by: number) => {
    const target = index + by;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    replace(next);
  };

  const atMax = field.max !== undefined && items.length >= field.max;
  const atMin = items.length <= (field.min ?? 0);

  return (
    <VStack gap={3}>
      <Text type="label" display="block">
        {field.label}
      </Text>
      {field.help && (
        <Text type="supporting" display="block">
          {field.help}
        </Text>
      )}

      {items.map((_, index) => (
        <VStack key={index} gap={3}>
          <HStack justify="between" align="center">
            <Text type="supporting">{`${field.itemNoun} ${index + 1}`}</Text>
            <HStack gap={1}>
              <Button
                size="sm"
                variant="ghost"
                label={`Move ${field.itemNoun} ${index + 1} up`}
                isDisabled={index === 0}
                onClick={() => move(index, -1)}
              >
                Up
              </Button>
              <Button
                size="sm"
                variant="ghost"
                label={`Move ${field.itemNoun} ${index + 1} down`}
                isDisabled={index === items.length - 1}
                onClick={() => move(index, 1)}
              >
                Down
              </Button>
              {!atMin && (
                <Button
                  size="sm"
                  variant="ghost"
                  label={`Remove ${field.itemNoun} ${index + 1}`}
                  onClick={() => replace(items.filter((_, i) => i !== index))}
                >
                  Remove
                </Button>
              )}
            </HStack>
          </HStack>

          <BlockFields
            fields={field.fields}
            props={props}
            onChange={onChange}
            onUpload={onUpload}
            prefix={`${path}.${index}`}
          />
        </VStack>
      ))}

      {!atMax && (
        <HStack>
          <Button
            size="sm"
            variant="secondary"
            label={`Add ${field.itemNoun}`}
            onClick={() => replace([...items, field.newItem()])}
          />
        </HStack>
      )}
    </VStack>
  );
};
