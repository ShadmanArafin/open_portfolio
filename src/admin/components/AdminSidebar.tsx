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
        { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
        { label: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
        { label: 'Homepage', path: '/admin/pages', icon: FileText },
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
              path: '/admin/projects',
              icon: Briefcase,
              count: draftData.projects.length,
            },
            {
              label: 'Case studies',
              path: '/admin/case-studies',
              icon: BookOpen,
              count: draftData.caseStudies.length,
            },
            {
              label: 'Brands',
              path: '/admin/brands',
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
              path: '/admin/experience',
              icon: HistoryIcon,
              count: draftData.experience.length,
            },
            {
              label: 'Education',
              path: '/admin/education',
              icon: GraduationCap,
              count: draftData.education.length,
            },
            {
              label: 'Process steps',
              path: '/admin/process',
              icon: Workflow,
              count: draftData.processSteps.length,
            },
            {
              label: 'Capabilities',
              path: '/admin/capabilities',
              icon: Layers,
              count: draftData.capabilityGroups.length,
            },
            {
              label: 'Recommendations',
              path: '/admin/recommendations',
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
              path: '/admin/media',
              icon: ImageIcon,
              count: draftData.media.length,
            },
            {
              label: 'Visual explorations',
              path: '/admin/artifacts',
              icon: Sparkle,
              count: draftData.artifacts.length,
            },
          ],
        },
      ],
    },
    {
      title: 'Inbox',
      entries: [
        { label: 'Messages', path: '/admin/messages', icon: Mail, count: unread || undefined },
      ],
    },
    {
      title: 'Configuration',
      entries: [
        {
          label: 'Site settings',
          icon: Settings2,
          children: [
            { label: 'Navigation', path: '/admin/navigation', icon: MenuIcon },
            { label: 'Footer & social', path: '/admin/footer', icon: PanelBottom },
            { label: 'Microcopy', path: '/admin/microcopy', icon: Type },
            { label: 'Appearance', path: '/admin/appearance', icon: Palette },
            { label: 'SEO', path: '/admin/seo', icon: Search },
            { label: 'General & backup', path: '/admin/settings', icon: Sliders },
          ],
        },
        { label: 'Version history', path: '/admin/history', icon: HistoryIcon },
      ],
    },
  ];

  // `/admin` would prefix-match every child route, so it matches exactly.
  const isSelected = (path: string) =>
    path === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(path);

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
              onClick={() => {
                logout();
                navigate('/admin/login');
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
