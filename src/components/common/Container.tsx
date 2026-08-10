import React from 'react';
import { cn } from '../../utils/cn';

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  fluid?: boolean;
}

export const Container: React.FC<ContainerProps> = ({
  children,
  className,
  fluid = false,
  ...props
}) => {
  return (
    <div
      className={cn(
        'w-full mx-auto px-5 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 site-container',
        fluid ? 'max-w-full' : 'max-w-[1280px]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
