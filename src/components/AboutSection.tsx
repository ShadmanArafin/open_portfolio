import React from 'react';
import { Section } from './common/Section';
import { Container } from './common/Container';
import { SectionLabel } from './common/SectionLabel';
import { Reveal } from './common/Reveal';
import { useCMS } from '../cms/context/CMSContext';

export const AboutSection: React.FC = () => {
  const { data } = useCMS();
  const aboutConfig = data.sections.find((s) => s.id === 'about');

  if (aboutConfig && !aboutConfig.visible) return null;

  const headingText =
    data.settings.aboutHeading ||
    aboutConfig?.heading ||
    'Learning, designing, and building along the way.';
  const storyParagraphs =
    data.settings.aboutStoryParagraphs && data.settings.aboutStoryParagraphs.length > 0
      ? data.settings.aboutStoryParagraphs
      : [
          `I'm ${data.settings.fullName}, a ${data.settings.role} based in ${data.settings.location}. My journey started with computer science and gradually moved toward designing digital products — combining structure, visual thinking and technology.`,
          'My background in computer science also helps me think about design with implementation in mind.',
        ];

  return (
    <Section
      id="about"
      className="border-t border-border bg-[var(--section-about)] text-text-primary py-20 lg:py-28 xl:py-32 transition-colors duration-300 scroll-mt-28 font-sans"
    >
      <Container>
        {/* 12-Column Desktop Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 xl:gap-20 items-start">
          {/* LEFT: Section Label & Dominant Headline (5 Cols) */}
          <div className="lg:col-span-5">
            <Reveal type="fade-up" delay={0.05}>
              <SectionLabel text={aboutConfig?.label || 'ABOUT'} />
            </Reveal>

            <Reveal type="clip-headline" delay={0.15}>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-medium tracking-tight text-text-primary leading-[1.18]">
                {headingText}
              </h2>
            </Reveal>
          </div>

          {/* RIGHT: Story Paragraphs & Link (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between pt-2">
            <Reveal type="fade-up" delay={0.25}>
              <div className="space-y-4 text-base sm:text-lg text-text-secondary leading-relaxed font-body font-normal">
                {storyParagraphs.map((para, idx) => (
                  <p key={idx}>{para}</p>
                ))}
              </div>
            </Reveal>

            <Reveal type="fade-up" delay={0.35}>
              <div className="mt-8 pt-8 border-t border-border flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                <span className="text-sm font-medium font-body text-text-primary">
                  {data.settings.availabilityStatus}
                </span>
              </div>
            </Reveal>
          </div>
        </div>
      </Container>
    </Section>
  );
};
