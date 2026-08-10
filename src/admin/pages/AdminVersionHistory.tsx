import React, { useState } from 'react';
import { List, ListItem } from '@astryxdesign/core/List';
import { VStack } from '@astryxdesign/core/Layout';
import { Button } from '@astryxdesign/core/Button';
import { Badge } from '@astryxdesign/core/Badge';
import { Text } from '@astryxdesign/core/Text';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { RotateCcw, Check } from 'lucide-react';
import { useCMS } from '../../cms/context/CMSContext';
import { AstryxHeader } from '../components/astryx/AstryxComponents';

/**
 * Snapshots are dense, read-mostly data, so they are rows rather than one card
 * each — see `astryx docs layout`.
 */
export const AdminVersionHistory: React.FC = () => {
  const { draftData, restoreVersion } = useCMS();
  const [restoredId, setRestoredId] = useState<string | null>(null);

  const versions = draftData.versions ?? [];

  const handleRestore = async (id: string) => {
    if (
      !window.confirm(
        'Restore this snapshot into your working draft? Publish afterwards to make it live.'
      )
    )
      return;

    const success = await restoreVersion(id);
    if (success) {
      setRestoredId(id);
      setTimeout(() => setRestoredId(null), 3000);
    }
  };

  return (
    <VStack gap={6}>
      <AstryxHeader
        badgeText="History"
        title={`Version History (${versions.length})`}
        subtitle="Every publish is snapshotted. Restoring loads one back into your draft — publish again to make it live."
      />

      {versions.length === 0 ? (
        <EmptyState
          title="No snapshots yet"
          description="A snapshot is taken each time you publish. The last 20 are kept."
        />
      ) : (
        <List hasDividers>
          {versions.map((ver, idx) => {
            const isRestored = restoredId === ver.id;
            return (
              <ListItem
                key={ver.id}
                label={ver.summary || ver.action}
                description={`${new Date(ver.timestamp).toLocaleString()} · ${ver.editor}`}
                startContent={<Badge variant="neutral" label={`#${versions.length - idx}`} />}
                endContent={
                  <Button
                    label={isRestored ? 'Restored' : 'Restore'}
                    variant={isRestored ? 'primary' : 'secondary'}
                    size="sm"
                    icon={isRestored ? <Check aria-hidden /> : <RotateCcw aria-hidden />}
                    onClick={() => void handleRestore(ver.id)}
                  />
                }
              />
            );
          })}
        </List>
      )}

      <Text type="supporting" display="block">
        History is capped at 20 snapshots so stored content cannot grow without bound.
      </Text>
    </VStack>
  );
};
