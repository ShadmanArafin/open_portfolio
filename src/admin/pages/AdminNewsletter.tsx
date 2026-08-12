'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Badge } from '@astryxdesign/core/Badge';
import { Banner } from '@astryxdesign/core/Banner';
import { Button } from '@astryxdesign/core/Button';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { HStack, VStack } from '@astryxdesign/core/Layout';
import { List, ListItem } from '@astryxdesign/core/List';
import { Switch } from '@astryxdesign/core/Switch';
import { Text } from '@astryxdesign/core/Text';
import { Mail } from 'lucide-react';
import { useCMS } from '../../cms/context/CMSContext';
import { useToast } from '../../context/ToastContext';
import { AstryxHeader, AstryxSection } from '../components/astryx/AstryxComponents';
import { TextInput } from '../components/AdminFields';
import { NEWSLETTER_DEFAULTS, type Subscriber } from '@/core/newsletter/schema';

/**
 * The mailing list.
 *
 * Two halves that look alike and are not. The settings at the top are content —
 * drafted, published and exported with everything else. The list at the bottom
 * is **not** content: it never enters the published snapshot, never reaches a
 * visitor's browser, and is read here over an authenticated request rather than
 * from `draftData`. That is why this screen fetches, when almost every other
 * one does not.
 *
 * What it deliberately does not do is send. Broadcasting has obligations —
 * deliverability, bounces, list hygiene, an unsubscribe that works first time —
 * and half of that leaves somebody holding a list they cannot practically mail.
 * Export takes the list somewhere built for it.
 */
export const AdminNewsletter: React.FC = () => {
  const { draftData, updateDraft } = useCMS();
  const { showToast } = useToast();

  const settings = { ...NEWSLETTER_DEFAULTS, ...(draftData.newsletter ?? {}) };

  const [subscribers, setSubscribers] = useState<Subscriber[] | null>(null);
  const [emailConfigured, setEmailConfigured] = useState(true);
  const [loadError, setLoadError] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/subscribers', { credentials: 'same-origin' });
      const body = (await res.json()) as {
        ok?: boolean;
        subscribers?: Subscriber[];
        emailConfigured?: boolean;
        error?: string;
      };
      if (!body.ok) {
        setLoadError(body.error || 'Could not load your subscribers.');
        return;
      }
      setSubscribers(body.subscribers ?? []);
      setEmailConfigured(body.emailConfigured !== false);
      setLoadError('');
    } catch {
      setLoadError('Could not reach the server.');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const setSetting = (field: string, value: unknown) =>
    updateDraft((draft) => {
      draft.newsletter = { ...NEWSLETTER_DEFAULTS, ...(draft.newsletter ?? {}) };
      (draft.newsletter as unknown as Record<string, unknown>)[field] = value;
    });

  const remove = async (id: string) => {
    const res = await fetch(`/api/admin/subscribers?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
      credentials: 'same-origin',
    });
    if (res.ok) {
      setSubscribers((current) => (current ?? []).filter((s) => s.id !== id));
      showToast('Removed.', 'success');
    } else {
      // The toast vocabulary here has no failure variant, and inventing one for
      // a single screen is worse than putting the problem where the rest of
      // this screen's problems already appear.
      setLoadError('That one could not be removed. Reload and try again.');
    }
  };

  const confirmed = (subscribers ?? []).filter((s) => s.status === 'confirmed');
  const pending = (subscribers ?? []).filter((s) => s.status === 'pending');

  return (
    <VStack gap={6}>
      <AstryxHeader
        badgeText="Newsletter"
        title="Sign-ups"
        subtitle="Collect email addresses on your site and take them anywhere. This does not send email — it gives you the list."
      />

      {settings.enabled && !emailConfigured && (
        <Banner
          status="warning"
          title="Sign-ups cannot work yet"
          description="Confirming a sign-up means sending somebody a link, and no mail server is connected. Until one is, the form will tell visitors it is not working. Connect one under Services."
        />
      )}

      <AstryxSection
        title="The form on your site"
        description="It appears at the bottom of every page. Nothing shows until you switch it on."
      >
        <VStack gap={4}>
          <Switch
            label="Ask visitors for their email address"
            value={settings.enabled}
            onChange={(on) => setSetting('enabled', on)}
            description="Off by default. An empty newsletter box is a promise nobody kept."
          />

          <TextInput
            label="What are you offering?"
            value={settings.pitch}
            onChange={(value) => setSetting('pitch', value)}
            description="One line, above the box. “Occasional notes about what I'm making” beats “Subscribe to my newsletter”."
          />

          <TextInput
            label="Button"
            value={settings.buttonLabel}
            onChange={(value) => setSetting('buttonLabel', value)}
          />

          <TextInput
            label="What they see after signing up"
            value={settings.pendingMessage}
            onChange={(value) => setSetting('pendingMessage', value)}
            description="They are not subscribed yet at this point — they have to click a link in an email first. Say so, or people think they are done."
          />
        </VStack>
      </AstryxSection>

      <AstryxSection
        title="Your list"
        description="Confirmed addresses only in the export — those are the ones you may lawfully mail."
      >
        <VStack gap={4}>
          {loadError && <Banner status="error" title="Could not load" description={loadError} />}

          <HStack gap={3} align="center">
            {/* Counts are metadata, not statuses — plain text rather than a
                badge, which would steal attention it does not need. */}
            <Text type="supporting">
              {confirmed.length} confirmed
              {pending.length > 0 ? ` · ${pending.length} waiting to confirm` : ''}
            </Text>
            <Button
              variant="secondary"
              size="sm"
              label="Download CSV"
              /* A plain link, not a fetch-and-blob: the session cookie already
                 authenticates it, and a real download works on a phone where a
                 generated object URL often does not. */
              onClick={() => {
                window.location.href = '/api/admin/subscribers?format=csv';
              }}
              isDisabled={confirmed.length === 0}
            />
          </HStack>

          <Text type="supporting">
            The columns match what Buttondown, Mailchimp and the rest expect on import, so moving to
            a sending tool is a file upload rather than a project.
          </Text>

          {subscribers === null ? (
            <Text type="supporting">Loading…</Text>
          ) : subscribers.length === 0 ? (
            <EmptyState
              title="Nobody has signed up yet"
              description="Addresses appear here as people confirm them."
              icon={<Mail aria-hidden />}
            />
          ) : (
            <List hasDividers>
              {subscribers.map((subscriber) => (
                <ListItem
                  key={subscriber.id}
                  label={subscriber.email}
                  description={
                    subscriber.status === 'confirmed'
                      ? `Confirmed ${new Date(subscriber.confirmedAt ?? subscriber.requestedAt).toLocaleDateString()}`
                      : subscriber.status === 'pending'
                        ? `Asked ${new Date(subscriber.requestedAt).toLocaleDateString()} — has not confirmed yet`
                        : `Unsubscribed ${new Date(subscriber.unsubscribedAt ?? subscriber.requestedAt).toLocaleDateString()}`
                  }
                  endContent={
                    <HStack gap={2} align="center">
                      {subscriber.status !== 'confirmed' && (
                        <Badge
                          variant={subscriber.status === 'pending' ? 'neutral' : 'red'}
                          label={subscriber.status}
                        />
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        label="Remove"
                        onClick={() => void remove(subscriber.id)}
                      />
                    </HStack>
                  }
                />
              ))}
            </List>
          )}
        </VStack>
      </AstryxSection>
    </VStack>
  );
};
