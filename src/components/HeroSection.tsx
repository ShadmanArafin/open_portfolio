import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa6';
import { Container } from './common/Container';
import { siteContent } from '../cms/server';
import { CMSImage } from './common/CMSImage';

import Link from 'next/link';
export async function HeroSection() {
  const data = await siteContent();

  const heroConfig = data.sections.find((s) => s.id === 'hero');

  return (
    <section
      id="hero"
      className="w-full min-h-[88vh] lg:min-h-[92vh] pt-32 sm:pt-40 pb-16 sm:pb-24 flex flex-col justify-center relative overflow-clip bg-[var(--section-hero)] text-text-primary transition-colors duration-300 scroll-mt-28"
    >
      {/* Global Responsive Container Grid */}
      <Container className="flex flex-col justify-center">
        {/* =================================================================== */}
        {/* 1. HERO IDENTITY BLOCK (Avatar + Name & Status Alignment)           */}
        {/* =================================================================== */}
        <div
          className="opb-enter flex items-center gap-3.5 sm:gap-4 mb-10 sm:mb-12"
          style={{ '--opb-delay': '0.12s' } as React.CSSProperties}
        >
          {/* Circular Profile Avatar (48px - 52px) */}
          <div className="w-[48px] h-[48px] sm:w-[52px] sm:h-[52px] rounded-full overflow-hidden border border-border shadow-sm flex-shrink-0">
            <CMSImage
              src={data.settings.avatarPath || '/demo/avatar.svg'}
              alt={data.settings.fullName}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Name & Availability Status */}
          <div className="flex flex-col justify-center">
            <span className="font-display font-medium text-[15px] sm:text-[16px] text-text-primary leading-tight">
              {data.settings.fullName}
            </span>
            <span className="text-[13px] sm:text-[14px] font-normal font-body text-[var(--link-color)] leading-none mt-1 flex items-center gap-1.5">
              {data.settings.availableDotEnabled !== false && (
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--link-color)] animate-pulse" />
              )}
              <span>{data.microcopy.availableForFreelance || 'Available for freelance work'}</span>
            </span>
          </div>
        </div>

        {/* =================================================================== */}
        {/* 2. MAIN HEADLINE                                                    */}
        {/* =================================================================== */}
        <div className="mb-7 sm:mb-8 max-w-[960px]">
          <h1 className="font-display text-[length:var(--text-4xl)] md:text-[length:var(--text-5xl)] font-medium leading-[1.18] tracking-[-0.02em] text-text-primary">
            <span className="block overflow-clip py-2 -my-1">
              <span
                className="block opb-enter-clip"
                style={{ '--opb-delay': '0.2s' } as React.CSSProperties}
              >
                {heroConfig?.heading ||
                  'Designing Digital Experiences That Feel Natural, Clear, and Useful.'}
              </span>
            </span>
          </h1>
        </div>

        {/* =================================================================== */}
        {/* 3. SUPPORTING COPY                                                 */}
        {/* =================================================================== */}
        <p
          className="opb-enter text-base sm:text-lg md:text-xl font-body font-normal text-text-secondary leading-relaxed max-w-2xl mb-10 sm:mb-12"
          style={{ '--opb-delay': '0.45s' } as React.CSSProperties}
        >
          {heroConfig?.description ||
            `I'm a ${data.settings.role} specializing in enterprise design systems, digital product architecture, and user experiences.`}
        </p>

        {/* =================================================================== */}
        {/* 4. ACTION BUTTONS                                                  */}
        {/* =================================================================== */}
        <div
          className="opb-enter flex flex-wrap items-center gap-3.5 sm:gap-4"
          style={{ '--opb-delay': '0.55s' } as React.CSSProperties}
        >
          {/* Primary Action Button */}
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 h-[42px] px-6 sm:px-7 rounded-full font-body text-xs sm:text-[13px] font-medium uppercase tracking-wider bg-text-primary text-bg border border-transparent hover:opacity-90 transition-all duration-250 shadow-sm hover:-translate-y-[1px] group cursor-pointer select-none"
          >
            <span>
              {heroConfig?.primaryCtaLabel || data.microcopy.contactButton || 'GET IN TOUCH'}
            </span>
            <ArrowUpRight className="w-4 h-4 text-current transition-transform duration-250 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 flex-shrink-0" />
          </Link>

          {/* WhatsApp Direct Action Button */}
          <a
            href={data.settings.whatsappUrl || `https://wa.me/${data.settings.whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2.5 h-[42px] px-5 sm:px-6 rounded-full font-body text-xs sm:text-[13px] font-medium uppercase tracking-wider bg-surface-secondary text-text-primary border border-border hover:border-text-primary/40 hover:bg-surface-primary transition-all duration-250 shadow-sm hover:-translate-y-[1px] group cursor-pointer select-none"
          >
            <FaWhatsapp className="w-4 h-4 text-[var(--link-color)] flex-shrink-0" />
            <span>{data.microcopy.connectOnWhatsapp || 'WHATSAPP DIRECT'}</span>
          </a>
        </div>
      </Container>
    </section>
  );
}
