import type { CMSState, SocialLinkItem } from '@/cms/types/cms';

/**
 * Link-in-Bio resolver.
 *
 * Inspired by BioDrop and Linktree:
 * Provides a dedicated mobile-first hub for students sharing their portfolio
 * on Instagram, TikTok, LinkedIn, or Twitter bio links.
 */

export interface BioLink {
  id: string;
  label: string;
  url: string;
  highlight?: boolean;
}

export interface LinkInBioProfile {
  name: string;
  role?: string;
  avatar?: string;
  bio?: string;
  links: BioLink[];
  socials: SocialLinkItem[];
}

export function resolveLinkInBio(content: CMSState): LinkInBioProfile {
  const { settings, projects = [], socialLinks = [] } = content;

  const links: BioLink[] = [
    {
      id: 'bio-home',
      label: 'Visit Main Portfolio',
      url: '/',
      highlight: true,
    },
    {
      id: 'bio-cv',
      label: 'View Curriculum Vitae & Resume',
      url: '/cv',
    },
  ];

  // Add top featured projects
  const featured = projects.filter((p) => p.status === 'published' && p.featured).slice(0, 3);

  for (const proj of featured) {
    links.push({
      id: `bio-proj-${proj.id}`,
      label: `Project: ${proj.title || proj.name}`,
      url: `/work/${proj.slug}`,
    });
  }

  // Add contact link
  links.push({
    id: 'bio-contact',
    label: "Let's Work Together",
    url: '/contact',
    highlight: true,
  });

  const socials = socialLinks.filter((s) => s.visible && s.url);

  return {
    name: settings.fullName || 'Portfolio',
    role: settings.role || undefined,
    avatar: settings.portraitPath || settings.avatarPath || undefined,
    bio: settings.aboutStoryParagraphs?.[0] || undefined,
    links,
    socials,
  };
}
