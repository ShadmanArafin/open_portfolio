import React, { useState } from 'react';
import { Layout, VStack, HStack } from '@astryxdesign/core/Layout';
import { List, ListItem } from '@astryxdesign/core/List';
import { Card } from '@astryxdesign/core/Card';
import { Button } from '@astryxdesign/core/Button';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Badge } from '@astryxdesign/core/Badge';
import { Text } from '@astryxdesign/core/Text';
import { Heading } from '@astryxdesign/core/Heading';
import { Divider } from '@astryxdesign/core/Divider';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { Grid } from '@astryxdesign/core/Grid';
import { Mail, Trash2, Reply } from 'lucide-react';
import { useCMS } from '../../cms/context/CMSContext';
import { ContactMessage } from '../../cms/types/cms';
import { AstryxHeader } from '../components/astryx/AstryxComponents';

/**
 * Inbox: a dense list of enquiries beside a reading pane.
 *
 * The list is rows, not one card per message — cards are for widgets and
 * settings groups, and a card per row wastes vertical space in a scan-heavy
 * view. The reading pane is a single card, which is what cards are for.
 */
export const AdminMessagesInbox: React.FC = () => {
  const { draftData, updateMessageStatus, deleteMessage } = useCMS();
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);

  const messages = draftData.messages;
  const selectedMessage = messages.find((m) => m.id === selectedMessageId);

  const handleReplyMailto = (msg: ContactMessage) => {
    const subject = encodeURIComponent(`Re: your enquiry (${msg.projectType})`);
    const body = encodeURIComponent(
      `Hi ${msg.name},\n\nThanks for reaching out about ${msg.projectType}.\n\nBest,\n${draftData.settings.fullName}`
    );
    window.location.href = `mailto:${msg.email}?subject=${subject}&body=${body}`;
  };

  return (
    <VStack gap={6}>
      <AstryxHeader
        badgeText="Inbox"
        title={`Messages (${messages.length})`}
        subtitle="Enquiries sent through the contact form. Reply opens your email client."
      />

      {messages.length === 0 ? (
        <EmptyState
          title="No messages yet"
          description="Enquiries from the contact form arrive here."
          icon={<Mail aria-hidden />}
        />
      ) : (
        <Layout
          height="auto"
          start={
            <List hasDividers>
              {messages.map((msg) => (
                <ListItem
                  key={msg.id}
                  label={msg.name}
                  description={`${msg.projectType} · ${new Date(msg.receivedAt).toLocaleDateString()}`}
                  isSelected={selectedMessageId === msg.id}
                  endContent={
                    msg.status === 'unread' ? <Badge variant="blue" label="New" /> : undefined
                  }
                  onClick={() => {
                    setSelectedMessageId(msg.id);
                    if (msg.status === 'unread') updateMessageStatus(msg.id, 'read');
                  }}
                />
              ))}
            </List>
          }
        >
          {selectedMessage ? (
            <Card padding={5}>
              <VStack gap={4}>
                <HStack justify="between" align="start" gap={3}>
                  <VStack gap={0}>
                    <Heading level={2}>{selectedMessage.name}</Heading>
                    <Text type="supporting" display="block">
                      {selectedMessage.email}
                    </Text>
                  </VStack>

                  <HStack gap={2} align="center">
                    <Button
                      label="Reply"
                      variant="primary"
                      size="sm"
                      icon={<Reply aria-hidden />}
                      onClick={() => handleReplyMailto(selectedMessage)}
                    />
                    <IconButton
                      label="Delete message"
                      icon={<Trash2 aria-hidden />}
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        deleteMessage(selectedMessage.id);
                        setSelectedMessageId(null);
                      }}
                    />
                  </HStack>
                </HStack>

                <Divider />

                <Grid columns={{ minWidth: 200, repeat: 'fit' }} gap={4}>
                  <VStack gap={0}>
                    <Text type="supporting" display="block">
                      Project type
                    </Text>
                    <Text type="label">{selectedMessage.projectType}</Text>
                  </VStack>

                  {selectedMessage.company && (
                    <VStack gap={0}>
                      <Text type="supporting" display="block">
                        Company
                      </Text>
                      <Text type="label">{selectedMessage.company}</Text>
                    </VStack>
                  )}
                </Grid>

                <Card variant="muted" padding={4}>
                  <Text display="block">{selectedMessage.message}</Text>
                </Card>
              </VStack>
            </Card>
          ) : (
            <EmptyState
              title="Select a message"
              description="Pick an enquiry from the list to read it."
              icon={<Mail aria-hidden />}
              isCompact
            />
          )}
        </Layout>
      )}
    </VStack>
  );
};
