import type { IconType } from 'react-icons';
import {
  FaLinkedinIn,
  FaGithub,
  FaDribbble,
  FaBehance,
  FaFigma,
  FaInstagram,
  FaXTwitter,
  FaYoutube,
  FaMedium,
  FaThreads,
  FaBluesky,
  FaMastodon,
  FaCodepen,
  FaWhatsapp,
  FaEnvelope,
  FaGlobe,
} from 'react-icons/fa6';

export interface SocialPlatform {
  id: string;
  /** Shown on the footer card and used as the default admin label. */
  name: string;
  icon: IconType;
  /**
   * Prefix a bare handle gets when the profile URL is built. Platforms with
   * no canonical profile path (a personal site, a self-hosted Mastodon) leave
   * this undefined and take a full URL instead.
   */
  baseUrl?: string;
  /** What to type in the handle field. */
  placeholder: string;
}

/**
 * The platforms a design and engineering portfolio actually links to,
 * ordered by how commonly they appear on one.
 *
 * This is the single source of truth for both the editor's picker and the
 * footer's icon lookup, so adding a platform here is all it takes.
 */
export const SOCIAL_PLATFORMS: SocialPlatform[] = [
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: FaLinkedinIn,
    baseUrl: 'https://www.linkedin.com/in/',
    placeholder: 'your-handle',
  },
  {
    id: 'github',
    name: 'GitHub',
    icon: FaGithub,
    baseUrl: 'https://github.com/',
    placeholder: 'your-handle',
  },
  {
    id: 'dribbble',
    name: 'Dribbble',
    icon: FaDribbble,
    baseUrl: 'https://dribbble.com/',
    placeholder: 'your-handle',
  },
  {
    id: 'behance',
    name: 'Behance',
    icon: FaBehance,
    baseUrl: 'https://www.behance.net/',
    placeholder: 'your-handle',
  },
  {
    id: 'figma',
    name: 'Figma',
    icon: FaFigma,
    baseUrl: 'https://www.figma.com/@',
    placeholder: 'your-handle',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: FaInstagram,
    baseUrl: 'https://www.instagram.com/',
    placeholder: 'your-handle',
  },
  {
    id: 'twitter',
    name: 'X',
    icon: FaXTwitter,
    baseUrl: 'https://x.com/',
    placeholder: 'your-handle',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: FaYoutube,
    baseUrl: 'https://www.youtube.com/@',
    placeholder: 'your-handle',
  },
  {
    id: 'medium',
    name: 'Medium',
    icon: FaMedium,
    baseUrl: 'https://medium.com/@',
    placeholder: 'your-handle',
  },
  {
    id: 'threads',
    name: 'Threads',
    icon: FaThreads,
    baseUrl: 'https://www.threads.net/@',
    placeholder: 'your-handle',
  },
  {
    id: 'bluesky',
    name: 'Bluesky',
    icon: FaBluesky,
    baseUrl: 'https://bsky.app/profile/',
    placeholder: 'you.bsky.social',
  },
  {
    id: 'mastodon',
    name: 'Mastodon',
    icon: FaMastodon,
    placeholder: 'https://mastodon.social/@you',
  },
  {
    id: 'codepen',
    name: 'CodePen',
    icon: FaCodepen,
    baseUrl: 'https://codepen.io/',
    placeholder: 'your-handle',
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: FaWhatsapp,
    baseUrl: 'https://wa.me/',
    placeholder: '447700900000',
  },
  {
    id: 'email',
    name: 'Email',
    icon: FaEnvelope,
    baseUrl: 'mailto:',
    placeholder: 'you@example.com',
  },
  { id: 'website', name: 'Website', icon: FaGlobe, placeholder: 'https://your-site.com' },
];

export const SOCIAL_PLATFORM_BY_ID: Record<string, SocialPlatform> = Object.fromEntries(
  SOCIAL_PLATFORMS.map((p) => [p.id, p])
);

export function getSocialPlatform(id: string): SocialPlatform {
  return SOCIAL_PLATFORM_BY_ID[id] ?? SOCIAL_PLATFORMS[0];
}

/**
 * Turn what someone typed into a URL.
 *
 * People paste a whole profile link as readily as they type a handle, and a
 * few paste `@handle`. All three should work without them having to know
 * which the field wanted.
 */
export function buildSocialUrl(platformId: string, handle: string): string {
  const value = handle.trim();
  if (!value) return '';
  if (/^(https?:\/\/|mailto:)/i.test(value)) return value;

  const platform = getSocialPlatform(platformId);
  if (!platform.baseUrl) return value;

  return platform.baseUrl + value.replace(/^@/, '');
}

/** The inverse, so an existing URL shows as the handle it came from. */
export function extractSocialHandle(platformId: string, url: string): string {
  const value = (url || '').trim();
  if (!value) return '';

  const platform = getSocialPlatform(platformId);
  if (platform.baseUrl && value.toLowerCase().startsWith(platform.baseUrl.toLowerCase())) {
    return value.slice(platform.baseUrl.length);
  }
  return value;
}
