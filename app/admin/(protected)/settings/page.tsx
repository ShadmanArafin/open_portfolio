import type { Metadata } from 'next';
import { getStorageAdapter } from '@/core/storage/registry';
import { getContentForChannel } from '@/core/content/read';
import { screenToken } from '@/core/content/screen-token';
import { SiteForm } from './site-form';
import { BackupPanel } from './backup-panel';
import { PasskeyPanel } from './passkey-panel';

export const metadata: Metadata = { title: 'Settings' };

/**
 * General settings: identity, the About story, backup, passkeys.
 *
 * The migrated sibling of the legacy General panel. The content half is the
 * draft, edited through a server action; backup is the server-side bundle
 * (`/api/admin/backup`), which is the one that covers the published snapshot
 * too; passkeys are account state, not content, read over the owner's session.
 */
export default async function SettingsPage() {
  const draft = await getContentForChannel('draft');
  const credentials = await (
    await getStorageAdapter()
  ).passkeys
    .list()
    .then((list) =>
      list.map((c) => ({
        id: c.id,
        deviceName: c.deviceName,
        createdAt: c.createdAt,
        lastUsedAt: c.lastUsedAt,
      }))
    )
    .catch(() => []);

  const settings = draft.settings;

  return (
    <div className="grid gap-6" style={{ maxWidth: 'var(--measure)' }}>
      <div>
        <p className="m-0 font-mono text-xs uppercase tracking-widest text-text-muted">General</p>
        <h1 className="font-display m-0 mt-1 text-3xl">Site Settings &amp; Backup</h1>
        <p className="m-0 mt-1 text-text-secondary">
          Your name, contact details, the About story, and tools to back up or restore all content.
        </p>
      </div>

      <SiteForm
        token={screenToken(draft, 'site')}
        initial={{
          fullName: settings.fullName,
          role: settings.role,
          location: settings.location,
          email: settings.email,
          whatsappNumber: settings.whatsappNumber,
          whatsappFormatted: settings.whatsappFormatted,
          whatsappUrl: settings.whatsappUrl,
          availabilityStatus: settings.availabilityStatus,
          aboutHeading: settings.aboutHeading ?? '',
          language: settings.language ?? '',
          aboutStory: (settings.aboutStoryParagraphs ?? []).join('\n\n'),
        }}
      />

      <BackupPanel />
      <PasskeyPanel initial={credentials} />
    </div>
  );
}
