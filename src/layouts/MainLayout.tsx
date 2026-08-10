import React, { useEffect } from 'react';
import { trackPageview } from '../utils/analytics';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { ToastProvider } from '../context/ToastContext';
import { SideSectionIndicator } from '../components/common/SideSectionIndicator';

export const MainLayout: React.FC = () => {
  const { pathname } = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // A provider script counts the first load and nothing after it, because a
  // client-routed app never asks the server for another page.
  useEffect(() => {
    trackPageview(pathname);
  }, [pathname]);

  return (
    <ToastProvider>
      <div className="min-h-screen flex flex-col justify-between relative">
        <Navbar />
        <SideSectionIndicator />
        <main className="flex-grow">
          <Outlet />
        </main>
        <Footer />
      </div>
    </ToastProvider>
  );
};
