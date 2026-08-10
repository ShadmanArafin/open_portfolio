import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SectionMarker {
  id: string;
  label: string;
}

const SECTION_MARKERS: SectionMarker[] = [
  { id: 'hero', label: 'Overview' },
  { id: 'brands', label: 'Clients & Brands' },
  { id: 'work', label: 'Selected Work' },
  { id: 'case-studies', label: 'Case Studies' },
  { id: 'experience', label: 'Experience' },
  { id: 'about', label: 'About' },
  { id: 'process', label: 'My Process' },
  { id: 'capabilities', label: 'Capabilities' },
  { id: 'contact', label: "Let's Work Together" },
];

export const SideSectionIndicator: React.FC = () => {
  const [activeSectionId, setActiveSectionId] = useState<string>('hero');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const location = useLocation();

  // Desktop only on the homepage
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    if (!isHomePage) return;

    const observerCallback: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSectionId(entry.target.id);
        }
      });
    };

    const observerOptions: IntersectionObserverInit = {
      root: null,
      rootMargin: '-30% 0px -40% 0px',
      threshold: 0.1,
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    SECTION_MARKERS.forEach((sec) => {
      const el = document.getElementById(sec.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [isHomePage]);

  if (!isHomePage) return null;

  const handleScrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav
      aria-label="Homepage Section Navigation"
      className="fixed right-6 xl:right-8 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col gap-3.5 items-end select-none pointer-events-auto"
    >
      {SECTION_MARKERS.map((sec) => {
        const isActive = activeSectionId === sec.id;
        const isHovered = hoveredId === sec.id;

        return (
          <button
            key={sec.id}
            onClick={() => handleScrollToSection(sec.id)}
            onMouseEnter={() => setHoveredId(sec.id)}
            onMouseLeave={() => setHoveredId(null)}
            onFocus={() => setHoveredId(sec.id)}
            onBlur={() => setHoveredId(null)}
            aria-label={`Go to ${sec.label}`}
            className="group flex items-center justify-end gap-3 py-1 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded"
          >
            {/* Section Label Tooltip (Raleway 500, 12-13px) */}
            {(isHovered || isActive) && (
              <span className="text-[12px] font-body font-medium uppercase tracking-wider text-text-primary bg-surface-primary border border-border px-2.5 py-1 rounded-md shadow-sm whitespace-nowrap transition-opacity duration-200">
                {sec.label}
              </span>
            )}

            {/* Horizontal Line Marker Ticks */}
            <span
              style={{
                width: isActive ? '32px' : isHovered ? '18px' : '12px',
                height: '1px',
              }}
              className={`block transition-all duration-250 ease-out rounded-full ${
                isActive
                  ? 'bg-accent opacity-100'
                  : isHovered
                    ? 'bg-[#8A8A8A] dark:bg-[#8A8A8A] light:bg-[#777777] opacity-90'
                    : 'bg-[#5A5A5A] dark:bg-[#5A5A5A] light:bg-[#B8B8B8] opacity-75'
              }`}
            />
          </button>
        );
      })}
    </nav>
  );
};
