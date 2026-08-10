'use client';

import React from 'react';
import { Section } from './common/Section';
import { Container } from './common/Container';
import { SectionLabel } from './common/SectionLabel';
import { Reveal } from './common/Reveal';
import { useCMS } from '../cms/context/CMSContext';
import { formatPeriod } from '../cms/utils/dates';

export const ExperienceSection: React.FC = () => {
  const { data } = useCMS();
  const expConfig = data.sections.find((s) => s.id === 'experience');
  const expList = data.experience
    .filter((e) => e.visible !== false)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  if (expConfig && !expConfig.visible) return null;

  return (
    <Section
      id="experience"
      className="border-t border-border bg-[var(--section-experience)] text-text-primary py-20 lg:py-28 xl:py-32 transition-colors duration-300 scroll-mt-28 font-sans"
    >
      <Container>
        {/* Section Label & Headline */}
        <div className="mb-14 sm:mb-20 max-w-3xl">
          <Reveal type="fade-up" delay={0.05}>
            <SectionLabel text={expConfig?.label || 'EXPERIENCE'} />
          </Reveal>

          <Reveal type="clip-headline" delay={0.15}>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-medium tracking-tight text-text-primary leading-[1.18]">
              {expConfig?.heading || "Where I've been building and learning."}
            </h2>
          </Reveal>
        </div>

        {/* Premium Editorial Rows */}
        <div className="space-y-0 divide-y divide-border border-t border-b border-border">
          {expList.map((exp, idx) => {
            const hasLink = exp.companyUrl && exp.companyUrl !== '#';
            const Wrapper = hasLink ? 'a' : 'div';
            const linkProps = hasLink
              ? {
                  href: exp.companyUrl,
                  target: '_blank',
                  rel: 'noopener noreferrer',
                  'aria-label': `View ${exp.company}`,
                }
              : {};

            return (
              <Reveal key={exp.id} type="fade-up" delay={0.1 + idx * 0.08}>
                <Wrapper
                  {...linkProps}
                  className="group py-8 sm:py-10 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 items-baseline transition-all duration-300 hover:bg-surface-primary/40 px-2 sm:px-4 rounded-xl cursor-pointer block text-left"
                >
                  {/* Left Column: Timeline & Employment Type (~3 Cols) */}
                  <div className="lg:col-span-3 flex flex-col gap-1">
                    <span className="text-xs font-mono font-medium text-accent tracking-wider uppercase">
                      {formatPeriod(exp)}
                    </span>
                    <span className="text-[11px] font-mono text-text-muted uppercase tracking-widest font-medium">
                      {exp.type}
                    </span>
                  </div>

                  {/* Center Column: Role Title & Company (~4 Cols) */}
                  <div className="lg:col-span-4 space-y-1">
                    <h3 className="font-display text-xl sm:text-2xl font-medium text-text-primary group-hover:text-accent transition-colors flex items-center gap-1.5">
                      <span>{exp.role}</span>
                    </h3>
                    <span className="text-sm font-body text-text-secondary font-medium block">
                      {exp.company}
                    </span>
                  </div>

                  {/* Right Column: Summary & Bullet Points (~5 Cols) */}
                  <div className="lg:col-span-5 space-y-2">
                    <p className="text-sm text-text-secondary font-body leading-relaxed">
                      {exp.summary}
                    </p>

                    {exp.highlights && exp.highlights.length > 0 && (
                      <ul className="space-y-1 pt-1">
                        {exp.highlights.map((item, hIdx) => (
                          <li
                            key={hIdx}
                            className="text-xs text-text-muted font-body flex items-start gap-2"
                          >
                            <span className="w-1 h-1 rounded-full bg-accent mt-1.5 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </Wrapper>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </Section>
  );
};
