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
        className={cn(
          'pt-20 sm:pt-24 lg:pt-28 xl:pt-32 pb-20 sm:pb-24 lg:pb-28 relative',
          className
        )}
        {...props}
      >
        {children}
      </section>
    );
  }
);

Section.displayName = 'Section';
