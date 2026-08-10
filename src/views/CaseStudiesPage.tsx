'use client';

import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Container } from '../components/common/Container';
import { Section } from '../components/common/Section';
import { SectionLabel } from '../components/common/SectionLabel';
import { Reveal } from '../components/common/Reveal';
import { ContactCTASection } from '../components/ContactCTASection';
import { CMSImage } from '../components/common/CMSImage';
import { useCMS } from '../cms/context/CMSContext';

import Link from 'next/link';
export const CaseStudiesPage: React.FC = () => {
  const { data } = useCMS();
  const header = data.sections.find((s) => s.id === 'case-studies-page');
  const studies = [...data.caseStudies]
    .filter((cs) => cs.status !== 'archived')
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="w-full pt-32 sm:pt-40 font-sans">
      {/* 01 HEADER SECTION */}
      <Section className="bg-[var(--section-hero)] text-text-primary transition-colors duration-300">
        <Container>
          <SectionLabel text={header?.label || 'CASE STUDIES'} />

          <div className="max-w-3xl mb-12 sm:mb-16">
            <Reveal type="clip-headline" delay={0.1}>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-[64px] font-medium tracking-tight text-text-primary mb-6 leading-[1.18]">
                {header?.heading}
              </h1>
            </Reveal>

            {header?.description && (
              <Reveal type="fade-up" delay={0.25}>
                <p className="text-base sm:text-xl font-body font-normal text-text-secondary leading-relaxed">
                  {header.description}
                </p>
              </Reveal>
            )}
          </div>
        </Container>
      </Section>

      {/* 02 CASE STUDIES ARCHIVE GRID */}
      <Section className="border-t border-border bg-[var(--section-capabilities)] text-text-primary transition-colors duration-300">
        <Container>
          {studies.length === 0 && (
            <p className="py-16 text-center text-text-muted font-body">
              No case studies have been published yet.
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
            {studies.map((study, idx) => (
              <motion.div
                key={study.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-5% 0px' }}
                transition={{ duration: 0.6, delay: idx * 0.12, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link
                  href={`/case-studies/${study.slug}`}
                  className="group flex flex-col block h-full"
                >
                  {/* Image Container with Hover Scale */}
                  <div className="w-full aspect-[16/10] rounded-2xl overflow-hidden border border-border bg-surface-secondary mb-6 relative shadow-sm">
                    {study.coverImage ? (
                      <CMSImage
                        src={study.coverImage}
                        alt={study.title}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-surface-secondary to-surface-primary p-8 flex flex-col justify-between">
                        <div className="flex items-center justify-between text-xs font-mono text-text-muted">
                          <span>CASE STUDY</span>
                          <span>
                            {String(idx + 1).padStart(2, '0')} /{' '}
                            {String(studies.length).padStart(2, '0')}
                          </span>
                        </div>
                        <div>
                          <span className="text-xs font-mono text-accent block mb-1 uppercase tracking-wider">
                            {study.category}
                          </span>
                          <span className="font-display text-2xl font-medium text-text-primary">
                            {study.industry}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Corner View Badge Overlay */}
                    <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-surface-primary/90 backdrop-blur-md border border-border flex items-center justify-center text-text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110 shadow-sm">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Card Information */}
                  <div className="flex flex-col flex-grow">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-3 py-1 rounded-full text-[11px] font-mono uppercase tracking-wider bg-surface-secondary text-text-secondary border border-border font-medium">
                        {study.category}
                      </span>
                      <span className="text-xs font-body font-medium text-accent uppercase tracking-wider">
                        ✦ {study.industry}
                      </span>
                    </div>

                    <h2 className="font-display text-2xl sm:text-3xl font-medium text-text-primary group-hover:text-accent transition-colors duration-200 mb-3 leading-snug">
                      {study.title}
                    </h2>

                    <p className="text-sm sm:text-base text-text-secondary font-body font-normal leading-relaxed line-clamp-3 mb-6">
                      {study.shortChallenge}
                    </p>

                    <div className="mt-auto flex items-center gap-1.5 text-xs font-body font-medium uppercase tracking-wider text-text-primary group-hover:text-accent transition-colors pt-2">
                      <span>{data.microcopy.exploreCaseStudy}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-current transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </Container>
      </Section>

      {/* 03 BOTTOM CONTACT CTA */}
      <ContactCTASection />
    </div>
  );
};
