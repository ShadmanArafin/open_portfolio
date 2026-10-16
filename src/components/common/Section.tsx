import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  id?: string;
  className?: string;
}

export const Section = forwardRef<HTMLElement, SectionProps>(
  ({ children, id, className, ...props }, ref) => {
    return (
      <section
        ref={ref}
        id={id}
        className={cn('py-[var(--section-y)] relative', className)}
        {...props}
      >
        {children}
      </section>
    );
  }
);

Section.displayName = 'Section';
