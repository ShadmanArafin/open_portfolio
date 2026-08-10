import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Container } from './common/Container';
import { Section } from './common/Section';
import { SectionLabel } from './common/SectionLabel';
import { Reveal } from './common/Reveal';
import { useCMS } from '../cms/context/CMSContext';
import { CMSImage } from './common/CMSImage';

export const CaseStudiesSection: React.FC = () => {
  const { data } = useCMS();
  const section = data.sections.find((s) => s.id === 'case-studies');

  // Homepage shows the first two featured case studies.
  const featuredCaseStudies = [...data.caseStudies]
    .filter((cs) => cs.featured && cs.status !== 'archived')
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .slice(0, 2);

  if ((section && !section.visible) || featuredCaseStudies.length === 0) return null;

  return (
    <Section
      id="case-studies"
      className="border-t border-border bg-[var(--section-capabilities)] text-text-primary transition-colors duration-300 scroll-mt-28"
    >
      <Container>
        <SectionLabel text={section?.label || 'CASE STUDIES'} />

        {/* Section Headline & Editorial Subtitle */}
        <div className="mb-14 sm:mb-20 max-w-3xl">
          <Reveal type="clip-headline" delay={0.1}>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-text-primary mb-4 leading-[1.18]">
              {section?.heading}
            </h2>
          </Reveal>
          <Reveal type="fade-up" delay={0.25}>
            <p className="text-base sm:text-lg font-body font-normal text-text-secondary leading-relaxed">
              {section?.description}
            </p>
          </Reveal>
        </div>

        {/* 2-Column Editorial Grid for Case Study Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-14">
          {featuredCaseStudies.map((study, index) => (
            <motion.div
              key={study.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-5% 0px' }}
              transition={{ duration: 0.6, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link to={`/case-studies/${study.slug}`} className="group flex flex-col block h-full">
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
                          {String(index + 1).padStart(2, '0')} /{' '}
                          {String(featuredCaseStudies.length).padStart(2, '0')}
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

                  <h3 className="font-display text-xl sm:text-2xl font-medium text-text-primary group-hover:text-accent transition-colors duration-200 mb-2 leading-snug">
                    {study.title}
                  </h3>

                  <p className="text-sm text-text-secondary font-body font-normal leading-relaxed line-clamp-2 mb-4">
                    {study.shortChallenge}
                  </p>

                  <div className="mt-auto flex items-center gap-1.5 text-xs font-body font-medium uppercase tracking-wider text-text-primary group-hover:text-accent transition-colors pt-2">
                    <span>{data.microcopy.readCaseStudy}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-current transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Section Right-Aligned CTA Button */}
        <div className="mt-14 sm:mt-20 flex justify-end">
          <Reveal type="fade-up" delay={0.4}>
            <Link
              to="/case-studies"
              aria-label="View All Case Studies"
              className="inline-flex items-center justify-center gap-2 h-[42px] px-6 rounded-full bg-transparent text-text-primary border border-border hover:border-text-primary/40 hover:bg-surface-secondary font-body text-xs sm:text-[13px] font-medium uppercase tracking-wider transition-all duration-250 hover:-translate-y-[1px] group cursor-pointer shadow-sm select-none"
            >
              <span>VIEW ALL CASE STUDIES</span>
              <ArrowUpRight className="w-4 h-4 text-current transition-transform duration-250 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 flex-shrink-0" />
            </Link>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
};
