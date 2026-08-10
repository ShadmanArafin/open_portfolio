import React from 'react';
import { cn } from '../../utils/cn';

interface PillProps {
  children: React.ReactNode;
  className?: string;
  magnetic?: boolean;
}

export const Pill: React.FC<PillProps> = ({ children, className, magnetic = true }) => {
  return (
    <span
      className={cn(
        'inline-flex items-center px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium font-body transition-all duration-200 ease-out border',
        'bg-surface-primary text-text-secondary border-border hover:text-text-primary hover:border-border-hover',
        magnetic && 'hover:-translate-y-1 hover:shadow-sm md:hover:translate-x-0.5',
        className
      )}
    >
      {children}
    </span>
  );
};
