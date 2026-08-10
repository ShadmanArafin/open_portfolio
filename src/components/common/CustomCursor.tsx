'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export const CustomCursor: React.FC = () => {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [cursorText, setCursorText] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const [isPointer, setIsPointer] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    // Disable completely on touch/mobile devices
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      setIsTouch(true);
      return;
    }

    const onMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });

      const target = e.target as HTMLElement | null;
      if (!target) return;

      const projectCard = target.closest('[data-cursor-text]');
      if (projectCard) {
        const text = projectCard.getAttribute('data-cursor-text') || 'VIEW ↗';
        setCursorText(text);
        setIsHovered(true);
      } else {
        setCursorText('');
        setIsHovered(false);
      }

      const isInteractive = target.closest('a, button, [role="button"], input, select, textarea');
      setIsPointer(!!isInteractive);
    };

    window.addEventListener('mousemove', onMouseMove);
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, []);

  if (isTouch) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-[99999] hidden md:flex items-center justify-center rounded-full mix-blend-difference"
      animate={{
        x: position.x - (isHovered ? 40 : isPointer ? 16 : 6),
        y: position.y - (isHovered ? 40 : isPointer ? 16 : 6),
        width: isHovered ? 80 : isPointer ? 32 : 12,
        height: isHovered ? 80 : isPointer ? 32 : 12,
        backgroundColor: isHovered ? 'var(--text-primary)' : 'var(--text-secondary)',
      }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 28,
        mass: 0.5,
      }}
    >
      {isHovered && cursorText && (
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-[11px] font-medium tracking-wider uppercase font-body text-bg text-center px-1"
        >
          {cursorText}
        </motion.span>
      )}
    </motion.div>
  );
};
