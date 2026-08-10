import React from 'react';
import { Section } from './common/Section';
import { Container } from './common/Container';
import { SectionLabel } from './common/SectionLabel';
import { Reveal } from './common/Reveal';
import { useCMS } from '../cms/context/CMSContext';

export const ProcessSprintSection: React.FC = () => {
  const { data } = useCMS();
  const processConfig = data.sections.find((s) => s.id === 'process');
  const processSteps = data.processSteps
    .filter((s) => s.visible !== false)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  if (processConfig && !processConfig.visible) return null;

  return (
    <Section
      id="process"
      className="border-t border-border bg-[var(--section-capabilities)] text-text-primary py-20 lg:py-28 xl:py-32 transition-colors duration-300 relative overflow-hidden font-sans scroll-mt-28"
    >
      <Container>
        {/* Section Label & Headline */}
        <div className="mb-14 sm:mb-20 max-w-3xl">
          <Reveal type="fade-up" delay={0.05}>
            <SectionLabel text={processConfig?.label || 'MY PROCESS'} />
          </Reveal>

          <Reveal type="clip-headline" delay={0.15}>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-medium tracking-tight text-text-primary leading-[1.18]">
              {processConfig?.heading ||
                'A structured approach to turning ideas into shipped products.'}
            </h2>
          </Reveal>
        </div>

        {/* Process Step Rows (Number Left | Title Center | Explanation Right) */}
        <div className="space-y-0 divide-y divide-border border-t border-b border-border">
          {processSteps.map((step, idx) => (
            <Reveal key={step.id} type="fade-up" delay={0.1 + idx * 0.08}>
              <div className="py-8 sm:py-10 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 items-start hover:bg-surface-primary/30 px-2 sm:px-4 rounded-xl transition-all duration-300">
                {/* Left Step Indicator (~2 Cols) */}
                <div className="lg:col-span-2 flex items-center gap-3">
                  <span className="text-sm font-mono font-medium text-accent uppercase tracking-wider">
                    {step.number || `0${idx + 1}`}
                  </span>
                  <span className="h-px flex-grow bg-border/40 lg:hidden" />
                </div>

                {/* Center Title (~4 Cols) */}
                <div className="lg:col-span-4 space-y-1">
                  <h3 className="font-display text-xl sm:text-2xl font-medium text-text-primary">
                    {step.title}
                  </h3>
                  {step.deliverable && (
                    <span className="text-xs font-mono text-text-muted uppercase tracking-wider block font-medium">
                      Deliverable: {step.deliverable}
                    </span>
                  )}
                </div>

                {/* Right Explanation (~6 Cols) */}
                <div className="lg:col-span-6 space-y-3">
                  <p className="text-sm sm:text-base text-text-secondary leading-relaxed font-body font-normal">
                    {step.description}
                  </p>

                  {step.details && step.details.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {step.details.map((detail: string, dIdx: number) => (
                        <span
                          key={dIdx}
                          className="px-2.5 py-1 rounded-md text-xs font-body bg-surface-primary border border-border text-text-muted font-medium"
                        >
                          {detail}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
};
