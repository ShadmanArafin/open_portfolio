import React from 'react';
import { ExperienceItem } from '../cms/types/cms';
import { formatPeriod } from '../cms/utils/dates';
import { ArrowUpRight } from 'lucide-react';

interface ExperienceRowProps {
  item: ExperienceItem;
}

export const ExperienceRow: React.FC<ExperienceRowProps> = ({ item }) => {
  return (
    <a
      href={item.companyUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`View details for ${item.role} at ${item.company}`}
      className="group block py-6 sm:py-7 border-b border-border hover:border-border-hover hover:bg-surface-primary/30 transition-all duration-300 rounded-xl px-3 sm:px-4 -mx-3 sm:-mx-4 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-6 items-center">
        {/* ROLE (~40% / 5 COLS) */}
        <div className="md:col-span-5 flex items-center gap-2">
          <span className="font-display text-base sm:text-lg lg:text-xl font-medium text-text-primary group-hover:text-accent transition-colors duration-200 transform group-hover:translate-x-1">
            {item.role}
          </span>
        </div>

        {/* COMPANY (~35% / 4 COLS) */}
        <div className="md:col-span-4">
          <span className="font-body text-sm sm:text-base font-medium text-text-secondary group-hover:text-text-primary transition-colors">
            {item.company}
          </span>
        </div>

        {/* PERIOD (~20% / 2 COLS) */}
        <div className="md:col-span-2 text-left md:text-right">
          <span className="font-body text-xs sm:text-sm font-medium tracking-wider text-text-muted uppercase">
            {formatPeriod(item)}
          </span>
        </div>

        {/* ARROW ICON (~5% / 1 COL) */}
        <div className="md:col-span-1 text-right flex justify-end">
          <ArrowUpRight className="w-4 h-4 text-accent opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </div>
    </a>
  );
};
