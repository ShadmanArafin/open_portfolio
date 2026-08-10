import React from 'react';
import { Section } from './common/Section';
import { Container } from './common/Container';
import { SectionLabel } from './common/SectionLabel';
import { Reveal } from './common/Reveal';
import { ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCMS } from '../cms/context/CMSContext';

export const CapabilitiesSection: React.FC = () => {
  const { data } = useCMS();

  const capabilitiesConfig = data.sections.find((s) => s.id === 'capabilities');
  const capabilityGroups = (data.capabilityGroups || [])
    .filter((g) => g.visible !== false)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  if (capabilitiesConfig && !capabilitiesConfig.visible) return null;

  return (
    <Section
      id="capabilities"
      className="border-t border-border bg-[var(--section-capabilities)] text-text-primary py-20 lg:py-28 xl:py-32 transition-colors duration-300"
    >
      <Container>
        {/* 12-Column Desktop Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 xl:gap-20 items-start">
          {/* =================================================================== */}
          {/* LEFT SIDE: STICKY SECTION HEADER & INTRO (~40% / 5 COLS)            */}
          {/* =================================================================== */}
          <div className="lg:col-span-5 lg:sticky lg:top-32">
            <Reveal type="fade-up" delay={0.05}>
              <SectionLabel text={capabilitiesConfig?.label || 'CAPABILITIES'} />
            </Reveal>

            <Reveal type="clip-headline" delay={0.15}>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-medium tracking-tight text-text-primary leading-[1.18] mb-6">
                {capabilitiesConfig?.heading ||
                  'End-to-end design capabilities for web and product.'}
              </h2>
            </Reveal>

            <Reveal type="fade-up" delay={0.25}>
              <p className="text-base sm:text-lg text-text-secondary leading-relaxed font-body font-normal max-w-md">
                {capabilitiesConfig?.description ||
                  'From discovery and information architecture to design system engineering.'}
              </p>
            </Reveal>
          </div>

          {/* =================================================================== */}
          {/* RIGHT SIDE: CAPABILITY GROUPS IN A 2-COLUMN GRID (~60% / 7 COLS)   */}
          {/* =================================================================== */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 sm:gap-12 xl:gap-14">
              {capabilityGroups.map((group, groupIdx) => (
                <motion.div
                  key={group.id || group.number}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-10% 0px' }}
                  transition={{
                    duration: 0.6,
                    delay: groupIdx * 0.08,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="pt-6 border-t border-border group hover:border-text-primary/30 transition-colors duration-300"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-xs font-medium text-text-muted group-hover:text-accent transition-colors duration-200">
                      {group.number}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-border group-hover:bg-accent transition-colors duration-200" />
                  </div>

                  <h3 className="font-display text-xl sm:text-2xl font-medium tracking-tight text-text-primary mb-3 leading-snug group-hover:translate-x-0.5 transition-transform duration-200">
                    {group.title}
                  </h3>

                  <p className="text-sm font-body font-normal text-text-secondary leading-relaxed mb-6">
                    {group.description}
                  </p>

                  <ul className="space-y-2 pt-2 font-body text-xs sm:text-sm text-text-secondary font-medium">
                    {group.capabilities.map((item, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <ArrowUpRight className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
};
