'use client';

import React, { useMemo, useState } from 'react';
import { Container } from '../components/common/Container';
import { Section } from '../components/common/Section';
import { SectionLabel } from '../components/common/SectionLabel';
import { Reveal } from '../components/common/Reveal';
import { ProjectPreview } from '../components/ProjectPreview';
import { useCMS } from '../cms/context/CMSContext';
import { cn } from '../utils/cn';

export const WorkPage: React.FC = () => {
  const { data } = useCMS();
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const header = data.sections.find((s) => s.id === 'work-page');
  const allLabel = data.microcopy.allFilterLabel || 'All';

  const projects = useMemo(
    () =>
      [...data.projects]
        .filter((p) => p.status !== 'archived')
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [data.projects]
  );

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
    <div className="pt-32 sm:pt-40 font-sans">
      <Section className="py-8 sm:py-12 bg-[var(--section-work)]">
        <Container>
          <SectionLabel text={header?.label || 'WORK'} />

          <Reveal type="clip-headline">
            <h1 className="font-display text-4xl sm:text-6xl lg:text-[64px] font-medium tracking-tight text-text-primary mb-6 leading-[1.18]">
              {header?.heading}
            </h1>
          </Reveal>

          {header?.description && (
            <Reveal type="fade-up" delay={0.2}>
              <p className="text-lg sm:text-xl text-text-secondary max-w-2xl mb-12 font-body font-normal leading-relaxed">
                {header.description}
              </p>
            </Reveal>
          )}

          {/* Category Filter Pills */}
          {categories.length > 2 && (
            <Reveal type="fade-up" delay={0.3}>
              <div className="flex flex-wrap items-center gap-3 mb-10 sm:mb-14">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    aria-pressed={activeCategory === cat}
                    className={cn(
                      'h-[38px] px-4 rounded-full text-xs font-medium uppercase tracking-wider font-body transition-all duration-200 border cursor-pointer select-none',
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
                <ProjectPreview key={project.id} project={project} index={idx} />
              ))
            ) : (
              <div className="py-20 text-center text-text-muted font-body">
                {projects.length === 0
                  ? 'No projects have been published yet.'
                  : `No projects found under “${activeCategory}”.`}
              </div>
            )}
          </div>
        </Container>
      </Section>
    </div>
  );
};
