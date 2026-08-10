'use client';

import React, { useId } from 'react';
import { CollapsibleGroup, useCollapsible } from '@astryxdesign/core/Collapsible';
import { Card } from '@astryxdesign/core/Card';
import { Badge } from '@astryxdesign/core/Badge';
import { Text } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Divider } from '@astryxdesign/core/Divider';
import { HStack, VStack } from '@astryxdesign/core/Layout';
import { ChevronUp, ChevronDown, Trash2, Eye, EyeOff } from 'lucide-react';

interface AdminRecordListProps {
  children: React.ReactNode;
}

/**
 * The container for a list of records: a card each, with air between them.
 *
 * CollapsibleGroup coordinates the rows; `type="multiple"` lets more than one
 * be open, so opening a second record never closes the one being edited.
 */
export const AdminRecordList: React.FC<AdminRecordListProps> = ({ children }) => (
  <CollapsibleGroup type="multiple">
    <VStack gap={3}>{children}</VStack>
  </CollapsibleGroup>
);

interface AdminRecordProps {
  /** Identifies the row to the group. Use the record's id. */
  value: string;
  title: string;
  /** Second line under the title — enough to identify the record while collapsed. */
  summary?: string;
  badge?: string;
  badgeVariant?: 'green' | 'cyan' | 'amber' | 'red' | 'outline' | 'neutral';
  /**
   * Thumbnail shown at the head of the row, collapsed or open. For records
   * where the image *is* the content, a title alone doesn't identify them.
   */
  media?: React.ReactNode;
  visible?: boolean;
  onToggleVisible?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  onRemove?: () => void;
  removeLabel?: string;
  defaultIsOpen?: boolean;
  children: React.ReactNode;
}

const BADGE_VARIANT = {
  green: 'green',
  cyan: 'cyan',
  amber: 'yellow',
  red: 'red',
  outline: 'neutral',
  neutral: 'neutral',
} as const;

/**
 * A pair of stacked reorder arrows.
 *
 * Astryx's smallest IconButton is a full control height, and two of those
 * stacked would be taller than the row they sit in. This is the one place the
 * editor drops to bare buttons, and it keeps the whole reorder affordance to
 * the width of a single icon.
 */
const ReorderArrows: React.FC<{
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  title: string;
}> = ({ onMoveUp, onMoveDown, canMoveUp, canMoveDown, title }) => (
  <div className="flex flex-col gap-0.5 text-text-muted flex-shrink-0">
    <button
      onClick={onMoveUp}
      disabled={!canMoveUp}
      title={`Move ${title} up`}
      aria-label={`Move ${title} up`}
      className="p-0.5 hover:text-text-primary disabled:opacity-30 cursor-pointer"
    >
      <ChevronUp className="w-3.5 h-3.5" />
    </button>
    <button
      onClick={onMoveDown}
      disabled={!canMoveDown}
      title={`Move ${title} down`}
      aria-label={`Move ${title} down`}
      className="p-0.5 hover:text-text-primary disabled:opacity-30 cursor-pointer"
    >
      <ChevronDown className="w-3.5 h-3.5" />
    </button>
  </div>
);

/**
 * One editable record, collapsed by default.
 *
 * These lists are forms — six to eight fields each — so expanding them all at
 * once buried the list itself. Collapsed, the page is a scannable index; open
 * one and you get the full form.
 *
 * Built on `useCollapsible` rather than `Collapsible` so the row controls sit
 * beside the toggle instead of inside it. Astryx renders a Collapsible trigger
 * as a `<button>`, and a button nested in a button is closed early by the HTML
 * parser — which is what tore each row in half. As siblings they stay valid,
 * and reordering works without opening the record first.
 *
 * The hook still defers to the surrounding CollapsibleGroup via `value`.
 */
export const AdminRecord: React.FC<AdminRecordProps> = ({
  value,
  title,
  summary,
  badge,
  badgeVariant = 'neutral',
  media,
  visible,
  onToggleVisible,
  onMoveUp,
  onMoveDown,
  canMoveUp = true,
  canMoveDown = true,
  onRemove,
  removeLabel = 'Remove',
  defaultIsOpen = false,
  children,
}) => {
  const panelId = useId();
  const { isOpen, toggle } = useCollapsible({
    value,
    isCollapsible: { defaultIsOpen },
  });

  return (
    // Padding lives on the rows, not the Card: Card takes a single uniform
    // value, and the collapsed row wants a tighter vertical rhythm (12) than
    // its horizontal one (16).
    <Card padding={0}>
      <VStack gap={0}>
        <HStack gap={3} justify="between" align="center" paddingInline={4} paddingBlock={3}>
          <HStack gap={3} align="center">
            {(onMoveUp || onMoveDown) && (
              <ReorderArrows
                onMoveUp={onMoveUp}
                onMoveDown={onMoveDown}
                canMoveUp={canMoveUp}
                canMoveDown={canMoveDown}
                title={title}
              />
            )}

            {media && (
              <div
                style={{
                  height: 44,
                  width: 64,
                  flexShrink: 0,
                  borderRadius: 'var(--radius-element)',
                  overflow: 'hidden',
                  background: 'var(--color-background-muted)',
                  border: '1px solid var(--color-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {media}
              </div>
            )}

            <VStack gap={0} align="start">
              <HStack gap={2} align="center">
                <Text type="large" weight="medium" maxLines={1}>
                  {title}
                </Text>
                {badge && <Badge variant={BADGE_VARIANT[badgeVariant] as never} label={badge} />}
              </HStack>
              {summary && (
                <Text type="supporting" display="block" maxLines={1}>
                  {summary}
                </Text>
              )}
            </VStack>
          </HStack>

          <HStack gap={2} align="center">
            {onToggleVisible && (
              // A show/hide toggle is a state, not a status — neutral, not green.
              <Button
                label={visible === false ? 'Hidden' : 'Visible'}
                variant={visible === false ? 'ghost' : 'secondary'}
                size="sm"
                icon={visible === false ? <EyeOff aria-hidden /> : <Eye aria-hidden />}
                tooltip={visible === false ? 'Show this on the site' : 'Hide this from the site'}
                onClick={onToggleVisible}
              />
            )}

            {onRemove && (
              <IconButton
                label={removeLabel}
                icon={<Trash2 aria-hidden />}
                variant="ghost"
                size="sm"
                onClick={onRemove}
              />
            )}

            <IconButton
              label={isOpen ? `Collapse ${title}` : `Edit ${title}`}
              icon={isOpen ? <ChevronUp aria-hidden /> : <ChevronDown aria-hidden />}
              variant="secondary"
              size="sm"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={toggle}
            />
          </HStack>
        </HStack>

        {isOpen && (
          <>
            <Divider />
            <VStack gap={4} paddingInline={4} paddingBlock={4}>
              <div id={panelId} role="region" aria-label={title}>
                <VStack gap={4}>{children}</VStack>
              </div>
            </VStack>
          </>
        )}
      </VStack>
    </Card>
  );
};
