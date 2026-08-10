'use client';

import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ThemeToggleProps {
  className?: string;
  showText?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className, showText = true }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        'inline-flex items-center justify-center gap-2 h-[42px] px-4 sm:px-5 rounded-full font-body text-xs sm:text-[13px] font-medium uppercase tracking-wider transition-all duration-250 border border-border bg-surface-primary text-text-primary hover:border-text-primary/40 hover:bg-surface-secondary cursor-pointer select-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none',
        className
      )}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <>
          <Sun className="w-4 h-4 text-accent flex-shrink-0" />
          {showText && <span>LIGHT</span>}
        </>
      ) : (
        <>
          <Moon className="w-4 h-4 text-accent flex-shrink-0" />
          {showText && <span>DARK</span>}
        </>
      )}
    </button>
  );
};
