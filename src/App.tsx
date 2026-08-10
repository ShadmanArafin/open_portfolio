import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';

// Public Lazy Page Components
const HomePage = lazy(() => import('./pages/HomePage').then((m) => ({ default: m.HomePage })));
const WorkPage = lazy(() => import('./pages/WorkPage').then((m) => ({ default: m.WorkPage })));
const ProjectDetailPage = lazy(() =>
  import('./pages/ProjectDetailPage').then((m) => ({ default: m.ProjectDetailPage }))
);
const CaseStudiesPage = lazy(() =>
  import('./pages/CaseStudiesPage').then((m) => ({ default: m.CaseStudiesPage }))
);
const CaseStudyDetailPage = lazy(() =>
  import('./pages/CaseStudyDetailPage').then((m) => ({ default: m.CaseStudyDetailPage }))
);
const AboutPage = lazy(() => import('./pages/AboutPage').then((m) => ({ default: m.AboutPage })));
const ContactPage = lazy(() =>
  import('./pages/ContactPage').then((m) => ({ default: m.ContactPage }))
);

// CMS Admin Lazy Page Components
const AdminLogin = lazy(() =>
  import('./admin/pages/AdminLogin').then((m) => ({ default: m.AdminLogin }))
);
const AdminLayout = lazy(() =>
  import('./admin/layouts/AdminLayout').then((m) => ({ default: m.AdminLayout }))
);
const AdminDashboard = lazy(() =>
  import('./admin/pages/AdminDashboard').then((m) => ({ default: m.AdminDashboard }))
);
const AdminAnalytics = lazy(() =>
  import('./admin/pages/AdminAnalytics').then((m) => ({ default: m.AdminAnalytics }))
);
const AdminPagesEditor = lazy(() =>
  import('./admin/pages/AdminPagesEditor').then((m) => ({ default: m.AdminPagesEditor }))
);
const AdminProjectsCMS = lazy(() =>
  import('./admin/pages/AdminProjectsCMS').then((m) => ({ default: m.AdminProjectsCMS }))
);
const AdminCaseStudiesCMS = lazy(() =>
  import('./admin/pages/AdminCaseStudiesCMS').then((m) => ({ default: m.AdminCaseStudiesCMS }))
);
const AdminBrandsCMS = lazy(() =>
  import('./admin/pages/AdminBrandsCMS').then((m) => ({ default: m.AdminBrandsCMS }))
);
const AdminExperienceCMS = lazy(() =>
  import('./admin/pages/AdminExperienceCMS').then((m) => ({ default: m.AdminExperienceCMS }))
);
const AdminEducationCMS = lazy(() =>
  import('./admin/pages/AdminEducationCMS').then((m) => ({ default: m.AdminEducationCMS }))
);
const AdminMediaLibrary = lazy(() =>
  import('./admin/pages/AdminMediaLibrary').then((m) => ({ default: m.AdminMediaLibrary }))
);
const AdminMessagesInbox = lazy(() =>
  import('./admin/pages/AdminMessagesInbox').then((m) => ({ default: m.AdminMessagesInbox }))
);
const AdminSettings = lazy(() =>
  import('./admin/pages/AdminSettings').then((m) => ({ default: m.AdminSettings }))
);
const AdminVersionHistory = lazy(() =>
  import('./admin/pages/AdminVersionHistory').then((m) => ({ default: m.AdminVersionHistory }))
);
const AdminProcessCMS = lazy(() =>
  import('./admin/pages/AdminProcessCMS').then((m) => ({ default: m.AdminProcessCMS }))
);
const AdminCapabilitiesCMS = lazy(() =>
  import('./admin/pages/AdminCapabilitiesCMS').then((m) => ({ default: m.AdminCapabilitiesCMS }))
);
const AdminRecommendationsCMS = lazy(() =>
  import('./admin/pages/AdminRecommendationsCMS').then((m) => ({
    default: m.AdminRecommendationsCMS,
  }))
);
const AdminArtifactsCMS = lazy(() =>
  import('./admin/pages/AdminArtifactsCMS').then((m) => ({ default: m.AdminArtifactsCMS }))
);
const AdminNavigationCMS = lazy(() =>
  import('./admin/pages/AdminNavigationCMS').then((m) => ({ default: m.AdminNavigationCMS }))
);

/** Providers live in main.tsx — App is routing only. */
export const App: React.FC = () => <AppRoutes />;

const AppRoutes: React.FC = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-bg flex items-center justify-center font-sans text-xs text-text-muted font-mono tracking-widest uppercase animate-pulse">
          Loading Portfolio...
        </div>
      }
    >
      <Routes>
        {/* PUBLIC PORTFOLIO ROUTES */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="work" element={<WorkPage />} />
          <Route path="work/:slug" element={<ProjectDetailPage />} />
          <Route path="case-studies" element={<CaseStudiesPage />} />
          <Route path="case-studies/:slug" element={<CaseStudyDetailPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<ContactPage />} />
        </Route>

        {/* PROTECTED ADMIN CMS ROUTES */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="pages" element={<AdminPagesEditor />} />
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
          {/* Settings panels share one screen, switched by the :panel segment. */}
          <Route path="footer" element={<AdminSettings />} />
          <Route path="microcopy" element={<AdminSettings />} />
          <Route path="appearance" element={<AdminSettings />} />
          <Route path="seo" element={<AdminSettings />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="history" element={<AdminVersionHistory />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default App;
