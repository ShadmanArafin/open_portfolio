'use client';

import React, { useState } from 'react';
import { Container } from '../components/common/Container';
import { SectionLabel } from '../components/common/SectionLabel';
import { Reveal } from '../components/common/Reveal';
import { MediaLightboxModal, GalleryMediaItem } from '../components/common/MediaLightboxModal';
import { ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCMS } from '../cms/context/CMSContext';
import { CMSImage } from '../components/common/CMSImage';

export const AboutPage: React.FC = () => {
  const { data } = useCMS();
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [activeMedia, setActiveMedia] = useState<GalleryMediaItem | null>(null);

  const educationList = (data.education || [])
    .filter((e) => e.visible !== false)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const artifactsList = (data.artifacts || [])
    .filter((a) => a.visible !== false)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const filteredArtifacts = artifactsList.filter((art) => {
    if (activeFilter === 'all') return true;
    return art.category === activeFilter;
  });

  const handleOpenArtifact = (art: any) => {
    setActiveMedia({
      id: art.id,
      type: 'image',
      src: art.src,
      alt: art.alt,
      title: 'Visual Design Exploration',
    });
  };

  const headingText =
    data.settings.aboutHeading || 'Learning, designing, and building along the way.';
  const storyParagraphs =
    data.settings.aboutStoryParagraphs && data.settings.aboutStoryParagraphs.length > 0
      ? data.settings.aboutStoryParagraphs
      : [
          `I'm ${data.settings.fullName}, a ${data.settings.role} based in ${data.settings.location}. My journey started with computer science and gradually moved toward designing digital products — combining structure, visual thinking and technology.`,
          'My background in computer science also helps me think about design with implementation in mind.',
        ];

  return (
    <div className="font-sans text-text-primary w-full overflow-hidden">
      {/* =================================================================== */}
      {/* 01. ABOUT HERO WITH OFFICIAL PORTRAIT                               */}
      {/* =================================================================== */}
      <section className="pt-32 sm:pt-40 pb-20 sm:pb-28 border-b border-border bg-[var(--section-hero)]">
        <Container>
          <SectionLabel text="ABOUT" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            {/* Left Content Column (~7 Cols) */}
            <div className="lg:col-span-7">
              <Reveal type="clip-headline">
                <h1 className="font-display text-[40px] sm:text-[54px] lg:text-[64px] font-medium tracking-tight text-text-primary max-w-4xl leading-[1.18] mb-8">
                  {headingText}
                </h1>
              </Reveal>

              <Reveal type="fade-up" delay={0.2}>
                <div className="space-y-4 text-base sm:text-[18px] text-text-secondary leading-[1.65] font-body font-normal max-w-2xl mb-8">
                  {storyParagraphs.map((para, idx) => (
                    <p key={idx}>{para}</p>
                  ))}
                </div>
              </Reveal>

              {/* Status Badge */}
              <Reveal type="fade-up" delay={0.3}>
                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-surface-primary border border-border text-xs sm:text-sm font-medium font-body text-text-primary">
                  <span className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse" />
                  <span>{data.settings.availabilityStatus}</span>
                </div>
              </Reveal>
            </div>

            {/* Right Portrait Photo Card (~5 Cols) */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-sm aspect-[3/4] rounded-3xl overflow-hidden border border-border bg-surface-secondary shadow-lg relative group"
              >
                <CMSImage
                  src={data.settings.portraitPath || '/demo/portrait.svg'}
                  alt={`${data.settings.fullName} — ${data.settings.role}`}
                  className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 pointer-events-none" />
                <div className="absolute bottom-5 left-5 right-5 text-white font-body">
                  <span className="text-xs font-mono uppercase tracking-widest text-white/80 block">
                    {data.settings.fullName}
                  </span>
                  <span className="text-sm font-medium text-white">{data.settings.role}</span>
                </div>
              </motion.div>
            </div>
          </div>
        </Container>
      </section>

      {/* =================================================================== */}
      {/* 02. THE STORY SO FAR                                                */}
      {/* =================================================================== */}
      <section className="py-14 sm:py-18 border-b border-border bg-surface-primary">
        <Container>
          <span className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-text-muted block mb-3">
            {data.microcopy.theStorySoFarTitle || 'THE STORY SO FAR'}
          </span>
          <p className="font-display text-lg sm:text-xl md:text-2xl font-normal text-text-primary max-w-3xl leading-snug">
            {data.microcopy.theStorySoFarSubtitle ||
              'From learning how digital products are built to designing how people experience them.'}
          </p>
        </Container>
      </section>

      {/* =================================================================== */}
      {/* 03. EDUCATION CHAPTERS                                              */}
      {/* =================================================================== */}
      <section className="py-16 sm:py-24 border-b border-border bg-[var(--section-capabilities)]">
        <Container>
          <span className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-text-muted block mb-10">
            {data.microcopy.educationTitle || 'EDUCATION CHAPTERS'}
          </span>

          <div className="space-y-6 sm:space-y-8">
            {educationList.map((edu, idx) => (
              <React.Fragment key={edu.id || edu.number}>
                {idx > 0 && (
                  <div className="flex items-center gap-3 py-1">
                    <span className="font-mono text-xs text-accent">↓</span>
                    <span className="font-mono text-[11px] text-text-muted uppercase tracking-widest font-medium">
                      {data.microcopy.continuingEducationLabel || 'CONTINUING EDUCATION'}
                    </span>
                  </div>
                )}

                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4 }}
                  className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 items-baseline pb-6 border-b border-border group"
                >
                  <div className="md:col-span-3 flex items-baseline justify-between md:justify-start gap-4">
                    <span className="font-mono text-2xl sm:text-3xl lg:text-4xl font-normal text-text-muted group-hover:text-accent transition-colors duration-200">
                      {edu.number}
                    </span>
                    <span className="font-mono text-xs font-medium text-text-muted uppercase tracking-wider">
                      {[edu.yearLabel, edu.status?.toUpperCase()].filter(Boolean).join(' / ')}
                    </span>
                  </div>

                  <div className="md:col-span-5">
                    <h3 className="font-display text-lg sm:text-xl lg:text-2xl font-normal text-text-primary leading-tight">
                      {edu.degree}
                    </h3>
                  </div>

                  <div className="md:col-span-4 flex items-center justify-start md:justify-end">
                    <span className="font-body text-sm sm:text-base text-text-secondary font-normal">
                      {edu.institution}
                    </span>
                  </div>
                </motion.div>
              </React.Fragment>
            ))}
          </div>
        </Container>
      </section>

      {/* =================================================================== */}
      {/* 04. VISUAL DESIGN EXPLORATIONS                                      */}
      {/* =================================================================== */}
      <section className="py-20 sm:py-28 border-b border-border bg-[var(--section-hero)]">
        <Container>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-6">
            <div>
              <SectionLabel text="GALLERY" />
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-text-primary leading-[1.18]">
                {data.microcopy.visualExplorationsTitle || 'Visual Design Explorations'}
              </h2>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 font-body text-xs uppercase tracking-wider">
              {['all', 'ui', 'systems', 'mobile'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-2 rounded-full border transition-all cursor-pointer ${
                    activeFilter === filter
                      ? 'bg-text-primary text-bg border-text-primary font-medium'
                      : 'bg-surface-primary text-text-secondary border-border hover:border-text-primary/40'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Artifacts Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <AnimatePresence>
              {filteredArtifacts.map((art) => (
                <motion.div
                  key={art.id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.4 }}
                  onClick={() => handleOpenArtifact(art)}
                  className="aspect-[4/3] rounded-2xl overflow-hidden border border-border bg-surface-secondary relative group cursor-pointer"
                >
                  <CMSImage
                    src={art.src}
                    alt={art.alt}
                    className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="h-10 px-4 rounded-full bg-white/20 backdrop-blur-md border border-white/40 text-white font-body text-xs uppercase tracking-wider flex items-center gap-2">
                      <span>Expand Artwork</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </Container>
      </section>

      {/* Lightbox Modal */}
      <MediaLightboxModal
        isOpen={!!activeMedia}
        item={activeMedia}
        onClose={() => setActiveMedia(null)}
      />
    </div>
  );
};
