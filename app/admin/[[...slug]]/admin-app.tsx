'use client';

import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/context/ThemeContext';
import { ToastProvider } from '@/context/ToastContext';
import { CMSProvider } from '@/cms/context/CMSContext';

/*
 * The admin, still running on React Router inside a single Next.js route.
 *
 * This is a transitional arrangement, and deliberately so. Rewriting twenty
 * screens at the same time as moving framework is how migrations turn into
 * rewrites that never land. The public site is already fully on the App Router
 * with real server rendering; the admin keeps working exactly as it did until
 * it is rebuilt on shadcn/ui, at which point React Router leaves the project
 * entirely.
 *
 * Nothing here is server-rendered: this component is loaded with `ssr: false`
 * because every screen reads from IndexedDB, which only exists in a browser.
 */

const AdminLogin = lazy(() =>
  import('@/admin/pages/AdminLogin').then((m) => ({ default: m.AdminLogin }))
);
const AdminResetPassphrase = lazy(() =>
  import('@/admin/pages/AdminResetPassphrase').then((m) => ({ default: m.AdminResetPassphrase }))
);
const AdminLayout = lazy(() =>
  import('@/admin/layouts/AdminLayout').then((m) => ({ default: m.AdminLayout }))
);
const AdminDashboard = lazy(() =>
  import('@/admin/pages/AdminDashboard').then((m) => ({ default: m.AdminDashboard }))
);
const AdminAnalytics = lazy(() =>
  import('@/admin/pages/AdminAnalytics').then((m) => ({ default: m.AdminAnalytics }))
);
const AdminIntegrations = lazy(() =>
  import('@/admin/pages/AdminIntegrations').then((m) => ({ default: m.AdminIntegrations }))
);
const AdminSitePages = lazy(() =>
  import('@/admin/pages/AdminSitePages').then((m) => ({ default: m.AdminSitePages }))
);
const AdminPagesEditor = lazy(() =>
  import('@/admin/pages/AdminPagesEditor').then((m) => ({ default: m.AdminPagesEditor }))
);
const AdminProjectsCMS = lazy(() =>
  import('@/admin/pages/AdminProjectsCMS').then((m) => ({ default: m.AdminProjectsCMS }))
);
const AdminCaseStudiesCMS = lazy(() =>
  import('@/admin/pages/AdminCaseStudiesCMS').then((m) => ({ default: m.AdminCaseStudiesCMS }))
);
const AdminBrandsCMS = lazy(() =>
  import('@/admin/pages/AdminBrandsCMS').then((m) => ({ default: m.AdminBrandsCMS }))
);
const AdminExperienceCMS = lazy(() =>
  import('@/admin/pages/AdminExperienceCMS').then((m) => ({ default: m.AdminExperienceCMS }))
);
const AdminEducationCMS = lazy(() =>
  import('@/admin/pages/AdminEducationCMS').then((m) => ({ default: m.AdminEducationCMS }))
);
const AdminMediaLibrary = lazy(() =>
  import('@/admin/pages/AdminMediaLibrary').then((m) => ({ default: m.AdminMediaLibrary }))
);
const AdminMessagesInbox = lazy(() =>
  import('@/admin/pages/AdminMessagesInbox').then((m) => ({ default: m.AdminMessagesInbox }))
);
const AdminSettings = lazy(() =>
  import('@/admin/pages/AdminSettings').then((m) => ({ default: m.AdminSettings }))
);
const AdminVersionHistory = lazy(() =>
  import('@/admin/pages/AdminVersionHistory').then((m) => ({ default: m.AdminVersionHistory }))
);
const AdminProcessCMS = lazy(() =>
  import('@/admin/pages/AdminProcessCMS').then((m) => ({ default: m.AdminProcessCMS }))
);
const AdminCapabilitiesCMS = lazy(() =>
  import('@/admin/pages/AdminCapabilitiesCMS').then((m) => ({ default: m.AdminCapabilitiesCMS }))
);
const AdminRecommendationsCMS = lazy(() =>
  import('@/admin/pages/AdminRecommendationsCMS').then((m) => ({
    default: m.AdminRecommendationsCMS,
  }))
);
const AdminArtifactsCMS = lazy(() =>
  import('@/admin/pages/AdminArtifactsCMS').then((m) => ({ default: m.AdminArtifactsCMS }))
);
const AdminWelcome = lazy(() =>
  import('@/admin/pages/AdminWelcome').then((m) => ({ default: m.AdminWelcome }))
);
const AdminNavigationCMS = lazy(() =>
  import('@/admin/pages/AdminNavigationCMS').then((m) => ({ default: m.AdminNavigationCMS }))
);

export default function AdminApp() {
  return (
    <ThemeProvider>
      <CMSProvider>
        <ToastProvider>
          {/* basename keeps every `to="/projects"` inside the admin resolving
              under /admin, so the existing screens need no path changes. */}
          {/* No `future` prop: the v7 flags this used to opt into are the
              default behaviour in React Router 7, and passing them now is a
              type error. */}
          <BrowserRouter basename="/admin">
            <Suspense
              fallback={
                <div className="min-h-screen bg-bg flex items-center justify-center font-mono text-xs uppercase tracking-widest text-text-muted animate-pulse">
                  Loading admin...
                </div>
              }
            >
              <Routes>
                <Route path="/login" element={<AdminLogin />} />
                {/* Not nested under AdminLayout: a signed-out visitor with a
                    forgotten passphrase is, by definition, not authenticated,
                    and AdminLayout would bounce them straight to /login. */}
                <Route path="/reset" element={<AdminResetPassphrase />} />
                <Route path="/" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="welcome" element={<AdminWelcome />} />
                  <Route path="analytics" element={<AdminAnalytics />} />
                  <Route path="homepage" element={<AdminPagesEditor />} />
                  <Route path="pages" element={<AdminSitePages />} />
                  <Route path="projects" element={<AdminProjectsCMS />} />
                  <Route path="case-studies" element={<AdminCaseStudiesCMS />} />
                  <Route path="brands" element={<AdminBrandsCMS />} />
                  <Route path="experience" element={<AdminExperienceCMS />} />
                  <Route path="education" element={<AdminEducationCMS />} />
                  <Route path="process" element={<AdminProcessCMS />} />
                  <Route path="capabilities" element={<AdminCapabilitiesCMS />} />
                  <Route path="recommendations" element={<AdminRecommendationsCMS />} />
                  <Route path="artifacts" element={<AdminArtifactsCMS />} />
                  <Route path="media" element={<AdminMediaLibrary />} />
                  <Route path="resume" element={<AdminMediaLibrary />} />
                  <Route path="messages" element={<AdminMessagesInbox />} />
                  <Route path="navigation" element={<AdminNavigationCMS />} />
                  {/* One screen, switched by the path segment. */}
                  <Route path="footer" element={<AdminSettings />} />
                  <Route path="microcopy" element={<AdminSettings />} />
                  <Route path="appearance" element={<AdminSettings />} />
                  <Route path="seo" element={<AdminSettings />} />
                  <Route path="settings" element={<AdminSettings />} />
                  <Route path="services" element={<AdminIntegrations />} />
                  <Route path="history" element={<AdminVersionHistory />} />
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </ToastProvider>
      </CMSProvider>
    </ThemeProvider>
  );
}
