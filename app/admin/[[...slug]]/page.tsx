import type { Metadata } from 'next';
import AdminMount from './admin-mount';

/**
 * Never indexed. A CDN-cached admin page would be a serious leak, so this route
 * is also excluded from static generation.
 */
export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default function AdminRoute() {
  return <AdminMount />;
}
