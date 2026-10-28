'use client';

import React from 'react';

interface MasonryGridProps {
  children: React.ReactNode;
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: string;
  className?: string;
}

/**
 * Pure CSS multi-column masonry grid.
 *
 * Inspired by Immich and PhotoPrism:
 * Gracefully balances mixed aspect-ratio images (portrait 4:5, landscape 16:9,
 * square 1:1) without cropping or forced grid cell distortions.
 */
export const MasonryGrid: React.FC<MasonryGridProps> = ({
  children,
  columns = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 'var(--space-4)',
  className = '',
}) => {
  const mobileCols = columns.mobile ?? 1;
  const tabletCols = columns.tablet ?? 2;
  const desktopCols = columns.desktop ?? 3;

  return (
    <div
      className={`w-full ${className}`}
      style={{
        columnCount: desktopCols,
        columnGap: gap,
      }}
    >
      <style jsx>{`
        div {
          column-count: ${mobileCols};
        }
        @media (min-width: 640px) {
          div {
            column-count: ${tabletCols};
          }
        }
        @media (min-width: 1024px) {
          div {
            column-count: ${desktopCols};
          }
        }
        :global([data-masonry-item]) {
          break-inside: avoid;
          margin-bottom: ${gap};
          display: inline-block;
          width: 100%;
        }
      `}</style>
      {React.Children.map(children, (child) => (
        <div data-masonry-item>{child}</div>
      ))}
    </div>
  );
};
