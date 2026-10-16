'use client';

import React, { useState } from 'react';
import { Dialog, DialogHeader } from '@astryxdesign/core/Dialog';
import { Button } from '@astryxdesign/core/Button';
import { Text } from '@astryxdesign/core/Text';
import { HStack, VStack } from '@astryxdesign/core/Layout';
import { TextInput } from './AdminFields';
import { AstryxButton } from './astryx/AstryxComponents';

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel?: string;
  /** Danger renders the confirm action as destructive. Defaults to primary. */
  tone?: 'danger' | 'primary';
  /**
   * Typed gate: the confirm stays disabled until this exact word is typed.
   * Reserved for irreversible wipes — a delete that versions can restore only
   * needs a clear question, not a typing test.
   */
  requireText?: string;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
}

/**
 * The one confirmation dialog for the whole admin.
 *
 * Native `window.confirm` blocks the thread, renders unstyled, ignores the
 * theme, traps nothing, and on mobile is a hostile little sheet with no
 * context. Every destructive or surprising action in the editor goes through
 * here instead: themed, labelled, keyboard-dismissable, and — for the wipes —
 * typed.
 */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Cancel',
  tone = 'primary',
  requireText,
  onConfirm,
  onClose,
}) => {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);

  const close = () => {
    setText('');
    onClose();
  };

  const armed = !requireText || text.trim() === requireText;

  const run = async () => {
    if (!armed || busy) return;
    setBusy(true);
    try {
      await onConfirm();
    } finally {
      setBusy(false);
      close();
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) close();
      }}
      width={480}
      purpose="form"
    >
      <DialogHeader title={title} />
      <VStack gap={4} padding={4}>
        {description && (
          <Text type="supporting" display="block">
            {description}
          </Text>
        )}
        {requireText && (
          <TextInput
            label={`Type ${requireText} to confirm`}
            value={text}
            onChange={setText}
            width="100%"
            placeholder={requireText}
          />
        )}
        <HStack gap={2} justify="end">
          <Button variant="ghost" label={cancelLabel} onClick={close} />
          {tone === 'danger' ? (
            <AstryxButton variant="danger" onClick={() => void run()} disabled={busy || !armed}>
              {confirmLabel}
            </AstryxButton>
          ) : (
            <Button
              variant="primary"
              label={busy ? 'Working…' : confirmLabel}
              isDisabled={busy || !armed}
              onClick={() => void run()}
            />
          )}
        </HStack>
      </VStack>
    </Dialog>
  );
};
