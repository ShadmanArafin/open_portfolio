'use client';

import React, { useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { AppShell } from '@astryxdesign/core/AppShell';
import { TopNav } from '@astryxdesign/core/TopNav';
import { Button } from '@astryxdesign/core/Button';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Badge } from '@astryxdesign/core/Badge';
import { Banner } from '@astryxdesign/core/Banner';
import { HStack } from '@astryxdesign/core/Layout';
import { Sun, Moon, CheckCircle2, ExternalLink, Search, Eye } from 'lucide-react';
import { AdminSidebar } from '../components/AdminSidebar';
import { AstryxCommandPalette } from '../components/astryx/AstryxCommandPalette';
import { LiveDevicePreview } from '../components/LiveDevicePreview';
import { AdminSurface } from '../components/AdminSurface';
import { useCMS } from '../../cms/context/CMSContext';
import { useTheme } from '../../context/ThemeContext';

export const AdminLayout: React.FC = () => {
  const {
    isAuthenticated,
    publishDraft,
    hasUnpublishedChanges,
    pendingChangeSummary,
    storageError,
    clearStorageError,
    isDurable,
    authReady,
    draftData,
  } = useCMS();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [publishMessage, setPublishMessage] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  // The session is an httpOnly cookie, so whether we are signed in is only
  // knowable after asking the server. Redirecting before that answer arrives
  // bounced every deep link to the login page, which the middleware then sent
  // back to the dashboard — an endless round trip that lost the requested page.
  if (!authReady) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center font-mono text-xs uppercase tracking-widest text-text-muted animate-pulse">
        Checking your session...
      </div>
    );
  }

  // Router-relative: the admin router is mounted with basename="/admin", so an
  // absolute "/admin/login" here would resolve to "/admin/admin/login".
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // A site still carrying the seed's placeholder name has never been set up.
  // Detecting it from the content itself means no extra flag to store, and no
  // way for the two to disagree — and once the name is changed, by the wizard
  // or by hand, this never fires again.
  const looksUnconfigured = draftData.settings.fullName === 'Your Name';
  if (looksUnconfigured && !location.pathname.endsWith('/welcome')) {
    return <Navigate to="/welcome" replace />;
  }

  const handlePublish = async () => {
    if (!hasUnpublishedChanges || publishing) return;

    setPublishing(true);
    const ok = await publishDraft();
    setPublishing(false);

    setPublishMessage(
      ok ? 'Published. The live site is updated.' : 'Publish failed — see the message above.'
    );
    setTimeout(() => setPublishMessage(null), 4000);
  };

  /* Storage problems must stay visible: a CMS that silently fails to save is
     worse than one that refuses to. */
  const banner = storageError ? (
    <Banner
      status="error"
      title="Content could not be saved"
      description={storageError}
      isDismissable
      onDismiss={clearStorageError}
      container="section"
    />
  ) : !isDurable ? (
    <Banner
      status="warning"
      title="Changes are not being saved"
      description="Browser storage is unavailable in this window, so edits will be lost when you close this tab."
      container="section"
    />
  ) : publishMessage ? (
    <Banner status="success" title={publishMessage} container="section" />
  ) : undefined;

  const topNav = (
    <TopNav
      startContent={
        <Badge
          variant={hasUnpublishedChanges ? 'yellow' : 'neutral'}
          label={hasUnpublishedChanges ? 'Unpublished changes' : 'Published'}
        />
      }
      endContent={
        <HStack gap={2} align="center">
          <Button
            label="Search"
            variant="ghost"
            size="sm"
            icon={<Search aria-hidden />}
            onClick={() => setCommandPaletteOpen(true)}
          />
          <IconButton
            label="Open the public site"
            icon={<ExternalLink aria-hidden />}
            variant="ghost"
            size="sm"
            href="/"
            target="_blank"
          />
          <IconButton
            label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            icon={theme === 'dark' ? <Sun aria-hidden /> : <Moon aria-hidden />}
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
          />
          <Button
            label="Preview"
            variant={previewOpen ? 'secondary' : 'ghost'}
            size="sm"
            icon={<Eye aria-hidden />}
            tooltip="Preview unpublished changes"
            onClick={() => setPreviewOpen((open) => !open)}
          />
          <Button
            label={publishing ? 'Publishing' : 'Publish'}
            variant="primary"
            size="sm"
            icon={<CheckCircle2 aria-hidden />}
            isLoading={publishing}
            isDisabled={!hasUnpublishedChanges}
            tooltip={hasUnpublishedChanges ? pendingChangeSummary : 'No unpublished changes.'}
            onClick={() => void handlePublish()}
          />
        </HStack>
      }
    />
  );

  return (
    <AdminSurface>
      <AstryxCommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />

      <AppShell
        topNav={topNav}
        sideNav={<AdminSidebar />}
        banner={banner}
        contentPadding={4}
        /* Content-driven, not viewport-filling. With height="fill" the elevated
           surface stayed full height on short pages, leaving a large dead panel
           below the content and a second scroll context inside the first. */
        height="auto"
        /* `elevated` floats the content on a rounded panel that stretches to
           the viewport, so a short page showed a large empty card. `section`
           separates regions with dividers instead - no panel, nothing to look
           empty. */
        variant="section"
      >
        {previewOpen ? (
          <HStack gap={0} align="stretch">
            <div style={{ flex: 1, minWidth: 0 }}>
              <Outlet />
            </div>
            {/* The preview needs an explicit height now that the shell is
                content-driven, otherwise the iframe collapses. */}
            {/* Sticky, and sized to the space under the top bar so it reaches the
                bottom of the viewport. At 8rem it stopped short, leaving a band of
                empty panel below it on any page taller than one screen. */}
            <div
              style={{
                width: '46%',
                maxWidth: 860,
                flexShrink: 0,
                height: 'calc(100dvh - 4.5rem)',
                position: 'sticky',
                top: '0.5rem',
              }}
            >
              <LiveDevicePreview onClose={() => setPreviewOpen(false)} />
            </div>
          </HStack>
        ) : (
          <Outlet />
        )}
      </AppShell>
    </AdminSurface>
  );
};
