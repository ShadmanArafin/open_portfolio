'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { VStack } from '@astryxdesign/core/Layout';
import { Grid } from '@astryxdesign/core/Grid';
import { Card } from '@astryxdesign/core/Card';
import { List, ListItem } from '@astryxdesign/core/List';
import { Badge } from '@astryxdesign/core/Badge';
import { Text } from '@astryxdesign/core/Text';
import { Heading } from '@astryxdesign/core/Heading';
import { Divider } from '@astryxdesign/core/Divider';
import { Banner } from '@astryxdesign/core/Banner';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { useCMS } from '../../cms/context/CMSContext';
import { AstryxHeader } from '../components/astryx/AstryxComponents';
import { TRACKED_EVENTS, getAnalyticsConfig, isAnalyticsConfigured } from '../../utils/analytics';

/** Enquiries are the one audience signal this site owns outright. */
function enquiryStats(messages: { receivedAt: string; status: string }[]) {
  const now = Date.now();
  const days = (n: number) =>
    messages.filter((m) => {
      const t = new Date(m.receivedAt).getTime();
      return !Number.isNaN(t) && now - t <= n * 86_400_000;
    }).length;

  const byMonth = new Map<string, number>();
  messages.forEach((m) => {
    const d = new Date(m.receivedAt);
    if (Number.isNaN(d.getTime())) return;
    const key = d.toLocaleDateString([], { month: 'short', year: '2-digit' });
    byMonth.set(key, (byMonth.get(key) ?? 0) + 1);
  });

  const latest = messages
    .map((m) => new Date(m.receivedAt).getTime())
    .filter((t) => !Number.isNaN(t))
    .sort((a, b) => b - a)[0];

  return {
    total: messages.length,
    unread: messages.filter((m) => m.status === 'unread').length,
    last30: days(30),
    last90: days(90),
    byMonth: [...byMonth.entries()].slice(-6),
    daysSinceLast: latest ? Math.floor((now - latest) / 86_400_000) : null,
  };
}

/**
 * Analytics.
 *
 * Two halves, kept visibly separate because they are trustworthy in different
 * ways. Enquiries are first-party: they are in this database because someone
 * submitted the form, so those numbers are exact. Audience numbers — visitors,
 * which project got opened, who clicked through to a live site — cannot be
 * produced by a static site at all, and are shown by the provider once one is
 * connected.
 *
 * The site is already instrumented either way, so connecting a provider starts
 * real data immediately rather than starting a build.
 */
export const AdminAnalytics: React.FC = () => {
  const { data } = useCMS();
  const config = getAnalyticsConfig();
  const connected = isAnalyticsConfigured();

  // View counts, when the owner pasted an API key into the provider's
  // settings. Absent means enquiry-only — never an error state.
  const [audience, setAudience] = useState<{
    provider: string;
    visitors30d: number | null;
    pageviews30d: number | null;
    topPages: { path: string; views: number }[];
  } | null>(null);

  useEffect(() => {
    let live = true;
    fetch('/api/admin/analytics/summary')
      .then((res) => (res.ok ? res.json() : null))
      .then((body: { ok?: boolean; summary?: typeof audience } | null) => {
        if (live && body?.ok && body.summary) setAudience(body.summary);
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, []);

  const stats = useMemo(() => enquiryStats(data.messages ?? []), [data.messages]);

  const published = data.projects.filter((p) => p.status === 'published');
  const publishedStudies = data.caseStudies.filter((c) => c.status === 'published');

  return (
    <VStack gap={6}>
      <AstryxHeader
        badgeText="Analytics"
        title="Audience & Enquiries"
        subtitle="What the site can measure about the people using it, and what it needs to measure more."
      />

      <Grid columns={{ minWidth: 220, repeat: 'fit' }} gap={4}>
        <Card padding={4}>
          <VStack gap={2} align="start">
            <Text type="supporting">Enquiries received</Text>
            <Heading level={2}>{String(stats.total)}</Heading>
            <Text type="supporting" display="block">
              {`${stats.last30} in the last 30 days`}
            </Text>
          </VStack>
        </Card>

        <Card padding={4}>
          <VStack gap={2} align="start">
            <Text type="supporting">Awaiting a reply</Text>
            <Heading level={2}>{String(stats.unread)}</Heading>
            {stats.unread > 0 ? (
              <Badge variant="red" label="Someone is waiting" />
            ) : (
              <Text type="supporting" display="block">
                Inbox clear
              </Text>
            )}
          </VStack>
        </Card>

        <Card padding={4}>
          <VStack gap={2} align="start">
            <Text type="supporting">Last enquiry</Text>
            <Heading level={2}>
              {stats.daysSinceLast === null
                ? '—'
                : stats.daysSinceLast === 0
                  ? 'Today'
                  : `${stats.daysSinceLast}d`}
            </Heading>
            <Text type="supporting" display="block">
              {stats.daysSinceLast === null ? 'None yet' : 'since the last one'}
            </Text>
          </VStack>
        </Card>

        <Card padding={4}>
          <VStack gap={2} align="start">
            <Text type="supporting">Pages that can be found</Text>
            <Heading level={2}>{String(published.length + publishedStudies.length + 5)}</Heading>
            <Text type="supporting" display="block">
              {`${published.length} projects · ${publishedStudies.length} case studies · 5 fixed pages`}
            </Text>
          </VStack>
        </Card>

        {audience && (
          <>
            <Card padding={4}>
              <VStack gap={2} align="start">
                <Text type="supporting">Visitors · last 30 days</Text>
                <Heading level={2}>
                  {audience.visitors30d === null ? '—' : String(audience.visitors30d)}
                </Heading>
                <Text type="supporting" display="block">
                  {`from ${audience.provider}`}
                </Text>
              </VStack>
            </Card>

            <Card padding={4}>
              <VStack gap={2} align="start">
                <Text type="supporting">Page views · last 30 days</Text>
                <Heading level={2}>
                  {audience.pageviews30d === null ? '—' : String(audience.pageviews30d)}
                </Heading>
                <Text type="supporting" display="block">
                  {audience.topPages.length > 0
                    ? `${audience.topPages.length} busiest pages below`
                    : 'No page breakdown available'}
                </Text>
              </VStack>
            </Card>
          </>
        )}
      </Grid>

      <Grid columns={{ minWidth: 340, repeat: 'fit' }} gap={6} align="start">
        <VStack gap={3}>
          <Heading level={3}>Enquiries by month</Heading>
          {stats.byMonth.length === 0 ? (
            <EmptyState
              title="No enquiries yet"
              description="Submissions from the contact form are counted here."
              isCompact
            />
          ) : (
            <List hasDividers density="compact">
              {stats.byMonth.map(([month, count]) => (
                <ListItem
                  key={month}
                  label={month}
                  endContent={<Badge variant="neutral" label={`${count}`} />}
                />
              ))}
            </List>
          )}
          <Text type="supporting" display="block">
            Counted from the contact form, so these are exact — every one is a message in your
            inbox.
          </Text>

          {audience && audience.topPages.length > 0 && (
            <VStack gap={2}>
              <Heading level={3}>Busiest pages · last 30 days</Heading>
              <List hasDividers density="compact">
                {audience.topPages.map((page) => (
                  <ListItem
                    key={page.path}
                    label={page.path}
                    endContent={<Badge variant="neutral" label={`${page.views}`} />}
                  />
                ))}
              </List>
            </VStack>
          )}
        </VStack>

        <VStack gap={3}>
          <Heading level={3}>Audience</Heading>

          {connected ? (
            <VStack gap={3}>
              <Banner
                status="success"
                title={`Connected to ${config.provider}`}
                description="Page views and the events below are being recorded on the live site."
              />
              {config.shareUrl ? (
                <Card padding={0}>
                  <iframe
                    title="Analytics dashboard"
                    src={config.shareUrl}
                    loading="lazy"
                    style={{
                      width: '100%',
                      height: 620,
                      border: 0,
                      borderRadius: 'var(--radius-element)',
                    }}
                  />
                </Card>
              ) : (
                <Text type="supporting" display="block">
                  Add a read-only share link in the provider's Services settings to see the charts
                  here instead of on the provider's site.
                </Text>
              )}
            </VStack>
          ) : (
            <VStack gap={3}>
              <Banner
                status="warning"
                title="No analytics provider connected"
                description="Visitor counts, per-project views and click-throughs are not being recorded yet."
              />

              <Text type="body" display="block">
                A static site cannot count its own visitors — nothing runs on a server, so a page
                view has nowhere to be stored that you could read later. That takes a hosted
                service. The site is already instrumented, so the numbers start the moment one is
                connected.
              </Text>

              <Card padding={4}>
                <VStack gap={3}>
                  <Text type="label">Connecting one</Text>
                  <List density="compact">
                    <ListItem
                      label="1. Pick a provider under Services"
                      description="Umami self-hosted is the default suggestion; Plausible self-hosted is the alternative. Both are cookieless, so no consent banner is needed in the UK or EU."
                    />
                    <ListItem
                      label="2. Follow its numbered steps"
                      description="Each integration carries its own setup guide and a Test button. No terminal, no redeploy."
                    />
                    <ListItem
                      label="3. Optionally embed the dashboard"
                      description="Paste a read-only share link in the same screen to see the charts on this page."
                    />
                  </List>
                </VStack>
              </Card>
            </VStack>
          )}

          <Divider />

          <Text type="label">Events already wired up</Text>
          <List hasDividers density="compact">
            {TRACKED_EVENTS.map((event) => (
              <ListItem
                key={event.name}
                label={event.name}
                description={`${event.when} — ${event.tells}`}
                endContent={
                  <Badge
                    variant={connected ? 'green' : 'neutral'}
                    label={connected ? 'Recording' : 'Ready'}
                  />
                }
              />
            ))}
          </List>

          <Text type="supporting" display="block">
            Your own visits to /admin are never counted, and neither is the draft preview.
          </Text>
        </VStack>
      </Grid>
    </VStack>
  );
};
