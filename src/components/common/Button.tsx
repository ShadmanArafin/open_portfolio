'use client';

import React from 'react';
import { cn } from '../../utils/cn';

import Link from 'next/link';
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'whatsapp';
  to?: string;
  href?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  children: React.ReactNode;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  to,
  href,
  icon,
  iconPosition = 'right',
  children,
  className,
  ...props
}) => {
  // Global Button Height: EXACTLY 42px across desktop, tablet, and mobile
  const baseStyles =
    'inline-flex items-center justify-center gap-2 h-[42px] px-5 sm:px-6 rounded-full font-sans text-[13px] sm:text-sm font-medium uppercase tracking-wider transition-all duration-250 ease-out whitespace-nowrap group cursor-pointer select-none';

  const variants = {
    primary: 'bg-text-primary text-bg hover:opacity-90 shadow-sm hover:-translate-y-[1px]',
    secondary:
      'bg-transparent text-text-primary border border-border hover:border-text-primary/40 hover:bg-surface-primary hover:-translate-y-[1px]',
    outline:
      'bg-transparent text-text-secondary border border-border hover:text-text-primary hover:border-text-primary/40',
    whatsapp: 'bg-[#25D366] text-white hover:bg-[#20bd5a] shadow-sm hover:-translate-y-[1px]',
  };

  const content = (
    <>
      {icon && iconPosition === 'left' && (
        <span className="transition-transform duration-250 group-hover:-translate-x-0.5 flex-shrink-0">
          {icon}
        </span>
      )}
      <span>{children}</span>
      {icon && iconPosition === 'right' && (
        <span className="transition-transform duration-250 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 flex-shrink-0">
          {icon}
        </span>
      )}
    </>
  );

  if (to) {
    return (
      <Link href={to} className={cn(baseStyles, variants[variant], className)}>
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(baseStyles, variants[variant], className)}
      >
        {content}
      </a>
    );
  }

  return (
    <button className={cn(baseStyles, variants[variant], className)} {...props}>
      {content}
    </button>
  );
};
