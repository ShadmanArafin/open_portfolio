'use client';

import React, { useEffect, useState } from 'react';
import { Banner } from '@astryxdesign/core/Banner';
import { Divider } from '@astryxdesign/core/Divider';
import { VStack } from '@astryxdesign/core/Layout';
import { Text } from '@astryxdesign/core/Text';
import { AdminRecord, AdminRecordList } from '../components/AdminRecord';
import { AstryxHeader } from '../components/astryx/AstryxComponents';
import { BACKEND_GUIDES, type BackendGuide } from '@/core/storage/guides';

/**
 * Where your content lives — what is running now, and what else you could use.
 *
 * This screen explains and does not switch, which is unusual enough to say on
 * the screen itself rather than only here. Which backend runs is decided by
 * which environment variables are present, because configuration is what tells
 * the app how to reach the database: a setting kept *in* the database cannot be
 * read before the database is reachable. A dropdown here would have to either
 * lie or quietly not work.
 *
 * The comparison lives here rather than only in the README because the person
 * who needs it is the one already inside the admin wondering why their pictures
 * vanished after a deploy — not the one reading GitHub before they start.
 */

interface StorageStatus {
  active: {
    id: string;
    displayName: string;
    durable: boolean;
    worksOnEphemeralHosts: boolean;
    maxUploadBytes: number;
  } | null;
  health: { ok: boolean; detail: string; latencyMs: number };
}

export const AdminStorage: React.FC = () => {
  const [status, setStatus] = useState<StorageStatus | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch('/api/admin/storage');
        const body = (await res.json()) as StorageStatus & { ok: boolean };
        if (cancelled) return;
        if (body.ok) setStatus({ active: body.active, health: body.health });
        else setFailed(true);
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const activeId = status?.active?.id;

  return (
    <VStack gap={5}>
      <AstryxHeader
        title="Where your content lives"
        subtitle="Your pages, your pictures and the messages people send you are all kept in one place. This is which one, and what else you could move to."
      />

      {failed && (
        <Banner
          status="error"
          title="Could not ask the server which backend is running"
          description="The comparison below is still accurate; only the marker showing your current choice is missing."
        />
      )}

      {status && !status.health.ok && (
        <Banner
          status="error"
          title="Your storage is not answering"
          description={`${status.health.detail} Publishing and uploads will fail until this is fixed. Nothing already published is lost.`}
        />
      )}

      {status?.active && status.health.ok && (
        <Banner
          status="success"
          title={`Running on ${status.active.displayName}`}
          description={`${status.health.detail} — answered in ${status.health.latencyMs}ms.${
            status.active.worksOnEphemeralHosts
              ? ''
              : ' This one needs a machine whose disk survives a restart, so it is not suitable for Vercel, Netlify or Cloudflare.'
          }`}
        />
      )}

      <Banner
        status="info"
        title="You choose this by deploying, not from this screen"
        description="Whichever service's settings are present is the one that gets used. That is deliberate: the setting that says how to reach your database cannot itself live in the database. Each option below lists exactly what to set and where to find it."
      />

      <Divider />

      <AdminRecordList>
        {BACKEND_GUIDES.map((guide) => (
          <BackendCard key={guide.id} guide={guide} active={guide.id === activeId} />
        ))}
      </AdminRecordList>
    </VStack>
  );
};

const BackendCard: React.FC<{ guide: BackendGuide; active: boolean }> = ({ guide, active }) => (
  <AdminRecord
    value={guide.id}
    title={guide.name}
    summary={guide.summary}
    badge={active ? 'In use now' : guide.worksOnServerless ? 'Works anywhere' : 'Needs a disk'}
    badgeVariant={active ? 'green' : guide.worksOnServerless ? 'cyan' : 'amber'}
    defaultIsOpen={active}
  >
    <VStack gap={4}>
      <Text as="p">
        <Text weight="semibold">Best for: </Text>
        {guide.bestFor}
      </Text>

      <Text as="p" type="supporting">
        <Text weight="semibold" type="supporting">
          Free tier:{' '}
        </Text>
        {guide.freeTier} (checked {guide.verifiedOn} — these change, so confirm before relying on
        it.)
      </Text>

      {guide.caveat && (
        <Banner status="warning" title="Worth knowing first" description={guide.caveat} />
      )}

      {guide.env.length > 0 && (
        <VStack gap={1}>
          <Text as="p" weight="semibold">
            What to set
          </Text>
          {guide.env.map((variable) => (
            <Text key={variable.name} as="p" type="supporting">
              <Text type="code">{variable.name}</Text> — {variable.where}
            </Text>
          ))}
        </VStack>
      )}

      <VStack gap={1}>
        <Text as="p" weight="semibold">
          Setting it up
        </Text>
        {guide.steps.map((step, index) => (
          <Text key={step} as="p" type="supporting">
            {index + 1}. {step}
          </Text>
        ))}
      </VStack>

      <Text as="p" type="supporting">
        Moving between these loses nothing: export from General &amp; backup, point the new backend
        at your site, and import.
      </Text>
    </VStack>
  </AdminRecord>
);
