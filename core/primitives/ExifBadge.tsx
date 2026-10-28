import { Camera } from 'lucide-react';
import type { ExifData } from '@/core/media/exif';

export interface ExifBadgeProps {
  exif: ExifData;
  className?: string;
  minimal?: boolean;
}

/** Camera details from a photo, shown only when the owner opts in. */
export function ExifBadge({ exif, className = '', minimal = false }: ExifBadgeProps) {
  const summary = exif.formattedSummary;
  if (!summary) return null;

  if (minimal) {
    return (
      <span
        title={summary}
        aria-label={`Camera settings: ${summary}`}
        className={`inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-surface-secondary/90 px-2.5 py-1 font-mono text-[11px] text-text-secondary backdrop-blur-sm transition-colors hover:text-text-primary ${className}`}
      >
        <Camera className="h-3 w-3 flex-shrink-0 text-accent" aria-hidden="true" />
        <span className="max-w-[200px] truncate">{summary}</span>
      </span>
    );
  }

  return (
    <div
      aria-label={`Camera settings: ${summary}`}
      className={`inline-flex flex-wrap items-center gap-x-2 gap-y-1 rounded-full border border-border/80 bg-surface-primary/95 px-3 py-1.5 font-mono text-xs text-text-secondary shadow-sm backdrop-blur-md ${className}`}
    >
      <div className="flex items-center gap-1.5 font-medium text-text-primary">
        <Camera className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
        <span>{[exif.make, exif.model].filter(Boolean).join(' ')}</span>
      </div>
      {(exif.focalLength || exif.aperture || exif.shutterSpeed || exif.iso) && (
        <span className="text-border" aria-hidden="true">
          |
        </span>
      )}
      <div className="flex items-center gap-1.5 text-text-muted">
        {exif.focalLength && <span>{exif.focalLength}</span>}
        {exif.aperture && <span>{exif.aperture}</span>}
        {exif.shutterSpeed && <span>{exif.shutterSpeed}</span>}
        {exif.iso && <span>ISO {exif.iso}</span>}
      </div>
    </div>
  );
}
