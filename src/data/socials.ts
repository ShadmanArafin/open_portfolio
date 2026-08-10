import { CONTACT_DATA } from './contact';
import type { SocialPlatformId } from '../cms/types/cms';

export interface SocialCardItem {
  id: string;
  label: string;
  name: string;
  url: string;
  iconType: SocialPlatformId;
}

/**
 * Demo social links. All point at each platform's own homepage rather than a
 * profile, so a fresh install never links to a stranger's account. Edit these
 * from /admin/settings → Footer & social.
 */
export const SOCIAL_CARDS: SocialCardItem[] = [
  {
    id: 'social-linkedin',
    label: 'Connect',
    name: 'LinkedIn',
    url: 'https://www.linkedin.com',
    iconType: 'linkedin',
  },
  {
    id: 'social-github',
    label: 'Code',
    name: 'GitHub',
    url: 'https://github.com',
    iconType: 'github',
  },
  {
    id: 'social-dribbble',
    label: 'Explorations',
    name: 'Dribbble',
    url: 'https://dribbble.com',
    iconType: 'dribbble',
  },
  {
    id: 'social-instagram',
    label: 'Follow',
    name: 'Instagram',
    url: 'https://www.instagram.com',
    iconType: 'instagram',
  },
];

export const FOOTER_CONFIG = {
  name: 'Your Name',
  heading: 'This is your portfolio.',
  supportingCopy:
    'Everything on this page is placeholder content. Sign in at /admin to replace it with your own — no code, no redeploy.',
  statusText: 'Available for selected projects',
  email: CONTACT_DATA.email,
  whatsappNumber: CONTACT_DATA.whatsappNumber,
  whatsappUrl: CONTACT_DATA.whatsappUrl,
  /** Empty until you upload one. The dashboard will prompt you. */
  resumeUrl: '',
  avatarPath: '/demo/avatar.svg',
};

export const CONTACT_INFO = {
  name: FOOTER_CONFIG.name,
  email: CONTACT_DATA.email,
  whatsapp: CONTACT_DATA.whatsappUrl,
  status: FOOTER_CONFIG.statusText,
  availability: FOOTER_CONFIG.statusText,
  headline: FOOTER_CONFIG.heading,
  subtext: FOOTER_CONFIG.supportingCopy,
};
