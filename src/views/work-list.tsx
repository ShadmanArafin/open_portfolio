'use client';

import React, { useMemo, useState } from 'react';
import type { ProjectItem } from '../cms/types/cms';
import { ProjectPreview } from '../components/ProjectPreview';
import { Reveal } from '../components/common/Reveal';
import { cn } from '../utils/cn';

/**
 * The Work page's filter pills and the list they filter — its one
 * interaction. The heading above it renders on the server.
 */
export function WorkList({
  projects,
  allLabel,
  srcSets,
}: {
  projects: ProjectItem[];
  allLabel: string;
  srcSets?: Record<string, string>;
}) {
  const [activeCategory, setActiveCategory] = useState<string>(allLabel);

  // Filters follow the content: adding a project with a new category adds a
  // pill for it, rather than the list going stale against a hardcoded array.
  const categories = useMemo(() => {
    const unique = new Set<string>();
    projects.forEach((p) => {
      p.category
        .split('/')
        .map((part) => part.trim())
        .filter(Boolean)
        .forEach((part) => unique.add(part));
    });
    return [allLabel, ...[...unique].sort((a, b) => a.localeCompare(b))];
  }, [projects, allLabel]);

  const filteredProjects =
    activeCategory === allLabel
      ? projects
      : projects.filter((p) => p.category.toLowerCase().includes(activeCategory.toLowerCase()));

  return (
    <>
      {categories.length > 2 && (
        <Reveal type="fade-up">
          <div className="flex flex-wrap items-center gap-3 mb-10 sm:mb-14">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                aria-pressed={activeCategory === cat}
                className={cn(
                  'h-[44px] px-4 rounded-full text-xs font-medium uppercase tracking-wider font-body transition-all duration-200 border cursor-pointer select-none',
                  activeCategory === cat
                    ? 'bg-text-primary text-bg border-transparent shadow-sm'
                    : 'bg-surface-primary text-text-secondary border-border hover:border-text-primary/40'
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </Reveal>
      )}

      <div className="flex flex-col">
        {filteredProjects.length > 0 ? (
          filteredProjects.map((project, idx) => (
            <ProjectPreview key={project.id} project={project} index={idx} srcSets={srcSets} />
          ))
        ) : (
          <div className="py-20 text-center text-text-muted font-body" role="status">
            {projects.length === 0
              ? 'No projects have been published yet.'
              : `No projects found under “${activeCategory}”.`}
          </div>
        )}
      </div>
    </>
  );
}
