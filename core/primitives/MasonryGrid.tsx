import type { CSSProperties, ReactNode } from 'react';
import styles from './MasonryGrid.module.css';

export interface MasonryColumns {
  mobile?: number;
  tablet?: number;
  desktop?: number;
}

/** A responsive, CSS-only masonry layout that preserves each image's ratio. */
export function MasonryGrid({
  children,
  columns = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 'var(--space-4)',
  className = '',
}: {
  children: ReactNode;
  columns?: MasonryColumns;
  gap?: string;
  className?: string;
}) {
  const style = {
    '--masonry-mobile': columns.mobile ?? 1,
    '--masonry-tablet': columns.tablet ?? 2,
    '--masonry-desktop': columns.desktop ?? 3,
    '--masonry-gap': gap,
  } as CSSProperties;

  return (
    <div className={`${styles.grid} ${className}`.trim()} style={style}>
      {children}
    </div>
  );
}
