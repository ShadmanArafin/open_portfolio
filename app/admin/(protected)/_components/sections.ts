/**
 * The admin's sections, in the order the nav shows them.
 *
 * Kept out of `layout.tsx` — a page file's exports are Next's business — and
 * out of the nav itself, so the test that checks every href is a real route
 * reads the same list the nav renders instead of a copy that can drift.
 */
export type AdminSection = { href: string; label: string };

export const ADMIN_SECTIONS: AdminSection[] = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/pages', label: 'Pages' },
  { href: '/admin/writing', label: 'Writing' },
  { href: '/admin/projects', label: 'Projects' },
  { href: '/admin/case-studies', label: 'Case studies' },
  { href: '/admin/brands', label: 'Brands' },
  { href: '/admin/experience', label: 'Experience' },
  { href: '/admin/education', label: 'Education' },
  { href: '/admin/process', label: 'Process' },
  { href: '/admin/capabilities', label: 'Capabilities' },
  { href: '/admin/recommendations', label: 'Recommendations' },
  { href: '/admin/artifacts', label: 'Artifacts' },
  { href: '/admin/media', label: 'Media' },
  { href: '/admin/messages', label: 'Messages' },
  { href: '/admin/newsletter', label: 'Newsletter' },
  { href: '/admin/analytics', label: 'Analytics' },
  { href: '/admin/navigation', label: 'Navigation' },
  { href: '/admin/appearance', label: 'Appearance' },
  { href: '/admin/seo', label: 'SEO' },
  { href: '/admin/settings', label: 'Settings' },
  { href: '/admin/services', label: 'Services' },
  { href: '/admin/storage', label: 'Storage' },
  { href: '/admin/your-site', label: 'Your site' },
  { href: '/admin/history', label: 'History' },
  { href: '/admin/help', label: 'Help' },
];
