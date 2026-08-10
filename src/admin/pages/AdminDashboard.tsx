import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Grid } from '@astryxdesign/core/Grid';
import { Card } from '@astryxdesign/core/Card';
import { List, ListItem } from '@astryxdesign/core/List';
import { Button } from '@astryxdesign/core/Button';
import { Badge } from '@astryxdesign/core/Badge';
import { Text } from '@astryxdesign/core/Text';
import { Heading } from '@astryxdesign/core/Heading';
import { Divider } from '@astryxdesign/core/Divider';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { FileText, AlertTriangle, AlertCircle, Lightbulb, UploadCloud } from 'lucide-react';
import { useCMS } from '../../cms/context/CMSContext';
import { AstryxHeader } from '../components/astryx/AstryxComponents';
import { analyseContent, IssueSeverity } from '../../cms/utils/contentHealth';

const SEVERITY: Record<
  IssueSeverity,
  { icon: React.ElementType; badge: 'red' | 'yellow' | 'blue'; label: string }
> = {
  blocking: { icon: AlertCircle, badge: 'red', label: 'Fix first' },
  warning: { icon: AlertTriangle, badge: 'yellow', label: 'Worth doing' },
  idea: { icon: Lightbulb, badge: 'blue', label: 'Idea' },
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Overview.
 *
 * Deliberately not a count of everything you own — knowing you have four
 * projects tells you nothing you did not know. These are the things that are
 * wrong right now and the work queued to fix them, plus the handful of numbers
 * that describe what a visitor can actually reach.
 *
 * Nothing here is visitor analytics: there is no backend and no tracking, so
 * traffic, sources and conversions are not knowable from the browser.
 */
export const AdminDashboard: React.FC = () => {
  const { data, draftData, hasUnpublishedChanges, pendingChangeSummary, countMediaUsage } =
    useCMS();

  // Checks run against published content — that is what visitors get.
  const report = useMemo(() => analyseContent(data, countMediaUsage), [data, countMediaUsage]);

  const scoreTone: 'green' | 'yellow' | 'red' =
    report.score >= 90 ? 'green' : report.score >= 65 ? 'yellow' : 'red';

  const blocking = report.issues.filter((i) => i.severity === 'blocking').length;

  const stats = [
    {
      label: 'Live on the site',
      value: `${report.liveProjects + report.liveCaseStudies}`,
      unit: `${report.liveProjects} projects · ${report.liveCaseStudies} case studies`,
    },
    {
      label: 'Last publish',
      value:
        report.daysSincePublish === null
          ? 'Never'
          : report.daysSincePublish === 0
            ? 'Today'
            : `${report.daysSincePublish}d`,
      unit:
        report.daysSincePublish === null
          ? 'Nothing has gone live yet'
          : report.daysSincePublish === 0
            ? 'Up to date'
            : report.daysSincePublish > 30
              ? 'ago — getting stale'
              : 'ago',
    },
    {
      label: 'Unused files',
      value: String(report.unusedMedia),
      unit: `of ${draftData.media.length} · ${formatBytes(report.storageBytes)} stored`,
    },
  ];

  return (
    <VStack gap={6}>
      <AstryxHeader
        badgeText="Overview"
        title={`Welcome back, ${data.settings.fullName}`}
        subtitle="What is wrong with the site right now, and what to do about it."
      >
        <Button
          label="Homepage builder"
          variant="primary"
          icon={<FileText aria-hidden />}
          as={Link as never}
          href="/admin/pages"
        />
      </AstryxHeader>

      <Grid columns={{ minWidth: 240, repeat: 'fit' }} gap={4}>
        <Card padding={4}>
          <VStack gap={2} align="start">
            <Text type="supporting">Site readiness</Text>
            <HStack gap={2} align="end">
              <Heading level={2}>{`${report.score}%`}</Heading>
              <Text type="supporting">{`${report.passed}/${report.total} checks`}</Text>
            </HStack>
            <Badge
              variant={scoreTone}
              label={
                blocking > 0
                  ? `${blocking} to fix first`
                  : report.issues.length > 0
                    ? `${report.issues.length} to tidy`
                    : 'All clear'
              }
            />
          </VStack>
        </Card>

        {stats.map(({ label, value, unit }) => (
          <Card key={label} padding={4}>
            <VStack gap={2}>
              <Text type="supporting">{label}</Text>
              <Heading level={2}>{value}</Heading>
              <Text type="supporting" display="block">
                {unit}
              </Text>
            </VStack>
          </Card>
        ))}
      </Grid>

      {hasUnpublishedChanges && (
        <Card padding={4}>
          <HStack gap={3} justify="between" align="center">
            <HStack gap={3} align="center">
              <UploadCloud aria-hidden />
              <VStack gap={0}>
                <Text type="label">Unpublished changes</Text>
                <Text type="supporting" display="block">
                  {pendingChangeSummary}
                </Text>
              </VStack>
            </HStack>
            <Badge variant="yellow" label="Draft only" />
          </HStack>
        </Card>
      )}

      <Grid columns={{ minWidth: 340, repeat: 'fit' }} gap={6} align="start">
        <VStack gap={3}>
          <HStack justify="between" align="center">
            <Heading level={3}>Needs attention</Heading>
            {report.issues.length > 0 && (
              <Text type="supporting">{`${report.issues.length} item${report.issues.length === 1 ? '' : 's'}`}</Text>
            )}
          </HStack>

          {report.issues.length === 0 ? (
            <EmptyState
              title="Nothing to fix"
              description="Every check passes. Publish something new and it will be checked too."
              isCompact
            />
          ) : (
            <List hasDividers>
              {report.issues.map((issue) => {
                const tone = SEVERITY[issue.severity];
                const Icon = tone.icon;
                return (
                  <ListItem
                    key={issue.id}
                    label={issue.title}
                    description={issue.detail}
                    href={issue.to}
                    startContent={<Icon aria-hidden />}
                    endContent={<Badge variant={tone.badge} label={tone.label} />}
                  />
                );
              })}
            </List>
          )}
        </VStack>

        <VStack gap={3}>
          <Heading level={3}>Recent activity</Heading>

          {data.activityLogs.length === 0 ? (
            <EmptyState
              title="Nothing yet"
              description="Publishing and restoring show up here."
              isCompact
            />
          ) : (
            <List hasDividers density="compact">
              {data.activityLogs.slice(0, 8).map((log) => (
                <ListItem
                  key={log.id}
                  label={log.action}
                  description={`${log.details} · ${new Date(log.timestamp).toLocaleString([], {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}`}
                />
              ))}
            </List>
          )}

          <Divider />

          <Text type="supporting" display="block">
            These are content checks, not visitor analytics. Traffic, referrers and conversions need
            an analytics provider and a server, neither of which this site has yet.
          </Text>
        </VStack>
      </Grid>
    </VStack>
  );
};
