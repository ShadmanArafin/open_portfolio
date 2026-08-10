import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ThemeToggle } from './common/ThemeToggle';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Container } from './common/Container';
import { cn } from '../utils/cn';
import { useCMS } from '../cms/context/CMSContext';

export const Navbar: React.FC = () => {
  const { data } = useCMS();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 120) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const navLinks = [...(data.navLinks ?? [])]
    .filter((link) => link.visible !== false)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  // The wordmark is the owner's name from Settings. The narrow variant drops to
  // the first word so a long name doesn't collide with the nav on small phones.
  const fullName = data.settings.fullName?.trim() || 'Portfolio';
  const shortName = fullName.split(/\s+/)[0];

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out',
          scrolled
            ? 'py-4 bg-bg/90 border-b border-border backdrop-blur-md shadow-sm'
            : 'py-6 sm:py-8 bg-transparent'
        )}
      >
        <Container>
          {/* Robust 3-Column Grid Layout: 1fr auto 1fr (Left | Truly Centered Menu | Right) */}
          <div className="grid grid-cols-2 md:grid-cols-[1fr_auto_1fr] items-center w-full gap-4">
            {/* LEFT: Clean Text Logo */}
            <div className="justify-self-start">
              <Link
                to="/"
                className="font-display font-medium text-base sm:text-lg tracking-tight text-text-primary group"
              >
                <span className="hidden xs:inline-block uppercase tracking-wider">{fullName}</span>
                <span className="xs:hidden uppercase tracking-wider">{shortName}</span>
              </Link>
            </div>

            {/* CENTER: Desktop Nav Links Truly Centered in Viewport */}
            <nav className="hidden md:flex items-center justify-center gap-7 lg:gap-8 justify-self-center">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.id}
                    to={link.path}
                    className={cn(
                      'relative font-body text-sm sm:text-[15px] font-medium transition-colors duration-200 py-1 group',
                      isActive ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'
                    )}
                  >
                    {link.label}
                    <span
                      className={cn(
                        'absolute bottom-0 left-0 w-full h-[1.5px] bg-accent origin-left transition-transform duration-300 ease-out',
                        isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                      )}
                    />
                  </Link>
                );
              })}
            </nav>

            {/* RIGHT: Theme Toggle & Let's Talk CTA (Strict 42px Height & Raleway 500) */}
            <div className="hidden lg:flex items-center gap-3.5 justify-self-end">
              <ThemeToggle />

              <Link
                to="/contact"
                aria-label={`Contact ${fullName}`}
                className="inline-flex items-center justify-center gap-2 h-[42px] px-5 sm:px-6 rounded-full text-xs sm:text-[13px] font-medium uppercase tracking-wider font-body bg-text-primary text-bg hover:opacity-90 transition-all duration-250 hover:-translate-y-[1px] group cursor-pointer select-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
              >
                <span>LET'S TALK</span>
                <ArrowUpRight className="w-4 h-4 transition-transform duration-250 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 flex-shrink-0" />
              </Link>
            </div>

            {/* MOBILE CONTROLS */}
            <div className="flex lg:hidden items-center justify-end gap-3 justify-self-end">
              <ThemeToggle showText={false} />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="w-[42px] h-[42px] rounded-full border border-border text-text-primary flex items-center justify-center cursor-pointer hover:border-text-primary/40 transition-colors"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </Container>
      </header>

      {/* MOBILE OVERLAY MENU */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-40 bg-bg pt-28 px-8 pb-12 flex flex-col justify-between lg:hidden"
          >
            <nav className="flex flex-col gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.id}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="font-display text-2xl sm:text-3xl font-medium text-text-primary hover:text-accent transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="pt-8 border-t border-border flex flex-col gap-4">
              <ThemeToggle className="w-full justify-center" />
              <Link
                to="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full h-[42px] rounded-full inline-flex items-center justify-center font-medium uppercase tracking-wider font-body text-xs sm:text-[13px] bg-text-primary text-bg"
              >
                LET'S TALK ↗
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
