'use client';

import React, { useState, useEffect } from 'react';
import { CalendarDays, ChevronRight } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa6';
import { motion, AnimatePresence } from 'framer-motion';
import { useCMS } from '../cms/context/CMSContext';

import Link from 'next/link';
export const LiquidDualCTA: React.FC = () => {
  const { data } = useCMS();
  const [isHovered, setIsHovered] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Detect touch / mobile devices
    const touch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsTouchDevice(touch);

    // Detect prefers reduced motion
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setPrefersReducedMotion(reducedMotion);
  }, []);

  const handleParentMouseEnter = () => {
    if (!isTouchDevice && !prefersReducedMotion) {
      setIsHovered(true);
    }
  };

  const handleParentMouseLeave = () => {
    if (!isTouchDevice && !prefersReducedMotion) {
      setIsHovered(false);
    }
  };

  // Spring transition timing as specified
  const springTransition = prefersReducedMotion
    ? { duration: 0.15 }
    : { type: 'spring', stiffness: 290, damping: 26, mass: 0.8 };

  return (
    // The mouse handlers drive a decorative morph between the two buttons and
    // expose no behaviour of their own — the real controls are the links
    // inside. There is nothing for a keyboard user to miss here.
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      onMouseEnter={handleParentMouseEnter}
      onMouseLeave={handleParentMouseLeave}
      className="relative inline-flex items-center gap-3.5 select-none py-1"
    >
      {/* =================================================================== */}
      {/* TEMPORARY LIQUID MORPH CONNECTOR BRIDGE                             */}
      {/* =================================================================== */}
      {!isTouchDevice && !prefersReducedMotion && (
        <AnimatePresence>
          {isHovered && (
            <motion.div
              key="liquid-bridge"
              initial={{ opacity: 0, scaleX: 0, scaleY: 0.5 }}
              animate={{
                opacity: [0, 0.9, 0.9, 0.4, 0],
                scaleX: [0, 1.25, 1, 0.3, 0],
                scaleY: [0.5, 1.15, 0.9, 0.4, 0],
              }}
              exit={{ opacity: 0, scaleX: 0, scaleY: 0.5 }}
              transition={{
                duration: 0.55,
                times: [0, 0.25, 0.5, 0.8, 1],
                ease: [0.22, 1, 0.36, 1],
              }}
              className="absolute left-[40%] top-1/2 -translate-y-1/2 w-16 h-10 rounded-full bg-text-primary pointer-events-none filter blur-[1.5px] z-0"
            />
          )}
        </AnimatePresence>
      )}

      {/* =================================================================== */}
      {/* LEFT BUTTON: PRIMARY CTA                                            */}
      {/* =================================================================== */}
      <motion.div
        animate={{
          width: !isTouchDevice && isHovered ? 290 : 175,
        }}
        transition={springTransition}
        className="relative z-10 h-14 rounded-full overflow-hidden shadow-sm flex-shrink-0"
      >
        <Link
          href="/contact"
          className="w-full h-full inline-flex items-center justify-center px-6 rounded-full font-body text-sm font-bold uppercase tracking-wider bg-text-primary text-bg transition-colors duration-300 hover:bg-accent hover:text-[#101212] group cursor-pointer whitespace-nowrap"
        >
          <AnimatePresence mode="wait">
            {!isTouchDevice && isHovered ? (
              <motion.span
                key="hovered-left"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="inline-flex items-center gap-2 text-xs sm:text-sm"
              >
                <span>LET'S CREATE SOMETHING</span>
                <motion.span
                  initial={{ x: -3, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.2, delay: 0.1 }}
                >
                  <ChevronRight className="w-4 h-4 text-current" />
                </motion.span>
              </motion.span>
            ) : (
              <motion.span
                key="default-left"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="inline-flex items-center gap-2.5 text-xs sm:text-sm"
              >
                <CalendarDays className="w-4 h-4 text-current" />
                <span>GET STARTED</span>
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </motion.div>

      {/* =================================================================== */}
      {/* RIGHT BUTTON: WHATSAPP CONNECT                                      */}
      {/* =================================================================== */}
      <motion.div
        animate={{
          width: !isTouchDevice && isHovered ? 56 : 165,
        }}
        transition={springTransition}
        className="relative z-10 h-14 rounded-full overflow-hidden shadow-sm flex-shrink-0"
      >
        <a
          href={data.settings.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Connect on WhatsApp"
          className="w-full h-full inline-flex items-center justify-center px-4 rounded-full font-body text-xs sm:text-sm font-bold uppercase tracking-wider bg-accent text-[#101212] transition-colors duration-300 hover:opacity-95 group cursor-pointer whitespace-nowrap"
        >
          <div className="flex items-center justify-center gap-2">
            <FaWhatsapp className="w-4 h-4 text-[#101212] flex-shrink-0 transition-transform duration-200 group-hover:scale-110" />

            <AnimatePresence>
              {(isTouchDevice || !isHovered) && (
                <motion.span
                  key="whatsapp-text"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden inline-block"
                >
                  CONNECT
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </a>
      </motion.div>
    </div>
  );
};
