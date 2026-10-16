'use client';

import dynamic from 'next/dynamic';

/**
 * Client-only mount point for the admin.
 *
 * `ssr: false` has to be requested from a Client Component — Next refuses it in
 * a Server Component — hence this one-line wrapper. It is not optional here:
 * every admin screen reads IndexedDB and localStorage during render, neither of
 * which exists on the server.
 */
const AdminApp = dynamic(() => import('./admin-app'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-bg flex items-center justify-center font-mono text-xs uppercase tracking-widest text-text-muted animate-pulse">
      Loading admin...
    </div>
  ),
});

export default function AdminMount() {
  return <AdminApp />;
}
