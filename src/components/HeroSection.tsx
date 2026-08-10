'use client';

import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa6';
import { motion } from 'framer-motion';
import { Container } from './common/Container';
import { useCMS } from '../cms/context/CMSContext';
import { CMSImage } from './common/CMSImage';

import Link from 'next/link';
export const HeroSection: React.FC = () => {
  const { data } = useCMS();

  const heroConfig = data.sections.find((s) => s.id === 'hero');

  return (
    <section
      id="hero"
      className="w-full min-h-[88vh] lg:min-h-[92vh] pt-32 sm:pt-40 pb-16 sm:pb-24 flex flex-col justify-center relative overflow-hidden bg-[var(--section-hero)] text-text-primary transition-colors duration-300 scroll-mt-28"
    >
      {/* Global Responsive Container Grid */}
      <Container className="flex flex-col justify-center">
        {/* =================================================================== */}
        {/* 1. HERO IDENTITY BLOCK (Avatar + Name & Status Alignment)           */}
        {/* =================================================================== */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-3.5 sm:gap-4 mb-10 sm:mb-12"
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
            <span className="text-[13px] sm:text-[14px] font-normal font-body text-[#08A669] leading-none mt-1 flex items-center gap-1.5">
              {data.settings.availableDotEnabled !== false && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#08A669] animate-pulse" />
              )}
              <span>{data.microcopy.availableForFreelance || 'Available for freelance work'}</span>
            </span>
          </div>
        </motion.div>

        {/* =================================================================== */}
        {/* 2. MAIN HEADLINE                                                    */}
        {/* =================================================================== */}
        <div className="mb-7 sm:mb-8 max-w-[960px]">
          <h1 className="font-display text-[38px] sm:text-[46px] md:text-[54px] lg:text-[64px] font-medium leading-[1.18] tracking-[-0.02em] text-text-primary">
            <div className="overflow-hidden py-2 -my-1">
              <motion.div
                initial={{ y: '110%', opacity: 0 }}
                animate={{ y: '0%', opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              >
                {heroConfig?.heading ||
                  'Designing Digital Experiences That Feel Natural, Clear, and Useful.'}
              </motion.div>
            </div>
          </h1>
        </div>

        {/* =================================================================== */}
        {/* 3. SUPPORTING COPY                                                 */}
        {/* =================================================================== */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="text-base sm:text-lg md:text-xl font-body font-normal text-text-secondary leading-relaxed max-w-2xl mb-10 sm:mb-12"
        >
          {heroConfig?.description ||
            `I'm a ${data.settings.role} specializing in enterprise design systems, digital product architecture, and user experiences.`}
        </motion.p>

        {/* =================================================================== */}
        {/* 4. ACTION BUTTONS                                                  */}
        {/* =================================================================== */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-wrap items-center gap-3.5 sm:gap-4"
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
            <FaWhatsapp className="w-4 h-4 text-[#25D366] flex-shrink-0" />
            <span>{data.microcopy.connectOnWhatsapp || 'WHATSAPP DIRECT'}</span>
          </a>
        </motion.div>
      </Container>
    </section>
  );
};
