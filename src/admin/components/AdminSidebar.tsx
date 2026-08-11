'use client';

import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  BarChart3,
  FileText,
  Briefcase,
  BookOpen,
  Building2,
  Image as ImageIcon,
  Mail,
  Sliders,
  History as HistoryIcon,
  LogOut,
  Workflow,
  Layers,
  Quote,
  Sparkle,
  Menu as MenuIcon,
  PanelBottom,
  Type,
  Palette,
  Search,
  GraduationCap,
  UserRound,
  FolderOpen,
  Settings2,
  Plug,
  LifeBuoy,
} from 'lucide-react';
import { SideNav, SideNavHeading, SideNavItem, SideNavSection } from '@astryxdesign/core/SideNav';
import { Text } from '@astryxdesign/core/Text';
import { Badge } from '@astryxdesign/core/Badge';
import { IconButton } from '@astryxdesign/core/IconButton';
import { HStack, VStack } from '@astryxdesign/core/Layout';
import { Divider } from '@astryxdesign/core/Divider';
import { Avatar } from '@astryxdesign/core/Avatar';
import { useCMS } from '../../cms/context/CMSContext';
import { resolveAssetUrl } from '../../cms/utils/mediaUrls';

type Icon = typeof LayoutDashboard;

interface NavLeaf {
  label: string;
  path: string;
  icon: Icon;
  count?: number;
}

interface NavGroup {
  label: string;
  icon: Icon;
  children: NavLeaf[];
}

/**
 * Primary navigation.
 *
 * Twenty-one flat destinations overflowed the panel on any short window, so
 * related screens nest under a parent. A group expands automatically when the
 * page you're on lives inside it, which keeps the current location visible
 * without leaving everything open.
 *
 * Counts come from the draft, because that is what every screen edits — reading
 * published content made the nav disagree with the page in front of you.
 */
export const AdminSidebar: React.FC = () => {
  const { draftData, logout } = useCMS();
  const navigate = useNavigate();
  const location = useLocation();

  const unread = draftData.messages.filter((m) => m.status === 'unread').length;

  const sections: { title: string; entries: (NavLeaf | NavGroup)[] }[] = [
    {
      title: 'Overview',
      entries: [
        { label: 'Dashboard', path: '/', icon: LayoutDashboard },
        { label: 'Analytics', path: '/analytics', icon: BarChart3 },
        { label: 'Homepage', path: '/homepage', icon: FileText },
        { label: 'Pages', path: '/pages', icon: FileText },
      ],
    },
    {
      title: 'Content',
      entries: [
        {
          label: 'Work',
          icon: Briefcase,
          children: [
            {
              label: 'Selected work',
              path: '/projects',
              icon: Briefcase,
              count: draftData.projects.length,
            },
            {
              label: 'Case studies',
              path: '/case-studies',
              icon: BookOpen,
              count: draftData.caseStudies.length,
            },
            {
              label: 'Brands',
              path: '/brands',
              icon: Building2,
              count: draftData.brands.length,
            },
          ],
        },
        {
          label: 'About you',
          icon: UserRound,
          children: [
            {
              label: 'Experience',
              path: '/experience',
              icon: HistoryIcon,
              count: draftData.experience.length,
            },
            {
              label: 'Education',
              path: '/education',
              icon: GraduationCap,
              count: draftData.education.length,
            },
            {
              label: 'Process steps',
              path: '/process',
              icon: Workflow,
              count: draftData.processSteps.length,
            },
            {
              label: 'Capabilities',
              path: '/capabilities',
              icon: Layers,
              count: draftData.capabilityGroups.length,
            },
            {
              label: 'Recommendations',
              path: '/recommendations',
              icon: Quote,
              count: draftData.recommendations.length,
            },
          ],
        },
        {
          label: 'Media',
          icon: FolderOpen,
          children: [
            {
              label: 'Media library',
              path: '/media',
              icon: ImageIcon,
              count: draftData.media.length,
            },
            {
              label: 'Visual explorations',
              path: '/artifacts',
              icon: Sparkle,
              count: draftData.artifacts.length,
            },
          ],
        },
      ],
    },
    {
      title: 'Inbox',
      entries: [{ label: 'Messages', path: '/messages', icon: Mail, count: unread || undefined }],
    },
    {
      title: 'Configuration',
      entries: [
        {
          label: 'Site settings',
          icon: Settings2,
          children: [
            { label: 'Navigation', path: '/navigation', icon: MenuIcon },
            { label: 'Footer & social', path: '/footer', icon: PanelBottom },
            { label: 'Microcopy', path: '/microcopy', icon: Type },
            { label: 'Appearance', path: '/appearance', icon: Palette },
            { label: 'SEO', path: '/seo', icon: Search },
            { label: 'General & backup', path: '/settings', icon: Sliders },
            { label: 'Services', path: '/services', icon: Plug },
          ],
        },
        { label: 'Version history', path: '/history', icon: HistoryIcon },
        { label: 'Help & feedback', path: '/help', icon: LifeBuoy },
      ],
    },
  ];

  /*
   * Paths here are relative to the router's basename, not absolute.
   *
   * `<Link to="/admin/projects">` inside `basename="/admin"` resolves to
   * `/admin/admin/projects` — every link in this sidebar was broken, and every
   * item's selected state was permanently false, because `location.pathname`
   * has the basename stripped and could never match a string that included it.
   */
  const isSelected = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const countBadge = (count?: number) =>
    count !== undefined && count > 0 ? (
      <Badge variant="neutral" label={String(count)} />
    ) : undefined;

  const renderLeaf = (leaf: NavLeaf) => (
    <SideNavItem
      key={leaf.path}
      label={leaf.label}
      icon={leaf.icon}
      href={leaf.path}
      as={Link as never}
      isSelected={isSelected(leaf.path)}
      endContent={countBadge(leaf.count)}
    />
  );

  return (
    <SideNav
      header={
        <SideNavHeading
          heading={draftData.settings.fullName || 'Portfolio'}
          subheading="Content manager"
          headingHref="/admin"
        />
      }
      footer={
        /* The nav list scrolls under this, so a rule keeps a clipped item from
           running straight into the account row. */
        <VStack gap={2}>
          <Divider />
          <HStack gap={2} align="center" justify="between">
            <HStack gap={2} align="center">
              <Avatar
                name={draftData.settings.fullName}
                src={resolveAssetUrl(draftData.settings.avatarPath)}
                size="sm"
              />
              <VStack gap={0}>
                <Text type="label" display="block" maxLines={1}>
                  {draftData.settings.fullName}
                </Text>
                <Text type="supporting" display="block">
                  Administrator
                </Text>
              </VStack>
            </HStack>
            <IconButton
              label="Sign out"
              icon={<LogOut aria-hidden />}
              variant="ghost"
              size="sm"
              onClick={async () => {
                // Await the server: navigating first would race the request
                // that actually destroys the session, and a cancelled fetch
                // would leave the session alive on the server.
                await logout();
                navigate('/login');
              }}
            />
          </HStack>
        </VStack>
      }
    >
      {sections.map((section) => (
        <SideNavSection key={section.title} title={section.title}>
          {section.entries.map((entry) => {
            if (!('children' in entry)) return renderLeaf(entry);

            const holdsCurrentPage = entry.children.some((child) => isSelected(child.path));

            return (
              <SideNavItem
                key={entry.label}
                label={entry.label}
                icon={entry.icon}
                collapsible={{ defaultIsCollapsed: !holdsCurrentPage }}
              >
                {entry.children.map(renderLeaf)}
              </SideNavItem>
            );
          })}
        </SideNavSection>
      ))}
    </SideNav>
  );
};
