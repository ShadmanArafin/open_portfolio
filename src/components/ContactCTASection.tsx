import React from 'react';
import { Link } from 'react-router-dom';
import { Section } from './common/Section';
import { Container } from './common/Container';
import { SectionLabel } from './common/SectionLabel';
import { Reveal } from './common/Reveal';
import { ArrowUpRight } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa6';
import { useCMS } from '../cms/context/CMSContext';

export const ContactCTASection: React.FC = () => {
  const { data } = useCMS();
  const section = data.sections.find((s) => s.id === 'contact');

  if (section && !section.visible) return null;

  const whatsappUrl = section?.secondaryCtaUrl || data.settings.whatsappUrl;

  return (
    <Section
      id="contact"
      className="border-t border-border bg-[var(--section-contact)] text-text-primary py-24 sm:py-32 lg:py-36 relative overflow-hidden transition-colors duration-300 scroll-mt-28"
    >
      <Container className="relative z-10">
        {/* Editorial 12-Column Grid Composition */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          {/* LEFT: SECTION LABEL (~4 COLS) */}
          <div className="lg:col-span-4">
            <Reveal type="fade-up" delay={0.05}>
              <SectionLabel text={section?.label || data.microcopy.letsWorkTogetherTitle} />
            </Reveal>

            <Reveal type="clip-headline" delay={0.15}>
              <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-text-primary leading-[1.18] max-w-md">
                {section?.heading}
              </h2>
            </Reveal>
          </div>

          {/* RIGHT: SUPPORTING PARAGRAPH + CLEAN BUTTON ROW (~8 COLS) */}
          <div className="lg:col-span-8 flex flex-col justify-between pt-2 lg:pt-12">
            {/* Supporting Copy */}
            <Reveal type="fade-up" delay={0.25}>
              <p className="text-base sm:text-lg text-text-secondary leading-[1.6] font-body font-normal max-w-xl">
                {section?.description}
              </p>
            </Reveal>

            {/* Action Buttons (Strict 42px Height) */}
            <Reveal type="fade-up" delay={0.35} className="mt-8 sm:mt-9">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-3.5">
                {/* Primary Button — Contact Page */}
                <Link
                  to={section?.primaryCtaUrl || '/contact'}
                  aria-label="Go to Contact Page"
                  className="inline-flex items-center justify-center gap-2 h-[42px] px-6 rounded-full bg-text-primary text-bg font-body text-xs sm:text-[13px] font-medium uppercase tracking-wider hover:opacity-90 transition-all duration-250 hover:-translate-y-[1px] group cursor-pointer shadow-sm select-none"
                >
                  <span>{section?.primaryCtaLabel}</span>
                  <ArrowUpRight className="w-4 h-4 text-current transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 flex-shrink-0" />
                </Link>

                {/* Secondary Button — WhatsApp Action */}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Contact via WhatsApp"
                  className="inline-flex items-center justify-center gap-2 h-[42px] px-6 rounded-full bg-[#25D366] text-white font-body text-xs sm:text-[13px] font-medium uppercase tracking-wider hover:bg-[#20bd5a] transition-all duration-250 hover:-translate-y-[1px] group cursor-pointer shadow-sm select-none"
                >
                  <FaWhatsapp className="w-4 h-4 text-white transition-transform duration-200 group-hover:scale-105 flex-shrink-0" />
                  <span>
                    {section?.secondaryCtaLabel || data.microcopy.contactOnWhatsapp}
                    {data.settings.whatsappFormatted ? ` (${data.settings.whatsappFormatted})` : ''}
                  </span>
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </Container>
    </Section>
  );
};
