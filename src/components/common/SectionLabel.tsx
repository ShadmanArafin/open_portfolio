import React from 'react';
import { cn } from '../../utils/cn';

interface SectionLabelProps {
  text: string;
  className?: string;
}

export const SectionLabel: React.FC<SectionLabelProps> = ({ text, className }) => {
  // Clean text by stripping leading bullet if passed
  const cleanText = text.replace(/^●\s*/, '');

  return (
    <div
      className={cn(
        'inline-flex flex-row items-center gap-2.5 whitespace-nowrap mb-6 text-xs sm:text-sm font-medium tracking-wider uppercase font-body text-text-secondary',
        className
      )}
    >
      <span className="w-2 h-2 rounded-full bg-accent flex-shrink-0" />
      <span className="leading-none">{cleanText}</span>
    </div>
  );
};
